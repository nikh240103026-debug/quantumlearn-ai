// fixing deployemeny error
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock3,
  Edit3,
  Eye,
  FileQuestion,
  MoreHorizontal,
  Archive,
  BarChart3,
} from "lucide-react";

const lesson = {
  title: "What Is Quantum Computing?",
  slug: "what-is-quantum-computing",
  course: "Quantum Computing Fundamentals",
  chapter: "Introduction to Quantum Computing",
  status: "Published",
  type: "Theory",
  description:
    "An introduction to quantum computing, how it differs from classical computing, and why quantum systems can solve certain problems in fundamentally different ways.",
  updated: "September 29, 2026",
  published: "September 12, 2026",
  completions: 842,
  averageTime: "14 min",
  practiceQuestions: 8,
  aiInteractions: 327,
};

const sections = [
  {
    number: "01",
    title: "Introduction",
    description:
      "Overview of quantum computing and the problems it is designed to address.",
    status: "Published",
  },
  {
    number: "02",
    title: "Classical Computing",
    description:
      "How classical bits, logic gates, processors, and algorithms work.",
    status: "Published",
  },
  {
    number: "03",
    title: "Quantum Computing",
    description:
      "Introduction to qubits, superposition, measurement, and quantum states.",
    status: "Published",
  },
  {
    number: "04",
    title: "Why Quantum Computing Matters",
    description:
      "Examples of problems where quantum computing may provide advantages.",
    status: "Published",
  },
];

export default function AdminLessonDetailsPage() {
  const params = useParams();
  const lessonId = params?.id;

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-6">
        <Link
          href="/admin/lessons"
          className="inline-flex items-center gap-2 text-xs text-white/40 transition hover:text-cyan-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Lessons
        </Link>
      </div>

      <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center border border-cyan-400/20 bg-cyan-400/10">
            <BookOpen className="h-6 w-6 text-cyan-400" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                {lesson.title}
              </h1>

              <span className="border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-medium text-emerald-400">
                {lesson.status}
              </span>
            </div>

            <p className="mt-2 text-sm text-white/40">
              {lesson.course}{" "}
              <span className="mx-1 text-white/15">/</span>{" "}
              {lesson.chapter}
            </p>

            <p className="mt-2 text-[11px] text-white/25">
              /learn/{lesson.slug} · ID: {String(lessonId)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/learn/${lesson.slug}`}
            className="inline-flex h-10 items-center gap-2 border border-white/10 bg-white/[0.03] px-4 text-xs font-medium text-white/65 transition hover:bg-white/[0.06] hover:text-white"
          >
            <Eye className="h-4 w-4" />
            Preview
          </Link>

          <Link
            href={`/admin/lessons/${lessonId}/edit`}
            className="inline-flex h-10 items-center gap-2 border border-cyan-400/20 bg-cyan-400/10 px-4 text-xs font-medium text-cyan-400 transition hover:bg-cyan-400/15"
          >
            <Edit3 className="h-4 w-4" />
            Edit Lesson
          </Link>

          <button
            type="button"
            aria-label="More lesson actions"
            className="inline-flex h-10 items-center justify-center border border-white/10 bg-white/[0.03] px-3 text-white/50 transition hover:bg-white/[0.06] hover:text-white"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <SummaryCard
          label="Completions"
          value={lesson.completions.toLocaleString()}
          icon={CheckCircle2}
        />

        <SummaryCard
          label="Avg. Time"
          value={lesson.averageTime}
          icon={Clock3}
        />

        <SummaryCard
          label="Questions"
          value={String(lesson.practiceQuestions)}
          icon={FileQuestion}
        />

        <SummaryCard
          label="AI Interactions"
          value={lesson.aiInteractions.toLocaleString()}
          icon={BarChart3}
        />

        <SummaryCard
          label="Sections"
          value={String(sections.length)}
          icon={BookOpen}
        />

        <SummaryCard
          label="Type"
          value={lesson.type}
          icon={BookOpen}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_0.8fr]">
        <div className="space-y-6">
          <section className="border border-white/10 bg-white/[0.025]">
            <div className="border-b border-white/10 px-5 py-4">
              <h2 className="text-sm font-semibold text-white">
                Lesson Overview
              </h2>

              <p className="mt-1 text-xs text-white/35">
                Content summary and lesson information.
              </p>
            </div>

            <div className="p-5">
              <p className="text-sm leading-7 text-white/55">
                {lesson.description}
              </p>
            </div>
          </section>

          <section className="border border-white/10 bg-white/[0.025]">
            <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">
                  Lesson Content
                </h2>

                <p className="mt-1 text-xs text-white/35">
                  Sections contained in this lesson.
                </p>
              </div>

              <Link
                href={`/admin/lessons/${lessonId}/edit`}
                className="inline-flex h-9 items-center justify-center gap-2 border border-cyan-400/20 bg-cyan-400/10 px-3 text-xs font-medium text-cyan-400 transition hover:bg-cyan-400/15"
              >
                <Edit3 className="h-3.5 w-3.5" />
                Edit Content
              </Link>
            </div>

            <div className="divide-y divide-white/10">
              {sections.map((section) => (
                <div
                  key={section.number}
                  className="px-5 py-5 transition hover:bg-white/[0.02]"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-white/10 bg-white/[0.03] text-[10px] font-semibold text-cyan-400">
                      {section.number}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-white">
                            {section.title}
                          </h3>

                          <p className="mt-1 text-xs leading-5 text-white/35">
                            {section.description}
                          </p>
                        </div>

                        <span className="w-fit border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[9px] font-medium text-emerald-400">
                          {section.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="border border-white/10 bg-white/[0.025]">
            <div className="border-b border-white/10 px-5 py-4">
              <h2 className="text-sm font-semibold text-white">
                Practice Questions
              </h2>

              <p className="mt-1 text-xs text-white/35">
                Questions associated with this lesson.
              </p>
            </div>

            <div className="flex items-center justify-between gap-4 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center border border-white/10 bg-white/[0.03]">
                  <FileQuestion className="h-4 w-4 text-cyan-400" />
                </div>

                <div>
                  <p className="text-sm font-medium text-white">
                    {lesson.practiceQuestions} questions
                  </p>

                  <p className="mt-1 text-xs text-white/35">
                    Connected to this lesson.
                  </p>
                </div>
              </div>

              <Link
                href="/admin/practice-questions"
                className="text-xs text-cyan-400 transition hover:text-cyan-300"
              >
                Manage Questions
              </Link>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="border border-white/10 bg-white/[0.025]">
            <div className="border-b border-white/10 px-5 py-4">
              <h2 className="text-sm font-semibold text-white">
                Lesson Information
              </h2>

              <p className="mt-1 text-xs text-white/35">
                Publication and maintenance details.
              </p>
            </div>

            <div className="divide-y divide-white/10">
              <InfoRow label="Status" value={lesson.status} />
              <InfoRow label="Content Type" value={lesson.type} />
              <InfoRow label="Published" value={lesson.published} />
              <InfoRow label="Last Updated" value={lesson.updated} />
              <InfoRow label="Lesson ID" value={lesson.slug} />
            </div>
          </section>

          <section className="border border-white/10 bg-white/[0.025]">
            <div className="border-b border-white/10 px-5 py-4">
              <h2 className="text-sm font-semibold text-white">
                Analytics
              </h2>

              <p className="mt-1 text-xs text-white/35">
                Learner activity for this lesson.
              </p>
            </div>

            <div className="space-y-4 p-5">
              <Metric
                label="Completion Rate"
                value="68%"
                progress={68}
              />

              <Metric
                label="Average Score"
                value="82%"
                progress={82}
              />

              <Metric
                label="AI Tutor Usage"
                value="39%"
                progress={39}
              />
            </div>
          </section>

          <section className="border border-red-400/10 bg-red-400/[0.02]">
            <div className="border-b border-red-400/10 px-5 py-4">
              <h2 className="text-sm font-semibold text-white">
                Danger Zone
              </h2>

              <p className="mt-1 text-xs text-white/35">
                High-impact lesson actions.
              </p>
            </div>

            <div className="p-5">
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 border border-red-400/20 bg-red-400/10 px-4 py-3 text-xs font-medium text-red-400 transition hover:bg-red-400/15"
              >
                <Archive className="h-4 w-4" />
                Archive Lesson
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof BookOpen;
}) {
  return (
    <div className="border border-white/10 bg-white/[0.025] p-5">
      <div className="flex h-9 w-9 items-center justify-center border border-white/10 bg-white/[0.03]">
        <Icon className="h-4 w-4 text-cyan-400" />
      </div>

      <p className="mt-4 text-xs text-white/40">{label}</p>

      <p className="mt-1 truncate text-xl font-semibold text-white">
        {value}
      </p>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <span className="text-xs text-white/35">{label}</span>

      <span className="max-w-[60%] truncate text-right text-xs text-white/65">
        {value}
      </span>
    </div>
  );
}

function Metric({
  label,
  value,
  progress,
}: {
  label: string;
  value: string;
  progress: number;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs text-white/40">{label}</span>

        <span className="text-xs font-medium text-white/65">{value}</span>
      </div>

      <div className="h-1.5 overflow-hidden bg-white/5">
        <div
          className="h-full bg-cyan-400"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}