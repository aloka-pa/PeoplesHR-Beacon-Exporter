import { describe, expect, it } from "vitest";
import { emptyManifest, markUnseenEntriesMissing, pruneMissingEntries, type Manifest } from "../src/export/manifest.js";

function entry(manifest: Manifest, id: string) {
  const found = manifest.tools[id];
  if (!found) throw new Error(`expected manifest.tools.${id} to exist`);
  return found;
}

function withTool(manifest: Manifest, id: string, overrides: Partial<Manifest["tools"][string]> = {}): Manifest {
  manifest.tools[id] = {
    id,
    slug: id,
    name: id,
    status: "active",
    contentHash: "hash-" + id,
    beaconUpdatedAt: "2025-01-01T00:00:00.000Z",
    lastExportedAt: "2025-01-01T00:00:00.000Z",
    ...overrides,
  };
  return manifest;
}

describe("markUnseenEntriesMissing", () => {
  it("marks active tools not seen this run as missing, without deleting them", () => {
    const manifest = withTool(withTool(emptyManifest(), "a"), "b");
    const newlyMissing = markUnseenEntriesMissing(manifest.tools, new Set(["a"]));

    expect(newlyMissing).toEqual(["b"]);
    expect(entry(manifest, "b").status).toBe("missing");
    expect(entry(manifest, "b").missingSince).toBeDefined();
    expect(entry(manifest, "a").status).toBe("active");
  });

  it("does not touch tools already archived", () => {
    const manifest = withTool(emptyManifest(), "c", { status: "archived" });
    const newlyMissing = markUnseenEntriesMissing(manifest.tools, new Set());
    expect(newlyMissing).toEqual([]);
    expect(entry(manifest, "c").status).toBe("archived");
  });

  it("is a no-op when every tool was seen", () => {
    const manifest = withTool(emptyManifest(), "a");
    const newlyMissing = markUnseenEntriesMissing(manifest.tools, new Set(["a"]));
    expect(newlyMissing).toEqual([]);
    expect(entry(manifest, "a").status).toBe("active");
  });

  it("works the same way for the functions map", () => {
    const manifest = withTool(emptyManifest(), "f1");
    manifest.functions.f1 = manifest.tools.f1!;
    delete manifest.tools.f1;
    const newlyMissing = markUnseenEntriesMissing(manifest.functions, new Set());
    expect(newlyMissing).toEqual(["f1"]);
    expect(manifest.functions.f1?.status).toBe("missing");
  });
});

describe("pruneMissingEntries", () => {
  it("only removes missing/archived entries, never active ones", () => {
    const manifest = withTool(withTool(withTool(emptyManifest(), "a"), "b", { status: "missing" }), "c", { status: "archived" });
    const pruned = pruneMissingEntries(manifest.tools);

    expect(pruned.sort()).toEqual(["b", "c"]);
    expect(manifest.tools.a).toBeDefined();
    expect(manifest.tools.b).toBeUndefined();
    expect(manifest.tools.c).toBeUndefined();
  });

  it("requires an explicit call — a normal export never invokes it implicitly", () => {
    // markUnseenEntriesMissing alone must never delete entries.
    const manifest = withTool(emptyManifest(), "a");
    markUnseenEntriesMissing(manifest.tools, new Set());
    expect(entry(manifest, "a").status).toBe("missing");
    expect(manifest.tools.a).toBeDefined();
  });
});
