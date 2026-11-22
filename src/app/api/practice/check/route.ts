import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  getOpenSession,
  practiceSessionsAvailable,
  recordFirstAnswer,
} from "@/lib/practice-sessions";

/*
 * POST /api/practice/check
 *
 * Reveals the correct option and explanation for ONE question after
 * the learner has committed an answer. The questions endpoint no longer
 * sends correct answers to the browser, so this is the only way the
 * quiz learns them. Final scores are graded separately on the server
 * (see /api/practice/result).
 */
export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "You must be logged in to check answers." },
      { status: 401 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const { questionId, answer, sessionId } = (body ?? {}) as {
    questionId?: unknown;
    answer?: unknown;
    sessionId?: unknown;
  };

  if (
    !(
      (typeof questionId === "string" && questionId.trim() !== "") ||
      (typeof questionId === "number" && Number.isFinite(questionId))
    ) ||
    typeof answer !== "number" ||
    !Number.isInteger(answer) ||
    answer < 0
  ) {
    return NextResponse.json(
      { error: "Invalid answer." },
      { status: 400 },
    );
  }

  /*
   * Session check: the answer is only revealed for a question in the
   * learner's open session, and the FIRST answer is recorded for
   * grading. Skipped before the practice-sessions migration.
   */
  if (typeof sessionId === "string" && sessionId) {
    const session = await getOpenSession(
      supabase,
      user.id,
      sessionId,
    );

    if (session.status !== "open") {
      return NextResponse.json(
        {
          error:
            session.status === "completed"
              ? "This practice session is already finished."
              : "Practice session not found. Please restart the quiz.",
        },
        { status: session.status === "error" ? 500 : 409 },
      );
    }

    if (!session.questionIds.includes(String(questionId))) {
      return NextResponse.json(
        { error: "That question isn't part of this practice session." },
        { status: 400 },
      );
    }

    await recordFirstAnswer(
      supabase,
      sessionId,
      String(questionId),
      answer,
    );
  } else if (await practiceSessionsAvailable(supabase)) {
    return NextResponse.json(
      { error: "Practice session required. Please restart the quiz." },
      { status: 400 },
    );
  }

  // The answer key is not readable with the public/user keys (see
  // migration 20261122000200); only the server-side admin client can
  // read it, and only after the checks above.
  const { data: question, error } = await createSupabaseAdminClient()
    .from("practice_questions")
    .select("id, correct_answer, explanation")
    .eq("id", questionId)
    .maybeSingle();

  if (error) {
    console.error("Practice answer check error:", error);

    return NextResponse.json(
      { error: "Unable to check your answer." },
      { status: 500 },
    );
  }

  if (!question) {
    return NextResponse.json(
      { error: "Question not found." },
      { status: 404 },
    );
  }

  const correctAnswer = Number(question.correct_answer);

  return NextResponse.json({
    correct: answer === correctAnswer,
    correctAnswer,
    explanation: String(question.explanation ?? ""),
  });
}
