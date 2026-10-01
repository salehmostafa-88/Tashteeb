import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CategoryBars } from "@/components/CategoryBars";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { MoneyAmount } from "@/components/MoneyAmount";
import { MoneyCard } from "@/components/MoneyCard";
import { OrganizationBrand } from "@/components/OrganizationBrand";
import { StageList } from "@/components/StageList";
import { SyntheticBanner } from "@/components/SyntheticBanner";
import type { AppLocale } from "@/i18n/routing";
import { resolveAccent } from "@/lib/brand/contrast";
import { formatBasisPointsPercent, formatDateTime } from "@/lib/i18n/format";
import { DEMO_PROJECT_ID, demoDashboard } from "@/modules/demo/synthetic";

// Phase 0 client shell rendered from a synthetic DTO. Phase 1 adds the client
// project grant check; Phase 4 replaces the DTO source with the safe projection.
export default async function ClientPortalPage({ params }: PageProps<"/[locale]/portal/[projectId]">) {
  const { locale: rawLocale, projectId } = await params;
  const locale = rawLocale as AppLocale;
  setRequestLocale(locale);
  if (projectId !== DEMO_PROJECT_ID) notFound();

  const t = await getTranslations("portal");
  const dto = demoDashboard;
  const { project, financials: f } = dto;
  const { accent } = resolveAccent(dto.brand.accent);

  return (
    <div style={{ ["--brand-accent" as string]: accent }} className="min-h-dvh">
      <SyntheticBanner />
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <OrganizationBrand name={dto.brand.display_name} accent={dto.brand.accent} />
          <LocaleSwitcher />
        </div>
      </header>

      <main id="content" className="mx-auto flex max-w-[1200px] flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8">
        <section className="flex flex-col gap-2">
          <h1 className="text-3xl leading-snug font-bold break-words text-ink">
            <bdi>{project.display_name}</bdi>
          </h1>
          <p className="text-muted">
            {t("lastUpdated")}: {t("noPublishedUpdate")}
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-accent-soft px-3 py-1 text-sm font-semibold text-primary">
              {t("currentStageUnknown")}
            </span>
            <span className="rounded-full bg-canvas px-3 py-1 text-sm text-muted ring-1 ring-line">
              {dto.progress.overall_bps === null
                ? t("overallUnavailable")
                : formatBasisPointsPercent(dto.progress.overall_bps, locale)}
            </span>
          </div>
        </section>

        <section aria-labelledby="money-heading" className="flex flex-col gap-4">
          <h2 id="money-heading" className="sr-only">
            {t("remaining")}
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <MoneyCard
              testId="card-remaining"
              emphasis
              label={t("remaining")}
              negativeLabel={t("shortfall")}
              definition={t("remainingDef")}
              minor={f.funds_remaining_after_fees_minor}
              currency={project.currency}
              locale={locale}
            />
            <MoneyCard
              testId="card-funding"
              label={t("fundingReceived")}
              definition={t("fundingReceivedDef")}
              minor={f.funding_received_minor}
              currency={project.currency}
              locale={locale}
            />
            <MoneyCard
              testId="card-company"
              label={t("companyPaidCost")}
              definition={t("companyPaidCostDef")}
              minor={f.company_paid_cost_minor}
              currency={project.currency}
              locale={locale}
            />
          </div>

          <details className="group rounded-[var(--radius-card)] border border-line bg-surface">
            <summary className="flex min-h-11 cursor-pointer items-center px-5 font-semibold text-primary">
              {t("moreDetails")}
            </summary>
            <dl className="grid gap-4 border-t border-line p-5 md:grid-cols-3">
              {(
                [
                  ["directPurchases", f.client_direct_paid_cost_minor],
                  ["managementFees", f.management_fee_minor],
                  ["recordedProjectCost", f.recorded_project_cost_minor],
                ] as const
              ).map(([key, minor]) => (
                <div key={key} className="flex flex-col gap-1">
                  <dt className="text-sm font-semibold text-muted">{t(key)}</dt>
                  <dd className="text-xl font-bold">
                    <MoneyAmount minor={minor} currency={project.currency} locale={locale} />
                  </dd>
                  <dd className="text-sm text-muted">{t(`${key}Def`)}</dd>
                </div>
              ))}
            </dl>
          </details>
        </section>

        <section aria-labelledby="progress-heading" className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 id="progress-heading" className="text-xl font-bold">
              {t("progressTitle")}
            </h2>
            {dto.progress.overall_bps === null && <p className="text-sm text-muted">{t("overallUnavailableReason")}</p>}
          </div>
          <StageList stages={dto.progress.stages} locale={locale} />
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section aria-labelledby="category-heading" className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-line bg-surface p-5">
            <div>
              <h2 id="category-heading" className="text-xl font-bold">
                {t("categoryTitle")}
              </h2>
              <p className="text-sm text-muted">{t("categoryBasis")}</p>
            </div>
            <CategoryBars items={dto.category_totals} currency={project.currency} locale={locale} />
          </section>

          <section aria-labelledby="budget-heading" className="flex flex-col gap-2 rounded-[var(--radius-card)] border border-dashed border-line bg-surface p-5">
            <h2 id="budget-heading" className="text-xl font-bold">
              {t("budgetTitle")}
            </h2>
            <p data-testid="budget-missing" className="text-muted">
              {f.budget_cost_base_minor === null ? t("budgetMissing") : null}
            </p>
          </section>
        </div>

        <footer className="flex flex-col gap-3 border-t border-line pt-6 text-sm text-muted">
          <p>
            {t("financialAsOf")}{" "}
            {dto.financial_as_of ? formatDateTime(dto.financial_as_of, locale, project.timezone) : t("progressNeverPublished")}
          </p>
          <p>
            {t("progressAsOf")}:{" "}
            {dto.progress_as_of ? formatDateTime(dto.progress_as_of, locale, project.timezone) : t("progressNeverPublished")}
          </p>
          {dto.quality_flags.length > 0 && (
            <div>
              <h2 className="font-semibold text-ink">{t("qualityTitle")}</h2>
              <ul className="list-disc ps-5">
                {dto.quality_flags.map((flag) => (
                  <li key={flag}>{t(`quality_${flag}`)}</li>
                ))}
              </ul>
            </div>
          )}
        </footer>
      </main>
    </div>
  );
}
