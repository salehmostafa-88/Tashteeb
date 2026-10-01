# Continuing prompts for Claude Code

Use one prompt per approved phase. Read the actual implementation status before proceeding. If an earlier critical gate is incomplete, close it first rather than hiding the gap.

## Phase 1

```text
Implement Phase 1 from docs/10-coding-phases.md. Read the data model and security contracts. Build organizations, membership, invitations, project assignments, client grants and scoped navigation. Use two synthetic tenants and test authorized and unauthorized access through both HTTP and direct database/RPC calls. Add composite foreign keys, explicit grants and RLS in the same migrations. Do not proceed to financial features until the isolation gate passes. Report exact evidence and update implementation status.
```

## Phase 2

```text
Implement Phase 2. Read docs/02-financial-rules.md in full and use the synthetic fixture expectations independently in application and database tests. Build exact minor-unit money handling, fee versions, costs/direct purchases/refunds, funding, fee withdrawals, approval/correction commands, idempotency, locking, audit and safe client totals. No floating-point money, no cost-derived physical progress and no unknown-to-zero coercion. Test concurrent approval and refund races with real transactions. Stop for review at the financial gate.
```

## Phase 3

```text
Implement Phase 3 using the approved financial command layer. Build the simple staff workspace, review queue, online phone capture, private receipts, category colors, budget/planning basics and scoped exports. Follow the role matrix exactly. Approved money is not directly editable. Add Arabic/English, keyboard and responsive states, receipt exceptions and safe upload validation. Demonstrate one complete create-submit-review-client-summary journey. Report tests and screenshots.
```

## Phase 4

```text
Implement Phase 4 from the UX and screen-layout contracts. Build a branded, graphical client portal with no raw ledger payload, six editable unknown-default stages, reviewed progress, weighted overall completion, overlapping-stage display and published site photos. Keep financial and progress freshness separate. Test unknown budget/progress, negative balance, negative category costs and missing dates. Show phone and desktop RTL/LTR screenshots and obtain design review before calling the phase complete.
```

## Phase 5

```text
Implement Phase 5 using docs/08-mobile-offline.md. Add installable PWA support, static-only service-worker caching, per-user IndexedDB drafts, private attachment outbox, durable idempotency and foreground/manual retry. No offline approval. Test response loss after a successful commit, app closure, expired sessions, different-user login, storage failure and revoked project access. Distinguish emulated tests from real-device evidence and leave untested device gates open.
```

## Phase 6

```text
Implement Phase 6 with synthetic CSVs first. Add mapping, staged validation, duplicate detection, provenance, fixed preview hashes, reviewed commit and exact reconciliation. Do not import live data until I explicitly provide and authorize a private source export. Do not put source data in Git. Demonstrate repeated-import idempotency, missing-date preservation, actual-versus-estimate classification and cutover/rollback rehearsal. Report unresolved source assumptions before any pilot data approval.
```

## Phase 7

```text
Implement the authorized portions of Phase 7. First close security, backup/object-restore, observability and export gates. Propose provider-specific billing only after I confirm the seller entity, country, provider, price and plan limits. Keep SaaS billing separate from project funds. Test webhook signature verification, retries, out-of-order events, grace/read-only states and limits without deleting customer data. Do not provision paid services or deploy production without approval. Deliver a release checklist with honest evidence and open issues.
```

## Independent review prompt

```text
Review the current implementation against the specifications and acceptance tests. This is an audit request, not permission to rewrite the application. Trace actual code paths for money, authorization, storage and offline sync; inspect direct database/RPC access, not only the UI. Identify contradictions, missing tests, fake integrations and unsafe defaults with file references and reproduction steps. Separate critical release blockers from improvements. Do not claim compliance from passing generated tests alone.
```
