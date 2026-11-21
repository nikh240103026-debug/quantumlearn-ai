/*
 * Loads every page of a paginated admin list endpoint.
 *
 * Parent dropdowns (lesson for a chapter, course for a lesson) used to
 * fetch only the first 100 rows, so later items couldn't be selected and
 * editing an item whose parent was beyond 100 showed the wrong parent.
 */
export async function fetchAllAdminPages<T>(
  path: string,
  key: string,
  pageSize = 100,
): Promise<T[]> {
  const items: T[] = [];
  const separator = path.includes("?") ? "&" : "?";

  // Hard stop so a misbehaving API can't loop forever.
  for (let page = 1; page <= 200; page++) {
    const response = await fetch(
      `${path}${separator}page=${page}&pageSize=${pageSize}`,
      {
        credentials: "same-origin",
        cache: "no-store",
      },
    );

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result?.error || "Request failed.");
    }

    const pageItems: T[] = Array.isArray(result?.[key])
      ? result[key]
      : [];

    items.push(...pageItems);

    const totalPages = Number(result?.pagination?.totalPages ?? 1);

    if (pageItems.length === 0 || page >= totalPages) {
      break;
    }
  }

  return items;
}
