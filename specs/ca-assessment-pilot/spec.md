# Spec — CA firm risk scan that people finish

**Status:** draft, revised after EGM review stages 5–7 (see `egm-review/`)
**Intent:** ./intent.md
**Date:** 2026-11-03

## Behavior

A CA firm opens the scan and sees where they are at all times:
- a progress rail split into three named sections (Practice, Documents, Controls);
- a "Question 4 of 10" label;
- a percentage;
- an estimate of the time left.

Each answer is confirmed at once with a small tick, and each question slides in from the direction the person is moving. Finishing a section briefly shows a stamp and leaves a tick on the rail. Answers are saved in the person's own browser as they go, and someone who comes back within 7 days can continue where they stopped. The last button shows a short "Scoring your answers" state.

The result opens with the readiness score drawn as a ring and a rolling number that land together. Then, in order:
1. the band label and its explanation;
2. a plain line saying when most duties apply and that the score isn't a certificate or legal advice;
3. one priority fix chosen from the firm's highest-risk area, shown in full without any form;
4. the top red flags and two summary bars;
5. a risk map that shows the two highest areas, with the rest one tap away;
6. a report form.

The form explains every mistake beside the field and never loses what was typed. It says clearly when sending fails or the network is down. On success, it shows the other fixes on the page.

Everything works by keyboard and screen reader, honours still mode, and fits a 360 px phone. Each funnel step is counted per sector, and no answer or contact detail goes to analytics.

## Contracts

### Terms

- **Question pack:** the sector's data that the scan reads. CA firms is the pilot. The scan reads only the fields listed in the next section, so another sector's pack works unchanged.
- **Quick-start question:** the pack's one optional question (`q0` for CA: client volume). It sits before the first section, shows as a "Start" dot on the rail, and doesn't count toward the question count or the percentage.
- **Required questions:** every question not marked optional. **N** is their count (10 for CA). **A** is the number of them answered.
- **Area:** one of the pack's 5 risk groups (called buckets in the pack). Each has a risk score from 0 to 100, where **higher means more risk**, and a status: Low under 34, Moderate 34–66, High 67 and over.
- **Red flag:** one of up to 3 short warnings the engine returns, separate from areas.
- **Readiness score (S):** 100 minus the overall risk score, 0–100, where **higher is better**. This is the number in the ring.
- **Band:** one of Controlled, Moderate Risk, High Risk, Critical Risk, from the overall risk score (0–24, 25–49, 50–74, 75–100). The engine's existing override rules can raise it; they are unchanged.
- **Band explanation:** the pack's `bandCopy[band]`, or else `bandDescription`.
- **Ranked fixes:** the pack's recommended fixes, reordered by risk (see "Free fix and ranked fixes"). The first is the **free fix**.
- **Still mode:** the operating system's reduced-motion preference is on, or the motion setting is off. In still mode nothing slides, scales, blurs or spins, and every state still appears.
- **Keyboard move:** an activation with no pointer, such as Enter or Space on a button.

### Visual source of record

Sizes, colours, the stamp's look and any motion duration not stated here come from `SaralPrivacyHub/Strategy/assessment-lead-magnet/SUBFRAME-MOTION-SPEC.md` §4–§6 (copied to `reference/` beside this spec). This spec overrides that document where they differ, for example on the analytics firing moments and the scoring pause.

### Question pack contract (fields the scan reads)

```
pack.industry: string                 // sector key, e.g. "ca-firms"; used for storage key and analytics
pack.reportType: string               // request report_type, e.g. "ca-firm"
pack.positioning.title: string        // scan title, e.g. "CA Firm DPDPA Risk Scan"
pack.leadMagnet?: { title, href }     // checklist title in the form heading and success view
pack.questions: Array<{
  id: string, question: string, helpText?: string, whyThisMatters?: string, badge: string,
  type: "single" | "multi", optional?: boolean,
  mutuallyExclusive?: string[],        // option IDs that clear all others when picked
  options: Array<{ id, label, badge?, badgeColor? }>
}>
pack.buckets: Array<{ key, label, meaning }>   // the 5 areas
pack.bandCopy?: Record<Band, string>           // band explanation
```

This work doesn't change the question pack or the scoring engine. A repository rule keeps them byte-identical, and tests read their source text to guard it. When a pack has no `leadMagnet`, the checklist title is "DPDPA Starter Checklist".

### Scan metadata (new, per sector, kept beside the scan)

```
sections: Array<{ key: string, questionIds: string[] }>
fixes: Array<{ text: string, bucket: string }>   // each pack fix and the area key it addresses
fallbackFix: string                              // the pack's fix when no area qualifies
```

- **CA sections:** `practice` = q1, q2; `documents` = q3, q4, q5; `controls` = q6–q10. Section names and stamp text come from the message files, keyed by section key (see AC1, AC9).
- **CA fixes:** the pack's four fixes, mapped in order to the area keys `intake` (Document intake risk), `storage_access` (Storage & access risk), `retention` (Retention & deletion risk) and `vendor_incident` (Vendor & incident readiness). The texts must match the pack's text exactly; a test compares them with the pack source.
- Scan metadata is required. Sectors without it keep today's scan; adding metadata for other sectors belongs to the rollout chain.

### Scoring output the scan uses (computed in the browser by the existing engine)

| Field | Type | Meaning |
|---|---|---|
| `readinessScore` | integer 0–100 | S, the score shown; higher is better |
| `riskScore` | integer 0–100 | 100 − S |
| `band`, `bandColor`, `bandDescription` | string | band label, its colour, its fallback explanation |
| `dataExposure` | integer 0–100 | higher is worse; first summary bar |
| `controlMaturity` | integer 0–100 | higher is better; second summary bar |
| `bucketScores` | { [areaKey]: 0–100 } | area risk; higher is worse |
| `bucketStatus` | { [areaKey]: "Low" \| "Moderate" \| "High" } | thresholds 34 and 67 |
| `redFlags` | string[] (0–3) | top red flags by severity |
| `recommendations` | string[] (1–4) | the pack's fixes in its fixed order |

### Free fix and ranked fixes

The ranked fixes hold the same set as `recommendations`, reordered by the risk score of the area each fix addresses, highest first. Ties keep the pack's order. The CA rule for which fixes are in the set is unchanged from today:

| Condition | Fixes in the set | Free fix (first item) | Line under the free fix |
|---|---|---|---|
| Band is High Risk or Critical Risk | all 4 area fixes | the fix whose area scores highest, even if under 34 | "Linked to your highest-risk area with a fix: <area label> (<score>/100)." |
| Band is Controlled or Moderate Risk, and at least one of those 4 areas scores 34 or more | the fixes for those areas | the one whose area scores highest | same as above |
| Band is Controlled or Moderate Risk, and none of those 4 areas scores 34 or more | the pack's single fallback fix (no area) | the fallback | "No area scored high enough to need a specific fix." |

The "Client document risk" area has no fix of its own in the CA pack, so it never selects the free fix.

### Saved progress (browser storage only)

```
key:   "sp-assessment-v1:<pack.industry>"
value: {
  v: 1,
  answers: { [questionId: string]: string | string[] },  // option IDs only
  qi: number,            // index of the question being shown, 0-based, quick-start = 0
  stamped: string[],     // section keys already stamped
  at: number             // ms since epoch of the last save
}
```

The rules for reading a value are in AC14. A value whose `at` is more than 7 × 24 hours old is deleted when the scan next opens. The value never contains a name, firm name, email or phone number, and it never leaves the device.

### Report request (existing endpoint, unchanged shape)

`POST /api/assessment`, request JSON, with the fields the scan sets:

```
{ email: string, name: string, business: string, mobile: string,
  industry: <pack.industry>, report_type: <pack.reportType>, answers: object,
  result: { finalScore, rawScore, verdictBand, verdictDescription, dataExposure,
            controlMaturity, operationalReadiness: 0, categoryScores,
            redFlagsTriggered: string[], immediateActions: string[], thirtyDayActions: [] },
  consentReport: true, consentNewsletter: false, consentFollowup: false, hp_url: string }
```

| Field | Source |
|---|---|
| `name`, `business`, `email` | the Name, Firm name and Email fields, trimmed |
| `mobile` | the Phone field normalised as in AC26, or "" |
| `answers` | the scan's answers map: question ID → option ID (single) or option IDs (multi) |
| `result.finalScore`, `result.rawScore` | `readinessScore`, `riskScore` |
| `result.verdictBand`, `result.verdictDescription` | `band`, and the band explanation |
| `result.dataExposure`, `result.controlMaturity`, `result.categoryScores` | the same-named outputs; `categoryScores` = `bucketScores` |
| `result.redFlagsTriggered` | `redFlags` |
| `result.immediateActions` | the ranked fix texts, in order (1–4 items) |
| `hp_url` | a hidden spam-trap field, always "" for real users |

| Status | Meaning |
|---|---|
| 200 | The submission is saved. The server then tries to send the email, but a failed send still returns 200, so 200 means "saved", not "delivered". |
| 400 `{ error: "Email is required." }` | Rejected input |
| 429 + `Retry-After` header (seconds) | Rate limited |
| 500 `{ error: "Failed to save assessment." }` | Server failure |

**Send policy:**

| Outcome of one attempt | What the scan does |
|---|---|
| 200 | stop: success (AC30) |
| 400 | stop: failure, no retry |
| 429 | wait `Retry-After` seconds (at most 5, default 2), then try again |
| 500 or any other 5xx status | wait 0.8 s × the attempt number, then try again (the server didn't save) |
| a network error, or no response within 15 s | stop: failure, no retry (the server may already have saved it) |

- At most 3 attempts; after the third failed attempt, stop. Any other 4xx stops at once, like 400.
- A failure ends in AC28, with reason "server" for a status code and "network" for a network error or a timeout. The person decides whether to try again.
- AC29 applies only when the browser reports it is offline before the first attempt.

### Analytics events (cookieless, aggregate)

Each event carries `sector: <pack.industry>`.
- **Never sent:** answers, free text, names, firm names, emails, phone numbers or report tokens.
- **Sent and derived from the answers:** the band, the readiness score and the free fix's area key. These are not personal data.
- **Property order:** properties are listed in priority order. If the analytics plan caps properties per event (A5), the last ones are dropped first, and `sector` is never dropped.

| Event | When it fires | Extra properties |
|---|---|---|
| `assessment_start` | once per page load, on first render (as today); not on Retake | `prefilled: boolean` (an answer from the home page was applied), `src: "hero" \| ""` (arrived from the home page question) |
| `assessment_question_view` | each time a question is shown, including after Back; not repeated on a re-render of the same question | `q: string` (question ID) |
| `assessment_section_complete` | once per section per page load, when the stamp moment of AC9 happens (also in still mode) | `section: string` (section key) |
| `assessment_resume_shown` | when the resume card renders | `answered: number` (A) |
| `assessment_resume_continue` | when the resume card's continue button is chosen | `from_q: string` (question ID) |
| `assessment_complete` | once per page load, for the first result computed | `risk_band: string` (band label), `score: number` (S), `industry: string` (kept for continuity) |
| `assessment_rerun` | each later result in the same page load (a retake, or Back from the result and forward again) | `risk_band: string`, `score: number` |
| `free_fix_viewed` | once per result, when the free fix is at least half visible | `bucket: string` (area key, or "none" for the fallback) |
| `report_form_error` | each submit blocked by validation | `fields: string` (comma-joined from name, firm, email, phone, consent) |
| `report_submit_failed` | each send that ends in AC28 or AC29 | `reason: "server" \| "network" \| "offline"` |
| `report_requested` | each valid submit, before the request (as today) | `risk_band: string`, `first: boolean` (true for the first in this page load) |
| `report_saved` | each 200 response | `risk_band: string` |
| `assessment_step_3`, `assessment_step_6` | once per page load, when the question at index 3 or 6 of the full list (labelled "Question 3" and "Question 6") is first shown, as today | `step: number` |

The analytics service is the site's existing cookieless page analytics, called through the site's shared tracking helper.

**Metric continuity.** The before and after windows must count the same things, or the success criterion means nothing.
- `assessment_start` fires once per page load, on first render, exactly as today. A resumed visit is still one start; resumption is counted only by `assessment_resume_continue`.
- **Completion ratio** = `assessment_complete` ÷ `assessment_start`, per window (see "Measurement").
  - In the new scan, `assessment_complete` fires once per page load. Later results fire `assessment_rerun`, which isn't in the ratio.
  - Today's scan fires `assessment_complete` again on a retake. So the baseline can only be overcounted, which makes the pilot's comparison conservative.
- **Lead rate** is defined in "Measurement". `report_requested` keeps today's moment: a valid form is submitted, before the request is sent. Its new `first` property marks the first one in the page load, so retries, resubmits and post-retake submits don't inflate the rate.
- `assessment_step_3` and `assessment_step_6` keep firing when question index 3 and 6 are first shown.

### Measurement (single source for intent.md and plan.md)

All figures are for CA only. The pilot never moves to another sector.

**Windows**
- **Baseline:** the 28 days of sector-tagged events ending the day before the scan switch goes on. So the analytics change (plan T6) must have been live for at least 28 days before switch-on.
- **After:** the 28 days starting the day the scan switch goes on. If that window has fewer than 50 starts, it extends to 56 days.

**Metrics**
- **Completion ratio:** `assessment_complete` ÷ `assessment_start`.
- **Lead rate:** the share of page loads with an `assessment_complete` that also have a `report_requested` with `first: true`.

**Outcome**

| Condition | Outcome |
|---|---|
| Baseline has ≥ 10 completions, and the after-window ratio is ≥ 2 × the baseline ratio | pass on completion |
| Baseline has < 10 completions, and the after-window ratio is ≥ 30% with ≥ 15 completions | pass on completion |
| The after-window still has < 50 starts at 56 days | **inconclusive** |
| Anything else | fail on completion |

- A pass also needs a lead rate of at least 25% in the after-window.
- **On a fail:** set the motion setting off and measure one more after-window, to separate motion from the other changes. If that also fails, turn the scan switch off.
- **On an inconclusive result:** Dilip decides from the T23 sign-off and from what people report. The default is to keep the scan switch on with motion on, because every non-motion change is an accessibility, legal or resilience fix worth keeping anyway.

The "about 1 in 114" figure in intent.md comes from a three-month dashboard view whose source (page views or events) wasn't recorded. Events before July 2026 were silent no-ops (see the header of the site's analytics helper). So that figure isn't a baseline; only the window above counts.

### Release settings

Two build-time settings.

**Scan switch (`NEXT_PUBLIC_CA_SCAN_V2`)**
- "1" means on; anything else, including unset, means off. Default off.
- Off means today's scan, and the page carries no extra script for the new one. On means the new scan.
- The URL parameter `scanV2=1` forces it on only when the deployment environment is "preview" or "development". When the environment can't be read, the parameter is ignored.

**Motion setting (`NEXT_PUBLIC_SCAN_MOTION`)**
- "0" means off; anything else means on. Default on.
- Off puts the new scan in still mode. This lets the non-motion improvements stay if motion turns out not to help (intent A1).

## System context

**Parts by role:**
- **The scan page** runs entirely in the browser: questions, scoring, the result and the form.
- **The browser's local storage** keeps saved progress for that person on that device.
- **The report endpoint** stores the submission and then tries to send the email.
- **The email sender** builds the report email from the submission.
- **The analytics service** receives aggregate, cookieless events and page views.
- **The chat assistant** is a floating launcher that appears on public pages.

The site runs in English and Hindi, chosen by the URL prefix (`/hi/...` for Hindi). Interface text comes from per-language message files, keyed by name; a key missing in Hindi shows the English text.

The new scan takes the sector's question pack and scan metadata as its input. Sector-specific text, sections, fixes and the sector key come from the pack, the metadata or the message files, never from the scan's own parts. A rollout to other sectors reuses the scan instead of copying it.

**Data flow:**
- Answers stay in the browser until the person submits the report form.
- One exception: an answer pre-selected from the home page arrives in the page address (`?pre=`), and page views may carry that address to the analytics service (K12).
- Scoring happens in the browser.
- On submit, the contact details, answers and computed result go to the report endpoint. The endpoint stores them, and the email sender puts parts of them into the email.
- Analytics events go from the browser to the analytics service.

| Data | Kept where | Leaves the device? |
|---|---|---|
| Answers (option IDs) | browser storage, cleared when the report is saved, on Start again or Retake, or when the scan next opens after 7 days | only inside a report request the person submits, except a home-page answer in the page address (K12) |
| Position, stamped sections, save time | browser storage | no |
| Name, firm, email, phone | page memory until submit | only inside the report request |
| Score, band, free-fix area key | computed in the browser | in analytics events, and inside the report request |
| Fix texts, red flags | computed in the browser | only inside the report request |

**Trust boundaries:**
1. **Browser → report endpoint.** Every field, including the computed result, can be forged by anyone who posts directly. The endpoint and the email sender must treat it all as untrusted text.
2. **Browser storage → scan.** A saved value may be old, edited or corrupt, so it's validated before use.
3. **Browser → analytics service.** Only the listed properties may cross.

## Alternatives considered

| Choice | Chosen | Rejected and why |
|---|---|---|
| Where progress is saved | in the person's own browser, for 7 days | On the server: that sends answers before the person has agreed to anything, and needs consent and retention rules |
| What the free part of the result includes | score, band, top red flags, map and one ranked fix | Score only: there's no reason to trust the report. Everything free: there's no reason to give an email |
| Which fix is free | the fix for the highest-risk area that has one | The first fix in a fixed list: often not the most relevant to this firm |
| Phone on the report form | optional (pending D6) | Required: adds friction, and the endpoint already accepts it empty |
| What happens when sending fails | the scan keeps everything typed and offers "Try again" | Silent retries only: the person can't tell whether it worked |
| How the new scan is released | a scan switch, off by default, plus a separate motion setting | One switch only: if motion doesn't help, the accessibility, mobile, form and legal gains would go with it. Replacing the old scan outright: no quick way back |
| How the pilot is measured | before and after, same sector, with a floor on starts and completions and an absolute fallback target | A concurrent split (each visitor randomly given the old or new scan): it removes time effects, but with the switch off the page must carry no new script, and it halves already low traffic per arm. Revisit at rollout if traffic allows |
| What the server trusts | the client's computed result, escaped (AC32) | Recomputing the result on the server from `answers`: safer against forged text (K10), but it changes the endpoint, which this pilot doesn't touch. Recorded as OQ9 |

## Risks & mitigations

Status: **planned** means a mitigation is specified and its AC isn't yet passing; **open** means nothing limits it yet; **accepted** means it's known and deliberately not addressed in this pilot.

| # | Risk | Type | Mitigation | Status | Tested by |
|---|---|---|---|---|---|
| K1 | Forged report requests inject markup into the email through the result text, name or firm | security | Every client-supplied value is escaped before it's placed in the email | planned | AC32 |
| K2 | Saved progress on a shared computer shows a previous person's answers or result | privacy | Answers only (no contact details); expiry when the scan next opens after 7 days; "Start again" and Retake clear; cleared once the report is saved | planned | AC12, AC13, AC16 |
| K3 | An edited or corrupt saved value breaks the scan or ticks an option that no longer exists | failure | Validation on read; unknown option IDs dropped | planned | AC14 |
| K4 | Private browsing or blocked storage throws errors | failure | Storage access guarded; the scan runs without saving and says so | planned | AC15 |
| K5 | Analytics carries personal data | privacy | Fixed property list; no free text | planned | AC37 |
| K6 | Motion delays or blocks people, or makes them unwell | latency, accessibility | Nothing waits on animation except the stated scoring pause (AC17); still mode and keyboard moves skip movement | planned | AC8, AC36 |
| K7 | The success criterion can't be read because traffic or completions are too low | scale | Floors on starts and completions, with a fallback target and window (Non-functional, Measurement) | open | Non-functional, Measurement |
| K8 | A legal line is wrong after a commencement change | failure | Date checked before launch (A6); single source for the legal line | open | AC24 |
| K9 | The new scan breaks in production, or motion hurts completion | failure | Scan switch off by default; one-step rollback; motion can be turned off alone | planned | AC38, AC39 |
| K10 | Plain-text phishing: a forged request makes the site email any address with links in the "fix" text, from the SaralPrivacy domain | security | Escaping (AC32) stops markup but not links; per-IP rate limit only | open | OQ9 |
| K11 | A send that times out after the server saved it is sent again, so duplicate rows and emails go out | failure | No automatic retry after a timeout or network error (AC43); only the person's own "Try again" can resend | accepted | AC43, OQ10 |
| K12 | The home-page answer in `?pre=` reaches analytics in page-view addresses | privacy | None in this pilot | open | OQ11 |
| K13 | A mistyped email sends the report (name, firm, risk profile, report link) to a stranger | privacy | The form shows "We'll email it to <email>" before sending (AC27) | planned | AC27 |

## Acceptance criteria

### AC1 — The rail shows sections and fills as answers come in
- traces: G1
- given: a pack with scan metadata, on the 4th required question, with required questions 1–3 answered
- when: the person selects an answer to it
- then:
  - the rail shows the "Start" dot for the quick-start question, then one labelled block per section (CA: Practice, Documents, Controls), with one segment per question;
  - the segment for that question starts filling within 100 ms;
  - the label reads "Question 4 of N" (CA: "Question 4 of 10"); on the quick-start question it reads "Quick start · optional";
  - the percentage reads "40% complete", where the percentage is A ÷ N × 100, rounded half up to a whole number

### AC2 — Progress is announced to screen readers
- traces: G4
- given: a screen reader is running
- when: an answer changes A
- then: the rail exposes its value as "A of N answered, <section name> section" (or "A of N answered, quick start" on the quick-start question); the decorative parts aren't announced

### AC3 — Time left follows the 18-seconds-a-question rule
- traces: G1
- given: R is the number of required questions still unanswered, anywhere in the scan
- when: the time-left label is drawn
- then: the first matching rule applies:
  1. on the last question in the list, with R = 0: "Ready for your result";
  2. on the last question in the list, with R ≥ 1: "Last question";
  3. R × 18 < 60: "Under a minute left";
  4. otherwise: "About M min left", where M = R × 18 ÷ 60, rounded half up.
- note: because R doesn't depend on position, going Back never changes the label for the same answers

### AC4 — Questions move in the direction of travel, and focus follows
- traces: G1, G4
- given: any question
- when: the person moves to another question
- then:
  - with a mouse or touch, outside still mode, the next question enters from the right when moving forward and from the left when moving back, and the move finishes within 240 ms;
  - with a keyboard move, or in still mode, the question changes instantly;
  - in every case, focus moves to the new question's heading, which the screen reader reads

### AC5 — Enter moves on only when the question has an answer
- traces: G4
- given: focus is on an answer option
- when: the person presses Enter
- then: the scan moves to the next question if the current one is answered (or optional), and does nothing otherwise; arrow keys move between options and Space selects

### AC6 — The browser's Back and Forward move between questions
- traces: G3
- given: the person has moved from question 3 to question 5
- when: they press the browser's Back button twice, then Forward once
- then: they see question 4, then 3, then 4, with every earlier answer still selected; from the result, Back returns to the last question with all answers intact

### AC7 — A double activation never skips a question
- traces: G3
- given: question 5 is answered
- when: Next is activated twice within 350 ms
- then: the scan shows question 6, not 7

### AC8 — Selecting an answer is confirmed at once
- traces: G1, G4
- given: any option
- when: it's selected
- then:
  - the option's indicator fills and its tick finishes drawing within 240 ms, with no layout shift;
  - in still mode, the tick appears at once;
  - the empty indicator's border has at least 3:1 contrast against its background

### AC9 — Each finished section is marked once
- traces: G1, G4
- given: a section in which every required question is answered
- when: the person leaves the section's last question with Next or Enter (not the browser's Forward button), for the first time for that section in this page load
- then:
  - a stamp reading the section's stamp text (CA: "Practice recorded ✓", "Documents recorded ✓", "Controls recorded ✓") shows over the section label for 1300 ms (±50 ms), then a tick stays beside the label;
  - a screen reader hears "<section name> section done." once;
  - the stamp never shows on Back, never twice for the same section, and doesn't block input;
  - in still mode, only the tick appears and the announcement still happens

### AC10 — Progress is saved after every change
- traces: G3
- given: browser storage is available
- when: the person selects or clears an answer, or moves to another question (including the result)
- then: the saved value matches the contract, with the current answers, position and time; the result counts as the position after the last question
### AC11 — A returning person can continue
- traces: G3
- given: a usable saved value (AC14) with A ≥ 1, saved 7 days ago or less
- when: the person opens the scan again
- then:
  - a card shows "Welcome back. Pick up where you left off.", then "You've answered A of N questions." followed by "The rest takes about M min." (M as in AC3 rule 4, using the saved answers) or, when R × 18 < 60, "The rest takes under a minute.";
  - the card also shows a mini rail of answered questions and the note "Your answers stay on this device only, and aren't sent until you ask for your report. We clear them once your report is sent, or when you come back after 7 days.";
  - focus goes to the card's heading;
  - the button reads "Continue from Question K →", where K is the required-question number of the saved position, "Continue from the quick start →" when the saved position is the quick-start question, or "See your result again →" when the saved position is the result; it restores every answer, the position and the stamped sections, and in the last case recomputes and shows the result (recorded as `assessment_complete` if it is the first result in this page load);
  - a usable value with A = 0 is treated as nothing saved

### AC12 — Starting again clears saved progress
- traces: G3
- given: the resume card is showing
- when: the person chooses "Start again"
- then: the saved value is deleted and the scan opens on the quick-start question with nothing selected (Retake is AC41)

### AC13 — Old saves expire
- traces: G3
- given: a saved value whose `at` is more than 7 days ago
- when: the person opens the scan
- then: the value is deleted, the scan opens on the quick-start question, and a note reads "Your saved answers were more than 7 days old, so we cleared them. This is a fresh start."

### AC14 — Corrupt or edited saves are handled safely
- traces: G3
- given: a saved value
- when: the person opens the scan
- then: it is read field by field:
  - not valid JSON, not an object, `v` not 1, `answers` not an object, or `qi` not a number: the whole value is ignored, as if nothing was saved;
  - question IDs not in the pack: dropped; option IDs not in their question: dropped; a single-choice answer whose option was dropped, or a multi-choice list that ends up empty: removed;
  - `qi` out of range: clamped to the first or last question;
  - `stamped` not a list: treated as empty; unknown section keys: dropped;
  - `at` missing, not a number, or later than now: rewritten as now;
  - nothing throws, and no option outside the question set is ever selected

### AC15 — The scan works when the browser won't save
- traces: G3
- given: browser storage throws on read or on write (private browsing or blocked site data)
- when: the person uses the scan
- then: it works fully, no resume is offered, and a note reads "This browser isn't saving progress (private browsing does this). Finish in one sitting: about M min." (M as in AC3 rule 4 from the current answers; "under a minute" when R × 18 < 60)

### AC16 — Saved progress holds no contact details and ends when the report is saved
- traces: G5
- given: the person has typed into the report form
- when: storage is inspected at any point
- then: the saved value never contains a name, firm name, email or phone number; it is deleted on the first `report_saved` (200), on Start again or Retake, and when the scan next opens more than 7 days after the last save
### AC17 — Scoring shows its state and runs once
- traces: G1, G3
- given: the last question is answered
- when: the person activates "See my results →", once or several times
- then:
  - the button shows a spinner and "Scoring your answers…" within 100 ms;
  - scoring runs exactly once;
  - 900 ms after activation (300 ms in still mode), the button shows "Done ✓";
  - the result opens 280 ms later, or at once in still mode;
  - the button keeps the same size throughout;
  - a screen reader hears "Scoring your answers." once

### AC18 — Slow scoring says it's still working
- traces: G3
- given: the result hasn't opened 2000 ms after the button was activated (in tests, forced by a test-only delay; in use, a slow device)
- when: the 2000 ms mark passes
- then: the button reads "Still working on your score…" and a screen reader hears it once

### AC19 — The score lands as one moment and is read once
- traces: G1, G4
- given: the result opens
- when: it first appears
- then:
  - focus is on the score heading, whose accessible name is "DPDPA Readiness: S / 100. Risk band: <band>.";
  - the rolling number isn't announced;
  - measured from the result opening, outside still mode:
    - the summary bars start at 500 ms, 60 ms apart;
    - the band label appears by 850 ms;
    - the ring and the number both reach S at 1000 ms (±50 ms), within 50 ms of each other;
    - the free fix appears by 950 ms;
    - red flags start at 1150 ms, 60 ms apart;
    - everything is settled by 1400 ms;
  - in still mode, everything shows its final value on first paint

### AC20 — The band label is readable
- traces: G4
- given: any of the four bands
- when: the band label shows
- then: it reads only the band name (for example "High Risk"), and its text has at least 4.5:1 contrast against its own background for all four bands

### AC21 — One priority fix is shown free, ranked by the firm's own risk
- traces: G2
- given: any result for a pack with scan metadata
- when: the result opens
- then: directly after the legal line, a panel headed "Your top priority fix · free" shows the free fix and the line under it, exactly as in the "Free fix and ranked fixes" table in Contracts, without any form

### AC22 — Red flags show highest first, and their absence is said plainly
- traces: G2
- given: a result
- when: it shows
- then:
  - with one red flag, the heading reads "Your top risk"; with F = 2 or 3, "Your top F risks"; flags are in the order the engine returns them (highest severity first);
  - with none, a panel reads "No red flags found" with "None of your answers matched a red-flag pattern. Keep the evidence that shows it: written policies, access reviews and vendor terms."

### AC23 — The risk map leads with the two highest areas
- traces: G2, G4
- given: a result
- when: it shows
- then:
  - all areas from the pack are listed highest risk score first (ties in pack order), under "Your risk map · highest risk first", and only the first two show;
  - a "Show all <count> areas" control, which reports whether it is expanded, reveals the rest and becomes "Show fewer";
  - each area's status is announced as "<status>, <score> of 100" (for example "Moderate, 52 of 100")

### AC24 — The legal line is always on the result
- traces: G6
- given: any result, on an English or Hindi page
- when: it shows
- then: directly under the band explanation, in English in every language, it reads exactly: "Most DPDP Act duties, including notice, security safeguards and breach intimation, apply from 13 May 2027. This score is an educational check, not a compliance certificate or legal advice."

This line covers timing and the disclaimer only. Section-level wording for each legal claim lives in the question pack, corrected in PR #92 (https://github.com/SahuDilip1356/SaralPrivacy/pull/92).

### AC25 — Form mistakes are explained beside the field
- traces: G2, G4
- given: the report form
- when: the person submits with any of these mistakes, checked after trimming leading and trailing spaces
- then:
  - each affected field shows its message beneath it:

    | Mistake | Message |
    |---|---|
    | Name empty | "Enter your name." |
    | Firm name empty | "Enter your firm's name." |
    | Email empty | "Enter your email. The report goes there." |
    | Email not matching `^[^\s@]+@[^\s@]+\.[^\s@]{2,}$` | "Check the email. It needs an @ and a domain, like name@firm.in." |
    | Phone not blank and not a valid Indian mobile (AC26) | "Enter a 10-digit mobile number, like 98765 43210, or leave it blank." |
    | Consent box not ticked | the existing consent message, unchanged |

  - each affected field is marked invalid and linked to its message for screen readers;
  - focus moves to the first invalid field in form order: name, firm, email, phone, consent;
  - no report request is made, and a `report_form_error` event is recorded;
  - after the first blocked submit, each message disappears as soon as its field becomes valid

### AC26 — Phone is optional and Indian formats are accepted
- traces: G2
- given: the phone field
- when: the person submits
- then:
  - the value is normalised in this order:
    1. remove spaces, dashes, dots and brackets;
    2. remove a leading "+91";
    3. if 12 digits remain and start "91", remove the "91";
    4. if 11 digits remain and start "0", remove the "0";
  - the normalised number is valid if it is blank or exactly 10 digits starting 6–9 (so "9112345678" is valid as it stands);
  - the request carries those 10 digits, or "" when blank

### AC27 — Sending shows its state, names the address and sends once
- traces: G3
- given: the report form
- when: the email field holds a valid address, and the person then submits, once or several times quickly
- then:
  - before submitting, the line "We'll email it to <email>" shows beside the button;
  - on submit, fields become read-only, the button shows "Sending…" and reports itself busy, and one send runs (up to 3 attempts under the send policy)

### AC28 — A failed send keeps everything and offers a retry
- traces: G3
- given: the send ends in failure under the send policy (a 400, or the third failed attempt)
- when: the send ends
- then:
  - an alert reads "We couldn't send your report just now. Your details are still here. Try again in a minute.";
  - every field keeps its value, and the button reads "Try again";
  - a `report_submit_failed` event is recorded, with reason "server" or "network" as the send policy says

### AC29 — Offline sending is refused clearly
- traces: G3
- given: the browser reports it is offline
- when: the person submits a valid form
- then:
  - no request is attempted;
  - an alert reads "You're offline, so the report didn't send. Your details are still here. Try again once you're connected.";
  - fields keep their values;
  - a `report_submit_failed` event with reason "offline" is recorded

### AC30 — Success shows the other fixes, in the same order as the email
- traces: G2
- given: a valid form is submitted and the endpoint returns 200
- when: the response arrives
- then:
  - the form is replaced by "Your report is on its way to <email>.", which receives focus;
  - below it, the remaining ranked fixes appear in the order of the request's `immediateActions` (whose first item is the free fix); with no remaining fixes, this list is omitted;
  - then "The <checklist title> comes in the same email. If it isn't in your inbox in 5 minutes, check spam.";
  - a "Wrong email? Change it" control returns to the form with every value kept; submitting again sends a new request and a new email, with its own `report_requested` and `report_saved`;
  - one `report_saved` event is recorded per 200

### AC31 — Consent is still required to send
- traces: G7
- given: the consent box is unticked
- when: the person submits an otherwise valid form
- then: no report request is made, the consent box is marked with its existing message, and focus moves to it; the consent sentence stays in English in every language

### AC32 — Client-supplied text can't inject markup into the report email
- traces: G7
- given: a request whose `name`, `business`, `result.finalScore`, `result.verdictBand`, `result.verdictDescription`, `result.redFlagsTriggered`, `result.immediateActions` or `answers` contain `<`, `>`, `&`, `"` or `'`
- when: the report email and the admin alert are built
- then: those characters appear as text, not markup; a non-numeric score shows as a number; text without those characters renders unchanged

### AC33 — Offline is shown without losing anything
- traces: G3
- given: the browser goes offline while the questions are showing, or on the result
- when: the change happens
- then:
  - a banner appears: while the questions are showing, "You're offline. Keep answering: the scan and your result work without internet. Sending the report needs a connection."; on the result, "You're offline. Your result is all here. Sending the report needs a connection.";
  - a screen reader hears "You're offline." once;
  - when the connection returns, the banner disappears and "You're back online." is announced;
  - on the result, the form keeps its focus and values throughout

### AC34 — It fits and works on a small phone
- traces: G4
- given: a 360 × 740 viewport with touch
- when: every screen and state is shown
- then:
  - no page scrolls sideways;
  - every interactive element in the scan has a tap target at least 44 × 44 px;
  - form inputs use text at least 16 px;
  - answer badges use text at least 12 px;
  - the chat launcher is not shown on sector scan pages (`/assessment/<sector>`)

### AC35 — No automatic accessibility violations
- traces: G4
- given: an automated WCAG 2.2 AA accessibility check
- when: it runs on the quick-start question, a section stamp, the resume card, the result, the result with no red flags, the form with errors, the sending state and the success view
- then: it reports zero violations

### AC36 — Still mode keeps every state and removes movement
- traces: G4
- given: the operating system's reduced-motion preference is on, or is switched on while the scan is open
- when: the person completes the scan
- then:
  - no element slides, scales, blurs or spins;
  - every state, tick, label and value still appears;
  - a change of the preference mid-scan takes effect without a reload

### AC37 — Funnel events are complete, per sector, and carry no personal data
- traces: G5
- given: a full run, a resumed run, a retake, a form error, a failed send and a successful send
- when: events are recorded
- then: each event in the contract fires at its moment with `sector: "ca-firms"`, and no event property contains an answer, a name, a firm name, an email, a phone number or a report token

### AC38 — The scan switch selects the scan and rolls back cleanly
- traces: G1
- given: the scan switch (`NEXT_PUBLIC_CA_SCAN_V2`) is off
- when: anyone opens the CA scan
- then: they get today's scan, unchanged, with no extra script, and in production the page is still prerendered as a static page (the switch is decided from build settings alone; the `scanV2` parameter is read only outside production)

The same AC, with the switch on: they get the new scan. Turning it off again needs no data change.

### AC39 — Motion can be turned off without losing anything else
- traces: G1, G4
- given: the scan switch is on and the motion setting is off
- when: anyone completes the scan
- then: everything behaves as in AC36, and every state, label, tick, value, fix, form state and legal line is present

### AC40 — Two summary bars show exposure and control
- traces: G2
- given: a result
- when: it shows
- then:
  - after the red flags, a "Data exposure" bar shows `dataExposure`% and a "Control maturity" bar shows `controlMaturity`%, each with its percentage as text;
  - Data exposure is gold when it is 50 or more, and green otherwise;
  - Control maturity is gold when it is under 50, and green otherwise

### AC41 — Retake starts a clean second run
- traces: G1, G3
- given: a result is showing
- when: the person chooses "Retake the scan"
- then:
  - answers, stamps, form values and form state are cleared, and saved progress is deleted;
  - the scan opens on the quick-start question;
  - no second `assessment_start` is recorded;
  - the next result records `assessment_rerun`, not `assessment_complete`

### AC42 — A home-page answer and saved progress don't fight
- traces: G3
- given: the person arrives with `?pre=` from the home page and also has a usable saved value with A ≥ 1
- when: the scan opens
- then:
  - the resume card shows;
  - continuing keeps the saved answers and ignores `pre`; starting again applies `pre`;
  - `assessment_start` reports `prefilled: true` only when `pre` was applied

### AC43 — A hung request doesn't leave the form stuck or send twice
- traces: G3
- given: an attempt gets no response within 15 s
- when: 15 s pass
- then: that attempt is abandoned, no further attempt is made, and the form shows the AC28 state with reason "network"
## Non-functional

- **Responsiveness:** the selected option's indicator starts filling within 100 ms of input. A question change finishes within 240 ms. The result is fully settled within 1400 ms of opening.
- **Stability:** no layout shift when selecting answers, or when the scoring button changes state.
- **Smoothness:** animation never changes an element's layout size (transform scale is allowed). Holding 60 fps on a mid-range phone is checked by eye on the preview at sign-off, not by automated tests.
- **Page weight:** with the scan switch off, the CA scan page's script is within 1 KB of its size before this change (the shared analytics helper grows slightly). With it on, the page's gzipped script is at most 15 KB larger than with it off, compared between two production builds of the same commit.
- **Retention:** saved progress is deleted when the report is saved, on Start again or Retake, and when the scan next opens more than 7 days after the last save. Nothing is kept on the server until the form is sent.
- **Measurement:** see "Measurement" under Contracts (the single source; intent.md and plan.md refer to it).

## Out of scope

- The other 11 sector scans, the generic survey and the `/assessment` landing page, except three shared changes that apply to every sector and stay if the pilot is rolled back: sector-tagged analytics, email escaping, and hiding the chat launcher on `/assessment/*` pages.
- Running the pilot on another sector, and scan metadata for other sectors.
- Merging the 12 duplicated sector scans into one (intent NG3).
- Scoring, bands, buckets and red-flag rules.
- The report endpoint's behaviour, other than escaping in the email builder (see OQ9–OQ11).
- The report page, the email's look, and checklist content.
- Dark mode.
- Moving consent before the first question (generic survey only).
- Translating new interface text into Hindi beyond keys that fall back to English (OQ6).

## Open questions

D1–D7 are defined in `reference/SUBFRAME-MOTION-SPEC.md` §15.

- **OQ1: Section names, stamp wording and the scoring pause (D1–D3).** Owner Dilip, by 2026-11-10. Blocks AC1, AC9 and AC17 wording only; the behaviour stands. The design review asks whether the 900 ms pause should exist at all, since it adds waiting at the most fragile step. Measure abandonment between "See my results" and `assessment_complete` if it stays.
- **OQ2: Rank fixes by the firm's own risk (D4).** Owner Dilip, by 2026-11-10. Blocks AC21 and AC30. Fallback if ranking is rejected: the free fix is the pack's first recommendation in its current fixed order, and the email keeps today's order.
- **OQ3: 7-day expiry, and whether resume needs an opt-in (D5, intent A4).** Owner Dilip, legal review before launch. Blocks AC10–AC13. The resume note in AC11 is the wording for review.
- **OQ4: Phone optional (D6).** Owner Dilip, by 2026-11-10. Blocks AC26.
- **OQ5: Commencement date.** Owner Dilip: confirm 13 May 2027 against the MeitY notification before the scan switch is turned on. Blocks AC24.
- **OQ6: Hindi text for the new strings.** Owner Dilip, before Hindi users see the new scan. Until then, Hindi pages show the English text for new keys. The legal line (AC24) and the consent sentence (AC31) are English by design.
- **OQ7: Timings in acceptance criteria.** The EGM zoom-out review (egm-review/zoom_out_report.md) suggested replacing timings with user-visible guarantees. Kept for now, because the end-to-end suite can measure them within 50 ms. Owner Dilip to confirm, by 2026-11-10.
- **OQ8: Pilot scope for AC6 (browser history), AC9 (section stamps), AC18 (slow-scoring notice) and AC33 (offline banners while the questions show).** The EGM zoom-out review called these beyond the stated losses. Owner Dilip, by 2026-11-10. Default: keep. If cut, they move to Out of scope and their tasks drop those parts.
- **OQ9: Server-side safety of the report endpoint (K10).** Three options: recompute score, band, red flags and fixes on the server from `answers`; cap the length of `name` and `business`, and reject links in them; validate `answers` against the pack. This is a site-wide issue: today's scan posts the same request to the same endpoint, so the pilot doesn't increase the exposure. Owner Dilip, as a separate change with its own date; it isn't a gate for this pilot.
- **OQ10: Duplicate sends (K11).** Adding a per-submit request ID that the endpoint uses to return the existing result would stop duplicate rows and emails. Owner Dilip, with OQ9.
- **OQ11: `?pre=` in analytics page views (K12).** Strip `pre` from page-view addresses with a filter in the site's analytics setup. Owner Dilip; site-wide, so outside this pilot.
- **OQ12: Superseded records after "Change it" (K13).** When a resubmission follows a wrong email, the earlier record stays unflagged. Owner Dilip, with OQ9.
