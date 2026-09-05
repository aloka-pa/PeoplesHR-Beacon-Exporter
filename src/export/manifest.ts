import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { manifestPath, referenceRoot } from "./paths.js";

export type ToolManifestStatus = "active" | "missing" | "archived";

export interface ToolManifestEntry {
  id: string;
  slug: string;
  name: string;
  status: ToolManifestStatus;
  contentHash: string;
  beaconUpdatedAt: string | null;
  lastExportedAt: string;
  /** Set the first time a tool is seen absent from Beacon; cleared if it reappears. */
  missingSince?: string;
}

export interface AgentManifestEntry {
  id: string;
  slug: string;
  name: string;
  lastExportedAt: string;
}

export interface Manifest {
  generatedAt: string;
  tools: Record<string, ToolManifestEntry>; // keyed by Beacon tool id
  agents: Record<string, AgentManifestEntry>; // keyed by Beacon agent id
  functions: Record<string, ToolManifestEntry>; // keyed by Beacon function id — same entry shape as tools
}

export function emptyManifest(): Manifest {
  return { generatedAt: new Date().toISOString(), tools: {}, agents: {}, functions: {} };
}

export async function loadManifest(): Promise<Manifest> {
  try {
    const raw = await readFile(manifestPath(), "utf8");
    const parsed = JSON.parse(raw) as Partial<Manifest>;
    // Backfill sections absent from manifests written before this field existed.
    return { generatedAt: parsed.generatedAt ?? new Date().toISOString(), tools: parsed.tools ?? {}, agents: parsed.agents ?? {}, functions: parsed.functions ?? {} };
  } catch {
    return emptyManifest();
  }
}

export async function saveManifest(manifest: Manifest): Promise<void> {
  await mkdir(referenceRoot(), { recursive: true });
  manifest.generatedAt = new Date().toISOString();
  await writeFile(manifestPath(), JSON.stringify(manifest, null, 2), "utf8");
}

/** Marks entries in `entries` not present in `seenIds` as missing (never deletes). Works for tools or functions alike. */
export function markUnseenEntriesMissing(entries: Record<string, ToolManifestEntry>, seenIds: Set<string>): string[] {
  const newlyMissing: string[] = [];
  for (const [id, entry] of Object.entries(entries)) {
    if (!seenIds.has(id) && entry.status === "active") {
      entry.status = "missing";
      entry.missingSince = new Date().toISOString();
      newlyMissing.push(id);
    }
  }
  return newlyMissing;
}

export function pruneMissingEntries(entries: Record<string, ToolManifestEntry>): string[] {
  const pruned: string[] = [];
  for (const [id, entry] of Object.entries(entries)) {
    if (entry.status === "missing" || entry.status === "archived") {
      pruned.push(id);
      delete entries[id];
    }
  }
  return pruned;
}


export function toolFolderPath(slug: string): string {
  return path.join(referenceRoot(), "tools", slug);
}
