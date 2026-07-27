# Handoff — SEO & Trust work stream

**Written:** end of the SEO audit + defect-repair session, 2026-07-27.
**Prod `main` = `f88e5c0`** (was `0fa31c1` at session start — 8 commits landed).

> **To start the next session, one line does it:**
> *"Read HANDOFF_SEO.md at the repo root and pick up Stream A."*

⚠️ **Not to be confused with `handoff.md`** (one directory ABOVE the git root, at
`DPDPA Daily Brief/handoff.md`). That is the **Data Flow Map #5** handoff — a different
work stream, still valid, do not overwrite. One stale fact in it: it says prod `main` =
`0fa31c1`; prod is now `f88e5c0`. Its data-flow instructions are unaffected.

---

## 1. What this session was

An external SEO audit was pasted in. I verified every claim against code and live prod
(rejecting three), fixed what could be fixed, and specced the rest. **7 fixes shipped to
production and were verified live.**

⚠️ **The merge to `main` was performed by a parallel session sharing this working tree,
not by this one.** It also authored `f88e5c0` (a won't-fix decision on soft-404s). That
session's reasoning was independently checked and is sound. See §6 — this tree collision
happened twice.

---

## 2. Shipped and verified live on saralprivacy.com

| Fix | Verified evidence |
|---|---|
| DPDPA §13 → §12 for erasure | ca-firms + recruitment: **S12=4, S13=0** each. Both inside FAQPage JSON-LD |
| Sitemap now dynamic + paginated | **75 → 198 URLs**, 131 briefings, 8 blog, 0 uppercase, real per-doc `lastmod` |
| Honest homepage stats | **Free · 120+ · 12 · 17**. Zero "200+" anywhere |
| "Trusted by 200+ enterprises" removed | 0 occurrences on `/assessment` |
| Lowercase URL canonicalisation | `/Blog/…`, `/Industries/CA-Firms`, `/BRIEFINGS` → **308**. `/report/<token>` correctly untouched |
| "Verified" badge editorial guard | Contaminated posts **badge=0**, clean post **badge=1**; related cards match. 8/8 tests |
| Analytics rewired to Vercel `track()` | Event names in shipped bundle — ⚠️ **but never verified end to end, see §4** |

**Platform health after deploy:** all key routes 200 (`/`, `/industries/ca-firms`,
`/briefings`, `/blog`, `/assessment`, `/discovery`, `/data-mapping`, `/learn/consent`,
`/white-paper`). TTFB ~0.13s. No schema changes, no migrations, no new dependencies.

**Crash-resistance was tested, not assumed:** I killed the Appwrite connection and ran a
full production build. It completed (123/123 pages) and degraded honestly — homepage
showed "Daily" instead of a count, sitemap fell back to 8 static briefings. It never
prints a number it cannot back.

---

## 3. Where the code is

| Branch | State |
|---|---|
| `main` = `f88e5c0` | **All 7 fixes merged and live on prod** |
| `fix/seo-trust-audit` | Merged into main. Safe to delete |
| `docs/seo-cycle-2` = `d9da257` | **Unmerged, docs only.** Contains `SEO_CYCLE_2_SPEC.md` |

**Working tree is clean and in sync with origin.**

**Three specs, all at the git root:**
- `SEO_TRUST_FIX_SPEC.md` — cycle 1 defect register, what shipped, the §C2 failure log, rejected audit claims
- `AUTHOR_IDENTITY_FIX_SPEC.md` — the four-identity problem, blocked on decisions
- `SEO_CYCLE_2_SPEC.md` — the next cycle (Streams A/B/C), on `docs/seo-cycle-2`

---

## 4. Open loops, in priority order

1. **Search Console sitemap resubmit — 10 minutes, do first.** 123 briefings have been
   invisible since launch. The fix is live; Google will not act until told. Highest return
   per minute available. **Owner: Dilip.**
2. **Clean 2 contaminated blog posts (Appwrite content edit).** Slugs, all 9 exact strings,
   and the warning that 2 are in body prose not `primary_sources`: `SEO_TRUST_FIX_SPEC.md`
   T2. The shipped guard suppresses the Verified badge until clean — **the badge returning
   is the completion signal.** Owner: Dilip (each note is a legal judgment call).
3. **Verify analytics actually fires.** Rewired but unproven. ⚠️ **Vercel custom events need
   a paid plan** — on Hobby, `track()` silently no-ops. Until confirmed,
   `discovery_handoff_click` — the metric gating Discovery Phase B — has **never had data**.
4. **Author identity.** `AUTHOR_IDENTITY_FIX_SPEC.md`, blocked on D1–D4. ⛔ Hard blocker:
   `sameAs` needs Dilip's LinkedIn + company page URLs. **Never guess a profile URL.**
5. **Fix `www`.** Re-verified: TLS handshake fails **outright** (curl 000 — it never
   connects). Vercel dashboard + DNS. Owner: Dilip.
6. **Metadata lengths + literal ellipsis.** Measured live: 13/25 titles >60 chars, 20/25
   descriptions >160. Ellipsis still ships from `seoTitle()` in the briefings route. Solved
   as a side effect of dual titles (Cycle 2 B1).

---

## 5. Known-unfixed, decided deliberately

**Soft 404s on dynamic routes — WON'T-FIX.** Missing `/briefings/*` and `/blog/*` slugs
return **200**. Three approaches were built and **measured as failures** on preview:
`notFound()` in `generateMetadata`; deleting the `loading.tsx` boundaries; `htmlLimitedBots`
blocking metadata. The last two were reverted.

Root cause is render mode, not what the audit assumed: `/learn/[topic]` is **SSG (●)** and
404s correctly; these are **Dynamic (ƒ)** and stream, so the 200 header flushes before
`notFound()` runs. The conflicting `index, follow` + `noindex` tags are the *same* cause,
not a separate bug.

**Mitigated:** the not-found body carries `noindex`, and the sitemap now lists only real
URLs. Verified: `/learn/does-not-exist` still returns a correct 404.

⛔ **Do not re-attempt blind.** Remaining options and why each is blocked are in
`SEO_TRUST_FIX_SPEC.md` §C2. Revisit only if Search Console reports indexed soft-404s.

⛔ **Testing rule:** when checking any `notFound()` path, assert the **STATUS CODE**, not
the rendered body — the body renders the 404 UI correctly either way, which is exactly what
hides this class of bug.

---

## 6. Traps for the next session

- **This working tree is shared with other live sessions.** It happened twice today: one
  session branched mid-edit and moved HEAD off the active branch; another completed the
  merge to `main` while this session was running pre-merge checks. **Before branching or
  editing, check `git status`, file mtimes, and whether another session is live.**
- **iCloud creates `"name 2.tsx"` duplicates** mid-session. Two appeared today. Delete them;
  don't debug the resulting error.
- **A failed Appwrite fetch gets cached for an hour.** `unstable_cache` caches the empty
  result too, so a transient outage during revalidation leaves the homepage on "Daily" and
  the sitemap at 75 URLs for up to an hour after recovery. Self-heals, never shows anything
  false. Backlog item, not a bug. *(This also means a local `.next` cache can make a healthy
  build look broken — clear `.next` before trusting degraded output.)*
- **`git status --short webapp/` before every push** — new files must show `A`, not `??`.
- **⛔ Preview-before-prod law.** Nothing reaches prod without Dilip verifying on a preview
  and explicitly confirming. Never self-merge.

---

## 7. Next cycle — read `SEO_CYCLE_2_SPEC.md`

Cycle 1 was defect repair. It moved **Technical SEO 5→~7** and nothing else. The three
dimensions that actually gate traffic were untouched: **content/search intent 4/10,
authority 3/10, AI-search visibility 3/10.**

- **Stream A (~4–6h)** — the 6 open loops in §4.
- **Stream B (~15–25h)** — ⭐ **dual titles** (display hook vs `seo_title`) is the
  highest-leverage change and also fixes the ellipsis; `/dpdpa-templates` hub (17 real
  assets, none can rank); one sector pillar built end to end (CA firms recommended).
  Briefing rationalisation is **gated on 4 weeks of GSC data after the resubmit**.
- **Stream C (~10–15h)** — ⭐ the research moat, the only part competitors cannot copy.
  **Verified feasible:** the `assessments` collection already stores per-completion sector,
  verdict band, four sub-scores, the two-lens scores, red flags, blockers and resources.
  Gate: **n≥30 per sector, n≥100 aggregate** — check `/admin/assessments` first.
  ⛔ **Privacy rule: aggregate only, suppress cells below n=5.** We are a privacy company;
  thin or re-identifiable research is a liability, not an asset.

**Four decisions are open. The real one is D-D: is daily briefing cadence still right?**
The audit's own thesis is *"publish fewer commodity briefings, build more definitive
assets"* — and daily publishing competes for exactly the hours Streams B and C need.
Everything else in that spec is execution; D-D is strategy.

---

## 8. Two bugs found in passing, not yet fixed

1. **Duplicate related posts.** The same `related` array renders twice — mobile "More on
   this topic" (`app/briefings/[slug]/page.tsx` ~line 482) and the desktop sidebar. A CA
   briefing also surfaces law-firm articles because `getRelatedFromDb` matches on coarse
   `category`.
2. **`/briefings` weighs 573 KB** — every article renders at once. Paginate or virtualise,
   but the archive **must keep exposing all URLs to crawlers**; do not fix weight by hiding
   URLs.
