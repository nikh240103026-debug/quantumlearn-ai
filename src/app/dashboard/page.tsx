import Link from "next/link";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase-server";

import { CourseRoadmap } from "@/components/dashboard/CourseRoadmap";
import PersonalizedLearningPath from "@/components/dashboard/PersonalizedLearningPath";
import { ProgressAnalytics } from "@/components/dashboard/ProgressAnalytics";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { DashboardReveal, DashboardStagger } from "@/components/dashboard/DashboardReveal";

import {
  getCurriculumProgress,
  getOverallCurriculumProgress,
} from "@/lib/curriculum/curriculum-recommendation-service";

import { calculateProgressAnalytics } from "@/lib/progress/progress-engine";

import type { RecentActivity as RecentActivityItem } from "@/types/dashboard";

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

  const userName =
    typeof user.user_metadata?.name === "string" &&
    user.user_metadata.name.trim()
      ? user.user_metadata.name.trim()
      : "Learner";

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
    .order("order_index", {
      ascending: true,
    });

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
    .order("completed_at", {
      ascending: false,
    });

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
  // CURRICULUM RECOMMENDATION
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
  // NEXT LESSON
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
      "Great consistency. Keep learning to extend your streak.";
  }

  // ==========================================================
  // RECENT ACTIVITY
  // ==========================================================

  const recentActivity: RecentActivityItem[] = [];

  for (
    const result of results.slice(0, 6)
  ) {
    recentActivity.push({
      id: `practice-${result.id}`,
      title: "Practice completed",
      description: `${result.percentage ?? 0}% score across ${
        result.total_questions ?? 0
      } questions.`,
      timestamp: formatActivityDate(
        result.completed_at,
      ),
      type: "practice",
    });
  }

  for (
    const activity of (
      labActivities ?? []
    ).slice(0, 6)
  ) {
    if (
      activity.activity_type ===
      "circuit_run"
    ) {
      recentActivity.push({
        id: `lab-${activity.created_at}-${activity.qubits}`,
        title: "Quantum Lab circuit run",
        description: `${activity.qubits ?? 0} qubits${
          activity.shots
            ? ` · ${activity.shots} shots`
            : ""
        }.`,
        timestamp: formatActivityDate(
          activity.created_at,
        ),
        type: "circuit",
      });
    }
  }

  for (
    const activity of (
      aiActivities ?? []
    ).slice(0, 6)
  ) {
    const title =
      activity.activity_type ===
      "coding_challenge_completed"
        ? "Coding challenge completed"
        : activity.activity_type ===
            "analysis_generated"
          ? "Learning analysis generated"
          : activity.activity_type ===
              "practice_completed"
            ? "Practice completed"
            : "AI learning activity";

    recentActivity.push({
      id: `ai-${activity.created_at}-${activity.activity_type}`,
      title,
      description:
        "Learning activity recorded in your QuantumLearn AI profile.",
      timestamp: formatActivityDate(
        activity.created_at,
      ),
      type:
        activity.activity_type ===
        "coding_challenge_completed"
          ? "practice"
          : "lesson",
    });
  }

  recentActivity.sort(
    (a, b) =>
      parseActivityDate(
        b.timestamp,
      ) -
      parseActivityDate(
        a.timestamp,
      ),
  );

  const finalRecentActivity =
    recentActivity.slice(0, 8);

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <main className="min-h-screen bg-[#f5f5f3] text-[#111318]">
      {/* =====================================================
          DASHBOARD HERO
      ===================================================== */}

      <section className="relative overflow-hidden border-b border-white/10 bg-[#090c11] text-white">
        <div className="absolute inset-0">
          <div className="absolute left-[10%] top-[15%] h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute bottom-[5%] right-[8%] h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />

          <div
            className="absolute inset-0 opacity-[0.055]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
              backgroundSize: "72px 72px",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-[1600px] px-6 py-20 sm:px-10 lg:px-16 lg:py-24">
          <DashboardReveal>
            <div className="grid gap-14 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <div className="mb-7 flex items-center gap-3">
                  <span className="h-px w-10 bg-blue-500" />

                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-400">
                    Learning dashboard
                  </p>
                </div>

                <h1 className="max-w-5xl text-5xl font-medium leading-[0.96] tracking-[-0.055em] sm:text-6xl lg:text-8xl">
                  Welcome back, {userName}.
                  <span className="block text-white/40">
                    Keep building your quantum understanding.
                  </span>
                </h1>

                <p className="mt-8 max-w-2xl text-base leading-7 text-white/55 sm:text-lg">
                  Your learning progress, practice performance,
                  experimentation, and personalized recommendations
                  are connected here in one place.
                </p>
              </div>

              <Link
                href="/"
                className="inline-flex h-fit border border-white/20 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/5"
              >
                Back to home
              </Link>
            </div>
          </DashboardReveal>
        </div>
      </section>

      <div className="mx-auto max-w-[1600px]">
        {/* =====================================================
            TOP METRICS
        ===================================================== */}

        <section className="border-b border-black/10">
          <DashboardStagger className="grid sm:grid-cols-2 lg:grid-cols-4">
            <DashboardMetric
              label="Overall progress"
              value={`${curriculumOverallProgress}%`}
              detail="Curriculum completion"
            />

            <DashboardMetric
              label="Lessons completed"
              value={String(
                completedLessons,
              )}
              detail={`of ${totalLessons} published lessons`}
            />

            <DashboardMetric
              label="Best practice score"
              value={`${bestPracticeScore}%`}
              detail={`${practiceAttempts} ${
                practiceAttempts === 1
                  ? "attempt"
                  : "attempts"
              } recorded`}
            />

            <DashboardMetric
              label="Learning streak"
              value={String(
                currentStreak,
              )}
              detail={`Longest: ${longestStreak} ${
                longestStreak === 1
                  ? "day"
                  : "days"
              }`}
            />
          </DashboardStagger>
        </section>

        {/* =====================================================
            CURRICULUM
        ===================================================== */}

        <section className="border-b border-black/10">
          <div className="grid lg:grid-cols-[0.35fr_1fr]">
            <div className="border-b border-black/10 p-6 sm:p-10 lg:border-b-0 lg:border-r lg:p-16">
              <DashboardReveal direction="left">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/40">
                  01 — Curriculum
                </p>

                <p className="mt-24 max-w-xs text-4xl font-medium leading-[1.02] tracking-[-0.04em]">
                  Build your foundation one concept at a time.
                </p>
              </DashboardReveal>
            </div>

            <div className="p-6 sm:p-10 lg:p-16">
              <DashboardReveal direction="right">
                <div className="grid gap-12 lg:grid-cols-[1fr_240px] lg:items-end">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-blue-600">
                      Quantum curriculum
                    </p>

                    <h2 className="mt-5 text-4xl font-medium leading-[1.02] tracking-[-0.045em] sm:text-5xl">
                      Curriculum progress
                    </h2>

                    <p className="mt-6 max-w-2xl text-base leading-7 text-black/55">
                      Your overall curriculum progress combines
                      structured learning, topic progression, and
                      recorded mastery.
                    </p>
                  </div>

                  <div>
                    <p className="text-6xl font-medium tracking-[-0.06em]">
                      {curriculumOverallProgress}
                      <span className="text-2xl text-black/35">
                        %
                      </span>
                    </p>

                    <div className="mt-5 h-1 w-full bg-black/10">
                      <div
                        className="h-full bg-blue-600 transition-all duration-1000 ease-out"
                        style={{
                          width: `${curriculumOverallProgress}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </DashboardReveal>
            </div>
          </div>
        </section>

        {/* =====================================================
            RECOMMENDED TOPIC
        ===================================================== */}

        {recommendedTopic && (
          <section className="border-b border-black/10 bg-white/35">
            <DashboardReveal>
              <div className="grid lg:grid-cols-[0.35fr_1fr]">
                <div className="border-b border-black/10 p-6 sm:p-10 lg:border-b-0 lg:border-r lg:p-16">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/40">
                    02 — Next focus
                  </p>
                </div>

                <div className="p-6 sm:p-10 lg:p-16">
                  <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-blue-600">
                        Recommended next topic
                      </p>

                      <h2 className="mt-5 max-w-4xl text-3xl font-medium leading-tight tracking-[-0.04em] sm:text-4xl">
                        {recommendedTopic.title}
                      </h2>

                      {recommendedModule && (
                        <p className="mt-4 text-sm uppercase tracking-[0.15em] text-black/40">
                          {recommendedModule.title}
                        </p>
                      )}

                      <p className="mt-6 max-w-3xl text-base leading-7 text-black/55">
                        {latestRecommendation?.reason ??
                          recommendedTopic.description ??
                          "Continue with this topic to advance your quantum computing journey."}
                      </p>
                    </div>

                    <Link
                      href={`/practice?topicId=${encodeURIComponent(
                        recommendedTopic.id,
                      )}&moduleId=${encodeURIComponent(
                        recommendedTopic.module_id,
                      )}`}
                      className="border border-black/20 px-6 py-3.5 text-sm font-semibold transition-colors hover:border-blue-600 hover:bg-blue-600 hover:text-white"
                    >
                      Practice this topic
                    </Link>
                  </div>

                  {recommendedModule && (
                    <div className="mt-12 max-w-3xl">
                      <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.15em]">
                        <span className="text-black/40">
                          Module progress
                        </span>

                        <span className="font-semibold text-blue-600">
                          {recommendedModuleProgress}%
                        </span>
                      </div>

                      <div className="h-1 bg-black/10">
                        <div
                          className="h-full bg-blue-600 transition-all duration-1000"
                          style={{
                            width: `${recommendedModuleProgress}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </DashboardReveal>
          </section>
        )}

        {/* =====================================================
            CONTINUE + STREAK
        ===================================================== */}

        <section className="border-b border-black/10">
          <div className="grid lg:grid-cols-2">
            <DashboardReveal>
              <div className="border-b border-black/10 p-6 sm:p-10 lg:border-b-0 lg:border-r lg:p-16">
                <p className="text-xs uppercase tracking-[0.18em] text-blue-600">
                  Continue learning
                </p>

                <h2 className="mt-5 max-w-2xl text-3xl font-medium leading-tight tracking-[-0.04em] sm:text-4xl">
                  {nextLesson?.title ??
                    course?.title ??
                    "Quantum Computing Fundamentals"}
                </h2>

                <p className="mt-5 max-w-2xl text-base leading-7 text-black/55">
                  {allLessonsCompleted
                    ? "You have completed every lesson in this course. Review the material or continue with practice."
                    : nextLesson
                      ? `Continue with Lesson ${nextLessonNumber} of ${totalLessons}.`
                      : course?.description ??
                        "Build the conceptual foundation required for quantum computing."
                  }
                </p>

                <div className="mt-10 max-w-xl">
                  <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.15em]">
                    <span className="text-black/40">
                      Course progress
                    </span>

                    <span className="font-semibold text-blue-600">
                      {courseProgress}%
                    </span>
                  </div>

                  <div className="h-1 bg-black/10">
                    <div
                      className="h-full bg-blue-600 transition-all duration-1000"
                      style={{
                        width: `${courseProgress}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="mt-10 flex flex-wrap gap-3">
                  {nextLesson ? (
                    <Link
                      href={`/learn/${nextLesson.slug}`}
                      className="bg-[#090c11] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
                    >
                      {allLessonsCompleted
                        ? "Review last lesson"
                        : "Continue learning"}
                    </Link>
                  ) : (
                    <Link
                      href="/"
                      className="bg-[#090c11] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
                    >
                      View course
                    </Link>
                  )}

                  <Link
                    href="#course-roadmap"
                    className="border border-black/20 px-6 py-3.5 text-sm font-semibold transition-colors hover:border-black/40"
                  >
                    View roadmap
                  </Link>
                </div>
              </div>
            </DashboardReveal>

            <DashboardReveal
              delay={120}
              direction="right"
            >
              <div className="bg-[#090c11] p-6 text-white sm:p-10 lg:min-h-full lg:p-16">
                <p className="text-xs uppercase tracking-[0.18em] text-blue-400">
                  Learning consistency
                </p>

                <div className="mt-10">
                  <p className="text-7xl font-medium tracking-[-0.06em]">
                    {currentStreak}
                  </p>

                  <p className="mt-2 text-sm uppercase tracking-[0.18em] text-white/35">
                    {currentStreak === 1
                      ? "day current streak"
                      : "days current streak"}
                  </p>
                </div>

                <p className="mt-8 max-w-xl text-base leading-7 text-white/50">
                  {streakMessage}
                </p>

                <div className="mt-12 grid grid-cols-2 border-t border-white/10">
                  <div className="border-r border-white/10 pt-6 pr-6">
                    <p className="text-xs uppercase tracking-[0.15em] text-white/30">
                      Longest streak
                    </p>

                    <p className="mt-3 text-3xl font-medium">
                      {longestStreak}
                    </p>
                  </div>

                  <div className="pt-6 pl-6">
                    <p className="text-xs uppercase tracking-[0.15em] text-white/30">
                      Active days
                    </p>

                    <p className="mt-3 text-3xl font-medium">
                      {progressAnalytics.recentActiveDays}
                    </p>
                  </div>
                </div>
              </div>
            </DashboardReveal>
          </div>
        </section>

        {/* =====================================================
            COURSE ROADMAP
        ===================================================== */}

        <div id="course-roadmap">
          <CourseRoadmap
            lessons={lessons ?? []}
            completedLessonIds={
              completedLessonIds
            }
          />
        </div>

        {/* =====================================================
            PRACTICE
        ===================================================== */}

        <section className="border-y border-black/10">
          <DashboardReveal>
            <div className="grid lg:grid-cols-[0.35fr_1fr]">
              <div className="border-b border-black/10 p-6 sm:p-10 lg:border-b-0 lg:border-r lg:p-16">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/40">
                  04 — Practice
                </p>
              </div>

              <div className="p-6 sm:p-10 lg:p-16">
                <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-blue-600">
                      Practice performance
                    </p>

                    <h2 className="mt-5 text-4xl font-medium leading-[1.02] tracking-[-0.045em]">
                      Measure understanding through practice.
                    </h2>

                    <p className="mt-5 max-w-2xl text-base leading-7 text-black/55">
                      Review your practice activity and identify how
                      consistently you are applying the concepts you
                      have learned.
                    </p>
                  </div>

                  <Link
                    href="/practice"
                    className="shrink-0 border border-black/20 px-6 py-3.5 text-sm font-semibold transition-colors hover:border-blue-600 hover:bg-blue-600 hover:text-white"
                  >
                    Practice now
                  </Link>
                </div>

                <DashboardStagger
                  className="mt-14 grid border-t border-black/10 sm:grid-cols-3"
                  stagger={100}
                >
                  <PracticeMetric
                    label="Attempts"
                    value={practiceAttempts}
                  />

                  <PracticeMetric
                    label="Best score"
                    value={`${bestPracticeScore}%`}
                    accent
                  />

                  <PracticeMetric
                    label="Average score"
                    value={`${averagePracticePercentage}%`}
                  />
                </DashboardStagger>

                <div className="mt-8 flex items-center justify-between border-y border-black/10 py-5">
                  <span className="text-sm text-black/50">
                    Questions answered
                  </span>

                  <span className="text-xl font-medium">
                    {practiceQuestionsAnswered}
                  </span>
                </div>
              </div>
            </div>
          </DashboardReveal>
        </section>

        {/* =====================================================
            ANALYTICS
        ===================================================== */}

        <ProgressAnalytics
          analytics={progressAnalytics}
          practiceHistory={results
            .slice(0, 8)
            .reverse()
            .map((result, index) => ({
              label: `T${index + 1}`,
              value: Math.round(
                result.percentage ?? 0,
              ),
            }))}
        />

        {/* =====================================================
            PERSONALIZED AI
        ===================================================== */}

        <PersonalizedLearningPath />

        {/* =====================================================
            RECENT ACTIVITY
        ===================================================== */}

        <RecentActivity
          activities={
            finalRecentActivity
          }
        />

        {/* =====================================================
            QUICK ACCESS
        ===================================================== */}

        <section className="border-t border-black/10">
          <DashboardReveal>
            <div className="grid lg:grid-cols-[0.35fr_1fr]">
              <div className="border-b border-black/10 p-6 sm:p-10 lg:border-b-0 lg:border-r lg:p-16">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/40">
                  07 — Learning tools
                </p>
              </div>

              <div className="p-6 sm:p-10 lg:p-16">
                <p className="text-xs uppercase tracking-[0.18em] text-blue-600">
                  Quick access
                </p>

                <h2 className="mt-5 text-4xl font-medium leading-[1.02] tracking-[-0.045em]">
                  Move directly into the work.
                </h2>

                <DashboardStagger
                  className="mt-14 grid border-t border-black/10 md:grid-cols-3"
                  stagger={100}
                >
                  <ToolLink
                    number="01"
                    title="Quantum Lab"
                    description="Build and experiment with quantum circuits."
                    href="/quantum-lab"
                  />

                  <ToolLink
                    number="02"
                    title="AI Tutor"
                    description="Get contextual guidance while learning."
                    href="/ai-tutor"
                  />

                  <ToolLink
                    number="03"
                    title="Practice"
                    description="Test and strengthen your understanding."
                    href="/practice"
                  />
                </DashboardStagger>
              </div>
            </div>
          </DashboardReveal>
        </section>
      </div>
    </main>
  );
}

// ============================================================
// DASHBOARD METRIC
// ============================================================

function DashboardMetric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="border-b border-black/10 p-6 sm:p-8 lg:border-b-0 lg:border-r lg:p-10 last:border-r-0">
      <p className="text-xs uppercase tracking-[0.16em] text-black/35">
        {label}
      </p>

      <p className="mt-7 text-4xl font-medium tracking-[-0.05em] sm:text-5xl">
        {value}
      </p>

      <p className="mt-3 text-sm text-black/45">
        {detail}
      </p>
    </div>
  );
}

// ============================================================
// PRACTICE METRIC
// ============================================================

function PracticeMetric({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className="border-b border-black/10 py-8 sm:border-b-0 sm:border-r sm:px-8 sm:first:pl-0 sm:last:border-r-0">
      <p className="text-xs uppercase tracking-[0.16em] text-black/35">
        {label}
      </p>

      <p
        className={`mt-5 text-4xl font-medium tracking-[-0.05em] ${
          accent
            ? "text-blue-600"
            : "text-[#111318]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

// ============================================================
// TOOL LINK
// ============================================================

function ToolLink({
  number,
  title,
  description,
  href,
}: {
  number: string;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group border-b border-black/10 py-8 sm:px-8 md:border-b-0 md:border-r md:first:pl-0 md:last:border-r-0"
    >
      <span className="text-xs text-black/25">
        {number}
      </span>

      <h3 className="mt-8 text-xl font-medium tracking-tight transition-colors group-hover:text-blue-600">
        {title}
      </h3>

      <p className="mt-3 max-w-xs text-sm leading-6 text-black/50">
        {description}
      </p>

      <span className="mt-7 block text-xs font-semibold uppercase tracking-[0.16em] text-black/40 transition-colors group-hover:text-blue-600">
        Open
      </span>
    </Link>
  );
}

// ============================================================
// DATE HELPERS
// ============================================================

function formatActivityDate(
  value: string | null,
) {
  if (!value) {
    return "Recently";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return date.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );
}

function parseActivityDate(
  value: string,
) {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? 0
    : date.getTime();
}