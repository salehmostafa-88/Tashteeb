-- Local development seed. SYNTHETIC DATA ONLY: never real studios, clients,
-- projects, amounts or receipts (CLAUDE.md, docs/07-security.md).
--
-- Every account below uses the local-only password `Local-Dev-Pass-1` and an
-- example.test address. These accounts exist only in local/CI databases.
--
--   operator@example.test      platform operator (creates studios)
--   owner.a@example.test       owner, Studio A (Arabic name)
--   finance.a@example.test     finance, Studio A, assigned to A-001
--   engineer.a@example.test    engineer, Studio A, assigned to A-001
--   unassigned.a@example.test  engineer, Studio A, no project
--   client1@example.test       client of A-001
--   owner.b@example.test       owner, Studio B
--   client2@example.test       client of B-001

create temporary table seed_users (id uuid, email text, display_name text, locale text) on commit drop;
insert into seed_users values
  ('10000000-0000-4000-8000-000000000009', 'operator@example.test', 'Platform Operator', 'en'),
  ('10000000-0000-4000-8000-000000000001', 'owner.a@example.test', 'سارة المالكة', 'ar'),
  ('10000000-0000-4000-8000-000000000002', 'finance.a@example.test', 'محمد المحاسب', 'ar'),
  ('10000000-0000-4000-8000-000000000003', 'engineer.a@example.test', 'أحمد مهندس الموقع', 'ar'),
  ('10000000-0000-4000-8000-000000000004', 'unassigned.a@example.test', 'Unassigned Engineer', 'en'),
  ('10000000-0000-4000-8000-000000000006', 'client1@example.test', 'عميل تجريبي ١', 'ar'),
  ('10000000-0000-4000-8000-000000000007', 'owner.b@example.test', 'Studio B Owner', 'en'),
  ('10000000-0000-4000-8000-000000000008', 'client2@example.test', 'Demo Client 2', 'en');

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change,
  email_change_token_current, phone_change, phone_change_token, reauthentication_token
)
select
  '00000000-0000-0000-0000-000000000000', id, 'authenticated', 'authenticated', email,
  extensions.crypt('Local-Dev-Pass-1', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('display_name', display_name), now(), now(),
  '', '', '', '', '', '', '', ''
from seed_users;

insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
select gen_random_uuid(), id, id::text, 'email',
       jsonb_build_object('sub', id::text, 'email', email, 'email_verified', true),
       now(), now(), now()
from seed_users;

update public.profiles p set preferred_locale = s.locale from seed_users s where p.user_id = s.id;

insert into app_private.platform_operators (user_id) values ('10000000-0000-4000-8000-000000000009');

insert into public.organizations (id, name, name_en, accent_color) values
  ('aaaaaaaa-0000-4000-8000-000000000000', 'استوديو تجريبي أ', 'Demo Studio A', '#1F6F78'),
  ('bbbbbbbb-0000-4000-8000-000000000000', 'Demo Studio B', null, null);

insert into public.organization_memberships (organization_id, user_id, role) values
  ('aaaaaaaa-0000-4000-8000-000000000000', '10000000-0000-4000-8000-000000000001', 'owner'),
  ('aaaaaaaa-0000-4000-8000-000000000000', '10000000-0000-4000-8000-000000000002', 'finance'),
  ('aaaaaaaa-0000-4000-8000-000000000000', '10000000-0000-4000-8000-000000000003', 'engineer'),
  ('aaaaaaaa-0000-4000-8000-000000000000', '10000000-0000-4000-8000-000000000004', 'engineer'),
  ('bbbbbbbb-0000-4000-8000-000000000000', '10000000-0000-4000-8000-000000000007', 'owner');

insert into public.projects (id, organization_id, code, display_name, currency) values
  ('aaaaaaaa-0000-4000-8000-0000000000a1', 'aaaaaaaa-0000-4000-8000-000000000000', 'A-001', 'شقة تجريبية — التجمع', 'EGP'),
  ('aaaaaaaa-0000-4000-8000-0000000000a2', 'aaaaaaaa-0000-4000-8000-000000000000', 'A-002', 'Demo Office Fit-out', 'EGP'),
  ('bbbbbbbb-0000-4000-8000-0000000000b1', 'bbbbbbbb-0000-4000-8000-000000000000', 'B-001', 'Demo Villa', 'USD'),
  ('bbbbbbbb-0000-4000-8000-0000000000b2', 'bbbbbbbb-0000-4000-8000-000000000000', 'B-002', 'Demo Shop', 'EGP');

insert into public.project_staff_assignments (organization_id, project_id, user_id) values
  ('aaaaaaaa-0000-4000-8000-000000000000', 'aaaaaaaa-0000-4000-8000-0000000000a1', '10000000-0000-4000-8000-000000000002'),
  ('aaaaaaaa-0000-4000-8000-000000000000', 'aaaaaaaa-0000-4000-8000-0000000000a1', '10000000-0000-4000-8000-000000000003');

insert into public.project_client_access (organization_id, project_id, user_id) values
  ('aaaaaaaa-0000-4000-8000-000000000000', 'aaaaaaaa-0000-4000-8000-0000000000a1', '10000000-0000-4000-8000-000000000006'),
  ('bbbbbbbb-0000-4000-8000-000000000000', 'bbbbbbbb-0000-4000-8000-0000000000b1', '10000000-0000-4000-8000-000000000008');
