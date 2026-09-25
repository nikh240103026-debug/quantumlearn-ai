import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL =
  process.env.GEMINI_TUTOR_MODEL ?? "gemini-3.5-flash-lite";
const GEMINI_TIMEOUT_MS = 45_000;

type ChatRequestBody = {
  conversationId?: string;
  message?: string;
  contextType?: string | null;
  context?: Record<string, unknown>;
};

type GeminiPart = {
  text: string;
};

type GeminiContent = {
  role?: "user" | "model";
  parts: GeminiPart[];
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: GeminiPart[];
    };
  }>;
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
};

function cleanMessage(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function normalizeContext(
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

function buildSystemInstruction(
  contextType: string | null,
  context: Record<string, unknown>,
): string {
  const contextJson = JSON.stringify(context);

  return `
You are QuantumLearn AI Tutor, an expert educational assistant for quantum computing and quantum technology.

Your job is to help the learner understand concepts clearly and progressively.

Teaching rules:
1. Explain concepts from the learner's current level.
2. Prefer intuitive explanations before mathematical formalism.
3. Use equations when they genuinely help.
4. Use small examples.
5. Connect concepts to quantum computing whenever relevant.
6. Do not invent learner progress, scores, attempts, or activity.
7. If information is not available in the supplied context, say so.
8. Encourage the learner to reason rather than simply memorize.
9. If the learner asks for a difficult concept, break it into smaller steps.
10. If the learner makes a mistake, explain exactly why and provide the correct reasoning.
11. Keep responses focused and avoid unnecessary repetition.
12. Never claim that you performed an action that you did not actually perform.

Current context type:
${contextType ?? "general"}

Current context:
${contextJson}

You are communicating inside the QuantumLearn AI platform.
`.trim();
}

async function callGemini(
  contents: GeminiContent[],
  systemInstruction: string,
) {
  if (!GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY is not configured on the server.",
    );
  }

  const endpoint =
    `https://generativelanguage.googleapis.com/v1beta/models/` +
    `${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, GEMINI_TIMEOUT_MS);

  let response: Response;

  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: systemInstruction,
            },
          ],
        },
        contents,
        generationConfig: {
          temperature: 0.35,
          topP: 0.9,
          maxOutputTokens: 1800,
        },
      }),
      cache: "no-store",
      signal: controller.signal,
    });
  } catch (error) {
    if (
      error instanceof DOMException &&
      error.name === "AbortError"
    ) {
      const timeoutError = new Error(
        "Gemini Tutor timed out while generating a response. Please try again.",
      );

      (
        timeoutError as Error & {
          status?: number;
        }
      ).status = 504;

      throw timeoutError;
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }

  const data = (await response.json()) as GeminiResponse;

  if (!response.ok) {
    const status = response.status;

    const error = new Error(
      data.error?.message ??
        `Gemini request failed with status ${status}.`,
    );

    (
      error as Error & {
        status?: number;
      }
    ).status = status;

    throw error;
  }

  const text =
    data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text)
      .filter(Boolean)
      .join("\n")
      .trim() ?? "";

  if (!text) {
    throw new Error(
      "Gemini returned an empty response.",
    );
  }

  return {
    text,
    tokensUsed:
      data.usageMetadata?.totalTokenCount ?? null,
  };
}

function getGeminiHistory(
  messages: Array<{
    role: string;
    content: string;
  }>,
): GeminiContent[] {
  return messages
    .filter(
      (message) =>
        message.role === "user" ||
        message.role === "assistant",
    )
    .slice(-20)
    .map((message) => ({
      role:
        message.role === "assistant"
          ? "model"
          : "user",
      parts: [
        {
          text: message.content,
        },
      ],
    }));
}

export async function POST(
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
            "You must be logged in to use AI Tutor.",
        },
        { status: 401 },
      );
    }

    let body: ChatRequestBody;

    try {
      body = (await request.json()) as ChatRequestBody;
    } catch {
      return NextResponse.json(
        {
          error: "Invalid request body.",
        },
        { status: 400 },
      );
    }

    const message = cleanMessage(body.message);

    if (!message) {
      return NextResponse.json(
        {
          error:
            "Please enter a message before sending.",
        },
        { status: 400 },
      );
    }

    if (message.length > 8000) {
      return NextResponse.json(
        {
          error:
            "Your message is too long. Please keep it under 8000 characters.",
        },
        { status: 400 },
      );
    }

    const requestedContextType =
      typeof body.contextType === "string"
        ? body.contextType.trim().slice(0, 100)
        : null;

    const requestedContext =
      normalizeContext(body.context);

    let conversationId =
      typeof body.conversationId === "string" &&
      body.conversationId.trim().length > 0
        ? body.conversationId.trim()
        : null;

    let conversation:
      | {
          id: string;
          title: string;
          context_type: string | null;
          context: Record<string, unknown>;
        }
      | null = null;

    if (conversationId) {
      const { data, error } = await supabase
        .from("ai_conversations")
        .select(
          `
            id,
            title,
            context_type,
            context
          `,
        )
        .eq("id", conversationId)
        .eq("user_id", user.id)
        .eq("is_archived", false)
        .single();

      if (error || !data) {
        return NextResponse.json(
          {
            error:
              "The requested conversation was not found.",
          },
          { status: 404 },
        );
      }

      conversation = {
        id: data.id,
        title: data.title,
        context_type: data.context_type,
        context:
          normalizeContext(data.context),
      };
    } else {
      const initialTitle =
        message.length > 60
          ? `${message.slice(0, 57)}...`
          : message;

      const { data, error } = await supabase
        .from("ai_conversations")
        .insert({
          user_id: user.id,
          title: initialTitle,
          context_type: requestedContextType,
          context: requestedContext,
        })
        .select(
          `
            id,
            title,
            context_type,
            context
          `,
        )
        .single();

      if (error || !data) {
        console.error(
          "AI conversation creation error:",
          error,
        );

        return NextResponse.json(
          {
            error:
              "Unable to create the AI Tutor conversation.",
            details:
              process.env.NODE_ENV ===
              "development"
                ? error?.message
                : undefined,
          },
          { status: 500 },
        );
      }

      conversationId = data.id;

      conversation = {
        id: data.id,
        title: data.title,
        context_type: data.context_type,
        context:
          normalizeContext(data.context),
      };
    }

    if (!conversationId || !conversation) {
      return NextResponse.json(
        {
          error:
            "Unable to establish an AI Tutor conversation.",
        },
        { status: 500 },
      );
    }

    const mergedContext = {
      ...conversation.context,
      ...requestedContext,
    };

    if (
      requestedContextType &&
      requestedContextType !==
        conversation.context_type
    ) {
      const { error: contextUpdateError } =
        await supabase
          .from("ai_conversations")
          .update({
            context_type: requestedContextType,
            context: mergedContext,
            updated_at:
              new Date().toISOString(),
          })
          .eq("id", conversationId)
          .eq("user_id", user.id);

      if (contextUpdateError) {
        console.warn(
          "Unable to update conversation context:",
          contextUpdateError,
        );
      }

      conversation.context_type =
        requestedContextType;
      conversation.context = mergedContext;
    }

    const {
      data: previousMessages,
      error: historyError,
    } = await supabase
      .from("ai_messages")
      .select(
        `
          role,
          content
        `,
      )
      .eq("conversation_id", conversationId)
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      })
      .limit(20);

    if (historyError) {
      console.error(
        "AI message history error:",
        historyError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to load the conversation history.",
        },
        { status: 500 },
      );
    }

    const history = [...(previousMessages ?? [])]
      .reverse()
      .map((item) => ({
        role: item.role,
        content: item.content,
      }));

    const userMessage = {
      role: "user" as const,
      content: message,
    };

    const geminiContents = [
      ...getGeminiHistory(history),
      {
        role: "user" as const,
        parts: [
          {
            text: message,
          },
        ],
      },
    ];

    const systemInstruction =
      buildSystemInstruction(
        conversation.context_type,
        conversation.context,
      );

    const {
      data: savedUserMessage,
      error: userMessageError,
    } = await supabase
      .from("ai_messages")
      .insert({
        conversation_id: conversationId,
        user_id: user.id,
        role: "user",
        content: message,
        context: conversation.context,
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
        `,
      )
      .single();

    if (userMessageError || !savedUserMessage) {
      console.error(
        "AI user message save error:",
        userMessageError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to save your message.",
        },
        { status: 500 },
      );
    }

    let geminiResult;

    try {
      geminiResult = await callGemini(
        geminiContents,
        systemInstruction,
      );
    } catch (error) {
      const status =
        typeof error === "object" &&
        error !== null &&
        "status" in error
          ? Number(
              (error as { status?: number }).status,
            )
          : 500;

      console.error(
        "Gemini AI Tutor error:",
        error,
      );

      if (status === 429) {
        return NextResponse.json(
          {
            error:
              "AI Tutor is temporarily busy because the AI service rate limit was reached. Please try again shortly.",
          },
          { status: 429 },
        );
      }

      if (status === 504) {
        return NextResponse.json(
          {
            error:
              "Gemini Tutor timed out while generating a response. Please try again.",
          },
          { status: 504 },
        );
      }

      if (status === 401 || status === 403) {
        return NextResponse.json(
          {
            error:
              "AI Tutor authentication with the AI provider failed. Please check the server configuration.",
          },
          { status: 502 },
        );
      }

      if (
        status === 500 ||
        status === 502 ||
        status === 503
      ) {
        return NextResponse.json(
          {
            error:
              "AI Tutor is temporarily unavailable. Please try again in a moment.",
          },
          { status: 503 },
        );
      }

      return NextResponse.json(
        {
          error:
            "AI Tutor could not generate a response. Please try again.",
        },
        { status: 500 },
      );
    }

    const {
      data: savedAssistantMessage,
      error: assistantMessageError,
    } = await supabase
      .from("ai_messages")
      .insert({
        conversation_id: conversationId,
        user_id: user.id,
        role: "assistant",
        content: geminiResult.text,
        context: conversation.context,
        model: GEMINI_MODEL,
        tokens_used: geminiResult.tokensUsed,
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
        `,
      )
      .single();

    if (
      assistantMessageError ||
      !savedAssistantMessage
    ) {
      console.error(
        "AI assistant message save error:",
        assistantMessageError,
      );

      return NextResponse.json(
        {
          error:
            "The AI response was generated but could not be saved.",
        },
        { status: 500 },
      );
    }

    const { error: conversationUpdateError } =
      await supabase
        .from("ai_conversations")
        .update({
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", conversationId)
        .eq("user_id", user.id);

    if (conversationUpdateError) {
      console.warn(
        "Unable to update AI conversation timestamp:",
        conversationUpdateError,
      );
    }

    return NextResponse.json(
      {
        conversation,
        userMessage: savedUserMessage,
        assistantMessage:
          savedAssistantMessage,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "AI Tutor unexpected error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while processing your AI Tutor request.",
      },
      { status: 500 },
    );
  }
}