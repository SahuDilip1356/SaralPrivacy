-- 0003_infographics_bucket.sql — Supabase Storage bucket for blog
-- infographics (spec §7). Public read (these are published blog images);
-- writes come only through the service role, which bypasses storage RLS.
insert into storage.buckets (id, name, public)
values ('infographics', 'infographics', true)
on conflict (id) do update set public = true;
