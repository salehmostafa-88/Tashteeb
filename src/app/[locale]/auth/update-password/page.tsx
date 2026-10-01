import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthCard } from "@/components/auth/AuthCard";
import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm";
import type { AppLocale } from "@/i18n/routing";
import { requireSessionUser } from "@/lib/auth/session";

export default async function UpdatePasswordPage({ params }: PageProps<"/[locale]/auth/update-password">) {
  const { locale: raw } = await params;
  const locale = raw as AppLocale;
  setRequestLocale(locale);
  await requireSessionUser(locale, `/${locale}/auth/update-password`);
  const t = await getTranslations("auth");
  return (
    <AuthCard title={t("updatePasswordTitle")}>
      <UpdatePasswordForm locale={locale} />
    </AuthCard>
  );
}
