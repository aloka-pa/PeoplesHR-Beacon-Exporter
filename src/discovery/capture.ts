import type { BrowserContext, Response } from "playwright";
import { redactHeaders, redactJson, redactRawText, redactUrl } from "../security/redact.js";
import type { CapturedExchange, DiscoveryStep } from "./types.js";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NUMERIC_ID_RE = /^\d+$/;
const LONG_ALNUM_ID_RE = /^[a-zA-Z0-9_-]{16,}$/;

/** Collapse an URL's path into a shape signature: numeric/uuid/opaque segments become ":id". */
export function shapeOfUrl(rawUrl: string): string {
  try {
    const url = new URL(rawUrl);
    const segments = url.pathname
      .split("/")
      .map((seg) => (UUID_RE.test(seg) || NUMERIC_ID_RE.test(seg) || LONG_ALNUM_ID_RE.test(seg) ? ":id" : seg));
    return `${url.host}${segments.join("/")}`;
  } catch {
    return rawUrl;
  }
}

async function parseBody(
  raw: string | null,
  contentType: string | undefined,
): Promise<unknown> {
  if (raw === null || raw === undefined || raw.length === 0) return null;
  const looksJson = contentType?.includes("json") || /^[\s]*[[{]/.test(raw);
  if (looksJson) {
    try {
      return redactJson(JSON.parse(raw));
    } catch {
      // fall through to raw-text handling
    }
  }
  return redactRawText(raw);
}

export interface CaptureOptions {
  /** Only capture requests whose host matches this host (e.g. studio.beacon.li or its API host). */
  hostAllowlist: string[];
  /** Returns the wizard step currently active, used to label each exchange. */
  getCurrentStep: () => DiscoveryStep;
  /** Called for every successfully captured exchange. */
  onExchange: (exchange: CapturedExchange) => void;
  /** Called on capture errors (non-fatal); useful for debug logging. */
  onError?: (err: unknown, response: Response) => void;
}

const RELEVANT_RESOURCE_TYPES = new Set(["fetch", "xhr"]);

/** Attach fetch/XHR capture to a browser context. Returns a detach function. */
export function attachCapture(context: BrowserContext, options: CaptureOptions): () => void {
  let seq = 0;

  const handler = async (response: Response) => {
    try {
      const request = response.request();
      const resourceType = request.resourceType();
      if (!RELEVANT_RESOURCE_TYPES.has(resourceType)) return;

      const url = request.url();
      let host: string;
      try {
        host = new URL(url).host;
      } catch {
        return;
      }
      if (!options.hostAllowlist.some((h) => host === h || host.endsWith(`.${h}`))) return;

      const reqHeaders = await request.allHeaders();
      const resHeaders = response.headers();

      let requestBody: unknown = null;
      const postData = request.postData();
      if (postData) {
        requestBody = await parseBody(postData, reqHeaders["content-type"]);
      }

      let responseBody: unknown = null;
      let status: number | null = null;
      try {
        status = response.status();
        const text = await response.text();
        responseBody = await parseBody(text, resHeaders["content-type"]);
      } catch (err) {
        options.onError?.(err, response);
        responseBody = null;
      }

      seq += 1;
      const exchange: CapturedExchange = {
        seq,
        step: options.getCurrentStep(),
        timestamp: new Date().toISOString(),
        method: request.method(),
        url: redactUrl(url),
        urlShape: shapeOfUrl(url),
        requestHeaders: redactHeaders(reqHeaders),
        requestBody,
        status,
        responseHeaders: redactHeaders(resHeaders),
        responseBody,
        resourceType,
      };
      options.onExchange(exchange);
    } catch (err) {
      options.onError?.(err, response);
    }
  };

  context.on("response", handler);
  return () => context.off("response", handler);
}
