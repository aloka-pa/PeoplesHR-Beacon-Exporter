# beacon-exporter

A local exporter/sync utility that discovers Beacon Agent Studio's private
API through your own authenticated browser session and mirrors its agents,
tools and transformers into `beacon-reference/` — a plain folder of JSON/JS
files that Claude Code (or you) can read directly, instead of copy-pasting
every field out of the dashboard by hand.

This is **not** an MCP server. It's a CLI you run locally, on demand.

## Already exported — use it as-is

`beacon-reference/` in this repo is already populated: **356 tools, 180
functions, and 28 agents**, fully synced from Beacon Agent Studio. If you're
just here to reference existing PeoplesHR tool/agent/function implementations
(patterns, arguments, fetcher/transformer/source code, etc.), you don't need
to run anything below — just browse `beacon-reference/` directly, or point
Claude Code at it. Start with `beacon-reference/tool-index.json` /
`function-index.json` and `TOOL_PATTERNS.md` for a low-token overview.

The setup and commands below are only needed if you want to **refresh**
`beacon-reference/` with your own Beacon login (e.g. once it's gone stale),
not to use what's already here.

## How it works, in three phases

1. **Discover** (`npm run beacon:discover`) — opens a real, visible Chromium
   window with a persistent profile. You log in manually and click through one representative tool's tabs. While
   you do that, the tool watches the page's own fetch/XHR traffic, redacts
   anything secret, and writes a sanitized capture plus a best-effort
   **endpoint map** to `discovery-output/` (gitignored).
2. **Export** (`npm run beacon:export`) — reuses that same browser profile's
   authenticated session (via Playwright's `context.request`, so no token
   ever gets copied out by hand) to call the endpoints from the discovered
   map, and writes the full agent/tool data to `beacon-reference/`.
3. **Validate** (`npm run beacon:validate`) — checks that every exported
   tool actually has all of its sections (description, arguments, fetcher,
   transformer, source, test) and reports anything partial, failed, or
   still carrying a redacted-secret placeholder.

## One-time setup

```bash
npm install
npm run playwright:install   # downloads the Chromium build Playwright drives
cp .env.example .env         # then edit BEACON_BASE_URL / BEACON_TOOLS_URL if needed
```

Nothing in `.env`, `browser-profile/`, or `discovery-output/` is ever
committed — see `.gitignore`. No password, token, cookie, or Authorization
header is ever written to a file this tool keeps.

## Step 1 — Discover the API (do this once, and again if Beacon's UI changes)

```bash
npm run beacon:discover
```

A Chromium window opens. Follow the terminal prompts in order:

1. Log in manually. Wait for the Tools page to load.
2. Open the Tools list.
3. Open the Agents list.
4. Open **one** representative tool (e.g. `submitSubordinatesManualInAndOut`,
   or set `BEACON_SAMPLE_TOOL_NAME` in `.env`).
5. Within that tool, visit: Basic Details → Arguments → Fetcher →
   Transformer → Source → Test.

Press Enter after each step. You don't need to copy anything — the network
requests behind each tab are captured automatically. When you're done, the
tool writes:

- `discovery-output/session.json` — the full sanitized capture (for your own audit).
- `discovery-output/endpoint-map.json` — a **draft** mapping from logical
  operations (`listTools`, `getToolFetcher`, etc.) to the real URLs Beacon
  used, with a confidence rating per entry.

**Review `discovery-output/endpoint-map.json` before exporting.** Low/medium
confidence entries mean more than one plausible request was captured for
that step — pick the right one and adjust the `urlTemplate` if needed. The
`notes` array in that file calls out anything worth double-checking.

## Step 2 — Export

```bash
npm run beacon:export                       # everything
npm run beacon:export -- --agent "HR Bot"   # only tools assigned to one agent
npm run beacon:export -- --tool "submitSubordinatesManualInAndOut"
npm run beacon:export -- --changed-only     # skip tools Beacon hasn't updated
npm run beacon:export -- --prune            # actually delete local folders for tools Beacon no longer has (opt-in, never automatic)
```

This never deletes anything on its own: a tool that disappears from Beacon
is marked `"missing"` in `manifest.json`, not removed, until you explicitly
pass `--prune`.

Recommended first run: export just the one tool you used for discovery and
check it by hand before doing a full export.

```bash
npm run beacon:export -- --tool "submitSubordinatesManualInAndOut"
```

## Step 3 — Validate

```bash
npm run beacon:validate
```

Prints (and writes to `beacon-reference/validation-report.json`) how many
agents/tools were discovered, how many exported fully vs. partially, which
tools failed, which sections are missing per tool, and how many
secret-shaped fields were redacted.

## What you get

```text
beacon-reference/
  manifest.json          # sync state: content hash, timestamps, active/missing/archived
  tool-index.json        # flat index for Claude Code to search without opening every file
  README.md
  TOOL_PATTERNS.md       # recurring Beacon conventions, auto-analyzed from the export
  agents/<slug>/
    agent.json
    README.md
    tools.json           # references assigned tools by id + path — never duplicates code
  tools/<slug>/
    tool.json            # full metadata: id, name, description, tags, status, timestamps, hash
    description.md
    arguments.json       # every argument + advanced argument, types, required, defaults
    fetcher.js            # exactly as returned by Beacon
    transformer.js         # exactly as returned by Beacon
    source.js              # exactly as returned by Beacon
    test.json             # secrets redacted, everything else preserved
```

Each tool is exported once, under `tools/<slug>/`. Agents only ever
reference tool IDs and relative paths.

## Ongoing sync

Once discovery has run and `discovery-output/endpoint-map.json` is
confirmed working, day-to-day usage is just:

```bash
npm run beacon:export -- --changed-only
npm run beacon:validate
```

Re-run `npm run beacon:discover` only when Beacon's UI/API changes enough
that the export starts failing or the endpoint map goes stale (the client
will raise a clear "session expired" or "no endpoint mapped" error if so).

## Project layout

```text
src/
  discovery/   # Playwright-driven capture + the discovery wizard + draft endpoint-map builder
  beacon/      # typed API client built against discovery-output/endpoint-map.json
  export/      # writes beacon-reference/, manifest, tool-index, pattern analysis, validation
  security/    # redaction, filesystem-safe slugs, content hashing — shared by every phase
  cli/         # thin entry points for the three npm scripts
tests/         # vitest unit tests for the above
```

## Tests

```bash
npm test
```
