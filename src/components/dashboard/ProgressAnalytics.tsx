"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  ProgressAnalytics as ProgressAnalyticsData,
} from "@/lib/progress/progress-engine";

interface PracticeHistoryPoint {
  label: string;
  value: number;
}

interface ProgressAnalyticsProps {
  analytics: ProgressAnalyticsData;
  practiceHistory?: PracticeHistoryPoint[];
}

export function ProgressAnalytics({
  analytics,
  practiceHistory = [],
}: ProgressAnalyticsProps) {
  const ref =
    useRef<HTMLElement>(null);

  const [visible, setVisible] =
    useState(false);

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

  const codingProgress =
    Math.min(
      100,
      Math.max(
        0,
        analytics.codingPoints,
      ),
    );

  const labProgress =
    Math.min(
      100,
      Math.max(
        0,
        analytics.labRuns * 10,
      ),
    );

  const graphData =
    practiceHistory.length > 0
      ? practiceHistory
      : [
          {
            label: "Average",
            value:
              analytics.practiceAverage,
          },
          {
            label: "Best",
            value:
              analytics.practiceBest,
          },
        ];

  return (
    <section
      ref={ref}
      className="border-b border-black/10 bg-[#090c11] text-white"
    >
      <div className="mx-auto max-w-[1600px]">
        <div className="grid lg:grid-cols-[0.35fr_1fr]">
          {/* LABEL */}

          <div className="border-b border-white/10 p-6 sm:p-10 lg:border-b-0 lg:border-r lg:p-16">
            <div
              className={`transition-all duration-900 ${
                visible
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-8 opacity-0"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/35">
                05 — Analytics
              </p>

              <p className="mt-24 max-w-xs text-4xl font-medium leading-[1.02] tracking-[-0.04em]">
                See how your learning activity becomes progress.
              </p>
            </div>
          </div>

          {/* ANALYTICS */}

          <div className="p-6 sm:p-10 lg:p-16">
            <div
              className={`transition-all duration-900 ${
                visible
                  ? "translate-x-0 opacity-100"
                  : "translate-x-8 opacity-0"
              }`}
            >
              <p className="text-xs uppercase tracking-[0.18em] text-blue-400">
                Progress analytics
              </p>

              <div className="mt-5 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h2 className="text-4xl font-medium leading-[1.02] tracking-[-0.045em] sm:text-5xl">
                    Your learning performance
                  </h2>

                  <p className="mt-6 max-w-2xl text-base leading-7 text-white/50">
                    Progress combines curriculum completion,
                    practice performance, coding activity,
                    and Quantum Lab experimentation.
                  </p>
                </div>

                <div className="shrink-0">
                  <p className="text-7xl font-medium tracking-[-0.06em]">
                    {analytics.overallMastery}
                    <span className="text-2xl text-white/30">
                      %
                    </span>
                  </p>

                  <p className="mt-2 text-xs uppercase tracking-[0.16em] text-white/30">
                    Overall mastery
                  </p>
                </div>
              </div>
            </div>

            {/* MASTERY GRAPH */}

            <div
              className={`mt-16 grid gap-10 border-y border-white/10 py-10 lg:grid-cols-[1fr_220px] transition-all duration-1000 delay-150 ${
                visible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}
            >
              <div>
                <div className="mb-5 flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.16em] text-white/35">
                    Mastery profile
                  </p>

                  <p className="text-xs text-white/35">
                    0 — 100
                  </p>
                </div>

                <div className="space-y-6">
                  <ProgressBar
                    label="Curriculum"
                    value={
                      analytics.lessonProgress
                    }
                    visible={visible}
                    delay={200}
                  />

                  <ProgressBar
                    label="Practice"
                    value={
                      analytics.practiceAverage
                    }
                    visible={visible}
                    delay={300}
                  />

                  <ProgressBar
                    label="Coding"
                    value={codingProgress}
                    visible={visible}
                    delay={400}
                  />

                  <ProgressBar
                    label="Quantum Lab"
                    value={labProgress}
                    visible={visible}
                    delay={500}
                  />
                </div>
              </div>

              {/* DONUT */}

              <div className="flex items-center justify-center border-t border-white/10 pt-10 lg:border-l lg:border-t-0 lg:pt-0">
                <MasteryRing
                  value={
                    analytics.overallMastery
                  }
                  visible={visible}
                />
              </div>
            </div>

            {/* PRACTICE GRAPH */}

            <div
              className={`mt-10 border-b border-white/10 pb-10 transition-all duration-1000 delay-300 ${
                visible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}
            >
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-white/35">
                    Practice trajectory
                  </p>

                  <p className="mt-2 text-sm text-white/45">
                    Recent practice performance
                  </p>
                </div>

                <p className="text-xs text-white/30">
                  Percentage
                </p>
              </div>

              <div className="mt-8 flex h-48 items-end gap-3 border-b border-white/10">
                {graphData.map(
                  (point, index) => (
                    <div
                      key={`${point.label}-${index}`}
                      className="group flex h-full flex-1 flex-col justify-end"
                    >
                      <div className="relative flex h-full items-end">
                        <div
                          className={`w-full bg-blue-500/70 transition-all duration-1000 ease-out group-hover:bg-blue-400 ${
                            visible
                              ? "scale-y-100"
                              : "scale-y-0"
                          }`}
                          style={{
                            height: `${Math.max(
                              3,
                              point.value,
                            )}%`,
                            transformOrigin:
                              "bottom",
                            transitionDelay: `${
                              350 +
                              index * 70
                            }ms`,
                          }}
                        />

                        <span className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 text-[10px] text-white/0 transition-colors group-hover:text-white/70">
                          {point.value}%
                        </span>
                      </div>

                      <p className="mt-3 text-center text-[10px] uppercase tracking-[0.12em] text-white/25">
                        {point.label}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </div>

            {/* METRICS */}

            <div
              className={`mt-10 grid border-t border-white/10 sm:grid-cols-3 transition-all duration-900 delay-500 ${
                visible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}
            >
              <DarkMetric
                label="Best practice score"
                value={`${analytics.practiceBest}%`}
              />

              <DarkMetric
                label="Questions answered"
                value={String(
                  analytics.questionsAnswered,
                )}
              />

              <DarkMetric
                label="Recorded activities"
                value={String(
                  analytics.totalActivity,
                )}
              />
            </div>

            {/* LAB + ACTIVITY */}

            <div className="mt-10 grid gap-10 border-t border-white/10 pt-10 md:grid-cols-2">
              <div
                className={`transition-all duration-900 delay-500 ${
                  visible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-8 opacity-0"
                }`}
              >
                <p className="text-xs uppercase tracking-[0.16em] text-white/30">
                  Quantum Lab
                </p>

                <div className="mt-7 grid grid-cols-2">
                  <div className="border-r border-white/10 pr-6">
                    <p className="text-4xl font-medium tracking-[-0.05em]">
                      {analytics.labRuns}
                    </p>

                    <p className="mt-2 text-xs uppercase tracking-[0.14em] text-white/30">
                      Circuit runs
                    </p>
                  </div>

                  <div className="pl-6">
                    <p className="text-4xl font-medium tracking-[-0.05em]">
                      {analytics.labMeasurements}
                    </p>

                    <p className="mt-2 text-xs uppercase tracking-[0.14em] text-white/30">
                      Measurements
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`border-t border-white/10 pt-8 transition-all duration-900 delay-600 md:border-l md:border-t-0 md:pl-10 md:pt-0 ${
                  visible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-8 opacity-0"
                }`}
              >
                <p className="text-xs uppercase tracking-[0.16em] text-white/30">
                  Learning activity
                </p>

                <p className="mt-7 text-4xl font-medium tracking-[-0.05em]">
                  {analytics.totalActivity}
                </p>

                <p className="mt-2 text-sm leading-6 text-white/40">
                  Total recorded learning and experimentation
                  activities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// PROGRESS BAR
// ============================================================

function ProgressBar({
  label,
  value,
  visible,
  delay,
}: {
  label: string;
  value: number;
  visible: boolean;
  delay: number;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-white/60">
          {label}
        </span>

        <span className="text-xs text-white/35">
          {value}%
        </span>
      </div>

      <div className="h-px bg-white/10">
        <div
          className={`h-full bg-blue-500 transition-all duration-1000 ease-out ${
            visible
              ? "w-full"
              : "w-0"
          }`}
          style={{
            width: visible
              ? `${value}%`
              : "0%",
            transitionDelay: `${delay}ms`,
          }}
        />
      </div>
    </div>
  );
}

// ============================================================
// MASTERY RING
// ============================================================

function MasteryRing({
  value,
  visible,
}: {
  value: number;
  visible: boolean;
}) {
  const radius = 72;
  const circumference =
    2 * Math.PI * radius;

  const offset =
    circumference -
    (value / 100) *
      circumference;

  return (
    <div className="relative h-44 w-44">
      <svg
        className="h-full w-full -rotate-90"
        viewBox="0 0 180 180"
      >
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="2"
        />

        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          strokeLinecap="square"
          strokeDasharray={circumference}
          strokeDashoffset={
            visible
              ? offset
              : circumference
          }
          className="transition-all duration-[1400ms] ease-out"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-medium tracking-[-0.05em]">
          {value}%
        </span>

        <span className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/30">
          mastery
        </span>
      </div>
    </div>
  );
}

// ============================================================
// DARK METRIC
// ============================================================

function DarkMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-b border-white/10 py-7 sm:border-b-0 sm:border-r sm:px-7 sm:first:pl-0 sm:last:border-r-0">
      <p className="text-xs uppercase tracking-[0.14em] text-white/30">
        {label}
      </p>

      <p className="mt-4 text-3xl font-medium tracking-[-0.05em]">
        {value}
      </p>
    </div>
  );
}