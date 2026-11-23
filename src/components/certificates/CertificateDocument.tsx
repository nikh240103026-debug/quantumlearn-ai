import type { CSSProperties } from "react";

import type { CertificateRecord } from "@/lib/certificates/types";
import {
  CERTIFICATE_ISSUER,
  certificateHeading,
  certificateStatement,
  formatIssueDate,
  verificationUrl,
} from "@/lib/certificates/format";

/*
 * The certificate as a printable A4-landscape sheet. Every size is in
 * container-query units (cqw), so the layout is identical on a phone, a
 * desktop and paper — it simply scales.
 */

const cq = (n: number) => `${n}cqw`;

function Rosette({
  petals = 24,
  ry = 15,
  className,
  style,
}: {
  petals?: number;
  ry?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg viewBox="-50 -50 100 100" className={className} style={style} aria-hidden="true">
      {Array.from({ length: petals }, (_, i) => (
        <ellipse
          key={i}
          rx="47"
          ry={ry}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.32"
          transform={`rotate(${(i * 180) / petals})`}
        />
      ))}
      <circle r="49" fill="none" stroke="currentColor" strokeWidth="0.5" />
    </svg>
  );
}

function GuillocheBand({ style }: { style?: CSSProperties }) {
  const waves = [0, 2.1, 4.2].map((phase) => {
    let d = "";
    for (let x = 0; x <= 1000; x += 5) {
      const y = 10 + Math.sin(x / 14 + phase) * 6;
      d += `${x === 0 ? "M" : "L"}${x} ${y.toFixed(2)}`;
    }
    return d;
  });

  return (
    <svg
      viewBox="0 0 1000 20"
      preserveAspectRatio="none"
      className="absolute text-ink/20"
      style={style}
      aria-hidden="true"
    >
      {waves.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="currentColor" strokeWidth="0.7" vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  );
}

function Seal({ id }: { id: string }) {
  const ring = `${CERTIFICATE_ISSUER.toUpperCase()} · VERIFIED CERTIFICATE · `;
  return (
    <div className="relative text-exam-blue" style={{ width: cq(11), height: cq(11) }}>
      <Rosette className="absolute inset-0 h-full w-full" />
      <svg viewBox="-50 -50 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <path id={id} d="M 0,-31 A 31,31 0 1,1 -0.01,-31" />
        </defs>
        <circle r="38" fill="#fffdf8" stroke="currentColor" strokeWidth="0.9" />
        <circle r="24" fill="none" stroke="currentColor" strokeWidth="0.6" />
        <text fontSize="6.4" fontWeight="700" letterSpacing="1.1" fill="currentColor">
          <textPath href={`#${id}`}>{ring}</textPath>
        </text>
        <text
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="17"
          fontWeight="700"
          fontFamily="var(--font-newsreader), Georgia, serif"
          fill="currentColor"
        >
          QL
        </text>
      </svg>
    </div>
  );
}

export function CertificateDocument({
  certificate,
  printable = true,
}: {
  certificate: CertificateRecord;
  /** false for thumbnails, so printing a list page doesn't stack them. */
  printable?: boolean;
}) {
  const statement = certificateStatement(certificate);
  const revoked = certificate.status === "revoked";
  const nameLength = certificate.recipientName.length;
  const nameSize = nameLength > 40 ? 3.2 : nameLength > 26 ? 4.1 : 5.2;

  return (
    <div className={`${printable ? "ql-cert-container " : ""}w-full`} style={{ containerType: "inline-size" }}>
      <article
        className={`${printable ? "ql-print-area " : ""}relative w-full overflow-hidden bg-sheet text-ink [print-color-adjust:exact] [-webkit-print-color-adjust:exact]`}
        style={{ aspectRatio: "297 / 210" }}
        aria-label={`${certificateHeading(certificate)} awarded to ${certificate.recipientName}`}
      >
        {/* Frames */}
        <div className="absolute border-ink" style={{ inset: cq(2.4), borderWidth: cq(0.28) }} />
        <div className="absolute border-ink" style={{ inset: cq(3.3), borderWidth: cq(0.08) }} />
        <GuillocheBand style={{ left: cq(4.2), top: cq(4), height: cq(1.6), width: "calc(100% - 8.4cqw)" }} />
        <GuillocheBand style={{ left: cq(4.2), bottom: cq(4), height: cq(1.6), width: "calc(100% - 8.4cqw)" }} />

        {/* Watermark */}
        <Rosette
          petals={36}
          ry={30}
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-exam-blue/[0.07]"
          style={{ width: cq(44), height: cq(44) }}
        />

        {/* Body */}
        <div
          className="relative flex h-full flex-col items-center text-center"
          style={{ padding: `${cq(8)} ${cq(9)} 0` }}
        >
          <p
            className="flex items-center font-semibold uppercase text-ink-soft"
            style={{ fontSize: cq(1.15), letterSpacing: "0.42em", gap: cq(1) }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/quantumlearn-logo.png"
              alt=""
              style={{ width: cq(2.4), height: cq(2.4) }}
              className="object-contain"
            />
            {CERTIFICATE_ISSUER}
          </p>

          <h1 className="font-serif font-medium leading-none" style={{ fontSize: cq(4.7), marginTop: cq(2.6) }}>
            {certificateHeading(certificate)}
          </h1>
          <span className="block bg-exam-blue" style={{ width: cq(9), height: cq(0.14), marginTop: cq(1.6) }} />

          <p className="font-serif italic text-ink-soft" style={{ fontSize: cq(1.75), marginTop: cq(2.6) }}>
            This is to certify that
          </p>
          <p
            className="max-w-full truncate font-serif font-semibold italic leading-tight"
            style={{ fontSize: cq(nameSize), marginTop: cq(1.2) }}
          >
            {certificate.recipientName}
          </p>
          <span className="block bg-ink/40" style={{ width: cq(52), height: cq(0.07), marginTop: cq(0.8) }} />

          <p className="font-serif text-ink-soft" style={{ fontSize: cq(1.75), marginTop: cq(2.4) }}>
            {statement.lead}
          </p>
          <p className="font-serif font-semibold leading-tight" style={{ fontSize: cq(2.9), marginTop: cq(0.8) }}>
            {statement.title}
          </p>
          {statement.tail && (
            <p className="font-serif italic text-ink-soft" style={{ fontSize: cq(1.6), marginTop: cq(0.8) }}>
              {statement.tail}
            </p>
          )}
        </div>

        {/* Footer: date · seal · number */}
        <div
          className="absolute grid grid-cols-[1fr_auto_1fr] items-end"
          style={{ left: cq(10), right: cq(10), bottom: cq(8.2), gap: cq(4) }}
        >
          <FooterField label="Date of issue" value={formatIssueDate(certificate.issuedAt)} />
          <Seal id={`seal-${certificate.certificateNumber || certificate.id}`} />
          <FooterField label="Certificate no." value={certificate.certificateNumber} mono />
        </div>

        <p
          className="absolute inset-x-0 text-center text-ink-soft"
          style={{ bottom: cq(5.6), fontSize: cq(0.95) }}
        >
          Verify at {verificationUrl(certificate.verificationToken)}
        </p>

        {revoked && (
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-[14deg] border-exam-red font-serif font-black uppercase text-exam-red"
            style={{
              borderWidth: cq(0.6),
              fontSize: cq(7),
              letterSpacing: "0.14em",
              padding: `${cq(0.6)} ${cq(2.6)}`,
              background: "rgba(255,253,248,0.82)",
            }}
          >
            Revoked
          </div>
        )}
      </article>
    </div>
  );
}

function FooterField({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="text-center">
      <p
        className={mono ? "font-mono font-semibold" : "font-serif"}
        style={{ fontSize: mono ? cq(1.35) : cq(1.65) }}
      >
        {value}
      </p>
      <span className="block bg-ink/40" style={{ height: cq(0.07), marginTop: cq(0.6) }} />
      <p
        className="font-semibold uppercase text-ink-soft"
        style={{ fontSize: cq(0.85), letterSpacing: "0.2em", marginTop: cq(0.6) }}
      >
        {label}
      </p>
    </div>
  );
}
