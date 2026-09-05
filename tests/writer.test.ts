import { mkdtemp, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { writeAgentFiles, writeFunctionFiles, writeToolFiles } from "../src/export/writer.js";
import { toolDir, agentDir, functionDir } from "../src/export/paths.js";
import type { AgentRecord, FunctionRecord, ToolRecord } from "../src/beacon/types.js";

let tmpDir: string;
let originalRoot: string | undefined;

beforeEach(async () => {
  tmpDir = await mkdtemp(path.join(tmpdir(), "beacon-export-test-"));
  originalRoot = process.env.BEACON_REFERENCE_ROOT;
  process.env.BEACON_REFERENCE_ROOT = path.join(tmpDir, "beacon-reference");
});

afterEach(async () => {
  process.env.BEACON_REFERENCE_ROOT = originalRoot;
  await rm(tmpDir, { recursive: true, force: true });
});

function makeTool(overrides: Partial<ToolRecord> = {}): ToolRecord {
  return {
    id: "tool-1",
    name: "submitSubordinatesManualInAndOut",
    description: "Submit manual in/out times\nfor one or more subordinates.\n\nSecond paragraph.",
    instructions: "Always validate the employee is a subordinate of the caller.",
    taskName: "Attendance",
    tags: ["attendance", "peopleshr"],
    status: "published",
    assignedAgents: [{ id: "agent-1", name: "Attendance Agent" }],
    signature: "submitSubordinatesManualInAndOut(employeeId, date, inTime, outTime)",
    arguments: [
      { name: "employeeId", type: "string", required: true, defaultValue: null, description: "Target employee id", advanced: false, raw: {} },
    ],
    advancedArguments: [
      { name: "overrideValidation", type: "boolean", required: false, defaultValue: false, description: null, advanced: true, raw: {} },
    ],
    fetcherCode: "async function fetcher(args) {\n  return fetch('/api/x', { body: JSON.stringify(args) });\n}",
    transformerCode: "function transform(response) {\n  return response.data;\n}",
    sourceCode: "// source config\nmodule.exports = { endpoint: '/x' };",
    testConfig: { cases: [{ input: { employeeId: "E1" }, expected: { ok: true } }] },
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-06-01T00:00:00.000Z",
    raw: { basic: {}, arguments: {}, fetcher: {}, transformer: {}, source: {}, test: {} },
    ...overrides,
  };
}

describe("writeToolFiles", () => {
  it("creates all required files under beacon-reference/tools/<slug>/", async () => {
    const tool = makeTool();
    await writeToolFiles(tool, "submit-subordinates-manual-in-and-out");

    const dir = toolDir("submit-subordinates-manual-in-and-out");
    for (const file of ["tool.json", "description.md", "arguments.json", "fetcher.js", "transformer.js", "source.js", "test.json"]) {
      const content = await readFile(path.join(dir, file), "utf8");
      expect(content.length).toBeGreaterThan(0);
    }
  });

  it("preserves the complete description including line breaks, untruncated", async () => {
    const tool = makeTool();
    await writeToolFiles(tool, "my-tool");
    const description = await readFile(path.join(toolDir("my-tool"), "description.md"), "utf8");
    expect(description).toContain("Submit manual in/out times\nfor one or more subordinates.");
    expect(description).toContain("Second paragraph.");
  });

  it("writes fetcher/transformer/source code exactly as returned, byte-for-byte", async () => {
    const tool = makeTool();
    await writeToolFiles(tool, "my-tool");
    const dir = toolDir("my-tool");
    expect(await readFile(path.join(dir, "fetcher.js"), "utf8")).toBe(tool.fetcherCode);
    expect(await readFile(path.join(dir, "transformer.js"), "utf8")).toBe(tool.transformerCode);
    expect(await readFile(path.join(dir, "source.js"), "utf8")).toBe(tool.sourceCode);
  });

  it("preserves every argument and advanced argument with type/required/default", async () => {
    const tool = makeTool();
    await writeToolFiles(tool, "my-tool");
    const args = JSON.parse(await readFile(path.join(toolDir("my-tool"), "arguments.json"), "utf8"));
    expect(args.arguments).toHaveLength(1);
    expect(args.arguments[0]).toMatchObject({ name: "employeeId", type: "string", required: true });
    expect(args.advancedArguments).toHaveLength(1);
    expect(args.advancedArguments[0]).toMatchObject({ name: "overrideValidation", type: "boolean", required: false, defaultValue: false });
  });

  it("writes a placeholder notice (not a crash) when a code section is missing", async () => {
    const tool = makeTool({ fetcherCode: null });
    await writeToolFiles(tool, "my-tool");
    const content = await readFile(path.join(toolDir("my-tool"), "fetcher.js"), "utf8");
    expect(content).toContain("Beacon did not return");
  });

  it("preserves original Beacon id/name in tool.json even though the folder uses a slug", async () => {
    const tool = makeTool({ id: "12345", name: "Submit Subordinates: Manual In/Out!" });
    await writeToolFiles(tool, "submit-subordinates-manual-in-out");
    const toolJson = JSON.parse(await readFile(path.join(toolDir("submit-subordinates-manual-in-out"), "tool.json"), "utf8"));
    expect(toolJson.id).toBe("12345");
    expect(toolJson.name).toBe("Submit Subordinates: Manual In/Out!");
  });
});

describe("writeAgentFiles / agent-to-tool references", () => {
  it("references assigned tools by id and relative path without duplicating implementation", async () => {
    const agent: AgentRecord = { id: "agent-1", name: "Attendance Agent", description: "Handles attendance.", toolIds: ["tool-1"], raw: {} };
    await writeAgentFiles(agent, "attendance-agent", [{ id: "tool-1", name: "submitSubordinatesManualInAndOut", slug: "submit-subordinates" }]);

    const dir = agentDir("attendance-agent");
    const toolsJson = JSON.parse(await readFile(path.join(dir, "tools.json"), "utf8"));
    expect(toolsJson).toEqual([{ toolId: "tool-1", toolName: "submitSubordinatesManualInAndOut", path: "tools/submit-subordinates" }]);

    // no fetcher/transformer/source code should ever appear in the agent folder
    const raw = JSON.stringify(toolsJson);
    expect(raw).not.toContain("function fetcher");
    expect(raw).not.toContain("function transform");
  });

  it("writes agent.json with the original agent metadata", async () => {
    const agent: AgentRecord = { id: "agent-2", name: "Payroll Agent", description: null, toolIds: [], raw: { extra: "field" } };
    await writeAgentFiles(agent, "payroll-agent", []);
    const agentJson = JSON.parse(await readFile(path.join(agentDir("payroll-agent"), "agent.json"), "utf8"));
    expect(agentJson.id).toBe("agent-2");
    expect(agentJson.name).toBe("Payroll Agent");
  });
});

describe("writeFunctionFiles", () => {
  function makeFunction(overrides: Partial<FunctionRecord> = {}): FunctionRecord {
    return {
      id: "fn-1",
      name: "searchEmployee",
      status: "live",
      code: "(async function () {\n  return 1;\n})",
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-06-01T00:00:00.000Z",
      raw: {},
      ...overrides,
    };
  }

  it("writes function.json and code.js exactly as returned", async () => {
    const fn = makeFunction();
    await writeFunctionFiles(fn, "searchemployee");
    const dir = functionDir("searchemployee");

    const code = await readFile(path.join(dir, "code.js"), "utf8");
    expect(code).toBe(fn.code);

    const functionJson = JSON.parse(await readFile(path.join(dir, "function.json"), "utf8"));
    expect(functionJson).toMatchObject({ id: "fn-1", name: "searchEmployee", status: "live" });
    expect(functionJson.contentHash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("writes a placeholder notice instead of crashing when code is missing", async () => {
    const fn = makeFunction({ code: null });
    await writeFunctionFiles(fn, "no-code-fn");
    const code = await readFile(path.join(functionDir("no-code-fn"), "code.js"), "utf8");
    expect(code).toContain("Beacon did not return");
  });
});
