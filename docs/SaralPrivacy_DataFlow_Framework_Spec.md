# SaralPrivacy Personal Data Flow Map — Framework Spec & Build Playbook

**Status:** Recruitment shipped to production (main `4d0e8c4`, 2026-07-21). This is the
harmony contract for building maps #2..#12. Read it before starting any new industry.

**Supersedes for framework purposes:** the original build spec
(`SaralPrivacy_Recruitment_DataFlow_Spec.md` + v1.1 addendum), which remain the recruitment
*content* record. This document is the *engine + visual system + process* contract.

---

## 0. What this product is

The middle of the product spine: **Discovery** (what data do I hold) → **Data Flow Map**
(where does it go, who touches it, where does control break) → **Assessment** (how ready are
my controls) → **Notice Generator** (publish a compliant notice). One config pack per industry
drives it; the components are shared and industry-agnostic.

Route: `/industries/{slug}/data-flow`, indexed, in sitemap. Hub: `/data-mapping`.

---

## 1. Change inventory — what was built (so a new build knows the finished bar)

**Original build (Gates 0–5, ~9 commits):** schemas + recruitment domain pack → React Flow
graph + mobile journey → animated MotionJourney → collapsed the 4 business models to 2 →
DPDPA overlay → Gate-5 review. Shipped the *first* readable version.

**Refinement pass this session (11 commits) — the bar a new industry must clear:**

| # | Change | Why it matters to a new pack |
|---|---|---|
| 1 | **Places, not copy events** (`e396798`) | Headline = distinct places, counted once; per-stage counts reconcile with the boxes. Copy-events summed alternative routes and overstated. **Locked metric.** |
| 2 | **Connected to Discovery + the scan** (`1420bf0`) | The map gets inbound links from `/discovery` and the assessment result. |
| 3 | **Header nav `lg`→`xl`** (`bc021f9`) | Chrome fix; not pack-specific. |
| 4 | **`/data-mapping` landing + footer + registry** (`5244a7c`) | The registry (`lib/data/data-flow/index.ts`) makes surfacing a new map **one line**. |
| 5 | **Hotspot titles clickable + `whyItMatters` rendered** (`333add2`) | 7 hotspots must each carry a real `whyItMatters`; the title opens the node sheet. |
| 6 | **Boundary correctness** (`e86f358`) | Added `third-party` boundary; classify each node by who really controls it. |
| 7 | **Risk ≠ boundary colour** (`cba82c3`) | The locked two-axis colour system (below). |
| 8 | **"Moving here" data per stage** (`abb06ff`) | Journey names the personal data moving, new-at-stage emphasised. **The thing that makes it a *data* map.** |
| 9 | **Louder teal chips + sticky legend** (`94544e1`) | Data chips are teal, filled+pulse when new; legend lives in the sticky panel. |
| 10 | **Lane board replaces React Flow** (`128691f`) | The "full system map" is now boundary-rows × stage-columns with a control wall; `@xyflow/react` deleted. |
| 11 | **Risk filter + HOT legend** (`4d0e8c4`) | The full map has a worst-first risk filter (dim, not remove) and a HOT key. |

A finished industry map = all 11 present, by construction, because they live in shared
components. A new pack inherits them free.

---

## 2. Engine architecture (what you touch vs what you never touch)

```
lib/data-flow/                     ← ENGINE. Do not fork per industry.
  schemas.ts        Zod types, BOUNDARIES, RISK_LEVELS, ASSESSMENT_BUCKETS, validatePack,
                    filterByBusinessModel, computePackSummary
  stage-data.ts     stageDataRollup() — "what data moves per stage", shared by UI + tests
lib/data/data-flow/
  index.ts          REGISTRY. PACKS map + derived landing/footer/sitemap lists
  {slug}/           ← CONTENT PACK. One folder per industry (the only new files)
    stages · nodes · edges · personas · data-categories · hotspots · index
components/data-flow/               ← SHARED UI. Industry-agnostic. Do not fork.
  MotionJourney · BoundaryLaneMap · HotspotRail · NodeDetailPanel · EdgeDetailPanel
  DetailSheet · flow-theme
app/industries/{slug}/data-flow/    ← ROUTE. Thin clone: page.tsx + DataFlowClient.tsx
```

**Adding an industry touches exactly:** one pack folder, one registry line, one route clone
(2 files). Nothing in `lib/data-flow/` or `components/data-flow/` should change per industry —
if it must, that's an engine change and belongs in its own PR, reviewed as such.

---

## 3. Build playbook — 3 steps + 2 blockers

### Step 1 — Content pack (`lib/data/data-flow/{slug}/`)
Seven files, same shape as `recruitment/`. Export `{slug}DataFlowPack: DataFlowPack`.
Proven cloning method: Python str-replace transform on the recruitment folder — swap the
industry constant/fn names, slug strings, and content. Then rewrite content by hand; the
structure is the scaffold, not the substance.

### Step 2 — Register (one line)
Add to `PACKS` in `lib/data/data-flow/index.ts`:
`"ca-firms": caFirmsDataFlowPack`. This alone lights the `/data-mapping` card, footer row,
sitemap entry, and removes it from "Coming next". Sector labels come from `sectors.ts` — never
invent a name.

### Step 3 — Route clone (`app/industries/{slug}/data-flow/`)
Clone `page.tsx` + `DataFlowClient.tsx`. Change only: pack import, canonical URL, breadcrumb
labels, and the industry accent token (§5). Everything else is generic.

### ⚠️ Blocker A — `ASSESSMENT_BUCKETS` is recruitment-shaped
`schemas.ts` defines a **typed literal union** of 5 buckets
(`candidate_sourcing / candidate_document / client_sharing / ats_tool_access /
retention_rights`). Every hotspot's `assessmentBucket` must be one, or `tsc` fails. **But each
industry's assessment pack uses different bucket keys** — CA's are
`client_document / intake / storage_access / retention / vendor_incident`. Recruitment's
matching its own assessment was luck, not design.
**Fix before building pack #2:** generalise buckets to be per-pack — move the allowed set onto
the pack (`pack.assessmentBuckets`) and drop the shared literal, OR type it as `string` with a
per-pack `validatePack` check against that pack's assessment. Do **not** map a CA hotspot to
the nearest recruitment bucket — the deep-link would land on the wrong assessment section.

### ⚠️ Blocker B — the test file is single-pack
`lib/data-flow/data-flow.test.ts` imports `recruitmentDataFlowPack` directly and pins
recruitment specifics (externalParties === 15, LinkedIn === public). **Parametrise the
STRUCTURAL tests over the registry** (gate minimums, places-reconcile, boundary taxonomy,
stage-data invariants) and keep pack-SPECIFIC content assertions in a per-pack file.

---

## 4. Hard constraints (tsc / validatePack / gate tests enforce)

- **Exactly 7 hotspots** (`.length(7)`), ranks 1–7 unique, each with a non-empty
  `whyItMatters` (rendered — not filler).
- **Gate-2 minimums:** 12 stages, ≥28 nodes, ≥40 edges, ≥12 copy-creating edges, ≥10 external
  edges. Σcaps need not equal anything — normalised.
- **Referential integrity:** no dup ids; every referenced stage/category/persona/node id
  exists; edge `external` MUST equal "either endpoint ∈ EXTERNAL_BOUNDARIES" (derived — get
  boundaries right and it follows).
- **One person node** (`candidate`-equivalent). Person nodes are EXCLUDED from the places
  count. Everything else is `system / repository / device / physical_storage`.
- **Boundaries:** `candidate` + `agency` internal; `client / vendor / government / third-party
  / public` external. `third-party` = data shared with no processing contract (past employers,
  references); `public` = collected from genuinely open sources. A NEW boundary needs entries
  in `flow-theme.ts::BOUNDARY_META` **and** `BoundaryLaneMap.tsx::LANE_ORDER + LANE_SUB`
  (note: `map-builder.ts` was deleted with React Flow — lane order lives only in the lane map now).
- **Data categories** align to the industry's Discovery niche wording (there's a test for it).
  `kind: "derived"` = inferred, not provided (scores, risk ratings) — rendered "· inferred".

---

## 5. The colour system — locked semantics + per-industry accent

The map carries **three semantic axes that MUST stay identical across all 12 industries.**
They are the whole reason a user can read any map without a manual:

| Axis | Encoding | Hue — **reserved, never reused** |
|---|---|---|
| **Risk** | fill + icon | amber (high) / red (critical) |
| **Trust boundary** | left rule + label + glyph | **violet-500** (`#8e51ff`, 4.4:1 on white) |
| **Personal data** | chip (filled+pulse when new) | **teal** |

### The per-industry accent — where it lives, and where it must NOT
Each industry has a card accent on `/industries` (verified list below). Use it as the map's
**chrome** hue to create instant per-industry distinction — but **only in the decorative
layer**, never on the three semantic axes. This is the harmony rule:

**Accent OWNS (safe — decorative, per-industry):**
- Hero band + eyebrow
- Stage-tile gradients (`MotionJourney::TILE_GRADIENTS` — currently position-cycled decoration;
  make them accent-derived)
- Sticky score-panel gradient + the counter numerals' brand glow
- Primary CTA, stage number badges, the self-drawing underline

**Accent must NEVER touch (reserved — identical everywhere):**
- Risk fill (amber/red) · Boundary rule + pill (violet) · Data chips (teal) ·
  the HOT badge (red) · the control wall (violet)

**Why this matters:** if a law-firm map went violet-dominant, violet would mean both "law-firm
brand" AND "outside your agency" — the exact risk/boundary collision this session spent commits
removing. The accent lives in a fourth layer (chrome), semantics stay constant.

### The 12 accents (from `app/industries/page.tsx`, in `sectors.ts` order)

| # | Sector | Card accent | Collision risk with a semantic axis? |
|---|---|---|---|
| 1 | Recruitment | **teal / green** | ⚠️ teal = data axis. Ships as-is (recruitment reads as "SaralPrivacy default"); for #2+ prefer the accent to differ from teal so distinction is real. |
| 2 | **CA Firms** | **indigo** | ✅ clear of all three. Good first accent to prove the system. |
| 3 | Training Institutes | amber | ⚠️ amber = risk fill. Use a deeper/warmer amber for chrome, or shift to gold, so risk stays unambiguous. |
| 4 | D2C Brands | rose | ✅ clear |
| 5 | Clinics & Diagnostic Labs | cyan | ✅ (near teal — keep chrome cyan-600+, not teal-ish) |
| 6 | Schools & Colleges | sky | ✅ clear |
| 7 | Law Firms | violet | 🚫 **violet = boundary axis.** Do NOT use violet as chrome. Shift to indigo/plum for law's chrome, or accept a monochrome-navy chrome for law only. |
| 8 | Real Estate | emerald | ✅ (keep off teal-green) |
| 9 | Hotels & Travel | orange | ✅ clear |
| 10 | Pharmacies | purple | ⚠️ adjacent to violet — use a redder purple (fuchsia-leaning) for chrome so it reads distinct from the boundary rule. |
| 11 | Fintech / NBFC | blue | ✅ clear |
| 12 | Gyms, Salons & Spas | fuchsia | ✅ clear |

**Implementation:** add one `accent` field to the pack (or a small `INDUSTRY_ACCENT[slug]`
map), feeding: hero classes, `TILE_GRADIENTS`, the sticky-panel gradient stops, CTA colour.
The three semantic hues stay hardcoded in `flow-theme.ts` and the components — they take no
accent input. That separation IS the harmony guarantee.

---

## 6. Metric discipline (non-negotiable)
- Headline = distinct **places** (non-person nodes, once each, at first stage). Never "N copies
  of one X".
- Any number advertised off-map (teaser card, `/data-mapping`, landing) must be scoped to the
  model the map opens on, so **promise === arrival**.
- Every stage's box count must equal its `+N places` increment — locked by test.

---

## 7. Process gate (before any code)
Same discipline as the industry-assessment packs:
1. Draft the journey content (12 stages, ~28+ nodes, 7 hotspots) as a spec.
2. Run **`/plan-design-review`** on it — average ≥ 8 before building.
3. Prereqs to confirm live first: the industry's assessment (`/assessment/{slug}`), its
   `/industries/{slug}` page, and its Discovery niche in `niche-items.golden.json`. CA has all
   three today.
4. Build → `tsc` clean → tests (structural, parametrised) → `next build` static → browser-verify
   (places reconcile, lane wall correct, chips/legend, keyboard) → branch → preview → ff-merge.

---

## 8. Known open items the framework inherits
- `ASSESSMENT_BUCKETS` generalisation (Blocker A) — do first.
- Test parametrisation (Blocker B).
- Persona *roles* (create/view/edit/share) are NOT modelled — edges carry no persona, and
  `accessPersonaIds` is a flat list. A real schema change if ever wanted; out of scope per pack.
- Tailwind `opacity-25`/`opacity-40` utilities were found NOT emitted by the build — use inline
  `style={{opacity}}` for state-driven opacity (as BoundaryLaneMap does).
