// Client dashboard DTO (docs/06-api-contracts.md). Only approved aggregates and
// published content; no ledger rows, vendors, receipts or private notes.

import type { CurrencyCode } from "@/lib/money/currency";

export type QualityFlag = "budget_missing" | "progress_not_recorded" | "cash_history_incomplete";

export type StageStatus = "unknown" | "not_started" | "in_progress" | "blocked" | "completed" | "skipped";

export interface ClientStageDto {
  stable_stage_key: string;
  order: number;
  /** Null means the studio has not named the stage; the UI shows "Stage N". */
  name: string | null;
  status: StageStatus;
  progress_bps: number | null;
  planned_start: string | null;
  planned_end: string | null;
}

export interface CategoryTotalDto {
  category_id: string;
  name: string;
  color_group: "materials" | "labor" | "structure" | "mep" | "metal" | "finishes" | "carpentry" | "other";
  /** Signed cost base C + D for this category; can be negative after refunds. */
  cost_base_minor: string;
}

export interface ClientDashboardDto {
  schema_version: 1;
  project: { id: string; display_name: string; currency: CurrencyCode; timezone: string };
  brand: { display_name: string; logo_file_id: string | null; accent: string | null };
  financial_revision: number;
  financial_as_of: string | null;
  progress_revision: number;
  progress_as_of: string | null;
  financials: {
    funding_received_minor: string;
    company_paid_cost_minor: string;
    client_direct_paid_cost_minor: string;
    management_fee_minor: string;
    funds_remaining_after_fees_minor: string;
    recorded_project_cost_minor: string;
    budget_cost_base_minor: string | null;
    cash_proxy_minor: string | null;
    cash_proxy_unavailable_reason: string | null;
  };
  progress: {
    overall_bps: number | null;
    unavailable_reason: string | null;
    active_stage_ids: string[];
    stages: ClientStageDto[];
  };
  category_totals: CategoryTotalDto[];
  undated_cost_minor: string;
  quality_flags: QualityFlag[];
}
