# ADR 0001: Application stack and pinned versions

Status: Proposed for owner approval at the Phase 0 gate · 1 October 2026

## Decision

Adopt the proposed stack from `docs/04-architecture.md`: a Next.js App Router modular monolith in strict TypeScript, Supabase (Postgres, Auth, private Storage) with hand-written SQL migrations and no ORM, next-intl for localization, Tailwind CSS, Zod, Vitest, Playwright and pgTAP. pnpm is the package manager; the lockfile is committed and CI installs with `--frozen-lockfile`.

## Exact versions (resolved 1 October 2026)

| Package | Version | Note |
| --- | --- | --- |
| Node.js | 22 LTS (local 22.22.0) | `engines >= 22.12` |
| pnpm | 10.28.0 | `packageManager` field |
| next | 16.3.8 | Turbopack default; `middleware` is now `proxy.ts` |
| react / react-dom | 19.2.8 | The version Next 16.3.8's own scaffold pins (19.3.0 exists; not adopted until Next pins it) |
| typescript | 5.9.3 | TS 7.0 (native) and 6.0 exist; typescript-eslint supports `< 6.1`, Next's scaffold pins 5.x |
| eslint / eslint-config-next | 9.39.5 / 16.3.8 | ESLint 10 exists; Next's scaffold still uses 9 |
| next-intl | 4.14.8 | Peer range covers Next 16 |
| @supabase/supabase-js / @supabase/ssr | 2.117.2 / 0.12.7 | Not wired to features until Phase 1 |
| supabase CLI | 2.119.0 | Local Postgres 17 image |
| tailwindcss / @tailwindcss/postcss | 4.3.3 | CSS-first `@theme` tokens |
| zod | 4.6.5 | |
| vitest | 5.0.3 | |
| @playwright/test | 1.63.0 | CI installs its own Chromium |
| @fontsource/noto-sans-arabic, @fontsource/noto-sans | 5.3.0 | Self-hosted fonts, no Google Fonts request |

Recharts is deliberately not installed yet. It arrives with the monthly chart in Phase 4 (owner clarification 9: category bars are plain HTML/CSS).

## Licences

Production dependencies are MIT, Apache-2.0, ISC, BSD and 0BSD, plus: OFL-1.1 (Noto fonts, permits bundling), CC-BY-4.0 (caniuse-lite data), LGPL-3.0-or-later (`@img/sharp-libvips-*`, the optional native image library used by Next.js image optimization, dynamically linked and unmodified). No copyleft code is compiled into the application. Re-review before paid launch (Phase 7).

## Consequences

Next.js 16 ships version-matched docs in `node_modules/next/dist/docs/`; `AGENTS.md` points agents to them. Upgrades are deliberate: bump, re-run every gate, update this table.
