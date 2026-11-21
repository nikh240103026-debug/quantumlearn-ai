/*
 * Recognise "this database object doesn't exist yet" errors, so code
 * that depends on a pending migration can fall back gracefully.
 * Codes: PostgREST PGRST2xx (schema cache) and Postgres SQLSTATE.
 */

function errorCode(error: unknown): string {
  return typeof error === "object" &&
    error !== null &&
    "code" in error
    ? String((error as { code?: unknown }).code)
    : "";
}

export function isMissingFunctionError(error: unknown): boolean {
  const code = errorCode(error);
  return code === "PGRST202" || code === "42883";
}

export function isMissingTableError(error: unknown): boolean {
  const code = errorCode(error);
  return code === "PGRST205" || code === "42P01";
}

export function isMissingColumnError(error: unknown): boolean {
  const code = errorCode(error);
  return code === "PGRST204" || code === "42703";
}
