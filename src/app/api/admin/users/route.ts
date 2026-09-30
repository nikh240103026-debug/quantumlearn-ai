// fixing deployemeny error
import { NextRequest, NextResponse } from "next/server";
import {
  AdminAuthorizationError,
  requireAdminApi,
  writeAdminAuditLog,
} from "@/lib/admin";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

const ALLOWED_ROLES = [
  "student",
  "tutor",
  "researcher",
  "admin",
] as const;

type AllowedRole = (typeof ALLOWED_ROLES)[number];

type ProfileRow = {
  id: string;
  full_name: string | null;
  username: string | null;
  role: string;
  created_at: string | null;
  updated_at: string | null;
};

function isValidRole(value: unknown): value is AllowedRole {
  return (
    typeof value === "string" &&
    ALLOWED_ROLES.includes(value as AllowedRole)
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

export async function GET(request: NextRequest) {
  try {
    await requireAdminApi();

    const supabase = createSupabaseAdminClient();

    const searchParams = request.nextUrl.searchParams;

    const search = searchParams.get("search")?.trim() ?? "";
    const role = searchParams.get("role")?.trim() ?? "";

    const pageParam = Number(
      searchParams.get("page") ?? "1",
    );

    const pageSizeParam = Number(
      searchParams.get("pageSize") ?? "25",
    );

    const page =
      Number.isFinite(pageParam) && pageParam > 0
        ? Math.floor(pageParam)
        : 1;

    const pageSize =
      Number.isFinite(pageSizeParam) &&
      pageSizeParam > 0
        ? Math.min(Math.floor(pageSizeParam), 100)
        : 25;

    /*
     * ----------------------------------------------------------
     * LOAD PROFILES
     * ----------------------------------------------------------
     */

    let query = supabase
      .from("profiles")
      .select(
        `
          id,
          full_name,
          username,
          role,
          created_at,
          updated_at
        `,
        {
          count: "exact",
        },
      )
      .order("created_at", {
        ascending: false,
      });

    if (role && isValidRole(role)) {
      query = query.eq("role", role);
    }

    if (search) {
      const escapedSearch = search
        .replace(/[%_]/g, "\\$&")
        .replace(/,/g, "");

      query = query.or(
        `full_name.ilike.%${escapedSearch}%,username.ilike.%${escapedSearch}%`,
      );
    }

    const {
      data: profiles,
      count,
      error: profilesError,
    } = await query;

    if (profilesError) {
      console.error(
        "[ADMIN_USERS_GET_PROFILES]",
        profilesError,
      );

      return NextResponse.json(
        {
          error: "Unable to load user profiles.",
        },
        {
          status: 500,
        },
      );
    }

    const profileRows = (profiles ?? []) as ProfileRow[];

    /*
     * ----------------------------------------------------------
     * LOAD AUTH USERS
     *
     * Email belongs to auth.users, NOT profiles.
     * ----------------------------------------------------------
     */

    const authUsers: Array<{
      id: string;
      email?: string;
      user_metadata?: Record<string, unknown>;
      created_at?: string;
      last_sign_in_at?: string;
    }> = [];

    let authPage = 1;

    while (true) {
      const {
        data: authData,
        error: authError,
      } = await supabase.auth.admin.listUsers({
        page: authPage,
        perPage: 1000,
      });

      if (authError) {
        console.error(
          "[ADMIN_USERS_GET_AUTH]",
          authError,
        );

        return NextResponse.json(
          {
            error: "Unable to load authentication users.",
          },
          {
            status: 500,
          },
        );
      }

      authUsers.push(
        ...(authData.users ?? []).map((user) => ({
          id: user.id,
          email: user.email,
          user_metadata:
            user.user_metadata ?? {},
          created_at: user.created_at,
          last_sign_in_at:
            user.last_sign_in_at ?? undefined,
        })),
      );

      if (
        !authData.users ||
        authData.users.length < 1000
      ) {
        break;
      }

      authPage += 1;
    }

    const authMap = new Map(
      authUsers.map((user) => [
        user.id,
        user,
      ]),
    );

    /*
     * ----------------------------------------------------------
     * MERGE PROFILE + AUTH DATA
     * ----------------------------------------------------------
     */

    let users = profileRows.map((profile) => {
      const authUser = authMap.get(profile.id);

      return {
        id: profile.id,
        full_name: profile.full_name,
        username: profile.username,
        email: authUser?.email ?? null,
        role: profile.role,
        created_at:
          profile.created_at ??
          authUser?.created_at ??
          null,
        updated_at: profile.updated_at,
        last_sign_in_at:
          authUser?.last_sign_in_at ?? null,
      };
    });

    /*
     * ----------------------------------------------------------
     * SEARCH EMAIL TOO
     * ----------------------------------------------------------
     */

    if (search) {
      const normalizedSearch =
        search.toLowerCase();

      users = users.filter((user) => {
        return (
          user.full_name
            ?.toLowerCase()
            .includes(normalizedSearch) ||
          user.username
            ?.toLowerCase()
            .includes(normalizedSearch) ||
          user.email
            ?.toLowerCase()
            .includes(normalizedSearch)
        );
      });
    }

    /*
     * ----------------------------------------------------------
     * PAGINATION
     * ----------------------------------------------------------
     */

    const total = users.length;

    const from =
      (page - 1) * pageSize;

    const paginatedUsers = users.slice(
      from,
      from + pageSize,
    );

    return NextResponse.json({
      users: paginatedUsers,
      pagination: {
        page,
        pageSize,
        total,
        totalPages:
          total === 0
            ? 0
            : Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    if (
      error instanceof AdminAuthorizationError
    ) {
      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: error.status,
        },
      );
    }

    console.error(
      "[ADMIN_USERS_GET]",
      error,
    );

    return NextResponse.json(
      {
        error: "Internal server error.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PATCH(
  request: NextRequest,
) {
  try {
    const { supabase, admin } =
      await requireAdminApi();

    const body = await request.json();

    const userId =
      typeof body.userId === "string"
        ? body.userId.trim()
        : "";

    const nextRole = body.role;

    if (!userId) {
      return NextResponse.json(
        {
          error: "User ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!isValidRole(nextRole)) {
      return NextResponse.json(
        {
          error: "Invalid role.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      userId === admin.id &&
      nextRole !== "admin"
    ) {
      return NextResponse.json(
        {
          error:
            "You cannot remove your own admin role.",
        },
        {
          status: 400,
        },
      );
    }

    const {
      data: existingUser,
      error: existingUserError,
    } = await supabase
      .from("profiles")
      .select(
        `
          id,
          full_name,
          username,
          role,
          created_at,
          updated_at
        `,
      )
      .eq("id", userId)
      .maybeSingle();

    if (existingUserError) {
      console.error(
        "[ADMIN_USERS_PATCH_LOOKUP]",
        existingUserError,
      );

      return NextResponse.json(
        {
          error: "Unable to find the user.",
        },
        {
          status: 500,
        },
      );
    }

    if (!existingUser) {
      return NextResponse.json(
        {
          error: "User not found.",
        },
        {
          status: 404,
        },
      );
    }

    if (existingUser.role === nextRole) {
      return NextResponse.json({
        user: existingUser,
        changed: false,
      });
    }

    const {
      data: updatedUser,
      error: updateError,
    } = await supabase
      .from("profiles")
      .update({
        role: nextRole,
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", userId)
      .select(
        `
          id,
          full_name,
          username,
          role,
          created_at,
          updated_at
        `,
      )
      .single();

    if (updateError) {
      console.error(
        "[ADMIN_USERS_PATCH_UPDATE]",
        updateError,
      );

      return NextResponse.json(
        {
          error: "Unable to update user role.",
        },
        {
          status: 500,
        },
      );
    }

    await writeAdminAuditLog({
      supabase,
      action: "user.role_changed",
      resourceType: "user",
      resourceId: userId,
      previousData: {
        role: existingUser.role,
      },
      newData: {
        role: updatedUser.role,
      },
      metadata: {
        changedBy: admin.id,
      },
      ipAddress:
        request.headers
          .get("x-forwarded-for")
          ?.split(",")[0]
          ?.trim() ?? null,
      userAgent:
        request.headers.get("user-agent") ??
        null,
    });

    return NextResponse.json({
      user: updatedUser,
      changed: true,
    });
  } catch (error) {
    if (
      error instanceof AdminAuthorizationError
    ) {
      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: error.status,
        },
      );
    }

    console.error(
      "[ADMIN_USERS_PATCH]",
      error,
    );

    return NextResponse.json(
      {
        error: getErrorMessage(error),
      },
      {
        status: 500,
      },
    );
  }
}