import { createHash } from "node:crypto";

/**
 * Stable JSON stringify: sorts object keys recursively so semantically
 * identical objects hash the same way regardless of key order returned by
 * the API.
 */
export function stableStringify(value: unknown): string {
  return JSON.stringify(sortKeysDeep(value));
}

function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortKeysDeep);
  }
  if (value && typeof value === "object") {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      sorted[key] = sortKeysDeep((value as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  return value;
}

/** SHA-256 content hash used for --changed-only sync and manifest tracking. */
export function contentHash(value: unknown): string {
  const input = typeof value === "string" ? value : stableStringify(value);
  return createHash("sha256").update(input, "utf8").digest("hex");
}

/** Short, human-friendly prefix of a content hash for logs/reports. */
export function shortHash(hash: string, length = 12): string {
  return hash.slice(0, length);
}
