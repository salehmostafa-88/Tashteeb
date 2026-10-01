"use client";

import { useTranslations } from "next-intl";
import { ui } from "@/components/ui";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("common");
  return (
    <main role="alert" className="mx-auto flex max-w-xl flex-col items-start gap-3 px-4 py-24">
      <h1 className="text-2xl font-bold">{t("errorTitle")}</h1>
      <p className="text-muted">{t("errorBody")}</p>
      <button type="button" onClick={reset} className={ui.buttonPrimary}>
        {t("retry")}
      </button>
    </main>
  );
}
