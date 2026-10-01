import { getTranslations, setRequestLocale } from "next-intl/server";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { SyntheticBanner } from "@/components/SyntheticBanner";
import { Link } from "@/i18n/navigation";
import { publicEnv } from "@/lib/env";
import { DEMO_ORG_ID, DEMO_PROJECT_ID } from "@/modules/demo/synthetic";

export default async function LandingPage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("landing");

  return (
    <>
      <SyntheticBanner />
      <header className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <span className="text-lg font-bold text-ink">{publicEnv.NEXT_PUBLIC_PRODUCT_NAME}</span>
        <LocaleSwitcher />
      </header>
      <main className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="max-w-3xl text-3xl leading-snug font-bold text-ink sm:text-4xl">{t("title")}</h1>
        <p className="max-w-2xl text-lg text-muted">{t("intro")}</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/app/${DEMO_ORG_ID}/projects`}
            className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-input)] bg-primary px-5 font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {t("staffDemo")}
          </Link>
          <Link
            href={`/portal/${DEMO_PROJECT_ID}`}
            className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-input)] border border-primary bg-surface px-5 font-semibold text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {t("clientDemo")}
          </Link>
        </div>
        <p className="text-sm text-muted">{t("phaseNote")}</p>
      </main>
    </>
  );
}
