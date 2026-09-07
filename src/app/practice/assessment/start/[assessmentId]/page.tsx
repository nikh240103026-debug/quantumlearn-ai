"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { getQuestionsByAssessmentId } from "@/lib/assessment/questionService";
import { gradeAssessment } from "@/lib/assessment/gradingService";

import AssessmentQuestion from "@/components/practice/assessment/AssessmentQuestion";
import AssessmentNavigation from "@/components/practice/assessment/AssessmentNavigation";
import AssessmentTimer from "@/components/practice/assessment/AssessmentTimer";
import QuestionPalette from "@/components/practice/assessment/QuestionPalette";

export default function StartAssessmentPage() {
  const router = useRouter();
  const params = useParams();

  const assessmentId = params.assessmentId as string;

  const questions = useMemo(
    () => getQuestionsByAssessmentId(assessmentId),
    [assessmentId]
  );

  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [answers, setAnswers] = useState<Record<string, string>>({});

  if (questions.length === 0) {
    return (
      <div className="p-10 text-center">
        No questions available.
      </div>
    );
  }

  const question = questions[currentQuestion];

  function handleSelectOption(
    questionId: string,
    optionId: string
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

  function handleSubmit() {
    const result = gradeAssessment(
      assessmentId,
      answers,
      50
    );

    const params = new URLSearchParams({
      score: result.score.toString(),
      totalMarks: result.totalMarks.toString(),
      correct: result.correctAnswers.toString(),
      wrong: result.wrongAnswers.toString(),
      skipped: result.skippedAnswers.toString(),
      accuracy: result.accuracy.toString(),
      passed: result.passed.toString(),
    });

    router.push(
      `/practice/assessment/result?${params.toString()}`
    );
  }

  return (
    <main className="grid gap-8 lg:grid-cols-4">
      <div className="space-y-6 lg:col-span-1">
        <AssessmentTimer
          initialTime={30 * 60}
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
          onSubmit={handleSubmit}
        />
      </div>
    </main>
  );
}