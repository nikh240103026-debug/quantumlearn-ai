import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type ActivityBody = {
  activityType?: string;
  sourcePage?: string | null;
  topic?: string | null;
  description?: string | null;
  metadata?: Record<string, unknown>;
};

const ALLOWED_ACTIVITY_TYPES = new Set([
  "tutor_message",
  "analysis_generated",
  "recommendation_opened",
  "practice_completed",
  "quantum_lab_tutor",
  "tutor_opened",
  "coding_challenge_completed",
]);

function cleanOptionalString(
  value: unknown,
  maxLength: number,
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const valueTrimmed = value.trim();

  if (!valueTrimmed) {
    return null;
  }

  return valueTrimmed.slice(0, maxLength);
}

function normalizeMetadata(
  value: unknown,
): Record<string, unknown> {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value as Record<string, unknown>;
  }

  return {};
}

/**
 * POST /api/activity
 *
 * Records an AI-related activity for the authenticated user.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase =
      await createSupabaseServerClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          error:
            "You must be logged in to record activity.",
        },
        { status: 401 },
      );
    }

    let body: ActivityBody;

    try {
      body = (await request.json()) as ActivityBody;
    } catch {
      return NextResponse.json(
        {
          error: "Invalid request body.",
        },
        { status: 400 },
      );
    }

    const activityType =
      cleanOptionalString(
        body.activityType,
        100,
      );

    if (!activityType) {
      return NextResponse.json(
        {
          error: "Activity type is required.",
        },
        { status: 400 },
      );
    }

    if (!ALLOWED_ACTIVITY_TYPES.has(activityType)) {
      return NextResponse.json(
        {
          error:
            "Invalid activity type.",
        },
        { status: 400 },
      );
    }

    const sourcePage =
      cleanOptionalString(
        body.sourcePage,
        200,
      );

    const topic =
      cleanOptionalString(
        body.topic,
        300,
      );

    const description =
      cleanOptionalString(
        body.description,
        1000,
      );

    const metadata =
      normalizeMetadata(body.metadata);

    const { data, error } = await supabase
      .from("ai_activity")
      .insert({
        user_id: user.id,
        activity_type: activityType,
        source_page: sourcePage,
        topic,
        description,
        metadata,
      })
      .select(
        `
          id,
          user_id,
          activity_type,
          source_page,
          topic,
          description,
          metadata,
          created_at
        `,
      )
      .single();

    if (error) {
      console.error(
        "AI activity POST error:",
        error,
      );

      return NextResponse.json(
        {
          error:
            "Unable to record AI activity.",
          details:
            process.env.NODE_ENV ===
            "development"
              ? error.message
              : undefined,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        activity: data,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "Unexpected AI activity POST error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "An unexpected error occurred while recording activity.",
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/activity
 *
 * Returns the authenticated user's recent AI activity.
 *
 * Optional query parameter:
 * ?limit=20
 */
export async function GET(
  request: NextRequest,
) {
  try {
    const supabase =
      await createSupabaseServerClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          error:
            "You must be logged in to view activity.",
        },
        { status: 401 },
      );
    }

    const searchParams =
      request.nextUrl.searchParams;

    const requestedLimit = Number(
      searchParams.get("limit") ?? "30",
    );

    const limit =
      Number.isFinite(requestedLimit)
        ? Math.min(
            Math.max(
              Math.floor(requestedLimit),
              1,
            ),
            100,
          )
        : 30;

    const { data, error } = await supabase
      .from("ai_activity")
      .select(
        `
          id,
          user_id,
          activity_type,
          source_page,
          topic,
          description,
          metadata,
          created_at
        `,
      )
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      })
      .limit(limit);

    if (error) {
      console.error(
        "AI activity GET error:",
        error,
      );

      return NextResponse.json(
        {
          error:
            "Unable to load AI activity.",
          details:
            process.env.NODE_ENV ===
            "development"
              ? error.message
              : undefined,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        activities: data ?? [],
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "Unexpected AI activity GET error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "An unexpected error occurred while loading activity.",
      },
      { status: 500 },
    );
  }
}