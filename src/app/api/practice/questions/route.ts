import { NextRequest, NextResponse } from "next/server";

import { getCurriculumQuestions } from "@/lib/curriculum/curriculum-question-service";
import { createPracticeSession } from "@/lib/practice-sessions";
import { createSupabaseServerClient } from "@/lib/supabase-server";

// Never send answers to the browser before the learner answers;
// the quiz fetches them per question from /api/practice/check.
function withoutAnswer<
  T extends {
    correctAnswer?: unknown;
    explanation?: unknown;
  },
>(question: T) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { correctAnswer, explanation, ...rest } = question;
  return rest;
}

// Start a practice session (pins this question set and enables
// first-answer grading). Null for guests or before the migration.
async function startSessionFor(
  questions: Array<{ id: unknown }>,
): Promise<string | null> {
  const supabase =
    await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return createPracticeSession(
    supabase,
    user.id,
    questions.map((question) =>
      String(question.id),
    ),
  );
}

const VALID_DIFFICULTIES = [
  "easy",
  "medium",
  "difficult",
] as const;

type Difficulty =
  (typeof VALID_DIFFICULTIES)[number];

function parsePositiveInteger(
  value: string | null,
): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isInteger(parsed) &&
    parsed > 0
    ? parsed
    : undefined;
}

export async function GET(
  request: NextRequest,
) {
  try {
    const searchParams =
      request.nextUrl.searchParams;

    const topicId =
      searchParams.get("topicId")?.trim() ||
      undefined;

    const moduleId =
      searchParams.get("moduleId")?.trim() ||
      undefined;

    const chapterNumberParam =
      searchParams.get("chapterNumber");

    const difficultyParam =
      searchParams.get("difficulty");

    const limitParam =
      searchParams.get("limit");

    // ----------------------------------------------------------
    // VALIDATE CHAPTER
    // ----------------------------------------------------------

    let chapterNumber:
      | number
      | undefined;

    if (chapterNumberParam) {
      chapterNumber =
        parsePositiveInteger(
          chapterNumberParam,
        );

      if (
        chapterNumber === undefined ||
        chapterNumber < 1 ||
        chapterNumber > 10
      ) {
        return NextResponse.json(
          {
            error:
              "chapterNumber must be an integer between 1 and 10.",
          },
          { status: 400 },
        );
      }
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

    let limit = 10;

    if (limitParam) {
      const parsedLimit =
        Number(limitParam);

      if (
        !Number.isInteger(
          parsedLimit,
        ) ||
        parsedLimit < 1 ||
        parsedLimit > 100
      ) {
        return NextResponse.json(
          {
            error:
              "limit must be an integer between 1 and 100.",
          },
          { status: 400 },
        );
      }

      limit = parsedLimit;
    }

    // ----------------------------------------------------------
    // CURRICULUM MODE
    // ----------------------------------------------------------

    const curriculumMode =
      Boolean(topicId || moduleId);

    if (curriculumMode) {
      const questions =
        await getCurriculumQuestions({
          topicId,
          moduleId,
          chapterNumber,
          difficulty,
          limit,
        });

      return NextResponse.json({
        questions: questions.map(
          withoutAnswer,
        ),
        count: questions.length,
        source: "curriculum",
        sessionId:
          await startSessionFor(
            questions,
          ),
      });
    }

    // ----------------------------------------------------------
    // LEGACY MODE
    //
    // No topicId/moduleId means the existing practice
    // question behavior is preserved.
    // ----------------------------------------------------------

    const supabase =
      await import("@/lib/supabase-server").then(
        ({ createSupabaseServerClient }) =>
          createSupabaseServerClient(),
      );

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
          created_at,
          updated_at
        `,
      )
      .order("chapter_number", {
        ascending: true,
      })
      .order("id", {
        ascending: true,
      });

    if (chapterNumber !== undefined) {
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

    query = query.limit(limit);

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
          details: error.message,
        },
        { status: 500 },
      );
    }

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
          topic: question.topic,
          difficulty:
            question.difficulty,
          question:
            question.question,
          options:
            question.options,
          // correct_answer and explanation are revealed per question
          // by POST /api/practice/check after the learner answers.
          createdAt:
            question.created_at,
          updatedAt:
            question.updated_at,
        }),
      );

    return NextResponse.json({
      questions,
      count: questions.length,
      source: "legacy",
      sessionId:
        await startSessionFor(
          questions,
        ),
    });
  } catch (error) {
    console.error(
      "Practice questions API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected error while loading practice questions.",
      },
      { status: 500 },
    );
  }
}