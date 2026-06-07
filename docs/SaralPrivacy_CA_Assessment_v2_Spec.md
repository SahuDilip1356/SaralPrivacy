> ⚠️ **SUPERSEDED (2026-06-07)** by `SaralPrivacy_Industry_Assessment_Portfolio_Spec.md`.
> CA is now the **reference pack** inside the portfolio master spec (reusable engine, hybrid scoring,
> 12-industry roadmap, CA UI v2 blueprint). This file is kept for the detailed CA questionnaire,
> options, and per-option risk points, which are carried verbatim into `packs/ca-firms.ts`.

# CA Firms DPDPA Assessment v2.0 — Spec & Implementation Plan

**Owner:** Dilip Sahu · **Product:** SaralPrivacy (saralprivacy.com)
**Status:** Draft for review · **Last updated:** 2026-06-07
**Audience:** Internal (developer + founder) build spec — not external marketing copy.

> Positioning anchor (from product brief): *"Most CA firms do not have a tax knowledge problem.
> They have a client-document control problem."* This is a **CA practice risk scan**, not a generic
> DPDPA test.

---

## 0. TL;DR

- The CA assessment today is a **7-question, single-select, generic** flow running on the *old/weak*
  engine. It does **not** capture leads (the email box is fake), has **no risk buckets, no red-flag
  overrides, no multi-select, and no lead magnet**.
- Meanwhile the flagship `/assessment` already runs a **far richer engine** (red-flag penalties,
  6 category scores, verdict bands, action pools, real lead capture + email + report token).
  v2.0 should be modelled on **that** engine — not the legacy one.
- **Recommendation:** Build a dedicated CA engine (`lib/data/ca-firm-assessment.ts`) that implements
  the 10-question pack, 5 buckets, caps, and 5 override rules from the brief — and reuse the existing
  **API route, lead capture, email, and presentational components**. Polarity gets normalised so the
  proven "readiness gauge" UI keeps working.

---

## 1. Current state — what actually exists

### 1.1 Two parallel assessment systems

| System | Engine file | UI | API / lead capture | Used by |
|---|---|---|---|---|
| **Flagship (rich)** | `lib/data/dpdpa-assessment.ts` | `app/assessment/SurveyClient.tsx` (1,603 lines) | ✅ `app/api/assessment/route.ts` — full: report token, email, subscriber, consent log, abuse guard | `/assessment` |
| **Industry (legacy)** | `lib/data/assessments.ts` | `components/assessment/AssessmentWizard.tsx` (291 lines) | ❌ **None** — email "Save" just sets local state | `/assessment/ca-firms`, `/recruitment`, `/training-institutes`, `/d2c-brands` |

The CA assessment is on the **legacy** stack.

### 1.2 What the legacy CA flow does today (`/assessment/ca-firms`)

- **7 questions** (`caFirmQuestions`, ids `c1`–`c7`), all **single-select**, scores 0–3, weights 2–3.
  - *Note: the brief refers to an "8-question" assessment — it is actually 7. v2.0 takes it to 10.*
- Scoring (`calculateAssessmentResult`): `Σ(score × weight) / maxPossible × 100` → one percentage,
  then 3 generic bands (`green <33`, `amber <67`, `red`). Sub-scores are cosmetic derivations
  (`applicability = pct+20`, `maturity = 100−pct`, etc.).
- Result screen (`AssessmentWizard`): score bars + **generic, non-CA-specific** recommendations +
  CTAs to `/contact` and `/white-paper`.
- **Lead capture is fake**: the email field calls `setEmailSaved(true)` — **no POST, no DB write,
  no email**. Every CA lead is currently lost. *(This is the single biggest conversion leak.)*

### 1.3 What the flagship engine already gives us (reuse target)

From `lib/data/dpdpa-assessment.ts`:
- `type: "single" | "multi"` questions, `mutuallyExclusive` option ids.
- **Red-flag penalty engine** (`applyRedFlagPenalties`, RF1–RF8) — exactly the pattern the CA
  "override" rules need.
- **6 category scores** (`CategoryScores`) rendered as bars — analogous to the 5 CA buckets.
- **5 verdict bands** (`VERDICT_BANDS`) with colour + description.
- **Action pools**: `IMMEDIATE_ACTION_POOL` + `THIRTY_DAY_ACTION_POOL`, condition-driven, top-3 each.
- Resource/blocker CTA maps.
- `calculateFullResult(answers)` single entry point.

From `app/api/assessment/route.ts` (already model-agnostic enough to reuse):
- Accepts `industry`, `answers`, `result` with `categoryScores`, `redFlagsTriggered`,
  `immediateActions`, `verdictBand`, `finalScore`, etc.
- Writes Appwrite doc, **consent log**, **admin alert**, **subscriber upsert**, **report email**
  with a 90-day **report token**. Honeypot + rate-limit already in place.

### 1.4 The CA *marketing* page (`/industries/ca-firms`)

Solid SEO page already: 5 risk areas, 10-item checklist, 5 FAQs, schema. Advertises **"7 questions,
8 minutes"** and links to `/assessment/ca-firms`. Will need copy + count updates for v2.0.

---

## 2. The polarity decision (most important design call)

The two systems score in **opposite directions**:

- **Flagship engine:** `finalScore` 0–100, **higher = MORE ready (good)**. Bands run
  `0–20 Not Started (red)` → `81–100 Operationally Strong (green)`. The speedometer is green at high.
- **CA v2.0 brief:** `riskScore` 0–100, **higher = WORSE**. `readinessScore = 100 − riskScore`.
  Bands run `0–24 Controlled` → `75–100 Critical Risk`.

**Resolution (recommended):** the CA engine computes **risk** internally (per the brief — additive
risk points, caps, overrides), then exposes **both**:
- `riskScore` (0–100, high = bad) and `riskBand` (`Controlled / Moderate / High / Critical`).
- `readinessScore = 100 − riskScore`, used to **drive the existing readiness gauge / bars**
  (so green = good, no UI rewrite).

The result page shows exactly what the brief's §5 asks:
> **DPDPA Readiness: 32 / 100 · Risk Band: High Risk**

Bucket bars are displayed as **risk status** (High/Moderate/Low) per the brief's §7 table, with the
bar fill = bucket risk %. This honours the brief's language while reusing proven components.

---

## 3. Architecture decision

**Recommendation: dedicated CA engine + reused plumbing/UI.**

| Concern | Decision | Why |
|---|---|---|
| Scoring engine | **New** `lib/data/ca-firm-assessment.ts` | Opposite polarity (risk-additive), bespoke buckets, caps, 5 overrides. Forcing it into `dpdpa-assessment.ts` would entangle the flagship. |
| Question model | New `CAQuestion` type with `bucket`, `cap`, `riskPoints` (per brief §11) | Matches brief's object model exactly. |
| UI client | **New** `app/assessment/ca-firms/CAAssessmentClient.tsx`, reusing extracted presentational components | SurveyClient is 1,603 lines, hard-coupled to `DPDPAAnswers`. A focused CA client is cleaner than parameterising it. |
| Shared UI | **Extract** gauge, category/risk bar, question-card grids, lead form into `components/assessment/shared/` | Avoids copy-paste drift; both flows benefit. |
| API | **Reuse** `/api/assessment` with `industry: "ca-firms"` | Already stores `category_scores_json`, `red_flags_json`, token, email. Minimal/no change. |
| Lead magnet | New "CA Firm DPDPA Starter Checklist" (separate deliverable, Phase 4) | Conversion asset; can ship after the core flow. |

**Alternative considered (rejected for now):** generalise the flagship engine into "industry packs."
More elegant long-term, but higher blast radius on the live flagship and slower to ship. Revisit once
2+ industries are on the rich model.

---

## 4. Data model

### 4.1 Types (`lib/data/ca-firm-assessment.ts`)

```ts
export type CABucket =
  | "client_document"   // PAN/Aadhaar/ITR/bank/payroll/family data
  | "intake"            // WhatsApp/email/shared folders/scans
  | "storage_access"    // Drive/laptops/inboxes/article staff/ex-staff
  | "retention"         // old files kept forever
  | "vendor_incident";  // tax tools/payroll SW/cloud/outsourced/breach

export interface CAOption {
  id: string;
  label: string;
  riskPoints: number;   // additive risk; HIGHER = worse
  badge?: string;
  badgeColor?: "red" | "amber" | "green";
}

export interface CAQuestion {
  id: string;                       // "q1".."q10"
  industry: "ca-firms";
  question: string;
  helpText?: string;
  type: "single" | "multi";
  weight: number;                   // == cap for that question (display only)
  cap: number;                      // max risk points contributed
  bucket: CABucket;
  options: CAOption[];
  purpose?: string;                 // internal note
}

export type CARiskBand = "Controlled" | "Moderate Risk" | "High Risk" | "Critical Risk";

export interface CABucketScores {
  clientDocumentRisk: number;       // 0–100, higher = worse
  documentIntakeRisk: number;
  storageAccessRisk: number;
  retentionDeletionRisk: number;
  vendorIncidentRisk: number;
}

export interface CAResult {
  riskScore: number;                // 0–100 (high = bad)
  readinessScore: number;           // 100 − riskScore (drives gauge)
  band: CARiskBand;
  bandColor: string;
  bandDescription: string;
  bucketScores: CABucketScores;
  bucketStatus: Record<keyof CABucketScores, "Low" | "Moderate" | "High">;
  redFlags: string[];               // human-readable, top 3 shown
  recommendations: string[];        // the brief's 4-control priority list, dynamic
  overridesApplied: string[];       // audit trail of which overrides fired
}
```

### 4.2 The 10-question pack (exact, from brief §4)

| Q | Bucket | Type | Cap | Key risk drivers |
|---|---|---|---|---|
| Q1 Services provided | client_document | multi | 8 | Payroll +5, bookkeeping/CFO +4, "Not sure" +4 |
| Q2 Documents collected | client_document | multi | 14 | Medical/reimbursement +5, payroll +5, Aadhaar +4, bank +4, family +4, "Not sure" +6 |
| Q3 How clients send docs | intake | multi | 12 | Multiple/no standard +8, WhatsApp +6, "Not sure" +6, email +4 |
| Q4 Where docs stored | storage_access | multi | 12 | Multiple/no SSOT +8, WhatsApp +7, "Not sure" +7, laptops +6, pen drives +6 |
| Q5 Who can access | storage_access | single | 12 | Ex-staff not removed +12, "Not sure" +10, most staff +9, articles/interns +7 |
| Q6 Engagement letter/notice | client_document* | single | 10 | No documentation +10, "Not sure" +8, only-on-ask +7 |
| Q7 Retention | retention | single | 12 | Indefinite +12, "Not sure" +10, many years +8 |
| Q8 Vendor control | vendor_incident | single | 8 | Not sure which vendors +8, email/WhatsApp to vendors +6 |
| Q9 Correction/deletion request | retention† | single | 6 | No process +6, "Not sure" +5 |
| Q10 Breach process | vendor_incident | single | 6 | No process +6, "Not sure" +5 |

`*` Q6 measures notice maturity; bucket it under `client_document` (document governance).
`†` Q9 is a data-rights/retention-decision question; bucket under `retention` (retention/rights).
Full option text + per-option `riskPoints` are transcribed verbatim from brief §4 into the file.

### 4.3 Scoring model (brief §5)

```
rawRisk   = Σ over questions of min(cap_q, Σ riskPoints of selected options)
riskScore = clamp(0, 100, round( rawRisk / maxRisk × 100 ))   // maxRisk = Σ caps = 100
```
Because the caps sum to **100** (8+14+12+12+12+10+12+8+6+6), `rawRisk` is already on a 0–100 scale —
`riskScore ≈ rawRisk`. Keep the normalisation formula anyway so cap tweaks stay safe.

```
readinessScore = 100 − riskScore
```

**Bands (by riskScore):**

| riskScore | Band | Color |
|---|---|---|
| 0–24 | Controlled | green |
| 25–49 | Moderate Risk | amber |
| 50–74 | High Risk | orange |
| 75–100 | Critical Risk | red |

**Bucket scores:** for each bucket, `bucketRisk% = round(Σ selected riskPoints in bucket / Σ caps in bucket × 100)`,
clamped 0–100. `bucketStatus`: `<34 Low`, `34–66 Moderate`, `≥67 High`.

### 4.4 Red-flag overrides (brief §6) — applied AFTER band calc

Each override can only **raise** the band (never lower), and appends to `overridesApplied`:

1. **Ex-staff access** — Q5 = "ex-staff not removed" ⇒ min band **High Risk**.
2. **Indefinite retention + high-impact docs** — Q7 = "indefinite" AND Q2 ∈ {PAN, Aadhaar, bank, payroll, family, medical} ⇒ min **High Risk**.
3. **WhatsApp/email intake + no breach process** — Q3 ∈ {WhatsApp, email} AND Q10 = "no process" ⇒ min **High Risk**.
4. **No notice + high-impact docs** — Q6 = "no documentation" AND Q2 ∈ {PAN, Aadhaar, bank, payroll, family} ⇒ min **High Risk**.
5. **Vendor uncertainty** — Q8 = "not sure which vendors" ⇒ min **Moderate Risk**; if combined with Q1 payroll or bookkeeping/CFO ⇒ min **High Risk**.

Implementation: `enforceMinBand(currentBand, minBand)` using an ordinal map
`{Controlled:0, Moderate:1, High:2, Critical:3}`.

### 4.5 Red-flag *messages* (result block 3 — top 3, dynamic)

Generate human-readable flags from the same conditions, ranked by severity, e.g.:
- "Client documents are collected via WhatsApp/email without a standard intake process." (Q3)
- "Old PAN, Aadhaar, ITR and bank records may be retained indefinitely." (Q7+Q2)
- "Article assistants, interns or ex-staff access may not be reviewed regularly." (Q5)
- "Your firm does not have a documented breach-response process." (Q10)
- "It is unclear which vendors or tools store client data." (Q8)

Show **top 3** by a severity weight.

### 4.6 Recommendations (result block 5)

For High/Critical, lead with the brief's four-control priority (verbatim intent):
> "Your first priority is not a long legal policy. Start with four controls: standardise document
> intake, restrict folder access, define client-document retention, and add a breach-response process
> for email, cloud and WhatsApp incidents."

Then append the 2–3 most relevant bucket-specific actions (condition-driven, mirroring the flagship
`ACTION_POOL` pattern). For Controlled/Moderate, soften the lede accordingly.

---

## 5. Result page spec (brief §7)

Reuse extracted components; layout top→bottom:

1. **Headline** — e.g. "Your CA firm may have **High** DPDPA Exposure." (band-driven)
2. **Score** — readiness gauge showing `readinessScore` (green=good) + label
   "**DPDPA Readiness: {readinessScore} / 100 · Risk Band: {band}**".
3. **Top 3 red flags** — dynamic (4.5).
4. **5 CA risk buckets** — risk bars/table with status chips (Low/Moderate/High).
5. **Recommendation block** — four-control priority + tailored actions (4.6).
6. **Lead capture / CTA** (see §6).

---

## 6. Lead capture + API

**Fix the conversion leak.** The CA result must POST to `/api/assessment` (the legacy wizard never did).

- New `CAAssessmentClient` mirrors `SurveyClient`'s gate→email→report mechanic:
  - Show score + buckets first; gate the **full report / checklist** behind email.
  - Fields (brief §8, trimmed for friction): **Name, Firm name, City, Email, Phone/WhatsApp,
    Firm size, Main services (prefill from Q1), Preferred callback time.** Consent checkboxes
    (report delivery / newsletter / follow-up) reuse `SurveyClient` patterns.
  - Honeypot field + existing rate-limit apply automatically (same endpoint).
- **API payload** (reuse existing fields — no schema change required):
  - `industry: "ca-firms"`, `report_type: "ca-firm"`, `answers` (CA answer map),
  - `result.finalScore = readinessScore`, `result.verdictBand = band`,
  - `result.categoryScores = bucketScores`, `result.redFlagsTriggered = redFlags`,
  - `result.immediateActions = recommendations`.
  - Optionally add `ca_risk_score`, `ca_bucket_status_json` — **only if** we want them queryable;
    otherwise they ride inside `answers_json` / `category_scores_json`. *(Confirm Appwrite collection
    has spare attributes before adding columns — see Open Decisions.)*
- **Primary CTA:** "Get a CA Firm DPDPA Gap Review" → `/contact` (fires `call_clicked`).
  Supporting line per brief §8.

---

## 7. Lead magnet — "CA Firm DPDPA Starter Checklist" (Phase 4)

8-section checklist (brief §9): intake · PAN/Aadhaar/bank handling · Drive/OneDrive access ·
article/intern access · engagement-letter privacy clause · vendor/software access · retention ·
breach response. Produced as a branded `.docx`/PDF in `public/templates/` (matches existing
`templates/` assets) and delivered via the report email. Generation reuses the `docx` skill +
existing template-build tooling (`docs/_build_docx.py`, `TEMPLATE_DOWNLOAD_PLAN.md`).

---

## 8. Marketing page updates (`/industries/ca-firms`)

- Update sidebar + CTA copy: **"10 questions · ~3 minutes"** (align with the 3–5 min site standard;
  the launch plan already flagged the stale "8 min" text).
- Add the positioning line from brief §10 near the hero/assessment CTA.
- Keep existing risk areas, checklist, FAQ, schema. Optionally add 1–2 FAQs on
  WhatsApp intake and ex-staff access (the two sharpest CA hooks).
- `lib/cta-copy.ts` → `industryAssessmentCopy["ca-firms"].href` currently points to `/assessment`;
  point it to `/assessment/ca-firms` (the dedicated flow) and refresh body copy.

---

## 9. Implementation plan (phased, file-by-file)

**Branch:** `ca-assessment-v2` (preview-first per deployment-pipeline rules; never push straight to main).

### Phase 0 — Scaffolding & shared components (no behaviour change)
- Extract presentational pieces from `SurveyClient.tsx` into `components/assessment/shared/`:
  `ReadinessGauge`, `RiskBar`, `QuestionCardGrid`, `QuestionMultiCards`, `LeadCaptureForm`.
- Refactor `SurveyClient` to import them (verify flagship `/assessment` still works identically).
- *Gate:* `npm run build` clean + manual flagship run unchanged.

### Phase 1 — CA engine (pure TS, fully unit-testable)
- `lib/data/ca-firm-assessment.ts`: types, 10-question pack (verbatim), `calculateCAResult(answers)`,
  caps, normalisation, bands, bucket scores, 5 overrides, red-flag messages, recommendations.
- Unit tests (`lib/data/__tests__/ca-firm-assessment.test.ts` or a scratch script): all-best,
  all-worst, each override in isolation, cap enforcement, band boundaries (24/25/49/50/74/75).
- *Gate:* tests pass; no UI yet.

### Phase 2 — CA client UI
- `app/assessment/ca-firms/CAAssessmentClient.tsx` (multi-select + single, progress, gate, result).
- Rewrite `app/assessment/ca-firms/page.tsx` to render `CAAssessmentClient` (drop `AssessmentWizard`).
- Result page per §5; wire readiness gauge to `readinessScore`.
- *Gate:* build clean; full CA run start→10Q→gate→result renders correctly on preview.

### Phase 3 — Lead capture + API wiring
- POST to `/api/assessment` with `industry:"ca-firms"` payload (§6); report token + email + admin
  alert + subscriber upsert verified end-to-end on preview.
- Update `/industries/ca-firms` copy + `cta-copy.ts` href (§8).
- *Gate:* a real submission writes an Appwrite doc, fires admin alert, sends report email.

### Phase 4 — Lead magnet (parallelisable)
- Build "CA Firm DPDPA Starter Checklist" asset; attach to report email; add download CTA.

### Phase 5 — QA, analytics, ship
- GA4 events (`assessmentStart`, step milestones, `survey_complete`, `call_clicked`) for the CA flow.
- Verify, screenshot, then merge `ca-assessment-v2` → main; confirm Vercel route count grew.

---

## 10. Test matrix (must pass before merge)

| Layer | Check |
|---|---|
| Scoring | All-best → Controlled; all-worst → Critical; caps never exceeded; readiness = 100−risk |
| Overrides | Each of the 5 fires correctly and only raises the band; `overridesApplied` audit correct |
| Buckets | Bucket % math + status thresholds (33/34, 66/67) correct |
| Multi-select | "Not sure" mutual-exclusivity enforced where specified |
| UI | 10 questions navigable, back/next state preserved, gate shows score before email |
| Lead | POST succeeds; Appwrite doc written; admin alert + report email delivered; honeypot/rate-limit intact |
| Regression | Flagship `/assessment` + other 3 industry pages unchanged |
| SEO/meta | CA pages keep `noindex` on the assessment route as today; marketing page schema intact |
| Build | `npm run build` clean; route count increases post-deploy |

---

## 11. Risks & open decisions

**Risks**
- Extracting components from the 1,603-line `SurveyClient` risks regressing the live flagship → do it
  first, in isolation, with a manual flagship run as the gate (Phase 0).
- Appwrite attribute limits: confirm spare columns before adding `ca_*` fields; otherwise nest in
  existing JSON blobs.
- Polarity confusion (risk vs readiness) is the most likely source of bugs → engine returns both and
  is unit-tested at boundaries.

**Decisions locked (2026-06-07)**
1. ✅ **Engine approach:** Dedicated CA engine (`lib/data/ca-firm-assessment.ts`).
2. ✅ **Question count:** Lock at **10**; retire the legacy 7-question `caFirmQuestions`.
3. ✅ **Scope:** **CA first, then roll the v2.0 pattern to recruitment / training / D2C.**
   → *Design implication:* build the CA engine + extracted components so a later "industry pack"
   generalisation is a small step, not a rewrite. Keep CA scoring data-driven (question pack +
   bucket map + override list as data), so a second industry = a second pack, not new logic.
4. ✅ **Lead-form length:** Trimmed **4–5 fields** (Name, Firm, Email, Phone/WhatsApp; services
   prefilled from Q1). City / firm size / callback time dropped for completion rate.

**Still open**
5. **New Appwrite columns** for `ca_risk_score` / bucket status, or keep everything in existing JSON?
   (Default: keep in existing `answers_json` / `category_scores_json` unless you want them queryable.)

---

## Appendix A — Files touched

| Action | Path |
|---|---|
| New | `lib/data/ca-firm-assessment.ts` |
| New | `app/assessment/ca-firms/CAAssessmentClient.tsx` |
| New | `components/assessment/shared/*` (extracted) |
| New | `public/templates/ca-firm-dpdpa-starter-checklist.*` |
| Edit | `app/assessment/ca-firms/page.tsx` (swap engine/UI) |
| Edit | `app/industries/ca-firms/page.tsx` (copy, count, positioning line) |
| Edit | `lib/cta-copy.ts` (CA href + body) |
| Edit | `app/assessment/SurveyClient.tsx` (import shared components) |
| Reuse | `app/api/assessment/route.ts` (payload only; minimal/no change) |
| Retire | `caFirmQuestions` in `lib/data/assessments.ts` (once CA is migrated) |
