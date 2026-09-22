import {
  NextRequest,
  NextResponse,
} from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_CODE_LENGTH = 50_000;
const REQUEST_TIMEOUT_MS = 30_000;

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

  return null;
}

export async function POST(
  request: NextRequest,
) {
  try {
    const body =
      await request.json();

    const code =
      typeof body?.code === "string"
        ? body.code
        : "";

    const validationError =
      validateCode(code);

    if (validationError) {
      return NextResponse.json(
        {
          success: false,
          output: "",
          error: validationError,
          executionTime: 0,
        },
        {
          status: 400,
        },
      );
    }

    const quantumApiUrl =
      process.env.QUANTUM_API_URL;

    if (!quantumApiUrl) {
      console.error(
        "QUANTUM_API_URL is not configured.",
      );

      return NextResponse.json(
        {
          success: false,
          output: "",
          error:
            "Quantum execution service is not configured.",
          executionTime: 0,
        },
        {
          status: 500,
        },
      );
    }

    const quantumApiKey =
      process.env.QUANTUM_API_KEY;

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
      };

      if (quantumApiKey) {
        headers[
          "x-api-key"
        ] = quantumApiKey;
      }

      const response =
        await fetch(
          `${quantumApiUrl.replace(
            /\/+$/,
            "",
          )}/execute-code`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({
              code,
            }),
            cache: "no-store",
            signal:
              controller.signal,
          },
        );

      let data: unknown;

      try {
        data =
          await response.json();
      } catch {
        return NextResponse.json(
          {
            success: false,
            output: "",
            error:
              `Quantum execution service returned invalid JSON (HTTP ${response.status}).`,
            executionTime: 0,
          },
          {
            status: 502,
          },
        );
      }

      if (
        typeof data !==
          "object" ||
        data === null
      ) {
        return NextResponse.json(
          {
            success: false,
            output: "",
            error:
              "Quantum execution service returned an invalid response.",
            executionTime: 0,
          },
          {
            status: 502,
          },
        );
      }

      const payload =
        data as {
          success?: boolean;
          output?: string;
          error?: string;
          executionTime?: number;
          detail?: string;
        };

      if (!response.ok) {
        return NextResponse.json(
          {
            success: false,
            output:
              payload.output ?? "",
            error:
              payload.error ??
              payload.detail ??
              `Quantum execution service failed with HTTP ${response.status}.`,
            executionTime:
              payload.executionTime ??
              0,
          },
          {
            status:
              response.status >= 500
                ? 502
                : response.status,
          },
        );
      }

      return NextResponse.json(
        {
          success:
            payload.success === true,
          output:
            payload.output ?? "",
          error:
            payload.error ?? "",
          executionTime:
            typeof payload.executionTime ===
            "number"
              ? payload.executionTime
              : 0,
        },
        {
          status: 200,
        },
      );
    } finally {
      clearTimeout(
        timeoutId,
      );
    }
  } catch (error) {
    console.error(
      "Coding execution proxy error:",
      error,
    );

    if (
      error instanceof Error &&
      error.name ===
        "AbortError"
    ) {
      return NextResponse.json(
        {
          success: false,
          output: "",
          error:
            "Execution service timed out after 30 seconds.",
          executionTime: 0,
        },
        {
          status: 504,
        },
      );
    }

    return NextResponse.json(
      {
        success: false,
        output: "",
        error:
          error instanceof Error
            ? error.message
            : "Unable to connect to the quantum execution service.",
        executionTime: 0,
      },
      {
        status: 500,
      },
    );
  }
}