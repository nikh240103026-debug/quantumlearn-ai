export interface AssessmentOption {
  id: string;
  text: string;
}

export interface AssessmentQuestion {
  id: string;
  assessmentId: string;

  question: string;

  options: AssessmentOption[];

  correctAnswer: string;

  explanation: string;

  marks: number;

  difficulty:
    | "Easy"
    | "Medium"
    | "Hard";

  topic: string;
}

export interface UserAnswer {
  questionId: string;
  selectedOption: string;
}

export interface AssessmentSession {
  assessmentId: string;

  answers: UserAnswer[];

  startedAt: string;

  remainingTime: number;

  submitted: boolean;
}