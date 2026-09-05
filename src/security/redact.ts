/**
 * Secret redaction shared by the discovery capture pipeline and the Phase-2
 * API client. Applied to *every* header/body we persist to disk, whether
 * that's discovery-output/ (gitignored, exploratory) or beacon-reference/
 * (committed, meant for Claude Code to read).
 */

export const REDACTED = "[REDACTED]";

/** Header names that must never be written to disk in any form. */
const SECRET_HEADER_NAMES = [
  "authorization",
  "cookie",
  "set-cookie",
  "proxy-authorization",
  "x-api-key",
  "x-auth-token",
  "x-access-token",
  "x-csrf-token",
  "x-xsrf-token",
];

/** Substring match against header names, for vendor-specific auth headers. */
const SECRET_HEADER_HINTS = ["token", "secret", "apikey", "api-key", "auth", "session"];

/** Object key patterns that indicate secret *values*, wherever they appear in a body. */
const SECRET_KEY_HINTS = [
  "password",
  "passwd",
  "secret",
  "token",
  "apikey",
  "api_key",
  "access_key",
  "accesskey",
  "authorization",
  "auth_header",
  "bearer",
  "privatekey",
  "private_key",
  "clientsecret",
  "client_secret",
  "sessionid",
  "session_id",
  "refresh_token",
  "refreshtoken",
  "cookie",
];

function isSecretHeaderName(name: string): boolean {
  const lower = name.toLowerCase();
  if (SECRET_HEADER_NAMES.includes(lower)) return true;
  return SECRET_HEADER_HINTS.some((hint) => lower.includes(hint));
}

function isSecretKeyName(key: string): boolean {
  const lower = key.toLowerCase().replace(/[-\s]/g, "_");
  return SECRET_KEY_HINTS.some((hint) => lower.includes(hint.replace(/[-\s]/g, "_")));
}

/**
 * Redact a headers map (case-insensitive keys). Returns a new object; never
 * mutates the input.
 */
export function redactHeaders(headers: Record<string, string> | undefined | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!headers) return out;
  for (const [key, value] of Object.entries(headers)) {
    out[key] = isSecretHeaderName(key) ? REDACTED : value;
  }
  return out;
}

/**
 * Deep-redact a JSON-like value. Keys matching secret hints are replaced
 * with a placeholder; structure (arrays/objects/other keys) is preserved so
 * discovery output still teaches us the shape of the payload.
 */
export function redactJson<T>(value: T, depth = 0): T {
  if (depth > 25) return value; // guard against pathological/circular input
  if (Array.isArray(value)) {
    return value.map((item) => redactJson(item, depth + 1)) as unknown as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (isSecretKeyName(key)) {
        out[key] = typeof val === "string" && val.length === 0 ? "" : REDACTED;
      } else {
        out[key] = redactJson(val, depth + 1);
      }
    }
    return out as unknown as T;
  }
  return value;
}

/**
 * Redact secrets embedded directly in a URL: query-string params matching
 * secret hints, and common `Bearer <token>`-in-path mistakes.
 */
export function redactUrl(rawUrl: string): string {
  try {
    const url = new URL(rawUrl);
    for (const key of Array.from(url.searchParams.keys())) {
      if (isSecretKeyName(key)) {
        url.searchParams.set(key, REDACTED);
      }
    }
    return url.toString();
  } catch {
    return rawUrl;
  }
}

/**
 * Best-effort redaction of a raw string body that failed JSON parsing
 * (e.g. form-encoded). Masks `key=value` and `"key":"value"` pairs whose key
 * matches a secret hint.
 */
export function redactRawText(text: string): string {
  return text.replace(
    /(["']?)([\w.-]+)\1(\s*[:=]\s*)(["']?)([^"'&,}\s]+)\4/g,
    (match, _keyQuote, key, sep, valQuote) => {
      if (!isSecretKeyName(key)) return match;
      return `${_keyQuote}${key}${_keyQuote}${sep}${valQuote}${REDACTED}${valQuote}`;
    },
  );
}
