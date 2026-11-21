/*
 * Helpers for files uploaded to the "resources" storage bucket
 * (see app/api/admin/resources/upload/route.ts).
 */

export const RESOURCE_BUCKET = "resources";

const PUBLIC_PREFIX = `/storage/v1/object/public/${RESOURCE_BUCKET}/`;

// Storage path for a public URL of a file in this bucket, or null for
// external links and anything else.
export function resourceStoragePath(
  fileUrl: unknown,
): string | null {
  if (typeof fileUrl !== "string" || !fileUrl) {
    return null;
  }

  try {
    const url = new URL(fileUrl);
    const index = url.pathname.indexOf(PUBLIC_PREFIX);

    if (index === -1) {
      return null;
    }

    const path = decodeURIComponent(
      url.pathname.slice(index + PUBLIC_PREFIX.length),
    );

    return path && !path.includes("..") ? path : null;
  } catch {
    return null;
  }
}
