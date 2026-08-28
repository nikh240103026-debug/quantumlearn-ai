import {
  ArrowRight,
  Sparkles,
  Atom,
} from "lucide-react";

export function FinalCTA() {
  return (
    <section className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-16 text-center shadow-xl sm:px-12 sm:py-20 lg:px-20">

          {/* Decorative elements */}
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full border border-blue-400/10" />

          <div className="pointer-events-none absolute -bottom-32 -right-20 h-80 w-80 rounded-full border border-blue-400/10" />

          <div className="relative mx-auto max-w-3xl">

            {/* Icon */}
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-blue-400">
              <Atom size={27} strokeWidth={1.5} />
            </div>

            <p className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-400">
              <Sparkles size={13} />
              Start Your Quantum Journey
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Ready to Understand Quantum Computing?
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
              Learn the concepts, build the circuits, practice your
              understanding, and develop the intuition to go further.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-slate-100 sm:w-auto"
              >
                Start Learning
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                className="inline-flex w-full items-center justify-center rounded-lg border border-white/10 px-6 py-3 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/5 hover:text-white sm:w-auto"
              >
                Explore Quantum Lab
              </button>
            </div>

            <p className="mt-6 text-xs text-slate-500">
              No prior quantum computing experience required.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}