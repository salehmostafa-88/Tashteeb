// Exact money primitives. Amounts are signed integer minor units held as bigint in
// application code and as base-10 strings at API boundaries. Never use JavaScript
// number for money.

import { CURRENCY_EXPONENT } from "./currency";

/** Largest single entry magnitude accepted in the MVP (API contract). */
export const MAX_ENTRY_MINOR = 99_999_999_999_999n;

const MINOR_STRING = /^-?(0|[1-9][0-9]*)$/;

export class MoneyFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MoneyFormatError";
  }
}

/** Parse an API minor-unit string such as "10025" or "-1100". */
export function parseMinorString(value: string): bigint {
  if (!MINOR_STRING.test(value) || value === "-0") {
    throw new MoneyFormatError(`Invalid minor-unit string: ${JSON.stringify(value)}`);
  }
  return BigInt(value);
}

export function toMinorString(value: bigint): string {
  return value.toString();
}

/** 1002505n -> "10025.05" for a two-decimal currency. Exact, no floating point. */
export function minorToDecimalString(minor: bigint, exponent: number = CURRENCY_EXPONENT): string {
  const negative = minor < 0n;
  const digits = (negative ? -minor : minor).toString().padStart(exponent + 1, "0");
  const whole = digits.slice(0, digits.length - exponent);
  const fraction = digits.slice(digits.length - exponent);
  const body = exponent > 0 ? `${whole}.${fraction}` : whole;
  return negative ? `-${body}` : body;
}

/**
 * Divide and round half away from zero: round the absolute rational value, then
 * restore the sign. This is the single rounding rule for fees and progress.
 */
export function roundHalfAwayFromZero(numerator: bigint, denominator: bigint): bigint {
  if (denominator <= 0n) throw new RangeError("Denominator must be positive");
  const negative = numerator < 0n;
  const abs = negative ? -numerator : numerator;
  const rounded = (abs * 2n + denominator) / (denominator * 2n);
  return negative ? -rounded : rounded;
}

/** Apply integer basis points (1800 = 18%) to a minor-unit amount, rounding once. */
export function applyBasisPoints(baseMinor: bigint, basisPoints: number): bigint {
  if (!Number.isInteger(basisPoints) || basisPoints < 0 || basisPoints > 10_000) {
    throw new RangeError("Basis points must be an integer from 0 to 10000");
  }
  return roundHalfAwayFromZero(baseMinor * BigInt(basisPoints), 10_000n);
}
