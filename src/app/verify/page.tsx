import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SearchCheck, ShieldAlert } from "lucide-react";

import {
  findTokenByNumber,
  normaliseCertificateNumber,
} from "@/lib/certificates/certificate-service";
import { verificationPath } from "@/lib/certificates/format";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Verify a certificate",
  description: `Check that a ${site.name} certificate is genuine using its certificate number.`,
};

export default async function VerifyLookupPage({
  searchParams,
}: {
  searchParams: Promise<{ number?: string | string[] }>;
}) {
  const raw = (await searchParams).number;
  const query = (Array.isArray(raw) ? raw[0] : raw ?? "").trim().slice(0, 40);

  let message: string | null = null;

  if (query) {
    if (!normaliseCertificateNumber(query)) {
      message = "That doesn't look like a certificate number. It has the form QL-2026-ABCD-EFGH.";
    } else {
      const token = await findTokenByNumber(query);
      if (token) redirect(verificationPath(token));
      message = "No certificate was found with that number. Check it and try again.";
    }
  }

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#05070d] text-white">
      <div className="ql-grid-bg pointer-events-none absolute inset-0 -z-10 opacity-60" />
      <div className="mx-auto flex max-w-xl flex-col px-4 pb-24 pt-32 sm:px-6">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-blue-300">
          <SearchCheck size={22} />
        </span>
        <h1 className="mt-6 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
          Verify a certificate
        </h1>
        <p className="mt-3 text-base leading-7 text-white/60">
          Every {site.name} certificate carries a unique number. Enter it below
          to see the certificate, who it was issued to, and whether it is still valid.
        </p>

        <form method="get" className="mt-8 flex flex-col gap-3 sm:flex-row">
          <label htmlFor="number" className="sr-only">
            Certificate number
          </label>
          <input
            id="number"
            name="number"
            defaultValue={query}
            required
            autoComplete="off"
            spellCheck={false}
            placeholder="QL-2026-ABCD-EFGH"
            className="h-12 flex-1 rounded-lg border border-white/12 bg-white/[0.04] px-4 font-mono text-base uppercase tracking-wider text-white outline-none placeholder:text-white/25 focus:border-blue-400/60"
          />
          <button
            type="submit"
            className="h-12 rounded-lg bg-white px-6 text-sm font-semibold text-[#05070d] transition-colors hover:bg-blue-100"
          >
            Verify
          </button>
        </form>

        {message && (
          <p
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-lg border border-amber-400/25 bg-amber-500/[0.06] px-4 py-3 text-sm text-amber-100/90"
          >
            <ShieldAlert size={16} className="mt-0.5 shrink-0" />
            {message}
          </p>
        )}

        <p className="mt-10 text-xs leading-5 text-white/40">
          Certificates are issued automatically when a learner completes every
          lesson of a course or passes an assessment graded on our servers.
          A shared certificate link always shows the live status, including
          revocation.
        </p>
      </div>
    </main>
  );
}
