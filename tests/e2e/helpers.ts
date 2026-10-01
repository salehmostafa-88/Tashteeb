import { expect, type Browser, type Page } from "@playwright/test";

// Synthetic seed (supabase/seed.sql). Local and CI databases only.
export const PASSWORD = "Local-Dev-Pass-1";
export const ORG_A = "aaaaaaaa-0000-4000-8000-000000000000";
export const ORG_B = "bbbbbbbb-0000-4000-8000-000000000000";
export const PROJECT_A1 = "aaaaaaaa-0000-4000-8000-0000000000a1";
export const PROJECT_A2 = "aaaaaaaa-0000-4000-8000-0000000000a2";
export const PROJECT_B1 = "bbbbbbbb-0000-4000-8000-0000000000b1";

export function uniqueEmail(prefix: string): string {
  return `${prefix}.${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}@example.test`;
}

export async function signIn(page: Page, email: string, password = PASSWORD): Promise<void> {
  await page.goto("/login");
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.locator('form button[type="submit"]').click();
  await expect(page).not.toHaveURL(/\/login(\?|$)/);
}

export async function newSignedInPage(browser: Browser, email: string, locale = "en-US"): Promise<Page> {
  const context = await browser.newContext({ locale });
  const page = await context.newPage();
  await signIn(page, email);
  return page;
}

export function hasSupabase(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
}
