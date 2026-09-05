import { describe, expect, it } from "vitest";
import { contentHash, stableStringify } from "../src/security/hash.js";

describe("stableStringify", () => {
  it("produces identical output regardless of key order", () => {
    const a = stableStringify({ b: 1, a: 2, c: { y: 1, x: 2 } });
    const b = stableStringify({ a: 2, c: { x: 2, y: 1 }, b: 1 });
    expect(a).toBe(b);
  });

  it("preserves array order (arrays are not sorted)", () => {
    const a = stableStringify({ list: [1, 2, 3] });
    const b = stableStringify({ list: [3, 2, 1] });
    expect(a).not.toBe(b);
  });
});

describe("contentHash", () => {
  it("is stable for semantically identical objects with different key order", () => {
    const h1 = contentHash({ name: "tool", tags: ["a", "b"] });
    const h2 = contentHash({ tags: ["a", "b"], name: "tool" });
    expect(h1).toBe(h2);
  });

  it("changes when content changes", () => {
    const h1 = contentHash({ fetcherCode: "return 1;" });
    const h2 = contentHash({ fetcherCode: "return 2;" });
    expect(h1).not.toBe(h2);
  });

  it("produces a 64-char hex sha256 digest", () => {
    const h = contentHash({ a: 1 });
    expect(h).toMatch(/^[0-9a-f]{64}$/);
  });
});
