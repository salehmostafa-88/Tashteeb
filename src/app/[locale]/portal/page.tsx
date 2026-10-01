import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthCard } from "@/components/auth/AuthCard";
import { EmptyState } from "@/components/StatePanels";
import { ui } from "@/components/ui";
import { Link, redirect } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { requireSessionUser } from "@/lib/auth/session";
import { getWorkspaces } from "@/modules/identity/queries";

export default async function PortalListPage({ params }: PageProps<"/[locale]/portal">) {
  const { locale: raw } = await params;
  const locale = raw as AppLocale;
  setRequestLocale(locale);
  await requireSessionUser(locale, `/${locale}/portal`);
  const t = await getTranslations("portal");
  const ws = await getTranslations("workspace");
  const { portal_projects: projects } = await getWorkspaces();
  if (projects.length === 1 && projects[0]) redirect({ href: `/portal/${projects[0].project_id}`, locale });

  return (
    <AuthCard title={t("listTitle")}>
      {projects.length === 0 ? (
        <EmptyState title={ws("emptyTitle")} body={ws("emptyBody")} />
      ) : (
        <ul className="flex flex-col gap-2">
          {projects.map((p) => (
            <li key={p.project_id}>
              <Link href={`/portal/${p.project_id}`} className={`${ui.buttonSecondary} w-full justify-between`}>
                <bdi>{p.display_name}</bdi>
                <bdi className="text-sm font-normal text-muted">{p.organization_name}</bdi>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AuthCard>
  );
}
