import type { CurrencyCode } from "@/lib/money/currency";

export const MEMBER_ROLES = ["owner", "finance", "manager", "engineer", "collaborator"] as const;
export type MemberRole = (typeof MEMBER_ROLES)[number];

export interface Workspaces {
  organizations: { id: string; name: string; name_en: string | null; role: MemberRole }[];
  portal_projects: { project_id: string; display_name: string; organization_name: string }[];
  is_platform_operator: boolean;
}

export interface OrganizationContext {
  id: string;
  name: string;
  name_en: string | null;
  accent_color: string | null;
  timezone: string;
  version: number;
  role: MemberRole;
}

export interface ProjectRow {
  id: string;
  organization_id: string;
  code: string;
  display_name: string;
  currency: CurrencyCode;
  timezone: string;
  status: "active" | "archived";
  created_at: string;
}

export interface MemberRow {
  user_id: string;
  display_name: string;
  email: string;
  role: MemberRole;
  status: "active" | "revoked" | "expired";
  expires_at: string | null;
  project_count: number;
}

export interface InvitationRow {
  id: string;
  kind: "staff" | "client";
  email: string;
  role: MemberRole | null;
  project_id: string | null;
  project_name: string | null;
  expires_at: string;
  created_at: string;
  status: "pending" | "expired";
}

export interface ProjectPeople {
  staff: { user_id: string; display_name: string; email: string; role: MemberRole; expires_at: string | null }[];
  clients: { user_id: string; display_name: string; email: string }[];
}

export interface InvitationPreview {
  status: "valid" | "expired" | "consumed" | "revoked" | "not_found";
  kind?: "staff" | "client";
  role?: MemberRole | null;
  organization_name?: string;
  project_name?: string | null;
  email_hint?: string;
  expires_at?: string;
  timezone?: string;
}

export interface PortalProject {
  schema_version: 1;
  viewer: "client" | "staff_preview";
  project: { id: string; display_name: string; currency: CurrencyCode; timezone: string; status: "active" | "archived" };
  brand: { display_name: string; display_name_en: string | null; accent: string | null; logo_file_id: string | null };
  financials: null;
  progress: null;
}
