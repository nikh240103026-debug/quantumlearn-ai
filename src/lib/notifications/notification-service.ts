import type { SupabaseClient } from "@supabase/supabase-js";

export type NotificationType =
  | "question_answered"
  | "comment_reply"
  | "achievement"
  | "course_completion"
  | "practice_result"
  | "new_challenge"
  | "system"
  | "security";

export type NotificationPreferences = {
  question_replies: boolean;
  learning_reminders: boolean;
  achievements: boolean;
  course_completion: boolean;
  practice_results: boolean;
  new_challenges: boolean;
  platform_announcements: boolean;
  security_alerts: boolean;
  email_updates: boolean;
  ai_tutor_updates: boolean;
};

const defaultNotificationPreferences: NotificationPreferences = {
  question_replies: true,
  learning_reminders: true,
  achievements: true,
  course_completion: true,
  practice_results: true,
  new_challenges: true,
  platform_announcements: true,
  security_alerts: true,
  email_updates: true,
  ai_tutor_updates: true,
};

const preferenceKeyByType: Record<
  NotificationType,
  keyof NotificationPreferences
> = {
  question_answered: "question_replies",
  comment_reply: "question_replies",
  achievement: "achievements",
  course_completion: "course_completion",
  practice_result: "practice_results",
  new_challenge: "new_challenges",
  system: "platform_announcements",
  security: "security_alerts",
};

export type CreateNotificationInput = {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  href?: string | null;
};

export async function createNotification(
  supabase: SupabaseClient,
  input: CreateNotificationInput,
) {
  if (!input.userId) {
    return {
      created: false,
      skipped: true,
      reason: "missing_user_id",
    } as const;
  }

  const { data: settings, error: settingsError } =
    await supabase
      .from("account_settings")
      .select("notification_preferences")
      .eq("user_id", input.userId)
      .maybeSingle();

  if (settingsError) {
    console.error(
      "[NOTIFICATION SETTINGS]",
      settingsError,
    );

    return {
      created: false,
      skipped: false,
      error: "Unable to check notification preferences.",
    } as const;
  }

  const preferences: NotificationPreferences = {
    ...defaultNotificationPreferences,
    ...(isRecord(settings?.notification_preferences)
      ? settings.notification_preferences
      : {}),
  };

  const preferenceKey = preferenceKeyByType[input.type];

  /*
   * Security notifications are important account events.
   * They remain enabled unless the security preference is
   * explicitly disabled.
   */
  if (!preferences[preferenceKey]) {
    return {
      created: false,
      skipped: true,
      reason: "notification_disabled",
    } as const;
  }

  const { data, error } = await supabase
    .from("dashboard_notifications")
    .insert({
      user_id: input.userId,
      title: input.title.trim(),
      message: input.message.trim(),
      type: input.type,
      href: input.href ?? null,
      is_read: false,
      read_at: null,
    })
    .select(
      "id, user_id, title, message, type, href, is_read, created_at, read_at",
    )
    .single();

  if (error) {
    console.error(
      "[NOTIFICATION CREATE]",
      error,
    );

    return {
      created: false,
      skipped: false,
      error: "Unable to create notification.",
    } as const;
  }

  return {
    created: true,
    skipped: false,
    notification: data,
  } as const;
}

export async function createNotifications(
  supabase: SupabaseClient,
  inputs: CreateNotificationInput[],
) {
  const results = [];

  for (const input of inputs) {
    results.push(
      await createNotification(supabase, input),
    );
  }

  return results;
}

function isRecord(
  value: unknown,
): value is Record<string, boolean> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}