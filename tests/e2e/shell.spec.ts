import { expect, test } from "@playwright/test";

const PORTAL = "/portal/3e51b43e-5068-46a4-b815-d6bceef81003";
const WESTERN_DIGIT = /[0-9]/;
const ARABIC_INDIC_DIGIT = /[٠-٩]/;

test("root redirects to Arabic, right-to-left, even for an English browser", async ({ browser }) => {
  const context = await browser.newContext({ locale: "en-US", extraHTTPHeaders: { "Accept-Language": "en-US,en;q=0.9" } });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page).toHaveURL(/\/ar$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await context.close();
});

test("language switch toggles locale and direction on the same page", async ({ page }) => {
  await page.goto(`/ar${PORTAL}`);
  await page.getByRole("link", { name: "التبديل إلى الإنجليزية" }).click();
  await expect(page).toHaveURL(new RegExp(`/en${PORTAL}$`));
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await page.getByRole("link", { name: "Switch to Arabic" }).click();
  await expect(page).toHaveURL(new RegExp(`/ar${PORTAL}$`));
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
});

test("Arabic portal shows Arabic-Indic digits and keeps unknowns visible", async ({ page }) => {
  await page.goto(`/ar${PORTAL}`);
  const remaining = await page.getByTestId("card-remaining").innerText();
  expect(remaining).toMatch(ARABIC_INDIC_DIGIT);
  expect(remaining).not.toMatch(WESTERN_DIGIT);
  await expect(page.getByText("نسبة الإنجاز الكلية غير متاحة").first()).toBeVisible();
  await expect(page.getByText("المرحلة الحالية غير محددة")).toBeVisible();
  await expect(page.getByTestId("stage-card")).toHaveCount(6);
  await expect(page.getByTestId("budget-missing")).not.toBeEmpty();
});

test("English portal shows exact Western-digit amounts", async ({ page }) => {
  await page.goto(`/en${PORTAL}`);
  await expect(page.getByTestId("card-remaining")).toContainText(/EGP\s28,399\.98/);
  await expect(page.getByTestId("card-funding")).toContainText(/EGP\s150,000\.00/);
  await expect(page.getByText("Overall progress not available").first()).toBeVisible();
});

test("synthetic data is labelled on every placeholder screen", async ({ page }) => {
  for (const path of ["/ar", "/en/app/demo/projects", `/ar${PORTAL}`]) {
    await page.goto(path);
    await expect(page.getByTestId("synthetic-banner")).toBeVisible();
  }
});

test("unknown organization and project return not found", async ({ page }) => {
  expect((await page.goto("/en/app/another-org/projects"))?.status()).toBe(404);
  expect((await page.goto("/en/portal/00000000-0000-0000-0000-000000000000"))?.status()).toBe(404);
});

test("security headers are set", async ({ page }) => {
  const response = await page.goto("/en");
  const headers = response?.headers() ?? {};
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["x-powered-by"]).toBeUndefined();
});

for (const locale of ["ar", "en"]) {
  for (const path of ["", "/app/demo/projects", PORTAL]) {
    test(`no horizontal overflow at 360px: /${locale}${path}`, async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 780 });
      await page.goto(`/${locale}${path}`);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
}
