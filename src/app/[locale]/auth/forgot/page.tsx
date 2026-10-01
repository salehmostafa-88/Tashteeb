import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthCard } from "@/components/auth/AuthCard";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { ui } from "@/components/ui";
import { Link } from "@/i18n/navigation";

export default async function ForgotPasswordPage({ params }: PageProps<"/[locale]/auth/forgot">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth");
  return (
    <AuthCard title={t("forgotTitle")}>
      <p className={ui.help}>{t("forgotBody")}</p>
      <ForgotPasswordForm locale={locale} />
      <Link href="/login" className={`${ui.link} text-sm`}>
        {t("loginTitle")}
      </Link>
    </AuthCard>
  );
}
