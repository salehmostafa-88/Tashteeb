import { getTranslations, setRequestLocale } from "next-intl/server";
import { EmptyState } from "@/components/StatePanels";
import { ui } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { formatInteger } from "@/lib/i18n/format";
import { requireOrganization, listProjects } from "@/modules/identity/queries";

export default async function ProjectsPage({ params }: PageProps<"/[locale]/app/[orgId]/projects">) {
  const { locale: raw, orgId } = await params;
  const locale = raw as AppLocale;
  setRequestLocale(locale);
  const t = await getTranslations("projects");
  const org = await requireOrganization(orgId);
  const projects = await listProjects(org.id);
  const isOwner = org.role === "owner";

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">{t("title")}</h1>
          <p className="text-muted">{t("count", { count: projects.length, countText: formatInteger(projects.length, locale) })}</p>
        </div>
        {isOwner && (
          <Link href={`/app/${org.id}/projects/new`} className={ui.buttonPrimary}>
            {t("new")}
          </Link>
        )}
      </header>

      {projects.length === 0 ? (
        <EmptyState title={t("emptyTitle")} body={isOwner ? t("emptyOwner") : t("emptyStaff")} />
      ) : (
        <>
          <div className={`${ui.card} hidden overflow-x-auto md:block`}>
            <table className="w-full border-collapse" data-testid="projects-table">
              <thead>
                <tr className="border-b border-line text-sm text-muted">
                  <th scope="col" className="px-4 py-3 text-start font-semibold">{t("code")}</th>
                  <th scope="col" className="px-4 py-3 text-start font-semibold">{t("name")}</th>
                  <th scope="col" className="px-4 py-3 text-start font-semibold">{t("currency")}</th>
                  <th scope="col" className="px-4 py-3 text-start font-semibold">{t("status")}</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id} className="border-b border-line last:border-b-0 hover:bg-accent-soft">
                    <td className="px-4 py-3">
                      <bdi dir="ltr" className="font-mono text-sm">{p.code}</bdi>
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      <Link href={`/app/${org.id}/projects/${p.id}`} className="hover:underline">
                        <bdi>{p.display_name}</bdi>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <bdi dir="ltr">{p.currency}</bdi>
                    </td>
                    <td className="px-4 py-3">
                      <StatusChip active={p.status === "active"} label={t(`status_${p.status}`)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="flex flex-col gap-3 md:hidden" data-testid="projects-cards">
            {projects.map((p) => (
              <li key={p.id}>
                <Link href={`/app/${org.id}/projects/${p.id}`} className={`${ui.card} flex flex-col gap-2 p-4`}>
                  <span className="flex items-start justify-between gap-3">
                    <bdi className="font-semibold">{p.display_name}</bdi>
                    <StatusChip active={p.status === "active"} label={t(`status_${p.status}`)} />
                  </span>
                  <span className="flex gap-3 text-sm text-muted">
                    <bdi dir="ltr" className="font-mono">{p.code}</bdi>
                    <bdi dir="ltr">{p.currency}</bdi>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function StatusChip({ active, label }: { active: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-semibold ${active ? "bg-[#e2f3e8] text-success" : "bg-canvas text-muted"}`}>
      {label}
    </span>
  );
}
