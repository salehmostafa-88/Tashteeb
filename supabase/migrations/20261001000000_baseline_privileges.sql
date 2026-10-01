-- Baseline privilege hardening (docs/07-security.md, docs/04-architecture.md).
--
-- Supabase grants anon and authenticated full access to new objects in `public` by
-- default, and Postgres grants EXECUTE on new functions to PUBLIC. This project
-- requires every exposed table, sequence and function to be granted explicitly in
-- the same migration that creates it, alongside its RLS policies. Revoking the
-- defaults makes a forgotten grant fail closed instead of open.

alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated;

alter default privileges for role postgres in schema public
  revoke all on sequences from anon, authenticated;

alter default privileges for role postgres in schema public
  revoke execute on functions from public, anon, authenticated;

-- EXECUTE-to-PUBLIC is a global default; a schema-scoped revoke cannot remove it.
alter default privileges for role postgres
  revoke execute on functions from public;

-- Helpers and internal tables that must never be reachable through the Data API.
create schema if not exists app_private;
revoke all on schema app_private from public, anon, authenticated;

comment on schema app_private is
  'Internal helpers and non-exposed tables. Not in the API search path; no client role usage.';
