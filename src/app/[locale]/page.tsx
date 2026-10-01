import { getTranslations, setRequestLocale } from "next-intl/server";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { ui } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { publicEnv } from "@/lib/env";

export default async function LandingPage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("landing");
  const common = await getTranslations("common");
  const user = await getSessionUser();

  return (
    <>
      <header className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <span className="text-lg font-bold text-ink">{publicEnv.NEXT_PUBLIC_PRODUCT_NAME}</span>
        <LocaleSwitcher />
      </header>
      <main id="content" className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="max-w-3xl text-3xl leading-snug font-bold text-ink sm:text-4xl">{t("title")}</h1>
        <p className="max-w-2xl text-lg text-muted">{t("intro")}</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href={user ? "/app" : "/login"} className={ui.buttonPrimary}>
            {user ? common("openWorkspace") : common("signIn")}
          </Link>
          <Link href="/demo/portal" className={ui.buttonSecondary}>
            {common("designPreview")}
          </Link>
        </div>
      </main>
    </>
  );
}
