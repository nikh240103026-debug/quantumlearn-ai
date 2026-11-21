import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { notify } from "@/lib/notifications/notify";
import {
  isValidTimeZone,
  localDateKey,
  TIMEZONE_COOKIE,
} from "@/lib/local-date";

/*
 * POST /api/progress/complete  { lessonId }
 *
 * Marks a lesson complete and updates the learning streak.
 *
 * This used to run in the browser, which let anyone write completed rows
 * for any lesson id (including unpublished ones, inflating progress), and
 * computed the streak "day" in UTC, so late-night study counted on the
 * wrong day. Now:
 *   - the lesson must exist and be published;
 *   - course_id comes from the lesson, not the client;
 *   - streak days use the learner's own timezone.
 */
// Streak lengths that earn an achievement notification.
const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100];

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "You must be logged in to complete this lesson." },
      { status: 401 },
    );
  }

  let lessonId: unknown;

  try {
    ({ lessonId } = (await request.json()) as { lessonId?: unknown });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  if (typeof lessonId !== "string" || !lessonId.trim()) {
    return NextResponse.json(
      { error: "Lesson id is required." },
      { status: 400 },
    );
  }

  const { data: lesson, error: lessonError } = await supabase
    .from("lessons")
    .select("id, course_id, is_published")
    .eq("id", lessonId)
    .maybeSingle();

  if (lessonError) {
    console.error("[PROGRESS_COMPLETE] lesson lookup:", lessonError);
    return NextResponse.json(
      { error: "Unable to complete this lesson." },
      { status: 500 },
    );
  }

  if (!lesson || !lesson.is_published) {
    return NextResponse.json(
      { error: "Lesson not found." },
      { status: 404 },
    );
  }

  const now = new Date();
  const nowIso = now.toISOString();

  // Needed to send the course-completion notification only once.
  const { data: previousProgress } = await supabase
    .from("user_progress")
    .select("completed")
    .eq("user_id", user.id)
    .eq("lesson_id", lesson.id)
    .maybeSingle();

  const wasCompletedBefore = previousProgress?.completed === true;

  const { error: progressError } = await supabase
    .from("user_progress")
    .upsert(
      {
        user_id: user.id,
        course_id: lesson.course_id,
        lesson_id: lesson.id,
        progress: 100,
        completed: true,
        last_accessed_at: nowIso,
        completed_at: nowIso,
      },
      { onConflict: "user_id,lesson_id" },
    );

  if (progressError) {
    console.error("[PROGRESS_COMPLETE] progress:", progressError);
    return NextResponse.json(
      { error: "Unable to save your progress." },
      { status: 500 },
    );
  }

  // ------------------------------------------------------------------
  // STREAK (learner's local calendar day)
  // ------------------------------------------------------------------

  const cookieTimeZone = decodeURIComponent(
    (await cookies()).get(TIMEZONE_COOKIE)?.value ?? "",
  );
  const timeZone = isValidTimeZone(cookieTimeZone)
    ? cookieTimeZone
    : "UTC";

  const today = localDateKey(nowIso, timeZone) ?? nowIso.slice(0, 10);

  const { data: existing } = await supabase
    .from("learning_streaks")
    .select("current_streak, longest_streak, last_activity_date")
    .eq("user_id", user.id)
    .maybeSingle();

  let currentStreak = 1;
  let longestStreak = 1;

  if (existing) {
    const last = String(existing.last_activity_date ?? "");

    if (last === today) {
      currentStreak = existing.current_streak ?? 1;
      longestStreak = existing.longest_streak ?? currentStreak;
    } else {
      // Both are plain YYYY-MM-DD dates: compare as UTC midnights so
      // the day difference is exact regardless of server timezone.
      const dayMs = 24 * 60 * 60 * 1000;
      const diffDays = Math.round(
        (Date.parse(`${today}T00:00:00Z`) -
          Date.parse(`${last}T00:00:00Z`)) /
          dayMs,
      );

      currentStreak =
        diffDays === 1 ? (existing.current_streak ?? 0) + 1 : 1;
      longestStreak = Math.max(
        existing.longest_streak ?? 0,
        currentStreak,
      );
    }
  }

  const { error: streakError } = await supabase
    .from("learning_streaks")
    .upsert(
      {
        user_id: user.id,
        current_streak: currentStreak,
        longest_streak: longestStreak,
        last_activity_date: today,
        updated_at: nowIso,
      },
      { onConflict: "user_id" },
    );

  if (streakError) {
    // The lesson is completed; a streak failure shouldn't undo that.
    console.error("[PROGRESS_COMPLETE] streak:", streakError);
  }

  // ------------------------------------------------------------------
  // NOTIFICATIONS (respect Settings > Notifications)
  // ------------------------------------------------------------------

  // Streak milestones, once per milestone day.
  const isNewDay = existing?.last_activity_date !== today;

  if (
    !streakError &&
    isNewDay &&
    STREAK_MILESTONES.includes(currentStreak)
  ) {
    await notify({
      userId: user.id,
      type: "achievement",
      title: `${currentStreak}-day learning streak!`,
      message: `You've learned ${currentStreak} days in a row. Keep it going!`,
      href: "/dashboard",
    });
  }

  // Course completion: every published lesson of this course is done.
  const [{ data: courseLessons }, { data: doneRows }] =
    await Promise.all([
      supabase
        .from("lessons")
        .select("id")
        .eq("course_id", lesson.course_id)
        .eq("is_published", true),
      supabase
        .from("user_progress")
        .select("lesson_id")
        .eq("user_id", user.id)
        .eq("course_id", lesson.course_id)
        .eq("completed", true),
    ]);

  const done = new Set(
    (doneRows ?? []).map((row) => String(row.lesson_id)),
  );

  const courseComplete =
    (courseLessons ?? []).length > 0 &&
    (courseLessons ?? []).every((row) => done.has(String(row.id)));

  // Only when THIS lesson was the last one (not on re-completion).
  const wasAlreadyComplete = wasCompletedBefore;

  if (courseComplete && !wasAlreadyComplete) {
    await notify({
      userId: user.id,
      type: "course_completion",
      title: "Course completed 🎉",
      message: "You've completed every lesson in this course.",
      href: "/dashboard",
    });
  }

  return NextResponse.json({
    completed: true,
    currentStreak,
    longestStreak,
  });
}
