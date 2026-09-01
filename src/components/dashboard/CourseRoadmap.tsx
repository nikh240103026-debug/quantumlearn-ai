import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Lock,
} from "lucide-react";

interface RoadmapLesson {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  order_index: number;
  duration_minutes: number | null;
}

interface CourseRoadmapProps {
  lessons: RoadmapLesson[];
  completedLessonIds: string[];
}

export function CourseRoadmap({
  lessons,
  completedLessonIds,
}: CourseRoadmapProps) {
  const completedSet = new Set(completedLessonIds);

  return (
    <section
      id="course-roadmap"
      className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
          Course Roadmap
        </p>

        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
          Quantum Computing Fundamentals
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Follow the lessons in order and build your understanding of quantum
          computing step by step.
        </p>
      </div>

      {/* Lessons */}
      <div className="relative">
        {/* Vertical timeline */}
        <div className="absolute left-[19px] top-5 hidden h-[calc(100%-40px)] w-px bg-slate-200 sm:block" />

        <div className="space-y-4">
          {lessons.map((lesson) => {
            const completed = completedSet.has(lesson.id);

            return (
              <Link
                key={lesson.id}
                href={`/learn/${lesson.slug}`}
                className={`group relative block rounded-xl border p-4 transition-all sm:p-5 ${
                  completed
                    ? "border-green-200 bg-green-50/40 hover:border-green-300 hover:shadow-sm"
                    : "border-slate-200 bg-white hover:border-blue-200 hover:shadow-sm"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Status icon */}
                  <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white">
                    {completed ? (
                      <CheckCircle2
                        size={25}
                        className="text-green-600"
                      />
                    ) : (
                      <Circle
                        size={25}
                        className="text-slate-300 group-hover:text-blue-500"
                      />
                    )}
                  </div>

                  {/* Lesson information */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p
                          className={`text-xs font-semibold uppercase tracking-wide ${
                            completed
                              ? "text-green-600"
                              : "text-blue-600"
                          }`}
                        >
                          Lesson {lesson.order_index}
                        </p>

                        <h3 className="mt-1 text-base font-bold text-slate-950 sm:text-lg">
                          {lesson.title}
                        </h3>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        {lesson.duration_minutes && (
                          <span className="text-xs font-medium text-slate-500">
                            {lesson.duration_minutes} min
                          </span>
                        )}

                        {completed ? (
                          <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                            Completed
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                            Not started
                          </span>
                        )}
                      </div>
                    </div>

                    {lesson.description && (
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                        {lesson.description}
                      </p>
                    )}

                    <div
                      className={`mt-3 inline-flex items-center gap-1.5 text-sm font-semibold ${
                        completed
                          ? "text-green-700"
                          : "text-blue-600"
                      }`}
                    >
                      {completed ? "Review lesson" : "Start lesson"}

                      <ArrowRight
                        size={15}
                        className="transition-transform group-hover:translate-x-0.5"
                      />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Empty state */}
      {lessons.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <Lock
            size={28}
            className="mx-auto text-slate-400"
          />

          <p className="mt-3 text-sm font-semibold text-slate-700">
            No lessons available yet
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Lessons will appear here once they are published.
          </p>
        </div>
      )}
    </section>
  );
}