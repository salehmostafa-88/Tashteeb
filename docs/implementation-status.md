# Implementation status

Running engineering record. Do not replace rows with unsupported "complete" labels.

| Phase | Status | Evidence |
| --- | --- | --- |
| 0 Repository baseline | Delivered, awaiting owner review at the Phase 0 gate | See Phase 0 record below |
| 1 Identity and isolation | Not started | Baseline privilege migration only |
| 2 Financial engine | Not started | Money primitives and rounding exist; no fee engine, ledger or SQL calculation |
| 3 Staff workspace | Not started | Synthetic placeholder screen only |
| 4 Client portal and progress | Not started | Synthetic client shell only |
| 5 Mobile offline | Not started | Deferred until after pilot (owner decision O11) |
| 6 Migration pilot | Not started | No live import authorized or performed |
| 7 Paid SaaS hardening | Not started | No paid services or checkout configured |

## Phase 0 record (1 October 2026)

Branch `claude/great-rubin-ehb4g2`. Owner decisions O01–O11 and review clarifications are recorded in `docs/00-decisions.md`.

Delivered:

- Specification handoff merged into the repository (private migration appendix deliberately excluded).
- Next.js 16.3.8 / React 19.2.8 / TypeScript 5.9.3 strict app with pnpm lockfile; versions and licences in `docs/adr/0001-stack-and-versions.md`. ADRs 0001–0006 cover stack, money, auth, environments, PWA scope and localization.
- Arabic (default, RTL, Arabic-Indic digits) and English (LTR) with a language switch on every screen; self-hosted Noto Sans Arabic / Noto Sans; design tokens from the UX spec; per-tenant accent with contrast fallback.
- Exact money primitives (`src/lib/money`), strict Arabic/Western amount parsing, locale formatting (`src/lib/i18n/format.ts`), public env validation (`src/lib/env.ts`).
- Placeholder screens, labelled as synthetic: landing `/[locale]`, staff projects `/[locale]/app/demo/projects` (table on desktop, cards on phone), client portal `/[locale]/portal/<demo id>` (money cards, expandable details, six unknown stages, HTML category bars, missing-budget state, separate finance/progress freshness, data-quality notes).
- Local Supabase config (Postgres 17), baseline migration revoking implicit table/sequence/function privileges for `anon`/`authenticated` and creating `app_private`, synthetic-only seed placeholder.
- GitHub Actions CI: lint, typecheck, unit, spec check, build, Playwright, pgTAP; no secrets; SHA-pinned actions.

Commands executed in the development container and results:

| Command | Result |
| --- | --- |
| `pnpm lint` | Pass, no findings |
| `pnpm typecheck` | Pass |
| `pnpm test:unit` | Pass: 7 files, 92 tests |
| `pnpm build` | Pass (Turbopack) |
| `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/opt/pw-browsers/chromium pnpm test:e2e` | Pass: 26 tests (desktop 1440×900 and Pixel 7 emulation), using a preinstalled Chromium 1194 build rather than Playwright 1.63's bundled browser |
| `supabase db start` + `pnpm test:db` | Pass: 12 pgTAP assertions |
| `pnpm check:spec` | Pass: 10 financial cases, 4 rounding cases, links |
| Clean clone: `pnpm install --frozen-lockfile`, build, lint, typecheck, unit | Pass (after fixing a lockfile/manifest mismatch the first clean-clone run caught) |

GitHub Actions run 1 (https://github.com/salehmostafa-88/Tashteeb/actions/runs/36827203444): quality, e2e and database jobs all passed.

Screenshots: Arabic and English at 390px and 1440px for all three screens were captured locally and shared in the review conversation; they are not committed.

Not done or not verified in Phase 0:

- `supabase start` (full stack) failed in the development container because one image download was blocked by the container's network proxy; `supabase db start` (Postgres only) works and is what Phase 0 needs. Auth, Storage and Studio services are untested locally.
- No real-device testing (none required for Phase 0). Phone results are Chromium emulation.
- No Arabic native-speaker copy review yet.
- Content Security Policy is not set yet (basic security headers are); planned with auth in Phase 1 and hardening in Phase 7.
- Repository licence choice remains open (O09).

Next phase: Phase 1 identity and tenant isolation, after owner approval of this baseline.
