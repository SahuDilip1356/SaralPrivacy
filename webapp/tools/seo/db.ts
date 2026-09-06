// db.ts — persist inspection runs to Supabase (Mumbai) through PostgREST.
//
// Plain fetch, no SDK: the weekly GitHub Action then needs no `npm ci`. The
// ops schema is exposed to the service role by migration 0002; the two tables
// come from migration 0005_ops_seo_inspections.sql. Rows are the same shape as
// the JSON report, so the report file and the table never disagree.

import type { Bucket, PrevRecord, Report } from "./verdict.ts";

export type PrevRun = { run_at: string; sitemap_urls: string[]; records: PrevRecord[] };

export interface Db {
  fetchPrevRun(): Promise<PrevRun | null>;
  persist(report: Report): Promise<void>;
}

const PAGE = 500;

export function createDb(url: string, serviceKey: string): Db {
  const rest = `${url.replace(/\/$/, "")}/rest/v1`;
  const headers = (profile: "Accept-Profile" | "Content-Profile", extra: Record<string, string> = {}) => ({
    apikey: serviceKey,
    authorization: `Bearer ${serviceKey}`,
    [profile]: "ops",
    ...extra,
  });

  async function get<T>(path: string): Promise<T> {
    const res = await fetch(`${rest}/${path}`, { headers: headers("Accept-Profile") });
    if (!res.ok) throw new Error(`PostgREST GET ${path}: HTTP ${res.status} ${await res.text()}`);
    return (await res.json()) as T;
  }

  async function post(table: string, body: unknown): Promise<void> {
    const res = await fetch(`${rest}/${table}`, {
      method: "POST",
      headers: headers("Content-Profile", { "content-type": "application/json", prefer: "return=minimal" }),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`PostgREST POST ${table}: HTTP ${res.status} ${await res.text()}`);
  }

  return {
    async fetchPrevRun() {
      const runs = await get<Array<{ id: string; run_at: string; sitemap_urls: string[] | null }>>(
        "seo_runs?select=id,run_at,sitemap_urls&dry_run=eq.false&order=run_at.desc&limit=1",
      );
      if (runs.length === 0) return null;
      const run = runs[0];
      const records: PrevRecord[] = [];
      for (let offset = 0; ; offset += PAGE) {
        const page = await get<Array<{ url: string; bucket: Bucket; last_crawl_time: string | null }>>(
          `seo_inspections?select=url,bucket,last_crawl_time&run_id=eq.${run.id}&order=url.asc&limit=${PAGE}&offset=${offset}`,
        );
        records.push(...page);
        if (page.length < PAGE) break;
      }
      return { run_at: run.run_at, sitemap_urls: run.sitemap_urls ?? [], records };
    },

    async persist(rep) {
      await post("seo_runs", {
        id: rep.run_id,
        run_at: rep.run_at,
        site: rep.site,
        scope: rep.scope,
        dry_run: rep.dry_run,
        inspected: rep.inspected,
        errors: rep.errors,
        sitemap_url_count: rep.sitemap.url_count,
        sitemap_urls: rep.sitemap.urls,
        verdict_code: rep.verdict.code,
        summary: {
          verdict: rep.verdict,
          buckets: rep.buckets,
          watchlist_buckets: rep.watchlist_buckets,
          diff: rep.diff,
          crawled_not_indexed: rep.crawled_not_indexed,
          shortlist: rep.shortlist,
          newcomers: rep.sitemap.newcomers,
          sitemaps_in_gsc: rep.sitemaps_in_gsc,
        },
      });
      for (let i = 0; i < rep.urls.length; i += PAGE) {
        await post(
          "seo_inspections",
          rep.urls.slice(i, i + PAGE).map((r) => ({
            run_id: rep.run_id,
            run_at: rep.run_at,
            url: r.url,
            path: r.path,
            watchlist: r.watchlist,
            in_sitemap: r.in_sitemap,
            bucket: r.bucket,
            coverage_state: r.coverage_state,
            verdict: r.verdict,
            indexing_state: r.indexing_state,
            last_crawl_time: r.last_crawl_time,
            google_canonical: r.google_canonical,
            user_canonical: r.user_canonical,
            robots_txt_state: r.robots_txt_state,
            page_fetch_state: r.page_fetch_state,
            referring_urls: r.referring_urls,
            requested_indexing_at: r.requested_indexing_at,
            clicks_28d: r.search_28d?.clicks ?? null,
            impressions_28d: r.search_28d?.impressions ?? null,
            error: r.error,
            raw: r.raw,
          })),
        );
      }
    },
  };
}

/** PGRST205 = table not in the schema cache, i.e. migration 0005 not applied yet. */
export function isMissingTable(err: unknown): boolean {
  return err instanceof Error && /PGRST205|Could not find the table/.test(err.message);
}
