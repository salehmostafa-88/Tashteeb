import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { OrganizationBrand } from "@/components/OrganizationBrand";
import { ui } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { requireSessionUser } from "@/lib/auth/session";
import { resolveAccent } from "@/lib/brand/contrast";
import { signOutAction } from "@/modules/identity/actions";
import { getPortalProject } from "@/modules/identity/queries";

// Client portal: rendered only from the safe projection returned by
// get_portal_project. Nothing else about the project reaches the browser.
export default async function PortalProjectPage({ params }: PageProps<"/[locale]/portal/[projectId]">) {
  const { locale: raw, projectId } = await params;
  const locale = raw as AppLocale;
  setRequestLocale(locale);
  await requireSessionUser(locale, `/${locale}/portal/${projectId}`);
  const dto = await getPortalProject(projectId);
  if (!dto) notFound();

  const t = await getTranslations("portal");
  const common = await getTranslations("common");
  const { accent } = resolveAccent(dto.brand.accent);
  const brandName = locale === "en" && dto.brand.display_name_en ? dto.brand.display_name_en : dto.brand.display_name;

  return (
    <div style={{ ["--brand-accent" as string]: accent }} className="min-h-dvh">
      {dto.viewer === "staff_preview" && (
        <p role="note" data-testid="staff-preview-banner" className="border-b border-line bg-accent-soft px-4 py-2 text-center text-sm text-primary">
          {t("staffPreviewBanner")}
        </p>
      )}
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <OrganizationBrand name={brandName} accent={dto.brand.accent} />
          <div className="flex items-center gap-2">
            <LocaleSwitcher />
            <form action={signOutAction}>
              <input type="hidden" name="locale" value={locale} />
              <button type="submit" className={`${ui.link} text-sm`}>
                {common("signOut")}
              </button>
            </form>
          </div>
        </div>
      </header>

      <main id="content" className="mx-auto flex max-w-[1200px] flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="flex flex-col gap-2">
          <h1 className="text-3xl leading-snug font-bold break-words text-ink" data-testid="portal-project-name">
            <bdi>{dto.project.display_name}</bdi>
          </h1>
          <p className="text-muted">
            {t("currencyLabel")}: <bdi dir="ltr">{dto.project.currency}</bdi>
          </p>
          <span className="self-start rounded-full bg-accent-soft px-3 py-1 text-sm font-semibold text-primary">{t("currentStageUnknown")}</span>
        </section>

        <section data-testid="portal-financial-unknown" className={`${ui.card} flex flex-col gap-1 border-dashed p-6`}>
          <h2 className="text-xl font-bold">{t("financialNotYet")}</h2>
          <p className="text-muted">{t("financialNotYetBody")}</p>
        </section>

        <section className={`${ui.card} flex flex-col gap-1 border-dashed p-6`}>
          <h2 className="text-xl font-bold">{t("progressNotYet")}</h2>
          <p className="text-muted">{t("progressNotYetBody")}</p>
        </section>

        <Link href="/portal" className={`${ui.link} text-sm`}>
          {t("listTitle")}
        </Link>
      </main>
    </div>
  );
}
