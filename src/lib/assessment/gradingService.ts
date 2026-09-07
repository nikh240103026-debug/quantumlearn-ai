import { getQuestionsByAssessmentId } from "./questionService";

export interface AssessmentGrade {
  score: number;
  totalMarks: number;
  correctAnswers: number;
  wrongAnswers: number;
  skippedAnswers: number;
  accuracy: number;
  passed: boolean;
}

export function gradeAssessment(
  assessmentId: string,
  answers: Record<string, string>,
  passingMarks: number = 50
): AssessmentGrade {
  const questions = getQuestionsByAssessmentId(assessmentId);

  let score = 0;
  let correctAnswers = 0;
  let wrongAnswers = 0;
  let skippedAnswers = 0;

  const totalMarks = questions.reduce(
    (sum, question) => sum + question.marks,
    0
  );

  questions.forEach((question) => {
    const answer = answers[question.id];

    if (!answer) {
      skippedAnswers++;
      return;
    }

    if (answer === question.correctAnswer) {
      correctAnswers++;
      score += question.marks;
    } else {
      wrongAnswers++;
    }
  });

  const accuracy =
    questions.length === 0
      ? 0
      : Math.round((correctAnswers / questions.length) * 100);

  const percentage =
    totalMarks === 0
      ? 0
      : (score / totalMarks) * 100;

  return {
    score,
    totalMarks,
    correctAnswers,
    wrongAnswers,
    skippedAnswers,
    accuracy,
    passed: percentage >= passingMarks,
  };
}