import "server-only";

import { createHash } from "node:crypto";

import { redactText, safePath } from "@/lib/monitoring/redact";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

type ErrorReport = {
  source: "client" | "server" | "mobile";
  message: string;
  stack?: string | null;
  path: string;
  digest?: string | null;
  userAgent?: string | null;
};

// Group repeats of one bug: ignore ids and numbers that vary per request.
function fingerprintOf(report: ErrorReport): string {
  const firstFrame =
    report.stack?.split("\n").find((line) => /^\s*at |@/.test(line)) ?? "";

  const normalised = `${report.source}|${report.message}|${firstFrame}`
    .replace(/[0-9a-f]{8}-[0-9a-f-]{27}/gi, "<id>")
    .replace(/\d+/g, "#");

  return createHash("sha256").update(normalised).digest("hex");
}

export async function recordAppError(input: ErrorReport): Promise<void> {
  try {
    const report: ErrorReport = {
      ...input,
      message: redactText(input.message).slice(0, 500) || "Unknown error",
      stack: input.stack ? redactText(input.stack).slice(0, 4000) : null,
      path: safePath(input.path),
    };

    const { error } = await createSupabaseAdminClient()
      .rpc("record_app_error", {
        p_fingerprint: fingerprintOf(report),
        p_source: report.source,
        p_message: report.message,
        p_stack: report.stack ?? null,
        p_path: report.path,
        p_digest: report.digest?.slice(0, 100) ?? null,
        p_user_agent: report.userAgent?.slice(0, 300) ?? null,
      })
      .abortSignal(AbortSignal.timeout(3000));

    if (error) console.error("[MONITORING] record failed:", error.message);
  } catch (failure) {
    console.error("[MONITORING] record failed:", failure);
  }
}
