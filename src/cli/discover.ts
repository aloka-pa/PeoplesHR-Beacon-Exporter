#!/usr/bin/env node
import "dotenv/config";
import path from "node:path";
import { rebuildEndpointMapFromSession, runDiscovery } from "../discovery/discover.js";

async function main(): Promise<void> {
  const outputDir = path.resolve("./discovery-output");

  if (process.argv.includes("--from-session")) {
    console.log(`Rebuilding endpoint-map.json from existing ${outputDir}/session.json (no browser launch)...\n`);
    await rebuildEndpointMapFromSession(outputDir);
    return;
  }

  const beaconBaseUrl = process.env.BEACON_BASE_URL ?? "https://studio.beacon.li";
  const toolsUrl = process.env.BEACON_TOOLS_URL ?? `${beaconBaseUrl}/agent-studio/tools`;
  const profileDir = path.resolve(process.env.BROWSER_PROFILE_DIR ?? "./browser-profile");
  const headless = (process.env.BEACON_HEADLESS ?? "false").toLowerCase() === "true";
  const sampleToolName = process.env.BEACON_SAMPLE_TOOL_NAME ?? "submitSubordinatesManualInAndOut";

  console.log("Beacon discovery");
  console.log(`  Tools URL:    ${toolsUrl}`);
  console.log(`  Profile dir:  ${profileDir}`);
  console.log(`  Headless:     ${headless}`);
  console.log(`  Sample tool:  ${sampleToolName}\n`);

  await runDiscovery({
    beaconBaseUrl,
    toolsUrl,
    profileDir,
    headless,
    sampleToolName,
    outputDir,
    fresh: process.argv.includes("--fresh"),
  });
}

main().catch((err) => {
  console.error("Discovery failed:", err);
  process.exitCode = 1;
});
