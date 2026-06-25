# Landing Page Redesign — Session Handoff (self-contained)

_Regenerated 2026-06-24 after a durability loss (see §0). This file is the SINGLE source the next session needs — full scope reconstructed from prior planning. Companion: `LANDING_PAGE_BACKLOG.md` (the bug/improvement register). Visual truth: `docs/landing/mockup-v2.html`._

---

## 0. READ FIRST — durability + repo gotchas

**Durability incident (2026-06-24):** four planning docs (`HOMEPAGE_DISCOVERY_FIRST_SPEC.md`, `NOTICE_GENERATOR_SPEC.md`, the prior `LANDING_PAGE_HANDOFF.md`, `DEV_BACKLOG.md`) were created as **untracked** files on the iCloud Desktop path and **silently vanished** (known issue: `iCloud Zeroes Files`, `File-sync Duplicate Files`). Only `LANDING_PAGE_BACKLOG.md` + `docs/landing/` survived. **RULE: commit docs immediately — never leave landing-page specs untracked.**

**Repo structure:**
- Canonical repo root: `…/DPDPA Daily Brief/webapp/` — **run git only from here.**
- Next.js app lives one level deeper: `webapp/webapp/`. All app paths below are `webapp/…`.
- A dormant zombie `.git` at `…/DPDPA Daily Brief/` reports phantom deletions — ignore it.
- Delete stray filesync dups if present (e.g. `webapp/lib/data/sectors 2.ts`).

**Deploy flow:** local → `next build` clean → branch off `main` → preview → verify (previews 401 to curl; use Vercel MCP) → ff-merge to `main` → prod. After push, confirm the Vercel build route count grew.

---

## 1. The decision (LOCKED — do not re-litigate)

Rebuild the homepage as a **Discovery-first journey: Discover → Assess → Fix → Get help.**
**Restructure, not a visual redesign** — fix sequencing, headlines, CTA hierarchy, proof placement. Keep the existing dark-green + gold visual system and card style.
Validated by 3 audits + CEO review (mode = **Selective Expansion**). The nav already shipped Discovery-first (live); the page body still buries Discovery 6th — this closes that gap.

## 2. Current state

**Active branch:** `notice-pack-builder`. **Notice Pack is already BUILT** (see §6).

**Current homepage order** — `webapp/app/page.tsx`:
```
Hero → AnswerBlock → TrustStrip → PressProofStrip → AudienceCards (12-card wall)
→ BriefingsSection → DiscoveryCTA(6) → AssessmentCTA(7) → WhitePaperSection
→ FAQPreview → NewsletterSection → ConsultationCTA
```
Problem: Discovery 6th, Assessment 7th, Briefings 5th (above both). Conversion tools sit too low.

**Sectors:** **12 live** (not 13 — old handoff overcounted). `webapp/lib/data/sectors.ts` is the single source of truth for sector label surfaces.

## 3. Target homepage order (build to this)
```
Alert bar (DPDP Rules) → Nav
→ HeroSection (slim: Discovery primary CTA, Assessment secondary)
→ TrustStrip + PressProofStrip
→ JourneyStrip (Discover → Assess → Fix → Get help; fold "Where to start" in)
→ DiscoveryCTA
→ AssessmentCTA (+ sample-result card; picker = all 12)
→ AudienceCards (grouped, not a 12-card wall)
→ WhitePaperSection (Guide + Templates) — Fix section links to Notice Pack
→ Founder proof (NEW, before consultation)
→ ConsultationCTA (rename → "Request free gap review")
→ BriefingsSection (moved DOWN) → NewsletterSection → FAQPreview → Footer
```

## 4. Two review gates (outcomes)

**CEO review → PASS (Selective Expansion).** Wedge = sector-specific, no-account, 3–5-min risk verdict at the top. Riskiest assumption = "lifting Discovery/Assessment above Briefings + the 12-card wall raises tool-start rate." **Test (gating prereq):** instrument the CURRENT homepage (Discovery click, Assessment click, scroll-depth) for a 5–7 day baseline BEFORE building. Unit economics hold at 10× (static Next.js on Vercel). User in 30 days = SMB owner/ops lead at one of the 12 sectors.

**Design review → RETURN TO DESIGN (6.5/10).** Strategy right; fails mechanical: hierarchy 8, state-coverage 5, typography 6, color 8, spacing 6, interaction 6, copy 8, **accessibility 5**. All fails clusterable (a11y, component states, type/spacing tokens, focus states) → captured as D1–D9 in the backlog. **Decision needed:** Path 1 (pre-build token+state pass + re-score ≥8) vs Path 2 (override → fold into eng-review definition-of-done).

## 5. Scope — change list (see `LANDING_PAGE_BACKLOG.md` for the full register)

**Tier 0 — bug, ships alone (no design/metric dependency):**
- **8-vs-12 picker bug.** `webapp/components/home/AssessmentCTA.tsx:31-40` hardcodes only 8 sectors (missing hotels-travel, pharmacies, fintech-nbfc, gyms-salons-spas). `AudienceCards.tsx` already has all 12. **Fix:** wire the picker to `sectors.ts`. Picker shows per-sector `count: "N questions"` which `sectors.ts` lacks → add a `questionCount` field (recommended) or drop the count.

**Tier 1 — the restructure (P0):**
- Reorder per §3 (Discovery up, Briefings down).
- Hero: 1 primary CTA ("Discover my personal data") + 1 secondary (assessment). Align nav primary button to the SAME first action (today says "Take Free Assessment").
- Build **JourneyStrip** (Discover→Assess→Fix→Get help); fold the "Where should you start?" chooser IN.
- Add **sample-result card** in the assessment section (e.g. Clinic 41/100, High-priority, top gap, first fix) — labeled "illustrative example".
- Add **founder proof** before consultation: Dilip Sahu — Chartered Accountant, IIM Bangalore alumnus, 22+ yrs enterprise applications (ERP, finance, governance, automation, controls).
- Rename consultation CTA → **"Request free gap review"**.

**Copy fixes (ride-alongs):** 3–5 min everywhere (kill "10 minutes"); Guide "45-page"→"59-page" + "4-sector"→"12 sector" (`WhitePaperSection.tsx`); "90-day"→"30–90 days"; "whitelist"→negative-list; **Hero H1 = Option A** "See exactly where your business stands on DPDPA" (NOT the fear-leaning "Find your DPDPA risk before it becomes a business problem"); add **Lokmat Times** to press (ANI, Business Standard, The Tribune, Lokmat Times, Latestly); fix stale mockup `<title>` "Verified digital trust".

**Design rules (D1–D9 + brand):** a11y (contrast ≥4.5:1, keyboard, prefers-reduced-motion, ARIA); state coverage for JourneyStrip/picker/sample-card; reuse existing type/spacing classes (4/8/16/24); focus/active states on all CTAs+picker rows+JourneyStrip; group the 12-card wall; differentiate the two adjacent CTAs; **D8 two dark moments only** (only JourneyStrip + final CTA navy, rest light); **D9 restrained motion** (no over-animation, no scroll-jack). **Brand non-negotiables:** sentence-case headers, ONE green CTA per viewport, active voice, no "legal compliance" wording, calm-not-fearful. **Tokens:** adopt `Skills Library/Design/design-md/examples/saralprivacy/DESIGN.md` (Trust Navy + Verification Green, hairlines not shadows, tight Inter).

**DEFER (do NOT build):** full visual redesign · interactive checklist · penalty calculator · 276 SEO pages · **trust badge** (credibility/legal own-goal — roadmap only; already removed from mockup v2) · paid-plans page.

## 6. Notice Pack — ships FIRST, before the homepage change

**Already built** on `notice-pack-builder` as a standalone landing+tool page: `webapp/app/tools/dpdpa-privacy-notice-generator/` (`page.tsx` + `NoticePackClient.tsx` 532 lines + `notice-pack.css`), APIs `webapp/app/api/notice/{capture,events,pdf}/route.ts`, lib `webapp/lib/notice-pack/{types,render,data}.ts`, `lib/email*.ts`, `lib/analytics.ts`. Has full SEO (canonical, OG, JSON-LD WebApplication + FAQ + breadcrumb), 8-step wizard, **ungated live preview**, **email-gate modal** (aria/focus correct). Output = a Pack: full notice + per-surface mini-notices + consent text + rights/DSAR block + evidence record.

**Positioning:** it IS its own landing page (for "DPDPA privacy notice generator" intent) — ship standalone now; it does NOT replace the homepage root. It's the **Fix-phase tool**; the homepage Fix section will link into it later. **Strategic value:** its capture/events API gives a free live test of the Discovery-first conversion mechanics (ungated preview → email gate, calm copy) BEFORE betting the homepage on them — read its funnel data before finalizing the redesign.

**Before publishing it:** apply the §5 design rules/tokens, run `/plan-design-review` on `NoticePackClient` (clear ≥8 — it's the first expression of the new design language), and use it to test the hero-snapshot question (decision #4).

## 7. Open decisions — GET DILIP'S CALL
1. **Design gate** — Path 1 (pre-build design pass + re-score) vs Path 2 (override → eng DoD). *(scope-changing)*
2. **Multilingual** — 7-lang Guide as cheap SEO (ship now) vs vernacular funnel (translate Discovery+Assessment; bigger moat, L-effort). *(scope-changing)*
3. **Notice-tool sequencing** — confirm ship `/tools/dpdpa-privacy-notice-generator` standalone first (recommended), and who does the legal §5 review (blocks publish).
4. **Hero snapshot placement** — the "5 corrections" review wanted an outcome/snapshot card IN THE HERO (mockup v2 has it); current target specs a slim hero with the sample card lower in Assessment. Reconcile: hero, assessment, or both?
5. **Metrics-first** — confirm instrumenting the current homepage before build (CEO-recommended gating prereq).

## 8. Verified facts (don't re-litigate)
- 12 sectors live, all with assessment flows; `sectors.ts` = single source of truth.
- Schema markup comprehensive (`webapp/lib/schema.tsx`) — audit "absent" claim was FALSE.
- 12 sector starter-checklist PDFs in `webapp/public/templates/`.
- Penalty calculator genuinely static → real build if ever prioritized (deferred).
- `mockup-v2.html` = visual reference only; its copy is mostly aligned to this scope but: Hero H1 = the fear-leaning option (use Option A instead), press missing Lokmat, stale `<title>`. `mockup-v1.html` is superseded (had the trust-badge framing).
- Briefings + blog live in Appwrite (DB), not git.

## 9. First moves for the fresh session
1. Confirm canonical repo: `cd …/DPDPA Daily Brief/webapp && git status -sb` (NOT 100+ deletions).
2. Get Dilip's calls on §7 (esp. #1 design gate + #2 multilingual — they size the build).
3. **Notice Pack first:** apply §5 design rules + tokens → `/plan-design-review` ≥8 → preview → merge `notice-pack-builder` → publish.
4. **Then homepage:** instrument current homepage (§4 metrics) → ship **Tier 0 (8→12 fix)** as its own small PR → `/plan-eng-review` the JourneyStrip + reorder slice → build Tier 1.
5. Preview → verify (Vercel MCP) → ff-merge → prod.

## 10. State of the durable artifacts
- ✅ `LANDING_PAGE_HANDOFF.md` (this file) · `LANDING_PAGE_BACKLOG.md` · `docs/landing/mockup-v{1,2}.html` · Notice Pack code (branch).
- ❌ Lost (regenerable from this handoff if the detailed long-form is wanted again): `HOMEPAGE_DISCOVERY_FIRST_SPEC.md`, `NOTICE_GENERATOR_SPEC.md`, `DEV_BACKLOG.md`.
- **Commit everything now** so nothing depends on a session surviving.
