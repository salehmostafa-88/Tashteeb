"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { FormMessage } from "@/components/forms/FormMessage";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { ui } from "@/components/ui";
import { DEFAULT_ACCENT, resolveAccent } from "@/lib/brand/contrast";
import { updateOrganizationSettingsAction, type FormState } from "@/modules/identity/actions";
import type { OrganizationContext } from "@/modules/identity/types";

export function OrganizationSettingsForm({ locale, org }: { locale: string; org: OrganizationContext }) {
  const t = useTranslations("settings");
  const common = useTranslations("common");
  const [accent, setAccent] = useState(org.accent_color ?? DEFAULT_ACCENT);
  const { usedFallback } = resolveAccent(accent);
  const [state, action] = useActionState(updateOrganizationSettingsAction, { status: "idle" } as FormState);
  return (
    <form action={action} className="flex max-w-xl flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="organization_id" value={org.id} />
      <input type="hidden" name="expected_version" value={org.version} />
      <label className="flex flex-col gap-1">
        <span className={ui.label}>{t("nameAr")}</span>
        <input name="name" required maxLength={120} defaultValue={org.name} className={ui.input} />
      </label>
      <label className="flex flex-col gap-1">
        <span className={ui.label}>{t("nameEn")}</span>
        <input name="name_en" maxLength={120} defaultValue={org.name_en ?? ""} dir="ltr" className={ui.input} />
      </label>
      <div className="flex flex-col gap-1">
        <label htmlFor="accent" className={ui.label}>{t("accent")}</label>
        <div className="flex items-center gap-3">
          <input id="accent-picker" type="color" value={accent} onChange={(e) => setAccent(e.target.value.toUpperCase())} aria-label={t("accent")} className="h-11 w-14 cursor-pointer rounded-[var(--radius-input)] border border-line" />
          <input id="accent" name="accent_color" value={accent} onChange={(e) => setAccent(e.target.value)} pattern="#[0-9A-Fa-f]{6}" dir="ltr" className={`${ui.input} w-36 font-mono`} />
          <span className="inline-flex min-h-11 items-center rounded-[var(--radius-input)] px-4 font-semibold text-white" style={{ backgroundColor: resolveAccent(accent).accent }}>
            Aa
          </span>
        </div>
        <span className={usedFallback ? "text-sm text-warning" : ui.help}>{usedFallback ? t("accentFallback") : t("accentHelp")}</span>
      </div>
      <label className="flex flex-col gap-1">
        <span className={ui.label}>{t("timezone")}</span>
        <input name="timezone" required maxLength={64} defaultValue={org.timezone} dir="ltr" className={ui.input} />
      </label>
      <p className={ui.help}>{t("logoLater")}</p>
      <FormMessage state={state} successText={common("saved")} />
      <SubmitButton pendingLabel={common("saving")}>{common("save")}</SubmitButton>
    </form>
  );
}
