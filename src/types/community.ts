export type CommunityProfile = {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  branch: string | null;
  institute: string | null;
  role: string | null;
  learning_level: string | null;
  quantum_experience: string | null;
};

export type CommunityQuestion = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  topic: string | null;

  attachment_url: string | null;
  attachment_type: string | null;
  circuit_data: Record<string, unknown> | unknown[] | string | null;
  code: string | null;

  status: string;
  view_count: number;
  answer_count: number;
  accepted_answer_id: string | null;

  created_at: string;
  updated_at: string;

  author: CommunityProfile | null;

  vote_count: number;
  has_voted: boolean;
  is_following: boolean;
};

export type CommunityAnswer = {
  id: string;
  question_id: string;
  user_id: string;
  body: string;

  is_accepted: boolean;

  created_at: string;
  updated_at: string;

  author: CommunityProfile | null;

  vote_count: number;
  has_voted: boolean;
};

export type CommunityQuestionListItem =
  CommunityQuestion;

export type CommunityAnswerListItem =
  CommunityAnswer;