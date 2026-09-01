"use client";

import { useMemo, useState } from "react";

import {
  basisLabel,
  calculateProbabilities,
  formatComplex,
  simulateCircuit,
} from "@/lib/quantum/simulator";

import { sampleMeasurement } from "@/lib/quantum/measurement";

import type {
  CircuitGate,
  QuantumGate,
} from "@/lib/quantum/types";

import type {
  QuantumTemplate,
} from "@/lib/quantum/templates";

import MeasurementHistogram from "./MeasurementHistogram";
import BlochSphere from "./BlochSphere";
import QuantumTutor from "./QuantumTutor";
import ExportCircuit from "./ExportCircuit";
import AlgorithmTemplates from "./AlgorithmTemplates";

const GATES: QuantumGate[] = [
  "X",
  "Y",
  "Z",
  "H",
  "S",
  "T",
  "CNOT",
  "CZ",
  "SWAP",
];

const GATE_DESCRIPTIONS: Record<QuantumGate, string> = {
  I: "Identity gate",
  X: "Pauli-X — bit flip",
  Y: "Pauli-Y — bit and phase flip",
  Z: "Pauli-Z — phase flip",
  H: "Hadamard — creates superposition",
  S: "S gate — π/2 phase rotation",
  T: "T gate — π/4 phase rotation",
  CNOT:
    "Controlled-X — flips target when control is |1⟩",
  CZ:
    "Controlled-Z — applies phase flip when both qubits are |1⟩",
  SWAP:
    "SWAP — exchanges two qubit states",
};

const MAX_QUBITS = 5;
const DEFAULT_COLUMNS = 6;

export default function QuantumCircuitSimulator() {
  // ==========================================================
  // CIRCUIT STATE
  // ==========================================================

  const [qubits, setQubits] = useState(2);

  const [columns] = useState(DEFAULT_COLUMNS);

  const [selectedGate, setSelectedGate] =
    useState<QuantumGate>("H");

  const [circuit, setCircuit] =
    useState<CircuitGate[]>([]);

  // ==========================================================
  // HISTORY
  // ==========================================================

  const [history, setHistory] =
    useState<CircuitGate[][]>([[]]);

  const [historyIndex, setHistoryIndex] =
    useState(0);

  // ==========================================================
  // MEASUREMENT
  // ==========================================================

  const [measurementResult, setMeasurementResult] =
    useState<string | null>(null);

  // ==========================================================
  // EXPERIMENT
  // ==========================================================

  const [shots, setShots] = useState(100);

  const [measurementResults, setMeasurementResults] =
    useState<number[]>([]);

  // ==========================================================
  // CIRCUIT STATISTICS
  // ==========================================================

  const circuitDepth =
    circuit.length === 0
      ? 0
      : Math.max(
          ...circuit.map(
            (operation) =>
              operation.column + 1,
          ),
        );

  const gateCount = circuit.length;

  // ==========================================================
  // SIMULATION
  // ==========================================================

  const state = useMemo(() => {
    return simulateCircuit(
      qubits,
      circuit,
    );
  }, [qubits, circuit]);

  // ==========================================================
  // PROBABILITIES
  // ==========================================================

  const probabilities = useMemo(() => {
    return calculateProbabilities(state);
  }, [state]);

  // ==========================================================
  // UPDATE CIRCUIT WITH HISTORY
  // ==========================================================

  function commitCircuit(
    nextCircuit: CircuitGate[],
  ) {
    setCircuit(nextCircuit);

    setHistory((currentHistory) => {
      const trimmedHistory =
        currentHistory.slice(
          0,
          historyIndex + 1,
        );

      return [
        ...trimmedHistory,
        nextCircuit,
      ];
    });

    setHistoryIndex(
      (currentIndex) =>
        currentIndex + 1,
    );

    setMeasurementResult(null);
    setMeasurementResults([]);
  }

  // ==========================================================
  // ADD / REPLACE GATE
  // ==========================================================

  function addGate(
    qubit: number,
    column: number,
  ) {
    const existing = circuit.find(
      (operation) =>
        operation.qubit === qubit &&
        operation.column === column,
    );

    // --------------------------------------------------------
    // SINGLE QUBIT GATES
    // --------------------------------------------------------

    if (
      selectedGate !== "CNOT" &&
      selectedGate !== "CZ" &&
      selectedGate !== "SWAP"
    ) {
      const nextCircuit = existing
        ? circuit.map((operation) =>
            operation.qubit === qubit &&
            operation.column === column
              ? {
                  ...operation,
                  gate: selectedGate,
                  controlQubit: undefined,
                }
              : operation,
          )
        : [
            ...circuit,
            {
              gate: selectedGate,
              qubit,
              column,
            },
          ];

      commitCircuit(nextCircuit);
      return;
    }

    // --------------------------------------------------------
    // CONTROLLED GATES
    // --------------------------------------------------------

    /*
     * The clicked qubit becomes the target.
     *
     * The qubit directly above it becomes
     * the control.
     *
     * Example:
     *
     * q[0] ──●──
     *         │
     * q[1] ──X──
     */

    if (qubit === 0) {
      return;
    }

    const controlQubit = qubit - 1;

    // Prevent invalid duplicate operations
    // on the same target cell.
    const nextCircuit = existing
      ? circuit.map((operation) =>
          operation.qubit === qubit &&
          operation.column === column
            ? {
                ...operation,
                gate: selectedGate,
                controlQubit,
              }
            : operation,
        )
      : [
          ...circuit,
          {
            gate: selectedGate,
            qubit,
            column,
            controlQubit,
          },
        ];

    commitCircuit(nextCircuit);
  }

  // ==========================================================
  // GET OPERATION
  // ==========================================================

  function getOperation(
    qubit: number,
    column: number,
  ) {
    return circuit.find(
      (operation) =>
        operation.qubit === qubit &&
        operation.column === column,
    );
  }

  // ==========================================================
  // GET CONTROL OPERATION
  // ==========================================================

  function getControlledOperation(
    qubit: number,
    column: number,
  ) {
    return circuit.find(
      (operation) =>
        operation.column === column &&
        operation.controlQubit === qubit,
    );
  }

  // ==========================================================
  // CHECK WHETHER QUBIT IS PART OF CONTROLLED GATE
  // ==========================================================

  function isControlledTarget(
    qubit: number,
    column: number,
  ) {
    const operation = getOperation(
      qubit,
      column,
    );

    return (
      operation?.controlQubit !==
        undefined &&
      (
        operation.gate === "CNOT" ||
        operation.gate === "CZ" ||
        operation.gate === "SWAP"
      )
    );
  }

  // ==========================================================
  // REMOVE GATE
  // ==========================================================

  function removeGate(
    qubit: number,
    column: number,
  ) {
    const operation = getOperation(
      qubit,
      column,
    );

    if (!operation) {
      return;
    }

    const nextCircuit = circuit.filter(
      (currentOperation) => {
        // Remove target
        if (
          currentOperation.qubit ===
            qubit &&
          currentOperation.column ===
            column
        ) {
          return false;
        }

        // Remove the same controlled
        // operation automatically.
        if (
          currentOperation.controlQubit ===
            qubit &&
          currentOperation.column ===
            column
        ) {
          return false;
        }

        return true;
      },
    );

    commitCircuit(nextCircuit);
  }

  // ==========================================================
  // REMOVE CONTROLLED GATE FROM CONTROL CELL
  // ==========================================================

  function removeControlledGate(
    qubit: number,
    column: number,
  ) {
    const controlledOperation =
      getControlledOperation(
        qubit,
        column,
      );

    if (!controlledOperation) {
      return;
    }

    const nextCircuit = circuit.filter(
      (operation) =>
        !(
          operation.column === column &&
          (
            operation.qubit ===
              controlledOperation.qubit ||
            operation.controlQubit ===
              controlledOperation.controlQubit
          )
        ),
    );

    commitCircuit(nextCircuit);
  }

  // ==========================================================
  // HANDLE CELL CLICK
  // ==========================================================

  function handleCellClick(
    qubit: number,
    column: number,
  ) {
    const operation = getOperation(
      qubit,
      column,
    );

    const controlledOperation =
      getControlledOperation(
        qubit,
        column,
      );

    if (operation) {
      removeGate(
        qubit,
        column,
      );
      return;
    }

    if (controlledOperation) {
      removeControlledGate(
        qubit,
        column,
      );
      return;
    }

    addGate(
      qubit,
      column,
    );
  }

  // ==========================================================
  // RESET CIRCUIT
  // ==========================================================

  function resetCircuit() {
    const emptyCircuit: CircuitGate[] = [];

    setCircuit(emptyCircuit);

    setHistory([emptyCircuit]);

    setHistoryIndex(0);

    setMeasurementResult(null);

    setMeasurementResults([]);
  }

  // ==========================================================
  // CHANGE QUBITS
  // ==========================================================

  function changeQubits(
    value: number,
  ) {
    const next = Math.max(
      1,
      Math.min(
        MAX_QUBITS,
        value,
      ),
    );

    if (next === qubits) {
      return;
    }

    const nextCircuit =
      circuit.filter(
        (operation) =>
          operation.qubit < next &&
          (
            operation.controlQubit ===
              undefined ||
            operation.controlQubit <
              next
          ),
      );

    setQubits(next);

    setCircuit(nextCircuit);

    setHistory([
      nextCircuit,
    ]);

    setHistoryIndex(0);

    setMeasurementResult(null);

    setMeasurementResults([]);
  }

  // ==========================================================
  // SINGLE MEASUREMENT
  // ==========================================================

  function runMeasurement() {
    const results =
      sampleMeasurement(
        probabilities,
        1,
      );

    if (results.length === 0) {
      return;
    }

    const measuredIndex =
      results[0];

    setMeasurementResult(
      basisLabel(
        measuredIndex,
        qubits,
      ),
    );
  }

  // ==========================================================
  // RUN EXPERIMENT
  // ==========================================================

  function runExperiment() {
    const results =
      sampleMeasurement(
        probabilities,
        shots,
      );

    setMeasurementResults(
      results,
    );

    setMeasurementResult(null);
  }

  // ==========================================================
  // UNDO
  // ==========================================================

  function undo() {
    if (historyIndex <= 0) {
      return;
    }

    const nextIndex =
      historyIndex - 1;

    const previousCircuit =
      history[nextIndex];

    setHistoryIndex(
      nextIndex,
    );

    setCircuit(
      previousCircuit,
    );

    setMeasurementResult(null);

    setMeasurementResults([]);
  }

  // ==========================================================
  // REDO
  // ==========================================================

  function redo() {
    if (
      historyIndex >=
      history.length - 1
    ) {
      return;
    }

    const nextIndex =
      historyIndex + 1;

    const nextCircuit =
      history[nextIndex];

    setHistoryIndex(
      nextIndex,
    );

    setCircuit(
      nextCircuit,
    );

    setMeasurementResult(null);

    setMeasurementResults([]);
  }

  // ==========================================================
  // LOAD ALGORITHM TEMPLATE
  // ==========================================================

  function loadTemplate(
    template: QuantumTemplate,
  ) {
    setQubits(
      template.qubits,
    );

    setCircuit(
      template.circuit,
    );

    setHistory([
      template.circuit,
    ]);

    setHistoryIndex(0);

    setMeasurementResult(null);

    setMeasurementResults([]);
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="space-y-6">

      {/* ======================================================
          CONTROLS
      ====================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Quantum Circuit Simulator
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-950">
              Build your quantum circuit
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Place quantum gates on qubits
              and observe the resulting
              quantum state.
            </p>

          </div>

          <button
            type="button"
            onClick={resetCircuit}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Reset Circuit
          </button>

        </div>

        {/* Qubit Controls */}

        <div className="mt-6 flex flex-wrap items-center gap-3">

          <span className="text-sm font-medium text-slate-700">
            Qubits
          </span>

          <button
            type="button"
            onClick={() =>
              changeQubits(
                qubits - 1,
              )
            }
            disabled={
              qubits <= 1
            }
            className="h-9 w-9 rounded-lg border border-slate-300 disabled:opacity-40"
          >
            −
          </button>

          <span className="min-w-8 text-center font-semibold">
            {qubits}
          </span>

          <button
            type="button"
            onClick={() =>
              changeQubits(
                qubits + 1,
              )
            }
            disabled={
              qubits >=
              MAX_QUBITS
            }
            className="h-9 w-9 rounded-lg border border-slate-300 disabled:opacity-40"
          >
            +
          </button>

        </div>

      </section>

      {/* ======================================================
          CIRCUIT STATISTICS
      ====================================================== */}

      <div className="grid gap-4 sm:grid-cols-3">

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

          <p className="text-xs text-slate-500">
            Qubits
          </p>

          <p className="mt-1 text-2xl font-bold">
            {qubits}
          </p>

        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

          <p className="text-xs text-slate-500">
            Gates
          </p>

          <p className="mt-1 text-2xl font-bold">
            {gateCount}
          </p>

        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

          <p className="text-xs text-slate-500">
            Circuit Depth
          </p>

          <p className="mt-1 text-2xl font-bold">
            {circuitDepth}
          </p>

        </div>

      </div>

      {/* ======================================================
          GATE PALETTE
      ====================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="mb-4">

          <h2 className="font-bold text-slate-950">
            Quantum Gates
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Select a gate, then click a
            circuit cell.
          </p>

        </div>

        <div className="flex flex-wrap gap-3">

          {GATES.map(
            (gate) => (
              <button
                key={gate}
                type="button"
                onClick={() =>
                  setSelectedGate(
                    gate,
                  )
                }
                className={`flex h-12 min-w-12 items-center justify-center rounded-xl border px-3 text-lg font-bold transition ${
                  selectedGate ===
                  gate
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-300 bg-white text-slate-900 hover:border-blue-400"
                }`}
                title={
                  GATE_DESCRIPTIONS[
                    gate
                  ]
                }
              >
                {gate}
              </button>
            ),
          )}

        </div>

        <p className="mt-4 text-sm text-blue-600">

          Selected:{" "}

          <span className="font-semibold">
            {selectedGate}
          </span>

          {" — "}

          {
            GATE_DESCRIPTIONS[
              selectedGate
            ]
          }

        </p>

      </section>

      {/* ======================================================
          ALGORITHM TEMPLATES
      ====================================================== */}

      <AlgorithmTemplates
        onLoadTemplate={
          loadTemplate
        }
      />

      {/* ======================================================
          CIRCUIT
      ====================================================== */}

      <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <h2 className="font-bold text-slate-950">
              Circuit
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Click a cell to place the
              selected gate. Click an
              existing gate to remove it.
            </p>

          </div>

          <div className="flex gap-2">

            <button
              type="button"
              onClick={undo}
              disabled={
                historyIndex <= 0
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
            >
              Undo
            </button>

            <button
              type="button"
              onClick={redo}
              disabled={
                historyIndex >=
                history.length - 1
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
            >
              Redo
            </button>

          </div>

        </div>

        <div className="min-w-[700px]">

          {/* Column numbers */}

          <div className="mb-2 flex items-center">

            <div className="w-20 shrink-0" />

            <div className="flex">

              {Array.from({
                length: columns,
              }).map(
                (_, column) => (
                  <div
                    key={column}
                    className="mx-2 flex h-6 w-14 items-center justify-center text-xs font-semibold text-slate-400"
                  >
                    {column + 1}
                  </div>
                ),
              )}

            </div>

          </div>

          {/* Qubit rows */}

          {Array.from({
            length: qubits,
          }).map(
            (_, qubit) => (

              <div
                key={qubit}
                className="flex items-center"
              >

                {/* Qubit label */}

                <div className="w-20 shrink-0 font-mono text-sm font-semibold text-slate-600">
                  q[{qubit}]
                </div>

                {/* Circuit row */}

                <div className="relative flex flex-1 items-center">

                  {/* Horizontal wire */}

                  <div className="absolute left-0 right-0 h-px bg-slate-300" />

                  {Array.from({
                    length: columns,
                  }).map(
                    (_, column) => {

                      const operation =
                        getOperation(
                          qubit,
                          column,
                        );

                      const controlledOperation =
                        getControlledOperation(
                          qubit,
                          column,
                        );

                      const isTarget =
                        isControlledTarget(
                          qubit,
                          column,
                        );

                      const isControl =
                        Boolean(
                          controlledOperation,
                        );

                      const isControlled =
                        isTarget ||
                        isControl;

                      return (
                        <div
                          key={column}
                          className="relative z-10 mx-2 h-14 w-14 shrink-0"
                        >

                          {/* Vertical connection */}

                          {isControlled && (
                            <div className="pointer-events-none absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-blue-300" />
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              handleCellClick(
                                qubit,
                                column,
                              )
                            }
                            title={
                              operation
                                ? `${operation.gate} gate — click to remove`
                                : controlledOperation
                                  ? `${controlledOperation.gate} control — click to remove`
                                  : `Place ${selectedGate} gate`
                            }
                            className={`relative flex h-14 w-14 items-center justify-center rounded-lg border text-sm font-bold transition ${
                              isControlled
                                ? "border-blue-400 bg-blue-50 text-blue-700"
                                : operation
                                  ? "border-blue-500 bg-blue-50 text-blue-700"
                                  : "border-slate-300 bg-white text-slate-400 hover:border-blue-500 hover:bg-blue-50"
                            }`}
                          >

                            {/* Control */}

                            {isControl && (
                              <span className="relative z-10 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                                ●
                              </span>
                            )}

                            {/* Target */}

                            {isTarget &&
                              operation?.gate ===
                                "CNOT" && (
                                <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-blue-600 text-lg text-blue-600">
                                  ⊕
                                </span>
                              )}

                            {isTarget &&
                              operation?.gate ===
                                "CZ" && (
                                <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm text-white">
                                  Z
                                </span>
                              )}

                            {isTarget &&
                              operation?.gate ===
                                "SWAP" && (
                                <span className="relative z-10 text-2xl font-normal text-blue-600">
                                  ×
                                </span>
                              )}

                            {/* Normal gate */}

                            {!isControlled &&
                              operation && (
                                <span>
                                  {
                                    operation.gate
                                  }
                                </span>
                              )}

                          </button>

                        </div>
                      );
                    },
                  )}

                </div>

              </div>
            ),
          )}

        </div>

        {/* Circuit legend */}

        <div className="mt-5 flex flex-wrap gap-5 border-t border-slate-100 pt-4 text-xs text-slate-500">

          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
              ●
            </span>
            Control
          </div>

          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-blue-600 text-blue-600">
              ⊕
            </span>
            CNOT target
          </div>

          <div className="flex items-center gap-2">
            <span className="h-0.5 w-5 bg-blue-300" />
            Controlled connection
          </div>

        </div>

      </section>

      {/* ======================================================
          STATE VECTOR
      ====================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="mb-5">

          <h2 className="font-bold text-slate-950">
            Quantum State
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Current state vector after
            applying the circuit.
          </p>

        </div>

        <div className="space-y-3">

          {state.map(
            (
              amplitude,
              index,
            ) => {

              const probability =
                probabilities[
                  index
                ];

              if (
                probability <
                0.000001
              ) {
                return null;
              }

              return (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >

                  <div className="flex items-center justify-between">

                    <span className="font-mono font-semibold">
                      |
                      {
                        basisLabel(
                          index,
                          qubits,
                        )
                      }
                      ⟩
                    </span>

                    <span className="font-mono text-sm">
                      {
                        formatComplex(
                          amplitude,
                        )
                      }
                    </span>

                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">

                    <div
                      className="h-full rounded-full bg-blue-600 transition-all"
                      style={{
                        width: `${Math.min(
                          probability *
                            100,
                          100,
                        )}%`,
                      }}
                    />

                  </div>

                  <p className="mt-2 text-xs text-slate-500">
                    Probability:{" "}
                    {(
                      probability *
                      100
                    ).toFixed(2)}
                    %
                  </p>

                </div>
              );
            },
          )}

        </div>

      </section>

      {/* ======================================================
          BLOCH SPHERE
      ====================================================== */}

      <BlochSphere
        state={state}
        qubits={qubits}
      />

      {/* ======================================================
          MEASUREMENT
      ====================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <h2 className="font-bold text-slate-950">
              Measurement
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Measure the current quantum
              state and observe the
              resulting basis state.
            </p>

          </div>

          <button
            type="button"
            onClick={runMeasurement}
            className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Run Measurement
          </button>

        </div>

        {measurementResult !==
          null && (

          <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-5">

            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Measurement Result
            </p>

            <div className="mt-2 flex items-center justify-between">

              <span className="font-mono text-2xl font-bold text-slate-950">
                |
                {
                  measurementResult
                }
                ⟩
              </span>

              <span className="text-sm font-medium text-slate-500">
                Measured state
              </span>

            </div>

          </div>
        )}

      </section>

      {/* ======================================================
          EXPERIMENT
      ====================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <h2 className="font-bold text-slate-950">
              Experiment
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Run the circuit repeatedly
              and observe measurement
              outcomes.
            </p>

          </div>

          <div className="flex items-center gap-3">

            <label
              htmlFor="shots"
              className="text-sm font-medium text-slate-700"
            >
              Shots
            </label>

            <select
              id="shots"
              value={shots}
              onChange={(event) =>
                setShots(
                  Number(
                    event.target.value,
                  ),
                )
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >

              <option value={10}>
                10
              </option>

              <option value={100}>
                100
              </option>

              <option value={500}>
                500
              </option>

              <option value={1000}>
                1000
              </option>

            </select>

            <button
              type="button"
              onClick={
                runExperiment
              }
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Run
            </button>

          </div>

        </div>

        {/* Export */}

        <ExportCircuit
          qubits={qubits}
          circuit={circuit}
        />

        {/* AI Tutor */}

        <QuantumTutor
          qubits={qubits}
          circuit={circuit}
          state={state}
          probabilities={
            probabilities
          }
        />

        {/* Histogram */}

        {measurementResults.length >
          0 && (

          <div className="mt-6">

            <MeasurementHistogram
              results={
                measurementResults
              }
              qubits={qubits}
            />

          </div>
        )}

      </section>

    </div>
  );
}