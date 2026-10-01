"use client";

import { useTranslations } from "next-intl";
import type { FormState } from "@/modules/identity/actions";

/** Announces an action's error in the user's language; never shows raw server text. */
export function FormMessage({ state, successText }: { state: FormState; successText?: string }) {
  const t = useTranslations("errors");
  if (state.status === "error") {
    const key = t.has(state.code) ? state.code : "UNKNOWN";
    return (
      <p role="alert" data-testid="form-error" className="rounded-[var(--radius-input)] bg-[#fdeef0] px-3 py-2 text-sm text-danger">
        {t(key)}
      </p>
    );
  }
  if (state.status === "success" && successText) {
    return (
      <p role="status" data-testid="form-success" className="rounded-[var(--radius-input)] bg-[#e2f3e8] px-3 py-2 text-sm text-success">
        {successText}
      </p>
    );
  }
  return null;
}
