import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { attachCapture } from "./capture.js";
import { buildEndpointMap } from "./mapBuilder.js";
import { runDiscoveryWizard } from "./wizard.js";
import type { CapturedExchange, DiscoveryStep, DiscoverySession } from "./types.js";

const KNOWN_OPERATIONS = ["listTools", "listAgents", "getTool", "listFunctions", "getFunction"];

export interface DiscoverConfig {
  beaconBaseUrl: string;
  toolsUrl: string;
  profileDir: string;
  headless: boolean;
  sampleToolName: string;
  /** Additional hosts to capture besides the Tools page host (e.g. a separate api.* host). */
  extraHosts?: string[];
  outputDir: string;
  /** Discard any previously-captured session.json instead of merging into it. */
  fresh?: boolean;
}

function hostOf(url: string): string {
  return new URL(url).host;
}

async function loadExistingSession(outputDir: string): Promise<DiscoverySession | null> {
  try {
    const raw = await readFile(path.join(outputDir, "session.json"), "utf8");
    return JSON.parse(raw) as DiscoverySession;
  } catch {
    return null;
  }
}

export async function runDiscovery(config: DiscoverConfig): Promise<{ session: DiscoverySession; outDir: string }> {
  await mkdir(config.profileDir, { recursive: true });
  await mkdir(config.outputDir, { recursive: true });

  console.log(`Launching persistent Chromium profile at ${config.profileDir} ...`);
  const context = await chromium.launchPersistentContext(config.profileDir, {
    headless: config.headless,
    viewport: null,
    args: ["--start-maximized"],
  });

  const page = context.pages()[0] ?? (await context.newPage());

  const hostAllowlist = Array.from(new Set([hostOf(config.toolsUrl), hostOf(config.beaconBaseUrl), ...(config.extraHosts ?? [])]));

  const exchanges: CapturedExchange[] = [];
  let currentStep: DiscoveryStep = "login";

  const detach = attachCapture(context, {
    hostAllowlist,
    getCurrentStep: () => currentStep,
    onExchange: (exchange) => {
      exchanges.push(exchange);
      console.log(`  [${exchange.step}] ${exchange.method} ${exchange.urlShape} -> ${exchange.status ?? "?"}`);
    },
    onError: (err) => {
      console.warn("  (capture warning)", err instanceof Error ? err.message : err);
    },
  });

  const startedAt = new Date().toISOString();

  try {
    console.log(`Navigating to ${config.toolsUrl} ...`);
    await page.goto(config.toolsUrl, { waitUntil: "domcontentloaded" }).catch(() => {
      console.warn("Initial navigation did not fully settle (likely a login redirect) — continue manually in the browser.");
    });

    await runDiscoveryWizard((step) => {
      currentStep = step;
    });
  } finally {
    detach();
  }

  const finishedAt = new Date().toISOString();
  await context.close();

  // Merge into any previously-captured session by default, so re-running
  // discovery to learn about one new area (e.g. Functions) never discards
  // endpoints already confirmed for tools/agents. Pass fresh:true to start over.
  const existing = config.fresh ? null : await loadExistingSession(config.outputDir);
  const priorMaxSeq = existing ? Math.max(0, ...existing.exchanges.map((e) => e.seq)) : 0;
  const renumbered = exchanges.map((e, i) => ({ ...e, seq: priorMaxSeq + i + 1 }));
  const mergedExchanges = existing ? [...existing.exchanges, ...renumbered] : renumbered;

  const session: DiscoverySession = {
    startedAt: existing?.startedAt ?? startedAt,
    finishedAt,
    beaconBaseUrl: config.beaconBaseUrl,
    toolsUrl: config.toolsUrl,
    sampleToolName: config.sampleToolName,
    exchanges: mergedExchanges,
  };

  if (existing) {
    console.log(`Merged with ${existing.exchanges.length} previously-captured request(s) from an earlier discovery run.`);
  }

  const sessionPath = path.join(config.outputDir, "session.json");
  await writeFile(sessionPath, JSON.stringify(session, null, 2), "utf8");

  const endpointMap = buildEndpointMap(session);
  const mapPath = path.join(config.outputDir, "endpoint-map.json");
  await writeFile(mapPath, JSON.stringify(endpointMap, null, 2), "utf8");

  printSummary(session, endpointMap);

  return { session, outDir: config.outputDir };
}

/**
 * Rebuilds discovery-output/endpoint-map.json from an already-captured
 * session.json, without relaunching the browser or requiring another
 * login. Useful after tweaking the map-building heuristics, or to re-check
 * a capture without repeating the manual navigation.
 */
export async function rebuildEndpointMapFromSession(outputDir: string): Promise<DiscoverySession> {
  const sessionPath = path.join(outputDir, "session.json");
  const session = JSON.parse(await readFile(sessionPath, "utf8")) as DiscoverySession;
  const endpointMap = buildEndpointMap(session);
  const mapPath = path.join(outputDir, "endpoint-map.json");
  await writeFile(mapPath, JSON.stringify(endpointMap, null, 2), "utf8");
  printSummary(session, endpointMap);
  return session;
}

function printSummary(session: DiscoverySession, endpointMap: ReturnType<typeof buildEndpointMap>): void {
  console.log("\n=== Discovery summary ===");
  const byStep = new Map<string, number>();
  for (const ex of session.exchanges) {
    byStep.set(ex.step, (byStep.get(ex.step) ?? 0) + 1);
  }
  for (const step of byStep.keys()) {
    console.log(`  ${step}: ${byStep.get(step)} request(s) captured`);
  }

  console.log("\n=== Draft endpoint map (discovery-output/endpoint-map.json) ===");
  for (const [operation, candidate] of Object.entries(endpointMap.operations)) {
    console.log(`  ${operation.padEnd(20)} [${candidate.confidence.padEnd(6)}] ${candidate.method} ${candidate.urlTemplate}`);
  }
  const missing = KNOWN_OPERATIONS.filter((op) => !endpointMap.operations[op]);
  if (missing.length > 0) {
    console.log(`\n  Missing operations (re-run discovery and visit these tabs): ${missing.join(", ")}`);
  }
  if (endpointMap.notes.length > 0) {
    console.log("\n  Notes:");
    for (const note of endpointMap.notes) console.log(`   - ${note}`);
  }
  console.log(`\nRaw sanitized capture saved to discovery-output/session.json`);
  console.log(`Review discovery-output/endpoint-map.json before running beacon:export.\n`);
}
