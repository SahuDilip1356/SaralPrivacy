# SEO Cycle 2 — spec

**Status:** Ready to pick up · **Predecessor:** `SEO_TRUST_FIX_SPEC.md` (shipped to prod `f88e5c0`, 2026-07-27)
**Ship protocol:** branch off `main` → preview → Dilip verifies on preview → merge. ⛔ Preview-before-prod law. Never self-merge.
**Sequencing:** sequence + tentative hours only, no calendar. Dilip owns scheduling.

---

## Why this cycle exists

Cycle 1 was defect repair. It moved exactly two scores: **Technical SEO 5→~7** (sitemap 75→198 URLs, lowercase canonicalisation) and left **Measurement** unproven pending a dashboard check.

The three dimensions that actually gate traffic did not move at all:

| Area | Cycle 1 | Why unchanged |
|---|---|---|
| Content / search intent | **4/10** | Nothing shipped touched titles or content architecture |
| Authority / backlinks | **3/10** | No citable asset exists to earn a link |
| AI-search visibility | **3/10** | AI cites what it trusts; nothing changed about trustworthiness at scale |

**The thesis for this cycle, in one line:** stop repairing the publishing machine and start building the assets that earn citations.

---

## Stream A — close out remaining P0 hygiene (~4–6h)

Small, bounded, finishes the audit. Do these first because several are 20-minute jobs that keep showing up in every report.

### A1 · Search Console sitemap resubmit — ~10 min · ⛔ DO THIS FIRST
1. Submit `https://saralprivacy.com/sitemap.xml` in Search Console.
2. 123 briefings have been invisible since launch. The fix is live but Google will not act until told.
3. **Accept:** Search Console shows 198 submitted URLs; watch "Discovered — not indexed" over the following weeks.
4. **Highest return per minute available. Owner: Dilip.**

### A2 · Clean the two contaminated blog posts (Appwrite content) — ~90 min
1. Slugs, notes and exact strings are in `SEO_TRUST_FIX_SPEC.md` T2. Both `primary_sources` **and** body prose.
2. The shipped editorial guard suppresses the Verified badge until clean — **the badge returning is the completion signal.**
3. **Accept:** both slugs return 0 for `editors should|readers should verify|must be corrected|reviewer notes|appears unsupported`, and both show the badge again.
4. Owner: Dilip — each note is a legal judgment call.

### A3 · Author identity — ~2–3h · **spec already written**
1. Follow `AUTHOR_IDENTITY_FIX_SPEC.md` end to end. Blocked on decisions D1–D4.
2. ⛔ Hard blocker: `sameAs` needs Dilip's LinkedIn + company page URLs. Never guess a profile URL.
3. Closes audit P0 items 3 and 4 together.

### A4 · Fix `www` — ~20 min + DNS propagation
1. Re-verified: `https://www.saralprivacy.com` still fails the TLS handshake outright (curl exit 000). Not a 502 — it never connects.
2. Vercel Dashboard → project `webapp` (⛔ not `saralprivacy`) → Domains → add `www.saralprivacy.com` → redirect to apex. Then `CNAME www → cname.vercel-dns.com`.
3. **Accept:** `curl -sI https://www.saralprivacy.com` → valid TLS + 308 → `https://saralprivacy.com/`.
4. Owner: Dilip (dashboard + DNS).

### A5 · Metadata length + literal ellipsis — ~2h
1. **Measured on live prod, sample of 25 sitemap URLs: 13 titles >60 chars, 20 descriptions >160 chars.** Worse ratio than the audit's 31/75 and 54/75 — because the audit sampled a different slice, not because it regressed.
2. Literal ellipsis is still live and comes from `seoTitle()` in `app/briefings/[slug]/page.tsx` — e.g. `Law firms: your client files need privacy rul… | SaralPrivacy`. Truncating a hook mid-word produces a title that reads as broken.
3. Fix the truncator, not the symptom: prefer a real `seo_title` field (see B1 — they are the same change) and fall back to word-boundary truncation without an ellipsis.
4. **Accept:** zero literal `…` in any `<title>`; hub pages and the top-10 indexed pages within limits. Do not chase all 198.

### A6 · Verify analytics actually fires — ~30 min
1. Cycle 1 rewired `trackEvent` to Vercel `track()`, but this was **never verified end to end**.
2. ⚠️ **Vercel custom events require a paid plan.** On Hobby, `track()` silently no-ops and this is all theatre. Confirm the plan first.
3. Complete a `/discovery` run on prod, click through to data mapping, confirm `discovery_handoff_click` appears in the Vercel Analytics dashboard.
4. **Accept:** a real event visible in the dashboard. Until then, **the Discovery Phase B gate metric remains unmeasured** — it has never had data.

### A7 · Two small bugs found in passing — ~1h
1. **Duplicate related posts.** The audit saw one CA-firm briefing listing the same unrelated law-firm articles twice, under "More on this topic" and "Related Briefings". Both blocks render from the same `related` array (`app/briefings/[slug]/page.tsx` ~line 482 mobile + the desktop sidebar). Either de-duplicate or make the two blocks draw different sets. Also check why a CA briefing surfaces law-firm articles — `getRelatedFromDb` matches on `category`, which may be too coarse.
2. **`/briefings` weighs 573 KB** because every article renders at once. Paginate or virtualise. Note the archive must still expose all URLs to crawlers — do not fix the weight by hiding URLs.

---

## Stream B — content architecture, where the traffic actually is (~15–25h)

### B1 · Dual titles: display vs search — ⭐ **highest-leverage change in this spec** — ~4–6h
**The problem, in the audit's own examples.** Today one string does two jobs and fails the second:

| Today (both display AND `<title>`) | What people actually search |
|---|---|
| "Who else is reading your client's files?" | "DPDPA access control checklist for CA firms" |
| "Your clinic holds secrets. Are they safe?" | "Can clinics share reports on WhatsApp?" |
| "Your school stores student data. Is it safe?" | "DPDPA parental consent requirements for schools" |

The hooks are good — they earn the LinkedIn click. They just have no keyword surface.

1. Add a `seo_title` field to the briefings collection (and blog).
2. `<title>`, `og:title` and the H1 read `seo_title` when present; the card/social display keeps `title`. Fall back to `title` so nothing breaks on old rows.
3. Update the briefing generation prompt (`app/api/briefings/generate/route.ts`) to produce **both** — a hook and a search-intent title — for every new briefing.
4. Backfill `seo_title` for the briefings worth keeping (see B2 — do the classification first so you only backfill keepers).
5. This also solves A5's ellipsis: a purpose-written `seo_title` never needs truncating.
6. **Accept:** a briefing shows the hook on `/briefings` and a keyword title in `<title>`; new briefings ship with both automatically.

### B2 · Rationalise the 131 briefings — ~6–10h
⛔ **Precondition: at least 4 weeks of Search Console data after A1.** Classifying before the sitemap fix has been indexed means judging pages Google has never properly seen. **Do not start this until A1 has had time to work.**

Classify every briefing into exactly one bucket:

| Action | When |
|---|---|
| Keep + upgrade | Unique keyword, useful content — gets a `seo_title` (B1) |
| Merge + 301 | Overlaps another briefing |
| `noindex, follow` | Good for LinkedIn/email, no search intent — most will land here |
| Remove | Inaccurate or obsolete |
| Fold into pillar | Adds value to an evergreen guide (B3) |

1. Pull GSC impressions + any backlinks per URL first. **Never delete on traffic alone** — a zero-traffic page with a backlink is an asset.
2. Also resolve the **8 orphan briefings** found in cycle 1: live and in the sitemap but absent from `/briefings`. Link them from the archive or retire them.
3. **Accept:** every briefing has exactly one classification with a recorded reason; redirects resolve; no orphans.

### B3 · Sector pillars + intent pages — ~10–15h for the first sector
1. Do **not** build all 12 at once. Build **one** end to end, measure, then decide.
2. Recommended first sector: **CA firms** — a live assessment pack, a live data-flow map, and the sharpest search intent of the four the audit named.
3. Per sector: one pillar + intent pages for compliance guide, personal-data inventory, data-flow map, retention schedule, notice & consent examples, rights-request process.
4. Much of this already exists as fragments — the assessment, the data-flow map, the checklist PDF. The work is largely **connecting and framing**, not writing from scratch.
5. Every page links to: sector pillar · its data-flow map · the relevant tool · the assessment · two genuinely related articles.
6. **Accept:** the CA cluster is internally linked with no orphans; each page targets one named query. Then **stop and measure before sector 2.**

### B4 · `/dpdpa-templates` crawlable hub — ~3–4h
1. The header "Templates" is a modal — there is no indexable page. 17 real assets exist in `public/templates` (5 generic + 12 sector checklists) and none of them can rank.
2. Build `/dpdpa-templates` with an **HTML page per asset**: what it covers, who needs it, a preview, the DPDPA obligation it satisfies, then the download. Gated download is fine; the page must not be.
3. Add to sitemap, header, footer. Cross-link from each sector pillar (B3).
4. **Accept:** every template has a crawlable URL in the sitemap; the hub ranks for "DPDPA <asset> template".

---

## Stream C — the moat (~10–15h) ⭐ the only part competitors cannot copy

Generic DPDPA explanation is a commodity — IAPP, DLA Piper and OneTrust already own it and always will. What SaralPrivacy has that none of them do is **operational data from real Indian SMBs**.

**Feasibility — verified, not assumed.** The `assessments` collection already stores everything a benchmark needs, per completion:
`industry · risk_level · applicability_score · maturity_score · risk_score · urgency_score · overall_score · verdict_band · data_exposure · control_maturity · operational_readiness · red_flags_json · immediate_actions_json · q11_blocker · q12_resource`

That is a sector-segmented dataset of real privacy gaps. **No competitor has it.**

### C1 · Confirm sample size — ~15 min · ⛔ GATE
1. Check the total in `/admin/assessments`, broken down by `report_type`.
2. **Rule: publish a sector cut only at n ≥ 30 for that sector; publish the aggregate index only at n ≥ 100.** Below that, state the sample size prominently and label it preliminary — or wait.
3. If volume is short, C2 is premature. Run B1+B4 first to drive completions, then revisit. **Be honest about this rather than publishing a benchmark from 12 responses** — a thin statistic that gets cited and then challenged is worse than no statistic.

### C2 · First research asset — ~10–15h
1. Start with **one**: "Where Personal Data Actually Lives in an Indian CA Firm" — pairs the assessment data with the live data-flow map.
2. Every research page must carry: sample size · methodology · collection period · sector breakdown · charts and tables · downloadable dataset (CSV) · quotable findings · named author + independent reviewer · primary-source citations.
3. ⛔ **Privacy discipline — non-negotiable.** Aggregate only. No business names, no respondent-identifying combinations. Suppress any cell below n=5. We are a privacy company; the research must be exemplary or it is a liability. Check this against our own privacy notice before publishing.
4. Pitch it at the people who cite: ICAI chapters, CA associations, privacy practitioners, journalists covering DPDPA.
5. **Accept:** one page a practitioner would cite in a client deck. Then measure referring domains before building asset 2.

**Later assets** (only after C2 earns citations): India SMB DPDPA Readiness Index · Recruitment Candidate-Data Benchmark · sector retention benchmarks · most common gaps by industry.

---

## Recommended order

1. **A1** (10 min, unblocks everything measurable)
2. **A2, A4, A6** — small, finish the audit, A6 tells you whether you can measure anything at all
3. **A3** — spec ready, needs decisions
4. **B1** — highest-leverage content change; also solves A5
5. **A5, A7** — ride along with B1
6. *(wait for GSC data)* → **B2**
7. **B4**, then **B3** for CA firms only
8. **C1** gate → **C2**

---

## Success measures

**OMTM: qualified organic assessment completions per week.** ⚠️ Currently unmeasurable — A6 is a hard dependency. Fix measurement before setting targets against it.

Supporting targets from the audit, with my adjustments:

| Target | Note |
|---|---|
| 100% canonical pages in sitemap | ✅ **already met** (198 URLs) |
| >90% submitted URLs indexed | Needs A1 first |
| Zero soft 404s | ⚠️ **Won't be met** — accepted won't-fix; body `noindex` + clean sitemap mitigate. Revisit only if Search Console reports indexed soft-404s |
| Zero duplicate canonical routes | ✅ **already met** (lowercase 308s live) |
| 20 sector/intent pages | B3 + B4 |
| 15 referring domains | Stream C is the only realistic route |
| 20 keywords top-20 / 5 top-10 | Depends on B1 + B3 |
| 50 organic assessment completions/month | Gated on A6 |

---

## Open decisions

- **D-A** — Which sector for the first B3 pillar? *Recommended: CA firms.*
- **D-B** — Does the briefing generator produce both titles going forward, or do we backfill only keepers? *Recommended: both — generator first (stops the bleeding), backfill only B2 keepers.*
- **D-C** — Publish research under Dilip's name or a SaralPrivacy Research byline? Ties to `AUTHOR_IDENTITY_FIX_SPEC.md` D2 — decide once, apply to both.
- **D-D** — Is daily briefing cadence still right? The audit's closing line is *"publish fewer commodity briefings, build more definitive assets."* If B3/C2 are the priority, daily publishing is competing for the same hours. **This is the real strategic question in this spec.**
