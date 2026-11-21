"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Loader2,
} from "lucide-react";

// Dispatched by LessonExperience when the lesson content is opened.
export const LESSON_OPENED_EVENT = "quantumlearn:lesson-opened";

interface LessonCompleteButtonProps {
  lessonId: string;
  // Kept for existing callers; the server derives the course.
  courseId?: string;
  completed: boolean;
}

export function LessonCompleteButton({
  lessonId,
  completed: initialCompleted,
}: LessonCompleteButtonProps) {
  const [completed, setCompleted] =
    useState(initialCompleted);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // The button unlocks once the lesson content has been opened
  // (LessonExperience dispatches LESSON_OPENED_EVENT). Before, a lesson
  // could be marked complete straight from page load, unread.
  const [lessonOpened, setLessonOpened] =
    useState(false);

  useEffect(() => {
    function handleOpened(event: Event) {
      const detail = (event as CustomEvent<{ lessonId?: string }>).detail;

      if (!detail?.lessonId || detail.lessonId === lessonId) {
        setLessonOpened(true);
      }
    }

    window.addEventListener(LESSON_OPENED_EVENT, handleOpened);

    return () =>
      window.removeEventListener(LESSON_OPENED_EVENT, handleOpened);
  }, [lessonId]);

  async function handleComplete() {
    if (completed || loading || !lessonOpened) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Server route: checks the lesson is published, takes course_id
      // from the lesson, and computes the streak in local time.
      const response = await fetch("/api/progress/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error ?? "Unable to complete this lesson.");
        return;
      }

      setCompleted(true);
    } catch {
      setError("Unable to complete this lesson. Check your connection.");
    } finally {
      setLoading(false);
    }
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
        disabled={loading || !lessonOpened}
        title={
          lessonOpened
            ? undefined
            : "Open and read the lesson first"
        }
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

      {!lessonOpened && (
        <p className="mt-2 text-xs text-slate-500">
          Open the lesson above to mark it complete.
        </p>
      )}

      {error && (
        <p className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}