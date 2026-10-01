# Acceptance tests and launch checklist

## Testing method

Use pure unit tests for money/parsing, database tests for grants/RLS/constraints/transactions, integration tests for commands and DTOs, and Playwright plus real-device testing for journeys. Mocked authentication cannot prove tenant isolation. Browser emulation cannot prove real camera or install support. Screenshots cannot prove correct formulas. Use independent test oracles and inspect payloads, not only visible text.

The handoff fixture checker verifies synthetic examples only. During Phase 2 implement a production application calculation and a database calculation, then run both against the same expected results. Do not compute expected values using the implementation under test. Use integer arithmetic in fixtures and tests.

## Financial tests

| ID | Scenario | Expected result |
| --- | --- | --- |
| FIN-01 | Synthetic baseline in fixture | C 100000.01, D 20000.02, F 21600.01, remaining 28399.98 |
| FIN-02 | Add submitted/draft/rejected cost | Approved totals unchanged |
| FIN-03 | Approve eligible company cost 100.00 | Fees increase 18.00, remainder decreases 118.00 |
| FIN-04 | Approve eligible direct cost 100.00 | Cost base increases 100.00, remainder decreases 18.00 |
| FIN-05 | Approved eligible company refund 100.00 | C decreases 100.00, F decreases 18.00; refund cap enforced |
| FIN-06 | Direct-purchase fee eligibility disabled | D remains cost, contributes no fee in that rule group |
| FIN-07 | Two tiny entries expose rounding difference | Group rounding passes; per-entry rounding does not substitute |
| FIN-08 | Fee rate changes and prior-cost refund follows | Refund uses original rule; new entry uses new rule |
| FIN-09 | Funding below cost plus fees | Negative remainder shown, no clamping or invalid donut |
| FIN-10 | Withdrawal history unknown | Cash proxy and fee balance null with explanation |
| FIN-11 | Known fee withdrawal | Cash proxy changes; recorded project cost and fee reserve do not double count |
| FIN-12 | Correct approved cost | Atomic void/replacement and audit; stale version rejected |
| FIN-13 | Concurrent duplicate approval/retry | One approval, one financial effect, stable returned result |
| FIN-14 | Concurrent refunds exceeding original | Only permitted total succeeds under locking |
| FIN-15 | Estimate, commitment and budget entered | No change in paid actuals/accrued fees; labels clear |
| FIN-16 | Money near configured limit, invalid decimals, currencies | Exact safe arithmetic or explicit validation error; never silent precision loss |
| FIN-17 | Pay part of commitment | Paid actual rises, outstanding falls; forecast does not double count |
| FIN-18 | Category/month grouping including undated refunds | Group sums reconcile exactly to signed cost base |
| FIN-19 | Funding/withdrawal return | Correct signed effect and original cap; no cost record created |
| FIN-20 | Self-approval | Finance denied; owner requires reason, both auditable |

## Security tests

| ID | Scenario | Expected result |
| --- | --- | --- |
| SEC-01 | Tenant A guesses tenant B IDs on API | No data and no write |
| SEC-02 | Same attack through direct DB and RPC | Denied by grants/policies/command checks |
| SEC-03 | Same tenant, unassigned project | Non-owner denied |
| SEC-04 | Client selects staff tables or staff routes | Denied, not merely hidden |
| SEC-05 | Membership/client grant revoked with valid JWT | Subsequent reads and mutations denied |
| SEC-06 | Wrong-tenant category/refund/file foreign key | Database rejects reference |
| SEC-07 | Set actor, approved_by, role or organization in payload | Rejected or server-owned; no escalation |
| SEC-08 | Client fetches unapproved photo/receipt or lists bucket | Denied |
| SEC-09 | Dangerous file type/MIME mismatch/oversize | Quarantined or rejected before delivery |
| SEC-10 | Shared cache, prefetch, SSR hydration and exported data | No private fields or cross-user results |
| SEC-11 | Expired invitation, reused token, open redirect | Denied with safe error |
| SEC-12 | Cross-site state-changing request | CSRF/Origin protection rejects it |
| SEC-13 | Direct update/delete of approved finance or audit | Denied; dedicated correction path only |
| SEC-14 | Logs, bundles, source maps, Git and seeds scanned | No secrets or real client data |

## Progress and portal tests

| ID | Scenario | Expected result |
| --- | --- | --- |
| PROG-01 | Six fresh placeholder stages | Unknown progress/status; no false zero or current stage |
| PROG-02 | Known progress but missing/invalid weights | Overall progress null with reason |
| PROG-03 | Weights 2500/7500; progress 10000/4000 | Overall 5500 basis points, displayed 55 percent |
| PROG-04 | Two in-progress and one blocked stage | All active work represented; not just first match |
| PROG-05 | Completed stage without 100 percent/date | Validation error |
| PROG-06 | Plan dates cross midnight/timezone | Overdue uses project date, no UTC off-by-one |
| PROG-07 | Plan revision skips stage/reweights | Approved revision and audit; history preserved |
| PROG-08 | Engineer submits unpublished progress | Client remains on prior published revision |
| PORTAL-01 | Client inspects network responses | Only whitelisted fields |
| PORTAL-02 | Missing budget or cash history | Unknown state, not zero or bank-balance claim |
| PORTAL-03 | Negative net category or remainder | Appropriate signed bars/shortfall, no negative donut slice |
| PORTAL-04 | Long Arabic title, mixed digits and currency | Correct wrapping and bidi at 360px and desktop |
| PORTAL-05 | Brand logo missing/invalid accent | Clean fallback and contrast-safe color |
| PORTAL-06 | Client grant revoked or project archived | Revoked access blocked; archive read-only |
| PORTAL-07 | One fresh finance update, stale progress | Independent timestamps visible |

## Usability and mobile tests

| ID | Scenario | Expected result |
| --- | --- | --- |
| UX-01 | Standard staff purchase task | Measured completion time and error rate, proposed under 60s returning-user target |
| UX-02 | Keyboard-only form and review | Focus order, errors and dialogs accessible |
| UX-03 | Screen reader and reduced motion | Labels and chart summaries available; motion optional |
| UX-04 | Category row tint and rejected status | Both readable; color not sole signal |
| UX-05 | Arabic/Western numeric input | Correct exact amount preview; ambiguous format rejected |
| UX-06 | Empty/loading/error and permission states | Purposeful recovery with no false save message |
| MOB-01 | Install and camera on real iOS/Android | Tested behaviours documented, fallback usable |
| MOB-02 | Offline draft and app restart | Saved data restored in same user scope |
| MOB-03 | Interrupt upload then retry | No duplicate attachment or submitted cost |
| MOB-04 | Server commits, response lost | Retry returns original result |
| MOB-05 | Session expiry with queued drafts | Reauth without false submission or data loss |
| MOB-06 | Logout then different user | Previous user's drafts never displayed/sent |
| MOB-07 | No background sync support | Manual/foreground sync works |
| MOB-08 | Full/evicted device storage | Explicit failure, no guarantee of lost-data recovery |
| MOB-09 | Access/category changes while offline | Stops or asks for resolution, never silently remaps |
| MOB-10 | Ten queued commands with partial failures | Per-item states and bounded retry; successful items not resent as new |

## Migration, operations and billing tests

| ID | Scenario | Expected result |
| --- | --- | --- |
| MIG-01 | Repeat same source batch | Zero duplicates |
| MIG-02 | Possible duplicate legitimate purchases | Review, not automatic deletion |
| MIG-03 | Missing or ambiguous dates | Raw preserved and flagged, no guessed dates |
| MIG-04 | Arabic CSV, formulas and injection strings | Original text retained safely; formulas not executed |
| MIG-05 | Estimate mixed with actual source rows | Classified separately and excluded from actuals |
| MIG-06 | Preview changes before commit | Stale approval/hash rejected |
| MIG-07 | Controlled cutover/rollback rehearsal | Count and money reconciliation, no partial client publication |
| OPS-01 | Fresh environment from migrations | Deterministic setup and synthetic seeds |
| OPS-02 | Database plus object restore drill | Files downloadable and authorized after recovery |
| OPS-03 | Failed worker/email/export | Retry, deduplication and visible operator error |
| OPS-04 | Load test and slow phone network | Targets measured; failures recorded before launch |
| OPS-05 | Tenant export | Complete scoped data, safe CSV, owner download only |
| OPS-06 | Archive/cancel/retention flow | Read/export policy preserved; no surprise deletion |
| OPS-07 | Deploy regression and rollback | App rollback and database compatibility tested |
| OPS-08 | Alert and incident drill | Owner/operator can detect, contain and communicate incident |
| BILL-01 | Invalid webhook signature | Rejected before mutation |
| BILL-02 | Duplicate/out-of-order webhook | Idempotent state, no duplicate entitlement grant |
| BILL-03 | Subscription limit exceeded | Server-side enforcement; existing project data preserved |
| BILL-04 | Trial expiration/past due/cancel | Defined grace/read-only behaviour, no hidden data loss |
| BILL-05 | Price change or downgrade | Explicit effective date and owner consent where needed |
| BILL-06 | Project funding versus SaaS billing | No shared ledger or accidental payment capture |

## Launch evidence bundle

For each release retain commit SHA, migration versions, pinned dependency list, automated test reports, permission test matrix, real-device browser versions, Arabic/English screenshots, financial reconciliation report, backup restore log, known issues and owner sign-off. Use synthetic or redacted evidence in Git. Sensitive pilot evidence belongs in a controlled private location.

Zero critical security or money defects is a gate. Noncritical visual issues may be accepted only with a named owner and remediation date. “Tests not run” is an incomplete gate, not a pass. Phase completion must state which tests are automatic, manual, simulated or untested.
