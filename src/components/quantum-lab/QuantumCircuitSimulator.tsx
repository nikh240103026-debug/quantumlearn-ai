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
import CircuitEditor from "./CircuitEditor";
import ControlledGateEditor from "./ControlledGateEditor";
import MeasurementPanel from "./MeasurementPanel";
import CodeGenerator from "./CodeGenerator";
import CircuitStorage from "./CircuitStorage";
import BackendSelector from "./BackendSelector";
import MultiBackendResult from "./MultiBackendResult";

import type {
  QuantumBackend,
  BackendExecutionResult,
} from "@/lib/quantum/backends/types";

import {
  validateCircuit,
} from "@/lib/quantum/validation";

import {
  createGateId,
} from "@/lib/quantum/circuit";

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
  // MULTI-BACKEND
  // ==========================================================

  const [backend, setBackend] =
    useState<QuantumBackend>("local");

  const [backendResult, setBackendResult] =
    useState<BackendExecutionResult | null>(
      null,
    );

  const [backendLoading, setBackendLoading] =
    useState(false);

  const [backendError, setBackendError] =
    useState<string | null>(null);

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
    setBackendResult(null);
    setBackendError(null);
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
          currentOperation.qubit === qubit &&
          currentOperation.column === column
        ) {
          return false;
        }

        if (
          currentOperation.controlQubit === qubit &&
          currentOperation.column === column
        ) {
          return false;
        }

        return true;
      },
    );

    commitCircuit(nextCircuit);
  }

  // ==========================================================
  // REMOVE CONTROLLED GATE
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
    setBackendResult(null);
    setBackendError(null);

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
    setHistory([nextCircuit]);
    setHistoryIndex(0);

    setMeasurementResult(null);
    setMeasurementResults([]);
    setBackendResult(null);
    setBackendError(null);
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
  // MULTI-BACKEND EXECUTION
  // ==========================================================

  async function runBackendSimulation() {
    if (!validation.valid) {
      setBackendError(
        "Fix the circuit validation errors before running the simulation.",
      );
      return;
    }

    setBackendLoading(true);
    setBackendError(null);
    setBackendResult(null);

    try {
      if (backend === "local") {
        const localState =
          simulateCircuit(
            qubits,
            circuit,
          );

        const localProbabilities =
          calculateProbabilities(
            localState,
          );

        const localResults =
          sampleMeasurement(
            localProbabilities,
            shots,
          );

        const localCounts: Record<
          string,
          number
        > = {};

        for (
          const index of localResults
        ) {
          const label =
            basisLabel(
              index,
              qubits,
            );

          localCounts[label] =
            (localCounts[label] ??
              0) + 1;
        }

        setBackendResult({
          success: true,
          backend: "local",
          statevector:
            localState.map(
              (value) => ({
                re: value.re,
                im: value.im,
              }),
            ),
          probabilities:
            localProbabilities,
          probabilityMap:
            Object.fromEntries(
              localProbabilities.map(
                (
                  probability,
                  index,
                ) => [
                  basisLabel(
                    index,
                    qubits,
                  ),
                  probability,
                ],
              ),
            ),
          counts:
            localCounts,
          shots,
        });

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
            backend: "local",
            executionMode:
              "multi_backend",
          },
        });

        return;
      }

      const response =
        await fetch(
          "/api/quantum-lab/execute",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              backend,
              qubits,
              shots,
              circuit,
            }),
          },
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.error ??
            "Quantum backend execution failed.",
        );
      }

      setBackendResult(
        data as BackendExecutionResult,
      );

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
          backend,
          executionMode:
            "multi_backend",
        },
      });
    } catch (error) {
      setBackendError(
        error instanceof Error
          ? error.message
          : "Quantum simulation failed.",
      );
    } finally {
      setBackendLoading(false);
    }
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

    setHistoryIndex(
      nextIndex,
    );

    setCircuit(
      history[nextIndex],
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

    setHistoryIndex(
      nextIndex,
    );

    setCircuit(
      history[nextIndex],
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
    setBackendResult(null);
    setBackendError(null);

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
        template,
      },
    });
  }

  // ==========================================================
  // CIRCUIT EDITOR
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

    setMeasurementResult(null);
    setMeasurementResults([]);
    setBackendResult(null);
    setBackendError(null);
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="quantum-lab-shell min-h-screen w-full bg-[#111418] text-white">

      {/* ======================================================
          LAB HEADER
      ====================================================== */}

      <section className="border-b border-white/10 bg-[#15191e]">

        <div className="w-full px-5 py-7 sm:px-7 lg:px-10">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

            <div>

              <div className="mb-3 flex items-center gap-3">

                <span className="h-2 w-2 bg-blue-500" />

                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-400">
                  Quantum Lab
                </p>

                <span className="text-xs text-slate-600">
                  /
                </span>

                <span className="text-xs text-slate-500">
                  Interactive simulator
                </span>

              </div>

              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Build, execute, and understand quantum circuits.
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                Construct a circuit visually, choose a quantum
                simulation backend, execute it, and inspect the
                resulting quantum state and measurements.
              </p>

            </div>

            <div className="flex items-center gap-2">

              <div className="border border-white/10 bg-[#0d1014] px-4 py-3">

                <p className="text-[10px] uppercase tracking-wider text-slate-500">
                  Backend
                </p>

                <p className="mt-1 text-sm font-semibold text-white">
                  {backend === "local"
                    ? "QuantumLearn Local"
                    : backend}
                </p>

              </div>

              <div className="border border-white/10 bg-[#0d1014] px-4 py-3">

                <p className="text-[10px] uppercase tracking-wider text-slate-500">
                  Status
                </p>

                <p
                  className={`mt-1 text-sm font-semibold ${
                    backendLoading
                      ? "text-blue-400"
                      : validation.valid
                        ? "text-emerald-400"
                        : "text-red-400"
                  }`}
                >
                  {backendLoading
                    ? "Running"
                    : validation.valid
                      ? "Ready"
                      : "Needs attention"}
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ======================================================
          MAIN LAB
      ====================================================== */}

      <div className="w-full">

        {/* ====================================================
            CIRCUIT CONFIGURATION
        ==================================================== */}

        <section className="border-b border-white/10 bg-[#13171c]">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">

            <div className="flex min-h-[86px] items-center px-5 sm:px-7 lg:px-10">

              <div>

                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-400">
                  Circuit configuration
                </p>

                <h2 className="mt-1 text-lg font-semibold text-white">
                  Quantum circuit
                </h2>

              </div>

            </div>

            <div className="flex flex-wrap items-center border-t border-white/10 lg:border-l lg:border-t-0">

              <div className="flex items-center gap-3 px-5 py-4">

                <span className="text-xs uppercase tracking-wider text-slate-500">
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
                  className="flex h-8 w-8 items-center justify-center border border-white/10 bg-[#0d1014] text-slate-300 transition hover:border-blue-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  −
                </button>

                <span className="w-6 text-center text-sm font-semibold text-white">
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
                  className="flex h-8 w-8 items-center justify-center border border-white/10 bg-[#0d1014] text-slate-300 transition hover:border-blue-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  +
                </button>

              </div>

              <div className="h-10 w-px bg-white/10" />

              <div className="px-5 py-4">

                <button
                  type="button"
                  onClick={
                    resetCircuit
                  }
                  className="border border-white/10 bg-[#0d1014] px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-blue-500 hover:text-white"
                >
                  Reset circuit
                </button>

              </div>

            </div>

          </div>

        </section>

        {/* ====================================================
            BACKEND SECTION
        ==================================================== */}

        <section className="border-b border-white/10 bg-[#11151a]">

          <div className="px-5 py-6 sm:px-7 lg:px-10">

            <div className="mb-5 flex flex-col gap-1">

              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-400">
                Simulation infrastructure
              </p>

              <h2 className="text-lg font-semibold text-white">
                Choose a quantum engine
              </h2>

              <p className="text-sm text-slate-500">
                Execute the same circuit across supported
                quantum simulation backends.
              </p>

            </div>

            <BackendSelector
              backend={backend}
              onChange={(value) => {
                setBackend(value);
                setBackendResult(null);
                setBackendError(null);
              }}
              disabled={
                backendLoading
              }
            />

          </div>

        </section>

        {/* ====================================================
            EXECUTION BAR
        ==================================================== */}

        <section className="border-b border-white/10 bg-[#0e1216]">

          <div className="flex flex-col gap-5 px-5 py-5 sm:px-7 lg:flex-row lg:items-center lg:justify-between lg:px-10">

            <div>

              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Execution
              </p>

              <h2 className="mt-1 text-base font-semibold text-white">
                Run quantum simulation
              </h2>

            </div>

            <div className="flex flex-wrap items-center gap-3">

              <div className="flex items-center gap-2 border border-white/10 bg-[#15191e] px-3 py-2">

                <span className="text-xs text-slate-500">
                  Shots
                </span>

                <select
                  value={shots}
                  onChange={(event) =>
                    setShots(
                      Number(
                        event.target.value,
                      ),
                    )
                  }
                  className="bg-transparent text-sm font-semibold text-white outline-none"
                >
                  <option
                    value={10}
                    className="bg-[#15191e]"
                  >
                    10
                  </option>

                  <option
                    value={100}
                    className="bg-[#15191e]"
                  >
                    100
                  </option>

                  <option
                    value={500}
                    className="bg-[#15191e]"
                  >
                    500
                  </option>

                  <option
                    value={1000}
                    className="bg-[#15191e]"
                  >
                    1000
                  </option>
                </select>

              </div>

              <button
                type="button"
                onClick={
                  runBackendSimulation
                }
                disabled={
                  backendLoading ||
                  !validation.valid
                }
                className="min-w-[150px] bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {backendLoading
                  ? "Running simulation..."
                  : `Run on ${
                      backend === "local"
                        ? "Local"
                        : backend
                    }`}
              </button>

            </div>

          </div>

        </section>

        {/* ====================================================
            RESULTS
        ==================================================== */}

        <section className="border-b border-white/10 bg-[#11151a]">

          <div className="px-5 py-7 sm:px-7 lg:px-10">

            <div className="mb-6 flex items-end justify-between">

              <div>

                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-400">
                  Backend result
                </p>

                <h2 className="mt-1 text-xl font-semibold text-white">
                  Simulation output
                </h2>

              </div>

              {backendResult && (
                <div className="text-right">

                  <p className="text-[10px] uppercase tracking-wider text-slate-600">
                    Completed
                  </p>

                  <p className="mt-1 text-xs font-semibold text-emerald-400">
                    Successful execution
                  </p>

                </div>
              )}

            </div>

            <MultiBackendResult
              result={
                backendResult
              }
              loading={
                backendLoading
              }
              error={
                backendError
              }
            />

          </div>

        </section>

        {/* ====================================================
            CIRCUIT METRICS
        ==================================================== */}

        <section className="border-b border-white/10 bg-[#0e1216]">

          <div className="grid grid-cols-1 sm:grid-cols-3">

            <div className="border-b border-white/10 p-5 sm:border-r sm:border-b-0 sm:px-7 lg:px-10">

              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                Qubits
              </p>

              <p className="mt-2 text-3xl font-semibold tracking-tight text-white">
                {qubits}
              </p>

            </div>

            <div className="border-b border-white/10 p-5 sm:border-r sm:border-b-0 sm:px-7 lg:px-10">

              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                Gates
              </p>

              <p className="mt-2 text-3xl font-semibold tracking-tight text-white">
                {gateCount}
              </p>

            </div>

            <div className="p-5 sm:px-7 lg:px-10">

              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                Circuit depth
              </p>

              <p className="mt-2 text-3xl font-semibold tracking-tight text-white">
                {circuitDepth}
              </p>

            </div>

          </div>

        </section>

        {/* ====================================================
            VISUAL CIRCUIT BUILDER
        ==================================================== */}

        <section className="border-b border-white/10 bg-[#15191e]">

          <div className="px-5 py-7 sm:px-7 lg:px-10">

            <div className="mb-6">

              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-400">
                Circuit construction
              </p>

              <h2 className="mt-1 text-xl font-semibold text-white">
                Visual circuit editor
              </h2>

              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Select a gate and place it directly on the
                circuit grid. Click an existing operation to
                remove it.
              </p>

            </div>

            <div className="overflow-hidden border border-white/10 bg-[#0c1014]">

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

            </div>

          </div>

        </section>

        {/* ====================================================
            CONTROLLED GATES
        ==================================================== */}

        <section className="border-b border-white/10 bg-[#11151a]">

          <div className="px-5 py-7 sm:px-7 lg:px-10">

            <div className="mb-5">

              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Advanced operations
              </p>

              <h2 className="mt-1 text-lg font-semibold text-white">
                Controlled gate configuration
              </h2>

            </div>

            <ControlledGateEditor
              qubits={qubits}
              columns={columns}
              circuit={circuit}
              onCircuitChange={
                handleEditorCircuitChange
              }
            />

          </div>

        </section>

        {/* ====================================================
            VALIDATION
        ==================================================== */}

        <section className="border-b border-white/10 bg-[#0e1216]">

          <div className="px-5 py-7 sm:px-7 lg:px-10">

            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

              <div>

                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-400">
                  Circuit validation
                </p>

                <h2 className="mt-1 text-xl font-semibold text-white">
                  Circuit integrity
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Structural checks are performed before
                  backend execution.
                </p>

              </div>

              <div
                className={`inline-flex w-fit items-center gap-2 border px-4 py-2 text-xs font-bold ${
                  validation.valid
                    ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
                    : "border-red-500/30 bg-red-500/5 text-red-400"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 ${
                    validation.valid
                      ? "bg-emerald-400"
                      : "bg-red-400"
                  }`}
                />

                {validation.valid
                  ? "VALID CIRCUIT"
                  : "INVALID CIRCUIT"}

              </div>

            </div>

            {validation.errors.length >
              0 && (
              <div className="mt-6 space-y-2">

                {validation.errors.map(
                  (
                    issue,
                    index,
                  ) => (
                    <div
                      key={`error-${index}`}
                      className="border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300"
                    >
                      {issue.message}
                    </div>
                  ),
                )}

              </div>
            )}

            {validation.warnings.length >
              0 && (
              <div className="mt-6 space-y-2">

                {validation.warnings.map(
                  (
                    issue,
                    index,
                  ) => (
                    <div
                      key={`warning-${index}`}
                      className="border border-yellow-500/20 bg-yellow-500/5 p-4 text-sm text-yellow-300"
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
                <div className="mt-6 border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-300">
                  All circuit operations are structurally valid
                  and ready for simulation.
                </div>
              )}

          </div>

        </section>

        {/* ====================================================
            QUANTUM STATE
        ==================================================== */}

        <section className="border-b border-white/10 bg-[#15191e]">

          <div className="px-5 py-7 sm:px-7 lg:px-10">

            <div className="mb-7">

              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-400">
                Quantum state
              </p>

              <h2 className="mt-1 text-xl font-semibold text-white">
                State vector
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Current quantum state after applying the
                circuit operations.
              </p>

            </div>

            <div className="grid gap-3">

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
                      className="border border-white/10 bg-[#0d1115] p-5"
                    >

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                        <span className="font-mono text-sm font-semibold text-slate-200">
                          |
                          {
                            basisLabel(
                              index,
                              qubits,
                            )
                          }
                          ⟩
                        </span>

                        <span className="font-mono text-sm text-slate-400">
                          {
                            formatComplex(
                              amplitude,
                            )
                          }
                        </span>

                      </div>

                      <div className="mt-4 h-1 bg-white/10">

                        <div
                          className="h-full bg-blue-500 transition-all duration-500"
                          style={{
                            width: `${Math.min(
                              probability *
                                100,
                              100,
                            )}%`,
                          }}
                        />

                      </div>

                      <p className="mt-3 text-[11px] uppercase tracking-wider text-slate-600">
                        Probability{" "}
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

          </div>

        </section>

        {/* ====================================================
            VISUALIZATION
        ==================================================== */}

        <section className="border-b border-white/10 bg-[#11151a]">

          <div className="px-5 py-7 sm:px-7 lg:px-10">

            <div className="mb-6">

              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-400">
                Visualization
              </p>

              <h2 className="mt-1 text-xl font-semibold text-white">
                Quantum state visualization
              </h2>

            </div>

            <div className="border border-white/10 bg-[#0d1115] p-2 sm:p-5">

              <BlochSphere
                state={state}
                qubits={qubits}
              />

            </div>

          </div>

        </section>

        {/* ====================================================
            MEASUREMENT
        ==================================================== */}

        <section className="border-b border-white/10 bg-[#15191e]">

          <div className="px-5 py-7 sm:px-7 lg:px-10">

            <div className="mb-6">

              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Measurement
              </p>

              <h2 className="mt-1 text-xl font-semibold text-white">
                Measure the circuit
              </h2>

            </div>

            <MeasurementPanel
              result={
                measurementResult
              }
              onMeasure={
                runMeasurement
              }
            />

          </div>

        </section>

        {/* ====================================================
            DEVELOPMENT TOOLS
        ==================================================== */}

        <section className="border-b border-white/10 bg-[#11151a]">

          <div className="px-5 py-7 sm:px-7 lg:px-10">

            <div className="mb-6">

              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-400">
                Development tools
              </p>

              <h2 className="mt-1 text-xl font-semibold text-white">
                Work with your circuit
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Generate code, save circuits, export them, and
                continue experimenting.
              </p>

            </div>

            <div className="space-y-5">

              <div className="border border-white/10 bg-[#0d1115] p-5">

                <CodeGenerator
                  qubits={qubits}
                  circuit={circuit}
                />

              </div>

              <div className="border border-white/10 bg-[#0d1115] p-5">

                <CircuitStorage
                  qubits={qubits}
                  circuit={circuit}
                  onLoad={
                    handleLoadCircuit
                  }
                />

              </div>

            </div>

          </div>

        </section>

        {/* ====================================================
            EXPERIMENT / AI
        ==================================================== */}

        <section className="bg-[#0e1216]">

          <div className="px-5 py-7 sm:px-7 lg:px-10">

            <div className="mb-6">

              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-400">
                Experiment and understand
              </p>

              <h2 className="mt-1 text-xl font-semibold text-white">
                Explore the result
              </h2>

            </div>

            <div className="border border-white/10 bg-[#15191e]">

              {/* Experiment header */}

              <div className="flex flex-col gap-5 border-b border-white/10 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">

                <div>

                  <h3 className="font-semibold text-white">
                    Multi-shot experiment
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Run the circuit repeatedly and inspect
                    measurement outcomes.
                  </p>

                </div>

                <div className="flex flex-wrap items-center gap-3">

                  <label
                    htmlFor="experiment-shots"
                    className="text-xs uppercase tracking-wider text-slate-500"
                  >
                    Shots
                  </label>

                  <select
                    id="experiment-shots"
                    value={shots}
                    onChange={(event) =>
                      setShots(
                        Number(
                          event.target.value,
                        ),
                      )
                    }
                    className="border border-white/10 bg-[#0d1115] px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                  >

                    <option
                      value={10}
                      className="bg-[#0d1115]"
                    >
                      10
                    </option>

                    <option
                      value={100}
                      className="bg-[#0d1115]"
                    >
                      100
                    </option>

                    <option
                      value={500}
                      className="bg-[#0d1115]"
                    >
                      500
                    </option>

                    <option
                      value={1000}
                      className="bg-[#0d1115]"
                    >
                      1000
                    </option>

                  </select>

                  <button
                    type="button"
                    onClick={
                      runExperiment
                    }
                    className="bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
                  >
                    Run experiment
                  </button>

                </div>

              </div>

              {/* Export */}

              <div className="border-b border-white/10 p-5 sm:p-6">

                <ExportCircuit
                  qubits={qubits}
                  circuit={circuit}
                />

              </div>

              {/* AI Tutor */}

              <div className="border-b border-white/10 p-5 sm:p-6">

                <QuantumTutor
                  qubits={qubits}
                  circuit={circuit}
                  state={state}
                  probabilities={
                    probabilities
                  }
                />

              </div>

              {/* Histogram */}

              {measurementResults.length >
                0 && (
                <div className="p-5 sm:p-6">

                  <MeasurementHistogram
                    results={
                      measurementResults
                    }
                    qubits={qubits}
                  />

                </div>
              )}

            </div>

          </div>

        </section>

      </div>

      {/* ======================================================
          GLOBAL QUANTUM LAB OVERRIDES
      ====================================================== */}

      <style jsx global>{`

        .quantum-lab-shell .rounded-2xl,
        .quantum-lab-shell .rounded-xl,
        .quantum-lab-shell .rounded-lg,
        .quantum-lab-shell .rounded-md {
          border-radius: 0;
        }

        .quantum-lab-shell .shadow-sm,
        .quantum-lab-shell .shadow-md,
        .quantum-lab-shell .shadow-lg {
          box-shadow: none;
        }

        .quantum-lab-shell .bg-white {
          background-color: #15191e !important;
        }

        .quantum-lab-shell .bg-slate-50 {
          background-color: #111418 !important;
        }

        .quantum-lab-shell .bg-slate-100 {
          background-color: #15191e !important;
        }

        .quantum-lab-shell .bg-slate-200 {
          background-color: #20252b !important;
        }

        .quantum-lab-shell .border-slate-200,
        .quantum-lab-shell .border-slate-300 {
          border-color: rgba(255, 255, 255, 0.10) !important;
        }

        .quantum-lab-shell .border-slate-400 {
          border-color: rgba(255, 255, 255, 0.16) !important;
        }

        .quantum-lab-shell .text-slate-950,
        .quantum-lab-shell .text-slate-900 {
          color: #ffffff !important;
        }

        .quantum-lab-shell .text-slate-800,
        .quantum-lab-shell .text-slate-700 {
          color: #d1d5db !important;
        }

        .quantum-lab-shell .text-slate-600 {
          color: #9ca3af !important;
        }

        .quantum-lab-shell .text-slate-500 {
          color: #737b86 !important;
        }

        .quantum-lab-shell .text-slate-400 {
          color: #8b949e !important;
        }

        .quantum-lab-shell input,
        .quantum-lab-shell select,
        .quantum-lab-shell textarea {
          color-scheme: dark;
        }

        .quantum-lab-shell button {
          transition:
            background-color 160ms ease,
            border-color 160ms ease,
            color 160ms ease,
            opacity 160ms ease;
        }

      `}</style>

    </div>
  );
}