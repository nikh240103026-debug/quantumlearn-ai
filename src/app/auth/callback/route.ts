import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "@/lib/supabase-server";

/*
 * GET /auth/callback
 *
 * Target of the email links Supabase sends (signup confirmation, and any
 * other link using this redirect). Signup points here with
 * ?next=/dashboard; before this route existed every confirmation link
 * ended on a 404.
 *
 * Handles both link styles:
 *   - PKCE:      ?code=...
 *   - token hash: ?token_hash=...&type=signup|email|recovery|...
 */

// Only same-site paths, so `next` can't redirect to another site
// (e.g. "//evil.example" or "https://evil.example").
function safeNextPath(value: string | null): string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.startsWith("/\\")
  ) {
    return "/dashboard";
  }

  return value;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;

  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeNextPath(searchParams.get("next"));

  const supabase = await createSupabaseServerClient();

  let error: unknown = null;

  if (code) {
    ({ error } = await supabase.auth.exchangeCodeForSession(code));
  } else if (tokenHash && type) {
    ({ error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    }));
  } else if (type === "recovery") {
    // Implicit-flow link (sent by the mobile app): the tokens are in the
    // URL #fragment, which never reaches the server. Browsers keep the
    // fragment across this redirect, and /reset-password reads it.
    return NextResponse.redirect(`${origin}/reset-password?recovery=1`);
  } else {
    error = new Error("Missing confirmation parameters.");
  }

  if (error) {
    console.error("[AUTH CALLBACK]", error);

    return NextResponse.redirect(
      `${origin}/login?error=confirmation_failed`,
    );
  }

  // A recovery link must land on the password form.
  if (type === "recovery") {
    return NextResponse.redirect(`${origin}/reset-password?recovery=1`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
