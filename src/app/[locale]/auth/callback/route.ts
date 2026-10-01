import { NextResponse, type NextRequest } from "next/server";
import { routing, type AppLocale } from "@/i18n/routing";
import { safeReturnPath } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Completes email links (password recovery, sign-up confirmation) with the PKCE code.
export async function GET(request: NextRequest, context: RouteContext<"/[locale]/auth/callback">) {
  const { locale: raw } = await context.params;
  const locale: AppLocale = (routing.locales as readonly string[]).includes(raw) ? (raw as AppLocale) : routing.defaultLocale;
  const code = request.nextUrl.searchParams.get("code");
  const next = safeReturnPath(request.nextUrl.searchParams.get("next"), locale);

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, request.nextUrl.origin));
  }
  return NextResponse.redirect(new URL(`/${locale}/login`, request.nextUrl.origin));
}
