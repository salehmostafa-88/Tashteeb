"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { FormMessage } from "@/components/forms/FormMessage";
import { InviteLinkPanel } from "@/components/forms/InviteLinkPanel";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { ui } from "@/components/ui";
import { operatorCreateOrganizationAction, type FormState } from "@/modules/identity/actions";

export function OperatorCreateForm({ locale }: { locale: string }) {
  const t = useTranslations("ops");
  const settings = useTranslations("settings");
  const members = useTranslations("members");
  const common = useTranslations("common");
  const [state, action] = useActionState(operatorCreateOrganizationAction, { status: "idle" } as FormState);
  return (
    <div className="flex flex-col gap-4">
      <form action={action} className="flex max-w-xl flex-col gap-4">
        <input type="hidden" name="locale" value={locale} />
        <label className="flex flex-col gap-1">
          <span className={ui.label}>{t("orgName")}</span>
          <input name="name" required maxLength={120} className={ui.input} />
        </label>
        <label className="flex flex-col gap-1">
          <span className={ui.label}>{t("ownerEmail")}</span>
          <input name="owner_email" type="email" required dir="ltr" className={ui.input} />
        </label>
        <label className="flex flex-col gap-1">
          <span className={ui.label}>{settings("timezone")}</span>
          <input name="timezone" required defaultValue="Africa/Cairo" dir="ltr" className={ui.input} />
        </label>
        <FormMessage state={state} />
        <SubmitButton pendingLabel={common("saving")}>{t("create")}</SubmitButton>
      </form>
      {state.status === "success" && state.link && (
        <InviteLinkPanel link={state.link} intro={t("linkReady")} shareText={members("whatsAppMessage", { organization: "" })} />
      )}
    </div>
  );
}
