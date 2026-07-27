# SEO & Trust Fix Spec — verified defects from external audit

**Status:** Approved for build · **Source:** External SEO audit (2026-07-27), every item below re-verified against code + live prod before inclusion
**Ship protocol:** branch off `main` → preview → Dilip verifies on preview → merge. ⛔ Preview-before-prod law applies — no self-merge.
**Sequencing:** Batches run in order. Within a batch, tasks are independent unless noted. No calendar dates — sequence + tentative hours only.

---

## Verified defect register (what we are fixing and why)

| # | Defect | Evidence | Severity |
|---|--------|----------|----------|
| D1 | DPDPA §13 cited for erasure (erasure is §12; §13 is grievance redressal) | `webapp/app/industries/recruitment-agencies/page.tsx:44`, `webapp/app/industries/ca-firms/page.tsx:44` | P0 — legal miscitation on a compliance product |
| D2 | "Verified" SME blog post contains 9 live editorial TODOs ("editors should verify" ×4, "editors should confirm" ×3, "must be corrected" ×2) | Live at `/blog/dpdpa-compliance-for-smes-practical-guide-key-obligations`; content in Appwrite, not repo | P0 — public trust defect |
| D3 | Author schema name `SaahoDilipKumaar` ≠ About page "Dilip Sahu"; `sameAs: []` empty (author + Organization) | `webapp/lib/data/authors.ts`, `webapp/lib/schema.tsx:41` | P0 — E-E-A-T identity mismatch |
| D4 | Unverifiable stats: "200+ Briefings published" (actual 122), "Trusted by 200+ Indian enterprises" (unsubstantiated) | `webapp/components/home/TrustStrip.tsx:10`, `webapp/app/assessment/SurveyClient.tsx:1302` | P0 — overclaim on a trust product |
| D5 | Sitemap hardcodes 8 briefing slugs; 122 live briefings served from Appwrite are absent | `webapp/app/sitemap.ts:39-48` | P0 — crawl coverage |
| D6 | Invalid `/briefings/*` and `/blog/*` slugs return HTTP 200 (soft 404) — `loading.tsx` streams the shell before `notFound()` fires | Reproduced live: garbage slugs → `status=200` | P1 — crawl quality |
| D7 | Uppercase URL variants return 200 AND self-canonicalise to the uppercase URL (duplicate content) | Reproduced live on uppercase blog slug | P1 — crawl quality |
| D8 | `www.saralprivacy.com` TLS handshake fails outright (curl exit 60) | Reproduced live | P1 — domain hygiene |
| D9 | All `trackEvent.*` custom events are no-ops: they guard on `window.gtag`, but no gtag loader exists (site deliberately uses cookieless Vercel Analytics since Jul 2026). Includes `discovery_handoff_click` — the metric that gates Discovery Phase B | `webapp/lib/analytics.ts` (dead gtag), `webapp/app/layout.tsx` (Vercel `<Analytics/>` only) | P0 — zero data on our own roadmap gate |

**Audit claims rejected (do not action):** "install GA4" (conflicts with deliberate cookieless decision — fix is D9's re-wire instead); "TTFB 2.5–3.9s" (measured ~0.2s from sin1; not reproduced); "start with 4 industries" (stale — 12 packs live).

---

## Batch 1 — Trust & accuracy (~2–3h)

### T1 · Fix §13→§12 miscitation (2 files) — ~20 min
1. In both FAQ answers, change "Under Section 13 of the DPDPA" → "Under Section 12 of the DPDPA" (erasure/correction context). Keep the rest of each answer; the retention-exception language is correct.
2. Sweep for other miscitations: `grep -rn "Section [0-9]\+" webapp/app webapp/lib --include="*.ts*"` and check each hit against the Act: §11 access · §12 correction & erasure · §13 grievance redressal · §14 nomination. (Sweep on 2026-07-27 found only the 2 known hits pairing a section number with erasure — re-run at build time in case content moved.)
3. **Accept:** grep for `Section 13` co-occurring with `erasure` returns zero; FAQ JSON-LD on both industry pages carries the corrected text (view page source on preview).

### T2 · Clean the SME blog post (Appwrite content edit — NOT a repo change) — ~45 min
1. Locate the document in Appwrite `BLOG_POSTS` collection, slug `dpdpa-compliance-for-smes-practical-guide-key-obligations` (via `/admin` or Appwrite console).
2. For each of the 9 editorial notes: either (a) verify the claim against the Act/Rules and delete the note, or (b) correct the claim then delete the note. Never delete the note while leaving an unverified claim standing.
3. Re-verify every legal statement in the article while in there (it is the flagged "Verified" article — it must actually be verified).
4. **Accept:** `curl -s https://saralprivacy.com/blog/dpdpa-compliance-for-smes-practical-guide-key-obligations | grep -ci "editors should\|must be corrected"` → 0. (ISR: allow cache revalidation or purge before checking.)
5. Owner: Dilip (or Claude via admin UI with Dilip watching) — content judgment calls on each claim need founder sign-off anyway.

### T3 · Author identity + sameAs — ~30 min
1. `webapp/lib/data/authors.ts`: `name: 'SaahoDilipKumaar'` → `'Dilip Sahu'`. Keep the object key/id as-is (internal only, referenced nowhere else — verified) or rename to `dilipsahu` in the same commit if preferred; zero external references either way.
2. Populate author `sameAs` with Dilip's LinkedIn profile URL (**needs Dilip to supply the exact URL**) + any other stable public profiles (X, GitHub) worth claiming.
3. `webapp/lib/schema.tsx:41`: Organization `sameAs: []` → company LinkedIn page URL + any directory/press profiles that are genuinely SaralPrivacy's.
4. **Accept:** view-source on any blog post on preview → Article JSON-LD `author.name` = "Dilip Sahu", `sameAs` non-empty; Organization schema `sameAs` non-empty. Validate with Google Rich Results test on the preview URL.

### T4 · Kill unverifiable stats — ~30 min
1. `webapp/components/home/TrustStrip.tsx`: "200+ Briefings published" → either a build-time dynamic count from Appwrite (preferred — same fetch pattern as sitemap D5, rounded down to nearest 10, e.g. "120+") or a hand-set honest value. If hand-set, add a comment: `// keep ≤ actual count on /briefings — no overclaim`.
2. Same file: audit the "50+ Resources available" stat — count real resources; correct or make dynamic.
3. `webapp/app/assessment/SurveyClient.tsx:1302`: remove "Trusted by 200+ Indian enterprises…" — replace with a verifiable statement (e.g. "DPDPA readiness assessments across 12 sectors") or nothing. We do not have 200 verified enterprise customers; this sentence is indefensible.
4. Check the other 11 per-sector `*AssessmentClient.tsx` clones for the same sentence: `grep -rn "Trusted by" webapp/app/assessment` — fix every hit in the same commit (presentation-unified law: never fix one sector alone).
5. **Accept:** `grep -rn "200+" webapp/app webapp/components` returns only the discovery form's employee-count `<option value="200+">` (legitimate); homepage stat matches or undercounts reality.

---

## Batch 2 — Crawl & technical (~3–4h)

### C1 · Dynamic briefings in sitemap — ~45 min
1. In `webapp/app/sitemap.ts`, add `getBriefingSlugs()` mirroring the existing `getBlogSlugs()` pattern: query Appwrite `BRIEFINGS`, `Query.equal('status', ['sent', 'approved'])`, select slug + `published_at`/`$updatedAt`.
2. **Paginate with offset** — 122+ docs exceeds a single page; reuse the offset-pagination pattern from `/briefings` (memory law: archive/list fetches must paginate). Do NOT `limit(100)` and silently truncate.
3. Merge with the static 8-slug array, dedupe by slug (DB wins on date). Keep the static array only if any of those 8 are static-only; if all 8 exist in Appwrite, delete the hardcoded array entirely.
4. `lastModified` = real `published_at`/`$updatedAt` per briefing — no shared constant.
5. **Accept:** on preview, `curl -s <preview>/sitemap.xml | grep -c "/briefings/"` ≥ 122 (use Vercel MCP `web_fetch_vercel_url` — previews 401 to curl); spot-check 3 `lastmod` values against admin dates; total sitemap URL count grows by ~114.

### C2 · Real 404s for missing content — ⚠️ NOT FIXED. Three approaches tried and measured; all failed. Read before attempting again.

**Current state on the branch:** `notFound()` is now called in `generateMetadata` of both `webapp/app/briefings/[slug]/page.tsx` and `webapp/app/blog/[slug]/page.tsx` (it previously returned `{}` / `{title:"Not Found"}`). That change is kept — it is correct and it makes the not-found UI render — but **it does not fix the status code**. Missing slugs still return HTTP 200.

**What was measured on preview** (share-token auth, per-UA):

| Attempt | Change | Result |
|---|---|---|
| 1 | `notFound()` in `generateMetadata` | still 200 (plain curl AND Googlebot UA) |
| 2 | delete `app/{briefings,blog}/[slug]/loading.tsx` | still 200 — **reverted**, the skeletons cost nothing to keep |
| 3 | `htmlLimitedBots` regex in `next.config.ts` to force blocking metadata for crawlers | still 200 for Googlebot / bingbot / ClaudeBot — **reverted** |

**The actual root cause** (from `next build` route markers, not from guessing):
`/learn/[topic]` is **SSG (●)** and returns a correct 404. `/briefings/[slug]` and `/blog/[slug]` are **Dynamic (ƒ)** and soft-404. The loading.tsx correlation that motivated attempt 2 was false — `/learn` differs by being SSG, not by lacking a loading boundary. On a dynamic route Next 16 streams the response, so a `notFound()` thrown during render lands after the 200 header is flushed.

**Mitigating facts — the practical SEO harm is much smaller than the audit implies:**
- The not-found response body already carries `<meta name="robots" content="noindex">`, so Google will not index these URLs even at 200.
- The sitemap now lists only real, canonical URLs, so no crawler is pointed at a junk URL by us.
- Confirmed en route: the response also carries a conflicting `<meta name="robots" content="index, follow">` from the root layout alongside two `noindex` tags — this is exactly the audit's "conflicting noindex and index,follow" finding. Google takes the most restrictive directive, so `noindex` wins, but it should still be cleaned up.

**Options if this is picked up again** (do not repeat attempts 1–3):
1. `generateStaticParams` + `dynamicParams = false` on both routes → unknown slugs get a real 404 with no render. **Blocker:** briefings publish daily by cron, so a new briefing would 404 until the next deploy. Only viable if publishing triggers a redeploy.
2. Return the 404 from `proxy.ts` before the render begins. Needs a slug existence check at the edge — a cached slug set (e.g. revalidated hourly) rather than a per-request Appwrite query.
3. Accept the soft 404 and instead fix the conflicting robots tags, relying on the body-level `noindex`. Lowest effort, addresses the indexing risk if not the status code.

**⛔ Rule for future work:** when checking a `notFound()` path, assert on the STATUS CODE, not the rendered body — the body renders the 404 UI correctly either way, which is what makes this class of bug invisible. And check the `next build` marker (● vs ƒ) first.

### C3 · Lowercase URL canonicalisation — ~45 min
1. In `proxy.ts` (⛔ the ONE middleware file — never create `middleware.ts` alongside it): if `pathname` ≠ `pathname.toLowerCase()` and path is not `/api/*` or `/_next/*` or a public file, `308` redirect to the lowercased path (preserve query string).
2. Scope the matcher so admin/API routes are untouched.
3. **Accept:** on preview, `/Blog/Anything` and the uppercase SME slug → 308 → lowercase; lowercase URLs unaffected; admin + API routes unaffected; `next build` passes.

### C4 · Fix www subdomain — ~20 min + DNS propagation (Vercel dashboard, not code)
1. Vercel Dashboard → project `webapp` (⛔ not `saralprivacy` — check `.vercel/project.json`) → Domains → add `www.saralprivacy.com`, set "Redirect to saralprivacy.com" (308).
2. At the DNS provider: `CNAME www → cname.vercel-dns.com` (or per Vercel's shown instruction). Wait for TLS issuance.
3. **Accept:** `curl -sI https://www.saralprivacy.com` → valid TLS + `308` + `location: https://saralprivacy.com/`.
4. Owner: Dilip (dashboard + DNS access).

### C5 · Metadata length pass (optional, do last) — ~1h
1. Script-scan all sitemap pages: flag `<title>` > 60 chars, meta description > 160 chars, literal "…" in titles.
2. The briefing `seoTitle()` truncator (`webapp/app/briefings/[slug]/page.tsx`) appends a literal ellipsis — replace truncation with a real `seo_title` where it matters; fix top offenders only, not all 122.
3. **Accept:** homepage + hub pages + top-10 indexed pages all within limits; no literal ellipsis in any hub-page title.

---

## Batch 3 — Measurement (~1–2h)

### M1 · Re-wire trackEvent to Vercel Analytics `track()` — ~1h
1. `webapp/lib/analytics.ts`: replace the dead `window.gtag` internal with `import { track } from '@vercel/analytics'`; keep the exported `trackEvent.*` API surface byte-identical so zero call sites change.
2. Constraints to respect: Vercel custom events require a paid plan (verify plan supports it before building); event properties must be flat primitives; mind Vercel's per-event property limits — current payloads (niche, band, score, counts) comply.
3. Notice Pack (`webapp/lib/notice-pack/track.ts`) dual-fires to the owned `/api/notice/events` sink — leave that path untouched; only its `trackEvent.notice` leg benefits.
4. No PII in event payloads (existing discipline — preserve it).
5. **Accept:** on preview, complete a discovery run + click the data-mapping handoff → events visible in Vercel Analytics dashboard (or network tab shows `/_vercel/insights/event` firing with correct names); especially `discovery_handoff_click`.

### M2 · Post-deploy verification — ~15 min, after prod merge
1. Within 48h of prod deploy, confirm real-user events appear in the Vercel Analytics dashboard.
2. Record the baseline `discovery_handoff_click` weekly count — this is the Phase B gate metric; it has never had data.

---

## Batch 4 — Backlog (explicitly OUT of this fix cycle; separate specs when picked up)

- **`/templates` crawlable hub** — the Header "Templates" modal has no indexable page; 12 checklist PDFs + notice generator deserve an HTML hub with one page per asset. (Audit's highest-opportunity list is a good seed.)
- **Briefing dual titles** — add `seo_title` field to the briefing pipeline; display title stays the LinkedIn hook, `<title>`/H1 becomes search-intent phrasing.
- **Briefings rationalisation (keep/merge/noindex/remove)** — requires GSC impression data first; do not act on traffic alone.
- **Original-research moat assets** — anonymised benchmarks from 12 live packs (sector readiness index, per-sector gap frequencies). The one strategic audit point fully endorsed.

---

## Cross-cutting verification before merge (every batch)

1. `next build` passes locally with route count unchanged or grown (never shrunk).
2. `git status --short webapp/` — new files show `A`, not `??`.
3. Preview deployment verified by Dilip — screenshots or curl outputs attached to the PR.
4. After prod: Search Console → resubmit sitemap (D5), request re-crawl of the 2 industry pages (D1) and the SME post (D2).
