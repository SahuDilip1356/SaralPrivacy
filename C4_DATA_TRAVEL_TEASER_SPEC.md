# C4 — Data-travel teaser ("Watch your data travel") · spec

**Status:** draft v0.1 (2026-09-19). Placement decided: **option (a)**, the Privacy Thread becomes the sector lane. §12 decisions open. `/plan-design-review` (≥ 8) runs after they are answered. No code yet.
**Scope:** the Privacy Thread block inside S3 "Where risk hides" (`WhereRiskHides.tsx`), plus one server-side data module that reads three data-flow packs.
**Lane:** pre-Gate-3 conversion slice C4 (the last of four). Not a new tool, not a new sector, not a new route, not a new homepage section.
**Language:** English first, through the locale layer. Hindi keys ship alongside and stay dark behind `SHOW_HINDI=false` (see §4.5).
**Read with:** `webapp/components/home/WhereRiskHides.tsx`, `webapp/lib/data-flow/schemas.ts`, `webapp/lib/data/data-flow/index.ts`, `webapp/lib/data/sectors.ts`, `CONVERSION_SLICES_EXPLAINER.md` §7 (branch `claude/four-conversion-slices-f99951`), `TRANSFORMATION_SEQUENCE.md` §3 (branch `docs/transformation-sequence`).

---

## 1 · The problem in one line

The homepage says *"data scatters into your tools"* but never shows it **moving through a business like yours**. The twelve flow maps show exactly that, but they sit two clicks away and 10–12 stages deep. C4 puts a five-step, sector-tabbed preview of that journey on the homepage, with the sector's worst gap lit, one click from the full map. It is also the free test of whether visitors want the paid Data Flow Simulator (Transformation Sequence §3).

**Honest limit.** At ~0.1 assessments a week (analytics baseline, PR #27), this slice cannot show an assessment lift. What it can measure is **pull toward the maps** (§7). That is the signal the simulator decision needs.

## 2 · The decision taken, and what it costs

Placement **(a)**: the existing Privacy Thread (six dots, Collect → Delete, under the evidence panel) is replaced **in the same spot** by the sector lane. The page stays at ten sections.

| | Today | After C4 |
|---|---|---|
| Tool fan + evidence panel | unchanged | **unchanged**, including auto-tour and `risk_tool_select` |
| Line under the panel | 6 generic lifecycle dots; the lit dot follows the selected tool; `aria-hidden` | 5 sector-true steps, 3 tabs, worst gap lit, CTA to the full map; real content, not `aria-hidden` |
| Tool → lifecycle link | shown twice: the panel header text *and* the lit dot | shown once: the panel header text (`Lifecycle stage · Share`) |

**The cost, stated once:** picking a tool no longer lights a dot. No information is lost, because the panel header already states the stage in words. §7 measures whether the fan's engagement drops.

## 3 · What the visitor sees

```
DESKTOP (≥ sm), inside S3, below the evidence panel
  ┌──────────────────────────────────────────────────────────────────────┐
  │   [ Recruitment Agencies ]  [ CA Firms ]  [ D2C Brands ]              │  ← tabs
  │   Follow one candidate's CV                                           │  ← per-sector title
  │                                                                       │
  │   ●┄┄┄┄┄┄┄┄┄◉┄┄┄┄┄┄┄┄┄●┄┄┄┄┄┄┄┄┄●┄┄┄┄┄┄┄┄┄●                          │  ← teal dashed line, one gold node
  │   Find        Screen &     Send to     Verify &    Keep or             │
  │   candidates  engage       clients     offer       delete              │
  │               ▲ Worst gap: Personal WhatsApp holds candidate documents │  ← gold, pack rank-1 title
  │                                   See all 10 stages on the map  →      │  ← crosslink
  └──────────────────────────────────────────────────────────────────────┘

MOBILE (< sm): the same five steps as a vertical list with the dashed line
down the left edge (the fan's own desktop-canvas / mobile-list split).
```

| State | Trigger | What renders | Events |
|---|---|---|---|
| **L0 Composed** | server render, no JS, reduced motion | First tab selected, all five steps visible, gold node lit, caption and CTA present | none |
| **L1 Travel** | section enters view (motion allowed) | One dot travels step 1 → the gold step **once** (≈ 2 s), then rests. The line keeps the fan's existing `sp-dash-flow` dash motion | none |
| **L2 Tab change** | visitor picks another tab | Lane swaps; the dot replays once | `lane_sector_select { sector }`, not on re-select, not on arrival |
| **L3 Crosslink** | CTA click | Navigate to `/industries/{slug}/data-flow` | `flow_crosslink_click { source: "home_lane", sector }` |

Rules:
- **No auto-rotation of tabs.** The fan already runs a one-revolution auto-tour. Two self-moving things in one section compete, and the tour is the founder-directed one.
- **Fixed lane height** across the three tabs, so switching never moves the page below.
- The gold node is the eye's landing point. Nothing else on the lane is gold.

## 4 · The lane is derived, not drawn

### 4.1 Which view of each pack

The **default business model**, `pack.businessModels[0]`, via `filterByBusinessModel()`. That is what the map shows on landing, so the teaser and the page it links to agree. All three sectors show **10 stages** in their default view (recruitment's staffing-only *Onboarding* and *Exit* are hidden, as they are on the map).

### 4.2 The stage collapse

Rules (enforced by the §10 contract test):
1. **Exactly five steps** per sector. The same count everywhere, so presentation stays unified and the layout never reflows between tabs.
2. Each step is a **contiguous run of the pack's spine**, in `sequence` order. The lane reads left to right as the real process.
3. The mapping covers the **whole union spine**, so every stage in the pack is assigned exactly once, including model-gated ones. Any pack edit that adds or reorders a stage fails the test loudly instead of drifting silently.
4. **Step 5 is always the pack's archive/retention stage.** Every sector's lane ends on "Keep or delete".

**Recruitment agencies** (union spine 12 · default view 10)

| Step | Label (draft) | Stage IDs |
|---|---|---|
| 1 | Find candidates | `sourcing` · `registration` |
| 2 | Screen & engage | `screening` · `engagement` · `assessment` |
| 3 | Send to clients | `client-submission` · `interview` |
| 4 | Verify & offer | `bgv` · `offer` · `onboarding`* · `exit`* |
| 5 | Keep or delete | `archive` |

\* staffing-only: mapped for the test, not rendered in the default view.

**CA firms** (10 · 10)

| Step | Label (draft) | Stage IDs |
|---|---|---|
| 1 | Onboard & KYC | `onboarding` · `kyc` |
| 2 | Collect documents | `documents` |
| 3 | Books & returns | `accounting` · `tax-prep` · `gst-tds` |
| 4 | File & submit | `itr-filing` · `review` · `govt` |
| 5 | Keep or delete | `archive` |

**D2C brands** (10 · 10; the spine is the same across all three models)

| Step | Label (draft) | Stage IDs |
|---|---|---|
| 1 | Ads & browsing | `discovery` · `browsing` |
| 2 | Checkout & pay | `checkout` · `payment` |
| 3 | Pack & deliver | `fulfilment` · `delivery` |
| 4 | After the sale | `support` · `returns` · `marketing` |
| 5 | Keep or delete | `retention` |

### 4.3 Why not the six lifecycle words (a correction)

The first read of this slice suggested reusing the thread's six words (Collect · Use · Share · Store · Retain · Delete) as the lane's steps. The pack data rules that out. Pack spines are **business steps**; the lifecycle words are **data verbs**. No stage in any of the three packs is a "Store" step, because storage runs through every stage. "Retain" and "Delete" would both land on the single archive stage. The lane would show one permanently empty node and two nodes sharing one stage. The lifecycle words stay where they already work: the evidence panel header.

### 4.4 The hotspot rule

**Rank-1 hotspot → its `nodeId` → that node's `stageIds`, sorted by stage `sequence` → the first one → the step that contains it.** The rule chooses where the worst gap *enters* the journey. It is derived from pack data, never picked by eye.

| Sector | Rank-1 hotspot | Node stages | First | Lit step |
|---|---|---|---|---|
| Recruitment | `hs-personal-whatsapp`, "Personal WhatsApp holds candidate documents" | engagement · client-submission · archive | engagement | **2 Screen & engage** |
| CA firms | `hs-dsc-token`, "The firm holds the client's digital signature" | itr-filing · govt | itr-filing | **4 File & submit** |
| D2C brands | `hs-ad-audiences`, "Your customer list becomes an advertising audience" | marketing | marketing | **4 After the sale** |

Rejected alternative: light every step the node touches. Recruitment would light 3 of 5 steps, and "one worst gap" would stop being one.

`filterByBusinessModel()` does **not** filter hotspots, so the test must also assert that the rank-1 node is visible in the default model. If a pack's rank-1 ever moves, the lit step follows it automatically, which is intended.

### 4.5 Copy

- **Visitor copy lives in `messages/en.json`** under `home.riskMap.lane.*`: `tabsLabel` (aria), `worstGap` ("Worst gap"), `cta` ("See all {count} stages on the map"), and per sector `title` plus `steps.1–5`. Labels ≤ 20 characters so a desktop column holds them in two lines.
- **Tab labels** come from `SECTORS[].navLabel` (sectors.ts is the single source of truth for sector names). They are never retyped.
- **`{count}`** is `filterByBusinessModel(...).stages.length`, computed and never typed. It is our own structure, not an external statistic.
- **The worst-gap caption is the pack's hotspot `title`.** This is a deliberate exception to "copy in `en.json`": one claim, one source, so the teaser and the map can never word the same gap differently. It stays English on the Hindi route until the pack translation pass; Hindi is dark, so no visitor sees that.
- **No statistics, no DPDPA section citations** on the lane. If design review adds a citation, grep it against `allSections` in `content/dpdp-act-2023.ts` before merge.
- `hi.json` gets the same keys: drafts, marked for the Hindi content-QA pass. `threadTitle` is retired from both files (its only reader is the block this spec replaces).

## 5 · Rendering

- **The data is computed on the server.** `app/[locale]/page.tsx` calls `getDataTravelLanes()` and passes a small serialisable `lanes` prop down through `WhereRiskHides` (the pattern `HeroSection` already uses for `verdicts`/`previews`). The packs (nodes, edges, scenarios) never enter a client chunk.
- **All three lanes are in the DOM**, and two carry `hidden`. That is the evidence panel's rule, for the same reason: crawlers and reader mode see all three journeys.
- **Tabs** copy the semantics already on the page in `AudienceCards`: `role="tablist"` / `role="tab"` / `aria-selected`, plus arrow-key movement and a visible focus ring.
- **Lane** = an ordered list (`<ol>`), so a screen reader hears "list, 5 items". The gold step carries visually-hidden text: "worst gap".
- **Motion**: one travelling dot (CSS keyframes, `transform` only) plus the existing `sp-dash-flow` class on the line. `sp-dash-flow` animates `stroke-dashoffset`, so the lane line is drawn as an **SVG path**, not today's CSS `border-dashed` (which it cannot animate). `globals.css` already stops `sp-dash-flow` under `prefers-reduced-motion`. The dot gets the same guard: under reduced motion there is no dot and no dash motion, and L0 renders straight away.
- New component: `components/home/DataTravelLane.tsx`. It renders inside the already-client `WhereRiskHides`, so there is no new client boundary. It is kept in its own file so the 475-line section doesn't grow.

## 6 · Analytics (verify each fires on preview before merge; content/trust law)

| Event | Props | Change type |
|---|---|---|
| `lane_sector_select` | `sector` (map slug) | **new** helper `trackEvent.laneSectorSelect` |
| `flow_crosslink_click` | `source: "home_lane"`, `sector` | **additive**: one new member on the existing `source` union (`home_cards` / `assessment` / `discovery`) |

No PII. `sector` is the slug, never the display label.

## 7 · Measurement: a denominator gate, never a keep/kill window

Read from the Vercel dashboard (production, page `/`), **per 500 home visitors since ship** (a proposed N; Dilip sets it after the Step-0 dashboard read):

1. **Pull** (primary): `flow_crosslink_click{source=home_lane}` ÷ home visitors.
2. **Context**: the same rate for `source=home_cards` (the existing S6 crosslink). Does the lane pull more or less than the link we already have?
3. **Touch**: `lane_sector_select` ÷ home visitors.
4. **Cost of option (a)**: `risk_tool_select` ÷ home visitors, before vs after. If the fan's engagement drops, the tool→dot link was carrying weight.

This is a signal for the R4 simulator decision, not a Gate-3 metric.

## 8 · Design register + laws

| Pair (on `navy-700`) | Use | Measured |
|---|---|---|
| `gold-400` #E8AB42 | gold node, worst-gap caption | **8.52 : 1** |
| `teal-300` #67C8C5 | CTA link, selected-tab accent | **8.78 : 1** |
| `teal-400` #48BAB7 | dashed line, idle nodes (non-text, needs 3 : 1) | **7.41 : 1** |
| `slate-300` (v4 ≈ #CAD5E2) | step labels | ≈ 11.65 : 1, canvas-resolve at build |
| `slate-400` (v4 ≈ #90A1B9) | idle tab text | ≈ 6.58 : 1, canvas-resolve at build |
| white on `navy-600` #1E3355 | selected tab | **12.65 : 1** |

- **Gold, not red.** In this palette gold is the only risk colour (`WhereRiskHides.tsx` header). The roadmap note said "red hotspot"; red-600 on navy-700 measures **3.63 : 1** and fails.
- **Presentation unified, content varies:** five steps, one rule set, and one component for every sector. A fourth tab later means a new mapping entry plus copy, with no component change.
- **Pounce:** no new map, sector, tool or route. It reuses existing pack data.
- **Eval law:** no AI surface, so it does not apply. **Source-registry law:** no numerical claims; `{count}` is derived.
- **Not in scope** (standing constraints): no full lane board on the homepage, no nav mega-menu, no `/data-mapping` rename, no `?hotspot=` deep link on the map route (that would change the shared route for all 12 maps; it is a separate slice if wanted).

## 9 · Blast radius

| Could break | Loud / silent | Guard |
|---|---|---|
| `risk_tool_select` or the fan auto-tour, after editing the section around them | **silent** | Preview: select a tool and see the event in the network tab; watch one full auto-tour revolution |
| `.answer-block` speakable target at the foot of S3 | **silent** | Built HTML still contains `.answer-block` with `data-speakable` |
| Crosslink 404 from the `recruitment` vs `recruitment-agencies` slug split | **silent** | href comes from `DATA_MAPS`; test asserts every lane href is a live map |
| A pack stage added or reordered later → the lane drifts | **silent** → made **loud** | Contract test: exact contiguous cover of the whole spine |
| Pack data leaking into the homepage client JS | **silent** | After `next build`, grep `.next/static/chunks` for a string the lane never passes (e.g. CA rank-7 "Outsourced data entry with no written contract"); expect 0 hits |
| Retiring `threadTitle` while another reader exists | loud (missing-key render) | `git grep threadTitle` = the replaced block only (verified at spec time) |
| Section rhythm / design-lint | loud | No new `Section`; `scripts/design-lint.sh` passes |
| Other sessions editing the same files | loud (merge conflict) | Checked at spec time: no open branch touches `page.tsx`, `WhereRiskHides.tsx`, `messages/*` or `analytics.ts`. Re-check before build |

Six questions: no shared endpoint · English strings not used as keys (sector slug is the key, and the label is only displayed) · no write, no store · the pack data is read, never re-shaped for storage · additive event, one retired copy key · concurrent editors checked above.

## 10 · Where the changes land

| File | Change |
|---|---|
| `webapp/lib/data/data-travel-lanes.ts` | **new**: `LANE_STEPS` (stage IDs only) + `getDataTravelLanes()` → `{ sector, label, mapHref, stageCount, steps[5], hotspotStep, hotspotTitle }[]`. Sector list derived from `PRIORITY_PREVIEW_SLUGS` → `SECTORS` → `DATA_MAPS` (no fourth copy of the priority list) |
| `webapp/lib/data/data-travel-lanes.test.ts` | **new**: 5 steps; exact contiguous cover of each union spine; last step holds the final stage; rank-1 node visible in the default model; hotspot step matches §4.4; every href a live map. Run: `node --import ./scripts/ts-resolve.mjs --experimental-strip-types --test lib/data/data-travel-lanes.test.ts` |
| `webapp/components/home/DataTravelLane.tsx` | **new**: tabs, lane, caption, CTA, motion |
| `webapp/components/home/WhereRiskHides.tsx` | accepts `lanes`; the Privacy Thread block is replaced by `<DataTravelLane>`; `LIFECYCLE` array + thread coupling removed |
| `webapp/app/[locale]/page.tsx` | `getDataTravelLanes()` on the server, passed down as a prop |
| `webapp/lib/analytics.ts` | `laneSectorSelect`; `"home_lane"` added to the `flowCrosslinkClick` source union |
| `webapp/messages/en.json`, `hi.json` | `home.riskMap.lane.*` added; `threadTitle` retired |
| `webapp/app/globals.css` | one keyframe for the travelling dot, only if no existing utility does it, added to the existing reduced-motion block at line ~374 |

## 11 · Build sequence (tentative hours; sequence only, no dates)

| # | Step | Hours | Done when |
|---|---|---|---|
| B1 | Lane data module + contract test | 2–3 | Test green; flipping one stage ID makes it fail |
| B2 | `DataTravelLane` layout: desktop row, mobile list, fixed height, L0 composed state | 3–4 | Renders the three lanes at 375 / 768 / 1280 px with no JS |
| B3 | Motion: one-shot dot, dash flow, reduced-motion path | 1–2 | Dot runs once per view and per tab change; the reduced-motion emulation shows L0 only |
| B4 | Tabs, keyboard, focus rings, both events | 2–3 | Arrow keys move between tabs; events fire once per real selection |
| B5 | Wire-up: `page.tsx` prop, thread swap in `WhereRiskHides`, design-lint | 1–1.5 | Lint passes; fan, panel and auto-tour behave exactly as before |
| B6 | Copy: `en.json` + `hi.json`, content-law check | 1–1.5 | No stats, no unverified citations, labels ≤ 20 chars |
| B7 | Contrast + screen-reader pass | 0.5–1 | Every pair in §8 measured on the built CSS; the list reads in order |
| B8 | `next build` + preview verification against every §9 guard | 1.5–2 | All guards pass; preview URL handed to Dilip, then **stop** |
| | **Total** | **12–18** | |

Rules: `/plan-design-review` ≥ 8 **before** B1. Preview before prod, no self-merge.

## 12 · Decisions

| # | Decision | Recommended default | Why |
|---|---|---|---|
| D5 | Replace or coexist; placement | ✅ **Decided: (a)**, the thread becomes the lane | Every visitor sees it; the page stays at ten sections |
| C4-1 | Lane steps: sector-true steps (§4.2) or the six lifecycle words | **Sector steps** | §4.3: "Store" has no stage, and Retain/Delete share one |
| C4-2 | Worst-gap colour | **Gold** | The palette's only risk colour; red fails contrast |
| C4-3 | CTA target | **The full map, plain URL** | Original definition; the map already routes hotspots into the assessment; a deep link would change all 12 maps |
| C4-4 | Starting tab | **Fixed: first tab (Recruitment)** | Following the hero's pick needs `HeroSection` to publish its local `picked` state. That touches the just-shipped C1 and adds ~2–3 h. It can be a follow-up if §7 shows people use the tabs |
| C4-5 | The draft step labels in §4.2 | Accept as drafts; final wording in design review | Content work; you know how these businesses talk |
| C4-6 | Measurement N | **500 home visitors** per read | Set after the Step-0 dashboard read |

C4-4 **reverses** the earlier lean toward following the hero pick. The code shows that the hero keeps the chip pick in local component state and stores only *answered* picks (`sessionStorage` `sp.hero.answer`), so following it is not free.
