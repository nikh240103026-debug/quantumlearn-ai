import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { isMissingTableError } from "@/lib/supabase-errors";

/*
 * Practice sessions (see supabase/migrations/..._practice_integrity...).
 *
 * A session pins the question set when the quiz loads. The FIRST answer
 * checked for each question is recorded, and the result is graded from
 * those, so peeking at an answer through the check endpoint and then
 * answering differently doesn't raise the score. A session completes
 * once, which also makes result saving idempotent.
 *
 * Until the migration is applied every helper reports "unavailable" and
 * callers keep the previous behaviour.
 */

type SupabaseServerClient = Awaited<
  ReturnType<typeof createSupabaseServerClient>
>;

export async function createPracticeSession(
  supabase: SupabaseServerClient,
  userId: string,
  questionIds: string[],
): Promise<string | null> {
  if (questionIds.length === 0) {
    return null;
  }

  const { data, error } = await supabase
    .from("practice_sessions")
    .insert({
      user_id: userId,
      question_ids: questionIds,
    })
    .select("id")
    .single();

  if (error) {
    if (!isMissingTableError(error)) {
      console.error("Practice session create error:", error);
    }

    return null;
  }

  return data?.id ? String(data.id) : null;
}

// True once the migration is applied.
export async function practiceSessionsAvailable(
  supabase: SupabaseServerClient,
): Promise<boolean> {
  const { error } = await supabase
    .from("practice_sessions")
    .select("id")
    .limit(1);

  return !error || !isMissingTableError(error);
}

type OpenSession =
  | { status: "open"; questionIds: string[] }
  | { status: "not_found" | "completed" | "error" };

export async function getOpenSession(
  supabase: SupabaseServerClient,
  userId: string,
  sessionId: string,
): Promise<OpenSession> {
  const { data, error } = await supabase
    .from("practice_sessions")
    .select("question_ids, completed_at")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Practice session lookup error:", error);
    return { status: "error" };
  }

  if (!data) {
    return { status: "not_found" };
  }

  if (data.completed_at) {
    return { status: "completed" };
  }

  return {
    status: "open",
    questionIds: (data.question_ids ?? []).map(String),
  };
}

// Records the answer only if none exists yet for this question.
export async function recordFirstAnswer(
  supabase: SupabaseServerClient,
  sessionId: string,
  questionId: string,
  answer: number,
): Promise<boolean> {
  const { error } = await supabase
    .from("practice_session_answers")
    .upsert(
      {
        session_id: sessionId,
        question_id: questionId,
        answer,
      },
      {
        onConflict: "session_id,question_id",
        ignoreDuplicates: true,
      },
    );

  if (error) {
    console.error("Practice answer record error:", error);
    return false;
  }

  return true;
}

/*
 * Atomically marks the session completed. Returns its question ids and
 * the first recorded answers, or a status if it can't be completed
 * (already completed = a duplicate submission).
 */
export async function completeSession(
  supabase: SupabaseServerClient,
  userId: string,
  sessionId: string,
): Promise<
  | {
      status: "ok";
      questionIds: string[];
      firstAnswers: Map<string, number>;
    }
  | { status: "not_found" | "completed" | "error" }
> {
  const { data, error } = await supabase
    .from("practice_sessions")
    .update({ completed_at: new Date().toISOString() })
    .eq("id", sessionId)
    .eq("user_id", userId)
    .is("completed_at", null)
    .select("question_ids")
    .maybeSingle();

  if (error) {
    console.error("Practice session complete error:", error);
    return { status: "error" };
  }

  if (!data) {
    const existing = await getOpenSession(supabase, userId, sessionId);
    return {
      status:
        existing.status === "completed" ? "completed" : "not_found",
    };
  }

  const { data: answers, error: answersError } = await supabase
    .from("practice_session_answers")
    .select("question_id, answer")
    .eq("session_id", sessionId);

  if (answersError) {
    console.error("Practice session answers error:", answersError);
    return { status: "error" };
  }

  return {
    status: "ok",
    questionIds: (data.question_ids ?? []).map(String),
    firstAnswers: new Map(
      (answers ?? []).map((row) => [
        String(row.question_id),
        Number(row.answer),
      ]),
    ),
  };
}
