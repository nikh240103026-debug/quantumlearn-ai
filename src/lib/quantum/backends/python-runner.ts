import type {
  BackendExecutionRequest,
  BackendExecutionResult,
} from "./types";

const QUANTUM_API_URL =
  process.env.QUANTUM_API_URL;

const QUANTUM_API_KEY =
  process.env.QUANTUM_API_KEY;

const REQUEST_TIMEOUT_MS = 120_000;

export async function runPythonQuantumBackend(
  request: BackendExecutionRequest,
): Promise<BackendExecutionResult> {
  if (!QUANTUM_API_URL) {
    throw new Error(
      "QUANTUM_API_URL is not configured.",
    );
  }

  const controller =
    new AbortController();

  const timeoutId = setTimeout(
    () => {
      controller.abort();
    },
    REQUEST_TIMEOUT_MS,
  );

  try {
    const headers: Record<
      string,
      string
    > = {
      "Content-Type":
        "application/json",
    };

    if (QUANTUM_API_KEY) {
      headers[
        "x-api-key"
      ] = QUANTUM_API_KEY;
    }

    const response =
      await fetch(
        `${QUANTUM_API_URL.replace(
          /\/+$/,
          "",
        )}/execute`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(
            request,
          ),
          cache: "no-store",
          signal:
            controller.signal,
        },
      );

    let payload: unknown;

    try {
      payload =
        await response.json();
    } catch {
      throw new Error(
        `Quantum API returned invalid JSON (HTTP ${response.status}).`,
      );
    }

    if (!response.ok) {
      let message =
        `Quantum API request failed with status ${response.status}.`;

      if (
        typeof payload ===
          "object" &&
        payload !== null &&
        "detail" in payload
      ) {
        const detail = (
          payload as {
            detail?: unknown;
          }
        ).detail;

        if (detail) {
          message =
            String(detail);
        }
      }

      if (
        typeof payload ===
          "object" &&
        payload !== null &&
        "error" in payload
      ) {
        const error = (
          payload as {
            error?: unknown;
          }
        ).error;

        if (error) {
          message =
            String(error);
        }
      }

      throw new Error(
        message,
      );
    }

    if (
      typeof payload !==
        "object" ||
      payload === null
    ) {
      throw new Error(
        "Quantum API returned an invalid response.",
      );
    }

    const result =
      payload as BackendExecutionResult;

    if (
      result.success !== true
    ) {
      throw new Error(
        result.error ??
          "Quantum backend execution failed.",
      );
    }

    return result;
  } catch (error) {
    if (
      error instanceof Error &&
      error.name ===
        "AbortError"
    ) {
      throw new Error(
        "Quantum execution timed out after 120 seconds.",
      );
    }

    throw error;
  } finally {
    clearTimeout(
      timeoutId,
    );
  }
}