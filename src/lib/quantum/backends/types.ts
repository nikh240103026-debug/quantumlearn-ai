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

  /*
   * qBraid's QIR simulator returns measurement
   * counts rather than an exact statevector.
   */
  statevector: ComplexResult[] | null;

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

  device?: string;

  jobId?: string;

  shots?: number;

  qasm?: string;

  qbraidStatus?: string;
};

export type BackendInfo = {
  id: QuantumBackend;
  name: string;
  description: string;
  type:
    | "local"
    | "framework"
    | "cloud";
  available: boolean;
};