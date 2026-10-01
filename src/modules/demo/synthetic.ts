// SYNTHETIC DEMO DATA ONLY. Values reuse the synthetic baseline from
// fixtures/financial-cases.json. No real studio, client or project is represented.
// Removed once Phase 1/2 read models replace the placeholder screens.

import type { CurrencyCode } from "@/lib/money/currency";
import type { ClientDashboardDto } from "@/modules/portal/dto";

export const DEMO_ORG_ID = "demo";
export const DEMO_PROJECT_ID = "3e51b43e-5068-46a4-b815-d6bceef81003";

export interface DemoProjectRow {
  id: string;
  code: string;
  display_name: string;
  currency: CurrencyCode;
  status: "active" | "archived";
  approved_cost_base_minor: string;
  pending_review_count: number;
  last_approved_on: string | null;
}

export const demoProjects: DemoProjectRow[] = [
  {
    id: DEMO_PROJECT_ID,
    code: "DEMO-001",
    display_name: "Demo Apartment",
    currency: "EGP",
    status: "active",
    approved_cost_base_minor: "12000003",
    pending_review_count: 2,
    last_approved_on: "2026-09-28",
  },
  {
    id: "3e51b43e-5068-46a4-b815-d6bceef81004",
    code: "DEMO-002",
    display_name: "فيلا تجريبية — تشطيب كامل",
    currency: "EGP",
    status: "active",
    approved_cost_base_minor: "0",
    pending_review_count: 0,
    last_approved_on: null,
  },
  {
    id: "3e51b43e-5068-46a4-b815-d6bceef81005",
    code: "DEMO-003",
    display_name: "Demo Office Fit-out",
    currency: "USD",
    status: "archived",
    approved_cost_base_minor: "4550000",
    pending_review_count: 0,
    last_approved_on: "2026-03-14",
  },
];

const placeholderStages = Array.from({ length: 6 }, (_, index) => ({
  stable_stage_key: `3e51b43e-5068-46a4-b815-d6bceef8101${index}`,
  order: index + 1,
  name: null,
  status: "unknown" as const,
  progress_bps: null,
  planned_start: null,
  planned_end: null,
}));

export const demoDashboard: ClientDashboardDto = {
  schema_version: 1,
  project: { id: DEMO_PROJECT_ID, display_name: "Demo Apartment", currency: "EGP", timezone: "Africa/Cairo" },
  brand: { display_name: "Demo Studio", logo_file_id: null, accent: "#4B5FA8" },
  financial_revision: 7,
  financial_as_of: "2026-10-01T08:00:00Z",
  progress_revision: 0,
  progress_as_of: null,
  financials: {
    funding_received_minor: "15000000",
    company_paid_cost_minor: "10000001",
    client_direct_paid_cost_minor: "2000002",
    management_fee_minor: "2160001",
    funds_remaining_after_fees_minor: "2839998",
    recorded_project_cost_minor: "14160004",
    budget_cost_base_minor: null,
    cash_proxy_minor: null,
    cash_proxy_unavailable_reason: "incomplete_withdrawal_history",
  },
  progress: {
    overall_bps: null,
    unavailable_reason: "stage_weights_missing",
    active_stage_ids: [],
    stages: placeholderStages,
  },
  // Sums exactly to C + D = 12000003 minor units.
  category_totals: [
    { category_id: "cat-materials", name: "مواد", color_group: "materials", cost_base_minor: "5200001" },
    { category_id: "cat-labor", name: "مصنعيات", color_group: "labor", cost_base_minor: "3100000" },
    { category_id: "cat-mep", name: "كهرباء وسباكة", color_group: "mep", cost_base_minor: "2400002" },
    { category_id: "cat-carpentry", name: "نجارة", color_group: "carpentry", cost_base_minor: "1300000" },
  ],
  undated_cost_minor: "0",
  quality_flags: ["budget_missing", "progress_not_recorded", "cash_history_incomplete"],
};
