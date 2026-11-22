"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LogIn } from "lucide-react";
import type { Assessment } from "@/types/assessment";
import { useCandidate } from "@/components/exam/useCandidate";
import type { PaletteStatus } from "@/components/exam/ExamPalette";

const LEGEND: Array<{ status: PaletteStatus; label: string; className: string }> = [
  { status: "not-visited", label: "You have not visited the question yet.", className: "rounded-sm border-rule bg-white text-ink-soft" },
  { status: "not-answered", label: "You visited but did not answer.", className: "rounded-sm border-exam-red bg-exam-red text-white [clip-path:polygon(0_0,100%_0,100%_72%,50%_100%,0_72%)]" },
  { status: "answered", label: "You answered the question.", className: "rounded-sm border-exam-green bg-exam-green text-white [clip-path:polygon(0_28%,50%_0,100%_28%,100%_100%,0_100%)]" },
  { status: "review", label: "Not answered, marked for review.", className: "rounded-full border-exam-violet bg-exam-violet text-white" },
  { status: "answered-review", label: "Answered and marked for review — it will be evaluated.", className: "rounded-full border-exam-violet bg-exam-violet text-white" },
];

/** Pre-exam instructions with a declaration, like a CBT briefing screen. */
export function AssessmentBriefing({ assessment }: { assessment: Assessment }) {
  const router = useRouter();
  const candidate = useCandidate();
  const [agreed, setAgreed] = useState(false);

  const marksEach = assessment.questions > 0 ? Math.round(assessment.totalMarks / assessment.questions) : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      {/* Instructions sheet */}
      <article className="ql-sheet overflow-hidden rounded-xl border border-rule">
        <div className="flex items-center justify-between border-b border-rule px-6 py-4 sm:px-8">
          <h2 className="font-serif text-2xl font-semibold">General instructions</h2>
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">Read carefully</span>
        </div>

        <ol className="space-y-4 px-6 py-6 text-[15px] leading-7 text-ink/85 sm:px-8">
          {[
            <>
              The clock is set to <strong>{assessment.duration} minutes</strong> and starts when you press
              <em> Begin</em>. It counts down in the exam bar at the top of the screen.
            </>,
            <>
              When the clock reaches zero your answers are <strong>submitted automatically</strong>. You
              do not need to press Submit.
            </>,
            <>
              There are <strong>{assessment.questions} multiple-choice questions</strong> of about{" "}
              {marksEach} marks each — {assessment.totalMarks} marks in total. There is{" "}
              <strong>no negative marking</strong>; an unanswered question scores zero.
            </>,
            <>
              You need <strong>{assessment.passingMarks}%</strong> to pass. Your statement of marks
              appears immediately after you submit.
            </>,
            <>
              Move freely between questions with <em>Previous</em>, <em>Save &amp; next</em> or the
              question palette. You can change any answer until you submit.
            </>,
            <>
              Use <em>Mark for review</em> to flag a question you want to revisit. Answered questions
              that are marked for review are still evaluated.
            </>,
            <>
              <strong>Don&apos;t refresh or close the tab</strong> during the exam — your answers are
              kept in this window only and would be lost.
            </>,
          ].map((item, index) => (
            <li key={index} className="flex gap-4">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-ink/60 font-serif text-sm font-semibold">
                {index + 1}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>

        <div className="border-t border-rule bg-paper/50 px-6 py-6 sm:px-8">
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-soft">Question palette</h3>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {LEGEND.map((item, index) => (
              <li key={item.status} className="flex items-center gap-3 text-sm text-ink/80">
                <span className={`relative flex h-8 w-9 shrink-0 items-center justify-center border text-xs font-semibold ${item.className}`}>
                  {index + 1}
                  {item.status === "answered-review" && (
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-exam-green" />
                  )}
                </span>
                {item.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-rule px-6 py-5 sm:px-8">
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-soft">Keyboard</h3>
          <p className="mt-2 text-sm text-ink/80">
            <Key>1</Key>–<Key>4</Key> or <Key>A</Key>–<Key>D</Key> choose an option · <Key>←</Key>{" "}
            <Key>→</Key> move between questions · <Key>M</Key> mark for review
          </p>
        </div>
      </article>

      {/* Candidate + declaration */}
      <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
        <div className="overflow-hidden rounded-xl border border-ink bg-sheet shadow-[6px_6px_0_var(--color-ink)]">
          <div className="bg-ink px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
            Candidate
          </div>

          <div className="flex items-center gap-4 border-b border-dashed border-rule px-5 py-5">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border-2 border-ink bg-paper font-serif text-2xl font-semibold">
              {candidate.status === "user" ? candidate.name.charAt(0).toUpperCase() : "?"}
            </span>
            <div className="min-w-0">
              {candidate.status === "loading" ? (
                <div className="h-5 w-32 animate-pulse rounded bg-paper" />
              ) : candidate.status === "user" ? (
                <>
                  <p className="truncate font-serif text-xl font-semibold">{candidate.name}</p>
                  <p className="truncate text-xs text-ink-soft">{candidate.email}</p>
                </>
              ) : (
                <>
                  <p className="font-serif text-xl font-semibold">Not signed in</p>
                  <p className="text-xs text-ink-soft">Sign in to sit this paper.</p>
                </>
              )}
            </div>
          </div>

          <dl className="divide-y divide-dashed divide-rule px-5 text-sm">
            <Row label="Paper" value={assessment.title.replace(/ Assessment$/, "")} />
            <Row label="Level" value={assessment.difficulty} />
            <Row label="Duration" value={`${assessment.duration} minutes`} />
            <Row label="Maximum marks" value={String(assessment.totalMarks)} />
            <Row label="Pass mark" value={`${assessment.passingMarks}%`} />
          </dl>

          <div className="border-t border-rule p-5">
            {candidate.status === "guest" ? (
              <>
                <p className="mb-3 text-xs leading-5 text-ink-soft">
                  Papers are graded securely on our servers for signed-in learners, so please sign in
                  before the clock starts.
                </p>
                <Link
                  href="/login"
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-ink px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-black"
                >
                  <LogIn size={16} />
                  Log in to begin
                </Link>
              </>
            ) : (
              <>
                <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-ink/85">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(event) => setAgreed(event.target.checked)}
                    className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-ink)]"
                  />
                  I have read and understood the instructions, and I am ready to begin.
                </label>
                <button
                  type="button"
                  disabled={!agreed || candidate.status !== "user"}
                  onClick={() => router.push(`/practice/assessment/start/${assessment.id}`)}
                  className="group mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-ink px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:bg-ink/20 disabled:text-ink/45"
                >
                  Begin — start the clock
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </button>
              </>
            )}
          </div>
        </div>

        <Link href="/practice/assessment" className="block text-center text-sm font-semibold text-ink-soft hover:text-ink">
          ← All assessments
        </Link>
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <dt className="shrink-0 text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">{label}</dt>
      <dd className="text-right font-serif text-[15px] font-semibold">{value}</dd>
    </div>
  );
}

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-rule bg-paper px-1.5 py-px font-mono text-[11px] text-ink">{children}</kbd>
  );
}
