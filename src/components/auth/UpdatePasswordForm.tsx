"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { FormMessage } from "@/components/forms/FormMessage";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { ui } from "@/components/ui";
import { updatePasswordAction, type FormState } from "@/modules/identity/actions";

export function UpdatePasswordForm({ locale }: { locale: string }) {
  const t = useTranslations("auth");
  const common = useTranslations("common");
  const [state, action] = useActionState(updatePasswordAction, { status: "idle" } as FormState);
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />
      <label className="flex flex-col gap-1">
        <span className={ui.label}>{t("newPassword")}</span>
        <input name="password" type="password" required minLength={10} autoComplete="new-password" dir="ltr" className={ui.input} aria-describedby="password-hint" />
        <span id="password-hint" className={ui.help}>{t("passwordHint")}</span>
      </label>
      <FormMessage state={state} />
      <SubmitButton pendingLabel={common("saving")}>{common("save")}</SubmitButton>
    </form>
  );
}
