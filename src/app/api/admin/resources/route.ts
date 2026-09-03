import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type ResourceType =
  | "research_paper"
  | "learning_material"
  | "technical_reference"
  | "innovation_update"
  | "document"
  | "external_reference";

type Difficulty = "beginner" | "intermediate" | "advanced";

const RESOURCE_TYPES: ResourceType[] = [
  "research_paper",
  "learning_material",
  "technical_reference",
  "innovation_update",
  "document",
  "external_reference",
];

const DIFFICULTIES: Difficulty[] = [
  "beginner",
  "intermediate",
  "advanced",
];

function isValidResourceType(value: unknown): value is ResourceType {
  return (
    typeof value === "string" &&
    RESOURCE_TYPES.includes(value as ResourceType)
  );
}

function isValidDifficulty(value: unknown): value is Difficulty {
  return (
    typeof value === "string" &&
    DIFFICULTIES.includes(value as Difficulty)
  );
}

async function getAuthenticatedAdmin() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      supabase,
      user: null,
      profile: null,
      error: NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      ),
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Admin resource profile lookup error:", profileError);

    return {
      supabase,
      user,
      profile: null,
      error: NextResponse.json(
        { error: "Unable to verify administrator access." },
        { status: 500 }
      ),
    };
  }

  if (!profile || profile.role !== "admin") {
    return {
      supabase,
      user,
      profile,
      error: NextResponse.json(
        { error: "Administrator access required." },
        { status: 403 }
      ),
    };
  }

  return {
    supabase,
    user,
    profile,
    error: null,
  };
}

/**
 * GET /api/admin/resources
 *
 * Returns resources for the admin panel, including unpublished resources.
 */
export async function GET() {
  try {
    const {
      supabase,
      error: accessError,
    } = await getAuthenticatedAdmin();

    if (accessError) {
      return accessError;
    }

    const { data, error } = await supabase
      .from("resources")
      .select(
        `
        id,
        title,
        description,
        resource_type,
        topic,
        chapter,
        difficulty,
        resource_url,
        file_url,
        author,
        source_name,
        tags,
        metadata,
        is_published,
        created_at,
        updated_at
        `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Admin resources GET error:", error);

      return NextResponse.json(
        { error: "Failed to fetch resources." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      resources: data ?? [],
    });
  } catch (error) {
    console.error("Admin resources GET unexpected error:", error);

    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/resources
 *
 * Creates a new resource.
 */
export async function POST(request: NextRequest) {
  try {
    const {
      supabase,
      error: accessError,
    } = await getAuthenticatedAdmin();

    if (accessError) {
      return accessError;
    }

    let body: Record<string, unknown>;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const title =
      typeof body.title === "string" ? body.title.trim() : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    const resourceType = body.resourceType;
    const topic =
      typeof body.topic === "string" ? body.topic.trim() : "";

    const chapter =
      body.chapter === null ||
      body.chapter === undefined ||
      body.chapter === ""
        ? null
        : Number(body.chapter);

    const difficulty = body.difficulty;

    const resourceUrl =
      typeof body.resourceUrl === "string"
        ? body.resourceUrl.trim()
        : "";

    const fileUrl =
      typeof body.fileUrl === "string"
        ? body.fileUrl.trim()
        : "";

    const author =
      typeof body.author === "string"
        ? body.author.trim()
        : "";

    const sourceName =
      typeof body.sourceName === "string"
        ? body.sourceName.trim()
        : "";

    const tags = Array.isArray(body.tags) ? body.tags : [];

    const metadata =
      body.metadata &&
      typeof body.metadata === "object" &&
      !Array.isArray(body.metadata)
        ? body.metadata
        : {};

    const isPublished =
      typeof body.isPublished === "boolean"
        ? body.isPublished
        : false;

    if (!title) {
      return NextResponse.json(
        { error: "Resource title is required." },
        { status: 400 }
      );
    }

    if (title.length > 300) {
      return NextResponse.json(
        { error: "Resource title is too long." },
        { status: 400 }
      );
    }

    if (!description) {
      return NextResponse.json(
        { error: "Resource description is required." },
        { status: 400 }
      );
    }

    if (!isValidResourceType(resourceType)) {
      return NextResponse.json(
        { error: "Invalid resource type." },
        { status: 400 }
      );
    }

    if (chapter !== null) {
      if (
        !Number.isInteger(chapter) ||
        chapter < 1 ||
        chapter > 10
      ) {
        return NextResponse.json(
          { error: "Chapter must be an integer between 1 and 10." },
          { status: 400 }
        );
      }
    }

    if (!isValidDifficulty(difficulty)) {
      return NextResponse.json(
        { error: "Invalid difficulty." },
        { status: 400 }
      );
    }

    if (!resourceUrl && !fileUrl) {
      return NextResponse.json(
        {
          error:
            "At least one resource URL or file URL is required.",
        },
        { status: 400 }
      );
    }

    if (tags.some((tag) => typeof tag !== "string")) {
      return NextResponse.json(
        { error: "Tags must be an array of strings." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("resources")
      .insert({
        title,
        description,
        resource_type: resourceType,
        topic: topic || null,
        chapter,
        difficulty,
        resource_url: resourceUrl || null,
        file_url: fileUrl || null,
        author: author || null,
        source_name: sourceName || null,
        tags,
        metadata,
        is_published: isPublished,
      })
      .select(
        `
        id,
        title,
        description,
        resource_type,
        topic,
        chapter,
        difficulty,
        resource_url,
        file_url,
        author,
        source_name,
        tags,
        metadata,
        is_published,
        created_at,
        updated_at
        `
      )
      .single();

    if (error) {
      console.error("Admin resources POST error:", error);

      return NextResponse.json(
        { error: "Failed to create resource." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Resource created successfully.",
        resource: data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin resources POST unexpected error:", error);

    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/resources
 *
 * Updates an existing resource.
 *
 * Body must contain:
 * {
 *   id: string,
 *   ...fields to update
 * }
 */
export async function PATCH(request: NextRequest) {
  try {
    const {
      supabase,
      error: accessError,
    } = await getAuthenticatedAdmin();

    if (accessError) {
      return accessError;
    }

    let body: Record<string, unknown>;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const id =
      typeof body.id === "string" ? body.id.trim() : "";

    if (!id) {
      return NextResponse.json(
        { error: "Resource ID is required." },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = {};

    if (body.title !== undefined) {
      if (typeof body.title !== "string" || !body.title.trim()) {
        return NextResponse.json(
          { error: "Title must be a non-empty string." },
          { status: 400 }
        );
      }

      updates.title = body.title.trim();
    }

    if (body.description !== undefined) {
      if (
        typeof body.description !== "string" ||
        !body.description.trim()
      ) {
        return NextResponse.json(
          { error: "Description must be a non-empty string." },
          { status: 400 }
        );
      }

      updates.description = body.description.trim();
    }

    if (body.resourceType !== undefined) {
      if (!isValidResourceType(body.resourceType)) {
        return NextResponse.json(
          { error: "Invalid resource type." },
          { status: 400 }
        );
      }

      updates.resource_type = body.resourceType;
    }

    if (body.topic !== undefined) {
      if (
        body.topic !== null &&
        typeof body.topic !== "string"
      ) {
        return NextResponse.json(
          { error: "Topic must be a string or null." },
          { status: 400 }
        );
      }

      updates.topic =
        typeof body.topic === "string"
          ? body.topic.trim() || null
          : null;
    }

    if (body.chapter !== undefined) {
      if (
        body.chapter !== null &&
        body.chapter !== ""
      ) {
        const chapter = Number(body.chapter);

        if (
          !Number.isInteger(chapter) ||
          chapter < 1 ||
          chapter > 10
        ) {
          return NextResponse.json(
            {
              error:
                "Chapter must be an integer between 1 and 10.",
            },
            { status: 400 }
          );
        }

        updates.chapter = chapter;
      } else {
        updates.chapter = null;
      }
    }

    if (body.difficulty !== undefined) {
      if (!isValidDifficulty(body.difficulty)) {
        return NextResponse.json(
          { error: "Invalid difficulty." },
          { status: 400 }
        );
      }

      updates.difficulty = body.difficulty;
    }

    if (body.resourceUrl !== undefined) {
      if (
        body.resourceUrl !== null &&
        typeof body.resourceUrl !== "string"
      ) {
        return NextResponse.json(
          { error: "Resource URL must be a string or null." },
          { status: 400 }
        );
      }

      updates.resource_url =
        typeof body.resourceUrl === "string"
          ? body.resourceUrl.trim() || null
          : null;
    }

    if (body.fileUrl !== undefined) {
      if (
        body.fileUrl !== null &&
        typeof body.fileUrl !== "string"
      ) {
        return NextResponse.json(
          { error: "File URL must be a string or null." },
          { status: 400 }
        );
      }

      updates.file_url =
        typeof body.fileUrl === "string"
          ? body.fileUrl.trim() || null
          : null;
    }

    if (body.author !== undefined) {
      if (
        body.author !== null &&
        typeof body.author !== "string"
      ) {
        return NextResponse.json(
          { error: "Author must be a string or null." },
          { status: 400 }
        );
      }

      updates.author =
        typeof body.author === "string"
          ? body.author.trim() || null
          : null;
    }

    if (body.sourceName !== undefined) {
      if (
        body.sourceName !== null &&
        typeof body.sourceName !== "string"
      ) {
        return NextResponse.json(
          { error: "Source name must be a string or null." },
          { status: 400 }
        );
      }

      updates.source_name =
        typeof body.sourceName === "string"
          ? body.sourceName.trim() || null
          : null;
    }

    if (body.tags !== undefined) {
      if (
        !Array.isArray(body.tags) ||
        body.tags.some((tag) => typeof tag !== "string")
      ) {
        return NextResponse.json(
          { error: "Tags must be an array of strings." },
          { status: 400 }
        );
      }

      updates.tags = body.tags;
    }

    if (body.metadata !== undefined) {
      if (
        body.metadata === null ||
        typeof body.metadata !== "object" ||
        Array.isArray(body.metadata)
      ) {
        return NextResponse.json(
          { error: "Metadata must be a JSON object." },
          { status: 400 }
        );
      }

      updates.metadata = body.metadata;
    }

    if (body.isPublished !== undefined) {
      if (typeof body.isPublished !== "boolean") {
        return NextResponse.json(
          { error: "isPublished must be a boolean." },
          { status: 400 }
        );
      }

      updates.is_published = body.isPublished;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No fields were provided for update." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("resources")
      .update(updates)
      .eq("id", id)
      .select(
        `
        id,
        title,
        description,
        resource_type,
        topic,
        chapter,
        difficulty,
        resource_url,
        file_url,
        author,
        source_name,
        tags,
        metadata,
        is_published,
        created_at,
        updated_at
        `
      )
      .maybeSingle();

    if (error) {
      console.error("Admin resources PATCH error:", error);

      return NextResponse.json(
        { error: "Failed to update resource." },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Resource not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Resource updated successfully.",
      resource: data,
    });
  } catch (error) {
    console.error("Admin resources PATCH unexpected error:", error);

    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/resources?id=<resource-id>
 *
 * Permanently deletes a resource.
 */
export async function DELETE(request: NextRequest) {
  try {
    const {
      supabase,
      error: accessError,
    } = await getAuthenticatedAdmin();

    if (accessError) {
      return accessError;
    }

    const resourceId = request.nextUrl.searchParams.get("id")?.trim();

    if (!resourceId) {
      return NextResponse.json(
        { error: "Resource ID is required." },
        { status: 400 }
      );
    }

    const { data: existingResource, error: lookupError } =
      await supabase
        .from("resources")
        .select("id")
        .eq("id", resourceId)
        .maybeSingle();

    if (lookupError) {
      console.error(
        "Admin resources DELETE lookup error:",
        lookupError
      );

      return NextResponse.json(
        { error: "Failed to find resource." },
        { status: 500 }
      );
    }

    if (!existingResource) {
      return NextResponse.json(
        { error: "Resource not found." },
        { status: 404 }
      );
    }

    const { error: deleteError } = await supabase
      .from("resources")
      .delete()
      .eq("id", resourceId);

    if (deleteError) {
      console.error(
        "Admin resources DELETE error:",
        deleteError
      );

      return NextResponse.json(
        { error: "Failed to delete resource." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Resource deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Admin resources DELETE unexpected error:",
      error
    );

    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}