import { createSupabaseServerClient } from "@/lib/supabase-server";

import type {
  PracticeDifficulty,
  PracticeQuestion,
} from "@/types/practice";

interface GetPracticeQuestionsOptions {
  chapterNumber?: number;
  difficulty?: PracticeDifficulty;
  limit?: number;
}

export async function getPracticeQuestions({
  chapterNumber,
  difficulty,
  limit = 30,
}: GetPracticeQuestionsOptions = {}): Promise<
  PracticeQuestion[]
> {
  const supabase = await createSupabaseServerClient();

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
    .order("chapter_number", {
      ascending: true,
    })
    .order("difficulty", {
      ascending: true,
    })
    .order("created_at", {
      ascending: true,
    });

  // ==========================================================
  // FILTER BY CHAPTER
  // ==========================================================

  if (chapterNumber !== undefined) {
    query = query.eq(
      "chapter_number",
      chapterNumber,
    );
  }

  // ==========================================================
  // FILTER BY DIFFICULTY
  // ==========================================================

  if (difficulty !== undefined) {
    query = query.eq(
      "difficulty",
      difficulty,
    );
  }

  // ==========================================================
  // LIMIT
  // ==========================================================

  const safeLimit = Math.min(
    Math.max(limit, 1),
    100,
  );

  query = query.limit(safeLimit);

  // ==========================================================
  // EXECUTE QUERY
  // ==========================================================

  const {
    data,
    error,
  } = await query;

  if (error) {
    console.error(
      "Failed to fetch practice questions:",
      error,
    );

    throw new Error(
      "Failed to fetch practice questions.",
    );
  }

  // ==========================================================
  // MAP DATABASE ROWS → APPLICATION TYPE
  // ==========================================================

  return (data ?? []).map(
    (question): PracticeQuestion => ({
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
        question.difficulty as PracticeDifficulty,

      question:
        question.question,

      options:
        question.options as string[],

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
}