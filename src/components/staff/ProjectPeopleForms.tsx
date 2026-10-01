"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { FormMessage } from "@/components/forms/FormMessage";
import { InviteLinkPanel } from "@/components/forms/InviteLinkPanel";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { ui } from "@/components/ui";
import { assignStaffAction, inviteClientAction, type FormState } from "@/modules/identity/actions";

export function AssignStaffForm({
  locale,
  orgId,
  projectId,
  candidates,
}: {
  locale: string;
  orgId: string;
  projectId: string;
  candidates: { user_id: string; label: string }[];
}) {
  const t = useTranslations("project");
  const common = useTranslations("common");
  const [state, action] = useActionState(assignStaffAction, { status: "idle" } as FormState);
  if (candidates.length === 0) return null;
  return (
    <form action={action} className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="organization_id" value={orgId} />
      <input type="hidden" name="project_id" value={projectId} />
      <label className="flex flex-1 flex-col gap-1">
        <span className={ui.label}>{t("assignLabel")}</span>
        <select name="user_id" required defaultValue="" className={ui.input}>
          <option value="" disabled>
            {t("chooseMember")}
          </option>
          {candidates.map((c) => (
            <option key={c.user_id} value={c.user_id}>
              {c.label}
            </option>
          ))}
        </select>
      </label>
      <SubmitButton pendingLabel={common("saving")} variant="secondary">
        {t("assign")}
      </SubmitButton>
      <FormMessage state={state} />
    </form>
  );
}

export function InviteClientForm({ locale, orgId, projectId, organizationName }: { locale: string; orgId: string; projectId: string; organizationName: string }) {
  const t = useTranslations("project");
  const members = useTranslations("members");
  const auth = useTranslations("auth");
  const common = useTranslations("common");
  const [state, action] = useActionState(inviteClientAction, { status: "idle" } as FormState);
  return (
    <div className="flex flex-col gap-3">
      <form action={action} className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="organization_id" value={orgId} />
        <input type="hidden" name="project_id" value={projectId} />
        <label className="flex flex-1 flex-col gap-1">
          <span className={ui.label}>
            {t("inviteClient")} — {auth("email")}
          </span>
          <input name="email" type="email" required dir="ltr" className={ui.input} />
        </label>
        <SubmitButton pendingLabel={common("saving")} variant="secondary">
          {members("sendInvite")}
        </SubmitButton>
      </form>
      <FormMessage state={state} />
      {state.status === "success" && state.link && (
        <InviteLinkPanel link={state.link} intro={members("linkReady")} shareText={members("whatsAppMessage", { organization: organizationName })} />
      )}
    </div>
  );
}
