import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { recordAppError } from "@/lib/monitoring/record-error";

/*
 * POST /api/errors — browser error reports (no sign-in needed, since
 * errors also happen on public pages). Limits: same-site only, small body,
 * per-IP burst limit (per server instance), and a row cap in the database.
 */

const MAX_BODY = 8_000;
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 15;

const hits = new Map<string, { count: number; resetAt: number }>();

function isLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);

  if (!entry || entry.resetAt <= now) {
    if (hits.size > 5_000) hits.clear();
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

function isSameSite(request: NextRequest): boolean {
  try {
    const origin = request.headers.get("origin");
    return !!origin && new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (isLimited(ip)) {
    return NextResponse.json({ error: "Too many reports." }, { status: 429 });
  }

  // The mobile app has no origin, so it must be signed in instead.
  let mobile = false;

  if (!isSameSite(request) && request.headers.has("authorization")) {
    const supabase = await createSupabaseServerClient();
    mobile = Boolean((await supabase.auth.getUser()).data.user);
  }

  if (!mobile && !isSameSite(request)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const raw = await request.text();

  if (raw.length > MAX_BODY) {
    return NextResponse.json({ error: "Report too large." }, { status: 413 });
  }

  let body: Record<string, unknown> | null = null;

  try {
    body = JSON.parse(raw);
  } catch {
    // Rejected below.
  }

  if (typeof body?.message !== "string" || !body.message.trim()) {
    return NextResponse.json({ error: "Invalid report." }, { status: 400 });
  }

  await recordAppError({
    source: mobile ? "mobile" : "client",
    message: body.message,
    stack: typeof body.stack === "string" ? body.stack : null,
    path: typeof body.path === "string" ? body.path : "/",
    userAgent: request.headers.get("user-agent"),
  });

  return new NextResponse(null, { status: 204 });
}
