import { createSupabaseServerClient } from "@/lib/supabase-server";

export type CurriculumProgressResult = {
  topicId: string;
  progressPercent: number;
  questionsAnswered: number;
  questionsCorrect: number;
  masteryScore: number;
  lastActivityAt: string;
};

type UpdateTopicProgressInput = {
  topicId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Updates curriculum progress after a practice attempt.
 *
 * Existing progress is accumulated rather than overwritten.
 * This means every practice attempt contributes to the learner's
 * topic history.
 */
export async function updateCurriculumTopicProgress(
  input: UpdateTopicProgressInput,
): Promise<CurriculumProgressResult | null> {
  const {
    topicId,
    score,
    totalQuestions,
    percentage,
  } = input;

  if (!topicId) {
    return null;
  }

  if (
    !Number.isFinite(score) ||
    !Number.isFinite(totalQuestions) ||
    !Number.isFinite(percentage) ||
    totalQuestions <= 0
  ) {
    return null;
  }

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const now = new Date().toISOString();

  const safeScore = Math.max(
    0,
    Math.min(Math.round(score), Math.round(totalQuestions)),
  );

  const safeTotalQuestions = Math.max(
    1,
    Math.round(totalQuestions),
  );

  const safePercentage = clamp(
    percentage,
    0,
    100,
  );

  // ------------------------------------------------------------
  // VERIFY TOPIC
  // ------------------------------------------------------------

  const { data: topic, error: topicError } =
    await supabase
      .from("curriculum_topics")
      .select("id")
      .eq("id", topicId)
      .maybeSingle();

  if (topicError) {
    console.error(
      "Curriculum topic lookup error:",
      topicError,
    );

    return null;
  }

  if (!topic) {
    console.warn(
      `Curriculum topic not found: ${topicId}`,
    );

    return null;
  }

  // ------------------------------------------------------------
  // LOAD EXISTING PROGRESS
  // ------------------------------------------------------------

  const { data: existingProgress, error: progressError } =
    await supabase
      .from("curriculum_topic_progress")
      .select(
        `
          id,
          progress_percent,
          lessons_completed,
          exercises_completed,
          questions_answered,
          questions_correct,
          mastery_score
        `,
      )
      .eq("user_id", user.id)
      .eq("topic_id", topicId)
      .maybeSingle();

  if (progressError) {
    console.error(
      "Curriculum topic progress lookup error:",
      progressError,
    );

    return null;
  }

  // ------------------------------------------------------------
  // CALCULATE ACCUMULATED QUESTION PROGRESS
  // ------------------------------------------------------------

  const previousAnswered =
    existingProgress?.questions_answered ?? 0;

  const previousCorrect =
    existingProgress?.questions_correct ?? 0;

  const previousMastery =
    Number(existingProgress?.mastery_score ?? 0);

  const questionsAnswered =
    previousAnswered + safeTotalQuestions;

  const questionsCorrect =
    previousCorrect + safeScore;

  /*
   * Mastery is based on the learner's accumulated
   * question accuracy for this curriculum topic.
   *
   * The latest attempt is also blended into the
   * existing mastery score so progress changes
   * smoothly across repeated attempts.
   */
  const accumulatedAccuracy =
    questionsAnswered > 0
      ? (questionsCorrect / questionsAnswered) * 100
      : safePercentage;

  const masteryScore =
    existingProgress
      ? clamp(
          previousMastery === 0
            ? accumulatedAccuracy
            : (previousMastery * 0.4) +
                (safePercentage * 0.6),
          0,
          100,
        )
      : clamp(
          accumulatedAccuracy,
          0,
          100,
        );

  /*
   * Practice contributes to topic progress.
   *
   * 80%+ mastery = completed topic assessment level.
   * Otherwise progress reflects mastery directly.
   */
  const progressPercent = Math.round(
    clamp(masteryScore, 0, 100),
  );

  // ------------------------------------------------------------
  // SAVE / UPDATE
  // ------------------------------------------------------------

  const progressPayload = {
    user_id: user.id,
    topic_id: topicId,
    progress_percent: progressPercent,
    lessons_completed:
      existingProgress?.lessons_completed ?? 0,
    exercises_completed:
      existingProgress?.exercises_completed ?? 0,
    questions_answered: questionsAnswered,
    questions_correct: questionsCorrect,
    mastery_score: Number(masteryScore.toFixed(2)),
    last_activity_at: now,
    updated_at: now,
  };

  let savedProgress;

  if (existingProgress?.id) {
    const { data, error } = await supabase
      .from("curriculum_topic_progress")
      .update(progressPayload)
      .eq("id", existingProgress.id)
      .eq("user_id", user.id)
      .select(
        `
          topic_id,
          progress_percent,
          questions_answered,
          questions_correct,
          mastery_score,
          last_activity_at
        `,
      )
      .single();

    if (error) {
      console.error(
        "Curriculum topic progress update error:",
        error,
      );

      return null;
    }

    savedProgress = data;
  } else {
    const { data, error } = await supabase
      .from("curriculum_topic_progress")
      .insert(progressPayload)
      .select(
        `
          topic_id,
          progress_percent,
          questions_answered,
          questions_correct,
          mastery_score,
          last_activity_at
        `,
      )
      .single();

    if (error) {
      console.error(
        "Curriculum topic progress insert error:",
        error,
      );

      return null;
    }

    savedProgress = data;
  }

  return {
    topicId: savedProgress.topic_id,
    progressPercent:
      savedProgress.progress_percent,
    questionsAnswered:
      savedProgress.questions_answered,
    questionsCorrect:
      savedProgress.questions_correct,
    masteryScore:
      Number(savedProgress.mastery_score),
    lastActivityAt:
      savedProgress.last_activity_at ?? now,
  };
}