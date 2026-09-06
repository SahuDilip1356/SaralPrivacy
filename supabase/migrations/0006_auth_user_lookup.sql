-- 0006_auth_user_lookup.sql — service-role helper: find an auth user id by
-- email. The auth schema is not exposed over PostgREST and the admin API has
-- no get-by-email, so the invite/revoke routes and tools/auth/provision.ts
-- use this RPC instead of paging listUsers().
--
-- security definer + search_path pinned; executable by service_role only.

create or replace function ops.auth_user_id_by_email(p_email text) returns uuid
  language sql stable security definer
  set search_path = ''
as $$
  select id from auth.users where lower(email) = lower(p_email) limit 1;
$$;

revoke all on function ops.auth_user_id_by_email(text) from public, anon, authenticated;
grant execute on function ops.auth_user_id_by_email(text) to service_role;

notify pgrst, 'reload schema';
