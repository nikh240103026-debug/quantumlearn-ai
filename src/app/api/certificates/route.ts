import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getCertificateOverview } from "@/lib/certificates/certificate-service";

export const dynamic = "force-dynamic";

/*
 * GET /api/certificates
 *
 * The signed-in learner's certificate overview (earned, ready to claim,
 * in progress) — the same data as the /certificates page. Used by the
 * mobile app (Authorization: Bearer <access token>).
 */
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "You must be logged in to view certificates." },
      { status: 401 },
    );
  }

  try {
    const overview = await getCertificateOverview(supabase, user);
    return NextResponse.json(overview, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("[CERTIFICATES_OVERVIEW]", error);
    return NextResponse.json(
      { error: "Unable to load certificates." },
      { status: 500 },
    );
  }
}
