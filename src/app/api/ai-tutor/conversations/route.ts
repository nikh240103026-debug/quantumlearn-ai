import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type CreateConversationBody = {
  title?: string;
  contextType?: string;
  context?: Record<string, unknown>;
};

function sanitizeText(value: unknown, fallback: string): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return fallback;
  }

  return trimmed.slice(0, 200);
}

function sanitizeContext(
  value: unknown,
): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

/**
 * GET /api/ai-tutor/conversations
 *
 * Returns the authenticated user's active AI Tutor conversations.
 */
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: "Authentication required",
        },
        { status: 401 },
      );
    }

    const { data, error } = await supabase
      .from("ai_conversations")
      .select(
        `
          id,
          user_id,
          title,
          context_type,
          context,
          is_archived,
          created_at,
          updated_at
        `,
      )
      .eq("user_id", user.id)
      .eq("is_archived", false)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error(
        "AI conversations GET error:",
        error,
      );

      return NextResponse.json(
        {
          error: "Unable to load AI Tutor conversations",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        conversations: data ?? [],
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "AI conversations GET unexpected error:",
      error,
    );

    return NextResponse.json(
      {
        error: "Unable to load AI Tutor conversations",
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/ai-tutor/conversations
 *
 * Creates a new persistent AI Tutor conversation.
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
          error: "Authentication required",
        },
        { status: 401 },
      );
    }

    let body: CreateConversationBody = {};

    try {
      body = (await request.json()) as CreateConversationBody;
    } catch {
      body = {};
    }

    const title = sanitizeText(
      body.title,
      "New AI Tutor Conversation",
    );

    const contextType = sanitizeText(
      body.contextType,
      "general",
    );

    const context = sanitizeContext(body.context);

    const { data, error } = await supabase
      .from("ai_conversations")
      .insert({
        user_id: user.id,
        title,
        context_type: contextType,
        context,
        is_archived: false,
      })
      .select(
        `
          id,
          user_id,
          title,
          context_type,
          context,
          is_archived,
          created_at,
          updated_at
        `,
      )
      .single();

    if (error) {
      console.error(
        "AI conversation POST error:",
        error,
      );

      return NextResponse.json(
        {
          error: "Unable to create AI Tutor conversation",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        conversation: data,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "AI conversation POST unexpected error:",
      error,
    );

    return NextResponse.json(
      {
        error: "Unable to create AI Tutor conversation",
      },
      { status: 500 },
    );
  }
}