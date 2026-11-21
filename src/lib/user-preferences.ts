import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase-server";

/*
 * Reads the signed-in user's own preferences (Settings > Learning /
 * AI Tutor) from account_settings. Defaults match the Settings page.
 * Before this, those tabs saved values that nothing read.
 */

type SupabaseServerClient = Awaited<
  ReturnType<typeof createSupabaseServerClient>
>;

export type AiTutorPreferences = {
  response_style: "concise" | "balanced" | "detailed";
  show_follow_up_suggestions: boolean;
};

export type LearningPreferences = {
  daily_goal_minutes: number;
  preferred_difficulty: "adaptive" | "easy" | "medium" | "hard";
  show_completed_lessons: boolean;
};

const DEFAULT_AI: AiTutorPreferences = {
  response_style: "balanced",
  show_follow_up_suggestions: true,
};

const DEFAULT_LEARNING: LearningPreferences = {
  daily_goal_minutes: 30,
  preferred_difficulty: "adaptive",
  show_completed_lessons: true,
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

async function loadSettingsRow(
  supabase: SupabaseServerClient,
  userId: string,
) {
  const { data, error } = await supabase
    .from("account_settings")
    .select("learning_preferences, ai_tutor_preferences")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[USER_PREFERENCES]", error);
  }

  return data;
}

export async function getAiTutorPreferences(
  supabase: SupabaseServerClient,
  userId: string,
): Promise<AiTutorPreferences> {
  const row = await loadSettingsRow(supabase, userId);
  const raw = asRecord(row?.ai_tutor_preferences);

  return {
    response_style:
      raw.response_style === "concise" ||
      raw.response_style === "detailed" ||
      raw.response_style === "balanced"
        ? raw.response_style
        : DEFAULT_AI.response_style,
    show_follow_up_suggestions:
      typeof raw.show_follow_up_suggestions === "boolean"
        ? raw.show_follow_up_suggestions
        : DEFAULT_AI.show_follow_up_suggestions,
  };
}

export async function getLearningPreferences(
  supabase: SupabaseServerClient,
  userId: string,
): Promise<LearningPreferences> {
  const row = await loadSettingsRow(supabase, userId);
  const raw = asRecord(row?.learning_preferences);

  const difficulty = raw.preferred_difficulty;

  return {
    daily_goal_minutes:
      typeof raw.daily_goal_minutes === "number" &&
      raw.daily_goal_minutes > 0
        ? raw.daily_goal_minutes
        : DEFAULT_LEARNING.daily_goal_minutes,
    preferred_difficulty:
      difficulty === "easy" ||
      difficulty === "medium" ||
      difficulty === "hard" ||
      difficulty === "adaptive"
        ? difficulty
        : DEFAULT_LEARNING.preferred_difficulty,
    show_completed_lessons:
      typeof raw.show_completed_lessons === "boolean"
        ? raw.show_completed_lessons
        : DEFAULT_LEARNING.show_completed_lessons,
  };
}

// Extra system-prompt lines reflecting the learner's AI Tutor settings.
export function aiPreferencesInstruction(
  preferences: AiTutorPreferences,
): string {
  const style = {
    concise:
      "Keep answers short and direct: a few sentences, plus a formula or code only when essential.",
    balanced:
      "Give clear, moderately detailed answers with a short example when it helps.",
    detailed:
      "Give thorough, step-by-step explanations with worked examples and the relevant mathematics.",
  }[preferences.response_style];

  const followUps = preferences.show_follow_up_suggestions
    ? "End with one or two short suggestions for what to explore next."
    : "Do not add follow-up suggestions or 'next steps' at the end.";

  return [
    "Learner preferences (from their settings):",
    `- ${style}`,
    `- ${followUps}`,
  ].join("\n");
}
