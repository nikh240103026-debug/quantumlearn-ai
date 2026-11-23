import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, ShieldX } from "lucide-react";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  getOwnerId,
  getPublicCertificate,
} from "@/lib/certificates/certificate-service";
import { canRenderPdf } from "@/lib/certificates/certificate-pdf";
import {
  CERTIFICATE_ISSUER,
  certificateHeading,
  formatIssueDate,
  linkedInAddUrl,
  verificationUrl,
} from "@/lib/certificates/format";
import { CertificateDocument } from "@/components/certificates/CertificateDocument";
import { CertificateActions } from "@/components/certificates/CertificateActions";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const certificate = await getPublicCertificate(token);

  if (!certificate) {
    return { title: "Certificate not found", robots: { index: false } };
  }

  const heading = certificateHeading(certificate);
  return {
    title: `${heading} — ${certificate.recipientName}`,
    description: `${certificate.recipientName} earned a ${heading} for ${certificate.title} from ${CERTIFICATE_ISSUER}. Certificate no. ${certificate.certificateNumber}.`,
    // Shareable by link, but learners' names shouldn't be search-indexed.
    robots: { index: false, follow: false },
  };
}

export default async function VerifyCertificatePage({ params }: Props) {
  const { token } = await params;
  const certificate = await getPublicCertificate(token);

  if (!certificate) {
    notFound();
  }

  const supabase = await createSupabaseServerClient();
  const [{ data: { user } }, ownerId] = await Promise.all([
    supabase.auth.getUser(),
    getOwnerId(token),
  ]);
  const isOwner = Boolean(user && ownerId && user.id === ownerId);

  const revoked = certificate.status === "revoked";
  const heading = certificateHeading(certificate);

  const details: Array<[string, string]> = [
    ["Awarded to", certificate.recipientName],
    ["Credential", heading],
    [certificate.kind === "course" ? "Course" : "Examination", certificate.title],
    ...(certificate.level ? [["Level", certificate.level] as [string, string]] : []),
    ...(certificate.score !== null
      ? [["Score", `${Math.round(certificate.score)}%${certificate.passMark ? ` (pass mark ${certificate.passMark}%)` : ""}`] as [string, string]]
      : []),
    ...(certificate.lessonCount
      ? [["Requirement", `All ${certificate.lessonCount} lessons completed`] as [string, string]]
      : []),
    ["Issued", formatIssueDate(certificate.issuedAt)],
    ["Certificate no.", certificate.certificateNumber],
    ["Issuer", CERTIFICATE_ISSUER],
  ];

  return (
    <main className="min-h-screen bg-[#05070d] text-white print:bg-white">
      {/* A4 landscape, edge to edge, when printed from this page. */}
      <style>{"@page { size: A4 landscape; margin: 0; }"}</style>

      <div className="mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 lg:px-8">
        {/* Verification status */}
        <div
          className={`ql-no-print mb-8 flex flex-col gap-3 rounded-2xl border p-5 sm:flex-row sm:items-center sm:gap-4 ${
            revoked
              ? "border-red-400/30 bg-red-500/[0.07]"
              : "border-emerald-400/25 bg-emerald-500/[0.06]"
          }`}
          role="status"
        >
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
              revoked ? "bg-red-500/15 text-red-300" : "bg-emerald-500/15 text-emerald-300"
            }`}
          >
            {revoked ? <ShieldX size={22} /> : <BadgeCheck size={22} />}
          </span>
          <div>
            <p className="text-base font-semibold">
              {revoked ? "This certificate has been revoked" : "Verified certificate"}
            </p>
            <p className="mt-0.5 text-sm text-white/60">
              {revoked
                ? `${CERTIFICATE_ISSUER} revoked this certificate${
                    certificate.revokedAt ? ` on ${formatIssueDate(certificate.revokedAt)}` : ""
                  }. It is no longer valid.`
                : `Issued by ${CERTIFICATE_ISSUER} to ${certificate.recipientName} on ${formatIssueDate(
                    certificate.issuedAt,
                  )}. This record is held on ${CERTIFICATE_ISSUER}'s servers.`}
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <div className="overflow-hidden rounded-md shadow-[0_40px_120px_-40px_rgba(35,64,230,0.45)] ring-1 ring-white/10">
            <CertificateDocument certificate={certificate} />
          </div>

          <aside className="ql-no-print space-y-6">
            <dl className="divide-y divide-white/[0.07] rounded-2xl border border-white/10 bg-[#0a0e18]">
              {details.map(([label, value]) => (
                <div key={label} className="flex items-baseline justify-between gap-4 px-5 py-3">
                  <dt className="shrink-0 text-xs uppercase tracking-[0.14em] text-white/40">{label}</dt>
                  <dd className="text-right text-sm font-medium text-white/90">{value}</dd>
                </div>
              ))}
            </dl>

            <CertificateActions
              verifyUrl={verificationUrl(certificate.verificationToken)}
              pdfUrl={
                !revoked && canRenderPdf(certificate)
                  ? `/api/certificates/${encodeURIComponent(certificate.verificationToken)}/pdf`
                  : null
              }
              linkedInUrl={isOwner && !revoked ? linkedInAddUrl(certificate) : null}
              title={`${heading} — ${certificate.title}`}
            />

            {isOwner ? (
              <p className="text-xs leading-5 text-white/45">
                This page is public: anyone with the link can check that your
                certificate is genuine. It is hidden from search engines.{" "}
                <Link href="/certificates" className="text-blue-300 hover:text-blue-200">
                  All my certificates →
                </Link>
              </p>
            ) : (
              <p className="text-xs leading-5 text-white/45">
                Checking a certificate number?{" "}
                <Link href="/verify" className="text-blue-300 hover:text-blue-200">
                  Verify another certificate →
                </Link>
              </p>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
