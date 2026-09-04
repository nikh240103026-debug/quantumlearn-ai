import type {
  CircuitGate,
  QuantumGate,
} from "./types";

export type CircuitValidationIssue = {
  severity: "error" | "warning";
  message: string;
  column?: number;
  qubit?: number;
};

export type CircuitValidationResult = {
  valid: boolean;
  errors: CircuitValidationIssue[];
  warnings: CircuitValidationIssue[];
};

const CONTROLLED_GATES: QuantumGate[] = [
  "CNOT",
  "CZ",
  "SWAP",
];

function isControlledGate(
  gate: QuantumGate,
): boolean {
  return CONTROLLED_GATES.includes(gate);
}

export function validateCircuit(
  qubits: number,
  columns: number,
  circuit: CircuitGate[],
): CircuitValidationResult {
  const errors: CircuitValidationIssue[] = [];
  const warnings: CircuitValidationIssue[] = [];

  const occupiedCells = new Map<
    string,
    CircuitGate
  >();

  const key = (
    qubit: number,
    column: number,
  ) =>
    `${qubit}:${column}`;

  for (const operation of circuit) {
    if (
      operation.qubit < 0 ||
      operation.qubit >= qubits
    ) {
      errors.push({
        severity: "error",
        message:
          `${operation.gate} targets invalid qubit q[${operation.qubit}].`,
        qubit: operation.qubit,
        column: operation.column,
      });
      continue;
    }

    if (
      operation.column < 0 ||
      operation.column >= columns
    ) {
      errors.push({
        severity: "error",
        message:
          `${operation.gate} is outside the circuit columns.`,
        qubit: operation.qubit,
        column: operation.column,
      });
    }

    const targetKey = key(
      operation.qubit,
      operation.column,
    );

    if (
      occupiedCells.has(
        targetKey,
      )
    ) {
      errors.push({
        severity: "error",
        message:
          `Multiple gates occupy q[${operation.qubit}] at column ${operation.column + 1}.`,
        qubit: operation.qubit,
        column: operation.column,
      });
    }

    occupiedCells.set(
      targetKey,
      operation,
    );

    if (
      isControlledGate(
        operation.gate,
      )
    ) {
      if (
        operation.controlQubit ===
        undefined
      ) {
        errors.push({
          severity: "error",
          message:
            `${operation.gate} requires a control qubit.`,
          qubit: operation.qubit,
          column: operation.column,
        });

        continue;
      }

      if (
        operation.controlQubit < 0 ||
        operation.controlQubit >= qubits
      ) {
        errors.push({
          severity: "error",
          message:
            `${operation.gate} has an invalid control qubit.`,
          qubit: operation.qubit,
          column: operation.column,
        });

        continue;
      }

      if (
        operation.controlQubit ===
        operation.qubit
      ) {
        errors.push({
          severity: "error",
          message:
            `${operation.gate} cannot use the same qubit as control and target.`,
          qubit: operation.qubit,
          column: operation.column,
        });
      }

      const controlKey = key(
        operation.controlQubit,
        operation.column,
      );

      const existingControl =
        occupiedCells.get(
          controlKey,
        );

      if (
        existingControl &&
        existingControl !==
          operation
      ) {
        errors.push({
          severity: "error",
          message:
            `Control q[${operation.controlQubit}] conflicts with another gate in column ${operation.column + 1}.`,
          qubit:
            operation.controlQubit,
          column:
            operation.column,
        });
      }
    }
  }

  if (circuit.length === 0) {
    warnings.push({
      severity: "warning",
      message:
        "The circuit is empty.",
    });
  }

  const usedColumns =
    new Set(
      circuit.map(
        (operation) =>
          operation.column,
      ),
    );

  for (
    let column = 0;
    column < columns;
    column++
  ) {
    if (
      usedColumns.has(
        column,
      )
    ) {
      continue;
    }

    if (
      column <
      Math.max(
        0,
        ...Array.from(
          usedColumns,
        ),
      )
    ) {
      warnings.push({
        severity: "warning",
        message:
          `Column ${column + 1} is empty.`,
        column,
      });
    }
  }

  return {
    valid:
      errors.length === 0,
    errors,
    warnings,
  };
}