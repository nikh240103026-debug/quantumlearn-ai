import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile, rm, mkdir } from "fs/promises";
import path from "path";
import os from "os";
import crypto from "crypto";

const execFileAsync = promisify(execFile);

const MAX_CODE_LENGTH = 50_000;
const TIMEOUT_MS = 15_000;

const BLOCKED_PATTERNS = [
  /\bos\.system\s*\(/i,
  /\bos\.popen\s*\(/i,
  /\bsubprocess\b/i,
  /\bshutil\b/i,
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

function validateCode(code: string): string | null {
  if (!code.trim()) {
    return "No code was provided.";
  }

  if (code.length > MAX_CODE_LENGTH) {
    return `Code is too large. Maximum allowed size is ${MAX_CODE_LENGTH} characters.`;
  }

  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(code)) {
      return "This code contains a restricted operation and cannot be executed.";
    }
  }

  return null;
}

function findPythonExecutable(): string {
  if (process.env.QUANTUM_PYTHON_PATH) {
    return process.env.QUANTUM_PYTHON_PATH;
  }

  const projectRoot = process.cwd();

  if (process.platform === "win32") {
    return path.join(
      projectRoot,
      ".venv",
      "Scripts",
      "python.exe"
    );
  }

  return path.join(
    projectRoot,
    ".venv",
    "bin",
    "python"
  );
}

export async function POST(request: NextRequest) {
  let tempDirectory: string | null = null;

  try {
    const body = await request.json();

    const code =
      typeof body?.code === "string"
        ? body.code
        : "";

    const validationError = validateCode(code);

    if (validationError) {
      return NextResponse.json(
        {
          success: false,
          output: "",
          error: validationError,
          executionTime: 0,
        },
        { status: 400 }
      );
    }

    tempDirectory = path.join(
      os.tmpdir(),
      `quantumlearn-${crypto.randomUUID()}`
    );

    // Create the temporary execution directory
    await mkdir(tempDirectory, {
      recursive: true,
    });

    const scriptPath = path.join(
      tempDirectory,
      "main.py"
    );

    // Write the user's Python program
    await writeFile(
      scriptPath,
      code,
      "utf8"
    );

    const pythonExecutable = findPythonExecutable();

    const startedAt = Date.now();

    try {
      const { stdout, stderr } =
        await execFileAsync(
          pythonExecutable,
          ["-u", scriptPath],
          {
            cwd: tempDirectory,
            timeout: TIMEOUT_MS,
            maxBuffer: 1024 * 1024,
            windowsHide: true,
            env: {
              ...process.env,
              PATH: process.env.PATH ?? "",
              PYTHONIOENCODING: "utf-8",
              PYTHONUTF8: "1",
            },
          }
        );

      const executionTime =
        Date.now() - startedAt;

      return NextResponse.json({
        success: true,
        output:
          stdout ||
          "Program executed successfully with no output.",
        error: stderr || "",
        executionTime,
      });
    } catch (error: unknown) {
      const executionTime =
        Date.now() - startedAt;

      const execError = error as {
        code?: string | number;
        killed?: boolean;
        signal?: string;
        stdout?: string;
        stderr?: string;
        message?: string;
      };

      if (execError.code === "ENOENT") {
        return NextResponse.json(
          {
            success: false,
            output: "",
            error:
              "Python was not found on this system. Install Python 3.11+ and make sure the python command is available in your PATH.",
            executionTime,
          },
          { status: 500 }
        );
      }

      if (
        execError.killed ||
        execError.signal === "SIGTERM"
      ) {
        return NextResponse.json({
          success: false,
          output: execError.stdout ?? "",
          error:
            "Execution timed out. Your program must finish within 15 seconds.",
          executionTime,
        });
      }

      return NextResponse.json({
        success: false,
        output: execError.stdout ?? "",
        error:
          execError.stderr ||
          execError.message ||
          "Python execution failed.",
        executionTime,
      });
    }
  } catch (error) {
    console.error(
      "Quantum code execution error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        output: "",
        error:
          error instanceof Error
            ? error.message
            : "Unable to process the execution request.",
        executionTime: 0,
      },
      { status: 500 }
    );
  } finally {
    if (tempDirectory) {
      try {
        await rm(tempDirectory, {
          recursive: true,
          force: true,
        });
      } catch (cleanupError) {
        console.error(
          "Failed to clean execution directory:",
          cleanupError
        );
      }
    }
  }
}