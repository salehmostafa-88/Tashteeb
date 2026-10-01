import { expect, test } from "@playwright/test";
import { ORG_A, ORG_B, PROJECT_A1, PROJECT_B1, newSignedInPage, uniqueEmail } from "./helpers";

test.describe("authentication and role-aware access", () => {
  test("signed-out visitors are sent to login and returned afterwards", async ({ page }) => {
    await page.goto(`/en/app/${ORG_A}/projects`);
    await expect(page).toHaveURL(/\/en\/login\?next=/);
    await page.locator('input[name="email"]').fill("owner.a@example.test");
    await page.locator('input[name="password"]').fill("Local-Dev-Pass-1");
    await page.locator('form button[type="submit"]').click();
    await expect(page).toHaveURL(new RegExp(`/en/app/${ORG_A}/projects$`));
  });

  test("a wrong password gets a generic message", async ({ page }) => {
    await page.goto("/en/login");
    await page.locator('input[name="email"]').fill("owner.a@example.test");
    await page.locator('input[name="password"]').fill("not-the-password");
    await page.locator('form button[type="submit"]').click();
    await expect(page.getByTestId("form-error")).toHaveText("Incorrect email or password.");
  });

  test("owner works in Arabic with full studio navigation", async ({ browser }) => {
    const page = await newSignedInPage(browser, "owner.a@example.test", "ar-EG");
    await expect(page).toHaveURL(new RegExp(`/ar/app/${ORG_A}/projects$`));
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("المشروعات");
    const nav = page.getByRole("navigation", { name: "التنقل الرئيسي" });
    await expect(nav.getByRole("link", { name: "الفريق والدعوات" })).toBeVisible();
    await expect(page.getByText("مشروعان")).toBeVisible();
  });

  test("assigned engineer sees only the assigned project and no admin pages", async ({ browser }) => {
    const page = await newSignedInPage(browser, "engineer.a@example.test");
    await expect(page).toHaveURL(new RegExp(`/en/app/${ORG_A}/projects$`));
    await expect(page.getByText("A-001").filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText("A-002")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Team & invitations" })).toHaveCount(0);
    await page.goto(`/en/app/${ORG_A}/members`);
    await expect(page.getByRole("heading", { name: "Not allowed" })).toBeVisible();
    await expect(page.getByText("owner.a@example.test")).toHaveCount(0);
  });

  test("unassigned staff cannot open a project by URL", async ({ browser }) => {
    const page = await newSignedInPage(browser, "unassigned.a@example.test");
    const response = await page.goto(`/en/app/${ORG_A}/projects/${PROJECT_A1}`);
    expect(response?.status()).toBe(404);
  });

  test("client lands on the portal and cannot reach staff or other studios", async ({ browser }) => {
    const page = await newSignedInPage(browser, "client1@example.test");
    await expect(page).toHaveURL(new RegExp(`/en/portal/${PROJECT_A1}$`));
    await expect(page.getByTestId("portal-financial-unknown")).toBeVisible();
    const html = await page.content();
    for (const secret of ["A-001", "engineer.a@example.test", "finance.a@example.test", "owner.a@example.test"]) {
      expect(html, `portal page must not contain ${secret}`).not.toContain(secret);
    }
    expect((await page.goto(`/en/app/${ORG_A}/projects`))?.status()).toBe(404);
    expect((await page.goto(`/en/portal/${PROJECT_B1}`))?.status()).toBe(404);
    expect((await page.goto(`/en/app/${ORG_B}/projects`))?.status()).toBe(404);
  });

  test("sign out ends the session", async ({ browser }) => {
    const page = await newSignedInPage(browser, "owner.b@example.test");
    await page.getByRole("button", { name: "Sign out" }).first().click();
    await expect(page).toHaveURL(/\/en\/login$/);
    await page.goto(`/en/app/${ORG_B}/projects`);
    await expect(page).toHaveURL(/\/en\/login\?next=/);
  });
});

test.describe("invitations", () => {
  test("staff invitation: link, sign-up, scoped access, single use, revocation", async ({ browser }) => {
    const email = uniqueEmail("staff");
    const owner = await newSignedInPage(browser, "owner.a@example.test");
    await owner.goto(`/en/app/${ORG_A}/members`);
    const form = owner.locator("form", { has: owner.locator('select[name="project_id"]') });
    await form.locator('input[name="email"]').fill(email);
    await form.locator('select[name="role"]').selectOption("engineer");
    await form.locator('select[name="project_id"]').selectOption({ label: "A-002 — Demo Office Fit-out" });
    await form.getByRole("button", { name: "Create invitation link" }).click();
    const link = await owner.getByTestId("invite-link").inputValue();
    expect(link).toMatch(/\/invite\?token=[0-9a-f]{64}$/);
    await expect(owner.getByRole("link", { name: "Send via WhatsApp" })).toHaveAttribute("href", /^https:\/\/wa\.me\/\?text=/);

    const invitee = await (await browser.newContext({ locale: "ar-EG" })).newPage();
    await invitee.goto(link.replace(/^https?:\/\/[^/]+/, ""));
    await expect(invitee).toHaveURL(/\/ar\/invite\?token=/);
    await invitee.locator('input[name="display_name"]').fill("مهندس جديد");
    await invitee.locator('input[name="email"]').fill(email);
    await invitee.locator('input[name="password"]').fill("Fresh-Pass-2026");
    await invitee.locator('form button[type="submit"]').click();
    await expect(invitee).toHaveURL(new RegExp(`/ar/app/${ORG_A}/projects$`));
    await expect(invitee.getByText("A-002").filter({ visible: true }).first()).toBeVisible();
    await expect(invitee.getByText("A-001")).toHaveCount(0);

    // The same link cannot be used twice.
    const reuse = await (await browser.newContext({ locale: "en-US" })).newPage();
    await reuse.goto(link.replace(/^https?:\/\/[^/]+/, ""));
    await expect(reuse.getByTestId("invite-status")).toHaveText(/already used/);

    // Owner removes the member; access ends on the next request (same session).
    await owner.reload();
    const memberEntry = () =>
      owner.locator('[data-testid="members-table"] tr, [data-testid="members-cards"] li').filter({ hasText: email, visible: true });
    owner.once("dialog", (dialog) => dialog.accept());
    await memberEntry().getByRole("button", { name: "Remove from studio" }).click();
    await expect(memberEntry()).toContainText("Removed");
    const after = await invitee.goto(`/ar/app/${ORG_A}/projects`);
    expect(after?.status()).toBe(404);
  });

  test("client invitation grants one project portal and can be revoked", async ({ browser }) => {
    const email = uniqueEmail("client");
    const owner = await newSignedInPage(browser, "owner.a@example.test");
    await owner.goto(`/en/app/${ORG_A}/projects/${PROJECT_A1}`);
    const form = owner.locator("form", { hasText: "Invite a client" });
    await form.locator('input[name="email"]').fill(email);
    await form.getByRole("button", { name: "Create invitation link" }).click();
    const link = await owner.getByTestId("invite-link").inputValue();

    const client = await (await browser.newContext({ locale: "en-US" })).newPage();
    await client.goto(link.replace(/^https?:\/\/[^/]+/, ""));
    await expect(client.getByText(/follow the project/)).toBeVisible();
    await client.locator('input[name="display_name"]').fill("Client Person");
    await client.locator('input[name="email"]').fill(email);
    await client.locator('input[name="password"]').fill("Client-Pass-2026");
    await client.locator('form button[type="submit"]').click();
    await expect(client).toHaveURL(new RegExp(`/en/portal/${PROJECT_A1}$`));

    await owner.reload();
    const item = owner.getByTestId("project-clients").locator("li", { hasText: email });
    owner.once("dialog", (dialog) => dialog.accept());
    await item.getByRole("button", { name: "Revoke access" }).click();
    await expect(owner.getByTestId("project-clients").locator("li", { hasText: email })).toHaveCount(0);
    expect((await client.goto(`/en/portal/${PROJECT_A1}`))?.status()).toBe(404);
  });

  test("an invitation for someone else's email is refused", async ({ browser }) => {
    const owner = await newSignedInPage(browser, "owner.a@example.test");
    await owner.goto(`/en/app/${ORG_A}/members`);
    const form = owner.locator("form", { has: owner.locator('select[name="project_id"]') });
    await form.locator('input[name="email"]').fill(uniqueEmail("intended"));
    await form.getByRole("button", { name: "Create invitation link" }).click();
    const link = await owner.getByTestId("invite-link").inputValue();

    const other = await newSignedInPage(browser, "unassigned.a@example.test");
    await other.goto(link.replace(/^https?:\/\/[^/]+/, ""));
    await other.getByRole("button", { name: "Accept invitation" }).click();
    await expect(other.getByTestId("form-error")).toHaveText("This invitation was sent to a different email address.");
  });

  test("platform operator creates a studio whose owner signs up and creates a project", async ({ browser }) => {
    const ownerEmail = uniqueEmail("newowner");
    const operator = await newSignedInPage(browser, "operator@example.test");
    await operator.goto("/en/ops");
    await operator.locator('input[name="name"]').fill("استوديو الاختبار");
    await operator.locator('input[name="owner_email"]').fill(ownerEmail);
    await operator.getByRole("button", { name: "Create and invite owner" }).click();
    const link = await operator.getByTestId("invite-link").inputValue();

    const owner = await (await browser.newContext({ locale: "en-US" })).newPage();
    await owner.goto(link.replace(/^https?:\/\/[^/]+/, ""));
    await owner.locator('input[name="display_name"]').fill("New Owner");
    await owner.locator('input[name="email"]').fill(ownerEmail);
    await owner.locator('input[name="password"]').fill("Owner-Pass-2026");
    await owner.locator('form button[type="submit"]').click();
    await expect(owner).toHaveURL(/\/en\/app\/[0-9a-f-]+\/projects$/);
    await expect(owner.getByText("No projects yet")).toBeVisible();

    await owner.getByRole("link", { name: "New project" }).click();
    await owner.locator('input[name="display_name"]').fill("فيلا الاختبار");
    await owner.locator('input[name="code"]').fill("T-001");
    await owner.getByRole("button", { name: "Create project" }).click();
    await expect(owner.getByRole("heading", { level: 1 })).toHaveText("فيلا الاختبار");

    // Another studio's owner cannot see it.
    const ownerB = await newSignedInPage(browser, "owner.b@example.test");
    await expect(ownerB.getByText("T-001")).toHaveCount(0);
  });

  test("a non-operator cannot use platform administration", async ({ browser }) => {
    const page = await newSignedInPage(browser, "owner.a@example.test");
    await page.goto("/en/ops");
    await expect(page.getByRole("heading", { name: "Not allowed" })).toBeVisible();
  });
});
