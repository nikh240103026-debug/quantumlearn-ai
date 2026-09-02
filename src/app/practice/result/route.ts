import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const DIFFICULTIES = new Set(["easy", "medium", "difficult"]);

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "You must be logged in to save your practice result." }, { status: 401 });

    const body = await request.json();
    const lessonSlug = typeof body.lessonSlug === "string" ? body.lessonSlug.trim() : "";
    const chapterNumber = Number(body.chapterNumber);
    const difficulty = typeof body.difficulty === "string" ? body.difficulty : "";
    const score = Number(body.score);
    const totalQuestions = Number(body.totalQuestions);
    const percentage = Number(body.percentage);
    const answers = body.answers && typeof body.answers === "object" ? body.answers : {};
    const questionIds = Array.isArray(body.questionIds) ? body.questionIds.filter((id: unknown) => typeof id === "string") : [];

    if (!lessonSlug || !Number.isInteger(chapterNumber) || chapterNumber < 1 || chapterNumber > 10 || !DIFFICULTIES.has(difficulty) || !Number.isInteger(score) || !Number.isInteger(totalQuestions) || totalQuestions <= 0 || score < 0 || score > totalQuestions || !Number.isFinite(percentage) || percentage < 0 || percentage > 100) {
      return NextResponse.json({ error: "Invalid practice result." }, { status: 400 });
    }

    const now = new Date().toISOString();
    const { data: result, error: insertError } = await supabase.from("practice_results").insert({
      user_id: user.id, lesson_slug: lessonSlug, chapter_number: chapterNumber, difficulty,
      score, total_questions: totalQuestions, percentage, answers, question_ids: questionIds,
      completed_at: now, created_at: now,
    }).select("id, lesson_slug, chapter_number, difficulty, score, total_questions, percentage, completed_at").single();
    if (insertError) throw insertError;

    if (questionIds.length > 0) {
      const { data: questions } = await supabase.from("practice_questions").select("id, chapter_number, chapter_slug, chapter_title, topic, difficulty, correct_answer").in("id", questionIds);
      const questionMap = new Map((questions ?? []).map((q) => [q.id, q]));
      const rows = questionIds.map((questionId: string, index: number) => {
        const q = questionMap.get(questionId);
        const selected = answers[String(index)];
        const selectedNumber = Number.isInteger(selected) ? selected : null;
        return {
          user_id: user.id, practice_result_id: result.id, question_id: questionId,
          chapter_number: q?.chapter_number ?? chapterNumber, chapter_slug: q?.chapter_slug ?? `chapter-${chapterNumber}`,
          chapter_title: q?.chapter_title ?? null, topic: q?.topic ?? null, difficulty: q?.difficulty ?? difficulty,
          selected_answer: selectedNumber, correct_answer: q?.correct_answer ?? null,
          is_correct: selectedNumber !== null && q?.correct_answer === selectedNumber, created_at: now,
        };
      });
      const { error: attemptError } = await supabase.from("practice_question_attempts").insert(rows);
      if (attemptError) console.error("Practice question analytics insert failed:", attemptError);
    }

    await supabase.from("ai_activity").insert({
      user_id: user.id, activity_type: "practice_completed", source: "practice", topic: `Chapter ${chapterNumber}`,
      title: `Completed ${difficulty} practice`, metadata: { practice_result_id: result.id, score, total_questions: totalQuestions, percentage },
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Practice result API error:", error);
    return NextResponse.json({ error: "Something went wrong while saving your practice result." }, { status: 500 });
  }
}
