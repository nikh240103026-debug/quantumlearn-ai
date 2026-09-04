import type {
  CircuitGate,
} from "./types";

function sortedCircuit(
  circuit: CircuitGate[],
) {
  return [...circuit].sort(
    (a, b) => {
      if (
        a.column !==
        b.column
      ) {
        return (
          a.column -
          b.column
        );
      }

      return (
        a.qubit -
        b.qubit
      );
    },
  );
}

function qiskitGate(
  operation: CircuitGate,
): string {
  const q =
    operation.qubit;

  const control =
    operation.controlQubit;

  switch (
    operation.gate
  ) {
    case "I":
      return `qc.id(${q})`;

    case "X":
      return `qc.x(${q})`;

    case "Y":
      return `qc.y(${q})`;

    case "Z":
      return `qc.z(${q})`;

    case "H":
      return `qc.h(${q})`;

    case "S":
      return `qc.s(${q})`;

    case "T":
      return `qc.t(${q})`;

    case "CNOT":
      return control ===
        undefined
        ? ""
        : `qc.cx(${control}, ${q})`;

    case "CZ":
      return control ===
        undefined
        ? ""
        : `qc.cz(${control}, ${q})`;

    case "SWAP":
      return control ===
        undefined
        ? ""
        : `qc.swap(${control}, ${q})`;

    default:
      return "";
  }
}

function pennylaneGate(
  operation: CircuitGate,
): string {
  const q =
    operation.qubit;

  const control =
    operation.controlQubit;

  switch (
    operation.gate
  ) {
    case "I":
      return `qml.Identity(wires=${q})`;

    case "X":
      return `qml.PauliX(wires=${q})`;

    case "Y":
      return `qml.PauliY(wires=${q})`;

    case "Z":
      return `qml.PauliZ(wires=${q})`;

    case "H":
      return `qml.Hadamard(wires=${q})`;

    case "S":
      return `qml.S(wires=${q})`;

    case "T":
      return `qml.T(wires=${q})`;

    case "CNOT":
      return control ===
        undefined
        ? ""
        : `qml.CNOT(wires=[${control}, ${q}])`;

    case "CZ":
      return control ===
        undefined
        ? ""
        : `qml.CZ(wires=[${control}, ${q}])`;

    case "SWAP":
      return control ===
        undefined
        ? ""
        : `qml.SWAP(wires=[${control}, ${q}])`;

    default:
      return "";
  }
}

function cirqGate(
  operation: CircuitGate,
): string {
  const q =
    operation.qubit;

  const control =
    operation.controlQubit;

  switch (
    operation.gate
  ) {
    case "I":
      return `cirq.I(q[${q}])`;

    case "X":
      return `cirq.X(q[${q}])`;

    case "Y":
      return `cirq.Y(q[${q}])`;

    case "Z":
      return `cirq.Z(q[${q}])`;

    case "H":
      return `cirq.H(q[${q}])`;

    case "S":
      return `cirq.S(q[${q}])`;

    case "T":
      return `cirq.T(q[${q}])`;

    case "CNOT":
      return control ===
        undefined
        ? ""
        : `cirq.CNOT(q[${control}], q[${q}])`;

    case "CZ":
      return control ===
        undefined
        ? ""
        : `cirq.CZ(q[${control}], q[${q}])`;

    case "SWAP":
      return control ===
        undefined
        ? ""
        : `cirq.SWAP(q[${control}], q[${q}])`;

    default:
      return "";
  }
}

export function generateQiskitCode(
  qubits: number,
  circuit: CircuitGate[],
): string {
  const lines = [
    "from qiskit import QuantumCircuit",
    "",
    `qc = QuantumCircuit(${qubits})`,
    "",
  ];

  for (
    const operation of sortedCircuit(
      circuit,
    )
  ) {
    const line =
      qiskitGate(
        operation,
      );

    if (line) {
      lines.push(line);
    }
  }

  lines.push("");
  lines.push("print(qc)");

  return lines.join("\n");
}

export function generatePennyLaneCode(
  qubits: number,
  circuit: CircuitGate[],
): string {
  const lines = [
    "import pennylane as qml",
    "",
    `dev = qml.device("default.qubit", wires=${qubits})`,
    "",
    "@qml.qnode(dev)",
    "def circuit():",
  ];

  const operations =
    sortedCircuit(
      circuit,
    );

  if (
    operations.length ===
    0
  ) {
    lines.push(
      "    pass",
    );
  } else {
    for (
      const operation of operations
    ) {
      const line =
        pennylaneGate(
          operation,
        );

      if (line) {
        lines.push(
          `    ${line}`,
        );
      }
    }
  }

  lines.push("");
  lines.push(
    "    return qml.state()",
  );
  lines.push("");
  lines.push(
    "print(circuit())",
  );

  return lines.join("\n");
}

export function generateCirqCode(
  qubits: number,
  circuit: CircuitGate[],
): string {
  const lines = [
    "import cirq",
    "",
    `q = [cirq.LineQubit(i) for i in range(${qubits})]`,
    "circuit = cirq.Circuit()",
    "",
  ];

  for (
    const operation of sortedCircuit(
      circuit,
    )
  ) {
    const line =
      cirqGate(
        operation,
      );

    if (line) {
      lines.push(
        `circuit.append(${line})`,
      );
    }
  }

  lines.push("");
  lines.push(
    "print(circuit)",
  );

  return lines.join("\n");
}