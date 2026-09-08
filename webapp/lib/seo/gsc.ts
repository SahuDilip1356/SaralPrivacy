// gsc.ts — Google Search Console client for tools/seo/inspect.ts.
//
// Plain REST plus a hand-rolled service-account JWT (node:crypto), so the tool
// adds no dependency — same posture as tools/migrate-supabase/export.ts.
//
// Boundary (settled, do not revisit): URL Inspection, Search Analytics and
// Sitemaps are automated here. "Request Indexing" has no API for ordinary
// pages and the GSC UI is never puppeted — the tool only emits the shortlist.
//
// Quotas: URL Inspection = 2,000 inspections/day and 600/min per property.

import { createSign } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export type ServiceAccount = {
  client_email: string;
  private_key: string;
  token_uri?: string;
};

/** Subset of the URL Inspection API's indexStatusResult we keep. */
export type IndexStatusResult = {
  verdict?: string; // PASS | NEUTRAL | FAIL | VERDICT_UNSPECIFIED
  coverageState?: string; // e.g. "Submitted and indexed", "Discovered - currently not indexed"
  robotsTxtState?: string;
  indexingState?: string;
  lastCrawlTime?: string; // RFC 3339; absent (or epoch) when never crawled
  pageFetchState?: string;
  googleCanonical?: string;
  userCanonical?: string;
  sitemap?: string[];
  referringUrls?: string[];
  crawledAs?: string;
};

export type InspectionResult = {
  inspectionResultLink?: string;
  indexStatusResult?: IndexStatusResult;
};

export type SearchRow = {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type SitemapEntry = {
  path: string;
  lastSubmitted?: string;
  lastDownloaded?: string;
  isPending?: boolean;
  errors?: string;
  warnings?: string;
  contents?: Array<{ type?: string; submitted?: string; indexed?: string }>;
};

export interface GscApi {
  inspect(url: string): Promise<InspectionResult>;
  searchAnalytics(startDate: string, endDate: string): Promise<SearchRow[]>;
  listSitemaps(): Promise<SitemapEntry[]>;
  submitSitemap(feedpath: string): Promise<void>;
}

export class GscError extends Error {
  status: number;
  hint: string;
  constructor(status: number, body: string, hint: string) {
    super(`GSC HTTP ${status}: ${body.slice(0, 300)}${hint ? ` — ${hint}` : ""}`);
    this.status = status;
    this.hint = hint;
  }
}

const SCOPE = "https://www.googleapis.com/auth/webmasters";
const TOKEN_URI = "https://oauth2.googleapis.com/token";
const API = "https://searchconsole.googleapis.com";

/** Relative to webapp/. Gitignored at the repo root and in webapp/. */
export const DEFAULT_KEY_PATH = ".gsc-service-account.json";

/**
 * Key resolution, first hit wins:
 *   GSC_SERVICE_ACCOUNT_JSON (inline JSON — CI secret)
 *   GSC_SERVICE_ACCOUNT_PATH
 *   <webapp>/.gsc-service-account.json
 */
export function loadServiceAccount(appDir: string): { sa: ServiceAccount; source: string } | null {
  const inline = (process.env.GSC_SERVICE_ACCOUNT_JSON || "").trim();
  if (inline) return { sa: parseServiceAccount(inline, "GSC_SERVICE_ACCOUNT_JSON"), source: "env:GSC_SERVICE_ACCOUNT_JSON" };
  const path = (process.env.GSC_SERVICE_ACCOUNT_PATH || "").trim() || join(appDir, DEFAULT_KEY_PATH);
  if (!existsSync(path)) return null;
  return { sa: parseServiceAccount(readFileSync(path, "utf8"), path), source: path };
}

export function parseServiceAccount(json: string, where: string): ServiceAccount {
  let parsed: Partial<ServiceAccount> & { type?: string };
  try {
    parsed = JSON.parse(json) as Partial<ServiceAccount> & { type?: string };
  } catch {
    throw new Error(`${where}: not valid JSON`);
  }
  if (parsed.type !== "service_account" || !parsed.client_email || !parsed.private_key) {
    throw new Error(`${where}: expected a Google service-account key (type=service_account with client_email + private_key)`);
  }
  return { client_email: parsed.client_email, private_key: parsed.private_key, token_uri: parsed.token_uri };
}

function b64url(input: Buffer | string): string {
  return (typeof input === "string" ? Buffer.from(input) : input).toString("base64url");
}

async function fetchAccessToken(sa: ServiceAccount): Promise<string> {
  const tokenUri = sa.token_uri || TOKEN_URI;
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64url(JSON.stringify({ iss: sa.client_email, scope: SCOPE, aud: tokenUri, iat: now, exp: now + 3600 }));
  const unsigned = `${header}.${claims}`;
  const signature = createSign("RSA-SHA256").update(unsigned).sign(sa.private_key);
  const res = await fetch(tokenUri, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${b64url(signature)}`,
    }),
  });
  if (!res.ok) throw new GscError(res.status, await res.text(), "token exchange failed — is the key revoked or the JSON truncated?");
  const body = (await res.json()) as { access_token?: string };
  if (!body.access_token) throw new Error("token exchange returned no access_token");
  return body.access_token;
}

function hintFor(status: number): string {
  if (status === 403) return "service account is not a user on the property, or the Search Console API is not enabled on its GCP project";
  if (status === 401) return "bearer token rejected";
  if (status === 404) return "property not found — use the URL-prefix property https://saralprivacy.com/ exactly (trailing slash)";
  if (status === 429) return "quota exhausted (2,000 inspections/day, 600/min)";
  return "";
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export function createGscClient(sa: ServiceAccount, siteUrl: string): GscApi {
  let token: { value: string; expiresAt: number } | null = null;

  async function bearer(): Promise<string> {
    if (!token || Date.now() > token.expiresAt) {
      token = { value: await fetchAccessToken(sa), expiresAt: Date.now() + 50 * 60_000 };
    }
    return token.value;
  }

  async function call<T>(method: string, url: string, body?: unknown, attempt = 0): Promise<T | undefined> {
    let res: Response;
    try {
      res = await fetch(url, {
        method,
        headers: { authorization: `Bearer ${await bearer()}`, "content-type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(30_000),
      });
    } catch (err) {
      // Network-level failure ("fetch failed", timeout) — retry like a 5xx; 6 of 242 hit this on 2026-09-07.
      if (attempt < 4) {
        await sleep(500 * 2 ** attempt);
        return call<T>(method, url, body, attempt + 1);
      }
      throw err;
    }
    if ((res.status === 429 || res.status >= 500) && attempt < 4) {
      await sleep(500 * 2 ** attempt);
      return call<T>(method, url, body, attempt + 1);
    }
    if (!res.ok) throw new GscError(res.status, await res.text(), hintFor(res.status));
    if (res.status === 204) return undefined;
    return (await res.json()) as T;
  }

  const site = encodeURIComponent(siteUrl);

  return {
    async inspect(url) {
      const r = await call<{ inspectionResult?: InspectionResult }>("POST", `${API}/v1/urlInspection/index:inspect`, {
        inspectionUrl: url,
        siteUrl,
        languageCode: "en-US",
      });
      return r?.inspectionResult ?? {};
    },
    async searchAnalytics(startDate, endDate) {
      const r = await call<{ rows?: SearchRow[] }>("POST", `${API}/webmasters/v3/sites/${site}/searchAnalytics/query`, {
        startDate,
        endDate,
        dimensions: ["page"],
        rowLimit: 5000,
        dataState: "final",
      });
      return r?.rows ?? [];
    },
    async listSitemaps() {
      const r = await call<{ sitemap?: SitemapEntry[] }>("GET", `${API}/webmasters/v3/sites/${site}/sitemaps`);
      return r?.sitemap ?? [];
    },
    async submitSitemap(feedpath) {
      await call<void>("PUT", `${API}/webmasters/v3/sites/${site}/sitemaps/${encodeURIComponent(feedpath)}`);
    },
  };
}

// ── Dry run ──────────────────────────────────────────────────────────────────

export type DryRunFixture = {
  /** URL → inspection result. URLs absent here get `default`. */
  inspections: Record<string, InspectionResult>;
  default: InspectionResult;
  searchAnalytics: SearchRow[];
  sitemaps: SitemapEntry[];
  /** Used only with --offline (no live sitemap fetch). */
  sitemapUrls: string[];
};

export function createDryRunClient(fx: DryRunFixture): GscApi {
  return {
    async inspect(url) {
      return fx.inspections[url] ?? fx.default;
    },
    async searchAnalytics() {
      return fx.searchAnalytics;
    },
    async listSitemaps() {
      return fx.sitemaps;
    },
    async submitSitemap() {
      /* dry run: no-op */
    },
  };
}
