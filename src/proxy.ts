import { createServerClient } from "@supabase/ssr";
import createMiddleware from "next-intl/middleware";
import { type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { DEVICE_COOKIE, isDeviceId } from "./lib/device";
import { buildCsp } from "./lib/security/csp";

const handleI18nRouting = createMiddleware(routing);

/**
 * Runs before every page request:
 * 1. assigns a random device id cookie (audit, ADR 0003);
 * 2. refreshes the Supabase session cookie when needed;
 * 3. sets a nonce-based Content Security Policy;
 * 4. applies locale routing (next-intl).
 * It never makes authorization decisions; those happen next to the data.
 */
export default async function proxy(request: NextRequest) {
  const isDev = process.env.NODE_ENV === "development";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCsp(nonce, { dev: isDev, supabaseUrl });
  request.headers.set("x-nonce", nonce);
  request.headers.set("Content-Security-Policy", csp);

  let deviceId = request.cookies.get(DEVICE_COOKIE)?.value;
  const newDevice = !isDeviceId(deviceId);
  if (newDevice) {
    deviceId = crypto.randomUUID();
    request.cookies.set(DEVICE_COOKIE, deviceId);
  }

  const pendingCookies: { name: string; value: string; options: Record<string, unknown> }[] = [];
  if (supabaseUrl && supabaseKey) {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            request.cookies.set(name, value);
            pendingCookies.push({ name, value, options });
          }
        },
      },
    });
    // Refreshes an expired access token once per navigation.
    await supabase.auth.getClaims();
  }

  const response = handleI18nRouting(request);

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("Cache-Control", "private, no-store");
  for (const { name, value, options } of pendingCookies) response.cookies.set(name, value, options);
  if (newDevice && deviceId) {
    response.cookies.set(DEVICE_COOKIE, deviceId, {
      httpOnly: true,
      sameSite: "lax",
      secure: !isDev && request.nextUrl.protocol === "https:",
      path: "/",
      maxAge: 60 * 60 * 24 * 400,
    });
  }
  return response;
}

export const config = {
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|_vercel|.*\\..*).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
