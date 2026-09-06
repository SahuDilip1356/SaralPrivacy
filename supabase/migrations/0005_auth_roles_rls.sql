-- 0005_auth_roles_rls.sql — Blueprint P3: first real RLS policies, keyed on
-- the role claim Supabase Auth carries in the JWT.
--
-- Role model:
--   auth.users.raw_app_meta_data->>'role'  ∈ {'admin','blogger'}
--   app_metadata is writable by the service role only, so a user can never
--   self-elevate. The claim surfaces as auth.jwt()->'app_metadata'->>'role'.
--
-- Assurance: every policy also requires aal2 (a verified TOTP factor on the
-- session). A password-only (aal1) session can read nothing.
--
-- Today the app talks to Postgres with the service role (bypasses RLS), so
-- these policies change no live route. They are the substrate P5 (tenancy)
-- builds on, and supabase/tests/rls_crossrole.sql proves they fail closed.

-- ── Helper predicates ────────────────────────────────────────────────────
create or replace function ops.jwt_role() returns text
  language sql stable
  set search_path = ''
as $$
  select nullif(coalesce(auth.jwt() -> 'app_metadata' ->> 'role', ''), '');
$$;

create or replace function ops.jwt_aal2() returns boolean
  language sql stable
  set search_path = ''
as $$
  select coalesce(auth.jwt() ->> 'aal', 'aal1') = 'aal2';
$$;

create or replace function ops.is_admin() returns boolean
  language sql stable
  set search_path = ''
as $$
  select ops.jwt_role() = 'admin' and ops.jwt_aal2();
$$;

create or replace function ops.is_blogger() returns boolean
  language sql stable
  set search_path = ''
as $$
  select ops.jwt_role() = 'blogger' and ops.jwt_aal2();
$$;

revoke all on function ops.jwt_role(), ops.jwt_aal2(), ops.is_admin(), ops.is_blogger() from public;
grant execute on function ops.jwt_role(), ops.jwt_aal2(), ops.is_admin(), ops.is_blogger()
  to authenticated, service_role;

-- ── Grants: `authenticated` may reach the tables; RLS decides the rows ────
-- (0001 revoked everything from anon + authenticated. anon stays revoked.)
grant usage on schema ops to authenticated;
grant usage on schema app to authenticated;
grant select, insert, update, delete on all tables in schema ops to authenticated;
grant select, insert, update, delete on all tables in schema app to authenticated;
alter default privileges in schema ops grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema app grant select, insert, update, delete on tables to authenticated;

-- ── admin_all: every ops.* / app.* table, admin ∧ aal2 ─────────────────────
do $$
declare t record;
begin
  for t in
    select schemaname, tablename from pg_tables
    where schemaname in ('ops', 'app')
  loop
    execute format('drop policy if exists admin_all on %I.%I', t.schemaname, t.tablename);
    execute format(
      'create policy admin_all on %I.%I for all to authenticated using (ops.is_admin()) with check (ops.is_admin())',
      t.schemaname, t.tablename
    );
  end loop;
end $$;

-- ── blogger: the blog editor surface only ───────────────────────────────
drop policy if exists blogger_blog_posts on ops.blog_posts;
create policy blogger_blog_posts on ops.blog_posts
  for all to authenticated
  using (ops.is_blogger())
  with check (ops.is_blogger());

drop policy if exists blogger_self on ops.blogger_accounts;
create policy blogger_self on ops.blogger_accounts
  for select to authenticated
  using (ops.is_blogger() and lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

notify pgrst, 'reload schema';
