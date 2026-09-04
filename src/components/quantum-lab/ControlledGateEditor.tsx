"use client";

import { useMemo } from "react";

import type {
  CircuitGate,
  QuantumGate,
} from "@/lib/quantum/types";

interface ControlledGateEditorProps {
  qubits: number;
  columns: number;
  circuit: CircuitGate[];
  onCircuitChange: (
    circuit: CircuitGate[],
  ) => void;
}

const CONTROLLED_GATES: QuantumGate[] = [
  "CNOT",
  "CZ",
  "SWAP",
];

function isControlledGate(
  gate: QuantumGate,
) {
  return CONTROLLED_GATES.includes(gate);
}

function getOccupiedQubits(
  operation: CircuitGate,
) {
  if (
    isControlledGate(operation.gate) &&
    operation.controlQubit !==
      undefined
  ) {
    return [
      operation.controlQubit,
      operation.qubit,
    ];
  }

  return [operation.qubit];
}

export default function ControlledGateEditor({
  qubits,
  columns,
  circuit,
  onCircuitChange,
}: ControlledGateEditorProps) {
  const controlledOperations =
    useMemo(
      () =>
        circuit.filter(
          (operation) =>
            isControlledGate(
              operation.gate,
            ),
        ),
      [circuit],
    );

  function updateControl(
    operation: CircuitGate,
    controlQubit: number,
  ) {
    if (
      controlQubit ===
      operation.qubit
    ) {
      return;
    }

    if (
      controlQubit < 0 ||
      controlQubit >= qubits
    ) {
      return;
    }

    const occupiedByAnotherGate =
      circuit.some(
        (candidate) => {
          if (
            candidate.id ===
            operation.id
          ) {
            return false;
          }

          if (
            candidate.column !==
            operation.column
          ) {
            return false;
          }

          return getOccupiedQubits(
            candidate,
          ).includes(
            controlQubit,
          );
        },
      );

    if (
      occupiedByAnotherGate
    ) {
      return;
    }

    const nextCircuit =
      circuit.map(
        (candidate) =>
          candidate.id ===
          operation.id
            ? {
                ...candidate,
                controlQubit,
              }
            : candidate,
      );

    onCircuitChange(
      nextCircuit,
    );
  }

  function removeControlledGate(
    operation: CircuitGate,
  ) {
    onCircuitChange(
      circuit.filter(
        (candidate) =>
          candidate.id !==
          operation.id,
      ),
    );
  }

  if (
    controlledOperations.length ===
    0
  ) {
    return (
      <section className="border border-blue-900/70 bg-black">
        <div className="border-b border-blue-900/70 px-5 py-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
            Controlled Operations
          </div>

          <div className="mt-1 text-sm text-slate-400">
            No controlled gates are
            currently present in the
            circuit.
          </div>
        </div>

        <div className="p-5 font-mono text-xs leading-6 text-slate-500">
          Add a CNOT, CZ or SWAP gate
          to configure its control
          and target qubits here.
        </div>
      </section>
    );
  }

  return (
    <section className="border border-blue-900/70 bg-black">
      <div className="border-b border-blue-900/70 px-5 py-4">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-blue-400">
          Controlled Operations
        </div>

        <h3 className="mt-1 text-sm font-semibold text-white">
          Multi-Qubit Gate Configuration
        </h3>
      </div>

      <div className="divide-y divide-blue-950">
        {controlledOperations.map(
          (operation) => (
            <div
              key={operation.id}
              className="grid gap-5 p-5 lg:grid-cols-[120px_1fr_auto]"
            >
              {/* GATE */}

              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-slate-600">
                  Gate
                </div>

                <div className="mt-2 border border-blue-800 bg-blue-950/30 px-4 py-3 text-center font-mono text-sm font-bold text-blue-200">
                  {operation.gate}
                </div>
              </div>

              {/* CONFIGURATION */}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor={`target-${operation.id}`}
                    className="font-mono text-[10px] uppercase tracking-wider text-slate-600"
                  >
                    Target Qubit
                  </label>

                  <div
                    id={`target-${operation.id}`}
                    className="mt-2 border border-blue-950 bg-black px-3 py-2 font-mono text-xs text-blue-300"
                  >
                    q[{operation.qubit}]
                  </div>
                </div>

                <div>
                  <label
                    htmlFor={`control-${operation.id}`}
                    className="font-mono text-[10px] uppercase tracking-wider text-slate-600"
                  >
                    Control Qubit
                  </label>

                  <select
                    id={`control-${operation.id}`}
                    value={
                      operation.controlQubit ??
                      ""
                    }
                    onChange={(
                      event,
                    ) =>
                      updateControl(
                        operation,
                        Number(
                          event.target
                            .value,
                        ),
                      )
                    }
                    className="mt-2 w-full border border-blue-800 bg-black px-3 py-2 font-mono text-xs text-blue-200 outline-none focus:border-blue-400"
                  >
                    <option value="">
                      Select control
                    </option>

                    {Array.from({
                      length: qubits,
                    }).map(
                      (_, qubit) => (
                        <option
                          key={qubit}
                          value={qubit}
                          disabled={
                            qubit ===
                            operation.qubit
                          }
                        >
                          q[{qubit}]
                        </option>
                      ),
                    )}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <div className="border border-blue-950 bg-blue-950/10 px-3 py-2 font-mono text-xs text-slate-500">
                    Column{" "}
                    {operation.column +
                      1}{" "}
                    · Target q[
                    {operation.qubit}
                    ] · Control q[
                    {operation.controlQubit ??
                      "—"}
                    ]
                  </div>
                </div>
              </div>

              {/* DELETE */}

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() =>
                    removeControlledGate(
                      operation,
                    )
                  }
                  className="border border-red-900/70 px-4 py-2 font-mono text-xs uppercase tracking-wider text-red-300 transition hover:border-red-500 hover:bg-red-950/30"
                >
                  Remove
                </button>
              </div>
            </div>
          ),
        )}
      </div>
    </section>
  );
}