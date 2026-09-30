import { NextRequest, NextResponse } from "next/server";
import {
  AdminAuthorizationError,
  requireAdminApi,
  writeAdminAuditLog,
} from "@/lib/admin";

export const dynamic = "force-dynamic";

const MAX_TITLE_LENGTH = 160;
const MAX_SLUG_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 5000;
const MAX_CONTENT_LENGTH = 500000;

function cleanString(
  value: unknown,
  maxLength: number,
): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
}

function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_SLUG_LENGTH);
}

function parsePositiveInteger(
  value: unknown,
): number | null {
  const number = Number(value);

  if (
    !Number.isInteger(number) ||
    number < 1 ||
    number > 100000
  ) {
    return null;
  }

  return number;
}

function parseDuration(
  value: unknown,
): number | null {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const number = Number(value);

  if (
    !Number.isInteger(number) ||
    number < 1 ||
    number > 1440
  ) {
    return null;
  }

  return number;
}

function errorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Internal server error.";
}

function getClientMetadata(
  request: NextRequest,
) {
  return {
    ipAddress:
      request.headers
        .get("x-forwarded-for")
        ?.split(",")[0]
        ?.trim() ?? null,

    userAgent:
      request.headers.get("user-agent") ??
      null,
  };
}

export async function GET(
  request: NextRequest,
) {
  try {
    const { supabase } =
      await requireAdminApi();

    const params =
      request.nextUrl.searchParams;

    const search =
      params.get("search")?.trim() ?? "";

    const courseId =
      params.get("courseId")?.trim() ?? "";

    const published =
      params.get("published");

    const pageValue = Number(
      params.get("page") ?? "1",
    );

    const pageSizeValue = Number(
      params.get("pageSize") ?? "25",
    );

    const page =
      Number.isInteger(pageValue) &&
      pageValue > 0
        ? pageValue
        : 1;

    const pageSize =
      Number.isInteger(pageSizeValue) &&
      pageSizeValue > 0
        ? Math.min(pageSizeValue, 100)
        : 25;

    const from =
      (page - 1) * pageSize;

    const to =
      from + pageSize - 1;

    let query = supabase
      .from("lessons")
      .select(
        `
          id,
          course_id,
          title,
          slug,
          description,
          content,
          order_index,
          duration_minutes,
          is_published,
          created_at,
          updated_at,
          courses (
            id,
            title,
            slug
          )
        `,
        {
          count: "exact",
        },
      )
      .order("course_id", {
        ascending: true,
      })
      .order("order_index", {
        ascending: true,
      })
      .range(from, to);

    if (courseId) {
      query = query.eq(
        "course_id",
        courseId,
      );
    }

    if (
      published === "true"
    ) {
      query = query.eq(
        "is_published",
        true,
      );
    }

    if (
      published === "false"
    ) {
      query = query.eq(
        "is_published",
        false,
      );
    }

    if (search) {
      const safeSearch = search
        .replace(/[%_]/g, "\\$")
        .replace(/,/g, "");

      query = query.or(
        `title.ilike.%${safeSearch}%,slug.ilike.%${safeSearch}%,description.ilike.%${safeSearch}%`,
      );
    }

    const {
      data,
      count,
      error,
    } = await query;

    if (error) {
      console.error(
        "[ADMIN_LESSONS_GET]",
        error,
      );

      return NextResponse.json(
        {
          error:
            "Unable to load lessons.",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      lessons: data ?? [],
      pagination: {
        page,
        pageSize,
        total: count ?? 0,
        totalPages: Math.ceil(
          (count ?? 0) / pageSize,
        ),
      },
    });
  } catch (error) {
    if (
      error instanceof
      AdminAuthorizationError
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
      "[ADMIN_LESSONS_GET]",
      error,
    );

    return NextResponse.json(
      {
        error: errorMessage(error),
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(
  request: NextRequest,
) {
  try {
    const {
      supabase,
      admin,
    } = await requireAdminApi();

    const body = await request.json();

    const courseId = cleanString(
      body.courseId,
      100,
    );

    const title = cleanString(
      body.title,
      MAX_TITLE_LENGTH,
    );

    const suppliedSlug = cleanString(
      body.slug,
      MAX_SLUG_LENGTH,
    );

    const slug = normalizeSlug(
      suppliedSlug || title,
    );

    const description =
      cleanString(
        body.description,
        MAX_DESCRIPTION_LENGTH,
      );

    const content =
      cleanString(
        body.content,
        MAX_CONTENT_LENGTH,
      );

    const orderIndex =
      parsePositiveInteger(
        body.orderIndex,
      );

    const durationMinutes =
      parseDuration(
        body.durationMinutes,
      );

    const isPublished =
      body.isPublished === true;

    if (!courseId) {
      return NextResponse.json(
        {
          error:
            "Course is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!title) {
      return NextResponse.json(
        {
          error:
            "Lesson title is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!slug) {
      return NextResponse.json(
        {
          error:
            "A valid lesson slug is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (orderIndex === null) {
      return NextResponse.json(
        {
          error:
            "A valid lesson order is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      body.durationMinutes !==
        undefined &&
      body.durationMinutes !== null &&
      body.durationMinutes !== "" &&
      durationMinutes === null
    ) {
      return NextResponse.json(
        {
          error:
            "Duration must be between 1 and 1440 minutes.",
        },
        {
          status: 400,
        },
      );
    }

    const {
      data: course,
      error: courseError,
    } = await supabase
      .from("courses")
      .select(
        "id, title, slug, is_published",
      )
      .eq("id", courseId)
      .maybeSingle();

    if (courseError) {
      console.error(
        "[ADMIN_LESSONS_POST_COURSE]",
        courseError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to validate course.",
        },
        {
          status: 500,
        },
      );
    }

    if (!course) {
      return NextResponse.json(
        {
          error:
            "Selected course does not exist.",
        },
        {
          status: 404,
        },
      );
    }

    const {
      data: duplicateSlug,
    } = await supabase
      .from("lessons")
      .select("id")
      .eq("course_id", courseId)
      .eq("slug", slug)
      .maybeSingle();

    if (duplicateSlug) {
      return NextResponse.json(
        {
          error:
            "A lesson with this slug already exists in this course.",
        },
        {
          status: 409,
        },
      );
    }

    const {
      data: duplicateOrder,
    } = await supabase
      .from("lessons")
      .select("id")
      .eq("course_id", courseId)
      .eq(
        "order_index",
        orderIndex,
      )
      .maybeSingle();

    if (duplicateOrder) {
      return NextResponse.json(
        {
          error:
            "This lesson order is already used in the selected course.",
        },
        {
          status: 409,
        },
      );
    }

    const {
      data: lesson,
      error,
    } = await supabase
      .from("lessons")
      .insert({
        course_id: courseId,
        title,
        slug,
        description:
          description || null,
        content: content || null,
        order_index: orderIndex,
        duration_minutes:
          durationMinutes,
        is_published:
          isPublished,
      })
      .select(
        `
          id,
          course_id,
          title,
          slug,
          description,
          content,
          order_index,
          duration_minutes,
          is_published,
          created_at,
          updated_at
        `,
      )
      .single();

    if (error) {
      console.error(
        "[ADMIN_LESSONS_POST]",
        error,
      );

      return NextResponse.json(
        {
          error:
            "Unable to create lesson.",
        },
        {
          status: 500,
        },
      );
    }

    await writeAdminAuditLog({
      supabase,
      action: "lesson.created",
      resourceType: "lesson",
      resourceId: lesson.id,
      newData: lesson,
      metadata: {
        adminUserId: admin.id,
        courseId,
      },
      ...getClientMetadata(request),
    });

    return NextResponse.json(
      {
        lesson,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    if (
      error instanceof
      AdminAuthorizationError
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
      "[ADMIN_LESSONS_POST]",
      error,
    );

    return NextResponse.json(
      {
        error: errorMessage(error),
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
    const {
      supabase,
      admin,
    } = await requireAdminApi();

    const body = await request.json();

    const id = cleanString(
      body.id,
      100,
    );

    if (!id) {
      return NextResponse.json(
        {
          error:
            "Lesson ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const {
      data: previousLesson,
      error: lookupError,
    } = await supabase
      .from("lessons")
      .select(
        `
          id,
          course_id,
          title,
          slug,
          description,
          content,
          order_index,
          duration_minutes,
          is_published,
          created_at,
          updated_at
        `,
      )
      .eq("id", id)
      .maybeSingle();

    if (lookupError) {
      console.error(
        "[ADMIN_LESSONS_PATCH_LOOKUP]",
        lookupError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to find lesson.",
        },
        {
          status: 500,
        },
      );
    }

    if (!previousLesson) {
      return NextResponse.json(
        {
          error:
            "Lesson not found.",
        },
        {
          status: 404,
        },
      );
    }

    const updates: Record<
      string,
      unknown
    > = {};

    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "courseId",
      )
    ) {
      const courseId = cleanString(
        body.courseId,
        100,
      );

      if (!courseId) {
        return NextResponse.json(
          {
            error:
              "Course is required.",
          },
          {
            status: 400,
          },
        );
      }

      const {
        data: course,
      } = await supabase
        .from("courses")
        .select("id")
        .eq("id", courseId)
        .maybeSingle();

      if (!course) {
        return NextResponse.json(
          {
            error:
              "Selected course does not exist.",
          },
          {
            status: 404,
          },
        );
      }

      updates.course_id =
        courseId;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "title",
      )
    ) {
      const title = cleanString(
        body.title,
        MAX_TITLE_LENGTH,
      );

      if (!title) {
        return NextResponse.json(
          {
            error:
              "Lesson title cannot be empty.",
          },
          {
            status: 400,
          },
        );
      }

      updates.title = title;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "slug",
      )
    ) {
      const slug =
        normalizeSlug(
          cleanString(
            body.slug,
            MAX_SLUG_LENGTH,
          ),
        );

      if (!slug) {
        return NextResponse.json(
          {
            error:
              "Lesson slug cannot be empty.",
          },
          {
            status: 400,
          },
        );
      }

      updates.slug = slug;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "description",
      )
    ) {
      updates.description =
        cleanString(
          body.description,
          MAX_DESCRIPTION_LENGTH,
        ) || null;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "content",
      )
    ) {
      updates.content =
        cleanString(
          body.content,
          MAX_CONTENT_LENGTH,
        ) || null;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "orderIndex",
      )
    ) {
      const orderIndex =
        parsePositiveInteger(
          body.orderIndex,
        );

      if (orderIndex === null) {
        return NextResponse.json(
          {
            error:
              "Lesson order must be a positive integer.",
          },
          {
            status: 400,
          },
        );
      }

      updates.order_index =
        orderIndex;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "durationMinutes",
      )
    ) {
      if (
        body.durationMinutes ===
          null ||
        body.durationMinutes === ""
      ) {
        updates.duration_minutes =
          null;
      } else {
        const duration =
          parseDuration(
            body.durationMinutes,
          );

        if (duration === null) {
          return NextResponse.json(
            {
              error:
                "Duration must be between 1 and 1440 minutes.",
            },
            {
              status: 400,
            },
          );
        }

        updates.duration_minutes =
          duration;
      }
    }

    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "isPublished",
      )
    ) {
      if (
        typeof body.isPublished !==
        "boolean"
      ) {
        return NextResponse.json(
          {
            error:
              "isPublished must be a boolean.",
          },
          {
            status: 400,
          },
        );
      }

      updates.is_published =
        body.isPublished;
    }

    const nextCourseId =
      (updates.course_id as
        | string
        | undefined) ??
      previousLesson.course_id;

    const nextSlug =
      (updates.slug as
        | string
        | undefined) ??
      previousLesson.slug;

    const nextOrder =
      (updates.order_index as
        | number
        | undefined) ??
      previousLesson.order_index;

    const {
      data: duplicateSlug,
    } = await supabase
      .from("lessons")
      .select("id")
      .eq(
        "course_id",
        nextCourseId,
      )
      .eq("slug", nextSlug)
      .neq("id", id)
      .maybeSingle();

    if (duplicateSlug) {
      return NextResponse.json(
        {
          error:
            "Another lesson already uses this slug in the selected course.",
        },
        {
          status: 409,
        },
      );
    }

    const {
      data: duplicateOrder,
    } = await supabase
      .from("lessons")
      .select("id")
      .eq(
        "course_id",
        nextCourseId,
      )
      .eq(
        "order_index",
        nextOrder,
      )
      .neq("id", id)
      .maybeSingle();

    if (duplicateOrder) {
      return NextResponse.json(
        {
          error:
            "Another lesson already uses this order in the selected course.",
        },
        {
          status: 409,
        },
      );
    }

    if (
      Object.keys(updates).length ===
      0
    ) {
      return NextResponse.json(
        {
          error:
            "No valid changes supplied.",
        },
        {
          status: 400,
        },
      );
    }

    const {
      data: lesson,
      error,
    } = await supabase
      .from("lessons")
      .update(updates)
      .eq("id", id)
      .select(
        `
          id,
          course_id,
          title,
          slug,
          description,
          content,
          order_index,
          duration_minutes,
          is_published,
          created_at,
          updated_at
        `,
      )
      .single();

    if (error) {
      console.error(
        "[ADMIN_LESSONS_PATCH]",
        error,
      );

      return NextResponse.json(
        {
          error:
            "Unable to update lesson.",
        },
        {
          status: 500,
        },
      );
    }

    await writeAdminAuditLog({
      supabase,
      action: "lesson.updated",
      resourceType: "lesson",
      resourceId: id,
      previousData:
        previousLesson,
      newData: lesson,
      metadata: {
        adminUserId: admin.id,
      },
      ...getClientMetadata(request),
    });

    return NextResponse.json({
      lesson,
    });
  } catch (error) {
    if (
      error instanceof
      AdminAuthorizationError
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
      "[ADMIN_LESSONS_PATCH]",
      error,
    );

    return NextResponse.json(
      {
        error: errorMessage(error),
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(
  request: NextRequest,
) {
  try {
    const {
      supabase,
      admin,
    } = await requireAdminApi();

    const body = await request.json();

    const id = cleanString(
      body.id,
      100,
    );

    if (!id) {
      return NextResponse.json(
        {
          error:
            "Lesson ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const {
      data: lesson,
      error: lookupError,
    } = await supabase
      .from("lessons")
      .select(
        `
          id,
          course_id,
          title,
          slug,
          description,
          order_index,
          is_published
        `,
      )
      .eq("id", id)
      .maybeSingle();

    if (lookupError) {
      console.error(
        "[ADMIN_LESSONS_DELETE_LOOKUP]",
        lookupError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to find lesson.",
        },
        {
          status: 500,
        },
      );
    }

    if (!lesson) {
      return NextResponse.json(
        {
          error:
            "Lesson not found.",
        },
        {
          status: 404,
        },
      );
    }

    const {
      count: progressCount,
      error: progressError,
    } = await supabase
      .from("user_progress")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("lesson_id", id);

    if (progressError) {
      console.error(
        "[ADMIN_LESSONS_DELETE_PROGRESS]",
        progressError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to verify lesson dependencies.",
        },
        {
          status: 500,
        },
      );
    }

    if (
      (progressCount ?? 0) > 0
    ) {
      return NextResponse.json(
        {
          error:
            "This lesson has learner progress and cannot be deleted. Unpublish it instead.",
          dependencyCount:
            progressCount ?? 0,
        },
        {
          status: 409,
        },
      );
    }

    const {
      count: practiceCount,
    } = await supabase
      .from("practice_results")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq(
        "lesson_slug",
        lesson.slug,
      );

    if (
      (practiceCount ?? 0) > 0
    ) {
      return NextResponse.json(
        {
          error:
            "This lesson has practice history and cannot be deleted. Unpublish it instead.",
          dependencyCount:
            practiceCount ?? 0,
        },
        {
          status: 409,
        },
      );
    }

    const { error } =
      await supabase
        .from("lessons")
        .delete()
        .eq("id", id);

    if (error) {
      console.error(
        "[ADMIN_LESSONS_DELETE]",
        error,
      );

      return NextResponse.json(
        {
          error:
            "Unable to delete lesson.",
        },
        {
          status: 500,
        },
      );
    }

    await writeAdminAuditLog({
      supabase,
      action: "lesson.deleted",
      resourceType: "lesson",
      resourceId: id,
      previousData: lesson,
      metadata: {
        adminUserId: admin.id,
      },
      ...getClientMetadata(request),
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    if (
      error instanceof
      AdminAuthorizationError
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
      "[ADMIN_LESSONS_DELETE]",
      error,
    );

    return NextResponse.json(
      {
        error: errorMessage(error),
      },
      {
        status: 500,
      },
    );
  }
}