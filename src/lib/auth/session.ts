import "server-only";

import { cache } from "react";
import { redirect } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface SessionUser {
  id: string;
  email: string | null;
}

/** Verified identity from the session JWT, or null when signed out. */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) return null;
  return { id: data.claims.sub, email: typeof data.claims.email === "string" ? data.claims.email : null };
});

export async function requireSessionUser(locale: AppLocale, returnTo: string): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    redirect({ href: { pathname: "/login", query: { next: returnTo } }, locale });
  }
  return user as SessionUser;
}

/** Only same-site, locale-prefixed paths are allowed as post-login destinations. */
export function safeReturnPath(value: unknown, locale: AppLocale): string {
  if (typeof value === "string" && /^\/(ar|en)(\/[A-Za-z0-9\-._~/%?=&]*)?$/.test(value) && !value.startsWith("//")) {
    return value;
  }
  return `/${locale}/app`;
}
