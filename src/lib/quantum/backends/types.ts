import type {
  CircuitGate,
} from "@/lib/quantum/types";

export type QuantumBackend =
  | "local"
  | "qiskit-aer"
  | "pennylane"
  | "cirq"
  | "qbraid";

export type BackendExecutionRequest = {
  backend: QuantumBackend;
  qubits: number;
  circuit: CircuitGate[];
  shots: number;
};

export type ComplexResult = {
  re: number;
  im: number;
};

export type BackendExecutionResult = {
  success: boolean;

  backend: QuantumBackend;

  statevector: ComplexResult[];

  probabilities: number[];

  probabilityMap: Record<
    string,
    number
  >;

  counts: Record<
    string,
    number
  >;

  executionTimeMs?: number;

  error?: string;
};

export type BackendInfo = {
  id: QuantumBackend;
  name: string;
  description: string;
  type: "local" | "framework" | "cloud";
  available: boolean;
};