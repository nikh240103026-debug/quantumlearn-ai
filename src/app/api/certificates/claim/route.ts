import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  CertificateError,
  issueCertificate,
} from "@/lib/certificates/certificate-service";
import { verificationPath } from "@/lib/certificates/format";
import { notify } from "@/lib/notifications/notify";

export const dynamic = "force-dynamic";

/*
 * POST /api/certificates/claim  { kind: "course" | "assessment", refId }
 *
 * Eligibility is recomputed on the server (see certificate-service.ts);
 * the request only says which certificate the learner wants. Claiming an
 * already-issued certificate returns the existing one.
 */
export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "You must be logged in to claim a certificate." },
      { status: 401 },
    );
  }

  let body: { kind?: unknown; refId?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const kind =
    body.kind === "course" || body.kind === "assessment" ? body.kind : null;
  const refId =
    typeof body.refId === "string" && body.refId.length <= 100
      ? body.refId.trim()
      : "";

  if (!kind || !refId) {
    return NextResponse.json({ error: "Invalid certificate." }, { status: 400 });
  }

  try {
    const { certificate, created } = await issueCertificate({
      supabase,
      user,
      kind,
      refId,
    });

    if (created) {
      await notify({
        userId: user.id,
        type: "achievement",
        title: "Certificate issued 🎓",
        message: `Your certificate for ${certificate.title} is ready to share.`,
        href: verificationPath(certificate.verificationToken),
      });
    }

    return NextResponse.json({
      certificate,
      url: verificationPath(certificate.verificationToken),
    });
  } catch (error) {
    if (error instanceof CertificateError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[CERTIFICATES_CLAIM]", error);
    return NextResponse.json(
      { error: "Unable to issue the certificate." },
      { status: 500 },
    );
  }
}
