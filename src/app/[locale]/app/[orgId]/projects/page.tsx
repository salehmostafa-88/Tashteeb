import { getTranslations, setRequestLocale } from "next-intl/server";
import { MoneyAmount } from "@/components/MoneyAmount";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { formatDateOnly, formatInteger } from "@/lib/i18n/format";
import { DEMO_PROJECT_ID, demoProjects } from "@/modules/demo/synthetic";

export default async function ProjectsPage({ params }: PageProps<"/[locale]/app/[orgId]/projects">) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as AppLocale;
  setRequestLocale(locale);
  const t = await getTranslations("staff");
  const common = await getTranslations("common");
  const projects = demoProjects;

  const lastApproved = (date: string | null) => (date ? formatDateOnly(date, locale) : common("notRecorded"));

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-ink">{t("projectsTitle")}</h1>
        <p className="text-muted">{t("projectsSummary", { count: projects.length, countText: formatInteger(projects.length, locale) })}</p>
      </header>

      {projects.length === 0 ? (
        <section className="rounded-[var(--radius-card)] border border-line bg-surface p-8 text-center">
          <h2 className="text-lg font-semibold">{t("emptyTitle")}</h2>
          <p className="text-muted">{t("emptyBody")}</p>
        </section>
      ) : (
        <>
          {/* Desktop and tablet: spreadsheet-like table. */}
          <div className="hidden overflow-x-auto rounded-[var(--radius-card)] border border-line bg-surface md:block">
            <table className="w-full border-collapse text-start" data-testid="projects-table">
              <thead className="sticky top-0 bg-surface">
                <tr className="border-b border-line text-sm text-muted">
                  <th scope="col" className="px-4 py-3 text-start font-semibold">{t("columnCode")}</th>
                  <th scope="col" className="px-4 py-3 text-start font-semibold">{t("columnName")}</th>
                  <th scope="col" className="px-4 py-3 text-start font-semibold">{t("columnStatus")}</th>
                  <th scope="col" className="px-4 py-3 text-end font-semibold" title={t("approvedCostHint")}>
                    {t("columnApprovedCost")}
                  </th>
                  <th scope="col" className="px-4 py-3 text-end font-semibold">{t("columnPending")}</th>
                  <th scope="col" className="px-4 py-3 text-start font-semibold">{t("columnLastApproved")}</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id} className="border-b border-line last:border-b-0 hover:bg-accent-soft">
                    <td className="px-4 py-3">
                      <bdi dir="ltr" className="font-mono text-sm">{project.code}</bdi>
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      <bdi>{project.display_name}</bdi>
                    </td>
                    <td className="px-4 py-3">
                      <StatusChip status={project.status} label={t(project.status === "active" ? "statusActive" : "statusArchived")} />
                    </td>
                    <td className="px-4 py-3 text-end">
                      <MoneyAmount minor={project.approved_cost_base_minor} currency={project.currency} locale={locale} />
                    </td>
                    <td className="tabular px-4 py-3 text-end">{formatInteger(project.pending_review_count, locale)}</td>
                    <td className="px-4 py-3 text-muted">{lastApproved(project.last_approved_on)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="border-t border-line px-4 py-2 text-xs text-muted">{t("approvedCostHint")}</p>
          </div>

          {/* Phone: one card per project, no horizontal scrolling. */}
          <ul className="flex flex-col gap-3 md:hidden" data-testid="projects-cards">
            {projects.map((project) => (
              <li key={project.id} className="flex flex-col gap-2 rounded-[var(--radius-card)] border border-line bg-surface p-4">
                <div className="flex items-start justify-between gap-3">
                  <span className="font-semibold">
                    <bdi>{project.display_name}</bdi>
                  </span>
                  <StatusChip status={project.status} label={t(project.status === "active" ? "statusActive" : "statusArchived")} />
                </div>
                <bdi dir="ltr" className="self-start font-mono text-sm text-muted">{project.code}</bdi>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  <dt className="text-muted">{t("columnApprovedCost")}</dt>
                  <dd className="text-end">
                    <MoneyAmount minor={project.approved_cost_base_minor} currency={project.currency} locale={locale} />
                  </dd>
                  <dt className="text-muted">{t("columnPending")}</dt>
                  <dd className="tabular text-end">{formatInteger(project.pending_review_count, locale)}</dd>
                  <dt className="text-muted">{t("columnLastApproved")}</dt>
                  <dd className="text-end">{lastApproved(project.last_approved_on)}</dd>
                </dl>
              </li>
            ))}
          </ul>

          <Link href={`/portal/${DEMO_PROJECT_ID}`} className="self-start font-semibold text-primary underline-offset-4 hover:underline">
            {t("openPortalPreview")}
          </Link>
        </>
      )}
    </div>
  );
}

function StatusChip({ status, label }: { status: "active" | "archived"; label: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-semibold ${
        status === "active" ? "bg-[#e2f3e8] text-success" : "bg-canvas text-muted"
      }`}
    >
      {label}
    </span>
  );
}
