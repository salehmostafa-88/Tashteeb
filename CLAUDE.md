# Studio Project Portal

Build the Arabic-first small-studio project finance and progress SaaS specified in `docs/`.
This repository started as a specification handoff; see `docs/implementation-status.md` for what exists now.

Next.js version-specific rules: @AGENTS.md

## First session

- Read `README.md`, `docs/00-decisions.md`, and `docs/10-coding-phases.md`.
- Read the domain, data, security and API documents before creating migrations.
- Inventory the repository and preserve existing work. Never overwrite existing configuration blindly.
- Resolve and pin compatible stable package versions; record exact choices in an ADR.
- Implement only the authorized phase. Keep a working vertical slice after each phase.
- Do not treat provisional defaults as business facts or claim tests ran when they did not.

## Nonnegotiable rules

- Arabic and English, RTL and LTR, are first-class from the first screen.
- Staff have tables; the default client portal has charts, milestone cards and approved photos, not a ledger.
- Every project-scoped record belongs to an organization. Database constraints, RLS, server authorization and tests must enforce isolation.
- Never send private fields to a client and rely on CSS to hide them.
- Money uses integer minor units, decimal strings at API boundaries, and explicit rounding. Never JavaScript floating-point arithmetic for financial calculations.
- Company paid costs, client direct paid costs, funding receipts and management-fee withdrawals are different concepts.
- Physical progress is not spend divided by budget.
- Null means unknown, not zero. Never fabricate dates, receipt links, budgets, progress or bank balances.
- Financial approval and corrections are atomic, version-checked, auditable and idempotent.
- No hard deletion or silent editing of approved financial records.
- Offline drafts do not affect totals. Repeated sync must not create duplicate records.
- Never put service-role credentials in browser bundles or ordinary user request paths.
- No production data, client names or receipt images in Git history, seeds, test logs or public previews.
- A PWA is not a promise of native App Store applications or guaranteed background sync.
- No public client links in the MVP. Use authenticated project-specific grants.

## Proposed stack

Next.js App Router, TypeScript strict mode, React, Tailwind CSS, accessible UI primitives, next-intl, Recharts, Supabase Postgres/Auth/private Storage, Zod, IndexedDB through a small adapter, Vitest, Playwright and pgTAP.
Use a modular monolith, not microservices. Author SQL migrations and generate DB types. Prefer explicit SQL and RPC transactions over a second ORM in the first release.

## Working practice

- Use short feature branches and small reviewed commits. Do not push or deploy without authorization.
- Add schema migrations, RLS policies and allow/deny tests in the same change.
- Build business rules as pure typed functions plus an independently tested SQL authoritative implementation.
- Treat `contracts/core.schema.json` as a contract sketch to complete, not as generated production validators.
- Implement the commands listed in the phase plan; do not pretend they already exist.
- Run lint, typecheck, unit tests, database tests, E2E tests and build as appropriate to the phase.
- Record exact commands, results and unrun checks in `docs/implementation-status.md`.
- Stop on destructive migrations, paid-service provisioning, legal/tax assumptions or production operations requiring owner approval.
- Ask narrowly when a missing choice changes the architecture; otherwise use the labeled default and record it.

## Definition of done

A feature includes error, loading, empty and permission-denied states; Arabic copy; mobile behaviour; validation; audit where required; relevant tests; and updated docs. A mocked integration is not complete. Unknown source data stays visibly unknown.

At the end of every phase, report delivered features, migrations, commands executed, test results, screenshots captured, remaining risks and the next phase. Do not mark a phase complete with skipped critical gates.
