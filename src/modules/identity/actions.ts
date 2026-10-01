"use server";

import { revalidatePath } from "next/cache";
import { redirect as nextRedirect } from "next/navigation";
import { z } from "zod";
import { redirect } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { safeReturnPath } from "@/lib/auth/session";
import { publicEnv } from "@/lib/env";
import { isSupportedCurrency } from "@/lib/money/currency";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CommandError, toCommandError } from "@/lib/supabase/errors";
import { MEMBER_ROLES } from "./types";

export type FormState =
  | { status: "idle" }
  | { status: "error"; code: string; field?: string }
  | { status: "success"; message?: string; link?: string };

const idle: FormState = { status: "idle" };

const locale = z.enum(routing.locales);
const uuid = z.uuid();
const email = z.string().trim().toLowerCase().pipe(z.email()).pipe(z.string().max(254));
const password = z.string().min(10).max(128);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

function fail(error: unknown): FormState {
  if (error instanceof CommandError) return { status: "error", code: error.code, field: error.field };
  if (error instanceof z.ZodError) {
    return { status: "error", code: "VALIDATION_ERROR", field: String(error.issues[0]?.path[0] ?? "") };
  }
  return { status: "error", code: "UNKNOWN" };
}

async function command<T>(name: string, args: Record<string, unknown>): Promise<T> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw toCommandError(error);
  return data as T;
}

function inviteLink(token: string): string {
  // No locale prefix: the recipient's device language decides (O12).
  return `${publicEnv.NEXT_PUBLIC_APP_URL}/invite?token=${token}`;
}

// ---------------------------------------------------------------------------
// Authentication
// ---------------------------------------------------------------------------

export async function signInAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = z
    .object({ locale, email, password: z.string().min(1).max(128), next: z.string().optional() })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", code: "invalid_credentials" };
  const { locale: lc, next } = parsed.data;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.password });
  if (error) {
    // Same message for unknown email and wrong password (no account enumeration).
    return { status: "error", code: error.status === 429 ? "rate_limited" : "invalid_credentials" };
  }
  nextRedirect(safeReturnPath(next, lc));
}

export async function signOutAction(formData: FormData): Promise<void> {
  const lc = locale.catch(routing.defaultLocale).parse(formData.get("locale"));
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect({ href: "/login", locale: lc });
}

export async function requestPasswordResetAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = z.object({ locale, email }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", code: "VALIDATION_ERROR", field: "email" };
  const supabase = await createSupabaseServerClient();
  const next = encodeURIComponent(`/${parsed.data.locale}/auth/update-password`);
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${publicEnv.NEXT_PUBLIC_APP_URL}/${parsed.data.locale}/auth/callback?next=${next}`,
  });
  // Always the same answer, whether or not the address has an account.
  return { status: "success" };
}

export async function updatePasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = z.object({ locale, password }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", code: "weak_password", field: "password" };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { status: "error", code: error.code === "weak_password" ? "weak_password" : "UNKNOWN" };
  redirect({ href: "/app", locale: parsed.data.locale });
  return idle;
}

// ---------------------------------------------------------------------------
// Invitations (accept / sign up)
// ---------------------------------------------------------------------------

const token = z.string().regex(/^[0-9a-f]{64}$/);

async function acceptAndRedirect(tokenValue: string, lc: AppLocale): Promise<never> {
  const result = await command<{ organization_id: string; project_id: string | null; kind: "staff" | "client" }>(
    "accept_invitation",
    { p_token: tokenValue },
  );
  if (result.kind === "client" && result.project_id) {
    return redirect({ href: `/portal/${result.project_id}`, locale: lc });
  }
  return redirect({ href: `/app/${result.organization_id}/projects`, locale: lc });
}

export async function acceptInvitationAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = z.object({ locale, token }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", code: "INVITATION_INVALID" };
  try {
    await acceptAndRedirect(parsed.data.token, parsed.data.locale);
  } catch (error) {
    if (isRedirect(error)) throw error;
    return fail(error);
  }
  return idle;
}

export async function signUpWithInvitationAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = z
    .object({ locale, token, email, password, display_name: z.string().trim().min(1).max(120) })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(parsed.error);
  const { locale: lc } = parsed.data;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { display_name: parsed.data.display_name },
      emailRedirectTo: `${publicEnv.NEXT_PUBLIC_APP_URL}/${lc}/auth/callback?next=${encodeURIComponent(`/${lc}/invite?token=${parsed.data.token}`)}`,
    },
  });
  if (error) {
    const code = error.code === "weak_password" ? "weak_password" : error.code === "user_already_exists" ? "email_taken" : error.status === 429 ? "rate_limited" : "UNKNOWN";
    return { status: "error", code };
  }
  if (!data.session) {
    // Email confirmation is on: the confirmation link returns to this invitation.
    return { status: "success", message: "confirm_email" };
  }
  try {
    await acceptAndRedirect(parsed.data.token, lc);
  } catch (err) {
    if (isRedirect(err)) throw err;
    return fail(err);
  }
  return idle;
}

// ---------------------------------------------------------------------------
// Organization administration (owner only; enforced by the database commands)
// ---------------------------------------------------------------------------

function expiryFrom(date: string | undefined, timezone: string): string | null {
  // End of the chosen day in the organization's timezone; Postgres resolves the zone name.
  return date ? `${date} 23:59:59 ${timezone}` : null;
}

export async function inviteStaffAction(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const input = z
      .object({
        locale,
        organization_id: uuid,
        timezone: z.string().min(1).max(64),
        email,
        role: z.enum(MEMBER_ROLES),
        project_id: z.union([uuid, z.literal("")]).optional(),
        expires_on: z.union([isoDate, z.literal("")]).optional(),
      })
      .parse(Object.fromEntries(formData));
    const result = await command<{ token: string }>("create_invitation", {
      p_organization_id: input.organization_id,
      p_kind: "staff",
      p_email: input.email,
      p_role: input.role,
      p_project_id: input.project_id || null,
      p_membership_expires_at: expiryFrom(input.expires_on || undefined, input.timezone),
    });
    revalidatePath(`/${input.locale}/app/${input.organization_id}`, "layout");
    return { status: "success", link: inviteLink(result.token) };
  } catch (error) {
    return fail(error);
  }
}

export async function inviteClientAction(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const input = z
      .object({ locale, organization_id: uuid, project_id: uuid, email })
      .parse(Object.fromEntries(formData));
    const result = await command<{ token: string }>("create_invitation", {
      p_organization_id: input.organization_id,
      p_kind: "client",
      p_email: input.email,
      p_project_id: input.project_id,
    });
    revalidatePath(`/${input.locale}/app/${input.organization_id}`, "layout");
    return { status: "success", link: inviteLink(result.token) };
  } catch (error) {
    return fail(error);
  }
}

export async function revokeInvitationAction(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const input = z.object({ locale, organization_id: uuid, invitation_id: uuid }).parse(Object.fromEntries(formData));
    await command("revoke_invitation", { p_invitation_id: input.invitation_id });
    revalidatePath(`/${input.locale}/app/${input.organization_id}`, "layout");
    return { status: "success" };
  } catch (error) {
    return fail(error);
  }
}

export async function changeMemberRoleAction(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const input = z
      .object({
        locale,
        organization_id: uuid,
        timezone: z.string().min(1).max(64),
        user_id: uuid,
        role: z.enum(MEMBER_ROLES),
        expires_on: z.union([isoDate, z.literal("")]).optional(),
      })
      .parse(Object.fromEntries(formData));
    await command("change_member_role", {
      p_organization_id: input.organization_id,
      p_user_id: input.user_id,
      p_role: input.role,
      p_expires_at: expiryFrom(input.expires_on || undefined, input.timezone),
    });
    revalidatePath(`/${input.locale}/app/${input.organization_id}`, "layout");
    return { status: "success" };
  } catch (error) {
    return fail(error);
  }
}

export async function revokeMemberAction(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const input = z.object({ locale, organization_id: uuid, user_id: uuid }).parse(Object.fromEntries(formData));
    await command("revoke_membership", { p_organization_id: input.organization_id, p_user_id: input.user_id });
    revalidatePath(`/${input.locale}/app/${input.organization_id}`, "layout");
    return { status: "success" };
  } catch (error) {
    return fail(error);
  }
}

export async function createProjectAction(_prev: FormState, formData: FormData): Promise<FormState> {
  let created: { locale: AppLocale; organizationId: string; projectId: string } | null = null;
  try {
    const input = z
      .object({
        locale,
        organization_id: uuid,
        code: z.string().trim().regex(/^[A-Za-z0-9][A-Za-z0-9._-]{0,31}$/),
        display_name: z.string().trim().min(1).max(120),
        currency: z.string().refine(isSupportedCurrency),
        timezone: z.string().min(1).max(64),
      })
      .parse(Object.fromEntries(formData));
    const projectId = await command<string>("create_project", {
      p_organization_id: input.organization_id,
      p_code: input.code,
      p_display_name: input.display_name,
      p_currency: input.currency,
      p_timezone: input.timezone,
    });
    created = { locale: input.locale, organizationId: input.organization_id, projectId };
  } catch (error) {
    return fail(error);
  }
  revalidatePath(`/${created.locale}/app/${created.organizationId}`, "layout");
  redirect({ href: `/app/${created.organizationId}/projects/${created.projectId}`, locale: created.locale });
  return idle;
}

export async function assignStaffAction(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const input = z.object({ locale, organization_id: uuid, project_id: uuid, user_id: uuid }).parse(Object.fromEntries(formData));
    await command("assign_project_staff", { p_project_id: input.project_id, p_user_id: input.user_id });
    revalidatePath(`/${input.locale}/app/${input.organization_id}`, "layout");
    return { status: "success" };
  } catch (error) {
    return fail(error);
  }
}

export async function unassignStaffAction(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const input = z.object({ locale, organization_id: uuid, project_id: uuid, user_id: uuid }).parse(Object.fromEntries(formData));
    await command("unassign_project_staff", { p_project_id: input.project_id, p_user_id: input.user_id });
    revalidatePath(`/${input.locale}/app/${input.organization_id}`, "layout");
    return { status: "success" };
  } catch (error) {
    return fail(error);
  }
}

export async function revokeClientAction(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const input = z.object({ locale, organization_id: uuid, project_id: uuid, user_id: uuid }).parse(Object.fromEntries(formData));
    await command("revoke_client_access", { p_project_id: input.project_id, p_user_id: input.user_id });
    revalidatePath(`/${input.locale}/app/${input.organization_id}`, "layout");
    return { status: "success" };
  } catch (error) {
    return fail(error);
  }
}

export async function updateOrganizationSettingsAction(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const input = z
      .object({
        locale,
        organization_id: uuid,
        expected_version: z.coerce.number().int().min(1),
        name: z.string().trim().min(1).max(120),
        name_en: z.string().trim().max(120).optional(),
        accent_color: z.union([z.string().regex(/^#[0-9A-Fa-f]{6}$/), z.literal("")]).optional(),
        timezone: z.string().min(1).max(64),
      })
      .parse(Object.fromEntries(formData));
    await command("update_organization_settings", {
      p_organization_id: input.organization_id,
      p_expected_version: input.expected_version,
      p_name: input.name,
      p_name_en: input.name_en ?? "",
      p_accent_color: input.accent_color ?? "",
      p_timezone: input.timezone,
    });
    revalidatePath(`/${input.locale}/app/${input.organization_id}`, "layout");
    return { status: "success" };
  } catch (error) {
    return fail(error);
  }
}

// ---------------------------------------------------------------------------
// Platform operator
// ---------------------------------------------------------------------------

export async function operatorCreateOrganizationAction(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const input = z
      .object({ locale, name: z.string().trim().min(1).max(120), owner_email: email, timezone: z.string().min(1).max(64) })
      .parse(Object.fromEntries(formData));
    const result = await command<{ token: string }>("operator_create_organization", {
      p_name: input.name,
      p_owner_email: input.owner_email,
      p_timezone: input.timezone,
    });
    return { status: "success", link: inviteLink(result.token) };
  } catch (error) {
    return fail(error);
  }
}

function isRedirect(error: unknown): boolean {
  return typeof error === "object" && error !== null && "digest" in error && String((error as { digest: unknown }).digest).startsWith("NEXT_REDIRECT");
}
