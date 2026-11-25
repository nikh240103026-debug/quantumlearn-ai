/*
 * Keep personal data and secrets out of error reports and analytics.
 * Safe to import from both browser and server code.
 */

// Path only: query strings and #fragments can hold sign-in tokens.
// Certificate verification tokens are part of the path, so mask those too.
export function safePath(value: string): string {
  const path = value.replace(/^https?:\/\/[^/]+/i, "").split(/[?#]/)[0] || "/";

  return path
    .replace(/^\/verify\/[^/]+/, "/verify/[token]")
    .replace(/^\/guardian\/[^/]+/, "/guardian/[token]")
    .replace(/^\/api\/certificates\/[^/]+\/pdf/, "/api/certificates/[token]/pdf")
    .slice(0, 300);
}

export function redactText(value: string): string {
  return value
    // Query strings inside URLs.
    .replace(/(https?:\/\/[^\s?#)]+)[?#][^\s)]*/g, "$1")
    .replace(/(\/verify\/|\/guardian\/|\/api\/certificates\/)[A-Za-z0-9_-]{8,}/g, "$1[token]")
    .replace(/[\w.+-]+@[\w-]+(\.[\w-]+)*\.[A-Za-z]{2,}/g, "[email]")
    .replace(/\beyJ[\w-]+\.[\w-]+\.[\w-]+/g, "[jwt]")
    .replace(/\b(sb_secret_|sk-|xsmtpsib-|AIza)[\w-]+/g, "[key]");
}
