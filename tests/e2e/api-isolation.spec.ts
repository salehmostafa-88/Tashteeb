import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";
import { ORG_A, ORG_B, PASSWORD, PROJECT_A1, PROJECT_B1 } from "./helpers";

// SEC-01/02/04/07 through the public Data API, exactly as an attacker with a valid
// account (and the public publishable key) would call it, bypassing the app.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

async function clientFor(email: string) {
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await client.auth.signInWithPassword({ email, password: PASSWORD });
  expect(error).toBeNull();
  return client;
}

test.describe("Data API isolation", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chromium", "API tests run once");
  });

  test("anonymous callers read nothing", async () => {
    const anon = createClient(url, key, { auth: { persistSession: false } });
    const { data, error } = await anon.from("projects").select("id");
    expect(data ?? []).toHaveLength(0);
    expect(error).not.toBeNull();
  });

  test("owner A cannot read or write organization B through the API", async () => {
    const a = await clientFor("owner.a@example.test");
    const projects = await a.from("projects").select("id, organization_id");
    expect(projects.error).toBeNull();
    expect(projects.data?.every((p) => p.organization_id === ORG_A)).toBe(true);
    expect((await a.from("organizations").select("id").eq("id", ORG_B)).data).toHaveLength(0);

    const portal = await a.rpc("get_portal_project", { p_project_id: PROJECT_B1 });
    expect(portal.error?.message).toBe("NOT_FOUND");

    const create = await a.rpc("create_project", { p_organization_id: ORG_B, p_code: "HACK-1", p_display_name: "x", p_currency: "EGP" });
    expect(create.error?.message).toBe("FORBIDDEN");

    const insert = await a.from("projects").insert({ organization_id: ORG_A, code: "RAW-1", display_name: "raw", currency: "EGP" });
    expect(insert.error).not.toBeNull();

    const update = await a.from("organizations").update({ name: "hijacked" }).eq("id", ORG_A).select();
    expect(update.data ?? []).toHaveLength(0);
  });

  test("clients cannot read staff tables and see only granted portals", async () => {
    const c = await clientFor("client1@example.test");
    for (const table of ["projects", "organizations", "organization_memberships", "audit_events"]) {
      const { data } = await c.from(table).select("*");
      expect(data ?? [], table).toHaveLength(0);
    }
    const mine = await c.rpc("get_portal_project", { p_project_id: PROJECT_A1 });
    expect(Object.keys(mine.data ?? {}).sort()).toEqual(["brand", "financials", "progress", "project", "schema_version", "viewer"]);
    expect((await c.rpc("get_portal_project", { p_project_id: PROJECT_B1 })).error?.message).toBe("NOT_FOUND");
  });

  test("commands ignore caller-supplied identity fields", async () => {
    const e = await clientFor("engineer.a@example.test");
    const escalate = await e.rpc("change_member_role", {
      p_organization_id: ORG_A,
      p_user_id: "10000000-0000-4000-8000-000000000003",
      p_role: "owner",
    });
    expect(escalate.error?.message).toBe("FORBIDDEN");
    const invite = await e.rpc("create_invitation", { p_organization_id: ORG_A, p_kind: "staff", p_email: "x@example.test", p_role: "owner" });
    expect(invite.error?.message).toBe("FORBIDDEN");
  });
});
