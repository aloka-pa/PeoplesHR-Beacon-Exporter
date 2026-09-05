#!/usr/bin/env node
import "dotenv/config";
import { Command } from "commander";
import { runExport } from "../export/exporter.js";

const program = new Command();
program
  .description("Export agents, tools, functions and transformers from Beacon Agent Studio into beacon-reference/.")
  .option("--agent <name>", "Only export tools assigned to this agent (name substring or exact id)")
  .option("--tool <name>", "Only export tools matching this name substring or exact id")
  .option("--function <name>", "Only export functions matching this name substring or exact id")
  .option("--changed-only", "Skip tools/functions whose Beacon updatedAt/content hash hasn't changed since the last export", false)
  .option("--prune", "Permanently delete local folders for tools/functions marked missing/archived in manifest.json", false);

program.parse(process.argv);
const opts = program.opts<{ agent?: string; tool?: string; function?: string; changedOnly: boolean; prune: boolean }>();

async function main(): Promise<void> {
  await runExport({
    agentFilter: opts.agent,
    toolFilter: opts.tool,
    functionFilter: opts.function,
    changedOnly: opts.changedOnly,
    prune: opts.prune,
  });
}

main().catch((err) => {
  console.error("Export failed:", err);
  process.exitCode = 1;
});
