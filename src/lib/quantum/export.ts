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
  const q =
    operation.qubit;

  const control =
    operation.controlQubit;

  switch (operation.gate as QuantumGate) {
    case "I":
      return `id q[${q}];`;

    case "X":
      return `x q[${q}];`;

    case "Y":
      return `y q[${q}];`;

    case "Z":
      return `z q[${q}];`;

    case "H":
      return `h q[${q}];`;

    case "S":
      return `s q[${q}];`;

    case "T":
      return `t q[${q}];`;

    case "CNOT":
      if (control === undefined) {
        return "";
      }

      return `cx q[${control}],q[${q}];`;

    case "CZ":
      if (control === undefined) {
        return "";
      }

      return `cz q[${control}],q[${q}];`;

    case "SWAP":
      if (control === undefined) {
        return "";
      }

      return `swap q[${control}],q[${q}];`;

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