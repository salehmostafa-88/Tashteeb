import { describe, expect, it } from "vitest";
import { parsePublicEnv, requireSupabasePublicEnv } from "@/lib/env";

describe("public environment validation", () => {
  it("applies defaults and treats blanks as unset", () => {
    const env = parsePublicEnv({ NEXT_PUBLIC_SUPABASE_URL: "", NEXT_PUBLIC_PRODUCT_NAME: " " });
    expect(env.NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");
    expect(env.NEXT_PUBLIC_PRODUCT_NAME).toBe("Studio Portal");
    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBeUndefined();
  });

  it("rejects malformed URLs without echoing values", () => {
    expect(() => parsePublicEnv({ NEXT_PUBLIC_SUPABASE_URL: "not a url" })).toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
  });

  it("requires Supabase settings only when asked", () => {
    expect(() => requireSupabasePublicEnv(parsePublicEnv({}))).toThrow();
    const env = parsePublicEnv({
      NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
    });
    expect(requireSupabasePublicEnv(env)).toEqual({ url: "http://127.0.0.1:54321", publishableKey: "sb_publishable_test" });
  });
});
