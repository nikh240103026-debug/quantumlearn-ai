"use client";

import {
  exportCircuitJSON,
  exportCircuitQASM,
} from "@/lib/quantum/export";

import type {
  CircuitGate,
} from "@/lib/quantum/types";

interface ExportCircuitProps {
  qubits: number;
  circuit: CircuitGate[];
}

export default function ExportCircuit({
  qubits,
  circuit,
}: ExportCircuitProps) {
  return (
    <section className="border border-slate-800 bg-black p-6">

      <div>

        <p className="text-xs font-semibold uppercase tracking-wider text-blue-500">
          Circuit Export
        </p>

        <h2 className="mt-1 text-lg font-bold text-white">
          Export circuit representation
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Download the current circuit as JSON or OpenQASM.
        </p>

      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">

        <button
          type="button"
          onClick={() =>
            exportCircuitJSON(
              qubits,
              circuit,
            )
          }
          className="border border-slate-700 px-4 py-3 text-sm font-bold text-slate-200 hover:border-blue-600 hover:bg-slate-950"
        >
          Export JSON
        </button>

        <button
          type="button"
          onClick={() =>
            exportCircuitQASM(
              qubits,
              circuit,
            )
          }
          className="border border-blue-600 bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-500"
        >
          Export OpenQASM 2.0
        </button>

      </div>

    </section>
  );
}