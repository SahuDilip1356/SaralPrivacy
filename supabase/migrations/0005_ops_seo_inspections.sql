-- 0005_ops_seo_inspections.sql — Search Console observability (tools/seo/inspect.ts).
--
-- One row per run in ops.seo_runs (verdict + summary), one row per inspected
-- URL per run in ops.seo_inspections (URL Inspection API result). The tool
-- reads the newest non-dry run to diff against and to detect sitemap newcomers.
--
-- Posture as 0001: RLS on, no policies — only the service role reads/writes.
-- 0002's default privileges already grant ops tables to service_role; the
-- explicit grants below make that not depend on which role runs this file.

create table ops.seo_runs (
  id uuid primary key default ops.uuid_generate_v7(),
  run_at timestamptz not null,
  site text not null,
  scope text not null check (scope in ('watchlist', 'newcomers', 'full')),
  dry_run boolean not null default false,
  inspected integer not null default 0,
  errors integer not null default 0,
  sitemap_url_count integer not null default 0,
  sitemap_urls jsonb,
  verdict_code text not null check (verdict_code in ('QUEUE_MOVED', 'STARVED', 'TOO_EARLY', 'INSUFFICIENT_DATA')),
  summary jsonb,
  created_at timestamptz not null default now()
);
create index seo_runs_run_at on ops.seo_runs (run_at desc);
alter table ops.seo_runs enable row level security;

create table ops.seo_inspections (
  id uuid primary key default ops.uuid_generate_v7(),
  run_id uuid not null references ops.seo_runs (id) on delete cascade,
  run_at timestamptz not null,
  url text not null,
  path text not null,
  watchlist boolean not null default false,
  in_sitemap boolean not null default false,
  bucket text not null check (bucket in ('indexed', 'discovered', 'crawled_not_indexed', 'unknown', 'excluded', 'other', 'error')),
  coverage_state text,
  verdict text,
  indexing_state text,
  last_crawl_time timestamptz,
  google_canonical text,
  user_canonical text,
  robots_txt_state text,
  page_fetch_state text,
  referring_urls integer,
  requested_indexing_at date,
  clicks_28d integer,
  impressions_28d integer,
  error text,
  raw jsonb,
  created_at timestamptz not null default now(),
  unique (run_id, url)
);
create index seo_inspections_url_run_at on ops.seo_inspections (url, run_at desc);
create index seo_inspections_run_bucket on ops.seo_inspections (run_id, bucket);
alter table ops.seo_inspections enable row level security;

grant all on ops.seo_runs to service_role;
grant all on ops.seo_inspections to service_role;

-- PostgREST caches the schema; without this the tables 404 (PGRST205) — see 0002.
notify pgrst, 'reload schema';
