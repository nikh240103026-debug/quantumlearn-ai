"use client";

import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Lightbulb,
  RefreshCw,
  Target,
  Zap,
} from "lucide-react";

import { useState } from "react";

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
  const [analysis, setAnalysis] =
    useState<Analysis | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

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
    <section className="mt-8">
      <div className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm sm:p-8">

        {/* HEADER */}

        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              <Brain size={14} />
              AI Learning Intelligence
            </div>

            <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
              Personalized Learning Path
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              AI analyzes your real learning activity and recommends what you should study next.
            </p>
          </div>

          <button
            type="button"
            onClick={
              generateAnalysis
            }
            disabled={loading}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            {loading
              ? "Analyzing..."
              : analysis
                ? "Refresh Path"
                : "Generate My Path"}
          </button>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700">
              {error}
            </p>
          </div>
        )}

        {/* EMPTY */}

        {!analysis &&
          !loading &&
          !error && (
            <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <Brain
                size={30}
                className="mx-auto text-blue-500"
              />

              <h3 className="mt-3 text-sm font-bold text-slate-900">
                Build your personalized roadmap
              </h3>

              <p className="mx-auto mt-1 max-w-xl text-sm leading-6 text-slate-500">
                Generate an AI analysis from your actual lessons, practice performance, coding activity, and Quantum Lab usage.
              </p>
            </div>
          )}

        {/* LOADING */}

        {loading && (
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
          </div>
        )}

        {/* RESULT */}

        {analysis &&
          !loading && (
            <div className="mt-8 space-y-6">

              {/* NEXT STEP */}

              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 sm:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700">
                      <Target size={14} />
                      Recommended Next Step
                    </div>

                    <h3 className="mt-2 text-xl font-bold text-slate-950">
                      {
                        analysis.recommendedNextTopic
                      }
                    </h3>

                    {analysis.recommendedChapter && (
                      <p className="mt-2 text-sm text-slate-600">
                        Recommended chapter:{" "}
                        <span className="font-semibold">
                          Chapter{" "}
                          {
                            analysis.recommendedChapter
                          }
                        </span>
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <span className="rounded-full border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold capitalize text-blue-700">
                      {
                        analysis.recommendedDifficulty
                      }
                    </span>

                    {analysis.recommendedChapter && (
                      <a
                        href={`/roadmap?chapter=${analysis.recommendedChapter}`}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        Open Roadmap
                        <ArrowRight
                          size={15}
                        />
                      </a>
                    )}
                  </div>
                </div>

                <div className="mt-5 border-t border-blue-200 pt-4">
                  <p className="text-sm leading-6 text-slate-700">
                    {analysis.reason}
                  </p>
                </div>
              </div>

              {/* STRENGTHS + WEAK AREAS */}

              <div className="grid gap-4 lg:grid-cols-2">

                <InsightCard
                  icon={
                    <CheckCircle2
                      size={18}
                    />
                  }
                  title="Your strengths"
                  items={
                    analysis.strengths
                  }
                  emptyText="Not enough evidence yet."
                  variant="success"
                />

                <InsightCard
                  icon={
                    <Target
                      size={18}
                    />
                  }
                  title="Focus areas"
                  items={
                    analysis.weakAreas
                  }
                  emptyText="No clear weak areas detected yet."
                  variant="warning"
                />

              </div>

              {/* LEARNING PATTERNS */}

              <div className="grid gap-4 lg:grid-cols-2">

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center gap-2">
                    <Brain
                      size={17}
                      className="text-blue-600"
                    />

                    <h3 className="text-sm font-bold text-slate-900">
                      Learning pattern
                    </h3>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {
                      analysis.learningPattern
                    }
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center gap-2">
                    <Zap
                      size={17}
                      className="text-amber-500"
                    />

                    <h3 className="text-sm font-bold text-slate-900">
                      Practice pattern
                    </h3>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {
                      analysis.practicePattern
                    }
                  </p>
                </div>

              </div>

              {/* PRIORITY ACTIONS */}

              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-2">
                  <Lightbulb
                    size={17}
                    className="text-blue-600"
                  />

                  <h3 className="text-sm font-bold text-slate-900">
                    Priority actions
                  </h3>
                </div>

                {analysis.priorityActions.length >
                0 ? (
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {analysis.priorityActions.map(
                      (
                        action,
                        index,
                      ) => (
                        <div
                          key={`${action}-${index}`}
                          className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4"
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                            {index +
                              1}
                          </span>

                          <p className="text-sm leading-6 text-slate-600">
                            {action}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">
                    No priority actions were generated.
                  </p>
                )}
              </div>

            </div>
          )}
      </div>
    </section>
  );
}

function InsightCard({
  icon,
  title,
  items,
  emptyText,
  variant,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
  emptyText: string;
  variant:
    | "success"
    | "warning";
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2">
        <div
          className={`${
            variant === "success"
              ? "text-emerald-600"
              : "text-amber-600"
          }`}
        >
          {icon}
        </div>

        <h3 className="text-sm font-bold text-slate-900">
          {title}
        </h3>
      </div>

      {items.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {items.map(
            (
              item,
              index,
            ) => (
              <span
                key={`${item}-${index}`}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700"
              >
                {item}
              </span>
            ),
          )}
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-500">
          {emptyText}
        </p>
      )}
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-200 bg-slate-50 p-5">
      <div className="h-4 w-32 rounded bg-slate-200" />
      <div className="mt-4 h-6 w-3/4 rounded bg-slate-200" />
      <div className="mt-3 h-4 w-full rounded bg-slate-200" />
      <div className="mt-2 h-4 w-5/6 rounded bg-slate-200" />
    </div>
  );
}