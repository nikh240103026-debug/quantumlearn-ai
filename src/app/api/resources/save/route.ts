import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type SaveResourceBody = {
  resourceId?: string;
  saved?: boolean;
};

function isValidUuid(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

/**
 * POST /api/resources/save
 *
 * Saves or unsaves a resource for the authenticated user.
 *
 * Body:
 * {
 *   resourceId: string,
 *   saved: boolean
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: "Authentication required.",
        },
        { status: 401 },
      );
    }

    let body: SaveResourceBody;

    try {
      body = (await request.json()) as SaveResourceBody;
    } catch {
      return NextResponse.json(
        {
          error: "Invalid JSON request body.",
        },
        { status: 400 },
      );
    }

    const { resourceId, saved } = body;

    if (!isValidUuid(resourceId)) {
      return NextResponse.json(
        {
          error: "A valid resource ID is required.",
        },
        { status: 400 },
      );
    }

    if (typeof saved !== "boolean") {
      return NextResponse.json(
        {
          error: "The saved value must be a boolean.",
        },
        { status: 400 },
      );
    }

    // Verify that the resource exists and is published.
    const { data: resource, error: resourceError } =
      await supabase
        .from("resources")
        .select("id")
        .eq("id", resourceId)
        .eq("is_published", true)
        .maybeSingle();

    if (resourceError) {
      console.error(
        "Resource verification error:",
        resourceError,
      );

      return NextResponse.json(
        {
          error: "Unable to verify resource.",
        },
        { status: 500 },
      );
    }

    if (!resource) {
      return NextResponse.json(
        {
          error: "Resource not found.",
        },
        { status: 404 },
      );
    }

    if (saved) {
      const { data, error } = await supabase
        .from("resource_saves")
        .upsert(
          {
            resource_id: resourceId,
            user_id: user.id,
          },
          {
            onConflict: "resource_id,user_id",
          },
        )
        .select(
          `
            id,
            resource_id,
            user_id,
            created_at
          `,
        )
        .single();

      if (error) {
        console.error(
          "Resource save error:",
          error,
        );

        return NextResponse.json(
          {
            error: "Unable to save resource.",
          },
          { status: 500 },
        );
      }

      return NextResponse.json(
        {
          success: true,
          saved: true,
          save: data,
        },
        { status: 200 },
      );
    }

    const { error } = await supabase
      .from("resource_saves")
      .delete()
      .eq("resource_id", resourceId)
      .eq("user_id", user.id);

    if (error) {
      console.error(
        "Resource unsave error:",
        error,
      );

      return NextResponse.json(
        {
          error: "Unable to remove saved resource.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        saved: false,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "Resource save API unexpected error:",
      error,
    );

    return NextResponse.json(
      {
        error: "Unable to update saved resource.",
      },
      { status: 500 },
    );
  }
}