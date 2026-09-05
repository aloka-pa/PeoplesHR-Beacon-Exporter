import { mkdir, readFile, writeFile } from "node:fs/promises";
import { functionDir, functionIndexPath, functionRelativePath, referenceRoot } from "./paths.js";

export interface FunctionIndexEntry {
  id: string;
  name: string;
  status: string | null;
  path: string;
  contentHash: string;
  beaconUpdatedAt: string | null;
  lastExportedAt: string;
}

interface PersistedFunctionJson {
  id: string;
  name: string;
  status: string | null;
  updatedAt: string | null;
  contentHash: string;
  lastExportedAt: string;
}

async function loadEntryFromDisk(slug: string): Promise<FunctionIndexEntry | null> {
  try {
    const raw = await readFile(`${functionDir(slug)}/function.json`, "utf8");
    const fn = JSON.parse(raw) as PersistedFunctionJson;
    return {
      id: fn.id,
      name: fn.name,
      status: fn.status,
      path: functionRelativePath(slug),
      contentHash: fn.contentHash,
      beaconUpdatedAt: fn.updatedAt,
      lastExportedAt: fn.lastExportedAt,
    };
  } catch {
    return null;
  }
}

/** Mirrors buildAndWriteToolIndex — disk-driven so partial exports still produce a complete index. */
export async function buildAndWriteFunctionIndex(activeFunctionSlugs: string[]): Promise<FunctionIndexEntry[]> {
  const entries: FunctionIndexEntry[] = [];
  for (const slug of activeFunctionSlugs) {
    const entry = await loadEntryFromDisk(slug);
    if (entry) entries.push(entry);
  }
  await mkdir(referenceRoot(), { recursive: true });
  await writeFile(functionIndexPath(), JSON.stringify(entries, null, 2), "utf8");
  return entries;
}
