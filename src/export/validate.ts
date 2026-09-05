import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { REDACTED } from "../security/redact.js";
import { loadManifest, type ToolManifestEntry } from "./manifest.js";
import { functionDir, lastExportReportPath, validationReportPath, toolDir } from "./paths.js";

const TOOL_REQUIRED_FILES = ["tool.json", "description.md", "arguments.json", "fetcher.js", "transformer.js", "source.js", "test.json"];
const TOOL_CODE_FILES = new Set(["fetcher.js", "transformer.js", "source.js"]);

const FUNCTION_REQUIRED_FILES = ["function.json", "code.js"];
const FUNCTION_CODE_FILES = new Set(["code.js"]);

export interface EntryValidation {
  id: string;
  slug: string;
  name: string;
  status: "full" | "partial" | "failed";
  missingSections: string[];
  redactedFieldCount: number;
}

export interface ValidationReport {
  generatedAt: string;
  agentsDiscovered: number;
  toolsDiscovered: number;
  toolsExportedFull: number;
  toolsExportedPartial: number;
  toolsFailed: { id: string; name: string; error: string }[];
  missingSectionsByTool: Record<string, string[]>;
  functionsDiscovered: number;
  functionsExportedFull: number;
  functionsExportedPartial: number;
  functionsFailed: { id: string; name: string; error: string }[];
  missingSectionsByFunction: Record<string, string[]>;
  totalRedactedFields: number;
}

async function readIfExists(filePath: string): Promise<string | null> {
  try {
    return await readFile(filePath, "utf8");
  } catch {
    return null;
  }
}

function countOccurrences(haystack: string, needle: string): number {
  if (!haystack) return 0;
  return haystack.split(needle).length - 1;
}

async function validateOneEntry(
  id: string,
  slug: string,
  name: string,
  dir: string,
  requiredFiles: string[],
  codeFiles: Set<string>,
): Promise<EntryValidation> {
  const missing: string[] = [];
  let redactedCount = 0;
  let anyFilePresent = false;

  for (const file of requiredFiles) {
    const content = await readIfExists(path.join(dir, file));
    if (content === null) {
      missing.push(file);
      continue;
    }
    anyFilePresent = true;
    redactedCount += countOccurrences(content, REDACTED);

    if (codeFiles.has(file) && content.startsWith("// Beacon did not return")) {
      missing.push(file);
    }
    if (file === "test.json" && content.trim() === "null") {
      missing.push(file);
    }
    if (file === "description.md" && content.includes("_No description provided._")) {
      missing.push("description");
    }
  }

  const status: EntryValidation["status"] = !anyFilePresent ? "failed" : missing.length > 0 ? "partial" : "full";
  return { id, slug, name, status, missingSections: missing, redactedFieldCount: redactedCount };
}

function summarize(validations: EntryValidation[]): {
  full: number;
  partial: number;
  missingSections: Record<string, string[]>;
  localFailures: { id: string; name: string; error: string }[];
  redactedFields: number;
} {
  let full = 0;
  let partial = 0;
  let redactedFields = 0;
  const missingSections: Record<string, string[]> = {};
  const localFailures: { id: string; name: string; error: string }[] = [];

  for (const v of validations) {
    redactedFields += v.redactedFieldCount;
    if (v.status === "full") full += 1;
    else if (v.status === "partial") {
      partial += 1;
      missingSections[v.id] = v.missingSections;
    } else {
      localFailures.push({ id: v.id, name: v.name, error: `No exported files found under ${v.slug}/` });
    }
  }
  return { full, partial, missingSections, localFailures, redactedFields };
}

export async function runValidate(): Promise<ValidationReport> {
  const manifest = await loadManifest();
  const lastRunRaw = await readIfExists(lastExportReportPath());
  const lastRun = lastRunRaw
    ? (JSON.parse(lastRunRaw) as {
        agentsDiscovered: number;
        toolsDiscovered: number;
        toolsFailed: { id: string; name: string; error: string }[];
        functionsDiscovered?: number;
        functionsFailed?: { id: string; name: string; error: string }[];
      })
    : null;

  const activeTools: ToolManifestEntry[] = Object.values(manifest.tools).filter((t) => t.status === "active");
  const toolValidations = await Promise.all(
    activeTools.map((t) => validateOneEntry(t.id, t.slug, t.name, toolDir(t.slug), TOOL_REQUIRED_FILES, TOOL_CODE_FILES)),
  );
  const toolSummary = summarize(toolValidations);

  const activeFunctions: ToolManifestEntry[] = Object.values(manifest.functions).filter((f) => f.status === "active");
  const functionValidations = await Promise.all(
    activeFunctions.map((f) => validateOneEntry(f.id, f.slug, f.name, functionDir(f.slug), FUNCTION_REQUIRED_FILES, FUNCTION_CODE_FILES)),
  );
  const functionSummary = summarize(functionValidations);

  const report: ValidationReport = {
    generatedAt: new Date().toISOString(),
    agentsDiscovered: lastRun?.agentsDiscovered ?? Object.keys(manifest.agents).length,
    toolsDiscovered: lastRun?.toolsDiscovered ?? activeTools.length,
    toolsExportedFull: toolSummary.full,
    toolsExportedPartial: toolSummary.partial,
    toolsFailed: [...(lastRun?.toolsFailed ?? []), ...toolSummary.localFailures],
    missingSectionsByTool: toolSummary.missingSections,
    functionsDiscovered: lastRun?.functionsDiscovered ?? activeFunctions.length,
    functionsExportedFull: functionSummary.full,
    functionsExportedPartial: functionSummary.partial,
    functionsFailed: [...(lastRun?.functionsFailed ?? []), ...functionSummary.localFailures],
    missingSectionsByFunction: functionSummary.missingSections,
    totalRedactedFields: toolSummary.redactedFields + functionSummary.redactedFields,
  };

  await writeFile(validationReportPath(), JSON.stringify(report, null, 2), "utf8");
  printValidationReport(report);
  return report;
}

function printValidationReport(report: ValidationReport): void {
  console.log("\n=== Validation report ===");
  console.log(`  Agents discovered (last export):    ${report.agentsDiscovered}`);
  console.log(`  Tools discovered (last export):     ${report.toolsDiscovered}`);
  console.log(`  Tools fully exported:               ${report.toolsExportedFull}`);
  console.log(`  Tools partially exported:           ${report.toolsExportedPartial}`);
  console.log(`  Tools failed:                       ${report.toolsFailed.length}`);
  console.log(`  Functions discovered (last export): ${report.functionsDiscovered}`);
  console.log(`  Functions fully exported:           ${report.functionsExportedFull}`);
  console.log(`  Functions partially exported:       ${report.functionsExportedPartial}`);
  console.log(`  Functions failed:                   ${report.functionsFailed.length}`);
  console.log(`  Redacted secret fields (total):     ${report.totalRedactedFields}`);
  if (Object.keys(report.missingSectionsByTool).length > 0) {
    console.log("\n  Missing tool sections:");
    for (const [id, sections] of Object.entries(report.missingSectionsByTool)) {
      console.log(`    - ${id}: ${sections.join(", ")}`);
    }
  }
  if (Object.keys(report.missingSectionsByFunction).length > 0) {
    console.log("\n  Missing function sections:");
    for (const [id, sections] of Object.entries(report.missingSectionsByFunction)) {
      console.log(`    - ${id}: ${sections.join(", ")}`);
    }
  }
  if (report.toolsFailed.length > 0) {
    console.log("\n  Failed tools:");
    for (const f of report.toolsFailed) console.log(`    - ${f.name} (${f.id}): ${f.error}`);
  }
  if (report.functionsFailed.length > 0) {
    console.log("\n  Failed functions:");
    for (const f of report.functionsFailed) console.log(`    - ${f.name} (${f.id}): ${f.error}`);
  }
  console.log(`\n  Full report: beacon-reference/validation-report.json\n`);
}
