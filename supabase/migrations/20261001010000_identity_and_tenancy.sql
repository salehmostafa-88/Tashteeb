-- Phase 1: identity, tenancy, project access and audit.
--
-- Rules (docs/05-data-model.md, docs/07-security.md):
-- * Every tenant row carries organization_id; children use composite foreign keys so
--   a row can never reference another organization's project or membership.
-- * Client roles get SELECT through RLS only. Every write goes through a SECURITY
--   DEFINER command below that derives the actor from auth.uid(), checks role and
--   state, and writes an audit event.
-- * Helpers used by policies live in schema `authz` (not exposed by the Data API).

-- ---------------------------------------------------------------------------
-- Schemas and types
-- ---------------------------------------------------------------------------

create schema if not exists authz;
revoke all on schema authz from public, anon;
grant usage on schema authz to authenticated;
comment on schema authz is 'Authorization predicates used by RLS policies and commands. Not exposed by the Data API.';

create type public.member_role as enum ('owner', 'finance', 'manager', 'engineer', 'collaborator');

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 120),
  name_en text check (name_en is null or char_length(btrim(name_en)) between 1 and 120),
  timezone text not null default 'Africa/Cairo' check (char_length(timezone) between 1 and 64),
  accent_color text check (accent_color is null or accent_color ~ '^#[0-9A-Fa-f]{6}$'),
  logo_file_id uuid, -- files table arrives with uploads (Phase 3)
  status text not null default 'active' check (status in ('active', 'suspended', 'archived')),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id),
  updated_at timestamptz not null default now(),
  version integer not null default 1 check (version >= 1)
);

create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 120),
  preferred_locale text check (preferred_locale in ('ar', 'en')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  user_id uuid not null references auth.users (id),
  role public.member_role not null,
  status text not null default 'active' check (status in ('active', 'revoked')),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id),
  revoked_at timestamptz,
  revoked_by uuid references auth.users (id),
  version integer not null default 1 check (version >= 1),
  unique (organization_id, user_id),
  unique (organization_id, id),
  -- Project-based talent always expires (O07); owners never do.
  constraint collaborator_expires check (role <> 'collaborator' or expires_at is not null),
  constraint owner_never_expires check (role <> 'owner' or expires_at is null),
  constraint revoked_consistent check ((status = 'revoked') = (revoked_at is not null))
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  code text not null check (code ~ '^[A-Za-z0-9][A-Za-z0-9._-]{0,31}$'),
  display_name text not null check (char_length(btrim(display_name)) between 1 and 120),
  currency text not null check (currency in ('EGP', 'USD', 'EUR', 'AED', 'SAR')),
  timezone text not null default 'Africa/Cairo' check (char_length(timezone) between 1 and 64),
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id),
  updated_at timestamptz not null default now(),
  version integer not null default 1 check (version >= 1),
  unique (organization_id, id)
);
create unique index projects_org_code_ci on public.projects (organization_id, lower(code));

create table public.project_staff_assignments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  project_id uuid not null,
  user_id uuid not null,
  status text not null default 'active' check (status in ('active', 'revoked')),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id),
  revoked_at timestamptz,
  revoked_by uuid references auth.users (id),
  unique (project_id, user_id),
  foreign key (organization_id, project_id) references public.projects (organization_id, id),
  foreign key (organization_id, user_id) references public.organization_memberships (organization_id, user_id),
  constraint revoked_consistent check ((status = 'revoked') = (revoked_at is not null))
);

create table public.project_client_access (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  project_id uuid not null,
  user_id uuid not null references auth.users (id),
  status text not null default 'active' check (status in ('active', 'revoked')),
  created_at timestamptz not null default now(),
  invited_by uuid references auth.users (id),
  revoked_at timestamptz,
  revoked_by uuid references auth.users (id),
  unique (project_id, user_id),
  foreign key (organization_id, project_id) references public.projects (organization_id, id),
  constraint revoked_consistent check ((status = 'revoked') = (revoked_at is not null))
);

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  project_id uuid,
  kind text not null check (kind in ('staff', 'client')),
  invited_email text not null check (
    invited_email = lower(btrim(invited_email))
    and char_length(invited_email) <= 254
    and invited_email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
  ),
  intended_role public.member_role,
  membership_expires_at timestamptz,
  token_hash bytea not null unique,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  consumed_by uuid references auth.users (id),
  revoked_at timestamptz,
  revoked_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id),
  foreign key (organization_id, project_id) references public.projects (organization_id, id),
  constraint role_matches_kind check ((kind = 'client') = (intended_role is null)),
  constraint client_needs_project check (kind <> 'client' or project_id is not null),
  constraint collaborator_expires check (intended_role is distinct from 'collaborator' or membership_expires_at is not null),
  constraint single_outcome check (consumed_at is null or revoked_at is null)
);

create table public.audit_events (
  id bigint generated always as identity primary key,
  organization_id uuid not null references public.organizations (id),
  project_id uuid,
  actor_id uuid,
  action text not null check (char_length(action) between 1 and 80),
  entity_type text not null check (char_length(entity_type) between 1 and 80),
  entity_id uuid,
  details jsonb not null default '{}'::jsonb,
  reason text check (reason is null or char_length(reason) <= 2000),
  device_id uuid,
  created_at timestamptz not null default now()
);

create table app_private.platform_operators (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Indexes for policy predicates and common reads.
create index memberships_user_status on public.organization_memberships (user_id, status);
create index assignments_user_status on public.project_staff_assignments (user_id, status);
create index assignments_org_project on public.project_staff_assignments (organization_id, project_id);
create index client_access_user_status on public.project_client_access (user_id, status);
create index invitations_org_pending on public.invitations (organization_id) where consumed_at is null and revoked_at is null;
create index audit_org_created on public.audit_events (organization_id, created_at desc);
create index audit_project_created on public.audit_events (project_id, created_at desc) where project_id is not null;

-- ---------------------------------------------------------------------------
-- Append-only audit (even for definer functions)
-- ---------------------------------------------------------------------------

create function app_private.forbid_audit_mutation() returns trigger
language plpgsql set search_path = '' as $$
begin
  raise exception 'audit_events is append-only' using errcode = '42501';
end;
$$;

create trigger audit_events_append_only
  before update or delete on public.audit_events
  for each row execute function app_private.forbid_audit_mutation();

-- ---------------------------------------------------------------------------
-- Profiles follow auth users
-- ---------------------------------------------------------------------------

create function app_private.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (user_id, display_name)
  values (
    new.id,
    left(btrim(coalesce(new.raw_user_meta_data ->> 'display_name', '')), 120)
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function app_private.handle_new_user();

-- ---------------------------------------------------------------------------
-- Authorization predicates (about the caller only; never return tenant data)
-- ---------------------------------------------------------------------------

create function authz.member_role(p_organization_id uuid) returns public.member_role
language sql stable security definer set search_path = '' as $$
  select m.role
  from public.organization_memberships m
  join public.organizations o on o.id = m.organization_id
  where m.organization_id = p_organization_id
    and m.user_id = (select auth.uid())
    and m.status = 'active'
    and (m.expires_at is null or m.expires_at > now())
    and o.status <> 'archived'
$$;

create function authz.is_active_member(p_organization_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select authz.member_role(p_organization_id) is not null
$$;

create function authz.is_org_owner(p_organization_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select authz.member_role(p_organization_id) is not distinct from 'owner'::public.member_role
$$;

-- Owners see every project in their organization; other staff need an active,
-- unexpired assignment on top of an active membership.
create function authz.can_read_project(p_project_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from public.projects p
    where p.id = p_project_id
      and (
        authz.is_org_owner(p.organization_id)
        or (
          authz.is_active_member(p.organization_id)
          and exists (
            select 1 from public.project_staff_assignments a
            where a.project_id = p.id
              and a.user_id = (select auth.uid())
              and a.status = 'active'
              and (a.expires_at is null or a.expires_at > now())
          )
        )
      )
  )
$$;

create function authz.has_client_access(p_project_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from public.project_client_access c
    join public.projects p on p.id = c.project_id
    join public.organizations o on o.id = p.organization_id
    where c.project_id = p_project_id
      and c.user_id = (select auth.uid())
      and c.status = 'active'
      and o.status <> 'archived'
  )
$$;

create function authz.is_platform_operator() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from app_private.platform_operators where user_id = (select auth.uid()))
$$;

-- Device identifier forwarded by the app as the x-device-id request header (ADR 0003).
create function authz.device_id() returns uuid
language plpgsql stable set search_path = '' as $$
declare
  v text;
begin
  v := nullif(current_setting('request.headers', true), '')::json ->> 'x-device-id';
  if v ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' then
    return v::uuid;
  end if;
  return null;
exception when others then
  return null;
end;
$$;

revoke all on all functions in schema authz from public, anon;
grant execute on function
  authz.member_role(uuid),
  authz.is_active_member(uuid),
  authz.is_org_owner(uuid),
  authz.can_read_project(uuid),
  authz.has_client_access(uuid),
  authz.is_platform_operator(),
  authz.device_id()
to authenticated;

-- ---------------------------------------------------------------------------
-- Row level security: read-only exposure
-- ---------------------------------------------------------------------------

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.projects enable row level security;
alter table public.project_staff_assignments enable row level security;
alter table public.project_client_access enable row level security;
alter table public.invitations enable row level security;
alter table public.audit_events enable row level security;
alter table app_private.platform_operators enable row level security;

create policy organizations_select_members on public.organizations
  for select to authenticated using (authz.is_active_member(id));

create policy profiles_select_own on public.profiles
  for select to authenticated using (user_id = (select auth.uid()));

create policy memberships_select_own_or_owner on public.organization_memberships
  for select to authenticated
  using (user_id = (select auth.uid()) or authz.is_org_owner(organization_id));

create policy projects_select_staff on public.projects
  for select to authenticated using (authz.can_read_project(id));

create policy assignments_select_own_or_owner on public.project_staff_assignments
  for select to authenticated
  using (user_id = (select auth.uid()) or authz.is_org_owner(organization_id));

create policy client_access_select_own_or_owner on public.project_client_access
  for select to authenticated
  using (user_id = (select auth.uid()) or authz.is_org_owner(organization_id));

create policy audit_select_owner on public.audit_events
  for select to authenticated using (authz.is_org_owner(organization_id));

-- invitations and platform_operators: no policies, no grants (commands only).

revoke all on
  public.organizations, public.profiles, public.organization_memberships, public.projects,
  public.project_staff_assignments, public.project_client_access, public.invitations,
  public.audit_events
from anon, authenticated;

grant select on
  public.organizations, public.profiles, public.organization_memberships, public.projects,
  public.project_staff_assignments, public.project_client_access, public.audit_events
to authenticated;

-- ---------------------------------------------------------------------------
-- Command helpers (private)
-- ---------------------------------------------------------------------------

create function app_private.require_user() returns uuid
language plpgsql stable set search_path = '' as $$
declare
  v uuid := auth.uid();
begin
  if v is null then
    raise exception 'NOT_AUTHENTICATED' using errcode = '42501';
  end if;
  return v;
end;
$$;

create function app_private.require_owner(p_organization_id uuid) returns uuid
language plpgsql stable set search_path = '' as $$
declare
  v uuid := app_private.require_user();
begin
  if not authz.is_org_owner(p_organization_id) then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;
  return v;
end;
$$;

create function app_private.audit(
  p_organization_id uuid, p_project_id uuid, p_action text, p_entity_type text,
  p_entity_id uuid, p_details jsonb default '{}'::jsonb, p_reason text default null
) returns void
language sql set search_path = '' as $$
  insert into public.audit_events (organization_id, project_id, actor_id, action, entity_type, entity_id, details, reason, device_id)
  values (p_organization_id, p_project_id, auth.uid(), p_action, p_entity_type, p_entity_id, coalesce(p_details, '{}'::jsonb), p_reason, authz.device_id());
$$;

create function app_private.normalize_email(p_email text) returns text
language plpgsql immutable set search_path = '' as $$
declare
  v text := lower(btrim(coalesce(p_email, '')));
begin
  if char_length(v) > 254 or v !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'VALIDATION_ERROR:email' using errcode = '22023';
  end if;
  return v;
end;
$$;

create function app_private.valid_timezone(p_tz text) returns boolean
language sql stable set search_path = '' as $$
  select exists (select 1 from pg_catalog.pg_timezone_names where name = p_tz)
$$;

-- Returns a new random token and stores only its SHA-256 hash.
create function app_private.new_invitation(
  p_organization_id uuid, p_project_id uuid, p_kind text, p_email text,
  p_role public.member_role, p_membership_expires_at timestamptz
) returns jsonb
language plpgsql set search_path = '' as $$
declare
  v_token text := encode(extensions.gen_random_bytes(32), 'hex');
  v_id uuid;
  v_expires timestamptz := now() + interval '7 days';
begin
  insert into public.invitations (
    organization_id, project_id, kind, invited_email, intended_role, membership_expires_at,
    token_hash, expires_at, created_by
  ) values (
    p_organization_id, p_project_id, p_kind, app_private.normalize_email(p_email), p_role, p_membership_expires_at,
    extensions.digest(v_token, 'sha256'), v_expires, auth.uid()
  ) returning id into v_id;

  perform app_private.audit(p_organization_id, p_project_id, 'invitation.created', 'invitation', v_id,
    jsonb_build_object('kind', p_kind, 'role', p_role));

  return jsonb_build_object('invitation_id', v_id, 'token', v_token, 'expires_at', v_expires);
end;
$$;

-- Prevents an organization from losing its last active owner. Locks owner rows.
create function app_private.assert_other_owner_remains(p_organization_id uuid, p_user_id uuid) returns void
language plpgsql set search_path = '' as $$
declare
  v_others integer;
begin
  perform 1 from public.organization_memberships
    where organization_id = p_organization_id and role = 'owner' and status = 'active'
    for update;
  select count(*) into v_others from public.organization_memberships
    where organization_id = p_organization_id and role = 'owner' and status = 'active' and user_id <> p_user_id;
  if v_others = 0 then
    raise exception 'LAST_OWNER' using errcode = '23514';
  end if;
end;
$$;

revoke all on all functions in schema app_private from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Commands (public RPC). Actor always comes from auth.uid().
-- ---------------------------------------------------------------------------

-- Pilot: organizations are created by a platform operator (clarification 10).
create function public.operator_create_organization(
  p_name text, p_owner_email text, p_timezone text default 'Africa/Cairo'
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_org uuid;
  v_invite jsonb;
begin
  perform app_private.require_user();
  if not authz.is_platform_operator() then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;
  if not app_private.valid_timezone(p_timezone) then
    raise exception 'VALIDATION_ERROR:timezone' using errcode = '22023';
  end if;
  insert into public.organizations (name, timezone, created_by)
  values (btrim(p_name), p_timezone, auth.uid())
  returning id into v_org;
  perform app_private.audit(v_org, null, 'organization.created', 'organization', v_org);
  v_invite := app_private.new_invitation(v_org, null, 'staff', p_owner_email, 'owner', null);
  return jsonb_build_object('organization_id', v_org) || v_invite;
end;
$$;

create function public.update_organization_settings(
  p_organization_id uuid, p_expected_version integer, p_name text, p_name_en text,
  p_accent_color text, p_timezone text
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_version integer;
begin
  perform app_private.require_owner(p_organization_id);
  if not app_private.valid_timezone(p_timezone) then
    raise exception 'VALIDATION_ERROR:timezone' using errcode = '22023';
  end if;
  update public.organizations
     set name = btrim(p_name),
         name_en = nullif(btrim(coalesce(p_name_en, '')), ''),
         accent_color = nullif(btrim(coalesce(p_accent_color, '')), ''),
         timezone = p_timezone,
         updated_at = now(),
         version = version + 1
   where id = p_organization_id and version = p_expected_version
   returning version into v_version;
  if v_version is null then
    raise exception 'VERSION_CONFLICT' using errcode = '40001';
  end if;
  perform app_private.audit(p_organization_id, null, 'organization.settings_updated', 'organization', p_organization_id);
  return jsonb_build_object('version', v_version);
end;
$$;

create function public.create_invitation(
  p_organization_id uuid, p_kind text, p_email text, p_role public.member_role default null,
  p_project_id uuid default null, p_membership_expires_at timestamptz default null
) returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  perform app_private.require_owner(p_organization_id);
  if p_kind not in ('staff', 'client') then
    raise exception 'VALIDATION_ERROR:kind' using errcode = '22023';
  end if;
  if p_kind = 'staff' and p_role is null then
    raise exception 'VALIDATION_ERROR:role' using errcode = '22023';
  end if;
  if p_kind = 'client' and (p_role is not null or p_project_id is null) then
    raise exception 'VALIDATION_ERROR:project' using errcode = '22023';
  end if;
  if p_role = 'collaborator' and (p_membership_expires_at is null or p_membership_expires_at <= now()) then
    raise exception 'VALIDATION_ERROR:expires_at' using errcode = '22023';
  end if;
  if p_project_id is not null and not exists (
    select 1 from public.projects where id = p_project_id and organization_id = p_organization_id
  ) then
    raise exception 'NOT_FOUND' using errcode = '42501';
  end if;
  return app_private.new_invitation(p_organization_id, p_project_id, p_kind, p_email,
    p_role, case when p_role = 'owner' then null else p_membership_expires_at end);
end;
$$;

create function public.list_invitations(p_organization_id uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  perform app_private.require_owner(p_organization_id);
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', i.id, 'kind', i.kind, 'email', i.invited_email, 'role', i.intended_role,
      'project_id', i.project_id, 'project_name', p.display_name,
      'expires_at', i.expires_at, 'created_at', i.created_at,
      'status', case when i.expires_at <= now() then 'expired' else 'pending' end
    ) order by i.created_at desc)
    from public.invitations i
    left join public.projects p on p.id = i.project_id
    where i.organization_id = p_organization_id and i.consumed_at is null and i.revoked_at is null
  ), '[]'::jsonb);
end;
$$;

create function public.revoke_invitation(p_invitation_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_org uuid;
begin
  select organization_id into v_org from public.invitations where id = p_invitation_id;
  if v_org is null or not authz.is_org_owner(v_org) then
    raise exception 'NOT_FOUND' using errcode = '42501';
  end if;
  update public.invitations set revoked_at = now(), revoked_by = auth.uid()
   where id = p_invitation_id and consumed_at is null and revoked_at is null;
  perform app_private.audit(v_org, null, 'invitation.revoked', 'invitation', p_invitation_id);
end;
$$;

-- Anyone holding a token may see what it is for (not who else is in the studio).
create function public.get_invitation_preview(p_token text) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  r record;
begin
  if p_token is null or p_token !~ '^[0-9a-f]{64}$' then
    return jsonb_build_object('status', 'not_found');
  end if;
  select i.*, o.name as organization_name, p.display_name as project_name
    into r
    from public.invitations i
    join public.organizations o on o.id = i.organization_id
    left join public.projects p on p.id = i.project_id
   where i.token_hash = extensions.digest(p_token, 'sha256');
  if not found then
    return jsonb_build_object('status', 'not_found');
  end if;
  return jsonb_build_object(
    'status', case
      when r.revoked_at is not null then 'revoked'
      when r.consumed_at is not null then 'consumed'
      when r.expires_at <= now() then 'expired'
      else 'valid' end,
    'kind', r.kind,
    'role', r.intended_role,
    'organization_name', r.organization_name,
    'project_name', r.project_name,
    'email_hint', left(r.invited_email, 2) || '***' || substr(r.invited_email, strpos(r.invited_email, '@')),
    'expires_at', r.expires_at
  );
end;
$$;

create function public.accept_invitation(p_token text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_user uuid := app_private.require_user();
  v_email text;
  r public.invitations%rowtype;
  v_existing public.organization_memberships%rowtype;
begin
  if p_token is null or p_token !~ '^[0-9a-f]{64}$' then
    raise exception 'INVITATION_INVALID' using errcode = '22023';
  end if;
  select * into r from public.invitations
   where token_hash = extensions.digest(p_token, 'sha256')
   for update;
  if not found or r.revoked_at is not null or r.consumed_at is not null then
    raise exception 'INVITATION_INVALID' using errcode = '22023';
  end if;
  if r.expires_at <= now() then
    raise exception 'INVITATION_EXPIRED' using errcode = '22023';
  end if;

  select lower(email) into v_email from auth.users where id = v_user;
  if v_email is distinct from r.invited_email then
    raise exception 'INVITATION_EMAIL_MISMATCH' using errcode = '42501';
  end if;

  if r.kind = 'staff' then
    select * into v_existing from public.organization_memberships
     where organization_id = r.organization_id and user_id = v_user
     for update;
    if found and v_existing.status = 'active' and (v_existing.expires_at is null or v_existing.expires_at > now()) then
      -- Already a member: never change role through an invitation; only add the project.
      if r.project_id is null then
        raise exception 'ALREADY_MEMBER' using errcode = '23505';
      end if;
    elsif found then
      update public.organization_memberships
         set role = r.intended_role, status = 'active', expires_at = r.membership_expires_at,
             revoked_at = null, revoked_by = null, version = version + 1
       where id = v_existing.id;
    else
      insert into public.organization_memberships (organization_id, user_id, role, expires_at, created_by)
      values (r.organization_id, v_user, r.intended_role, r.membership_expires_at, r.created_by);
    end if;

    if r.project_id is not null then
      insert into public.project_staff_assignments (organization_id, project_id, user_id, expires_at, created_by)
      values (r.organization_id, r.project_id, v_user, r.membership_expires_at, r.created_by)
      on conflict (project_id, user_id) do update
        set status = 'active', expires_at = excluded.expires_at, revoked_at = null, revoked_by = null;
    end if;
  else
    insert into public.project_client_access (organization_id, project_id, user_id, invited_by)
    values (r.organization_id, r.project_id, v_user, r.created_by)
    on conflict (project_id, user_id) do update
      set status = 'active', revoked_at = null, revoked_by = null;
  end if;

  update public.invitations set consumed_at = now(), consumed_by = v_user where id = r.id;
  perform app_private.audit(r.organization_id, r.project_id, 'invitation.accepted', 'invitation', r.id,
    jsonb_build_object('kind', r.kind, 'role', r.intended_role));

  return jsonb_build_object('organization_id', r.organization_id, 'project_id', r.project_id, 'kind', r.kind);
end;
$$;

create function public.create_project(
  p_organization_id uuid, p_code text, p_display_name text, p_currency text, p_timezone text default null
) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid;
  v_tz text;
begin
  perform app_private.require_owner(p_organization_id);
  select coalesce(p_timezone, timezone) into v_tz from public.organizations where id = p_organization_id;
  if not app_private.valid_timezone(v_tz) then
    raise exception 'VALIDATION_ERROR:timezone' using errcode = '22023';
  end if;
  if exists (select 1 from public.projects where organization_id = p_organization_id and lower(code) = lower(btrim(p_code))) then
    raise exception 'CONFLICT:code' using errcode = '23505';
  end if;
  insert into public.projects (organization_id, code, display_name, currency, timezone, created_by)
  values (p_organization_id, btrim(p_code), btrim(p_display_name), p_currency, v_tz, auth.uid())
  returning id into v_id;
  perform app_private.audit(p_organization_id, v_id, 'project.created', 'project', v_id,
    jsonb_build_object('currency', p_currency));
  return v_id;
end;
$$;

create function public.assign_project_staff(
  p_project_id uuid, p_user_id uuid, p_expires_at timestamptz default null
) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_org uuid;
  m public.organization_memberships%rowtype;
begin
  select organization_id into v_org from public.projects where id = p_project_id;
  if v_org is null or not authz.is_org_owner(v_org) then
    raise exception 'NOT_FOUND' using errcode = '42501';
  end if;
  select * into m from public.organization_memberships where organization_id = v_org and user_id = p_user_id;
  if not found or m.status <> 'active' or (m.expires_at is not null and m.expires_at <= now()) then
    raise exception 'VALIDATION_ERROR:member' using errcode = '22023';
  end if;
  insert into public.project_staff_assignments (organization_id, project_id, user_id, expires_at, created_by)
  values (v_org, p_project_id, p_user_id, coalesce(p_expires_at, m.expires_at), auth.uid())
  on conflict (project_id, user_id) do update
    set status = 'active', expires_at = excluded.expires_at, revoked_at = null, revoked_by = null;
  perform app_private.audit(v_org, p_project_id, 'project.staff_assigned', 'user', p_user_id);
end;
$$;

create function public.unassign_project_staff(p_project_id uuid, p_user_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_org uuid;
begin
  select organization_id into v_org from public.projects where id = p_project_id;
  if v_org is null or not authz.is_org_owner(v_org) then
    raise exception 'NOT_FOUND' using errcode = '42501';
  end if;
  update public.project_staff_assignments set status = 'revoked', revoked_at = now(), revoked_by = auth.uid()
   where project_id = p_project_id and user_id = p_user_id and status = 'active';
  perform app_private.audit(v_org, p_project_id, 'project.staff_unassigned', 'user', p_user_id);
end;
$$;

create function public.revoke_client_access(p_project_id uuid, p_user_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_org uuid;
begin
  select organization_id into v_org from public.projects where id = p_project_id;
  if v_org is null or not authz.is_org_owner(v_org) then
    raise exception 'NOT_FOUND' using errcode = '42501';
  end if;
  update public.project_client_access set status = 'revoked', revoked_at = now(), revoked_by = auth.uid()
   where project_id = p_project_id and user_id = p_user_id and status = 'active';
  perform app_private.audit(v_org, p_project_id, 'project.client_access_revoked', 'user', p_user_id);
end;
$$;

create function public.change_member_role(
  p_organization_id uuid, p_user_id uuid, p_role public.member_role, p_expires_at timestamptz default null
) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_current public.member_role;
begin
  perform app_private.require_owner(p_organization_id);
  select role into v_current from public.organization_memberships
   where organization_id = p_organization_id and user_id = p_user_id and status = 'active'
   for update;
  if v_current is null then
    raise exception 'NOT_FOUND' using errcode = '42501';
  end if;
  if v_current = 'owner' and p_role <> 'owner' then
    perform app_private.assert_other_owner_remains(p_organization_id, p_user_id);
  end if;
  if p_role = 'collaborator' and (p_expires_at is null or p_expires_at <= now()) then
    raise exception 'VALIDATION_ERROR:expires_at' using errcode = '22023';
  end if;
  update public.organization_memberships
     set role = p_role,
         expires_at = case when p_role = 'owner' then null else p_expires_at end,
         version = version + 1
   where organization_id = p_organization_id and user_id = p_user_id;
  perform app_private.audit(p_organization_id, null, 'membership.role_changed', 'user', p_user_id,
    jsonb_build_object('from', v_current, 'to', p_role));
end;
$$;

create function public.revoke_membership(p_organization_id uuid, p_user_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_role public.member_role;
begin
  perform app_private.require_owner(p_organization_id);
  select role into v_role from public.organization_memberships
   where organization_id = p_organization_id and user_id = p_user_id and status = 'active'
   for update;
  if v_role is null then
    raise exception 'NOT_FOUND' using errcode = '42501';
  end if;
  if v_role = 'owner' then
    perform app_private.assert_other_owner_remains(p_organization_id, p_user_id);
  end if;
  update public.organization_memberships
     set status = 'revoked', revoked_at = now(), revoked_by = auth.uid(), version = version + 1
   where organization_id = p_organization_id and user_id = p_user_id;
  update public.project_staff_assignments
     set status = 'revoked', revoked_at = now(), revoked_by = auth.uid()
   where organization_id = p_organization_id and user_id = p_user_id and status = 'active';
  perform app_private.audit(p_organization_id, null, 'membership.revoked', 'user', p_user_id);
end;
$$;

create function public.list_organization_members(p_organization_id uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  perform app_private.require_owner(p_organization_id);
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'user_id', m.user_id,
      'display_name', coalesce(nullif(pr.display_name, ''), u.email),
      'email', u.email,
      'role', m.role,
      'status', case when m.status = 'active' and m.expires_at is not null and m.expires_at <= now() then 'expired' else m.status end,
      'expires_at', m.expires_at,
      'project_count', (select count(*) from public.project_staff_assignments a
                         where a.organization_id = m.organization_id and a.user_id = m.user_id and a.status = 'active')
    ) order by m.status, m.role, coalesce(nullif(pr.display_name, ''), u.email))
    from public.organization_memberships m
    join auth.users u on u.id = m.user_id
    left join public.profiles pr on pr.user_id = m.user_id
    where m.organization_id = p_organization_id
  ), '[]'::jsonb);
end;
$$;

create function public.list_project_people(p_project_id uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v_org uuid;
begin
  select organization_id into v_org from public.projects where id = p_project_id;
  if v_org is null or not authz.is_org_owner(v_org) then
    raise exception 'NOT_FOUND' using errcode = '42501';
  end if;
  return jsonb_build_object(
    'staff', coalesce((
      select jsonb_agg(jsonb_build_object(
        'user_id', a.user_id, 'display_name', coalesce(nullif(pr.display_name, ''), u.email),
        'email', u.email, 'role', m.role, 'expires_at', a.expires_at
      ) order by coalesce(nullif(pr.display_name, ''), u.email))
      from public.project_staff_assignments a
      join public.organization_memberships m on m.organization_id = a.organization_id and m.user_id = a.user_id
      join auth.users u on u.id = a.user_id
      left join public.profiles pr on pr.user_id = a.user_id
      where a.project_id = p_project_id and a.status = 'active'
    ), '[]'::jsonb),
    'clients', coalesce((
      select jsonb_agg(jsonb_build_object(
        'user_id', c.user_id, 'display_name', coalesce(nullif(pr.display_name, ''), u.email), 'email', u.email
      ) order by coalesce(nullif(pr.display_name, ''), u.email))
      from public.project_client_access c
      join auth.users u on u.id = c.user_id
      left join public.profiles pr on pr.user_id = c.user_id
      where c.project_id = p_project_id and c.status = 'active'
    ), '[]'::jsonb)
  );
end;
$$;

-- What the signed-in user can open: staff workspaces and client portal projects.
create function public.list_my_workspaces() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v_user uuid := app_private.require_user();
begin
  return jsonb_build_object(
    'organizations', coalesce((
      select jsonb_agg(jsonb_build_object('id', o.id, 'name', o.name, 'name_en', o.name_en, 'role', m.role) order by o.name)
      from public.organization_memberships m
      join public.organizations o on o.id = m.organization_id
      where m.user_id = v_user and m.status = 'active'
        and (m.expires_at is null or m.expires_at > now()) and o.status <> 'archived'
    ), '[]'::jsonb),
    'portal_projects', coalesce((
      select jsonb_agg(jsonb_build_object('project_id', p.id, 'display_name', p.display_name,
               'organization_name', o.name) order by p.display_name)
      from public.project_client_access c
      join public.projects p on p.id = c.project_id
      join public.organizations o on o.id = p.organization_id
      where c.user_id = v_user and c.status = 'active' and o.status <> 'archived'
    ), '[]'::jsonb),
    'is_platform_operator', authz.is_platform_operator()
  );
end;
$$;

-- Safe client projection. Only whitelisted fields; no staff, vendors or ledger.
-- Financial and progress sections arrive with Phases 2 and 4 and are null until then.
create function public.get_portal_project(p_project_id uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v_viewer text;
  r record;
begin
  perform app_private.require_user();
  if authz.has_client_access(p_project_id) then
    v_viewer := 'client';
  elsif authz.can_read_project(p_project_id) then
    v_viewer := 'staff_preview';
  else
    raise exception 'NOT_FOUND' using errcode = '42501';
  end if;
  select p.id, p.display_name, p.currency, p.timezone, p.status,
         o.name as org_name, o.name_en as org_name_en, o.accent_color, o.logo_file_id
    into r
    from public.projects p join public.organizations o on o.id = p.organization_id
   where p.id = p_project_id;
  return jsonb_build_object(
    'schema_version', 1,
    'viewer', v_viewer,
    'project', jsonb_build_object('id', r.id, 'display_name', r.display_name, 'currency', r.currency,
                                  'timezone', r.timezone, 'status', r.status),
    'brand', jsonb_build_object('display_name', r.org_name, 'display_name_en', r.org_name_en,
                                'accent', r.accent_color, 'logo_file_id', r.logo_file_id),
    'financials', null,
    'progress', null
  );
end;
$$;

create function public.update_my_profile(p_display_name text, p_preferred_locale text default null) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_user uuid := app_private.require_user();
begin
  if p_preferred_locale is not null and p_preferred_locale not in ('ar', 'en') then
    raise exception 'VALIDATION_ERROR:preferred_locale' using errcode = '22023';
  end if;
  insert into public.profiles (user_id, display_name, preferred_locale)
  values (v_user, left(btrim(coalesce(p_display_name, '')), 120), p_preferred_locale)
  on conflict (user_id) do update
    set display_name = excluded.display_name, preferred_locale = excluded.preferred_locale, updated_at = now();
end;
$$;

-- Execute grants: authenticated users only, except the invitation preview.
revoke all on function
  public.operator_create_organization(text, text, text),
  public.update_organization_settings(uuid, integer, text, text, text, text),
  public.create_invitation(uuid, text, text, public.member_role, uuid, timestamptz),
  public.list_invitations(uuid),
  public.revoke_invitation(uuid),
  public.get_invitation_preview(text),
  public.accept_invitation(text),
  public.create_project(uuid, text, text, text, text),
  public.assign_project_staff(uuid, uuid, timestamptz),
  public.unassign_project_staff(uuid, uuid),
  public.revoke_client_access(uuid, uuid),
  public.change_member_role(uuid, uuid, public.member_role, timestamptz),
  public.revoke_membership(uuid, uuid),
  public.list_organization_members(uuid),
  public.list_project_people(uuid),
  public.list_my_workspaces(),
  public.get_portal_project(uuid),
  public.update_my_profile(text, text)
from public, anon, authenticated;

grant execute on function
  public.operator_create_organization(text, text, text),
  public.update_organization_settings(uuid, integer, text, text, text, text),
  public.create_invitation(uuid, text, text, public.member_role, uuid, timestamptz),
  public.list_invitations(uuid),
  public.revoke_invitation(uuid),
  public.get_invitation_preview(text),
  public.accept_invitation(text),
  public.create_project(uuid, text, text, text, text),
  public.assign_project_staff(uuid, uuid, timestamptz),
  public.unassign_project_staff(uuid, uuid),
  public.revoke_client_access(uuid, uuid),
  public.change_member_role(uuid, uuid, public.member_role, timestamptz),
  public.revoke_membership(uuid, uuid),
  public.list_organization_members(uuid),
  public.list_project_people(uuid),
  public.list_my_workspaces(),
  public.get_portal_project(uuid),
  public.update_my_profile(text, text)
to authenticated;

grant execute on function public.get_invitation_preview(text) to anon;
