import { describe, expect, it } from "vitest";
import { toSlug, toUniqueSlug } from "../src/security/slug.js";

describe("toSlug", () => {
  it("lowercases and hyphenates spaces", () => {
    expect(toSlug("Submit Subordinates Manual In And Out")).toBe("submit-subordinates-manual-in-and-out");
  });

  it("strips filesystem-reserved characters", () => {
    expect(toSlug('weird/name:with*bad?chars"<>|')).not.toMatch(/[/\\?%*:|"<>]/);
  });

  it("handles empty input", () => {
    expect(toSlug("")).toBe("untitled");
    expect(toSlug("   ")).toBe("untitled");
  });

  it("is deterministic for the same input", () => {
    const a = toSlug("submitSubordinatesManualInAndOut");
    const b = toSlug("submitSubordinatesManualInAndOut");
    expect(a).toBe(b);
  });

  it("guards against Windows reserved device names", () => {
    expect(toSlug("CON")).not.toBe("con");
    expect(toSlug("con")).toBe("_con");
  });

  it("caps length to keep nested paths under Windows limits", () => {
    const long = "a".repeat(200);
    expect(toSlug(long).length).toBeLessThanOrEqual(80);
  });
});

describe("toUniqueSlug", () => {
  it("appends a numeric suffix on collision", () => {
    const used = new Set<string>();
    const first = toUniqueSlug("Duplicate Tool", used);
    const second = toUniqueSlug("Duplicate Tool", used);
    expect(first).toBe("duplicate-tool");
    expect(second).toBe("duplicate-tool-2");
    expect(first).not.toBe(second);
  });

  it("does not collide across unrelated names", () => {
    const used = new Set<string>();
    const a = toUniqueSlug("Tool A", used);
    const b = toUniqueSlug("Tool B", used);
    expect(a).not.toBe(b);
  });
});
