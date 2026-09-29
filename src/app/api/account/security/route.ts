import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

function requestMeta(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || null;
  return { ip, userAgent: request.headers.get("user-agent") || null };
}

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { data, error } = await supabase
    .from("security_events")
    .select("id, event_type, ip_address, user_agent, metadata, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    console.error("[SECURITY EVENTS GET]", error);
    return NextResponse.json({ error: "Unable to load security activity." }, { status: 500 });
  }

  return NextResponse.json({ events: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { data: allowed } = await supabase.rpc("consume_account_rate_limit", {
    p_user_id: user.id,
    p_action: "security_write",
    p_limit: 20,
    p_window_seconds: 60,
  });
  if (allowed === false) return NextResponse.json({ error: "Too many security requests. Please wait and try again." }, { status: 429 });

  let body: { event_type?: unknown; metadata?: unknown } = {};
  try { body = await request.json(); } catch {}

  const eventType = typeof body.event_type === "string" ? body.event_type.slice(0, 64) : "security_activity";
  const incomingMetadata = body.metadata && typeof body.metadata === "object" ? body.metadata : {};
  const { ip, userAgent } = requestMeta(request);

  let metadata: Record<string, unknown> = { ...incomingMetadata };

  if (eventType === "login_success") {
    const { data: previous } = await supabase
      .from("security_events")
      .select("ip_address, user_agent, created_at")
      .eq("user_id", user.id)
      .eq("event_type", "login_success")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const ipChanged = Boolean(previous?.ip_address && ip && previous.ip_address !== ip);
    const deviceChanged = Boolean(previous?.user_agent && userAgent && previous.user_agent !== userAgent);
    metadata = { ...metadata, suspicious: ipChanged || deviceChanged, ip_changed: ipChanged, device_changed: deviceChanged };
  }

  const { error } = await supabase.from("security_events").insert({
    user_id: user.id,
    event_type: eventType,
    ip_address: ip,
    user_agent: userAgent,
    metadata,
  });

  if (error) {
    console.error("[SECURITY EVENT POST]", error);
    return NextResponse.json({ error: "Unable to record security activity." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
