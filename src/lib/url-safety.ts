/*
 * Validation for user-supplied URLs that are later rendered as links
 * (<a href>) or images (CSS url(...)).
 *
 * Only absolute http(s) URLs are accepted: no javascript:, data:,
 * file: or protocol-relative tricks, and no embedded credentials.
 */

export const MAX_URL_LENGTH = 2048;

export function toSafeHttpUrl(
  value: unknown,
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed || trimmed.length > MAX_URL_LENGTH) {
    return null;
  }

  let url: URL;

  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return null;
  }

  if (url.username || url.password) {
    return null;
  }

  return url.href;
}

// For CSS `background-image`: quote the URL and escape characters that
// could terminate the url("...") token.
export function cssUrl(value: string): string {
  return `url("${value.replace(/["\\\n\r]/g, (char) => encodeURIComponent(char))}")`;
}
