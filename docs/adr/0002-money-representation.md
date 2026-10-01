# ADR 0002: Money representation and rounding

Status: Accepted (implements docs/02-financial-rules.md) · 1 October 2026

- Storage: signed `bigint` minor units in Postgres. Application: `bigint`. API: base-10 integer strings (`"10025"`). JavaScript `number` is never used for an amount.
- Currencies: allowlist EGP, USD, EUR, AED, SAR; all exponent 2 in the MVP. One currency per project.
- Rates and progress: integer basis points (1800 = 18 %, 10000 = 100 %).
- Rounding: `roundHalfAwayFromZero(numerator, denominator)` in `src/lib/money/minor.ts`, applied once per fee-rule group. The SQL implementation (Phase 2) must match it and both are tested against `fixtures/financial-cases.json` with an independent oracle.
- Display: `Intl.NumberFormat` is given an exact decimal string built from minor units, never a float.
- Input: `parseAmountInput` accepts Western and Arabic-Indic digits, grouping only in valid groups of three, at most two decimals, and rejects ambiguous forms (`1,5`, `1.250,50`, Arabic comma `،`) so the user corrects them before saving.

Fee-model boundary (owner decision O03): Phase A implements only the percentage-of-paid-actuals model. Project financial logic will sit behind a `financial_model` discriminator so a fixed-price/progress-billing model can be added later as a separate module.
