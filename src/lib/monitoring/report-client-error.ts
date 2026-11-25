import { redactText, safePath } from "@/lib/monitoring/redact";

const MAX_REPORTS_PER_PAGE_LOAD = 10;
const seen = new Set<string>();

// Not bugs in this site: aborted requests, network drops, browser
// noise and Next.js control flow.
const IGNORED =
  /ResizeObserver loop|AbortError|aborted|Failed to fetch|NetworkError|Load failed|^Script error\.?$|NEXT_(REDIRECT|NOT_FOUND)/i;

export function reportClientError(error: unknown) {
  try {
    if (process.env.NODE_ENV !== "production") return;

    const err = error instanceof Error ? error : new Error(String(error));
    const stack = err.stack ?? "";

    // Server errors are already recorded, in full, by instrumentation.ts.
    if ((err as Error & { digest?: string }).digest) return;
    if (IGNORED.test(err.message) || err.name === "AbortError") return;
    if (/(chrome|moz|safari-web)-extension:\/\//.test(stack)) return;

    const key = `${err.name}:${err.message}`;
    if (seen.has(key) || seen.size >= MAX_REPORTS_PER_PAGE_LOAD) return;
    seen.add(key);

    void fetch("/api/errors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        message: redactText(`${err.name}: ${err.message}`).slice(0, 500),
        stack: redactText(stack).slice(0, 4000),
        path: safePath(window.location.pathname),
      }),
    }).catch(() => {});
  } catch {
    // Reporting must never cause an error of its own.
  }
}
