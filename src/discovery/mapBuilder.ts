import type { CapturedExchange, DiscoverySession, EndpointCandidate, EndpointMap } from "./types.js";

/**
 * Beacon (confirmed via real discovery capture) has no per-tab endpoints —
 * Basic Details/Arguments/Fetcher/Transformer/Source/Test are all rendered
 * from ONE already-fetched tool record. So every step after the tool is
 * opened is a candidate source for the single "getTool" operation; only
 * "tools-list" / "agents-list" map to their own list operations.
 */
const STEP_TO_OPERATIONS: Record<string, string[]> = {
  "tools-list": ["listTools"],
  "agents-list": ["listAgents"],
  "open-tool": ["getTool", "listTools"],
  "basic-details": ["getTool"],
  arguments: ["getTool"],
  fetcher: ["getTool"],
  transformer: ["getTool"],
  source: ["getTool"],
  test: ["getTool"],
  "functions-list": ["listFunctions"],
  "open-function": ["getFunction", "listFunctions"],
};

const ALL_OPERATIONS = ["listTools", "listAgents", "getTool", "listFunctions", "getFunction"];

/** Query-string keys that vary per-call and should become `{token}` placeholders rather than literal values. */
const TEMPLATE_QUERY_KEYS = new Set(["page", "limit", "offset", "cursor", "size", "pagesize", "pageindex", "pagenumber", "filters", "q"]);

/** Paths that are noise for our purposes: SSR page navigation, org-wide config polling, auth plumbing — never tool/agent data. */
const NOISE_PATH_EXACT = new Set([
  "/login",
  "/api/org",
  "/api/org-config",
  "/api/profile",
  "/api/accounts",
  "/api/accounts/switch",
  "/api/login",
  "/api/verify",
]);

function isNoisePath(pathname: string): boolean {
  if (NOISE_PATH_EXACT.has(pathname)) return true;
  if (pathname.startsWith("/agent-studio/")) return true; // Next.js page/RSC navigation, not a data API
  return false;
}

function isNoiseResponse(body: unknown): boolean {
  if (body === null || body === undefined) return true;
  if (typeof body === "string") {
    const trimmed = body.trim();
    if (trimmed.length === 0) return true;
    if (/^\d+:/.test(trimmed)) return true; // Next.js RSC stream framing ("0:...", "1:...")
  }
  return false;
}

function hasKeys(body: unknown, keys: string[]): boolean {
  if (!body || typeof body !== "object" || Array.isArray(body)) return false;
  const present = new Set(Object.keys(body as Record<string, unknown>).map((k) => k.toLowerCase()));
  return keys.every((k) => present.has(k.toLowerCase()));
}

function looksLikeListResponse(body: unknown): boolean {
  return hasKeys(body, ["count", "result"]) || hasKeys(body, ["result"]) || hasKeys(body, ["items"]) || hasKeys(body, ["data"]);
}

function looksLikeToolDetail(body: unknown): boolean {
  // fetcher/transformer are the most distinctive fields Beacon's tool record carries.
  return hasKeys(body, ["fetcher"]) || hasKeys(body, ["transformer"]) || hasKeys(body, ["signature"]);
}

/** Generic "single record, not a list wrapper" check — used where we don't yet know a type's exact shape (e.g. Functions). */
function looksLikeSingleRecord(body: unknown): boolean {
  if (!body || typeof body !== "object" || Array.isArray(body)) return false;
  if (looksLikeListResponse(body)) return false;
  return Object.keys(body as Record<string, unknown>).length >= 3;
}

/**
 * Collects known tool/agent ids strictly from top-level list items (the
 * `result`/`items`/`data` array), reading only `_id`/`id` — NOT a deep
 * recursive scan. A recursive scan over every `*Id`-suffixed field
 * (userId, orgId, requestId, ...) produces false positives that corrupt
 * unrelated URL segments/query values when templated.
 */
function collectKnownIds(body: unknown, bucket: Set<string>): void {
  if (!body || typeof body !== "object") return;
  const obj = body as Record<string, unknown>;
  const arr = (["result", "items", "data", "tools", "agents", "functions"] as const)
    .map((k) => obj[k])
    .find((v) => Array.isArray(v)) as unknown[] | undefined;
  if (!arr) return;
  for (const item of arr) {
    if (!item || typeof item !== "object") continue;
    for (const key of ["_id", "id"]) {
      const val = (item as Record<string, unknown>)[key];
      if (typeof val === "string" && val.length > 0) bucket.add(val);
    }
  }
}

/** Rebuilds a URL as a template string without ever percent-encoding our own `{token}` placeholders. */
function templateizeUrl(rawUrl: string, knownIds: Set<string>): string {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return rawUrl;
  }

  const pathSegments = url.pathname.split("/").map((seg) => {
    const decoded = decodeURIComponent(seg);
    return knownIds.has(decoded) ? "{id}" : seg;
  });
  const templatedPath = pathSegments.join("/");

  const queryParts: string[] = [];
  for (const [key, value] of url.searchParams) {
    const lowerKey = key.toLowerCase();
    if (TEMPLATE_QUERY_KEYS.has(lowerKey)) {
      queryParts.push(`${key}={${lowerKey}}`);
    } else if (knownIds.has(value)) {
      queryParts.push(`${key}={id}`);
    } else {
      queryParts.push(`${key}=${encodeURIComponent(value)}`);
    }
  }

  return queryParts.length > 0 ? `${templatedPath}?${queryParts.join("&")}` : templatedPath;
}

function responseShapeHint(body: unknown, depth = 0): string[] {
  if (depth > 2 || body === null || body === undefined) return [];
  if (Array.isArray(body)) {
    return body.length > 0 ? [`array[${responseShapeHint(body[0], depth + 1).join(",") || "?"}]`] : ["array[]"];
  }
  if (typeof body === "object") {
    return Object.keys(body as Record<string, unknown>).slice(0, 20);
  }
  return [typeof body];
}

function scoreCandidate(exchange: CapturedExchange, operation: string): number {
  if (exchange.method !== "GET") return -100;

  let pathname: string;
  try {
    pathname = new URL(exchange.url).pathname;
  } catch {
    pathname = exchange.url;
  }

  if (isNoisePath(pathname)) return -100;
  if (isNoiseResponse(exchange.responseBody)) return -100;
  if (exchange.status === null || exchange.status < 200 || exchange.status >= 300) return -50;

  const isListOp = operation === "listTools" || operation === "listAgents" || operation === "listFunctions";
  const isGetToolOp = operation === "getTool";
  const isGetFunctionOp = operation === "getFunction";

  let score = 0;
  if (isListOp) {
    if (looksLikeListResponse(exchange.responseBody)) score += 6;
    if (looksLikeToolDetail(exchange.responseBody)) score -= 3; // a detail payload isn't a list
  }
  if (isGetToolOp) {
    if (looksLikeToolDetail(exchange.responseBody)) score += 6;
    if (looksLikeListResponse(exchange.responseBody)) score -= 3; // a list isn't a single-tool detail
  }
  if (isGetFunctionOp) {
    if (looksLikeSingleRecord(exchange.responseBody)) score += 4; // shape unknown yet, so a weaker signal than getTool's
    if (looksLikeListResponse(exchange.responseBody)) score -= 3;
  }

  const opKeyword = operation === "listTools" || operation === "getTool" ? "tool" : operation === "listAgents" ? "agent" : "function";
  if (pathname.toLowerCase().includes(opKeyword)) score += 1;
  if (pathname.toLowerCase().includes("list") && isListOp) score += 1;
  if (pathname.toLowerCase().includes("get") && (isGetToolOp || isGetFunctionOp)) score += 1;

  return score;
}

/**
 * Build a best-effort endpoint map from a discovery session. Confidence is
 * "high" only for a clean, unambiguous structural match; "medium"/"low"
 * entries are drafts worth a human glance before beacon:export relies on
 * them (see the `notes` array for specifics).
 */
export function buildEndpointMap(session: DiscoverySession): EndpointMap {
  const knownIds = new Set<string>();
  for (const exchange of session.exchanges) {
    if (
      exchange.step === "tools-list" ||
      exchange.step === "agents-list" ||
      exchange.step === "open-tool" ||
      exchange.step === "functions-list" ||
      exchange.step === "open-function"
    ) {
      collectKnownIds(exchange.responseBody, knownIds);
    }
  }

  const notes: string[] = [];
  const bestByOperation = new Map<string, { exchange: CapturedExchange; score: number; stepsSeen: Set<string> }>();

  for (const exchange of session.exchanges) {
    const candidateOps = STEP_TO_OPERATIONS[exchange.step];
    if (!candidateOps) continue;
    for (const operation of candidateOps) {
      const score = scoreCandidate(exchange, operation);
      if (score <= 0) continue;
      const current = bestByOperation.get(operation);
      if (!current || score > current.score) {
        bestByOperation.set(operation, { exchange, score, stepsSeen: new Set([exchange.step]) });
      } else if (score === current.score) {
        current.stepsSeen.add(exchange.step);
      }
    }
  }

  const operations: Record<string, EndpointCandidate> = {};
  for (const operation of ALL_OPERATIONS) {
    const best = bestByOperation.get(operation);
    if (!best) {
      notes.push(`No usable request found for operation "${operation}". Re-run discovery and make sure the relevant tab/list actually loads data.`);
      continue;
    }
    const confidence: EndpointCandidate["confidence"] = best.score >= 6 ? "high" : best.score >= 3 ? "medium" : "low";
    operations[operation] = {
      operation,
      method: best.exchange.method,
      urlTemplate: templateizeUrl(best.exchange.url, knownIds),
      confidence,
      sampleUrl: best.exchange.url,
      responseShapeHint: responseShapeHint(best.exchange.responseBody),
      step: best.exchange.step,
    };
    if (confidence !== "high") {
      notes.push(
        `Operation "${operation}" matched with ${confidence} confidence (best candidate from step "${best.exchange.step}"). ` +
          `Double-check discovery-output/endpoint-map.json's urlTemplate against discovery-output/session.json.`,
      );
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    beaconBaseUrl: session.beaconBaseUrl,
    authMode: "cookie",
    operations,
    notes,
  };
}
