"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { FormMessage } from "@/components/forms/FormMessage";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { ui } from "@/components/ui";
import { requestPasswordResetAction, type FormState } from "@/modules/identity/actions";

export function ForgotPasswordForm({ locale }: { locale: string }) {
  const t = useTranslations("auth");
  const common = useTranslations("common");
  const [state, action] = useActionState(requestPasswordResetAction, { status: "idle" } as FormState);
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />
      <label className="flex flex-col gap-1">
        <span className={ui.label}>{t("email")}</span>
        <input name="email" type="email" required autoComplete="email" dir="ltr" className={ui.input} />
      </label>
      <FormMessage state={state} successText={t("resetSent")} />
      <SubmitButton pendingLabel={common("saving")}>{t("sendLink")}</SubmitButton>
    </form>
  );
}
