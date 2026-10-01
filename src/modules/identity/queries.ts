import "server-only";

import { notFound } from "next/navigation";
import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CommandError, toCommandError } from "@/lib/supabase/errors";
import type {
  InvitationPreview,
  InvitationRow,
  MemberRow,
  OrganizationContext,
  PortalProject,
  ProjectPeople,
  ProjectRow,
  Workspaces,
} from "./types";

// All reads run as the signed-in user; RLS and command checks enforce access.

async function rpc<T>(name: string, args?: Record<string, unknown>): Promise<T> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw toCommandError(error);
  return data as T;
}

export const getWorkspaces = cache(async (): Promise<Workspaces> => rpc<Workspaces>("list_my_workspaces"));

export const getOrganizationContext = cache(async (organizationId: string): Promise<OrganizationContext | null> => {
  if (!isUuid(organizationId)) return null;
  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims.sub;
  if (!userId) return null;
  const [org, membership] = await Promise.all([
    supabase.from("organizations").select("id, name, name_en, accent_color, timezone, version").eq("id", organizationId).maybeSingle(),
    supabase
      .from("organization_memberships")
      .select("role")
      .eq("organization_id", organizationId)
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle(),
  ]);
  if (org.error || membership.error) throw toCommandError(org.error ?? membership.error);
  if (!org.data || !membership.data) return null;
  return { ...org.data, role: membership.data.role } as OrganizationContext;
});

export async function listProjects(organizationId: string): Promise<ProjectRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id, organization_id, code, display_name, currency, timezone, status, created_at")
    .eq("organization_id", organizationId)
    .order("status", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw toCommandError(error);
  return (data ?? []) as ProjectRow[];
}

export async function getProject(organizationId: string, projectId: string): Promise<ProjectRow | null> {
  if (!isUuid(projectId)) return null;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id, organization_id, code, display_name, currency, timezone, status, created_at")
    .eq("organization_id", organizationId)
    .eq("id", projectId)
    .maybeSingle();
  if (error) throw toCommandError(error);
  return (data as ProjectRow | null) ?? null;
}

export const listMembers = (organizationId: string) => rpc<MemberRow[]>("list_organization_members", { p_organization_id: organizationId });
export const listInvitations = (organizationId: string) => rpc<InvitationRow[]>("list_invitations", { p_organization_id: organizationId });
export const listProjectPeople = (projectId: string) => rpc<ProjectPeople>("list_project_people", { p_project_id: projectId });
export const getInvitationPreview = (token: string) => rpc<InvitationPreview>("get_invitation_preview", { p_token: token });

export async function getPortalProject(projectId: string): Promise<PortalProject | null> {
  if (!isUuid(projectId)) return null;
  try {
    return await rpc<PortalProject>("get_portal_project", { p_project_id: projectId });
  } catch (error) {
    if (error instanceof CommandError && (error.code === "NOT_FOUND" || error.code === "FORBIDDEN")) return null;
    throw error;
  }
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

/**
 * Pages render in parallel with their layout, so each page re-checks membership
 * instead of trusting the layout. Absent and inaccessible look the same (404).
 */
export async function requireOrganization(organizationId: string): Promise<OrganizationContext> {
  const org = await getOrganizationContext(organizationId);
  if (!org) notFound();
  return org;
}
