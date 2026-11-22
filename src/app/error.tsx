"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCw } from "lucide-react";
import { site } from "@/lib/site";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="relative isolate flex min-h-[calc(100svh-72px)] items-center overflow-hidden bg-[#05070d] text-white">
      <div className="ql-grid-bg pointer-events-none absolute inset-0 -z-10" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(239,68,68,0.15),transparent)] blur-2xl" />

      <div className="mx-auto w-full max-w-2xl px-5 py-20 text-center sm:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-rose-300/80">
          Unexpected decoherence
        </p>
        <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
          Something went wrong on our side.
        </h1>
        <p className="mx-auto mt-5 max-w-md text-base leading-7 text-white/55">
          The page hit an error while loading. Trying again usually fixes it.
          If it keeps happening, let us know at{" "}
          <a href={`mailto:${site.supportEmail}`} className="text-blue-300 underline-offset-4 hover:underline">
            {site.supportEmail}
          </a>
          .
        </p>
        {error.digest && (
          <p className="mt-6 font-mono text-[11px] text-white/30">Reference: {error.digest}</p>
        )}
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => retry()}
            className="ql-shine inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold transition-colors hover:bg-blue-500"
          >
            <RotateCw size={16} />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.04] px-6 py-3 text-sm font-semibold transition-colors hover:bg-white/[0.08]"
          >
            <ArrowLeft size={16} />
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
