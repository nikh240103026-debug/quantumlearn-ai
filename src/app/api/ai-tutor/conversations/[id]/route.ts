import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type UpdateConversationBody = {
  title?: string;
  isArchived?: boolean;
};

function sanitizeTitle(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  return trimmed.slice(0, 200);
}

/**
 * GET /api/ai-tutor/conversations/[id]
 *
 * Returns one conversation and all of its messages.
 */
export async function GET(
  _request: NextRequest,
  { params }: RouteContext,
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Conversation ID is required." },
        { status: 400 },
      );
    }

    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    const { data: conversation, error: conversationError } =
      await supabase
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
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

    if (conversationError || !conversation) {
      return NextResponse.json(
        { error: "Conversation not found." },
        { status: 404 },
      );
    }

    const { data: messages, error: messagesError } =
      await supabase
        .from("ai_messages")
        .select(
          `
            id,
            conversation_id,
            user_id,
            role,
            content,
            context,
            model,
            tokens_used,
            created_at
          `,
        )
        .eq("conversation_id", id)
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: true,
        });

    if (messagesError) {
      console.error(
        "AI conversation messages GET error:",
        messagesError,
      );

      return NextResponse.json(
        {
          error: "Unable to load conversation messages.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        conversation,
        messages: messages ?? [],
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "AI conversation GET unexpected error:",
      error,
    );

    return NextResponse.json(
      {
        error: "Unable to load AI Tutor conversation.",
      },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/ai-tutor/conversations/[id]
 *
 * Updates conversation title and/or archive state.
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteContext,
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Conversation ID is required." },
        { status: 400 },
      );
    }

    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    let body: UpdateConversationBody = {};

    try {
      body = (await request.json()) as UpdateConversationBody;
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 },
      );
    }

    const updates: Record<string, unknown> = {};

    if (
      Object.prototype.hasOwnProperty.call(body, "title")
    ) {
      const title = sanitizeTitle(body.title);

      if (!title) {
        return NextResponse.json(
          {
            error: "Conversation title cannot be empty.",
          },
          { status: 400 },
        );
      }

      updates.title = title;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "isArchived",
      )
    ) {
      if (typeof body.isArchived !== "boolean") {
        return NextResponse.json(
          {
            error: "isArchived must be a boolean.",
          },
          { status: 400 },
        );
      }

      updates.is_archived = body.isArchived;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        {
          error: "No valid fields to update.",
        },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("ai_conversations")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
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

    if (error || !data) {
      console.error(
        "AI conversation PATCH error:",
        error,
      );

      return NextResponse.json(
        {
          error: "Unable to update AI Tutor conversation.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        conversation: data,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "AI conversation PATCH unexpected error:",
      error,
    );

    return NextResponse.json(
      {
        error: "Unable to update AI Tutor conversation.",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/ai-tutor/conversations/[id]
 *
 * Permanently deletes the authenticated user's conversation
 * and all associated messages.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext,
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Conversation ID is required." },
        { status: 400 },
      );
    }

    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    const { data: conversation, error: conversationError } =
      await supabase
        .from("ai_conversations")
        .select("id")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

    if (conversationError || !conversation) {
      return NextResponse.json(
        { error: "Conversation not found." },
        { status: 404 },
      );
    }

    const { error: messagesDeleteError } =
      await supabase
        .from("ai_messages")
        .delete()
        .eq("conversation_id", id)
        .eq("user_id", user.id);

    if (messagesDeleteError) {
      console.error(
        "AI conversation messages DELETE error:",
        messagesDeleteError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to delete conversation messages.",
        },
        { status: 500 },
      );
    }

    const { error: conversationDeleteError } =
      await supabase
        .from("ai_conversations")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

    if (conversationDeleteError) {
      console.error(
        "AI conversation DELETE error:",
        conversationDeleteError,
      );

      return NextResponse.json(
        {
          error: "Unable to delete AI Tutor conversation.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        conversationId: id,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "AI conversation DELETE unexpected error:",
      error,
    );

    return NextResponse.json(
      {
        error: "Unable to delete AI Tutor conversation.",
      },
      { status: 500 },
    );
  }
}