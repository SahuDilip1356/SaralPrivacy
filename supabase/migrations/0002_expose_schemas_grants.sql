-- 0002_expose_schemas_grants.sql — make ops/app reachable by the app's
-- service-role key (spec §4: routes talk to Supabase through lib/db).
--
-- PostgREST only serves schemas listed in pgrst.db_schemas (default: public),
-- and custom schemas need explicit grants — RLS bypass is a role attribute,
-- table/schema privileges are not.

grant usage on schema ops to service_role;
grant usage on schema app to service_role;
grant all on all tables in schema ops to service_role;
grant all on all tables in schema app to service_role;
alter default privileges in schema ops grant all on tables to service_role;
alter default privileges in schema app grant all on tables to service_role;

-- Expose ops/app through the REST API (service-role requests set the schema
-- via the Accept-Profile/Content-Profile header supabase-js sends).
alter role authenticator set pgrst.db_schemas = 'public, graphql_public, ops, app';
notify pgrst, 'reload config';
-- Config and schema cache reload separately — without this, PostgREST accepts
-- the profile but still 404s the tables (PGRST205), verified live.
notify pgrst, 'reload schema';
