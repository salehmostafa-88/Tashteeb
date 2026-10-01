import { getTranslations, setRequestLocale } from "next-intl/server";
import { ActionButtonForm } from "@/components/forms/ActionButtonForm";
import { ChangeRoleForm, InviteStaffForm } from "@/components/staff/MemberForms";
import { AccessDenied } from "@/components/StatePanels";
import { ui } from "@/components/ui";
import type { AppLocale } from "@/i18n/routing";
import { requireSessionUser } from "@/lib/auth/session";
import { formatDateTime, formatInteger } from "@/lib/i18n/format";
import { revokeInvitationAction, revokeMemberAction } from "@/modules/identity/actions";
import { requireOrganization, listInvitations, listMembers, listProjects } from "@/modules/identity/queries";

export default async function MembersPage({ params }: PageProps<"/[locale]/app/[orgId]/members">) {
  const { locale: raw, orgId } = await params;
  const locale = raw as AppLocale;
  setRequestLocale(locale);
  const user = await requireSessionUser(locale, `/${locale}/app/${orgId}/members`);
  const org = await requireOrganization(orgId);
  if (org.role !== "owner") return <AccessDenied backHref={`/app/${orgId}/projects`} />;

  const t = await getTranslations("members");
  const roles = await getTranslations("roles");
  const common = await getTranslations("common");
  const [members, invitations, projects] = await Promise.all([listMembers(org.id), listInvitations(org.id), listProjects(org.id)]);
  const date = (iso: string | null) => (iso ? formatDateTime(iso, locale, org.timezone) : t("never"));
  const base = { locale, organization_id: org.id };

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold">{t("title")}</h1>

      <section className={`${ui.card} hidden overflow-x-auto md:block`}>
        <table className="w-full border-collapse" data-testid="members-table">
          <thead>
            <tr className="border-b border-line text-sm text-muted">
              <th scope="col" className="px-4 py-3 text-start font-semibold">{t("name")}</th>
              <th scope="col" className="px-4 py-3 text-start font-semibold">{t("role")}</th>
              <th scope="col" className="px-4 py-3 text-start font-semibold">{t("status")}</th>
              <th scope="col" className="px-4 py-3 text-start font-semibold">{t("expires")}</th>
              <th scope="col" className="px-4 py-3 text-end font-semibold">{t("projects")}</th>
              <th scope="col" className="px-4 py-3"><span className="sr-only">{t("revoke")}</span></th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.user_id} className="border-b border-line align-top last:border-b-0">
                <td className="px-4 py-3">
                  <bdi className="block font-semibold">{m.display_name}</bdi>
                  <bdi dir="ltr" className="block text-sm text-muted">{m.email}</bdi>
                </td>
                <td className="px-4 py-3">
                  {m.status === "active" ? (
                    <ChangeRoleForm locale={locale} orgId={org.id} timezone={org.timezone} userId={m.user_id} currentRole={m.role} />
                  ) : (
                    roles(m.role)
                  )}
                </td>
                <td className="px-4 py-3">{t(`status_${m.status}`)}</td>
                <td className="px-4 py-3 text-sm text-muted">{date(m.expires_at)}</td>
                <td className="tabular px-4 py-3 text-end">{formatInteger(m.project_count, locale)}</td>
                <td className="px-4 py-3">
                  {m.status === "active" && m.user_id !== user.id && (
                    <ActionButtonForm action={revokeMemberAction} fields={{ ...base, user_id: m.user_id }} label={t("revoke")} pendingLabel={common("saving")} confirmText={t("revoke")} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Phone: one card per member, no horizontal scrolling. */}
      <ul className="flex flex-col gap-3 md:hidden" data-testid="members-cards">
        {members.map((m) => (
          <li key={m.user_id} className={`${ui.card} flex flex-col gap-3 p-4`}>
            <div className="flex items-start justify-between gap-3">
              <span className="flex min-w-0 flex-col">
                <bdi className="font-semibold">{m.display_name}</bdi>
                <bdi dir="ltr" className="truncate text-sm text-muted">{m.email}</bdi>
              </span>
              <span className="text-sm text-muted">{t(`status_${m.status}`)}</span>
            </div>
            <p className="text-sm text-muted">
              {t("projects")}: <span className="tabular">{formatInteger(m.project_count, locale)}</span> · {t("expires")}: {date(m.expires_at)}
            </p>
            {m.status === "active" ? (
              <ChangeRoleForm locale={locale} orgId={org.id} timezone={org.timezone} userId={m.user_id} currentRole={m.role} />
            ) : (
              <span>{roles(m.role)}</span>
            )}
            {m.status === "active" && m.user_id !== user.id && (
              <ActionButtonForm action={revokeMemberAction} fields={{ ...base, user_id: m.user_id }} label={t("revoke")} pendingLabel={common("saving")} confirmText={t("revoke")} />
            )}
          </li>
        ))}
      </ul>

      <section className={`${ui.card} flex flex-col gap-4 p-5`}>
        <h2 className="text-lg font-bold">{t("inviteTitle")}</h2>
        <InviteStaffForm
          locale={locale}
          orgId={org.id}
          timezone={org.timezone}
          organizationName={org.name}
          projects={projects.filter((p) => p.status === "active").map((p) => ({ id: p.id, label: `${p.code} — ${p.display_name}` }))}
        />
      </section>

      <section className={`${ui.card} flex flex-col gap-3 p-5`}>
        <h2 className="text-lg font-bold">{t("pending")}</h2>
        {invitations.length === 0 ? (
          <p className="text-muted">{t("noPending")}</p>
        ) : (
          <ul className="flex flex-col divide-y divide-line" data-testid="pending-invitations">
            {invitations.map((i) => (
              <li key={i.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <span className="flex flex-col">
                  <bdi dir="ltr" className="font-semibold">{i.email}</bdi>
                  <span className="text-sm text-muted">
                    {i.role ? roles(i.role) : null}
                    {i.project_name ? <> · <bdi>{i.project_name}</bdi></> : null} · {date(i.expires_at)}
                  </span>
                </span>
                <ActionButtonForm action={revokeInvitationAction} fields={{ ...base, invitation_id: i.id }} label={t("revokeInvite")} pendingLabel={common("saving")} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
