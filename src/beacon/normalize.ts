import { redactJson } from "../security/redact.js";
import { pickField, pickString } from "./fieldExtract.js";
import type { AgentRecord, AgentRef, FunctionRecord, FunctionSummary, ToolArgument, ToolRecord } from "./types.js";

/**
 * Beacon's real tool shape (confirmed via discovery against
 * /api/tools/list and /api/tools/get):
 *
 *   { _id, orgId, name, description, taskName, tags, status,
 *     signature: { name, args: [{name,type,description,required,_id}],
 *                  isAdvanced, advancedArgs: "<JSON Schema string>" },
 *     fetcher: "<code>", transformer: "<code>", sourceConstructor: "<code>",
 *     agents: [{ _id, name }], agentCount,
 *     sampleRequest, sanity: { apiResponse: [] },
 *     createdAt, updatedAt, ... }
 *
 * There are no separate endpoints for arguments/fetcher/transformer/
 * source/test — everything above is embedded in one record, for both the
 * list endpoint and the single-tool "get" endpoint. `isAdvanced` selects
 * which of `signature.args` (flat array) vs `signature.advancedArgs` (a
 * JSON Schema string) holds this tool's arguments — Beacon never appears to
 * populate both at once, but we normalize both possible shapes regardless.
 */

interface RawSimpleArg {
  name?: string;
  type?: string;
  description?: string;
  required?: boolean;
  defaultValue?: unknown;
}

interface JsonSchemaProperty {
  type?: string;
  description?: string;
  default?: unknown;
}

interface JsonSchema {
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
}

function normalizeSimpleArgs(args: unknown): ToolArgument[] {
  if (!Array.isArray(args)) return [];
  return args.map((raw) => {
    const a = raw as RawSimpleArg;
    return {
      name: a.name ?? "unnamed",
      type: a.type ?? null,
      required: a.required ?? null,
      defaultValue: a.defaultValue ?? null,
      description: a.description ?? null,
      advanced: false,
      raw: redactJson(raw),
    };
  });
}

/** Parses Beacon's `signature.advancedArgs`, a JSON-Schema-shaped string, into ToolArgument[]. */
function parseAdvancedArgsSchema(raw: unknown): ToolArgument[] {
  if (typeof raw !== "string" || raw.trim().length === 0) return [];
  let schema: JsonSchema;
  try {
    schema = JSON.parse(raw) as JsonSchema;
  } catch {
    return [];
  }
  const required = new Set(schema.required ?? []);
  const properties = schema.properties ?? {};
  return Object.entries(properties).map(([name, def]) => ({
    name,
    type: def.type ?? null,
    required: required.has(name),
    defaultValue: def.default ?? null,
    description: def.description ?? null,
    advanced: true,
    raw: redactJson(def),
  }));
}

function normalizeAgentRef(raw: unknown): AgentRef {
  if (typeof raw === "string") return { id: raw, name: null };
  return {
    id: pickString(raw, ["_id", "id", "agentId"]) ?? String(raw),
    name: pickString(raw, ["name", "agentName", "title"]),
  };
}

/** Builds a ToolRecord from one raw Beacon tool object, from either the list or get-by-id endpoint. */
export function normalizeTool(raw: unknown): ToolRecord {
  const id = pickString(raw, ["_id", "id"]) ?? "unknown";
  const name = pickString(raw, ["name"]) ?? id;
  const signature = pickField<Record<string, unknown>>(raw, ["signature"]);
  const isAdvanced = pickField<boolean>(signature, ["isAdvanced"]) === true;

  const simpleArgs = isAdvanced ? [] : normalizeSimpleArgs(pickField(signature, ["args"]));
  const advancedArgs = isAdvanced ? parseAdvancedArgsSchema(pickField(signature, ["advancedArgs"])) : [];

  const agentsRaw = pickField<unknown[]>(raw, ["agents"]) ?? [];
  const assignedAgents = Array.isArray(agentsRaw) ? agentsRaw.map(normalizeAgentRef) : [];

  const sampleRequest = pickField(raw, ["sampleRequest"]);
  const sanity = pickField(raw, ["sanity"]);

  const fetcherCode = pickString(raw, ["fetcher"]);
  const transformerCode = pickString(raw, ["transformer"]);
  const sourceCode = pickString(raw, ["sourceConstructor", "source"]);

  return {
    id,
    name,
    description: pickString(raw, ["description"]),
    instructions: null, // Beacon merges usage instructions into `description`; no separate field observed.
    taskName: pickString(raw, ["taskName"]),
    tags: (pickField<unknown[]>(raw, ["tags"]) ?? []).map((t) => String(t)),
    status: pickString(raw, ["status"]),
    assignedAgents,
    signature: pickString(signature, ["name"]) ?? name,
    arguments: simpleArgs,
    advancedArguments: advancedArgs,
    fetcherCode,
    transformerCode,
    sourceCode,
    testConfig: redactJson({ sampleRequest, sanity }),
    createdAt: pickString(raw, ["createdAt"]),
    updatedAt: pickString(raw, ["updatedAt"]),
    raw: {
      basic: redactJson(raw),
      arguments: redactJson(signature),
      fetcher: fetcherCode,
      transformer: transformerCode,
      source: sourceCode,
      test: redactJson({ sampleRequest, sanity }),
    },
  };
}

export function normalizeFunction(raw: unknown): FunctionRecord {
  return {
    id: pickString(raw, ["_id", "id"]) ?? "unknown",
    name: pickString(raw, ["name"]) ?? "unknown",
    status: pickString(raw, ["status"]),
    code: pickString(raw, ["code"]),
    createdAt: pickString(raw, ["createdAt"]),
    updatedAt: pickString(raw, ["updatedAt"]),
    raw: redactJson(raw),
  };
}

export function normalizeFunctionSummary(raw: unknown): FunctionSummary {
  return {
    id: pickString(raw, ["_id", "id"]) ?? "unknown",
    name: pickString(raw, ["name"]) ?? "unknown",
    status: pickString(raw, ["status"]),
    createdAt: pickString(raw, ["createdAt"]),
    updatedAt: pickString(raw, ["updatedAt"]),
  };
}

export function normalizeAgent(raw: unknown): AgentRecord {
  const toolIds = pickField<unknown[]>(raw, ["toolIds"]) ?? [];
  return {
    id: pickString(raw, ["_id", "id"]) ?? "unknown",
    name: pickString(raw, ["name"]) ?? "Unnamed agent",
    description: pickString(raw, ["description"]),
    toolIds: Array.isArray(toolIds) ? toolIds.map((t) => String(t)) : [],
    raw: redactJson(raw),
  };
}
