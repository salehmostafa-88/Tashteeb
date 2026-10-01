import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthCard } from "@/components/auth/AuthCard";
import { EmptyState } from "@/components/StatePanels";
import { ui } from "@/components/ui";
import { Link, redirect } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { requireSessionUser } from "@/lib/auth/session";
import { signOutAction } from "@/modules/identity/actions";
import { getWorkspaces } from "@/modules/identity/queries";

export default async function WorkspacesPage({ params }: PageProps<"/[locale]/app">) {
  const { locale: raw } = await params;
  const locale = raw as AppLocale;
  setRequestLocale(locale);
  await requireSessionUser(locale, `/${locale}/app`);
  const t = await getTranslations("workspace");
  const roles = await getTranslations("roles");
  const common = await getTranslations("common");
  const ws = await getWorkspaces();

  const total = ws.organizations.length + ws.portal_projects.length;
  if (total === 1 && !ws.is_platform_operator) {
    if (ws.organizations[0]) redirect({ href: `/app/${ws.organizations[0].id}/projects`, locale });
    if (ws.portal_projects[0]) redirect({ href: `/portal/${ws.portal_projects[0].project_id}`, locale });
  }

  return (
    <AuthCard title={t("title")}>
      {total === 0 && !ws.is_platform_operator ? (
        <EmptyState title={t("emptyTitle")} body={t("emptyBody")} />
      ) : null}
      {ws.organizations.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className={ui.label}>{t("studios")}</h2>
          <ul className="flex flex-col gap-2">
            {ws.organizations.map((org) => (
              <li key={org.id}>
                <Link href={`/app/${org.id}/projects`} className={`${ui.buttonSecondary} w-full justify-between`}>
                  <bdi>{locale === "en" && org.name_en ? org.name_en : org.name}</bdi>
                  <span className="text-sm font-normal text-muted">{roles(org.role)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      {ws.portal_projects.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className={ui.label}>{t("portalProjects")}</h2>
          <ul className="flex flex-col gap-2">
            {ws.portal_projects.map((p) => (
              <li key={p.project_id}>
                <Link href={`/portal/${p.project_id}`} className={`${ui.buttonSecondary} w-full justify-between`}>
                  <bdi>{p.display_name}</bdi>
                  <bdi className="text-sm font-normal text-muted">{p.organization_name}</bdi>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      {ws.is_platform_operator && (
        <Link href="/ops" className={ui.link}>
          {t("operator")}
        </Link>
      )}
      <form action={signOutAction}>
        <input type="hidden" name="locale" value={locale} />
        <button type="submit" className={`${ui.link} text-sm`}>
          {common("signOut")}
        </button>
      </form>
    </AuthCard>
  );
}
