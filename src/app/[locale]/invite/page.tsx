import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthCard } from "@/components/auth/AuthCard";
import { AcceptInvitationForm, SignUpInvitationForm } from "@/components/auth/InviteForms";
import { ui } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { getSessionUser } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/i18n/format";
import { signOutAction } from "@/modules/identity/actions";
import { getInvitationPreview } from "@/modules/identity/queries";
import type { InvitationPreview } from "@/modules/identity/types";

export default async function InvitePage({ params, searchParams }: PageProps<"/[locale]/invite">) {
  const { locale: raw } = await params;
  const locale = raw as AppLocale;
  setRequestLocale(locale);
  const t = await getTranslations("invite");
  const roles = await getTranslations("roles");
  const common = await getTranslations("common");
  const { token: rawToken } = await searchParams;
  const token = typeof rawToken === "string" && /^[0-9a-f]{64}$/.test(rawToken) ? rawToken : null;

  const preview: InvitationPreview = token ? await getInvitationPreview(token) : { status: "not_found" };
  const user = await getSessionUser();
  const returnTo = `/${locale}/invite?token=${token ?? ""}`;

  if (preview.status !== "valid" || !token) {
    return (
      <AuthCard title={t("title")}>
        <p role="alert" data-testid="invite-status" className="text-muted">
          {t(`status_${preview.status}`)}
        </p>
        <Link href="/login" className={ui.buttonSecondary}>
          {common("signIn")}
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard title={t("title")}>
      <div className="flex flex-col gap-1">
        <p className="text-lg text-ink">
          {preview.kind === "client"
            ? t("clientBody", { project: isolate(preview.project_name), organization: isolate(preview.organization_name) })
            : t("staffBody", { organization: isolate(preview.organization_name), role: roles(preview.role ?? "engineer") })}
        </p>
        <p className={ui.help}>
          {t("forEmail", { email: preview.email_hint ?? "" })} ·{" "}
          {preview.expires_at ? t("expires", { date: formatDateTime(preview.expires_at, locale, preview.timezone ?? "Africa/Cairo") }) : null}
        </p>
      </div>

      {user ? (
        <>
          <p className={ui.help}>{t("signedInAs", { email: user.email ?? "" })}</p>
          <AcceptInvitationForm locale={locale} token={token} />
          <form action={signOutAction}>
            <input type="hidden" name="locale" value={locale} />
            <button type="submit" className={`${ui.link} text-sm`}>
              {common("signOut")}
            </button>
          </form>
        </>
      ) : (
        <>
          <SignUpInvitationForm locale={locale} token={token} />
          <Link href={{ pathname: "/login", query: { next: returnTo } }} className={`${ui.link} text-sm`}>
            {t("haveAccount")}
          </Link>
        </>
      )}
    </AuthCard>
  );
}

/** First-strong isolate so a name in one script reads correctly inside a sentence in the other. */
function isolate(value: string | null | undefined): string {
  return `\u2068${value ?? ""}\u2069`;
}
