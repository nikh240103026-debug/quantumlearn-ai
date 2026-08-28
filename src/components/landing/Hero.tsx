import Link from "next/link";
import {
  ArrowRight,
  Play,
  Sparkles,
} from "lucide-react";

const qubits = [
  {
    label: "q₀",
    gates: ["H", "●", "M"],
  },
  {
    label: "q₁",
    gates: ["", "X", "M"],
  },
  {
    label: "q₂",
    gates: ["H", "Z", "M"],
  },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-blue-100/40 blur-3xl" />

        <div className="absolute right-0 top-40 h-72 w-72 rounded-full bg-purple-100/30 blur-3xl" />
      </div>

      <div className="relative mx-auto grid min-w-0 grid-cols-1 max-w-7xl items-center gap-16 px-4 pb-20 pt-16 sm:px-6 md:pb-28 md:pt-24 lg:grid-cols-2 lg:px-8 lg:pt-28">
        {/* Left Content */}
        <div className="min-w-0">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-2 text-sm font-medium text-blue-700">
            <Sparkles size={15} />
            Interactive Quantum Learning
          </div>

          {/* Heading */}
          <h1 className="max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight text-slate-950 sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl">
            Learn Quantum Computing{" "}
            <span className="text-blue-600">
              by Building It.
            </span>
          </h1>

          {/* Description */}
          <p className="mt-7 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            An interactive AI-powered platform where you can
            learn quantum concepts, build quantum circuits, run
            simulations, visualize results, and receive
            intelligent guidance.
          </p>

          {/* CTAs */}
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md"
            >
              Start Learning
              <ArrowRight size={17} />
            </Link>

            <Link
              href="/quantum-lab"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition-all hover:border-slate-400 hover:bg-slate-50"
            >
              <Play size={16} />
              Explore Quantum Lab
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-500">
            <span>Learn interactively</span>
            <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />
            <span>Build real circuits</span>
            <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />
            <span>Understand results</span>
          </div>
        </div>

        {/* Quantum Visualization */}
        <QuantumVisualization />
      </div>
    </section>
  );
}

function QuantumVisualization() {
  return (
    <div className="relative mx-auto min-w-0 w-full max-w-xl">
      {/* Outer glow */}
      <div className="absolute -inset-6 rounded-[2rem] bg-blue-100/50 blur-2xl" />

      {/* Main panel */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Quantum Circuit
            </p>

            <p className="mt-1 text-sm font-semibold text-white">
              Bell State Experiment
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Ready
          </div>
        </div>

        {/* Circuit */}
        <div className="p-5 sm:p-7">
          <div className="rounded-xl border border-white/10 bg-slate-900/80 p-5">
            {qubits.map((qubit, rowIndex) => (
              <div
                key={qubit.label}
                className="flex h-20 items-center"
              >
                {/* Qubit label */}
                <div className="w-10 shrink-0 text-sm font-semibold text-slate-300">
                  {qubit.label}
                </div>

                {/* Circuit line */}
                <div className="relative flex flex-1 items-center">
                  <div className="absolute left-0 right-0 h-px bg-slate-600" />

                  <div className="relative z-10 flex w-full items-center justify-around">
                    {qubit.gates.map((gate, gateIndex) => {
                      const isControl =
                        rowIndex === 0 && gateIndex === 1;

                      const isTarget =
                        rowIndex === 1 && gateIndex === 1;

                      if (!gate) {
                        return (
                          <div
                            key={`${qubit.label}-${gateIndex}`}
                            className="h-8 w-8"
                          />
                        );
                      }

                      if (isControl) {
                        return (
                          <div
                            key={`${qubit.label}-${gateIndex}`}
                            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-cyan-400 bg-slate-950"
                          >
                            <div className="h-2 w-2 rounded-full bg-cyan-400" />
                          </div>
                        );
                      }

                      if (isTarget) {
                        return (
                          <div
                            key={`${qubit.label}-${gateIndex}`}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-purple-400/70 bg-purple-500/10 text-sm font-bold text-purple-300"
                          >
                            X
                          </div>
                        );
                      }

                      return (
                        <div
                          key={`${qubit.label}-${gateIndex}`}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-400/60 bg-blue-500/10 text-sm font-bold text-blue-300"
                        >
                          {gate}
                        </div>
                      );
                    })}
                  </div>

                  {/* Entanglement connector */}
                  {rowIndex === 0 && (
                    <div className="absolute left-1/2 top-1/2 z-0 h-20 w-px -translate-y-1/2 bg-cyan-400/50" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Probability visualization */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <ProbabilityCard
              state="|00⟩"
              probability="50%"
              width="50%"
            />

            <ProbabilityCard
              state="|11⟩"
              probability="50%"
              width="50%"
            />
          </div>
        </div>

        {/* Bottom status */}
        <div className="flex items-center justify-between border-t border-white/10 bg-slate-900 px-5 py-3">
          <span className="text-xs text-slate-500">
            2 qubits · 3 gates
          </span>

          <span className="text-xs font-medium text-cyan-400">
            Simulation ready
          </span>
        </div>
      </div>
    </div>
  );
}

interface ProbabilityCardProps {
  state: string;
  probability: string;
  width: string;
}

function ProbabilityCard({
  state,
  probability,
  width,
}: ProbabilityCardProps) {
  return (
    <div className="rounded-lg border border-white/10 bg-slate-950 p-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-300">
          {state}
        </span>

        <span className="text-slate-500">
          {probability}
        </span>
      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-cyan-400"
          style={{ width }}
        />
      </div>
    </div>
  );
}