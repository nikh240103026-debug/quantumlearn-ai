import {
  NextRequest,
  NextResponse,
} from "next/server";
import {
  execFile,
} from "child_process";
import {
  promisify,
} from "util";
import {
  writeFile,
  rm,
  mkdir,
} from "fs/promises";
import path from "path";
import os from "os";
import crypto from "crypto";

const execFileAsync =
  promisify(execFile);

const MAX_CODE_LENGTH = 50_000;
const TIMEOUT_MS = 15_000;

type Difficulty =
  | "Beginner"
  | "Intermediate"
  | "Advanced";

type ChallengeDefinition = {
  id: string;
  points: number;
  difficulty: Difficulty;
  topic: string;
  expected: string;
  requiredPatterns: RegExp[];
  forbiddenPatterns?: RegExp[];
};

const CHALLENGES: ChallengeDefinition[] = [
  {
    id: "create-qubit",
    points: 10,
    difficulty: "Beginner",
    topic: "Quantum Circuit",
    expected:
      "Circuit created with exactly 1 qubit.",
    requiredPatterns: [
      /QuantumCircuit\s*\(\s*1\s*\)/i,
    ],
  },

  {
    id: "apply-x",
    points: 15,
    difficulty: "Beginner",
    topic: "Quantum Gates",
    expected:
      "Pauli-X gate applied to qubit 0.",
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
    expected:
      "Hadamard gate applied to qubit 0.",
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
    expected:
      "Bell-state circuit created using H and CNOT.",
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
    expected:
      "Qubit measured into classical bit 0.",
    requiredPatterns: [
      /QuantumCircuit\s*\(\s*1\s*,\s*1\s*\)/i,
      /\.h\s*\(\s*0\s*\)/i,
      /\.measure\s*\(\s*0\s*,\s*0\s*\)/i,
    ],
  },
];

const BLOCKED_PATTERNS = [
  /\bos\.system\s*\(/i,
  /\bos\.popen\s*\(/i,
  /\bsubprocess\b/i,
  /\bsocket\b/i,
  /\brequests\b/i,
  /\burllib\b/i,
  /\bhttpx\b/i,
  /\bctypes\b/i,
  /\bwinreg\b/i,
  /\bpathlib\b/i,
  /\bopen\s*\(/i,
  /\b__import__\s*\(/i,
  /\beval\s*\(/i,
  /\bexec\s*\(/i,
  /\bcompile\s*\(/i,
];

function getPythonExecutable(): string {
  if (
    process.env
      .QUANTUM_PYTHON_PATH
  ) {
    return process.env
      .QUANTUM_PYTHON_PATH;
  }

  const root =
    process.cwd();

  if (
    process.platform ===
    "win32"
  ) {
    return path.join(
      root,
      ".venv",
      "Scripts",
      "python.exe",
    );
  }

  return path.join(
    root,
    ".venv",
    "bin",
    "python",
  );
}

function findChallenge(
  id: unknown,
): ChallengeDefinition | null {
  if (
    typeof id !== "string"
  ) {
    return null;
  }

  return (
    CHALLENGES.find(
      (challenge) =>
        challenge.id === id,
    ) ?? null
  );
}

function validateCode(
  code: string,
): string | null {
  if (!code.trim()) {
    return "No code was provided.";
  }

  if (
    code.length >
    MAX_CODE_LENGTH
  ) {
    return `Code is too large. Maximum allowed size is ${MAX_CODE_LENGTH} characters.`;
  }

  for (
    const pattern of BLOCKED_PATTERNS
  ) {
    if (
      pattern.test(code)
    ) {
      return "This code contains a restricted operation and cannot be executed.";
    }
  }

  return null;
}

function gradeChallenge(
  challenge: ChallengeDefinition,
  code: string,
  output: string,
) {
  const missingPatterns =
    challenge.requiredPatterns.filter(
      (pattern) =>
        !pattern.test(code),
    );

  const executionSucceeded =
    output.length > 0;

  const passed =
    executionSucceeded &&
    missingPatterns.length === 0;

  return {
    passed,
    missingRequirements:
      missingPatterns.length,
    feedback: passed
      ? `${challenge.expected}`
      : missingPatterns.length > 0
        ? "Your program executed, but the required quantum operations are not all present."
        : "The program did not produce valid output.",
  };
}

export async function POST(
  request: NextRequest,
) {
  let tempDirectory:
    | string
    | null = null;

  try {
    const body =
      await request.json();

    const challenge =
      findChallenge(
        body?.challengeId,
      );

    if (!challenge) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid challenge.",
        },
        {
          status: 400,
        },
      );
    }

    const code =
      typeof body?.code ===
      "string"
        ? body.code
        : "";

    const validationError =
      validateCode(code);

    if (validationError) {
      return NextResponse.json(
        {
          success: false,
          error:
            validationError,
        },
        {
          status: 400,
        },
      );
    }

    tempDirectory =
      path.join(
        os.tmpdir(),
        `quantumlearn-challenge-${crypto.randomUUID()}`,
      );

    await mkdir(
      tempDirectory,
      {
        recursive: true,
      },
    );

    const scriptPath =
      path.join(
        tempDirectory,
        "main.py",
      );

    await writeFile(
      scriptPath,
      code,
      "utf8",
    );

    const python =
      getPythonExecutable();

    const startedAt =
      Date.now();

    try {
      const {
        stdout,
        stderr,
      } =
        await execFileAsync(
          python,
          [
            "-u",
            scriptPath,
          ],
          {
            cwd:
              tempDirectory,
            timeout:
              TIMEOUT_MS,
            maxBuffer:
              1024 * 1024,
            windowsHide:
              true,
            env: {
              ...process.env,
              PYTHONIOENCODING:
                "utf-8",
              PYTHONUTF8:
                "1",
            },
          },
        );

      const executionTime =
        Date.now() -
        startedAt;

      const output =
        stdout ||
        "";

      const grading =
        gradeChallenge(
          challenge,
          code,
          output,
        );

      return NextResponse.json(
        {
          success: true,
          passed:
            grading.passed,
          challengeId:
            challenge.id,
          points:
            grading.passed
              ? challenge.points
              : 0,
          maxPoints:
            challenge.points,
          feedback:
            grading.feedback,
          missingRequirements:
            grading.missingRequirements,
          output,
          error:
            stderr || "",
          executionTime,
        },
        {
          status: 200,
        },
      );
    } catch (
      error: unknown
    ) {
      const executionTime =
        Date.now() -
        startedAt;

      const execError =
        error as {
          killed?: boolean;
          signal?: string;
          stdout?: string;
          stderr?: string;
          message?: string;
        };

      if (
        execError.killed ||
        execError.signal ===
          "SIGTERM"
      ) {
        return NextResponse.json(
          {
            success: false,
            passed: false,
            challengeId:
              challenge.id,
            points: 0,
            maxPoints:
              challenge.points,
            output:
              execError.stdout ??
              "",
            error:
              "Execution timed out. Your program must finish within 15 seconds.",
            executionTime,
          },
          {
            status: 200,
          },
        );
      }

      return NextResponse.json(
        {
          success: false,
          passed: false,
          challengeId:
            challenge.id,
          points: 0,
          maxPoints:
            challenge.points,
          output:
            execError.stdout ??
            "",
          error:
            execError.stderr ||
            execError.message ||
            "Python execution failed.",
          executionTime,
        },
        {
          status: 200,
        },
      );
    }
  } catch (
    error
  ) {
    console.error(
      "Coding challenge submission error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to grade challenge.",
      },
      {
        status: 500,
      },
    );
  } finally {
    if (
      tempDirectory
    ) {
      try {
        await rm(
          tempDirectory,
          {
            recursive:
              true,
            force: true,
          },
        );
      } catch (
        cleanupError
      ) {
        console.error(
          "Challenge cleanup failed:",
          cleanupError,
        );
      }
    }
  }
}