# Decisions and assumptions

## What the owner has asked for

The product serves small design and architecture studios running interior fit-out work. It must feel as easy as a spreadsheet for basic staff, support Arabic names and terms without forced translation, allow on-site phone entry, and give clients an attractive graphical project dashboard. It must support each firm's logo. The owner intends to develop it as a SaaS and hand this specification to Claude Code in GitHub.

The worked spreadsheet distinguishes company spending, direct client purchases, client funding payments and an 18 percent management fee. The owner confirmed that the example project's fee applies to both company expenses and direct purchases. This does not establish a universal fee contract for other studios.

The existing project has incomplete dates and documentation and no verified overall budget or physical progress. A migrated total is historical evidence, not proof of correctness. Stage names may remain Stage 1 through Stage 6 until the studio defines its own sequence.

## Proposed defaults that permit implementation

| ID | Decision | Default and rationale | Revisit |
| --- | --- | --- | --- |
| D01 | Initial segment | Small design-and-build or fit-out studios administering client funds | After pilot interviews |
| D02 | Platform | Responsive installable PWA, not native apps at first | If pilots need native capabilities |
| D03 | Language | Arabic default, English switch; original text unchanged | Per organization and user |
| D04 | Currency | EGP for the demo; one currency per project, two-decimal currencies only in MVP | Confirm every imported project |
| D05 | Stack | Next.js and Supabase modular monolith | Phase 0 compatibility review |
| D06 | Fee model | Percentage of eligible paid actuals; organization setup requires an explicit rate; synthetic demo uses 18 percent | Confirm contract per project |
| D07 | Client privacy | Authenticated invitations and explicit project grants; no anonymous sharing | Separate reviewed future feature |
| D08 | Publication | Staff approval feeds current financial aggregates; narrative and photos require publication | Owner may later request snapshots |
| D09 | Stage setup | Six editable unnamed stages, status unknown and progress null; no assumed equal weights | Before useful overall progress |
| D10 | Money precision | BIGINT minor units; basis points for rates; round half away from zero per rule group | Formal finance review |
| D11 | Approval | Finance reviewer or owner approves money; manager or owner publishes site updates | Studio policy pilot |
| D12 | Mobile resilience | Local drafts and explicit foreground sync; no offline approval | Native/offline requirements later |
| D13 | Billing | Manual trial entitlements for pilots; subscription adapter after provider selection | Before charging customers |
| D14 | Project scope | No VAT calculations, statutory invoices, double-entry bookkeeping or FX in MVP | Separate scoped extensions |
| D15 | Import | CSV upload with mapping and preview; no two-way Sheets sync | After migration is proven |
| D16 | Logo and brand | Per-tenant logo and accessible accent; generic SaaS brand separate from pilot firm | Name and identity decision |

## Decisions required before a live pilot

1. Confirm the firm is managing funds on a paid-actuals basis, rather than using accrued invoices or fixed-price revenue recognition.
2. Confirm fee eligibility, treatment of refunds, rate changes and rounding with the firm's contract. The proposed MVP reverses the original fee on eligible refunds.
3. Identify actual reviewers and whether self-approval is permitted. Default: finance staff cannot approve their own submission; owner can override with a reason.
4. Confirm project currency and opening funding/cost history. Do not show a cash proxy as complete until funding, spending and fee withdrawals are attested complete.
5. Choose stage names, approved stage weights and who may publish progress. Progress begins unknown, not not-started or zero.
6. Confirm which photos and budget figures clients may see. Exact financial totals remain inspectable on cards; no hidden ledger is sent to the browser.
7. Approve hosting region, retention policy, privacy terms, email sender and secure support process with appropriate professional review.
8. Approve the data migration reconciliation and cutover date. The previous spreadsheet remains an archive, not a second live source.

## Decisions required before paid launch

Product name and domain; seller legal entity; payment-provider eligibility and settlement country; plan limits and price; tax/invoice responsibilities for the SaaS; customer contract; backup and support commitments. Code must not guess these details or subscribe to paid services on the owner's behalf.

## Scope boundaries

This handoff authorizes a design for a future build, not changes to the live Google Sheet or creation of a GitHub repository. Known risks from the prototype are documented for migration; no live-sheet repair is performed here. Competitor research suggests a focused opportunity, not proof that no competing product exists.

## Owner decisions recorded 1 October 2026

These answers came from the product owner during the specification review. They supersede the matching proposed defaults above. Anything not listed keeps its proposed default.

| ID | Decision | Implementation consequence |
| --- | --- | --- |
| O01 | Generic multi-tenant SaaS from the start. The pilot studio is the first tenant, not a hardcoded identity. | No pilot branding, names or data in code, seeds or fixtures. |
| O02 | Per-studio branding is a core feature, comparable to how general project tools let a workspace present itself to its clients. | MVP: logo, studio display name (Arabic and English), contrast-checked accent, client portal shows the studio brand. Later: studio subdomain, studio email sender, branded PDF summaries. Model the data so these are additive. |
| O03 | Two financial models, delivered in two phases. Phase A: percentage management fee on paid actuals (this specification). Phase B: fixed-price / lump-sum contracts with progress billing, as a separate module after the pilot. | Keep fee logic behind a project `financial_model` boundary so Phase B is an addition, not a rewrite. |
| O04 | The management-fee percentage is editable per project in project settings. | Owner-only settings action creates a new immutable fee-rule version for future approvals; refunds keep their original rule (see financial rules). |
| O05 | Product name is a temporary working name. Do not bake it into code. | One configurable product-name setting; neutral package/identifier names. |
| O06 | Arabic and English with a user switch. Arabic displays Arabic-Indic digits. | `ar` formatting uses the `arab` numbering system for amounts, dates, percentages and chart labels; input accepts both digit sets; CSV/JSON exports always use Western digits. |
| O07 | Typical studio: about four full-time staff (designer, main contractor, accountant, junior) plus project-based talent. | Roles map to owner, manager, finance, engineer. Add a project-only collaborator: assignment-scoped, expiring, capture-only. |
| O08 | Easiest login for now. Later, discourage sharing one account across many devices. | Email + password; owner-generated single-use invite links that can be shared over messaging apps. Record a device identifier on commands/audit now so concurrent-session limits can be added later. Pricing hypothesis: per studio with low-cost field users so sharing saves nothing. |
| O09 | Repository may stay public during the trial; it will go private before commercialisation. | Still no real client data, private appendix or credentials in Git. Licence change is an open owner choice. |
| O10 | Clients may see the calculated management-fee amount. | Shown in the secondary expandable summary of the client portal. |
| O11 | Reordered delivery: Phases 0–4, then a reviewed one-off import of the pilot project, then an online-capture pilot; full offline outbox (Phase 5) and the generic CSV mapping UI follow the pilot. Commitments move to P1; estimates stay. | See the delivery order note in `docs/10-coding-phases.md`. No security or financial gate is relaxed. |

### Specification clarifications accepted with the review

1. A refund inherits payer, fee eligibility, fee-rule version and category from its original cost; it cannot override them.
2. Fee balance requires fee-withdrawal history to be attested complete. Cash proxy requires funding, cost and fee-withdrawal histories all attested complete.
3. A correction's replacement keeps the original cost's fee-rule version.
4. The approval command may adjust category and fee eligibility (audited). Amount or payer changes require rejection.
5. Draft fee eligibility defaults from the project fee rule by payer; only finance or owner may change it.
6. Fee-withdrawal `occurred_on` is nullable with a missing-date flag, like funding receipts.
7. Approving a stage plan offers an explicit, audited "mark remaining stages not started" action. Blocked stages may have null progress.
8. Review screens show the fee-rule group's fee delta, not a per-entry fee.
9. Category cost bars use plain HTML/CSS (native RTL, diverging for refunds); Recharts only for time series with explicit RTL axis handling.
10. Organization creation is operator-gated during the pilot; self-service signup waits for billing.

## Owner decisions recorded 1 October 2026 (second review)

| ID | Decision | Implementation consequence |
| --- | --- | --- |
| O12 | The device/browser language is the default, not Arabic. Supersedes D03 and the Phase 0 "always Arabic" behaviour. | Locale from `Accept-Language`; English when the device is neither Arabic nor English; an explicit switch is remembered in the locale cookie (later: per-user profile preference). |
| O13 | Data entry must be as easy as taking a photo or screenshot. AI reads it (including handwritten Arabic) and prepares the entry; a person confirms. | AI capture moves from P2 (F25 OCR) to P0 as F28. AI output only ever creates a draft for human confirmation, then the normal approval. See `docs/14-ai-capture-and-insights.md`. |
| O14 | Easiest data entry everywhere is a product principle, for site engineers and accountants alike. | Photo-first capture, smart defaults, batch capture, quick text entry, spreadsheet-style draft grid, share-to-app. Each phase's UX gate measures entry effort. |
| O15 | Client presentation is rich: colour, charts, dynamic data. Management presentation is rich in information and analysis, finds gaps and proposes operational improvements. | Rich client portal in Phase 4 (still no invented data). New management analytics with deterministic metrics plus AI-written findings and suggested actions (F29, F30). |

Open owner choices raised by O13/O15 (block the AI features, not other work): approval of a paid AI provider and its API key; studio consent to send receipt images and project metrics to that provider; a private set of sample receipts for the accuracy test.
