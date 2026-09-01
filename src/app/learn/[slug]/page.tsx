import { LessonCompleteButton } from "@/components/learning/LessonCompleteButton";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock,
  CheckCircle2,
  Info,
  Lightbulb,
  Sparkles,
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

  // ==========================================================
  // CURRENT LESSON
  // ==========================================================

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

  // ==========================================================
  // USER PROGRESS
  // ==========================================================

  const { data: progress } = await supabase
    .from("user_progress")
    .select("completed")
    .eq("user_id", user.id)
    .eq("lesson_id", lesson.id)
    .maybeSingle();

  // ==========================================================
  // PREVIOUS LESSON
  // ==========================================================

  const { data: previousLesson } = await supabase
    .from("lessons")
    .select("slug, title, order_index")
    .eq("course_id", lesson.course_id)
    .eq("is_published", true)
    .lt("order_index", lesson.order_index)
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();

  // ==========================================================
  // NEXT LESSON
  // ==========================================================

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
    <main className="min-h-screen bg-slate-50">

      {/* =====================================================
          LESSON HERO
      ===================================================== */}

      <section className="relative overflow-hidden border-b border-slate-200 bg-white">

        {/* Decorative background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-blue-100/60 blur-3xl" />
          <div className="absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-cyan-100/40 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">

          {/* Back to dashboard */}
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-blue-600"
          >
            <ArrowLeft
              size={16}
              className="transition-transform group-hover:-translate-x-0.5"
            />
            Back to Dashboard
          </Link>

          <div className="mt-8 max-w-4xl">

            {/* Lesson badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-blue-700">
              <BookOpen size={15} />
              Lesson {lesson.order_index}
            </div>

            {/* Title */}
            <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
              {lesson.title}
            </h1>

            {/* Description */}
            {lesson.description && (
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
                {lesson.description}
              </p>
            )}

            {/* Meta */}
            <div className="mt-6 flex flex-wrap items-center gap-3">

              <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-medium text-slate-600">
                <Clock size={16} />
                {lesson.duration_minutes} minutes
              </div>

              <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-medium text-slate-600">
                <Sparkles size={16} />
                Learning Notes
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          LESSON CONTENT
      ===================================================== */}

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">

        <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          {/* Content header */}
          <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-6 py-6 sm:px-10">

            <div className="flex items-start gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <BookOpen size={21} />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                  Lesson Notes
                </p>

                <h2 className="mt-1 text-lg font-bold text-slate-950">
                  Build your understanding step by step
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Read each section carefully and focus on the key concepts.
                </p>
              </div>

            </div>

          </div>

          {/* Markdown content */}
          <div className="px-6 py-9 sm:px-10 sm:py-12 lg:px-14 lg:py-14">

            <div className="lesson-content">

              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{

                  // ==================================================
                  // H1 — CHAPTER
                  // ==================================================

                  h1: ({ children }) => (
                    <section className="mb-12 mt-2 border-b border-slate-200 pb-7">

                      <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                        <span className="h-2 w-2 rounded-full bg-blue-600" />
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

                        <span className="mt-2.5 h-3 w-3 shrink-0 rounded-full bg-blue-600 ring-4 ring-blue-50" />

                        <span>{children}</span>

                      </h2>

                      <div className="mt-4 h-1 w-16 rounded-full bg-blue-100" />

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
                    <p className="mb-6 max-w-3xl text-[16px] leading-8 text-slate-700 sm:text-[17px]">
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
                    <ul className="mb-8 mt-5 max-w-3xl space-y-3">
                      {children}
                    </ul>
                  ),

                  // ==================================================
                  // ORDERED LIST
                  // ==================================================

                  ol: ({ children }) => (
                    <ol className="mb-8 mt-5 max-w-3xl list-decimal space-y-3 pl-7 marker:font-bold marker:text-blue-600">
                      {children}
                    </ol>
                  ),

                  // ==================================================
                  // LIST ITEM
                  // ==================================================

                  li: ({ children }) => (
                    <li className="flex items-start gap-3 text-[16px] leading-7 text-slate-700 sm:text-[17px]">

                      <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />

                      <span className="flex-1">
                        {children}
                      </span>

                    </li>
                  ),

                  // ==================================================
                  // INLINE CODE
                  // ==================================================

                  code: ({ children }) => (
                    <code className="rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[0.9em] font-semibold text-blue-700">
                      {children}
                    </code>
                  ),

                  // ==================================================
                  // CODE BLOCK
                  // ==================================================

                  pre: ({ children }) => (
                    <div className="my-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-md">

                      <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-900 px-5 py-3">

                        <span className="h-2.5 w-2.5 rounded-full bg-slate-600" />
                        <span className="h-2.5 w-2.5 rounded-full bg-slate-600" />
                        <span className="h-2.5 w-2.5 rounded-full bg-slate-600" />

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
                    <aside className="my-8 rounded-2xl border border-blue-200 bg-blue-50/70 p-5 sm:p-6">

                      <div className="flex items-start gap-4">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
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
                    <div className="my-9 overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">

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
                {lesson.content || "Lesson content will be added here."}
              </ReactMarkdown>

            </div>

          </div>

        </article>

        {/* =====================================================
            KEY LEARNING MESSAGE
        ===================================================== */}

        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">

          <div className="flex items-start gap-4">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <Lightbulb size={20} />
            </div>

            <div>
              <p className="text-sm font-bold text-amber-900">
                Learning Tip
              </p>

              <p className="mt-1 text-sm leading-6 text-amber-800">
                Don't rush through the lesson. Make sure you understand the
                fundamental concepts before moving to the next topic.
              </p>
            </div>

          </div>

        </div>

        {/* =====================================================
            COMPLETION
        ===================================================== */}

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

          <div className="flex flex-wrap items-center gap-3">
  <Link
    href={`/learn/tutor/${lesson.slug}`}
    className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-100"
  >
    <Sparkles size={17} />
    Ask AI Tutor
  </Link>

  <LessonCompleteButton
    lessonId={lesson.id}
    courseId={lesson.course_id}
    completed={progress?.completed ?? false}
  />
</div>

        </div>

        {/* =====================================================
            LESSON NAVIGATION
        ===================================================== */}

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">

          {/* Previous Lesson */}

          {previousLesson ? (
            <Link
              href={`/learn/${previousLesson.slug}`}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
            >

              <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">

                <ArrowLeft
                  size={16}
                  className="transition-transform group-hover:-translate-x-1"
                />

                Previous Lesson

              </div>

              <p className="mt-3 text-base font-bold text-slate-950">
                {previousLesson.title}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Lesson {previousLesson.order_index}
              </p>

            </Link>
          ) : (
            <div />
          )}

          {/* Next Lesson */}

          {nextLesson ? (
            <Link
              href={`/learn/${nextLesson.slug}`}
              className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md sm:text-right"
            >

              <div className="flex items-center justify-end gap-2 text-sm font-semibold text-slate-500">

                Next Lesson

                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />

              </div>

              <p className="mt-3 text-base font-bold text-slate-950">
                {nextLesson.title}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Lesson {nextLesson.order_index}
              </p>

            </Link>
          ) : (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-5 text-right">

              <div className="flex items-center justify-end gap-2 text-sm font-bold text-green-700">
                <CheckCircle2 size={17} />
                Course Complete 🎉
              </div>

              <p className="mt-1 text-xs text-green-600">
                You have reached the final lesson.
              </p>

            </div>
          )}

        </div>

      </section>

    </main>
  );
}