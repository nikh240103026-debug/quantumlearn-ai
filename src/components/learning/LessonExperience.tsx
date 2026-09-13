"use client";

import {
  type ReactNode,
  useState,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import {
  ArrowDownToLine,
  ChevronDown,
  ChevronUp,
  FileText,
  Loader2,
} from "lucide-react";

interface LessonExperienceProps {
  lessonId: string;
  lessonTitle: string;
  children: ReactNode;
}

type SummaryState =
  | "idle"
  | "loading"
  | "success"
  | "error";

function getSafeFileName(title: string): string {
  return (
    title
      .replace(/[<>:"/\\|?*]+/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 100) || "lesson-summary"
  );
}

export function LessonExperience({
  lessonId,
  lessonTitle,
  children,
}: LessonExperienceProps) {
  const [expanded, setExpanded] = useState(false);

  const [summary, setSummary] = useState("");

  const [summaryState, setSummaryState] =
    useState<SummaryState>("idle");

  const [error, setError] = useState("");

  async function generateSummary() {
    if (summaryState === "loading") {
      return;
    }

    setSummaryState("loading");
    setError("");

    try {
      const response = await fetch(
        "/api/lesson-summary",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            lessonId,
          }),
          cache: "no-store",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to generate the lesson summary.",
        );
      }

      const generatedSummary =
        typeof data?.summary === "string"
          ? data.summary.trim()
          : "";

      if (!generatedSummary) {
        throw new Error(
          "The AI returned an empty summary. Please try again.",
        );
      }

      setSummary(generatedSummary);
      setSummaryState("success");
    } catch (err) {
      console.error(
        "Lesson summary generation error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to generate the lesson summary.",
      );

      setSummaryState("error");
    }
  }

  async function downloadSummary(
  format: "docx" | "pdf",
) {
  if (!summary) {
    return;
  }

  try {
    const response = await fetch(
      "/api/lesson-summary/export",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: lessonTitle,
          summary,
          format,
        }),
      },
    );

    if (!response.ok) {
      let message =
        "Unable to export the lesson summary.";

      try {
        const data =
          await response.json();

        if (
          typeof data?.error === "string"
        ) {
          message = data.error;
        }
      } catch {
        // Keep the default error message.
      }

      throw new Error(message);
    }

    const blob =
      await response.blob();

    const contentDisposition =
      response.headers.get(
        "Content-Disposition",
      );

    let filename =
      `${getSafeFileName(lessonTitle)}-summary.${format}`;

    const filenameMatch =
      contentDisposition?.match(
        /filename="([^"]+)"/i,
      );

    if (filenameMatch?.[1]) {
      filename = filenameMatch[1];
    }

    const downloadUrl =
      window.URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = downloadUrl;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(
      downloadUrl,
    );
  } catch (error) {
    console.error(
      "Lesson summary export error:",
      error,
    );

    setError(
      error instanceof Error
        ? error.message
        : "Unable to export the lesson summary.",
    );
  }
}

  const showSummary =
    summaryState === "success" && Boolean(summary);

  return (
    <div
      className="
        group/experience
        relative
        w-full
      "
    >
      {/* ==================================================
          TOP ACTIONS
      ================================================== */}

      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
            Lesson Notes
          </p>

          <p className="mt-2 text-sm leading-6 text-[#111318]/45">
            Read carefully and build your understanding step by step.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <button
            type="button"
            onClick={generateSummary}
            disabled={summaryState === "loading"}
            className="
              group/button
              relative
              inline-flex
              items-center
              gap-2
              py-2
              text-sm
              font-semibold
              text-blue-600
              transition-colors
              duration-300
              hover:text-blue-700
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {summaryState === "loading" ? (
              <>
                <Loader2
                  size={16}
                  className="animate-spin"
                />

                <span>Generating Summary</span>
              </>
            ) : (
              <>
                <span>Generate Summary</span>

                <ArrowDownToLine
                  size={15}
                  className="
                    rotate-0
                    transition-transform
                    duration-300
                    group-hover/button:translate-y-0.5
                  "
                />
              </>
            )}

            <span
              aria-hidden="true"
              className="
                absolute
                bottom-0
                left-0
                h-px
                w-0
                bg-blue-600
                transition-all
                duration-500
                group-hover/button:w-full
              "
            />
          </button>

          <button
            type="button"
            onClick={() =>
              setExpanded((current) => !current)
            }
            className="
              group/button
              relative
              inline-flex
              items-center
              gap-2
              py-2
              text-sm
              font-semibold
              text-[#111318]/55
              transition-colors
              duration-300
              hover:text-blue-600
            "
          >
            <span>
              {expanded
                ? "Collapse Lesson"
                : "Read Full Lesson"}
            </span>

            {expanded ? (
              <ChevronUp
                size={16}
                className="transition-transform duration-300 group-hover/button:-translate-y-0.5"
              />
            ) : (
              <ChevronDown
                size={16}
                className="transition-transform duration-300 group-hover/button:translate-y-0.5"
              />
            )}

            <span
              aria-hidden="true"
              className="
                absolute
                bottom-0
                left-0
                h-px
                w-0
                bg-blue-600
                transition-all
                duration-500
                group-hover/button:w-full
              "
            />
          </button>
        </div>
      </div>

      {/* ==================================================
          LESSON + SUMMARY
      ================================================== */}

      <div
        className="
          relative
          grid
          gap-10
          lg:grid-cols-[minmax(0,1fr)_380px]
          lg:gap-12
        "
      >
        {/* ==================================================
            ANIMATED HOVER SEPARATOR
        ================================================== */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            bottom-0
            right-[404px]
            top-0
            z-10
            hidden
            w-px
            overflow-hidden
            lg:block
          "
        >
          <div
            className="
              h-full
              w-full
              origin-top
              scale-y-0
              bg-blue-600
              opacity-0
              transition-all
              duration-700
              ease-out
              group-hover/experience:scale-y-100
              group-hover/experience:opacity-100
            "
          />
        </div>

        {/* ==================================================
            LESSON CONTENT
        ================================================== */}

        <div className="relative min-w-0">
          <div
            className={[
              "relative overflow-hidden transition-[max-height] duration-700 ease-out",
              expanded
                ? "max-h-none"
                : "max-h-[calc(100vh-250px)]",
            ].join(" ")}
          >
            {children}

            {!expanded && (
              <>
                {/* Fade */}

                <div
                  aria-hidden="true"
                  className="
                    pointer-events-none
                    absolute
                    bottom-0
                    left-0
                    right-0
                    h-40
                    bg-gradient-to-t
                    from-[#f5f5f3]
                    via-[#f5f5f3]/90
                    to-transparent
                  "
                />

                {/* Read full lesson */}

                <div
                  className="
                    absolute
                    bottom-5
                    left-0
                    right-0
                    z-20
                    flex
                    justify-center
                  "
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpanded(true)
                    }
                    className="
                      group/read
                      relative
                      inline-flex
                      items-center
                      gap-2
                      py-2
                      text-sm
                      font-bold
                      text-blue-600
                      transition-colors
                      duration-300
                      hover:text-blue-700
                    "
                  >
                    <span>Read Full Lesson</span>

                    <ChevronDown
                      size={16}
                      className="
                        transition-transform
                        duration-300
                        group-hover/read:translate-y-1
                      "
                    />

                    <span
                      aria-hidden="true"
                      className="
                        absolute
                        bottom-0
                        left-0
                        h-px
                        w-0
                        bg-blue-600
                        transition-all
                        duration-500
                        group-hover/read:w-full
                      "
                    />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ==================================================
            SUMMARY
        ================================================== */}

        <aside
          className="
            min-w-0
            lg:sticky
            lg:top-8
            lg:self-start
          "
        >
          <div className="py-1">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                  AI Summary
                </p>

                <h2 className="mt-2 text-xl font-bold tracking-tight text-[#111318]">
                  Lesson Summary
                </h2>
              </div>

              {showSummary && (
                <FileText
                  size={18}
                  className="text-blue-600"
                />
              )}
            </div>

            {!showSummary && (
              <div className="mt-8">
                <p className="text-sm leading-7 text-[#111318]/50">
                  Generate a concise revision summary of
                  this lesson using the lesson content already
                  stored on the platform.
                </p>

                <button
                  type="button"
                  onClick={generateSummary}
                  disabled={
                    summaryState === "loading"
                  }
                  className="
                    group/summary
                    relative
                    mt-6
                    inline-flex
                    items-center
                    gap-2
                    py-2
                    text-sm
                    font-semibold
                    text-blue-600
                    transition-colors
                    duration-300
                    hover:text-blue-700
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {summaryState === "loading" ? (
                    <>
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />

                      <span>
                        Generating Summary
                      </span>
                    </>
                  ) : (
                    <>
                      <span>
                        Generate Summary
                      </span>

                      <ArrowDownToLine
                        size={15}
                        className="transition-transform duration-300 group-hover/summary:translate-y-0.5"
                      />
                    </>
                  )}

                  <span
                    aria-hidden="true"
                    className="
                      absolute
                      bottom-0
                      left-0
                      h-px
                      w-0
                      bg-blue-600
                      transition-all
                      duration-500
                      group-hover/summary:w-full
                    "
                  />
                </button>
              </div>
            )}

            {summaryState === "error" && (
              <div className="mt-7">
                <p className="text-sm leading-7 text-red-600">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={generateSummary}
                  className="
                    group/retry
                    relative
                    mt-3
                    py-2
                    text-sm
                    font-semibold
                    text-[#111318]/60
                    transition-colors
                    duration-300
                    hover:text-blue-600
                  "
                >
                  Try Again

                  <span
                    aria-hidden="true"
                    className="
                      absolute
                      bottom-0
                      left-0
                      h-px
                      w-0
                      bg-blue-600
                      transition-all
                      duration-500
                      group-hover/retry:w-full
                    "
                  />
                </button>
              </div>
            )}

            {showSummary && (
              <>
                <div className="mt-7">
                  <div
                    className="
                      max-h-[calc(100vh-170px)]
                      overflow-y-auto
                      pr-2
                    "
                  >
                    <div className="lesson-summary-content">
                      <ReactMarkdown
                          remarkPlugins={[
                            remarkGfm,
                            remarkMath,
                          ]}
                          rehypePlugins={[rehypeKatex]}
                          components={{
                          h1: ({ children }) => (
                            <h1 className="mb-4 mt-1 text-2xl font-extrabold tracking-tight text-[#111318]">
                              {children}
                            </h1>
                          ),

                          h2: ({ children }) => (
                            <h2 className="mb-3 mt-7 text-lg font-bold text-[#111318]">
                              {children}
                            </h2>
                          ),

                          h3: ({ children }) => (
                            <h3 className="mb-2 mt-5 text-base font-bold text-[#111318]">
                              {children}
                            </h3>
                          ),

                          p: ({ children }) => (
                            <p className="mb-4 text-[14px] leading-7 text-[#111318]/70">
                              {children}
                            </p>
                          ),

                          strong: ({ children }) => (
                            <strong className="font-bold text-[#111318]">
                              {children}
                            </strong>
                          ),

                          em: ({ children }) => (
                            <em className="italic text-[#111318]/75">
                              {children}
                            </em>
                          ),

                          ul: ({ children }) => (
                            <ul className="mb-5 ml-5 list-disc space-y-2.5 text-[14px] leading-7 text-[#111318]/70">
                              {children}
                            </ul>
                          ),

                          ol: ({ children }) => (
                            <ol className="mb-4 ml-5 list-decimal space-y-2 text-sm leading-6 text-[#111318]/65">
                              {children}
                            </ol>
                          ),

                          li: ({ children }) => (
                            <li className="pl-1">
                              {children}
                            </li>
                          ),

                          blockquote: ({
                            children,
                          }) => (
                            <blockquote className="my-5 pl-4 text-sm italic leading-7 text-[#111318]/55">
                              {children}
                            </blockquote>
                          ),

                          code: ({ children }) => (
                            <code className="bg-[#111318]/5 px-1 py-0.5 font-mono text-[0.9em] text-blue-700">
                              {children}
                            </code>
                          ),

                          pre: ({ children }) => (
                            <pre className="my-5 overflow-x-auto bg-[#090c11] p-4 text-xs leading-6 text-slate-100">
                              {children}
                            </pre>
                          ),

                          a: ({
                            href,
                            children,
                          }) => (
                            <a
                              href={href}
                              className="font-semibold text-blue-600 underline underline-offset-2 hover:text-blue-700"
                            >
                              {children}
                            </a>
                          ),

                          table: ({ children }) => (
                            <div className="my-5 overflow-x-auto">
                              <table className="min-w-full border-collapse text-xs">
                                {children}
                              </table>
                            </div>
                          ),

                          th: ({ children }) => (
                            <th className="px-3 py-2 text-left font-bold text-[#111318]/60">
                              {children}
                            </th>
                          ),

                          td: ({ children }) => (
                            <td className="px-3 py-2 text-left text-[#111318]/60">
                              {children}
                            </td>
                          ),

                          hr: () => (
                            <div
                              aria-hidden="true"
                              className="my-5 h-px bg-[#111318]/[0.07]"
                            />
                          ),
                        }}
                      >
                        {summary}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>

                {/* ==================================================
                    EXPORT ACTIONS
                ================================================== */}

                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                  <button
                    type="button"
                    onClick={() =>
                      downloadSummary("pdf")
                    }
                    className="
                      group/export
                      relative
                      inline-flex
                      items-center
                      gap-2
                      py-2
                      text-xs
                      font-bold
                      uppercase
                      tracking-wider
                      text-[#111318]/55
                      transition-colors
                      duration-300
                      hover:text-blue-600
                    "
                  >
                    <span>Export PDF</span>

                    <ArrowDownToLine
                      size={14}
                      className="transition-transform duration-300 group-hover/export:translate-y-0.5"
                    />

                    <span
                      aria-hidden="true"
                      className="
                        absolute
                        bottom-0
                        left-0
                        h-px
                        w-0
                        bg-blue-600
                        transition-all
                        duration-500
                        group-hover/export:w-full
                      "
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      downloadSummary("docx")
                    }
                    className="
                      group/export
                      relative
                      inline-flex
                      items-center
                      gap-2
                      py-2
                      text-xs
                      font-bold
                      uppercase
                      tracking-wider
                      text-[#111318]/55
                      transition-colors
                      duration-300
                      hover:text-blue-600
                    "
                  >
                    <span>Export DOCX</span>

                    <ArrowDownToLine
                      size={14}
                      className="transition-transform duration-300 group-hover/export:translate-y-0.5"
                    />

                    <span
                      aria-hidden="true"
                      className="
                        absolute
                        bottom-0
                        left-0
                        h-px
                        w-0
                        bg-blue-600
                        transition-all
                        duration-500
                        group-hover/export:w-full
                      "
                    />
                  </button>
                </div>
              </>
            )}
          </div>
        </aside>
      </div>

      {/* ==================================================
          BOTTOM SUMMARY ACTION
      ================================================== */}

      <div className="mt-14">
        <button
          type="button"
          onClick={generateSummary}
          disabled={summaryState === "loading"}
          className="
            group/bottom
            relative
            inline-flex
            items-center
            gap-2
            py-2
            text-sm
            font-semibold
            text-blue-600
            transition-colors
            duration-300
            hover:text-blue-700
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {summaryState === "loading" ? (
            <>
              <Loader2
                size={16}
                className="animate-spin"
              />

              <span>Generating Summary</span>
            </>
          ) : (
            <>
              <span>Generate Summary</span>

              <ArrowDownToLine
                size={15}
                className="transition-transform duration-300 group-hover/bottom:translate-y-0.5"
              />
            </>
          )}

          <span
            aria-hidden="true"
            className="
              absolute
              bottom-0
              left-0
              h-px
              w-0
              bg-blue-600
              transition-all
              duration-500
              group-hover/bottom:w-full
            "
          />
        </button>
      </div>
    </div>
  );
}