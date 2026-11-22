import Link from "next/link";
import { ArrowRight, Map } from "lucide-react";
import { QuantumField } from "@/components/fx/QuantumField";

export function FinalCTA() {
  return (
    <section className="relative isolate overflow-hidden bg-[#05070d] text-white">
      <div className="absolute inset-0 -z-10 opacity-70">
        <QuantumField density={0.7} />
      </div>
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[520px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(59,130,246,0.3),rgba(139,92,246,0.12),transparent)] blur-2xl" />

      <div className="mx-auto max-w-[1400px] px-5 py-28 sm:px-8 sm:py-36 lg:px-12">
        <div className="ql-reveal relative mx-auto max-w-3xl text-center">
          <span className="ql-corner tl" />
          <span className="ql-corner tr" />
          <span className="ql-corner bl" />
          <span className="ql-corner br" />
          <div className="px-6 py-12 sm:px-12">
            <p className="font-mono text-xs tracking-[0.18em] text-blue-300/80">
              |ψ⟩ = |ready⟩
            </p>
            <h2 className="mt-6 text-[clamp(2.25rem,5.5vw,4.5rem)] font-semibold leading-[1] tracking-[-0.045em]">
              Your first entangled pair is <span className="ql-text-gradient">two gates away.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-white/55 sm:text-lg">
              Create an account, open Chapter 1, and build alongside every lesson.
              Your progress follows you across the lab, the editor and the tutor.
            </p>
            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="ql-shine group inline-flex items-center justify-center gap-2 rounded-lg bg-white px-7 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_10px_50px_-10px_rgba(255,255,255,0.5)] transition-colors hover:bg-blue-50"
              >
                Create your account
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/roadmap"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.04] px-7 py-3.5 text-sm font-semibold backdrop-blur-md transition-colors hover:border-white/30 hover:bg-white/[0.08]"
              >
                <Map size={16} className="text-blue-300" />
                Browse the roadmap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
