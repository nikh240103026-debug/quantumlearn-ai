import type {
  CircuitGate,
} from "./types";

export type QuantumTemplate = {
  id: string;
  name: string;
  description: string;
  qubits: number;
  circuit: CircuitGate[];
};

export const QUANTUM_TEMPLATES:
  QuantumTemplate[] = [

  {
    id: "superposition",
    name: "Superposition",
    description:
      "Places one qubit into an equal superposition using a Hadamard gate.",
    qubits: 1,
    circuit: [
      {
        gate: "H",
        qubit: 0,
        column: 0,
      },
    ],
  },

  {
    id: "bell-state",
    name: "Bell State",
    description:
      "Creates an entangled two-qubit Bell state using H and CNOT.",
    qubits: 2,
    circuit: [
      {
        gate: "H",
        qubit: 0,
        column: 0,
      },
      {
        gate: "CNOT",
        qubit: 1,
        column: 1,
        controlQubit: 0,
      },
    ],
  },

  {
    id: "ghz-state",
    name: "GHZ State",
    description:
      "Creates a three-qubit GHZ state using H followed by two CNOT gates.",
    qubits: 3,
    circuit: [
      {
        gate: "H",
        qubit: 0,
        column: 0,
      },
      {
        gate: "CNOT",
        qubit: 1,
        column: 1,
        controlQubit: 0,
      },
      {
        gate: "CNOT",
        qubit: 2,
        column: 2,
        controlQubit: 0,
      },
    ],
  },

  {
    id: "phase-state",
    name: "Phase State",
    description:
      "Creates a superposition and then applies a phase rotation.",
    qubits: 1,
    circuit: [
      {
        gate: "H",
        qubit: 0,
        column: 0,
      },
      {
        gate: "S",
        qubit: 0,
        column: 1,
      },
    ],
  },

  {
    id: "bell-phase",
    name: "Bell + Phase",
    description:
      "Creates entanglement and applies a phase operation to the second qubit.",
    qubits: 2,
    circuit: [
      {
        gate: "H",
        qubit: 0,
        column: 0,
      },
      {
        gate: "CNOT",
        qubit: 1,
        column: 1,
        controlQubit: 0,
      },
      {
        gate: "Z",
        qubit: 1,
        column: 2,
      },
    ],
  },
];