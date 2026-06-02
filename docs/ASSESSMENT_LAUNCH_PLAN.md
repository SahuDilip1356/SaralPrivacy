# DPDPA Assessment — Pre-PR Launch Plan (ANI / Business Standard)

**Goal:** Make `/assessment` convert PR traffic (curious visitor → assessment starter → lead),
add resilience + measurement, **without breaking any existing functionality.**

**Status legend:** ☐ Not started · ◐ In progress · ✅ Done · ⏸ Blocked

---

## Locked decisions (no contradictions)

| Decision | Choice |
|----------|--------|
| Completion time | **3–5 minutes** everywhere (fix the hidden SEO text that says 8–10) |
| Meta Pixel | **Skip** — GA4 only (avoids privacy-brand contradiction + DPDPA consent issue) |
| Progress label | **"Step X of 7" + section name**; market copy may say "12 quick questions" |
| Result "Book a call" CTA | Points to **existing `/contact`** page; fires a `call_clicked` event |
| "Featured in" strip | Build now, **hidden until articles are actually published** |

---

## Already built (NO work needed — avoids rework)
- ✅ Score shown **before** email (gate screen shows score → email unlocks full report). Your finding #6 is already satisfied.
- ✅ Primary CTA already reads "Take free assessment".
- ✅ Email is **not** requested before the assessment (only consent checkboxes).
- ✅ 6 trust badges already on the hero.
- ✅ GA4 base page_view + `survey_complete` event already fire.

---

## Scope

**In scope:** the 3 resilience fixes + the agreed UX/conversion + measurement changes below.
**Out of scope (explicitly NOT doing):** Meta Pixel, rebuilding the survey, changing scoring logic,
changing the gate/email mechanic, autoscaling/queues, any Appwrite data migration.

---

## Safety protocol (how we guarantee nothing breaks)
1. **Branch + preview first.** All work on branch `assessment-launch-prep`. Vercel auto-builds a **preview URL** — you review there. We merge to `main` (production) only after you approve.
2. **Copy/UI edits touch text & layout only** — never scoring, state machine, or submit logic.
3. **Events are additive** — `trackEvent` safely no-ops if GA isn't loaded; cannot break the flow.
4. **Per-change gate:** `npm run build` passes → full assessment run (start → 12 Q → gate → email → report) → push.
5. **One commit per phase** — any phase can be reverted independently.
6. **Featured-in ships last**, behind a flag, only when the articles are live.

---

## Phase A — Resilience (backend, invisible to users)
| ID | Task | Files | Regression risk | Verify | Status |
|----|------|-------|-----------------|--------|--------|
| A1 | Honeypot + lightweight rate-limit on public POSTs | `api/assessment`, `api/survey/submit`, `api/subscribe`, `api/contact` | Med (don't block real users) | Normal submit works; flood gets blocked | ☐ |
| A2 | Submit-retry + preserve answers on failure | `SurveyClient.tsx` (submit handler only) | Low | Forced-fail submit keeps answers + retries | ☐ |
| A3 | `/blog` listing → ISR (`revalidate`) | `app/blog/page.tsx` | Low | List renders; new post appears after window | ☐ |

## Phase B — Measurement (GA4 funnel)
| ID | Task | Files | Risk | Verify | Status |
|----|------|-------|------|--------|--------|
| B1 | Add events: `assessment_start`, `assessment_step_3`, `assessment_step_6`, `email_submitted`, `report_requested`, `call_clicked` | `SurveyClient.tsx` (additive) | Very low | GA4 DebugView shows each | ☐ |
| B2 | UTM scheme for the PR link (doc only) | — | None | `?utm_source=<outlet>&utm_medium=referral&utm_campaign=launch` | ☐ |

## Phase C — Conversion copy/UI (landing step 0)
| ID | Task | Files | Risk | Verify | Status |
|----|------|-------|------|--------|--------|
| C1 | Sharper hero headline + subhead (5 data dimensions) | `SurveyClient.tsx` step 0 | Low | Visual | ☐ |
| C2 | De-jargon: remove "SYSTEM STATUS / expert diagnostic / AUTHORIZATION & SCOPE / PROFESSIONAL GRADE" | step 0 | Low | Visual | ☐ |
| C3 | Add "What you'll get" + "How it works" to landing | step 0 | Low | Visual | ☐ |
| C4 | Single time claim = **3–5 min** (hero, badge, + fix sr-only 8–10) | step 0 + `app/assessment/page.tsx` | Low | grep → one number | ☐ |
| C5 | Trust row cleanup (+ "No payment required", "Educational, not legal advice") | step 0 | Low | Visual | ☐ |
| C6 | Progress label "Step X of 7 · [section]" | step 0 / wizard header | Low | Visual | ☐ |

## Phase D — Lead capture
| ID | Task | Files | Risk | Verify | Status |
|----|------|-------|------|--------|--------|
| D1 | Result-page "Book a free 20-min call" CTA → `/contact`, fires `call_clicked` | result screens (steps 9–10) | Low (additive) | Click → /contact + event fires | ☐ |

## Phase E — Featured-in (LAST, when links live)
| ID | Task | Files | Risk | Verify | Status |
|----|------|-------|------|--------|--------|
| E1 | "As featured in ANI / Business Standard" strip, flag-gated (hidden until live) | step 0 | Low | Hidden now; shows + links when enabled | ☐ |

---

## Pre-launch final checklist (run before the article goes live)
- ☐ `npm run build` passes
- ☐ Full assessment completes end-to-end on the preview URL (desktop + **mobile**)
- ☐ Score + gate + email + report all work unchanged
- ☐ GA4 DebugView shows the full funnel firing
- ☐ Rate-limit does NOT block a normal user; honeypot invisible
- ☐ `/blog` and blog posts render; new post appears after revalidate window
- ☐ Time claim is "3–5 min" everywhere (no stray 8–10)
- ☐ Featured-in still hidden (flip on only when articles publish)
- ☐ Appwrite plan decision actioned (separate track)
- ☐ Merge `assessment-launch-prep` → `main`, confirm prod deploy is green

---

## Suggested build order
A (resilience) → B (measurement) → C (copy) → D (CTA) → E (featured-in, when live).
Each phase: build on branch → you review preview → approve → next phase.
