import { getTranslations } from "next-intl/server";
import { ui } from "@/components/ui";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("common");
  return (
    <main className="mx-auto flex max-w-xl flex-col items-start gap-3 px-4 py-24">
      <h1 className="text-2xl font-bold">{t("notFoundTitle")}</h1>
      <p className="text-muted">{t("notFoundBody")}</p>
      <Link href="/app" className={ui.link}>
        {t("openWorkspace")}
      </Link>
    </main>
  );
}
