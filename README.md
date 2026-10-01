# Tashteeb (working name)

Arabic-first SaaS for small interior design and fit-out studios: staff record project costs and site updates in simple tables and phone forms, and each studio's clients see a branded dashboard of spending, stage progress and approved photos. The product name is temporary and configurable (`NEXT_PUBLIC_PRODUCT_NAME`).

**Status:** Phase 0 (application shell). Screens show clearly labelled synthetic data; there is no login, database feature or deployment yet. See [implementation status](docs/implementation-status.md).

## Local setup

Requirements: Node.js 22, pnpm 10 (`corepack enable`), Docker (for the local database).

```bash
pnpm install --frozen-lockfile
cp .env.example .env.local     # optional in Phase 0; defaults work
pnpm dev                       # http://localhost:3000 → /ar or /en from the device language
```

Local database (Postgres 17 via the Supabase CLI, synthetic seed only):

```bash
pnpm exec supabase db start    # Postgres only; `pnpm db:start` starts the full local stack
pnpm test:db                   # pgTAP tests in supabase/tests
pnpm db:reset                  # re-apply migrations and seed
```

## Commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | Development server |
| `pnpm build` / `pnpm start` | Production build and server |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | Route type generation + `tsc --noEmit` |
| `pnpm test:unit` | Vitest unit tests (`tests/unit`) |
| `pnpm test:e2e` | Playwright on desktop and phone viewports; builds and starts the app on port 3100 |
| `pnpm test:db` | pgTAP database tests (needs the local database running) |
| `pnpm check:spec` | Validates spec links, JSON and the synthetic financial fixtures |

In a sandbox with a preinstalled Chromium, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/path/to/chrome` instead of running `playwright install`.

## Repository layout

```text
src/app/[locale]/        localized routes (landing, staff /app/[orgId], client /portal/[projectId])
src/components/          presentation components (no business rules)
src/lib/money/           exact minor-unit money, rounding, amount input parsing
src/lib/i18n/            digits, direction and locale formatting
src/lib/brand/           tenant accent contrast checks
src/modules/             domain modules (portal DTOs; synthetic demo data for Phase 0)
src/i18n/, src/proxy.ts  next-intl routing (locale only, never authorization)
messages/                ar.json and en.json
supabase/                config, migrations, pgTAP tests, synthetic seed
tests/unit, tests/e2e    Vitest and Playwright suites
docs/                    specification, ADRs (docs/adr) and implementation status
```

## Specification

Start with [CLAUDE.md](CLAUDE.md) (coding brief), [decisions](docs/00-decisions.md) (including the owner decisions of 1 October 2026) and the [coding phases](docs/10-coding-phases.md). `MASTER-SPEC.md` is a generated reading copy (`node scripts/build-master.mjs`); edit the source documents.

### Specification map

| File | Purpose |
| --- | --- |
| [Decisions](docs/00-decisions.md) | Confirmed needs, proposed defaults, unresolved choices |
| [Product scope](docs/01-product.md) | Positioning, personas, feature priorities, journeys |
| [Financial rules](docs/02-financial-rules.md) | Money, fees, refunds, budgets, commitments, reconciliation |
| [UX design](docs/03-ux-design.md) | Screens, Arabic RTL, branding, charts, stage timeline |
| [Architecture](docs/04-architecture.md) | Stack, boundaries, deployment and repository structure |
| [Data model](docs/05-data-model.md) | Entities, constraints, relationships and state transitions |
| [API contracts](docs/06-api-contracts.md) | Commands, DTOs, validation, transactions, errors |
| [Security](docs/07-security.md) | Tenant isolation, permissions, file access and audit |
| [Mobile and offline](docs/08-mobile-offline.md) | Capture, outbox, retries, conflicts and device limits |
| [Migration](docs/09-migration.md) | Safe spreadsheet import and cutover |
| [Coding phases](docs/10-coding-phases.md) | Dependency-ordered implementation with acceptance gates |
| [QA](docs/11-acceptance-tests.md) | Traceable tests, launch criteria and regression matrix |
| [Operations and SaaS](docs/12-operations-saas.md) | Billing boundaries, backups, support, cost controls |
| [Evidence and risks](docs/13-evidence-risks.md) | Sources, limitations, launch decisions |
| [Screen layouts](design/screen-layouts.md) | Concrete responsive component arrangements |
| [API schemas](contracts/core.schema.json) | Machine-readable request and dashboard shapes |
| [Financial fixtures](fixtures/financial-cases.json) | Synthetic acceptance examples, not real client records |
| [Phase prompts](prompts/phase-prompts.md) | Prompts for continuing implementation |
| [AI capture and insights](docs/14-ai-capture-and-insights.md) | Photo-to-draft entry, easy-entry principles, rich client and management presentation |


### Data policy

No real client names, source spreadsheets, receipts, addresses or financial transactions belong in this repository, its history, seeds, test logs or previews. Private migration inputs stay outside Git (`private-inputs/` is ignored).
