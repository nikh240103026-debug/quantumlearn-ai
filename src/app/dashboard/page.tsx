import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { CourseRoadmap } from "@/components/dashboard/CourseRoadmap";
import { ProgressAnalytics } from "@/components/dashboard/ProgressAnalytics";
import { calculateProgressAnalytics } from "@/lib/progress/progress-engine";
import PersonalizedLearningPath from "@/components/dashboard/PersonalizedLearningPath";
import {
  getCurriculumProgress,
  getOverallCurriculumProgress,
} from "@/lib/curriculum/curriculum-recommendation-service";

import {
  ArrowRight,
  Atom,
  BookOpen,
  Brain,
  CheckCircle2,
  Code2,
  FlaskConical,
  Sparkles,
  Target,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // ==========================================================
  // CURRENT PUBLISHED COURSE
  // ==========================================================

  const { data: course } = await supabase
    .from("courses")
    .select("id, title, description, level")
    .eq("slug", "quantum-computing-fundamentals")
    .eq("is_published", true)
    .single();

  // ==========================================================
  // PUBLISHED LESSONS
  // ==========================================================

  const { data: lessons } = await supabase
    .from("lessons")
    .select(
      "id, title, slug, description, order_index, duration_minutes",
    )
    .eq("course_id", course?.id)
    .eq("is_published", true)
    .order("order_index", { ascending: true });

  // ==========================================================
  // USER PROGRESS
  // ==========================================================

  const { data: progressRows } = await supabase
    .from("user_progress")
    .select("lesson_id, progress, completed")
    .eq("user_id", user.id)
    .eq("course_id", course?.id);

  // ==========================================================
  // LEARNING STREAK
  // ==========================================================

  const { data: streak } = await supabase
    .from("learning_streaks")
    .select(
      "current_streak, longest_streak, last_activity_date",
    )
    .eq("user_id", user.id)
    .maybeSingle();

  const currentStreak = streak?.current_streak ?? 0;
  const longestStreak = streak?.longest_streak ?? 0;

  // ==========================================================
  // PRACTICE RESULTS
  // ==========================================================

  const {
    data: practiceResults,
    error: practiceResultsError,
  } = await supabase
    .from("practice_results")
    .select(
      "id, lesson_slug, score, total_questions, percentage, completed_at",
    )
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false });

  if (practiceResultsError) {
    console.error(
      "Failed to fetch practice results:",
      practiceResultsError,
    );
  }

  const results = practiceResults ?? [];

  const practiceAttempts = results.length;

  const bestPracticeScore =
    results.length > 0
      ? Math.max(
          ...results.map(
            (result) => result.percentage ?? 0,
          ),
        )
      : 0;

  const averagePracticePercentage =
    results.length > 0
      ? Math.round(
          results.reduce(
            (total, result) =>
              total + (result.percentage ?? 0),
            0,
          ) / results.length,
        )
      : 0;

  const practiceQuestionsAnswered =
    results.reduce(
      (total, result) =>
        total + (result.total_questions ?? 0),
      0,
    );

  // ==========================================================
  // AI ACTIVITY
  // ==========================================================

  const { data: aiActivities } =
    await supabase
      .from("ai_activity")
      .select(
        "activity_type, metadata, created_at",
      )
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      })
      .limit(500);

  // ==========================================================
  // QUANTUM LAB ACTIVITY
  // ==========================================================

  const { data: labActivities } =
    await supabase
      .from("quantum_lab_activity")
      .select(
        "activity_type, created_at, qubits, shots",
      )
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      })
      .limit(500);

  // ==========================================================
  // DASHBOARD STATISTICS
  // ==========================================================

  const totalLessons = lessons?.length ?? 0;

  const completedLessons =
    progressRows?.filter(
      (item) => item.completed,
    ).length ?? 0;

  const completedLessonIds =
    progressRows
      ?.filter((item) => item.completed)
      .map((item) => item.lesson_id) ?? [];

  const courseProgress =
    totalLessons > 0
      ? Math.round(
          (completedLessons / totalLessons) * 100,
        )
      : 0;

  const coursesStarted =
    progressRows &&
    progressRows.length > 0
      ? 1
      : 0;

  // ==========================================================
  // CURRICULUM PROGRESS
  // ==========================================================

  let curriculumOverallProgress = 0;

  try {
    curriculumOverallProgress =
      await getOverallCurriculumProgress();
  } catch (error) {
    console.error(
      "Failed to load curriculum progress:",
      error,
    );
  }

  // ==========================================================
  // CURRICULUM NEXT RECOMMENDATION
  // ==========================================================

  const {
    data: latestRecommendation,
  } = await supabase
    .from("curriculum_recommendations")
    .select(
      `
        id,
        module_id,
        topic_id,
        recommendation_type,
        reason,
        priority,
        is_completed,
        created_at
      `,
    )
    .eq("user_id", user.id)
    .eq("recommendation_type", "next_topic")
    .eq("is_completed", false)
    .order("priority", {
      ascending: false,
    })
    .order("created_at", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  let recommendedTopic: {
    id: string;
    title: string;
    description: string | null;
    module_id: string;
  } | null = null;

  let recommendedModule: {
    id: string;
    title: string;
    slug: string;
  } | null = null;

  let recommendedModuleProgress = 0;

  if (latestRecommendation?.topic_id) {
    const { data: topic } = await supabase
      .from("curriculum_topics")
      .select(
        "id, title, description, module_id",
      )
      .eq(
        "id",
        latestRecommendation.topic_id,
      )
      .eq("is_published", true)
      .maybeSingle();

    recommendedTopic = topic;
  }

  if (latestRecommendation?.module_id) {
    const { data: module } = await supabase
      .from("curriculum_modules")
      .select("id, title, slug")
      .eq(
        "id",
        latestRecommendation.module_id,
      )
      .eq("is_published", true)
      .maybeSingle();

    recommendedModule = module;

    if (module) {
      try {
        const moduleProgress =
          await getCurriculumProgress(
            module.id,
          );

        recommendedModuleProgress =
          moduleProgress.moduleProgress;
      } catch (error) {
        console.error(
          "Failed to load recommended module progress:",
          error,
        );
      }
    }
  }

  // ==========================================================
  // REAL PROGRESS ANALYTICS
  // ==========================================================

  const progressAnalytics =
    calculateProgressAnalytics({
      lessons:
        (lessons ?? []).map((lesson) => {
          const progress =
            progressRows?.find(
              (row) =>
                row.lesson_id ===
                lesson.id,
            );

          return {
            id: lesson.id,
            progress:
              progress?.progress ?? 0,
            completed:
              progress?.completed ??
              false,
          };
        }),

      practiceResults:
        results.map((result) => ({
          score:
            result.score ?? 0,
          total_questions:
            result.total_questions ??
            0,
          percentage:
            result.percentage ?? 0,
        })),

      aiActivities:
        aiActivities ?? [],

      labActivities:
        labActivities ?? [],
    });

  // ==========================================================
  // FIND NEXT INCOMPLETE LESSON
  // ==========================================================

  const nextLesson =
    lessons?.find((lesson) => {
      const progress =
        progressRows?.find(
          (item) =>
            item.lesson_id ===
            lesson.id,
        );

      return !progress?.completed;
    }) ??
    lessons?.[lessons.length - 1];

  const nextLessonNumber =
    nextLesson?.order_index ?? 1;

  const allLessonsCompleted =
    totalLessons > 0 &&
    completedLessons === totalLessons;

  // ==========================================================
  // STREAK MESSAGE
  // ==========================================================

  let streakMessage =
    "Start learning today to build your streak.";

  if (currentStreak === 1) {
    streakMessage =
      "Come back tomorrow to keep your learning momentum going.";
  } else if (currentStreak > 1) {
    streakMessage =
      "Great consistency! Keep learning to extend your streak.";
  }

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <main className="min-h-screen bg-slate-50">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                <Sparkles size={14} />
                Learning Dashboard
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Welcome back 👋
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
                Continue your quantum computing journey and build something
                meaningful today.
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* =====================================================
            CURRICULUM PROGRESS
        ===================================================== */}

        <section className="mb-8 rounded-2xl border border-blue-200 bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Quantum Curriculum
              </p>

              <h2 className="mt-2 text-xl font-bold text-slate-950">
                Curriculum Progress
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Your progress across the structured quantum computing
                curriculum, including practice and topic mastery.
              </p>
            </div>

            <div className="shrink-0">
              <div className="text-right">
                <span className="text-3xl font-bold text-blue-600">
                  {curriculumOverallProgress}%
                </span>
              </div>

              <div className="mt-2 h-2 w-48 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-500"
                  style={{
                    width: `${curriculumOverallProgress}%`,
                  }}
                />
              </div>
            </div>

          </div>

        </section>

        {/* =====================================================
            NEXT RECOMMENDATION
        ===================================================== */}

        {recommendedTopic && (
          <section className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 shadow-sm">

            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

              <div className="flex gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <Target size={23} />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                    Recommended Next Topic
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-950">
                    {recommendedTopic.title}
                  </h2>

                  {recommendedModule && (
                    <p className="mt-1 text-xs font-medium text-emerald-700">
                      {recommendedModule.title}
                    </p>
                  )}

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    {latestRecommendation?.reason ??
                      recommendedTopic.description ??
                      "Continue with this topic to advance your quantum computing journey."}
                  </p>
                </div>

              </div>

              <Link
                href={`/practice?topicId=${encodeURIComponent(
                  recommendedTopic.id,
                )}&moduleId=${encodeURIComponent(
                  recommendedTopic.module_id,
                )}`}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                Practice Topic
                <ArrowRight size={16} />
              </Link>

            </div>

            {recommendedModule && (
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-600">
                    Module progress
                  </span>

                  <span className="font-semibold text-emerald-700">
                    {recommendedModuleProgress}%
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-emerald-100">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{
                      width: `${recommendedModuleProgress}%`,
                    }}
                  />
                </div>
              </div>
            )}

          </section>
        )}

        {/* =====================================================
            STATS
        ===================================================== */}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            icon={<Target size={20} />}
            label="Overall Progress"
            value={`${curriculumOverallProgress}%`}
            description="Keep learning"
          />

          <StatCard
            icon={<BookOpen size={20} />}
            label="Courses Started"
            value={String(coursesStarted)}
            description="Quantum Fundamentals"
          />

          <StatCard
            icon={<CheckCircle2 size={20} />}
            label="Lessons Completed"
            value={String(completedLessons)}
            description="Great start"
          />

          <StatCard
            icon={<Brain size={20} />}
            label="Best Practice Score"
            value={`${bestPracticeScore}%`}
            description={`${practiceAttempts} ${
              practiceAttempts === 1
                ? "attempt"
                : "attempts"
            }`}
          />

        </section>

        {/* =====================================================
            MAIN CONTENT
        ===================================================== */}

        <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">

            <div className="flex items-start justify-between gap-4">

              <div>

                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Continue Learning
                </p>

                <h2 className="mt-2 text-xl font-bold text-slate-950">
                  {nextLesson?.title ??
                    course?.title ??
                    "Quantum Computing Fundamentals"}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {allLessonsCompleted
                    ? "You have completed every lesson in this course. Great work!"
                    : nextLesson
                      ? `Continue with Lesson ${nextLessonNumber} of ${totalLessons}.`
                      : course?.description ??
                        "Build the mathematical and conceptual foundation you need before moving into quantum algorithms."}
                </p>

              </div>

              <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 sm:flex">
                <Atom size={22} />
              </div>

            </div>

            <div className="mt-6">

              <div className="mb-2 flex items-center justify-between text-sm">

                <span className="font-medium text-slate-700">
                  Course progress
                </span>

                <span className="font-semibold text-blue-600">
                  {courseProgress}%
                </span>

              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-500"
                  style={{
                    width: `${courseProgress}%`,
                  }}
                />

              </div>

            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">

              {nextLesson ? (
                <Link
                  href={`/learn/${nextLesson.slug}`}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  {allLessonsCompleted
                    ? "Review Last Lesson"
                    : "Continue Learning"}

                  <ArrowRight size={16} />
                </Link>
              ) : (
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  View Course
                  <ArrowRight size={16} />
                </Link>
              )}

              <Link
                href="#course-roadmap"
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                View Roadmap
              </Link>

            </div>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
              <Brain size={22} />
            </div>

            <p className="mt-6 text-sm font-medium text-slate-400">
              Learning Streak
            </p>

            <div className="mt-1 flex items-baseline gap-2">

              <span className="text-4xl font-bold">
                {currentStreak}
              </span>

              <span className="text-sm text-slate-400">
                {currentStreak === 1
                  ? "day"
                  : "days"}
              </span>

            </div>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              {streakMessage}
            </p>

            <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-3">

              <div className="flex items-center justify-between">

                <span className="text-xs font-medium text-slate-400">
                  Longest streak
                </span>

                <span className="text-sm font-bold text-white">
                  {longestStreak}{" "}
                  {longestStreak === 1
                    ? "day"
                    : "days"}
                </span>

              </div>

            </div>

            <div className="mt-5 flex items-center gap-2 text-sm font-medium text-cyan-400">
              <Sparkles size={16} />
              Keep going!
            </div>

          </div>

        </section>

        {/* =====================================================
            COURSE ROADMAP
        ===================================================== */}

        <div
          id="course-roadmap"
          className="mt-8"
        >
          <CourseRoadmap
            lessons={lessons ?? []}
            completedLessonIds={
              completedLessonIds
            }
          />
        </div>

        {/* =====================================================
            PRACTICE PERFORMANCE
        ===================================================== */}

        <section className="mt-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Practice Performance
                </p>

                <h2 className="mt-2 text-xl font-bold text-slate-950">
                  Your quiz progress
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Track how you are performing across your practice sessions.
                </p>
              </div>

              <Link
                href="/practice"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Practice Now
                <ArrowRight size={16} />
              </Link>

            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">
                  Attempts
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-950">
                  {practiceAttempts}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">
                  Best Score
                </p>

                <p className="mt-2 text-2xl font-bold text-blue-600">
                  {bestPracticeScore}%
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">
                  Average Score
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-950">
                  {averagePracticePercentage}%
                </p>
              </div>

            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-4">

                <span className="text-sm font-medium text-slate-600">
                  Questions answered
                </span>

                <span className="text-sm font-bold text-slate-950">
                  {practiceQuestionsAnswered}
                </span>

              </div>
            </div>

          </div>
        </section>

        {/* =====================================================
            REAL PROGRESS ANALYTICS
        ===================================================== */}

        <ProgressAnalytics
          analytics={progressAnalytics}
        />

        <PersonalizedLearningPath />

        {/* =====================================================
            QUICK ACCESS
        ===================================================== */}

        <section className="mt-8">

          <div className="mb-4">

            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Quick Access
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              Explore your learning tools
            </h2>

          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

            <QuickAccessCard
              icon={<FlaskConical size={22} />}
              title="Quantum Lab"
              description="Build and experiment with quantum circuits."
              href="/#quantum-lab"
            />

            <QuickAccessCard
              icon={<Brain size={22} />}
              title="AI Tutor"
              description="Get intelligent guidance while you learn."
              href="/#ai-tutor"
            />

            <QuickAccessCard
              icon={<Code2 size={22} />}
              title="Practice"
              description="Test your understanding with practical problems."
              href="/practice"
            />

          </div>

        </section>

      </div>

    </main>
  );
}

// ============================================================
// STAT CARD
// ============================================================

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
}

function StatCard({
  icon,
  label,
  value,
  description,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          {icon}
        </div>

        <span className="text-2xl font-bold text-slate-950">
          {value}
        </span>

      </div>

      <p className="mt-4 text-sm font-semibold text-slate-800">
        {label}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>

    </div>
  );
}

// ============================================================
// QUICK ACCESS CARD
// ============================================================

interface QuickAccessCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}

function QuickAccessCard({
  icon,
  title,
  description,
  href,
}: QuickAccessCardProps) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
    >

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600">
        {icon}
      </div>

      <h3 className="mt-4 text-base font-bold text-slate-950">
        {title}
      </h3>

      <p className="mt-1 text-sm leading-6 text-slate-600">
        {description}
      </p>

      <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600">
        Open

        <ArrowRight
          size={15}
          className="transition-transform group-hover:translate-x-0.5"
        />

      </div>

    </Link>
  );
}