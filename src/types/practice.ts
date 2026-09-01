export type PracticeDifficulty =
  | "easy"
  | "medium"
  | "difficult";

export interface PracticeQuestion {
  id: string;

  chapterNumber: number;
  chapterSlug: string;
  chapterTitle: string;

  topic: string;

  difficulty: PracticeDifficulty;

  question: string;

  options: string[];

  correctAnswer: number;

  explanation: string;

  createdAt: string;
  updatedAt: string;
}