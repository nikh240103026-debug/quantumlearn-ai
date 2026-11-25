import type { Instrumentation } from "next";

// Every error that escapes a page or route handler on the server.
export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
) => {
  if (process.env.NODE_ENV !== "production") return;

  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { recordAppError } = await import("@/lib/monitoring/record-error");
    const err = error instanceof Error ? error : new Error(String(error));
    const userAgent = request.headers["user-agent"];

    await recordAppError({
      source: "server",
      message: `${err.name}: ${err.message}`,
      stack: err.stack,
      path: request.path,
      digest: (err as Error & { digest?: string }).digest,
      userAgent: Array.isArray(userAgent) ? userAgent[0] : userAgent,
    });
  }
};
