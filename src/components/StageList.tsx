import { getTranslations } from "next-intl/server";
import type { AppLocale } from "@/i18n/routing";
import { formatBasisPointsPercent, formatInteger } from "@/lib/i18n/format";
import type { ClientStageDto } from "@/modules/portal/dto";

/** Vertical milestone cards. Unknown stays unknown: no invented status, dates or percent. */
export async function StageList({ stages, locale }: { stages: ClientStageDto[]; locale: AppLocale }) {
  const t = await getTranslations("portal");
  return (
    <ol className="grid grid-cols-2 gap-3 lg:grid-cols-3">
      {stages.map((stage) => (
        <li
          key={stage.stable_stage_key}
          data-testid="stage-card"
          className="flex flex-col gap-1 rounded-[var(--radius-card)] border border-dashed border-line bg-surface p-4"
        >
          <span className="font-semibold text-ink">
            {stage.name ?? t("stageName", { number: formatInteger(stage.order, locale) })}
          </span>
          <span className="text-sm text-muted">
            {t(`stageStatus.${stage.status}`)}
          </span>
          <span className="text-sm text-muted">
            {stage.progress_bps === null
              ? t("progressNotRecorded")
              : formatBasisPointsPercent(stage.progress_bps, locale)}
          </span>
        </li>
      ))}
    </ol>
  );
}
