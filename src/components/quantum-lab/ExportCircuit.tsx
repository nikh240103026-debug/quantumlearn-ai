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
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <div>
        <h2 className="font-bold text-slate-950">
          Export Circuit
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Download your circuit for later use or external
          quantum software.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">

        <button
          type="button"
          onClick={() =>
            exportCircuitJSON(
              qubits,
              circuit,
            )
          }
          className="rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
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
          className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Export OpenQASM
        </button>

      </div>

    </section>
  );
}