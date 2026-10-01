// Strict parsing of a typed amount into minor units. Accepts Western or Arabic-Indic
// digits, an optional grouping separator only in valid groups of three, and at most
// two decimals. Anything ambiguous is rejected so the user can correct it before save.

import { CURRENCY_EXPONENT } from "./currency";
import { MAX_ENTRY_MINOR } from "./minor";
import { normalizeDigits } from "../i18n/digits";

export type AmountInputError = "empty" | "invalid_format" | "too_many_decimals" | "negative" | "zero" | "too_large";

export type AmountInputResult = { ok: true; minor: bigint } | { ok: false; error: AmountInputError };

const DIRECTION_MARKS = /[\u200E\u200F\u061C\u202A-\u202E\u2066-\u2069]/g;
const AMOUNT = /^(0|[1-9][0-9]{0,2}(?:,[0-9]{3})+|[1-9][0-9]*)(?:\.([0-9]+))?$/;

export function parseAmountInput(raw: string): AmountInputResult {
  const value = normalizeDigits(raw.replace(DIRECTION_MARKS, "")).trim();
  if (value === "") return { ok: false, error: "empty" };
  if (value.startsWith("-")) return { ok: false, error: "negative" };

  const match = AMOUNT.exec(value);
  if (!match) return { ok: false, error: "invalid_format" };

  const whole = (match[1] ?? "").replaceAll(",", "");
  const fraction = match[2] ?? "";
  if (fraction.length > CURRENCY_EXPONENT) return { ok: false, error: "too_many_decimals" };

  const minor = BigInt(whole + fraction.padEnd(CURRENCY_EXPONENT, "0"));
  if (minor === 0n) return { ok: false, error: "zero" };
  if (minor > MAX_ENTRY_MINOR) return { ok: false, error: "too_large" };
  return { ok: true, minor };
}
