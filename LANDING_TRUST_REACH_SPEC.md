# SaralPrivacy — Landing Page: Data-Flow Layer + Trust & Reach Program

**Spec version:** 1.0 · 2026-08-03
**Owner:** Dilip Sahu · **Author:** Claude (design/eng partner)
**Branch:** `feat/data-mapping-nav-hiw` (created at `origin/main`, not yet checked out — build in worktree; a concurrent session is writing `fintech-nbfc` in this tree)
**Status:** Reviews passed (CEO 8.5 · Design 8.4 · Eng 8.5).
**Phase 1 MERGED to main `d9a341e` 2026-08-03** (preview-verified by Dilip; rebased onto
map #11 `11c31be`; 97/97 tests, build clean). Phases 2–4 not started.
Open decisions: 4c-lite share-card pull-forward (Dilip), Phase 2 mockup approval (Dilip).

---

## 1. Context & Problem

saralprivacy.com is a deep product (12 assessment packs, 10 live data-flow maps, notice
generator, discovery tool, 7-language guide, daily briefings) with weak motion:

- The **data-flow layer** — the platform's only "show, don't tell" surface — is invisible
  above the footer. Zero references in nav, hero, or any landing beat.
- The platform tells **two different journey stories**: `/data-mapping` says
  Discover → Map → Assess → Publish; the homepage HowItWorks says Discover → Assess → Fix;
  the header nav says neither. (HowItWorks copy already promises "Four steps" while
  rendering three.)
- **No spread mechanism exists.** A delighted user has no designed way to create the next
  user. `/discovery` ≈ 0.4 visitors/day; the Phase B analytics gate is starved because
  content pages dead-end with no in-body tool links.
- 9 of the never-crawled commercial URLs are `/industries/*` — internal-link tissue from
  the homepage is also an SEO/crawl fix, not just UX.

Deadline context: DPDPA obligations bite from **May 2027**. The platform must be the calm,
authoritative option before the panic wave, not a competitor inside it.

## 2. Goals & Success Metrics

| Goal | Metric (all events already wired or added in-phase) | Direction |
|---|---|---|
| Journey coherence | `hiw_step_click` (step: map) CTR; nav "Data Flow" CTR | new signal exists, >0 baseline |
| Feed the starved gate | `discovery_handoff_click`; flow-map → assessment clicks | up from ~0 |
| Crawl equity | `/industries/*/data-flow` + `/data-mapping` crawl/index status in GSC | never-crawled count down |
| Spread | new `share_card_click` / `share_forward` events | new signal exists |
| Trust conversion | assessment starts per landing session | up |

No traffic targets are set in this spec — denominators are too small today; the spec ships
*instruments* first (per the denominator-gate decision in memory).

## 3. Design Principles (encoded from platform laws)

1. **Show, don't claim** — demo the product; proof over assertion.
2. **No fearmongering** — the deadline is orientation, never panic (brand anti-style).
3. **Status-aware honesty** — no fake doors; unbuilt = labeled "in build" (Tool Rail lesson).
4. **Verified numbers only** — no unverifiable stats on any beat (2026-07-27 audit law).
5. **One standout per section** (design-review criterion from Landing Phase 2).
6. **WCAG before ship** — compute contrast for every new CTA; palette has pairs that look
   fine and measure as failures (green-500 white-text = 2.54:1 — do not repeat).
7. **URL stability** — `/data-mapping` and all indexed URLs unchanged. Labels ≠ URLs.
8. **Presentation unified** — landing/nav changes are framework-level; nothing ships to
   one industry's view alone.

## 4. Scope — Phased (sequence only; no dates. Hours are tentative build effort.)

### Phase 1 — Journey Coherence (~2–3 h) ← THIS BRANCH
**1a. Header nav item.** Insert into `navigation` array in
`webapp/components/layout/Header.tsx` between Data Discovery and Assessment:
`{ label: "Data Flow", href: "/data-mapping", badge: "Free" }`.
- Plain link, no dropdown. Mobile menu inherits from same array.
- Label decision (settled this thread): visible label **"Data Flow"**; URL, H1, metadata
  unchanged (SEO Cycle 2 in flight — no churn of indexed commercial URLs).
- **Risk & check:** desktop nav is `xl`-only with near-zero slack; verify no wrap at
  exactly 1280px; fallback = trim item padding at `xl`. `whitespace-nowrap` makes
  overflow visible, not silent.

**1b. HowItWorks 4-step spine.** In `webapp/components/home/HowItWorks.tsx`:
- Insert step 2: key `"map"`, title **"Map"**, sub "See where it travels — and where
  control breaks", tag "Data Flow", cap "Your sector's flow map", href `/data-mapping`,
  renumber to 1–4. Existing header copy "Four steps to DPDPA-ready" becomes literally true.
- New `StepArtifact` for `"map"`: quiet CSS/SVG node-and-arrow motif (3 nodes, 1 gold
  hotspot dot), matching existing chips/dial/PDF artifacts. No new deps, no client JS
  beyond what exists.
- Color: reuse **teal** (the data-flow product colour across lane board and
  `/data-mapping`) with a distinct icon (`Workflow`); Discover keeps teal ring but `Search`
  icon — differentiation via icon + artifact, not a new palette entry. (If design review
  scores this < 8, fallback: introduce `sky` tint only if already in Tailwind config.)
- Analytics: `trackEvent.hiwStepClick({ step: "map" })` — the param is a free string;
  zero lib changes. Verify event fires on preview before merge (analytics law).

**1c. Footer heading alignment.** "Data Mapping" column heading → "Data Flow Maps".
Links and hrefs unchanged.

### Phase 2 — The Demo Beat: "Watch your data travel" (~6–10 h)
Evolve **`WhereRiskHides`** (Beat 3, dark) rather than adding an 11th beat.
- Server-rendered, CSS-animated teaser of a real map: one lane, 4–5 stages, one red
  hotspot flag; 3 sector tabs (Clinic / School / D2C — recognisable, contrasting nouns).
- Data **derived from existing packs** at build time (import pack, slice stages) — no
  duplicated copy, no drift; packs stay single source of truth.
- NOT the React lane board (client-heavy; protects LCP on the highest-value page).
- CTA: "See your industry's full map" → `/data-mapping`.
- Tab switching = smallest possible client island (tabs only), content pre-rendered for
  all 3 sectors, hidden/shown — indexable HTML for all three (no `useSearchParams`).
- **Tab interaction states (design-review fix):** buttons with `aria-pressed`, not a
  tablist (simpler, correct for a toggle group). Selected = teal fill + navy text;
  unselected = white/10 border + slate text; hover = border-teal-500/40; focus =
  visible 2px teal ring (`focus-visible:ring-2 ring-teal-400`); all keyboard-reachable
  in DOM order. Reduced-motion: lane animation gated behind `motion-reduce` exactly as
  HowItWorks stagger already is.
- Gate: own mini design pass on mockup before build (this spec's design review covers
  intent; the visual itself needs the standard mockup approval).

### Phase 3 — Connective Tissue (~4–6 h)
> **Superseded by `DATAFLOW_LINK_SWAP_SPEC.md` (2026-08-03)** — implementation-grade
> expansion of 3a–3c plus the gated footer slim-down (swap-then-slim decision). Build
> from that spec; the summary below stands as originally scoped.
- **3a.** `AudienceCards`: add a "Data flow" quick-link per sector card, driven by
  `DATA_MAPS` registry (`live` flag) — live sectors link, planned sectors show nothing
  (no fake doors). Zero per-industry hardcoding.
- **3b.** `FlowCrossLink` component (mirror of existing `DiscoveryCrossLink`): mounted on
  Discovery results and assessment report pages — "You know what you hold — now see where
  it travels." Must include focus ring (existing cross-links lack one — fix the pattern,
  not just the new instance).
- **3b-i. No-map state (design-review fix):** when the viewer's sector has no live map
  (registry `live: false`), the component links to the `/data-mapping` hub with copy
  "See how data travels in businesses like yours" — never a sector deep-link that 404s
  or a hidden component that makes 2 of 12 sectors feel second-class. Driven by the
  same `DATA_MAPS` registry flag as 3a; zero hardcoding.
- **3c.** Instrument: `flow_crosslink_click` event added to `lib/analytics.ts`.

### Phase 4 — Trust & Reach beats (each gets its own sub-spec + design review before build)
Listed here for roadmap completeness and CEO-review scoring; NOT built under this spec:
- **4a. Hero applicability verdict** — two-tap "Does DPDPA apply to me?" (existing hero TODO).
- **4b. "Inspect us" beat** — our own notice, vendor register, DPO as a public exhibit.
- **4c. WhatsApp share cards** — assessment + flow-map results as forwardable artifacts.
- **4d. Ecosystem strip** — platform / dpdpa.wiki / dpdpa.shiksha, status-aware.
- **4e. Vernacular entry point** — visible language door above the fold (guide pipeline seed).

### Explicitly OUT of scope
- Any change to the data-flow engine, packs, routes, or per-industry views.
- URL/slug changes anywhere. Mega-menu of maps in nav. Full lane board on homepage.
- Founder-identity surfacing (deliberately unshipped earlier — needs its own decision).
- DPDPA-ready badge + sector-sticky personalization (Phase 5 candidates, separate spec).

## 5. Build & Ship Constraints

- **Worktree isolation mandatory** — a live session is building `fintech-nbfc` in the
  shared tree; do not checkout branches in the main tree (map #10 lesson: diff
  `origin/main..branch` + file list before merge).
- **Preview-before-prod law** — Dilip verifies on Vercel preview + explicit confirmation;
  never self-merge to main.
- `next build` must pass in-worktree; `\uXXXX` never used in JSX text children.
- Each phase = its own PR; Phase 1 has no dependency on 2/3.

## 6. Test / Verification Matrix (Phase 1–3)

| Check | How |
|---|---|
| Nav fits at 1280 / no wrap | Browser preview at 1280×800; also 1440, 375 |
| Mobile menu shows new item | Preview at 375 |
| HIW renders 4 steps + milestone + leaves, stagger intact | Preview + visual |
| `hiw_step_click {step:"map"}` fires | Network tab on preview (analytics law) |
| New CTA/text contrast ≥ 4.5:1 | Compute before ship (CTA law) |
| Existing tests still pass | `npm test` (buildRegister 14/14 etc. untouched but run) |
| `next build` clean | in worktree |
| No RSC-payload/SEO regressions | grep rendered HTML for HIW step links (indexable) |

## 7. Sequence & Effort Summary

| Phase | Effort | Depends on |
|---|---|---|
| 1 — Coherence | ~2–3 h | nothing |
| 2 — Demo beat | ~6–10 h | mockup approval |
| 3 — Tissue | ~4–6 h | nothing (parallel to 2) |
| 4 — Trust & Reach | ~4–8 h each | own sub-specs + reviews |

Two industry-map builds (fintech-nbfc live now, one more queued) run in parallel on their
own branches; file overlap with this spec = zero.
