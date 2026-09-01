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

export default function BlochSphere({
  state,
  qubits,
}: BlochSphereProps) {
  const bloch = useMemo(() => {
    if (qubits !== 1 || state.length < 2) {
      return null;
    }

    return calculateBlochVector(
      state[0],
      state[1],
    );
  }, [state, qubits]);

  if (!bloch) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-bold text-slate-950">
          Bloch Sphere
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          The Bloch sphere currently supports a single
          qubit. Set the simulator to 1 qubit to visualize
          its quantum state.
        </p>
      </section>
    );
  }

  const length = vectorLength(bloch);

  const pointX = 150 + bloch.x * 105;
  const pointY = 150 - bloch.z * 105;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="font-bold text-slate-950">
          Bloch Sphere
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Geometric representation of the current single-qubit
          state.
        </p>
      </div>

      <div className="flex flex-col items-center gap-6 lg:flex-row">
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
              className="text-slate-300"
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
              className="text-slate-200"
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
              className="text-slate-200"
              strokeWidth="1.5"
            />

            {/* X axis */}
            <line
              x1="35"
              y1="150"
              x2="265"
              y2="150"
              stroke="currentColor"
              className="text-slate-300"
            />

            {/* Z axis */}
            <line
              x1="150"
              y1="35"
              x2="150"
              y2="265"
              stroke="currentColor"
              className="text-slate-300"
            />

            {/* State vector */}
            <line
              x1="150"
              y1="150"
              x2={pointX}
              y2={pointY}
              stroke="currentColor"
              className="text-blue-600"
              strokeWidth="4"
            />

            {/* State point */}
            <circle
              cx={pointX}
              cy={pointY}
              r="8"
              fill="currentColor"
              className="text-blue-600"
            />

            {/* Labels */}
            <text
              x="150"
              y="22"
              textAnchor="middle"
              className="fill-slate-700 text-sm font-bold"
            >
              |0⟩
            </text>

            <text
              x="150"
              y="290"
              textAnchor="middle"
              className="fill-slate-700 text-sm font-bold"
            >
              |1⟩
            </text>

            <text
              x="278"
              y="155"
              textAnchor="middle"
              className="fill-slate-700 text-sm font-bold"
            >
              +X
            </text>

            <text
              x="22"
              y="155"
              textAnchor="middle"
              className="fill-slate-700 text-sm font-bold"
            >
              -X
            </text>
          </svg>
        </div>

        <div className="w-full">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-slate-50 p-4 text-center">
              <p className="text-xs font-semibold text-slate-500">
                X
              </p>

              <p className="mt-1 font-mono text-xl font-bold">
                {bloch.x.toFixed(3)}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 text-center">
              <p className="text-xs font-semibold text-slate-500">
                Y
              </p>

              <p className="mt-1 font-mono text-xl font-bold">
                {bloch.y.toFixed(3)}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 text-center">
              <p className="text-xs font-semibold text-slate-500">
                Z
              </p>

              <p className="mt-1 font-mono text-xl font-bold">
                {bloch.z.toFixed(3)}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-700">
              State purity
            </p>

            <p className="mt-1 font-mono text-lg font-bold text-blue-600">
              |r| = {length.toFixed(3)}
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              A pure single-qubit state lies on the surface of
              the Bloch sphere, where |r| ≈ 1.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}