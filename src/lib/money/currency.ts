// MVP allowlist: two-decimal currencies only (decision D04). One currency per project.
export const SUPPORTED_CURRENCIES = ["EGP", "USD", "EUR", "AED", "SAR"] as const;

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];

export const CURRENCY_EXPONENT = 2;

export function isSupportedCurrency(value: unknown): value is CurrencyCode {
  return typeof value === "string" && (SUPPORTED_CURRENCIES as readonly string[]).includes(value);
}
