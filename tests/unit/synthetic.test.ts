import { describe, expect, it } from "vitest";
import { demoDashboard } from "@/modules/demo/synthetic";

// Independent integer oracle: the placeholder screens must not display numbers that
// contradict the documented formulas, even though the data is synthetic.
describe("synthetic demo dashboard is internally consistent", () => {
  const f = demoDashboard.financials;
  const R = BigInt(f.funding_received_minor);
  const C = BigInt(f.company_paid_cost_minor);
  const D = BigInt(f.client_direct_paid_cost_minor);
  const F = BigInt(f.management_fee_minor);

  it("fee is 18% of C + D rounded half away from zero", () => {
    const raw = (C + D) * 1800n;
    expect(F).toBe((raw + 5000n) / 10000n);
  });

  it("remaining = R - C - F and recorded cost = C + D + F", () => {
    expect(BigInt(f.funds_remaining_after_fees_minor)).toBe(R - C - F);
    expect(BigInt(f.recorded_project_cost_minor)).toBe(C + D + F);
  });

  it("category totals reconcile to the cost base C + D", () => {
    const sum = demoDashboard.category_totals.reduce((acc, c) => acc + BigInt(c.cost_base_minor), 0n);
    expect(sum).toBe(C + D);
  });

  it("unknowns stay null, not zero", () => {
    expect(f.budget_cost_base_minor).toBeNull();
    expect(f.cash_proxy_minor).toBeNull();
    expect(demoDashboard.progress.overall_bps).toBeNull();
    expect(demoDashboard.progress.stages.every((s) => s.progress_bps === null && s.status === "unknown")).toBe(true);
  });
});
