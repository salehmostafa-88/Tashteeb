import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthCard } from "@/components/auth/AuthCard";
import { OperatorCreateForm } from "@/components/staff/OperatorCreateForm";
import { AccessDenied } from "@/components/StatePanels";
import type { AppLocale } from "@/i18n/routing";
import { requireSessionUser } from "@/lib/auth/session";
import { getWorkspaces } from "@/modules/identity/queries";

export default async function OperatorPage({ params }: PageProps<"/[locale]/ops">) {
  const { locale: raw } = await params;
  const locale = raw as AppLocale;
  setRequestLocale(locale);
  await requireSessionUser(locale, `/${locale}/ops`);
  const { is_platform_operator } = await getWorkspaces();
  const t = await getTranslations("ops");
  if (!is_platform_operator) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16">
        <AccessDenied backHref="/app" />
      </main>
    );
  }
  return (
    <AuthCard title={t("title")}>
      <h2 className="text-lg font-semibold">{t("createOrg")}</h2>
      <OperatorCreateForm locale={locale} />
    </AuthCard>
  );
}
