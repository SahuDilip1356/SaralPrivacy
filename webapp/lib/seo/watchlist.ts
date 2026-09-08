// watchlist.ts — the URLs the SEO observability agent never loses sight of,
// plus the request-indexing ledger.
//
// The 17 below are the core commercial pages the 2026-07-31 GSC baseline
// found NEVER crawled (Last crawled = epoch) — crawl-budget starvation on a
// low-authority domain, not a technical defect (all verified 200 / indexable /
// sitemapped / internally linked). Indexing was requested by hand on 31 Jul
// and 1 Aug; the ledger records that.
//
// Quota rule (settled): the GSC "Request Indexing" button has no API for
// ordinary pages and is capped at ~10/day. Re-requesting a URL does not jump
// the queue, so a URL in the ledger is never shortlisted again. When Dilip
// presses the button for a shortlisted URL, add one line here.

/** URL-prefix property — the domain property has no history; always inspect here. */
export const SITE = "https://saralprivacy.com/";
export const BASE = "https://saralprivacy.com";

export const WATCHLIST_PATHS: readonly string[] = [
  "/discovery",
  "/tools/dpdpa-privacy-notice-generator",
  "/data-mapping",
  "/blog",
  "/rights",
  "/media/coverage",
  "/media/press-wall",
  "/industries/ca-firms",
  "/industries/d2c-brands",
  "/industries/clinics-diagnostic-labs",
  "/industries/schools-colleges",
  "/industries/law-firms",
  "/industries/real-estate",
  "/industries/pharmacies",
  "/industries/hotels-travel",
  "/industries/gyms-salons-spas",
  // The handoff calls this "recruitment-staffing"; the live slug is recruitment-agencies.
  "/industries/recruitment-agencies/data-flow",
];

export const WATCHLIST: readonly string[] = WATCHLIST_PATHS.map((p) => BASE + p);

/** Request-indexing ledger: path → ISO date the GSC button was pressed. */
export const REQUESTED_INDEXING: Readonly<Record<string, string>> = {
  "/discovery": "2026-07-31",
  "/tools/dpdpa-privacy-notice-generator": "2026-07-31",
  "/data-mapping": "2026-07-31",
  "/blog": "2026-07-31",
  "/industries/ca-firms": "2026-07-31",
  "/industries/d2c-brands": "2026-07-31",
  "/industries/clinics-diagnostic-labs": "2026-07-31",
  "/industries/schools-colleges": "2026-07-31",
  "/industries/law-firms": "2026-08-01",
  "/industries/real-estate": "2026-08-01",
  "/industries/pharmacies": "2026-08-01",
  "/industries/hotels-travel": "2026-08-01",
  "/industries/gyms-salons-spas": "2026-08-01",
  "/industries/recruitment-agencies/data-flow": "2026-08-01",
  "/rights": "2026-08-01",
  "/media/coverage": "2026-08-01",
  "/media/press-wall": "2026-08-01",
};
