import Link from "next/link";
import { ArrowRight, Atom, Code2, FlaskConical } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-[1600px]">
        {/* Main CTA */}
        <div className="grid bg-[#050816] text-white lg:grid-cols-[1.15fr_0.85fr]">
          {/* Left */}
          <div className="border-b border-white/10 px-6 py-16 sm:px-10 sm:py-20 lg:border-b-0 lg:border-r lg:px-16 lg:py-24 xl:px-24">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 border border-white/15 bg-white/[0.04] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                <Atom size={14} className="text-blue-400" />
                Start your quantum journey
              </div>

              <h2 className="mt-8 max-w-3xl text-4xl font-semibold leading-[1] tracking-[-0.045em] sm:text-5xl lg:text-6xl xl:text-7xl">
                Learn the theory.
                <br />
                Build the circuit.
                <br />
                <span className="text-blue-400">Understand the result.</span>
              </h2>

              <p className="mt-7 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
                Start with the fundamentals and move toward real quantum
                experimentation through one connected learning environment.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-blue-500"
                >
                  Get Started
                  <ArrowRight size={17} />
                </Link>

                <Link
                  href="/roadmap"
                  className="inline-flex items-center justify-center gap-2 border border-white/15 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/[0.06]"
                >
                  View Learning Roadmap
                </Link>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="relative flex min-h-[440px] items-center overflow-hidden px-6 py-14 sm:px-10 lg:px-12 xl:px-20">
            {/* Grid */}
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
                backgroundSize: "48px 48px",
              }}
            />

            {/* Glow */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-3xl" />

            <div className="relative w-full">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Everything connected
              </p>

              <div className="mt-7 space-y-3">
                <FeatureRow
                  icon={FlaskConical}
                  title="Quantum Lab"
                  description="Build and simulate circuits"
                  href="/quantum-lab"
                />

                <FeatureRow
                  icon={Code2}
                  title="Quantum Coding"
                  description="Write and execute quantum programs"
                  href="/coding"
                />

                <FeatureRow
                  icon={Atom}
                  title="AI Tutor"
                  description="Get intelligent learning guidance"
                  href="/ai-tutor"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom statement */}
        <div className="grid border-t border-slate-200 bg-slate-50 sm:grid-cols-3">
          <div className="border-b border-slate-200 px-6 py-6 sm:border-b-0 sm:border-r sm:px-8 lg:px-12">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Learn
            </p>

            <p className="mt-2 text-sm font-medium text-slate-900">
              Structured quantum curriculum
            </p>
          </div>

          <div className="border-b border-slate-200 px-6 py-6 sm:border-b-0 sm:border-r sm:px-8 lg:px-12">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Experiment
            </p>

            <p className="mt-2 text-sm font-medium text-slate-900">
              Interactive circuits and simulators
            </p>
          </div>

          <div className="px-6 py-6 sm:px-8 lg:px-12">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Progress
            </p>

            <p className="mt-2 text-sm font-medium text-slate-900">
              AI guidance and personalized learning
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureRow({
  icon: Icon,
  title,
  description,
  href,
}: {
  icon: React.ComponentType<{
    size?: number;
    strokeWidth?: number;
    className?: string;
  }>;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between border border-white/10 bg-white/[0.035] px-4 py-4 transition-colors hover:border-blue-400/30 hover:bg-white/[0.06]"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-white/10 bg-white/[0.04]">
          <Icon
            size={18}
            strokeWidth={1.7}
            className="text-blue-400"
          />
        </div>

        <div>
          <p className="text-sm font-semibold text-white">{title}</p>

          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>
      </div>

      <ArrowRight
        size={16}
        className="text-slate-600 transition-all duration-300 group-hover:translate-x-1 group-hover:text-blue-400"
      />
    </Link>
  );
}