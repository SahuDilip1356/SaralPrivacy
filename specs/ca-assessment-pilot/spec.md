# Spec — CA firm risk scan that people finish

**Status:** draft
**Intent:** ./intent.md
**Date:** 2026-11-03

## Behavior

A CA firm opens the scan and sees where they are at all times: a progress rail split into three named sections (Practice, Documents, Controls), a "Question 4 of 10" label, a percentage, and an estimate of the time left. Each answer is confirmed at once with a small tick, and each question slides in from the direction the person is moving. Finishing a section briefly shows a stamp and leaves a tick on the rail. Answers are saved in the person's own browser as they go. Coming back within 7 days offers to continue where they stopped. The last button shows a short "Scoring your answers" state.

The result opens with the readiness score drawn as a ring and a rolling number that land together. A band label follows, then one priority fix chosen from the firm's highest-risk area, shown in full without any form. Then the top risks, two summary bars, and a risk map that shows the two highest areas, with the rest one tap away. A plain line says when most duties apply and that the score isn't a certificate or legal advice. A report form follows. It explains every mistake beside the field, never loses what was typed, says clearly when the server or the network fails, and on success shows the other fixes on the page.

Everything works by keyboard and screen reader, honours reduced motion, and fits a 360 px phone. Each funnel step is counted per sector without sending any personal data.

## Contracts

### Terms

- **Question pack:** the sector's data that the scan reads. CA firms is the pilot; the scan reads only the fields listed in the next section, so another sector's pack works unchanged.
- **Quick-start question:** the pack's one optional question (`q0` for CA: client volume). It sits before the first section, shows as a "Start" dot on the rail, and doesn't count toward "N of 10" or the percentage.
- **Required questions:** every question not marked optional. N is their count (10 for CA).
- **Area:** one of the pack's 5 risk groups (called buckets in the pack). Each has a risk score from 0 to 100, where **higher means more risk**, and a status: Low under 34, Moderate 34–66, High 67 and over.
- **Readiness score:** 100 minus the overall risk score, 0–100, where **higher is better**. This is the number in the ring.
- **Band:** one of Controlled, Moderate Risk, High Risk, Critical Risk, from the overall risk score (0–24, 25–49, 50–74, 75–100), raised by override rules.
- **Visual source of record:** sizes, colours, the stamp's look and all motion durations not stated here come from `SaralPrivacyHub/Strategy/assessment-lead-magnet/SUBFRAME-MOTION-SPEC.md` §4–§6. This spec overrides that document where they differ (for example, the analytics timings in "Metric continuity").

### Question pack contract (fields the scan reads)

```
pack.industry: string                 // sector key, e.g. "ca-firms"; used for storage key and analytics
pack.reportType: string               // request report_type, e.g. "ca-firm"
pack.positioning.title: string        // scan title, e.g. "CA Firm DPDPA Risk Scan"
pack.leadMagnet?: { title, href }     // checklist name in the form heading and sent message
pack.questions: Array<{
  id: string, question: string, helpText?: string, whyThisMatters?: string, badge: string,
  type: "single" | "multi", optional?: boolean,
  mutuallyExclusive?: string[],        // option ids that clear all others when picked
  options: Array<{ id, label, badge?, badgeColor? }>
}>
pack.buckets: Array<{ key, label, meaning }>   // the 5 areas
pack.bandCopy?: Record<Band, string>           // band explanation under the score
```

The question pack and the scoring engine are not changed by this work. A repository rule keeps them byte-identical, and tests read their source text to guard it.

### Scan metadata (new, per sector, kept beside the scan)

```
sections: Array<{ key: string, questionIds: string[] }>
fixes: Array<{ text: string, bucket: string }>   // each pack fix and the area it addresses
fallbackFix: string                              // the pack's fix when no area qualifies
```

- CA sections: `practice` = q1, q2; `documents` = q3, q4, q5; `controls` = q6–q10. Section names and stamp text come from the message files, keyed by section key (see AC1, AC9).
- CA fixes: the pack's four fixes, mapped to intake, storage & access, retention, and vendor & incident, in that order. The texts must match the pack's text exactly; a test compares them with the pack source.
- A sector with no scan metadata shows a single progress bar instead of the rail, and its pack's first recommendation as the free fix.

### Scoring output the scan uses (computed in the browser by the existing engine)

| Field | Type | Meaning |
|---|---|---|
| `readinessScore` | integer 0–100 | the score shown; higher is better |
| `riskScore` | integer 0–100 | 100 − readinessScore |
| `band`, `bandColor`, `bandDescription` | string | band label, its colour, its fallback description |
| `dataExposure` | integer 0–100 | higher is worse; first summary bar |
| `controlMaturity` | integer 0–100 | higher is better; second summary bar |
| `bucketScores` | { [areaKey]: 0–100 } | area risk; higher is worse |
| `bucketStatus` | { [areaKey]: "Low" \| "Moderate" \| "High" } | thresholds 34 and 67 |
| `redFlags` | string[] (0–3) | top red flags by severity |
| `recommendations` | string[] (1–4) | the pack's fixes in its fixed order |

### Free fix and ranked fixes

The ranked list holds the same set of fixes as `recommendations`, reordered by the risk score of the area each fix addresses, highest first. Ties keep the pack's order. The CA rule for which fixes are in the set (unchanged from today):

| Condition | Fixes in the set | Free fix (first item) | Line under the free fix |
|---|---|---|---|
| Band is High Risk or Critical Risk | all 4 area fixes (intake, storage & access, retention, vendor & incident) | the fix whose area scores highest, even if under 34 | "Linked to your highest-risk area with a fix: <Area> (<score>/100)." |
| Band is Controlled or Moderate Risk, and at least one of those 4 areas scores 34 or more | the fixes for those areas | the one whose area scores highest | same as above |
| Band is Controlled or Moderate Risk, and none of those 4 areas scores 34 or more | the pack's single fallback fix (no area) | the fallback | "No area scored high enough to need a specific fix." |

The "Client document risk" area has no fix of its own in the CA pack, so it never selects the free fix.

### Saved progress (browser storage only, never sent)

```
key:   "sp-assessment-v1:ca-firms"
value: {
  v: 1,
  answers: { [questionId: string]: string | string[] },  // option ids only
  qi: number,            // index of the question being shown, 0-based
  stamped: string[],     // section keys already stamped
  at: number             // ms since epoch of the last save
}
```

- Readers accept a value only if it parses, `v === 1`, `answers` is an object and `qi` is a number.
- Option IDs not in the current question set are dropped.
- `qi` is clamped to the question range.
- A value whose `at` is more than 7 × 24 hours old is deleted and reported as expired.
- The value never contains a name, firm name, email or phone number.

### Report request (existing endpoint, unchanged shape)

`POST /api/assessment`, request JSON, with the fields the scan sets. All string fields are trimmed before sending.

```
{ email: string, name: string, business: string, mobile: string,   // mobile "" when not given
  industry: "ca-firms", report_type: "ca-firm", answers: object,
  result: { finalScore, rawScore, verdictBand, verdictDescription, dataExposure,
            controlMaturity, operationalReadiness: 0, categoryScores,
            redFlagsTriggered: string[],
            immediateActions: string[],      // ranked fixes, same order as shown on the page
            thirtyDayActions: [] },
  consentReport: true, consentNewsletter: false, consentFollowup: false, hp_url: string }
```

| Field | Source |
|---|---|
| `answers` | the scan's answers map: question id → option id (single) or option id[] (multi) |
| `result.finalScore` | `readinessScore` (integer) |
| `result.rawScore` | `riskScore` (integer) |
| `result.verdictBand`, `result.verdictDescription` | `band`, and the pack's `bandCopy[band]` or else `bandDescription` |
| `result.dataExposure`, `result.controlMaturity`, `result.categoryScores` | the same-named scoring outputs; `categoryScores` = `bucketScores` |
| `result.redFlagsTriggered` | `redFlags` |
| `result.immediateActions` | the ranked fix texts, in order (1–4 items) |
| `hp_url` | a hidden spam-trap field, always sent as "" by real users |

Retry policy (unchanged from today): up to 3 attempts. On 429, wait the `Retry-After` seconds, capped at 5, then retry. On any other non-200 status or a network error, wait 0.8 s × attempt number, then retry. A 400 is not retried and is treated as a server failure (AC28), because the form has already validated the email.

| Status | Meaning |
|---|---|
| 200 | Saved; the email is queued |
| 400 `{ error: "Email is required." }` | Rejected input |
| 429 + `Retry-After` header (seconds) | Rate limited |
| 500 `{ error: "Failed to save assessment." }` | Server failure |

### Analytics events (cookieless, aggregate)

Each event carries `sector: "ca-firms"`. No event ever carries answers, free text, names, emails, phone numbers or report tokens. Properties are listed in priority order: if the analytics plan caps properties per event (A5), the ones at the end are dropped first, and `sector` is never dropped.

| Event | When it fires | Extra properties |
|---|---|---|
| `assessment_start` | once per page load, on first render (as today); not on Retake | `prefilled: boolean` (the scan opened with an answer pre-selected from the home page), `src: "hero" \| ""` (arrived from the home page question) |
| `assessment_question_view` | each time a question is shown, including after Back; not repeated on a re-render of the same question | `q: string` (question id), `n: number` (1-based position in the full list, quick-start = 1) |
| `assessment_section_complete` | once per section per page load, when it first becomes complete on a forward move; also under reduced motion | `section: string` (section key) |
| `assessment_resume_shown` | when the resume card renders | `answered: number` |
| `assessment_resume_continue` | when "Continue" is chosen | `from_q: string` (question id) |
| `assessment_complete` | each time a result is computed (first run and each retake) | `risk_band: string` (band label), `score: number` (readiness score), `industry: string` (kept for continuity) |
| `free_fix_viewed` | once per result, when the free fix is at least half visible | `bucket: string` (area key, or "none" for the fallback) |
| `report_form_error` | each submit blocked by validation | `fields: string` (comma-joined from name, firm, email, phone, consent) |
| `report_submit_failed` | each attempt that ends in AC28 or AC29 | `reason: "server" \| "offline"` |
| `report_requested` | each valid submit, before the request (as today) | `risk_band: string` |
| `report_sent` | each 200 response | `risk_band: string` |
| `assessment_step_3`, `assessment_step_6` | once per page load, when the question at index 3 or 6 of the full list (labelled "Question 3" and "Question 6") is first shown, as today | `step: number` |

The analytics service is the site's existing cookieless page analytics, called through the site's shared tracking helper.

**Metric continuity.** The before and after windows must count the same things, or the success criterion means nothing.
- `assessment_start` fires once per page load, on first render, exactly as today. A resumed visit is still one start; resumption is counted only by `assessment_resume_continue`.
- `assessment_complete` fires when a result is computed, as today. A retake in the same page load is a second run with no second start; the success ratio therefore counts results and starts per page load, and retakes are reported separately (completions minus starts can be positive only through retakes).
- `report_requested` keeps today's moment: a valid form is submitted, before the request is sent. The new `report_sent` marks a 200 response.
- `assessment_step_3` and `assessment_step_6` keep firing when question index 3 and 6 are first shown.
- The success ratio is `assessment_complete` ÷ `assessment_start`, and the lead rate is `report_requested` ÷ `assessment_complete`, in both windows.

### Release switch

Two build-time settings.
- **Scan switch** `NEXT_PUBLIC_CA_SCAN_V2`: "1" means on, anything else (including unset) means off. Default off. Off means today's scan, and the page carries no extra script for the new one. On means the new scan. The URL parameter `scanV2=1` forces it on only when the deployment environment is "preview" or "development"; when the environment can't be read, the parameter is ignored.
- **Motion setting** `NEXT_PUBLIC_SCAN_MOTION`: "0" means off, anything else means on. Default on. Off makes the new scan behave exactly as it does under reduced motion: every state, label, tick and value, with no movement. This lets the non-motion improvements stay if motion turns out not to help (intent A1).

## System context

**Parts by role:**
- **The scan page** runs entirely in the browser: questions, scoring, the result and the form.
- **The browser's local storage** keeps saved progress for that person on that device.
- **The report endpoint** stores the submission and sends the email.
- **The email sender** builds the report email from the submission.
- **The analytics service** receives aggregate, cookieless events.
- **The chat assistant** is a floating launcher that appears on public pages.

The site runs in English and Hindi, chosen by the URL prefix (`/hi/...` for Hindi). Interface text comes from per-language message files, keyed by name; a key missing in Hindi shows the English text.

The new scan takes the sector's question pack as its input. Sector-specific text, sections, fixes and the sector key come from the pack or the message files, never from the scan's own parts, so a rollout to other sectors reuses it instead of copying it.

**Data flow:**
- Answers stay in the browser until the person submits the report form.
- Scoring happens in the browser.
- On submit, the contact details, answers and computed result go to the report endpoint. The endpoint stores them, and the email sender puts parts of them into the email.
- Analytics events go from the browser to the analytics service.

| Data | Kept where | Leaves the device? |
|---|---|---|
| Answers (option IDs) | browser storage for up to 7 days | only inside a report request the person submits |
| Position, stamped sections, save time | browser storage | no |
| Name, firm, email, phone | page memory until submit | only inside the report request |
| Score, band, fixes, red flags | computed in the browser | only inside the report request |
| Funnel events | not stored locally | yes, to the analytics service, with no personal data |

**Trust boundaries:**
1. **Browser → report endpoint.** Every field, including the computed result, can be forged by anyone who posts directly. The endpoint and the email sender must treat it all as untrusted text.
2. **Browser storage → scan.** A saved value may be old, edited or corrupt, so it's validated before use.
3. **Browser → analytics service.** Only the listed properties may cross.

## Alternatives considered

| Choice | Chosen | Rejected and why |
|---|---|---|
| Where progress is saved | in the person's own browser, for 7 days | On the server: that sends answers before the person has agreed to anything, and needs consent and retention rules |
| What the free part of the result includes | score, band, top risks, map and one ranked fix | Score only: there's no reason to trust the report. Everything free: there's no reason to give an email |
| Which fix is free | the fix for the highest-risk area that has one | The first fix in a fixed list: often not the most relevant to this firm |
| Phone on the report form | optional (pending D6) | Required: adds friction, and the endpoint already accepts it empty |
| What happens on a server failure | the scan keeps everything typed and offers "Try again" | Silent retries only: the person can't tell whether it worked |
| How the new scan is released | a scan switch, off by default, plus a separate motion setting | One switch only: if motion doesn't help, the accessibility, mobile, form and legal gains would go with it. Replacing the old scan outright: no quick way back |

## Risks & mitigations

| # | Risk | Type | Mitigation | Status | Tested by |
|---|---|---|---|---|---|
| K1 | Forged report requests inject markup into the email through the result text, name or firm | security | Every client-supplied value is escaped before it's placed in the email | open | AC32 |
| K2 | Saved progress on a shared computer shows a previous person's answers | privacy | Answers only (no contact details); 7-day expiry; "Start again" clears; cleared when the result shows | mitigated | AC12, AC13, AC16 |
| K3 | An edited or corrupt saved value breaks the scan or ticks an option that no longer exists | failure | Validation on read; unknown option IDs dropped | mitigated | AC14 |
| K4 | Private browsing or blocked storage throws errors | failure | Storage access guarded; the scan runs without saving and says so | mitigated | AC15 |
| K5 | Analytics carries personal data | privacy | Fixed property list; no free text | mitigated | AC37 |
| K6 | Motion delays or blocks people, or makes them unwell | latency | Nothing waits on animation; reduced motion and keyboard skip movement | mitigated | AC8, AC36 |
| K7 | The success criterion can't be read because traffic is too low | scale | Traffic is checked before the build starts, with a decision rule for low counts (Non-functional, Measurement) | open | Non-functional, measurement |
| K8 | A legal line is wrong after a commencement change | failure | Date checked before launch (A6); single source for the legal line | open | AC24 |
| K9 | The new scan breaks in production, or motion hurts completion | failure | Scan switch off by default; one-step rollback; motion can be turned off alone | mitigated | AC38, AC39 |

## Acceptance criteria

### AC1 — The rail shows sections and fills as answers come in
- traces: G1
- given: a pack with sections, on question 4 (the 4th required question), with required questions 1–3 answered
- when: the person selects an answer to question 4
- then:
  - the rail shows the "Start" dot for the quick-start question, then one labelled block per section (CA: Practice, Documents, Controls), with one segment per question;
  - the segment for question 4 fills within 100 ms;
  - the label reads "Question 4 of 10"; on the quick-start question it reads "Quick start · optional";
  - the percentage reads "40% complete", where the percentage is answered required questions ÷ N × 100, rounded to the nearest whole number
### AC2 — Progress is announced to screen readers
- traces: G4
- given: a screen reader is running
- when: an answer changes the number of answered questions
- then: the rail exposes its value as "N of 10 answered, <Section> section"; the decorative parts aren't announced

### AC3 — Time left follows the 18-seconds-a-question rule
- traces: G1
- given: R is the number of required questions still unanswered, anywhere in the scan
- when: the label is drawn
- then: the first matching rule applies:
  1. on the last question, with R = 0: "Ready for your result";
  2. on the last question, with R ≥ 1: "Last question";
  3. R × 18 < 60: "Under a minute left";
  4. otherwise: "About M min left", where M = R × 18 ÷ 60 rounded to the nearest whole number.
  Because R doesn't depend on position, going Back never changes the figure for the same answers.
### AC4 — Questions move in the direction of travel, and focus follows
- traces: G1, G4
- given: any question
- when: the person moves on with a mouse or touch
- then:
  - moving forward, the next question enters from the right; moving back, it enters from the left; the move finishes within 0.24 s;
  - focus moves to the new question's heading, which the screen reader reads;
  - a move made from the keyboard (an activation with no pointer, such as Enter or Space on a button), or with reduced motion on, changes the question instantly
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
  - with reduced motion, the tick appears at once;
  - the empty indicator's border has at least 3:1 contrast against its background

### AC9 — Each finished section is marked once
- traces: G1, G4
- given: a section in which every required question is answered, and the person leaves its last question by any forward move (Next button or Enter)
- when: this happens for the first time for that section in this page load
- then:
  - a stamp reading the section's stamp text (CA: "Practice recorded ✓", "Documents recorded ✓", "Controls recorded ✓") shows over the section label for about 1.3 s, then a tick stays beside the label;
  - a screen reader hears "<Section> section done." once;
  - the stamp never shows on Back, never twice for the same section, and doesn't block input;
  - with reduced motion or motion off, only the tick appears and the announcement still happens
### AC10 — Progress is saved after every change
- traces: G3
- given: browser storage is available and the result has not yet been shown in this page load
- when: the person selects or clears an answer, or moves to another question
- then: the saved value matches the contract, with the current answers, position and time. Once a result has been shown in this page load, nothing more is saved until the person chooses "Retake the scan".
### AC11 — A returning person can continue
- traces: G3
- given: a usable saved value (AC14) with at least one answer, saved 7 days ago or less
- when: the person opens the scan again
- then:
  - a card shows "Welcome back. Pick up where you left off.", "You've answered N of 10 questions. The rest takes about M min." (M from the AC3 rule with the saved answers), a mini rail of answered questions, and "Your answers are saved on this device only, for 7 days. Nothing is sent until you ask for your report.";
  - focus goes to the card's heading;
  - "Continue from Question K →", where K is the label of the saved position (`qi`; "the quick start" when it is the quick-start question), restores every answer, the position and the stamped sections;
  - a usable value with no answers is treated as nothing saved
### AC12 — Starting again clears saved progress
- traces: G3
- given: the resume card, or the retake button on the result
- when: the person chooses "Start again" or "Retake the scan"
- then: the saved value is deleted and the scan opens on its first question with nothing selected

### AC13 — Old saves expire
- traces: G3
- given: a saved value older than 7 days
- when: the person opens the scan
- then: the value is deleted, the scan opens on its first question, and a note reads "Your saved answers were more than 7 days old, so we cleared them. This is a fresh start."

### AC14 — Corrupt or edited saves are handled safely
- traces: G3
- given: a saved value
- when: the person opens the scan
- then: it is read field by field:
  - not valid JSON, not an object, or `v` not 1: ignored, as if nothing was saved;
  - `answers` not an object: ignored;
  - question ids not in the pack: dropped; option ids not in their question: dropped; a single-choice answer whose option was dropped, or a multi-choice list that ends up empty: removed;
  - `qi` not a number: ignored; out of range: clamped to the first or last question;
  - `stamped` not a list: treated as empty; unknown section keys: dropped;
  - `at` missing, not a number, or later than now: treated as saved now;
  - nothing throws, and no option outside the question set is ever selected
### AC15 — The scan works when the browser won't save
- traces: G3
- given: browser storage throws on write (private browsing or blocked site data)
- when: the person uses the scan
- then: it works fully, no resume is offered, and a note reads "This browser isn't saving progress (private browsing does this). Finish in one sitting: about M min."

### AC16 — Saved progress holds no contact details and ends at the result
- traces: G5
- given: the person has typed into the report form
- when: storage is inspected at any point
- then: the saved value never contains a name, firm name, email or phone number; once the result shows, the saved value is deleted, and AC10 keeps it from being written again in that page load (including after browser Back to a question)
### AC17 — Scoring shows its state and runs once
- traces: G1, G3
- given: the last question is answered
- when: the person activates "See my results →" (once or several times)
- then:
  - the button shows a spinner and "Scoring your answers…" within 100 ms;
  - scoring runs exactly once;
  - after 0.9 s (0.3 s with reduced motion or motion off), the button shows "Done ✓" for 0.28 s (no wait with reduced motion) and the result opens;
  - the button keeps the same size throughout;
  - a screen reader hears "Scoring your answers." once
### AC18 — Slow scoring says it's still working
- traces: G3
- given: the result hasn't opened 2 s after the button was activated (in tests, forced by a test-only delay; in use, a slow device)
- when: the 2 s mark passes
- then: the button reads "Still working on your score…" and a screen reader hears it once
### AC19 — The score lands as one moment and is read once
- traces: G1, G4
- given: the result opens
- when: it first appears
- then:
  - the ring and the number both reach the readiness score within 50 ms of each other, about 1 s after opening;
  - focus is on the heading "DPDPA Readiness: N / 100", which also reads ". Risk band: <band>." to screen readers;
  - the rolling number isn't announced;
  - with reduced motion or motion off, the ring and number show their final values on first paint;
  - the band label appears by 0.85 s, the free fix by 0.95 s, the summary bars start at 0.5 s, and red flags start at 1.15 s, each list staggered 60 ms; everything is settled by 1.4 s
### AC20 — The band label is readable
- traces: G4
- given: any of the four bands
- when: the band label shows
- then: it reads only the band name (for example "High Risk"), and its text has at least 4.5:1 contrast against its own background for all four bands

### AC21 — One priority fix is shown free, ranked by the firm's own risk
- traces: G2
- given: any result
- when: the result opens
- then: directly under the score card, a panel headed "Your top priority fix · free" shows the free fix and the line under it, exactly as in the "Free fix and ranked fixes" table in Contracts, without any form
### AC22 — Red flags show highest first, and their absence is said plainly
- traces: G2
- given: a result
- when: it shows
- then:
  - with one red flag, the heading reads "Your top risk area"; with two or three, "Top N risk areas"; flags are in the order the engine returns them (highest severity first);
  - with none, a panel reads "No red flags found" with "None of your answers matched a red-flag pattern. Keep the evidence that shows it: written policies, access reviews and vendor terms."
### AC23 — The risk map leads with the two highest areas
- traces: G2, G4
- given: a result
- when: it shows
- then:
  - all areas from the pack are listed highest risk score first (ties in pack order), under "Your risk map · highest risk first", and only the first two show;
  - a "Show all <count> areas" control, which reports whether it is expanded, reveals the rest and becomes "Show fewer";
  - each area's status is read as "<Status> risk, N of 100", where Status is Low, Moderate or High
### AC24 — The legal line is always on the result
- traces: G6
- given: any result
- when: it shows, in any language
- then: under the band text, in English, it reads exactly: "Most DPDP Act duties, including notice, security safeguards and breach intimation, apply from 13 May 2027. This score is an educational check, not a compliance certificate or legal advice."
- note: this line covers timing and the disclaimer. Section-level wording for each legal claim lives in the question pack, corrected in PR #92 (https://github.com/SahuDilip1356/SaralPrivacy/pull/92). The line sits under the band explanation paragraph in the score card.

### AC25 — Form mistakes are explained beside the field
- traces: G2, G4
- given: the report form; values are trimmed of leading and trailing spaces before checking
- when: the person submits with any of these mistakes
- then:
  - each affected field shows its message beneath it:

    | Mistake | Message |
    |---|---|
    | Name empty after trimming | "Enter your name." |
    | Firm name empty after trimming | "Enter your firm's name." |
    | Email empty | "Enter your email. The report goes there." |
    | Email not matching `^[^\s@]+@[^\s@]+\.[^\s@]{2,}$` | "Check the email. It needs an @ and a domain, like name@firm.in." |
    | Phone not blank and not a valid Indian mobile (AC26) | "Enter a 10-digit mobile number, like 98765 43210, or leave it blank." |
    | Consent box not ticked | the existing consent message, unchanged |

  - each affected field is marked invalid and linked to its message for screen readers;
  - focus moves to the first invalid field in form order: name, firm, email, phone, consent;
  - nothing is sent, and a `report_form_error` event is sent;
  - after the first blocked submit, each message disappears as soon as its field becomes valid
### AC26 — Phone is optional and Indian formats are accepted
- traces: G2
- given: the phone field
- when: the person submits
- then: the value is read by removing spaces, dashes, dots and brackets; then a leading "+91" is removed; then, if 12 digits remain and start "91", the "91" is removed; then, if 11 digits remain and start "0", the "0" is removed. The result is valid if it is blank or exactly 10 digits starting 6–9 (so "9112345678" is a 10-digit number and valid as it stands). The request carries those 10 digits, or "" when blank.
### AC27 — Sending shows its state and sends once
- traces: G3
- given: a valid form
- when: the person submits, once or several times quickly
- then: fields become read-only, the button shows "Sending…" and reports itself busy, and exactly one request is made

### AC28 — A server failure keeps everything and offers a retry
- traces: G3
- given: the endpoint returns 500, or fails after the existing automatic retries (429 included)
- when: the attempt ends
- then:
  - an alert reads "We couldn't send your report. Your details are still here. Try again in a minute.";
  - every field keeps its value and the button reads "Try again";
  - a `report_submit_failed` event with reason "server" is sent

### AC29 — Offline sending is refused clearly
- traces: G3
- given: the browser reports it is offline
- when: the person submits a valid form
- then:
  - no request is attempted;
  - an alert reads "You're offline, so the report didn't send. Your details are still here. Try again once you're connected.";
  - fields keep their values;
  - a `report_submit_failed` event with reason "offline" is sent

### AC30 — Success shows the other fixes, in the same order as the email
- traces: G2
- given: the form is headed "Get your other N priority fixes and the <checklist title>" when the ranked set has N ≥ 1 fixes after the free one, or "Get the <checklist title>" when it has none, where the checklist title is the pack's lead magnet title (CA: "CA Firm DPDPA Starter Checklist"); and the endpoint returns 200
- when: the response arrives
- then:
  - the form is replaced by "Report sent to <email>", which receives focus;
  - below it, the remaining ranked fixes appear in the order of the request's `immediateActions`, whose first item is the free fix; with no remaining fixes, this list is omitted;
  - then "The <checklist title> is in the same email. If it isn't in your inbox in 5 minutes, check spam.";
  - a "Wrong email? Change it" control returns to the form with every value kept; submitting again sends a new request and a new email, with its own `report_requested` and `report_sent`;
  - a `report_sent` event is sent once per 200
### AC31 — Consent is still required to send
- traces: G6
- given: the consent box is unticked
- when: the person submits an otherwise valid form
- then: nothing is sent, the consent box is marked with its existing message, and focus moves to it; the consent sentence stays in English in every language

### AC32 — Client-supplied text can't inject markup into the report email
- traces: G3, G6
- given: a request whose name, firm, band, summary, red flags, fixes or answers contain `<`, `>`, `&`, `"` or `'`
- when: the report email is built
- then: those characters appear in the email as text, not markup; legitimate text renders unchanged

### AC33 — Offline is shown without losing anything
- traces: G3
- given: the browser goes offline during the quiz or on the result
- when: the change happens
- then:
  - a banner appears: during the quiz, "You're offline. Keep answering: the scan and your result work without internet. Sending the report needs a connection."; on the result, "You're offline. Your result is all here. Sending the report needs a connection.";
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
  - the chat launcher is not shown on assessment pages
### AC35 — No automatic accessibility violations
- traces: G4
- given: an automated WCAG 2.2 AA accessibility check
- when: it runs on the first question, a section stamp, the resume card, the result, the result with no red flags, the form with errors, the sending state and the sent state
- then: it reports zero violations

### AC36 — Reduced motion keeps every state and removes movement
- traces: G4
- given: reduced motion is on, or is switched on while the scan is open
- when: the person completes the scan
- then:
  - no element slides, scales, blurs or spins;
  - every state, tick, label and value still appears;
  - a change of the preference mid-scan takes effect without a reload

### AC37 — Funnel events are complete, per sector, and carry no personal data
- traces: G5
- given: a full run, a resumed run, a form error, a failed send and a successful send
- when: events are recorded
- then: each event in the contract fires at its moment with `sector: "ca-firms"`, and no event property contains an answer, a name, a firm name, an email, a phone number or a report token

### AC38 — The release switch selects the scan and rolls back cleanly
- traces: G1
- given: the release switch is off
- when: anyone opens the CA scan
- then:
  - they get today's scan, unchanged;
  - with the switch on, they get the new scan;
  - turning it off again needs no data change

### AC40 — Two summary bars show exposure and control
- traces: G2
- given: a result
- when: it shows
- then: under the red flags, a "Data exposure" bar shows `dataExposure`% (higher is worse) and a "Control maturity" bar shows `controlMaturity`% (higher is better), each with its percentage as text; a bar is gold when it is on the bad side of 50 and green otherwise

### AC41 — Retake starts a clean second run
- traces: G1, G3
- given: a result is showing
- when: the person chooses "Retake the scan"
- then: answers, stamps, form values and form state are cleared, saved progress is deleted, the scan opens on the quick-start question, and no second `assessment_start` is sent

### AC39 — Motion can be turned off without losing anything else
- traces: G1, G4
- given: the scan switch is on and the motion setting is off
- when: anyone completes the scan
- then: everything behaves exactly as in AC36 (reduced motion): no element slides, scales, blurs or spins, and every state, label, tick, value, fix, form state and legal line is still present

## Non-functional

- **Responsiveness:** the indicator on input responds within 100 ms. Question change finishes within 0.24 s. The result is fully settled within 1.4 s of opening.
- **Stability:** no layout shift when selecting answers or when the scoring button changes state.
- **Smoothness:** animation only moves, fades or clips elements, never resizing them. Holding 60 fps on a mid-range phone is checked by eye on the preview at sign-off, not by automated tests.
- **Page weight:** with the scan switch off, the CA scan page's script is the same size as before this change. With it on, the page's gzipped script is at most 15 KB larger than with it off, compared between two production builds of the same commit.
- **Retention:** saved progress lasts at most 7 days on the device. Nothing is kept on the server until the form is sent.
- **Measurement:** the success criterion is read only once each window has at least 50 starts (A2). This is checked before the build starts, from the first 2 weeks of sector-tagged events. If CA has fewer than 50 starts in 2 weeks, both windows become 4 weeks. If it still has fewer than 50 in 4 weeks, the pilot runs on the sector with the most starts instead, using that sector's pack with no other change.

## Out of scope

- The other 11 sector scans, the generic survey and the `/assessment` landing page.
- Scoring, bands, buckets and red-flag rules.
- The report page, the email's look, and checklist content.
- Dark mode.
- Moving consent before the first question (generic survey only).
- Translating new interface text into Hindi beyond keys that fall back to English (see open questions).

## Open questions

D1–D7 are defined in `SaralPrivacyHub/Strategy/assessment-lead-magnet/SUBFRAME-MOTION-SPEC.md` §15.

- **OQ1: Section names, stamp wording and the 0.9 s scoring pause (D1–D3).** Owner Dilip, by 2026-11-10. Blocks AC1, AC9 and AC17 wording only; the behaviour stands.
- **OQ2: Rank fixes by the firm's own risk (D4).** Owner Dilip, by 2026-11-10. Blocks AC21 and AC30. Fallback if ranking is rejected: the free fix is the pack's first recommendation in its current fixed order, and the email keeps today's order.
- **OQ3: 7-day expiry, and whether resume needs an opt-in (D5, A4).** Owner Dilip, legal review before launch. Blocks AC10–AC13.
- **OQ4: Phone optional (D6).** Owner Dilip, by 2026-11-10. Blocks AC26.
- **OQ5: Commencement date.** Owner Dilip: confirm 13 May 2027 against the MeitY notification before the switch is turned on. Blocks AC24.
- **OQ6: Hindi text for the new strings.** Owner Dilip, before Hindi users see the new scan. Until then, Hindi pages show the English text for new keys, except the legal tier, which is English by design.
- **OQ7: Timings in acceptance criteria.** The EGM zoom-out review (egm-review/zoom_out_report.md) suggested replacing timings with user-visible guarantees. Kept for now because the end-to-end suite can measure them within 50 ms; owner Dilip to confirm, by 2026-11-10.
- **OQ8: Pilot scope for AC6 (browser history), AC9 (section stamps), AC18 (slow-scoring notice) and AC33 (offline banners during the quiz).** The EGM zoom-out review called these beyond the stated losses. Owner Dilip, by 2026-11-10. Default: keep. If cut, they move to Out of scope and their tasks drop those parts.
