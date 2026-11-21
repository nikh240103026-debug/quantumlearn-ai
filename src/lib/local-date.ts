/*
 * Calendar-day helpers that respect the learner's timezone.
 *
 * Timestamps are stored in UTC. Slicing the ISO string ("YYYY-MM-DD")
 * credits late-night study to the wrong day for anyone not on UTC
 * (e.g. 2 a.m. in India is still the previous day in UTC).
 */

export const TIMEZONE_COOKIE = "tz";

export function isValidTimeZone(
  value: unknown,
): value is string {
  if (typeof value !== "string" || !value || value.length > 64) {
    return false;
  }

  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

// "YYYY-MM-DD" for the given instant in `timeZone`, or null if invalid.
export function localDateKey(
  iso: string,
  timeZone: string,
): string | null {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
