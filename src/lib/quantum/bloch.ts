import type { Complex } from "./types";

export type BlochVector = {
  x: number;
  y: number;
  z: number;
};

function multiply(a: Complex, b: Complex): Complex {
  return {
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re,
  };
}

function conjugate(value: Complex): Complex {
  return {
    re: value.re,
    im: -value.im,
  };
}

function clamp(value: number): number {
  return Math.max(-1, Math.min(1, value));
}

export function calculateBlochVector(
  alpha: Complex,
  beta: Complex,
): BlochVector {
  const alphaConjugate = conjugate(alpha);

  const product = multiply(
    alphaConjugate,
    beta,
  );

  const alphaProbability =
    alpha.re * alpha.re +
    alpha.im * alpha.im;

  const betaProbability =
    beta.re * beta.re +
    beta.im * beta.im;

  return {
    x: clamp(2 * product.re),
    y: clamp(2 * product.im),
    z: clamp(
      alphaProbability - betaProbability,
    ),
  };
}