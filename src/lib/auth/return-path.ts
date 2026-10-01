import type { AppLocale } from "@/i18n/routing";

/** Only same-site, locale-prefixed paths are allowed as post-login destinations. */
export function safeReturnPath(value: unknown, locale: AppLocale): string {
  if (
    typeof value === "string" &&
    /^\/(ar|en)(\/[A-Za-z0-9\-._~/%?=&]*)?$/.test(value) &&
    !value.startsWith("//") &&
    !value.includes("/\\") &&
    !value.includes("..")
  ) {
    return value;
  }
  return `/${locale}/app`;
}
