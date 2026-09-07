"use client";

import {
  Activity,
  BookOpen,
  Brain,
  Code2,
  FlaskConical,
  Target,
  Trophy,
} from "lucide-react";

type Student = {
  id: string;
  name: string;
  institute: string;
  branch: string;
  quantumExperience: string;
  learningGoal: string | null;
  lessonProgress: number;
  completedLessons: number;
  practiceAverage: number;
  practiceAttempts: number;
  codingChallenges: number;
  codingPoints: number;
  labRuns: number;
  labMeasurements: number;
  activeDays: number;
  lastActivity: string | null;
};

export default function StudentAnalytics({
  student,
}: {
  student: Student;
}) {
  const mastery = Math.min(
    100,
    Math.round(
      student.lessonProgress *
        0.5 +
        student.practiceAverage *
          0.25 +
        Math.min(
          100,
          student.codingPoints,
        ) *
          0.15 +
        Math.min(
          100,
          student.labRuns * 10,
        ) *
          0.1,
    ),
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Student Analytics
            </p>

            <h2 className="mt-2 text-2xl font-bold text-slate-950">
              {student.name}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {student.institute} ·{" "}
              {student.branch}
            </p>
          </div>

          <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl bg-slate-950 text-white">
            <span className="text-2xl font-bold">
              {mastery}%
            </span>

            <span className="text-[9px] uppercase tracking-wider text-slate-400">
              mastery
            </span>
          </div>
        </div>

        <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-600"
            style={{
              width: `${mastery}%`,
            }}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          icon={<BookOpen size={18} />}
          label="Curriculum"
          value={`${student.lessonProgress}%`}
          description={`${student.completedLessons} lessons`}
        />

        <Metric
          icon={<Brain size={18} />}
          label="Practice"
          value={`${student.practiceAverage}%`}
          description={`${student.practiceAttempts} attempts`}
        />

        <Metric
          icon={<Code2 size={18} />}
          label="Coding"
          value={`${student.codingPoints}`}
          description={`${student.codingChallenges} challenges`}
        />

        <Metric
          icon={<FlaskConical size={18} />}
          label="Quantum Lab"
          value={`${student.labRuns}`}
          description={`${student.labMeasurements} measurements`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <Target
              size={17}
              className="text-blue-600"
            />

            <h3 className="text-sm font-bold text-slate-900">
              Learner profile
            </h3>
          </div>

          <div className="mt-4 space-y-3 text-sm">
            <ProfileRow
              label="Quantum experience"
              value={
                student.quantumExperience
              }
            />

            <ProfileRow
              label="Learning goal"
              value={
                student.learningGoal ??
                "Not specified"
              }
            />

            <ProfileRow
              label="Active days"
              value={String(
                student.activeDays,
              )}
            />

            <ProfileRow
              label="Last activity"
              value={
                student.lastActivity
                  ? new Date(
                      student.lastActivity,
                    ).toLocaleString()
                  : "No activity"
              }
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <Activity
              size={17}
              className="text-blue-600"
            />

            <h3 className="text-sm font-bold text-slate-900">
              Instructor overview
            </h3>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <SmallMetric
              icon={
                <Trophy size={15} />
              }
              label="Mastery"
              value={`${mastery}%`}
            />

            <SmallMetric
              icon={
                <Code2 size={15} />
              }
              label="Coding points"
              value={String(
                student.codingPoints,
              )}
            />

            <SmallMetric
              icon={
                <FlaskConical size={15} />
              }
              label="Lab runs"
              value={String(
                student.labRuns,
              )}
            />

            <SmallMetric
              icon={
                <BookOpen size={15} />
              }
              label="Lessons"
              value={String(
                student.completedLessons,
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          {icon}
        </div>

        <span className="text-2xl font-bold text-slate-950">
          {value}
        </span>
      </div>

      <p className="mt-4 text-sm font-bold text-slate-900">
        {label}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}

function ProfileRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
      <span className="text-slate-500">
        {label}
      </span>

      <span className="max-w-[60%] text-right font-semibold text-slate-800">
        {value}
      </span>
    </div>
  );
}

function SmallMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-blue-600">
        {icon}

        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          {label}
        </span>
      </div>

      <p className="mt-2 text-xl font-bold text-slate-950">
        {value}
      </p>
    </div>
  );
}