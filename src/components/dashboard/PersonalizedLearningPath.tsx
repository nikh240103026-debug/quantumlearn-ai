"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

type Analysis = {
  strengths: string[];
  weakAreas: string[];
  learningPattern: string;
  practicePattern: string;
  recommendedNextTopic: string;
  recommendedChapter: number | null;
  recommendedDifficulty: string;
  reason: string;
  priorityActions: string[];
};

type AnalysisResponse = {
  success?: boolean;
  analysis?: Analysis;
  error?: string;
};

export default function PersonalizedLearningPath() {
  const ref =
    useRef<HTMLElement>(null);

  const [visible, setVisible] =
    useState(false);

  const [analysis, setAnalysis] =
    useState<Analysis | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const observer =
      new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        },
        {
          threshold: 0.08,
        },
      );

    observer.observe(element);

    return () =>
      observer.disconnect();
  }, []);

  async function generateAnalysis() {
    if (loading) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response =
        await fetch(
          "/api/ai/analyze",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            cache: "no-store",
          },
        );

      const data =
        (await response.json()) as AnalysisResponse;

      if (
        !response.ok ||
        !data.analysis
      ) {
        throw new Error(
          data.error ??
            "Unable to generate your personalized learning path.",
        );
      }

      setAnalysis(
        data.analysis,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to generate personalized recommendations.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      ref={ref}
      className="border-b border-black/10 bg-[#f5f5f3]"
    >
      <div className="mx-auto max-w-[1600px]">
        <div className="grid lg:grid-cols-[0.35fr_1fr]">
          {/* LEFT */}

          <div className="border-b border-black/10 p-6 sm:p-10 lg:border-b-0 lg:border-r lg:p-16">
            <div
              className={`transition-all duration-900 ${
                visible
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-8 opacity-0"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/40">
                06 — AI intelligence
              </p>

              <p className="mt-24 max-w-xs text-4xl font-medium leading-[1.02] tracking-[-0.04em]">
                Turn your learning activity into a focused next step.
              </p>
            </div>
          </div>

          {/* RIGHT */}

          <div className="p-6 sm:p-10 lg:p-16">
            <div
              className={`transition-all duration-900 ${
                visible
                  ? "translate-x-0 opacity-100"
                  : "translate-x-8 opacity-0"
              }`}
            >
              <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-blue-600">
                    AI learning intelligence
                  </p>

                  <h2 className="mt-5 text-4xl font-medium leading-[1.02] tracking-[-0.045em] sm:text-5xl">
                    Personalized learning path
                  </h2>

                  <p className="mt-6 max-w-2xl text-base leading-7 text-black/55">
                    AI analyzes your actual lessons, practice performance,
                    coding activity, and Quantum Lab usage to recommend
                    what to focus on next.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    generateAnalysis
                  }
                  disabled={loading}
                  className="shrink-0 border border-black/20 px-6 py-3.5 text-sm font-semibold transition-all hover:border-blue-600 hover:bg-blue-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {loading
                    ? "Analyzing..."
                    : analysis
                      ? "Refresh path"
                      : "Generate path"}
                </button>
              </div>
            </div>

            {/* ERROR */}

            {error && (
              <div className="mt-10 border border-red-500/30 bg-red-500/5 p-5">
                <p className="text-sm leading-6 text-red-700">
                  {error}
                </p>
              </div>
            )}

            {/* EMPTY */}

            {!analysis &&
              !loading &&
              !error && (
                <div
                  className={`mt-14 border-y border-dashed border-black/15 py-14 transition-all duration-900 delay-200 ${
                    visible
                      ? "translate-y-0 opacity-100"
                      : "translate-y-8 opacity-0"
                  }`}
                >
                  <p className="text-xs uppercase tracking-[0.16em] text-black/30">
                    Awaiting analysis
                  </p>

                  <h3 className="mt-5 text-2xl font-medium tracking-tight">
                    Build your personalized roadmap.
                  </h3>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-black/50">
                    Generate an analysis from your recorded learning,
                    practice, coding, and Quantum Lab activity.
                  </p>
                </div>
              )}

            {/* LOADING */}

            {loading && (
              <div className="mt-14 grid gap-6 md:grid-cols-3">
                <LoadingBlock />
                <LoadingBlock />
                <LoadingBlock />
              </div>
            )}

            {/* RESULT */}

            {analysis &&
              !loading && (
                <div className="mt-14">
                  {/* NEXT STEP */}

                  <div
                    className={`border-y border-black/10 py-9 transition-all duration-900 ${
                      visible
                        ? "translate-y-0 opacity-100"
                        : "translate-y-8 opacity-0"
                    }`}
                  >
                    <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-blue-600">
                          Recommended next step
                        </p>

                        <h3 className="mt-5 max-w-3xl text-3xl font-medium leading-tight tracking-[-0.04em]">
                          {
                            analysis.recommendedNextTopic
                          }
                        </h3>

                        {analysis.recommendedChapter && (
                          <p className="mt-4 text-xs uppercase tracking-[0.14em] text-black/40">
                            Chapter{" "}
                            {
                              analysis.recommendedChapter
                            }
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="border border-black/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-black/50">
                          {
                            analysis.recommendedDifficulty
                          }
                        </span>

                        {analysis.recommendedChapter && (
                          <a
                            href={`/roadmap?chapter=${analysis.recommendedChapter}`}
                            className="bg-[#090c11] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
                          >
                            Open roadmap
                          </a>
                        )}
                      </div>
                    </div>

                    <p className="mt-7 max-w-3xl border-l-2 border-blue-500 pl-5 text-sm leading-7 text-black/55">
                      {analysis.reason}
                    </p>
                  </div>

                  {/* STRENGTHS / WEAK AREAS */}

                  <div className="grid border-b border-black/10 lg:grid-cols-2">
                    <InsightColumn
                      title="Your strengths"
                      items={
                        analysis.strengths
                      }
                      emptyText="Not enough evidence yet."
                      delay={100}
                    />

                    <InsightColumn
                      title="Focus areas"
                      items={
                        analysis.weakAreas
                      }
                      emptyText="No clear weak areas detected yet."
                      delay={180}
                      bordered
                    />
                  </div>

                  {/* PATTERNS */}

                  <div className="grid border-b border-black/10 lg:grid-cols-2">
                    <PatternBlock
                      title="Learning pattern"
                      text={
                        analysis.learningPattern
                      }
                    />

                    <PatternBlock
                      title="Practice pattern"
                      text={
                        analysis.practicePattern
                      }
                      bordered
                    />
                  </div>

                  {/* PRIORITY ACTIONS */}

                  <div className="pt-10">
                    <p className="text-xs uppercase tracking-[0.16em] text-black/35">
                      Priority actions
                    </p>

                    {analysis.priorityActions.length >
                    0 ? (
                      <div className="mt-7 grid border-t border-black/10 md:grid-cols-2">
                        {analysis.priorityActions.map(
                          (
                            action,
                            index,
                          ) => (
                            <div
                              key={`${action}-${index}`}
                              className={`border-b border-black/10 py-6 transition-all duration-700 ${
                                visible
                                  ? "translate-y-0 opacity-100"
                                  : "translate-y-6 opacity-0"
                              } ${
                                index %
                                  2 ===
                                0
                                  ? "md:border-r md:pr-8"
                                  : "md:pl-8"
                              }`}
                              style={{
                                transitionDelay: `${
                                  200 +
                                  index *
                                    80
                                }ms`,
                              }}
                            >
                              <div className="flex gap-5">
                                <span className="text-xs text-black/25">
                                  {String(
                                    index +
                                      1,
                                  ).padStart(
                                    2,
                                    "0",
                                  )}
                                </span>

                                <p className="max-w-xl text-sm leading-7 text-black/55">
                                  {
                                    action
                                  }
                                </p>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    ) : (
                      <p className="mt-5 text-sm text-black/45">
                        No priority actions were generated.
                      </p>
                    )}
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// INSIGHT COLUMN
// ============================================================

function InsightColumn({
  title,
  items,
  emptyText,
  delay,
  bordered = false,
}: {
  title: string;
  items: string[];
  emptyText: string;
  delay: number;
  bordered?: boolean;
}) {
  return (
    <div
      className={`py-9 transition-all duration-800 ${
        bordered
          ? "border-t border-black/10 lg:border-l lg:border-t-0 lg:pl-10"
          : "lg:pr-10"
      }`}
      style={{
        transitionDelay: `${delay}ms`,
      }}
    >
      <p className="text-xs uppercase tracking-[0.16em] text-black/35">
        {title}
      </p>

      {items.length > 0 ? (
        <div className="mt-6 space-y-4">
          {items.map(
            (item, index) => (
              <div
                key={`${item}-${index}`}
                className="border-b border-black/10 pb-4 text-sm leading-6 text-black/60"
              >
                {item}
              </div>
            ),
          )}
        </div>
      ) : (
        <p className="mt-6 text-sm text-black/45">
          {emptyText}
        </p>
      )}
    </div>
  );
}

// ============================================================
// PATTERN
// ============================================================

function PatternBlock({
  title,
  text,
  bordered = false,
}: {
  title: string;
  text: string;
  bordered?: boolean;
}) {
  return (
    <div
      className={`py-9 ${
        bordered
          ? "border-t border-black/10 lg:border-l lg:border-t-0 lg:pl-10"
          : "lg:pr-10"
      }`}
    >
      <p className="text-xs uppercase tracking-[0.16em] text-black/35">
        {title}
      </p>

      <p className="mt-5 max-w-xl text-base leading-7 text-black/55">
        {text}
      </p>
    </div>
  );
}

// ============================================================
// LOADING
// ============================================================

function LoadingBlock() {
  return (
    <div className="border-y border-black/10 py-8">
      <div className="h-3 w-24 animate-pulse bg-black/10" />

      <div className="mt-6 h-6 w-3/4 animate-pulse bg-black/10" />

      <div className="mt-4 h-3 w-full animate-pulse bg-black/10" />

      <div className="mt-3 h-3 w-5/6 animate-pulse bg-black/10" />
    </div>
  );
}