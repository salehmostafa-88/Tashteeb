// Locale-aware display formatting. Arabic always renders Arabic-Indic digits
// (owner decision O06) via an explicit numbering-system extension, because the
// plain "ar" locale renders Western digits in current ICU data.

import type { AppLocale } from "@/i18n/routing";
import type { CurrencyCode } from "../money/currency";
import { CURRENCY_EXPONENT } from "../money/currency";
import { minorToDecimalString, parseMinorString } from "../money/minor";

export function intlLocale(locale: AppLocale): string {
  return locale === "ar" ? "ar-EG-u-nu-arab" : "en-GB";
}

type DecimalString = `${number}`;

function asDecimal(minor: bigint, exponent: number): DecimalString {
  return minorToDecimalString(minor, exponent) as DecimalString;
}

export function formatMoney(
  minor: string | bigint,
  currency: CurrencyCode,
  locale: AppLocale,
  options: { signDisplay?: "auto" | "always" | "exceptZero" | "never" } = {},
): string {
  const value = typeof minor === "bigint" ? minor : parseMinorString(minor);
  const parts = new Intl.NumberFormat(intlLocale(locale), {
    style: "currency",
    currency,
    currencyDisplay: locale === "ar" ? "symbol" : "code",
    minimumFractionDigits: CURRENCY_EXPONENT,
    maximumFractionDigits: CURRENCY_EXPONENT,
    signDisplay: options.signDisplay ?? "auto",
  }).formatToParts(asDecimal(value, CURRENCY_EXPONENT));
  // A Latin currency symbol such as "US$" is reordered to "$US" inside right-to-left
  // text; wrap it in a left-to-right isolate so it always reads correctly.
  return parts
    .map((part) => (locale === "ar" && part.type === "currency" && LATIN_SYMBOL.test(part.value) ? `\u2066${part.value}\u2069` : part.value))
    .join("");
}

const LATIN_SYMBOL = /[A-Za-z$€£]/;

/** Progress or rate basis points (5500 -> 55%). */
export function formatBasisPointsPercent(bps: number, locale: AppLocale): string {
  if (!Number.isInteger(bps)) throw new RangeError("Basis points must be an integer");
  return new Intl.NumberFormat(intlLocale(locale), {
    style: "percent",
    maximumFractionDigits: 2,
  }).format(asDecimal(BigInt(bps), 4));
}

export function formatInteger(value: number, locale: AppLocale): string {
  return new Intl.NumberFormat(intlLocale(locale), { maximumFractionDigits: 0 }).format(value);
}

/** Calendar date (ISO YYYY-MM-DD). Formatted in UTC so the stored day never shifts. */
export function formatDateOnly(isoDate: string, locale: AppLocale): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) throw new RangeError("Expected ISO date YYYY-MM-DD");
  return new Intl.DateTimeFormat(intlLocale(locale), { dateStyle: "medium", timeZone: "UTC" }).format(
    new Date(`${isoDate}T00:00:00Z`),
  );
}

/** Instant (ISO timestamp) shown in the project's timezone. */
export function formatDateTime(isoInstant: string, locale: AppLocale, timeZone: string): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  }).format(new Date(isoInstant));
}
