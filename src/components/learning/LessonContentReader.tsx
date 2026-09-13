"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import {
  BookOpen,
  Download,
  FileText,
  Info,
  Loader2,
  Maximize2,
  Sparkles,
  X,
} from "lucide-react";

interface LessonContentReaderProps {
  lessonId: string;
  title: string;
  content: string;
}

interface SummaryResponse {
  summary?: string;
  error?: string;
}

export function LessonContentReader({
  lessonId,
  title,
  content,
}: LessonContentReaderProps) {
  const [expanded, setExpanded] = useState(false);

  const [summary, setSummary] = useState("");
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState("");

  const [exportLoading, setExportLoading] = useState<
    "docx" | "pdf" | null
  >(null);

  async function generateSummary() {
    if (summaryLoading) {
      return;
    }

    setSummaryLoading(true);
    setSummaryError("");
    setSummaryOpen(true);

    try {
      const response = await fetch("/api/lesson-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lessonId,
        }),
      });

      const data = (await response.json()) as SummaryResponse;

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to generate the lesson summary.",
        );
      }

      if (!data.summary) {
        throw new Error("The AI returned an empty summary.");
      }

      setSummary(data.summary);
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
    if (!summary || exportLoading) {
      return;
    }

    setExportLoading(format);

    try {
      const response = await fetch("/api/lesson-summary/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          summary,
          format,
        }),
      });

      if (!response.ok) {
        let message = "Unable to export the summary.";

        try {
          const data = await response.json();

          if (data?.error) {
            message = data.error;
          }
        } catch {
          // Keep default error message.
        }

        throw new Error(message);
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = `${sanitizeFilename(title)}-summary.${format}`;

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      setSummaryError(
        error instanceof Error
          ? error.message
          : "Unable to export the summary.",
      );
    } finally {
      setExportLoading(null);
    }
  }

  function sanitizeFilename(value: string) {
    return (
      value
        .trim()
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase() || "lesson"
    );
  }

  return (
    <div className="relative">

      {/* =====================================================
          TOP READING ACTION BAR
      ===================================================== */}

      <div className="mb-4 flex flex-col border border-black/10 bg-white sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-3 border-b border-black/10 px-5 py-4 sm:border-b-0">
          <BookOpen size={18} className="text-blue-600" />

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              Lesson Notes
            </p>

            <p className="mt-0.5 text-sm text-slate-500">
              Read, understand and review the lesson.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 p-3">

          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="inline-flex items-center gap-2 border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-300 hover:border-blue-600/30 hover:bg-blue-50/50 hover:text-blue-700"
          >
            <Maximize2 size={16} />

            {expanded ? "Collapse Lesson" : "Read Full Lesson"}
          </button>

          <button
            type="button"
            onClick={generateSummary}
            disabled={summaryLoading}
            className="inline-flex items-center gap-2 border border-blue-600/20 bg-blue-600/5 px-4 py-2.5 text-sm font-semibold text-blue-700 transition-all duration-300 hover:border-blue-600/40 hover:bg-blue-600/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {summaryLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Sparkles size={16} />
            )}

            {summaryLoading ? "Generating..." : "Generate Summary"}
          </button>

        </div>

      </div>

      {/* =====================================================
          LESSON ARTICLE
      ===================================================== */}

      <article className="border border-black/10 bg-white shadow-[0_16px_50px_rgba(15,23,42,0.05)]">

        {/* Article heading */}
        <div className="border-b border-black/10 bg-gradient-to-r from-white via-white to-blue-50/40 px-6 py-7 sm:px-10 lg:px-14">

          <div className="flex items-start gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-blue-600/15 bg-blue-600/5 text-blue-600">
              <BookOpen size={21} />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                Lesson Notes
              </p>

              <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">
                Build your understanding step by step
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Read each section carefully and focus on the key concepts.
              </p>
            </div>

          </div>

        </div>

        {/* =================================================
            CONTENT READING WINDOW
        ================================================= */}

        <div
          className={[
            "relative overflow-hidden transition-[max-height] duration-1000 ease-in-out",
            expanded
              ? "max-h-none"
              : "max-h-[calc(100vh-180px)]",
          ].join(" ")}
        >

          <div className="px-6 py-10 sm:px-10 sm:py-14 lg:px-20 lg:py-16 xl:px-28">

            <div className="lesson-content">

              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{

                  // ==================================================
                  // H1 — CHAPTER
                  // ==================================================

                  h1: ({ children }) => (
                    <section className="mb-12 mt-2 border-b border-slate-200 pb-7">

                      <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                        <span className="h-2 w-2 bg-blue-600" />
                        Chapter
                      </div>

                      <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                        {children}
                      </h1>

                    </section>
                  ),

                  // ==================================================
                  // H2 — MAIN TOPIC
                  // ==================================================

                  h2: ({ children }) => (
                    <section className="mb-7 mt-14">

                      <h2 className="flex items-start gap-3 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">

                        <span className="mt-2.5 h-3 w-3 shrink-0 bg-blue-600" />

                        <span>{children}</span>

                      </h2>

                      <div className="mt-4 h-px w-20 bg-blue-600/30" />

                    </section>
                  ),

                  // ==================================================
                  // H3 — SUBTOPIC
                  // ==================================================

                  h3: ({ children }) => (
                    <h3 className="mb-4 mt-10 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                      {children}
                    </h3>
                  ),

                  // ==================================================
                  // H4
                  // ==================================================

                  h4: ({ children }) => (
                    <h4 className="mb-3 mt-8 text-lg font-bold text-slate-900">
                      {children}
                    </h4>
                  ),

                  // ==================================================
                  // PARAGRAPH
                  // ==================================================

                  p: ({ children }) => (
                    <p className="mb-6 max-w-5xl text-[16px] leading-8 text-slate-700 sm:text-[17px]">
                      {children}
                    </p>
                  ),

                  // ==================================================
                  // STRONG
                  // ==================================================

                  strong: ({ children }) => (
                    <strong className="font-extrabold text-slate-950">
                      {children}
                    </strong>
                  ),

                  // ==================================================
                  // EMPHASIS
                  // ==================================================

                  em: ({ children }) => (
                    <em className="font-medium text-slate-700">
                      {children}
                    </em>
                  ),

                  // ==================================================
                  // UNORDERED LIST
                  // ==================================================

                  ul: ({ children }) => (
                    <ul className="mb-8 mt-5 max-w-5xl space-y-3">
                      {children}
                    </ul>
                  ),

                  // ==================================================
                  // ORDERED LIST
                  // ==================================================

                  ol: ({ children }) => (
                    <ol className="mb-8 mt-5 max-w-5xl list-decimal space-y-3 pl-7 marker:font-bold marker:text-blue-600">
                      {children}
                    </ol>
                  ),

                  // ==================================================
                  // LIST ITEM
                  // ==================================================

                  li: ({ children }) => (
                    <li className="flex items-start gap-3 text-[16px] leading-7 text-slate-700 sm:text-[17px]">

                      <span className="mt-3 h-1.5 w-1.5 shrink-0 bg-blue-500" />

                      <span className="flex-1">
                        {children}
                      </span>

                    </li>
                  ),

                  // ==================================================
                  // INLINE CODE
                  // ==================================================

                  code: ({ children }) => (
                    <code className="border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[0.9em] font-semibold text-blue-700">
                      {children}
                    </code>
                  ),

                  // ==================================================
                  // CODE BLOCK
                  // ==================================================

                  pre: ({ children }) => (
                    <div className="my-8 overflow-hidden border border-slate-800 bg-slate-950 shadow-md">

                      <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-900 px-5 py-3">

                        <span className="h-2.5 w-2.5 bg-slate-600" />
                        <span className="h-2.5 w-2.5 bg-slate-600" />
                        <span className="h-2.5 w-2.5 bg-slate-600" />

                        <span className="ml-2 text-xs font-medium text-slate-500">
                          Code
                        </span>

                      </div>

                      <pre className="overflow-x-auto p-5 text-sm leading-7 text-slate-100">
                        {children}
                      </pre>

                    </div>
                  ),

                  // ==================================================
                  // BLOCKQUOTE — LEARNING NOTE
                  // ==================================================

                  blockquote: ({ children }) => (
                    <aside className="my-8 border border-blue-200 bg-blue-50/70 p-5 sm:p-6">

                      <div className="flex items-start gap-4">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-blue-200 bg-blue-100 text-blue-600">
                          <Info size={19} />
                        </div>

                        <div className="min-w-0 text-[16px] leading-7 text-slate-700">
                          {children}
                        </div>

                      </div>

                    </aside>
                  ),

                  // ==================================================
                  // HORIZONTAL RULE
                  // ==================================================

                  hr: () => (
                    <div className="my-12 border-t border-slate-200" />
                  ),

                  // ==================================================
                  // LINKS
                  // ==================================================

                  a: ({ children, href }) => (
                    <a
                      href={href}
                      className="font-semibold text-blue-600 underline decoration-blue-200 underline-offset-4 transition-colors hover:text-blue-800"
                    >
                      {children}
                    </a>
                  ),

                  // ==================================================
                  // TABLE
                  // ==================================================

                  table: ({ children }) => (
                    <div className="my-9 overflow-x-auto border border-slate-200 shadow-sm">

                      <table className="min-w-full divide-y divide-slate-200 text-sm">
                        {children}
                      </table>

                    </div>
                  ),

                  // ==================================================
                  // TABLE HEAD
                  // ==================================================

                  thead: ({ children }) => (
                    <thead className="bg-slate-50">
                      {children}
                    </thead>
                  ),

                  // ==================================================
                  // TABLE HEADER
                  // ==================================================

                  th: ({ children }) => (
                    <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-extrabold uppercase tracking-wider text-slate-600">
                      {children}
                    </th>
                  ),

                  // ==================================================
                  // TABLE CELL
                  // ==================================================

                  td: ({ children }) => (
                    <td className="border-t border-slate-200 px-5 py-4 text-sm leading-7 text-slate-700">
                      {children}
                    </td>
                  ),

                  // ==================================================
                  // DEL
                  // ==================================================

                  del: ({ children }) => (
                    <del className="text-slate-400">
                      {children}
                    </del>
                  ),

                }}
              >
                {content}
              </ReactMarkdown>

            </div>

          </div>

          {/* =================================================
              BOTTOM FADE + READ FULL LESSON
          ================================================= */}

          {!expanded && (
            <div className="absolute inset-x-0 bottom-0 z-10">

              <div className="h-40 bg-gradient-to-t from-white via-white/95 to-transparent" />

              <div className="border-t border-black/10 bg-white/95 px-5 py-5 backdrop-blur-sm sm:px-8">

                <div className="flex flex-col items-center justify-center gap-3 text-center">

                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Continue reading
                  </p>

                  <button
                    type="button"
                    onClick={() => setExpanded(true)}
                    className="inline-flex items-center gap-2 border border-blue-600/25 bg-blue-600/5 px-6 py-3 text-sm font-bold text-blue-700 transition-all duration-300 hover:border-blue-600/50 hover:bg-blue-600/10"
                  >
                    <Maximize2 size={16} />
                    Read Full Lesson
                  </button>

                </div>

              </div>

            </div>
          )}

        </div>

      </article>

      {/* =====================================================
          BOTTOM ACTION BAR
      ===================================================== */}

      <div className="mt-4 flex flex-col border border-black/10 bg-white sm:flex-row sm:items-center sm:justify-between">

        <div className="px-5 py-4">

          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            Lesson tools
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Review the lesson or generate an AI summary.
          </p>

        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-black/10 p-3 sm:border-t-0">

          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="inline-flex items-center gap-2 border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-300 hover:border-blue-600/30 hover:bg-blue-50/50 hover:text-blue-700"
          >
            <Maximize2 size={16} />

            {expanded ? "Collapse Lesson" : "Read Full Lesson"}
          </button>

          <button
            type="button"
            onClick={generateSummary}
            disabled={summaryLoading}
            className="inline-flex items-center gap-2 border border-blue-600/20 bg-blue-600/5 px-4 py-2.5 text-sm font-semibold text-blue-700 transition-all duration-300 hover:border-blue-600/40 hover:bg-blue-600/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {summaryLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Sparkles size={16} />
            )}

            {summaryLoading ? "Generating..." : "Generate Summary"}
          </button>

        </div>

      </div>

      {/* =====================================================
          AI SUMMARY
      ===================================================== */}

      {summaryOpen && (
        <section className="mt-4 border border-blue-600/20 bg-white shadow-[0_12px_40px_rgba(37,99,235,0.05)]">

          <div className="flex flex-col border-b border-black/10 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-3 px-5 py-5">

              <div className="flex h-10 w-10 items-center justify-center border border-blue-600/15 bg-blue-600/5 text-blue-600">
                <Sparkles size={19} />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                  AI Generated
                </p>

                <h3 className="mt-1 text-lg font-bold text-slate-950">
                  Lesson Summary
                </h3>
              </div>

            </div>

            <button
              type="button"
              onClick={() => setSummaryOpen(false)}
              className="border-t border-black/10 px-5 py-4 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900 sm:border-t-0"
            >
              <span className="inline-flex items-center gap-2">
                <X size={16} />
                Close
              </span>
            </button>

          </div>

          {summaryLoading ? (
            <div className="flex min-h-48 items-center justify-center px-6 py-12">

              <div className="flex flex-col items-center gap-4 text-center">

                <Loader2
                  size={28}
                  className="animate-spin text-blue-600"
                />

                <div>
                  <p className="font-semibold text-slate-900">
                    Generating your lesson summary
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    The AI is extracting the key concepts and important ideas.
                  </p>
                </div>

              </div>

            </div>
          ) : summaryError ? (
            <div className="border-l-2 border-red-500 bg-red-50 px-6 py-5">

              <p className="text-sm font-semibold text-red-700">
                Summary Error
              </p>

              <p className="mt-1 text-sm leading-6 text-red-600">
                {summaryError}
              </p>

              <button
                type="button"
                onClick={generateSummary}
                className="mt-4 border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50"
              >
                Try Again
              </button>

            </div>
          ) : summary ? (
            <>
              <div className="px-6 py-8 sm:px-10 lg:px-14">

                <div className="prose prose-slate max-w-none">

                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {summary}
                  </ReactMarkdown>

                </div>

              </div>

              {/* Export controls */}
              <div className="flex flex-col border-t border-black/10 bg-slate-50/70 sm:flex-row sm:items-center sm:justify-between">

                <div className="px-5 py-4">

                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                    Export Summary
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Save the generated summary for offline revision.
                  </p>

                </div>

                <div className="flex flex-wrap gap-2 px-5 pb-5 sm:px-5 sm:pb-0">

                  <button
                    type="button"
                    onClick={() => exportSummary("docx")}
                    disabled={exportLoading !== null}
                    className="inline-flex items-center gap-2 border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-300 hover:border-blue-600/30 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {exportLoading === "docx" ? (
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <FileText size={16} />
                    )}

                    DOCX
                  </button>

                  <button
                    type="button"
                    onClick={() => exportSummary("pdf")}
                    disabled={exportLoading !== null}
                    className="inline-flex items-center gap-2 border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-300 hover:border-blue-600/30 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {exportLoading === "pdf" ? (
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <Download size={16} />
                    )}

                    PDF
                  </button>

                </div>

              </div>
            </>
          ) : null}

        </section>
      )}

    </div>
  );
}