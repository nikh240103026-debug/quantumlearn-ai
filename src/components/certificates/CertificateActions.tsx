"use client";

import { useState } from "react";
import { Check, Download, Link2, Printer, Share2 } from "lucide-react";

function LinkedInMark() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

const button =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-white/12 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-white/85 transition-colors hover:border-white/30 hover:bg-white/[0.08] hover:text-white";

export function CertificateActions({
  verifyUrl,
  pdfUrl,
  linkedInUrl,
  title,
}: {
  verifyUrl: string;
  /** null when the PDF can't be generated (non-Latin text) or revoked. */
  pdfUrl: string | null;
  /** Only for the certificate's owner. */
  linkedInUrl: string | null;
  title: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(verifyUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link", verifyUrl);
    }
  }

  async function share() {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url: verifyUrl });
        return;
      } catch {
        // Cancelled, or not allowed: fall back to copying.
      }
    }
    await copy();
  }

  return (
    <div className="ql-no-print grid gap-2 sm:grid-cols-2">
      {linkedInUrl && (
        <a
          href={linkedInUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0a66c2] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#004182] sm:col-span-2"
        >
          <LinkedInMark />
          Add to LinkedIn profile
        </a>
      )}

      {pdfUrl ? (
        <a href={pdfUrl} download className={button}>
          <Download size={15} />
          Download PDF
        </a>
      ) : null}

      <button type="button" onClick={() => window.print()} className={button}>
        <Printer size={15} />
        {pdfUrl ? "Print" : "Print / Save as PDF"}
      </button>

      <button type="button" onClick={copy} className={button}>
        {copied ? <Check size={15} className="text-emerald-400" /> : <Link2 size={15} />}
        {copied ? "Link copied" : "Copy link"}
      </button>

      <button type="button" onClick={share} className={button}>
        <Share2 size={15} />
        Share
      </button>
    </div>
  );
}
