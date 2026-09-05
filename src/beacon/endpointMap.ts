import { readFile } from "node:fs/promises";
import path from "node:path";
import type { EndpointCandidate, EndpointMap } from "../discovery/types.js";
import { EndpointMapMissingError } from "./errors.js";

const DEFAULT_MAP_PATH = path.resolve("./discovery-output/endpoint-map.json");

export async function loadEndpointMap(mapPath = DEFAULT_MAP_PATH): Promise<EndpointMap> {
  let raw: string;
  try {
    raw = await readFile(mapPath, "utf8");
  } catch {
    throw new Error(
      `Endpoint map not found at ${mapPath}. Run "npm run beacon:discover" first, then review the ` +
        `generated discovery-output/endpoint-map.json before running beacon:export.`,
    );
  }
  return JSON.parse(raw) as EndpointMap;
}

export function requireOperation(map: EndpointMap, operation: string, mapPath = DEFAULT_MAP_PATH): EndpointCandidate {
  const candidate = map.operations[operation];
  if (!candidate) {
    throw new EndpointMapMissingError(operation, mapPath);
  }
  return candidate;
}

/** Substitute `{token}` placeholders in a URL template, e.g. {id} -> the tool id. */
export function fillTemplate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, key: string) => {
    if (key in values) return String(values[key]);
    return match; // leave unresolved placeholders (e.g. unused pagination params) as-is
  });
}

export { DEFAULT_MAP_PATH };
