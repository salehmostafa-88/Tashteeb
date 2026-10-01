import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";
import { ui } from "@/components/ui";
import { Link, redirect } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { getSessionUser, safeReturnPath } from "@/lib/auth/session";

export default async function LoginPage({ params, searchParams }: PageProps<"/[locale]/login">) {
  const { locale: raw } = await params;
  const locale = raw as AppLocale;
  setRequestLocale(locale);
  const { next } = await searchParams;
  const returnTo = typeof next === "string" ? safeReturnPath(next, locale) : undefined;

  if (await getSessionUser()) {
    redirect({ href: returnTo ? returnTo.replace(/^\/(ar|en)/, "") || "/app" : "/app", locale });
  }
  const t = await getTranslations("auth");

  return (
    <AuthCard title={t("loginTitle")}>
      <LoginForm locale={locale} next={returnTo} />
      <Link href="/auth/forgot" className={`${ui.link} text-sm`}>
        {t("forgotPassword")}
      </Link>
      <p className={ui.help}>{t("noAccount")}</p>
    </AuthCard>
  );
}
