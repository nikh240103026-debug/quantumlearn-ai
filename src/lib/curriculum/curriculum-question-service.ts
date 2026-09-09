import { createSupabaseServerClient } from "@/lib/supabase-server";

import type {
  PracticeDifficulty,
  PracticeQuestion,
} from "@/types/practice";

export interface CurriculumQuestionQuery {
  topicId?: string;
  topicIds?: string[];
  moduleId?: string;
  chapterNumber?: number;
  difficulty?: PracticeDifficulty;
  limit?: number;
}

interface CurriculumQuestionMappingRow {
  question_id: string;
  topic_id: string;
  relevance_score: number;
}

function normalizeQuestion(
  question: Record<string, unknown>,
): PracticeQuestion {
  return {
    id: String(question.id),
    chapterNumber: Number(question.chapter_number),
    chapterSlug: String(question.chapter_slug),
    chapterTitle: String(question.chapter_title),
    topic: String(question.topic),
    difficulty: question.difficulty as PracticeDifficulty,
    question: String(question.question),
    options: Array.isArray(question.options)
      ? question.options.map(String)
      : [],
    correctAnswer: Number(question.correct_answer),
    explanation: String(question.explanation ?? ""),
    createdAt: String(question.created_at),
    updatedAt: String(question.updated_at),
  };
}

/**
 * Loads practice questions through the curriculum mapping layer.
 *
 * Important:
 * - Existing practice_questions are never modified.
 * - Existing 600 questions remain available.
 * - Curriculum-specific requests use curriculum_question_topics.
 * - Questions are deduplicated when mapped to multiple topics.
 * - Highest relevance_score wins for ranking.
 */
export async function getCurriculumQuestions(
  {
    topicId,
    topicIds,
    moduleId,
    chapterNumber,
    difficulty,
    limit = 10,
  }: CurriculumQuestionQuery = {},
): Promise<PracticeQuestion[]> {
  const supabase = await createSupabaseServerClient();

  const parsedLimit = Number(limit);

  const safeLimit =
    Number.isInteger(parsedLimit) &&
    parsedLimit >= 1 &&
    parsedLimit <= 100
      ? parsedLimit
      : 10;

  // ----------------------------------------------------------
  // RESOLVE CURRICULUM TOPICS
  // ----------------------------------------------------------

  let resolvedTopicIds: string[] = [];

  if (topicId) {
    resolvedTopicIds = [topicId];
  } else if (topicIds?.length) {
    resolvedTopicIds = [
      ...new Set(
        topicIds.filter(
          (id): id is string =>
            typeof id === "string" &&
            id.trim().length > 0,
        ),
      ),
    ];
  } else if (moduleId) {
    const { data, error } = await supabase
      .from("curriculum_topics")
      .select("id")
      .eq("module_id", moduleId)
      .eq("is_published", true)
      .order("order_index", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Failed to resolve curriculum module topics:",
        error,
      );

      throw new Error(
        "Failed to resolve curriculum module topics.",
      );
    }

    resolvedTopicIds = (data ?? []).map(
      (topic) => topic.id,
    );
  }

  if (resolvedTopicIds.length === 0) {
    return [];
  }

  // ----------------------------------------------------------
  // FETCH CURRICULUM QUESTION MAPPINGS
  // ----------------------------------------------------------

  let mappingQuery = supabase
    .from("curriculum_question_topics")
    .select(
      "question_id, topic_id, relevance_score",
    )
    .in("topic_id", resolvedTopicIds)
    .order("relevance_score", {
      ascending: false,
    });

  const {
    data: mappings,
    error: mappingError,
  } = await mappingQuery;

  if (mappingError) {
    console.error(
      "Failed to fetch curriculum question mappings:",
      mappingError,
    );

    throw new Error(
      "Failed to load curriculum question mappings.",
    );
  }

  const mappingRows =
    (mappings ?? []) as CurriculumQuestionMappingRow[];

  if (mappingRows.length === 0) {
    return [];
  }

  // ----------------------------------------------------------
  // DEDUPLICATE + RANK QUESTION IDS
  // ----------------------------------------------------------

  const relevanceByQuestion =
    new Map<string, number>();

  for (const mapping of mappingRows) {
    const questionId = String(
      mapping.question_id,
    );

    const relevance = Number(
      mapping.relevance_score ?? 0,
    );

    const previous =
      relevanceByQuestion.get(
        questionId,
      );

    if (
      previous === undefined ||
      relevance > previous
    ) {
      relevanceByQuestion.set(
        questionId,
        relevance,
      );
    }
  }

  const questionIds = [
    ...relevanceByQuestion.keys(),
  ];

  if (questionIds.length === 0) {
    return [];
  }

  // ----------------------------------------------------------
  // FETCH ACTUAL PRACTICE QUESTIONS
  // ----------------------------------------------------------

  let questionQuery = supabase
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
    .in("id", questionIds);

  if (chapterNumber !== undefined) {
    questionQuery = questionQuery.eq(
      "chapter_number",
      chapterNumber,
    );
  }

  if (difficulty) {
    questionQuery = questionQuery.eq(
      "difficulty",
      difficulty,
    );
  }

  const {
    data: questions,
    error: questionError,
  } = await questionQuery;

  if (questionError) {
    console.error(
      "Failed to fetch curriculum questions:",
      questionError,
    );

    throw new Error(
      "Failed to load curriculum questions.",
    );
  }

  // ----------------------------------------------------------
  // NORMALIZE + RANK
  // ----------------------------------------------------------

  const normalizedQuestions =
    (questions ?? []).map(
      (question) => ({
        question: normalizeQuestion(
          question as Record<
            string,
            unknown
          >,
        ),
        relevance:
          relevanceByQuestion.get(
            String(question.id),
          ) ?? 0,
      }),
    );

  normalizedQuestions.sort(
    (a, b) => {
      if (
        b.relevance !== a.relevance
      ) {
        return b.relevance - a.relevance;
      }

      return a.question.id.localeCompare(
        b.question.id,
      );
    },
  );

  return normalizedQuestions
    .slice(0, safeLimit)
    .map(
      ({ question }) => question,
    );
}

/**
 * Load questions for a single curriculum topic.
 */
export async function getQuestionsByCurriculumTopic(
  topicId: string,
  options: Omit<
    CurriculumQuestionQuery,
    "topicId"
  > = {},
): Promise<PracticeQuestion[]> {
  return getCurriculumQuestions({
    ...options,
    topicId,
  });
}

/**
 * Load all mapped questions belonging
 * to a curriculum module.
 */
export async function getQuestionsByCurriculumModule(
  moduleId: string,
  options: Omit<
    CurriculumQuestionQuery,
    "moduleId"
  > = {},
): Promise<PracticeQuestion[]> {
  return getCurriculumQuestions({
    ...options,
    moduleId,
  });
}