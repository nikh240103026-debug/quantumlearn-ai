import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { GoogleGenAI } from "@google/genai";

const MODEL = "gemini-3.5-flash-lite";

interface ConversationRow {
  id: string;
  user_id: string;
  title: string;
  context_type: string | null;
  context: Record<string, unknown> | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

interface MessageRow {
  id: string;
  conversation_id: string;
  user_id: string;
  role: string;
  content: string;
  context: Record<string, unknown> | null;
  model: string | null;
  tokens_used: number | null;
  created_at: string;
}

interface ClientMessage {
  role: "user" | "assistant";
  content: string;
}

function sanitizeQuestion(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, 4000);
}

/**
 * Find an active lesson conversation for the current user.
 *
 * We intentionally avoid `.contains()` on the JSONB context field.
 * Instead, we fetch the user's active lesson conversations and
 * match context.lessonId in JavaScript.
 */
async function findLessonConversation(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string,
  lessonId: string
): Promise<ConversationRow | null> {
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
      `
    )
    .eq("user_id", userId)
    .eq("is_archived", false)
    .eq("context_type", "lesson")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error finding lesson conversation:", error);
    throw new Error("Failed to load lesson conversation.");
  }

  const conversations = (data ?? []) as unknown as ConversationRow[];

  const conversation = conversations.find(
    (item: ConversationRow) => {
      const context = item.context ?? {};

      return context.lessonId === lessonId;
    }
  );

  return conversation ?? null;
}

/**
 * Load all persisted messages for a conversation.
 */
async function loadConversationMessages(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string,
  conversationId: string
): Promise<MessageRow[]> {
  const { data, error } = await supabase
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
      `
    )
    .eq("conversation_id", conversationId)
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error loading conversation messages:", error);
    throw new Error("Failed to load conversation messages.");
  }

  return (data ?? []) as unknown as MessageRow[];
}

/**
 * GET
 *
 * Loads the persisted lesson-specific Tutor conversation.
 *
 * /api/tutor?lessonId=<lesson-id>
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: "Unauthorized. Please log in again.",
        },
        { status: 401 }
      );
    }

    const lessonId = request.nextUrl.searchParams.get("lessonId");

    if (!lessonId) {
      return NextResponse.json(
        {
          error: "Lesson ID is required.",
        },
        { status: 400 }
      );
    }

    const conversation = await findLessonConversation(
      supabase,
      user.id,
      lessonId
    );

    if (!conversation) {
      return NextResponse.json({
        conversationId: null,
        messages: [],
      });
    }

    const messages = await loadConversationMessages(
      supabase,
      user.id,
      conversation.id
    );

    return NextResponse.json({
      conversationId: conversation.id,
      messages,
    });
  } catch (error) {
    console.error("GET /api/tutor error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load tutor history.",
      },
      { status: 500 }
    );
  }
}

/**
 * POST
 *
 * Sends a question to Gemini and persists both the user question
 * and assistant response.
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
          error: "Unauthorized. Please log in again.",
        },
        { status: 401 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("GEMINI_API_KEY is not configured.");

      return NextResponse.json(
        {
          error:
            "AI Tutor is not configured. Please contact the administrator.",
        },
        { status: 500 }
      );
    }

    const body = await request.json();

    const lessonId =
      typeof body.lessonId === "string"
        ? body.lessonId.trim()
        : "";

    const question = sanitizeQuestion(body.question);

    const requestedConversationId =
      typeof body.conversationId === "string"
        ? body.conversationId.trim()
        : "";

    if (!lessonId) {
      return NextResponse.json(
        {
          error: "Lesson ID is required.",
        },
        { status: 400 }
      );
    }

    if (!question) {
      return NextResponse.json(
        {
          error: "Please enter a question.",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------------------
    // 1. Load and validate lesson
    // ---------------------------------------------------------

    const { data: lesson, error: lessonError } = await supabase
      .from("lessons")
      .select(
        `
          id,
          course_id,
          title,
          description,
          content,
          order_index
        `
      )
      .eq("id", lessonId)
      .eq("is_published", true)
      .single();

    if (lessonError || !lesson) {
      console.error("Lesson lookup error:", lessonError);

      return NextResponse.json(
        {
          error: "Lesson not found or unavailable.",
        },
        { status: 404 }
      );
    }

    // ---------------------------------------------------------
    // 2. Find / validate conversation
    // ---------------------------------------------------------

    let conversation: ConversationRow | null = null;

    // Validate conversation ID supplied by the client.
    if (requestedConversationId) {
      const {
        data: existingConversation,
        error: conversationError,
      } = await supabase
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
          `
        )
        .eq("id", requestedConversationId)
        .eq("user_id", user.id)
        .eq("is_archived", false)
        .single();

      if (!conversationError && existingConversation) {
        const typedConversation =
          existingConversation as unknown as ConversationRow;

        const context = typedConversation.context ?? {};

        if (
          typedConversation.context_type === "lesson" &&
          context.lessonId === lesson.id
        ) {
          conversation = typedConversation;
        }
      }
    }

    // If no valid conversation was supplied, find the existing
    // conversation for this lesson.
    if (!conversation) {
      conversation = await findLessonConversation(
        supabase,
        user.id,
        lesson.id
      );
    }

    // ---------------------------------------------------------
    // 3. Create conversation if none exists
    // ---------------------------------------------------------

    if (!conversation) {
      const {
        data: newConversation,
        error: createConversationError,
      } = await supabase
        .from("ai_conversations")
        .insert({
          user_id: user.id,
          title: `${lesson.title} - AI Tutor`,
          context_type: "lesson",
          context: {
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            courseId: lesson.course_id,
          },
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
          `
        )
        .single();

      if (createConversationError || !newConversation) {
        console.error(
          "Create conversation error:",
          createConversationError
        );

        return NextResponse.json(
          {
            error: "Failed to create tutor conversation.",
          },
          { status: 500 }
        );
      }

      conversation =
        newConversation as unknown as ConversationRow;
    }

    // ---------------------------------------------------------
    // 4. Load persisted history
    // ---------------------------------------------------------

    const persistedMessages = await loadConversationMessages(
      supabase,
      user.id,
      conversation.id
    );

    const recentMessages = persistedMessages
      .filter((message: MessageRow) => {
        return (
          (message.role === "user" ||
            message.role === "assistant") &&
          typeof message.content === "string" &&
          message.content.trim().length > 0
        );
      })
      .slice(-10);

    // ---------------------------------------------------------
    // 5. Save user's new message
    // ---------------------------------------------------------

    const {
      data: savedUserMessage,
      error: userMessageError,
    } = await supabase
      .from("ai_messages")
      .insert({
        conversation_id: conversation.id,
        user_id: user.id,
        role: "user",
        content: question,
        context: {
          lessonId: lesson.id,
          lessonTitle: lesson.title,
        },
        model: null,
        tokens_used: null,
      })
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
        `
      )
      .single();

    if (userMessageError || !savedUserMessage) {
      console.error(
        "Save user message error:",
        userMessageError
      );

      return NextResponse.json(
        {
          error: "Failed to save your message.",
        },
        { status: 500 }
      );
    }

    // ---------------------------------------------------------
    // 6. Gemini system instructions
    // ---------------------------------------------------------

    const systemInstructions = `
You are QuantumLearn AI Tutor, an expert tutor for quantum technology and quantum computing.

Your goal is to help the student understand the current lesson clearly and accurately.

CURRENT LESSON:
Title: ${lesson.title}

Description:
${lesson.description ?? "No description available."}

Lesson Content:
${lesson.content ?? "No lesson content available."}

TEACHING RULES:
- Answer based primarily on the current lesson.
- Explain concepts clearly and progressively.
- Use simple intuition before introducing difficult mathematics when appropriate.
- Include mathematical formulas when they help understanding.
- Use examples whenever useful.
- For quantum computing topics, maintain mathematical and scientific accuracy.
- Do not invent facts that are not supported by the lesson or established knowledge.
- If the student asks something outside the lesson, answer briefly and explain how it relates to the lesson.
- If the student asks for a quiz, give an appropriate question and wait for their answer.
- If the student answers a quiz question, evaluate their answer and explain the reasoning.
- Adapt explanations to the student's apparent level.
- Avoid unnecessary repetition.

RESPONSE FORMAT:
- Use Markdown formatting.
- Use headings when useful.
- Use bullet points and numbered lists where appropriate.
- Use **bold** for important terms.
- Use inline code for code, commands, or identifiers.
- Use fenced code blocks for multi-line code.
- Use LaTeX-style mathematical notation when appropriate.
- Keep responses readable and well structured.
`;

    // ---------------------------------------------------------
    // 7. Build Gemini conversation
    // ---------------------------------------------------------

    const conversationHistory = recentMessages.map(
      (message: MessageRow) => ({
        role:
          message.role === "assistant"
            ? "model"
            : "user",
        parts: [
          {
            text: message.content,
          },
        ],
      })
    );

    conversationHistory.push({
      role: "user",
      parts: [
        {
          text: question,
        },
      ],
    });

    // ---------------------------------------------------------
    // 8. Generate Gemini response
    // ---------------------------------------------------------

    const gemini = new GoogleGenAI({
      apiKey,
    });

    let response;

    try {
      response = await gemini.models.generateContent({
        model: MODEL,
        contents: conversationHistory,
        config: {
          systemInstruction: systemInstructions,
          maxOutputTokens: 2048,
        },
      });
    } catch (geminiError: unknown) {
      console.error("Gemini API error:", geminiError);

      const errorMessage =
        geminiError instanceof Error
          ? geminiError.message
          : String(geminiError);

      if (
        errorMessage.includes("429") ||
        errorMessage
          .toLowerCase()
          .includes("rate limit")
      ) {
        return NextResponse.json(
          {
            error:
              "The AI Tutor is temporarily busy. Please wait a moment and try again.",
          },
          { status: 429 }
        );
      }

      if (
        errorMessage.includes("401") ||
        errorMessage.includes("403") ||
        errorMessage
          .toLowerCase()
          .includes("api key")
      ) {
        return NextResponse.json(
          {
            error:
              "The AI Tutor could not authenticate with Gemini. Please contact the administrator.",
          },
          { status: 503 }
        );
      }

      if (
        errorMessage.includes("503") ||
        errorMessage
          .toLowerCase()
          .includes("unavailable")
      ) {
        return NextResponse.json(
          {
            error:
              "The AI Tutor is temporarily unavailable. Please try again in a moment.",
          },
          { status: 503 }
        );
      }

      return NextResponse.json(
        {
          error:
            "The AI Tutor could not generate a response right now. Please try again.",
        },
        { status: 500 }
      );
    }

    const answer =
      typeof response.text === "string"
        ? response.text.trim()
        : "";

    if (!answer) {
      console.error("Gemini returned an empty response.");

      return NextResponse.json(
        {
          error:
            "The AI Tutor returned an empty response. Please try again.",
        },
        { status: 500 }
      );
    }

    // ---------------------------------------------------------
    // 9. Save assistant response
    // ---------------------------------------------------------

    const {
      data: savedAssistantMessage,
      error: assistantMessageError,
    } = await supabase
      .from("ai_messages")
      .insert({
        conversation_id: conversation.id,
        user_id: user.id,
        role: "assistant",
        content: answer,
        context: {
          lessonId: lesson.id,
          lessonTitle: lesson.title,
        },
        model: MODEL,
        tokens_used: null,
      })
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
        `
      )
      .single();

    if (
      assistantMessageError ||
      !savedAssistantMessage
    ) {
      console.error(
        "Save assistant message error:",
        assistantMessageError
      );

      return NextResponse.json(
        {
          error:
            "The AI response was generated, but could not be saved. Please try again.",
        },
        { status: 500 }
      );
    }

    // ---------------------------------------------------------
    // 10. Update conversation timestamp
    // ---------------------------------------------------------

    const { error: updateConversationError } =
      await supabase
        .from("ai_conversations")
        .update({
          updated_at: new Date().toISOString(),
        })
        .eq("id", conversation.id)
        .eq("user_id", user.id);

    if (updateConversationError) {
      console.error(
        "Update conversation timestamp error:",
        updateConversationError
      );
    }

    // ---------------------------------------------------------
    // 11. Return response
    // ---------------------------------------------------------

    return NextResponse.json({
      answer,
      conversationId: conversation.id,
      userMessage: savedUserMessage,
      assistantMessage: savedAssistantMessage,
    });
  } catch (error) {
    console.error("POST /api/tutor error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong with the AI Tutor.",
      },
      { status: 500 }
    );
  }
}