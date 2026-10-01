import { describe, expect, it } from "vitest";
import { DEFAULT_ACCENT, contrastRatio, resolveAccent } from "@/lib/brand/contrast";

describe("tenant accent contrast (PORTAL-05)", () => {
  it("computes WCAG contrast ratios", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 5);
    expect(contrastRatio("#FFFFFF", "#FFFFFF")).toBeCloseTo(1, 5);
  });

  it("default accent carries white text at AA", () => {
    expect(contrastRatio(DEFAULT_ACCENT, "#FFFFFF")).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps a readable tenant accent", () => {
    expect(resolveAccent("#1f4e79")).toEqual({ accent: "#1F4E79", usedFallback: false });
  });

  it.each(["#FFE45C", "#a5b4fc", "red", "#123", "javascript:alert(1)", ""])("falls back for %j", (value) => {
    expect(resolveAccent(value)).toEqual({ accent: DEFAULT_ACCENT, usedFallback: true });
  });

  it("uses the default silently when no accent is configured", () => {
    expect(resolveAccent(null)).toEqual({ accent: DEFAULT_ACCENT, usedFallback: false });
  });
});
