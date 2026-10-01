-- Verifies the baseline: new public objects are closed to client roles until a
-- migration grants them explicitly. Runs inside a transaction and rolls back.
begin;
create extension if not exists pgtap with schema extensions;

select plan(12);

create table public.zz_probe (id integer primary key);
create sequence public.zz_probe_seq;
create function public.zz_probe_fn() returns integer language sql as 'select 1';

select ok(not has_table_privilege('anon', 'public.zz_probe', 'select'), 'anon: no implicit SELECT on new tables');
select ok(not has_table_privilege('anon', 'public.zz_probe', 'insert'), 'anon: no implicit INSERT on new tables');
select ok(not has_table_privilege('authenticated', 'public.zz_probe', 'select'), 'authenticated: no implicit SELECT on new tables');
select ok(not has_table_privilege('authenticated', 'public.zz_probe', 'insert'), 'authenticated: no implicit INSERT on new tables');
select ok(not has_table_privilege('authenticated', 'public.zz_probe', 'update'), 'authenticated: no implicit UPDATE on new tables');
select ok(not has_table_privilege('authenticated', 'public.zz_probe', 'delete'), 'authenticated: no implicit DELETE on new tables');
select ok(not has_sequence_privilege('authenticated', 'public.zz_probe_seq', 'usage'), 'authenticated: no implicit USAGE on new sequences');
select ok(not has_function_privilege('anon', 'public.zz_probe_fn()', 'execute'), 'anon: no implicit EXECUTE on new functions');
select ok(not has_function_privilege('authenticated', 'public.zz_probe_fn()', 'execute'), 'authenticated: no implicit EXECUTE on new functions');

select has_schema('app_private', 'app_private schema exists');
select ok(not has_schema_privilege('anon', 'app_private', 'usage'), 'anon: no USAGE on app_private');
select ok(not has_schema_privilege('authenticated', 'app_private', 'usage'), 'authenticated: no USAGE on app_private');

select * from finish();
rollback;
