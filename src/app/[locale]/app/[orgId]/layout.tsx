import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { OrganizationBrand } from "@/components/OrganizationBrand";
import { SyntheticBanner } from "@/components/SyntheticBanner";
import { Link } from "@/i18n/navigation";
import { DEMO_ORG_ID } from "@/modules/demo/synthetic";

// Phase 0 placeholder: only the synthetic demo organization exists. The route
// orgId is a selector, never authorization; Phase 1 replaces this with membership checks.
export default async function StaffLayout({ children, params }: LayoutProps<"/[locale]/app/[orgId]">) {
  const { orgId } = await params;
  if (orgId !== DEMO_ORG_ID) notFound();
  const t = await getTranslations("staff");

  return (
    <div className="flex min-h-dvh flex-col">
      <SyntheticBanner />
      <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col md:flex-row">
        <aside className="flex items-center justify-between gap-4 border-b border-line bg-surface px-4 py-3 md:w-60 md:flex-col md:items-stretch md:justify-start md:border-e md:border-b-0 md:px-4 md:py-6">
          <OrganizationBrand name="Demo Studio" accent="#4B5FA8" />
          <nav aria-label={t("navLabel")} className="hidden md:block">
            <ul className="mt-6 flex flex-col gap-1">
              <li>
                <Link
                  href={`/app/${orgId}/projects`}
                  aria-current="page"
                  className="flex min-h-11 items-center rounded-[var(--radius-input)] bg-accent-soft px-3 font-semibold text-primary"
                >
                  {t("navProjects")}
                </Link>
              </li>
            </ul>
          </nav>
          <div className="md:mt-auto">
            <LocaleSwitcher />
          </div>
        </aside>
        <main id="content" className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
