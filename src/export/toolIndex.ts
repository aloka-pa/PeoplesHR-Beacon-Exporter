import { mkdir, readFile, writeFile } from "node:fs/promises";
import { moduleMapPath, referenceRoot, toolIndexPath, toolDir, toolRelativePath } from "./paths.js";

export interface ToolIndexEntry {
  id: string;
  name: string;
  shortDescription: string | null;
  tags: string[];
  assignedAgents: { id: string; name: string | null }[];
  argumentNames: string[];
  peoplesHrModule: string | null;
  path: string;
  contentHash: string;
  beaconUpdatedAt: string | null;
  lastExportedAt: string;
}

interface PersistedToolJson {
  id: string;
  name: string;
  description: string | null;
  taskName: string | null;
  tags: string[];
  status: string | null;
  updatedAt: string | null;
  assignedAgents: { id: string; name: string | null }[];
  contentHash: string;
  lastExportedAt: string;
}

interface PersistedArgumentsJson {
  arguments: { name: string }[];
  advancedArguments: { name: string }[];
}

async function loadModuleMap(): Promise<Record<string, string>> {
  try {
    const raw = await readFile(moduleMapPath(), "utf8");
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

function inferModule(id: string, name: string, taskName: string | null, tags: string[], moduleMap: Record<string, string>): string | null {
  if (moduleMap[id]) return moduleMap[id];
  if (moduleMap[name]) return moduleMap[name];
  const haystack = [taskName ?? "", ...tags].join(" ").toLowerCase();
  const knownModules = ["peopleshr", "attendance", "leave", "payroll", "recruitment", "performance", "onboarding"];
  for (const mod of knownModules) {
    if (haystack.includes(mod)) return mod;
  }
  return null;
}

function shortenDescription(description: string | null, maxLen = 200): string | null {
  if (!description) return null;
  const firstLine = description.split(/\r?\n/).find((line) => line.trim().length > 0) ?? description;
  return firstLine.length > maxLen ? `${firstLine.slice(0, maxLen - 1)}…` : firstLine;
}

async function loadEntryFromDisk(slug: string, moduleMap: Record<string, string>): Promise<ToolIndexEntry | null> {
  try {
    const [toolRaw, argsRaw] = await Promise.all([
      readFile(`${toolDir(slug)}/tool.json`, "utf8"),
      readFile(`${toolDir(slug)}/arguments.json`, "utf8"),
    ]);
    const tool = JSON.parse(toolRaw) as PersistedToolJson;
    const args = JSON.parse(argsRaw) as PersistedArgumentsJson;
    return {
      id: tool.id,
      name: tool.name,
      shortDescription: shortenDescription(tool.description),
      tags: tool.tags,
      assignedAgents: tool.assignedAgents,
      argumentNames: [...args.arguments, ...args.advancedArguments].map((a) => a.name),
      peoplesHrModule: inferModule(tool.id, tool.name, tool.taskName, tool.tags, moduleMap),
      path: toolRelativePath(slug),
      contentHash: tool.contentHash,
      beaconUpdatedAt: tool.updatedAt,
      lastExportedAt: tool.lastExportedAt,
    };
  } catch {
    return null;
  }
}

/**
 * Rebuilds tool-index.json from whatever is currently on disk under
 * beacon-reference/tools/<slug>/. This is intentionally disk-driven (not
 * limited to tools touched by the current run) so partial exports
 * (--agent/--tool/--changed-only) still produce a complete, consistent index.
 */
export async function buildAndWriteToolIndex(activeToolSlugs: string[]): Promise<ToolIndexEntry[]> {
  const moduleMap = await loadModuleMap();
  const entries: ToolIndexEntry[] = [];
  for (const slug of activeToolSlugs) {
    const entry = await loadEntryFromDisk(slug, moduleMap);
    if (entry) entries.push(entry);
  }
  await mkdir(referenceRoot(), { recursive: true });
  await writeFile(toolIndexPath(), JSON.stringify(entries, null, 2), "utf8");
  return entries;
}
