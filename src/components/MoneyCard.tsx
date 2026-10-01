import type { AppLocale } from "@/i18n/routing";
import type { CurrencyCode } from "@/lib/money/currency";
import { parseMinorString } from "@/lib/money/minor";
import { MoneyAmount } from "./MoneyAmount";

export function MoneyCard({
  label,
  definition,
  minor,
  currency,
  locale,
  negativeLabel,
  emphasis = false,
  testId,
}: {
  label: string;
  definition: string;
  minor: string;
  currency: CurrencyCode;
  locale: AppLocale;
  /** Shown instead of the label when the value is negative (e.g. funding shortfall). */
  negativeLabel?: string;
  emphasis?: boolean;
  testId?: string;
}) {
  const value = parseMinorString(minor);
  const negative = value < 0n;
  const shown = negative && negativeLabel ? (-value).toString() : minor;

  return (
    <section
      data-testid={testId}
      className={`flex flex-col gap-2 rounded-[var(--radius-card)] border bg-surface p-5 ${
        emphasis ? "border-primary" : "border-line"
      }`}
    >
      <h3 className={`text-sm font-semibold ${negative ? "text-danger" : "text-muted"}`}>
        {negative && negativeLabel ? negativeLabel : label}
      </h3>
      <MoneyAmount
        minor={shown}
        currency={currency}
        locale={locale}
        className={`text-[1.75rem] leading-tight font-bold sm:text-[2rem] ${negative ? "text-danger" : "text-ink"}`}
      />
      <p className="text-sm text-muted">{definition}</p>
    </section>
  );
}
