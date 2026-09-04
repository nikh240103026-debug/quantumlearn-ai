"use client";

import {
  useMemo,
  useState,
} from "react";

import type {
  CircuitGate,
  QuantumGate,
} from "@/lib/quantum/types";
import { createGateId } from "@/lib/quantum/circuit";

const GATES: QuantumGate[] = [
  "I",
  "X",
  "Y",
  "Z",
  "H",
  "S",
  "T",
  "CNOT",
  "CZ",
  "SWAP",
  "M",
];

const GATE_DESCRIPTIONS: Record<
  QuantumGate,
  string
> = {
  I: "Identity gate",
  X: "Pauli-X — bit flip",
  Y: "Pauli-Y — bit and phase flip",
  Z: "Pauli-Z — phase flip",
  H: "Hadamard — creates superposition",
  S: "S gate — π/2 phase rotation",
  T: "T gate — π/4 phase rotation",
  CNOT:
    "Controlled-X — control above target",
  CZ:
    "Controlled-Z — control above target",
  SWAP:
    "SWAP — exchanges two qubit states",
  M: "Measurement — measures the qubit state",
};

const TWO_QUBIT_GATES: QuantumGate[] = [
  "CNOT",
  "CZ",
  "SWAP",
];

interface CircuitEditorProps {
  qubits: number;
  columns: number;
  circuit: CircuitGate[];
  selectedGate: QuantumGate;
  onSelectGate: (
    gate: QuantumGate,
  ) => void;
  onCircuitChange: (
    circuit: CircuitGate[],
  ) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

type DragPayload =
  | {
      type: "palette";
      gate: QuantumGate;
    }
  | {
      type: "circuit";
      qubit: number;
      column: number;
    };

function isTwoQubitGate(
  gate: QuantumGate,
) {
  return TWO_QUBIT_GATES.includes(gate);
}

function getTargetOperation(
  circuit: CircuitGate[],
  qubit: number,
  column: number,
) {
  return circuit.find(
    (operation) =>
      operation.qubit === qubit &&
      operation.column === column,
  );
}

function getControlOperation(
  circuit: CircuitGate[],
  qubit: number,
  column: number,
) {
  return circuit.find(
    (operation) =>
      operation.controlQubit === qubit &&
      operation.column === column,
  );
}

function getOperationAtCell(
  circuit: CircuitGate[],
  qubit: number,
  column: number,
) {
  return (
    getTargetOperation(
      circuit,
      qubit,
      column,
    ) ??
    getControlOperation(
      circuit,
      qubit,
      column,
    )
  );
}

function getOccupiedQubits(
  operation: CircuitGate,
): number[] {
  if (
    isTwoQubitGate(
      operation.gate,
    ) &&
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

function removeOperation(
  circuit: CircuitGate[],
  operation: CircuitGate,
) {
  return circuit.filter(
    (current) =>
      current !== operation,
  );
}

function isCellOccupied(
  circuit: CircuitGate[],
  qubit: number,
  column: number,
  ignoredOperation?: CircuitGate,
) {
  return circuit.some(
    (operation) => {
      if (
        operation ===
        ignoredOperation
      ) {
        return false;
      }

      if (
        operation.column !==
        column
      ) {
        return false;
      }

      return getOccupiedQubits(
        operation,
      ).includes(qubit);
    },
  );
}

function validatePlacement(
  circuit: CircuitGate[],
  gate: QuantumGate,
  targetQubit: number,
  column: number,
  qubits: number,
  ignoredOperation?: CircuitGate,
) {
  if (
    targetQubit < 0 ||
    targetQubit >= qubits
  ) {
    return false;
  }

  if (
    isTwoQubitGate(gate)
  ) {
    /*
     * The visual editor uses the qubit
     * directly above the target as the
     * control.
     */

    if (targetQubit <= 0) {
      return false;
    }

    const controlQubit =
      targetQubit - 1;

    if (
      isCellOccupied(
        circuit,
        targetQubit,
        column,
        ignoredOperation,
      )
    ) {
      return false;
    }

    if (
      isCellOccupied(
        circuit,
        controlQubit,
        column,
        ignoredOperation,
      )
    ) {
      return false;
    }

    return true;
  }

  return !isCellOccupied(
    circuit,
    targetQubit,
    column,
    ignoredOperation,
  );
}

export default function CircuitEditor({
  qubits,
  columns,
  circuit,
  selectedGate,
  onSelectGate,
  onCircuitChange,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}: CircuitEditorProps) {
  const [dragOverCell, setDragOverCell] =
    useState<{
      qubit: number;
      column: number;
    } | null>(null);

  const [status, setStatus] =
    useState(
      "Drag a gate onto the circuit or click an empty cell.",
    );

  const [selectedOperation, setSelectedOperation] =
    useState<{
      qubit: number;
      column: number;
    } | null>(null);

  const gridColumns = useMemo(
    () =>
      `80px repeat(${columns}, 72px)`,
    [columns],
  );

  function setEditorStatus(
    message: string,
  ) {
    setStatus(message);
  }

  function createOperation(
    gate: QuantumGate,
    qubit: number,
    column: number,
  ) {
    if (
      !validatePlacement(
        circuit,
        gate,
        qubit,
        column,
        qubits,
      )
    ) {
      setEditorStatus(
        isTwoQubitGate(gate)
          ? "Invalid placement. Controlled gates require an empty target and the qubit directly above it."
          : "This circuit cell is already occupied.",
      );

      return;
    }

    const operation: CircuitGate =
      isTwoQubitGate(gate)
        ? {
            id: createGateId(),
            gate,
            qubit,
            column,
            controlQubit:
              qubit - 1,
          }
        : {
          id: createGateId(),
            gate,
            qubit,
            column,
          };

    onCircuitChange([
      ...circuit,
      operation,
    ]);

    setSelectedOperation({
      qubit,
      column,
    });

    setEditorStatus(
      `${gate} gate placed at q[${qubit}], column ${column + 1}.`,
    );
  }

  function handleCellClick(
    qubit: number,
    column: number,
  ) {
    const operation =
      getOperationAtCell(
        circuit,
        qubit,
        column,
      );

    /*
     * Existing gate:
     * select it instead of immediately
     * deleting it.
     */

    if (operation) {
      setSelectedOperation({
        qubit:
          operation.qubit,
        column:
          operation.column,
      });

      setEditorStatus(
        `${operation.gate} selected. Drag it to move or press Delete to remove it.`,
      );

      return;
    }

    createOperation(
      selectedGate,
      qubit,
      column,
    );
  }

  function deleteSelectedOperation() {
    if (!selectedOperation) {
      return;
    }

    const operation =
      getOperationAtCell(
        circuit,
        selectedOperation.qubit,
        selectedOperation.column,
      );

    if (!operation) {
      setSelectedOperation(null);
      return;
    }

    onCircuitChange(
      removeOperation(
        circuit,
        operation,
      ),
    );

    setSelectedOperation(null);

    setEditorStatus(
      `${operation.gate} gate removed.`,
    );
  }

  function handleDragStart(
    event: React.DragEvent,
    payload: DragPayload,
  ) {
    event.dataTransfer.effectAllowed =
      "move";

    event.dataTransfer.setData(
      "application/json",
      JSON.stringify(payload),
    );
  }

  function handleDragOver(
    event: React.DragEvent,
    qubit: number,
    column: number,
  ) {
    event.preventDefault();

    event.dataTransfer.dropEffect =
      "move";

    setDragOverCell({
      qubit,
      column,
    });
  }

  function handleDragLeave() {
    setDragOverCell(null);
  }

  function handleDrop(
    event: React.DragEvent,
    targetQubit: number,
    targetColumn: number,
  ) {
    event.preventDefault();

    setDragOverCell(null);

    const raw =
      event.dataTransfer.getData(
        "application/json",
      );

    if (!raw) {
      return;
    }

    let payload:
      | DragPayload
      | undefined;

    try {
      payload = JSON.parse(
        raw,
      ) as DragPayload;
    } catch {
      return;
    }

    if (!payload) {
      return;
    }

    /*
     * Palette → circuit
     */

    if (
      payload.type ===
      "palette"
    ) {
      createOperation(
        payload.gate,
        targetQubit,
        targetColumn,
      );

      return;
    }

    /*
     * Circuit → circuit
     */

    const sourceOperation =
      getOperationAtCell(
        circuit,
        payload.qubit,
        payload.column,
      );

    if (!sourceOperation) {
      return;
    }

    /*
     * Dropping a gate on itself.
     */

    if (
      sourceOperation.qubit ===
        targetQubit &&
      sourceOperation.column ===
        targetColumn
    ) {
      return;
    }

    /*
     * Remove source before validating
     * the destination.
     */

    const circuitWithoutSource =
      removeOperation(
        circuit,
        sourceOperation,
      );

    if (
      !validatePlacement(
        circuitWithoutSource,
        sourceOperation.gate,
        targetQubit,
        targetColumn,
        qubits,
      )
    ) {
      setEditorStatus(
        "Invalid move. The destination cells are occupied or the controlled gate would leave the circuit.",
      );

      return;
    }

    const movedOperation: CircuitGate =
      isTwoQubitGate(
        sourceOperation.gate,
      )
        ? {
            ...sourceOperation,
            qubit:
              targetQubit,
            column:
              targetColumn,
            controlQubit:
              targetQubit - 1,
          }
        : {
            ...sourceOperation,
            qubit:
              targetQubit,
            column:
              targetColumn,
            controlQubit:
              undefined,
          };

    onCircuitChange([
      ...circuitWithoutSource,
      movedOperation,
    ]);

    setSelectedOperation({
      qubit:
        targetQubit,
      column:
        targetColumn,
    });

    setEditorStatus(
      `${sourceOperation.gate} moved to q[${targetQubit}], column ${targetColumn + 1}.`,
    );
  }

  function renderGateSymbol(
    operation: CircuitGate,
    cellQubit: number,
  ) {
    const isTarget =
      operation.qubit ===
      cellQubit;

    if (
      isTarget &&
      operation.gate ===
        "CNOT"
    ) {
      return (
        <span className="flex h-9 w-9 items-center justify-center border-2 border-blue-400 text-xl text-blue-300">
          +
        </span>
      );
    }

    if (
      isTarget &&
      operation.gate ===
        "CZ"
    ) {
      return (
        <span className="flex h-9 w-9 items-center justify-center border border-blue-400 bg-blue-500/20 text-xs font-bold text-blue-200">
          Z
        </span>
      );
    }

    if (
      isTarget &&
      operation.gate ===
        "SWAP"
    ) {
      return (
        <span className="text-2xl font-light text-blue-300">
          ×
        </span>
      );
    }

    if (
      operation.controlQubit ===
      cellQubit
    ) {
      return (
        <span className="h-4 w-4 bg-blue-400" />
      );
    }

    if (isTarget) {
      return (
        <span>
          {operation.gate}
        </span>
      );
    }

    return null;
  }

  return (
    <section className="border border-blue-900/70 bg-black">
      {/* HEADER */}

      <div className="border-b border-blue-900/70 px-5 py-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-blue-400">
              Quantum Circuit Editor
            </div>

            <h2 className="mt-2 text-xl font-semibold text-white">
              Visual Circuit Construction
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              Drag gates from the gate
              library onto the circuit.
              Move existing gates between
              valid circuit positions.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onUndo}
              disabled={
                !canUndo
              }
              className="border border-blue-900 bg-black px-4 py-2 font-mono text-xs uppercase tracking-wider text-blue-300 transition hover:border-blue-500 hover:bg-blue-950/40 disabled:cursor-not-allowed disabled:opacity-30"
            >
              Undo
            </button>

            <button
              type="button"
              onClick={onRedo}
              disabled={
                !canRedo
              }
              className="border border-blue-900 bg-black px-4 py-2 font-mono text-xs uppercase tracking-wider text-blue-300 transition hover:border-blue-500 hover:bg-blue-950/40 disabled:cursor-not-allowed disabled:opacity-30"
            >
              Redo
            </button>

            <button
              type="button"
              onClick={
                deleteSelectedOperation
              }
              disabled={
                !selectedOperation
              }
              className="border border-red-900/70 bg-black px-4 py-2 font-mono text-xs uppercase tracking-wider text-red-300 transition hover:border-red-500 hover:bg-red-950/30 disabled:cursor-not-allowed disabled:opacity-30"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="mt-5 border border-blue-950 bg-blue-950/20 px-4 py-3 font-mono text-xs text-blue-300">
          {status}
        </div>
      </div>

      {/* GATE LIBRARY */}

      <div className="border-b border-blue-900/70 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
              Gate Library
            </div>

            <div className="mt-1 text-sm font-semibold text-white">
              Available Operations
            </div>
          </div>

          <div className="font-mono text-xs text-slate-500">
            Drag → Drop
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 lg:grid-cols-10">
          {GATES.map(
            (gate) => {
              const active =
                selectedGate ===
                gate;

              return (
                <button
                  key={gate}
                  type="button"
                  draggable
                  onDragStart={(
                    event,
                  ) =>
                    handleDragStart(
                      event,
                      {
                        type:
                          "palette",
                        gate,
                      },
                    )
                  }
                  onClick={() =>
                    onSelectGate(
                      gate,
                    )
                  }
                  title={
                    GATE_DESCRIPTIONS[
                      gate
                    ]
                  }
                  className={`flex h-12 items-center justify-center border font-mono text-sm font-bold transition ${
                    active
                      ? "border-blue-400 bg-blue-500/20 text-blue-200"
                      : "border-blue-950 bg-black text-slate-300 hover:border-blue-600 hover:text-blue-200"
                  }`}
                >
                  {gate}
                </button>
              );
            },
          )}
        </div>

        <div className="mt-4 font-mono text-xs text-slate-500">
          Selected gate:
          <span className="ml-2 text-blue-300">
            {selectedGate}
          </span>
        </div>
      </div>

      {/* CIRCUIT CANVAS */}

      <div className="overflow-x-auto p-5">
        <div
          className="min-w-max"
          onKeyDown={(event) => {
            if (
              event.key ===
                "Delete" ||
              event.key ===
                "Backspace"
            ) {
              event.preventDefault();

              deleteSelectedOperation();
            }
          }}
          tabIndex={0}
        >
          {/* COLUMN HEADER */}

          <div
            className="grid"
            style={{
              gridTemplateColumns:
                gridColumns,
            }}
          >
            <div className="border-b border-blue-950 px-3 py-3 font-mono text-[10px] uppercase tracking-wider text-slate-600">
              Qubit
            </div>

            {Array.from({
              length: columns,
            }).map(
              (_, column) => (
                <div
                  key={column}
                  className="border-b border-l border-blue-950 px-2 py-3 text-center font-mono text-[10px] text-slate-600"
                >
                  {String(
                    column + 1,
                  ).padStart(
                    2,
                    "0",
                  )}
                </div>
              ),
            )}
          </div>

          {/* QUBIT ROWS */}

          {Array.from({
            length: qubits,
          }).map(
            (_, qubit) => (
              <div
                key={qubit}
                className="relative grid"
                style={{
                  gridTemplateColumns:
                    gridColumns,
                }}
              >
                {/* QUBIT LABEL */}

                <div className="relative z-20 flex h-16 items-center border-b border-blue-950 bg-black px-3 font-mono text-xs font-semibold text-blue-300">
                  q[{qubit}]
                </div>

                {/* CELLS */}

                {Array.from({
                  length: columns,
                }).map(
                  (_, column) => {
                    const operation =
                      getTargetOperation(
                        circuit,
                        qubit,
                        column,
                      );

                    const controlOperation =
                      getControlOperation(
                        circuit,
                        qubit,
                        column,
                      );

                    const occupiedOperation =
                      operation ??
                      controlOperation;

                    const isTarget =
                      Boolean(
                        operation,
                      );

                    const isControl =
                      Boolean(
                        controlOperation,
                      );

                    const isDragOver =
                      dragOverCell
                        ?.qubit ===
                        qubit &&
                      dragOverCell
                        ?.column ===
                        column;

                    const selected =
                      selectedOperation
                        ?.qubit ===
                          occupiedOperation?.qubit &&
                      selectedOperation
                        ?.column ===
                          occupiedOperation?.column;

                    const controlled =
                      Boolean(
                        occupiedOperation &&
                          isTwoQubitGate(
                            occupiedOperation.gate,
                          ),
                      );

                    return (
                      <div
                        key={column}
                        className="relative h-16 border-b border-l border-blue-950"
                        onDragOver={(
                          event,
                        ) =>
                          handleDragOver(
                            event,
                            qubit,
                            column,
                          )
                        }
                        onDragLeave={
                          handleDragLeave
                        }
                        onDrop={(
                          event,
                        ) =>
                          handleDrop(
                            event,
                            qubit,
                            column,
                          )
                        }
                      >
                        {/* WIRE */}

                        <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-px bg-blue-950" />

                        {/* CONTROLLED VERTICAL LINE */}

                        {controlled && (
                          <div className="pointer-events-none absolute left-1/2 top-0 z-0 h-full w-px -translate-x-1/2 bg-blue-500/50" />
                        )}

                        {/* DROP TARGET */}

                        {isDragOver && (
                          <div className="pointer-events-none absolute inset-1 z-30 border border-blue-400 bg-blue-500/10" />
                        )}

                        {/* CELL */}

                        <button
                          type="button"
                          draggable={
                            Boolean(
                              occupiedOperation,
                            )
                          }
                          onDragStart={(
                            event,
                          ) => {
                            if (
                              !occupiedOperation
                            ) {
                              return;
                            }

                            handleDragStart(
                              event,
                              {
                                type:
                                  "circuit",
                                qubit:
                                  occupiedOperation.qubit,
                                column:
                                  occupiedOperation.column,
                              },
                            );
                          }}
                          onClick={() =>
                            handleCellClick(
                              qubit,
                              column,
                            )
                          }
                          className={`absolute inset-1 z-20 flex items-center justify-center border font-mono text-xs font-bold transition ${
                            selected
                              ? "border-blue-300 bg-blue-500/20 text-blue-200"
                              : occupiedOperation
                                ? "border-blue-700 bg-blue-950/60 text-blue-200"
                                : "border-transparent text-transparent hover:border-blue-900 hover:bg-blue-950/30"
                          }`}
                          title={
                            occupiedOperation
                              ? `${occupiedOperation.gate} — drag to move`
                              : `Place ${selectedGate}`
                          }
                        >
                          {occupiedOperation &&
                            renderGateSymbol(
                              occupiedOperation,
                              qubit,
                            )}
                        </button>
                      </div>
                    );
                  },
                )}
              </div>
            ),
          )}
        </div>
      </div>

      {/* FOOTER INFORMATION */}

      <div className="grid border-t border-blue-900/70 sm:grid-cols-3">
        <div className="border-b border-blue-900/70 p-4 sm:border-b-0 sm:border-r">
          <div className="font-mono text-[10px] uppercase tracking-wider text-slate-600">
            Qubits
          </div>

          <div className="mt-1 font-mono text-lg text-blue-300">
            {qubits}
          </div>
        </div>

        <div className="border-b border-blue-900/70 p-4 sm:border-b-0 sm:border-r">
          <div className="font-mono text-[10px] uppercase tracking-wider text-slate-600">
            Operations
          </div>

          <div className="mt-1 font-mono text-lg text-blue-300">
            {circuit.length}
          </div>
        </div>

        <div className="p-4">
          <div className="font-mono text-[10px] uppercase tracking-wider text-slate-600">
            Interaction
          </div>

          <div className="mt-1 font-mono text-xs text-slate-400">
            Click / Drag / Delete
          </div>
        </div>
      </div>
    </section>
  );
}