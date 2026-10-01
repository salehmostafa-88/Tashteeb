import type { AppLocale } from "@/i18n/routing";
import type { CurrencyCode } from "@/lib/money/currency";
import { parseMinorString } from "@/lib/money/minor";
import type { CategoryTotalDto } from "@/modules/portal/dto";
import { MoneyAmount } from "./MoneyAmount";

const barColor: Record<CategoryTotalDto["color_group"], string> = {
  materials: "bg-[#8fb3e8]",
  labor: "bg-[#8ccaa3]",
  structure: "bg-[#e3c27a]",
  mep: "bg-[#7fc4c0]",
  metal: "bg-[#b4a2e6]",
  finishes: "bg-[#e3a2b5]",
  carpentry: "bg-[#9aa7b8]",
  other: "bg-[#bdbdbd]",
};

/**
 * Plain HTML bars: native RTL, readable by screen readers, and able to show a
 * negative category net (after refunds) without an invalid donut slice.
 */
export function CategoryBars({
  items,
  currency,
  locale,
}: {
  items: CategoryTotalDto[];
  currency: CurrencyCode;
  locale: AppLocale;
}) {
  const rows = items.map((item) => ({ item, value: parseMinorString(item.cost_base_minor) }));
  const values = rows.map((row) => row.value);
  const max = values.reduce((m, v) => (v < 0n ? (-v > m ? -v : m) : v > m ? v : m), 0n);
  const hasNegative = values.some((v) => v < 0n);

  // Bar geometry only; the displayed amounts stay exact strings.
  const share = (v: bigint) => (max === 0n ? 0 : Number(((v < 0n ? -v : v) * 1000n) / max) / 10);

  return (
    <ul className="flex flex-col gap-4">
      {rows.map(({ item, value }) => {
        const width = `${share(value)}%`;
        return (
          <li key={item.category_id} className="flex flex-col gap-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <span className="font-semibold text-ink">{item.name}</span>
              <MoneyAmount
                minor={item.cost_base_minor}
                currency={currency}
                locale={locale}
                className={value < 0n ? "text-danger" : "text-ink"}
              />
            </div>
            {hasNegative ? (
              <div className="grid h-3 grid-cols-2" aria-hidden="true">
                <div className="flex justify-end overflow-hidden rounded-s-full bg-canvas">
                  {value < 0n && <div className="h-full bg-danger/70" style={{ width }} />}
                </div>
                <div className="flex overflow-hidden rounded-e-full border-s border-muted bg-canvas">
                  {value >= 0n && <div className={`h-full ${barColor[item.color_group]}`} style={{ width }} />}
                </div>
              </div>
            ) : (
              <div className="h-3 overflow-hidden rounded-full bg-canvas" aria-hidden="true">
                <div className={`h-full rounded-full ${barColor[item.color_group]}`} style={{ width }} />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
