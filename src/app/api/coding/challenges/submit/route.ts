import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_CODE_LENGTH = 50_000;
const REQUEST_TIMEOUT_MS = 30_000;

type Difficulty = "Beginner" | "Intermediate" | "Advanced";

type ChallengeDefinition = {
  id: string;
  points: number;
  difficulty: Difficulty;
  topic: string;
  expected: string;
  requiredPatterns: RegExp[];
};

type QuantumExecutionResponse = {
  success?: boolean;
  output?: string;
  error?: string;
  executionTime?: number;
  detail?: string;
};

const CHALLENGES: ChallengeDefinition[] = [
  {
    id: "create-qubit",
    points: 10,
    difficulty: "Beginner",
    topic: "Quantum Circuit",
    expected: "Circuit created with exactly 1 qubit.",
    requiredPatterns: [/QuantumCircuit\s*\(\s*1\s*\)/i],
  },

  {
    id: "apply-x",
    points: 15,
    difficulty: "Beginner",
    topic: "Quantum Gates",
    expected: "Pauli-X gate applied to qubit 0.",
    requiredPatterns: [
      /QuantumCircuit\s*\(\s*1\s*\)/i,
      /\.x\s*\(\s*0\s*\)/i,
    ],
  },

  {
    id: "superposition",
    points: 20,
    difficulty: "Beginner",
    topic: "Superposition",
    expected: "Hadamard gate applied to qubit 0.",
    requiredPatterns: [
      /QuantumCircuit\s*\(\s*1\s*\)/i,
      /\.h\s*\(\s*0\s*\)/i,
    ],
  },

  {
    id: "bell-state",
    points: 30,
    difficulty: "Intermediate",
    topic: "Entanglement",
    expected: "Bell-state circuit created using H and CNOT.",
    requiredPatterns: [
      /QuantumCircuit\s*\(\s*2\s*\)/i,
      /\.h\s*\(\s*0\s*\)/i,
      /\.cx\s*\(\s*0\s*,\s*1\s*\)/i,
    ],
  },

  {
    id: "measurement",
    points: 35,
    difficulty: "Intermediate",
    topic: "Measurement",
    expected: "Qubit measured into classical bit 0.",
    requiredPatterns: [
      /QuantumCircuit\s*\(\s*1\s*,\s*1\s*\)/i,
      /\.h\s*\(\s*0\s*\)/i,
      /\.measure\s*\(\s*0\s*,\s*0\s*\)/i,
    ],
  },
];

function findChallenge(
  id: unknown,
): ChallengeDefinition | null {
  if (typeof id !== "string") {
    return null;
  }

  const challenge = CHALLENGES.find(
    (item) => item.id === id,
  );

  return challenge ?? null;
}

function validateCode(code: string): string | null {
  if (!code.trim()) {
    return "No code was provided.";
  }

  if (code.length > MAX_CODE_LENGTH) {
    return `Code is too large. Maximum allowed size is ${MAX_CODE_LENGTH} characters.`;
  }

  return null;
}

function gradeChallenge(
  challenge: ChallengeDefinition,
  code: string,
  output: string,
) {
  const missingPatterns = challenge.requiredPatterns.filter(
    (pattern) => !pattern.test(code),
  );

  const executionSucceeded = output.trim().length > 0;

  const passed =
    executionSucceeded && missingPatterns.length === 0;

  let feedback: string;

  if (passed) {
    feedback = challenge.expected;
  } else if (missingPatterns.length > 0) {
    feedback =
      "Your program executed, but the required quantum operations are not all present.";
  } else {
    feedback =
      "The program did not produce valid output.";
  }

  return {
    passed,
    missingRequirements: missingPatterns.length,
    feedback,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const challenge = findChallenge(body?.challengeId);

    if (!challenge) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid challenge.",
        },
        {
          status: 400,
        },
      );
    }

    const code =
      typeof body?.code === "string"
        ? body.code
        : "";

    const validationError = validateCode(code);

    if (validationError) {
      return NextResponse.json(
        {
          success: false,
          error: validationError,
        },
        {
          status: 400,
        },
      );
    }

    const quantumApiUrl =
      process.env.QUANTUM_API_URL;

    if (!quantumApiUrl) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Quantum execution service is not configured. Please check QUANTUM_API_URL.",
        },
        {
          status: 500,
        },
      );
    }

    const quantumApiKey =
      process.env.QUANTUM_API_KEY;

    const controller = new AbortController();

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, REQUEST_TIMEOUT_MS);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (quantumApiKey) {
        headers["x-api-key"] = quantumApiKey;
      }

      const apiEndpoint =
        `${quantumApiUrl.replace(/\/+$/, "")}/execute-code`;

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({
          code,
        }),
        cache: "no-store",
        signal: controller.signal,
      });

      let execution: QuantumExecutionResponse | null = null;

      try {
        execution =
          (await response.json()) as QuantumExecutionResponse;
      } catch {
        execution = null;
      }

      const output = execution?.output ?? "";

      const executionError =
        execution?.error ??
        execution?.detail ??
        "";

      const executionTime =
        typeof execution?.executionTime === "number"
          ? execution.executionTime
          : 0;

      if (
        !response.ok ||
        execution?.success !== true
      ) {
        return NextResponse.json(
          {
            success: false,
            passed: false,
            challengeId: challenge.id,
            points: 0,
            maxPoints: challenge.points,
            output,
            error:
              executionError ||
              `Execution service failed with HTTP ${response.status}.`,
            executionTime,
          },
          {
            status: 200,
          },
        );
      }

      const grading = gradeChallenge(
        challenge,
        code,
        output,
      );

      return NextResponse.json(
        {
          success: true,
          passed: grading.passed,
          challengeId: challenge.id,
          points: grading.passed
            ? challenge.points
            : 0,
          maxPoints: challenge.points,
          feedback: grading.feedback,
          missingRequirements:
            grading.missingRequirements,
          output,
          error: executionError,
          executionTime,
        },
        {
          status: 200,
        },
      );
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        error.name === "AbortError"
      ) {
        return NextResponse.json(
          {
            success: false,
            passed: false,
            challengeId: challenge.id,
            points: 0,
            maxPoints: challenge.points,
            output: "",
            error:
              "Execution service timed out after 30 seconds.",
            executionTime: REQUEST_TIMEOUT_MS,
          },
          {
            status: 200,
          },
        );
      }

      console.error(
        "Quantum API request failed:",
        error,
      );

      return NextResponse.json(
        {
          success: false,
          passed: false,
          challengeId: challenge.id,
          points: 0,
          maxPoints: challenge.points,
          output: "",
          error:
            error instanceof Error
              ? error.message
              : "Unable to connect to the quantum execution service.",
          executionTime: 0,
        },
        {
          status: 200,
        },
      );
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error: unknown) {
    console.error(
      "Coding challenge submission error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        passed: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to grade challenge.",
      },
      {
        status: 500,
      },
    );
  }
}