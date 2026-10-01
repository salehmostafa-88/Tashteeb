import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { OrganizationBrand } from "@/components/OrganizationBrand";
import { StaffNav } from "@/components/staff/StaffNav";
import { ui } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { resolveAccent } from "@/lib/brand/contrast";
import { requireSessionUser } from "@/lib/auth/session";
import { signOutAction } from "@/modules/identity/actions";
import { getOrganizationContext } from "@/modules/identity/queries";

// The route orgId only selects a workspace; membership is checked by RLS on every read.
export default async function StaffLayout({ children, params }: LayoutProps<"/[locale]/app/[orgId]">) {
  const { locale: raw, orgId } = await params;
  const locale = raw as AppLocale;
  const user = await requireSessionUser(locale, `/${locale}/app/${orgId}/projects`);
  const org = await getOrganizationContext(orgId);
  if (!org) notFound();
  const t = await getTranslations("nav");
  const common = await getTranslations("common");
  const roles = await getTranslations("roles");
  const { accent } = resolveAccent(org.accent_color);
  const name = locale === "en" && org.name_en ? org.name_en : org.name;

  return (
    <div style={{ ["--brand-accent" as string]: accent }} className="flex min-h-dvh flex-col">
      <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col md:flex-row">
        <aside className="flex flex-col gap-3 border-b border-line bg-surface px-4 py-3 md:sticky md:top-0 md:h-dvh md:w-64 md:border-e md:border-b-0 md:py-6">
          <div className="flex items-center justify-between gap-3">
            <OrganizationBrand name={name} accent={org.accent_color} />
            <div className="md:hidden">
              <LocaleSwitcher />
            </div>
          </div>
          <StaffNav orgId={org.id} isOwner={org.role === "owner"} />
          <div className="mt-auto hidden flex-col gap-3 border-t border-line pt-4 md:flex">
            <p className="text-sm text-muted">
              <bdi dir="ltr">{user.email}</bdi>
              <br />
              {roles(org.role)}
            </p>
            <Link href="/app" className={`${ui.link} text-sm`}>
              {t("workspaces")}
            </Link>
            <div className="flex items-center gap-2">
              <LocaleSwitcher />
              <form action={signOutAction}>
                <input type="hidden" name="locale" value={locale} />
                <button type="submit" className={ui.buttonSecondary}>
                  {common("signOut")}
                </button>
              </form>
            </div>
          </div>
        </aside>
        <main id="content" className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
          <form action={signOutAction} className="mt-10 md:hidden">
            <input type="hidden" name="locale" value={locale} />
            <button type="submit" className={`${ui.link} text-sm`}>
              {common("signOut")}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
