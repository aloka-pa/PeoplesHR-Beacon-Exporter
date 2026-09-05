import { describe, expect, it } from "vitest";
import type { APIRequestContext } from "playwright";
import { BeaconClient } from "../src/beacon/client.js";
import { BeaconApiError, BeaconAuthExpiredError, EndpointMapMissingError } from "../src/beacon/errors.js";
import type { EndpointMap } from "../src/discovery/types.js";

interface RouteResponse {
  status: number;
  contentType: string;
  body: string;
}

interface Route {
  match: (url: URL) => boolean;
  respond: (url: URL, callIndex: number) => RouteResponse;
}

function makeFakeRequest(routes: Route[]): { request: APIRequestContext; callLog: string[] } {
  const callLog: string[] = [];
  const callCounts = new Map<Route, number>();

  const request = {
    fetch: async (url: string) => {
      callLog.push(url);
      const parsed = new URL(url);
      const route = routes.find((r) => r.match(parsed));
      if (!route) throw new Error(`No fake route matched: ${url}`);
      const count = callCounts.get(route) ?? 0;
      callCounts.set(route, count + 1);
      const res = route.respond(parsed, count);
      return {
        status: () => res.status,
        headers: () => ({ "content-type": res.contentType }),
        text: async () => res.body,
      };
    },
  } as unknown as APIRequestContext;

  return { request, callLog };
}

function baseMap(operations: EndpointMap["operations"]): EndpointMap {
  return {
    generatedAt: new Date().toISOString(),
    beaconBaseUrl: "https://studio.beacon.li",
    authMode: "cookie",
    operations,
    notes: [],
  };
}

const listToolsOp = { operation: "listTools", method: "GET", urlTemplate: "/api/tools/list?page={page}&size={size}&filters={filters}", confidence: "high" as const, sampleUrl: "", responseShapeHint: [], step: "tools-list" as const };
const listAgentsOp = { operation: "listAgents", method: "GET", urlTemplate: "/api/agents/list?page={page}&size={size}&filters={filters}", confidence: "high" as const, sampleUrl: "", responseShapeHint: [], step: "agents-list" as const };
const getToolOp = { operation: "getTool", method: "GET", urlTemplate: "/api/tools/get?id={id}", confidence: "high" as const, sampleUrl: "", responseShapeHint: [], step: "open-tool" as const };

function toolFixture(id: string, name: string) {
  return {
    _id: id,
    name,
    description: `Description for ${name}`,
    taskName: "Attendance",
    tags: ["attendance"],
    status: "published",
    signature: { name, args: [{ name: "employeeId", type: "string", required: true }], isAdvanced: false },
    fetcher: "(function(){})",
    transformer: "(function(){})",
    sourceConstructor: "(function(){})",
    agents: [{ _id: "agent-1", name: "Attendance Agent" }],
    sampleRequest: {},
    sanity: { apiResponse: [] },
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-06-01T00:00:00.000Z",
  };
}

describe("BeaconClient.listTools pagination", () => {
  it("paginates using the response's count field and aggregates fully-normalized tools", async () => {
    const { request, callLog } = makeFakeRequest([
      {
        match: (u) => u.pathname === "/api/tools/list",
        respond: (u) => {
          const page = u.searchParams.get("page");
          if (page === "0") {
            return { status: 200, contentType: "application/json", body: JSON.stringify({ count: 3, result: [toolFixture("1", "Tool One"), toolFixture("2", "Tool Two")] }) };
          }
          return { status: 200, contentType: "application/json", body: JSON.stringify({ count: 3, result: [toolFixture("3", "Tool Three")] }) };
        },
      },
    ]);

    const client = new BeaconClient({ request, endpointMap: baseMap({ listTools: listToolsOp }), endpointMapPath: "test", pageSize: 2 });
    const tools = await client.listTools();

    expect(tools.map((t) => t.id)).toEqual(["1", "2", "3"]);
    expect(tools[0]?.name).toBe("Tool One");
    expect(tools[0]?.fetcherCode).toBe("(function(){})");
    expect(tools[0]?.assignedAgents).toEqual([{ id: "agent-1", name: "Attendance Agent" }]);
    expect(callLog).toHaveLength(2);
  });

  it("stops when a page returns zero items", async () => {
    const { request } = makeFakeRequest([
      { match: (u) => u.pathname === "/api/tools/list", respond: () => ({ status: 200, contentType: "application/json", body: JSON.stringify({ count: 0, result: [] }) }) },
    ]);
    const client = new BeaconClient({ request, endpointMap: baseMap({ listTools: listToolsOp }), endpointMapPath: "test" });
    expect(await client.listTools()).toEqual([]);
  });
});

describe("BeaconClient.listAgents", () => {
  it("normalizes agents including toolIds", async () => {
    const { request } = makeFakeRequest([
      {
        match: (u) => u.pathname === "/api/agents/list",
        respond: () => ({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ count: 1, result: [{ _id: "agent-1", name: "Attendance Agent", description: "Handles attendance", toolIds: ["1", "2"] }] }),
        }),
      },
    ]);
    const client = new BeaconClient({ request, endpointMap: baseMap({ listAgents: listAgentsOp }), endpointMapPath: "test" });
    const agents = await client.listAgents();
    expect(agents).toHaveLength(1);
    expect(agents[0]).toMatchObject({ id: "agent-1", name: "Attendance Agent", toolIds: ["1", "2"] });
  });
});

describe("BeaconClient.getTool and partial/failure handling", () => {
  it("fetches and normalizes a single tool by id", async () => {
    const { request } = makeFakeRequest([
      { match: (u) => u.pathname === "/api/tools/get", respond: (u) => ({ status: 200, contentType: "application/json", body: JSON.stringify(toolFixture(u.searchParams.get("id") ?? "?", "Solo Tool")) }) },
    ]);
    const client = new BeaconClient({ request, endpointMap: baseMap({ getTool: getToolOp }), endpointMapPath: "test" });
    const tool = await client.getTool("42");
    expect(tool.id).toBe("42");
    expect(tool.name).toBe("Solo Tool");
  });

  it("throws EndpointMapMissingError when an operation was never discovered", async () => {
    const { request } = makeFakeRequest([]);
    const client = new BeaconClient({ request, endpointMap: baseMap({}), endpointMapPath: "test" });
    await expect(client.getTool("1")).rejects.toThrow(EndpointMapMissingError);
  });

  it("retries transient 5xx errors up to maxRetries before failing", async () => {
    const { request, callLog } = makeFakeRequest([
      { match: (u) => u.pathname === "/api/tools/get", respond: () => ({ status: 500, contentType: "text/plain", body: "boom" }) },
    ]);
    const client = new BeaconClient({ request, endpointMap: baseMap({ getTool: getToolOp }), endpointMapPath: "test", maxRetries: 3, retryDelayMs: 1 });
    await expect(client.getTool("1")).rejects.toThrow(BeaconApiError);
    expect(callLog).toHaveLength(3);
  });

  it("does not retry non-transient 4xx errors", async () => {
    const { request, callLog } = makeFakeRequest([
      { match: (u) => u.pathname === "/api/tools/get", respond: () => ({ status: 404, contentType: "text/plain", body: "not found" }) },
    ]);
    const client = new BeaconClient({ request, endpointMap: baseMap({ getTool: getToolOp }), endpointMapPath: "test", maxRetries: 3, retryDelayMs: 1 });
    await expect(client.getTool("1")).rejects.toThrow(BeaconApiError);
    expect(callLog).toHaveLength(1);
  });

  it("raises BeaconAuthExpiredError when a login page is returned instead of JSON", async () => {
    const { request } = makeFakeRequest([
      { match: (u) => u.pathname === "/api/tools/get", respond: () => ({ status: 200, contentType: "text/html", body: "<html><body>Please sign in</body></html>" }) },
    ]);
    const client = new BeaconClient({ request, endpointMap: baseMap({ getTool: getToolOp }), endpointMapPath: "test" });
    await expect(client.getTool("1")).rejects.toThrow(BeaconAuthExpiredError);
  });
});
