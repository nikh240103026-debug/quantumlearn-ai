"use client";

import {
  QUANTUM_TEMPLATES,
  type QuantumTemplate,
} from "@/lib/quantum/templates";

interface AlgorithmTemplatesProps {
  onLoadTemplate: (
    template: QuantumTemplate,
  ) => void;
}

export default function AlgorithmTemplates({
  onLoadTemplate,
}: AlgorithmTemplatesProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="mb-5">

        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
          Quantum Algorithms
        </p>

        <h2 className="mt-1 text-xl font-bold text-slate-950">
          Algorithm Templates
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Start with a prepared circuit and explore how the
          algorithm works.
        </p>

      </div>

      <div className="grid gap-4 md:grid-cols-2">

        {QUANTUM_TEMPLATES.map(
          (template) => (
            <div
              key={template.id}
              className="rounded-xl border border-slate-200 p-5"
            >

              <h3 className="font-bold text-slate-950">
                {template.name}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {template.description}
              </p>

              <div className="mt-4 flex items-center justify-between">

                <span className="text-xs font-semibold text-slate-400">
                  {template.qubits}{" "}
                  {template.qubits === 1
                    ? "qubit"
                    : "qubits"}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    onLoadTemplate(
                      template,
                    )
                  }
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Load Template
                </button>

              </div>

            </div>
          ),
        )}

      </div>

    </section>
  );
}