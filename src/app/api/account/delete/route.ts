import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export async function DELETE(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  // Check the confirmation text first, so typos don't use up the
  // daily deletion attempts.
  let body: { confirmation?: unknown } = {};
  try { body = await request.json(); } catch {}

  if (body.confirmation !== "DELETE MY ACCOUNT") {
    return NextResponse.json({ error: "Please type DELETE MY ACCOUNT to confirm." }, { status: 400 });
  }

  const { data: allowed, error: rateLimitError } = await supabase.rpc("consume_account_rate_limit", {
    p_user_id: user.id,
    p_action: "account_delete",
    p_limit: 3,
    p_window_seconds: 86400,
  });
  // Fail closed for an irreversible action if the limit can't be checked.
  if (rateLimitError) {
    console.error("[ACCOUNT DELETE] rate limit check failed", rateLimitError);
    return NextResponse.json({ error: "Unable to process the request right now. Please try again later." }, { status: 503 });
  }
  if (allowed === false) return NextResponse.json({ error: "Too many deletion attempts. Please try again later." }, { status: 429 });

  try {
    const admin = createSupabaseAdminClient();
    const { error } = await admin.auth.admin.deleteUser(user.id);

    if (error) {
      console.error("[ACCOUNT DELETE]", error);
      return NextResponse.json({ error: "Unable to delete your account." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[ACCOUNT DELETE] unexpected", error);
    return NextResponse.json({ error: "Account deletion is not configured on the server." }, { status: 500 });
  }
}
