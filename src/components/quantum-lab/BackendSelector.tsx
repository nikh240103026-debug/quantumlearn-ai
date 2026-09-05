"use client";

import type { QuantumBackend } from "@/lib/quantum/backends/types";

type Props = {
  backend: QuantumBackend;
  onChange: (backend: QuantumBackend) => void;
  disabled?: boolean;
};

const BACKENDS: {
  id: QuantumBackend;
  name: string;
  description: string;
  enabled: boolean;
}[] = [
  {
    id: "local",
    name: "QuantumLearn Local",
    description: "Built-in simulator",
    enabled: true,
  },
  {
    id: "qiskit-aer",
    name: "Qiskit Aer",
    description: "Qiskit Aer simulator",
    enabled: true,
  },
  {
    id: "pennylane",
    name: "PennyLane",
    description: "PennyLane simulator",
    enabled: true,
  },
  {
    id: "cirq",
    name: "Cirq",
    description: "Google Cirq simulator",
    enabled: true,
  },
  {
    id: "qbraid",
    name: "qBraid",
    description: "Cloud execution",
    enabled: false,
  },
];

export default function BackendSelector({
  backend,
  onChange,
  disabled = false,
}: Props) {
  return (
    <section className="border border-slate-800 bg-[#0a0f18] p-6">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-500">
          Simulation Backend
        </p>

        <h2 className="mt-1 text-lg font-bold text-white">
          Choose quantum engine
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Execute the current circuit using a quantum simulation framework.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {BACKENDS.map((item) => {
          const selected =
            backend === item.id;

          return (
            <button
              key={item.id}
              type="button"
              disabled={
                disabled ||
                !item.enabled
              }
              onClick={() =>
                onChange(item.id)
              }
              className={`border p-4 text-left transition ${
                selected
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-slate-800 bg-[#070b12] hover:border-slate-600"
              } ${
                !item.enabled
                  ? "cursor-not-allowed opacity-40"
                  : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">
                  {item.name}
                </span>

                {selected && (
                  <span className="text-xs font-bold text-blue-400">
                    ACTIVE
                  </span>
                )}
              </div>

              <p className="mt-2 text-xs text-slate-500">
                {item.description}
              </p>

              {!item.enabled && (
                <p className="mt-2 text-[10px] font-semibold uppercase text-yellow-500">
                  Coming soon
                </p>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}