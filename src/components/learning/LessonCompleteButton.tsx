"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Loader2,
} from "lucide-react";
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
  const [completed, setCompleted] =
    useState(initialCompleted);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleComplete() {
    if (completed || loading) {
      return;
    }

    setLoading(true);
    setError("");

    const supabase =
      createSupabaseBrowserClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError(
        "You must be logged in to complete this lesson.",
      );

      setLoading(false);
      return;
    }

    const now =
      new Date().toISOString();

    const {
      error: progressError,
    } = await supabase
      .from("user_progress")
      .upsert(
        {
          user_id: user.id,
          course_id: courseId,
          lesson_id: lessonId,
          progress: 100,
          completed: true,
          last_accessed_at: now,
          completed_at: now,
        },
        {
          onConflict:
            "user_id,lesson_id",
        },
      );

    if (progressError) {
      setError(
        progressError.message,
      );

      setLoading(false);
      return;
    }

    const today =
      new Date()
        .toISOString()
        .split("T")[0];

    const {
      data: existingStreak,
    } = await supabase
      .from("learning_streaks")
      .select(
        "current_streak, longest_streak, last_activity_date",
      )
      .eq("user_id", user.id)
      .maybeSingle();

    let currentStreak = 1;
    let longestStreak = 1;

    if (existingStreak) {
      const lastActivity =
        existingStreak.last_activity_date;

      if (lastActivity === today) {
        currentStreak =
          existingStreak.current_streak;

        longestStreak =
          existingStreak.longest_streak;
      } else {
        const lastDate =
          new Date(
            `${lastActivity}T00:00:00`,
          );

        const todayDate =
          new Date(
            `${today}T00:00:00`,
          );

        const differenceInDays =
          Math.floor(
            (todayDate.getTime() -
              lastDate.getTime()) /
              (1000 * 60 * 60 * 24),
          );

        if (differenceInDays === 1) {
          currentStreak =
            existingStreak.current_streak +
            1;
        }

        longestStreak =
          Math.max(
            existingStreak.longest_streak,
            currentStreak,
          );
      }
    }

    const {
      error: streakError,
    } = await supabase
      .from("learning_streaks")
      .upsert(
        {
          user_id: user.id,
          current_streak: currentStreak,
          longest_streak: longestStreak,
          last_activity_date: today,
          updated_at: now,
        },
        {
          onConflict: "user_id",
        },
      );

    if (streakError) {
      setError(
        streakError.message,
      );

      setLoading(false);
      return;
    }

    setCompleted(true);
    setLoading(false);
  }

  if (completed) {
    return (
      <div className="inline-flex items-center gap-2 py-2 text-sm font-semibold text-blue-600">
        <CheckCircle2 size={17} />

        <span>Lesson Completed</span>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleComplete}
        disabled={loading}
        className="
          group
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
        {loading ? (
          <>
            <Loader2
              size={17}
              className="animate-spin"
            />

            <span>Saving...</span>
          </>
        ) : (
          <>
            <CheckCircle2 size={17} />

            <span>Mark as Complete</span>
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
            group-hover:w-full
          "
        />
      </button>

      {error && (
        <p className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}