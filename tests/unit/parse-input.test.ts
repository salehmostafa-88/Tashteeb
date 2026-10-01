import { describe, expect, it } from "vitest";
import { normalizeDigits } from "@/lib/i18n/digits";
import { parseAmountInput } from "@/lib/money/parse-input";

describe("normalizeDigits", () => {
  it("maps Arabic-Indic and Eastern Arabic-Indic digits and separators", () => {
    expect(normalizeDigits("١٢٣٤٥٦٧٨٩٠")).toBe("1234567890");
    expect(normalizeDigits("۱۲۳")).toBe("123");
    expect(normalizeDigits("١٬٢٥٠٫٥٠")).toBe("1,250.50");
  });
});

describe("parseAmountInput (UX-05)", () => {
  it.each([
    ["1250", 125000n],
    ["1250.5", 125050n],
    ["1,250.50", 125050n],
    ["١٢٥٠", 125000n],
    ["١٬٢٥٠٫٥٠", 125050n],
    ["  100.25 ", 10025n],
    ["0.01", 1n],
    ["\u200F١٠٠\u200F", 10000n],
    ["999999999999.99", 99_999_999_999_999n],
  ])("%j -> %s minor", (raw, minor) => {
    expect(parseAmountInput(raw)).toEqual({ ok: true, minor });
  });

  it.each([
    ["", "empty"],
    ["   ", "empty"],
    ["-5", "negative"],
    ["0", "zero"],
    ["0.00", "zero"],
    ["1.234", "too_many_decimals"],
    ["1000000000000.00", "too_large"],
    ["1,5", "invalid_format"],
    ["12,50", "invalid_format"],
    ["1,2345", "invalid_format"],
    ["1.250,50", "invalid_format"],
    ["01", "invalid_format"],
    [".5", "invalid_format"],
    ["1e3", "invalid_format"],
    ["abc", "invalid_format"],
    ["١،٢٥٠", "invalid_format"],
  ])("%j is rejected as %s", (raw, error) => {
    expect(parseAmountInput(raw)).toEqual({ ok: false, error });
  });
});
