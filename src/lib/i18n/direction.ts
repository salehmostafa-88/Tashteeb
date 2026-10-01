import type { AppLocale } from "@/i18n/routing";

export function directionFor(locale: AppLocale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}
