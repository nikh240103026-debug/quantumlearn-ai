import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const ALLOWED_EVENT_TYPES = new Set([
"login_success",
"profile_updated",
"password_changed",
"email_change_requested",
"global_logout_requested",
"security_activity",
]);

const MAX_METADATA_KEYS = 20;
const MAX_METADATA_STRING_LENGTH = 500;

function requestMeta(request: Request) {
const forwarded = request.headers.get("x-forwarded-for");
const ip =
forwarded?.split(",")[0]?.trim() ||
request.headers.get("x-real-ip") ||
null;

return {
ip,
userAgent: request.headers.get("user-agent") || null,
};
}

function sanitizeMetadata(value: unknown): Record<string, unknown> {
if (!value || typeof value !== "object" || Array.isArray(value)) {
return {};
}

const input = value as Record<string, unknown>;
const output: Record<string, unknown> = {};

for (const [key, rawValue] of Object.entries(input).slice(
0,
MAX_METADATA_KEYS,
)) {
if (!/^[a-zA-Z0-9_-]{1,64}$/.test(key)) {
continue;
}


if (typeof rawValue === "string") {
  output[key] = rawValue.slice(0, MAX_METADATA_STRING_LENGTH);
  continue;
}

if (
  typeof rawValue === "boolean" ||
  typeof rawValue === "number"
) {
  output[key] = rawValue;
}

}

return output;
}

export async function GET() {
const supabase = await createSupabaseServerClient();

const {
data: { user },
} = await supabase.auth.getUser();

if (!user) {
return NextResponse.json(
{ error: "Unauthorized." },
{ status: 401 },
);
}

const { data, error } = await supabase
.from("security_events")
.select(
"id, event_type, ip_address, user_agent, metadata, created_at",
)
.eq("user_id", user.id)
.order("created_at", { ascending: false })
.limit(30);

if (error) {
console.error("[SECURITY EVENTS GET]", error);

return NextResponse.json(
  { error: "Unable to load security activity." },
  { status: 500 },
);

}

return NextResponse.json({
events: data ?? [],
});
}

export async function POST(request: Request) {
const supabase = await createSupabaseServerClient();

const {
data: { user },
} = await supabase.auth.getUser();

if (!user) {
return NextResponse.json(
{ error: "Unauthorized." },
{ status: 401 },
);
}

const { data: allowed, error: rateLimitError } = await supabase.rpc(
"consume_account_rate_limit",
{
p_user_id: user.id,
p_action: "security_write",
p_limit: 20,
p_window_seconds: 60,
},
);

if (rateLimitError) {
console.error("[SECURITY EVENT RATE LIMIT]", rateLimitError);

return NextResponse.json(
  { error: "Unable to process security request." },
  { status: 500 },
);

}

if (allowed === false) {
return NextResponse.json(
{
error:
"Too many security requests. Please wait and try again.",
},
{ status: 429 },
);
}

let body: {
event_type?: unknown;
metadata?: unknown;
} = {};

try {
const parsed = await request.json();

if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
  body = parsed as {
    event_type?: unknown;
    metadata?: unknown;
  };
}

} catch {
return NextResponse.json(
{ error: "Invalid request body." },
{ status: 400 },
);
}

const eventType =
typeof body.event_type === "string"
? body.event_type.slice(0, 64)
: "security_activity";

if (!ALLOWED_EVENT_TYPES.has(eventType)) {
return NextResponse.json(
{ error: "Invalid security event type." },
{ status: 400 },
);
}

const { ip, userAgent } = requestMeta(request);

let metadata = sanitizeMetadata(body.metadata);

/*

* Login security information is calculated server-side.
* Client-provided suspicious/IP/device flags are never trusted.
  */
  if (eventType === "login_success") {
  const { data: previous, error: previousError } = await supabase
  .from("security_events")
  .select("ip_address, user_agent, created_at")
  .eq("user_id", user.id)
  .eq("event_type", "login_success")
  .order("created_at", { ascending: false })
  .limit(1)
  .maybeSingle();

if (previousError) {

  console.error(
    "[SECURITY EVENT PREVIOUS LOGIN]",
    previousError,
  );

  return NextResponse.json(
    { error: "Unable to verify login security activity." },
    { status: 500 },
  );
}

const ipChanged = Boolean(
  previous?.ip_address &&
    ip &&
    previous.ip_address !== ip,
);

const deviceChanged = Boolean(
  previous?.user_agent &&
    userAgent &&
    previous.user_agent !== userAgent,
);

metadata = {
  suspicious: ipChanged || deviceChanged,
  ip_changed: ipChanged,
  device_changed: deviceChanged,
};

}

const { error } = await supabase
.from("security_events")
.insert({
user_id: user.id,
event_type: eventType,
ip_address: ip,
user_agent: userAgent,
metadata,
});

if (error) {
console.error("[SECURITY EVENT POST]", error);
return NextResponse.json(
  { error: "Unable to record security activity." },
  { status: 500 },
);

}

return NextResponse.json({ ok: true });
}
