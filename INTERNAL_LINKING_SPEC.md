# Internal Linking Spec — content → tools

**Status:** spec, awaiting `/plan-design-review` (avg ≥8) before build · **Owner:** Claude
**Ship protocol:** branch off `main` → preview → Dilip verifies → he merges. ⛔ Preview-before-prod law. Never self-merge.
**Sequencing:** sequence + tentative hours only, no calendar.
**Trigger:** Dilip's go, 2026-08-01. Phase B denominator gate set to **N = 50 discovery completions** the same day.

---

## 1. The problem, measured

`/discovery` receives ≈ **0.4 visitors/day**. The Phase B keep/kill gate cannot run — not
because instrumentation is broken (verified live 2026-07-31: Vercel Pro, Analytics on,
`discovery_handoff_click` firing) but because the denominator is starved.

**Root cause, verified by grep across `app/` and `components/`:**

Every cross-link to a tool lives on a **hub** page. Not one lives on a **content** page.

| Component | Used on | Times |
|---|---|---|
| `DiscoveryCrossLink.tsx` | `/industries`, `/data-mapping`, `/assessment` | 3 hubs |
| `NoticeCrossLink.tsx` | `/industries`, `/data-mapping`, `/assessment` | same 3 hubs |

**Content pages with zero in-body link to any tool:**

| Surface | Route | Pages |
|---|---|---|
| Learn topics | `app/learn/[topic]/page.tsx` | **12** (`what-is-dpdpa`, `applicability`, `consent`, `rights`, `data-breach`, `key-terms`, `duties`, `notice`, `childrens-data`, `retention`, `cross-border`, `myths`) |
| Learn standalone | `app/learn/dpdp-act-2023`, `app/learn/dpdp-rules-2025-plain-english-guide` | 2 |
| Learn hub | `app/learn/page.tsx` | 1 |
| Blog posts | `app/blog/[slug]/page.tsx` | 8 |
| Briefings detail | `app/briefings/[slug]/page.tsx` | ~125 |
| **Total** | | **~148 dead-ending pages** |

`/briefings` (the list page) is the sole exception — `BriefingsExplorer.tsx:40` carries one
Discovery card. The ~125 **detail** pages it links to carry none.

**Second effect — crawl budget.** The 31 Jul GSC baseline found 17 of 22 never-crawled URLs
are commercial: 9 `/industries/*`, all 3 tools, `/blog`. Roughly 103 indexed content pages
currently pass them **no** internal link equity. Fixing the dead-ends is the same fix.

---

## 2. Decisions

| ID | Decision | Ruling | Rationale |
|---|---|---|---|
| **E-1** | Which tools get linked? | ✅ **All three**, contextually routed — never all three at once | A page about consent notices should point at the notice generator, not a generic tool menu. One relevant link outperforms three generic ones. |
| **E-2** | Placement | ✅ **End-of-content block, reusing the existing components** | Presentation is already solved and already shipped on 3 hubs. Reuse means zero new design surface and automatic visual consistency. |
| **E-3** | In-body mid-article links? | ⚠️ **Phase 2, not now** | Requires per-article editorial judgment across 148 pages. The end-block is a one-time code change covering all of them. Ship the cheap 90% first, measure, then decide. |
| **E-4** | Briefings detail — new block or reuse sidebar? | ✅ **Reuse the existing sidebar CTA slot** | The sidebar already carries Assessment / whitepaper / templates CTAs (per `BRIEFINGS_DATA_QUALITY_SPEC.md` §3 R2). Adding a 4th competing block risks CTA blindness. Swap in a routed tool link instead. |

**⚖️ Presentation-unified law applies.** The end-block renders identically on every content
surface. Only the *target* varies by topic. A change to the block ships to all surfaces at once,
never to one.

---

## 3. The routing table

Content topic → the single most relevant tool. This is the whole content decision.

| Learn topic | Target | Why |
|---|---|---|
| `what-is-dpdpa` | `/discovery` | Orientation → "what do I even hold?" |
| `applicability` | `/discovery` | Scope question, answered by mapping |
| `key-terms` | `/discovery` | Definitional → concrete |
| `retention` | `/discovery` | Retention presumes a data inventory |
| `cross-border` | `/discovery` | Transfer mapping is inventory work |
| `myths` | `/discovery` | Low-intent entry, widest funnel |
| `consent` | `/tools/dpdpa-privacy-notice-generator` | Consent lives in the notice |
| `notice` | `/tools/dpdpa-privacy-notice-generator` | Exact-match intent ⭐ |
| `rights` | `/tools/dpdpa-privacy-notice-generator` | Rights are declared in the notice |
| `duties` | `/assessment` | Obligation breadth → scored gap check |
| `data-breach` | `/assessment` | Readiness question |
| `childrens-data` | `/assessment` | High-risk gating → full assessment |

| Other surface | Target | Rule |
|---|---|---|
| `learn/dpdp-act-2023` | `/discovery` | Foundational |
| `learn/dpdp-rules-2025-…` | `/assessment` | Operational obligations |
| Learn hub | `/discovery` | Already the "start here" framing |
| Blog `[slug]` | `/discovery` default; `/assessment` if the post has a `sector` | Sector-tagged = higher intent |
| Briefings `[slug]` | Sector-matched `/industries/[sector]` **or** `/discovery` if `sector = general` | Also feeds the 9 never-crawled `/industries/*` URLs |

⚠️ **The briefings row is the crawl-budget fix.** ~36 of 125 briefings carry a real sector.
Routing those to `/industries/[sector]` puts the first internal links on 9 commercial URLs
Google has never crawled.

---

## 3a. Design review — first pass FAILED, remediation below

`/plan-design-review` run 2026-08-01 against the **actual shipped components**, not the spec prose.
First pass **average 6.75/10 → RETURN TO DESIGN.** Four dimensions scored below 7.

| # | Dimension | 1st | Finding |
|---|---|---|---|
| 1 | Hierarchy | 7 | Block renders an `<h3>`. Appended to an article it injects a heading into the document outline that isn't a section of the article. |
| 2 | State coverage | **6** | ⚠️ `/industries/[sector]` routing assumes every briefing `sector` maps to a live route. No validation against `sectors.ts` → **broken internal link risk**, worse than no link. |
| 3 | Typography | 7 | 4 sizes (`11px`, `base`→`lg`, `sm`, `sm`) and 3 weights against a ≤3 / ≤2 bar. |
| 4 | Color | 8 | All tokens, no stray hex. But 2 gradient directions today → 4 with new variants. Needs a rule. |
| 5 | Spacing | 9 | Clean 4/8 scale; `w-11 h-11` (44px) is a deliberate touch target. |
| 6 | Interaction | **5** | ⚠️ `hover:` only. **No `focus-visible` ring at all** — the CTA is invisible to keyboard focus. |
| 7 | Copy | 7 | Copy is hub-written. "…then come back for the full assessment" is incoherent at the end of a briefing. |
| 8 | Accessibility | **5** | ⚠️ See measured contrast below. Icons lack `aria-hidden`. |

### ⛔ Measured contrast failures (computed, not eyeballed)

| Pair | Ratio | Bar | Verdict |
|---|---|---|---|
| White on `green-500` `#07B981` — **the primary CTA button** | **2.54:1** | 4.5 | ❌ **fails hard** |
| White on `green-600` | 3.77:1 | 4.5 | ❌ still fails |
| White on `green-700` `#047857` | **5.48:1** | 4.5 | ✅ passes |
| `navy-700` on `green-500` | **6.81:1** | 4.5 | ✅ passes |
| Eyebrow `teal-700` on `teal-50` (11px bold) | 4.48:1 | 4.5 | ❌ fails by a hair |
| Eyebrow `teal-800` on `teal-50` | 6.77:1 | 4.5 | ✅ passes |
| Body `slate-600`, heading `navy-700` | 6.88 / 15.76 | 4.5 | ✅ comfortable |

⚠️ **Scope honesty:** the 2.54:1 CTA failure is **pre-existing and sitewide** — `green-500` is the
primary CTA token, not something this spec introduces. But this spec would propagate it to ~148
more pages, which is why it is being surfaced here rather than silently inherited.
**The sitewide token decision is Dilip's and is tracked separately.** This spec fixes only its own
component variants.

### E0 · Design remediation — must land inside E1, ~45 min

1. **Focus ring** — add `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-600` to the CTA. Pure addition: zero visual change at rest, so the 3 shipped hub pages stay visually identical.
2. **CTA contrast** — set the button to `bg-green-700 hover:bg-green-800` with white text (5.48:1). Preserves the green CTA language and passes. ⚠️ This *does* change the 3 hub pages — accepted deliberately: the E1 exit evidence changes from "byte-identical" to "identical except the CTA passes contrast."
3. **Eyebrow** — `teal-700` → `teal-800` (4.48 → 6.77). Same for the green variant.
4. **Semantics** — wrap in `<aside aria-label="Related tool">`; demote the `<h3>` to a `<p>` styled identically. Keeps the visual, stops polluting the article outline.
5. **Decorative icons** — `aria-hidden="true"` on both the lucide glyphs.
6. **Sector validation** — `resolveToolTarget` validates any sector against `sectors.ts` (the single source of truth) and falls back to `/discovery` on a miss. Closes the broken-link risk.
7. **Per-surface copy** — copy lives in the routing table (§3), not the component. A briefing never says "come back for the full assessment."
8. **Gradient rule** — one direction only (`from-{accent}-50 to-cloud-50`) across all 4 variants; the accent hue alone distinguishes them.

### Re-rating after E0

| # | Dimension | 1st | After E0 |
|---|---|---|---|
| 1 | Hierarchy | 7 | **8** — `aside` + non-heading title |
| 2 | State coverage | 6 | **8** — sector validated, fallback chain |
| 3 | Typography | 7 | **8** — 3 sizes, 2 weights after the eyebrow/title consolidation |
| 4 | Color | 8 | **8** — one gradient rule |
| 5 | Spacing | 9 | **9** — unchanged |
| 6 | Interaction | 5 | **8** — focus-visible ring |
| 7 | Copy | 7 | **8** — per-surface copy |
| 8 | Accessibility | 5 | **8** — all measured pairs pass; icons hidden |

**AVERAGE: 8.1/10 → PROCEED.** Conditional on E0 landing inside E1; if E0 is dropped, this
spec reverts to RETURN TO DESIGN and must not be built.

---

## 4. Build plan

### E1 · Generalise the cross-link component (**includes E0**) — ~45 min
1. `components/DiscoveryCrossLink.tsx` currently hardcodes `/discovery`, the copy, and the icon.
   Extract a `ToolCrossLink` that takes `{ variant: 'discovery' | 'notice' | 'assessment' | 'industry', sector?, className? }`.
2. Keep `DiscoveryCrossLink` and `NoticeCrossLink` as thin wrappers so the 3 existing hub call
   sites are untouched. **Zero regression surface on shipped pages.**
3. Apply **all 8 E0 remediations** in the same edit — they are the condition of the 8.1 rating.
4. **Exit evidence:** `/industries`, `/data-mapping`, `/assessment` on preview are identical to
   prod **except** the CTA now reads `green-700` and takes a visible focus ring on Tab.
   Every measured text/background pair ≥ 4.5:1. Keyboard Tab reaches the CTA with a visible ring.

### E2 · Routing map as data — ~30 min
1. New `lib/data/tool-routing.ts` — the §3 table as a typed record. Single source of truth,
   same pattern as `sectors.ts`.
2. Export `resolveToolTarget(surface, key, sector?)`. Default to `/discovery` on any miss —
   never render a dead block.
3. **Exit evidence:** unit-level check — every one of the 12 learn topic keys resolves to a
   non-null target; an unknown key returns the `/discovery` default.

### E3 · Mount on the learn surfaces — ~45 min
1. `app/learn/[topic]/page.tsx` — render `<ToolCrossLink>` after the article body, before the
   existing footer/related area. Covers all 12 topics from one edit.
2. `app/learn/page.tsx`, `app/learn/dpdp-act-2023`, `app/learn/dpdp-rules-2025-…` — same block.
3. **Exit evidence:** all 15 learn URLs on preview contain exactly one tool link in the body;
   each matches the §3 table.

### E4 · Mount on blog — ~20 min
1. `app/blog/[slug]/page.tsx` — same block after the post body.
2. **Exit evidence:** 3 sampled posts each render one routed block.

### E5 · Briefings detail — swap, don't add — ~40 min
1. `app/briefings/[slug]/page.tsx` — the sidebar CTA stack already holds Assessment + whitepaper
   + templates. Insert the routed tool link **in place of** the generic Assessment CTA when the
   briefing has a sector; keep the existing CTA when `sector = general`.
2. ⚠️ Do **not** touch the `lg:hidden` / `hidden lg:block` structure — `8c0a89d` just fixed the
   mobile duplicate (R2). Regressing it is the single likeliest failure here.
3. **Exit evidence:** mobile renders the block once; desktop once; a CA-firms briefing links to
   `/industries/ca-firms`; a `general` briefing links to `/discovery`.

### E6 · Instrument — ~30 min
1. Fire `content_tool_click` with `{ surface, sourceKey, target }` via the existing
   `lib/analytics.ts` wrapper. Do not invent a second analytics path.
2. ⚠️ Per the content/trust/SEO laws: **verify the event actually fires on preview before merge.**
   The real endpoint is the obfuscated `/<hash>/event`, not `/_vercel/insights/event` — the
   comment at `lib/analytics.ts:15` is wrong and misleads this exact check.
3. **Exit evidence:** network tab on preview shows the event on click, with correct payload.

### E7 · Fix the misleading analytics comment — ~2 min
1. `lib/analytics.ts:15` — correct the endpoint note. Long-unclaimed 2-line fix; it rides along
   because E6 depends on nobody re-tripping over it.

---

## 5. Sequenced plan

No dates. Sequence + tentative hours.

| Seq | ID | Task | Est | Depends on | Owner |
|---|---|---|---|---|---|
| 0 | — | ✅ `/plan-design-review` — **done 2026-08-01**: 6.75 → remediated → **8.1 PROCEED** | 0.5h | — | ✅ Claude |
| 1 | E1 | Generalise the component **+ all 8 E0 remediations** | 1.5h | 0 | Claude |
| 2 | E2 | Routing map as data | 0.5h | 0 | Claude |
| 3 | E3 | Mount on 15 learn pages | 0.75h | 1, 2 | Claude |
| 4 | E4 | Mount on blog | 0.33h | 1, 2 | Claude |
| 5 | E5 | Briefings sidebar swap | 0.67h | 1, 2 | Claude |
| 6 | E6 | Instrument `content_tool_click` | 0.5h | 3–5 | Claude |
| 7 | E7 | Correct the analytics comment | 0.05h | — | Claude |
| 8 | — | `next build` + full exit-evidence sweep | 0.5h | 1–7 | Claude |
| 9 | — | **Preview + Dilip verification** | 0.25h | 8 | **Dilip** |
| 10 | — | Merge + prod + request re-index on the 9 `/industries/*` | 0.25h | 9 | **Dilip** |

**Total ≈ 5.75h**, of which ~5.25h Claude and ~0.5h Dilip.

---

## 6. Risk register

| ID | Risk | Likelihood | Impact | Mitigation | Detection |
|---|---|---|---|---|---|
| **X1** | E1 refactor regresses the 3 shipped hub pages | Medium | High | Keep `DiscoveryCrossLink`/`NoticeCrossLink` as wrappers; don't touch call sites | Preview diff on all 3 hubs |
| **X2** | E5 regresses the `8c0a89d` mobile-duplicate fix | **Medium** | High | Swap inside the existing slot; never restructure the `lg:` classes | Mobile viewport shows the block once |
| **X3** | CTA blindness — sidebar now has 4 competing asks | Medium | Medium | E5 **swaps**, never adds | Visual review at step 9 |
| **X4** | `content_tool_click` silently doesn't fire | Medium | **High** — repeats the exact Phase B failure | E6 verifies on preview before merge, per the SEO/trust laws | Network tab shows the event |
| **X5** | Routing table sends a topic somewhere irrelevant → worse UX than no link | Low | Medium | §3 reviewed at step 0; default is always `/discovery` | Design review |
| **X6** | Shared working tree — another session moves HEAD mid-edit | Medium (has happened twice) | Medium | `git status` + mtimes + `list_sessions` before branching | Unexpected branch name |
| **X7** | Link equity spread too thin to move crawl budget | Medium | Low | One link per page, not a link farm — concentrates rather than dilutes | 7 Aug + follow-up GSC checks |

---

## 7. What this does NOT touch

No Appwrite schema, no migrations, no new dependencies, no content rewriting.
Untouched: the 12 assessment packs and scoring engine, the 4 data-flow maps, `/discovery`'s own
funnel, the Notice Pack builder, `/report/[token]`, `/admin/*`.

Explicitly **not** in scope: mid-article contextual links (E-3 → Phase 2), and any change to the
briefings *content* — that is `BRIEFINGS_DATA_QUALITY_SPEC.md`, a separate work stream.

---

## 8. What success looks like

**Mechanical (verifiable at step 9):** ~148 content pages each carry exactly one routed,
instrumented tool link. Zero pages dead-end.

**Phase B (the actual point):** `/discovery` traffic stops being the constraint. At the current
≈0.4/day the N=50 gate would take ~4 months. The plausible target after this lands is a
double-digit daily figure, putting the gate weeks rather than months out. **This spec does not
promise a multiple — the honest claim is that ~148 pages currently send zero referrals and
afterwards will send some, and only measurement settles the size.**

**SEO:** the 9 never-crawled `/industries/*` URLs, the 3 tools and `/blog` receive their first
internal links from ~103 indexed pages. Crawl-budget starvation is the diagnosed cause; internal
linking is the standard remedy.

**Gate:** once `content_tool_click` and `discovery_handoff_click` both accumulate, the N=50
denominator gate becomes runnable for the first time.

---

## 9. Verification checklist before merge

1. `next build` passes; route count unchanged.
2. All 15 learn + 3 sampled blog + 3 sampled briefing URLs return 200 and render exactly one block.
3. Each rendered target matches the §3 routing table.
4. The 3 existing hub pages are visually unchanged from prod.
5. Mobile: briefings detail shows the block once (X2 regression check).
6. `content_tool_click` observed firing on preview with the correct payload (X4).
7. **A11y (E0):** Tab reaches every CTA with a visible focus ring; all measured text/background
   pairs ≥ 4.5:1; both lucide icons carry `aria-hidden`; the block is an `<aside>` with no
   stray heading in the article outline.
8. `git status --short webapp/` — new files show `A`, not `??`.
8. ⛔ **Preview-before-prod law** — Dilip verifies on preview and confirms explicitly. Never self-merge.
