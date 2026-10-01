import { describe, expect, it } from "vitest";
import fixtures from "../../fixtures/financial-cases.json";
import {
  MAX_ENTRY_MINOR,
  MoneyFormatError,
  applyBasisPoints,
  minorToDecimalString,
  parseMinorString,
  roundHalfAwayFromZero,
} from "@/lib/money/minor";
import { isSupportedCurrency } from "@/lib/money/currency";

describe("roundHalfAwayFromZero", () => {
  it.each(fixtures.rounding_cases)("$numerator / $denominator -> $expected (fixture)", (c) => {
    expect(roundHalfAwayFromZero(BigInt(c.numerator), BigInt(c.denominator)).toString()).toBe(c.expected);
  });

  it.each([
    [15n, 10n, 2n],
    [-15n, 10n, -2n],
    [14n, 10n, 1n],
    [-14n, 10n, -1n],
    [25n, 10n, 3n],
    [-25n, 10n, -3n],
    [0n, 7n, 0n],
  ])("%s / %s -> %s", (n, d, expected) => {
    expect(roundHalfAwayFromZero(n, d)).toBe(expected);
  });

  it("rejects a non-positive denominator", () => {
    expect(() => roundHalfAwayFromZero(1n, 0n)).toThrow(RangeError);
  });
});

describe("applyBasisPoints", () => {
  it("matches the synthetic baseline fee: 18% of 120000.03 is 21600.01", () => {
    expect(applyBasisPoints(12_000_003n, 1800)).toBe(2_160_001n);
  });

  it("rounds once per group, not per entry (FIN-07 arithmetic)", () => {
    const perEntry = applyBasisPoints(3n, 1800) + applyBasisPoints(3n, 1800);
    const perGroup = applyBasisPoints(6n, 1800);
    expect(perEntry).toBe(2n);
    expect(perGroup).toBe(1n);
  });

  it("rejects fractional or out-of-range rates", () => {
    expect(() => applyBasisPoints(100n, 18.5)).toThrow(RangeError);
    expect(() => applyBasisPoints(100n, 10_001)).toThrow(RangeError);
    expect(() => applyBasisPoints(100n, -1)).toThrow(RangeError);
  });

  it("stays exact beyond the float-safe integer range", () => {
    const base = 9_007_199_254_740_993n; // 2^53 + 1
    expect(applyBasisPoints(base, 10_000)).toBe(base);
  });
});

describe("minor-unit strings", () => {
  it.each(["0", "10025", "-1100", "99999999999999"])("parses %s", (value) => {
    expect(parseMinorString(value).toString()).toBe(value);
  });

  it.each(["", "-0", "01", "1.5", "1e3", " 1", "+1", "١٢"])("rejects %j", (value) => {
    expect(() => parseMinorString(value)).toThrow(MoneyFormatError);
  });

  it.each([
    [10025n, "100.25"],
    [5n, "0.05"],
    [-110000n, "-1100.00"],
    [0n, "0.00"],
    [-1n, "-0.01"],
  ])("%s -> %s", (minor, decimal) => {
    expect(minorToDecimalString(minor)).toBe(decimal);
  });

  it("exposes the MVP entry limit", () => {
    expect(MAX_ENTRY_MINOR).toBe(99_999_999_999_999n);
  });
});

describe("currency allowlist", () => {
  it("accepts only the MVP two-decimal currencies", () => {
    expect(["EGP", "USD", "EUR", "AED", "SAR"].every(isSupportedCurrency)).toBe(true);
    expect(isSupportedCurrency("KWD")).toBe(false);
    expect(isSupportedCurrency("egp")).toBe(false);
  });
});
