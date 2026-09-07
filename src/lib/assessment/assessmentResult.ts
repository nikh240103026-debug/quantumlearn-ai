import { AssessmentResult } from "@/types/assessment";

interface CalculateAssessmentResultParams {
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  skippedAnswers: number;
  totalMarks: number;
  passingMarks: number;
  timeTaken: number;
}

export function calculateAssessmentResult({
  totalQuestions,
  correctAnswers,
  wrongAnswers,
  skippedAnswers,
  totalMarks,
  passingMarks,
  timeTaken,
}: CalculateAssessmentResultParams): AssessmentResult & {
  timeTaken: number;
} {
  const score = Math.round(
    (correctAnswers / totalQuestions) * totalMarks
  );

  const accuracy = Math.round(
    (correctAnswers / totalQuestions) * 100
  );

  const passed = score >= passingMarks;

  let feedback = "";

  if (accuracy >= 90) {
    feedback =
      "Outstanding performance! You have an excellent understanding of the concepts.";
  } else if (accuracy >= 75) {
    feedback =
      "Great job! Revise a few weak areas to achieve mastery.";
  } else if (accuracy >= 60) {
    feedback =
      "Good effort. Review the topics you answered incorrectly before attempting the next assessment.";
  } else {
    feedback =
      "You should revisit the learning modules and practice quizzes before retaking this assessment.";
  }

  return {
    score,
    totalMarks,
    correctAnswers,
    wrongAnswers,
    skippedAnswers,
    accuracy,
    passed,
    feedback,
    timeTaken,
  };
}