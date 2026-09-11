"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
} from "react";

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
  const completedSet =
    new Set(completedLessonIds);

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

  return (
    <section
      ref={ref}
      id="course-roadmap"
      className="border-b border-black/10 bg-[#f5f5f3]"
    >
      <div className="mx-auto max-w-[1600px]">
        <div className="grid lg:grid-cols-[0.35fr_1fr]">
          {/* LEFT LABEL */}

          <div className="border-b border-black/10 p-6 sm:p-10 lg:border-b-0 lg:border-r lg:p-16">
            <div
              className={`transition-all duration-900 ${
                visible
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-8 opacity-0"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/40">
                03 — Course roadmap
              </p>

              <p className="mt-24 max-w-xs text-4xl font-medium leading-[1.02] tracking-[-0.04em]">
                Follow the sequence from foundation to understanding.
              </p>
            </div>
          </div>

          {/* ROADMAP */}

          <div className="p-6 sm:p-10 lg:p-16">
            <div
              className={`transition-all duration-900 ${
                visible
                  ? "translate-x-0 opacity-100"
                  : "translate-x-8 opacity-0"
              }`}
            >
              <p className="text-xs uppercase tracking-[0.18em] text-blue-600">
                Quantum Computing Fundamentals
              </p>

              <h2 className="mt-5 text-4xl font-medium leading-[1.02] tracking-[-0.045em] sm:text-5xl">
                Course roadmap
              </h2>

              <p className="mt-6 max-w-2xl text-base leading-7 text-black/55">
                Move through the published lessons in sequence.
                Completed lessons remain available for review.
              </p>
            </div>

            {lessons.length > 0 ? (
              <div className="mt-14 border-t border-black/10">
                {lessons.map(
                  (lesson, index) => {
                    const completed =
                      completedSet.has(
                        lesson.id,
                      );

                    return (
                      <Link
                        key={lesson.id}
                        href={`/learn/${lesson.slug}`}
                        className={`group grid gap-6 border-b border-black/10 py-8 transition-all duration-700 md:grid-cols-[70px_1fr_auto] md:items-start ${
                          visible
                            ? "translate-y-0 opacity-100"
                            : "translate-y-8 opacity-0"
                        }`}
                        style={{
                          transitionDelay: `${
                            100 + index * 70
                          }ms`,
                        }}
                      >
                        <div>
                          <span
                            className={`text-xs font-semibold ${
                              completed
                                ? "text-blue-600"
                                : "text-black/25"
                            }`}
                          >
                            {String(
                              lesson.order_index,
                            ).padStart(
                              2,
                              "0",
                            )}
                          </span>
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                            <h3 className="text-xl font-medium tracking-tight transition-colors group-hover:text-blue-600">
                              {lesson.title}
                            </h3>

                            {completed && (
                              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-600">
                                Completed
                              </span>
                            )}
                          </div>

                          {lesson.description && (
                            <p className="mt-3 max-w-2xl text-sm leading-6 text-black/50">
                              {
                                lesson.description
                              }
                            </p>
                          )}

                          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs uppercase tracking-[0.14em] text-black/35">
                            <span>
                              Lesson{" "}
                              {
                                lesson.order_index
                              }
                            </span>

                            {lesson.duration_minutes && (
                              <span>
                                {
                                  lesson.duration_minutes
                                }{" "}
                                min
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-black/40 transition-colors group-hover:text-blue-600 md:text-right">
                          {completed
                            ? "Review"
                            : "Start"}
                        </div>
                      </Link>
                    );
                  },
                )}
              </div>
            ) : (
              <div className="mt-14 border-y border-dashed border-black/15 py-14">
                <p className="text-sm font-semibold">
                  No lessons available yet.
                </p>

                <p className="mt-2 text-sm text-black/45">
                  Lessons will appear here once they are published.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}