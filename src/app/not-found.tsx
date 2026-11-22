import Link from "next/link";
import { ArrowLeft, Compass, LifeBuoy } from "lucide-react";
import { QuantumField } from "@/components/fx/QuantumField";

export default function NotFound() {
  return (
    <main className="relative isolate flex min-h-[calc(100svh-72px)] items-center overflow-hidden bg-[#05070d] text-white">
      <div className="absolute inset-0 -z-10 opacity-60">
        <QuantumField density={0.6} />
      </div>
      <div className="ql-grid-bg pointer-events-none absolute inset-0 -z-10" />

      <div className="mx-auto w-full max-w-3xl px-5 py-20 text-center sm:px-8">
        <p className="ql-enter font-mono text-xs uppercase tracking-[0.24em] text-blue-300/80">
          Error 404 · state not found
        </p>
        <h1
          className="ql-enter mt-6 text-[clamp(5rem,18vw,11rem)] font-semibold leading-none tracking-[-0.06em]"
          style={{ "--ql-delay": "60ms" } as React.CSSProperties}
        >
          <span className="ql-text-gradient">|404⟩</span>
        </h1>
        <p
          className="ql-enter mx-auto mt-6 max-w-md text-lg leading-8 text-white/55"
          style={{ "--ql-delay": "120ms" } as React.CSSProperties}
        >
          We measured this URL and it collapsed to nothing. The page may have
          moved, or it never existed in this branch of the multiverse.
        </p>
        <div
          className="ql-enter mt-10 flex flex-col justify-center gap-3 sm:flex-row"
          style={{ "--ql-delay": "180ms" } as React.CSSProperties}
        >
          <Link
            href="/"
            className="ql-shine inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold transition-colors hover:bg-blue-500"
          >
            <ArrowLeft size={16} />
            Back to home
          </Link>
          <Link
            href="/roadmap"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.04] px-6 py-3 text-sm font-semibold transition-colors hover:bg-white/[0.08]"
          >
            <Compass size={16} className="text-blue-300" />
            Learning roadmap
          </Link>
          <Link
            href="/help"
            className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white/60 transition-colors hover:text-white"
          >
            <LifeBuoy size={16} />
            Help Center
          </Link>
        </div>
      </div>
    </main>
  );
}
