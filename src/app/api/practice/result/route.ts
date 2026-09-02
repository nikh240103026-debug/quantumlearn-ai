import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

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
          error: "You must be logged in to save your practice result.",
        },
        { status: 401 },
      );
    }

    // ==========================================================
    // READ REQUEST
    // ==========================================================

    const body = await request.json();

    const {
      lessonSlug,
      chapterNumber,
      difficulty,
      score,
      totalQuestions,
      percentage,
      answers,
      questionIds,
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
      typeof score !== "number" ||
      typeof totalQuestions !== "number" ||
      typeof percentage !== "number"
    ) {
      return NextResponse.json(
        {
          error: "Invalid practice result.",
        },
        { status: 400 },
      );
    }

    if (totalQuestions <= 0) {
      return NextResponse.json(
        {
          error: "Total questions must be greater than zero.",
        },
        { status: 400 },
      );
    }

    if (score < 0 || score > totalQuestions) {
      return NextResponse.json(
        {
          error: "Invalid score.",
        },
        { status: 400 },
      );
    }

    if (percentage < 0 || percentage > 100) {
      return NextResponse.json(
        {
          error: "Invalid percentage.",
        },
        { status: 400 },
      );
    }

    // ==========================================================
    // SAVE PRACTICE RESULT
    // ==========================================================

    const now = new Date().toISOString();

    const { data: result, error: insertError } = await supabase
      .from("practice_results")
      .insert({
        user_id: user.id,
        lesson_slug: lessonSlug,
        score,
        total_questions: totalQuestions,
        percentage,
        answers: answers ?? {},
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
          error: "Unable to save your practice result.",
        },
        { status: 500 },
      );
    }

    // ==========================================================
    // LOG AI ACTIVITY
    // ==========================================================
    //
    // This is intentionally separate from the practice result.
    // If AI activity logging fails, the already-saved practice
    // result must still be returned successfully.
    //
    // ==========================================================

    const { error: activityError } = await supabase
      .from("ai_activity")
      .insert({
        user_id: user.id,
        activity_type: "practice_completed",
        source_page: "/practice",
        topic: lessonSlug,
        description: `Completed ${difficulty ?? "practice"} practice for ${lessonSlug} with a score of ${score}/${totalQuestions} (${percentage}%).`,
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
          question_count: Array.isArray(questionIds)
            ? questionIds.length
            : null,
        },
        created_at: now,
      });

    if (activityError) {
      console.error(
        "AI activity logging error:",
        activityError,
      );
    }

    // ==========================================================
    // RETURN RESULT
    // ==========================================================

    return NextResponse.json({
      success: true,
      message: "Practice result saved successfully.",
      result,
    });
  } catch (error) {
    console.error("Practice result API error:", error);

    return NextResponse.json(
      {
        error:
          "Something went wrong while saving your practice result.",
      },
      { status: 500 },
    );
  }
}