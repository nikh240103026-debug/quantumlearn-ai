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
  | "SWAP";

export type CircuitGate = {
  gate: QuantumGate;
  qubit: number;
  column: number;
  controlQubit?: number;
};