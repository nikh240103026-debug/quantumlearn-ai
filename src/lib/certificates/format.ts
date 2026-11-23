import { site } from "@/lib/site";
import type { CertificateRecord } from "./types";

export const CERTIFICATE_ISSUER = site.name;

export function certificateHeading(certificate: Pick<CertificateRecord, "kind">) {
  return certificate.kind === "course"
    ? "Certificate of Completion"
    : "Certificate of Achievement";
}

/** The sentence printed under the recipient's name. */
export function certificateStatement(certificate: CertificateRecord) {
  if (certificate.kind === "course") {
    const lessons = certificate.lessonCount
      ? `all ${certificate.lessonCount} lessons of `
      : "";
    return {
      lead: `has successfully completed ${lessons}the course`,
      title: certificate.title,
      tail: certificate.level ? `${certificate.level} level` : null,
    };
  }

  const level = certificate.level ? `${certificate.level.toLowerCase()} ` : "";
  const score =
    certificate.score !== null
      ? `with a score of ${Math.round(certificate.score)}%${
          certificate.passMark ? ` (pass mark ${certificate.passMark}%)` : ""
        }`
      : null;

  return {
    lead: `has passed the ${level}examination`,
    title: certificate.title.replace(/ Assessment$/, ""),
    tail: score,
  };
}

export function formatIssueDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function verificationPath(token: string) {
  return `/verify/${encodeURIComponent(token)}`;
}

export function verificationUrl(token: string) {
  return `${site.url.replace(/\/$/, "")}${verificationPath(token)}`;
}

/** LinkedIn "Add to profile → Licenses & certifications" prefill link. */
export function linkedInAddUrl(certificate: CertificateRecord) {
  const issued = new Date(certificate.issuedAt);
  const params = new URLSearchParams({
    startTask: "CERTIFICATION_NAME",
    name: `${certificateHeading(certificate)} — ${certificate.title}`,
    organizationName: CERTIFICATE_ISSUER,
    issueYear: String(issued.getUTCFullYear()),
    issueMonth: String(issued.getUTCMonth() + 1),
    certUrl: verificationUrl(certificate.verificationToken),
    certId: certificate.certificateNumber,
  });
  return `https://www.linkedin.com/profile/add?${params.toString()}`;
}
