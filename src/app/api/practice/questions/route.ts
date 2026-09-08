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

    const topicId =
      searchParams.get("topicId");

    const moduleId =
      searchParams.get("moduleId");

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
    // RESOLVE CURRICULUM TOPICS
    // ----------------------------------------------------------

    let curriculumTopicIds: string[] =
      [];

    if (moduleId) {
      const {
        data: moduleTopics,
        error: moduleError,
      } = await supabase
        .from("curriculum_topics")
        .select("id")
        .eq("module_id", moduleId)
        .eq("is_published", true)
        .order("order_index", {
          ascending: true,
        });

      if (moduleError) {
        console.error(
          "Failed to fetch curriculum module topics:",
          moduleError,
        );

        return NextResponse.json(
          {
            error:
              "Failed to fetch curriculum module topics.",
            details:
              moduleError.message,
          },
          { status: 500 },
        );
      }

      curriculumTopicIds =
        (moduleTopics ?? []).map(
          (topic) => topic.id,
        );
    }

    if (topicId) {
      curriculumTopicIds = [
        topicId,
      ];
    }

    // ----------------------------------------------------------
    // RESOLVE CURRICULUM QUESTION IDS
    // ----------------------------------------------------------

    let curriculumQuestionIds:
      | string[]
      | undefined;

    if (
      curriculumTopicIds.length >
      0
    ) {
      const {
        data: mappings,
        error: mappingError,
      } = await supabase
        .from(
          "curriculum_question_topics",
        )
        .select(
          "question_id, relevance_score",
        )
        .in(
          "topic_id",
          curriculumTopicIds,
        )
        .order(
          "relevance_score",
          {
            ascending: false,
          },
        );

      if (mappingError) {
        console.error(
          "Failed to fetch curriculum question mappings:",
          mappingError,
        );

        return NextResponse.json(
          {
            error:
              "Failed to fetch curriculum question mappings.",
            details:
              mappingError.message,
          },
          { status: 500 },
        );
      }

      curriculumQuestionIds = [
        ...new Set(
          (mappings ?? []).map(
            (mapping) =>
              mapping.question_id,
          ),
        ),
      ];

      // A valid curriculum topic/module with no
      // mapped questions should return an empty set,
      // not all practice questions.
      if (
        curriculumQuestionIds
          .length === 0
      ) {
        return NextResponse.json({
          questions: [],
          count: 0,
        });
      }
    }

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

    if (
      curriculumQuestionIds
        !== undefined
    ) {
      query = query.in(
        "id",
        curriculumQuestionIds,
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