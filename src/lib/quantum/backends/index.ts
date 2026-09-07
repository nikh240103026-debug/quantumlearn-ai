import type {
  BackendInfo,
  QuantumBackend,
} from "./types";

export const QUANTUM_BACKENDS: BackendInfo[] = [
  {
    id: "local",
    name: "QuantumLearn Local",
    description:
      "Built-in browser-compatible QuantumLearn simulator.",
    type: "local",
    available: true,
  },

  {
    id: "qiskit-aer",
    name: "Qiskit Aer",
    description:
      "Qiskit Aer high-performance simulator.",
    type: "framework",
    available: true,
  },

  {
    id: "pennylane",
    name: "PennyLane",
    description:
      "PennyLane quantum simulator.",
    type: "framework",
    available: true,
  },

  {
    id: "cirq",
    name: "Cirq",
    description:
      "Google Cirq quantum simulator.",
    type: "framework",
    available: true,
  },

  {
    id: "qbraid",
    name: "qBraid QIR Simulator",
    description:
      "qBraid QIR Simulator using OpenQASM 3.",
    type: "cloud",
    available: true,
  },
];

export function isQuantumBackend(
  value: unknown,
): value is QuantumBackend {
  return (
    value === "local" ||
    value === "qiskit-aer" ||
    value === "pennylane" ||
    value === "cirq" ||
    value === "qbraid"
  );
}

export function getBackendInfo(
  backend: QuantumBackend,
) {
  return QUANTUM_BACKENDS.find(
    (item) =>
      item.id === backend,
  );
}