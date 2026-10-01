# Implementation status

Running engineering record. Do not replace rows with unsupported "complete" labels.

| Phase | Status | Evidence |
| --- | --- | --- |
| 0 Repository baseline | Delivered; owner approved continuing to Phase 1 | See Phase 0 record below |
| 1 Identity and isolation | Delivered, awaiting owner review at the Phase 1 gate | See Phase 1 record below; owner MFA enforcement still open |
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

### Follow-up after owner review (1 October 2026)

- Locale now follows the device language (O12): Arabic devices get `/ar`, English and all other devices get `/en`, and an explicit switch is remembered. E2E: 32 tests pass locally (`PLAYWRIGHT_CHROMIUM_EXECUTABLE=/opt/pw-browsers/chromium pnpm test:e2e`), including Arabic, English and French device locales and the remembered switch.
- Owner decisions O13–O15 (AI photo capture, easiest entry, rich client and management presentation) recorded in `docs/00-decisions.md`, designed in `docs/14-ai-capture-and-insights.md` and ADR 0007. No AI code exists yet; it waits for provider approval, consent and private sample images.

AI decisions: provider-configurable bring-your-own-key (O16). The accuracy spike waits for owner sample images.

## Phase 1 record (1 October 2026)

Branch `claude/great-rubin-ehb4g2`.

Delivered:

- Migration `20261001010000_identity_and_tenancy.sql`: organizations, profiles (auto-created from auth users), memberships with roles owner/finance/manager/engineer/collaborator (collaborators must expire, owners never), projects (currency allowlist, case-insensitive unique code per studio), staff assignments, client project grants, invitations (256-bit single-use tokens stored as SHA-256 hashes, 7-day expiry, bound to email), append-only audit events with actor and device id, platform operators. Composite foreign keys keep every reference inside one organization. RLS on every table; client roles have SELECT only; all writes go through SECURITY DEFINER commands with a pinned empty search_path that derive the actor from `auth.uid()`. Last-owner protection. Safe client projection `get_portal_project` with whitelisted fields only.
- Next.js: Supabase SSR session refresh in `src/proxy.ts`, `sp_device` cookie forwarded as `x-device-id`, nonce-based Content Security Policy, private no-store responses. Sign-in, sign-out (this device only), password reset by email link, invitation preview/sign-up/accept, workspace chooser, studio workspace with role-aware navigation, projects list/create/detail, staff assignment and client access management, team and invitations management with copy and WhatsApp share of invite links (O08), studio branding settings (name, English name, accent with contrast fallback, timezone), operator studio creation, client portal list and safe project view with unknown financial/progress states, staff "preview client view". Arabic and English throughout; phone layouts use cards instead of tables.
- Synthetic seed with two studios, eight accounts, four projects and two client grants (`supabase/seed.sql`), `pnpm env:local` helper, `pnpm db:start` excluding unneeded services.
- Owner MFA and recovery plan: `docs/runbooks/owner-mfa-and-recovery.md`.

Commands executed in the development container and results:

| Command | Result |
| --- | --- |
| `pnpm lint` | Pass |
| `pnpm typecheck` | Pass |
| `pnpm test:unit` | Pass: 8 files, 115 tests (adds open-redirect guard, device id, CSP, error mapping) |
| `pnpm check:spec` | Pass |
| `pnpm db:start`, `pnpm db:reset`, `pnpm test:db` | Pass: 76 pgTAP assertions on a seeded database (64 in the isolation file) |
| `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/opt/pw-browsers/chromium pnpm test:e2e` | Pass: 60 tests (desktop and Pixel 7 emulation) against the local Supabase stack, including Data API attack tests |

GitHub Actions run https://github.com/salehmostafa-88/Tashteeb/actions/runs/36834970131: quality, end-to-end (with local Supabase) and database jobs all passed.

Acceptance coverage: SEC-01, SEC-02, SEC-03, SEC-04, SEC-05, SEC-06, SEC-07 pass through direct database/RPC (pgTAP), the HTTP Data API (Playwright `api-isolation.spec.ts`) and the UI. SEC-11 (expired, reused, revoked and mismatched invitations; open-redirect guard) and SEC-13 (no direct writes; audit append-only) pass. Login and role navigation verified in Arabic.

Screenshots (shared in the review conversation, not committed): Arabic phone login; owner projects, project detail, team and settings in Arabic on desktop; team in English on phone; engineer projects and client portal in Arabic on phone.

Not done or not verified in Phase 1:

- Owner MFA is planned, not enforced (TOTP is enabled in Auth config; enrolment UI, step-up and the `aal2` check are listed in the runbook). This must close before the pilot.
- Email confirmation is off locally (Supabase default for local); the sign-up flow handles the confirmation-required path but it has not been exercised against a real mailer.
- Rate limiting relies on Supabase Auth defaults; no application-level limit on invitation preview yet (tokens are 256-bit, so guessing is infeasible).
- An owner-only page opened by a non-owner shows "Not allowed" with HTTP 200 (Next's `forbidden()` is experimental); no data is rendered.
- Logo upload, profile editing and per-user language preference are not built (logo arrives with uploads in Phase 3).
- No real-device testing; no native Arabic copy review yet.
- All translation messages are sent to the browser on every page (no data, but larger payload); scoping per page is a later optimisation.

Next phase: Phase 2 financial engine, after owner review of Phase 1.
