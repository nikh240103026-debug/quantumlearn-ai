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
    difficulty:
      question.difficulty as PracticeDifficulty,
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
 * Returns practice questions connected to the curriculum
 * through curriculum_question_topics.
 *
 * Existing practice_questions remain untouched.
 * The curriculum mapping becomes the source of truth
 * whenever a topic/module-specific assessment is requested.
 */
export async function getCurriculumQuestions({
  topicId,
  topicIds,
  moduleId,
  chapterNumber,
  difficulty,
  limit = 10,
}: CurriculumQuestionQuery = {}): Promise<
  PracticeQuestion[]
> {
  const supabase =
    await createSupabaseServerClient();

  const safeLimit = Math.min(
    Math.max(
      Number.isInteger(limit) ? limit : 10,
      1,
    ),
    100,
  );

  // ----------------------------------------------------------
  // RESOLVE TOPICS
  // ----------------------------------------------------------

  let resolvedTopicIds: string[] = [];

  if (topicId) {
    resolvedTopicIds = [topicId];
  } else if (
    Array.isArray(topicIds) &&
    topicIds.length > 0
  ) {
    resolvedTopicIds = [
      ...new Set(topicIds),
    ];
  } else if (moduleId) {
    const {
      data: moduleTopics,
      error: moduleTopicError,
    } = await supabase
      .from("curriculum_topics")
      .select("id")
      .eq("module_id", moduleId)
      .eq("is_published", true)
      .order("order_index", {
        ascending: true,
      });

    if (moduleTopicError) {
      console.error(
        "Failed to resolve curriculum module topics:",
        moduleTopicError,
      );

      throw new Error(
        "Failed to resolve curriculum topics.",
      );
    }

    resolvedTopicIds =
      (moduleTopics ?? []).map(
        (topic) => topic.id,
      );
  }

  // ----------------------------------------------------------
  // RESOLVE QUESTION MAPPINGS
  // ----------------------------------------------------------

  let mappingQuery = supabase
    .from("curriculum_question_topics")
    .select(
      "question_id, topic_id, relevance_score",
    )
    .order("relevance_score", {
      ascending: false,
    });

  if (resolvedTopicIds.length > 0) {
    mappingQuery = mappingQuery.in(
      "topic_id",
      resolvedTopicIds,
    );
  }

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
  // DEDUPLICATE QUESTIONS
  // ----------------------------------------------------------

  const questionIds: string[] = [];
  const relevanceByQuestion =
    new Map<string, number>();

  for (const mapping of mappingRows) {
    const existingRelevance =
      relevanceByQuestion.get(
        mapping.question_id,
      );

    if (
      existingRelevance === undefined ||
      mapping.relevance_score >
        existingRelevance
    ) {
      relevanceByQuestion.set(
        mapping.question_id,
        mapping.relevance_score,
      );
    }

    if (
      !questionIds.includes(
        mapping.question_id,
      )
    ) {
      questionIds.push(
        mapping.question_id,
      );
    }
  }

  if (questionIds.length === 0) {
    return [];
  }

  // ----------------------------------------------------------
  // FETCH QUESTIONS
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

  if (
    chapterNumber !== undefined
  ) {
    questionQuery =
      questionQuery.eq(
        "chapter_number",
        chapterNumber,
      );
  }

  if (difficulty) {
    questionQuery =
      questionQuery.eq(
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
  // RANK BY CURRICULUM RELEVANCE
  // ----------------------------------------------------------

  const normalizedQuestions =
    (questions ?? []).map(
      (question) => ({
        question:
          normalizeQuestion(
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
        b.relevance !==
        a.relevance
      ) {
        return (
          b.relevance -
          a.relevance
        );
      }

      return (
        a.question.id.localeCompare(
          b.question.id,
        )
      );
    },
  );

  return normalizedQuestions
    .slice(0, safeLimit)
    .map(
      ({ question }) =>
        question,
    );
}

/**
 * Convenience helper for loading one curriculum topic's
 * questions.
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
 * Convenience helper for loading all mapped questions
 * belonging to a curriculum module.
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