# Personal Data Discovery Tool — Build Spec (v1)

**Owner:** Dilip Sahu · **Status:** Planning → Build · **Date:** 2026-06-13
**Route:** `/discovery` · **Source:** Claude Design handoff (`saralprivacy-personal-data-discovery`)

---

## 1. Purpose & positioning

A free, no-login **top-of-funnel** tool that answers one question for an Indian
SMB owner: *"What personal data does my business actually hold, and how exposed
am I under the DPDP Act?"*

- **Wider but shallower** than the 8 deep `/assessment` packs. It maps **276
  business types** at a glance and produces an instant risk snapshot.
- **Feeds the funnel:** the result CTA routes into the full `/assessment` packs
  and captures a lead via the existing checklist-PDF flow.
- **SEO landing:** the page doubles as an indexable "what is personal data under
  DPDPA" educational page.

**Not** a compliance determination. Calm, practical, India-first. Educational
snapshot, not legal advice (disclaimer required on page and in result).

### Success criteria
- A user can go pick business type → confirm data → answer 3 questions → see a
  scored snapshot in **≈3 minutes**, with **no email required to see the result**.
- Scoring is a **faithful port** of `dpdpa_personal_data_map_v3.2` Scoring_Model
  (verified by golden test).
- Initial JS payload for the dataset is **≤ ~120 KB parsed** (not 1.6 MB).
- Lead capture reuses existing infra; **zero new backend** and **zero new deps**.

### Out of scope (v1)
- Bespoke per-niche PDF generation (use the 8 existing checklists + generic fallback).
- Admin dashboard for discovery leads (reuse `template_downloads` collection).
- The design-tool "Tweaks panel" (`tweaks-panel.jsx`) — design-time only.
- Auth, save-across-devices (localStorage only).

---

## 2. User flow

```
Landing (/discovery)
  ├─ Hero + preview card + "Start free check" → scrolls to #tool
  ├─ TOOL (4-step stepper)
  │    0. Business type   → industry group → searchable business type (276)
  │    1. Your data       → Core / Operational / Often-missed checklists
  │    2. 3 questions      → notice/instructions · vendor sharing · controls
  │    3. Your snapshot    → gauge, verdict, categories, hidden flags, top-5 fixes
  │                          → email-gated report  →  full assessment CTA
  ├─ Learn / SEO content (what is personal data, examples, penalty risk…)
  ├─ Full-assessment CTA block
  └─ Footer
```

State persists to `localStorage` (`sp_discovery_v1`) so a refresh resumes.
Stepper allows clicking back to a completed step. "Start over" clears state.

---

## 3. Data model

**Source of truth:** `dpdpa_personal_data_map_v3.2_all_niches.xlsx` — the master
sheet (vendored into the repo at `tools/data/`). We build **from the xlsx, not the
prototype's `dpdpa-data.json`**, because that JSON dropped the DPDPA Obligation
Trigger column we now carry (§3.3). Verified complete: 23 categories, 276 niches,
4,771 items — reconciles exactly with `dpdpa_taxonomy_master_v3.html` (DB v3.0).

### 3.1 Normalization (build step)
`tools/build-discovery-data.py` (Python + openpyxl, already available; avoids
adding an xlsx lib to Node) reads `Niche_Map` + `Data_Items_Long` + `Risk_Tag_Library`
+ `Scoring_Model` and emits a compact, typed `data.generated.ts`. Across 4,771 item
rows there are only ~182 unique item objects (96% duplication), so we normalize:

```
data.generated.ts:
  ITEM_DEFS:  ItemDef[~182]                 // {item, examples, tags, precaution, uiGroup, obligations}
  NICHE_ITEMS: Record<nicheId, ItemRef[]>   // {ref:index, seq, bucket, def}
  CATEGORIES: Category[23]
  NICHES:     Niche[276]
  TAG_LIB:    Record<tag, {weight, meaning, usedFor}>
  SCORING:    { bucketMult, q1, q2, q3, controlCap, modifierCap, totalCap, bands, confidence }
```

Runtime denormalizes refs → full items. Golden test asserts the denormalized
output is byte-identical to the master per-niche item lists for all 276 niches.

### 3.3 DPDPA Obligation Trigger (carried per item)
Each item carries `obligations: Obligation[]`, parsed by splitting the master's
`; `-separated trigger. Atomic set (6):
`Notice | Consent | Security safeguards | Retention & erasure | Vendor controls | Children (verifiable consent)`.
Does **not** affect the score (engine uses tags + bucket only). Used to: (a) group
the result's precautions by DPDPA duty, (b) flag child-data items
("Children (verifiable consent)" ≈ 250 items) prominently, (c) enrich the future PDF.
Drop the other 4 master columns (Data Subjects, Processing Purposes, Sources/Systems,
Channel) in v1.

### 3.2 Types (`lib/discovery/types.ts`)
```ts
type Bucket = 'Core' | 'Operational' | 'Hidden';
type Role   = 'F' | 'P' | 'B';            // fiduciary / processor / both
type RiskBaseline = 'low' | 'medium' | 'high' | 'critical';

interface Category { id: string; name: string; icon?: string; template?: string }
interface Niche    { id: string; name: string; cat: string; aliases?: string[];
                     role: Role; risk: RiskBaseline; tags: string[]; phase?: number }
type Obligation = 'Notice' | 'Consent' | 'Security safeguards'
                | 'Retention & erasure' | 'Vendor controls' | 'Children (verifiable consent)';
interface ItemDef  { item: string; examples: string; tags: string[];
                     precaution: string; uiGroup: string; obligations: Obligation[];
                     // v1.1 — enrich for the Personal Data Map (RoPA view). Zero dedup
                     // cost: still 182 unique defs. who/why/where, '; '-joined strings.
                     dataSubjects: string; processingPurposes: string; sources: string }
interface ResolvedItem extends ItemDef { id: string; seq: number; bucket: Bucket;
                     def: boolean; weight: number; uiShort: string }
interface ScoreResult { role; raw; normalized; modifier; control; final;
                     riskBand; confidence; notSure; selectedCount; totalCount;
                     categories: string[]; hiddenSelected: ResolvedItem[];
                     hiddenAvailable: number; precautions: string[]; answers }
```

---

## 4. Scoring engine (`lib/discovery/engine.ts`) — pure, no DOM/React

Faithful port of `app/engine.js`:

1. **itemWeight** = `max(tagWeight over item.tags)` × `bucketMult[bucket]`
   (tags do **not** stack; highest wins). `bucketMult` = Core 1 / Operational 1.2 / Hidden 1.5.
2. **raw** = Σ weight of selected items. **normalized** = `min(raw, 100)`.
3. **modifier** = 1.0 (no channel questions in this lightweight flow).
4. **control** = `min(q1·q2·q3, 1.5)` from the 3 answers (lookup tables in SCORING).
5. **final** = `round(min(normalized × min(modifier·control, 1.6), 100), 0.1)`.
6. **band**: Low <35 · Moderate <55 · High <80 · Critical ≥80.
7. **confidence** from share of "not sure" answers: High <0.1 · Medium <0.25 · Low else.
8. **categories**: friendly group names from tags, ordered by total weight.
9. **precautions**: from selected items, heaviest first, deduped text, top 5.

`resolveGroups(nicheId)` → 3 buckets (Core/Operational/Hidden) with titles/subs,
stamped with `id = nicheId:seq`, computed weight, and `uiShort` label.

Exported pure functions are unit-tested independently of the UI.

---

## 5. Screens (port targets — pixel-faithful, with baked-in fixes)

### 5.1 Landing chrome
- **Topbar:** sticky, navy 92% + blur. Logo `Saral`+green`Privacy`. Nav: Discovery
  tool / What is personal data / **Take free assessment** (primary pill).
- **Hero:** eyebrow pill, H1 (52px/800), subcopy, primary CTA + "no email" note,
  trust row (✓ 276 business types · ✓ Instant snapshot · ✓ Calm, India-first).
  Right: **preview card** — Diagnostic-lab data map (Core/Operational/Often-missed
  rows) + conic-gradient gauge reading **61 / High**.

### 5.2 Tool
- **Stepper** (navy bar): 4 steps with dots (active green, done ✓ clickable).
- **Step 0 — Business type:** two-level picker.
  - Dropdown 1: Industry group (23).
  - Dropdown 2: Business type — **searchable** (name + aliases), risk dots,
    "N business types" footer, disabled until industry chosen.
  - Quick-chips: diagnostic-labs, d2c-brands, ca-firms, recruitment-staffing, schools.
- **Step 1 — Your data:** lead note ("uncheck what you don't collect…"). Three
  `dgroup` cards (Core / Operational / Often-missed) each with select-all,
  per-item checkbox + UI-group tag + `i` info expander showing `examples`.
  Defaults: items with `def:true` pre-checked.
- **Step 2 — 3 questions:** numbered, pill button-groups. Q1 copy swaps for
  processors/both (role P/B): "work to documented client instructions" vs
  "clearly tell people why data is collected". Options incl. Yes/Partially/No/Not sure.
- **Step 3 — Snapshot:**
  - Verdict card (left-border = band color): **semicircle SVG gauge** (0–100,
    color by band) + band pill + confidence read + 1-line verdict.
  - 3 snapshot stats: items confirmed · often-missed in play · categories.
  - Narrative sentence (niche + categories + top hidden areas).
  - Two columns: category chips + flagged often-missed list · top-5 numbered precautions.
  - Regulatory-exposure note (navy callout, not legal advice).
  - **Email-gated report:** split CTA → email form → sent state with assessment CTA.
  - Restart link.
- **Nav bar:** Back (ghost) / Continue (primary, disabled until valid);
  step 2 → "See my risk snapshot".

### 5.3 Learn / SEO + CTA + footer
- Learn grid (main article + sticky aside: "3 control questions" + "Risk levels
  explained"). H3 sections: what is personal data, examples by category,
  compliance checker, how penalty risk arises, reasonable safeguards, full assessment.
- CTA block (navy): "Not sure if your business is DPDP-ready?" → full assessment.
- Footer: brand · "educational snapshot, not legal advice" · saralprivacy.com.

---

## 6. Lead / report wiring

Reuse **`POST /api/template-download`** unchanged. On report submit:
```
{ businessName?, contactName?, email, phone?, employees?,
  templateName: checklistFor(niche),   // one of 8 slugs or generic fallback
  consentBriefings?, source: "discovery" }
```
- `lib/discovery/checklist-map.ts` maps `niche.cat`/`niche.id` → existing checklist
  slug (e.g. `clinic-diagnostic-lab`, `d2c-brand`, `ca-firm`, `recruitment-agency`,
  `school-college`, `law-firm`, `real-estate`, `training-institute`).
- ~268 niches without a dedicated pack → **generic DPDPA starter checklist** fallback.
- Honeypot, rate-limit, IP/geo, subscriber opt-in already handled server-side.

> **Open item:** confirm form fields. Prototype asks email only; existing
> `/api/template-download` requires businessName + contactName + phone + employees.
> v1 will ask the minimum that endpoint requires (email + name + business + phone),
> OR relax the endpoint's required fields for `source:"discovery"`. Decide at build.

---

## 7. Architecture & files

```
app/discovery/
  page.tsx                ← SERVER: metadata + JSON-LD + landing + <DiscoveryClient/>
  DiscoveryClient.tsx     ← "use client": orchestrator, state, localStorage
  components/IndustryPicker | DataReview | ControlQuestions | Gauge | ResultPanel .tsx
  discovery.module.css    ← ported styles.css, tokenized
lib/discovery/
  types.ts · data.ts (static import) · data.generated.ts (artifact)
  engine.ts (+ engine.test.ts) · checklist-map.ts
tools/build-discovery-data.mjs   ← normalizer (one-shot)
```
- Server/client split mirrors existing `assessment/*/page.tsx` → `*Client.tsx`.
- Static import honors the "all at once" decision; normalization keeps payload small.

### Metadata / SEO
- Indexable (unlike the noindex assessment pages — this is a landing page).
- `title`, `description`, canonical `https://saralprivacy.com/discovery`,
  OpenGraph, and `WebApplication` + `FAQPage`/`Article` JSON-LD for the learn content.
- Follow `nextjs-metadata-seo-rules` (no inherited homepage canonical/og:url).

---

## 8. Design-system fixes folded into the port (from design review)

The prototype is visually strong but carries implementation debt. These are
**build acceptance criteria** — they change code quality, not the visual output:

| # | Dimension | Fix |
|---|-----------|-----|
| ② | State coverage | Inline email error (replace silent return); API-failure + loading states on report submit; per-niche "no items" guard |
| ③ | Typography | Collapse 20+ ad-hoc sizes (incl. 16.5/13.5/12.5/10.5) to ~8 token steps |
| ⑤ | Spacing | Snap arbitrary px (11/22/26/34/56) to 4/8 grid |
| ⑥ | Interaction | Add `:focus-visible` rings to buttons, dropdown items, custom checkboxes, pills |
| ⑧ | Accessibility | Combobox/listbox ARIA + **arrow-key nav** for the 276-item picker; `radiogroup` for pills & questions; labelled gauge (`role="img"`); darken `--muted` to pass 4.5:1 |

---

## 9. Edge cases (≥1 per code path)

- Unknown/stale niche in localStorage → guard, reset to step 0.
- Empty selection → Continue disabled + visible hint.
- All "not sure" → confidence "Low" banner; score still computes (control capped 1.5).
- Niche with no items (data gap) → skip to questions with notice; never blank.
- Niche not in 8 packs → generic checklist fallback.
- API 429 / 500 on report send → inline error + retry; snapshot stays on screen.
- Invalid email → inline field error.
- Bot/abuse → server-side honeypot + rate-limit (existing).

---

## 10. Test matrix

- **Unit (`engine.test.ts`):** itemWeight (max tag, no stacking, bucketMult),
  normalize cap@100, control cap@1.5, band thresholds (35/55/80), confidence
  buckets, precaution dedupe/top-5. `checklist-map` (each cat→slug + fallback).
- **Golden (`build-discovery-data`):** normalized→denormalized == original for all 276.
- **Integration:** report submit vs mocked `/api/template-download` (200/429/500).
- **E2E smoke:** happy path; back-nav preserves state; restart clears.

---

## 11. Dependencies

**None.** Reuse `/api/template-download`, Appwrite client, abuseGuard, subscribers,
CSS-module + server/client page conventions, existing checklist PDFs. Engine ≈120
lines stdlib; normalizer is a Node one-shot. No new libraries.

---

## 12. Build sequence

1. Normalizer + `data.generated.ts` + golden test
2. `lib/discovery/`: types, data, engine (+ unit tests), checklist-map
3. Components: IndustryPicker, DataReview, ControlQuestions, Gauge, ResultPanel, DiscoveryClient
4. `app/discovery/page.tsx`: landing + metadata + JSON-LD + tokenized CSS module (with §8 fixes)
5. Wire report → `/api/template-download` (`source:"discovery"`)
6. Verify: unit tests green → preview workflow on `/discovery`
```

---

## 13. Personal Data Map (v1.1 — detailed report)

**Why:** the snapshot answers "how exposed am I"; business users also need "what data
am I actually dealing with." This turns the result into a usable **personal-data
inventory / RoPA starter** — and pre-fills the existing `data-inventory-register.xlsx`.

**Data:** carry 3 more master columns per item (`dataSubjects`, `processingPurposes`,
`sources`) — verified **zero dedup cost** (still 182 unique defs; ~30 KB added).

**On-screen map (free, in the result):** below the snapshot, a **"Your personal data
map"** section listing the confirmed items grouped by Core / Operational / Hidden. Each
row is a mini-RoPA entry:

| Column | Source field |
|---|---|
| **Data item** (+ examples) | `item` / `examples` |
| **Who** | `dataSubjects` |
| **Why** | `processingPurposes` |
| **Where it lives** | `sources` |
| **Sensitivity** | `tags` → friendly (reuse TAG_GROUP) |
| **DPDPA duty** | `obligations` |

Responsive: table on desktop, stacked cards on mobile. Hidden-bucket rows get the
orange accent (where exposure concentrates). Counts shown per group.

**CSV download (email-gated):** "Download your data inventory (CSV)" — client-side
generates a CSV of the confirmed items with all columns + a header row matching the
inventory register. Gated via the existing `/api/template-download` lead flow
(`source:"discovery"`). On success: download the CSV; for dedicated-pack niches, also
deliver the industry checklist PDF. Every niche has a map, so the CSV is universal
(replaces the dedicated-vs-generic CTA split — generic niches now get the CSV too,
plus the assessment CTA in the sent state).

**Data flow:** `DiscoveryClient` passes `selected` (Set) + `niche` to `ResultPanel`,
which builds the map from `resolveGroups(niche)` filtered to `selected` (full item
objects, now incl. who/why/where). Engine unchanged — no score impact.

**Edge cases:** empty selection → no map (can't reach result anyway); CSV escaping
(quote fields, escape `"`); API 429/500 on gated download → inline error, map stays.

**Design-review:** run `/plan-design-review` on the map section before build.
