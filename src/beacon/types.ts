export interface AgentRef {
  id: string;
  name: string | null;
}

export interface ToolArgument {
  name: string;
  type: string | null;
  required: boolean | null;
  defaultValue: unknown;
  description: string | null;
  advanced: boolean;
  /** Untouched original object for fields we don't explicitly model. */
  raw: unknown;
}

export interface ToolRecord {
  id: string;
  name: string;
  description: string | null;
  instructions: string | null;
  taskName: string | null;
  tags: string[];
  status: string | null;
  assignedAgents: AgentRef[];
  signature: string | null;
  arguments: ToolArgument[];
  advancedArguments: ToolArgument[];
  fetcherCode: string | null;
  transformerCode: string | null;
  sourceCode: string | null;
  testConfig: unknown;
  createdAt: string | null;
  updatedAt: string | null;
  /** Raw, sanitized-only (no field renaming) API responses per section, for audit/debug. */
  raw: {
    basic: unknown;
    arguments: unknown;
    fetcher: unknown;
    transformer: unknown;
    source: unknown;
    test: unknown;
  };
}

/**
 * A Beacon Function: a small named JS snippet invoked from tool code via
 * `BeaconBar.executeFunction("name")`. Beacon's real shape is minimal —
 * {_id, name, status, code, by, branch} — no description/tags/arguments.
 */
export interface FunctionRecord {
  id: string;
  name: string;
  status: string | null;
  code: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  raw: unknown;
}

/** Lightweight row from the Functions list endpoint — no `code` field, so a detail fetch is needed for the body. */
export interface FunctionSummary {
  id: string;
  name: string;
  status: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface AgentRecord {
  id: string;
  name: string;
  description: string | null;
  /** Tool ids this agent references (Beacon's `toolIds` field) — informational; tool.assignedAgents is authoritative. */
  toolIds: string[];
  raw: unknown;
}

export interface PageResult<T> {
  items: T[];
  totalKnown: number | null;
}
