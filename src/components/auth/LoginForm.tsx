"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { FormMessage } from "@/components/forms/FormMessage";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { ui } from "@/components/ui";
import { signInAction, type FormState } from "@/modules/identity/actions";

export function LoginForm({ locale, next }: { locale: string; next?: string }) {
  const t = useTranslations("auth");
  const [state, action] = useActionState(signInAction, { status: "idle" } as FormState);
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="locale" value={locale} />
      {next && <input type="hidden" name="next" value={next} />}
      <label className="flex flex-col gap-1">
        <span className={ui.label}>{t("email")}</span>
        <input name="email" type="email" required autoComplete="email" inputMode="email" dir="ltr" className={ui.input} />
      </label>
      <label className="flex flex-col gap-1">
        <span className={ui.label}>{t("password")}</span>
        <input name="password" type="password" required autoComplete="current-password" dir="ltr" className={ui.input} />
      </label>
      <FormMessage state={state} />
      <SubmitButton pendingLabel={t("signingIn")}>{t("loginTitle")}</SubmitButton>
    </form>
  );
}
