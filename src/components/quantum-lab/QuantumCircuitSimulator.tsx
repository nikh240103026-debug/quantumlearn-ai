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
import CircuitEditor from "./CircuitEditor";
import ControlledGateEditor from "./ControlledGateEditor";
import MeasurementPanel from "./MeasurementPanel";
import CodeGenerator from "./CodeGenerator";
import CircuitStorage from "./CircuitStorage";

import {
  validateCircuit,
} from "@/lib/quantum/validation";

import {
  createGateId,
} from "@/lib/quantum/circuit";

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
  M:
    "Measurement — measures the qubit state",
};

const MAX_QUBITS = 5;
const DEFAULT_COLUMNS = 6;

type LabActivityType =
  | "circuit_run"
  | "measurement"
  | "circuit_reset"
  | "template_loaded";

type ActivityPayload = {
  activityType: LabActivityType;
  qubits?: number;
  gateCount?: number;
  circuitDepth?: number;
  shots?: number;
  measurementResult?: string | null;
  gates?: unknown[];
  circuit?: unknown[];
  sourcePage?: string;
  metadata?: Record<string, unknown>;
};

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

  const validation = useMemo(
    () =>
      validateCircuit(
        qubits,
        columns,
        circuit,
      ),
    [
      qubits,
      columns,
      circuit,
    ],
  );

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
  // ACTIVITY TRACKING
  // ==========================================================

  async function logLabActivity(
    payload: ActivityPayload,
  ) {
    try {
      await fetch(
        "/api/quantum-lab/activity",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            ...payload,
            sourcePage:
              payload.sourcePage ??
              "/quantum-lab",
          }),
          keepalive: true,
        },
      );
    } catch {
      // Analytics must never interrupt
      // the simulator experience.
    }
  }

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
              id: createGateId(),
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

    if (qubit === 0) {
      return;
    }

    const controlQubit = qubit - 1;

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
            id: createGateId(),
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
        if (
          currentOperation.qubit ===
            qubit &&
          currentOperation.column ===
            column
        ) {
          return false;
        }

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

    void logLabActivity({
      activityType:
        "circuit_reset",
      qubits,
      gateCount,
      circuitDepth,
      gates: circuit,
      circuit,
      metadata: {
        previousGateCount:
          gateCount,
        previousCircuitDepth:
          circuitDepth,
      },
    });
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
            operation.controlQubit < next
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

    const resultLabel =
      basisLabel(
        measuredIndex,
        qubits,
      );

    setMeasurementResult(
      resultLabel,
    );

    void logLabActivity({
      activityType:
        "measurement",
      qubits,
      gateCount,
      circuitDepth,
      shots: 1,
      measurementResult:
        resultLabel,
      gates: circuit,
      circuit,
      metadata: {
        measurementCount: 1,
        measuredIndex,
      },
    });
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

    void logLabActivity({
      activityType:
        "circuit_run",
      qubits,
      gateCount,
      circuitDepth,
      shots,
      gates: circuit,
      circuit,
      metadata: {
        experimentType:
          "multi_shot_measurement",
        resultCount:
          results.length,
        uniqueOutcomes:
          new Set(results).size,
      },
    });
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

    void logLabActivity({
      activityType:
        "template_loaded",
      qubits:
        template.qubits,
      gateCount:
        template.circuit.length,
      circuitDepth:
        template.circuit.length === 0
          ? 0
          : Math.max(
              ...template.circuit.map(
                (operation) =>
                  operation.column + 1,
              ),
            ),
      gates:
        template.circuit,
      circuit:
        template.circuit,
      metadata: {
        template: template,
      },
    });
  }

  // ==========================================================
  // VISUAL CIRCUIT EDITOR
  // ==========================================================

  function handleEditorCircuitChange(
    nextCircuit: CircuitGate[],
  ) {
    commitCircuit(
      nextCircuit,
    );
  }

  function handleLoadCircuit(
    loadedQubits: number,
    loadedCircuit: CircuitGate[],
  ) {
    const safeQubits =
      Math.max(
        1,
        Math.min(
          MAX_QUBITS,
          loadedQubits,
        ),
      );

    const cleanedCircuit =
      loadedCircuit.filter(
        (operation) =>
          operation.qubit >= 0 &&
          operation.qubit <
            safeQubits &&
          operation.column >= 0 &&
          operation.column <
            columns &&
          (
            operation.controlQubit ===
              undefined ||
            (
              operation.controlQubit >=
                0 &&
              operation.controlQubit <
                safeQubits
            )
          ),
      );

    setQubits(
      safeQubits,
    );

    setCircuit(
      cleanedCircuit,
    );

    setHistory([
      cleanedCircuit,
    ]);

    setHistoryIndex(0);

    setMeasurementResult(
      null,
    );

    setMeasurementResults(
      [],
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen w-full space-y-6 bg-[#05070b] p-4 text-white md:p-6">

      {/* ======================================================
          CONTROLS
      ====================================================== */}

      <section className="border border-slate-800 bg-[#0a0f18] p-6 shadow-sm">

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <p className="text-xs font-semibold uppercase tracking-wider text-blue-500">
              Quantum Circuit Simulator
            </p>

            <h1 className="mt-1 text-2xl font-bold text-white">
              Build your quantum circuit
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Place quantum gates on qubits
              and observe the resulting
              quantum state.
            </p>

          </div>

          <button
            type="button"
            onClick={resetCircuit}
            className="border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-blue-500 hover:bg-blue-500/10 hover:text-white"
          >
            Reset Circuit
          </button>

        </div>

        {/* Qubit Controls */}

        <div className="mt-6 flex flex-wrap items-center gap-3">

          <span className="text-sm font-medium text-slate-300">
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
            className="h-9 w-9 border border-slate-700 text-slate-300 transition hover:border-blue-500 hover:text-white disabled:opacity-40"
          >
            −
          </button>

          <span className="min-w-8 text-center font-semibold text-white">
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
            className="h-9 w-9 border border-slate-700 text-slate-300 transition hover:border-blue-500 hover:text-white disabled:opacity-40"
          >
            +
          </button>

        </div>

      </section>

      {/* ======================================================
          CIRCUIT STATISTICS
      ====================================================== */}

      <div className="grid gap-4 sm:grid-cols-3">

        <div className="border border-slate-800 bg-[#0a0f18] p-4">

          <p className="text-xs text-slate-500">
            Qubits
          </p>

          <p className="mt-1 text-2xl font-bold text-white">
            {qubits}
          </p>

        </div>

        <div className="border border-slate-800 bg-[#0a0f18] p-4">

          <p className="text-xs text-slate-500">
            Gates
          </p>

          <p className="mt-1 text-2xl font-bold text-white">
            {gateCount}
          </p>

        </div>

        <div className="border border-slate-800 bg-[#0a0f18] p-4">

          <p className="text-xs text-slate-500">
            Circuit Depth
          </p>

          <p className="mt-1 text-2xl font-bold text-white">
            {circuitDepth}
          </p>

        </div>

      </div>

      {/* ======================================================
          VISUAL CIRCUIT EDITOR
      ====================================================== */}

      <CircuitEditor
        qubits={qubits}
        columns={columns}
        circuit={circuit}
        selectedGate={selectedGate}
        onSelectGate={
          setSelectedGate
        }
        onCircuitChange={
          handleEditorCircuitChange
        }
        onUndo={undo}
        onRedo={redo}
        canUndo={
          historyIndex > 0
        }
        canRedo={
          historyIndex <
          history.length - 1
        }
      />

      {/* ======================================================
          CONTROLLED GATE CONFIGURATION
      ====================================================== */}

      <ControlledGateEditor
        qubits={qubits}
        columns={columns}
        circuit={circuit}
        onCircuitChange={
          handleEditorCircuitChange
        }
      />

      {/* ======================================================
          CIRCUIT VALIDATION
      ====================================================== */}

      <section className="border border-slate-800 bg-black p-6">

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <p className="text-xs font-semibold uppercase tracking-wider text-blue-500">
              Circuit Validation
            </p>

            <h2 className="mt-1 text-lg font-bold text-white">
              Circuit integrity
            </h2>

          </div>

          <div
            className={`border px-3 py-2 text-xs font-bold ${
              validation.valid
                ? "border-green-800 text-green-400"
                : "border-red-800 text-red-400"
            }`}
          >
            {validation.valid
              ? "VALID CIRCUIT"
              : "INVALID CIRCUIT"}
          </div>

        </div>

        {validation.errors.length >
          0 && (
          <div className="mt-5 space-y-2">

            {validation.errors.map(
              (
                issue,
                index,
              ) => (
                <div
                  key={`error-${index}`}
                  className="border border-red-900 bg-red-950/30 p-3 text-sm text-red-300"
                >
                  {issue.message}
                </div>
              ),
            )}

          </div>
        )}

        {validation.warnings.length >
          0 && (
          <div className="mt-5 space-y-2">

            {validation.warnings.map(
              (
                issue,
                index,
              ) => (
                <div
                  key={`warning-${index}`}
                  className="border border-yellow-900 bg-yellow-950/20 p-3 text-sm text-yellow-300"
                >
                  {issue.message}
                </div>
              ),
            )}

          </div>
        )}

        {validation.valid &&
          validation.warnings.length ===
            0 && (
            <p className="mt-5 text-sm text-green-400">
              All circuit operations are structurally valid.
            </p>
          )}

      </section>

      {/* ======================================================
          STATE VECTOR
      ====================================================== */}

      <section className="border border-slate-800 bg-[#0a0f18] p-6 shadow-sm">

        <div className="mb-5">

          <h2 className="font-bold text-white">
            Quantum State
          </h2>

          <p className="mt-1 text-sm text-slate-400">
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
                  className="border border-slate-800 bg-[#070b12] p-4"
                >

                  <div className="flex items-center justify-between">

                    <span className="font-mono font-semibold text-slate-200">
                      |
                      {
                        basisLabel(
                          index,
                          qubits,
                        )
                      }
                      ⟩
                    </span>

                    <span className="font-mono text-sm text-slate-300">
                      {
                        formatComplex(
                          amplitude,
                        )
                      }
                    </span>

                  </div>

                  <div className="mt-3 h-2 overflow-hidden bg-slate-800">

                    <div
                      className="h-full bg-blue-600 transition-all"
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

      <MeasurementPanel
        result={
          measurementResult
        }
        onMeasure={
          runMeasurement
        }
      />

      {/* ======================================================
          CODE GENERATION
      ====================================================== */}

      <CodeGenerator
        qubits={qubits}
        circuit={circuit}
      />

      {/* ======================================================
          CIRCUIT STORAGE
      ====================================================== */}

      <CircuitStorage
        qubits={qubits}
        circuit={circuit}
        onLoad={
          handleLoadCircuit
        }
      />

      {/* ======================================================
          EXPERIMENT
      ====================================================== */}

      <section className="border border-slate-800 bg-[#0a0f18] p-6 shadow-sm">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <h2 className="font-bold text-white">
              Experiment
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Run the circuit repeatedly
              and observe measurement
              outcomes.
            </p>

          </div>

          <div className="flex items-center gap-3">

            <label
              htmlFor="shots"
              className="text-sm font-medium text-slate-300"
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
              className="border border-slate-700 bg-[#070b12] px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
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
              className="bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
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