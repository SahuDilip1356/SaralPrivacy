-- rls_crossrole.sql — proves the P3 policies fail closed across roles and
-- assurance levels. Runs entirely inside Postgres: the JWT claims are
-- injected with set_config, so no password, no TOTP secret, no network.
--
-- Run (either):
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/rls_crossrole.sql
--   or paste the body into the Supabase MCP execute_sql / SQL editor.
--
-- Expected: NOTICE lines "ok: …" ×6 then "rls_crossrole: PASS".
-- Any violation raises an exception — the run fails as designed.

do $$
declare
  n_leads     int;
  n_posts     int;
  claims_admin_aal2   constant text := '{"role":"authenticated","aal":"aal2","email":"admin@test","app_metadata":{"role":"admin"}}';
  claims_admin_aal1   constant text := '{"role":"authenticated","aal":"aal1","email":"admin@test","app_metadata":{"role":"admin"}}';
  claims_blogger_aal2 constant text := '{"role":"authenticated","aal":"aal2","email":"saralprivacy@gmail.com","app_metadata":{"role":"blogger"}}';
  claims_norole_aal2  constant text := '{"role":"authenticated","aal":"aal2","email":"x@test","app_metadata":{}}';
  total_leads int;
  total_posts int;
begin
  -- Ground truth as the owner (no RLS)
  select count(*) into total_leads from ops.leads;
  select count(*) into total_posts from ops.blog_posts;
  if total_leads = 0 then
    raise exception 'precondition: ops.leads is empty — the test needs rows to prove denial';
  end if;

  set local role authenticated;

  -- 1. admin + aal2 → sees leads
  perform set_config('request.jwt.claims', claims_admin_aal2, true);
  select count(*) into n_leads from ops.leads;
  if n_leads <> total_leads then
    raise exception 'FAIL 1: admin aal2 saw % of % leads', n_leads, total_leads;
  end if;
  raise notice 'ok: admin aal2 reads ops.leads (% rows)', n_leads;

  -- 2. admin + aal1 (password only) → sees nothing
  perform set_config('request.jwt.claims', claims_admin_aal1, true);
  select count(*) into n_leads from ops.leads;
  if n_leads <> 0 then
    raise exception 'FAIL 2: admin aal1 saw % leads — MFA is not enforced at the row level', n_leads;
  end if;
  raise notice 'ok: admin aal1 denied on ops.leads';

  -- 3. blogger + aal2 → cross-role read of leads denied
  perform set_config('request.jwt.claims', claims_blogger_aal2, true);
  select count(*) into n_leads from ops.leads;
  if n_leads <> 0 then
    raise exception 'FAIL 3: blogger saw % leads — cross-role leak', n_leads;
  end if;
  raise notice 'ok: blogger aal2 denied on ops.leads';

  -- 4. blogger + aal2 → own surface allowed
  select count(*) into n_posts from ops.blog_posts;
  if n_posts <> total_posts then
    raise exception 'FAIL 4: blogger aal2 saw % of % blog_posts', n_posts, total_posts;
  end if;
  raise notice 'ok: blogger aal2 reads ops.blog_posts (% rows)', n_posts;

  -- 5. blogger + aal2 → cannot write outside its surface
  begin
    insert into ops.leads (name, email, company, source)
      values ('rls', 'rls-test@invalid', 'rls', 'rls_test');
    raise exception 'FAIL 5: blogger inserted into ops.leads';
  exception
    when insufficient_privilege then
      raise notice 'ok: blogger insert into ops.leads denied (42501)';
  end;

  -- 6. authenticated with no role claim → sees nothing anywhere
  perform set_config('request.jwt.claims', claims_norole_aal2, true);
  select count(*) into n_leads from ops.leads;
  select count(*) into n_posts from ops.blog_posts;
  if n_leads <> 0 or n_posts <> 0 then
    raise exception 'FAIL 6: role-less session saw leads=% posts=%', n_leads, n_posts;
  end if;
  raise notice 'ok: role-less aal2 session denied everywhere';

  raise notice 'rls_crossrole: PASS';
end $$;
