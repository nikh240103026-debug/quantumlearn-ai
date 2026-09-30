// fixing deployemeny error
import "server-only";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export type AdminUser = {
  id: string;
  email: string | null;
  role: string;
  full_name: string | null;
  username: string | null;
  institute: string | null;
  branch: string | null;
  avatar_url: string | null;
};

export async function getAdminUser(): Promise<AdminUser | null> {
  const supabase =
    await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select(
      `
        id,
        role,
        full_name,
        username,
        institute,
        branch,
        avatar_url
      `,
    )
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error(
      "[ADMIN_AUTH] Failed to load administrator profile:",
      profileError,
    );

    return null;
  }

  if (!profile || profile.role !== "admin") {
    return null;
  }

  return {
    id: user.id,
    email: user.email ?? null,
    role: profile.role,
    full_name: profile.full_name ?? null,
    username: profile.username ?? null,
    institute: profile.institute ?? null,
    branch: profile.branch ?? null,
    avatar_url: profile.avatar_url ?? null,
  };
}

export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdminUser();

  if (!admin) {
    redirect("/login");
  }

  return admin;
}

/*
 * ---------------------------------------------------------------
 * API ADMIN AUTHORIZATION
 * ---------------------------------------------------------------
 *
 * `supabase`
 *   Authenticated user-scoped client.
 *   Used to establish who is making the request.
 *
 * `adminSupabase`
 *   Server-only service-role client.
 *   Used only after admin authorization succeeds.
 *
 * This prevents normal RLS policies from blocking legitimate
 * administrator-wide reads.
 */

export async function requireAdminApi(): Promise<{
  supabase: Awaited<
    ReturnType<typeof createSupabaseServerClient>
  >;
  adminSupabase: ReturnType<
    typeof createSupabaseAdminClient
  >;
  admin: AdminUser;
}> {
  const supabase =
    await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new AdminAuthorizationError(
      "Unauthorized",
      401,
    );
  }

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select(
      `
        id,
        role,
        full_name,
        username,
        institute,
        branch,
        avatar_url
      `,
    )
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error(
      "[ADMIN_AUTH_API] Failed to load administrator profile:",
      profileError,
    );

    throw new AdminAuthorizationError(
      "Unable to verify administrator access.",
      403,
    );
  }

  if (!profile || profile.role !== "admin") {
    throw new AdminAuthorizationError(
      "Forbidden",
      403,
    );
  }

  const adminSupabase =
    createSupabaseAdminClient();

  return {
    supabase,
    adminSupabase,
    admin: {
      id: user.id,
      email: user.email ?? null,
      role: profile.role,
      full_name: profile.full_name ?? null,
      username: profile.username ?? null,
      institute: profile.institute ?? null,
      branch: profile.branch ?? null,
      avatar_url: profile.avatar_url ?? null,
    },
  };
}

export class AdminAuthorizationError extends Error {
  status: 401 | 403;

  constructor(
    message: string,
    status: 401 | 403,
  ) {
    super(message);

    this.name =
      "AdminAuthorizationError";

    this.status = status;
  }
}

/*
 * ---------------------------------------------------------------
 * ADMIN AUDIT LOG
 * ---------------------------------------------------------------
 *
 * Audit logging intentionally uses the authenticated client
 * rather than blindly switching to service-role execution,
 * because the database function may rely on auth.uid().
 */

export async function writeAdminAuditLog({
  supabase,
  action,
  resourceType,
  resourceId,
  previousData,
  newData,
  metadata,
  ipAddress,
  userAgent,
}: {
  supabase: Awaited<
    ReturnType<typeof createSupabaseServerClient>
  >;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  previousData?: unknown;
  newData?: unknown;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  const { error } =
    await supabase.rpc(
      "write_admin_audit_log",
      {
        p_action: action,
        p_resource_type: resourceType,
        p_resource_id:
          resourceId ?? null,
        p_previous_data:
          previousData === undefined
            ? null
            : previousData,
        p_new_data:
          newData === undefined
            ? null
            : newData,
        p_metadata:
          metadata ?? {},
        p_ip_address:
          ipAddress ?? null,
        p_user_agent:
          userAgent ?? null,
      },
    );

  if (error) {
    console.error(
      "[ADMIN_AUDIT_LOG]",
      error,
    );

    throw new Error(
      "Unable to record admin audit event.",
    );
  }
}