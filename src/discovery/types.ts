/** The manual navigation steps we ask the user to perform during discovery. */
export const DISCOVERY_STEPS = [
  "login",
  "tools-list",
  "agents-list",
  "open-tool",
  "basic-details",
  "arguments",
  "fetcher",
  "transformer",
  "source",
  "test",
  "functions-list",
  "open-function",
] as const;

export type DiscoveryStep = (typeof DISCOVERY_STEPS)[number];

export interface CapturedExchange {
  /** Sequence number in capture order. */
  seq: number;
  /** Wizard step active when this exchange was recorded. */
  step: DiscoveryStep;
  /** ISO timestamp of the request. */
  timestamp: string;
  method: string;
  /** Full URL with secret query params redacted. */
  url: string;
  /** URL with concrete IDs/query values stripped to a shape signature, e.g. /api/tools/:id. */
  urlShape: string;
  requestHeaders: Record<string, string>;
  /** Parsed + redacted JSON body, or a redacted raw string if not JSON. */
  requestBody: unknown;
  status: number | null;
  responseHeaders: Record<string, string>;
  /** Parsed + redacted JSON body, or a redacted raw string if not JSON. */
  responseBody: unknown;
  resourceType: string;
}

export interface DiscoverySession {
  startedAt: string;
  finishedAt: string | null;
  beaconBaseUrl: string;
  toolsUrl: string;
  sampleToolName: string | null;
  exchanges: CapturedExchange[];
}

/** One entry of the auto-drafted endpoint map, per logical Beacon operation. */
export interface EndpointCandidate {
  operation: string;
  method: string;
  urlTemplate: string;
  confidence: "high" | "medium" | "low";
  sampleUrl: string;
  responseShapeHint: string[];
  step: DiscoveryStep;
}

export interface EndpointMap {
  generatedAt: string;
  beaconBaseUrl: string;
  authMode: "cookie" | "unknown";
  operations: Record<string, EndpointCandidate>;
  notes: string[];
}
