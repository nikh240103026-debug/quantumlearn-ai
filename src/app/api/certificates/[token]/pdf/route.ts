import { NextResponse } from "next/server";

import { getPublicCertificate } from "@/lib/certificates/certificate-service";
import {
  canRenderPdf,
  renderCertificatePdf,
} from "@/lib/certificates/certificate-pdf";

export const dynamic = "force-dynamic";

/*
 * GET /api/certificates/<verification token>/pdf
 *
 * Public, like the verification page: anyone holding the link can view the
 * certificate. Revoked certificates have no downloadable PDF.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const certificate = await getPublicCertificate(token);

  if (!certificate || certificate.status !== "issued") {
    return NextResponse.json({ error: "Certificate not found." }, { status: 404 });
  }

  if (!canRenderPdf(certificate)) {
    return NextResponse.json(
      { error: "Use Print → Save as PDF for this certificate." },
      { status: 422 },
    );
  }

  try {
    const bytes = await renderCertificatePdf(certificate);
    const filename = `QuantumLearn-${certificate.certificateNumber}.pdf`;

    return new Response(Buffer.from(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("[CERTIFICATES_PDF]", error);
    return NextResponse.json({ error: "Unable to create the PDF." }, { status: 500 });
  }
}
