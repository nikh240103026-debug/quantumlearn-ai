import type { Complex } from "./types";

export function sampleMeasurement(
  probabilities: number[],
  shots: number,
): number[] {
  const counts = Array.from(
    { length: probabilities.length },
    () => 0,
  );

  for (let shot = 0; shot < shots; shot++) {
    const random = Math.random();

    let cumulative = 0;

    for (let i = 0; i < probabilities.length; i++) {
      cumulative += probabilities[i];

      if (random <= cumulative) {
        counts[i]++;
        break;
      }
    }
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