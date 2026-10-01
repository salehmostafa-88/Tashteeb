import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { requireSupabasePublicEnv } from "@/lib/env";
import { DEVICE_COOKIE, isDeviceId } from "@/lib/device";

/**
 * Request-scoped Supabase client acting as the signed-in user (publishable key +
 * session cookie). Database RLS and command checks decide what it may do.
 * Never use a service-role key here.
 */
export async function createSupabaseServerClient() {
  const { url, publishableKey } = requireSupabasePublicEnv();
  const cookieStore = await cookies();
  const deviceId = cookieStore.get(DEVICE_COOKIE)?.value;

  return createServerClient(url, publishableKey, {
    global: {
      headers: isDeviceId(deviceId) ? { "x-device-id": deviceId } : {},
    },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) cookieStore.set(name, value, options);
        } catch {
          // Server Components cannot set cookies; the proxy refreshes the session.
        }
      },
    },
  });
}
