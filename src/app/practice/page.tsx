import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bot, Timer } from "lucide-react";
import { PaperPage } from "@/components/exam/PaperPage";
import PracticeQuiz from "@/components/practice/PracticeQuiz";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getLearningPreferences } from "@/lib/user-preferences";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Practice",
  description:
    "Targeted quantum computing practice with instant answer checks, explanations and personalised next-topic recommendations.",
};

type QuizDifficulty = "easy" | "medium" | "difficult";

type PracticeStats = {
  sessions: number;
  recentAverage: number | null;
  best: number | null;
};

/*
 * Default quiz difficulty from Settings > Learning > Preferred
 * difficulty (a ?difficulty= URL parameter still takes precedence in
 * the quiz). "Adaptive" picks a level from the learner's recent scores.
 * Also returns the signed-in learner's practice stats for the header.
 */
async function loadPracticeContext(): Promise<{
  difficulty?: QuizDifficulty;
  stats: PracticeStats | null;
}> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { difficulty: undefined, stats: null };
  }

  const [{ preferred_difficulty: preference }, recentResult, countResult] =
    await Promise.all([
      getLearningPreferences(supabase, user.id),
      supabase
        .from("practice_results")
        .select("percentage")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false })
        .limit(20),
      supabase
        .from("practice_results")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
    ]);

  const scores = (recentResult.data ?? [])
    .map((row) => Number(row.percentage))
    .filter((value) => Number.isFinite(value));

  const lastFive = scores.slice(0, 5);
  const recentAverage = lastFive.length
    ? Math.round(lastFive.reduce((sum, value) => sum + value, 0) / lastFive.length)
    : null;

  const stats: PracticeStats = {
    sessions: countResult.count ?? scores.length,
    recentAverage,
    best: scores.length ? Math.max(...scores) : null,
  };

  let difficulty: QuizDifficulty;

  if (preference === "easy") difficulty = "easy";
  else if (preference === "medium") difficulty = "medium";
  else if (preference === "hard") difficulty = "difficult";
  // Adaptive: average of the last 5 results.
  else if (recentAverage === null) difficulty = "easy";
  else difficulty = recentAverage >= 80 ? "difficult" : recentAverage >= 50 ? "medium" : "easy";

  return { difficulty, stats };
}

export default async function PracticePage() {
  const { difficulty, stats } = await loadPracticeContext();

  return (
    <PaperPage
      crumbs={[{ label: "Home", href: "/" }, { label: "Practice" }]}
      kicker="Practice hall"
      title={
        <>
          Sit a paper.
          <br />
          <em className="text-exam-blue">Get marked instantly.</em>
        </>
      }
      lead="Fill in the form, take your seat, and answer each question on the sheet. Every answer is marked on the spot, with the reasoning behind it."
      aside={
        <div className="flex flex-col gap-4 lg:items-end">
          {stats && (
            <dl className="ql-sheet grid grid-cols-3 divide-x divide-rule rounded-lg border border-rule">
              <RecordStat label="Papers sat" value={String(stats.sessions)} />
              <RecordStat
                label="Recent avg"
                value={stats.recentAverage === null ? "—" : `${stats.recentAverage}%`}
              />
              <RecordStat label="Best" value={stats.best === null ? "—" : `${stats.best}%`} />
            </dl>
          )}
          <div className="flex flex-wrap gap-2">
            <Link
              href="/practice/assessment"
              className="group inline-flex items-center gap-2 rounded-md border border-ink bg-ink px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-black"
            >
              <Timer size={15} />
              Timed assessments
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/ai-tutor"
              className="inline-flex items-center gap-2 rounded-md border border-ink/25 bg-sheet px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink/60"
            >
              <Bot size={15} />
              Ask the tutor
            </Link>
          </div>
        </div>
      }
    >
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <PracticeQuiz difficulty={difficulty} isSignedIn={stats !== null} />
      </section>
    </PaperPage>
  );
}

function RecordStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-5 py-3">
      <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-soft">{label}</dt>
      <dd className="mt-0.5 font-serif text-2xl font-semibold tabular-nums">{value}</dd>
    </div>
  );
}
