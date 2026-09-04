import type {
  CircuitGate,
  QuantumGate,
} from "./types";

function downloadFile(
  content: string,
  filename: string,
  type: string,
) {
  const blob = new Blob(
    [content],
    { type },
  );

  const url =
    URL.createObjectURL(blob);

  const anchor =
    document.createElement("a");

  anchor.href = url;
  anchor.download = filename;

  document.body.appendChild(anchor);

  anchor.click();

  anchor.remove();

  URL.revokeObjectURL(url);
}

export function exportCircuitJSON(
  qubits: number,
  circuit: CircuitGate[],
) {
  const data = {
    version: 1,
    type: "QuantumLearn Circuit",
    qubits,
    circuit,
  };

  downloadFile(
    JSON.stringify(
      data,
      null,
      2,
    ),
    "quantum-circuit.json",
    "application/json",
  );
}

function gateToQASM(
  operation: CircuitGate,
): string {
  const target =
    operation.qubit;

  const control =
    operation.controlQubit;

  switch (
    operation.gate as QuantumGate
  ) {
    case "I":
      return `id q[${target}];`;

    case "X":
      return `x q[${target}];`;

    case "Y":
      return `y q[${target}];`;

    case "Z":
      return `z q[${target}];`;

    case "H":
      return `h q[${target}];`;

    case "S":
      return `s q[${target}];`;

    case "T":
      return `t q[${target}];`;

    case "CNOT":
      if (control === undefined) {
        return "";
      }

      return `cx q[${control}],q[${target}];`;

    case "CZ":
      if (control === undefined) {
        return "";
      }

      return `cz q[${control}],q[${target}];`;

    case "SWAP":
      if (control === undefined) {
        return "";
      }

      return `swap q[${control}],q[${target}];`;

    case "M":
      return `measure q[${target}] -> c[${target}];`;

    default:
      return "";
  }
}

export function exportCircuitQASM(
  qubits: number,
  circuit: CircuitGate[],
) {
  const sortedCircuit = [
    ...circuit,
  ].sort(
    (a, b) =>
      a.column - b.column,
  );

  const lines = [
    "OPENQASM 2.0;",
    'include "qelib1.inc";',
    "",
    `qreg q[${qubits}];`,
    `creg c[${qubits}];`,
    "",
  ];

  for (
    const operation of sortedCircuit
  ) {
    const qasm =
      gateToQASM(operation);

    if (qasm) {
      lines.push(qasm);
    }
  }

  downloadFile(
    lines.join("\n"),
    "quantum-circuit.qasm",
    "text/plain",
  );
}

export function generateQiskitCode(
  qubits: number,
  circuit: CircuitGate[],
): string {
  const lines = [
    "from qiskit import QuantumCircuit",
    "",
    `qc = QuantumCircuit(${qubits}, ${qubits})`,
    "",
  ];

  const sortedCircuit = [
    ...circuit,
  ].sort(
    (a, b) =>
      a.column - b.column,
  );

  for (const operation of sortedCircuit) {
    const target =
      operation.qubit;

    const control =
      operation.controlQubit;

    switch (operation.gate) {
      case "I":
        lines.push(
          `qc.id(${target})`,
        );
        break;

      case "X":
        lines.push(
          `qc.x(${target})`,
        );
        break;

      case "Y":
        lines.push(
          `qc.y(${target})`,
        );
        break;

      case "Z":
        lines.push(
          `qc.z(${target})`,
        );
        break;

      case "H":
        lines.push(
          `qc.h(${target})`,
        );
        break;

      case "S":
        lines.push(
          `qc.s(${target})`,
        );
        break;

      case "T":
        lines.push(
          `qc.t(${target})`,
        );
        break;

      case "CNOT":
        if (control !== undefined) {
          lines.push(
            `qc.cx(${control}, ${target})`,
          );
        }
        break;

      case "CZ":
        if (control !== undefined) {
          lines.push(
            `qc.cz(${control}, ${target})`,
          );
        }
        break;

      case "SWAP":
        if (control !== undefined) {
          lines.push(
            `qc.swap(${control}, ${target})`,
          );
        }
        break;

      case "M":
        lines.push(
          `qc.measure(${target}, ${target})`,
        );
        break;
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

  const sortedCircuit = [
    ...circuit,
  ].sort(
    (a, b) =>
      a.column - b.column,
  );

  if (sortedCircuit.length === 0) {
    lines.push(
      "    pass",
    );
  }

  for (const operation of sortedCircuit) {
    const target =
      operation.qubit;

    const control =
      operation.controlQubit;

    switch (operation.gate) {
      case "I":
        lines.push(
          `    qml.Identity(wires=${target})`,
        );
        break;

      case "X":
        lines.push(
          `    qml.PauliX(wires=${target})`,
        );
        break;

      case "Y":
        lines.push(
          `    qml.PauliY(wires=${target})`,
        );
        break;

      case "Z":
        lines.push(
          `    qml.PauliZ(wires=${target})`,
        );
        break;

      case "H":
        lines.push(
          `    qml.Hadamard(wires=${target})`,
        );
        break;

      case "S":
        lines.push(
          `    qml.S(wires=${target})`,
        );
        break;

      case "T":
        lines.push(
          `    qml.T(wires=${target})`,
        );
        break;

      case "CNOT":
        if (control !== undefined) {
          lines.push(
            `    qml.CNOT(wires=[${control}, ${target}])`,
          );
        }
        break;

      case "CZ":
        if (control !== undefined) {
          lines.push(
            `    qml.CZ(wires=[${control}, ${target}])`,
          );
        }
        break;

      case "SWAP":
        if (control !== undefined) {
          lines.push(
            `    qml.SWAP(wires=[${control}, ${target}])`,
          );
        }
        break;

      case "M":
        lines.push(
          `    return qml.measure(wires=${target})`,
        );
        break;
    }
  }

  lines.push("");
  lines.push("print(circuit())");

  return lines.join("\n");
}

export function generateCirqCode(
  qubits: number,
  circuit: CircuitGate[],
): string {
  const lines = [
    "import cirq",
    "",
    `qubits = cirq.LineQubit.range(${qubits})`,
    "circuit = cirq.Circuit()",
    "",
  ];

  const sortedCircuit = [
    ...circuit,
  ].sort(
    (a, b) =>
      a.column - b.column,
  );

  for (const operation of sortedCircuit) {
    const target =
      operation.qubit;

    const control =
      operation.controlQubit;

    switch (operation.gate) {
      case "I":
        lines.push(
          `circuit.append(cirq.I(qubits[${target}]))`,
        );
        break;

      case "X":
        lines.push(
          `circuit.append(cirq.X(qubits[${target}]))`,
        );
        break;

      case "Y":
        lines.push(
          `circuit.append(cirq.Y(qubits[${target}]))`,
        );
        break;

      case "Z":
        lines.push(
          `circuit.append(cirq.Z(qubits[${target}]))`,
        );
        break;

      case "H":
        lines.push(
          `circuit.append(cirq.H(qubits[${target}]))`,
        );
        break;

      case "S":
        lines.push(
          `circuit.append(cirq.S(qubits[${target}]))`,
        );
        break;

      case "T":
        lines.push(
          `circuit.append(cirq.T(qubits[${target}]))`,
        );
        break;

      case "CNOT":
        if (control !== undefined) {
          lines.push(
            `circuit.append(cirq.CNOT(qubits[${control}], qubits[${target}]))`,
          );
        }
        break;

      case "CZ":
        if (control !== undefined) {
          lines.push(
            `circuit.append(cirq.CZ(qubits[${control}], qubits[${target}]))`,
          );
        }
        break;

      case "SWAP":
        if (control !== undefined) {
          lines.push(
            `circuit.append(cirq.SWAP(qubits[${control}], qubits[${target}]))`,
          );
        }
        break;

      case "M":
        lines.push(
          `circuit.append(cirq.measure(qubits[${target}], key="q${target}"))`,
        );
        break;
    }
  }

  lines.push("");
  lines.push("print(circuit)");

  return lines.join("\n");
}