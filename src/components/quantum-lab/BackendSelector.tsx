"use client";

import type {
  QuantumBackend,
} from "@/lib/quantum/backends/types";

type Props = {
  backend: QuantumBackend;
  onChange: (
    backend: QuantumBackend,
  ) => void;
  disabled?: boolean;
};

const BACKENDS: Array<{
  id: QuantumBackend;
  name: string;
  description: string;
}> = [
  {
    id: "local",
    name: "QuantumLearn Local",
    description:
      "Built-in local simulator",
  },

  {
    id: "qiskit-aer",
    name: "Qiskit Aer",
    description:
      "Qiskit Aer simulator",
  },

  {
    id: "pennylane",
    name: "PennyLane",
    description:
      "PennyLane simulator",
  },

  {
    id: "cirq",
    name: "Cirq",
    description:
      "Google Cirq simulator",
  },

  {
    id: "qbraid",
    name: "qBraid",
    description:
      "qBraid QIR simulator",
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
          Execute the current circuit using the selected backend.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {BACKENDS.map(
          (item) => {
            const selected =
              backend === item.id;

            return (
              <button
                key={item.id}
                type="button"
                disabled={disabled}
                onClick={() =>
                  onChange(
                    item.id,
                  )
                }
                className={`border p-4 text-left transition ${
                  selected
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-slate-800 bg-[#070b12] hover:border-slate-600"
                } ${
                  disabled
                    ? "cursor-not-allowed opacity-50"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-white">
                    {item.name}
                  </span>

                  {selected && (
                    <span className="text-[10px] font-bold text-blue-400">
                      ACTIVE
                    </span>
                  )}
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  {item.description}
                </p>
              </button>
            );
          },
        )}
      </div>
    </section>
  );
}