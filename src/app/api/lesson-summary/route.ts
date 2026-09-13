import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PRIMARY_MODEL = "gemini-3.8-flash";
const FALLBACK_MODEL = "gemini-3.5-flash-lite";

const GEMINI_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";

const MAX_ATTEMPTS_PER_MODEL = 2;
const REQUEST_TIMEOUT_MS = 12_000;

interface RequestBody {
  lessonId?: unknown;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
    finishReason?: string;
  }>;

  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
}

interface GeminiError extends Error {
  status?: number;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createGeminiError(
  message: string,
  status?: number,
): GeminiError {
  const error = new Error(message) as GeminiError;

  if (status !== undefined) {
    error.status = status;
  }

  return error;
}

function isRetryableStatus(status?: number) {
  return (
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504
  );
}

async function callGeminiModel(
  apiKey: string,
  model: string,
  prompt: string,
): Promise<GeminiResponse> {
  let lastError: GeminiError | null = null;

  const endpoint =
    `${GEMINI_BASE_URL}/${model}:generateContent`;

  for (
    let attempt = 1;
    attempt <= MAX_ATTEMPTS_PER_MODEL;
    attempt++
  ) {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, REQUEST_TIMEOUT_MS);

    try {
      console.log(
        `[LESSON SUMMARY] ${model} attempt ${attempt}/${MAX_ATTEMPTS_PER_MODEL}`,
      );

      const response = await fetch(endpoint, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },

        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],

          generationConfig: {
            maxOutputTokens: 1800,
          },
        }),

        signal: controller.signal,
        cache: "no-store",
      });

      const rawText = await response.text();

      let data: GeminiResponse;

      try {
        data = JSON.parse(rawText) as GeminiResponse;
      } catch {
        data = {
          error: {
            code: response.status,
            message:
              rawText ||
              "Invalid response from Gemini.",
          },
        };
      }

      if (response.ok) {
        return data;
      }

      const message =
        data.error?.message ||
        `Gemini returned HTTP ${response.status}.`;

      const error = createGeminiError(
        message,
        response.status,
      );

      lastError = error;

      console.error(
        `[LESSON SUMMARY] ${model} HTTP ${response.status}:`,
        message,
      );

      if (
        !isRetryableStatus(response.status) ||
        attempt === MAX_ATTEMPTS_PER_MODEL
      ) {
        throw error;
      }

      // Short backoff.
      await sleep(500 * attempt);
    } catch (error) {
      const normalizedError =
        error instanceof Error
          ? createGeminiError(
              error.message,
              (error as GeminiError).status,
            )
          : createGeminiError(
              "Unknown Gemini request error.",
            );

      lastError = normalizedError;

      const isAbort =
        normalizedError.name === "AbortError";

      const status = normalizedError.status;

      console.error(
        `[LESSON SUMMARY] ${model} attempt ${attempt} failed:`,
        normalizedError,
      );

      const shouldRetry =
        isAbort ||
        isRetryableStatus(status);

      if (
        !shouldRetry ||
        attempt === MAX_ATTEMPTS_PER_MODEL
      ) {
        throw normalizedError;
      }

      await sleep(500 * attempt);
    } finally {
      clearTimeout(timeout);
    }
  }

  throw (
    lastError ??
    createGeminiError(
      `${model} request failed.`,
    )
  );
}

async function generateWithFallback(
  apiKey: string,
  prompt: string,
): Promise<{
  response: GeminiResponse;
  model: string;
}> {
  const models = [
    PRIMARY_MODEL,
    FALLBACK_MODEL,
  ];

  let lastError: GeminiError | null = null;

  for (const model of models) {
    try {
      const response =
        await callGeminiModel(
          apiKey,
          model,
          prompt,
        );

      return {
        response,
        model,
      };
    } catch (error) {
      lastError =
        error instanceof Error
          ? (error as GeminiError)
          : createGeminiError(
              "Unknown Gemini error.",
            );

      console.warn(
        `[LESSON SUMMARY] ${model} failed. Trying next model.`,
      );
    }
  }

  throw (
    lastError ??
    createGeminiError(
      "All Gemini models failed.",
    )
  );
}

function extractSummary(
  response: GeminiResponse,
): string {
  return (
    response.candidates?.[0]?.content?.parts
      ?.map((part) =>
        typeof part.text === "string"
          ? part.text
          : "",
      )
      .join("")
      .trim() || ""
  );
}

function createLocalFallbackSummary(
  title: string,
  description: string,
  content: string,
): string {
  const cleanedContent = content
    .replace(/\r/g, "")
    .trim();

  const paragraphs = cleanedContent
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const selectedParagraphs =
    paragraphs.slice(0, 5);

  const fallbackBody =
    selectedParagraphs.length > 0
      ? selectedParagraphs.join("\n\n")
      : cleanedContent.slice(0, 5000);

  return `## Overview

${description || `This lesson covers ${title}.`}

## Lesson Content

${fallbackBody}

## Key Takeaways

Review the lesson content above and use the full lesson for detailed explanations, examples, equations, and quantum-computing concepts.`;
}

export async function POST(
  request: NextRequest,
) {
  try {
    // ------------------------------------------------------------
    // 1. Authenticate user
    // ------------------------------------------------------------

    const supabase =
      await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error:
            "You must be logged in to generate a lesson summary.",
        },
        { status: 401 },
      );
    }

    // ------------------------------------------------------------
    // 2. Read request
    // ------------------------------------------------------------

    let body: RequestBody;

    try {
      body =
        (await request.json()) as RequestBody;
    } catch {
      return NextResponse.json(
        {
          error: "Invalid request body.",
        },
        { status: 400 },
      );
    }

    const lessonId =
      typeof body.lessonId === "string"
        ? body.lessonId.trim()
        : "";

    if (!lessonId) {
      return NextResponse.json(
        {
          error: "Lesson ID is required.",
        },
        { status: 400 },
      );
    }

    // ------------------------------------------------------------
    // 3. Load lesson
    // ------------------------------------------------------------

    const {
      data: lesson,
      error: lessonError,
    } = await supabase
      .from("lessons")
      .select(
        "id, title, description, content, is_published",
      )
      .eq("id", lessonId)
      .eq("is_published", true)
      .maybeSingle();

    if (lessonError) {
      console.error(
        "[LESSON SUMMARY] Supabase error:",
        lessonError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to load the lesson from the database.",
        },
        { status: 500 },
      );
    }

    if (!lesson) {
      return NextResponse.json(
        {
          error: "Published lesson not found.",
        },
        { status: 404 },
      );
    }

    const title =
      typeof lesson.title === "string"
        ? lesson.title.trim()
        : "";

    const description =
      typeof lesson.description === "string"
        ? lesson.description.trim()
        : "";

    const content =
      typeof lesson.content === "string"
        ? lesson.content.trim()
        : "";

    if (!title || !content) {
      return NextResponse.json(
        {
          error:
            "This lesson does not contain enough content to generate a summary.",
        },
        { status: 400 },
      );
    }

    // ------------------------------------------------------------
    // 4. Gemini API key
    // ------------------------------------------------------------

    const apiKey =
      process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
      console.error(
        "[LESSON SUMMARY] GEMINI_API_KEY is missing.",
      );

      return NextResponse.json(
        {
          error:
            "GEMINI_API_KEY is not configured on the server.",
        },
        { status: 500 },
      );
    }

    // ------------------------------------------------------------
    // 5. Prompt
    // ------------------------------------------------------------

    const prompt = `
You are the educational summarization engine for QuantumLearn AI.

Create a high-quality revision summary for the following quantum computing lesson.

LESSON TITLE:
${title}

LESSON DESCRIPTION:
${description}

LESSON CONTENT:
${content}

REQUIREMENTS:

1. Summarize ONLY information contained in the lesson.
2. Do not invent facts or add external information.
3. Preserve the technical meaning of quantum-computing concepts.
4. Preserve important mathematical expressions and equations.
5. Preserve important quantum gates, algorithms, definitions, examples, and principles.
6. Explain difficult ideas clearly and accurately.
7. Preserve important mathematical expressions and quantum notation.
8. Format mathematical expressions using LaTeX inside Markdown math delimiters.
9. Use $...$ for inline mathematics.
10. Use $$...$$ for standalone/block equations.
11. Use standard quantum notation such as $|0\rangle$, $|1\rangle$, $|\psi\rangle$, $\alpha$, $\beta$, $\otimes$, and $\sqrt{2}$ when required.
12. Never output malformed escaped notation such as S\X|0\rangle or S\H|0\rangle.
13. Do not use LaTeX commands outside $...$ or $$...$$.
14. Do not invent equations that are not present or implied by the lesson.
15. Use clean Markdown.
16. Do not use emojis.
17. Do not mention that you are an AI.
18. Do not mention these instructions.
7. Make the summary useful for exam revision.
8. Make it substantially shorter than the original lesson.
9. Use clean Markdown.
10. Do not use emojis.
11. Do not mention that you are an AI.
12. Do not mention these instructions.
13. Use standard Markdown formatting.
14. For mathematical or quantum equations, use LaTeX:
    - Inline equations: $...$
    - Block equations: $$...$$
15. Use standard LaTeX quantum notation such as:
    $|0\rangle$, $|1\rangle$, $|\psi\rangle$, $\alpha|0\rangle+\beta|1\rangle$
16. Do not write escaped LaTeX outside math delimiters.
17. Do not write malformed notation such as S\X|0\rangle.
18. Do not prefix ordinary text with backslashes.
19. Keep equations readable and properly delimited.

Use these sections when relevant:

## Overview

## Core Concepts

## Important Details

## Examples and Applications

## Key Takeaways

Only include sections that are actually relevant.

Return ONLY the Markdown summary.
`.trim();

    // ------------------------------------------------------------
    // 6. Generate with primary + fallback
    // ------------------------------------------------------------

    console.log(
      `[LESSON SUMMARY] Starting generation. Primary=${PRIMARY_MODEL}, Fallback=${FALLBACK_MODEL}`,
    );

    let geminiResponse: GeminiResponse;
    let usedModel: string;

    try {
      const result =
        await generateWithFallback(
          apiKey,
          prompt,
        );

      geminiResponse = result.response;
      usedModel = result.model;

      console.log(
        `[LESSON SUMMARY] Generated successfully with ${usedModel}.`,
      );
    } catch (error) {
      console.error(
        "[LESSON SUMMARY] All Gemini models failed. Using local fallback.",
        error,
      );

      const localSummary =
        createLocalFallbackSummary(
          title,
          description,
          content,
        );

      return NextResponse.json(
        {
          summary: localSummary,
          lessonId: lesson.id,
          title: lesson.title,
          source: "local-fallback",
        },
        {
          status: 200,
          headers: {
            "Cache-Control":
              "no-store, max-age=0",
          },
        },
      );
    }

    // ------------------------------------------------------------
    // 7. Extract summary
    // ------------------------------------------------------------

    const summary =
      extractSummary(geminiResponse);

    if (!summary) {
      console.error(
        "[LESSON SUMMARY] Gemini returned no summary text.",
      );

      const localSummary =
        createLocalFallbackSummary(
          title,
          description,
          content,
        );

      return NextResponse.json(
        {
          summary: localSummary,
          lessonId: lesson.id,
          title: lesson.title,
          source: "local-fallback",
        },
        {
          status: 200,
        },
      );
    }

    // ------------------------------------------------------------
    // 8. Return
    // ------------------------------------------------------------

    return NextResponse.json(
      {
        summary,
        lessonId: lesson.id,
        title: lesson.title,
        source: usedModel,
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      },
    );
  } catch (error: unknown) {
    console.error(
      "[LESSON SUMMARY] FINAL ERROR:",
      error,
    );

    let message =
      "Unable to generate the lesson summary.";

    if (error instanceof Error) {
      message = error.message;
    }

    const lowerMessage =
      message.toLowerCase();

    if (
      lowerMessage.includes("api key") ||
      lowerMessage.includes("unauthorized") ||
      lowerMessage.includes("permission denied")
    ) {
      return NextResponse.json(
        {
          error:
            "Gemini authentication failed. Check the GEMINI_API_KEY configured for this environment.",
        },
        { status: 502 },
      );
    }

    if (
      lowerMessage.includes("quota") ||
      lowerMessage.includes("rate limit") ||
      lowerMessage.includes("resource exhausted")
    ) {
      return NextResponse.json(
        {
          error:
            "Gemini API quota or rate limit was reached. Please try again shortly.",
        },
        { status: 429 },
      );
    }

    return NextResponse.json(
      {
        error:
          "Unable to generate the lesson summary.",
        details:
          process.env.NODE_ENV === "development"
            ? message
            : undefined,
      },
      { status: 500 },
    );
  }
}