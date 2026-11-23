import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getAssessmentById } from "@/lib/assessment/assessmentService";
import { gradeAssessment } from "@/lib/assessment/gradingService";
import { recordAssessmentAttempt } from "@/lib/certificates/certificate-service";

interface RouteParams {
  params: Promise<{
    assessmentId: string;
  }>;
}

/*
 * POST /api/assessment/[assessmentId]/submit
 *
 * Grades an assessment on the server. The answer key never reaches the
 * browser, and the pass mark comes from the assessment definition.
 */
export async function POST(
  request: Request,
  { params }: RouteParams,
) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        message: "You must be logged in to submit an assessment.",
      },
      { status: 401 },
    );
  }

  const { assessmentId } = await params;

  const assessment = getAssessmentById(assessmentId);

  if (!assessment) {
    return NextResponse.json(
      { success: false, message: "Assessment not found." },
      { status: 404 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request body." },
      { status: 400 },
    );
  }

  const rawAnswers = (body as { answers?: unknown } | null)?.answers;

  if (
    typeof rawAnswers !== "object" ||
    rawAnswers === null ||
    Array.isArray(rawAnswers)
  ) {
    return NextResponse.json(
      { success: false, message: "Invalid answers." },
      { status: 400 },
    );
  }

  // Keep only string option ids; anything else counts as skipped.
  const answers: Record<string, string> = {};

  for (const [questionId, optionId] of Object.entries(rawAnswers)) {
    if (typeof optionId === "string" && optionId.length <= 20) {
      answers[questionId] = optionId;
    }
  }

  const result = gradeAssessment(
    assessmentId,
    answers,
    assessment.passingMarks,
  );

  // Recorded server-side: certificates are issued only from these rows.
  const rawDuration = (body as { durationSeconds?: unknown }).durationSeconds;
  const durationSeconds =
    typeof rawDuration === "number" &&
    Number.isFinite(rawDuration) &&
    rawDuration >= 0 &&
    rawDuration < 24 * 60 * 60
      ? Math.round(rawDuration)
      : null;

  const attemptId = await recordAssessmentAttempt(
    user.id,
    assessmentId,
    result,
    durationSeconds,
  );

  return NextResponse.json({
    success: true,
    data: { ...result, attemptId },
  });
}
