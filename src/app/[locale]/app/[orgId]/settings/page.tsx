import { getTranslations, setRequestLocale } from "next-intl/server";
import { OrganizationSettingsForm } from "@/components/staff/OrganizationSettingsForm";
import { AccessDenied } from "@/components/StatePanels";
import type { AppLocale } from "@/i18n/routing";
import { requireOrganization } from "@/modules/identity/queries";

export default async function SettingsPage({ params }: PageProps<"/[locale]/app/[orgId]/settings">) {
  const { locale: raw, orgId } = await params;
  const locale = raw as AppLocale;
  setRequestLocale(locale);
  const org = await requireOrganization(orgId);
  if (org.role !== "owner") return <AccessDenied backHref={`/app/${orgId}/projects`} />;
  const t = await getTranslations("settings");
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <h2 className="text-lg font-semibold">{t("brandTitle")}</h2>
      <OrganizationSettingsForm locale={locale} org={org} />
    </div>
  );
}
