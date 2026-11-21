import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase-admin";

/*
 * Applies each author's Privacy setting (Settings > Privacy >
 * profile_visibility) before profiles are shown to other users.
 *
 * The settings page defaults to "private", so only authors who chose
 * "public" show their bio, institute, branch and level to others.
 * Name, username, avatar and role stay visible so community posts are
 * still attributable. The viewer always sees their own full profile.
 */

const PRIVATE_FIELDS = [
  "bio",
  "branch",
  "institute",
  "learning_level",
  "quantum_experience",
] as const;

type ProfileRow = {
  id: string;
  [key: string]: unknown;
};

export async function applyProfilePrivacy<T extends ProfileRow>(
  profiles: T[],
  viewerId: string,
): Promise<T[]> {
  const otherIds = profiles
    .map((profile) => profile.id)
    .filter((id) => id !== viewerId);

  if (otherIds.length === 0) {
    return profiles;
  }

  const publicIds = new Set<string>();
  // Settings > Privacy > "Show username" turned off.
  const hiddenUsernameIds = new Set<string>();

  try {
    // Other users' settings rows aren't readable through the viewer's
    // own session, so read just the visibility flag with the service role.
    const { data, error } = await createSupabaseAdminClient()
      .from("account_settings")
      .select("user_id, privacy_settings")
      .in("user_id", otherIds);

    if (error) {
      console.error("[PROFILE_PRIVACY] settings lookup failed:", error);
    }

    for (const row of data ?? []) {
      const settings = row.privacy_settings as
        | { profile_visibility?: unknown; show_username?: unknown }
        | null;

      if (settings?.profile_visibility === "public") {
        publicIds.add(String(row.user_id));
      }

      if (settings?.show_username === false) {
        hiddenUsernameIds.add(String(row.user_id));
      }
    }
  } catch (error) {
    // Fail private: hide details rather than expose them.
    console.error("[PROFILE_PRIVACY] settings lookup failed:", error);
  }

  return profiles.map((profile) => {
    if (profile.id === viewerId) {
      return profile;
    }

    const redacted: ProfileRow = { ...profile };

    if (!publicIds.has(profile.id)) {
      for (const field of PRIVATE_FIELDS) {
        if (field in redacted) {
          redacted[field] = null;
        }
      }
    }

    if (
      hiddenUsernameIds.has(profile.id) &&
      "username" in redacted
    ) {
      redacted.username = null;
    }

    return redacted as T;
  });
}
