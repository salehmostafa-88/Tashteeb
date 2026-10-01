# Spreadsheet migration and cutover

## Source stance

The prior Google Sheet is a discovery source and future import candidate, not the production database for the SaaS. It contains historical costs, client funding, direct purchases, fee assumptions, estimates and incomplete progress information. Never import dashboard display cells as the ledger. No source workbook or real client row is included in this repository pack.

The existing sheet remains unchanged by this handoff. The separate private migration appendix records known historical reconciliation targets and cautions. Treat those as the prior reviewed snapshot, not a fresh live read.

## MVP import route

Support UTF-8 CSV upload with explicit column mapping. Export original tabs independently, preserve the source file privately, and import one data kind at a time: costs, funding, direct costs and planning. Optional XLSX import is P1 unless the pilot cannot produce CSV. Do not execute spreadsheet formulas or macros. Source formulas and their cached values may be retained as text provenance for reviewer inspection; if the numeric result is unavailable, flag the row rather than attempting arbitrary formula evaluation.

CSV imports create a staged batch, not immediate approved financial records. Detect delimiter, encoding and headers conservatively, with a visible preview. Provide a reusable mapping template only after the owner reviews the first mapping.

## Mapping rules

| Source meaning | Target | Treatment |
| --- | --- | --- |
| Company expense | cost_entries with payer company | Preserve signed meaning; normalize negative values as refund magnitude |
| Direct client purchase | cost_entries with payer client_direct | Never funding receipt; unknown category stays explicit Uncategorized |
| Client transfer to firm | funding_receipts | Missing date stays null with flag |
| Fee percentage | fee_rule_versions | Explicit owner confirmation; do not infer from color or label alone |
| Fee already withdrawn | fee_withdrawals | Import only documented amounts; absence is not zero |
| Possible future expense | estimates | Exclude from actuals and accrued fees |
| Approved unpaid agreement | commitments | Require evidence/owner classification; not an estimate by default |
| Budget | budget_versions and items | Only if approved basis and total are known |
| Stage percentage | stage_updates | Only verified physical progress; do not use spending ratios |
| Original row and ID | import_rows provenance | Stable source ID plus batch/file/row reference |

Original Arabic text remains unchanged. Normalize category aliases into separate mappings, never rewrite the only original value. Keep unrecognized categories visible for review. Preserve currency and time interpretation separately from raw values. Source row numbering gaps are not evidence of missing transactions unless reconciled with the source.

## Import workflow

1. Export and retain the original source snapshot and checksum. Confirm project currency and fee basis.
2. Parse without evaluating formulas, then select data kind and map columns.
3. Display counts, accepted/rejected/warning rows, signed sums, date range, missing dates, negative values, unknown categories, missing receipts and duplicate candidates.
4. Distinguish exact duplicates by stable source fingerprint/row key from possible duplicates by date+amount+description. Do not delete legitimate repeated purchases automatically.
5. Review suspicious dates without guessing. Mixed day/month formats require explicit interpretation; preserve the raw token and normalized value.
6. Confirm how historical refunds link to original costs, or record an owner-reviewed historical exception.
7. Produce a reconciliation preview using canonical financial formulas, not source dashboard totals alone. Explain rounding differences exactly.
8. Owner approves a fixed preview hash and batch version. If source/mapping changes, require a new preview and approval.
9. Commit the batch transactionally or in a controlled staging promotion that cannot expose partial totals. Preserve source-to-target IDs and import audit events.
10. Re-run reconciliation and export a signed-off report. Repeating the same batch/rows must not create new financial entries.

Imported rows may be approved without historic receipt images only when the owner explicitly accepts the missing-evidence exception. The dashboard carries a completeness flag; a migration does not manufacture receipts or reviewer history. Historical approvals identify the importing reviewer and import date, not an invented original approval date.

## Known prototype risks to guard against

The earlier spreadsheet evolution placed stage inputs near planning/estimate ranges. A broad SUM can accidentally include date serial numbers as money. Import actual typed source blocks, not broad untyped columns. Validate start and end column mapping independently. The application solves this structurally with separate money, date and progress columns/tables.

Treat the spreadsheet's formula-driven timeline and default statuses as unverified until the studio supplies actual progress. A placeholder “not started” is not evidence that an active project has not begun. Defaults migrate as unknown unless confirmed.

## Cutover and rollback

Run a dry import in staging using controlled private access. Compare record counts, payer totals, funding, fee groups, refund effects and remaining funds to the reviewed source. Approve a specific cutover timestamp. From cutover, enter new data in one system only; keep the source sheet read-only/archive under the owner's existing sharing policy. This document does not authorize changing its sharing.

Before cutover take database and object backups and record the import batch IDs. If validation fails before users begin new work, roll back the staged batch under the tested runbook. If new work exists, do not delete the whole database; use batch-specific reviewed reversals/corrections or restore into an isolated recovery environment and reconcile the delta. Document exactly which financial revision clients saw.

No two-way Google Sheets synchronization in MVP. Later integration requires separate OAuth scope, conflict policy, row identity and source-of-truth decisions; it is not a quick extension of CSV import.
