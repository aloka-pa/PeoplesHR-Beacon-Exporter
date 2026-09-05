import { describe, expect, it } from "vitest";
import { REDACTED, redactHeaders, redactJson, redactRawText, redactUrl } from "../src/security/redact.js";

describe("redactHeaders", () => {
  it("redacts authorization and cookie headers case-insensitively", () => {
    const out = redactHeaders({ Authorization: "Bearer abc123", COOKIE: "session=xyz", "x-request-id": "abc" });
    expect(out.Authorization).toBe(REDACTED);
    expect(out.COOKIE).toBe(REDACTED);
    expect(out["x-request-id"]).toBe("abc");
  });

  it("redacts vendor auth-like headers via hint matching", () => {
    const out = redactHeaders({ "X-Api-Key": "secret", "X-Session-Token": "abc" });
    expect(out["X-Api-Key"]).toBe(REDACTED);
    expect(out["X-Session-Token"]).toBe(REDACTED);
  });

  it("returns an empty object for undefined/null input", () => {
    expect(redactHeaders(undefined)).toEqual({});
    expect(redactHeaders(null)).toEqual({});
  });
});

describe("redactJson", () => {
  it("redacts secret-shaped keys anywhere in a nested structure", () => {
    const input = {
      name: "tool",
      auth: { password: "hunter2", token: "abc" },
      list: [{ apiKey: "k1" }, { safe: "value" }],
    };
    const out = redactJson(input) as typeof input;
    expect(out.auth.password).toBe(REDACTED);
    expect(out.auth.token).toBe(REDACTED);
    expect((out.list[0] as Record<string, unknown>).apiKey).toBe(REDACTED);
    expect((out.list[1] as Record<string, unknown>).safe).toBe("value");
    expect(out.name).toBe("tool");
  });

  it("preserves structure and non-secret data untouched", () => {
    const input = { arguments: [{ name: "employeeId", type: "string", required: true }] };
    expect(redactJson(input)).toEqual(input);
  });

  it("leaves empty-string secret values as empty rather than masking them", () => {
    const out = redactJson({ password: "" }) as { password: string };
    expect(out.password).toBe("");
  });
});

describe("redactUrl", () => {
  it("redacts secret query parameters", () => {
    const out = redactUrl("https://studio.beacon.li/api/tools?token=abc123&page=1");
    expect(out).toContain("page=1");
    expect(out).not.toContain("abc123");
  });

  it("returns the original string for invalid URLs", () => {
    expect(redactUrl("not-a-url")).toBe("not-a-url");
  });
});

describe("redactRawText", () => {
  it("masks key=value secrets in form-encoded-like text", () => {
    const out = redactRawText("password=hunter2&username=bob");
    expect(out).toContain("username=bob");
    expect(out).not.toContain("hunter2");
  });
});
