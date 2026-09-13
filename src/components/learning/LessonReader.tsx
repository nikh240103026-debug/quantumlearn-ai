"use client";

import { LessonExperience } from "@/components/learning/LessonExperience";
import { useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Info,
  Lightbulb,
  Loader2,
  Sparkles,
} from "lucide-react";

import { LessonCompleteButton } from "@/components/learning/LessonCompleteButton";

interface LessonReaderProps {
  lesson: {
    id: string;
    course_id: string;
    title: string;
    slug: string;
    description: string | null;
    content: string | null;
    order_index: number;
    duration_minutes: number | null;
  };
  completed: boolean;
  previousLesson: {
    slug: string;
    title: string;
    order_index: number;
  } | null;
  nextLesson: {
    slug: string;
    title: string;
    order_index: number;
  } | null;
}

interface SummaryData {
  overview: string;
  keyConcepts: string[];
  importantDefinitions: string[];
  corePrinciples: string[];
  formulas: string[];
  examples: string[];
  quickRevision: string[];
  keyTakeaways: string[];
}

function ActionBar({
  onGenerateSummary,
  summaryLoading,
  lessonId,
  courseId,
  completed,
}: {
  onGenerateSummary: () => void;
  summaryLoading: boolean;
  lessonId: string;
  courseId: string;
  completed: boolean;
}) {
  return (
    <div className="border-y border-white/10 bg-[#0d1118]">
      <div className="flex flex-wrap items-center gap-2 px-4 py-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onGenerateSummary}
          disabled={summaryLoading}
          className="inline-flex items-center gap-2 border border-blue-400/40 bg-blue-500/10 px-4 py-2.5 text-sm font-semibold text-blue-300 transition-all duration-300 hover:border-blue-400/70 hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {summaryLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <FileText size={16} />
          )}
          {summaryLoading ? "Generating..." : "Generate Summary"}
        </button>

        <Link
          href={`/learn/tutor/${lessonId}`}
          className="inline-flex items-center gap-2 border border-white/15 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-200 transition-all duration-300 hover:border-blue-400/40 hover:bg-blue-500/10 hover:text-blue-300"
        >
          <Sparkles size={16} />
          Ask AI Tutor
        </Link>

        <LessonCompleteButton
          lessonId={lessonId}
          courseId={courseId}
          completed={completed}
        />
      </div>
    </div>
  );
}

export function LessonReader({
  lesson,
  completed,
  previousLesson,
  nextLesson,
}: LessonReaderProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState("");

  const content =
    lesson.content || "Lesson content will be added here.";

  async function generateSummary() {
    if (summaryLoading) {
      return;
    }

    setSummaryLoading(true);
    setSummaryError("");

    try {
      const response = await fetch("/api/lesson-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lessonId: lesson.id,
          title: lesson.title,
          content,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to generate the lesson summary.");
      }

      setSummary(data.summary);

      window.setTimeout(() => {
        document
          .getElementById("lesson-summary")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 100);
    } catch (error) {
      setSummaryError(
        error instanceof Error
          ? error.message
          : "Unable to generate the lesson summary.",
      );
    } finally {
      setSummaryLoading(false);
    }
  }

  async function exportSummary(format: "docx" | "pdf") {
    if (!summary) {
      return;
    }

    try {
      const response = await fetch(
        `/api/lesson-summary/export?format=${format}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: lesson.title,
            summary,
          }),
        },
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(
          data?.error || `Unable to export the ${format.toUpperCase()}.`,
        );
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download =
        `${lesson.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-summary.${format}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      setSummaryError(
        error instanceof Error
          ? error.message
          : `Unable to export the ${format.toUpperCase()}.`,
      );
    }
  }

  return (
    <>
      {/* ============================================================
          TOP ACTIONS
      ============================================================ */}

      <ActionBar
        onGenerateSummary={generateSummary}
        summaryLoading={summaryLoading}
        lessonId={lesson.id}
        courseId={lesson.course_id}
        completed={completed}
      />

      {/* ============================================================
          ARTICLE
      ============================================================ */}

      <section className="bg-[#f5f5f3] text-slate-900">
        <article
          className={[
            "relative overflow-hidden border-b border-black/10",
            !isExpanded ? "max-h-[calc(100vh-9rem)]" : "",
          ].join(" ")}
        >
          <div
            className={[
              "relative px-5 py-10 sm:px-8 sm:py-12 lg:px-12 xl:px-16",
              !isExpanded
                ? "after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-48 after:bg-gradient-to-b after:from-transparent after:via-[#f5f5f3]/80 after:to-[#f5f5f3]"
                : "",
            ].join(" ")}
          >
            <div
              className={[
                "lesson-content mx-auto w-full transition-all duration-700",
                !isExpanded ? "pb-20" : "",
              ].join(" ")}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <section className="mb-12 mt-2 border-b border-black/10 pb-7">
                      <div className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                        Chapter
                      </div>

                      <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                        {children}
                      </h1>
                    </section>
                  ),

                  h2: ({ children }) => (
                    <section className="mb-7 mt-14">
                      <h2 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                        {children}
                      </h2>

                      <div className="mt-4 h-px w-20 bg-blue-600" />
                    </section>
                  ),

                  h3: ({ children }) => (
                    <h3 className="mb-4 mt-10 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                      {children}
                    </h3>
                  ),

                  h4: ({ children }) => (
                    <h4 className="mb-3 mt-8 text-lg font-bold text-slate-900">
                      {children}
                    </h4>
                  ),

                  p: ({ children }) => (
                    <p className="mb-6 max-w-none text-[16px] leading-8 text-slate-700 sm:text-[17px]">
                      {children}
                    </p>
                  ),

                  strong: ({ children }) => (
                    <strong className="font-extrabold text-slate-950">
                      {children}
                    </strong>
                  ),

                  em: ({ children }) => (
                    <em className="font-medium text-slate-700">
                      {children}
                    </em>
                  ),

                  ul: ({ children }) => (
                    <ul className="mb-8 mt-5 list-disc space-y-3 pl-7 marker:text-blue-600">
                      {children}
                    </ul>
                  ),

                  ol: ({ children }) => (
                    <ol className="mb-8 mt-5 list-decimal space-y-3 pl-7 marker:font-bold marker:text-blue-600">
                      {children}
                    </ol>
                  ),

                  li: ({ children }) => (
                    <li className="text-[16px] leading-7 text-slate-700 sm:text-[17px]">
                      {children}
                    </li>
                  ),

                  code: ({ children }) => (
                    <code className="border border-slate-300 bg-slate-100 px-1.5 py-0.5 font-mono text-[0.9em] font-semibold text-blue-700">
                      {children}
                    </code>
                  ),

                  pre: ({ children }) => (
                    <div className="my-8 overflow-hidden border border-slate-800 bg-slate-950 shadow-md">
                      <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-900 px-5 py-3">
                        <span className="text-xs font-medium text-slate-500">
                          Code
                        </span>
                      </div>

                      <pre className="overflow-x-auto p-5 text-sm leading-7 text-slate-100">
                        {children}
                      </pre>
                    </div>
                  ),

                  blockquote: ({ children }) => (
                    <aside className="my-8 border-l-2 border-blue-600 bg-blue-50/70 p-5 sm:p-6">
                      <div className="flex items-start gap-4">
                        <Info
                          size={19}
                          className="mt-1 shrink-0 text-blue-600"
                        />

                        <div className="min-w-0 text-[16px] leading-7 text-slate-700">
                          {children}
                        </div>
                      </div>
                    </aside>
                  ),

                  hr: () => (
                    <div className="my-12 border-t border-slate-300" />
                  ),

                  a: ({ children, href }) => (
                    <a
                      href={href}
                      className="font-semibold text-blue-600 underline decoration-blue-200 underline-offset-4 transition-colors hover:text-blue-800"
                    >
                      {children}
                    </a>
                  ),

                  table: ({ children }) => (
                    <div className="my-9 overflow-x-auto border border-slate-300">
                      <table className="min-w-full divide-y divide-slate-300 text-sm">
                        {children}
                      </table>
                    </div>
                  ),

                  thead: ({ children }) => (
                    <thead className="bg-slate-100">
                      {children}
                    </thead>
                  ),

                  th: ({ children }) => (
                    <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-extrabold uppercase tracking-wider text-slate-600">
                      {children}
                    </th>
                  ),

                  td: ({ children }) => (
                    <td className="border-t border-slate-200 px-5 py-4 text-sm leading-7 text-slate-700">
                      {children}
                    </td>
                  ),

                  del: ({ children }) => (
                    <del className="text-slate-400">{children}</del>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          </div>

          {/* ========================================================
              READ FULL LESSON
          ======================================================== */}

          {!isExpanded && (
            <div className="absolute inset-x-0 bottom-0 z-10 flex justify-center px-4 pb-5">
              <button
                type="button"
                onClick={() => setIsExpanded(true)}
                className="border border-blue-600 bg-[#f5f5f3] px-6 py-3 text-sm font-bold text-blue-700 shadow-lg transition-all duration-300 hover:bg-blue-600 hover:text-white"
              >
                Read Full Lesson
              </button>
            </div>
          )}
        </article>
      </section>

      {/* ============================================================
          LESSON INFORMATION / TIP
      ============================================================ */}

      <section className="bg-[#f5f5f3] px-5 py-8 sm:px-8 lg:px-12 xl:px-16">
        <div className="border border-black/10 bg-white">
          <div className="flex items-start gap-4 p-5 sm:p-6">
            <Lightbulb
              size={20}
              className="mt-0.5 shrink-0 text-blue-600"
            />

            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-slate-950">
                Learning Tip
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Do not rush through the lesson. Make sure you understand the
                fundamental concepts before moving to the next topic.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SUMMARY
      ============================================================ */}

      {summaryError && (
        <section className="bg-[#f5f5f3] px-5 pb-6 sm:px-8 lg:px-12 xl:px-16">
          <div className="border border-red-300 bg-red-50 p-4 text-sm text-red-700">
            {summaryError}
          </div>
        </section>
      )}

      {summary && (
        <section
          id="lesson-summary"
          className="bg-[#f5f5f3] px-5 py-8 sm:px-8 lg:px-12 xl:px-16"
        >
          <div className="border border-black/10 bg-white">
            <div className="border-b border-black/10 bg-[#0a0d12] px-5 py-5 text-white sm:px-7">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
                AI Generated Summary
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight">
                {lesson.title}
              </h2>
            </div>

            <div className="px-5 py-7 sm:px-8 sm:py-9">
              <SummarySection
                title="Overview"
                content={summary.overview}
              />

              <SummaryList
                title="Key Concepts"
                items={summary.keyConcepts}
              />

              <SummaryList
                title="Important Definitions"
                items={summary.importantDefinitions}
              />

              <SummaryList
                title="Core Principles"
                items={summary.corePrinciples}
              />

              {summary.formulas.length > 0 && (
                <SummaryList
                  title="Important Formulas"
                  items={summary.formulas}
                />
              )}

              <SummaryList
                title="Examples"
                items={summary.examples}
              />

              <SummaryList
                title="Quick Revision"
                items={summary.quickRevision}
              />

              <SummaryList
                title="Key Takeaways"
                items={summary.keyTakeaways}
              />

              <div className="mt-10 border-t border-black/10 pt-6">
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Export Summary
                </p>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => exportSummary("docx")}
                    className="inline-flex items-center gap-2 border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition-all duration-300 hover:border-blue-500 hover:text-blue-600"
                  >
                    <Download size={16} />
                    Export DOCX
                  </button>

                  <button
                    type="button"
                    onClick={() => exportSummary("pdf")}
                    className="inline-flex items-center gap-2 border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition-all duration-300 hover:border-blue-500 hover:text-blue-600"
                  >
                    <Download size={16} />
                    Export PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================
          BOTTOM ACTIONS
      ============================================================ */}

      <section className="bg-[#0a0d12]">
        <ActionBar
          onGenerateSummary={generateSummary}
          summaryLoading={summaryLoading}
          lessonId={lesson.id}
          courseId={lesson.course_id}
          completed={completed}
        />
      </section>

      {/* ============================================================
          NAVIGATION
      ============================================================ */}

      <section className="border-t border-white/10 bg-[#080b10] px-5 py-8 text-white sm:px-8 lg:px-12 xl:px-16">
        <div className="grid grid-cols-1 gap-px border border-white/10 bg-white/10 sm:grid-cols-2">
          {previousLesson ? (
            <Link
              href={`/learn/${previousLesson.slug}`}
              className="group bg-[#0a0d12] p-6 transition-all duration-300 hover:bg-[#0e131b]"
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-400">
                <ArrowLeft
                  size={16}
                  className="transition-transform duration-300 group-hover:-translate-x-1"
                />
                Previous Lesson
              </div>

              <p className="mt-3 text-base font-bold text-white">
                {previousLesson.title}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Lesson {previousLesson.order_index}
              </p>
            </Link>
          ) : (
            <div className="bg-[#0a0d12]" />
          )}

          {nextLesson ? (
            <Link
              href={`/learn/${nextLesson.slug}`}
              className="group bg-[#0a0d12] p-6 text-left transition-all duration-300 hover:bg-[#0e131b] sm:text-right"
            >
              <div className="flex items-center justify-start gap-2 text-sm font-semibold text-slate-400 sm:justify-end">
                Next Lesson

                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </div>

              <p className="mt-3 text-base font-bold text-white">
                {nextLesson.title}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Lesson {nextLesson.order_index}
              </p>
            </Link>
          ) : (
            <div className="bg-[#0a0d12] p-6 text-left sm:text-right">
              <div className="flex items-center justify-start gap-2 text-sm font-bold text-blue-400 sm:justify-end">
                <CheckCircle2 size={17} />
                Course Complete
              </div>

              <p className="mt-1 text-xs text-slate-500">
                You have reached the final lesson.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function SummarySection({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  return (
    <section className="border-b border-black/10 pb-7">
      <h3 className="text-lg font-bold tracking-tight text-slate-950">
        {title}
      </h3>

      <p className="mt-3 text-[16px] leading-8 text-slate-700">
        {content}
      </p>
    </section>
  );
}

function SummaryList({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  if (!items?.length) {
    return null;
  }

  return (
    <section className="border-b border-black/10 py-7">
      <h3 className="text-lg font-bold tracking-tight text-slate-950">
        {title}
      </h3>

      <ul className="mt-4 space-y-3">
        {items.map((item, index) => (
          <li
            key={`${title}-${index}`}
            className="border-l-2 border-blue-500 pl-4 text-[15px] leading-7 text-slate-700"
          >
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}