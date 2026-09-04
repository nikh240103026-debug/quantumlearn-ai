"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  generateCirqCode,
  generatePennyLaneCode,
  generateQiskitCode,
} from "@/lib/quantum/codegen";

import type {
  CircuitGate,
} from "@/lib/quantum/types";

interface CodeGeneratorProps {
  qubits: number;
  circuit: CircuitGate[];
}

type Language =
  | "qiskit"
  | "pennylane"
  | "cirq";

export default function CodeGenerator({
  qubits,
  circuit,
}: CodeGeneratorProps) {
  const [language, setLanguage] =
    useState<Language>(
      "qiskit",
    );

  const code = useMemo(() => {
    if (
      language ===
      "pennylane"
    ) {
      return generatePennyLaneCode(
        qubits,
        circuit,
      );
    }

    if (
      language ===
      "cirq"
    ) {
      return generateCirqCode(
        qubits,
        circuit,
      );
    }

    return generateQiskitCode(
      qubits,
      circuit,
    );
  }, [
    language,
    qubits,
    circuit,
  ]);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(
        code,
      );
    } catch {
      // Clipboard access can be unavailable.
    }
  }

  return (
    <section className="border border-slate-800 bg-black p-6">

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <p className="text-xs font-semibold uppercase tracking-wider text-blue-500">
            Code Generation
          </p>

          <h2 className="mt-1 text-lg font-bold text-white">
            Run this circuit in a quantum framework
          </h2>

        </div>

        <div className="flex flex-wrap gap-2">

          {(
            [
              [
                "qiskit",
                "Qiskit",
              ],
              [
                "pennylane",
                "PennyLane",
              ],
              [
                "cirq",
                "Cirq",
              ],
            ] as const
          ).map(
            ([
              value,
              label,
            ]) => (
              <button
                key={value}
                type="button"
                onClick={() =>
                  setLanguage(
                    value,
                  )
                }
                className={`border px-3 py-2 text-xs font-bold ${
                  language ===
                  value
                    ? "border-blue-500 bg-blue-600 text-white"
                    : "border-slate-700 bg-slate-950 text-slate-400 hover:border-blue-700"
                }`}
              >
                {label}
              </button>
            ),
          )}

          <button
            type="button"
            onClick={
              copyCode
            }
            className="border border-slate-700 px-3 py-2 text-xs font-bold text-slate-300 hover:border-blue-600"
          >
            Copy
          </button>

        </div>

      </div>

      <div className="mt-5 overflow-x-auto border border-slate-800 bg-slate-950">

        <pre className="min-h-64 p-5 font-mono text-xs leading-6 text-blue-100">
          <code>
            {code}
          </code>
        </pre>

      </div>

    </section>
  );
}