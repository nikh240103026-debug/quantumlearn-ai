export type AssessmentDifficulty =
  | "Beginner"
  | "Intermediate"
  | "Advanced";

export interface Assessment {
  id: string;
  title: string;
  description: string;
  difficulty: AssessmentDifficulty;
  duration: number;
  questions: number;
  passingMarks: number;
  totalMarks: number;
  topics: string[];
}

export interface AssessmentAttempt {
  id: string;
  assessmentId: string;
  userId: string;
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  skippedAnswers: number;
  totalQuestions: number;
  accuracy: number;
  timeTaken: number;
  passed: boolean;
  submittedAt: string;
}

export interface AssessmentResult {
  score: number;
  totalMarks: number;
  correctAnswers: number;
  wrongAnswers: number;
  skippedAnswers: number;
  accuracy: number;
  passed: boolean;
  feedback: string;
}