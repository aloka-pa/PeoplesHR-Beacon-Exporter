import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { BeaconClient } from "../beacon/client.js";
import { DEFAULT_MAP_PATH, loadEndpointMap } from "../beacon/endpointMap.js";
import { openBeaconSession } from "../beacon/session.js";
import type { AgentRecord, ToolRecord } from "../beacon/types.js";
import { toUniqueSlug } from "../security/slug.js";
import {
  loadManifest,
  markUnseenEntriesMissing,
  pruneMissingEntries,
  saveManifest,
  type Manifest,
} from "./manifest.js";
import { buildAndWriteFunctionIndex } from "./functionIndex.js";
import { functionDir, functionsDir, lastExportReportPath, referenceRoot, toolsDir, toolDir } from "./paths.js";
import { buildToolPatternsDoc } from "./patterns.js";
import { buildAndWriteToolIndex } from "./toolIndex.js";
import { computeFunctionContentHash, computeToolContentHash, writeAgentFiles, writeFunctionFiles, writeToolFiles } from "./writer.js";
import { writeReferenceReadme } from "./readme.js";

export interface ExportOptions {
  agentFilter?: string;
  toolFilter?: string;
  functionFilter?: string;
  changedOnly?: boolean;
  prune?: boolean;
}

export interface ExportReport {
  agentsDiscovered: number;
  toolsDiscovered: number;
  toolsExported: number;
  toolsSkippedUnchanged: number;
  toolsFailed: { id: string; name: string; error: string }[];
  toolsMissing: string[];
  toolsPruned: string[];
  functionsDiscovered: number;
  functionsExported: number;
  functionsSkippedUnchanged: number;
  functionsFailed: { id: string; name: string; error: string }[];
  functionsMissing: string[];
  functionsPruned: string[];
}

function slugFor(existingSlug: string | undefined, usedSlugs: Set<string>, name: string, id: string): string {
  if (existingSlug) {
    usedSlugs.add(existingSlug);
    return existingSlug;
  }
  return toUniqueSlug(name || id, usedSlugs);
}

export async function runExport(opts: ExportOptions): Promise<ExportReport> {
  const profileDir = path.resolve(process.env.BROWSER_PROFILE_DIR ?? "./browser-profile");
  const headless = (process.env.BEACON_HEADLESS ?? "false").toLowerCase() === "true";

  const endpointMap = await loadEndpointMap(DEFAULT_MAP_PATH);
  const session = await openBeaconSession(profileDir, headless);
  const client = new BeaconClient({ request: session.request, endpointMap, endpointMapPath: DEFAULT_MAP_PATH });

  const isFullToolsExport = !opts.agentFilter && !opts.toolFilter;
  const isFullFunctionsExport = !opts.functionFilter && !opts.agentFilter && !opts.toolFilter;

  try {
    console.log("Listing agents...");
    let agents: AgentRecord[] = [];
    try {
      agents = await client.listAgents();
      console.log(`  Found ${agents.length} agent(s).`);
    } catch (err) {
      console.warn("  Could not list agents (continuing without agent folders):", err instanceof Error ? err.message : err);
    }

    console.log("Listing tools...");
    const allTools = await client.listTools();
    console.log(`  Found ${allTools.length} tool(s).`);

    let toolCandidates = allTools;
    if (opts.toolFilter) {
      const needle = opts.toolFilter.toLowerCase();
      toolCandidates = toolCandidates.filter((t) => t.id === opts.toolFilter || t.name.toLowerCase().includes(needle));
      console.log(`  Filtered to ${toolCandidates.length} tool(s) matching --tool "${opts.toolFilter}".`);
    }
    if (opts.agentFilter) {
      const needle = opts.agentFilter.toLowerCase();
      toolCandidates = toolCandidates.filter((t) =>
        t.assignedAgents.some((a) => a.id === opts.agentFilter || (a.name ?? "").toLowerCase().includes(needle)),
      );
      console.log(`  Filtered to ${toolCandidates.length} tool(s) assigned to an agent matching "${opts.agentFilter}".`);
    }

    const manifest = await loadManifest();
    const usedToolSlugs = new Set(Object.values(manifest.tools).map((e) => e.slug));

    const exportedTools: ToolRecord[] = [];
    const toolsSkippedUnchanged: string[] = [];
    const toolsFailed: { id: string; name: string; error: string }[] = [];
    const seenToolIds = new Set(allTools.map((t) => t.id));
    const toolAgentAssignments = new Map<string, { id: string; name: string; slug: string }[]>();

    for (const tool of toolCandidates) {
      const existing = manifest.tools[tool.id];
      try {
        const slug = slugFor(existing?.slug, usedToolSlugs, tool.name, tool.id);
        const newHash = computeToolContentHash(tool);

        if (opts.changedOnly && existing && existing.contentHash === newHash) {
          toolsSkippedUnchanged.push(tool.id);
          manifest.tools[tool.id] = { ...existing, status: "active", beaconUpdatedAt: tool.updatedAt ?? existing.beaconUpdatedAt };
        } else {
          const { hash } = await writeToolFiles(tool, slug);
          exportedTools.push(tool);

          manifest.tools[tool.id] = {
            id: tool.id,
            slug,
            name: tool.name,
            status: "active",
            contentHash: hash,
            beaconUpdatedAt: tool.updatedAt,
            lastExportedAt: new Date().toISOString(),
          };
        }

        for (const agentRef of tool.assignedAgents) {
          const list = toolAgentAssignments.get(agentRef.id) ?? [];
          list.push({ id: tool.id, name: tool.name, slug });
          toolAgentAssignments.set(agentRef.id, list);
        }
      } catch (err) {
        toolsFailed.push({ id: tool.id, name: tool.name, error: err instanceof Error ? err.message : String(err) });
      }
    }

    let toolsNewlyMissing: string[] = [];
    if (isFullToolsExport) {
      toolsNewlyMissing = markUnseenEntriesMissing(manifest.tools, seenToolIds);
      if (toolsNewlyMissing.length > 0) {
        console.log(`  ${toolsNewlyMissing.length} tool(s) no longer present in Beacon; marked "missing" in manifest.json.`);
      }
    }

    let toolsPruned: string[] = [];
    if (opts.prune) {
      const prunedEntries = Object.entries(manifest.tools).filter(([, e]) => e.status === "missing" || e.status === "archived");
      toolsPruned = prunedEntries.map(([id]) => id);
      for (const [, entry] of prunedEntries) {
        await rm(toolDir(entry.slug), { recursive: true, force: true });
      }
      pruneMissingEntries(manifest.tools);
      if (toolsPruned.length > 0) console.log(`  Pruned ${toolsPruned.length} tool folder(s) from disk.`);
    }

    if (agents.length > 0 && (isFullToolsExport || opts.agentFilter)) {
      for (const agent of agents) {
        if (opts.agentFilter) {
          const needle = opts.agentFilter.toLowerCase();
          const matches = agent.id === opts.agentFilter || agent.name.toLowerCase().includes(needle);
          if (!matches) continue;
        }
        const agentEntry = manifest.agents[agent.id];
        const agentSlugSeed = new Set(Object.values(manifest.agents).map((e) => e.slug));
        const slug = agentEntry?.slug ?? toUniqueSlug(agent.name || agent.id, agentSlugSeed);
        const assigned = toolAgentAssignments.get(agent.id) ?? [];
        await writeAgentFiles(agent, slug, assigned);
        manifest.agents[agent.id] = { id: agent.id, slug, name: agent.name, lastExportedAt: new Date().toISOString() };
      }
    }

    // --- Functions ---------------------------------------------------
    // Unlike tools, the Functions list endpoint only returns summaries
    // (no code), so changed-only can skip the per-function detail fetch
    // entirely just by comparing updatedAt from the cheap list call.
    let functionsDiscoveredCount = 0;
    const exportedFunctionIds: string[] = [];
    const functionsSkippedUnchanged: string[] = [];
    const functionsFailed: { id: string; name: string; error: string }[] = [];
    let functionsNewlyMissing: string[] = [];
    let functionsPruned: string[] = [];

    if (!opts.agentFilter) {
      console.log("Listing functions...");
      const allFunctionSummaries = await client.listFunctionSummaries();
      functionsDiscoveredCount = allFunctionSummaries.length;
      console.log(`  Found ${allFunctionSummaries.length} function(s).`);

      let functionCandidates = allFunctionSummaries;
      if (opts.functionFilter) {
        const needle = opts.functionFilter.toLowerCase();
        functionCandidates = functionCandidates.filter((f) => f.id === opts.functionFilter || f.name.toLowerCase().includes(needle));
        console.log(`  Filtered to ${functionCandidates.length} function(s) matching --function "${opts.functionFilter}".`);
      }

      const usedFunctionSlugs = new Set(Object.values(manifest.functions).map((e) => e.slug));
      const seenFunctionIds = new Set(allFunctionSummaries.map((f) => f.id));

      for (const summary of functionCandidates) {
        const existing = manifest.functions[summary.id];
        try {
          if (opts.changedOnly && existing && existing.status === "active" && existing.beaconUpdatedAt === summary.updatedAt) {
            functionsSkippedUnchanged.push(summary.id);
            continue; // no need to even fetch the function body
          }

          const fn = await client.getFunction(summary.id);
          // getFunction's detail response carries neither createdAt nor updatedAt
          // (only the list summary does) — merge them in so --changed-only and
          // function.json stay accurate.
          fn.createdAt = fn.createdAt ?? summary.createdAt;
          fn.updatedAt = fn.updatedAt ?? summary.updatedAt;

          const slug = slugFor(existing?.slug, usedFunctionSlugs, fn.name, fn.id);
          const newHash = computeFunctionContentHash(fn);

          if (opts.changedOnly && existing && existing.contentHash === newHash) {
            functionsSkippedUnchanged.push(fn.id);
            manifest.functions[fn.id] = { ...existing, status: "active", beaconUpdatedAt: fn.updatedAt ?? existing.beaconUpdatedAt };
          } else {
            const { hash } = await writeFunctionFiles(fn, slug);
            exportedFunctionIds.push(fn.id);
            manifest.functions[fn.id] = {
              id: fn.id,
              slug,
              name: fn.name,
              status: "active",
              contentHash: hash,
              beaconUpdatedAt: fn.updatedAt,
              lastExportedAt: new Date().toISOString(),
            };
          }
        } catch (err) {
          functionsFailed.push({ id: summary.id, name: summary.name, error: err instanceof Error ? err.message : String(err) });
        }
      }

      if (isFullFunctionsExport) {
        functionsNewlyMissing = markUnseenEntriesMissing(manifest.functions, seenFunctionIds);
        if (functionsNewlyMissing.length > 0) {
          console.log(`  ${functionsNewlyMissing.length} function(s) no longer present in Beacon; marked "missing" in manifest.json.`);
        }
      }

      if (opts.prune) {
        const prunedEntries = Object.entries(manifest.functions).filter(([, e]) => e.status === "missing" || e.status === "archived");
        functionsPruned = prunedEntries.map(([id]) => id);
        for (const [, entry] of prunedEntries) {
          await rm(functionDir(entry.slug), { recursive: true, force: true });
        }
        pruneMissingEntries(manifest.functions);
        if (functionsPruned.length > 0) console.log(`  Pruned ${functionsPruned.length} function folder(s) from disk.`);
      }
    }

    await saveManifest(manifest);

    // Rebuild indexes from the full set of active items currently on disk so
    // partial runs (--agent/--tool/--function/--changed-only) still produce a complete index.
    const activeToolSlugs = isFullToolsExport
      ? Object.values(manifest.tools).filter((e) => e.status === "active").map((e) => e.slug)
      : await currentSlugsOnDisk(toolsDir);
    const activeFunctionSlugs = isFullFunctionsExport
      ? Object.values(manifest.functions).filter((e) => e.status === "active").map((e) => e.slug)
      : await currentSlugsOnDisk(functionsDir);

    const toolIndexEntries = await buildAndWriteToolIndex(activeToolSlugs);
    const functionIndexEntries = await buildAndWriteFunctionIndex(activeFunctionSlugs);
    await buildToolPatternsDoc(activeToolSlugs, activeFunctionSlugs);
    await writeReferenceReadme({
      toolCount: toolIndexEntries.length,
      agentCount: Object.keys(manifest.agents).length,
      functionCount: functionIndexEntries.length,
    });

    const report: ExportReport = {
      agentsDiscovered: agents.length,
      toolsDiscovered: allTools.length,
      toolsExported: exportedTools.length,
      toolsSkippedUnchanged: toolsSkippedUnchanged.length,
      toolsFailed,
      toolsMissing: toolsNewlyMissing,
      toolsPruned,
      functionsDiscovered: functionsDiscoveredCount,
      functionsExported: exportedFunctionIds.length,
      functionsSkippedUnchanged: functionsSkippedUnchanged.length,
      functionsFailed,
      functionsMissing: functionsNewlyMissing,
      functionsPruned,
    };
    await mkdir(referenceRoot(), { recursive: true });
    await writeFile(lastExportReportPath(), JSON.stringify({ ...report, generatedAt: new Date().toISOString() }, null, 2), "utf8");

    printReport(report);
    return report;
  } finally {
    await session.close();
  }
}

async function currentSlugsOnDisk(dirFn: () => string): Promise<string[]> {
  try {
    return await readdir(dirFn());
  } catch {
    return [];
  }
}

function printReport(report: ExportReport): void {
  console.log("\n=== Export summary ===");
  console.log(`  Agents discovered:           ${report.agentsDiscovered}`);
  console.log(`  Tools discovered:            ${report.toolsDiscovered}`);
  console.log(`  Tools exported:              ${report.toolsExported}`);
  console.log(`  Tools skipped (unchanged):   ${report.toolsSkippedUnchanged}`);
  console.log(`  Tools newly missing:         ${report.toolsMissing.length}`);
  console.log(`  Tools pruned:                ${report.toolsPruned.length}`);
  console.log(`  Tools failed:                ${report.toolsFailed.length}`);
  if (report.toolsFailed.length > 0) {
    for (const f of report.toolsFailed) console.log(`    - ${f.name} (${f.id}): ${f.error}`);
  }
  console.log(`  Functions discovered:        ${report.functionsDiscovered}`);
  console.log(`  Functions exported:          ${report.functionsExported}`);
  console.log(`  Functions skipped (unchanged):${report.functionsSkippedUnchanged}`);
  console.log(`  Functions newly missing:     ${report.functionsMissing.length}`);
  console.log(`  Functions pruned:            ${report.functionsPruned.length}`);
  console.log(`  Functions failed:            ${report.functionsFailed.length}`);
  if (report.functionsFailed.length > 0) {
    for (const f of report.functionsFailed) console.log(`    - ${f.name} (${f.id}): ${f.error}`);
  }
  console.log("");
}
