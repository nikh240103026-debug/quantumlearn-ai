import { LessonCompleteButton } from "@/components/learning/LessonCompleteButton";
import { LessonExperience } from "@/components/learning/LessonExperience";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Info,
} from "lucide-react";

interface LessonPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function LessonPage({
  params,
}: LessonPageProps) {
  const { slug } = await params;

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  // --------------------------------------------------
  // CURRENT LESSON
  // --------------------------------------------------

  const { data: lesson } = await supabase
    .from("lessons")
    .select(
      "id, course_id, title, slug, description, content, order_index, duration_minutes",
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!lesson) {
    notFound();
  }

  // --------------------------------------------------
  // USER PROGRESS
  // --------------------------------------------------

  const { data: progress } = await supabase
    .from("user_progress")
    .select("completed")
    .eq("user_id", user.id)
    .eq("lesson_id", lesson.id)
    .maybeSingle();

  // --------------------------------------------------
  // PREVIOUS LESSON
  // --------------------------------------------------

  const { data: previousLesson } = await supabase
    .from("lessons")
    .select("slug, title, order_index")
    .eq("course_id", lesson.course_id)
    .eq("is_published", true)
    .lt("order_index", lesson.order_index)
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();

  // --------------------------------------------------
  // NEXT LESSON
  // --------------------------------------------------

  const { data: nextLesson } = await supabase
    .from("lessons")
    .select("slug, title, order_index")
    .eq("course_id", lesson.course_id)
    .eq("is_published", true)
    .gt("order_index", lesson.order_index)
    .order("order_index", { ascending: true })
    .limit(1)
    .maybeSingle();

  return (
    <main className="min-h-screen bg-[#f5f5f3] text-[#111318]">
      {/* ==================================================
          LESSON HEADER
      ================================================== */}

      <section className="bg-[#f5f5f3]">
        <div className="mx-auto max-w-[1600px] px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
          {/* Back */}

          <Link
            href="/dashboard"
            className="group relative inline-flex items-center gap-2 py-2 text-sm font-medium text-[#111318]/55 transition-colors duration-300 hover:text-blue-600"
          >
            <ArrowLeft
              size={16}
              className="transition-transform duration-300 group-hover:-translate-x-1"
            />

            <span>Back to Dashboard</span>

            <span className="absolute bottom-0 left-0 h-px w-0 bg-blue-600 transition-all duration-500 group-hover:w-full" />
          </Link>

          {/* Lesson Header */}

          <div className="mt-10 max-w-5xl">
            {/* Lesson Number */}

            <div className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
              Lesson {lesson.order_index}
            </div>

            {/* Title */}

            <h1 className="mt-5 max-w-5xl text-4xl font-extrabold tracking-[-0.03em] text-[#111318] sm:text-5xl lg:text-6xl">
              {lesson.title}
            </h1>

            {/* Description */}

            {lesson.description && (
              <p className="mt-6 max-w-4xl text-base leading-8 text-[#111318]/60 sm:text-lg">
                {lesson.description}
              </p>
            )}

            {/* Duration */}

            <div className="mt-7 flex items-center gap-2 text-sm font-medium text-[#111318]/45">
              <Clock size={16} />
              <span>{lesson.duration_minutes} minutes</span>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          LESSON EXPERIENCE
      ================================================== */}

      <section className="relative bg-[#f5f5f3]">
        <div className="mx-auto max-w-[1600px] px-6 pb-14 sm:px-10 lg:px-14">
          <LessonExperience
            lessonId={lesson.id}
            lessonTitle={lesson.title}
          >
            <div className="py-2">
              <div className="lesson-content max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={{
                    /* ==========================================
                       H1 — CHAPTER
                    ========================================== */

                    h1: ({ children }) => (
                      <div className="mb-10 mt-4">
                        <div className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                          Chapter
                        </div>

                        <h1 className="text-3xl font-extrabold tracking-[-0.02em] text-[#111318] sm:text-4xl">
                          {children}
                        </h1>
                      </div>
                    ),

                    /* ==========================================
                       H2 — MAIN TOPIC
                    ========================================== */

                    h2: ({ children }) => (
                      <div className="mb-6 mt-14">
                        <h2 className="flex items-start gap-3 text-2xl font-bold tracking-[-0.02em] text-[#111318] sm:text-3xl">
                          <span className="mt-3 h-2 w-2 shrink-0 bg-blue-600" />

                          <span>{children}</span>
                        </h2>
                      </div>
                    ),

                    /* ==========================================
                       H3 — SUBTOPIC
                    ========================================== */

                    h3: ({ children }) => (
                      <h3 className="mb-4 mt-10 text-xl font-bold text-[#111318] sm:text-2xl">
                        {children}
                      </h3>
                    ),

                    /* ==========================================
                       H4
                    ========================================== */

                    h4: ({ children }) => (
                      <h4 className="mb-3 mt-8 text-lg font-bold text-[#111318]">
                        {children}
                      </h4>
                    ),

                    /* ==========================================
                       PARAGRAPH
                    ========================================== */

                    p: ({ children }) => (
                      <p className="mb-5 max-w-5xl text-[16px] leading-8 text-[#111318]/70 sm:text-[17px]">
                        {children}
                      </p>
                    ),

                    /* ==========================================
                       STRONG
                    ========================================== */

                    strong: ({ children }) => (
                      <strong className="font-bold text-[#111318]">
                        {children}
                      </strong>
                    ),

                    /* ==========================================
                       EMPHASIS
                    ========================================== */

                    em: ({ children }) => (
                      <em className="italic text-[#111318]/80">
                        {children}
                      </em>
                    ),

                    /* ==========================================
                       UNORDERED LIST
                    ========================================== */

                    ul: ({ children }) => (
                      <ul className="mb-7 mt-4 max-w-5xl space-y-3 pl-1">
                        {children}
                      </ul>
                    ),

                    /* ==========================================
                       ORDERED LIST
                    ========================================== */

                    ol: ({ children }) => (
                      <ol className="mb-7 mt-4 max-w-5xl list-decimal space-y-3 pl-7 marker:font-bold marker:text-blue-600">
                        {children}
                      </ol>
                    ),

                    /* ==========================================
                       LIST ITEM
                    ========================================== */

                    li: ({ children }) => (
                      <li className="flex items-start gap-3 text-[16px] leading-7 text-[#111318]/70 sm:text-[17px]">
                        <span className="mt-3 h-1.5 w-1.5 shrink-0 bg-blue-500" />

                        <span>{children}</span>
                      </li>
                    ),

                    /* ==========================================
                       INLINE CODE
                    ========================================== */

                    code: ({ children }) => (
                      <code className="bg-[#111318]/5 px-1.5 py-0.5 font-mono text-[0.9em] font-semibold text-blue-700">
                        {children}
                      </code>
                    ),

                    /* ==========================================
                       CODE BLOCK
                    ========================================== */

                    pre: ({ children }) => (
                      <pre className="my-8 max-w-6xl overflow-x-auto bg-[#090c11] p-5 text-sm leading-7 text-slate-100">
                        {children}
                      </pre>
                    ),

                    /* ==========================================
                       BLOCKQUOTE
                    ========================================== */

                    blockquote: ({ children }) => (
                      <div className="my-8 max-w-5xl bg-blue-600/[0.045] px-6 py-5">
                        <div className="flex gap-3">
                          <Info
                            className="mt-1 shrink-0 text-blue-600"
                            size={19}
                          />

                          <div className="text-[16px] leading-7 text-[#111318]/70">
                            {children}
                          </div>
                        </div>
                      </div>
                    ),

                    /* ==========================================
                       HORIZONTAL RULE
                    ========================================== */

                    hr: () => (
                      <div
                        aria-hidden="true"
                        className="my-10 h-px w-full bg-[#111318]/[0.07]"
                      />
                    ),

                    /* ==========================================
                       LINKS
                    ========================================== */

                    a: ({ children, href }) => (
                      <a
                        href={href}
                        className="font-semibold text-blue-600 underline decoration-blue-600/30 underline-offset-4 transition-colors duration-300 hover:text-blue-700"
                      >
                        {children}
                      </a>
                    ),

                    /* ==========================================
                       TABLE
                    ========================================== */

                    table: ({ children }) => (
                      <div className="my-8 max-w-6xl overflow-x-auto">
                        <table className="min-w-full border-collapse text-sm">
                          {children}
                        </table>
                      </div>
                    ),

                    thead: ({ children }) => (
                      <thead className="bg-[#111318]/[0.035]">
                        {children}
                      </thead>
                    ),

                    th: ({ children }) => (
                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#111318]/60">
                        {children}
                      </th>
                    ),

                    td: ({ children }) => (
                      <td className="px-5 py-4 text-sm leading-6 text-[#111318]/70">
                        {children}
                      </td>
                    ),

                    del: ({ children }) => (
                      <del className="text-[#111318]/40">
                        {children}
                      </del>
                    ),
                  }}
                >
                  {lesson.content || "Lesson content will be added here."}
                </ReactMarkdown>
              </div>
            </div>
          </LessonExperience>

          {/* ==================================================
              LESSON AI TUTOR
          ================================================== */}

          <div className="mt-8 flex justify-start">
            <Link
              href={`/learn/tutor/${lesson.slug}`}
              className="group relative inline-flex items-center gap-2 py-2 text-sm font-semibold text-[#111318]/60 transition-colors duration-300 hover:text-blue-600"
            >
              <MessageCircle
                size={17}
                className="transition-transform duration-300 group-hover:scale-110"
              />

              <span>Ask AI Tutor</span>

              <span className="absolute bottom-0 left-0 h-px w-0 bg-blue-600 transition-all duration-500 group-hover:w-full" />
            </Link>
          </div>

          {/* ==================================================
              COMPLETION
          ================================================== */}

          <div className="mt-14 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/dashboard"
              className="group relative inline-flex w-fit items-center gap-2 py-2 text-sm font-semibold text-[#111318]/55 transition-colors duration-300 hover:text-blue-600"
            >
              <ArrowLeft
                size={16}
                className="transition-transform duration-300 group-hover:-translate-x-1"
              />

              <span>Dashboard</span>

              <span className="absolute bottom-0 left-0 h-px w-0 bg-blue-600 transition-all duration-500 group-hover:w-full" />
            </Link>

            <LessonCompleteButton
              lessonId={lesson.id}
              courseId={lesson.course_id}
              completed={progress?.completed ?? false}
            />
          </div>

          {/* ==================================================
              LESSON NAVIGATION
          ================================================== */}

          <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2">
            {/* Previous */}

            {previousLesson ? (
              <Link
                href={`/learn/${previousLesson.slug}`}
                className="group relative block py-5 text-left transition-all duration-300 hover:text-blue-600"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-[#111318]/45 transition-colors duration-300 group-hover:text-blue-600">
                  <ArrowLeft
                    size={16}
                    className="transition-transform duration-300 group-hover:-translate-x-1"
                  />

                  <span>Previous Lesson</span>
                </div>

                <p className="mt-3 text-lg font-bold text-[#111318] transition-colors duration-300 group-hover:text-blue-600">
                  {previousLesson.title}
                </p>

                <p className="mt-1 text-xs text-[#111318]/40">
                  Lesson {previousLesson.order_index}
                </p>

                <span className="absolute bottom-0 left-0 h-px w-0 bg-blue-600 transition-all duration-500 group-hover:w-full" />
              </Link>
            ) : (
              <div />
            )}

            {/* Next */}

            {nextLesson ? (
              <Link
                href={`/learn/${nextLesson.slug}`}
                className="group relative block py-5 text-left transition-all duration-300 sm:text-right"
              >
                <div className="flex items-center justify-start gap-2 text-sm font-semibold text-[#111318]/45 transition-colors duration-300 group-hover:text-blue-600 sm:justify-end">
                  <span>Next Lesson</span>

                  <ArrowRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </div>

                <p className="mt-3 text-lg font-bold text-[#111318] transition-colors duration-300 group-hover:text-blue-600">
                  {nextLesson.title}
                </p>

                <p className="mt-1 text-xs text-[#111318]/40">
                  Lesson {nextLesson.order_index}
                </p>

                <span className="absolute bottom-0 right-0 h-px w-0 bg-blue-600 transition-all duration-500 group-hover:w-full" />
              </Link>
            ) : (
              <div className="py-5 text-right">
                <div className="flex items-center justify-start gap-2 text-sm font-bold text-blue-600 sm:justify-end">
                  <CheckCircle2 size={17} />

                  <span>Course Complete</span>
                </div>

                <p className="mt-1 text-xs text-[#111318]/40">
                  You have reached the final lesson.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}