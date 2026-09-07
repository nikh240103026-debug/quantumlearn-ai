import { assessments } from "@/data/assessments";
import { Assessment } from "@/types/assessment";

export function getAllAssessments(): Assessment[] {
  return assessments;
}

export function getAssessmentById(
  id: string
): Assessment | undefined {
  return assessments.find(
    (assessment) => assessment.id === id
  );
}

export function getAssessmentsByDifficulty(
  difficulty: Assessment["difficulty"]
): Assessment[] {
  return assessments.filter(
    (assessment) => assessment.difficulty === difficulty
  );
}

export function getTotalAssessmentCount(): number {
  return assessments.length;
}

export function getTotalQuestions(): number {
  return assessments.reduce(
    (total, assessment) => total + assessment.questions,
    0
  );
}

export function getTotalDuration(): number {
  return assessments.reduce(
    (total, assessment) => total + assessment.duration,
    0
  );
}