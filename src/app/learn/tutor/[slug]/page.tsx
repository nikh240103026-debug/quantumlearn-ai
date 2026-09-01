import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  ArrowLeft,
  BookOpen,
  Bot,
  Sparkles,
} from "lucide-react";
import TutorChat from "@/components/learning/TutorChat";

interface TutorPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function TutorPage({
  params,
}: TutorPageProps) {
  const { slug } = await params;

  const supabase = await createSupabaseServerClient();

  // ==========================================================
  // AUTHENTICATED USER
  // ==========================================================

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
      "id, course_id, title, slug, description, content, order_index",
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!lesson) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

          <Link
            href={`/learn/${lesson.slug}`}
            className="group inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-blue-600"
          >
            <ArrowLeft
              size={16}
              className="transition-transform group-hover:-translate-x-0.5"
            />

            Back to Lesson
          </Link>

          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-start gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
                <Bot size={22} />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">

                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                    AI Tutor
                  </p>

                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
                    Lesson {lesson.order_index}
                  </span>

                </div>

                <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                  QuantumLearn Tutor
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                  Ask questions about{" "}
                  <span className="font-semibold text-slate-700">
                    {lesson.title}
                  </span>
                </p>
              </div>

            </div>

            <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 sm:flex">
              <Sparkles
                size={17}
                className="text-blue-600"
              />

              <span className="text-xs font-semibold text-slate-600">
                Context-aware learning
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          TUTOR
      ===================================================== */}

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">

          {/* Chat */}

          <div className="min-w-0">
            <TutorChat
              lesson={{
                id: lesson.id,
                title: lesson.title,
                description: lesson.description,
                content: lesson.content,
              }}
            />
          </div>

          {/* Lesson Context */}

          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <BookOpen size={19} />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Current Lesson
                </p>

                <p className="mt-1 text-sm font-bold text-slate-950">
                  Lesson {lesson.order_index}
                </p>
              </div>

            </div>

            <h2 className="mt-5 text-base font-bold text-slate-950">
              {lesson.title}
            </h2>

            {lesson.description && (
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {lesson.description}
              </p>
            )}

            <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/60 p-4">

              <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
                Tutor context
              </p>

              <p className="mt-2 text-xs leading-5 text-blue-900">
                The tutor uses this lesson as context when answering your
                questions.
              </p>

            </div>

            <Link
              href={`/learn/${lesson.slug}`}
              className="mt-5 inline-flex w-full items-center justify-center rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Return to Lesson
            </Link>

          </aside>

        </div>

      </section>
    </main>
  );
}