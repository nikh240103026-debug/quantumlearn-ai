import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

const YEAR_MS = 365 * 24 * 60 * 60 * 1000;

// Points at the Security page, so the contact address lives in one place.
export function GET() {
  return new Response(
    [
      `Contact: ${site.url}/security#disclosure`,
      `Expires: ${new Date(Date.now() + YEAR_MS).toISOString()}`,
      "Preferred-Languages: en",
      `Canonical: ${site.url}/.well-known/security.txt`,
      `Policy: ${site.url}/security`,
      "",
    ].join("\n"),
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
}
