/**
 * Beacon's exact response field names aren't known until after discovery.
 * These helpers pick the first present candidate key (case-insensitive) so
 * the client keeps working across minor naming differences, and so we only
 * have to tighten one list here once we've seen real payloads instead of
 * scattering assumptions through the codebase.
 */

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function pickField<T = unknown>(obj: unknown, candidates: string[]): T | undefined {
  if (!isPlainObject(obj)) return undefined;
  const lowerMap = new Map(Object.keys(obj).map((k) => [k.toLowerCase(), k]));
  for (const candidate of candidates) {
    const actualKey = lowerMap.get(candidate.toLowerCase());
    if (actualKey !== undefined && obj[actualKey] !== undefined) {
      return obj[actualKey] as T;
    }
  }
  return undefined;
}

export function pickString(obj: unknown, candidates: string[]): string | null {
  const val = pickField(obj, candidates);
  return typeof val === "string" ? val : val != null ? String(val) : null;
}

export function pickStringArray(obj: unknown, candidates: string[]): string[] {
  const val = pickField(obj, candidates);
  if (Array.isArray(val)) return val.map((v) => (typeof v === "string" ? v : String(v)));
  if (typeof val === "string") return val.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
}

export function pickBoolean(obj: unknown, candidates: string[]): boolean | null {
  const val = pickField(obj, candidates);
  if (typeof val === "boolean") return val;
  if (typeof val === "string") return val.toLowerCase() === "true";
  return null;
}

/**
 * Locate the array of list items inside a paginated/wrapped response body,
 * trying common wrapper keys before falling back to "the response itself is
 * the array".
 */
export function extractArray<T = unknown>(body: unknown, wrapperCandidates: string[]): T[] {
  if (Array.isArray(body)) return body as T[];
  const wrapped = pickField<unknown>(body, wrapperCandidates);
  if (Array.isArray(wrapped)) return wrapped as T[];
  if (isPlainObject(body)) {
    for (const value of Object.values(body)) {
      if (Array.isArray(value)) return value as T[];
    }
  }
  return [];
}

/** Heuristic: does this response look like it has more pages after the current one? */
export function extractHasMore(body: unknown, currentPageSize: number, requestedLimit: number | null): boolean {
  const hasMore = pickField<boolean>(body, ["hasMore", "hasNext", "hasNextPage"]);
  if (typeof hasMore === "boolean") return hasMore;

  const total = pickField<number>(body, ["total", "totalCount", "totalItems", "count"]);
  const page = pickField<number>(body, ["page", "pageNumber", "pageIndex"]);
  const pageSize = pickField<number>(body, ["pageSize", "limit", "size"]) ?? requestedLimit;
  if (typeof total === "number" && typeof page === "number" && typeof pageSize === "number" && pageSize > 0) {
    return page * pageSize < total || (page - 1) * pageSize + currentPageSize < total;
  }

  const nextCursor = pickField(body, ["nextCursor", "cursor", "nextPageToken"]);
  if (nextCursor) return true;

  if (requestedLimit !== null) return currentPageSize >= requestedLimit;
  return false;
}

export function extractCodeText(body: unknown): string | null {
  if (typeof body === "string") return body;
  const val = pickField<string>(body, [
    "code",
    "script",
    "content",
    "source",
    "sourceCode",
    "fetcher",
    "transformer",
    "javascript",
    "js",
    "body",
    "text",
  ]);
  return typeof val === "string" ? val : null;
}
