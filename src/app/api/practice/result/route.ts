import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { updateCurriculumTopicProgress } from "@/lib/curriculum/curriculum-progress-service";
import {
  completeSession,
  practiceSessionsAvailable,
} from "@/lib/practice-sessions";
import { notify } from "@/lib/notifications/notify";
import {
  createNextTopicRecommendation,
  getCurriculumProgress,
  getOverallCurriculumProgress,
} from "@/lib/curriculum/curriculum-recommendation-service";

// Upper bound on questions in one practice result.
const MAX_QUESTIONS = 100;

export async function POST(request: Request) {
  try {
    // ==========================================================
    // AUTHENTICATE USER
    // ==========================================================

    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error:
            "You must be logged in to save your practice result.",
        },
        { status: 401 },
      );
    }

    // ==========================================================
    // READ REQUEST
    // ==========================================================

    const body = await request.json();

    // NOTE: any client-sent `score`, `totalQuestions` or `percentage`
    // is deliberately ignored. The result is graded below from the
    // submitted answers and the stored correct answers.
    const {
      lessonSlug,
      chapterNumber,
      difficulty,
      answers,
      questionIds,
      curriculumTopicId,
      curriculumModuleId,
      sessionId,
    } = body;

    // ==========================================================
    // VALIDATE DATA
    // ==========================================================

    if (!lessonSlug || typeof lessonSlug !== "string") {
      return NextResponse.json(
        {
          error: "Lesson slug is required.",
        },
        { status: 400 },
      );
    }

    if (
      !Array.isArray(questionIds) ||
      questionIds.length === 0 ||
      questionIds.length > MAX_QUESTIONS ||
      !questionIds.every(
        (id: unknown) =>
          (typeof id === "string" && id.trim() !== "") ||
          (typeof id === "number" && Number.isFinite(id)),
      )
    ) {
      return NextResponse.json(
        {
          error: "Invalid practice result.",
        },
        { status: 400 },
      );
    }

    const orderedIds = questionIds.map(
      (id: string | number) => String(id),
    );

    if (new Set(orderedIds).size !== orderedIds.length) {
      return NextResponse.json(
        {
          error: "Duplicate questions in practice result.",
        },
        { status: 400 },
      );
    }

    if (
      answers !== undefined &&
      (typeof answers !== "object" ||
        answers === null ||
        Array.isArray(answers))
    ) {
      return NextResponse.json(
        {
          error: "Invalid answers.",
        },
        { status: 400 },
      );
    }

    // ==========================================================
    // PRACTICE SESSION
    // ==========================================================
    //
    // With the practice-sessions migration applied, a result must
    // complete the learner's open session: the question set must
    // match it, the first answer checked for each question wins,
    // and a session can be completed only once (no duplicates).

    let firstAnswers: Map<string, number> | null = null;

    if (typeof sessionId === "string" && sessionId) {
      const completion = await completeSession(
        supabase,
        user.id,
        sessionId,
      );

      if (completion.status === "completed") {
        return NextResponse.json(
          { error: "This practice result was already saved." },
          { status: 409 },
        );
      }

      if (completion.status !== "ok") {
        return NextResponse.json(
          { error: "Practice session not found. Please restart the quiz." },
          { status: completion.status === "error" ? 500 : 400 },
        );
      }

      // Same set of questions (the quiz shuffles, so order may differ).
      // A subset is rejected: it would let a learner drop the
      // questions they got wrong.
      const sessionIds = new Set(completion.questionIds);

      if (
        sessionIds.size !== orderedIds.length ||
        orderedIds.some((id: string) => !sessionIds.has(id))
      ) {
        return NextResponse.json(
          { error: "These questions don't match your practice session." },
          { status: 400 },
        );
      }

      firstAnswers = completion.firstAnswers;
    } else if (await practiceSessionsAvailable(supabase)) {
      return NextResponse.json(
        { error: "Practice session required. Please restart the quiz." },
        { status: 400 },
      );
    }

    // ==========================================================
    // GRADE ON THE SERVER
    // ==========================================================
    //
    // `answers` maps the question's position in `questionIds`
    // to the chosen option index (this is what PracticeQuiz sends).

    const { data: storedQuestions, error: questionsError } =
      await supabase
        .from("practice_questions")
        .select("id, correct_answer")
        .in("id", orderedIds);

    if (questionsError) {
      console.error(
        "Practice grading question lookup error:",
        questionsError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to grade your practice result.",
        },
        { status: 500 },
      );
    }

    const correctById = new Map<string, number>(
      (storedQuestions ?? []).map((question) => [
        String(question.id),
        Number(question.correct_answer),
      ]),
    );

    if (correctById.size !== orderedIds.length) {
      return NextResponse.json(
        {
          error:
            "Some questions in this result no longer exist.",
        },
        { status: 400 },
      );
    }

    const submittedAnswers =
      (answers ?? {}) as Record<string, unknown>;

    const gradedAnswers: Record<string, number> = {};

    let score = 0;

    orderedIds.forEach((id: string, index: number) => {
      // The first answer recorded at check time wins over whatever the
      // client submits now.
      const answer =
        firstAnswers?.get(id) ??
        submittedAnswers[String(index)];

      if (
        typeof answer !== "number" ||
        !Number.isInteger(answer)
      ) {
        return;
      }

      gradedAnswers[String(index)] = answer;

      if (answer === correctById.get(id)) {
        score += 1;
      }
    });

    const totalQuestions = orderedIds.length;

    const percentage = Math.round(
      (score / totalQuestions) * 100,
    );

    // ==========================================================
    // SAVE PRACTICE RESULT
    // ==========================================================

    const now = new Date().toISOString();

    const { data: result, error: insertError } =
      await supabase
        .from("practice_results")
        .insert({
          user_id: user.id,
          lesson_slug: lessonSlug,
          score,
          total_questions: totalQuestions,
          percentage,
          answers: gradedAnswers,
          completed_at: now,
          created_at: now,
        })
        .select(
          "id, lesson_slug, score, total_questions, percentage, completed_at",
        )
        .single();

    if (insertError) {
      console.error(
        "Practice result insert error:",
        insertError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to save your practice result.",
        },
        { status: 500 },
      );
    }

    // ==========================================================
    // CURRICULUM PROGRESS
    // ==========================================================

    let curriculumProgress = null;
    let recommendation = null;
    let moduleProgress = null;
    let overallProgress = null;

    if (
      typeof curriculumTopicId === "string" &&
      curriculumTopicId.trim()
    ) {
      try {
        curriculumProgress =
          await updateCurriculumTopicProgress({
            topicId: curriculumTopicId,
            score,
            totalQuestions,
            percentage,
          });

        // ======================================================
        // MODULE PROGRESS
        // ======================================================

        if (
          typeof curriculumModuleId === "string" &&
          curriculumModuleId.trim()
        ) {
          moduleProgress =
            await getCurriculumProgress(
              curriculumModuleId,
            );
        }

        // ======================================================
        // NEXT TOPIC RECOMMENDATION
        // ======================================================

        if (
          typeof curriculumModuleId === "string" &&
          curriculumModuleId.trim()
        ) {
          recommendation =
            await createNextTopicRecommendation({
              topicId: curriculumTopicId,
              moduleId: curriculumModuleId,
            });
        }

        // ======================================================
        // OVERALL CURRICULUM PROGRESS
        // ======================================================

        overallProgress =
          await getOverallCurriculumProgress();
      } catch (progressError) {
        console.error(
          "Curriculum progress/recommendation error:",
          progressError,
        );

        // Curriculum progress must never invalidate
        // an already-saved practice result.
      }
    }

    // ==========================================================
    // LOG AI ACTIVITY
    // ==========================================================

    const { error: activityError } =
      await supabase
        .from("ai_activity")
        .insert({
          user_id: user.id,
          activity_type: "practice_completed",
          source_page: "/practice",
          topic: lessonSlug,
          description: `Completed ${
            difficulty ?? "practice"
          } practice for ${lessonSlug} with a score of ${score}/${totalQuestions} (${percentage}%).`,
          metadata: {
            practice_result_id: result.id,
            lesson_slug: lessonSlug,

            chapter_number:
              typeof chapterNumber === "number" ||
              typeof chapterNumber === "string"
                ? chapterNumber
                : null,

            difficulty:
              typeof difficulty === "string"
                ? difficulty
                : null,

            score,
            total_questions: totalQuestions,
            percentage,

            question_count:
              Array.isArray(questionIds)
                ? questionIds.length
                : null,

            curriculum_topic_id:
              typeof curriculumTopicId === "string"
                ? curriculumTopicId
                : null,

            curriculum_module_id:
              typeof curriculumModuleId === "string"
                ? curriculumModuleId
                : null,

            curriculum_progress:
              curriculumProgress,

            module_progress:
              moduleProgress,

            overall_progress:
              overallProgress,

            recommendation:
              recommendation,
          },

          created_at: now,
        });

    if (activityError) {
      console.error(
        "AI activity logging error:",
        activityError,
      );
    }

    // Settings > Notifications > "Practice results".
    await notify({
      userId: user.id,
      type: "practice_result",
      title: "Practice result saved",
      message: `You scored ${score}/${totalQuestions} (${percentage}%).`,
      href: "/practice",
    });

    // ==========================================================
    // RETURN RESULT
    // ==========================================================

    return NextResponse.json({
      success: true,
      message:
        "Practice result saved successfully.",

      result,

      curriculumProgress,

      moduleProgress,

      overallProgress,

      recommendation,
    });
  } catch (error) {
    console.error(
      "Practice result API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while saving your practice result.",
      },
      { status: 500 },
    );
  }
}