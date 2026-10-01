# Financial rules and invariants

This is an operational project-funds model, not statutory accounting advice or a general ledger. Confirm its fit with each studio's contract before live use. All numbers in the repository examples are synthetic.

## Representation

Store amounts as signed 64-bit integer minor units in Postgres. A two-decimal currency amount of 100.25 is 10025 minor units. API amounts are base-10 integer strings so JavaScript cannot silently lose precision. Parse and calculate with BigInt or an explicitly configured decimal library. Rates are integer basis points: 18 percent is 1800 basis points. Progress uses integer basis points from 0 to 10000, unrelated to money.

MVP supports only an explicit allowlist of two-decimal currencies. One project has one currency, locked after the first approved financial entry; correction then requires a controlled migration. Cross-currency dashboard totals are prohibited. Dates use a database `date` for occurrence and UTC timestamps for audit. Project timezone defaults to Africa/Cairo and is configurable. An undated historical row is valid only with import provenance and a missing-date flag.

## Approved actuals

A cost record means money already paid for project work or goods. It is not an unpaid supplier invoice. Store `payer = company | client_direct`, `kind = payment | refund`, positive `amount_minor`, fee eligibility, category, occurrence date and approval state. Derive signed effect as +amount for a payment and −amount for a refund. A refund links to an original approved cost with the same organization, project, currency and payer. A historical refund without a resolvable original needs an owner-reviewed import exception and original source reference.

Only `approved` costs contribute to actuals. Draft, submitted, rejected and voided costs contribute zero. Historical imports become approved through an explicit reviewed import operation and retain `origin = import` and evidence quality; an import is not an automatic quality endorsement. No generic adjustment type that bypasses these rules is allowed.

`funding_receipts` represent client transfers into project funds held by the studio. A returned funding payment has negative effect and links to the original receipt. They are not supplier costs. `fee_withdrawals` represent management fees actually taken from those project funds and can have linked returns. They reduce a cash proxy but do not add a second management fee to economic cost. Fees paid to the firm outside the project-funds account are out of MVP scope; flag for review rather than misclassifying them.

## Authoritative formulas

Let C = signed approved company paid costs, D = signed approved direct client paid costs, R = signed approved funding receipts, W = signed approved fee withdrawals. Let G identify immutable fee-rule versions attached to costs.

For each group g, B_g is the sum of signed approved fee-eligible cost minor units assigned to g. Both payer types may be eligible according to that group's stored rule. An eligible refund uses the original cost's group even if the current fee rate has changed.

```text
F_g = round_half_away_from_zero(B_g × rate_basis_points_g / 10000)
F   = sum(F_g)
recorded_cost_base          = C + D
recorded_project_cost       = C + D + F
funds_remaining_after_fees  = R − C − F
funds_before_fee_reserve    = R − C
cash_proxy                 = R − C − W
fee_balance                = F − W
```

F is calculated/accrued management fees under this product's contract model, not proof of a tax invoice or payment. `funds_remaining_after_fees` reserves the full calculated fee regardless of whether it has been withdrawn. It is not a verified bank balance. If fee withdrawals are incomplete or unknown, cash proxy and fee balance must be null with a reason. Even when complete, label the result “Recorded cash movement balance”, not “Bank balance”. MVP does not reconcile bank statements.

Do not subtract D from company-held funds: the client already paid D directly. Do not add D to funding receipts. Do not subtract W again from `funds_remaining_after_fees`; F already reserves fees. Negative remaining funds are allowed and shown as a funding shortfall, never clipped to zero.

### Rounding policy

Round once per fee-rule group after summing its eligible paid actuals, then sum group fees. Never round each cost's fee and sum those values. For negative values round the absolute rational value and restore the sign, so half-unit ties move away from zero. Recompute totals transactionally from canonical records. Do not rely on spreadsheet floating-point artifacts.

Changing the current fee rule creates a new version for future approvals. A draft displays the proposed rule and receives an immutable rule snapshot when approved. Retroactively rebasing approved entries is a separate owner-only reviewed correction, out of the initial UI; do not silently change past fees. The live project's current aggregate may change when refunds or corrections are approved, and the event must be auditable.

### Synthetic acceptance example

| Measure | Amount in EGP |
| --- | ---: |
| Company paid costs C | 100000.01 |
| Client direct paid costs D | 20000.02 |
| Client funding R | 150000.00 |
| Fee base with both eligible | 120000.03 |
| Fees F at 18 percent | 21600.01 |
| Remaining after fee reserve | 28399.98 |
| Recorded project cost | 141600.04 |
| Cash proxy with unknown withdrawals | Unknown |

An additional approved company expense of 100.00 adds 18.00 in fees and reduces remaining funds by 118.00 in this example. The same expense in draft or submitted state changes neither. An additional eligible direct purchase of 100.00 reduces company-held available funds only by its 18.00 fee, not by 118.00.

## Refunds and corrections

Serialize refunds against an original payment with a row lock. Sum approved refunds and reject any new refund that would exceed the original paid amount, unless an owner performs a separately specified historical exception. Two concurrent refund approvals cannot both pass on the same remaining refundable amount. Pending refunds show a reservation warning but do not change totals.

A correction transaction locks the original record, verifies expected version, records the correction reason, changes its state to voided and approves a replacement with `supersedes_id`. This transaction is all-or-nothing. Reject correction of a cost with linked approved refunds until the owner resolves the dependent records in an explicit reviewed workflow. A correction is not a new cash event; aggregate totals represent the corrected operational record, and the audit retains both versions. Do not create a negative refund for a typographical correction.

## Budget and planning

A budget is a versioned approved plan, not an actual. MVP budget basis is total project cost base C + D, including any tax embedded in entered paid amounts, excluding management fees. Label that basis in every comparison. Fees may be shown as a separate estimated overlay, never mixed into one series while excluded from another.

Budget items are keyed to stable category IDs. An approved version can contain an explicit unallocated line; its items must sum exactly to the declared total. Incomplete category allocation is not silently padded to zero. New proposed versions do not replace the approved version until approved. Missing budget means null; budget zero is an explicit special case and percentage comparisons become not applicable.

An estimate is a possible future cost. A commitment is an approved agreement not yet fully paid. Neither affects paid actuals or accrued management fees. Commitment payments are linked through allocations to approved costs; allocation cannot exceed either the payment or the commitment's approved amount without an explicit variation. For a basic P0 pilot, outstanding amounts can be recorded with audit and settlement links; the full forecasting and change-request UI is P1.

P1 forecast cost base = actual C + D + unpaid commitment balance + uncommitted estimates. An estimate converted into a commitment is marked converted and excluded from estimates. A payment settling a commitment reduces its unpaid balance in the same transaction. A refund does not automatically reopen a commitment: reviewer specifies whether the obligation was cancelled or remains due. Never add full commitments and their paid invoices to actuals twice.

Fee forecast uses current eligible future-cost assumptions and is labeled an estimate, not accrued fees. Do not offer a single forecast total when required eligibility or planning data is missing.

## Publication and completeness

Financial approvals update client-visible financial aggregates immediately. Client responses contain approved values only, a financial revision, calculation timestamp, last approved entry time and data-quality flags. Receipt images and individual vendor details are staff-only in MVP. Narrative and progress publication is separate from financial approval.

Missing dates are included in overall totals but placed in an “Undated” bucket, never assigned today's date. Questionable dates remain flagged until reviewed. Category refunds can produce a negative category net: use a diverging bar, not an invalid donut segment. Use a donut only when its selected components are nonnegative and the sum is meaningful. A negative remainder uses a separate shortfall card.

## Core invariants

1. Every amount contributing to a total is traceable to an approved record and event.
2. Every contributing record uses the project's currency and organization.
3. The client and staff approved-total summaries reconcile to the same financial revision.
4. Commitments, estimates, funding receipts and fee withdrawals never masquerade as costs.
5. Unknown values are represented as null plus a reason, not zero or a made-up estimate.
6. Approved records are immutable except controlled status transitions through dedicated commands.
7. Financial commands run in one database transaction with authorization, locking, idempotency, revision increment and audit insertion.
8. Physical progress is independent of every financial formula above.
