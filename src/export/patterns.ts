import { mkdir, readFile, writeFile } from "node:fs/promises";
import { functionDir, referenceRoot, toolPatternsPath, toolDir } from "./paths.js";

interface PatternDef {
  title: string;
  description: string;
  regex: RegExp;
}

const PATTERNS: PatternDef[] = [
  {
    title: "Permission / menu-access checks",
    description: "Code that gates behavior on a user permission, role, or menu-access flag before proceeding.",
    regex: /\b(hasPermission|hasAccess|menuAccess|checkPermission|isAuthorized|canAccess)\b/i,
  },
  {
    title: "Authentication headers",
    description: "Requests attaching an auth/bearer/session header to an outgoing call.",
    regex: /\b(Authorization|Bearer\s|X-Auth-Token|X-Api-Key)\b/i,
  },
  {
    title: "Request construction",
    description: "HTTP client usage (fetch/axios/XHR) building outbound requests.",
    regex: /\b(fetch\(|axios\.(get|post|put|delete)|new XMLHttpRequest)\b/,
  },
  {
    title: "Argument validation",
    description: "Explicit checks that a required argument/field is present or well-formed.",
    regex: /\b(required|isRequired|validate|assert)\b.*\b(argument|arg|field|param)/i,
  },
  {
    title: "Date formatting",
    description: "Date/time formatting or parsing utilities.",
    regex: /\b(moment\(|dayjs\(|toISOString|formatDate|parseDate|Intl\.DateTimeFormat)\b/,
  },
  {
    title: "Employee / subordinate selection",
    description: "Logic that selects an employee, subordinate, or reporting-line record.",
    regex: /\b(subordinate|reportee|directReport|employeeId|selectedEmployee)\b/i,
  },
  {
    title: "API error handling",
    description: "try/catch or status-code branching around an API call.",
    regex: /\b(catch\s*\(|response\.status|res\.ok|err(or)?\.(message|code))\b/,
  },
  {
    title: "Response transformation",
    description: "Mapping/reshaping a raw API response before returning it (typical Transformer responsibility).",
    regex: /\b(\.map\(|\.reduce\(|transform\w*\s*\()\b/i,
  },
  {
    title: "Pagination",
    description: "Page/limit/offset/cursor handling for list endpoints.",
    regex: /\b(page|pageSize|limit|offset|cursor|hasMore|nextPage)\b/,
  },
  {
    title: "Self vs subordinate vs administrator operations",
    description: "Branches that distinguish acting on your own record vs a subordinate's vs an admin-level operation.",
    regex: /\b(isSelf|isAdmin|administrator|onBehalfOf|actingAs)\b/i,
  },
];

function scrubPotentialPii(line: string): string {
  return line
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[REDACTED_EMAIL]")
    .replace(/\b\d{9,}\b/g, "[REDACTED_NUMBER]");
}

interface PatternHit {
  /** Path relative to beacon-reference/, e.g. "tools/xyz/fetcher.js" or "functions/abc/code.js". */
  location: string;
  line: string;
}

async function scanFile(dirPath: string, location: string, patterns: PatternDef[], hits: Map<string, PatternHit[]>): Promise<void> {
  let content: string;
  try {
    content = await readFile(dirPath, "utf8");
  } catch {
    return;
  }
  const lines = content.split(/\r?\n/);
  for (const pattern of patterns) {
    for (const line of lines) {
      if (pattern.regex.test(line)) {
        const list = hits.get(pattern.title) ?? [];
        if (list.length < 5) {
          list.push({ location, line: scrubPotentialPii(line.trim()).slice(0, 160) });
        }
        hits.set(pattern.title, list);
        break; // one example per file per pattern is enough
      }
    }
  }
}

/**
 * Analyzes exported fetcher/transformer/source/function code for recurring
 * Beacon conventions and writes beacon-reference/TOOL_PATTERNS.md. Only
 * code structure/snippets are referenced — no employee data or secrets.
 */
export async function buildToolPatternsDoc(toolSlugs: string[], functionSlugs: string[] = []): Promise<void> {
  const hits = new Map<string, PatternHit[]>();
  const toolFiles = ["fetcher.js", "transformer.js", "source.js"];

  for (const slug of toolSlugs) {
    for (const file of toolFiles) {
      await scanFile(`${toolDir(slug)}/${file}`, `tools/${slug}/${file}`, PATTERNS, hits);
    }
  }
  for (const slug of functionSlugs) {
    await scanFile(`${functionDir(slug)}/code.js`, `functions/${slug}/code.js`, PATTERNS, hits);
  }

  const sections = PATTERNS.map((pattern) => {
    const examples = hits.get(pattern.title) ?? [];
    const exampleLines =
      examples.length === 0
        ? "_No matches found in the current export._"
        : examples.map((h) => `- \`${h.location}\`: \`${h.line}\``).join("\n");
    return `## ${pattern.title}\n\n${pattern.description}\n\n${exampleLines}\n`;
  });

  const doc = [
    "# Beacon tool patterns",
    "",
    `Auto-generated from ${toolSlugs.length} exported tool(s) and ${functionSlugs.length} function(s) by \`npm run beacon:export\`. ` +
      "Regenerated on every export — do not hand-edit; add durable notes to README.md instead.",
    "",
    ...sections,
  ].join("\n");

  await mkdir(referenceRoot(), { recursive: true });
  await writeFile(toolPatternsPath(), doc, "utf8");
}
