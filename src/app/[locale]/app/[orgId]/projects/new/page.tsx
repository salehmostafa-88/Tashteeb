import { getTranslations, setRequestLocale } from "next-intl/server";
import { CreateProjectForm } from "@/components/staff/CreateProjectForm";
import { AccessDenied } from "@/components/StatePanels";
import type { AppLocale } from "@/i18n/routing";
import { requireOrganization } from "@/modules/identity/queries";

export default async function NewProjectPage({ params }: PageProps<"/[locale]/app/[orgId]/projects/new">) {
  const { locale: raw, orgId } = await params;
  const locale = raw as AppLocale;
  setRequestLocale(locale);
  const org = await requireOrganization(orgId);
  if (org.role !== "owner") return <AccessDenied backHref={`/app/${orgId}/projects`} />;
  const t = await getTranslations("projects");
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">{t("createTitle")}</h1>
      <CreateProjectForm locale={locale} orgId={org.id} timezone={org.timezone} />
    </div>
  );
}
