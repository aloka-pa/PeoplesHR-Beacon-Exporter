import * as readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import type { DiscoveryStep } from "./types.js";

interface StepPrompt {
  step: DiscoveryStep;
  instructions: string;
}

const STEP_PROMPTS: StepPrompt[] = [
  {
    step: "login",
    instructions:
      "A Chromium window has opened. Log in to Beacon Agent Studio manually (SSO/MFA/etc).\n" +
      "Wait until the Tools page finishes loading, then come back here.",
  },
  {
    step: "tools-list",
    instructions:
      "In the browser, open the Tools list (Agent Studio > Tools) and let it fully load,\n" +
      "including the first page of results.",
  },
  {
    step: "agents-list",
    instructions:
      "Open the Agents list (wherever Beacon shows all agents you can access) and let it load.\n" +
      "If Beacon has no separate agents page, just press Enter to skip.",
  },
  {
    step: "open-tool",
    instructions:
      `Open ONE representative tool (e.g. "${process.env.BEACON_SAMPLE_TOOL_NAME ?? "submitSubordinatesManualInAndOut"}"\n` +
      "or any tool you want used as the Phase-2 smoke test) from the Tools list.",
  },
  {
    step: "basic-details",
    instructions: "Within that tool, open its Basic Details / overview tab.",
  },
  {
    step: "arguments",
    instructions: "Open the Arguments (and Advanced Arguments, if separate) tab for that tool.",
  },
  {
    step: "fetcher",
    instructions: "Open the Fetcher tab/editor for that tool.",
  },
  {
    step: "transformer",
    instructions: "Open the Transformer tab/editor for that tool.",
  },
  {
    step: "source",
    instructions: "Open the Source code/configuration tab for that tool.",
  },
  {
    step: "test",
    instructions: "Open the Test configuration tab for that tool.",
  },
  {
    step: "functions-list",
    instructions:
      "Now navigate to Agent Studio > Utilities > Functions (studio.beacon.li/agent-studio/utilities/functions)\n" +
      "and let the list fully load.",
  },
  {
    step: "open-function",
    instructions: "Open ONE representative function from that list and let its detail view load.",
  },
];

/**
 * Drives the user through each discovery step via terminal prompts.
 * `onStepStart` is called before printing instructions so the caller can
 * update the "current step" label used to tag captured network traffic.
 */
export async function runDiscoveryWizard(onStepStart: (step: DiscoveryStep) => void): Promise<void> {
  const rl = readline.createInterface({ input: stdin, output: stdout });
  try {
    stdout.write("\n=== Beacon discovery wizard ===\n");
    stdout.write(
      "At each step, perform the action in the browser, then press Enter here.\n" +
        "Network requests are being captured automatically in the background.\n",
    );
    for (const prompt of STEP_PROMPTS) {
      onStepStart(prompt.step);
      stdout.write(`\n--- Step: ${prompt.step} ---\n${prompt.instructions}\n`);
      await rl.question("Press Enter when done (or to skip this step)... ");
    }
    stdout.write("\nAll steps complete. Finishing up discovery...\n");
  } finally {
    rl.close();
  }
}

export { STEP_PROMPTS };
