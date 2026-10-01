import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ui } from "./ui";

export async function AccessDenied({ backHref }: { backHref: string }) {
  const t = await getTranslations("common");
  return (
    <section role="alert" className={`${ui.card} flex flex-col items-start gap-2 p-8`}>
      <h1 className="text-xl font-bold">{t("accessDeniedTitle")}</h1>
      <p className="text-muted">{t("accessDeniedBody")}</p>
      <Link href={backHref} className={ui.link}>
        {t("back")}
      </Link>
    </section>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <section className={`${ui.card} flex flex-col items-center gap-2 p-8 text-center`}>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-muted">{body}</p>
      {action}
    </section>
  );
}
