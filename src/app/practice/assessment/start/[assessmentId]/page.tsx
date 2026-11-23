"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, ArrowRight, Bookmark, Eraser, Send } from "lucide-react";

import type { PublicAssessmentQuestion } from "@/types/assessmentQuestion";
import { getAssessmentById } from "@/lib/assessment/assessmentService";
import { ExamShell } from "@/components/exam/ExamShell";
import { OmrOption } from "@/components/exam/OmrOption";
import { ConfirmDialog } from "@/components/exam/ConfirmDialog";
import { ExamClock, ExamPalette, type PaletteStatus } from "@/components/exam/ExamPalette";
import { useCandidate } from "@/components/exam/useCandidate";

/*
 * Questions come from the API without the answer key, and grading
 * happens on the server (POST /api/assessment/[id]/submit), so the
 * correct answers are never part of the browser bundle.
 */
export default function StartAssessmentPage() {
  const router = useRouter();
  const params = useParams();
  const candidate = useCandidate();

  const assessmentId = params.assessmentId as string;
  const meta = getAssessmentById(assessmentId);
  const paperTitle = (meta?.title ?? "Assessment").replace(/ Assessment$/, "");

  const [questions, setQuestions] = useState<PublicAssessmentQuestion[]>([]);
  const [durationMinutes, setDurationMinutes] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [visited, setVisited] = useState<Record<string, true>>({});
  const [review, setReview] = useState<Record<string, true>>({});

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [confirmQuit, setConfirmQuit] = useState(false);

  const [secondsLeft, setSecondsLeft] = useState(0);
  const [timeNotice, setTimeNotice] = useState("");

  // Ref guard: the timer and the Submit button can both fire before a
  // state update lands, which would submit twice.
  const submittingRef = useRef(false);

  // Latest answers for the timer's auto-submit.
  const answersRef = useRef(answers);
  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadError("");

      try {
        const [assessmentResponse, questionsResponse] = await Promise.all([
          fetch(`/api/assessment/${encodeURIComponent(assessmentId)}`),
          fetch(`/api/assessment/${encodeURIComponent(assessmentId)}/questions`),
        ]);

        const assessmentData = await assessmentResponse.json().catch(() => ({}));
        const questionsData = await questionsResponse.json().catch(() => ({}));

        if (!assessmentResponse.ok || !questionsResponse.ok) {
          throw new Error(
            questionsData.message || assessmentData.message || "Unable to load this assessment.",
          );
        }

        if (!cancelled) {
          setQuestions(Array.isArray(questionsData.data) ? questionsData.data : []);
          setDurationMinutes(Number(assessmentData.data?.duration) || 30);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : "Unable to load this assessment.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [assessmentId]);

  const handleSubmit = useCallback(async () => {
    if (submittingRef.current) {
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch(`/api/assessment/${encodeURIComponent(assessmentId)}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: answersRef.current,
          durationSeconds: startedAtRef.current
            ? Math.round((Date.now() - startedAtRef.current) / 1000)
            : null,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.data) {
        throw new Error(data.message || "Your assessment could not be submitted.");
      }

      const result = data.data;
      const elapsed = startedAtRef.current
        ? Math.round((Date.now() - startedAtRef.current) / 1000)
        : 0;

      const resultParams = new URLSearchParams({
        id: assessmentId,
        score: String(result.score),
        totalMarks: String(result.totalMarks),
        correct: String(result.correctAnswers),
        wrong: String(result.wrongAnswers),
        skipped: String(result.skippedAnswers),
        accuracy: String(result.accuracy),
        passed: String(result.passed),
        time: String(elapsed),
      });

      router.push(`/practice/assessment/result?${resultParams.toString()}`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Your assessment could not be submitted.");
      setConfirmSubmit(false);

      // Allow a retry.
      submittingRef.current = false;
      setSubmitting(false);
    }
  }, [assessmentId, router]);

  // ---------------------------------------------------------------
  // Countdown to a fixed end time, so re-renders and throttled
  // background tabs can't stretch it. Auto-submits at zero.
  // ---------------------------------------------------------------
  const examReady = !loading && !loadError && questions.length > 0 && durationMinutes !== null;

  useEffect(() => {
    if (!examReady || durationMinutes === null) return;

    const startedAt = Date.now();
    startedAtRef.current = startedAt;
    const endsAt = startedAt + durationMinutes * 60 * 1000;
    let fired = false;
    let warned5 = false;
    let warned1 = false;

    const tick = () => {
      const remaining = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
      setSecondsLeft(remaining);

      if (!warned5 && remaining <= 300 && remaining > 60 && durationMinutes > 5) {
        warned5 = true;
        setTimeNotice("5 minutes remaining");
      }
      if (!warned1 && remaining <= 60 && remaining > 0) {
        warned1 = true;
        setTimeNotice("1 minute remaining — answers submit automatically at 00:00");
      }

      if (remaining === 0 && !fired) {
        fired = true;
        clearInterval(timer);
        void handleSubmit();
      }
    };

    tick();
    const timer = setInterval(tick, 500);
    return () => clearInterval(timer);
  }, [examReady, durationMinutes, handleSubmit]);

  useEffect(() => {
    if (!timeNotice) return;
    const timeout = window.setTimeout(() => setTimeNotice(""), 5000);
    return () => window.clearTimeout(timeout);
  }, [timeNotice]);

  // Warn before refresh / close while the exam is running.
  useEffect(() => {
    if (!examReady || submitting) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [examReady, submitting]);

  const question = questions[currentQuestion];

  // The question on screen counts as visited.
  useEffect(() => {
    if (!question) return;
    setVisited((previous) => (previous[question.id] ? previous : { ...previous, [question.id]: true }));
  }, [question]);

  const statuses = useMemo<PaletteStatus[]>(
    () =>
      questions.map((item) => {
        const answered = Boolean(answers[item.id]);
        if (review[item.id]) return answered ? "answered-review" : "review";
        if (answered) return "answered";
        return visited[item.id] ? "not-answered" : "not-visited";
      }),
    [questions, answers, review, visited],
  );

  const counts = useMemo(() => {
    const answered = questions.filter((item) => answers[item.id]).length;
    return {
      answered,
      unanswered: questions.length - answered,
      review: questions.filter((item) => review[item.id]).length,
      notVisited: statuses.filter((status) => status === "not-visited").length,
    };
  }, [questions, answers, review, statuses]);

  const goTo = useCallback(
    (index: number) => {
      if (index >= 0 && index < questions.length) setCurrentQuestion(index);
    },
    [questions.length],
  );

  const selectOption = useCallback((questionId: string, optionId: string) => {
    setAnswers((previous) => ({ ...previous, [questionId]: optionId }));
  }, []);

  const clearResponse = useCallback(() => {
    if (!question) return;
    setAnswers((previous) => {
      const next = { ...previous };
      delete next[question.id];
      return next;
    });
  }, [question]);

  const toggleReview = useCallback(() => {
    if (!question) return;
    setReview((previous) => {
      const next = { ...previous };
      if (next[question.id]) delete next[question.id];
      else next[question.id] = true;
      return next;
    });
  }, [question]);

  const markAndNext = useCallback(() => {
    if (!question) return;
    setReview((previous) => ({ ...previous, [question.id]: true }));
    goTo(currentQuestion + 1);
  }, [question, goTo, currentQuestion]);

  // Keyboard: 1–9 / A–H choose, ←/→ move, M mark, Enter save & next.
  useEffect(() => {
    if (!examReady || !question) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select") || document.querySelector("[role='alertdialog'], [role='dialog']")) {
        return;
      }

      const key = event.key.toLowerCase();

      if (key === "arrowright") {
        event.preventDefault();
        goTo(currentQuestion + 1);
        return;
      }
      if (key === "arrowleft") {
        event.preventDefault();
        goTo(currentQuestion - 1);
        return;
      }
      if (key === "m") {
        event.preventDefault();
        toggleReview();
        return;
      }
      if (key === "enter" && !target?.closest("button, a")) {
        event.preventDefault();
        goTo(currentQuestion + 1);
        return;
      }

      if (key.length === 1) {
        const letterIndex = "abcdefgh".indexOf(key);
        const digit = Number(key);
        const index = letterIndex >= 0 ? letterIndex : Number.isInteger(digit) && digit >= 1 ? digit - 1 : -1;
        const option = question.options[index];
        if (option) {
          event.preventDefault();
          selectOption(question.id, option.id);
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [examReady, question, currentQuestion, goTo, toggleReview, selectOption]);

  const totalSeconds = (durationMinutes ?? 30) * 60;
  const candidateName = candidate.status === "user" ? candidate.name : "Candidate";

  // ---------------------------------------------------------------
  // Loading / error
  // ---------------------------------------------------------------
  if (loading || loadError || questions.length === 0) {
    return (
      <ExamShell
        eyebrow="Assessment"
        title={paperTitle}
        onExit={() => router.push(`/practice/assessment/${assessmentId}`)}
      >
        <div className="flex min-h-full flex-col items-center justify-center gap-4 px-6 py-24 text-center">
          {loading ? (
            <>
              <span className="h-10 w-10 animate-spin rounded-full border-2 border-rule border-t-ink" />
              <p className="font-serif text-xl italic text-ink-soft">Distributing question papers…</p>
            </>
          ) : (
            <>
              <AlertTriangle size={28} className="text-exam-red" />
              <p className="font-serif text-2xl">{loadError || "No questions are available for this paper."}</p>
              <Link
                href="/practice/assessment"
                className="mt-2 rounded-md bg-ink px-5 py-3 text-sm font-semibold text-white"
              >
                Back to assessments
              </Link>
            </>
          )}
        </div>
      </ExamShell>
    );
  }

  const isLast = currentQuestion === questions.length - 1;
  const selected = answers[question.id];
  const flagged = Boolean(review[question.id]);

  return (
    <ExamShell
      eyebrow={`Assessment · ${meta?.difficulty ?? ""}`}
      title={paperTitle}
      exitLabel="Quit"
      onExit={() => setConfirmQuit(true)}
      center={<ExamClock secondsLeft={secondsLeft} totalSeconds={totalSeconds} />}
      right={
        <span className="hidden items-center gap-2 rounded-md border border-white/15 px-2.5 py-1.5 text-xs text-white/80 lg:flex">
          <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-white font-serif text-[11px] font-bold text-ink">
            {candidateName.charAt(0).toUpperCase()}
          </span>
          <span className="max-w-[120px] truncate">{candidateName}</span>
        </span>
      }
    >
      {/* Mobile clock */}
      <div className="sticky top-0 z-10 flex justify-center bg-ink py-2 md:hidden">
        <ExamClock secondsLeft={secondsLeft} totalSeconds={totalSeconds} />
      </div>

      {timeNotice && (
        <div role="alert" className="ql-palette-in fixed left-1/2 top-20 z-[90] -translate-x-1/2 rounded-md border border-exam-amber bg-[#fff4df] px-4 py-2.5 text-sm font-semibold text-[#7a4a00] shadow-lg">
          ⏱ {timeNotice}
        </div>
      )}

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:py-8">
        {/* Question sheet */}
        <section className="ql-sheet flex min-h-[520px] flex-col overflow-hidden rounded-xl border border-rule">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-rule px-5 py-3.5 sm:px-8">
            <p className="font-serif text-lg font-semibold">
              Question {currentQuestion + 1}
              <span className="text-ink-soft"> of {questions.length}</span>
            </p>
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-exam-blue">{question.topic}</span>
            <span className="ml-auto flex items-center gap-2 text-xs">
              <span className="rounded-sm bg-exam-green/10 px-2 py-1 font-semibold text-exam-green">+{question.marks} marks</span>
              <span className="hidden rounded-sm bg-paper px-2 py-1 text-ink-soft sm:inline">No negative marking</span>
            </span>
          </div>

          <div key={question.id} className="ql-enter flex-1 px-5 py-7 sm:px-8" style={{ animationDuration: "0.3s" }}>
            {flagged && (
              <p className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-exam-violet/10 px-3 py-1 text-xs font-semibold text-exam-violet">
                <Bookmark size={12} className="fill-current" />
                Marked for review
              </p>
            )}
            <h2 className="font-serif text-[1.55rem] font-medium leading-[1.35] sm:text-[1.85rem]">{question.question}</h2>

            <div role="radiogroup" aria-label="Answer options" className="mt-8 space-y-3">
              {question.options.map((option, index) => (
                <OmrOption
                  key={option.id}
                  letter={option.id}
                  text={option.text}
                  state={selected === option.id ? "selected" : "idle"}
                  shortcut={String(index + 1)}
                  onSelect={() => selectOption(question.id, option.id)}
                />
              ))}
            </div>
          </div>

          {/* CBT action bar */}
          <div className="flex flex-wrap items-center gap-2 border-t border-rule bg-paper/60 px-4 py-3.5 sm:px-6">
            <button
              type="button"
              onClick={markAndNext}
              className="inline-flex items-center gap-1.5 rounded-md bg-exam-violet px-3.5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#5826c9] sm:text-sm"
            >
              <Bookmark size={14} />
              Mark for review{isLast ? "" : " & next"}
            </button>
            <button
              type="button"
              onClick={clearResponse}
              disabled={!selected}
              className="inline-flex items-center gap-1.5 rounded-md border border-rule bg-white px-3.5 py-2.5 text-xs font-semibold text-ink transition-colors hover:border-ink/40 disabled:opacity-40 sm:text-sm"
            >
              <Eraser size={14} />
              Clear
            </button>

            <div className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={() => goTo(currentQuestion - 1)}
                disabled={currentQuestion === 0}
                aria-label="Previous question"
                className="inline-flex items-center gap-1.5 rounded-md border border-rule bg-white px-3.5 py-2.5 text-xs font-semibold text-ink transition-colors hover:border-ink/40 disabled:opacity-40 sm:text-sm"
              >
                <ArrowLeft size={14} />
                <span className="hidden sm:inline">Previous</span>
              </button>
              {isLast ? (
                <button
                  type="button"
                  onClick={() => setConfirmSubmit(true)}
                  className="inline-flex items-center gap-1.5 rounded-md bg-exam-green px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#086637] sm:text-sm"
                >
                  <Send size={14} />
                  Review &amp; submit
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => goTo(currentQuestion + 1)}
                  className="inline-flex items-center gap-1.5 rounded-md bg-ink px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-black sm:text-sm"
                >
                  Save &amp; next
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Palette panel */}
        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div className="ql-sheet rounded-xl border border-rule p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft">Question palette</h3>
              <span className="font-mono text-xs text-ink-soft">
                {counts.answered}/{questions.length}
              </span>
            </div>
            <ExamPalette statuses={statuses} current={currentQuestion} onSelect={goTo} />
          </div>

          {submitError && (
            <p className="flex items-start gap-2 rounded-md border border-exam-red/30 bg-[#fbecec] px-3 py-2.5 text-sm text-exam-red">
              <AlertTriangle size={15} className="mt-0.5 shrink-0" />
              {submitError}
            </p>
          )}

          <button
            type="button"
            onClick={() => setConfirmSubmit(true)}
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-md border-2 border-ink bg-sheet px-5 py-3.5 text-sm font-bold text-ink shadow-[4px_4px_0_var(--color-ink)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_var(--color-ink)] disabled:opacity-60"
          >
            <Send size={15} />
            {submitting ? "Submitting…" : "Submit exam"}
          </button>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmSubmit}
        title="Submit your paper?"
        confirmLabel={submitting ? "Submitting…" : "Yes, submit"}
        cancelLabel="Back to exam"
        busy={submitting}
        onConfirm={() => void handleSubmit()}
        onCancel={() => setConfirmSubmit(false)}
      >
        <table className="w-full text-left text-sm">
          <tbody className="divide-y divide-rule">
            <SummaryRow label="Answered" value={counts.answered} tone="text-exam-green" />
            <SummaryRow label="Not answered" value={counts.unanswered} tone="text-exam-red" />
            <SummaryRow label="Marked for review" value={counts.review} tone="text-exam-violet" />
            <SummaryRow label="Not visited" value={counts.notVisited} tone="text-ink-soft" />
          </tbody>
        </table>
        <p className="mt-4">
          You have <strong className="text-ink">{Math.floor(secondsLeft / 60)} min {secondsLeft % 60} s</strong>{" "}
          left. Once submitted, answers can&apos;t be changed.
        </p>
      </ConfirmDialog>

      <ConfirmDialog
        open={confirmQuit}
        title="Quit this exam?"
        confirmLabel="Quit without submitting"
        cancelLabel="Return to exam"
        tone="danger"
        onConfirm={() => {
          setConfirmQuit(false);
          submittingRef.current = true; // stop auto-submit while leaving
          router.push(`/practice/assessment/${assessmentId}`);
        }}
        onCancel={() => setConfirmQuit(false)}
      >
        Your {counts.answered} answer{counts.answered === 1 ? "" : "s"} will be discarded and no result
        will be produced.
      </ConfirmDialog>
    </ExamShell>
  );
}

function SummaryRow({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <tr>
      <td className="py-2 text-ink">{label}</td>
      <td className={`py-2 text-right font-serif text-lg font-semibold tabular-nums ${tone}`}>{value}</td>
    </tr>
  );
}
