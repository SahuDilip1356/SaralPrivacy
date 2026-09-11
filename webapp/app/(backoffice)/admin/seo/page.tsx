import type { Metadata } from "next";
import { dbFromEnv, isMissingTable, type InspectionRow, type LedgerRow, type RunRow } from "@/lib/seo/db";
import { BUCKETS, type Bucket } from "@/lib/seo/verdict";
import { markRequested } from "./actions";
import RunButton from "./RunButton";

export const metadata: Metadata = { title: "SEO Watcher" };
export const dynamic = "force-dynamic";
export const revalidate = 0;

// ── Presentation ─────────────────────────────────────────────────────────────

const BUCKET_LABEL: Record<Bucket, string> = {
  indexed: "Indexed",
  discovered: "Discovered, never crawled",
  crawled_not_indexed: "Crawled, not indexed",
  unknown: "Unknown to Google",
  excluded: "Excluded",
  other: "Other",
  error: "Error",
};

// Pairs measured ≥ 4.5:1 on their tints (same family as the rest of /admin).
const BUCKET_BADGE: Record<Bucket, string> = {
  indexed: "bg-green-100 text-green-800",
  discovered: "bg-amber-100 text-amber-800",
  crawled_not_indexed: "bg-orange-100 text-orange-800",
  unknown: "bg-red-100 text-red-800",
  excluded: "bg-slate-200 text-slate-800",
  other: "bg-slate-200 text-slate-800",
  error: "bg-red-100 text-red-800",
};

const VERDICT_STYLE: Record<RunRow["verdict_code"], string> = {
  QUEUE_MOVED: "bg-green-50 border-green-200 text-green-900",
  STARVED: "bg-red-50 border-red-200 text-red-900",
  TOO_EARLY: "bg-blue-50 border-blue-200 text-blue-900",
  INSUFFICIENT_DATA: "bg-amber-50 border-amber-200 text-amber-900",
  SUSPECT_DATA: "bg-amber-50 border-amber-200 text-amber-900",
};

const day = (iso: string | null | undefined) => (iso ? iso.slice(0, 10) : "—");

function Badge({ bucket }: { bucket: Bucket }) {
  return <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${BUCKET_BADGE[bucket]}`}>{BUCKET_LABEL[bucket]}</span>;
}

function Tile({ label, value, sub, tone = "slate" }: { label: string; value: string | number; sub?: string; tone?: "slate" | "green" | "amber" | "blue" }) {
  const tones = {
    slate: "bg-slate-50 border-slate-200 text-slate-600",
    green: "bg-green-50 border-green-200 text-green-800",
    amber: "bg-amber-50 border-amber-200 text-amber-800",
    blue: "bg-blue-50 border-blue-200 text-blue-800",
  };
  return (
    <div className={`border rounded-xl p-5 ${tones[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-wider">{label}</p>
      <p className="text-3xl font-bold text-navy-700 mt-2">{value}</p>
      {sub && <p className="text-xs text-slate-600 mt-1">{sub}</p>}
    </div>
  );
}

// ── Data ─────────────────────────────────────────────────────────────────────

type PageData =
  | { state: "unconfigured" }
  | { state: "no-table" }
  | { state: "empty"; ledger: LedgerRow[] }
  | { state: "ready"; runs: RunRow[]; latest: RunRow; rows: InspectionRow[]; ledger: LedgerRow[] };

async function load(): Promise<PageData> {
  const db = dbFromEnv();
  if (!db) return { state: "unconfigured" };
  try {
    const [runs, ledger] = await Promise.all([db.listRuns(12), db.fetchLedger()]);
    if (runs.length === 0) return { state: "empty", ledger };
    const rows = await db.fetchInspections(runs[0].id);
    return { state: "ready", runs, latest: runs[0], rows, ledger };
  } catch (err) {
    if (isMissingTable(err)) return { state: "no-table" };
    throw err;
  }
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function SeoAdmin() {
  const data = await load();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-semibold text-navy-700 mb-2">SEO Watcher</h1>
      <p className="text-slate-600 mb-6">
        Search Console watcher: is Google crawling the pages that convert? Watchlist of 17 commercial URLs plus sitemap newcomers,
        inspected weekly (Mondays 09:30 IST) or on demand. The verdict follows the pre-agreed tree; the shortlist is what to press
        &ldquo;Request Indexing&rdquo; on — the button has no API, and a URL in the ledger is never shortlisted twice.
      </p>

      {data.state === "unconfigured" && (
        <Notice tone="amber">Supabase is not configured on this deployment (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).</Notice>
      )}
      {data.state === "no-table" && (
        <Notice tone="amber">The ops.seo_* tables are missing — apply supabase/migrations/0005_ops_seo_inspections.sql.</Notice>
      )}

      {(data.state === "ready" || data.state === "empty") && <RunButton />}

      {data.state === "empty" && <Notice tone="blue">No run recorded yet. Run one above, or from the CLI: tools/seo/inspect.ts.</Notice>}

      {data.state === "ready" && <Dashboard runs={data.runs} latest={data.latest} rows={data.rows} ledger={data.ledger} />}
    </div>
  );
}

function Notice({ tone, children }: { tone: "amber" | "blue"; children: React.ReactNode }) {
  const cls = tone === "amber" ? "bg-amber-50 border-amber-200 text-amber-900" : "bg-blue-50 border-blue-200 text-blue-900";
  return <div className={`border rounded-xl px-4 py-3 text-sm mb-8 ${cls}`}>{children}</div>;
}

function Dashboard({ runs, latest, rows, ledger }: { runs: RunRow[]; latest: RunRow; rows: InspectionRow[]; ledger: LedgerRow[] }) {
  const s = latest.summary;
  const watch = rows.filter((r) => r.watchlist);
  const crawled = watch.filter((r) => r.last_crawl_time);
  const impressions = rows.reduce((n, r) => n + (r.impressions_28d ?? 0), 0);
  const clicks = rows.reduce((n, r) => n + (r.clicks_28d ?? 0), 0);
  const ledgerUrls = new Set(ledger.map((l) => l.url));
  // The ledger may have grown since the run; hide what has been pressed since.
  const shortlist = (s?.shortlist ?? []).filter((x) => !ledgerUrls.has(x.url));
  const cni = rows.filter((r) => r.bucket === "crawled_not_indexed");
  const counts = s?.buckets ?? (Object.fromEntries(BUCKETS.map((b) => [b, rows.filter((r) => r.bucket === b).length])) as Record<Bucket, number>);

  return (
    <>
      {/* Verdict */}
      {s && (
        <div className={`border rounded-xl p-5 mb-8 ${VERDICT_STYLE[latest.verdict_code]}`}>
          <p className="text-xs font-semibold uppercase tracking-wider">
            Verdict · run of {day(latest.run_at)} · scope {latest.scope} · {latest.inspected} inspected, {latest.errors} errors
          </p>
          <p className="text-2xl font-bold mt-1">{latest.verdict_code}</p>
          <p className="mt-2 text-sm">{s.verdict.summary}</p>
          <p className="mt-2 text-sm font-medium">▶ {s.verdict.next}</p>
        </div>
      )}

      {/* Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        <Tile label="Watchlist crawled" value={`${crawled.length}/${watch.length}`} sub={`${watch.filter((r) => r.bucket === "indexed").length} indexed`} tone="green" />
        <Tile label="Indexed" value={counts.indexed} sub={`of ${latest.inspected} inspected`} tone="green" />
        <Tile label="Never crawled" value={counts.discovered} sub="discovered only" tone="amber" />
        <Tile label="Crawled, rejected" value={counts.crawled_not_indexed} sub={s ? `briefings hypothesis: ${s.crawled_not_indexed.hypothesis}` : undefined} tone="amber" />
        <Tile label="Unknown to Google" value={counts.unknown} sub="not even discovered" />
        <Tile label="28-day search" value={impressions.toLocaleString("en-IN")} sub={`impressions · ${clicks} clicks (${impressions ? ((clicks / impressions) * 100).toFixed(2) : "0"}% CTR)`} tone="blue" />
      </div>

      {/* Shortlist */}
      <h2 className="text-lg font-semibold text-navy-700 mb-1">Request-Indexing shortlist</h2>
      <p className="text-sm text-slate-600 mb-3">
        Open each in Search Console&rsquo;s URL Inspection, press <strong>Request Indexing</strong> (≈10/day quota), then mark it here so it
        leaves the list for good.
      </p>
      <div className="overflow-x-auto mb-10 bg-white border border-slate-200 rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="text-left px-3 py-2">URL</th>
              <th className="text-left px-3 py-2">State</th>
              <th className="text-left px-3 py-2">Why</th>
              <th className="text-right px-3 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {shortlist.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-4 text-slate-600">
                  Nothing to request.
                </td>
              </tr>
            )}
            {shortlist.map((x) => (
              <tr key={x.url} className="border-t border-slate-100">
                <td className="px-3 py-2">
                  <a href={inspectUrl(x.url)} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline break-all">
                    {new URL(x.url).pathname}
                  </a>
                </td>
                <td className="px-3 py-2">
                  <Badge bucket={x.bucket} />
                </td>
                <td className="px-3 py-2 text-slate-700">{x.reason}</td>
                <td className="px-3 py-2 text-right">
                  <form action={markRequested}>
                    <input type="hidden" name="url" value={x.url} />
                    <button type="submit" className="px-3 py-1.5 rounded-md text-xs font-semibold bg-navy-700 text-white hover:bg-navy-800">
                      Mark requested
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Watchlist */}
      <h2 className="text-lg font-semibold text-navy-700 mb-3">Watchlist — the 17 commercial pages</h2>
      <div className="overflow-x-auto mb-10 bg-white border border-slate-200 rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="text-left px-3 py-2">Path</th>
              <th className="text-left px-3 py-2">State</th>
              <th className="text-left px-3 py-2">Last crawled</th>
              <th className="text-left px-3 py-2">Requested</th>
              <th className="text-right px-3 py-2">Impr. / clicks (28d)</th>
            </tr>
          </thead>
          <tbody>
            {watch.map((r) => (
              <tr key={r.url} className="border-t border-slate-100">
                <td className="px-3 py-2 font-mono text-xs">{r.path}</td>
                <td className="px-3 py-2">
                  <Badge bucket={r.bucket} />
                </td>
                <td className="px-3 py-2">{r.last_crawl_time ? day(r.last_crawl_time) : <span className="text-red-800 font-semibold">never</span>}</td>
                <td className="px-3 py-2 text-slate-700">{r.requested_indexing_at ?? "—"}</td>
                <td className="px-3 py-2 text-right text-slate-700">
                  {r.impressions_28d ?? 0} / {r.clicks_28d ?? 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Crawled, not indexed */}
      <h2 className="text-lg font-semibold text-navy-700 mb-1">Crawled – currently not indexed ({cni.length})</h2>
      <p className="text-sm text-slate-600 mb-3">
        Google fetched these and declined. Hypothesis &ldquo;it&rsquo;s the briefings&rdquo;: <strong>{s?.crawled_not_indexed.hypothesis ?? "—"}</strong>
        {s && ` (briefings ${s.crawled_not_indexed.by.briefings}, blog ${s.crawled_not_indexed.by.blog}, other ${s.crawled_not_indexed.by.other})`}.
      </p>
      <ul className="mb-10 bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 text-sm">
        {cni.length === 0 && <li className="px-3 py-3 text-slate-600">None.</li>}
        {cni.map((r) => (
          <li key={r.url} className="px-3 py-2 flex justify-between gap-4">
            <span className="font-mono text-xs break-all">{r.path}</span>
            <span className="text-slate-600 shrink-0">crawled {day(r.last_crawl_time)}</span>
          </li>
        ))}
      </ul>

      {/* Trend */}
      <h2 className="text-lg font-semibold text-navy-700 mb-3">Runs — last {runs.length}</h2>
      <div className="overflow-x-auto mb-10 bg-white border border-slate-200 rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="text-left px-3 py-2">Run</th>
              <th className="text-left px-3 py-2">Scope</th>
              <th className="text-left px-3 py-2">Verdict</th>
              <th className="text-right px-3 py-2">Inspected</th>
              <th className="text-right px-3 py-2">Indexed</th>
              <th className="text-right px-3 py-2">Never crawled</th>
              <th className="text-right px-3 py-2">Crawled, rejected</th>
              <th className="text-right px-3 py-2">Unknown</th>
              <th className="text-right px-3 py-2">Newly crawled</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((r) => (
              <tr key={r.id} className="border-t border-slate-100">
                <td className="px-3 py-2">{day(r.run_at)}</td>
                <td className="px-3 py-2 text-slate-700">{r.scope}</td>
                <td className="px-3 py-2 font-semibold">{r.verdict_code}</td>
                <td className="px-3 py-2 text-right">{r.inspected}</td>
                <td className="px-3 py-2 text-right">{r.summary?.buckets.indexed ?? "—"}</td>
                <td className="px-3 py-2 text-right">{r.summary?.buckets.discovered ?? "—"}</td>
                <td className="px-3 py-2 text-right">{r.summary?.buckets.crawled_not_indexed ?? "—"}</td>
                <td className="px-3 py-2 text-right">{r.summary?.buckets.unknown ?? "—"}</td>
                <td className="px-3 py-2 text-right">{r.summary?.diff?.newly_crawled.length ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Ledger */}
      <h2 className="text-lg font-semibold text-navy-700 mb-3">Request-Indexing ledger ({ledger.length})</h2>
      <div className="overflow-x-auto mb-10 bg-white border border-slate-200 rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="text-left px-3 py-2">URL</th>
              <th className="text-left px-3 py-2">Requested</th>
              <th className="text-left px-3 py-2">Note</th>
            </tr>
          </thead>
          <tbody>
            {ledger.slice(0, 40).map((l) => (
              <tr key={l.url} className="border-t border-slate-100">
                <td className="px-3 py-2 font-mono text-xs break-all">{new URL(l.url).pathname}</td>
                <td className="px-3 py-2">{l.requested_at}</td>
                <td className="px-3 py-2 text-slate-700">{l.note ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/** Deep link into Search Console's URL Inspection for the property. */
function inspectUrl(url: string): string {
  return `https://search.google.com/search-console/inspect?resource_id=${encodeURIComponent("https://saralprivacy.com/")}&id=${encodeURIComponent(url)}`;
}
