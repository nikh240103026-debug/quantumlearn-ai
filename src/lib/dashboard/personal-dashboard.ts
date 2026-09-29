import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  DashboardAchievement,
  DashboardLabProject,
  DashboardNotification,
  DashboardSavedContent,
  PersonalDashboardData,
} from "@/types/personal-dashboard";

export async function getPersonalDashboardData(
  supabase: SupabaseClient,
  userId: string,
): Promise<PersonalDashboardData> {
  const [
    continueLearning,
    achievements,
    savedContent,
    notifications,
    labProjects,
    recentActivity,
  ] = await Promise.all([
    getContinueLearning(supabase, userId),
    getAchievements(supabase, userId),
    getSavedContent(supabase, userId),
    getNotifications(supabase, userId),
    getLabProjects(supabase, userId),
    getRecentActivity(supabase, userId),
  ]);

  return {
    continueLearning,
    achievements,
    savedContent,
    notifications,
    labProjects,
    recentActivity,
  };
}

async function getContinueLearning(
  supabase: SupabaseClient,
  userId: string,
) {
  const { data: course } = await supabase
    .from("courses")
    .select("id, title")
    .eq("slug", "quantum-computing-fundamentals")
    .eq("is_published", true)
    .maybeSingle();

  if (!course) {
    return null;
  }

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, title, slug, order_index")
    .eq("course_id", course.id)
    .eq("is_published", true)
    .order("order_index", { ascending: true });

  if (!lessons?.length) {
    return null;
  }

  const { data: progressRows } = await supabase
    .from("user_progress")
    .select("lesson_id, progress, completed, updated_at")
    .eq("user_id", userId)
    .eq("course_id", course.id)
    .order("updated_at", { ascending: false });

  const completedLessons =
    progressRows?.filter((row) => row.completed).length ?? 0;

  const activeProgress = (progressRows ?? []).find(
    (row) => !row.completed && Number(row.progress ?? 0) > 0,
  );

  const nextUncompleted = lessons.find((lesson) => {
    const progress = progressRows?.find(
      (row) => row.lesson_id === lesson.id,
    );

    return !progress?.completed;
  });

  const currentLesson =
    activeProgress
      ? lessons.find((lesson) => lesson.id === activeProgress.lesson_id)
      : nextUncompleted;

  if (!currentLesson) {
    return null;
  }

  const currentProgress =
    progressRows?.find(
      (row) => row.lesson_id === currentLesson.id,
    )?.progress ?? 0;

  const lastActivityAt =
    progressRows?.[0]?.updated_at ?? null;

  return {
    courseId: course.id,
    courseTitle: course.title,
    lessonId: currentLesson.id,
    lessonTitle: currentLesson.title,
    lessonSlug: currentLesson.slug,
    progress: Math.min(100, Math.max(0, Number(currentProgress))),
    completedLessons,
    totalLessons: lessons.length,
    lastActivityAt,
  };
}

async function getAchievements(
  supabase: SupabaseClient,
  userId: string,
): Promise<DashboardAchievement[]> {
  const [
    { data: progress },
    { data: practice },
    { data: streak },
    { data: lab },
    { data: ai },
  ] = await Promise.all([
    supabase
      .from("user_progress")
      .select("id, completed")
      .eq("user_id", userId),

    supabase
      .from("practice_results")
      .select("id, percentage")
      .eq("user_id", userId),

    supabase
      .from("learning_streaks")
      .select("current_streak, longest_streak")
      .eq("user_id", userId)
      .maybeSingle(),

    supabase
      .from("quantum_lab_activity")
      .select("id")
      .eq("user_id", userId),

    supabase
      .from("ai_activity")
      .select("id")
      .eq("user_id", userId),
  ]);

  const completedLessons =
    progress?.filter((item) => item.completed).length ?? 0;

  const practiceAttempts = practice?.length ?? 0;

  const perfectPractice =
    practice?.some(
      (item) => Number(item.percentage ?? 0) >= 100,
    ) ?? false;

  const labRuns = lab?.length ?? 0;
  const aiActivities = ai?.length ?? 0;
  const currentStreak = Number(streak?.current_streak ?? 0);

  return [
    {
      id: "first-lesson",
      title: "First Step",
      description: "Complete your first lesson.",
      icon: "book-open",
      earned: completedLessons >= 1,
      earnedAt: null,
      progress: Math.min(completedLessons, 1),
      target: 1,
    },
    {
      id: "five-lessons",
      title: "Quantum Explorer",
      description: "Complete five lessons.",
      icon: "compass",
      earned: completedLessons >= 5,
      earnedAt: null,
      progress: Math.min(completedLessons, 5),
      target: 5,
    },
    {
      id: "practice-starter",
      title: "Practice Starter",
      description: "Complete five practice attempts.",
      icon: "target",
      earned: practiceAttempts >= 5,
      earnedAt: null,
      progress: Math.min(practiceAttempts, 5),
      target: 5,
    },
    {
      id: "perfect-score",
      title: "Perfect Score",
      description: "Achieve a 100% practice score.",
      icon: "award",
      earned: perfectPractice,
      earnedAt: null,
      progress: perfectPractice ? 1 : 0,
      target: 1,
    },
    {
      id: "lab-explorer",
      title: "Lab Explorer",
      description: "Run ten quantum circuits.",
      icon: "flask-conical",
      earned: labRuns >= 10,
      earnedAt: null,
      progress: Math.min(labRuns, 10),
      target: 10,
    },
    {
      id: "ai-learner",
      title: "AI Learner",
      description: "Complete ten AI learning activities.",
      icon: "sparkles",
      earned: aiActivities >= 10,
      earnedAt: null,
      progress: Math.min(aiActivities, 10),
      target: 10,
    },
    {
      id: "seven-day-streak",
      title: "Consistent Learner",
      description: "Build a seven-day learning streak.",
      icon: "flame",
      earned: currentStreak >= 7,
      earnedAt: null,
      progress: Math.min(currentStreak, 7),
      target: 7,
    },
  ];
}

async function getSavedContent(
  supabase: SupabaseClient,
  userId: string,
): Promise<DashboardSavedContent[]> {
  const { data } = await supabase
    .from("resource_saves")
    .select(
      `
        id,
        created_at,
        resource_id,
        resources (
          id,
          title,
          description
        )
      `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(6);

  return (data ?? []).flatMap((item) => {
    const resource = Array.isArray(item.resources)
      ? item.resources[0]
      : item.resources;

    if (!resource) {
      return [];
    }

    return [
      {
        id: item.id,
        title: resource.title,
        description: resource.description ?? null,
        href: `/resources?resource=${encodeURIComponent(resource.id)}`,
        type: "resource" as const,
        savedAt: item.created_at,
      },
    ];
  });
}

async function getNotifications(
  supabase: SupabaseClient,
  userId: string,
): Promise<DashboardNotification[]> {
  const { data, error } = await supabase
    .from("dashboard_notifications")
    .select(
      "id, title, message, type, is_read, created_at, href",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(8);

  if (error) {
    return [];
  }

  return (data ?? []).map((item) => ({
    id: item.id,
    title: item.title,
    message: item.message,
    type: item.type,
    read: item.is_read,
    createdAt: item.created_at,
    href: item.href,
  }));
}

async function getLabProjects(
  supabase: SupabaseClient,
  userId: string,
): Promise<DashboardLabProject[]> {
  const { data, error } = await supabase
    .from("quantum_lab_projects")
    .select("id, name, description, qubits, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(6);

  if (error) {
    return [];
  }

  return (data ?? []).map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    qubits: item.qubits,
    updatedAt: item.updated_at,
    href: `/quantum-lab?project=${encodeURIComponent(item.id)}`,
  }));
}

async function getRecentActivity(
  supabase: SupabaseClient,
  userId: string,
) {
  const activities: PersonalDashboardData["recentActivity"] = [];

  const [
    { data: practice },
    { data: lab },
    { data: ai },
    { data: progress },
  ] = await Promise.all([
    supabase
      .from("practice_results")
      .select("id, percentage, total_questions, completed_at")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false })
      .limit(8),

    supabase
      .from("quantum_lab_activity")
      .select("id, activity_type, created_at, qubits, shots")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(8),

    supabase
      .from("ai_activity")
      .select("id, activity_type, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(8),

    supabase
      .from("user_progress")
      .select(
        "id, lesson_id, progress, completed, updated_at, lessons(title, slug)",
      )
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(8),
  ]);

  for (const item of progress ?? []) {
    const lesson = Array.isArray(item.lessons)
      ? item.lessons[0]
      : item.lessons;

    if (!lesson) continue;

    activities.push({
      id: `lesson-${item.id}`,
      title: item.completed
        ? "Lesson completed"
        : "Lesson progress updated",
      description: `${lesson.title} · ${Math.round(
        Number(item.progress ?? 0),
      )}% complete.`,
      timestamp: item.updated_at,
      type: "lesson",
      href: `/learn/${lesson.slug}`,
    });
  }

  for (const item of practice ?? []) {
    activities.push({
      id: `practice-${item.id}`,
      title: "Practice completed",
      description: `${Math.round(
        Number(item.percentage ?? 0),
      )}% across ${item.total_questions ?? 0} questions.`,
      timestamp: item.completed_at,
      type: "practice",
      href: "/practice",
    });
  }

  for (const item of lab ?? []) {
    activities.push({
      id: `lab-${item.id}`,
      title: "Quantum Lab activity",
      description: `${item.qubits ?? 0} qubits${
        item.shots ? ` · ${item.shots} shots` : ""
      }.`,
      timestamp: item.created_at,
      type: "lab",
      href: "/quantum-lab",
    });
  }

  for (const item of ai ?? []) {
    activities.push({
      id: `ai-${item.id}`,
      title: "AI Tutor activity",
      description: "You used an AI-powered learning feature.",
      timestamp: item.created_at,
      type: "ai",
      href: "/ai-tutor",
    });
  }

  return activities
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() -
        new Date(a.timestamp).getTime(),
    )
    .slice(0, 10);
}