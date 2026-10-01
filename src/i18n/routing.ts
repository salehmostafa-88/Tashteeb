import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ar", "en"],
  defaultLocale: "ar",
  localePrefix: "always",
  // Arabic is the default regardless of browser language (decision D03). The
  // explicit switch is the only way to change it until per-user preference (Phase 1).
  localeDetection: false,
});

export type AppLocale = (typeof routing.locales)[number];
