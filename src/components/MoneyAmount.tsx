import type { AppLocale } from "@/i18n/routing";
import type { CurrencyCode } from "@/lib/money/currency";
import { formatMoney } from "@/lib/i18n/format";

/** Exact money display from a minor-unit string. Isolated so bidi never reorders it. */
export function MoneyAmount({
  minor,
  currency,
  locale,
  className,
}: {
  minor: string;
  currency: CurrencyCode;
  locale: AppLocale;
  className?: string;
}) {
  return (
    <bdi dir={locale === "ar" ? "rtl" : "ltr"} className={`tabular whitespace-nowrap ${className ?? ""}`}>
      {formatMoney(minor, currency, locale)}
    </bdi>
  );
}
