/**
 * Filesystem-safe name generation.
 *
 * Original Beacon names must always be preserved in metadata (tool.json /
 * agent.json). Slugs here are only ever used for directory/file names.
 */

const RESERVED_WINDOWS_NAMES = new Set([
  "CON", "PRN", "AUX", "NUL",
  "COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9",
  "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9",
]);

/**
 * Convert an arbitrary Beacon name/id into a filesystem-safe, stable slug.
 * Deterministic: the same input always produces the same output, so it is
 * safe to use as a directory key across repeated export runs.
 */
export function toSlug(input: string): string {
  const trimmed = (input ?? "").trim();
  if (trimmed.length === 0) {
    return "untitled";
  }

  const DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");
  let slug = trimmed
    .normalize("NFKD")
    .replace(DIACRITICS, "") // strip diacritics
    .replace(/[/\\?%*:|"<>]/g, "-") // filesystem-reserved chars
    .replace(/[^a-zA-Z0-9._-]+/g, "-") // anything else non-safe
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .toLowerCase();

  if (slug.length === 0) {
    slug = "untitled";
  }

  // Windows reserved device names are illegal even with an extension.
  const base = slug.split(".")[0]?.toUpperCase() ?? "";
  if (RESERVED_WINDOWS_NAMES.has(base)) {
    slug = `_${slug}`;
  }

  // Keep paths well under Windows MAX_PATH once nested under
  // beacon-reference/tools/<slug>/... .
  const MAX_LEN = 80;
  if (slug.length > MAX_LEN) {
    slug = slug.slice(0, MAX_LEN).replace(/-+$/, "");
  }

  return slug;
}

/**
 * Build a unique slug given a set of already-used slugs, appending a short
 * numeric suffix on collision (e.g. two Beacon tools whose names only differ
 * by characters that get stripped during slugification).
 */
export function toUniqueSlug(input: string, used: Set<string>): string {
  const base = toSlug(input);
  if (!used.has(base)) {
    used.add(base);
    return base;
  }
  let i = 2;
  let candidate = `${base}-${i}`;
  while (used.has(candidate)) {
    i += 1;
    candidate = `${base}-${i}`;
  }
  used.add(candidate);
  return candidate;
}
