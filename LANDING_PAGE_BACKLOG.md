# Landing Page — Bug & Improvement Backlog

_Created 2026-06-23. Consolidated register of everything surfaced across the landing-page planning threads. Durable hub so nothing depends on a single chat surviving. Status: all items **identified, not started** unless marked. Nothing committed to git yet._

> **Active decision:** ship the **Privacy Notice tool first** (see `NOTICE_GENERATOR_SPEC.md`). Homepage items (B–E below) are the queued workstream.

---

## Related docs (durable, in repo)
- `HOMEPAGE_DISCOVERY_FIRST_SPEC.md` — comprehensive restructure spec (CEO + design review folded in).
- `NOTICE_GENERATOR_SPEC.md` — Privacy Notice tool spec + dev plan + eval criteria.
- `LANDING_PAGE_HANDOFF.md` — repo gotchas, tiers, decisions (note: has a "13th sector" overcount → E1).
- `DEV_BACKLOG.md` — ranked product roadmap (P0 = this homepage redesign).
- `docs/landing/mockup-v2.html` — visual source of truth (copied in from Downloads).
- `docs/landing/mockup-v1.html` — earlier mockup (trust-badge framing; superseded).

## Related planning threads (CCD sessions — deep context lives here)
- **"Landing page redesign handoff"** (2026-06-21) — the locked decision: Discovery-first journey; carried into the current thread.
- **"Awesome Design MD skills"** (2026-06-21, Skills Library/Design) — design review: *"approve the Discovery-first structure, but not to build without **5 corrections**."* ⚠️ verify these 5 are all captured below.
- **"SaralPrivacy About page structure"** (2026-06-21) — audit of the landing proposal doc (one great idea + trivial fixes).
- **"Landing page architecture audit"** (2026-06-14) — original audit (one of the 3 that validated Discovery-first).
- **"Landing page design discussion"** (2026-06-19) · **"Saral Privacy development status"** (2026-06-20) — distillation into DEV_BACKLOG.
- **"SaralPrivacy tier classification"** (Skills Library/Design, PR #4) — product-tier framing.

---

## A. Privacy Notice Generator — active workstream (ship first)
| ID | Item | Status |
|----|------|--------|
| A0 | Stack mis-specced (Node/PG → Next.js + Appwrite) | ✅ fixed in spec |
| A1 | Legal §5 template review — who signs off | ⏳ needs Dilip (blocks publish) |
| A2 | Confirm no-login v1 (email-at-download only) | ⏳ confirm (rec. yes) |
| A3 | Confirm rules-based assembly, no LLM v1 | ⏳ confirm (rec. yes) |
| A4 | Hindi at launch vs fast-follow | ⏳ confirm (rec. fast-follow) |
| A5 | `/plan-design-review` on the wizard (≥8 gate) | ⏳ not run |

## B. Correctness bugs (homepage)
| ID | Bug | File | Severity |
|----|-----|------|----------|
| B1 | Assessment picker shows only **8 of 12** sectors | `webapp/components/home/AssessmentCTA.tsx:31-40` | High |
| B2 | Picker hardcoded → drift risk (wire to `sectors.ts`) | same | Med |
| B3 | `sectors.ts` lacks `questionCount` (needed for B1) | `webapp/lib/data/sectors.ts` | Low |
| B4 | Homepage order buries Discovery 6th / Assessment 7th; Briefings above both | `webapp/app/page.tsx` | High |
| B5 | Nav primary CTA ≠ Hero primary CTA (both → Discovery) | Hero + Header | Med |

## C. Copy / content fixes (ride-alongs)
| ID | Fix |
|----|-----|
| C1 | "10 minutes" → **3–5 min** everywhere |
| C2 | Guide "45-page" → **59-page** (`WhitePaperSection.tsx`) |
| C3 | 4-sector leak → **12 sector** (`WhitePaperSection.tsx`) |
| C4 | "90-day" vs "30-day" → standardize **30–90 days** |
| C5 | "whitelist" → **negative-list** cross-border wording |
| C6 | Hero H1 picked fear-leaning option → use softer **Option A** (no-fearmongering rule) ⏳ Dilip's call |
| C7 | Press strip missing **Lokmat Times** (has Business Standard, ANI, The Tribune, Latestly) |
| C8 | Stale `<title>` "Verified digital trust for Indian business" (removed trust-badge framing) |

## D. Design / UX improvements (the 6.5/10 design-review fails)
| ID | Item |
|----|------|
| D1 | **Accessibility** (biggest gap): contrast ≥4.5:1, keyboard reach, `prefers-reduced-motion`, ARIA on icon-only arrows |
| D2 | **State coverage** undefined for JourneyStrip / picker / sample-card |
| D3 | **Type scale + spacing tokens** not pinned (reuse existing classes; 4/8/16/24) |
| D4 | **Focus/active states** under-specified on CTAs, picker rows, JourneyStrip |
| D5 | **Sample-result card** must be labeled "illustrative example" (trust risk) |
| D6 | **12-card wall** (AudienceCards) should be grouped, not raw |
| D7 | Two adjacent CTAs (Discovery + Assessment) need visual weight difference |
| D8 | **Two dark moments only** — only the Journey strip + final CTA are navy; everything between stays light (restraint + rhythm). _From the "5 corrections" review._ |
| D9 | **Restrained motion** — purposeful only, **no over-animation, no scroll-jack**. JourneyStrip = numbered horizontal strip, one verb + one outcome each. _From the "5 corrections" review._ |

### Brand non-negotiables (apply to all homepage copy/UI) — _from the "5 corrections" review_
Sentence-case headers · **one green CTA per viewport** · active voice · **no "legal compliance" wording** · India-first framing · calm-not-fearful risk language (ties to C6). These were applied in the design-md mockup but were not written into the spec — make them DoD checks.

### Design tokens already exist (resolves D3's "not pinned")
A synthesized token system was produced in that session: **Trust Navy + Verification Green, hairlines not shadows, tight Inter** — saved at `Skills Library/Design/design-md/examples/saralprivacy/DESIGN.md` (also in the handoff zip's `DESIGN.md`). D3 should **adopt this sheet** rather than invent a new one.

## E. Doc / repo hygiene
| ID | Item | Status |
|----|------|--------|
| E1 | "13th sector" overcount in `LANDING_PAGE_HANDOFF.md` (it's **12**) | ⏳ uncorrected |
| E2 | Stray filesync dup `lib/data/sectors 2.ts` — delete | ⏳ |
| E3 | 5 Downloads = v1 + v2(×3 identical) + handoff zip; v2 = visual SoT | ✅ v1/v2 copied to `docs/landing/` |

---

## Open scope decisions (Dilip)
1. **Design gate** — Path 1 (pre-build token+state pass + re-score ≥8) vs Path 2 (override → eng DoD).
2. **Multilingual** — ship 7-lang Guide as-is vs vernacular funnel (changes scope).
3. **Notice tool sequencing** — ship `/tools/privacy-notice` standalone first vs wait for restructure.
4. **Hero snapshot placement (NEW divergence)** — the "5 corrections" review wanted an outcome/snapshot card **in the hero, above the fold** ("feels like a tool, not a policy site"; mockup v2 has it as the "DPDPA Data Snapshot" card). But `HOMEPAGE_DISCOVERY_FIRST_SPEC.md` specs a **slim hero** with the sample-result card lower, in the Assessment section. **Reconcile:** snapshot card in hero, in assessment, or both?

## ✅ "5 corrections" reconciliation (done 2026-06-23)
All five from the "Awesome Design MD skills" review (2026-06-21) are now reconciled:
1. Founder-before-Get-help → captured (spec §6/§7).
2. Hero snapshot card → **divergence logged** (decision #4 above).
3. Two dark moments only → **added (D8)**.
4. Restrained motion / no scroll-jack → **added (D9)**.
5. No metric inflation → gate **closed** (12 sectors verified live → "12 sector assessments" is honest, not inflated); principle added to brand non-negotiables.
Brand non-negotiables (sentence-case, one CTA/viewport, active voice, no "legal compliance", calm-not-fearful) → **added**. Design tokens (Trust Navy + Verification Green) → **DESIGN.md adopted for D3**.
