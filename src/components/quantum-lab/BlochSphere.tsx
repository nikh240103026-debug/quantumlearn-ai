"use client";

import { useMemo } from "react";

import {
  calculateBlochVector,
  type BlochVector,
} from "@/lib/quantum/bloch";

import type { Complex } from "@/lib/quantum/types";

interface BlochSphereProps {
  state: Complex[];
  qubits: number;
}

function vectorLength(vector: BlochVector) {
  return Math.sqrt(
    vector.x * vector.x +
      vector.y * vector.y +
      vector.z * vector.z,
  );
}

/**
 * Calculate the reduced Bloch vector for one qubit
 * from the complete n-qubit state vector.
 *
 * For a qubit q:
 *
 * X = <X_q>
 * Y = <Y_q>
 * Z = <Z_q>
 *
 * This allows the Bloch sphere to visualize every
 * individual qubit even when the circuit contains
 * multiple qubits.
 */
function calculateQubitBlochVector(
  state: Complex[],
  qubits: number,
  targetQubit: number,
): BlochVector {
  const targetBit =
    1 << (qubits - targetQubit - 1);

  let x = 0;
  let y = 0;
  let z = 0;

  for (let index = 0; index < state.length; index++) {
    const amplitude = state[index];

    const isOne =
      (index & targetBit) !== 0;

    const probability =
      amplitude.re * amplitude.re +
      amplitude.im * amplitude.im;

    if (!isOne) {
      z += probability;

      const pairedIndex =
        index | targetBit;

      const paired =
        state[pairedIndex];

      if (paired) {
        const productRe =
          amplitude.re * paired.re +
          amplitude.im * paired.im;

        const productIm =
          amplitude.re * paired.im -
          amplitude.im * paired.re;

        x += 2 * productRe;
        y += 2 * productIm;
      }
    } else {
      z -= probability;
    }
  }

  return {
    x: Math.max(-1, Math.min(1, x)),
    y: Math.max(-1, Math.min(1, y)),
    z: Math.max(-1, Math.min(1, z)),
  };
}

function BlochSphereVisual({
  bloch,
}: {
  bloch: BlochVector;
}) {
  const pointX =
    150 + bloch.x * 105;

  const pointY =
    150 - bloch.z * 105;

  return (
    <div className="relative h-[300px] w-[300px] shrink-0">
      <svg
        viewBox="0 0 300 300"
        className="h-full w-full"
      >
        {/* Sphere */}
        <circle
          cx="150"
          cy="150"
          r="105"
          fill="none"
          stroke="currentColor"
          className="text-slate-700"
          strokeWidth="2"
        />

        {/* Horizontal ellipse */}
        <ellipse
          cx="150"
          cy="150"
          rx="105"
          ry="32"
          fill="none"
          stroke="currentColor"
          className="text-slate-800"
          strokeWidth="1.5"
        />

        {/* Vertical ellipse */}
        <ellipse
          cx="150"
          cy="150"
          rx="32"
          ry="105"
          fill="none"
          stroke="currentColor"
          className="text-slate-800"
          strokeWidth="1.5"
        />

        {/* X axis */}
        <line
          x1="35"
          y1="150"
          x2="265"
          y2="150"
          stroke="currentColor"
          className="text-slate-700"
        />

        {/* Z axis */}
        <line
          x1="150"
          y1="35"
          x2="150"
          y2="265"
          stroke="currentColor"
          className="text-slate-700"
        />

        {/* State vector */}
        <line
          x1="150"
          y1="150"
          x2={pointX}
          y2={pointY}
          stroke="currentColor"
          className="text-blue-500"
          strokeWidth="4"
        />

        {/* State point */}
        <circle
          cx={pointX}
          cy={pointY}
          r="8"
          fill="currentColor"
          className="text-blue-500"
        />

        {/* Labels */}
        <text
          x="150"
          y="22"
          textAnchor="middle"
          className="fill-slate-300 text-sm font-bold"
        >
          |0⟩
        </text>

        <text
          x="150"
          y="290"
          textAnchor="middle"
          className="fill-slate-300 text-sm font-bold"
        >
          |1⟩
        </text>

        <text
          x="278"
          y="155"
          textAnchor="middle"
          className="fill-slate-400 text-sm font-bold"
        >
          +X
        </text>

        <text
          x="22"
          y="155"
          textAnchor="middle"
          className="fill-slate-400 text-sm font-bold"
        >
          -X
        </text>

        <text
          x="160"
          y="40"
          className="fill-slate-500 text-[10px]"
        >
          +Z
        </text>

        <text
          x="160"
          y="263"
          className="fill-slate-500 text-[10px]"
        >
          -Z
        </text>
      </svg>
    </div>
  );
}

export default function BlochSphere({
  state,
  qubits,
}: BlochSphereProps) {
  const qubitVectors = useMemo(() => {
    if (
      qubits < 1 ||
      state.length !== 2 ** qubits
    ) {
      return [];
    }

    return Array.from(
      { length: qubits },
      (_, qubit) => ({
        qubit,
        bloch:
          calculateQubitBlochVector(
            state,
            qubits,
            qubit,
          ),
      }),
    );
  }, [state, qubits]);

  if (qubitVectors.length === 0) {
    return (
      <section className="border border-slate-800 bg-[#0a0f18] p-6 shadow-sm">
        <h2 className="font-bold text-white">
          Bloch Sphere
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          The Bloch sphere cannot be calculated
          because the current quantum state is
          incomplete or invalid.
        </p>
      </section>
    );
  }

  return (
    <section className="border border-slate-800 bg-[#0a0f18] p-6 shadow-sm">

      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-500">
          Quantum Visualization
        </p>

        <h2 className="mt-1 text-lg font-bold text-white">
          Bloch Sphere
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Reduced single-qubit representation
          of the current {qubits}-qubit state.
        </p>
      </div>

      <div className="grid gap-8 xl:grid-cols-2">

        {qubitVectors.map(
          ({
            qubit,
            bloch,
          }) => {
            const length =
              vectorLength(bloch);

            return (
              <div
                key={qubit}
                className="border border-slate-800 bg-[#070b12] p-5"
              >

                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-500">
                      Qubit
                    </p>

                    <h3 className="mt-1 font-mono text-lg font-bold text-white">
                      q[{qubit}]
                    </h3>
                  </div>

                  <div className="border border-slate-700 px-3 py-2 text-xs font-mono text-slate-300">
                    |r| = {length.toFixed(3)}
                  </div>
                </div>

                <div className="flex flex-col items-center gap-6">

                  <BlochSphereVisual
                    bloch={bloch}
                  />

                  <div className="w-full">

                    <div className="grid grid-cols-3 gap-3">

                      <div className="border border-slate-800 bg-[#0a0f18] p-3 text-center">
                        <p className="text-xs font-semibold text-slate-500">
                          X
                        </p>

                        <p className="mt-1 font-mono text-lg font-bold text-white">
                          {bloch.x.toFixed(3)}
                        </p>
                      </div>

                      <div className="border border-slate-800 bg-[#0a0f18] p-3 text-center">
                        <p className="text-xs font-semibold text-slate-500">
                          Y
                        </p>

                        <p className="mt-1 font-mono text-lg font-bold text-white">
                          {bloch.y.toFixed(3)}
                        </p>
                      </div>

                      <div className="border border-slate-800 bg-[#0a0f18] p-3 text-center">
                        <p className="text-xs font-semibold text-slate-500">
                          Z
                        </p>

                        <p className="mt-1 font-mono text-lg font-bold text-white">
                          {bloch.z.toFixed(3)}
                        </p>
                      </div>

                    </div>

                    <div className="mt-4 border border-slate-800 p-4">

                      <p className="text-sm font-semibold text-slate-300">
                        Bloch vector magnitude
                      </p>

                      <p className="mt-1 font-mono text-lg font-bold text-blue-500">
                        |r| = {length.toFixed(3)}
                      </p>

                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        A pure single-qubit state has
                        |r| = 1. For a qubit entangled
                        with other qubits, the reduced
                        state can have |r| &lt; 1.
                      </p>

                    </div>

                  </div>

                </div>

              </div>
            );
          },
        )}

      </div>

    </section>
  );
}