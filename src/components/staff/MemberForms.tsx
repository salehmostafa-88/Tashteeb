"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { FormMessage } from "@/components/forms/FormMessage";
import { InviteLinkPanel } from "@/components/forms/InviteLinkPanel";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { ui } from "@/components/ui";
import { changeMemberRoleAction, inviteStaffAction, type FormState } from "@/modules/identity/actions";
import { MEMBER_ROLES, type MemberRole } from "@/modules/identity/types";

export function InviteStaffForm({
  locale,
  orgId,
  timezone,
  organizationName,
  projects,
}: {
  locale: string;
  orgId: string;
  timezone: string;
  organizationName: string;
  projects: { id: string; label: string }[];
}) {
  const t = useTranslations("members");
  const roles = useTranslations("roles");
  const auth = useTranslations("auth");
  const common = useTranslations("common");
  const [role, setRole] = useState<MemberRole>("engineer");
  const [state, action] = useActionState(inviteStaffAction, { status: "idle" } as FormState);
  return (
    <div className="flex flex-col gap-4">
      <form action={action} className="grid gap-4 sm:grid-cols-2">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="organization_id" value={orgId} />
        <input type="hidden" name="timezone" value={timezone} />
        <label className="flex flex-col gap-1">
          <span className={ui.label}>{auth("email")}</span>
          <input name="email" type="email" required dir="ltr" className={ui.input} />
        </label>
        <label className="flex flex-col gap-1">
          <span className={ui.label}>{t("role")}</span>
          <select name="role" value={role} onChange={(e) => setRole(e.target.value as MemberRole)} className={ui.input} aria-describedby="role-help">
            {MEMBER_ROLES.map((r) => (
              <option key={r} value={r}>
                {roles(r)}
              </option>
            ))}
          </select>
          <span id="role-help" className={ui.help}>{t("role_help")}</span>
        </label>
        <label className="flex flex-col gap-1">
          <span className={ui.label}>{t("project")}</span>
          <select name="project_id" defaultValue="" className={ui.input}>
            <option value="">{t("noProject")}</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className={ui.label}>{t("expiresOn")}</span>
          <input name="expires_on" type="date" required={role === "collaborator"} disabled={role === "owner"} className={ui.input} aria-describedby="expires-help" />
          <span id="expires-help" className={ui.help}>{t("expiresHelp")}</span>
        </label>
        <div className="sm:col-span-2">
          <SubmitButton pendingLabel={common("saving")}>{t("sendInvite")}</SubmitButton>
        </div>
      </form>
      <FormMessage state={state} />
      {state.status === "success" && state.link && (
        <InviteLinkPanel link={state.link} intro={t("linkReady")} shareText={t("whatsAppMessage", { organization: organizationName })} />
      )}
    </div>
  );
}

export function ChangeRoleForm({
  locale,
  orgId,
  timezone,
  userId,
  currentRole,
}: {
  locale: string;
  orgId: string;
  timezone: string;
  userId: string;
  currentRole: MemberRole;
}) {
  const t = useTranslations("members");
  const roles = useTranslations("roles");
  const common = useTranslations("common");
  const [role, setRole] = useState<MemberRole>(currentRole);
  const [state, action] = useActionState(changeMemberRoleAction, { status: "idle" } as FormState);
  return (
    <form action={action} className="flex flex-col gap-1">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="organization_id" value={orgId} />
      <input type="hidden" name="timezone" value={timezone} />
      <input type="hidden" name="user_id" value={userId} />
      <div className="flex flex-wrap items-center gap-2">
        <select name="role" value={role} onChange={(e) => setRole(e.target.value as MemberRole)} aria-label={t("changeRole")} className={`${ui.input} w-auto`}>
          {MEMBER_ROLES.map((r) => (
            <option key={r} value={r}>
              {roles(r)}
            </option>
          ))}
        </select>
        {role === "collaborator" && <input name="expires_on" type="date" required aria-label={t("expiresOn")} className={`${ui.input} w-auto`} />}
        {role !== currentRole && (
          <SubmitButton pendingLabel={common("saving")} variant="secondary">
            {common("save")}
          </SubmitButton>
        )}
      </div>
      <FormMessage state={state} />
    </form>
  );
}
