import { redirect } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";

export default async function OrganizationHome({ params }: PageProps<"/[locale]/app/[orgId]">) {
  const { locale, orgId } = await params;
  redirect({ href: `/app/${orgId}/projects`, locale: locale as AppLocale });
}
