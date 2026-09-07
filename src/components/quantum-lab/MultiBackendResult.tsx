"use client";

import type {
  BackendExecutionResult,
} from "@/lib/quantum/backends/types";

type Props = {
  result:
    | BackendExecutionResult
    | null;
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

      {result &&
        !loading && (
          <div className="space-y-6">

            {/* EXECUTION SUMMARY */}

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
                  Shots
                </p>

                <p className="mt-1 font-semibold text-white">
                  {result.shots ??
                    "—"}
                </p>
              </div>

              <div className="border border-slate-800 bg-[#070b12] p-4">
                <p className="text-xs text-slate-500">
                  Execution
                </p>

                <p className="mt-1 font-semibold text-white">
                  {result.executionTimeMs ??
                    0}{" "}
                  ms
                </p>
              </div>

              <div className="border border-slate-800 bg-[#070b12] p-4">
                <p className="text-xs text-slate-500">
                  Status
                </p>

                <p className="mt-1 font-semibold text-green-400">
                  {result.qbraidStatus ??
                    "COMPLETED"}
                </p>
              </div>
            </div>

            {/* JOB */}

            {result.jobId && (
              <div className="border border-slate-800 bg-[#070b12] p-4">
                <p className="text-xs text-slate-500">
                  Job ID
                </p>

                <p className="mt-1 break-all font-mono text-xs text-slate-300">
                  {result.jobId}
                </p>
              </div>
            )}

            {/* COUNTS */}

            <div>
              <h3 className="mb-3 font-semibold text-white">
                Measurement Counts
              </h3>

              {Object.keys(
                result.counts ?? {},
              ).length === 0 ? (
                <p className="text-sm text-slate-500">
                  No measurement counts returned.
                </p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {Object.entries(
                    result.counts,
                  ).map(
                    ([state, count]) => (
                      <div
                        key={state}
                        className="flex items-center justify-between border border-slate-800 bg-[#070b12] px-4 py-3"
                      >
                        <span className="font-mono text-slate-200">
                          |{state}⟩
                        </span>

                        <span className="font-mono font-semibold text-blue-400">
                          {count}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>

            {/* PROBABILITY DISTRIBUTION */}

            <div>
              <h3 className="mb-3 font-semibold text-white">
                Probability Distribution
              </h3>

              <div className="space-y-2">
                {Object.entries(
                  result.probabilityMap ??
                    {},
                )
                  .filter(
                    ([, probability]) =>
                      probability >
                      0.000001,
                  )
                  .map(
                    ([
                      state,
                      probability,
                    ]) => (
                      <div
                        key={state}
                        className="border border-slate-800 bg-[#070b12] p-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-slate-300">
                            |{state}⟩
                          </span>

                          <span className="font-mono text-sm text-white">
                            {(
                              probability *
                              100
                            ).toFixed(
                              2,
                            )}
                            %
                          </span>
                        </div>

                        <div className="mt-2 h-2 overflow-hidden bg-slate-800">
                          <div
                            className="h-full bg-blue-600 transition-all"
                            style={{
                              width: `${Math.min(
                                probability *
                                  100,
                                100,
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    ),
                  )}
              </div>
            </div>

            {/* STATEVECTOR */}

            {result.statevector ? (
              <div>
                <h3 className="mb-3 font-semibold text-white">
                  Statevector
                </h3>

                <div className="max-h-80 space-y-2 overflow-auto">
                  {result.statevector.map(
                    (
                      value,
                      index,
                    ) => {
                      const probability =
                        result.probabilities[
                          index
                        ] ??
                        0;

                      if (
                        probability <
                        0.000001
                      ) {
                        return null;
                      }

                      const qubits =
                        Math.log2(
                          result.statevector!
                            .length,
                        );

                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between border border-slate-800 bg-[#070b12] px-4 py-3"
                        >
                          <span className="font-mono text-slate-300">
                            |
                            {index
                              .toString(
                                2,
                              )
                              .padStart(
                                qubits,
                                "0",
                              )}
                            ⟩
                          </span>

                          <span className="font-mono text-sm text-slate-300">
                            {value.re.toFixed(
                              6,
                            )}
                            {value.im >=
                            0
                              ? "+"
                              : ""}
                            {value.im.toFixed(
                              6,
                            )}
                            i
                          </span>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
            ) : (
              <div className="border border-slate-800 bg-[#070b12] p-4">
                <p className="text-sm text-slate-400">
                  Exact statevector is not returned by this backend. Measurement probabilities are shown from the executed shots.
                </p>
              </div>
            )}

            {/* QBRAID DETAILS */}

            {result.backend ===
              "qbraid" && (
              <div className="space-y-4 border border-slate-800 bg-black p-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">
                    qBraid Device
                  </p>

                  <p className="mt-1 break-all font-mono text-sm text-slate-300">
                    {result.device}
                  </p>
                </div>

                {result.qasm && (
                  <details>
                    <summary className="cursor-pointer text-sm font-semibold text-slate-400">
                      OpenQASM 3
                    </summary>

                    <pre className="mt-3 max-h-80 overflow-auto border border-slate-800 bg-[#070b12] p-4 text-xs leading-5 text-slate-300">
                      {result.qasm}
                    </pre>
                  </details>
                )}
              </div>
            )}
          </div>
        )}
    </section>
  );
}