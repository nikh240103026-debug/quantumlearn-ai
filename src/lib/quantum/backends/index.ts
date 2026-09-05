import type {
  BackendInfo,
  QuantumBackend,
} from "./types";

export const QUANTUM_BACKENDS: BackendInfo[] = [
  {
    id: "local",
    name: "QuantumLearn Local Simulator",
    description:
      "Built-in browser-compatible QuantumLearn statevector simulator.",
    type: "local",
    available: true,
  },

  {
    id: "qiskit-aer",
    name: "Qiskit Aer",
    description:
      "IBM Qiskit Aer high-performance simulator.",
    type: "framework",
    available: true,
  },

  {
    id: "pennylane",
    name: "PennyLane",
    description:
      "PennyLane quantum machine-learning simulator.",
    type: "framework",
    available: true,
  },

  {
    id: "cirq",
    name: "Cirq",
    description:
      "Google Cirq quantum circuit simulator.",
    type: "framework",
    available: true,
  },

  {
    id: "qbraid",
    name: "qBraid",
    description:
      "qBraid cloud quantum execution platform.",
    type: "cloud",
    available: false,
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