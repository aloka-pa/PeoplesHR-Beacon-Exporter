import { describe, expect, it } from "vitest";
import { normalizeAgent, normalizeFunction, normalizeFunctionSummary, normalizeTool } from "../src/beacon/normalize.js";

describe("normalizeTool — argument shape switching", () => {
  it("reads simple arguments from signature.args when isAdvanced is false", () => {
    const tool = normalizeTool({
      _id: "1",
      name: "simpleTool",
      signature: {
        name: "simpleTool",
        isAdvanced: false,
        args: [{ name: "employeeId", type: "string", required: true, description: "who" }],
      },
    });
    expect(tool.arguments).toHaveLength(1);
    expect(tool.arguments[0]).toMatchObject({ name: "employeeId", type: "string", required: true, description: "who", advanced: false });
    expect(tool.advancedArguments).toHaveLength(0);
  });

  it("parses the JSON-Schema advancedArgs string when isAdvanced is true", () => {
    const advancedArgs = JSON.stringify({
      type: "object",
      properties: {
        employeeNumber: { type: "string", description: "The employee number" },
        confirmed: { type: "boolean", description: "Confirm submission", default: false },
      },
      required: ["employeeNumber"],
    });
    const tool = normalizeTool({
      _id: "2",
      name: "advancedTool",
      signature: { name: "advancedTool", isAdvanced: true, advancedArgs },
    });

    expect(tool.arguments).toHaveLength(0);
    expect(tool.advancedArguments).toHaveLength(2);
    const byName = Object.fromEntries(tool.advancedArguments.map((a) => [a.name, a]));
    expect(byName.employeeNumber).toMatchObject({ type: "string", required: true, advanced: true });
    expect(byName.confirmed).toMatchObject({ type: "boolean", required: false, defaultValue: false, advanced: true });
  });

  it("tolerates a malformed advancedArgs string instead of throwing", () => {
    const tool = normalizeTool({
      _id: "3",
      name: "brokenTool",
      signature: { name: "brokenTool", isAdvanced: true, advancedArgs: "{not valid json" },
    });
    expect(tool.advancedArguments).toEqual([]);
  });

  it("maps fetcher/transformer/sourceConstructor/agents/tags/status/timestamps directly", () => {
    const tool = normalizeTool({
      _id: "4",
      name: "fullTool",
      description: "line one\nline two",
      taskName: "Attendance",
      tags: ["a", "b"],
      status: "published",
      fetcher: "fetcher code",
      transformer: "transformer code",
      sourceConstructor: "source code",
      agents: [{ _id: "agent-1", name: "Agent One" }],
      sampleRequest: { empNumber: "1" },
      sanity: { apiResponse: [] },
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-06-01T00:00:00.000Z",
    });

    expect(tool.description).toBe("line one\nline two");
    expect(tool.tags).toEqual(["a", "b"]);
    expect(tool.status).toBe("published");
    expect(tool.fetcherCode).toBe("fetcher code");
    expect(tool.transformerCode).toBe("transformer code");
    expect(tool.sourceCode).toBe("source code");
    expect(tool.assignedAgents).toEqual([{ id: "agent-1", name: "Agent One" }]);
    expect(tool.createdAt).toBe("2025-01-01T00:00:00.000Z");
    expect(tool.updatedAt).toBe("2025-06-01T00:00:00.000Z");
  });

  it("falls back to the tool id as name when name is missing, and never throws on a sparse object", () => {
    const tool = normalizeTool({ _id: "5" });
    expect(tool.id).toBe("5");
    expect(tool.name).toBe("5");
    expect(tool.arguments).toEqual([]);
    expect(tool.fetcherCode).toBeNull();
  });
});

describe("normalizeAgent", () => {
  it("extracts toolIds alongside id/name/description", () => {
    const agent = normalizeAgent({ _id: "agent-1", name: "Attendance Agent", description: "desc", toolIds: ["1", "2", "3"] });
    expect(agent).toMatchObject({ id: "agent-1", name: "Attendance Agent", description: "desc", toolIds: ["1", "2", "3"] });
  });

  it("defaults toolIds to an empty array when absent", () => {
    const agent = normalizeAgent({ _id: "agent-2", name: "No Tools Agent" });
    expect(agent.toolIds).toEqual([]);
  });
});

describe("normalizeFunction / normalizeFunctionSummary", () => {
  it("extracts id/name/status/code/timestamps from a full function record", () => {
    const fn = normalizeFunction({
      _id: "fn-1",
      name: "searchEmployee",
      status: "live",
      code: "(async function () { return 1; })",
      by: "34476",
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-06-01T00:00:00.000Z",
    });
    expect(fn).toMatchObject({
      id: "fn-1",
      name: "searchEmployee",
      status: "live",
      code: "(async function () { return 1; })",
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-06-01T00:00:00.000Z",
    });
  });

  it("normalizes a list-item summary without a code field", () => {
    const summary = normalizeFunctionSummary({
      _id: "fn-2",
      name: "workflowType",
      status: "live",
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-06-01T00:00:00.000Z",
    });
    expect(summary).toEqual({
      id: "fn-2",
      name: "workflowType",
      status: "live",
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-06-01T00:00:00.000Z",
    });
  });
});
