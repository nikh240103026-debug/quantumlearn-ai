"use client";

import type {
  BackendExecutionResult,
} from "@/lib/quantum/backends/types";

type Props = {
  result: BackendExecutionResult | null;
  loading: boolean;
  error: string | null;
};

export default function MultiBackendResult({
  result,
  loading,
  error,
}: Props) {
  return (
    <section className="border border-slate-800 bg-[#0a0f18] p-6">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-500">
          Backend Result
        </p>

        <h2 className="mt-1 text-lg font-bold text-white">
          Simulation output
        </h2>
      </div>

      {loading && (
        <div className="border border-blue-900 bg-blue-950/20 p-4 text-sm text-blue-300">
          Running quantum simulation...
        </div>
      )}

      {error && !loading && (
        <div className="border border-red-900 bg-red-950/20 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {result && !loading && (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="border border-slate-800 bg-[#070b12] p-4">
              <p className="text-xs text-slate-500">
                Backend
              </p>

              <p className="mt-1 font-semibold text-white">
                {result.backend}
              </p>
            </div>

            <div className="border border-slate-800 bg-[#070b12] p-4">
              <p className="text-xs text-slate-500">
                Outcomes
              </p>

              <p className="mt-1 font-semibold text-white">
                {Object.keys(
                  result.counts ?? {},
                ).length}
              </p>
            </div>

            <div className="border border-slate-800 bg-[#070b12] p-4">
              <p className="text-xs text-slate-500">
                Execution
              </p>

              <p className="mt-1 font-semibold text-white">
                {result.executionTimeMs ?? 0} ms
              </p>
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-semibold text-white">
              Measurement Counts
            </h3>

            <div className="space-y-2">
              {Object.entries(
                result.counts ?? {},
              ).map(
                ([state, count]) => (
                  <div
                    key={state}
                    className="flex items-center justify-between border border-slate-800 bg-[#070b12] px-4 py-3"
                  >
                    <span className="font-mono text-slate-200">
                      |{state}⟩
                    </span>

                    <span className="font-mono text-sm text-blue-400">
                      {count}
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-semibold text-white">
              Statevector
            </h3>

            <div className="max-h-80 space-y-2 overflow-auto">
              {result.statevector.map(
                (value, index) => {
                  const probability =
                    result.probabilities[
                      index
                    ] ?? 0;

                  if (
                    probability <
                    0.000001
                  ) {
                    return null;
                  }

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between border border-slate-800 bg-[#070b12] px-4 py-3"
                    >
                      <span className="font-mono text-slate-300">
                        |{index.toString(2).padStart(
                          Math.log2(
                            result.statevector.length,
                          ),
                          "0",
                        )}⟩
                      </span>

                      <span className="font-mono text-sm text-slate-300">
                        {value.re.toFixed(6)}
                        {value.im >= 0
                          ? "+"
                          : ""}
                        {value.im.toFixed(6)}i
                      </span>
                    </div>
                  );
                },
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}