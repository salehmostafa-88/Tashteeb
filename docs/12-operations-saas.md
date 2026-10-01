# SaaS operations and commercial design

## Commercial hypothesis

Sell clarity and less administration to small studios, not a large enterprise feature count. Proposed packaging is per studio with an included staff allowance and active-project/storage limits. Client viewers should not incur per-seat charges in the initial hypothesis; client access is central to adoption. Validate limits and willingness to pay through pilots before publishing prices.

Possible plan structure for research: a small Studio plan, a higher-volume Studio Plus plan and a controlled trial. Exact seats, active projects, storage, price, trial duration and support level are owner decisions. Do not hardcode guessed market prices into checkout. Keep a versioned plan configuration and an auditable entitlement service so plans can change without corrupting existing contracts.

## Unit economics and cost control

Monthly contribution per studio = net subscription revenue minus attributable hosting/database/storage/egress/email/monitoring/payment costs and onboarding/support labour. Shared infrastructure cost must be allocated across a realistic number of paying tenants, not an optimistic future scale. Track attachment size, export volume, active users and support minutes. A low nominal subscription can be uneconomic if each studio needs custom spreadsheet cleanup.

Use tenant quotas, image compression, thumbnail derivatives, bounded jobs, sensible retention and a standardized import template. Do not reduce security, backups or data export access to reach a price. No current vendor pricing is assumed; obtain actual quotes or current official plans before launch.

## Subscription boundaries

SaaS subscriptions are payments from the studio to the software provider. Project funding and fees are operational records between the studio and its client. Never charge a client's card because a project balance is low. No marketplace/escrow/project-money processing is in MVP.

Manual trial entitlements are acceptable for controlled pilots, with expiry, reason and audit. Paid launch needs a provider selected for the seller's country/legal entity, settlement currency and recurring-payment capabilities. Do not assume any specific provider supports the owner's circumstances. Build a small provider interface for customer creation, checkout, portal, subscription read and webhook verification only after this choice.

Entitlement states: trial, active, past_due, grace, read_only, cancelled. Grace duration is a configurable owner-approved policy. Downgrades block new over-limit creation rather than deleting projects. Existing client read access and studio export remain available under the documented read-only/retention policy. Rate and storage limits are enforced server-side, including upload preparation.

## Environment and deployment controls

Separate local development, staging and production databases, storage, auth redirect lists, keys and email/billing credentials. Preview deployments use synthetic staging data, never production secrets by default. GitHub Actions runs quality gates with least-privilege tokens and pinned action revisions. Protect the main branch and require review for auth, financial, schema and billing changes.

Migrations are versioned and forward-tested. Before production migration, rehearse on a representative staging database and document rollback/forward-fix strategy. Use expand-and-contract changes when a rolling app deployment could encounter both schemas. Destructive migrations need explicit owner approval and a verified backup. Never reset production to make a migration pass.

## Backups and recovery

Proposed pilot recovery objectives: RPO up to 24 hours and RTO up to 8 hours, subject to the selected paid infrastructure and a demonstrated restore drill. These are goals, not promises. More demanding objectives require costed PITR/object-versioning choices.

Back up database and Storage objects separately. Supabase database backups do not contain stored file bytes. Keep a manifest of file IDs, storage keys, checksums and relationships so recovery can reconcile metadata with objects. Protect backups with restricted access and encryption supported by the selected provider; avoid exporting production data to a developer laptop for convenience.

Run a restore drill before pilot cutover and periodically thereafter: restore into an isolated environment, verify record counts and financial fixtures/reconciliations, retrieve sample receipts/photos, run authorization tests, measure elapsed time and record gaps. A successful backup job without a restore test is insufficient.

## Observability and support

Collect error class, route, latency, anonymous correlation/request ID, job status and bounded operational identifiers. Exclude client descriptions, amounts, receipt images and auth tokens from generic telemetry. Maintain health checks, failed-job queue, storage usage, sync failure rate, projection mismatch count and invitation-delivery failures.

Alert on repeated failed financial commands, projection reconciliation mismatch, elevated auth errors, broken upload completion, queue backlog and failed backups. Alerts go to an explicitly configured operator; the implementation must not guess email recipients. Provide in-app support context with request ID and safe diagnostic fields rather than screenshots containing private financial details by default.

Pilot onboarding includes organization setup, one sample project, a short Arabic guide, engineer capture training, reviewer training, client preview and a contact for errors. Measure support effort so product pricing reflects reality. Do not promise around-the-clock support without staffing.

## Retention, export and exit

Owner can export project costs, funding, fees, budgets, stage history, categories, audit references and an attachment manifest. Full attachment export is a protected asynchronous job with short-lived download access, not a public bucket. CSV monetary columns include currency and precision definitions. Provide machine-readable JSON as well as user-friendly CSV.

Archive keeps history read-only. Subscription cancellation does not erase project data immediately. Before production publish an approved policy for inactive organizations, financial evidence retention, client access, deletion requests and backup expiry. Legal/privacy/tax obligations require appropriate professional review for the selected market; this document does not establish compliance.

## Product analytics

Track privacy-minimized events: project_created, draft_saved, cost_submitted, review_completed, sync_failed, portal_opened and import_completed. Avoid logging financial values or descriptions. Evaluate entry time, review turnaround, missing-evidence rate, sync reliability, client comprehension, active projects, repeat studio use and support burden. Feature usage alone does not prove willingness to pay.
