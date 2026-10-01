import { describe, expect, it } from "vitest";
import { safeReturnPath } from "@/lib/auth/return-path";
import { isDeviceId } from "@/lib/device";
import { buildCsp } from "@/lib/security/csp";
import { toCommandError } from "@/lib/supabase/errors";

describe("safeReturnPath (open-redirect guard, SEC-11)", () => {
  it.each(["/en/app", "/ar/app/aaaaaaaa-0000-4000-8000-000000000000/projects", "/en/invite?token=abc", "/ar"])("keeps %s", (path) => {
    expect(safeReturnPath(path, "en")).toBe(path);
  });

  it.each([
    "https://evil.example/en/app",
    "//evil.example/en",
    "/\\evil.example",
    "/en/../../etc",
    "javascript:alert(1)",
    "/fr/app",
    "",
    null,
    42,
  ])("rejects %j", (path) => {
    expect(safeReturnPath(path, "ar")).toBe("/ar/app");
  });
});

describe("device id", () => {
  it("accepts UUIDs only", () => {
    expect(isDeviceId("d0d0d0d0-0000-4000-8000-000000000001")).toBe(true);
    expect(isDeviceId("not-a-uuid")).toBe(false);
    expect(isDeviceId(undefined)).toBe(false);
    expect(isDeviceId("d0d0d0d0-0000-4000-8000-000000000001; DROP")).toBe(false);
  });
});

describe("Content Security Policy", () => {
  it("requires the nonce for scripts and blocks framing and plugins", () => {
    const csp = buildCsp("abc123", { dev: false, supabaseUrl: "https://x.supabase.co" });
    expect(csp).toContain("script-src 'self' 'nonce-abc123' 'strict-dynamic'");
    expect(csp).not.toContain("unsafe-eval");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("connect-src 'self' https://x.supabase.co");
  });

  it("allows eval only in development", () => {
    expect(buildCsp("n", { dev: true })).toContain("'unsafe-eval'");
  });
});

describe("command error mapping", () => {
  it.each([
    [{ message: "FORBIDDEN", code: "42501" }, "FORBIDDEN", undefined],
    [{ message: "VALIDATION_ERROR:email", code: "22023" }, "VALIDATION_ERROR", "email"],
    [{ message: "CONFLICT:code", code: "23505" }, "CONFLICT", "code"],
    [{ message: "new row violates check constraint \"x\"", code: "23514" }, "VALIDATION_ERROR", undefined],
    [{ message: "permission denied for table projects", code: "42501" }, "FORBIDDEN", undefined],
    [{ message: "some internal detail", code: "XX000" }, "UNKNOWN", undefined],
    [null, "UNKNOWN", undefined],
  ])("%j -> %s", (input, code, field) => {
    const error = toCommandError(input);
    expect(error.code).toBe(code);
    expect(error.field).toBe(field);
  });
});
