# Briefings Data-Quality Fix Spec — duplicates, taxonomy, brand rules

**Status:** spec only, nothing built. **Scope:** the 125 live briefings + the Python
generator pipeline + 4 webapp read surfaces.
**Prod `main` = `f88e5c0`.** Evidence gathered against live prod, n=125.

> Related specs at this repo root: `SEO_TRUST_FIX_SPEC.md` (cycle 1 defects, incl. the
> C2 soft-404 won't-fix this spec collides with), `SEO_CYCLE_2_SPEC.md` (dual titles —
> see decision D-2 below), `HANDOFF_SEO.md` (work-stream state).

---

## 1. Verified defect register

Every row measured, not asserted. Method in §12.

| ID | Defect | Measured | Root cause |
|---|---|---|---|
| D1 | Exact duplicate titles | **3 groups, 6 pages** | No uniqueness guard anywhere in the pipeline |
| D2 | Near-duplicate titles | **8 pairs @≥0.90, 28 @≥0.80** | Same as D1 + fixed roadmap topics at `temperature=0.3` |
| D3 | Stage facet unusable | **learn 0 / assess 36 / fix 0 / sustain 0** | 88 docs still carry legacy `category="compliance-guidance"`, 1 `"sector-specific"` |
| D4 | Format facet thin | **40/125**; only 3 of 6 formats ever used | Never backfilled; `playbook`/`case-story`/`myth-buster` = 0 |
| D5 | Fear framing in titles | **2 titles** | Prompt *instructs* it — `generate_content.py:147`, `:162`, and the `:158` example |
| D6 | Emoji in title | **1** (💣, law-firms, 27 Jul) | No emoji rule in `SYSTEM_PROMPT` |
| D7 | Title Case headline | **1** (24 Mar) | No case rule in `SYSTEM_PROMPT` |
| D8 | Category labels render raw | **live now**: `>assess<` ×5 homepage, ×7 detail | `getCategoryLabel()` doesn't know the 4 stage slugs |
| D9 | Stage CTA degraded | **89/125 (71%)** fall back to one generic CTA | `stageCta()` has no entry for `compliance-guidance` |
| D10 | Titles over SERP budget | **34/125** render >60 chars | `subject_line` capped at 55 (advisory only) + ` \| SaralPrivacy` = 70 |
| D11 | Ellipsis mid-word in `<title>` | **23/125** exceed `seoTitle` max=46 | `seoTitle(title, max=46)` + 15-char template = 61 |
| D12 | Slug-date ≠ publish-date | **60/125** | Two publish clusters (19:01 / 03:30 UTC) — timezone change mid-run |
| D13 | Briefing descriptions **too short** | **0/125 over 160; median 66; 86/125 under 70** | `preview_text` capped at "Max 90 chars" (`generate_content.py:159`) → `excerpt` → meta description |
| D14 | Static page descriptions **too long** | **7 of 12 sampled >160**, worst `/learn/consent` at 315 | Hardcoded in route files, never length-checked |

⚠️ **Correction to the cycle-1 handoff.** It recorded "20/25 descriptions >160" from a 25-page
sample. Measured across the full briefings archive that is **0/125** — briefings have the
*opposite* problem (D13). The over-length descriptions are real but live on the **static** pages
(D14), a different population and a different fix.

**Not a defect:** `sector` at 36/125. `briefing-taxonomy.ts` explicitly reserves `general`
for "the foundational 88." Only D3 and D4 are real taxonomy gaps.

---

## 2. Decisions — ALL FOUR SETTLED (Dilip, this cycle)

| ID | Decision | Ruling | Consequence |
|---|---|---|---|
| **D-1** | Duplicates: retitle, canonicalise, or delete? | ✅ **Retitle only** | No `proxy.ts` redirect work. URLs never change (slug is stored). Zero soft-404 exposure. R3 **retired** |
| **D-2** | Cap title/description now, or wait for dual fields? | ✅ **Wait for dual fields** | **G3, G4 and S1 are DEFERRED to Cycle 2 B1.** `seo_title` + `seo_description` become separate Appwrite fields so email and SERP each get their own budget. R7 **retired** |
| **D-3** | Backfill join key | ✅ **Generate a `slug` column** from the live archive | B1 proceeds as specced |
| **D-4** | `getCategoryLabel` vs `stageLabel` | ✅ **Extend `getCategoryLabel`** | L1 proceeds as specced |

**Accepted cost of D-2:** 34 titles stay over the 60-char SERP budget, 23 keep the mid-word
ellipsis, and 86 descriptions stay under 70 chars — until Cycle 2 B1 lands. Deliberate: capping
now would be thrown away by the dual-field work and would shorten every email subject in the
meantime.

> **Note for whoever picks up B1:** S1 (`seoTitle` word-boundary truncation) has **zero email
> impact** — it operates at render time on the already-published title. It was folded into this
> deferral for coherence, not because it is coupled. It stays a ~1h standalone fix available at
> any point.

---

## 3. Batch 0 — Code prerequisites (~2h) ⚠️ MUST PRECEDE THE BACKFILL

Pure code, no data risk. Both are prerequisites for Batch 2 not regressing prod.

### L1 · Teach `getCategoryLabel` the stage vocabulary — ~30 min
- `lib/utils.ts:61` — add `learn` / `assess` / `fix` / `sustain` to the `labels` map.
- Extend the `BriefingCategory` union in `lib/types/index.ts:59`.
- Affects: homepage `BriefingsSection.tsx:103,173`; detail page `:531`; related cards `:494`, `:738`, `:769`.
- **Exit evidence:** `curl -s https://<preview>/ | grep -c '>assess<'` returns **0**; the badge reads "Assess".

### R1 · Related-posts matching by sector, not stage — ~60 min
- `app/briefings/[slug]/page.tsx:164` `_fetchRelatedFromDb` — match `industries` first,
  fall back to `category`, then recency. Bump the `unstable_cache` key (`briefing-related` → `-v2`).
- Without this, Batch 2 makes relevance **worse** (see R2).
- **Exit evidence:** a CA-firms briefing returns no law-firm articles; every page still renders ≥3 related items.

### R2 · Hide the duplicated related block on mobile — ~15 min
- `app/briefings/[slug]/page.tsx:759` — add `hidden lg:block` to the sidebar's Related card only.
- Do **not** delete the `lg:hidden` blocks at `:482` / `:726` — the sidebar also carries
  Industries Affected, the Assessment CTA, the whitepaper/templates CTAs and the newsletter form,
  all of which must stay on mobile.
- **Exit evidence:** mobile viewport shows the related list once; desktop byte-identical.

---

## 4. Batch 1 — Generator hardening (~2.25h active; G3 + G4 deferred by D-2) ⚠️ DO BEFORE ANY CONTENT CLEANUP

Without this, cleaning 125 posts is undone by day 126.

### G1 · Brand rules into the prompt — ~45 min
`tools/generate_content.py`:
- **Remove the fear instructions.** `:147` ("a relatable fear", "Oh no, does this apply to me?")
  and `:162` ("or fear"). Replace with a specific, consequence-first hook — no alarm.
- **Replace the `:158` example** — *"Are you breaking this new law without knowing?"* is itself
  fear-framed and is the single strongest signal in the prompt.
- **Add to `SYSTEM_PROMPT`** (rules 7–9): sentence case only, never Title Case; no emoji in any
  field; no fear, threat, penalty-scare or shame framing.
- **Exit evidence:** 10 dry-run generations produce 0 emoji, 0 Title Case, 0 fear-list matches.

### G2 · Uniqueness guard — ~90 min
- No list endpoint exists (`app/api/briefings/` = approve/delete/generate/send/today). The Python
  pipeline already holds Appwrite credentials (`backfill_briefing_taxonomy.py` proves it) —
  **read the collection directly**; do not add an endpoint.
- Reject a candidate `subject_line` at ≥0.80 similarity against every published title; regenerate
  up to N times, then fail loudly rather than publish a near-duplicate.
- **Exit evidence:** replaying 3 known-duplicate topics is rejected; a novel topic passes first try.

### G4 · Raise the description budget — ~30 min
- `preview_text` is capped at "Max 90 chars" (`:159`), and `publish_to_webapp.py:183` maps it
  straight to `excerpt`, which becomes the meta description. A 90-char cap against a ~155-char
  SERP budget is why the median is 66 (D13).
- **Same dual-use tension as `subject_line`:** `preview_text` is *also* the email preview text,
  where ~90 chars is genuinely correct. Raising it for SEO lengthens email previews.
- Options: raise the cap to ~150 and accept longer email previews, or add a separate
  `seo_description` (the Cycle 2 B1 field) and leave `preview_text` alone. **Ties to D-2.**
- **Exit evidence:** new briefings land in the 120–155 range; email preview still renders cleanly.

### G3 · Enforce the length budget — ~45 min
- `subject_line: str` (`:69`) has **no** `max_length` — the "Max 55 chars" is advisory, which is
  exactly why D10 exists. Add real Pydantic validation.
- Target depends on **D-2**.
- **Exit evidence:** an over-length `subject_line` raises at validation, not at publish.

---

## 5. Batch 2 — Taxonomy backfill (~2h) ⚠️ BLOCKED ON B1

`tools/backfill_briefing_taxonomy.py` already exists and is well-built — dry-run default,
timestamped backup, `--revert`, idempotent. **Its join is broken.**

### B1 · Repair the roadmap join — ~60 min
- Measured: `roadmap/90_day_roadmap.csv` has 3 rows with a slug;
  `roadmap/day_91_240_enriched.csv` has **no slug column at all**. Join match = **0/125**.
- `day_number` is not a fallback — `publish_to_webapp.py:198` marks it "sent to webapp but not
  stored as a separate field."
- D12 (60/125 slug-date drift) rules out any date-derived key.
- **Fix:** generate a `slug` column from the live archive (all 125 slugs already extracted) and
  add it to the roadmap Sheet.
- **Exit evidence:** dry-run reports **unmatched = 0**.

### B2 · Dry-run and review — ~30 min
- **Exit evidence:** stage distribution is plausible across all four values; no doc loses a
  populated `industries` or `tags` value.

### B3 · Apply + revalidate — ~30 min
- `--apply` writes a backup first. Then `GET /api/revalidate?secret=…` busts the `briefings` tag
  (`app/api/revalidate/route.ts:17`); otherwise up to 1h stale.
- **Exit evidence:** `/briefings` stage filter returns non-zero for all four stages; homepage and
  detail badges read proper labels (L1 already shipped); 125 URLs still 200.

---

## 6. Batch 3 — Content edits (~2h, owner: Dilip) ⚠️ RETITLE ONLY

⛔ **Do not delete.** Verified live: `/briefings/<missing>` returns **200**, not 404
(`/learn/<missing>` correctly 404s). `/api/briefings/delete` is a hard `deleteDocument` with no
redirect and no tombstone — its own docstring says it is "used by the pipeline to remove duplicate
briefing documents," which is precisely the path that breaks. A deleted briefing becomes an indexed
URL serving 200 with a not-found body: **worse than leaving the duplicate**.

| ID | Work | Count |
|---|---|---|
| C1 | Retitle one of each exact-duplicate pair | 3 pairs |
| C2 | Retitle the weaker of each near-duplicate pair | 8 pairs @≥0.90 |
| C3 | Fix the 3 brand violations (Title Case, 💣, 2 fear titles) | 4 titles |

Retitling does **not** change URLs (`slug` is stored) — no redirects, no sitemap churn. The slug
keeps the old wording; cosmetic only. Already-sent emails are immutable and will not match the
revised site titles.

---

## 7. Batch 4 — SEO metadata (~2.25h active; S1 deferred by D-2, independent)

| ID | Work | Note |
|---|---|---|
| S1 | `seoTitle` max 46→45, truncate on word boundary, drop the literal `…` | `app/briefings/[slug]/page.tsx:194` **and** `app/blog/[slug]/page.tsx:119` — duplicated function, fix both |
| S2 | Shorten the **static** page descriptions (D14) | Hardcoded in the route files — pure code, no data dependency. 7 of 12 sampled >160; `/learn/consent` is 315. Briefing descriptions are handled by G4, not here |
| S3 | `/briefings` weighs 591 KB / 124 cards | **Spec first, do not build.** Files: `app/briefings/page.tsx` + `components/briefings/BriefingsExplorer.tsx`. Filters are client-side over the full set; paginating breaks filtering unless it moves server-side. ⛔ Never fix weight by removing URLs |
| S4 | Stream C — assessment counts | **Read-only, zero code impact.** Query the `assessments` collection for n-per-sector against the n≥30 / n≥100 gate. Separate work stream (`SEO_CYCLE_2_SPEC.md` Stream C); listed here only so it isn't lost. ⚠️ Blocked by R12 — needs prod credentials |

---

## 8. Risk register

| ID | Risk | Likelihood | Impact | Blast radius | Mitigation | Detection |
|---|---|---|---|---|---|---|
| **R1** | Backfill ships without L1 → raw slugs as category labels | **Certain** if ordered wrong | **High** | Homepage + 125 detail pages + all related cards | L1 lands in the same PR, before B3 | `grep -c '>assess<'` on preview homepage = 0 |
| **R2** | Backfill ships without R1 → related relevance degrades | **Certain** if ordered wrong | Medium | Every briefing detail page | R1 lands in the same PR | CA briefing returns no law-firm articles |
| ~~R3~~ | ~~Duplicates deleted → indexed URLs serve 200 soft-404~~ | **RETIRED** by D-1 ✅ | — | — | Retitle-only ruling means no URL is ever removed | — |
| **R4** | Stage split shrinks related pools below 3 | Medium | Low | Detail pages in thin stages | R1's fallback chain (sector → stage → recency) | Every page renders ≥3 related items |
| **R5** | Backfill runs, reports "125 unmatched", changes nothing | **Certain today** | Low (wasted run) | None — dry-run is the default | B1 before B2 | Dry-run `unmatched` counter |
| **R6** | Backfill overwrites good `tags` / `industries` | Low | Medium | Up to 125 docs | Script writes a timestamped backup; `--revert` restores | Diff B2 dry-run output before applying |
| ~~R7~~ | ~~Cap drop to 45 shortens every email subject~~ | **RETIRED** by D-2 ✅ | — | — | Caps deferred to Cycle 2 B1; no email string changes this cycle | — |
| **R8** | Uniqueness guard blocks a legitimately similar topic | Medium | Low | One day's publish | Fail loudly, don't silently skip; threshold tunable | Pipeline logs the rejection + score |
| **R9** | Shared working tree — another session moves HEAD mid-edit | Medium (happened twice) | Medium | Lost work | `git status` + mtimes + `list_sessions` before branching | Unexpected branch in `git branch --show-current` |
| **R10** | Stale `.next` or 1h Appwrite cache makes a healthy build look broken | Medium | Low | Local only | Clear `.next`; call `/api/revalidate` | Homepage shows "Daily" instead of a count |
| **R11** | Static `lib/data/briefings.ts` (9 docs) keeps the old vocabulary | Certain | Very low | Fallback path only | Accept; Appwrite wins when both exist | — |
| **R12** | Local `.env.local` Appwrite creds are stale (`project_not_found`) | **Confirmed** | Medium | Blocks any local pipeline run | Run the backfill from a prod-credentialed env, as its docstring states | Script raises 404 `project_not_found` |

---

## 9. Sequenced plan

No dates. Sequence + tentative hours only.

| Seq | ID | Task | Est | Depends on | Owner |
|---|---|---|---|---|---|
| 1 | L1 | `getCategoryLabel` learns stage slugs | 0.5h | — | Claude |
| 2 | R1 | Related matching → sector-first | 1.0h | — | Claude |
| 3 | R2 | Hide duplicated mobile related block | 0.25h | — | Claude |
| 4 | — | **Preview + Dilip verification** | 0.25h | 1–3 | Dilip |
| 5 | G1 | Brand rules into the prompt | 0.75h | — | Claude |
| 6 | G2 | Uniqueness guard | 1.5h | — | Claude |
| 7 | — | **Preview + 10 dry-run generations** | 0.5h | 5–6 | Claude |
| 8 | B1 | Repair the roadmap slug join | 1.0h | D-3 ✅ | Claude |
| 9 | B2 | Backfill dry-run, review the plan | 0.5h | 8 | Claude + Dilip |
| 10 | B3 | Backfill `--apply` + revalidate | 0.5h | 9, **step 4 shipped** | Dilip (prod creds) |
| 11 | C1–C3 | Retitle 11 duplicates + 4 brand violations | 2.0h | D-1 ✅, 10 | Dilip |
| 12 | S2 | Shorten static page descriptions | 0.75h | — | Claude |
| 13 | S4 | Stream C assessment counts (read-only) | 0.5h | R12 resolved | Claude |
| 14 | S3 | Spec `/briefings` weight — build later | 1.0h | — | Claude |

**Total ~11h**, of which ~7h is Claude and ~4h is Dilip (prod-credentialed runs, editorial
judgment on titles, preview verification).

**Deferred to Cycle 2 B1 by D-2:** G3 (0.75h), G4 (0.5h), S1 (1.0h).

⛔ **Step 11 must not run before step 4 is live on prod.** That single ordering constraint is what
keeps R1 and R2 from firing.

---

## 10. What this spec does NOT touch

No Appwrite **schema** changes, no migrations, no new dependencies. Untouched:

- the 12 assessment packs and the scoring engine (`core.ts`, `bands.ts`)
- the 4 data-flow maps and `/data-mapping`
- `/discovery` and the Discovery Pack
- the Notice Pack builder
- `/assessment`, `/report/[token]`, `/admin/assessments`

Batches 0, 3 and 4 live entirely inside the **briefings and blog routes**. Batch 1 touches only
the **Python pipeline**. Batch 2 changes **Appwrite document field values** for the `briefings`
collection — data, not structure, with a backup and a `--revert` path.

---

## 11. Cross-cutting verification before any merge

- `git status --short webapp/` — new files show `A`, not `??`
- `next build` completes; route count did not shrink
- All 125 briefing URLs still return 200
- `/briefings` stage filter non-zero across all four stages
- Homepage: 0 occurrences of a raw lowercase stage slug in a badge
- ⛔ **Preview-before-prod law** — Dilip verifies on a preview and confirms explicitly. Never self-merge.

---

## 12. Evidence method

- Dataset: the RSC flight payload of live `https://saralprivacy.com/briefings`, n=125 records with
  `slug`, `title`, `date`, `stage`, `sector`, `format`. Appwrite was **not** reachable locally
  (R12), so every number here is user-facing truth rather than DB state.
- Duplicates: `difflib.SequenceMatcher` over case/punctuation-normalised titles. Your audit's
  "8 near-duplicate pairs" reproduces exactly at a 0.90 threshold.
- Status codes asserted with `curl -o /dev/null -w '%{http_code}'` — **never** by reading the
  rendered body, which shows the 404 UI correctly either way and is what hides this bug class.
