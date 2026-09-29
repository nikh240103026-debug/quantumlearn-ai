import type {
  BackendExecutionRequest,
  BackendExecutionResult,
} from "./types";

const QUANTUM_API_URL =
  process.env.QUANTUM_API_URL;

const QUANTUM_API_KEY =
  process.env.QUANTUM_API_KEY;

const REQUEST_TIMEOUT_MS = 120_000;

const MAX_RESPONSE_SIZE = 5 * 1024 * 1024;

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null
  );
}

function isValidBackendExecutionResult(
  value: unknown,
): value is BackendExecutionResult {
  if (!isRecord(value)) {
    return false;
  }

  if (
    typeof value.success !==
    "boolean"
  ) {
    return false;
  }

  if (
    typeof value.backend !==
    "string"
  ) {
    return false;
  }

  if (
    !Array.isArray(
      value.probabilities,
    )
  ) {
    return false;
  }

  if (
    !isRecord(
      value.probabilityMap,
    )
  ) {
    return false;
  }

  if (
    !isRecord(
      value.counts,
    )
  ) {
    return false;
  }

  if (
    value.statevector !== null &&
    !Array.isArray(
      value.statevector,
    )
  ) {
    return false;
  }

  return true;
}

async function readResponseBody(
  response: Response,
): Promise<unknown> {
  const contentLength =
    response.headers.get(
      "content-length",
    );

  if (
    contentLength &&
    Number.isFinite(
      Number(contentLength),
    ) &&
    Number(contentLength) >
      MAX_RESPONSE_SIZE
  ) {
    throw new Error(
      "Quantum API response is too large.",
    );
  }

  const reader =
    response.body?.getReader();

  if (!reader) {
    const text =
      await response.text();

    if (
      new TextEncoder().encode(
        text,
      ).byteLength >
      MAX_RESPONSE_SIZE
    ) {
      throw new Error(
        "Quantum API response is too large.",
      );
    }

    try {
      return JSON.parse(text);
    } catch {
      throw new Error(
        "Quantum API returned invalid JSON.",
      );
    }
  }

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const {
        done,
        value,
      } = await reader.read();

      if (done) {
        break;
      }

      if (!value) {
        continue;
      }

      totalBytes +=
        value.byteLength;

      if (
        totalBytes >
        MAX_RESPONSE_SIZE
      ) {
        await reader.cancel();

        throw new Error(
          "Quantum API response is too large.",
        );
      }

      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const combined =
    new Uint8Array(
      totalBytes,
    );

  let offset = 0;

  for (
    const chunk of chunks
  ) {
    combined.set(
      chunk,
      offset,
    );

    offset +=
      chunk.byteLength;
  }

  const text =
    new TextDecoder().decode(
      combined,
    );

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      "Quantum API returned invalid JSON.",
    );
  }
}

export async function runPythonQuantumBackend(
  request: BackendExecutionRequest,
): Promise<BackendExecutionResult> {
  if (!QUANTUM_API_URL) {
    throw new Error(
      "Quantum execution service is not configured.",
    );
  }

  const controller =
    new AbortController();

  const timeoutId =
    setTimeout(
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
      Accept:
        "application/json",
    };

    /*
     * The API key is kept server-side.
     * It is never returned to the browser.
     */
    if (QUANTUM_API_KEY) {
      headers[
        "x-api-key"
      ] = QUANTUM_API_KEY;
    }

    const apiEndpoint =
      `${QUANTUM_API_URL.replace(
        /\/+$/,
        "",
      )}/execute`;

    const response =
      await fetch(
        apiEndpoint,
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

    const payload =
      await readResponseBody(
        response,
      );

    /*
     * Do not expose internal Python/FastAPI
     * error details to the application layer.
     */
    if (!response.ok) {
      console.error(
        "Quantum API request failed:",
        {
          status:
            response.status,
          backend:
            request.backend,
        },
      );

      throw new Error(
        `Quantum execution service returned HTTP ${response.status}.`,
      );
    }

    if (
      !isValidBackendExecutionResult(
        payload,
      )
    ) {
      console.error(
        "Quantum API returned an invalid result shape.",
      );

      throw new Error(
        "Quantum execution service returned an invalid response.",
      );
    }

    if (
      payload.success !== true
    ) {
      throw new Error(
        "Quantum backend execution failed.",
      );
    }

    /*
     * Validate numeric probability values.
     */
    for (
      const probability of
        payload.probabilities
    ) {
      if (
        typeof probability !==
          "number" ||
        !Number.isFinite(
          probability,
        ) ||
        probability < 0 ||
        probability > 1
      ) {
        throw new Error(
          "Quantum execution service returned invalid probability data.",
        );
      }
    }

    /*
     * Validate statevector values when
     * a statevector is provided.
     */
    if (
      payload.statevector
    ) {
      for (
        const amplitude of
          payload.statevector
      ) {
        if (
          !isRecord(
            amplitude,
          ) ||
          typeof amplitude.re !==
            "number" ||
          typeof amplitude.im !==
            "number" ||
          !Number.isFinite(
            amplitude.re,
          ) ||
          !Number.isFinite(
            amplitude.im,
          )
        ) {
          throw new Error(
            "Quantum execution service returned invalid statevector data.",
          );
        }
      }
    }

    return payload;
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