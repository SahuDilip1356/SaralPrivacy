# Recruitment Personal Data Flow Map — v1.1 Build Addendum

**Status:** Authoritative for *what ships first*.  
**Parent:** `docs/SaralPrivacy_Recruitment_DataFlow_Spec.md` (v1.0 product bible)  
**Date:** 2026-07-18  
**Rule:** Where this addendum conflicts with v1.0 on **MVP must-ship**, this file wins. Domain depth, legal guardrails, and repo-reality corrections in v1.0 remain binding.

---

## A. Verdict on the presented spec

| Question | Answer |
|---|---|
| Is the v1.0 spec enough to build? | **Yes as a product bible** — thesis, lifecycle, catalogues, node/edge model, guardrails, routes, and phased gates are excellent. |
| Is it enough as a *build contract* without change? | **No** — acceptance still implies all 7 views + dense filters as equal must-haves, which dilutes the Falcon-1 flight. |
| What was missing? | North-star success metrics, view priority ladder, signature “erasure” moment, naming collision with Discovery, minimum domain-data completeness, Assessment deep-link UX, Karpathy cut list. |
| What we do | Keep v1.0. Ship against **this addendum’s P0**. Treat remaining v1.0 “Must” items as P1 unless listed below. |

**Score (product bible quality): 8.6 / 10**  
**Score (build focus / shippability): 6.5 / 10 → 9 / 10 after this addendum**

---

## B. Gstack evaluation matrices

### B1. Office-hours reframe (pain → product)

```
PAIN:        Recruitment businesses cannot find/delete/control candidate
             personal data because copies hide across WhatsApp, Excel,
             email, clients, AI tools and backups.
PROPOSED:    Interactive Personal Data Flow Map (set aside as form).
HIDDEN:      Operational visibility of personal-data movement + copy risk.
REFRAME:     You said "data flow map". You're actually building
             "erasure & control visibility" — make the invisible pipeline
             undeniable, then push into Assessment.
```

### B2. Intent contract (PRD lock)

```
FOR:         Recruitment agency founder + ops head (India SMB; also
             recruiter/compliance as secondary).
PROBLEM:     "We don't know where candidate data went — so we can't
             control or delete it."
SUCCESS:     Within one session on /data-flow, user opens ≥3 nodes OR
             ≥1 hotspot, and clicks Assessment OR Discovery CTA
             (instrumented). Qualitative: can explain "copies + external
             share" in their own words.
OUT OF SCOPE (P0): other industries, live scanning, saved maps, exports,
             numeric exposure engine, system-checklist wizard, full
             persona-studio view, blank modelling canvas.
ASSUMPTIONS: 1) Reference model feels "that's us" without customisation.
             2) Copy story is the aha moment.
             3) Hotspot → Assessment increases starts vs industry page alone.
ROLLBACK:    Feature-flag or remove landing preview + /data-flow route;
             industry assessment + discovery remain intact.
```

### B3. CEO mode (already chosen)

```
MODE:        Selective Expansion (Falcon-1)
WEDGE:       One candidate · many copies · trust-boundary crossings
SHIP:        Recruitment only, deep; config reusable later
```

### B4. Eng checklist (pre-build lock)

```
ARCHITECTURE: Static TS config (Zod) → map-builder → view projections →
              @xyflow/react canvas (desktop) / MobileFlowView (mobile).
              No DB. No Zustand. One new dep: @xyflow/react.
DATA FLOW:    Config modules → validate at build/test → client loads pack →
              filters/view mode project nodes/edges → panel from node/edge id.
EDGE CASES:   Empty filter result; staffing vs permanent stage hide;
              reduced-motion; keyboard focus trapped in panel; malformed
              config fails tests; mobile never loads full graph;
              unknown riskLevel defaults to "needs review" styling + icon.
TEST MATRIX:  unit: schemas, map-builder, filters, hotspot rank |
              integration: pack validates + assessment bucket keys exist |
              e2e: open map → click WhatsApp node → hotspot → assessment CTA
DX:           Add industry later = new pack folder only.
DEPENDENCIES: @xyflow/react only — justified (graph interaction).
```

### B5. Scorecard (0–5)

| Criterion | v1.0 alone | After v1.1 addendum | Note |
|---|---|---|---|
| Pain clarity | 5 | 5 | Excellent |
| Wedge sharpness | 4 | 5 | Copies + boundaries elevated |
| Scope discipline | 3 | 5 | View ladder + P0 cut |
| Repo fit | 5 | 5 | §0 corrections are gold |
| Reuse Discovery/Assessment | 4 | 5 | Deep-link UX specified |
| Legal/claims safety | 5 | 5 | Keep strict |
| Ship speed | 3 | 5 | P0 flight path |
| Future industry reuse | 5 | 5 | Config-first preserved |
| Orchestration overhead | 2 | 4 | Optional; sequential OK |
| Content completeness gate | 2 | 5 | Min nodes/edges/hotspots |

---

## C. Signature product moment (non-negotiable)

Every session must deliver this arc — even if motion is off:

1. **One person** (Candidate)  
2. **Data spreads** across systems  
3. **Copies multiply** (duplicate markers)  
4. **External crossings** light (client / vendor / AI)  
5. Question: **Can you delete every copy?**  
6. **Top hotspots** → practical actions  
7. CTA → **Assessment** (controls) and **Discovery** (inventory)

If the UI is beautiful but this arc is weak, the build failed.

---

## D. Naming (avoid collision)

| Surface | Name |
|---|---|
| Discovery result table | Keep **Personal Data Map** (inventory: what/who/why/where) |
| This product | **Personal Data Flow Map** or **Personal Data Journey** |
| UI eyebrow | “Where your data travels” |
| Never | Call both “Personal Data Map” without qualifier |

---

## E. View priority ladder (replaces “all 7 views must ship equally”)

| Priority | Views | Ship rule |
|---|---|---|
| **P0 — Falcon-1** | Process journey (default) · Systems map · Copy proliferation · External sharing · Risk heat (toggle) | **Required for launch** |
| **P1 — same release if time** | DPDPA obligation overlay · Top-5 hotspots summary · Business-model selector | Should-have; do not block launch if Process+Systems+Copy+External+Risk work |
| **P2 — next iteration** | Persona-access as full view · Numeric exposure engine · System-selection checklist · Shareable URL | Explicitly after launch |

**Filters in P0:** process stage, organisation boundary, “copies only”, “external only”, risk toggle.  
**Defer dense multi-filter rail** (persona + every data category at once) if it delays launch — keep category filter as nice-to-have.

---

## F. Domain-data completeness gate (Gate 2)

Before any UI polish, the recruitment pack must pass:

| Artefact | Minimum |
|---|---|
| Process stages | 12 defined; 10 visible for permanent; +onboarding/exit for staffing/RPO |
| Nodes | ≥ 28 (mix of system, repository, device, client, vendor, persona) |
| Edges | ≥ 40 with purpose + action + channel |
| Copy-creating edges | ≥ 12 marked `createsCopy: true` |
| External edges | ≥ 10 marked `internalOrExternal: "external"` |
| Hotspots | Exactly **7** curated (see §G), each with action + assessment bucket |
| Data categories | 11 groups from v1.0; Discovery `recruitment-staffing` IDs referenced where matching |
| Orphans | 0 orphan nodes, 0 edges to missing nodes |
| Shadow IT | Must include: personal WhatsApp, Excel tracker, recruiter laptop, unapproved AI, backup |

---

## G. Canonical 7 hotspots (P0 content SSOT)

| # | Hotspot | Assessment bucket |
|---|---|---|
| 1 | Personal / recruiter WhatsApp | `candidate_document` |
| 2 | Shared Excel tracker | `ats_tool_access` |
| 3 | Client email attachment share | `client_sharing` |
| 4 | Unapproved AI resume tool | `ats_tool_access` |
| 5 | Recruiter laptop / downloads | `candidate_document` |
| 6 | Indefinite ATS / Drive retention | `retention_rights` |
| 7 | BGV vendor transfer | `candidate_document` or `client_sharing` (pick one; document in config) |

Each hotspot panel: what happens · why it matters · data involved · action · CTA “Check this in Assessment”.

---

## H. Integration improvements

### H1. Assessment deep-link

v1.0 correctly notes the wizard has no per-question anchors. Improve:

- Link format: `/assessment/recruitment?from=data-flow&bucket=<bucketKey>`
- Assessment client: if `bucket` present, scroll/highlight that bucket’s first question or show a one-line banner: “You’re checking: Client sharing”.
- Do **not** invent fake question IDs in the URL.

### H2. Discovery cross-link

- From Discovery ResultPanel (niche `recruitment-staffing`): CTA “See where this data travels” → `/industries/recruitment-agencies/data-flow?from=discovery`
- From Flow Map: CTA → `/discovery` with industry pre-hint if the product already supports it; else generic `/discovery`.

### H3. Industry landing placement

Keep v1.0 placement (between Risk map and How the scan works). Add sidebar card. Preview must not claim user-specific copy counts.

---

## I. Karpathy / simplicity cuts (explicit)

| Cut | Why |
|---|---|
| Zustand | Not in repo pattern; local state enough |
| Numeric risk engine in P0 | Author `riskLevel` + 7 hotspots; engine is P2 |
| Full persona-access view | Access list inside node panel is enough for P0 |
| System-selection wizard | Business-model toggle only |
| Multi-agent YAML as mandatory | Optional; **sequential gated sessions** are enough (audit → domain → UI → polish) |
| Radial ring visual identity | Defer; use existing brand + semantic shapes |
| “Digital Twin” / “Data DNA™” in UI | Internal strategy language only until product proves usage |
| India’s-first marketing claim | Gate: verify before homepage/hero use |

---

## J. Revised acceptance criteria (launch)

Replace v1.0 §30 item 2 for launch. Launch is complete when:

1. Signature arc (§C) works with and without motion.  
2. **P0 views** work from one config model.  
3. ≥28 nodes / ≥40 edges validate; 7 hotspots complete.  
4. External + copy edges visually distinct (not colour-only).  
5. Every high-risk node explains why + ≥1 action.  
6. Assessment CTA with `bucket` query works.  
7. Discovery CTA works.  
8. Mobile = vertical journey; desktop = graph.  
9. Config-driven; no hard-coded business graph in components.  
10. No fake “your copies” metrics.  
11. Reduced-motion equivalent experience.  
12. `next build` clean; parent industry page stays static where it is today.  
13. Privacy/claims review passed (no compliance-score language).

---

## K. Phased delivery (compressed, conviction build)

| Phase | Outcome | Gate |
|---|---|---|
| 0 | Repo audit notes (short; §0 already done) | Skip long re-audit unless structure drifted |
| 1 | Zod schemas + full recruitment pack + completeness tests | Gate 2 (§F) |
| 2 | Desktop P0 views + panels + hotspots | Gate 3 |
| 3 | Mobile journey + business-model toggle + DPDPA overlay if ready | Gate 4 |
| 4 | Landing preview + analytics + a11y + privacy review | Gate 5 → Ship |

**Do not** wait for all 8 orchestration agents to finish documents before Phase 1 config. Domain pack is the critical path.

---

## L. What stays from v1.0 (do not dilute)

- 12-stage lifecycle depth  
- 11 data categories + provided vs derived  
- Trust boundaries  
- Four ownership concepts (wording in panels)  
- Legal/claims guardrails  
- Repo-reality §0  
- Config-first architecture for future industries  
- Non-goals (no scanner, no RoPA certification, no legal advice)

---

## M. Final recommendation

1. **Do not rewrite** the comprehensive v1.0 scope from scratch.  
2. **Build against this v1.1 addendum** as the ship contract.  
3. Keep v1.0 as the domain + quality bible.  
4. After Recruitment Falcon-1 ships, clone the pack pattern to CA / Law / Clinic — do not expand views before the second industry pack exists.

**One-line build order:**  
*Content pack → P0 interactive views → hotspots → Assessment/Discovery glue → landing teaser → polish.*
