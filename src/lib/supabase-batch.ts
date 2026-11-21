/*
 * Helpers for queries that would otherwise break at scale.
 *
 * - `.in("col", ids)` puts every id in the request URL; a few hundred
 *   UUIDs exceed URL length limits and the request fails.
 * - PostgREST returns at most 1000 rows per request (`max-rows`), so a
 *   larger `.limit()` is silently capped.
 */

type QueryResult<T> = PromiseLike<{
  data: T[] | null;
  error: unknown;
}>;

export const ID_CHUNK_SIZE = 100;
export const PAGE_SIZE = 1000;

// Fetch every page of a query. `build(from, to)` must apply `.range()`.
export async function fetchAllPages<T>(
  build: (from: number, to: number) => QueryResult<T>,
  maxRows = 50_000,
): Promise<{ data: T[]; error: unknown }> {
  const rows: T[] = [];

  for (let from = 0; from < maxRows; from += PAGE_SIZE) {
    const { data, error } = await build(from, from + PAGE_SIZE - 1);

    if (error) {
      return { data: rows, error };
    }

    rows.push(...(data ?? []));

    if (!data || data.length < PAGE_SIZE) {
      break;
    }
  }

  return { data: rows, error: null };
}

// Run `build` for each chunk of ids (and every page of each chunk).
export async function fetchForIds<T>(
  ids: string[],
  build: (
    chunk: string[],
    from: number,
    to: number,
  ) => QueryResult<T>,
  maxRowsPerChunk = 50_000,
): Promise<{ data: T[]; error: unknown }> {
  const rows: T[] = [];

  for (let i = 0; i < ids.length; i += ID_CHUNK_SIZE) {
    const chunk = ids.slice(i, i + ID_CHUNK_SIZE);

    const { data, error } = await fetchAllPages<T>(
      (from, to) => build(chunk, from, to),
      maxRowsPerChunk,
    );

    if (error) {
      return { data: rows, error };
    }

    rows.push(...data);
  }

  return { data: rows, error: null };
}
