# SaralPrivacy — Data-Flow Link Swap & Gated Footer Slim-down

**Spec version:** 1.0 · 2026-08-03 · **Owner:** Dilip Sahu · **Author:** Claude
**Parent:** `LANDING_TRUST_REACH_SPEC.md` (this expands its Phase 3 + adds the footer follow-up)
**Sibling (no overlap):** `INTERNAL_LINKING_SPEC.md` covers content pages → tools; THIS spec
covers homepage/tools → flow maps, and the footer.
**Ship protocol:** branch → worktree build → Vercel preview → **Dilip verifies + confirms** →
merge. ⛔ Preview-before-prod law. Never self-merge. Sequence + tentative hours, no calendar.
**Decision (Dilip, 2026-08-03): swap-then-slim, never slim-then-hope.** Footer columns are
NOT removed until replacement links exist AND GSC shows the starved pages being crawled.

---

## 1. Context — the measured problem

Verified on prod HTML 2026-08-03:
- Each `/industries/<sector>/data-flow` URL appears **exactly once** on the homepage — the
  footer column. The footer is the **only sitewide crawlable path** to all 11 live maps
  (header dropdown links render on hover — absent from server HTML).
- Industry guide links appear 2× (AudienceCards + footer).
- GSC baseline (31 Jul): 9 of 17 never-crawled commercial URLs are `/industries/*` —
  crawl-budget starvation. Footer links are their main food supply today.
- UX: two near-duplicate 12-row sector lists bloat the footer; end-state should be hub links
  (standing principle: footer = hub links, not 12 scans).

**Fix in two parts:** (A) build superior in-body replacement links; (B) only after crawl
evidence, slim the footer. Separate branches, separate PRs, weeks apart.

## 2. Part A — The Swap (build now, one PR, ~4–6 h)

### A1. AudienceCards: per-sector "See the data flow" link
File: `webapp/components/home/AudienceCards.tsx`
- Cards hardcode `href`/`assessmentHref` per sector. Do **not** add a third hardcoded href.
  Derive the slug from the existing `href` (`href.replace("/industries/", "")`), look it up
  in `DATA_MAPS` (import from `@/lib/data/data-flow`), and render the link only when
  `live === true`. Registry-driven ⇒ when map #12 (gyms-salons-spas) registers, its link
  appears with zero edits here; today 11 sectors link (fintech-nbfc is live since `11c31be`),
  gyms renders nothing (no fake doors).
- Placement: alongside each card's existing quiet links (guide / assessment), same quiet
  style — green stays reserved for the page's primary CTAs (existing rule in this file).
  Label: "See the data flow" + ArrowRight. Server component — links land in crawlable HTML.
- ⚠ Contrast: link text must measure ≥ 4.5:1 against the card's per-sector accent bg
  (`teal-50`, `indigo-50`, …). Use the card's `iconColor` 700-shade for the link text
  (e.g. `text-teal-700` on `bg-teal-50` ≈ 6:1+) — compute per pair before ship (CTA law).

### A2. `FlowCrossLink` component (new)
File: `webapp/components/FlowCrossLink.tsx` — mirrors `DiscoveryCrossLink.tsx` layout.
- **Two variants via props:**
  - `sector` variant: `{ sectorSlug, sectorLabel }` → deep link
    `/industries/<slug>/data-flow`, copy: "You've scored your risk — now watch where
    <sector> data actually travels." CTA label: "See your data flow map".
  - `hub` variant (default / unmapped sector): → `/data-mapping`, copy: "See how personal
    data travels in businesses like yours — and where control breaks." Resolution rule:
    if `DATA_MAPS[slug].live !== true`, render the hub variant — never a dead deep link,
    never hide the component (3b-i in parent spec).
- **Mount points (both in the same PR):**
  1. `webapp/components/assessment/AssessmentWizard.tsx` — on the **report screen**,
     sector-aware (the wizard is pack-aware; map pack slug → sector slug).
  2. `webapp/app/discovery/DiscoveryClient.tsx` — on the **results view**, hub variant
     (discovery's 276 niches don't map 1:1 to the 12 sectors; don't force a mapping).
- **⚠ A11y (two known gaps become requirements):**
  - CTA button: do **NOT** copy DiscoveryCrossLink's `bg-green-500 text-white` — measured
    2.54:1, fails WCAG (memory law). Use `bg-navy-700 text-white hover:bg-navy-800`
    (≈15:1) — also visually distinguishes flow (navy/teal) from discovery (green).
  - `focus-visible:ring-2 ring-teal-400 ring-offset-2` on the CTA — the existing
    cross-links have no focus ring; the new component sets the corrected pattern.
    (Retrofitting the two old cross-links = optional same-PR cleanup, 2 lines each.)

### A3. Analytics
File: `webapp/lib/analytics.ts` — add:
`flowCrosslinkClick: (p: { source: "assessment" | "discovery"; sector: string }) =>`
→ `vercelTrack("flow_crosslink_click", …)`. No PII (sector slug + source only).
Also fire on the A1 AudienceCards link: reuse the same event with `source: "home_cards"`
(extend the union). ⛔ Verify on Vercel preview: POST `/_vercel/insights/event` in the
network tab (local pane blocks va.vercel-scripts.com — cannot verify locally).

### Part A edge cases
- Sector with `live: false` (gyms): A1 renders nothing; A2 renders hub variant.
- Assessment pack slug ≠ sector slug (e.g. `/assessment/recruitment` vs sector
  `recruitment-agencies`): resolve via the pack's sector reference, not string massage.
- Analytics blocked (adblock): links must navigate regardless — event fire-and-forget.
- No `useSearchParams` anywhere in this work (SEO trap; not needed).

## 3. Part B — Gated Footer Slim-down (separate branch, LATER, ~1–2 h)

**Gate (all three required before any code):**
1. Part A live on prod ≥ 2 weeks (Google has both link sets concurrently).
2. GSC evidence at the existing Cycle-2 checkpoints (7 Aug quick read; ~28 Aug B2 window):
   the previously never-crawled `/industries/*` URLs show crawl activity (URL Inspection
   "last crawl" dates, or coverage moving out of "Discovered – currently not indexed").
   Diagnose in the **URL-prefix property** (standing rule).
3. Dilip's explicit go after seeing that evidence.

**Change when gated open:** `webapp/components/layout/Footer.tsx` — collapse the
**Data Flow Maps** column (12 rows) and the **Industries** column (12 rows) to two hub
rows: "All data flow maps →" (`/data-mapping`) and "All industry guides →" (`/industries`).
Keep: Platform column, Assessments column, DPO box, disclaimer, press strip, legal row.
Nothing else moves. Rollback = revert one commit.

**Never:** ship Part B in the same commit/PR as Part A; ship it early because the footer
"looks long"; remove the columns without the GSC evidence attached to the PR description.

## 4. Out of scope
Content-page end-blocks (`INTERNAL_LINKING_SPEC.md`'s lane) · Phase 2 demo beat ·
WhatsApp share cards (4c) · any engine/pack/route edits · any URL changes.

## 5. Test & verification matrix (Part A)

| Check | How |
|---|---|
| A1 links render for exactly the live set (11 today), nothing for gyms | unit-style render or DOM grep on dev |
| A1 links present in server HTML | `curl localhost` grep `/industries/<slug>/data-flow` (12× total after: 11 cards + 1 footer per sector page) |
| A2 sector variant deep-links correctly from a completed assessment | manual: finish a CA assessment on preview → link → CA flow map |
| A2 hub fallback for unmapped sector | temporary: assert resolution fn (unit test on the resolver) |
| Contrast: every new text/bg + CTA pair ≥ 4.5:1 | compute before ship |
| `flow_crosslink_click` fires (all 3 sources) | Vercel preview network tab |
| Existing tests + `next build` | in worktree; capture exit code directly (⚠ not through `tail`) |
| 1280 / 375 layouts intact | browser preview |

## 6. Build prereqs (worktree gotchas — all hit once already)
- Build in `.claude/worktrees/data-mapping-nav` (exists, on `feat/data-mapping-nav-hiw`
  now merged; branch a new `feat/dataflow-link-swap` from fresh `origin/main`).
- Copy untracked `webapp/.env.local` AND `webapp/tools/data/niche-items.golden.json` from
  the main tree into the worktree (build fails on Resend key / register test fails without).
- Dev preview via `.claude/launch.json` `bash -lc cd` wrapper (plain npm args hit EPERM).
- Before merge: `git fetch` + `origin/main..branch` diff + per-commit file list (main moved
  mid-build last time — map #11; expect the same with map #12 / Setu chatbot in flight).
- Coordination: file overlap with map builds = zero; Setu chatbot = only `lib/analytics.ts`
  (append-only, trivial merge).

## 7. Sequence & effort

| # | Item | Effort | Gate |
|---|---|---|---|
| 1 | A1 + A2 + A3, one PR | 4–6 h | Dilip preview sign-off |
| 2 | GSC checkpoint reads | — (existing Cycle-2 work) | evidence recorded |
| 3 | Part B footer slim, own PR | 1–2 h | §3 gate, all three conditions |

## 8. Definition of Done
- Part A: build + tests green in worktree · contrast computed · events verified on preview ·
  Dilip verified preview + confirmed · merged with guard checks · prod HTML re-verified
  (each live sector's data-flow URL now ≥ 2 homepage-adjacent crawlable links).
- Part B: gate evidence in PR description · Dilip confirmed · prod footer verified ·
  spec + memory updated (this file marked done; MEMORY.md index updated).
