import type {
  Complex,
  CircuitGate,
  QuantumGate,
} from "./types";

function complex(re: number, im = 0): Complex {
  return { re, im };
}

function add(a: Complex, b: Complex): Complex {
  return {
    re: a.re + b.re,
    im: a.im + b.im,
  };
}

function multiply(a: Complex, b: Complex): Complex {
  return {
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re,
  };
}

function magnitudeSquared(a: Complex): number {
  return a.re * a.re + a.im * a.im;
}

const SQRT2_INV = 1 / Math.sqrt(2);

export const GATE_MATRICES: Record<
  Exclude<
    QuantumGate,
    "CNOT" | "CZ" | "SWAP"
  >,
  [[Complex, Complex], [Complex, Complex]]
> = {
  I: [
    [complex(1), complex(0)],
    [complex(0), complex(1)],
  ],

  X: [
    [complex(0), complex(1)],
    [complex(1), complex(0)],
  ],

  Y: [
    [complex(0), complex(0, -1)],
    [complex(0, 1), complex(0)],
  ],

  Z: [
    [complex(1), complex(0)],
    [complex(0), complex(-1)],
  ],

  H: [
    [complex(SQRT2_INV), complex(SQRT2_INV)],
    [complex(SQRT2_INV), complex(-SQRT2_INV)],
  ],

  S: [
    [complex(1), complex(0)],
    [complex(0), complex(0, 1)],
  ],

  T: [
    [complex(1), complex(0)],
    [
      complex(0),
      complex(0.5, 0.5),
    ],
  ],
};

export function createInitialState(
  qubits: number,
): Complex[] {
  const size = 2 ** qubits;

  const state = Array.from(
    { length: size },
    () => complex(0),
  );

  state[0] = complex(1);

  return state;
}

export function applySingleQubitGate(
  state: Complex[],
  gate: Exclude<
    QuantumGate,
    "CNOT" | "CZ" | "SWAP"
  >,
  targetQubit: number,
  qubits: number,
): Complex[] {
  const matrix = GATE_MATRICES[gate];

  const result = state.map(() => complex(0));

  const targetBit =
    1 << (qubits - targetQubit - 1);

  for (let i = 0; i < state.length; i++) {
    if ((i & targetBit) !== 0) {
      continue;
    }

    const pairedIndex = i | targetBit;

    const a = state[i];
    const b = state[pairedIndex];

    result[i] = add(
      multiply(matrix[0][0], a),
      multiply(matrix[0][1], b),
    );

    result[pairedIndex] = add(
      multiply(matrix[1][0], a),
      multiply(matrix[1][1], b),
    );
  }

  return result;
}

export function applyCNOT(
  state: Complex[],
  controlQubit: number,
  targetQubit: number,
  qubits: number,
): Complex[] {
  const result = state.map((value) => ({
    ...value,
  }));

  const controlBit =
    1 << (qubits - controlQubit - 1);

  const targetBit =
    1 << (qubits - targetQubit - 1);

  for (let i = 0; i < state.length; i++) {
    if ((i & controlBit) === 0) {
      continue;
    }

    if ((i & targetBit) !== 0) {
      continue;
    }

    const pairedIndex = i | targetBit;

    result[i] = state[pairedIndex];
    result[pairedIndex] = state[i];
  }

  return result;
}

export function applyCZ(
  state: Complex[],
  controlQubit: number,
  targetQubit: number,
  qubits: number,
): Complex[] {
  const result = state.map((value) => ({
    ...value,
  }));

  const controlBit =
    1 << (qubits - controlQubit - 1);

  const targetBit =
    1 << (qubits - targetQubit - 1);

  for (let i = 0; i < state.length; i++) {
    if (
      (i & controlBit) !== 0 &&
      (i & targetBit) !== 0
    ) {
      result[i] = {
        re: -state[i].re,
        im: -state[i].im,
      };
    }
  }

  return result;
}

export function applySWAP(
  state: Complex[],
  qubitA: number,
  qubitB: number,
  qubits: number,
): Complex[] {
  const result = state.map(() => complex(0));

  const bitA =
    1 << (qubits - qubitA - 1);

  const bitB =
    1 << (qubits - qubitB - 1);

  for (let i = 0; i < state.length; i++) {
    const a = (i & bitA) !== 0;
    const b = (i & bitB) !== 0;

    let target = i;

    if (a !== b) {
      target = i ^ bitA ^ bitB;
    }

    result[target] = state[i];
  }

  return result;
}

export function simulateCircuit(
  qubits: number,
  circuit: CircuitGate[],
): Complex[] {
  let state = createInitialState(qubits);

  const sortedCircuit = [...circuit].sort(
    (a, b) => a.column - b.column,
  );

  for (const operation of sortedCircuit) {
    switch (operation.gate) {
      case "CNOT":
        if (
          operation.controlQubit !== undefined
        ) {
          state = applyCNOT(
            state,
            operation.controlQubit,
            operation.qubit,
            qubits,
          );
        }
        break;

      case "CZ":
        if (
          operation.controlQubit !== undefined
        ) {
          state = applyCZ(
            state,
            operation.controlQubit,
            operation.qubit,
            qubits,
          );
        }
        break;

      case "SWAP":
        if (
          operation.controlQubit !== undefined
        ) {
          state = applySWAP(
            state,
            operation.controlQubit,
            operation.qubit,
            qubits,
          );
        }
        break;

      default:
        state = applySingleQubitGate(
          state,
          operation.gate,
          operation.qubit,
          qubits,
        );
    }
  }

  return state;
}

export function calculateProbabilities(
  state: Complex[],
): number[] {
  return state.map(magnitudeSquared);
}

export function formatComplex(
  value: Complex,
): string {
  const threshold = 1e-10;

  const re =
    Math.abs(value.re) < threshold
      ? 0
      : value.re;

  const im =
    Math.abs(value.im) < threshold
      ? 0
      : value.im;

  if (im === 0) {
    return re.toFixed(3);
  }

  if (re === 0) {
    return `${im.toFixed(3)}i`;
  }

  const sign = im >= 0 ? "+" : "-";

  return `${re.toFixed(3)} ${sign} ${Math.abs(
    im,
  ).toFixed(3)}i`;
}

export function basisLabel(
  index: number,
  qubits: number,
): string {
  return index
    .toString(2)
    .padStart(qubits, "0");
}