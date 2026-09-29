export type PracticeReportReason =
  | "wrong_answer"
  | "ambiguous_question"
  | "incorrect_explanation"
  | "typo"
  | "too_difficult"
  | "other";

export type PracticeReportStatus =
  | "open"
  | "reviewing"
  | "resolved"
  | "dismissed";

export interface PracticeQuestionReport {
  id: string;
  user_id: string;
  question_id: string;
  practice_result_id: string | null;
  reason: PracticeReportReason;
  description: string | null;
  page_url: string | null;
  status: PracticeReportStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePracticeQuestionReportInput {
  question_id: string;
  practice_result_id?: string | null;
  reason: PracticeReportReason;
  description?: string | null;
  page_url?: string | null;
}