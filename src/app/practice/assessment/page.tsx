import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, FileText, Target } from "lucide-react";
import { PaperPage } from "@/components/exam/PaperPage";
import {
  getAllAssessments,
  getTotalAssessmentCount,
  getTotalDuration,
  getTotalQuestions,
} from "@/lib/assessment/assessmentService";
import type { Assessment } from "@/types/assessment";

export const metadata: Metadata = {
  title: "Assessments",
  description: "Timed, exam-style quantum computing assessments with a printable scorecard.",
};

const LEVEL_STYLE: Record<Assessment["difficulty"], { band: string; text: string; code: string }> = {
  Beginner: { band: "bg-exam-green", text: "text-exam-green", code: "100" },
  Intermediate: { band: "bg-exam-amber", text: "text-exam-amber", code: "200" },
  Advanced: { band: "bg-exam-red", text: "text-exam-red", code: "300" },
};

export default function AssessmentPage() {
  const assessments = getAllAssessments();

  return (
    <PaperPage
      crumbs={[
        { label: "Home", href: "/" },
        { label: "Practice", href: "/practice" },
        { label: "Assessments" },
      ]}
      kicker="Examination hall"
      title={
        <>
          Timed assessments.
          <br />
          <em className="text-exam-blue">Real exam conditions.</em>
        </>
      }
      lead="A countdown clock, a question palette, mark-for-review and a printable statement of marks — so you know you're ready before it counts."
      aside={
        <dl className="ql-sheet grid grid-cols-3 divide-x divide-rule rounded-lg border border-rule">
          <Summary label="Papers" value={String(getTotalAssessmentCount())} />
          <Summary label="Questions" value={String(getTotalQuestions())} />
          <Summary label="Total time" value={`${getTotalDuration()}m`} />
        </dl>
      }
    >
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {assessments.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-rule px-6 py-16 text-center">
            <p className="font-serif text-2xl">No papers scheduled yet.</p>
            <p className="mt-2 text-sm text-ink-soft">New assessments will appear here.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {assessments.map((assessment, index) => (
              <BookletCover key={assessment.id} assessment={assessment} index={index} />
            ))}
          </div>
        )}

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-rule pt-6 text-sm text-ink-soft sm:flex-row sm:items-center">
          <p>Not ready for the clock yet? Warm up with untimed practice first.</p>
          <Link href="/practice" className="inline-flex items-center gap-1.5 font-semibold text-ink hover:underline">
            Go to practice <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </PaperPage>
  );
}

function BookletCover({ assessment, index }: { assessment: Assessment; index: number }) {
  const level = LEVEL_STYLE[assessment.difficulty] ?? LEVEL_STYLE.Beginner;
  const paperCode = `QL-${level.code.slice(0, 1)}${String(index + 1).padStart(2, "0")}`;

  return (
    <Link
      href={`/practice/assessment/${assessment.id}`}
      className="ql-sheet group relative flex flex-col overflow-hidden rounded-lg border border-ink/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-[8px_8px_0_var(--color-ink)]"
    >
      {/* booklet spine band */}
      <div className={`h-2 ${level.band}`} />

      <div className="flex items-start justify-between border-b border-dashed border-rule px-6 py-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-soft">Paper code</p>
          <p className="mt-0.5 font-mono text-sm font-semibold">{paperCode}</p>
        </div>
        <span className={`rounded-sm border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${level.text} border-current`}>
          {assessment.difficulty}
        </span>
      </div>

      <div className="flex-1 px-6 py-6">
        <h2 className="font-serif text-[1.65rem] font-semibold leading-tight">
          {assessment.title.replace(/ Assessment$/, "")}
        </h2>
        <p className="mt-2 text-sm leading-6 text-ink-soft">{assessment.description}</p>

        <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-soft">Syllabus</p>
        <p className="mt-1.5 font-serif text-[15px] italic leading-6 text-ink/80">
          {assessment.topics.join(" · ")}
        </p>
      </div>

      <dl className="grid grid-cols-3 divide-x divide-rule border-t border-rule bg-paper/60 text-center">
        <CoverStat icon={Clock} label="Time" value={`${assessment.duration} min`} />
        <CoverStat icon={FileText} label="Questions" value={String(assessment.questions)} />
        <CoverStat icon={Target} label="Pass" value={`${assessment.passingMarks}%`} />
      </dl>

      <div className="flex items-center justify-between bg-ink px-6 py-3.5 text-sm font-semibold text-white">
        Read instructions
        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

function CoverStat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="px-2 py-3">
      <dt className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-[0.14em] text-ink-soft">
        <Icon size={11} />
        {label}
      </dt>
      <dd className="mt-0.5 font-serif text-lg font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-5 py-3">
      <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-soft">{label}</dt>
      <dd className="mt-0.5 font-serif text-2xl font-semibold tabular-nums">{value}</dd>
    </div>
  );
}
