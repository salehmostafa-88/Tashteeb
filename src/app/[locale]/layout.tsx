import "@fontsource/noto-sans-arabic/arabic-400.css";
import "@fontsource/noto-sans-arabic/arabic-600.css";
import "@fontsource/noto-sans-arabic/arabic-700.css";
import "@fontsource/noto-sans/latin-400.css";
import "@fontsource/noto-sans/latin-600.css";
import "@fontsource/noto-sans/latin-700.css";
import "../globals.css";

import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { publicEnv } from "@/lib/env";
import { directionFor } from "@/lib/i18n/direction";

export const metadata: Metadata = {
  title: publicEnv.NEXT_PUBLIC_PRODUCT_NAME,
  robots: { index: false, follow: false },
};

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  // Per-request rendering: pages are user-specific and carry a CSP nonce.
  await headers();
  setRequestLocale(locale);

  return (
    <html lang={locale} dir={directionFor(locale)}>
      <body className="antialiased">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
