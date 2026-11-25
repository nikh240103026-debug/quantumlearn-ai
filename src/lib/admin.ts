// fixing deployemeny error
import "server-only";

import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

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

/*
 * Administrators who turned on two-factor sign-in must have used it for
 * this session. The session's level is only read after getUser() has
 * verified the token with Supabase.
 */
export async function needsSecondFactor(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  factors: { status: string }[] | undefined,
): Promise<boolean> {
  if (!factors?.some((factor) => factor.status === "verified")) {
    return false;
  }

  const { data } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  return data?.currentLevel !== "aal2";
}

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

  if (await needsSecondFactor(supabase, user.factors)) {
    redirect("/two-factor?next=/admin");
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

  if (await needsSecondFactor(supabase, user.factors)) {
    throw new AdminAuthorizationError(
      "Two-factor sign-in is required.",
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

/*
 * Map an error from an admin API handler to a response:
 *   - 401/403 for missing or non-admin sessions (not a 500)
 *   - 400 for an unparseable JSON body
 *   - otherwise a generic 500; details stay in the server log
 */
export function adminErrorResponse(
  error: unknown,
  fallbackMessage: string,
  logLabel = "[ADMIN_API]",
): NextResponse {
  if (error instanceof AdminAuthorizationError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  }

  if (error instanceof SyntaxError) {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  // Deliberate validation errors thrown with { status: 400 }.
  if (
    error instanceof Error &&
    (error as Error & { status?: unknown }).status === 400
  ) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 },
    );
  }

  console.error(logLabel, error);

  return NextResponse.json(
    { error: fallbackMessage },
    { status: 500 },
  );
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
    // Every caller writes the audit entry AFTER the change has been
    // committed. Throwing here reported a successful change as a 500,
    // and the admin's retry then failed (duplicate slug / 404).
    // Log loudly instead; the change itself already happened.
    console.error(
      "[ADMIN_AUDIT_LOG] FAILED to record audit event:",
      { action, resourceType, resourceId },
      error,
    );

    return false;
  }

  return true;
}