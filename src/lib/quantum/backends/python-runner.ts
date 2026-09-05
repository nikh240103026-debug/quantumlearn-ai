import {
  spawn,
} from "child_process";

import path from "path";

import type {
  BackendExecutionRequest,
  BackendExecutionResult,
} from "./types";

function getPythonExecutable() {
  if (
    process.env.QUANTUM_PYTHON_PATH
  ) {
    return process.env.QUANTUM_PYTHON_PATH;
  }

  if (
    process.platform ===
    "win32"
  ) {
    return path.join(
      process.cwd(),
      ".venv",
      "Scripts",
      "python.exe",
    );
  }

  return path.join(
    process.cwd(),
    ".venv",
    "bin",
    "python",
  );
}

export async function runPythonQuantumBackend(
  request: BackendExecutionRequest,
): Promise<BackendExecutionResult> {
  const python = getPythonExecutable();

  const script = path.join(
    process.cwd(),
    "quantum-engine",
    "engine.py",
  );

  return new Promise(
    (
      resolve,
      reject,
    ) => {
      const startedAt =
        Date.now();

      const child =
        spawn(
          python,
          [
            script,
          ],
          {
            cwd:
              process.cwd(),
            windowsHide:
              true,
            stdio: [
              "pipe",
              "pipe",
              "pipe",
            ],
          },
        );

      let stdout = "";
      let stderr = "";

      child.stdout.on(
        "data",
        (chunk) => {
          stdout += chunk.toString();
        },
      );

      child.stderr.on(
        "data",
        (chunk) => {
          stderr += chunk.toString();
        },
      );

      child.on(
        "error",
        (error) => {
          reject(
            new Error(
              `Unable to start Python quantum engine: ${error.message}`,
            ),
          );
        },
      );

      child.on(
        "close",
        (code) => {
          if (
            code !== 0
          ) {
            reject(
              new Error(
                stderr ||
                  `Quantum engine exited with code ${code}.`,
              ),
            );
            return;
          }

          try {
            const parsed =
              JSON.parse(
                stdout.trim(),
              ) as BackendExecutionResult & {
                success: boolean;
              };

            if (
              !parsed.success
            ) {
              reject(
                new Error(
                  parsed.error ??
                    "Quantum backend execution failed.",
                ),
              );
              return;
            }

            resolve({
              ...parsed,
              executionTimeMs:
                Date.now() -
                startedAt,
            });
          } catch {
            reject(
              new Error(
                `Invalid quantum engine response. ${stderr}`,
              ),
            );
          }
        },
      );

      child.stdin.write(
        JSON.stringify(
          request,
        ),
      );

      child.stdin.end();
    },
  );
}