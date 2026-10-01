-- Phase 1 isolation gate: SEC-01..07, SEC-11, SEC-13 through direct database and RPC access.
-- Synthetic fixture only. Everything runs in one transaction and rolls back.
begin;
create extension if not exists pgtap with schema extensions;

-- pgTAP must be callable while impersonating client roles (test transaction only).
do $$
declare s text;
begin
  select extnamespace::regnamespace::text into s from pg_extension where extname = 'pgtap';
  execute format('grant usage on schema %I to anon, authenticated', s);
  execute format('grant execute on all functions in schema %I to anon, authenticated', s);
end $$;

select plan(64);

-- ---------------------------------------------------------------------------
-- Fixture (as postgres)
-- ---------------------------------------------------------------------------
insert into auth.users (id, email, aud, role, raw_user_meta_data) values
  ('10000000-0000-4000-8000-000000000001', 'owner.a@example.test', 'authenticated', 'authenticated', '{"display_name":"مالك أ"}'),
  ('10000000-0000-4000-8000-000000000002', 'finance.a@example.test', 'authenticated', 'authenticated', '{}'),
  ('10000000-0000-4000-8000-000000000003', 'engineer.a@example.test', 'authenticated', 'authenticated', '{}'),
  ('10000000-0000-4000-8000-000000000004', 'unassigned.a@example.test', 'authenticated', 'authenticated', '{}'),
  ('10000000-0000-4000-8000-000000000005', 'collab.a@example.test', 'authenticated', 'authenticated', '{}'),
  ('10000000-0000-4000-8000-000000000006', 'client1@example.test', 'authenticated', 'authenticated', '{}'),
  ('10000000-0000-4000-8000-000000000007', 'owner.b@example.test', 'authenticated', 'authenticated', '{}'),
  ('10000000-0000-4000-8000-000000000008', 'client2@example.test', 'authenticated', 'authenticated', '{}'),
  ('10000000-0000-4000-8000-000000000009', 'operator@example.test', 'authenticated', 'authenticated', '{}'),
  ('10000000-0000-4000-8000-000000000010', 'new.engineer@example.test', 'authenticated', 'authenticated', '{}');

insert into app_private.platform_operators (user_id) values ('10000000-0000-4000-8000-000000000009');

insert into public.organizations (id, name) values
  ('aaaaaaaa-0000-4000-8000-000000000000', 'استوديو تجريبي أ'),
  ('bbbbbbbb-0000-4000-8000-000000000000', 'Demo Studio B');

insert into public.organization_memberships (organization_id, user_id, role, expires_at) values
  ('aaaaaaaa-0000-4000-8000-000000000000', '10000000-0000-4000-8000-000000000001', 'owner', null),
  ('aaaaaaaa-0000-4000-8000-000000000000', '10000000-0000-4000-8000-000000000002', 'finance', null),
  ('aaaaaaaa-0000-4000-8000-000000000000', '10000000-0000-4000-8000-000000000003', 'engineer', null),
  ('aaaaaaaa-0000-4000-8000-000000000000', '10000000-0000-4000-8000-000000000004', 'engineer', null),
  ('aaaaaaaa-0000-4000-8000-000000000000', '10000000-0000-4000-8000-000000000005', 'collaborator', now() - interval '1 day'),
  ('bbbbbbbb-0000-4000-8000-000000000000', '10000000-0000-4000-8000-000000000007', 'owner', null);

insert into public.projects (id, organization_id, code, display_name, currency) values
  ('aaaaaaaa-0000-4000-8000-0000000000a1', 'aaaaaaaa-0000-4000-8000-000000000000', 'A-001', 'شقة تجريبية', 'EGP'),
  ('aaaaaaaa-0000-4000-8000-0000000000a2', 'aaaaaaaa-0000-4000-8000-000000000000', 'A-002', 'Demo Office', 'EGP'),
  ('bbbbbbbb-0000-4000-8000-0000000000b1', 'bbbbbbbb-0000-4000-8000-000000000000', 'B-001', 'Demo Villa', 'USD'),
  ('bbbbbbbb-0000-4000-8000-0000000000b2', 'bbbbbbbb-0000-4000-8000-000000000000', 'B-002', 'Demo Shop', 'EGP');

insert into public.project_staff_assignments (organization_id, project_id, user_id) values
  ('aaaaaaaa-0000-4000-8000-000000000000', 'aaaaaaaa-0000-4000-8000-0000000000a1', '10000000-0000-4000-8000-000000000003'),
  ('aaaaaaaa-0000-4000-8000-000000000000', 'aaaaaaaa-0000-4000-8000-0000000000a1', '10000000-0000-4000-8000-000000000002'),
  ('aaaaaaaa-0000-4000-8000-000000000000', 'aaaaaaaa-0000-4000-8000-0000000000a2', '10000000-0000-4000-8000-000000000005');

insert into public.project_client_access (organization_id, project_id, user_id) values
  ('aaaaaaaa-0000-4000-8000-000000000000', 'aaaaaaaa-0000-4000-8000-0000000000a1', '10000000-0000-4000-8000-000000000006'),
  ('bbbbbbbb-0000-4000-8000-000000000000', 'bbbbbbbb-0000-4000-8000-0000000000b1', '10000000-0000-4000-8000-000000000008');

-- ---------------------------------------------------------------------------
-- Schema-level guarantees (SEC-13)
-- ---------------------------------------------------------------------------
select is(
  (select count(*)::int from pg_tables where schemaname = 'public' and not rowsecurity), 0,
  'RLS is enabled on every public table');

select is(
  (select count(*)::int from pg_tables t where schemaname = 'public'
     and has_table_privilege('anon', format('%I.%I', t.schemaname, t.tablename), 'select')), 0,
  'anon cannot SELECT any public table');

select is(
  (select count(*)::int from pg_tables t where schemaname = 'public'
     and (has_table_privilege('authenticated', format('%I.%I', t.schemaname, t.tablename), 'insert')
       or has_table_privilege('authenticated', format('%I.%I', t.schemaname, t.tablename), 'update')
       or has_table_privilege('authenticated', format('%I.%I', t.schemaname, t.tablename), 'delete'))), 0,
  'authenticated has no direct INSERT/UPDATE/DELETE on public tables');

select is(
  (select count(*)::int from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname in ('public', 'authz', 'app_private') and p.prosecdef
      and not exists (select 1 from unnest(coalesce(p.proconfig, '{}')) c where c like 'search_path=%')), 0,
  'every SECURITY DEFINER function pins search_path');

select is(
  (select array_agg(p.proname::text order by p.proname) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and has_function_privilege('anon', p.oid, 'execute')),
  array['get_invitation_preview'],
  'anon can execute only the invitation preview');

select ok(not has_schema_privilege('authenticated', 'app_private', 'usage'), 'app_private stays unreachable');

select is(
  (select display_name from public.profiles where user_id = '10000000-0000-4000-8000-000000000001'), 'مالك أ',
  'new auth users get a profile with their Arabic display name preserved');

-- ---------------------------------------------------------------------------
-- Owner of A (SEC-01, SEC-02, SEC-07)
-- ---------------------------------------------------------------------------
select set_config('role', 'authenticated', true),
       set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated"}', true),
       set_config('request.headers', '{"x-device-id":"d0d0d0d0-0000-4000-8000-000000000001"}', true);

select results_eq('select id from public.organizations', $$values ('aaaaaaaa-0000-4000-8000-000000000000'::uuid)$$,
  'owner A sees only organization A');
select is((select count(*)::int from public.projects), 2, 'owner A sees both A projects');
select is((select count(*)::int from public.projects where organization_id = 'bbbbbbbb-0000-4000-8000-000000000000'), 0,
  'owner A cannot read organization B projects by id');
select is((select count(*)::int from public.organization_memberships where organization_id = 'bbbbbbbb-0000-4000-8000-000000000000'), 0,
  'owner A cannot read organization B memberships');
select throws_ok($$select public.create_project('bbbbbbbb-0000-4000-8000-000000000000', 'X-1', 'x', 'EGP')$$,
  '42501', 'FORBIDDEN', 'owner A cannot create a project in B');
select throws_ok($$select public.list_organization_members('bbbbbbbb-0000-4000-8000-000000000000')$$,
  '42501', 'FORBIDDEN', 'owner A cannot list B members');
select throws_ok($$select public.get_portal_project('bbbbbbbb-0000-4000-8000-0000000000b1')$$,
  '42501', 'NOT_FOUND', 'owner A cannot open B portal');
select throws_ok($$select public.assign_project_staff('bbbbbbbb-0000-4000-8000-0000000000b1', '10000000-0000-4000-8000-000000000003')$$,
  '42501', 'NOT_FOUND', 'owner A cannot assign staff on a B project');
select throws_ok($$insert into public.projects (organization_id, code, display_name, currency) values ('aaaaaaaa-0000-4000-8000-000000000000', 'Z-1', 'z', 'EGP')$$,
  '42501', null, 'direct INSERT into projects is denied');
select throws_ok($$update public.organizations set name = 'hijack'$$,
  '42501', null, 'direct UPDATE of organizations is denied');
select throws_ok($$insert into public.audit_events (organization_id, action, entity_type) values ('aaaaaaaa-0000-4000-8000-000000000000', 'x', 'y')$$,
  '42501', null, 'direct INSERT into audit_events is denied');
select throws_ok($$select * from public.invitations$$, '42501', null, 'invitations table is not readable directly');

select lives_ok($$select public.create_project('aaaaaaaa-0000-4000-8000-000000000000', 'A-003', 'مشروع ٣', 'EGP')$$,
  'owner A can create a project through the command');
select throws_ok($$select public.create_project('aaaaaaaa-0000-4000-8000-000000000000', 'a-003', 'dup', 'EGP')$$,
  '23505', 'CONFLICT:code', 'project codes are unique per organization, case-insensitively');
select throws_ok($$select public.create_project('aaaaaaaa-0000-4000-8000-000000000000', 'A-004', 'x', 'KWD')$$,
  '23514', null, 'unsupported currency is rejected');
select results_eq(
  $$select actor_id, device_id from public.audit_events where action = 'project.created'$$,
  $$values ('10000000-0000-4000-8000-000000000001'::uuid, 'd0d0d0d0-0000-4000-8000-000000000001'::uuid)$$,
  'audit actor comes from the session and the device id from the request header');
select throws_ok($$select public.operator_create_organization('Rogue', 'x@example.test')$$,
  '42501', 'FORBIDDEN', 'a studio owner is not a platform operator');

-- Last-owner protection
select throws_ok($$select public.revoke_membership('aaaaaaaa-0000-4000-8000-000000000000', '10000000-0000-4000-8000-000000000001')$$,
  '23514', 'LAST_OWNER', 'the last owner cannot be removed');
select throws_ok($$select public.change_member_role('aaaaaaaa-0000-4000-8000-000000000000', '10000000-0000-4000-8000-000000000001', 'finance')$$,
  '23514', 'LAST_OWNER', 'the last owner cannot be demoted');
select throws_ok($$select public.change_member_role('aaaaaaaa-0000-4000-8000-000000000000', '10000000-0000-4000-8000-000000000004', 'collaborator')$$,
  '22023', 'VALIDATION_ERROR:expires_at', 'collaborators must have an expiry');

-- Invitations (SEC-11)
create temporary table tokens (name text primary key, token text) on commit drop;
grant all on tokens to authenticated, anon;
insert into tokens select 'engineer', public.create_invitation('aaaaaaaa-0000-4000-8000-000000000000', 'staff', ' New.Engineer@Example.TEST ', 'engineer', 'aaaaaaaa-0000-4000-8000-0000000000a2') ->> 'token';
insert into tokens select 'expired', public.create_invitation('aaaaaaaa-0000-4000-8000-000000000000', 'staff', 'new.engineer@example.test', 'finance') ->> 'token';
insert into tokens select 'revoked', public.create_invitation('aaaaaaaa-0000-4000-8000-000000000000', 'client', 'client2@example.test', null, 'aaaaaaaa-0000-4000-8000-0000000000a1') ->> 'token';
select ok((select token ~ '^[0-9a-f]{64}$' from tokens where name = 'engineer'), 'invitation tokens are 256-bit random hex');
select throws_ok($$select public.create_invitation('aaaaaaaa-0000-4000-8000-000000000000', 'client', 'c@example.test', null, 'bbbbbbbb-0000-4000-8000-0000000000b1')$$,
  '42501', 'NOT_FOUND', 'cannot invite a client to another organization''s project');
select is(jsonb_array_length(public.list_invitations('aaaaaaaa-0000-4000-8000-000000000000')), 3,
  'owner lists pending invitations');

reset role;
select is((select count(*)::int from public.invitations i join tokens t on i.token_hash = extensions.digest(t.token, 'sha256')), 3,
  'stored invitations match the token hashes');
select is((select count(*)::int from public.invitations where token_hash::text like '%' || (select token from tokens where name = 'engineer') || '%'), 0,
  'raw tokens are never stored');
update public.invitations set expires_at = now() - interval '1 minute'
 where token_hash = extensions.digest((select token from tokens where name = 'expired'), 'sha256');
update public.invitations set revoked_at = now()
 where token_hash = extensions.digest((select token from tokens where name = 'revoked'), 'sha256');

select set_config('role', 'anon', true), set_config('request.jwt.claims', '{"role":"anon"}', true);
select is(public.get_invitation_preview((select token from tokens where name = 'engineer')) ->> 'status', 'valid', 'anon can preview a valid invitation');
select is(public.get_invitation_preview((select token from tokens where name = 'expired')) ->> 'status', 'expired', 'preview reports expiry');
select is(public.get_invitation_preview((select token from tokens where name = 'revoked')) ->> 'status', 'revoked', 'preview reports revocation');
select is(public.get_invitation_preview(repeat('0', 64)) ->> 'status', 'not_found', 'unknown token is not found');
select throws_ok($$select public.accept_invitation((select token from tokens where name = 'engineer'))$$,
  '42501', null, 'anon cannot accept invitations');

-- Wrong person tries the token
select set_config('role', 'authenticated', true),
       set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000004","role":"authenticated"}', true);
select throws_ok($$select public.accept_invitation((select token from tokens where name = 'engineer'))$$,
  '42501', 'INVITATION_EMAIL_MISMATCH', 'an invitation is bound to its email');

-- Intended person accepts
select set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000010","role":"authenticated"}', true);
select is(public.accept_invitation((select token from tokens where name = 'engineer')) ->> 'kind', 'staff', 'invited engineer accepts');
select results_eq('select id from public.projects', $$values ('aaaaaaaa-0000-4000-8000-0000000000a2'::uuid)$$,
  'accepted engineer sees only the assigned project');
select throws_ok($$select public.accept_invitation((select token from tokens where name = 'engineer'))$$,
  '22023', 'INVITATION_INVALID', 'a token cannot be reused');
select throws_ok($$select public.accept_invitation((select token from tokens where name = 'expired'))$$,
  '22023', 'INVITATION_EXPIRED', 'an expired token is refused');
select throws_ok($$select public.accept_invitation((select token from tokens where name = 'revoked'))$$,
  '22023', 'INVITATION_INVALID', 'a revoked token is refused');

-- ---------------------------------------------------------------------------
-- Assigned engineer, unassigned staff and expired collaborator (SEC-03)
-- ---------------------------------------------------------------------------
select set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000003","role":"authenticated"}', true);
select results_eq('select id from public.projects', $$values ('aaaaaaaa-0000-4000-8000-0000000000a1'::uuid)$$,
  'assigned engineer sees only the assigned project');
select throws_ok($$select public.list_organization_members('aaaaaaaa-0000-4000-8000-000000000000')$$,
  '42501', 'FORBIDDEN', 'engineer cannot list members');
select throws_ok($$select public.create_invitation('aaaaaaaa-0000-4000-8000-000000000000', 'staff', 'x@example.test', 'owner')$$,
  '42501', 'FORBIDDEN', 'engineer cannot invite (no escalation to owner)');
select is(public.get_portal_project('aaaaaaaa-0000-4000-8000-0000000000a1') ->> 'viewer', 'staff_preview',
  'assigned staff can preview the client view of their project');

select set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000004","role":"authenticated"}', true);
select is((select count(*)::int from public.projects), 0, 'unassigned staff see no projects');
select throws_ok($$select public.get_portal_project('aaaaaaaa-0000-4000-8000-0000000000a1')$$,
  '42501', 'NOT_FOUND', 'unassigned staff cannot open a project portal');

select set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000005","role":"authenticated"}', true);
select is((select count(*)::int from public.organizations), 0, 'expired collaborator loses organization access');
select is((select count(*)::int from public.projects), 0, 'expired collaborator loses project access despite an assignment');

-- ---------------------------------------------------------------------------
-- Clients (SEC-04)
-- ---------------------------------------------------------------------------
select set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000006","role":"authenticated"}', true);
select is((select count(*)::int from public.projects), 0, 'client cannot read staff project rows');
select is((select count(*)::int from public.organizations), 0, 'client cannot read organization rows');
select is(public.get_portal_project('aaaaaaaa-0000-4000-8000-0000000000a1') ->> 'viewer', 'client', 'client opens the granted portal');
select is(
  (select array_agg(k order by k) from jsonb_object_keys(public.get_portal_project('aaaaaaaa-0000-4000-8000-0000000000a1')) k),
  array['brand', 'financials', 'progress', 'project', 'schema_version', 'viewer'],
  'portal payload contains only whitelisted sections');
select throws_ok($$select public.get_portal_project('bbbbbbbb-0000-4000-8000-0000000000b1')$$,
  '42501', 'NOT_FOUND', 'client cannot open another studio''s project');
select is(jsonb_array_length(public.list_my_workspaces() -> 'portal_projects'), 1, 'client workspace lists one portal project');

-- ---------------------------------------------------------------------------
-- Revocation takes effect with the same token (SEC-05)
-- ---------------------------------------------------------------------------
select set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated"}', true);
select lives_ok($$select public.revoke_client_access('aaaaaaaa-0000-4000-8000-0000000000a1', '10000000-0000-4000-8000-000000000006')$$, 'owner revokes client access');
select lives_ok($$select public.revoke_membership('aaaaaaaa-0000-4000-8000-000000000000', '10000000-0000-4000-8000-000000000003')$$, 'owner revokes engineer membership');

select set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000006","role":"authenticated"}', true);
select throws_ok($$select public.get_portal_project('aaaaaaaa-0000-4000-8000-0000000000a1')$$,
  '42501', 'NOT_FOUND', 'revoked client is denied immediately');
select set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000003","role":"authenticated"}', true);
select is((select count(*)::int from public.projects), 0, 'revoked engineer is denied immediately');

-- ---------------------------------------------------------------------------
-- Cross-tenant references are impossible (SEC-06) and audit is append-only
-- ---------------------------------------------------------------------------
reset role;
select throws_ok($$insert into public.project_staff_assignments (organization_id, project_id, user_id) values ('aaaaaaaa-0000-4000-8000-000000000000', 'bbbbbbbb-0000-4000-8000-0000000000b1', '10000000-0000-4000-8000-000000000002')$$,
  '23503', null, 'assignment cannot pair organization A with a B project');
select throws_ok($$insert into public.project_client_access (organization_id, project_id, user_id) values ('bbbbbbbb-0000-4000-8000-000000000000', 'aaaaaaaa-0000-4000-8000-0000000000a1', '10000000-0000-4000-8000-000000000008')$$,
  '23503', null, 'client grant cannot pair organization B with an A project');
select throws_ok($$update public.audit_events set action = 'tampered'$$, '42501', 'audit_events is append-only',
  'audit events cannot be modified even by the table owner role');

select * from finish();
rollback;
