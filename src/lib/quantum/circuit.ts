import type {
  CircuitGate,
  CircuitIR,
  CircuitValidationResult,
} from "./types";

export function createGateId(): string {
  if (
    typeof crypto !== "undefined" &&
    "randomUUID" in crypto
  ) {
    return crypto.randomUUID();
  }

  return `gate-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

export function cloneCircuit(
  circuit: CircuitGate[],
): CircuitGate[] {
  return circuit.map((gate) => ({
    ...gate,
  }));
}

export function isTwoQubitGate(
  gate: CircuitGate,
): boolean {
  return (
    gate.gate === "CNOT" ||
    gate.gate === "CZ" ||
    gate.gate === "SWAP"
  );
}

export function getOccupiedQubits(
  operation: CircuitGate,
): number[] {
  if (
    isTwoQubitGate(operation) &&
    operation.controlQubit !== undefined
  ) {
    return [
      operation.controlQubit,
      operation.qubit,
    ];
  }

  return [operation.qubit];
}

export function getOperationAt(
  circuit: CircuitGate[],
  qubit: number,
  column: number,
): CircuitGate | undefined {
  return circuit.find(
    (operation) =>
      operation.column === column &&
      getOccupiedQubits(operation).includes(
        qubit,
      ),
  );
}

export function getOperationById(
  circuit: CircuitGate[],
  id: string,
): CircuitGate | undefined {
  return circuit.find(
    (operation) => operation.id === id,
  );
}

export function removeGateById(
  circuit: CircuitGate[],
  id: string,
): CircuitGate[] {
  return circuit.filter(
    (operation) => operation.id !== id,
  );
}

export function moveGate(
  circuit: CircuitGate[],
  gateId: string,
  targetQubit: number,
  targetColumn: number,
): CircuitGate[] {
  const source = getOperationById(
    circuit,
    gateId,
  );

  if (!source) {
    return circuit;
  }

  const next = circuit.filter(
    (operation) =>
      operation.id !== gateId,
  );

  let controlQubit =
    source.controlQubit;

  if (
    controlQubit !== undefined
  ) {
    const distance =
      source.qubit -
      controlQubit;

    controlQubit =
      targetQubit - distance;
  }

  const moved: CircuitGate = {
    ...source,
    qubit: targetQubit,
    column: targetColumn,
    controlQubit,
  };

  return [
    ...next,
    moved,
  ];
}

export function validateCircuit(
  qubits: number,
  columns: number,
  circuit: CircuitGate[],
): CircuitValidationResult {
  const issues = [];

  const occupied = new Map<
    string,
    string
  >();

  for (const operation of circuit) {
    if (
      operation.qubit < 0 ||
      operation.qubit >= qubits
    ) {
      issues.push({
        type: "invalid_qubit" as const,
        message: `Gate ${operation.gate} references invalid target qubit q[${operation.qubit}].`,
        gateId: operation.id,
      });

      continue;
    }

    if (
      operation.column < 0 ||
      operation.column >= columns
    ) {
      issues.push({
        type: "invalid_column" as const,
        message: `Gate ${operation.gate} is outside the available circuit columns.`,
        gateId: operation.id,
      });

      continue;
    }

    const isControlled =
      isTwoQubitGate(operation);

    if (isControlled) {
      if (
        operation.controlQubit ===
        undefined
      ) {
        issues.push({
          type: "missing_control" as const,
          message: `${operation.gate} requires a control qubit.`,
          gateId: operation.id,
        });

        continue;
      }

      if (
        operation.controlQubit < 0 ||
        operation.controlQubit >= qubits
      ) {
        issues.push({
          type: "invalid_control" as const,
          message: `Gate ${operation.gate} references invalid control qubit q[${operation.controlQubit}].`,
          gateId: operation.id,
        });

        continue;
      }

      if (
        operation.controlQubit ===
        operation.qubit
      ) {
        issues.push({
          type: "invalid_control" as const,
          message: "Control and target qubits must be different.",
          gateId: operation.id,
        });

        continue;
      }
    }

    for (const occupiedQubit of getOccupiedQubits(
      operation,
    )) {
      const key = `${operation.column}:${occupiedQubit}`;

      const existing =
        occupied.get(key);

      if (
        existing &&
        existing !== operation.id
      ) {
        issues.push({
          type: "collision" as const,
          message: `Two operations occupy q[${occupiedQubit}] at circuit column ${operation.column + 1}.`,
          gateId: operation.id,
        });
      } else {
        occupied.set(
          key,
          operation.id,
        );
      }
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

export function circuitToIR(
  qubits: number,
  circuit: CircuitGate[],
): CircuitIR {
  const columns = new Set(
    circuit.map(
      (operation) =>
        operation.column,
    ),
  );

  const moments = [...columns]
    .sort((a, b) => a - b)
    .map((column) => {
      const operations = circuit
        .filter(
          (operation) =>
            operation.column ===
            column,
        )
        .map((operation) => ({
          id: operation.id,
          gate: operation.gate,
          targets: [
            operation.qubit,
          ],
          ...(operation.controlQubit !==
          undefined
            ? {
                controls: [
                  operation.controlQubit,
                ],
              }
            : {}),
        }));

      return {
        column,
        operations,
      };
    });

  return {
    version: 1,
    qubits,
    moments,
  };
}