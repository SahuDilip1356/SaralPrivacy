// db.ts — Supabase (Mumbai) persistence for the SEO watcher, through PostgREST.
//
// Plain fetch, no SDK: the weekly GitHub Action then needs no `npm ci`, and the
// admin page, the API route and the CLI all share this one module. The ops
// schema is exposed to the service role by migration 0002; the three tables
// (seo_runs, seo_inspections, seo_index_requests) come from migration 0005.

import type { Breakdown, Bucket, Diff, PrevRecord, Report, ShortlistItem, Verdict } from "./verdict.ts";
import { pathOf } from "./verdict.ts";
import type { SitemapEntry } from "./gsc.ts";

export type PrevRun = { run_at: string; sitemap_urls: string[]; records: PrevRecord[] };

export type RunSummary = {
  verdict: Verdict;
  buckets: Record<Bucket, number>;
  watchlist_buckets: Record<Bucket, number>;
  diff: Diff | null;
  crawled_not_indexed: Breakdown;
  shortlist: ShortlistItem[];
  newcomers: string[];
  sitemaps_in_gsc: SitemapEntry[];
};

export type RunRow = {
  id: string;
  run_at: string;
  site: string;
  scope: string;
  dry_run: boolean;
  inspected: number;
  errors: number;
  sitemap_url_count: number;
  verdict_code: Verdict["code"];
  summary: RunSummary | null;
};

export type InspectionRow = {
  url: string;
  path: string;
  watchlist: boolean;
  in_sitemap: boolean;
  bucket: Bucket;
  coverage_state: string | null;
  last_crawl_time: string | null;
  requested_indexing_at: string | null;
  clicks_28d: number | null;
  impressions_28d: number | null;
  google_canonical: string | null;
  error: string | null;
};

export type LedgerRow = { url: string; requested_at: string; note: string | null };

export interface Db {
  fetchPrevRun(): Promise<PrevRun | null>;
  persist(report: Report): Promise<void>;
  listRuns(limit?: number): Promise<RunRow[]>;
  fetchInspections(runId: string): Promise<InspectionRow[]>;
  fetchLedger(): Promise<LedgerRow[]>;
  addIndexRequest(url: string, requestedAt: string, note?: string): Promise<void>;
}

const PAGE = 500;
const INSPECTION_FIELDS =
  "url,path,watchlist,in_sitemap,bucket,coverage_state,last_crawl_time,requested_indexing_at,clicks_28d,impressions_28d,google_canonical,error";

/** Env-configured client, or null when SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are absent. */
export function dbFromEnv(): Db | null {
  const url = (process.env.SUPABASE_URL || "").trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  return url && key ? createDb(url, key) : null;
}

/** Ledger rows → the path-keyed map verdict.ts expects. */
export function ledgerToMap(rows: readonly LedgerRow[]): Record<string, string> {
  return Object.fromEntries(rows.map((r) => [pathOf(r.url), r.requested_at]));
}

export function createDb(url: string, serviceKey: string): Db {
  const rest = `${url.replace(/\/$/, "")}/rest/v1`;
  const headers = (profile: "Accept-Profile" | "Content-Profile", extra: Record<string, string> = {}) => ({
    apikey: serviceKey,
    authorization: `Bearer ${serviceKey}`,
    [profile]: "ops",
    ...extra,
  });

  async function get<T>(path: string): Promise<T> {
    const res = await fetch(`${rest}/${path}`, { headers: headers("Accept-Profile"), cache: "no-store" });
    if (!res.ok) throw new Error(`PostgREST GET ${path}: HTTP ${res.status} ${await res.text()}`);
    return (await res.json()) as T;
  }

  async function post(path: string, body: unknown, prefer = "return=minimal"): Promise<void> {
    const res = await fetch(`${rest}/${path}`, {
      method: "POST",
      headers: headers("Content-Profile", { "content-type": "application/json", prefer }),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`PostgREST POST ${path}: HTTP ${res.status} ${await res.text()}`);
  }

  async function pageAll<T>(pathFor: (offset: number) => string): Promise<T[]> {
    const out: T[] = [];
    for (let offset = 0; ; offset += PAGE) {
      const page = await get<T[]>(pathFor(offset));
      out.push(...page);
      if (page.length < PAGE) break;
    }
    return out;
  }

  return {
    async fetchPrevRun() {
      const runs = await get<Array<{ id: string; run_at: string; sitemap_urls: string[] | null }>>(
        "seo_runs?select=id,run_at,sitemap_urls&dry_run=eq.false&order=run_at.desc&limit=1",
      );
      if (runs.length === 0) return null;
      const run = runs[0];
      const records = await pageAll<PrevRecord>(
        (o) => `seo_inspections?select=url,bucket,last_crawl_time&run_id=eq.${run.id}&order=url.asc&limit=${PAGE}&offset=${o}`,
      );
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
        } satisfies RunSummary,
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

    listRuns(limit = 12) {
      return get<RunRow[]>(
        `seo_runs?select=id,run_at,site,scope,dry_run,inspected,errors,sitemap_url_count,verdict_code,summary&dry_run=eq.false&order=run_at.desc&limit=${limit}`,
      );
    },

    fetchInspections(runId) {
      return pageAll<InspectionRow>(
        (o) => `seo_inspections?select=${INSPECTION_FIELDS}&run_id=eq.${runId}&order=path.asc&limit=${PAGE}&offset=${o}`,
      );
    },

    fetchLedger() {
      return get<LedgerRow[]>("seo_index_requests?select=url,requested_at,note&order=requested_at.desc,url.asc&limit=1000");
    },

    async addIndexRequest(url, requestedAt, note) {
      await post("seo_index_requests?on_conflict=url", { url, requested_at: requestedAt, note: note ?? null }, "resolution=merge-duplicates,return=minimal");
    },
  };
}

/** PGRST205 = table not in the schema cache, i.e. migration 0005 not applied yet. */
export function isMissingTable(err: unknown): boolean {
  return err instanceof Error && /PGRST205|Could not find the table/.test(err.message);
}
