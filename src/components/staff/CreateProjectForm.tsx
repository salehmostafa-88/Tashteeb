"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { FormMessage } from "@/components/forms/FormMessage";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { ui } from "@/components/ui";
import { SUPPORTED_CURRENCIES } from "@/lib/money/currency";
import { createProjectAction, type FormState } from "@/modules/identity/actions";

export function CreateProjectForm({ locale, orgId, timezone }: { locale: string; orgId: string; timezone: string }) {
  const t = useTranslations("projects");
  const [state, action] = useActionState(createProjectAction, { status: "idle" } as FormState);
  const invalid = (field: string) => state.status === "error" && (state.field === field || (field === "code" && state.code === "CONFLICT"));
  return (
    <form action={action} className="flex max-w-xl flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="organization_id" value={orgId} />
      <label className="flex flex-col gap-1">
        <span className={ui.label}>{t("name")}</span>
        <input name="display_name" required maxLength={120} className={ui.input} aria-invalid={invalid("display_name")} />
      </label>
      <label className="flex flex-col gap-1">
        <span className={ui.label}>{t("code")}</span>
        <input name="code" required maxLength={32} pattern="[A-Za-z0-9][A-Za-z0-9._\-]{0,31}" dir="ltr" className={`${ui.input} font-mono`} aria-invalid={invalid("code")} aria-describedby="code-hint" />
        <span id="code-hint" className={ui.help}>{t("codeHint")}</span>
      </label>
      <label className="flex flex-col gap-1">
        <span className={ui.label}>{t("currency")}</span>
        <select name="currency" defaultValue="EGP" className={ui.input} aria-describedby="currency-hint">
          {SUPPORTED_CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <span id="currency-hint" className={ui.help}>{t("currencyHint")}</span>
      </label>
      <label className="flex flex-col gap-1">
        <span className={ui.label}>{t("timezone")}</span>
        <input name="timezone" defaultValue={timezone} required maxLength={64} dir="ltr" className={ui.input} aria-invalid={invalid("timezone")} />
      </label>
      <FormMessage state={state} />
      <SubmitButton pendingLabel={t("creating")}>{t("create")}</SubmitButton>
    </form>
  );
}
