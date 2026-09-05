import { mkdir, writeFile } from "node:fs/promises";
import { contentHash } from "../security/hash.js";
import type { AgentRecord, FunctionRecord, ToolArgument, ToolRecord } from "../beacon/types.js";
import { agentDir, functionDir, toolDir, toolRelativePath } from "./paths.js";

const MISSING_CODE_NOTICE = (section: string) =>
  `// Beacon did not return ${section} for this tool (or the endpoint hasn't been mapped yet).\n` +
  `// See tool.json -> raw.${section} for the unmodified API response, if any was captured.\n`;

function argumentsSection(title: string, args: ToolArgument[]): string {
  if (args.length === 0) return `## ${title}\n\n_None._\n`;
  const rows = args
    .map((a) => {
      const req = a.required === null ? "unknown" : a.required ? "required" : "optional";
      const def = a.defaultValue === null || a.defaultValue === undefined ? "" : ` (default: \`${JSON.stringify(a.defaultValue)}\`)`;
      const desc = a.description ? ` — ${a.description}` : "";
      return `- \`${a.name}\` (${a.type ?? "unknown type"}, ${req})${def}${desc}`;
    })
    .join("\n");
  return `## ${title}\n\n${rows}\n`;
}

function buildDescriptionMarkdown(tool: ToolRecord): string {
  const parts: string[] = [`# ${tool.name}`, ""];
  if (tool.taskName) parts.push(`**Task:** ${tool.taskName}`, "");
  if (tool.tags.length > 0) parts.push(`**Tags:** ${tool.tags.join(", ")}`, "");
  if (tool.status) parts.push(`**Status:** ${tool.status}`, "");
  parts.push("## Description", "", tool.description ?? "_No description provided._", "");
  if (tool.instructions) {
    parts.push("## Instructions", "", tool.instructions, "");
  }
  if (tool.signature) {
    parts.push("## Signature", "", "```", tool.signature, "```", "");
  }
  parts.push(argumentsSection("Arguments", tool.arguments), "");
  parts.push(argumentsSection("Advanced arguments", tool.advancedArguments), "");
  if (tool.assignedAgents.length > 0) {
    parts.push(
      "## Assigned agents",
      "",
      tool.assignedAgents.map((a) => `- ${a.name ?? "(unnamed)"} (\`${a.id}\`)`).join("\n"),
      "",
    );
  }
  return parts.join("\n");
}

export interface WriteToolResult {
  slug: string;
  hash: string;
}

export function computeToolContentHash(tool: ToolRecord): string {
  return contentHash({
    id: tool.id,
    name: tool.name,
    description: tool.description,
    instructions: tool.instructions,
    tags: tool.tags,
    status: tool.status,
    signature: tool.signature,
    arguments: tool.arguments,
    advancedArguments: tool.advancedArguments,
    fetcherCode: tool.fetcherCode,
    transformerCode: tool.transformerCode,
    sourceCode: tool.sourceCode,
    testConfig: tool.testConfig,
    assignedAgents: tool.assignedAgents,
  });
}

export async function writeToolFiles(tool: ToolRecord, slug: string): Promise<WriteToolResult> {
  const dir = toolDir(slug);
  await mkdir(dir, { recursive: true });

  const hash = computeToolContentHash(tool);

  const toolJson = {
    id: tool.id,
    slug,
    name: tool.name,
    description: tool.description,
    instructions: tool.instructions,
    taskName: tool.taskName,
    tags: tool.tags,
    status: tool.status,
    signature: tool.signature,
    createdAt: tool.createdAt,
    updatedAt: tool.updatedAt,
    assignedAgents: tool.assignedAgents,
    contentHash: hash,
    lastExportedAt: new Date().toISOString(),
    raw: tool.raw,
  };

  await Promise.all([
    writeFile(`${dir}/tool.json`, JSON.stringify(toolJson, null, 2), "utf8"),
    writeFile(`${dir}/description.md`, buildDescriptionMarkdown(tool), "utf8"),
    writeFile(
      `${dir}/arguments.json`,
      JSON.stringify({ arguments: tool.arguments, advancedArguments: tool.advancedArguments }, null, 2),
      "utf8",
    ),
    writeFile(`${dir}/fetcher.js`, tool.fetcherCode ?? MISSING_CODE_NOTICE("fetcher"), "utf8"),
    writeFile(`${dir}/transformer.js`, tool.transformerCode ?? MISSING_CODE_NOTICE("transformer"), "utf8"),
    writeFile(`${dir}/source.js`, tool.sourceCode ?? MISSING_CODE_NOTICE("source"), "utf8"),
    writeFile(`${dir}/test.json`, JSON.stringify(tool.testConfig ?? null, null, 2), "utf8"),
  ]);

  return { slug, hash };
}

export interface AssignedToolRef {
  id: string;
  name: string;
  slug: string;
}

/**
 * Agent folders never duplicate tool implementations — they only reference
 * the shared beacon-reference/tools/<slug> folder by id and relative path.
 */
export async function writeAgentFiles(agent: AgentRecord, slug: string, assignedTools: AssignedToolRef[]): Promise<void> {
  const dir = agentDir(slug);
  await mkdir(dir, { recursive: true });

  const agentJson = {
    id: agent.id,
    slug,
    name: agent.name,
    description: agent.description,
    exportedAt: new Date().toISOString(),
    raw: agent.raw,
  };

  const toolsJson = assignedTools.map((t) => ({
    toolId: t.id,
    toolName: t.name,
    path: toolRelativePath(t.slug),
  }));

  const readme = [
    `# ${agent.name}`,
    "",
    agent.description ?? "_No description provided._",
    "",
    "## Assigned tools",
    "",
    assignedTools.length === 0
      ? "_None._"
      : assignedTools.map((t) => `- [${t.name}](../../${toolRelativePath(t.slug)}) (\`${t.id}\`)`).join("\n"),
    "",
  ].join("\n");

  await Promise.all([
    writeFile(`${dir}/agent.json`, JSON.stringify(agentJson, null, 2), "utf8"),
    writeFile(`${dir}/tools.json`, JSON.stringify(toolsJson, null, 2), "utf8"),
    writeFile(`${dir}/README.md`, readme, "utf8"),
  ]);
}

const MISSING_FUNCTION_CODE_NOTICE =
  "// Beacon did not return code for this function (or the endpoint hasn't been mapped yet).\n" +
  "// See function.json -> raw.code for the unmodified API response, if any was captured.\n";

export interface WriteFunctionResult {
  slug: string;
  hash: string;
}

export function computeFunctionContentHash(fn: FunctionRecord): string {
  return contentHash({ id: fn.id, name: fn.name, status: fn.status, code: fn.code });
}

export async function writeFunctionFiles(fn: FunctionRecord, slug: string): Promise<WriteFunctionResult> {
  const dir = functionDir(slug);
  await mkdir(dir, { recursive: true });

  const hash = computeFunctionContentHash(fn);

  const functionJson = {
    id: fn.id,
    slug,
    name: fn.name,
    status: fn.status,
    createdAt: fn.createdAt,
    updatedAt: fn.updatedAt,
    contentHash: hash,
    lastExportedAt: new Date().toISOString(),
    raw: fn.raw,
  };

  const readme = [`# ${fn.name}`, "", `**Status:** ${fn.status ?? "unknown"}`, "", "Invoke from tool code via:", "", "```js", `BeaconBar.executeFunction("${fn.name}")`, "```", ""].join("\n");

  await Promise.all([
    writeFile(`${dir}/function.json`, JSON.stringify(functionJson, null, 2), "utf8"),
    writeFile(`${dir}/README.md`, readme, "utf8"),
    writeFile(`${dir}/code.js`, fn.code ?? MISSING_FUNCTION_CODE_NOTICE, "utf8"),
  ]);

  return { slug, hash };
}
