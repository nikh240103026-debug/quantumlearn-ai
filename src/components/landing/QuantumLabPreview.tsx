"use client";

import { useState } from "react";
import {
  Play,
  RotateCcw,
  Plus,
  Sparkles,
  Zap,
} from "lucide-react";

const gates = ["H", "X", "Y", "Z", "S", "T"];

const initialCircuit = [
  ["H", "", "X", ""],
  ["", "X", "", "H"],
];

export function QuantumLabPreview() {
  const [circuit, setCircuit] = useState(initialCircuit);
  const [running, setRunning] = useState(false);

  function addGate(row: number, column: number, gate: string) {
    setCircuit((current) =>
      current.map((qubit, rowIndex) =>
        rowIndex === row
          ? qubit.map((cell, columnIndex) =>
              columnIndex === column ? gate : cell
            )
          : qubit
      )
    );
  }

  function runCircuit() {
    setRunning(true);

    setTimeout(() => {
      setRunning(false);
    }, 1200);
  }

  function resetCircuit() {
    setCircuit(initialCircuit);
    setRunning(false);
  }

  return (
    <section
        id="quantum-lab" 
        className="bg-white py-20 sm:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-600">
            Quantum Lab
          </p>

          <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            Build. Run. Understand.
          </h2>

          <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg">
            Experiment with quantum circuits in a visual environment
            designed to help you understand what your circuit is doing
            and why the results matter.
          </p>
        </div>

        {/* Lab */}
        <div className="mt-12 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-xl lg:mt-16">

          {/* Top bar */}
          <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Quantum Workspace
              </p>

              <p className="mt-1 text-sm font-semibold text-white">
                Bell State Experiment
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={resetCircuit}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
              >
                <RotateCcw size={14} />
                Reset
              </button>

              <button
                type="button"
                onClick={runCircuit}
                disabled={running}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Play size={14} />
                {running ? "Running..." : "Run Circuit"}
              </button>
            </div>
          </div>

          {/* Workspace */}
          <div className="grid lg:grid-cols-[180px_1fr_280px]">

            {/* Gate palette */}
            <aside className="border-b border-white/10 p-5 lg:border-b-0 lg:border-r">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Gate Palette
              </p>

              <div className="mt-4 grid grid-cols-3 gap-2 lg:grid-cols-2">
                {gates.map((gate) => (
                  <button
                    key={gate}
                    type="button"
                    className="flex h-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-sm font-bold text-slate-300 transition-all hover:border-blue-400/50 hover:bg-blue-500/10 hover:text-blue-300"
                  >
                    {gate}
                  </button>
                ))}
              </div>

              <div className="mt-6 hidden rounded-lg border border-white/10 bg-white/[0.03] p-3 lg:block">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                  <Plus size={14} />
                  Add gates to your circuit
                </div>
              </div>
            </aside>

            {/* Circuit builder */}
            <div className="min-w-0 p-5 sm:p-7">

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    Circuit Builder
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    2 qubits · 4 operations
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Simulator ready
                </div>
              </div>

              {/* Circuit */}
              <div className="mt-8 overflow-x-auto rounded-xl border border-white/10 bg-slate-900 p-5">
                <div className="min-w-[520px]">

                  {/* Column labels */}
                  <div className="ml-12 mb-3 grid grid-cols-4 text-center text-[10px] font-medium uppercase tracking-wider text-slate-600">
                    <span>Gate 1</span>
                    <span>Gate 2</span>
                    <span>Gate 3</span>
                    <span>Gate 4</span>
                  </div>

                  {circuit.map((row, rowIndex) => (
                    <div
                      key={rowIndex}
                      className="flex h-20 items-center"
                    >
                      {/* Qubit label */}
                      <div className="w-12 shrink-0 text-sm font-semibold text-slate-400">
                        q{rowIndex}
                      </div>

                      {/* Wire */}
                      <div className="relative flex flex-1 items-center">
                        <div className="absolute left-0 right-0 h-px bg-slate-600" />

                        <div className="relative z-10 grid w-full grid-cols-4">
                          {row.map((gate, columnIndex) => (
                            <button
                              key={`${rowIndex}-${columnIndex}`}
                              type="button"
                              onClick={() =>
                                addGate(
                                  rowIndex,
                                  columnIndex,
                                  gate || "H"
                                )
                              }
                              className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-slate-950 text-sm font-bold text-slate-400 transition-all hover:border-cyan-400/60 hover:text-cyan-300"
                            >
                              {gate || "+"}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Run indicator */}
              <div className="mt-5 flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
                <Zap
                  size={16}
                  className={
                    running
                      ? "animate-pulse text-cyan-400"
                      : "text-slate-500"
                  }
                />

                <p className="text-xs text-slate-400">
                  {running
                    ? "Executing quantum circuit..."
                    : "Circuit ready to simulate."}
                </p>
              </div>
            </div>

            {/* Results / AI explanation */}
            <aside className="border-t border-white/10 p-5 lg:border-l lg:border-t-0">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-cyan-400" />

                <p className="text-sm font-semibold text-white">
                  AI Analysis
                </p>
              </div>

              <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Measurement Results
                </p>

                <div className="mt-4 space-y-4">
                  <ResultBar
                    state="|00⟩"
                    probability="50%"
                    width="50%"
                  />

                  <ResultBar
                    state="|11⟩"
                    probability="50%"
                    width="50%"
                  />
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-cyan-400/10 bg-cyan-400/5 p-4">
                <p className="text-xs font-semibold text-cyan-300">
                  What happened?
                </p>

                <p className="mt-2 text-xs leading-5 text-slate-400">
                  Your circuit creates a correlated two-qubit
                  state. Measuring the system produces matching
                  outcomes with approximately equal probability.
                </p>
              </div>

              <div className="mt-5">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-600">
                  AI Tutor
                </p>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Ask why this circuit behaves this way or explore
                  the effect of changing a gate.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}

interface ResultBarProps {
  state: string;
  probability: string;
  width: string;
}

function ResultBar({
  state,
  probability,
  width,
}: ResultBarProps) {
  return (
    <div>
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
          className="h-full rounded-full bg-cyan-400 transition-all duration-500"
          style={{ width }}
        />
      </div>
    </div>
  );
}