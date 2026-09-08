import { assessmentQuestions } from "@/data/assessmentQuestion";
import { AssessmentQuestion } from "@/types/assessmentQuestion";

export function getQuestionsByAssessmentId(
  assessmentId: string
): AssessmentQuestion[] {
  return assessmentQuestions.filter(
    (question) => question.assessmentId === assessmentId
  );
}

export function getQuestionById(
  questionId: string
): AssessmentQuestion | undefined {
  return assessmentQuestions.find(
    (question) => question.id === questionId
  );
}

export function getQuestionCount(
  assessmentId: string
): number {
  return assessmentQuestions.filter(
    (question) => question.assessmentId === assessmentId
  ).length;
}

export function getTotalMarks(
  assessmentId: string
): number {
  return assessmentQuestions
    .filter(
      (question) => question.assessmentId === assessmentId
    )
    .reduce(
      (total, question) => total + question.marks,
      0
    );
}

export function getQuestionsByTopic(
  assessmentId: string,
  topic: string
): AssessmentQuestion[] {
  return assessmentQuestions.filter(
    (question) =>
      question.assessmentId === assessmentId &&
      question.topic === topic
  );
}

export function getQuestionsByDifficulty(
  assessmentId: string,
  difficulty: "Easy" | "Medium" | "Hard"
): AssessmentQuestion[] {
  return assessmentQuestions.filter(
    (question) =>
      question.assessmentId === assessmentId &&
      question.difficulty === difficulty
  );
}