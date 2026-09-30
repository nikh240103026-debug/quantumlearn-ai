// fixing deployemeny error
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const MAX_PAGE_SIZE = 100;
const MAX_SEARCH_LENGTH = 100;

function errorResponse(
  message: string,
  status: number,
) {
  return NextResponse.json(
    { error: message },
    { status },
  );
}

function normalizeSlug(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function validateTitle(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, 200);
}

function validateDescription(
  value: unknown,
): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed ? trimmed.slice(0, 10000) : null;
}

function validateLevel(
  value: unknown,
): string {
  const allowed = new Set([
    "beginner",
    "basic",
    "intermediate",
    "advanced",
  ]);

  return typeof value === "string" &&
    allowed.has(value)
    ? value
    : "beginner";
}

function parseBoolean(
  value: unknown,
): boolean {
  return value === true;
}

async function requireAdmin() {
  const supabase =
    await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      supabase,
      user: null,
      unauthorized: true,
    };
  }

  const { data: adminResult, error } =
    await supabase.rpc("is_admin");

  if (error || adminResult !== true) {
    return {
      supabase,
      user,
      unauthorized: true,
    };
  }

  return {
    supabase,
    user,
    unauthorized: false,
  };
}

export async function GET(
  request: NextRequest,
) {
  const auth = await requireAdmin();

  if (auth.unauthorized) {
    return errorResponse(
      "Unauthorized.",
      403,
    );
  }

  const searchParams =
    request.nextUrl.searchParams;

  const rawPage =
    Number(searchParams.get("page") ?? "1");

  const rawPageSize =
    Number(
      searchParams.get("pageSize") ??
        "20",
    );

  const page =
    Number.isInteger(rawPage) &&
    rawPage > 0
      ? rawPage
      : 1;

  const pageSize =
    Number.isInteger(rawPageSize) &&
    rawPageSize > 0
      ? Math.min(
          rawPageSize,
          MAX_PAGE_SIZE,
        )
      : 20;

  const search =
    searchParams
      .get("search")
      ?.trim()
      .slice(0, MAX_SEARCH_LENGTH) ?? "";

  const publishedParam =
    searchParams.get("published");

  const lessonCountResult =
    await auth.supabase
      .from("lessons")
      .select(
        "course_id",
        { count: "exact", head: false },
      );

  if (lessonCountResult.error) {
    return errorResponse(
      "Unable to load lesson information.",
      500,
    );
  }

  const lessonCounts =
    new Map<string, number>();

  for (
    const lesson of
    lessonCountResult.data ?? []
  ) {
    if (!lesson.course_id) {
      continue;
    }

    lessonCounts.set(
      lesson.course_id,
      (lessonCounts.get(
        lesson.course_id,
      ) ?? 0) + 1,
    );
  }

  let query = auth.supabase
    .from("courses")
    .select(
      "id, title, slug, description, level, is_published, created_at, updated_at",
      { count: "exact" },
    );

  if (search) {
    const escapedSearch =
      search
        .replace(/[%_]/g, "\\$&")
        .replace(/,/g, " ");

    query = query.or(
      `title.ilike.%${escapedSearch}%,slug.ilike.%${escapedSearch}%`,
    );
  }

  if (
    publishedParam === "true" ||
    publishedParam === "false"
  ) {
    query = query.eq(
      "is_published",
      publishedParam === "true",
    );
  }

  const from =
    (page - 1) * pageSize;

  const to =
    from + pageSize - 1;

  const {
    data,
    error,
    count,
  } = await query
    .order("created_at", {
      ascending: false,
    })
    .range(from, to);

  if (error) {
    console.error(
      "Admin courses GET error:",
      error,
    );

    return errorResponse(
      "Unable to load courses.",
      500,
    );
  }

  const courses = (data ?? []).map(
    (course) => ({
      ...course,
      lesson_count:
        lessonCounts.get(course.id) ?? 0,
    }),
  );

  const total = count ?? 0;

  return NextResponse.json({
    courses,
    pagination: {
      page,
      pageSize,
      total,
      totalPages:
        total > 0
          ? Math.ceil(
              total / pageSize,
            )
          : 0,
    },
  });
}

export async function POST(
  request: NextRequest,
) {
  const auth = await requireAdmin();

  if (auth.unauthorized) {
    return errorResponse(
      "Unauthorized.",
      403,
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse(
      "Invalid JSON request.",
      400,
    );
  }

  if (
    !body ||
    typeof body !== "object"
  ) {
    return errorResponse(
      "Invalid request body.",
      400,
    );
  }

  const payload =
    body as Record<string, unknown>;

  const title =
    validateTitle(payload.title);

  const slug =
    normalizeSlug(payload.slug);

  if (!title) {
    return errorResponse(
      "Course title is required.",
      400,
    );
  }

  if (!slug) {
    return errorResponse(
      "Course slug is required.",
      400,
    );
  }

  if (
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
      slug,
    )
  ) {
    return errorResponse(
      "Invalid course slug.",
      400,
    );
  }

  const {
    data,
    error,
  } = await auth.supabase
    .from("courses")
    .insert({
      title,
      slug,
      description:
        validateDescription(
          payload.description,
        ),
      level:
        validateLevel(payload.level),
      is_published:
        parseBoolean(
          payload.isPublished,
        ),
    })
    .select(
      "id, title, slug, description, level, is_published, created_at, updated_at",
    )
    .single();

  if (error) {
    console.error(
      "Admin courses POST error:",
      error,
    );

    if (
      error.code === "23505"
    ) {
      return errorResponse(
        "A course with this slug already exists.",
        409,
      );
    }

    return errorResponse(
      "Unable to create course.",
      500,
    );
  }

  return NextResponse.json(
    {
      course: {
        ...data,
        lesson_count: 0,
      },
    },
    { status: 201 },
  );
}

export async function PATCH(
  request: NextRequest,
) {
  const auth = await requireAdmin();

  if (auth.unauthorized) {
    return errorResponse(
      "Unauthorized.",
      403,
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse(
      "Invalid JSON request.",
      400,
    );
  }

  if (
    !body ||
    typeof body !== "object"
  ) {
    return errorResponse(
      "Invalid request body.",
      400,
    );
  }

  const payload =
    body as Record<string, unknown>;

  const id =
    typeof payload.id === "string"
      ? payload.id.trim()
      : "";

  if (!id) {
    return errorResponse(
      "Course ID is required.",
      400,
    );
  }

  const title =
    validateTitle(payload.title);

  const slug =
    normalizeSlug(payload.slug);

  if (!title || !slug) {
    return errorResponse(
      "Course title and slug are required.",
      400,
    );
  }

  const {
    data,
    error,
  } = await auth.supabase
    .from("courses")
    .update({
      title,
      slug,
      description:
        validateDescription(
          payload.description,
        ),
      level:
        validateLevel(payload.level),
      is_published:
        parseBoolean(
          payload.isPublished,
        ),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(
      "id, title, slug, description, level, is_published, created_at, updated_at",
    )
    .maybeSingle();

  if (error) {
    console.error(
      "Admin courses PATCH error:",
      error,
    );

    if (
      error.code === "23505"
    ) {
      return errorResponse(
        "A course with this slug already exists.",
        409,
      );
    }

    return errorResponse(
      "Unable to update course.",
      500,
    );
  }

  if (!data) {
    return errorResponse(
      "Course not found.",
      404,
    );
  }

  const {
    count,
  } = await auth.supabase
    .from("lessons")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("course_id", id);

  return NextResponse.json({
    course: {
      ...data,
      lesson_count: count ?? 0,
    },
  });
}

export async function DELETE(
  request: NextRequest,
) {
  const auth = await requireAdmin();

  if (auth.unauthorized) {
    return errorResponse(
      "Unauthorized.",
      403,
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse(
      "Invalid JSON request.",
      400,
    );
  }

  if (
    !body ||
    typeof body !== "object"
  ) {
    return errorResponse(
      "Invalid request body.",
      400,
    );
  }

  const payload =
    body as Record<string, unknown>;

  const id =
    typeof payload.id === "string"
      ? payload.id.trim()
      : "";

  if (!id) {
    return errorResponse(
      "Course ID is required.",
      400,
    );
  }

  const {
    count,
    error: countError,
  } = await auth.supabase
    .from("lessons")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("course_id", id);

  if (countError) {
    console.error(
      "Admin courses lesson check error:",
      countError,
    );

    return errorResponse(
      "Unable to verify course dependencies.",
      500,
    );
  }

  if ((count ?? 0) > 0) {
    return errorResponse(
      "This course contains lessons and cannot be deleted.",
      409,
    );
  }

  const {
    error,
  } = await auth.supabase
    .from("courses")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(
      "Admin courses DELETE error:",
      error,
    );

    return errorResponse(
      "Unable to delete course.",
      500,
    );
  }

  return NextResponse.json({
    success: true,
  });
}