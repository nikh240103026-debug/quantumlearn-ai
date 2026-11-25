import { NextResponse, type NextRequest } from "next/server";

import { adminErrorResponse, requireAdminApi, writeAdminAuditLog } from "@/lib/admin";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: NextRequest) {
  try {
    const { adminSupabase } = await requireAdminApi();

    const requested = Number(request.nextUrl.searchParams.get("page"));
    const page = Number.isInteger(requested) && requested > 0 ? requested : 1;
    const resolved = request.nextUrl.searchParams.get("status") === "resolved";
    const dayAgo = new Date(Date.now() - 86_400_000).toISOString();

    const base = adminSupabase.from("app_errors").select("*", { count: "exact" });
    const filtered = resolved
      ? base.not("resolved_at", "is", null)
      : base.is("resolved_at", null);

    const [list, open, recent] = await Promise.all([
      filtered
        .order("last_seen", { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1),
      adminSupabase
        .from("app_errors")
        .select("id", { count: "exact" })
        .is("resolved_at", null)
        .limit(1),
      adminSupabase
        .from("app_errors")
        .select("id", { count: "exact" })
        .gte("last_seen", dayAgo)
        .limit(1),
    ]);

    const failure = list.error ?? open.error ?? recent.error;

    if (failure) {
      // Table missing: the migration hasn't been run yet.
      if (failure.code === "PGRST205" || failure.code === "42P01") {
        return NextResponse.json(
          { error: "Error monitoring isn't set up yet. Run the app_errors migration in Supabase." },
          { status: 503 },
        );
      }

      throw failure;
    }

    return NextResponse.json({
      errors: list.data ?? [],
      open: open.count ?? 0,
      lastDay: recent.count ?? 0,
      page,
      totalPages: Math.max(1, Math.ceil((list.count ?? 0) / PAGE_SIZE)),
    });
  } catch (error) {
    return adminErrorResponse(error, "Unable to load errors.", "[ADMIN_ERRORS]");
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { supabase, adminSupabase } = await requireAdminApi();
    const body = await request.json();

    if (typeof body?.id !== "string" || !UUID.test(body.id) || typeof body.resolved !== "boolean") {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const { data, error } = await adminSupabase
      .from("app_errors")
      .update({ resolved_at: body.resolved ? new Date().toISOString() : null })
      .eq("id", body.id)
      .select("id")
      .maybeSingle();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Error not found." }, { status: 404 });

    await writeAdminAuditLog({
      supabase,
      action: body.resolved ? "app_error.resolved" : "app_error.reopened",
      resourceType: "app_error",
      resourceId: body.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return adminErrorResponse(error, "Unable to update the error.", "[ADMIN_ERRORS]");
  }
}
