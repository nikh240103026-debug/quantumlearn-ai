import Link from "next/link";
import { ArrowRight, BookOpen, Clock3 } from "lucide-react";

import type { ContinueLearningData } from "@/types/personal-dashboard";

interface Props {
  data: ContinueLearningData | null;
}

export function ContinueLearningCard({ data }: Props) {
  if (!data) {
    return (
      <section className="border border-black/10 bg-white p-8 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
          Continue learning
        </p>

        <h2 className="mt-5 text-3xl font-medium tracking-[-0.04em]">
          Start your learning journey.
        </h2>

        <p className="mt-4 max-w-xl text-sm leading-6 text-black/50">
          Choose a lesson from the curriculum to begin building your
          quantum computing foundation.
        </p>

        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-3 bg-[#090c11] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
        >
          Explore curriculum
          <ArrowRight size={16} />
        </Link>
      </section>
    );
  }

  return (
    <section className="border border-black/10 bg-white p-8 sm:p-10">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
            Continue learning
          </p>

          <h2 className="mt-5 max-w-3xl text-3xl font-medium tracking-[-0.04em] sm:text-4xl">
            {data.lessonTitle}
          </h2>

          <p className="mt-3 text-sm text-black/45">
            {data.courseTitle}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-black/35">
          <BookOpen size={15} />
          Lesson {Math.min(data.completedLessons + 1, data.totalLessons)} of{" "}
          {data.totalLessons}
        </div>
      </div>

      <div className="mt-10">
        <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.14em]">
          <span className="text-black/35">Progress</span>

          <span className="font-semibold text-blue-600">
            {Math.round(data.progress)}%
          </span>
        </div>

        <div
          className="h-1.5 overflow-hidden bg-black/10"
          role="progressbar"
          aria-valuenow={Math.round(data.progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${data.lessonTitle} progress`}
        >
          <div
            className="h-full bg-blue-600 transition-all duration-700"
            style={{
              width: `${Math.min(100, Math.max(0, data.progress))}%`,
            }}
          />
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-5">
        <div className="flex items-center gap-2 text-xs text-black/40">
          <Clock3 size={14} />

          {data.lastActivityAt
            ? `Last active ${formatDate(data.lastActivityAt)}`
            : "Ready to continue"}
        </div>

        <Link
          href={`/learn/${data.lessonSlug}`}
          className="inline-flex items-center gap-3 bg-[#090c11] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
        >
          Continue
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "recently";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}