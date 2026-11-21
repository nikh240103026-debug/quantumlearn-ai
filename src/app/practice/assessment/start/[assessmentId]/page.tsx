"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import type { PublicAssessmentQuestion } from "@/types/assessmentQuestion";

import AssessmentQuestion from "@/components/practice/assessment/AssessmentQuestion";
import AssessmentNavigation from "@/components/practice/assessment/AssessmentNavigation";
import AssessmentTimer from "@/components/practice/assessment/AssessmentTimer";
import QuestionPalette from "@/components/practice/assessment/QuestionPalette";

/*
 * Questions come from the API without the answer key, and grading
 * happens on the server (POST /api/assessment/[id]/submit), so the
 * correct answers are never part of the browser bundle.
 */
export default function StartAssessmentPage() {
  const router = useRouter();
  const params = useParams();

  const assessmentId = params.assessmentId as string;

  const [questions, setQuestions] = useState<PublicAssessmentQuestion[]>([]);
  const [durationMinutes, setDurationMinutes] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [answers, setAnswers] = useState<Record<string, string>>({});

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Ref guard: the timer and the Submit button can both fire before a
  // state update lands, which would submit twice.
  const submittingRef = useRef(false);

  // Latest answers for the timer's auto-submit.
  const answersRef = useRef(answers);

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
          fetch(
            `/api/assessment/${encodeURIComponent(assessmentId)}/questions`,
          ),
        ]);

        const assessmentData = await assessmentResponse.json().catch(() => ({}));
        const questionsData = await questionsResponse.json().catch(() => ({}));

        if (!assessmentResponse.ok || !questionsResponse.ok) {
          throw new Error(
            questionsData.message ||
              assessmentData.message ||
              "Unable to load this assessment.",
          );
        }

        if (!cancelled) {
          setQuestions(
            Array.isArray(questionsData.data) ? questionsData.data : [],
          );
          setDurationMinutes(Number(assessmentData.data?.duration) || 30);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Unable to load this assessment.",
          );
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
      const response = await fetch(
        `/api/assessment/${encodeURIComponent(assessmentId)}/submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: answersRef.current }),
        },
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.data) {
        throw new Error(
          data.message || "Your assessment could not be submitted.",
        );
      }

      const result = data.data;

      const resultParams = new URLSearchParams({
        score: String(result.score),
        totalMarks: String(result.totalMarks),
        correct: String(result.correctAnswers),
        wrong: String(result.wrongAnswers),
        skipped: String(result.skippedAnswers),
        accuracy: String(result.accuracy),
        passed: String(result.passed),
      });

      router.push(
        `/practice/assessment/result?${resultParams.toString()}`,
      );
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Your assessment could not be submitted.",
      );

      // Allow a retry.
      submittingRef.current = false;
      setSubmitting(false);
    }
  }, [assessmentId, router]);

  if (loading) {
    return (
      <div className="p-10 text-center">
        Loading assessment...
      </div>
    );
  }

  if (loadError || questions.length === 0) {
    return (
      <div className="p-10 text-center">
        {loadError || "No questions available."}
      </div>
    );
  }

  const question = questions[currentQuestion];

  function handleSelectOption(
    questionId: string,
    optionId: string,
  ) {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  }

  function handlePrevious() {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  }

  function handleNext() {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  }

  function handleQuestionSelect(index: number) {
    setCurrentQuestion(index);
  }

  return (
    <main className="grid gap-8 lg:grid-cols-4">
      <div className="space-y-6 lg:col-span-1">
        <AssessmentTimer
          initialTime={(durationMinutes ?? 30) * 60}
          onTimeUp={handleSubmit}
        />

        <QuestionPalette
          totalQuestions={questions.length}
          currentQuestion={currentQuestion}
          answers={answers}
          questionIds={questions.map((q) => q.id)}
          onQuestionSelect={handleQuestionSelect}
        />
      </div>

      <div className="lg:col-span-3">
        <AssessmentQuestion
          question={question}
          questionNumber={currentQuestion + 1}
          totalQuestions={questions.length}
          selectedOption={answers[question.id]}
          onSelectOption={handleSelectOption}
        />

        <AssessmentNavigation
          currentQuestion={currentQuestion}
          totalQuestions={questions.length}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onSubmit={() => {
            void handleSubmit();
          }}
        />

        {submitting && (
          <p className="mt-4 text-sm text-gray-500">
            Submitting...
          </p>
        )}

        {submitError && (
          <p className="mt-4 text-sm text-red-600">
            {submitError}
          </p>
        )}
      </div>
    </main>
  );
}
