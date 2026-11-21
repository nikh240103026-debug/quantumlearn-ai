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
      // e^(iπ/4) = (1 + i) / √2
      complex(SQRT2_INV, SQRT2_INV),
    ],
  ],
  M: [
    [complex(1), complex(0)],
    [complex(0), complex(1)],
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

function applyOperation(
  state: Complex[],
  operation: CircuitGate,
  qubits: number,
): Complex[] {
  switch (operation.gate) {
    case "CNOT":
      return operation.controlQubit !== undefined
        ? applyCNOT(
            state,
            operation.controlQubit,
            operation.qubit,
            qubits,
          )
        : state;

    case "CZ":
      return operation.controlQubit !== undefined
        ? applyCZ(
            state,
            operation.controlQubit,
            operation.qubit,
            qubits,
          )
        : state;

    case "SWAP":
      return operation.controlQubit !== undefined
        ? applySWAP(
            state,
            operation.controlQubit,
            operation.qubit,
            qubits,
          )
        : state;

    default:
      return applySingleQubitGate(
        state,
        operation.gate,
        operation.qubit,
        qubits,
      );
  }
}

/*
 * ================================================================
 * MEASUREMENT (M gate)
 * ================================================================
 *
 * A mid-circuit measurement turns the pure state into a mixture of
 * collapsed branches. We track every branch with its probability
 * weight so the reported probabilities are exact, and display one
 * branch chosen at random (a single "run" of the experiment).
 */

type Branch = {
  weight: number;
  state: Complex[];
};

// Beyond this many branches, measurements collapse by sampling
// instead (probabilities become a single-run estimate).
const MAX_BRANCHES = 1024;

const BRANCH_EPSILON = 1e-12;

function projectQubit(
  state: Complex[],
  qubit: number,
  qubits: number,
  outcome: 0 | 1,
): { probability: number; state: Complex[] } {
  const mask = 1 << (qubits - qubit - 1);

  let probability = 0;

  for (let i = 0; i < state.length; i++) {
    if (((i & mask) !== 0) === (outcome === 1)) {
      probability += magnitudeSquared(state[i]);
    }
  }

  if (probability < BRANCH_EPSILON) {
    return { probability: 0, state };
  }

  const scale = 1 / Math.sqrt(probability);

  return {
    probability,
    state: state.map((amplitude, i) =>
      ((i & mask) !== 0) === (outcome === 1)
        ? {
            re: amplitude.re * scale,
            im: amplitude.im * scale,
          }
        : complex(0),
    ),
  };
}

// Repeated measurements often produce the same collapsed state along
// different paths; combining them keeps the branch count small.
function mergeIdenticalBranches(
  branches: Branch[],
): Branch[] {
  if (branches.length < 2) {
    return branches;
  }

  const merged = new Map<string, Branch>();

  for (const branch of branches) {
    const key = branch.state
      .map(
        (amplitude) =>
          `${amplitude.re.toFixed(9)},${amplitude.im.toFixed(9)}`,
      )
      .join(";");

    const existing = merged.get(key);

    if (existing) {
      existing.weight += branch.weight;
    } else {
      merged.set(key, {
        weight: branch.weight,
        state: branch.state,
      });
    }
  }

  return Array.from(merged.values());
}

export type SimulationResult = {
  // One measurement trajectory (equals the exact state when the
  // circuit has no M gates).
  state: Complex[];
  // Exact outcome probabilities over all measurement branches.
  probabilities: number[];
  // True when M gates collapsed the state.
  collapsed: boolean;
  // True if the branch limit forced sampled collapse.
  approximate: boolean;
};

export function simulateCircuitDetailed(
  qubits: number,
  circuit: CircuitGate[],
  random: () => number = Math.random,
): SimulationResult {
  let branches: Branch[] = [
    {
      weight: 1,
      state: createInitialState(qubits),
    },
  ];

  let collapsed = false;
  let approximate = false;

  // Same order as codegen and the Python engines.
  const sortedCircuit = [...circuit].sort(
    (a, b) =>
      a.column - b.column ||
      a.qubit - b.qubit,
  );

  for (const operation of sortedCircuit) {
    if (operation.gate !== "M") {
      branches = branches.map((branch) => ({
        weight: branch.weight,
        state: applyOperation(
          branch.state,
          operation,
          qubits,
        ),
      }));
      continue;
    }

    collapsed = true;

    const next: Branch[] = [];

    for (const branch of branches) {
      const zero = projectQubit(
        branch.state,
        operation.qubit,
        qubits,
        0,
      );
      const one = projectQubit(
        branch.state,
        operation.qubit,
        qubits,
        1,
      );

      if (approximate || branches.length * 2 > MAX_BRANCHES) {
        approximate = true;
        const total = zero.probability + one.probability;
        const pick =
          random() * total < zero.probability
            ? zero
            : one;
        next.push({
          weight: branch.weight,
          state: pick.state,
        });
        continue;
      }

      for (const outcome of [zero, one]) {
        const weight =
          branch.weight * outcome.probability;

        if (weight > BRANCH_EPSILON) {
          next.push({
            weight,
            state: outcome.state,
          });
        }
      }
    }

    branches = mergeIdenticalBranches(next);
  }

  const size = 2 ** qubits;
  const probabilities = new Array<number>(size).fill(0);
  let totalWeight = 0;

  for (const branch of branches) {
    totalWeight += branch.weight;

    for (let i = 0; i < size; i++) {
      probabilities[i] +=
        branch.weight *
        magnitudeSquared(branch.state[i]);
    }
  }

  if (totalWeight > 0 && Math.abs(totalWeight - 1) > 1e-9) {
    for (let i = 0; i < size; i++) {
      probabilities[i] /= totalWeight;
    }
  }

  // Pick the displayed trajectory with probability = branch weight.
  let state = branches[branches.length - 1].state;
  let draw = random() * totalWeight;

  for (const branch of branches) {
    draw -= branch.weight;

    if (draw < 0) {
      state = branch.state;
      break;
    }
  }

  return {
    state,
    probabilities,
    collapsed,
    approximate,
  };
}

export function simulateCircuit(
  qubits: number,
  circuit: CircuitGate[],
): Complex[] {
  return simulateCircuitDetailed(
    qubits,
    circuit,
  ).state;
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