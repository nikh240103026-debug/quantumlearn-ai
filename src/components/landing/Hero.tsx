import Link from "next/link";
import { ArrowRight, Atom, Play, Terminal, Waves } from "lucide-react";

const qubits = [
  { label: "q₀", gates: ["H", "●", "M"] },
  { label: "q₁", gates: ["", "X", "M"] },
  { label: "q₂", gates: ["H", "Z", "M"] },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-white">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_30%,rgba(37,99,235,0.12),transparent_30%),radial-gradient(circle_at_20%_0%,rgba(99,102,241,0.06),transparent_25%)]" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(#0f172a 1px, transparent 1px), linear-gradient(90deg, #0f172a 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-[1600px]">
        {/* Main Hero */}
        <div className="grid min-h-[760px] lg:grid-cols-[0.95fr_1.05fr]">
          {/* Left */}
          <div className="flex flex-col justify-center border-b border-slate-200 px-6 py-20 sm:px-10 lg:border-b-0 lg:border-r lg:px-16 lg:py-24 xl:px-24">
            <div className="max-w-3xl">
              {/* Eyebrow */}
              <div className="mb-8 inline-flex items-center gap-2 border border-slate-300 bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600 shadow-sm">
                <Atom size={14} className="text-blue-600" />
                Interactive Quantum Learning
              </div>

              {/* Heading */}
              <h1 className="max-w-4xl text-[3.5rem] font-semibold leading-[0.94] tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-[5.2rem] xl:text-[6.1rem]">
                Learn quantum
                <br />
                computing by
                <br />
                <span className="text-blue-600">building it.</span>
              </h1>

              {/* Description */}
              <p className="mt-9 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                An interactive AI-powered platform for learning quantum
                computing through concepts, circuits, simulations, coding,
                experimentation, and intelligent guidance.
              </p>

              {/* Actions */}
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20"
                >
                  Start Learning
                  <ArrowRight size={17} />
                </Link>

                <Link
                  href="/quantum-lab"
                  className="inline-flex items-center justify-center gap-2 border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-800 transition-all hover:border-slate-500 hover:bg-slate-50"
                >
                  <Play size={15} />
                  Explore Quantum Lab
                </Link>
              </div>

              {/* Product promise */}
              <div className="mt-12 grid max-w-2xl grid-cols-3 border-y border-slate-200">
                <div className="py-5 pr-4">
                  <p className="text-sm font-semibold text-slate-950">
                    Learn
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Structured concepts
                  </p>
                </div>

                <div className="border-l border-slate-200 px-4 py-5">
                  <p className="text-sm font-semibold text-slate-950">
                    Build
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Interactive circuits
                  </p>
                </div>

                <div className="border-l border-slate-200 pl-4 py-5">
                  <p className="text-sm font-semibold text-slate-950">
                    Understand
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    AI-guided results
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="relative flex min-h-[760px] items-center overflow-hidden bg-[#050816] px-5 py-16 sm:px-10 lg:px-12 xl:px-20">
            {/* Quantum grid */}
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px)",
                backgroundSize: "48px 48px",
              }}
            />

            {/* Ambient glow */}
            <div className="pointer-events-none absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-blue-600/20 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-40 left-1/4 h-[26rem] w-[26rem] rounded-full bg-indigo-600/15 blur-3xl" />

            <div className="relative mx-auto w-full max-w-3xl">
              {/* Workspace header */}
              <div className="mb-4 flex items-center justify-between border border-white/10 bg-white/[0.035] px-4 py-3">
                <div className="flex items-center gap-3">
                  <Terminal size={16} className="text-blue-400" />

                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
                      Quantum workspace
                    </p>

                    <p className="mt-0.5 text-sm font-medium text-white">
                      Bell State Experiment
                    </p>
                  </div>
                </div>

                <span className="flex items-center gap-2 text-xs text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Simulation ready
                </span>
              </div>

              {/* Circuit panel */}
              <div className="border border-white/10 bg-[#0a1020] shadow-2xl shadow-black/40">
                {/* Panel header */}
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-7">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                      Circuit
                    </p>

                    <p className="mt-1 text-sm font-semibold text-white">
                      3 qubits · 6 gates
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Waves size={14} className="text-cyan-400" />
                    Live state
                  </div>
                </div>

                {/* Circuit */}
                <div className="p-5 sm:p-8">
                  <div className="border border-white/10 bg-[#050816] p-4 sm:p-7">
                    {qubits.map((qubit, rowIndex) => (
                      <div
                        key={qubit.label}
                        className="flex h-20 items-center"
                      >
                        <div className="w-10 shrink-0 text-xs font-semibold text-slate-400 sm:w-12 sm:text-sm">
                          {qubit.label}
                        </div>

                        <div className="relative flex flex-1 items-center">
                          {/* Wire */}
                          <div className="absolute left-0 right-0 h-px bg-slate-700" />

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
                                    className="h-9 w-9"
                                  />
                                );
                              }

                              if (isControl) {
                                return (
                                  <div
                                    key={`${qubit.label}-${gateIndex}`}
                                    className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-cyan-400 bg-[#050816]"
                                  >
                                    <div className="h-2 w-2 rounded-full bg-cyan-400" />
                                  </div>
                                );
                              }

                              if (isTarget) {
                                return (
                                  <div
                                    key={`${qubit.label}-${gateIndex}`}
                                    className="flex h-9 w-9 items-center justify-center rounded-md border border-violet-400/70 bg-violet-500/10 text-xs font-bold text-violet-300"
                                  >
                                    X
                                  </div>
                                );
                              }

                              return (
                                <div
                                  key={`${qubit.label}-${gateIndex}`}
                                  className="flex h-9 w-9 items-center justify-center rounded-md border border-blue-400/60 bg-blue-500/10 text-xs font-bold text-blue-300"
                                >
                                  {gate}
                                </div>
                              );
                            })}
                          </div>

                          {/* Control connector */}
                          {rowIndex === 0 && (
                            <div className="absolute left-1/2 top-1/2 z-0 h-20 w-px -translate-y-1/2 bg-cyan-400/50" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Measurement */}
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <ProbabilityCard
                      state="|00⟩"
                      probability="50%"
                    />

                    <ProbabilityCard
                      state="|11⟩"
                      probability="50%"
                    />
                  </div>
                </div>

                {/* SDK strip */}
                <div className="grid grid-cols-3 border-t border-white/10 text-xs">
                  <div className="border-r border-white/10 px-4 py-4 text-slate-500">
                    Qiskit
                  </div>

                  <div className="border-r border-white/10 px-4 py-4 text-slate-500">
                    PennyLane
                  </div>

                  <div className="px-4 py-4 text-slate-500">
                    Cirq
                  </div>
                </div>
              </div>

              {/* Feature strip */}
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  ["01", "Concepts", "Understand the theory"],
                  ["02", "Circuits", "Build and experiment"],
                  ["03", "Results", "Interpret what happened"],
                ].map(([number, title, description]) => (
                  <div
                    key={number}
                    className="border border-white/10 bg-white/[0.035] p-4"
                  >
                    <p className="text-[10px] font-semibold tracking-[0.18em] text-blue-400">
                      {number}
                    </p>

                    <p className="mt-2 text-sm font-semibold text-white">
                      {title}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom statement */}
        <div className="grid border-t border-slate-200 bg-slate-50 lg:grid-cols-4">
          <div className="border-b border-slate-200 px-6 py-6 sm:px-10 lg:border-b-0 lg:border-r lg:px-12">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              One platform
            </p>
          </div>

          <div className="border-b border-slate-200 px-6 py-6 sm:px-10 lg:border-b-0 lg:border-r lg:px-12">
            <p className="text-sm font-medium text-slate-900">
              Learn quantum fundamentals
            </p>
          </div>

          <div className="border-b border-slate-200 px-6 py-6 sm:px-10 lg:border-b-0 lg:border-r lg:px-12">
            <p className="text-sm font-medium text-slate-900">
              Build and simulate circuits
            </p>
          </div>

          <div className="px-6 py-6 sm:px-10 lg:px-12">
            <p className="text-sm font-medium text-slate-900">
              Write code and understand results
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProbabilityCard({
  state,
  probability,
}: {
  state: string;
  probability: string;
}) {
  return (
    <div className="border border-white/10 bg-white/[0.03] p-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-300">{state}</span>
        <span className="text-slate-500">{probability}</span>
      </div>

      <div className="mt-2 h-1 overflow-hidden bg-slate-800">
        <div className="h-full w-1/2 bg-cyan-400" />
      </div>
    </div>
  );
}