import { describe, expect, it } from "vitest";
import {
  formatBasisPointsPercent,
  formatDateOnly,
  formatDateTime,
  formatInteger,
  formatMoney,
  intlLocale,
} from "@/lib/i18n/format";

const WESTERN_DIGIT = /[0-9]/;
const ARABIC_INDIC_DIGIT = /[٠-٩]/;
// Normalize ICU spacing (NBSP / narrow NBSP) and bidi marks for readable assertions.
const plain = (s: string) => s.replace(/[\u200E\u200F\u061C\u2066-\u2069]/g, "").replace(/[\u00A0\u202F]/g, " ");

describe("Arabic uses Arabic-Indic digits (O06)", () => {
  it("formats money exactly with Arabic-Indic digits", () => {
    const text = formatMoney("2839998", "EGP", "ar");
    expect(ARABIC_INDIC_DIGIT.test(text)).toBe(true);
    expect(WESTERN_DIGIT.test(text)).toBe(false);
    expect(plain(text)).toBe("٢٨\u066C٣٩٩\u066B٩٨ ج.م.");
  });

  it("formats dates, percentages and integers with Arabic-Indic digits", () => {
    for (const text of [
      formatDateOnly("2026-10-01", "ar"),
      formatBasisPointsPercent(5500, "ar"),
      formatInteger(2026, "ar"),
      formatDateTime("2026-10-01T08:00:00Z", "ar", "Africa/Cairo"),
    ]) {
      expect(WESTERN_DIGIT.test(text), text).toBe(false);
      expect(ARABIC_INDIC_DIGIT.test(text), text).toBe(true);
    }
  });

  it("isolates Latin currency symbols so they are not reordered in RTL", () => {
    expect(formatMoney("4550000", "USD", "ar")).toContain("\u2066US$\u2069");
  });
});

describe("English uses Western digits", () => {
  it("formats money with a currency code", () => {
    expect(plain(formatMoney("2839998", "EGP", "en"))).toBe("EGP 28,399.98");
    expect(plain(formatMoney("-11160002", "EGP", "en"))).toBe("-EGP 111,600.02");
  });

  it("formats basis points as percent", () => {
    expect(formatBasisPointsPercent(5500, "en")).toBe("55%");
    expect(formatBasisPointsPercent(1, "en")).toBe("0.01%");
  });
});

describe("exactness and dates", () => {
  it("does not lose precision on very large amounts", () => {
    expect(plain(formatMoney("12345678901234567", "EGP", "en"))).toBe("EGP 123,456,789,012,345.67");
  });

  it("keeps a calendar date on its stored day in every timezone", () => {
    expect(formatDateOnly("2026-01-01", "en")).toBe("1 Jan 2026");
    expect(formatDateOnly("2025-02-10", "en")).toBe("10 Feb 2025");
  });

  it("shows instants in the project timezone", () => {
    // 22:30 UTC on 30 Sep is 1 Oct in Cairo (UTC+3 in this period).
    expect(formatDateTime("2026-09-30T22:30:00Z", "en", "Africa/Cairo")).toContain("1 Oct 2026");
  });

  it("rejects non-ISO dates", () => {
    expect(() => formatDateOnly("10/02/2025", "en")).toThrow(RangeError);
  });

  it("maps app locales to explicit Intl locales", () => {
    expect(intlLocale("ar")).toBe("ar-EG-u-nu-arab");
    expect(intlLocale("en")).toBe("en-GB");
  });
});
