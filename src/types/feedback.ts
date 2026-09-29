export type FeedbackCategory =
  | "bug"
  | "feature"
  | "content"
  | "ai_response"
  | "general"
  | "support";

export type FeedbackStatus =
  | "open"
  | "in_progress"
  | "resolved"
  | "closed";

export type FeedbackPriority =
  | "low"
  | "medium"
  | "high"
  | "critical";

export type FeedbackAttachment = {
  url: string;
  name: string;
  type: string;
  size?: number;
};

export type Feedback = {
  id: string;
  user_id: string;

  category: FeedbackCategory;
  title: string;
  description: string;

  page_url: string | null;
  feature: string | null;

  browser: string | null;
  device: string | null;
  operating_system: string | null;

  error_id: string | null;

  attachments: FeedbackAttachment[] | null;

  status: FeedbackStatus;
  priority: FeedbackPriority;

  admin_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type FeedbackFormData = {
  category: FeedbackCategory;
  title: string;
  description: string;
  feature?: string;
  page_url?: string;
  error_id?: string;
  attachments?: FeedbackAttachment[];
};