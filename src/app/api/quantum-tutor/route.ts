import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ==========================================================
// MODEL CONFIGURATION
// ==========================================================

const PRIMARY_MODEL =
  process.env.GEMINI_TUTOR_MODEL ??
  "gemini-3.5-flash-lite";

const FALLBACK_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash",
  "gemini-2.5-flash",
];

// ==========================================================
// TYPES
// ==========================================================

type QuantumTutorRequest = {
  question?: unknown;
  qubits?: unknown;
  circuit?: unknown;
  state?: unknown;
  probabilities?: unknown;
};

// ==========================================================
// HELPERS
// ==========================================================

function cleanQuestion(
  value: unknown,
): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, 5000);
}

function safeJson(
  value: unknown,
): string {
  try {
    return JSON.stringify(
      value,
      null,
      2,
    );
  } catch {
    return "Unable to serialize simulator data.";
  }
}

function getStatusCode(
  error: unknown,
): number | null {
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error
  ) {
    const status =
      (error as {
        status?: unknown;
      }).status;

    return typeof status === "number"
      ? status
      : null;
  }

  const message =
    error instanceof Error
      ? error.message
      : String(error);

  const match =
    message.match(
      /\b(4\d\d|5\d\d)\b/,
    );

  return match
    ? Number(match[1])
    : null;
}

function isRetryableError(
  error: unknown,
): boolean {
  const status =
    getStatusCode(error);

  if (
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504
  ) {
    return true;
  }

  const message =
    error instanceof Error
      ? error.message.toLowerCase()
      : String(error).toLowerCase();

  return (
    message.includes(
      "high demand",
    ) ||
    message.includes(
      "temporarily unavailable",
    ) ||
    message.includes(
      "service unavailable",
    ) ||
    message.includes(
      "resource exhausted",
    ) ||
    message.includes(
      "rate limit",
    ) ||
    message.includes(
      "overloaded",
    )
  );
}

function sleep(
  milliseconds: number,
) {
  return new Promise(
    (resolve) =>
      setTimeout(
        resolve,
        milliseconds,
      ),
  );
}

// ==========================================================
// GEMINI REQUEST WITH RETRY
// ==========================================================

async function generateTutorResponse(
  gemini: GoogleGenAI,
  models: string[],
  systemInstruction: string,
  question: string,
) {
  let lastError: unknown = null;

  for (
    let modelIndex = 0;
    modelIndex < models.length;
    modelIndex++
  ) {
    const model =
      models[modelIndex];

    // Two attempts for each model.
    for (
      let attempt = 0;
      attempt < 2;
      attempt++
    ) {
      try {
        console.log(
          `Quantum Tutor: trying ${model}, attempt ${
            attempt + 1
          }`,
        );

        const response =
          await gemini.models.generateContent(
            {
              model,
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: question,
                    },
                  ],
                },
              ],
              config: {
                systemInstruction,
                temperature: 0.35,
                topP: 0.9,
                maxOutputTokens: 1800,
              },
            },
          );

        return {
          response,
          model,
        };
      } catch (error) {
        lastError = error;

        console.error(
          `Quantum Tutor ${model} attempt ${
            attempt + 1
          } failed:`,
          error,
        );

        if (
          !isRetryableError(
            error,
          )
        ) {
          throw error;
        }

        // Exponential backoff:
        //
        // Attempt 1 → 1.5 sec
        // Attempt 2 → 3 sec
        //
        if (
          attempt === 0
        ) {
          await sleep(
            1500,
          );
        }
      }
    }

    console.warn(
      `Quantum Tutor: ${model} unavailable. Trying fallback model.`,
    );
  }

  throw lastError ??
    new Error(
      "All Quantum Tutor models are temporarily unavailable.",
    );
}

// ==========================================================
// POST
// ==========================================================

export async function POST(
  request: Request,
) {
  try {
    // ========================================================
    // AUTHENTICATION
    // ========================================================

    const supabase =
      await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } =
      await supabase.auth.getUser();

    if (
      authError ||
      !user
    ) {
      return NextResponse.json(
        {
          error:
            "You must be logged in to use the Quantum Tutor.",
        },
        {
          status: 401,
        },
      );
    }

    // ========================================================
    // GEMINI API KEY
    // ========================================================

    const apiKey =
      process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error(
        "GEMINI_API_KEY is not configured.",
      );

      return NextResponse.json(
        {
          error:
            "AI Tutor is not configured. Please contact the administrator.",
        },
        {
          status: 500,
        },
      );
    }

    // ========================================================
    // REQUEST BODY
    // ========================================================

    let body: QuantumTutorRequest;

    try {
      body =
        (await request.json()) as QuantumTutorRequest;
    } catch {
      return NextResponse.json(
        {
          error:
            "Invalid request body.",
        },
        {
          status: 400,
        },
      );
    }

    const question =
      cleanQuestion(
        body.question,
      );

    if (!question) {
      return NextResponse.json(
        {
          error:
            "Please enter a question.",
        },
        {
          status: 400,
        },
      );
    }

    // ========================================================
    // SIMULATOR CONTEXT
    // ========================================================

    const qubits =
      typeof body.qubits ===
      "number"
        ? body.qubits
        : null;

    const circuit =
      Array.isArray(
        body.circuit,
      )
        ? body.circuit
        : [];

    const state =
      Array.isArray(
        body.state,
      )
        ? body.state
        : [];

    const probabilities =
      Array.isArray(
        body.probabilities,
      )
        ? body.probabilities
        : [];

    // ========================================================
    // SYSTEM INSTRUCTION
    // ========================================================

    const systemInstruction = `
You are QuantumLearn AI's Quantum Tutor.

You are an expert educational tutor for quantum computing and quantum technology.

The learner is currently using the Quantum Lab circuit simulator.

Your job is to explain the learner's question using the actual simulator context supplied below.

Teaching rules:

1. Explain the concept clearly and progressively.
2. Prefer intuition before advanced mathematics.
3. Use equations when they genuinely help.
4. Explain the effect of gates on the supplied quantum state.
5. Explain probabilities using the supplied probability distribution.
6. Explain measurements when relevant.
7. If the circuit contains CNOT, CZ, or SWAP, explain the control/target relationship.
8. Never invent gates that are not present in the supplied circuit.
9. Never invent quantum-state values.
10. If the supplied simulator state is insufficient to answer something, explicitly say so.
11. Keep the answer focused and educational.
12. Use proper quantum notation such as |0⟩, |1⟩, |ψ⟩, α, β, etc. when useful.
13. Do not claim that you performed an operation that you did not perform.
14. If the learner asks for a circuit idea, give a practical circuit they can build in the current Quantum Lab.
15. If the learner asks why something happened, connect the answer directly to their current circuit.

Current Quantum Lab context:

Number of qubits:
${qubits}

Circuit:
${safeJson(circuit)}

State vector:
${safeJson(state)}

Measurement probabilities:
${safeJson(probabilities)}
`.trim();

    // ========================================================
    // GEMINI CLIENT
    // ========================================================

    const gemini =
      new GoogleGenAI({
        apiKey,
      });

    // ========================================================
    // MODEL ORDER
    // ========================================================

    const models = [
      PRIMARY_MODEL,
      ...FALLBACK_MODELS,
    ].filter(
      (
        model,
        index,
        array,
      ) =>
        array.indexOf(
          model,
        ) === index,
    );

    // ========================================================
    // GENERATE RESPONSE
    // ========================================================

    let result;

    try {
      result =
        await generateTutorResponse(
          gemini,
          models,
          systemInstruction,
          question,
        );
    } catch (error: unknown) {
      console.error(
        "Quantum Tutor: all Gemini models failed.",
        error,
      );

      const status =
        getStatusCode(error);

      if (
        status === 429
      ) {
        return NextResponse.json(
          {
            error:
              "The Quantum Tutor is temporarily rate-limited. Please wait a moment and try again.",
          },
          {
            status: 429,
          },
        );
      }

      if (
        status === 503 ||
        status === 500 ||
        status === 502 ||
        status === 504
      ) {
        return NextResponse.json(
          {
            error:
              "The Quantum Tutor service is temporarily busy. Please try again in a few seconds.",
          },
          {
            status: 503,
          },
        );
      }

      const message =
        error instanceof Error
          ? error.message
          : String(error);

      if (
        message
          .toLowerCase()
          .includes(
            "api key",
          )
      ) {
        return NextResponse.json(
          {
            error:
              "Quantum Tutor authentication failed. Please check GEMINI_API_KEY.",
          },
          {
            status: 500,
          },
        );
      }

      return NextResponse.json(
        {
          error:
            "Unable to contact the Quantum Tutor right now.",
        },
        {
          status: 500,
        },
      );
    }

    // ========================================================
    // RESPONSE TEXT
    // ========================================================

    const answer =
      result.response.text?.trim();

    if (!answer) {
      return NextResponse.json(
        {
          error:
            "Quantum Tutor returned an empty response.",
        },
        {
          status: 500,
        },
      );
    }

    // ========================================================
    // ACTIVITY LOGGING
    // ========================================================

    try {
      await supabase
        .from("ai_activity")
        .insert({
          user_id: user.id,
          activity_type:
            "quantum_lab_tutor",
          source:
            "quantum-lab",
          topic:
            "Quantum Lab",
          title:
            "Quantum Lab Tutor interaction",
          metadata: {
            qubits,
            gateCount:
              circuit.length,
            model:
              result.model,
          },
        });
    } catch (loggingError) {
      console.error(
        "Quantum Tutor activity logging error:",
        loggingError,
      );
    }

    // ========================================================
    // SUCCESS
    // ========================================================

    return NextResponse.json(
      {
        answer,
        model:
          result.model,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "Quantum Tutor unexpected error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "An unexpected error occurred while contacting the Quantum Tutor.",
      },
      {
        status: 500,
      },
    );
  }
}