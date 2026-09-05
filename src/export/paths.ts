import path from "node:path";

/**
 * The reference root is resolved lazily (not cached at module load) so it
 * reflects BEACON_REFERENCE_ROOT / cwd at call time. This keeps tests able
 * to point at a temp directory via env var without relying on import-order
 * or process.chdir timing tricks.
 */
export function referenceRoot(): string {
  return path.resolve(process.env.BEACON_REFERENCE_ROOT ?? "./beacon-reference");
}

export function toolsDir(): string {
  return path.join(referenceRoot(), "tools");
}

export function agentsDir(): string {
  return path.join(referenceRoot(), "agents");
}

export function functionsDir(): string {
  return path.join(referenceRoot(), "functions");
}

export function manifestPath(): string {
  return path.join(referenceRoot(), "manifest.json");
}

export function toolIndexPath(): string {
  return path.join(referenceRoot(), "tool-index.json");
}

export function functionIndexPath(): string {
  return path.join(referenceRoot(), "function-index.json");
}

export function readmePath(): string {
  return path.join(referenceRoot(), "README.md");
}

export function toolPatternsPath(): string {
  return path.join(referenceRoot(), "TOOL_PATTERNS.md");
}

export function moduleMapPath(): string {
  return path.join(referenceRoot(), "module-map.json");
}

export function lastExportReportPath(): string {
  return path.join(referenceRoot(), "last-export-report.json");
}

export function validationReportPath(): string {
  return path.join(referenceRoot(), "validation-report.json");
}

export function toolDir(slug: string): string {
  return path.join(toolsDir(), slug);
}

export function agentDir(slug: string): string {
  return path.join(agentsDir(), slug);
}

export function functionDir(slug: string): string {
  return path.join(functionsDir(), slug);
}

export function toolRelativePath(slug: string): string {
  return `tools/${slug}`;
}

export function agentRelativePath(slug: string): string {
  return `agents/${slug}`;
}

export function functionRelativePath(slug: string): string {
  return `functions/${slug}`;
}
