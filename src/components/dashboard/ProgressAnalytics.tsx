import {
  Activity,
  BarChart3,
  Brain,
  Code2,
  FlaskConical,
  Target,
} from "lucide-react";

import type {
  ProgressAnalytics as ProgressAnalyticsData,
} from "@/lib/progress/progress-engine";

interface ProgressAnalyticsProps {
  analytics: ProgressAnalyticsData;
}

export function ProgressAnalytics({
  analytics,
}: ProgressAnalyticsProps) {
  return (
    <section className="mt-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              <BarChart3 size={14} />
              Progress Analytics
            </div>

            <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
              Your learning performance
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Real progress from lessons, practice, coding challenges, and Quantum Lab activity.
            </p>
          </div>

          <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl bg-slate-950 text-white">
            <span className="text-2xl font-bold">
              {analytics.overallMastery}%
            </span>

            <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              mastery
            </span>
          </div>
        </div>

        {/* MASTER INDICATOR */}

        <div className="mt-8">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">
              Overall learning mastery
            </span>

            <span className="text-sm font-bold text-blue-600">
              {analytics.overallMastery}%
            </span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-500"
              style={{
                width: `${analytics.overallMastery}%`,
              }}
            />
          </div>
        </div>

        {/* PRIMARY ANALYTICS */}

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <AnalyticsCard
            icon={<Target size={20} />}
            title="Curriculum"
            value={`${analytics.lessonProgress}%`}
            description={`${analytics.lessonsCompleted}/${analytics.totalLessons} lessons completed`}
          />

          <AnalyticsCard
            icon={<Brain size={20} />}
            title="Practice"
            value={`${analytics.practiceAverage}%`}
            description={`${analytics.practiceAttempts} attempts`}
          />

          <AnalyticsCard
            icon={<Code2 size={20} />}
            title="Coding"
            value={String(
              analytics.codingChallengesCompleted,
            )}
            description={`${analytics.codingPoints} points earned`}
          />

          <AnalyticsCard
            icon={<FlaskConical size={20} />}
            title="Quantum Lab"
            value={String(
              analytics.labRuns,
            )}
            description={`Runs · ${analytics.maxQubitsUsed} max qubits`}
          />

        </div>

        {/* DETAILED METRICS */}

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">

          <MetricBlock
            label="Best Practice Score"
            value={`${analytics.practiceBest}%`}
          />

          <MetricBlock
            label="Questions Answered"
            value={String(
              analytics.questionsAnswered,
            )}
          />

          <MetricBlock
            label="Active Learning Days"
            value={String(
              analytics.recentActiveDays,
            )}
          />

        </div>

        {/* LAB + ACTIVITY */}

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-2">
              <FlaskConical
                size={17}
                className="text-blue-600"
              />

              <h3 className="text-sm font-bold text-slate-900">
                Quantum Lab
              </h3>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">

              <SmallMetric
                label="Circuit runs"
                value={String(
                  analytics.labRuns,
                )}
              />

              <SmallMetric
                label="Measurements"
                value={String(
                  analytics.labMeasurements,
                )}
              />

            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-2">
              <Activity
                size={17}
                className="text-blue-600"
              />

              <h3 className="text-sm font-bold text-slate-900">
                Learning Activity
              </h3>
            </div>

            <div className="mt-4 flex items-end justify-between">

              <div>
                <p className="text-3xl font-bold text-slate-950">
                  {analytics.totalActivity}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  total recorded activities
                </p>
              </div>

              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                {analytics.recentActiveDays} active days
              </span>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

interface AnalyticsCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
}

function AnalyticsCard({
  icon,
  title,
  value,
  description,
}: AnalyticsCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600">
          {icon}
        </div>

        <span className="text-2xl font-bold text-slate-950">
          {value}
        </span>
      </div>

      <p className="mt-4 text-sm font-bold text-slate-900">
        {title}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}

function MetricBlock({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-950">
        {value}
      </p>
    </div>
  );
}

function SmallMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <p className="text-[11px] font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-lg font-bold text-slate-950">
        {value}
      </p>
    </div>
  );
}