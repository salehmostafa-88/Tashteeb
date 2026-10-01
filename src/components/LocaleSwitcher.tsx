"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

export function LocaleSwitcher() {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const target = locale === "ar" ? "en" : "ar";

  return (
    <Link
      href={pathname}
      locale={target}
      hrefLang={target}
      aria-label={t("switchLanguageLabel")}
      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-[var(--radius-input)] border border-line bg-surface px-3 text-sm font-semibold text-ink hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <span lang={target}>{t("switchLanguage")}</span>
    </Link>
  );
}
