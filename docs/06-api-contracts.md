# API and command contracts

## Conventions

Use `/api/v1` for explicit HTTP endpoints needed by mobile sync or integrations. Internal server actions may call the same domain command layer; do not maintain two independent business implementations. Verify session and authorization at every entry point, including server actions. JSON requests use UTF-8, ISO dates and decimal-string minor units. Standard identifiers are UUIDs, never row numbers.

Organization/project context comes from route parameters and is verified against the authenticated user and every referenced record. Do not accept `actor_id`, `approved_by`, trusted totals, organization role or server timestamps from the browser.

Mutation requests carry `Idempotency-Key: <UUID>` and, when changing an existing object, `expected_version`. A repeated key with identical canonical payload returns the original result; a repeated key with different payload returns 409. Financial idempotency receipts persist with the financial record, not a short TTL that allows a long-offline device to duplicate it. Upload tickets can have shorter expiry because final attachment registration also uses a durable client ID.

Money values are strings such as `"10025"`, not JSON numbers. Currency is a three-letter allowlisted code; the proposed initial two-decimal allowlist is EGP, USD, EUR, AED and SAR, with EGP used for synthetic examples only. Limit absolute entry amount to 99999999999999 minor units in MVP and validate database overflow for aggregate operations. Rate basis points are integers from 0 to 10000. Percentage input is translated to basis points explicitly; `25` percent means 2500, not 25.

## Endpoint catalogue

Paths below omit the common `/api/v1` prefix. `O` and `P` denote UUIDs, not literal strings.

| Method and path | Command/read | Authorized actor |
| --- | --- | --- |
| POST `/organizations` | Create organization and owner membership atomically | Authenticated verified user, rate-limited |
| POST `/organizations/O/invitations` | Invite staff or scoped client | Owner; manager only assigned-project clients if delegated later |
| POST `/invitations/accept` | Consume token and grant intended access | Authenticated identity matching invitation policy |
| POST `/organizations/O/projects` | Create project and initial financial state | Owner |
| PATCH `/organizations/O/projects/P` | Update allowed project metadata | Owner; manager limited fields |
| GET `/organizations/O/projects/P/costs` | Staff paginated ledger | Assigned authorized staff |
| POST `/organizations/O/projects/P/costs` | Create draft | Assigned engineer, finance, manager, owner |
| PATCH `/organizations/O/projects/P/costs/id` | Edit own eligible draft with version | Author, or owner with reason |
| POST `.../costs/id/submit` | Validate required fields and receipt policy | Author |
| POST `.../costs/id/withdraw` | Return submitted record to draft | Author before approval |
| POST `.../costs/id/approve` | Atomic review, fee snapshot, totals and audit | Finance or owner under self-approval policy |
| POST `.../costs/id/reject` | Reject with reason | Finance or owner |
| POST `.../costs/id/correct` | Void and replacement in one transaction | Owner |
| POST `.../costs/id/refunds` | Draft a linked actual refund | Finance or owner; engineer may request via normal draft flow |
| POST `.../funding` and `.../fee-withdrawals` | Draft financial movement; same submit/review actions | Finance or owner |
| POST `.../fee-rules` | Create/activate reviewed future rule version | Owner |
| POST `.../budgets` and `.../budgets/id/approve` | Create/approve budget version | Finance drafts; owner approves |
| POST `.../estimates` and `.../commitments` | Planning entries with separate approval rules | Manager, finance, owner |
| POST `.../stage-plans` and `.../stage-plans/id/approve` | Create/approve stage plan revision | Manager drafts; owner approves |
| POST `.../stage-updates` | Submit physical progress proposal | Assigned engineer or manager |
| POST `.../stage-updates/id/publish` | Validate and publish update | Manager or owner |
| POST `.../site-updates` and `.../site-updates/id/publish` | Draft/publish narrative and selected photos | Staff draft; manager/owner publish |
| POST `.../uploads/prepare` | Issue bounded private upload ticket | Actor allowed to attach to target |
| POST `.../uploads/id/complete` | Verify stored object and register metadata | Ticket owner with current permission |
| GET `/files/id/content` | Authorize and deliver file | Staff or explicitly permitted client-safe publication |
| GET `/portal/projects/P` | Safe dashboard DTO | Active client grant or authorized staff preview |
| GET `/portal/projects/P/updates` | Published safe updates only | Same scoped access |
| POST `.../imports/preview` | Parse/map/validate privately | Finance or owner |
| POST `.../imports/id/commit` | Approve reviewed import with preview hash | Owner |
| POST `.../exports` | Create scoped export job | Owner or permitted finance staff |
| GET `.../audit` | Paginated project audit | Owner; finance/manager limited appropriate events |
| POST `/sync/commands` | Bounded list of ordinary draft commands | Authenticated actor; each item independently checked |
| POST `/billing/webhooks/provider` | P1 verified external billing event | Valid provider signature, not browser session |

Endpoint prefixes abbreviated with `...` mean `/organizations/O/projects/P`. Do not implement wildcard authorization based on this notation. For every implemented endpoint, add a full OpenAPI contract and explicit permission tests during its phase. Billing, commitments settlement and advanced exports may be deferred according to feature priority.

## Cost draft example

```json
{
  "client_record_id": "3e51b43e-5068-46a4-b815-d6bceef81001",
  "payer": "company",
  "kind": "payment",
  "amount_minor": "10025",
  "currency": "EGP",
  "occurred_on": "2026-10-01",
  "description": "مواد كهرباء",
  "category_id": "3e51b43e-5068-46a4-b815-d6bceef81002",
  "fee_eligible": true,
  "attachment_ids": [],
  "missing_receipt_reason": "طلب نسخة من المورد"
}
```

This creates a draft, never an approved entry. `fee_eligible` is a proposal constrained by the selected project rule; approval snapshots the authorized value and rule version. A direct purchase uses `payer = client_direct`. A refund also supplies `refund_of_id` and must satisfy same-project constraints.

### Approval command

```json
{
  "expected_version": 3,
  "review_note": "Checked against receipt",
  "owner_override_reason": null
}
```

The response returns record ID, status, new version, financial revision and safe refreshed summary. Submission stores the server-resolved proposed_fee_rule_id. If the project fee rule changed since submission, return a review-needed conflict with the proposed fee effect rather than silently accepting an old UI preview. A reviewer refresh/reconfirm action updates that proposal with a version check and audit, then approval snapshots it; actual refunds retain the original cost's rule regardless of current settings.

## Client dashboard DTO

```json
{
  "schema_version": 1,
  "project": {"id": "3e51b43e-5068-46a4-b815-d6bceef81003", "display_name": "Demo Apartment", "currency": "EGP", "timezone": "Africa/Cairo"},
  "brand": {"display_name": "Demo Studio", "logo_file_id": null, "accent": "#4B5FA8"},
  "financial_revision": 7,
  "financial_as_of": "2026-10-01T08:00:00Z",
  "progress_revision": 0,
  "progress_as_of": null,
  "financials": {
    "funding_received_minor": "15000000",
    "company_paid_cost_minor": "10000001",
    "client_direct_paid_cost_minor": "2000002",
    "management_fee_minor": "2160001",
    "funds_remaining_after_fees_minor": "2839998",
    "recorded_project_cost_minor": "14160004",
    "budget_cost_base_minor": null,
    "cash_proxy_minor": null,
    "cash_proxy_unavailable_reason": "incomplete_withdrawal_history"
  },
  "progress": {"overall_bps": null, "unavailable_reason": "stage_weights_missing", "active_stage_ids": [], "stages": []},
  "category_totals": [],
  "monthly_costs": [],
  "undated_cost_minor": "0",
  "quality_flags": ["budget_missing", "progress_not_recorded"],
  "latest_updates": []
}
```

No client email, bank detail, vendor identity, original import row, receipt path, private note or internal audit body belongs in this DTO. The example has empty chart arrays for brevity; real arrays must reconcile to their documented totals. Category and monthly charts use cost base C + D; the UI explicitly labels this and never includes management fees in those series. Each monthly bucket contains company/direct components and an ISO month key. Undated values remain a separate bucket. Filters clearly state whether cards remain all-time while the chart is filtered.

## Validation and failure semantics

Descriptions 1–500 Unicode characters; category names 1–80; notes maximum 2000; project names maximum 120. Normalize whitespace for validation without rewriting original business text. Reject invalid enums, unknown fields on financial commands, negative magnitude, unsupported currency, impossible dates, unauthorized IDs and attachments not in ready/clean state. Future paid dates require an owner-reviewed warning, not silent acceptance as ordinary history.

| HTTP | Code | Client action |
| --- | --- | --- |
| 400/422 | VALIDATION_ERROR | Show field-level localized messages; keep draft |
| 401 | SESSION_EXPIRED | Reauthenticate; preserve user-scoped local draft |
| 403 | FORBIDDEN | Stop retries; no unauthorized metadata |
| 404 | NOT_FOUND | Same external response for absent/inaccessible project object |
| 409 | VERSION_CONFLICT | Fetch current safe state; explicit review, never last-write-wins |
| 409 | IDEMPOTENCY_CONFLICT | Do not retry under a fresh key automatically |
| 409 | FEE_RULE_CHANGED | Reviewer reconfirms updated fee effect |
| 413 | UPLOAD_TOO_LARGE | Compress/select smaller file before retry |
| 429 | RATE_LIMITED | Bounded backoff and retry-after |
| 503 | TEMPORARY_UNAVAILABLE | Preserve queue; jittered retry |

Response errors use `{error:{code,message_key,fields?,request_id}}`; never include SQL, stack traces, storage keys or another tenant's values. Context-dependent permission errors may use 404 to avoid enumeration. Every financial transaction uses a fixed lock order: project financial state, target/original records, commitment records ordered by ID, then projections and audit. Test concurrent approvals, refunds and duplicate retries with real database connections.

## Upload and job protocol

Prepare validates actor/target, declared MIME and size, then generates a random object key under the authorized organization/project prefix. Default maximum 10MB per receipt/photo, 5 attachments per cost and 20MB per CSV import; treat these as configurable product limits. Complete verifies bytes, magic signature, checksum and size, not just browser MIME. Quarantine until validation/scan succeeds. A failed attachment does not magically become submitted evidence.

Email/export jobs are created through transactional outbox events with an immutable payload reference, not by making an external network request in the financial transaction. Workers deduplicate delivery, use bounded retries and route persistent failures to an operator queue. Never put full project financial details in an email link or public job log.
