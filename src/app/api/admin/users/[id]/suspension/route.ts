import { NextResponse, type NextRequest } from "next/server";

import { adminErrorResponse, requireAdminApi, writeAdminAuditLog } from "@/lib/admin";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Supabase has no "forever"; 100 years is the documented equivalent.
const INDEFINITE = "876000h";

/*
 * POST /api/admin/users/[id]/suspension  { suspended, reason? }
 *
 * The reason is kept in the admin audit log only; the user never sees it.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { supabase, adminSupabase, admin } = await requireAdminApi();
    const { id } = await params;
    const body = await request.json();

    if (!UUID.test(id) || typeof body?.suspended !== "boolean") {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const suspended: boolean = body.suspended;
    const reason = typeof body.reason === "string" ? body.reason.trim().slice(0, 500) : "";

    if (suspended && !reason) {
      return NextResponse.json({ error: "Please give a reason." }, { status: 400 });
    }

    if (id === admin.id) {
      return NextResponse.json({ error: "You cannot suspend your own account." }, { status: 400 });
    }

    const { data: profile, error: profileError } = await adminSupabase
      .from("profiles")
      .select("role")
      .eq("id", id)
      .maybeSingle();

    if (profileError) throw profileError;
    if (!profile) return NextResponse.json({ error: "User not found." }, { status: 404 });

    if (suspended && profile.role === "admin") {
      return NextResponse.json(
        { error: "Remove this user's admin role before suspending them." },
        { status: 400 },
      );
    }

    const { error } = await adminSupabase.auth.admin.updateUserById(id, {
      ban_duration: suspended ? INDEFINITE : "none",
    });

    if (error) throw error;

    let warning: string | null = null;

    if (suspended) {
      const { error: revokeError } = await adminSupabase.rpc("revoke_user_sessions", {
        p_user_id: id,
      });

      if (revokeError) {
        console.error("[ADMIN_SUSPEND] session revoke failed:", revokeError);
        warning =
          "Suspended, but their open sessions couldn't be ended. They may stay signed in for up to an hour.";
      }
    }

    await writeAdminAuditLog({
      supabase,
      action: suspended ? "user.suspended" : "user.unsuspended",
      resourceType: "user",
      resourceId: id,
      metadata: { changedBy: admin.id, ...(reason && { reason }) },
      ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      userAgent: request.headers.get("user-agent"),
    });

    return NextResponse.json({ suspended, warning });
  } catch (error) {
    return adminErrorResponse(error, "Unable to update the account.", "[ADMIN_SUSPEND]");
  }
}
