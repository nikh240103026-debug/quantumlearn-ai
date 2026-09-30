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
  FileQuestion,
  MoreHorizontal,
  Plus,
  Users,
  Eye,
  Archive,
  ChevronRight,
} from "lucide-react";

const course = {
  title: "Quantum Computing Fundamentals",
  slug: "quantum-foundations",
  description:
    "Core concepts, qubits, superposition, measurement, entanglement, and the foundations required to understand quantum computing.",
  status: "Published",
  updated: "September 29, 2026",
  published: "September 12, 2026",
  learners: 842,
  completed: 418,
  chapters: 6,
  lessons: 24,
  practiceQuestions: 96,
};

const chapters = [
  {
    id: "chapter-1",
    number: 1,
    title: "Introduction to Quantum Computing",
    description: "Classical vs quantum computing and basic quantum concepts.",
    lessons: 4,
    completed: 4,
    status: "Published",
  },
  {
    id: "chapter-2",
    number: 2,
    title: "Qubits and Quantum States",
    description: "Qubits, state vectors, Bloch sphere, and measurement.",
    lessons: 5,
    completed: 5,
    status: "Published",
  },
  {
    id: "chapter-3",
    number: 3,
    title: "Quantum Gates",
    description: "Single-qubit gates and fundamental circuit operations.",
    lessons: 5,
    completed: 5,
    status: "Published",
  },
  {
    id: "chapter-4",
    number: 4,
    title: "Quantum Entanglement",
    description: "Entanglement, Bell states, and quantum correlations.",
    lessons: 4,
    completed: 4,
    status: "Published",
  },
  {
    id: "chapter-5",
    number: 5,
    title: "Quantum Measurement",
    description: "Measurement operators, probabilities, and state collapse.",
    lessons: 3,
    completed: 3,
    status: "Published",
  },
  {
    id: "chapter-6",
    number: 6,
    title: "Building Quantum Circuits",
    description: "Combine concepts to build and analyze quantum circuits.",
    lessons: 3,
    completed: 2,
    status: "Published",
  },
];

export default function AdminCourseDetailsPage() {
  const params = useParams();
  const courseId = params?.id;

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-6">
        <Link
          href="/admin/courses"
          className="inline-flex items-center gap-2 text-xs text-white/40 transition hover:text-cyan-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Courses
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
                {course.title}
              </h1>

              <span className="border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-medium text-emerald-400">
                {course.status}
              </span>
            </div>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/40">
              {course.description}
            </p>

            <p className="mt-2 text-[11px] text-white/25">
              /learn/{course.slug} · ID: {String(courseId)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/learn/${course.slug}`}
            className="inline-flex h-10 items-center gap-2 border border-white/10 bg-white/[0.03] px-4 text-xs font-medium text-white/65 transition hover:bg-white/[0.06] hover:text-white"
          >
            <Eye className="h-4 w-4" />
            Preview
          </Link>

          <Link
            href={`/admin/courses/${courseId}/edit`}
            className="inline-flex h-10 items-center gap-2 border border-cyan-400/20 bg-cyan-400/10 px-4 text-xs font-medium text-cyan-400 transition hover:bg-cyan-400/15"
          >
            <Edit3 className="h-4 w-4" />
            Edit Course
          </Link>

          <button
            type="button"
            className="inline-flex h-10 items-center justify-center border border-white/10 bg-white/[0.03] px-3 text-white/50 transition hover:bg-white/[0.06] hover:text-white"
            aria-label="More course actions"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard
          label="Learners"
          value={course.learners.toLocaleString()}
          icon={Users}
        />

        <SummaryCard
          label="Completed"
          value={course.completed.toLocaleString()}
          icon={CheckCircle2}
        />

        <SummaryCard
          label="Chapters"
          value={String(course.chapters)}
          icon={BookOpen}
        />

        <SummaryCard
          label="Lessons"
          value={String(course.lessons)}
          icon={Clock3}
        />

        <SummaryCard
          label="Practice Questions"
          value={String(course.practiceQuestions)}
          icon={FileQuestion}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <section className="border border-white/10 bg-white/[0.025]">
          <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">
                Course Structure
              </h2>

              <p className="mt-1 text-xs text-white/35">
                Manage chapters and lessons in this course.
              </p>
            </div>

            <button
              type="button"
              className="inline-flex h-9 items-center justify-center gap-2 border border-cyan-400/20 bg-cyan-400/10 px-3 text-xs font-medium text-cyan-400 transition hover:bg-cyan-400/15"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Chapter
            </button>
          </div>

          <div className="divide-y divide-white/10">
            {chapters.map((chapter) => (
              <div
                key={chapter.id}
                className="group px-5 py-5 transition hover:bg-white/[0.02]"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-white/10 bg-white/[0.03] text-xs font-semibold text-cyan-400">
                    {String(chapter.number).padStart(2, "0")}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-white">
                          {chapter.title}
                        </h3>

                        <p className="mt-1 text-xs leading-5 text-white/35">
                          {chapter.description}
                        </p>
                      </div>

                      <span className="w-fit border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[9px] font-medium text-emerald-400">
                        {chapter.status}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
                      <span className="text-[11px] text-white/35">
                        <span className="text-white/65">
                          {chapter.lessons}
                        </span>{" "}
                        lessons
                      </span>

                      <span className="text-[11px] text-white/35">
                        <span className="text-white/65">
                          {chapter.completed}
                        </span>{" "}
                        published
                      </span>

                      <Link
                        href={`/admin/chapters/${chapter.id}`}
                        className="ml-auto inline-flex items-center gap-1 text-[11px] text-cyan-400 opacity-80 transition hover:opacity-100"
                      >
                        Manage
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="space-y-6">
          <section className="border border-white/10 bg-white/[0.025]">
            <div className="border-b border-white/10 px-5 py-4">
              <h2 className="text-sm font-semibold text-white">
                Course Information
              </h2>

              <p className="mt-1 text-xs text-white/35">
                Publication and maintenance details.
              </p>
            </div>

            <div className="divide-y divide-white/10">
              <InfoRow label="Status" value={course.status} />
              <InfoRow label="Published" value={course.published} />
              <InfoRow label="Last Updated" value={course.updated} />
              <InfoRow label="Course ID" value={course.slug} />
            </div>
          </section>

          <section className="border border-white/10 bg-white/[0.025]">
            <div className="border-b border-white/10 px-5 py-4">
              <h2 className="text-sm font-semibold text-white">
                Course Actions
              </h2>

              <p className="mt-1 text-xs text-white/35">
                Administrative course controls.
              </p>
            </div>

            <div className="space-y-2 p-5">
              <button
                type="button"
                className="flex w-full items-center gap-3 border border-white/10 px-4 py-3 text-left text-xs text-white/60 transition hover:bg-white/[0.04] hover:text-white"
              >
                <Edit3 className="h-4 w-4 text-cyan-400" />
                Edit course details
              </button>

              <button
                type="button"
                className="flex w-full items-center gap-3 border border-white/10 px-4 py-3 text-left text-xs text-white/60 transition hover:bg-white/[0.04] hover:text-white"
              >
                <Eye className="h-4 w-4 text-cyan-400" />
                Preview as learner
              </button>

              <button
                type="button"
                className="flex w-full items-center gap-3 border border-white/10 px-4 py-3 text-left text-xs text-white/60 transition hover:bg-white/[0.04] hover:text-white"
              >
                <Archive className="h-4 w-4 text-amber-400" />
                Archive course
              </button>
            </div>
          </section>

          <section className="border border-cyan-400/10 bg-cyan-400/[0.03]">
            <div className="p-5">
              <div className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400" />

                <div>
                  <h2 className="text-sm font-semibold text-white">
                    Published Course
                  </h2>

                  <p className="mt-2 text-xs leading-5 text-white/40">
                    This course is currently visible to learners. Changes to
                    published content should be reviewed before deployment.
                  </p>
                </div>
              </div>
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
  icon: typeof Users;
}) {
  return (
    <div className="border border-white/10 bg-white/[0.025] p-5">
      <div className="flex h-9 w-9 items-center justify-center border border-white/10 bg-white/[0.03]">
        <Icon className="h-4 w-4 text-cyan-400" />
      </div>

      <p className="mt-4 text-xs text-white/40">{label}</p>

      <p className="mt-1 text-xl font-semibold text-white">{value}</p>
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