import type { Complex } from "./types";

export function sampleMeasurement(
  probabilities: number[],
  shots: number,
): number[] {
  const counts = Array.from(
    { length: probabilities.length },
    () => 0,
  );

  // Sample against the actual total so floating-point drift (sum slightly
  // above or below 1) never silently drops a shot.
  const total = probabilities.reduce(
    (sum, value) => sum + Math.max(0, value),
    0,
  );

  if (!(total > 0)) {
    return counts;
  }

  // Fallback for a draw that lands past the final cumulative value
  // due to rounding: the last outcome that can actually occur.
  let lastNonZero = probabilities.length - 1;

  while (
    lastNonZero > 0 &&
    !(probabilities[lastNonZero] > 0)
  ) {
    lastNonZero--;
  }

  for (let shot = 0; shot < shots; shot++) {
    const random = Math.random() * total;

    let cumulative = 0;
    let outcome = lastNonZero;

    for (let i = 0; i < probabilities.length; i++) {
      cumulative += Math.max(0, probabilities[i]);

      if (random < cumulative) {
        outcome = i;
        break;
      }
    }

    counts[outcome]++;
  }

  return counts;
}

export function normalizeProbabilities(
  probabilities: number[],
): number[] {
  const total = probabilities.reduce(
    (sum, value) => sum + value,
    0,
  );

  if (total === 0) {
    return probabilities;
  }

  return probabilities.map(
    (value) => value / total,
  );
}