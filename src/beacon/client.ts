import type { APIRequestContext } from "playwright";
import type { EndpointMap } from "../discovery/types.js";
import { BeaconApiError, BeaconAuthExpiredError } from "./errors.js";
import { fillTemplate, requireOperation } from "./endpointMap.js";
import { extractArray, pickField } from "./fieldExtract.js";
import { normalizeAgent, normalizeFunction, normalizeFunctionSummary, normalizeTool } from "./normalize.js";
import type { AgentRecord, FunctionRecord, FunctionSummary, ToolRecord } from "./types.js";

export interface BeaconClientOptions {
  request: APIRequestContext;
  endpointMap: EndpointMap;
  endpointMapPath: string;
  maxRetries?: number;
  retryDelayMs?: number;
  pageSize?: number;
}

const LOGIN_PAGE_HINTS = ["<html", "sign in", "log in", "sso", "unauthorized", "session expired"];

function looksLikeLoginPage(status: number, contentType: string | undefined, bodyText: string): boolean {
  if (status === 401 || status === 403) return true;
  if (contentType?.includes("text/html")) {
    const lower = bodyText.slice(0, 2000).toLowerCase();
    return LOGIN_PAGE_HINTS.some((hint) => lower.includes(hint));
  }
  return false;
}

/** Beacon's list responses: `{ count: <total>, result: [...] }`. */
interface BeaconListResponse {
  count?: number;
  result?: unknown[];
}

export class BeaconClient {
  private request: APIRequestContext;
  private endpointMap: EndpointMap;
  private endpointMapPath: string;
  private maxRetries: number;
  private retryDelayMs: number;
  private pageSize: number;

  constructor(options: BeaconClientOptions) {
    this.request = options.request;
    this.endpointMap = options.endpointMap;
    this.endpointMapPath = options.endpointMapPath;
    this.maxRetries = options.maxRetries ?? 3;
    this.retryDelayMs = options.retryDelayMs ?? 800;
    this.pageSize = options.pageSize ?? 50;
  }

  private async callRaw(operation: string, values: Record<string, string | number>): Promise<unknown> {
    const candidate = requireOperation(this.endpointMap, operation, this.endpointMapPath);
    const url = new URL(fillTemplate(candidate.urlTemplate, values), this.endpointMap.beaconBaseUrl).toString();

    let lastError: unknown;
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.request.fetch(url, { method: candidate.method });
        const status = response.status();
        const contentType = response.headers()["content-type"];
        const text = await response.text();

        if (looksLikeLoginPage(status, contentType, text)) {
          throw new BeaconAuthExpiredError(`Detected a login/auth page while calling "${operation}".`);
        }

        if (status >= 500 || status === 429) {
          throw new BeaconApiError(operation, url, status, `Transient server error: ${text.slice(0, 200)}`);
        }

        if (status >= 400) {
          throw new BeaconApiError(operation, url, status, text.slice(0, 500));
        }

        try {
          return JSON.parse(text);
        } catch {
          return text; // some sections may come back as plain code/text rather than JSON
        }
      } catch (err) {
        if (err instanceof BeaconAuthExpiredError) throw err;
        lastError = err;
        if (attempt < this.maxRetries) {
          const isRetryable = err instanceof BeaconApiError ? err.status >= 500 || err.status === 429 : true;
          if (!isRetryable) throw err;
          await new Promise((resolve) => setTimeout(resolve, this.retryDelayMs * attempt));
          continue;
        }
      }
    }
    throw lastError instanceof Error ? lastError : new Error(`Beacon API call "${operation}" failed after ${this.maxRetries} attempts.`);
  }

  /** JSON-encodes Beacon's `filters` query param (e.g. `{"q":"search term"}`), pre-escaped for URL templating. */
  private static filtersParam(query: string): string {
    return encodeURIComponent(JSON.stringify({ q: query }));
  }

  private async listPaginated(operation: string, query: string): Promise<unknown[]> {
    const all: unknown[] = [];
    for (let page = 0; page < 1000; page++) {
      const body = (await this.callRaw(operation, {
        page,
        size: this.pageSize,
        filters: BeaconClient.filtersParam(query),
      })) as BeaconListResponse;
      const items = extractArray<unknown>(body, ["result", "items", "tools", "agents", "data"]);
      all.push(...items);
      if (items.length === 0) break;
      const total = pickField<number>(body, ["count", "total", "totalCount"]);
      if (typeof total === "number" ? all.length >= total : items.length < this.pageSize) break;
    }
    return all;
  }

  async listAgents(query = ""): Promise<AgentRecord[]> {
    const raw = await this.listPaginated("listAgents", query);
    return raw.map(normalizeAgent);
  }

  async listTools(query = ""): Promise<ToolRecord[]> {
    const raw = await this.listPaginated("listTools", query);
    return raw.map(normalizeTool);
  }

  /** Refetches a single tool by id (same shape as a list item) — used to refresh one tool without paginating everything. */
  async getTool(id: string): Promise<ToolRecord> {
    const raw = await this.callRaw("getTool", { id });
    return normalizeTool(raw);
  }

  /**
   * Functions' list endpoint only returns lightweight summaries
   * ({_id, name, status, createdAt, updatedAt}) — no `code`. Fetch each
   * function's full body via getFunction(id) when you actually need it.
   */
  async listFunctionSummaries(query = ""): Promise<FunctionSummary[]> {
    const raw = await this.listPaginated("listFunctions", query);
    return raw.map(normalizeFunctionSummary);
  }

  async getFunction(id: string): Promise<FunctionRecord> {
    const raw = await this.callRaw("getFunction", { id });
    return normalizeFunction(raw);
  }
}
