import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ActionButtonForm } from "@/components/forms/ActionButtonForm";
import { AssignStaffForm, InviteClientForm } from "@/components/staff/ProjectPeopleForms";
import { ui } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { revokeClientAction, unassignStaffAction } from "@/modules/identity/actions";
import { requireOrganization, getProject, listMembers, listProjectPeople } from "@/modules/identity/queries";

export default async function ProjectPage({ params }: PageProps<"/[locale]/app/[orgId]/projects/[projectId]">) {
  const { locale: raw, orgId, projectId } = await params;
  const locale = raw as AppLocale;
  setRequestLocale(locale);
  const org = await requireOrganization(orgId);
  const project = await getProject(org.id, projectId);
  if (!project) notFound();

  const t = await getTranslations("project");
  const tp = await getTranslations("projects");
  const roles = await getTranslations("roles");
  const common = await getTranslations("common");
  const isOwner = org.role === "owner";

  const people = isOwner ? await listProjectPeople(project.id) : null;
  const members = isOwner ? await listMembers(org.id) : [];
  const assigned = new Set(people?.staff.map((s) => s.user_id));
  const candidates = members
    .filter((m) => m.status === "active" && m.role !== "owner" && !assigned.has(m.user_id))
    .map((m) => ({ user_id: m.user_id, label: `${m.display_name} — ${roles(m.role)}` }));
  const fields = { locale, organization_id: org.id, project_id: project.id };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-sm text-muted">
          <Link href={`/app/${org.id}/projects`} className={ui.link}>
            {tp("title")}
          </Link>
        </p>
        <h1 className="text-2xl font-bold break-words">
          <bdi>{project.display_name}</bdi>
        </h1>
        <p className="flex flex-wrap gap-3 text-muted">
          <bdi dir="ltr" className="font-mono">{project.code}</bdi>
          <bdi dir="ltr">{project.currency}</bdi>
          <bdi dir="ltr">{project.timezone}</bdi>
          <span>{tp(`status_${project.status}`)}</span>
        </p>
        <Link href={`/portal/${project.id}`} className={`${ui.buttonSecondary} self-start`}>
          {t("clientPreview")}
        </Link>
      </header>

      <section className={`${ui.card} border-dashed p-5 text-muted`}>{t("financePending")}</section>

      {people && (
        <section className="grid gap-6 lg:grid-cols-2">
          <div className={`${ui.card} flex flex-col gap-4 p-5`}>
            <div>
              <h2 className="text-lg font-bold">{t("staff")}</h2>
              <p className={ui.help}>{t("ownerSeesAll")}</p>
            </div>
            {people.staff.length === 0 ? (
              <p className="text-muted">{t("noStaff")}</p>
            ) : (
              <ul className="flex flex-col divide-y divide-line" data-testid="project-staff">
                {people.staff.map((s) => (
                  <li key={s.user_id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <span className="flex flex-col">
                      <bdi className="font-semibold">{s.display_name}</bdi>
                      <span className="text-sm text-muted">{roles(s.role)}</span>
                    </span>
                    <ActionButtonForm action={unassignStaffAction} fields={{ ...fields, user_id: s.user_id }} label={t("unassign")} pendingLabel={common("saving")} confirmText={t("unassign")} />
                  </li>
                ))}
              </ul>
            )}
            <AssignStaffForm locale={locale} orgId={org.id} projectId={project.id} candidates={candidates} />
          </div>

          <div className={`${ui.card} flex flex-col gap-4 p-5`}>
            <h2 className="text-lg font-bold">{t("clients")}</h2>
            {people.clients.length === 0 ? (
              <p className="text-muted">{t("noClients")}</p>
            ) : (
              <ul className="flex flex-col divide-y divide-line" data-testid="project-clients">
                {people.clients.map((c) => (
                  <li key={c.user_id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <span className="flex flex-col">
                      <bdi className="font-semibold">{c.display_name}</bdi>
                      <bdi dir="ltr" className="text-sm text-muted">{c.email}</bdi>
                    </span>
                    <ActionButtonForm action={revokeClientAction} fields={{ ...fields, user_id: c.user_id }} label={t("revokeClient")} pendingLabel={common("saving")} confirmText={t("revokeClient")} />
                  </li>
                ))}
              </ul>
            )}
            <InviteClientForm locale={locale} orgId={org.id} projectId={project.id} organizationName={org.name} />
          </div>
        </section>
      )}
    </div>
  );
}
