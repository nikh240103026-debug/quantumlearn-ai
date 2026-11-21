import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { fetchAllPages } from "@/lib/supabase-batch";

import {
  createNotification,
  type CreateNotificationInput,
  type NotificationPreferences,
  type NotificationType,
} from "./notification-service";

/*
 * Server-side notification delivery.
 *
 * The notification service existed (and respects each user's
 * Settings > Notifications toggles) but nothing ever called it, so the
 * toggles had no effect and the bell never showed anything.
 *
 * Uses the service-role client because notifications are often for
 * OTHER users (e.g. "someone answered your question"). Delivery never
 * throws: a failed notification must not fail the action behind it.
 */

export async function notify(
  input: CreateNotificationInput,
): Promise<void> {
  try {
    const result = await createNotification(
      createSupabaseAdminClient(),
      input,
    );

    if ("error" in result && result.error) {
      console.error("[NOTIFY]", input.type, result.error);
    }
  } catch (error) {
    console.error("[NOTIFY]", input.type, error);
  }
}

const PREFERENCE_BY_TYPE: Record<
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

export type BroadcastAudience =
  | "all"
  | "students"
  | "tutors"
  | "admins";

const ROLE_BY_AUDIENCE: Record<
  Exclude<BroadcastAudience, "all">,
  string
> = {
  students: "student",
  tutors: "tutor",
  admins: "admin",
};

/*
 * Sends one notification to every user in `audience` who hasn't turned
 * off this kind of notification. Inserts in batches.
 * Returns the number of notifications created.
 */
export async function broadcastNotification(input: {
  title: string;
  message: string;
  type: NotificationType;
  audience: BroadcastAudience;
  href?: string | null;
}): Promise<number> {
  const admin = createSupabaseAdminClient();

  const { data: users, error: usersError } = await fetchAllPages<{
    id: string;
  }>((from, to) => {
    let query = admin.from("profiles").select("id").order("id");

    if (input.audience !== "all") {
      query = query.eq("role", ROLE_BY_AUDIENCE[input.audience]);
    }

    return query.range(from, to);
  });

  if (usersError) {
    throw usersError;
  }

  const userIds = users.map((user) => user.id);

  if (userIds.length === 0) {
    return 0;
  }

  // Users who switched this notification type off.
  const preferenceKey = PREFERENCE_BY_TYPE[input.type];
  const optedOut = new Set<string>();

  const { data: settings, error: settingsError } =
    await fetchAllPages<{
      user_id: string;
      notification_preferences: Record<string, unknown> | null;
    }>((from, to) =>
      admin
        .from("account_settings")
        .select("user_id, notification_preferences")
        .order("user_id")
        .range(from, to),
    );

  if (settingsError) {
    throw settingsError;
  }

  for (const row of settings) {
    if (row.notification_preferences?.[preferenceKey] === false) {
      optedOut.add(String(row.user_id));
    }
  }

  const rows = userIds
    .filter((id) => !optedOut.has(id))
    .map((userId) => ({
      user_id: userId,
      title: input.title.trim(),
      message: input.message.trim(),
      type: input.type,
      href: input.href ?? null,
      is_read: false,
      read_at: null,
    }));

  for (let i = 0; i < rows.length; i += 500) {
    const { error } = await admin
      .from("dashboard_notifications")
      .insert(rows.slice(i, i + 500));

    if (error) {
      throw error;
    }
  }

  return rows.length;
}
