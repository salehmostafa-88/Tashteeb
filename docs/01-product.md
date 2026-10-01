# Product scope and requirements

## Product promise

A small studio records what happened once. Its client sees an understandable, branded account of spending and site progress without navigating an accounting ledger. The product combines reliable financial administration with restrained architectural presentation. It must not become a general ERP to satisfy edge cases.

The first release supports a studio managing client-funded fit-out works. A pure architectural practice charging retainers and tracking billable hours is adjacent, but is not the same initial financial workflow. Do not claim full Monograph equivalence.

## Personas

| Persona | Main job | Essential interface |
| --- | --- | --- |
| Owner | Set up projects, trust balances, invite people, review exceptions | Project portfolio and review queue |
| Finance staff | Record payments, check expenses and receipts, reconcile imports | Filterable tables with side-panel forms |
| Project manager | Track stages, publish site updates, see approved costs | Project workspace and timeline editor |
| Site engineer | Record a purchase or site update while on site | Phone form with large controls and draft recovery |
| Client | Understand current stage, spending, funding needs and recent work | Branded read-only visual portal |
| SaaS operator | Operate subscriptions and service health | Minimal operations console, no automatic content access |

## Priority definition

P0 is required for a usable controlled pilot. P1 is required for a robust commercial release unless explicitly deferred in a signed launch decision. P2 is later expansion. A scaffold or disabled button does not count as the feature.

| ID | Feature | Priority | Completion evidence |
| --- | --- | --- | --- |
| F01 | Organizations, members, invitations and project assignments | P0 | Two tenants cannot access each other's data |
| F02 | Arabic and English navigation, forms, errors, exports | P0 | RTL and LTR tests and native Arabic review |
| F03 | Projects, category templates, parties and one project currency | P0 | New project setup works without a spreadsheet |
| F04 | Paid company costs, direct purchases and linked refunds | P0 | Exact financial fixtures pass |
| F05 | Funding receipts, returns and fee withdrawals | P0 | Cash proxy and fee reserve remain distinct |
| F06 | Draft, submission, approval, rejection and corrections | P0 | No unapproved amount changes client totals |
| F07 | Private receipt attachment and exception reason | P0 | Upload, retry and access tests pass |
| F08 | Simple desktop ledger tables and phone capture form | P0 | Basic staff complete scripted entry tasks |
| F09 | Stage templates, timeline, weights and progress history | P0 | Unknown progress cannot become a false zero |
| F10 | Branded client dashboard with financial cards and charts | P0 | No staff-only field appears in response payloads |
| F11 | Client-safe photo updates and publication | P0 | Unpublished files cannot be fetched by a client |
| F12 | CSV import with preview, duplicate checks and reconciliation | P0 | Repeat import does not duplicate costs |
| F13 | Local mobile drafts, attachment queue and foreground retry | P0 | Interrupted upload and expired-session tests pass |
| F14 | Approved budget versions and category comparison | P0 | Missing budget shows unknown, not zero |
| F15 | Estimates and commitments as separate planning records | P0 basic | Not counted as paid actuals or accrued fees |
| F16 | Project audit trail and append-only financial history | P0 | Every approval/correction can be attributed |
| F17 | CSV/JSON owner export and project archive | P0 | Owner can recover own data without a subscription upgrade |
| F18 | In-app review queue and transactional invitations | P0 | No sensitive amounts in email subjects or links |
| F19 | Change requests and client approval records | P1 | Versioned amount/scope decision, not a statutory signature |
| F20 | Commitment settlement and forecast without double counting | P1 | Linked payments reduce outstanding commitments |
| F21 | Automated subscriptions, entitlements and grace periods | P1 | Verified webhook and retry tests pass |
| F22 | Branded printable project summary and scheduled digest | P1 | Arabic output review and access-scoped generation |
| F23 | Simple snag list, responsibility and handover checklist | P1 | Tasks can close a stage without changing money |
| F24 | Portfolio health and configurable alerts | P1 | No cross-currency total without explicit separation |
| F25 | Native iOS/Android, OCR and bank/accounting integrations | P2 | Separate requirements and cost review |
| F26 | Drawing versions, material selections, procurement catalogs | P2 | Validated demand before implementation |
| F27 | Timesheets, design retainers and fixed-price contracts | P2 | Separate financial model, not renamed fit-out fields |

## End-to-end journeys

### New studio and project

Owner creates an organization, chooses Arabic or English, uploads a logo, sets an accent and invites staff. Owner creates a project with confirmed currency and timezone, fee rate and eligibility rules, category template and six placeholder stages. Budget, dates and progress may remain unknown. Owner assigns a reviewer and invites the client only after checking the client preview.

### On-site purchase

Engineer chooses a cached assigned project, amount, category and short description, takes a receipt photograph and saves. The phone states either “Saved on this device” or “Submitted for review”; these are never synonyms. When online, files upload and the draft submits. A reviewer checks it, approves it, and only then does it affect financial aggregates. The client does not receive an engineer's raw receipt automatically.

### Direct client purchase

Finance staff record an item paid directly by the client to a supplier. This increases the recorded project cost base and may attract the project's management fee, but does not consume company-held funding. The payer distinction is visible before save and cannot be inferred from a vendor name.

### Refund or correction

A real refund is a new negative effect linked to the original approved purchase, using its fee rule. A data-entry mistake is corrected through a void-and-replacement action with a reason, not a fabricated supplier refund. Both preserve the audit trail and recalculate current totals; previously published historical snapshots remain unchanged if snapshot publication is added later.

### Site progress

Engineer submits a stage update and photos. Manager reviews the claim, publishes the stage percentage/status and selects client-safe photos. Multiple stages may be active concurrently. Spending never automatically moves the timeline. If progress is missing, the portal says so.

### Funding conversation

Client sees approved spending, fee reserve and remaining project funding, with a definition and “as of” time. Low balance is a hint, not a payment demand. A funding request is a P1 extension: when explicitly created by the studio, it states its amount and reason; it is not automatically generated from a negative balance or charged to a card.

## Pilot success criteria

These are proposed targets, not measured results: a returning engineer records a standard purchase in under 60 seconds excluding photography; owner sets up a second project in under 15 minutes; a client correctly explains the displayed balance and current stage without help; all accepted financial totals reconcile exactly; no unauthorized cross-tenant read/write succeeds; no accepted offline command is duplicated.

Pilot with the current studio and at least two other small studios with different fee practices before claiming segment fit. Observe real phone entry, Arabic terminology and support effort. Log confusing tasks and failed attempts, not just satisfaction scores. Low subscription fees remain a business hypothesis until hosting, onboarding and support costs are measured.
