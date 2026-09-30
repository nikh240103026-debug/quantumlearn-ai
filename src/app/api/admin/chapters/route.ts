// fixing deployemeny error
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

    const lessonId =
      params.get("lessonId")?.trim() ?? "";

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
      .from("chapters")
      .select(
        `
          id,
          lesson_id,
          title,
          slug,
          description,
          content,
          order_index,
          is_published,
          created_at,
          updated_at,
          lessons (
            id,
            title,
            slug,
            course_id
          )
        `,
        {
          count: "exact",
        },
      )
      .order("lesson_id", {
        ascending: true,
      })
      .order("order_index", {
        ascending: true,
      })
      .range(from, to);

    if (lessonId) {
      query = query.eq(
        "lesson_id",
        lessonId,
      );
    }

    if (published === "true") {
      query = query.eq(
        "is_published",
        true,
      );
    }

    if (published === "false") {
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
        "[ADMIN_CHAPTERS_GET]",
        error,
      );

      return NextResponse.json(
        {
          error:
            "Unable to load chapters.",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      chapters: data ?? [],
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
      "[ADMIN_CHAPTERS_GET]",
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

    const lessonId = cleanString(
      body.lessonId,
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

    const isPublished =
      body.isPublished === true;

    if (!lessonId) {
      return NextResponse.json(
        {
          error:
            "Lesson is required.",
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
            "Chapter title is required.",
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
            "A valid chapter slug is required.",
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
            "A valid chapter order is required.",
        },
        {
          status: 400,
        },
      );
    }

    const {
      data: lesson,
      error: lessonError,
    } = await supabase
      .from("lessons")
      .select(
        "id, title, slug, course_id, is_published",
      )
      .eq("id", lessonId)
      .maybeSingle();

    if (lessonError) {
      console.error(
        "[ADMIN_CHAPTERS_POST_LESSON]",
        lessonError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to validate lesson.",
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
            "Selected lesson does not exist.",
        },
        {
          status: 404,
        },
      );
    }

    const {
      data: duplicateSlug,
    } = await supabase
      .from("chapters")
      .select("id")
      .eq("lesson_id", lessonId)
      .eq("slug", slug)
      .maybeSingle();

    if (duplicateSlug) {
      return NextResponse.json(
        {
          error:
            "A chapter with this slug already exists in this lesson.",
        },
        {
          status: 409,
        },
      );
    }

    const {
      data: duplicateOrder,
    } = await supabase
      .from("chapters")
      .select("id")
      .eq("lesson_id", lessonId)
      .eq(
        "order_index",
        orderIndex,
      )
      .maybeSingle();

    if (duplicateOrder) {
      return NextResponse.json(
        {
          error:
            "This chapter order is already used in the selected lesson.",
        },
        {
          status: 409,
        },
      );
    }

    const {
      data: chapter,
      error,
    } = await supabase
      .from("chapters")
      .insert({
        lesson_id: lessonId,
        title,
        slug,
        description:
          description || null,
        content: content || null,
        order_index: orderIndex,
        is_published:
          isPublished,
      })
      .select(
        `
          id,
          lesson_id,
          title,
          slug,
          description,
          content,
          order_index,
          is_published,
          created_at,
          updated_at
        `,
      )
      .single();

    if (error) {
      console.error(
        "[ADMIN_CHAPTERS_POST]",
        error,
      );

      return NextResponse.json(
        {
          error:
            "Unable to create chapter.",
        },
        {
          status: 500,
        },
      );
    }

    await writeAdminAuditLog({
      supabase,
      action: "chapter.created",
      resourceType: "chapter",
      resourceId: chapter.id,
      newData: chapter,
      metadata: {
        adminUserId: admin.id,
        lessonId,
      },
      ...getClientMetadata(request),
    });

    return NextResponse.json(
      {
        chapter,
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
      "[ADMIN_CHAPTERS_POST]",
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
            "Chapter ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const {
      data: previousChapter,
      error: lookupError,
    } = await supabase
      .from("chapters")
      .select(
        `
          id,
          lesson_id,
          title,
          slug,
          description,
          content,
          order_index,
          is_published,
          created_at,
          updated_at
        `,
      )
      .eq("id", id)
      .maybeSingle();

    if (lookupError) {
      console.error(
        "[ADMIN_CHAPTERS_PATCH_LOOKUP]",
        lookupError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to find chapter.",
        },
        {
          status: 500,
        },
      );
    }

    if (!previousChapter) {
      return NextResponse.json(
        {
          error:
            "Chapter not found.",
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
        "lessonId",
      )
    ) {
      const lessonId = cleanString(
        body.lessonId,
        100,
      );

      if (!lessonId) {
        return NextResponse.json(
          {
            error:
              "Lesson is required.",
          },
          {
            status: 400,
          },
        );
      }

      const {
        data: lesson,
      } = await supabase
        .from("lessons")
        .select("id")
        .eq("id", lessonId)
        .maybeSingle();

      if (!lesson) {
        return NextResponse.json(
          {
            error:
              "Selected lesson does not exist.",
          },
          {
            status: 404,
          },
        );
      }

      updates.lesson_id =
        lessonId;
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
              "Chapter title cannot be empty.",
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
              "Chapter slug cannot be empty.",
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
              "Chapter order must be a positive integer.",
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

    const nextLessonId =
      (updates.lesson_id as
        | string
        | undefined) ??
      previousChapter.lesson_id;

    const nextSlug =
      (updates.slug as
        | string
        | undefined) ??
      previousChapter.slug;

    const nextOrder =
      (updates.order_index as
        | number
        | undefined) ??
      previousChapter.order_index;

    const {
      data: duplicateSlug,
    } = await supabase
      .from("chapters")
      .select("id")
      .eq(
        "lesson_id",
        nextLessonId,
      )
      .eq("slug", nextSlug)
      .neq("id", id)
      .maybeSingle();

    if (duplicateSlug) {
      return NextResponse.json(
        {
          error:
            "Another chapter already uses this slug in the selected lesson.",
        },
        {
          status: 409,
        },
      );
    }

    const {
      data: duplicateOrder,
    } = await supabase
      .from("chapters")
      .select("id")
      .eq(
        "lesson_id",
        nextLessonId,
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
            "Another chapter already uses this order in the selected lesson.",
        },
        {
          status: 409,
        },
      );
    }

    const {
      data: chapter,
      error,
    } = await supabase
      .from("chapters")
      .update(updates)
      .eq("id", id)
      .select(
        `
          id,
          lesson_id,
          title,
          slug,
          description,
          content,
          order_index,
          is_published,
          created_at,
          updated_at
        `,
      )
      .single();

    if (error) {
      console.error(
        "[ADMIN_CHAPTERS_PATCH]",
        error,
      );

      return NextResponse.json(
        {
          error:
            "Unable to update chapter.",
        },
        {
          status: 500,
        },
      );
    }

    await writeAdminAuditLog({
      supabase,
      action: "chapter.updated",
      resourceType: "chapter",
      resourceId: id,
      previousData:
        previousChapter,
      newData: chapter,
      metadata: {
        adminUserId: admin.id,
      },
      ...getClientMetadata(request),
    });

    return NextResponse.json({
      chapter,
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
      "[ADMIN_CHAPTERS_PATCH]",
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
            "Chapter ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const {
      data: chapter,
      error: lookupError,
    } = await supabase
      .from("chapters")
      .select(
        `
          id,
          lesson_id,
          title,
          slug,
          order_index,
          is_published
        `,
      )
      .eq("id", id)
      .maybeSingle();

    if (lookupError) {
      console.error(
        "[ADMIN_CHAPTERS_DELETE_LOOKUP]",
        lookupError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to find chapter.",
        },
        {
          status: 500,
        },
      );
    }

    if (!chapter) {
      return NextResponse.json(
        {
          error:
            "Chapter not found.",
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
      .eq("chapter_id", id);

    if (
      progressError &&
      progressError.code !==
        "PGRST205"
    ) {
      console.error(
        "[ADMIN_CHAPTERS_DELETE_PROGRESS]",
        progressError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to verify chapter dependencies.",
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
            "This chapter has learner progress and cannot be deleted. Unpublish it instead.",
          dependencyCount:
            progressCount ?? 0,
        },
        {
          status: 409,
        },
      );
    }

    const { error } =
      await supabase
        .from("chapters")
        .delete()
        .eq("id", id);

    if (error) {
      console.error(
        "[ADMIN_CHAPTERS_DELETE]",
        error,
      );

      return NextResponse.json(
        {
          error:
            "Unable to delete chapter.",
        },
        {
          status: 500,
        },
      );
    }

    await writeAdminAuditLog({
      supabase,
      action: "chapter.deleted",
      resourceType: "chapter",
      resourceId: id,
      previousData: chapter,
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
      "[ADMIN_CHAPTERS_DELETE]",
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