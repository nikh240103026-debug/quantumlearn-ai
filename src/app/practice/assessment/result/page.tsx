"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Printer, RotateCcw, Target } from "lucide-react";

import { getAssessmentById } from "@/lib/assessment/assessmentService";
import { useCandidate } from "@/components/exam/useCandidate";
import { formatClock } from "@/components/exam/ExamPalette";

function remarkFor(accuracy: number) {
  if (accuracy >= 90) return "Outstanding performance — an excellent grasp of the concepts.";
  if (accuracy >= 75) return "Great work. Revise a few weak areas to reach mastery.";
  if (accuracy >= 60) return "Good effort. Review the questions you missed before the next paper.";
  return "Revisit the learning modules and practice sets, then sit the paper again.";
}

function AssessmentResultContent() {
  const searchParams = useSearchParams();
  const candidate = useCandidate();

  const assessmentId = searchParams.get("id") ?? "";
  const score = Number(searchParams.get("score") ?? 0);
  const totalMarks = Number(searchParams.get("totalMarks") ?? 0);
  const correct = Number(searchParams.get("correct") ?? 0);
  const wrong = Number(searchParams.get("wrong") ?? 0);
  const skipped = Number(searchParams.get("skipped") ?? 0);
  const accuracy = Number(searchParams.get("accuracy") ?? 0);
  const passed = searchParams.get("passed") === "true";
  const timeTaken = Number(searchParams.get("time") ?? 0);

  const assessment = getAssessmentById(assessmentId);
  const paperTitle = (assessment?.title ?? "Assessment").replace(/ Assessment$/, "");
  const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
  const passMark = assessment?.passingMarks ?? null;
  const total = correct + wrong + skipped;

  const [issued] = useState(() =>
    new Date().toLocaleString(undefined, {
      dateStyle: "long",
      timeStyle: "short",
    }),
  );

  return (
    <main className="ql-paper min-h-screen px-4 py-10 text-ink sm:px-6 sm:py-14">
      <div className="mx-auto max-w-4xl">
        <div className="ql-no-print mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link href="/practice/assessment" className="text-sm font-semibold text-ink-soft hover:text-ink">
            ← All assessments
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-md border border-ink/25 bg-sheet px-4 py-2 text-sm font-semibold transition-colors hover:border-ink/60"
          >
            <Printer size={15} />
            Print / save as PDF
          </button>
        </div>

        {/* Statement of marks */}
        <article className="ql-sheet ql-print-area relative overflow-hidden rounded-lg border border-ink/80">
          <header className="flex flex-col gap-4 border-b-2 border-double border-ink px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-10">
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/quantumlearn-logo.png" alt="" className="h-11 w-11 object-contain" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-soft">QuantumLearn AI</p>
                <h1 className="font-serif text-2xl font-semibold sm:text-3xl">Statement of Marks</h1>
              </div>
            </div>
            <div className="text-left text-xs text-ink-soft sm:text-right">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em]">Issued</p>
              <p className="mt-0.5 text-ink">{issued}</p>
            </div>
          </header>

          <section className="grid gap-px border-b border-rule bg-rule sm:grid-cols-3">
            <Field label="Candidate" value={candidate.status === "user" ? candidate.name : "—"} />
            <Field label="Paper" value={paperTitle} />
            <Field label="Level" value={assessment?.difficulty ?? "—"} />
          </section>

          <section className="relative px-6 py-8 sm:px-10">
            {/* Stamp */}
            <div
              className={`ql-stamp pointer-events-none absolute right-6 top-6 rounded-md border-[5px] px-5 py-2 text-center font-serif sm:right-12 sm:top-8 ${
                passed ? "border-exam-green text-exam-green" : "border-exam-red text-exam-red"
              }`}
              aria-hidden="true"
            >
              <p className="text-4xl font-black uppercase tracking-[0.12em] sm:text-5xl">{passed ? "Pass" : "Fail"}</p>
              {passMark !== null && (
                <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Pass mark {passMark}%</p>
              )}
            </div>

            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-soft">Marks obtained</p>
            <p className="mt-2 font-serif leading-none">
              <span className="text-[5.5rem] font-semibold tabular-nums sm:text-[7rem]">{score}</span>
              <span className="text-3xl text-ink-soft"> / {totalMarks}</span>
              <span className={`ml-4 align-[0.6em] text-2xl font-semibold ${passed ? "text-exam-green" : "text-exam-red"}`}>
                {percentage}%
              </span>
            </p>
            <p className="sr-only">Result: {passed ? "passed" : "not passed"}</p>

            {/* Percentage bar with pass-mark marker */}
            <div className="mt-8 max-w-xl">
              <div className="flex justify-between text-xs text-ink-soft">
                <span>0%</span>
                <span>100%</span>
              </div>
              <div className="relative mt-2 h-3 rounded-full bg-paper ring-1 ring-rule">
                <div
                  className={`h-full rounded-full ${passed ? "bg-exam-green" : "bg-exam-red"}`}
                  style={{ width: `${Math.min(100, percentage)}%` }}
                />
                {passMark !== null && (
                  <span
                    className="absolute -top-1.5 h-6 w-0.5 bg-ink"
                    style={{ left: `${passMark}%` }}
                    title={`Pass mark ${passMark}%`}
                  >
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.1em]">
                      Pass
                    </span>
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* Breakdown table */}
          <section className="border-t border-rule px-6 py-6 sm:px-10">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b-2 border-ink text-[11px] uppercase tracking-[0.16em] text-ink-soft">
                  <th className="pb-2 font-semibold">Component</th>
                  <th className="pb-2 text-right font-semibold">Count</th>
                  <th className="hidden pb-2 font-semibold sm:table-cell sm:pl-8">Share of paper</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule">
                <BreakdownRow label="Correct" value={correct} total={total} color="bg-exam-green" />
                <BreakdownRow label="Incorrect" value={wrong} total={total} color="bg-exam-red" />
                <BreakdownRow label="Not answered" value={skipped} total={total} color="bg-ink/30" />
                <tr>
                  <td className="py-3 font-semibold">Accuracy</td>
                  <td className="py-3 text-right font-serif text-lg font-semibold tabular-nums">{accuracy}%</td>
                  <td className="hidden sm:table-cell" />
                </tr>
                {timeTaken > 0 && (
                  <tr>
                    <td className="py-3 font-semibold">Time taken</td>
                    <td className="py-3 text-right font-mono tabular-nums">{formatClock(timeTaken)}</td>
                    <td className="hidden py-3 text-xs text-ink-soft sm:table-cell sm:pl-8">
                      {assessment ? `of ${assessment.duration}:00 allowed` : ""}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>

          <section className="border-t border-rule bg-paper/50 px-6 py-6 sm:px-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-soft">Examiner&apos;s remark</p>
            <p className="mt-2 font-serif text-xl italic leading-8">{remarkFor(accuracy)}</p>
            {assessment && (
              <p className="mt-4 text-sm text-ink-soft">
                Syllabus: <span className="font-serif italic text-ink">{assessment.topics.join(" · ")}</span>
              </p>
            )}
          </section>

          <footer className="flex flex-wrap items-center justify-between gap-2 border-t-2 border-double border-ink px-6 py-3 text-[11px] text-ink-soft sm:px-10">
            <span>Graded automatically on the QuantumLearn servers. No negative marking.</span>
            <span>This statement is for self-assessment only.</span>
          </footer>
        </article>

        {/* Next steps */}
        <div className="ql-no-print mt-6 grid gap-3 sm:grid-cols-3">
          {assessment && (
            <Link
              href={`/practice/assessment/${assessment.id}`}
              className="flex items-center justify-center gap-2 rounded-md bg-ink px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-black"
            >
              <RotateCcw size={15} />
              Sit again
            </Link>
          )}
          <Link
            href="/practice"
            className="flex items-center justify-center gap-2 rounded-md border border-ink/25 bg-sheet px-5 py-3.5 text-sm font-semibold transition-colors hover:border-ink/60"
          >
            <Target size={15} />
            Practise weak topics
          </Link>
          <Link
            href="/practice/assessment"
            className="flex items-center justify-center gap-2 rounded-md border border-ink/25 bg-sheet px-5 py-3.5 text-sm font-semibold transition-colors hover:border-ink/60"
          >
            Other papers
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </main>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-sheet px-6 py-4 sm:px-10">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-soft">{label}</p>
      <p className="mt-1 truncate font-serif text-lg font-semibold">{value}</p>
    </div>
  );
}

function BreakdownRow({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const share = total > 0 ? (value / total) * 100 : 0;
  return (
    <tr>
      <td className="py-3 font-semibold">
        <span className="inline-flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-sm ${color}`} />
          {label}
        </span>
      </td>
      <td className="py-3 text-right font-serif text-lg font-semibold tabular-nums">{value}</td>
      <td className="hidden py-3 sm:table-cell sm:pl-8">
        <span className="block h-2 w-full max-w-[220px] rounded-full bg-paper ring-1 ring-rule">
          <span className={`block h-full rounded-full ${color}`} style={{ width: `${share}%` }} />
        </span>
      </td>
    </tr>
  );
}

export default function AssessmentResultPage() {
  return (
    <Suspense
      fallback={
        <main className="ql-paper flex min-h-screen items-center justify-center text-ink-soft">
          <span className="font-serif text-lg italic">Preparing your statement of marks…</span>
        </main>
      }
    >
      <AssessmentResultContent />
    </Suspense>
  );
}
