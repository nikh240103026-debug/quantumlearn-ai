import { NextRequest, NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase-server";

const VALID_DIFFICULTIES = [
  "easy",
  "medium",
  "difficult",
] as const;

type Difficulty =
  (typeof VALID_DIFFICULTIES)[number];

export async function GET(
  request: NextRequest,
) {
  try {
    const supabase =
      await createSupabaseServerClient();

    const searchParams =
      request.nextUrl.searchParams;

    const chapterNumberParam =
      searchParams.get(
        "chapterNumber",
      );

    const difficultyParam =
      searchParams.get("difficulty");

    const limitParam =
      searchParams.get("limit");

    const chapterNumber =
      chapterNumberParam
        ? Number(chapterNumberParam)
        : undefined;

    const limit =
      limitParam
        ? Number(limitParam)
        : 10;

    // ----------------------------------------------------------
    // VALIDATE CHAPTER
    // ----------------------------------------------------------

    if (
      chapterNumber !==
        undefined &&
      (!Number.isInteger(
        chapterNumber,
      ) ||
        chapterNumber < 1 ||
        chapterNumber > 10)
    ) {
      return NextResponse.json(
        {
          error:
            "chapterNumber must be an integer between 1 and 10.",
        },
        { status: 400 },
      );
    }

    // ----------------------------------------------------------
    // VALIDATE DIFFICULTY
    // ----------------------------------------------------------

    let difficulty:
      | Difficulty
      | undefined;

    if (difficultyParam) {
      if (
        !VALID_DIFFICULTIES.includes(
          difficultyParam as Difficulty,
        )
      ) {
        return NextResponse.json(
          {
            error:
              "difficulty must be easy, medium, or difficult.",
          },
          { status: 400 },
        );
      }

      difficulty =
        difficultyParam as Difficulty;
    }

    // ----------------------------------------------------------
    // VALIDATE LIMIT
    // ----------------------------------------------------------

    const safeLimit =
      Number.isInteger(limit) &&
      limit >= 1 &&
      limit <= 20
        ? limit
        : 10;

    // ----------------------------------------------------------
    // BUILD QUERY
    // ----------------------------------------------------------

    let query = supabase
      .from("practice_questions")
      .select(
        `
          id,
          chapter_number,
          chapter_slug,
          chapter_title,
          topic,
          difficulty,
          question,
          options,
          correct_answer,
          explanation,
          created_at,
          updated_at
        `,
      )
      .order(
        "chapter_number",
        {
          ascending: true,
        },
      );

    if (
      chapterNumber !==
      undefined
    ) {
      query = query.eq(
        "chapter_number",
        chapterNumber,
      );
    }

    if (difficulty) {
      query = query.eq(
        "difficulty",
        difficulty,
      );
    }

    query = query.limit(
      safeLimit,
    );

    // ----------------------------------------------------------
    // EXECUTE
    // ----------------------------------------------------------

    const {
      data,
      error,
    } = await query;

    if (error) {
      console.error(
        "Failed to fetch practice questions:",
        error,
      );

      return NextResponse.json(
        {
          error:
            "Failed to fetch practice questions from the database.",
          details:
            error.message,
        },
        { status: 500 },
      );
    }

    // ----------------------------------------------------------
    // FORMAT RESPONSE
    // ----------------------------------------------------------

    const questions =
      (data ?? []).map(
        (question) => ({
          id: question.id,

          chapterNumber:
            question.chapter_number,

          chapterSlug:
            question.chapter_slug,

          chapterTitle:
            question.chapter_title,

          topic:
            question.topic,

          difficulty:
            question.difficulty,

          question:
            question.question,

          options:
            question.options,

          correctAnswer:
            question.correct_answer,

          explanation:
            question.explanation,

          createdAt:
            question.created_at,

          updatedAt:
            question.updated_at,
        }),
      );

    return NextResponse.json({
      questions,
      count:
        questions.length,
    });
  } catch (error) {
    console.error(
      "Practice questions API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unexpected error while loading practice questions.",
      },
      { status: 500 },
    );
  }
}