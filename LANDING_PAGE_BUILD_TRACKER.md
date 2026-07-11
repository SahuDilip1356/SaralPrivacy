# Landing Page — Build Tracker (living)

_The single place to observe development progress against the spec. Update the **Status** columns as items move. Companion specs: `LANDING_PAGE_MASTER.md` (overview) · `LANDING_PAGE_STRUCTURE.md` (beats + tokens). Where this tracker and the spec disagree, **this tracker is the current truth** (it records decisions made after the spec was locked)._

**Branch:** `feat/landing-redesign` · **Preview:** https://webapp-git-feat-landing-redesign-dilipsahu31s-projects.vercel.app · **Last commit:** `a9b34b9`
**Status legend:** ✅ done · 🔨 in progress · ⬜ open · ⏸ deferred · 🔁 decision changed

---

## 1. Beat-by-beat status (spec vs actual)
| Beat | Spec intent | Actual on preview | Status |
|---|---|---|---|
| 1 Hero | is-this-me chips → verdict, Discovery-first CTAs | Built ✅ · but **single left column → empty right half** · mobile = 12 chips (no native select) · no "Not listed?" escape | 🔨 needs 2-col + scorecard |
| 2 Scatter | dark; **data flows outward → gold gap snaps in** | Built dark ✅ · but **static fade**, not real motion | 🔨 motion upgrade |
| 3 Trust ribbon | press + stats + pillars | Done | ✅ |
| 4 How it works | spine→milestone→branch, **marching flow line** | Built + outcome labels ✅ · **static connectors** · tool-name tags dropped | 🔨 motion + tags |
| 5 Proof | sample card + pointer that **scrolls to Beat 7** | Card ✅ · pointer wrongly links to `/industries` (leaves page) | 🐛 fix pointer |
| 6 Founder | CA · IIM · 22 yrs | Done | ✅ |
| 7 Sector wall | (was: de-hue + gold badge) | Uniform + gold badge ✅ | 🔁 **reverting to colour** (see D1) |
| 8 Get help | reposition + **rename "Request free gap review"** | Repositioned ✅ · still "Request Consultation" | 🐛 rename |
| 9 Stay current | one consolidated block | Right order, 4 separate sections | ⏸ consolidation post-ship |
| 10 Footer | unchanged | Done | ✅ |
| — Alert bar (site Header) | factual, Discovery-first | **Shame copy + CTA → /assessment** | 🐛 fix |

---

## 2. Fix pack — pre-publish (verified in code)
| ID | Fix | Root cause | Status | Effort |
|---|---|---|---|---|
| F1 | Alert bar (Header.tsx): drop "companies don't know yet" shame line; align CTA to Discovery-first | lives in site-wide Header, missed in homepage-scoped edits | ⬜ | 5m |
| F2 | Proof pointer → `#sectors` (stop mid-funnel exit to /industries) | href set to /industries instead of in-page anchor | ⬜ | 2m |
| F3 | Get help → "Request free gap review" (+ keep "what the call covers") | rename never applied | ⬜ | 2m |
| F4 | Dedupe `hero_sector_select` (fire once per distinct pick) | fires on every click incl. re-clicks | ⬜ | 3m |
| F5 | Restore small tool-name tags in HowItWorks (Data Discovery / Notice Pack) | dropped in outcome-label edit | ⬜ | 5m |
| F6 | Delete orphaned `components/home/AssessmentCTA.tsx` (imported by nothing after reorder; Tier-0 fix now dead code — fix stays in git history) | consolidated into HowItWorks | ⬜ | 1m |
| F7 | Guide TOC stale — **needs Dilip a/b/c**: (a) 30→90 only · (b) + sync full 9 sections · (c) single-source `guide-contents.ts` shared with the Guide page *(lean: c)* | hardcoded 7-item TOC drifted from the real guide | ⬜ **DECISION** | 10–20m |

## 3. Screenshot findings (from preview review)
| ID | Finding | Root cause | Status | Effort |
|---|---|---|---|---|
| S1 | Briefings featured card infographic **overlaps** Latest Updates + crops badly | portrait infographics forced into a wide `object-cover` side panel; clipping/gap wrong | ⬜ | 10m |
| S2 | Guide "Download instantly · Free · DPDPA-compliant consent" **goes nowhere** | decorative `<div>` in the mock card, not a link | ⬜ | 3m |
| S3 | Hero **empty right half / looks off-centre** | single left column in `max-w-4xl` | ⬜ (→ D2) | 30m |
| S4 | "Follow the data" is **static, not motion** | fade-in only, static dashed lines | ⬜ (→ D3) | 25m |
| S5 | "How it works" is **static, not motion** | static connectors, one-time fade | ⬜ (→ D3) | 20m |
| S6 | Sector cards look **too similar** — wants colour differentiation back | de-hue removed per-sector colour | ⬜ (→ D1) | 10m |

---

## 4. Decision changes (post-spec — logged) 🔁
- **D1 — Sector cards keep COLOUR (reverses the "de-hue" rule).** Dilip prefers per-sector colour for differentiation. New rule: **restore per-sector colour theme + keep the gold risk badge** (colour + at-a-glance risk). Supersedes `LANDING_PAGE_STRUCTURE.md` §3c "collapse 12 hues" and §3e "retire 12 hues" — update those. Agreed 2026-07-11.
- **D2 — Hero becomes 2-column** (text + selector left, **live sample scorecard/verdict card right**) — fills the empty right half; resolves the earlier open "sample card in hero" question toward IN THE HERO. Agreed 2026-07-11.
- **D3 — Motion must be REAL, not fade.** Scatter = lines flow outward + gold gap snaps in (marching `stroke-dashoffset`); How-it-works = flowing connector + sequential reveal. This is the *original spec*; the fade was an under-delivery, now to be corrected. Keep `prefers-reduced-motion` fallback. Agreed 2026-07-11.

## 5. Deferrals (correctly not-now) ⏸
- Beat 9 visual consolidation into one block (reposition already delivered the funnel value)
- Distinctiveness pass (typeface/palette) — pending data per `/roast`
- Hero verdict **bands** pack-confirmation (labelled "typical"/illustrative)
- Discovery reads `?sector=` pre-fill (harmless today; hero passes it, Discovery ignores)
- Hero "Not listed?" escape link · hero mobile native-select (fast-follow, launch week)
- External-review sections: "What you get in 3 min" · "Built for / not for" · pre-footer CTA · briefings category chips · sticky CTA

## 6. Process notes / risks
- **Metrics-first baseline SKIPPED.** CEO-review prereq (instrument current page 5–7 days pre-build) was bypassed → no before/after; only post-launch trend. Events are wired, so data starts at launch. Acknowledged.
- **iCloud corruption (recurring).** Local repo reverted to an old commit mid-session; fixed via `git reset --hard origin/feat/landing-redesign`. **Permanent fix: move repo off the iCloud Desktop path (`~/Developer/`).** Until then: commit with `git -c status.showUntrackedFiles=no` to avoid tree-scan hangs; remote (GitHub/Vercel) is the source of truth.

## 7. Definition of done (launch gate)
- [ ] Fix pack F1–F6 applied · F7 decided + applied
- [ ] S1–S2 bugs fixed
- [ ] D1 colour restored · D2 hero 2-col · D3 real motion
- [ ] `next build` / Vercel green · reduced-motion verified · mobile checked
- [ ] Dilip reviews preview → **productionize go-ahead**
- [ ] Merge-base decided (Notice-Pack → main first, or together) → ff-merge to `main`
- [ ] Legal/copy sign-off on hero verdict claims
