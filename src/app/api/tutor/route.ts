import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    // ==========================================================
    // AUTHENTICATE USER
    // ==========================================================

    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "You must be logged in to use the AI Tutor.",
        },
        { status: 401 },
      );
    }

    // ==========================================================
    // CHECK GEMINI API KEY
    // ==========================================================

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("GEMINI_API_KEY is not configured.");

      return NextResponse.json(
        {
          error:
            "AI Tutor is not configured correctly. Gemini API key is missing.",
        },
        { status: 500 },
      );
    }

    const gemini = new GoogleGenAI({
      apiKey,
    });

    // ==========================================================
    // READ REQUEST
    // ==========================================================

    const body = await request.json();

    const lessonId = body.lessonId;
    const question = body.question;
    const previousMessages = body.messages ?? [];

    // ==========================================================
    // VALIDATE LESSON ID
    // ==========================================================

    if (!lessonId || typeof lessonId !== "string") {
      return NextResponse.json(
        {
          error: "Lesson ID is required.",
        },
        { status: 400 },
      );
    }

    // ==========================================================
    // VALIDATE QUESTION
    // ==========================================================

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        {
          error: "Please enter a question.",
        },
        { status: 400 },
      );
    }

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) {
      return NextResponse.json(
        {
          error: "Please enter a question.",
        },
        { status: 400 },
      );
    }

    if (trimmedQuestion.length > 4000) {
      return NextResponse.json(
        {
          error:
            "Your question is too long. Please keep it under 4000 characters.",
        },
        { status: 400 },
      );
    }

    // ==========================================================
    // GET CURRENT LESSON
    // ==========================================================

    const { data: lesson, error: lessonError } = await supabase
      .from("lessons")
      .select(
        "id, course_id, title, description, content, order_index",
      )
      .eq("id", lessonId)
      .eq("is_published", true)
      .single();

    if (lessonError || !lesson) {
      console.error("Lesson lookup error:", lessonError);

      return NextResponse.json(
        {
          error: "Lesson not found.",
        },
        { status: 404 },
      );
    }

    // ==========================================================
    // LIMIT CONVERSATION HISTORY
    // ==========================================================

    const safeMessages = Array.isArray(previousMessages)
      ? previousMessages
          .filter(
            (message) =>
              message &&
              (message.role === "user" ||
                message.role === "assistant") &&
              typeof message.content === "string",
          )
          .slice(-10)
      : [];

    // ==========================================================
    // TUTOR INSTRUCTIONS
    // ==========================================================

    const systemInstructions = `
You are QuantumLearn AI Tutor, an educational tutor specializing in quantum computing.

Your primary job is to help the student understand concepts, not simply provide answers.

CURRENT LESSON
---------------

Lesson number:
${lesson.order_index}

Title:
${lesson.title}

Description:
${lesson.description ?? "No description available."}

Lesson content:
${lesson.content ?? "No lesson content available."}

TEACHING RULES
--------------

1. Use the current lesson as your primary educational context.

2. Explain concepts clearly and progressively.

3. Prefer intuitive explanations before complicated mathematics.

4. When mathematics is necessary, explain important symbols and steps.

5. Use simple examples and analogies when they genuinely help.

6. If the student's understanding appears weak, simplify the explanation.

7. If the question is directly related to the lesson, connect the answer to the lesson.

8. Do not unnecessarily introduce advanced quantum computing concepts far beyond the current lesson.

9. If the student makes a conceptual mistake, politely correct it and explain why.

10. Do not blindly agree with an incorrect statement.

11. When helping solve a problem, guide the student step by step instead of immediately giving only the final answer.

12. When appropriate, provide a small hint first.

13. If the student asks for a quiz, create questions based primarily on the current lesson.

14. If the student asks for an example, make it relevant to quantum computing and the current lesson.

15. If the question is unrelated to quantum computing, briefly explain that you are designed primarily to help with the QuantumLearn course.

16. Never claim that a concept appears in the lesson if it does not actually appear in the provided lesson content.

17. Do not invent information from the lesson.

18. Be encouraging without excessive praise or unnecessary filler.

19. Keep responses reasonably concise unless the student explicitly asks for a detailed explanation.

20. Your goal is to help the student develop genuine understanding.

RESPONSE STYLE
-------------

Use clear paragraphs.

Use bullet points when they improve readability.

Use numbered steps for procedures or problem solving.

Use LaTeX-style mathematical notation when mathematics is required.

Examples:

|0⟩

α|0⟩ + β|1⟩

P(0) = |α|²

Do not use unnecessary headings for very short answers.

Always prioritize correctness and educational clarity.
`;

    // ==========================================================
    // BUILD GEMINI CONVERSATION
    // ==========================================================

    const conversation = [
      ...safeMessages.map(
        (message: {
          role: "user" | "assistant";
          content: string;
        }) => ({
          role:
            message.role === "assistant"
              ? "model"
              : "user",
          parts: [
            {
              text: message.content,
            },
          ],
        }),
      ),

      {
        role: "user" as const,
        parts: [
          {
            text: trimmedQuestion,
          },
        ],
      },
    ];

    // ==========================================================
    // CALL GEMINI
    // ==========================================================

    const response = await gemini.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: conversation,
      config: {
        systemInstruction: systemInstructions,
        maxOutputTokens: 2048,
      },
    });

    // ==========================================================
    // EXTRACT ANSWER
    // ==========================================================

    const answer = response.text?.trim();

    if (!answer) {
      console.error(
        "Gemini returned an empty response.",
      );

      return NextResponse.json(
        {
          error:
            "The AI Tutor did not return a response. Please try again.",
        },
        { status: 500 },
      );
    }

    // ==========================================================
    // RETURN RESPONSE
    // ==========================================================

    return NextResponse.json({
      answer,
    });
  } catch (error: unknown) {
    // ==========================================================
    // ERROR HANDLING
    // ==========================================================

    console.error("Gemini AI Tutor error:", error);

    const errorObject = error as {
      status?: number;
      message?: string;
    };

    const status = errorObject?.status;

    if (status === 429) {
      return NextResponse.json(
        {
          error:
            "Gemini free-tier limit reached temporarily. Please try again later.",
        },
        { status: 429 },
      );
    }

    if (status === 401 || status === 403) {
      return NextResponse.json(
        {
          error:
            "Gemini API authentication failed. Please check your GEMINI_API_KEY.",
        },
        { status },
      );
    }

    if (status === 503) {
      return NextResponse.json(
        {
          error:
            "Gemini is temporarily busy. Please try again in a few seconds.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      {
        error:
          "Something went wrong while contacting the AI Tutor. Please try again.",
      },
      { status: 500 },
    );
  }
}