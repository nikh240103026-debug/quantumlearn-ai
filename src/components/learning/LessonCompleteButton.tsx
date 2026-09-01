"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

interface LessonCompleteButtonProps {
  lessonId: string;
  courseId: string;
  completed: boolean;
}

export function LessonCompleteButton({
  lessonId,
  courseId,
  completed: initialCompleted,
}: LessonCompleteButtonProps) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleComplete() {
    if (completed || loading) {
      return;
    }

    setLoading(true);
    setError("");

    const supabase = createSupabaseBrowserClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in to complete this lesson.");
      setLoading(false);
      return;
    }

    const { error: progressError } = await supabase
      .from("user_progress")
      .upsert(
        {
          user_id: user.id,
          course_id: courseId,
          lesson_id: lessonId,
          progress: 100,
          completed: true,
          last_accessed_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,lesson_id",
        },
      );

      if (progressError) {
        setError(progressError.message);
        setLoading(false);
        return;
      }

    const today = new Date().toISOString().split("T")[0];

const { data: existingStreak } = await supabase
  .from("learning_streaks")
  .select("current_streak, longest_streak, last_activity_date")
  .eq("user_id", user.id)
  .maybeSingle();

let currentStreak = 1;
let longestStreak = 1;

if (existingStreak) {
  const lastActivity = existingStreak.last_activity_date;

  if (lastActivity === today) {
    currentStreak = existingStreak.current_streak;
    longestStreak = existingStreak.longest_streak;
  } else {
    const lastDate = new Date(`${lastActivity}T00:00:00`);
    const todayDate = new Date(`${today}T00:00:00`);

    const differenceInDays = Math.floor(
      (todayDate.getTime() - lastDate.getTime()) /
        (1000 * 60 * 60 * 24),
    );

    if (differenceInDays === 1) {
      currentStreak = existingStreak.current_streak + 1;
    }

    longestStreak = Math.max(
      existingStreak.longest_streak,
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
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id",
    },
  );

if (streakError) {
  setError(streakError.message);
  setLoading(false);
  return;
}
    setCompleted(true);
    setLoading(false);
  }

  if (completed) {
    return (
      <div className="inline-flex items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
        <CheckCircle2 size={17} />
        Lesson Completed
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleComplete}
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 size={17} className="animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <CheckCircle2 size={17} />
            Mark as Complete
          </>
        )}
      </button>

      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}