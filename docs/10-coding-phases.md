# Coding phases and delivery gates

## Delivery approach

Build dependency-ordered vertical slices. Phase 0 proves the technical setup; each later phase leaves a runnable application. Use synthetic fixtures until the owner authorizes controlled private migration. Do not generate the whole product in one Claude Code session and call it complete.

No reliable calendar estimate exists before the initial spike. Planning assumption only: an experienced developer working with a coding assistant may need multiple weeks for a controlled pilot and additional weeks for paid-launch hardening. Offline behaviour, Arabic QA, financial edge cases and permission testing are material work. Estimate each phase after its preceding gate, not from generated lines of code.

## Phase 0 Repository and architecture baseline

Tasks P0-01 to P0-05: inspect existing repo; resolve/pin supported package versions and licenses; create Next.js strict TypeScript app; establish Arabic/English layout, styles and test commands; configure local Supabase and synthetic seed; record ADRs for stack, money, auth, deployment and PWA scope.

Create lint/typecheck/unit/build CI with no production secrets. Add the app's README setup instructions and environment validation. Produce one responsive placeholder staff screen and one client shell, clearly synthetic. Implement proposed commands `pnpm dev`, `pnpm lint`, `pnpm typecheck`, `pnpm test:unit`, `pnpm test:db`, `pnpm test:e2e`, `pnpm build`; until implemented they are desired commands, not existing ones.

Exit gate: clean clone installs from lockfile, local app runs, English/Arabic switch works, build and initial tests pass, no secrets in Git, exact versions and local setup are documented. Owner approves proposed stack or records changes. No public deployment required.

## Phase 1 Identity and tenant isolation

Tasks P1-01 to P1-06: organizations and membership; authentication/invitations; projects and assignments; separate client grants; RLS and composite-key constraints; role-aware navigation and authorization tests.

Create two synthetic organizations, two projects per organization, an unassigned internal user, assigned engineer, finance reviewer, owner and two clients. Implement client-safe empty portal reads. Apply policies and grants in the same migrations as tables. Add owner MFA requirement and recovery plan; full production configuration may wait until hardening.

Exit gate: SEC-01 through SEC-07 pass through both API and direct DB/RPC calls; unassigned users are denied; revoked client grants are denied without requiring token expiry; wrong-org foreign keys fail. Login and role navigation work in Arabic. No financial feature proceeds without this gate.

## Phase 2 Financial engine and audit

Tasks P2-01 to P2-08: exact money library; fee-rule versions; cost/payment/refund records; funding and fee withdrawals; state transitions; idempotency and concurrency; safe financial projection; append-only audit.

Implement approval, rejection and owner correction transactions. Implement refund caps and version conflicts. Attach synthetic fixtures to independent application and SQL tests. Create cash-completeness flags and labels; null values must survive API serialization. Test an approved transaction and client aggregate read end to end before adding complex UI.

Exit gate: FIN-01 through FIN-16 pass, including concurrent duplicate approval and refund attempts; portal/staff totals share the same revision; no direct write bypass; no JavaScript number money path. Owner reviews fee definitions and rounding. This gate blocks any real financial import.

## Phase 3 Staff workspace and planning basics

Tasks P3-01 to P3-07: project setup; cost tables and side panels; simple phone online form; funding/withdrawal forms; review queue; category colors; budget/estimate/commitment basics and scoped export.

Add private receipt upload, missing-receipt exceptions, validation/scan states and role-scoped file reads. Implement empty/loading/error and archive states. Engineer sees own entries, not the full ledger. Add simple budget approval and category comparison with clear cost-base definitions. P0 commitments must not be presented as a complete forecast until P1 settlement/forecast features exist.

Exit gate: UX-01 through UX-06, SEC-08 through SEC-11 and FIN planning tests pass. A nontechnical pilot user can create, correct, submit and review a cost without developer help. Source currency and payer are obvious. Upload interruption is recoverable online.

## Phase 4 Progress and branded client portal

Tasks P4-01 to P4-08: stage templates and plan revisions; stage update review; weighted physical progress; mobile/desktop timeline; safe site photos; branded dashboard; client project invitation and preview; accessible Arabic charts.

Implement separate financial/progress freshness, unknown-data states, overlapping stages, negative balances, undated costs and refund-aware charts. Use configurable firm logo and accessible accent. Do not leak raw ledger through client page payload, prefetch, export or image routes. Add a reviewed visual baseline for every primary screen in RTL and LTR.

Exit gate: PROG-01 through PROG-08 and PORTAL-01 through PORTAL-07 pass. Owner signs off desktop and phone screenshots with long Arabic text. Client can explain balance/current stage; no placeholder fake percent. Client's network payload contains only authorized DTO fields.

## Phase 5 PWA and offline capture

Tasks P5-01 to P5-06: manifest/icons/install; minimal service worker; scoped IndexedDB drafts; upload outbox; foreground retry/conflict resolution; logout/storage failure handling.

Reuse normal command API and idempotency. Never make approval available offline. Add sync center with pending items and specific errors. Test on actual iPhone and Android devices or clearly document untested device gates; browser emulation alone cannot close this phase.

Exit gate: MOB-01 through MOB-10 pass, including app closure mid-upload and timeout after successful server commit. No duplicate submitted record; wrong-user drafts never display. Device retention warning and clear-drafts flow work. State exactly which browser/device versions were tested.

## Phase 6 Migration and controlled pilot

Tasks P6-01 to P6-06: CSV mapping; staged validation; source identity/deduplication; reviewed commit; reconciliation report; cutover and batch recovery rehearsal.

Run synthetic import tests before any live source. Owner then supplies private source exports outside Git. Reconcile documented source counts and totals, dates, refunds, fee settings and estimates. Confirm stage dates/statuses manually. Conduct one-studio pilot with staff training and client preview before inviting a live client.

Exit gate: MIG-01 through MIG-07 pass; exact financial reconciliation approved; privacy and publication choices signed off; one week or an owner-selected pilot observation window shows no unresolved critical defects. Record support issues. Do not call the pilot “commercially ready”.

## Phase 7 Production hardening and paid SaaS

Tasks P7-01 to P7-09: observability; backups and restore drill including objects; performance/security review; subscription adapter and webhooks; quotas/grace states; complete export/archive lifecycle; privacy/retention/runbooks; additional studio pilots; dependency/license review.

Add P1 commitment settlement/forecast and change requests only after financial invariants remain stable. Provider-specific billing waits for owner choice and account eligibility. Subscription charges pay for the SaaS, never project funding. Prepare a basic landing/pricing/onboarding flow after the product name and plans are approved.

Exit gate: OPS-01 through OPS-08, BILL-01 through BILL-06 and all critical regression cases pass. Owner approves terms, actual prices, operational costs, legal review and production launch. Backup restore is demonstrated; a paid vendor account is not proof of recovery. Critical security and money correctness gates cannot be waived as cosmetic issues.

## Phase 8 Later product expansion

Validate demand before native apps, OCR, accounting exports, banking, procurement catalogs, drawing approvals, granular custom roles, multiple contract types, design timesheets and advanced analytics. Each gets its own ADR, financial impact analysis where relevant, data migration and tests. Do not expose disabled roadmap modules as if implemented.

## Pull request checklist

Scope and acceptance IDs; screenshots for affected Arabic/English/phone screens; migrations plus rollback strategy; data/permission impact; test commands and results; no real client data; no unreviewed dependencies; documented limitations; updated implementation status. A reviewer verifies the supplied evidence and does not approve solely because generated tests are green.

## Owner checkpoints

After Phase 0 approve stack and repo baseline. Before Phase 2 ends confirm financial contract. After Phase 4 approve the visual design and client visibility. Before Phase 6 authorize migration. Before Phase 7 launch approve paid services, billing, legal/retention choices and deployment. Work may continue on safe synthetic development while a nonblocking choice is pending, but not across a gate requiring new authority.

## Delivery order note (owner decision O11)

Approved order: Phase 0, 1, 2, 3, 4; then a controlled one-off reviewed import of the pilot project (the reconciliation and sign-off parts of Phase 6, run from private inputs outside Git); then an online-capture pilot with on-device draft autosave; then Phase 5 offline outbox and the generic CSV mapping UI from Phase 6, which a second studio needs. Commitments and settlement move to P1. Estimates stay in P0 basic. Every exit gate above still applies to the work it covers.

## Delivery order update (owner decisions O13–O15)

1. Phase 1 identity and isolation, then Phase 2 financial engine, unchanged. Phase 2 adds `origin = ai_capture` and the extraction tables to the schema so AI drafts use the same commands.
2. AI accuracy spike, as soon as the owner approves the provider and supplies private sample images. It is independent of Phases 1–2 and decides whether the capture promise holds for handwritten Arabic before UI investment.
3. Phase 3 staff workspace includes AI capture v1 (F28): photo/screenshot/text to draft, confirmation screen, duplicate detection, usage metering.
4. Phase 4 rich client portal (O15).
5. Phase 4b management analytics (F29) and AI insights (F30).
6. Pilot import, online pilot, then Phase 5 offline outbox and generic CSV import, as in O11.
