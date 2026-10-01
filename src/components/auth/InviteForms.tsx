"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { FormMessage } from "@/components/forms/FormMessage";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { ui } from "@/components/ui";
import { acceptInvitationAction, signUpWithInvitationAction, type FormState } from "@/modules/identity/actions";

export function AcceptInvitationForm({ locale, token }: { locale: string; token: string }) {
  const t = useTranslations("invite");
  const [state, action] = useActionState(acceptInvitationAction, { status: "idle" } as FormState);
  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="token" value={token} />
      <FormMessage state={state} />
      <SubmitButton pendingLabel={t("accepting")}>{t("accept")}</SubmitButton>
    </form>
  );
}

export function SignUpInvitationForm({ locale, token }: { locale: string; token: string }) {
  const t = useTranslations("invite");
  const auth = useTranslations("auth");
  const [state, action] = useActionState(signUpWithInvitationAction, { status: "idle" } as FormState);

  if (state.status === "success" && state.message === "confirm_email") {
    return (
      <p role="status" className="rounded-[var(--radius-input)] bg-[#e2f3e8] px-3 py-2 text-success">
        {t("confirmEmail")}
      </p>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="token" value={token} />
      <label className="flex flex-col gap-1">
        <span className={ui.label}>{t("displayName")}</span>
        <input name="display_name" required maxLength={120} autoComplete="name" className={ui.input} />
      </label>
      <label className="flex flex-col gap-1">
        <span className={ui.label}>{auth("email")}</span>
        <input name="email" type="email" required autoComplete="email" dir="ltr" className={ui.input} />
      </label>
      <label className="flex flex-col gap-1">
        <span className={ui.label}>{auth("password")}</span>
        <input name="password" type="password" required minLength={10} autoComplete="new-password" dir="ltr" className={ui.input} aria-describedby="signup-password-hint" />
        <span id="signup-password-hint" className={ui.help}>{auth("passwordHint")}</span>
      </label>
      <FormMessage state={state} />
      <SubmitButton pendingLabel={t("accepting")}>{t("createAccount")}</SubmitButton>
    </form>
  );
}
