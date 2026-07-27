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

### C2 · Real 404s for missing content — ~45 min ✅ BUILT (took two attempts — read this)
1. Root cause: `loading.tsx` + streaming means `notFound()` thrown in the page body lands after the 200 header is sent.
2. **Attempt 1 (insufficient on its own):** call `notFound()` in `generateMetadata` of `webapp/app/briefings/[slug]/page.tsx` and `webapp/app/blog/[slug]/page.tsx` instead of returning `{}`/`{title:"Not Found"}`. **Verified on preview: still HTTP 200**, for both plain curl and a Googlebot user-agent. Metadata is streamed, so the header is already flushed by the time it resolves.
3. **Attempt 2 (the actual fix):** DELETE the two detail-route loading boundaries — `app/briefings/[slug]/loading.tsx` and `app/blog/[slug]/loading.tsx`. With no loading boundary the segment does not stream a shell first, so `notFound()` sets a real 404.
   - Keep `app/briefings/loading.tsx` (the archive list) — it has no notFound path.
   - Cost is near-zero: both detail routes are ISR-cached (`revalidate 1800`), so the skeleton only rendered on a cache miss.
   - Keep the `generateMetadata` `notFound()` calls from attempt 1 — correct and defensive.
4. **How the cause was identified:** `/learn/[topic]` and `/industries/[sector]/data-flow` have no `loading.tsx` and already return a correct 404 on prod. That contrast is the diagnostic — if a dynamic route soft-404s, look for a loading boundary on the segment first.
5. **Accept:** on preview, garbage slugs on `/briefings/*` and `/blog/*` return HTTP **404**; a valid slug still returns 200 with correct metadata; `next build` passes.
6. ⛔ **Rule for any future dynamic route:** a segment that can `notFound()` must not have a `loading.tsx`, or it will soft-404 silently. Test a garbage slug's STATUS CODE (not the rendered body — the body looks right either way).

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
