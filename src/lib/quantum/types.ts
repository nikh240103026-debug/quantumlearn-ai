export type Complex = {
  re: number;
  im: number;
};

export type QuantumGate =
  | "I"
  | "X"
  | "Y"
  | "Z"
  | "H"
  | "S"
  | "T"
  | "CNOT"
  | "CZ"
  | "SWAP"
  | "M";

export type CircuitGate = {
  id: string;
  gate: QuantumGate;

  /**
   * Target qubit.
   */
  qubit: number;

  /**
   * Time/moment position in the circuit.
   */
  column: number;

  /**
   * Control qubit for controlled operations.
   *
   * Used by:
   * CNOT
   * CZ
   * SWAP
   */
  controlQubit?: number;
};

export type CircuitValidationIssue = {
  type:
    | "invalid_qubit"
    | "invalid_column"
    | "missing_control"
    | "invalid_control"
    | "collision"
    | "unsupported_gate";

  message: string;

  gateId?: string;
};

export type CircuitValidationResult = {
  valid: boolean;
  issues: CircuitValidationIssue[];
};

export type CircuitIR = {
  version: 1;
  qubits: number;

  moments: Array<{
    column: number;

    operations: Array<{
      id: string;
      gate: QuantumGate;
      targets: number[];
      controls?: number[];
    }>;
  }>;
};