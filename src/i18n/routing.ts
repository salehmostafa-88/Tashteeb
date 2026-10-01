import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ar", "en"],
  // Used only when the device language is neither Arabic nor English (owner decision O12).
  defaultLocale: "en",
  localePrefix: "always",
  // The device/browser language (Accept-Language) picks the first locale; an explicit
  // switch is remembered in the locale cookie and wins on later visits.
  localeDetection: true,
});

export type AppLocale = (typeof routing.locales)[number];
