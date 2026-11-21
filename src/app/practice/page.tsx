import Link from "next/link";
import { ArrowLeft, BrainCircuit } from "lucide-react";
import PracticeQuiz from "@/components/practice/PracticeQuiz";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getLearningPreferences } from "@/lib/user-preferences";

export const dynamic = "force-dynamic";

type QuizDifficulty = "easy" | "medium" | "difficult";

/*
 * Default quiz difficulty from Settings > Learning > Preferred
 * difficulty (a ?difficulty= URL parameter still takes precedence in
 * the quiz). "Adaptive" picks a level from the learner's recent scores.
 */
async function preferredDifficulty(): Promise<QuizDifficulty | undefined> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return undefined;
  }

  const { preferred_difficulty: preference } =
    await getLearningPreferences(supabase, user.id);

  if (preference === "easy") return "easy";
  if (preference === "medium") return "medium";
  if (preference === "hard") return "difficult";

  // Adaptive: average of the last 5 results.
  const { data: recent } = await supabase
    .from("practice_results")
    .select("percentage")
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false })
    .limit(5);

  const scores = (recent ?? [])
    .map((row) => Number(row.percentage))
    .filter((value) => Number.isFinite(value));

  if (scores.length === 0) {
    return "easy";
  }

  const average =
    scores.reduce((sum, value) => sum + value, 0) / scores.length;

  return average >= 80 ? "difficult" : average >= 50 ? "medium" : "easy";
}

export default async function PracticePage() {
  const difficulty = await preferredDifficulty();

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-blue-600"
          >
            <ArrowLeft
              size={16}
              className="transition-transform group-hover:-translate-x-0.5"
            />
            Back to Home
          </Link>

          <div className="mt-7 flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
              <BrainCircuit size={23} />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                Knowledge Check
              </p>

              <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Practice
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Test your understanding, review your mistakes, and track your
                progress across quantum computing fundamentals.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <PracticeQuiz difficulty={difficulty} />
      </section>
    </main>
  );
}