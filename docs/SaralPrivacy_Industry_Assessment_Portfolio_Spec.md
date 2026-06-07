# SaralPrivacy — Industry Assessment Portfolio · Master Spec & Implementation Plan

**Owner:** Dilip Sahu · **Product:** SaralPrivacy (saralprivacy.com)
**Status:** Draft for build · **Last updated:** 2026-06-07
**Audience:** Internal (developer + founder) build spec.
**Supersedes:** `SaralPrivacy_CA_Assessment_v2_Spec.md` (CA is now the reference pack inside this portfolio).

> Strategic frame: this is a **SaralPrivacy Industry Assessment Portfolio** — one reusable engine,
> many industry "packs." CA Firms is the flagship wedge and reference implementation.
> Positioning per pack stays sharp and native (CA: *"Most CA firms don't have a tax knowledge
> problem. They have a client-document control problem."*).

---

## 0. TL;DR

- Today all four live assessments (`/assessment/{ca-firms,recruitment,training-institutes,d2c-brands}`)
  run the **thin legacy engine** and **lose every lead** (email capture is fake — no POST/DB/email).
  Fixing capture + scoring matters more than adding questions.
- Build **one reusable engine** ("industry packs") with a **hybrid scoring model** (decisions below),
  ship **CA v2.0** on it as the reference, prove conversion, then upgrade the other 3 and expand to a
  **12-industry portfolio**.
- The **deep diagnostic (18–25 Q)** is deferred until the 10-Q quick scan converts.

### Locked decisions (2026-06-07)

| # | Decision |
|---|---|
| 1 | **Engine:** Reusable industry-pack engine (`lib/data/industry-assessment/`), with CA as the first pack. |
| 2 | **Scoring math:** **Hybrid composite** — additive risk points + caps + red-flag band overrides; **multipliers dropped**; two-lens reporting (Exposure vs Control). Per-piece rationale in §4. |
| 3 | **Sequence:** Reusable engine + CA first → prove → upgrade Recruitment/Training/D2C → add 5–12. |
| 4 | **Deep diagnostic:** Defer to a later tier; v1 ships the 10-Q quick scan only. |
| 5 | **Lead form:** Trimmed 4–5 fields (Name, Firm, Email, Phone/WhatsApp; services prefilled). |
| 6 | **Question count:** 10 per quick-scan pack; retire legacy 7/8-Q sets as each is migrated. |
| 7 | **Polarity:** Engine computes **risk**; UI shows **readiness (100−risk)** on the green gauge + a **risk-band label**. One band system only. |

---

## 1. Current state

### 1.1 Two engines exist; industries are on the weak one

| System | Engine | UI | Lead capture | Used by |
|---|---|---|---|---|
| **Flagship (rich)** | `lib/data/dpdpa-assessment.ts` | `app/assessment/SurveyClient.tsx` (1,603 ln) | ✅ full (`/api/assessment`: token, email, subscriber, consent log, abuse guard) | `/assessment` |
| **Industry (legacy)** | `lib/data/assessments.ts` | `components/assessment/AssessmentWizard.tsx` (291 ln) | ❌ **fake** — `setEmailSaved(true)`, no POST | all 4 industry assessments |

**Consequence:** CA (7 Q), Recruitment (8 Q), Training (7 Q), D2C (8 Q) are all single-select,
generic-scored, no buckets, no overrides, **and every completed assessment leaks the lead.**

### 1.2 Reuse assets already in the codebase

- Flagship engine patterns: `multi`/`single` + `mutuallyExclusive`; red-flag penalty engine (RF1–RF8);
  6 category scores; 5 verdict bands; action pools; **`deriveDataExposure` / `deriveControlMaturity` /
  `deriveOperationalReadiness`** (← our two-lens reporting, already built).
- API `app/api/assessment/route.ts` already stores `category_scores_json`, `red_flags_json`,
  `verdict_band`, `report_token`, sends report email, upserts subscriber, logs consent, honeypot + rate-limit.
- Templates pipeline (`public/templates/`, `docs/_build_docx.py`, `TEMPLATE_DOWNLOAD_PLAN.md`) for lead magnets.

---

## 2. Strategy — the 12-industry portfolio

Lock the first 12 (build as a roadmap behind the reusable engine, **not** 12 bespoke builds at once):

| # | Industry | Primary risk theme | Phase |
|---|---|---|---|
| 1 | **CA Firms** | PAN/Aadhaar/ITR/bank/payroll, Drive, WhatsApp, article-staff access | **P1 (now)** |
| 2 | Recruitment & Staffing | CV sourcing, client sharing, ATS, BGV, rejected-candidate retention | P2 |
| 3 | Training Institutes / Coaching | Students, parents, **minors**, WhatsApp groups, LMS, photos, placement | P2 |
| 4 | D2C Brands | WhatsApp/SMS/email marketing, Meta Pixel, cart abandonment, logistics vendors | P2 |
| 5 | Clinics & Diagnostic Labs | Patient reports, prescriptions, **health data**, WhatsApp report sharing | P3 ⚠ |
| 6 | Schools & Colleges | **Children's data**, parents, CCTV, school apps, transport | P3 ⚠ |
| 7 | Law Firms & Legal Consultants | Client identity, case files, evidence, juniors/interns | P3 |
| 8 | Real Estate Brokers & Property | Buyer/tenant KYC, PAN/Aadhaar, agreements, lead sharing | P3 |
| 9 | Hotels, Hospitality & Travel | Guest IDs, passports, booking history, OTA sharing | P4 |
| 10 | Pharmacies / Online Pharmacies | Prescriptions, medicine history, **health indicators** | P4 ⚠ |
| 11 | Fintech / NBFC / Digital Payments | **KYC/PAN/Aadhaar/bank**, UPI, profiling, collection agents | P4 ⚠ |
| 12 | Gyms, Salons & Spas | Membership, **health/fitness**, photos, appointment apps | P4 |

⚠ = elevated legal sensitivity (health / children / KYC; DPDPA SDF + children provisions). These packs
need extra legal-review framing and softer, defensible wording. They are deliberately later phases.

**Per-pack skeleton (identical for all 12):** positioning → who should take it → 10 questions + options
→ scoring weights/caps → red-flag overrides → 5 risk buckets → result-page copy → CTA → remediation
checklist (lead magnet).

---

## 3. Reusable engine — architecture

**`lib/data/industry-assessment/`**
```
core.ts          // types + calculateIndustryResult(pack, answers) — pure TS, pack-agnostic
bands.ts         // shared risk bands + override ordinal logic
packs/
  ca-firms.ts        // reference pack (full, §5)
  recruitment.ts     // P2
  training.ts        // P2
  d2c.ts             // P2
  ...                // P3/P4 packs
index.ts         // pack registry { [industry]: IndustryPack }
```
A new industry = **a new pack file** (data), not new engine logic. The pack carries its own buckets,
questions, override rules, bucket map, and copy.

### 3.1 Types

```ts
export type BandLabel = "Controlled" | "Moderate Risk" | "High Risk" | "Critical Risk";

export interface IAOption { id: string; label: string; riskPoints: number; badge?: string; badgeColor?: "red"|"amber"|"green"; }

export interface IAQuestion {
  id: string;                 // "q1".."q10"
  question: string;
  helpText?: string;
  whyThisMatters?: string;    // collapsible note in UI
  type: "single" | "multi";
  cap: number;                // max risk points this Q can contribute
  bucket: string;             // pack-defined bucket key
  badge: string;              // category badge shown in UI
  layer: "exposure" | "control"; // for two-lens reporting (§4)
  mutuallyExclusive?: string[];  // e.g. ["not-sure"]
  options: IAOption[];
}

export interface IABucket { key: string; label: string; meaning: string; }

export interface IAOverride {
  id: string;
  minBand: BandLabel;                          // can only RAISE the band
  test: (a: IAAnswers) => boolean;
  flag: string;                                // human-readable red flag if triggered
  severity: number;                            // ranking weight for "top 3"
}

export interface IndustryPack {
  industry: string;            // "ca-firms"
  route: string;               // "/assessment/ca-firms"
  positioning: { hero: string; sub: string; cta: string; chips: string[] };
  buckets: IABucket[];         // exactly 5
  questions: IAQuestion[];     // 10
  overrides: IAOverride[];
  recommend: (r: IAResult, a: IAAnswers) => string[]; // dynamic remediation
  leadMagnet?: { title: string; href: string };
}

export interface IAResult {
  riskScore: number;           // 0–100, high = bad
  readinessScore: number;      // 100 − risk (drives gauge)
  band: BandLabel;
  bandColor: string;
  // Two-lens reporting (§4):
  dataExposure: number;        // inherent risk lens
  controlMaturity: number;     // safeguard lens
  bucketScores: Record<string, number>;             // 0–100 risk per bucket
  bucketStatus: Record<string, "Low"|"Moderate"|"High">;
  redFlags: string[];          // top 3 by severity
  overridesApplied: string[];
  recommendations: string[];
}
```

---

## 4. Scoring — final hybrid composite ("you decide per-piece")

You asked me to assemble the engine from both models. Here is the locked composite, piece by piece:

| Piece | Decision | Why this over the alternative |
|---|---|---|
| **Base score** | **Additive** risk points + per-question `cap` (Model A) | Transparent and debuggable; a CA can see *why* they scored. Multiplicative chains can't be explained. |
| **Normalisation** | `riskScore = clamp(0,100, round(rawRisk / Σcaps × 100))` | Caps already sum to 100 for CA, but formula keeps cap edits safe. |
| **Multipliers (×1.30, ×1.25…)** | **Dropped** | They compound unpredictably and are hard to QA. Their *intent* — "force a worse verdict" — is delivered more cleanly by overrides below. |
| **Red-flag overrides** | **Kept**; each can only **raise** the band (`enforceMinBand`) | Operational gaps (ex-staff access, minors-without-consent) must beat the math. Auditable via `overridesApplied`. |
| **Two-layer model (Model B)** | **Kept as additive sub-scores**, not multiplication | `dataExposure` = Σ exposure-layer Qs (services, data types, volume); `controlMaturity` = Σ control-layer Qs (access, notice, retention, vendor, rights, breach). This *is* "inherent risk vs control maturity," computed additively. Reuses the flagship's existing derivations. |
| **Bands** | **Risk bands only**: Controlled 0–24 · Moderate 25–49 · High 50–74 · Critical 75–100 | Pick ONE band set. The "Mature/readiness 0–39…90–100" set is dropped to avoid the inverted-band contradiction. |
| **Display** | Show **readiness number** (100−risk) on the green gauge **+ risk-band label** | "DPDPA Readiness: 32/100 · Risk Band: High Risk" — intuitive, and the green gauge UI stays correct. |

**Pipeline:** `rawRisk → riskScore → band → apply overrides (raise only) → readiness, sub-scores,
buckets, top-3 flags, recommendations`.

This gives the credibility of a two-layer model and the "auto-High-Risk" punch of multipliers, while
staying additive and explainable.

---

## 5. Question & option conventions (portfolio standard)

Default patterns (your guidance, adopted with one caveat):

| Question type | Options | UI |
|---|---|---|
| Compliance / control | 4 (ladder) | Single-select cards |
| Maturity | 4 (ladder) | Ladder cards |
| Volume / scale | 5 | Segmented cards |
| Retention period | 5 | Single-select cards |
| Data category | 6–10 | Multi-select chips |
| Vendor / tool / channel / storage | 6–12 | Multi-select chips |

**Universal control-maturity ladder** (powers ~60–70% of single-selects):
`Yes, documented & followed` (0) · `Partially / informal` (mid) · `No, not in place` (high) ·
`Not sure / not reviewed` (mid-high).

**Caveat (important):** the **4-option ladder is the default for un-designed questions only.** Where a
pack has bespoke 5–6 option ladders (CA Q5/Q6/Q7 add an "only when asked / for convenience / not sure"
rung that carries real signal), **the bespoke set wins.** Don't flatten CA v2.0 to 4 options.

---

## 6. Industry packs

### 6.1 CA Firms — reference pack (full)

The complete CA v2.0 questionnaire, options, per-option risk points, caps, 5 overrides, 5 buckets,
result copy, CTA, and lead magnet are specified in the prior doc and carried verbatim into
`packs/ca-firms.ts`. Summary:

- **Buckets:** `client_document` · `intake` · `storage_access` · `retention` · `vendor_incident`.
- **10 Q / caps (Σ=100):** Q1 services 8 · Q2 docs 14 · Q3 intake 12 · Q4 storage 12 · Q5 access 12 ·
  Q6 notice 10 · Q7 retention 12 · Q8 vendor 8 · Q9 rights 6 · Q10 breach 6.
- **Layer tags:** exposure = Q1,Q2 (+intake Q3); control = Q5,Q6,Q7,Q8,Q9,Q10; Q4 storage = control.
- **Overrides (raise-only):** ex-staff access → High · indefinite retention + high-impact docs → High ·
  WhatsApp/email intake + no breach process → High · no notice + high-impact docs → High ·
  vendor-uncertainty → Moderate (→ High if payroll/bookkeeping).
- **Lead magnet:** "CA Firm DPDPA Starter Checklist" (8 sections).

### 6.2 Other live packs — *gap deltas* to author in P2

Each gets the full 10-Q/buckets/overrides treatment; the **net-new** elements vs today:

**Recruitment** — buckets: candidate_data · sourcing · sharing_bgv · ats_vendor · retention_rights.
Add: candidate source (multi), notice-before-CV-storage, **CV shared to client without notice/consent**,
BGV sensitive docs (multi), AI screening disclosure, rejected-candidate retention.
Overrides → High: CV shared without notice · BGV docs kept with no retention limit · AI screening
undisclosed · indefinite candidate retention.

**Training Institutes** — buckets: student_minor_data · consent_notice · media_marketing · vendor_lms ·
retention_rights. Add: age group (5-band), **verifiable parental consent for minors**, student
photos/videos for marketing, WhatsApp-group exposure, LMS/edtech vendors (multi), placement sharing.
Overrides → High: **<18 enrolled + no parental-consent mechanism** (the signature override) ·
photos/videos used for marketing without consent · LMS vendor with no terms.

**D2C** — buckets: customer_data · marketing_consent · adtech_tracking · vendor_logistics ·
retention_rights. Add: store platform, adtech/pixel stack (multi), separate marketing consent,
WhatsApp/SMS opt-in proof, payment/logistics vendors (multi), marketplace data, children's products.
Overrides → High: marketing without opt-in · no unsubscribe/preference centre · pixels with no notice ·
admin accounts without MFA.

### 6.3 Packs 5–12 — author in P3/P4 using the same skeleton; ⚠ packs get legal review.

---

## 7. CA UI v2 — blueprint (reference UI for all packs)

Route `/assessment/ca-firms`, title **"CA Firm DPDPA Risk Scan."** One question per screen, premium feel.

**Component tree**
```
CAAssessmentPage
 ├─ AssessmentHero (hero line + sub + Start CTA)
 ├─ TrustChips (PAN · Aadhaar · ITR · Bank Statements · Payroll · Google Drive · WhatsApp · Article Staff · Old Files)
 ├─ ProgressBar (Question X of 10 + bucket name)
 ├─ QuestionCard
 │   ├─ CategoryBadge
 │   ├─ OptionCard[] (single radio / multi checkbox)
 │   ├─ WhyThisMatters (collapsible)
 │   └─ MicroFeedback (contextual note on risky answers)
 ├─ ResultScoreCard (readiness gauge + risk-band label)
 ├─ RiskBucketMap (5 buckets · status · meaning)
 ├─ RedFlagList (top 3)
 ├─ RecommendationCard (4-control priority)
 └─ LeadCaptureCTA (gmap review + checklist download)
```
These become **shared** components (`components/assessment/shared/`) reused by every pack.

**Micro-feedback (makes it feel intelligent):** e.g. selecting WhatsApp in Q3 →
*"Many CA firms use WhatsApp for convenience. Risk starts when documents stay scattered without access,
deletion or breach controls."* Selecting ex-staff access in Q5 →
*"This is a serious control gap. Former-staff access to client files can create high DPDPA exposure."*

**Brand:** Navy `#121A2E` · Verification Green `#07B981` · Signal Gold `#E8AB42` · Cloud `#F7F9FC` ·
Slate `#334155` · Muted `#94A3B8` · Teal `#35B6AE`. Light/clean, white cards, green = safe/progress,
gold = moderate, deep red = severe only. Minimal line icons. **Mobile-first**, no sidebars on mobile,
sticky bottom CTA only after the result.

---

## 8. Result page spec

Top→bottom: **Headline** (band-driven) → **Score** (readiness gauge + "Readiness X/100 · Risk Band:
…") → **two-lens mini-bars** (Data Exposure vs Control Maturity) → **Top 3 red flags** (dynamic) →
**5 risk buckets** (status chips + meaning) → **Recommendation** (4-control priority + tailored
actions) → **Lead capture / CTA**.

---

## 9. Lead capture + API (fixes the portfolio-wide leak)

- New pack-driven client POSTs to **`/api/assessment`** with `industry`, `report_type` (e.g. `ca-firm`),
  `answers`, and `result` mapped to existing fields:
  `finalScore=readinessScore`, `verdictBand=band`, `categoryScores=bucketScores`,
  `redFlagsTriggered=redFlags`, `immediateActions=recommendations`.
- **Form (4–5 fields):** Name, Firm name, Email, Phone/WhatsApp, Main services (prefilled from Q1).
  Consent checkboxes (report / newsletter / follow-up) reuse `SurveyClient` patterns. Honeypot +
  rate-limit inherited from the endpoint.
- **Gate mechanic:** show score + buckets first; gate the full report + checklist behind email
  (matches flagship, which the launch plan confirms is the agreed pattern).
- **Primary CTA:** "Get a CA Firm DPDPA Gap Review" → `/contact` (fires `call_clicked`).
- Keep CA `ca_*` fields inside existing JSON blobs unless we decide to make them queryable
  (open decision #2 below).

---

## 10. Lead magnets

CA: "CA Firm DPDPA Starter Checklist" (8 sections) as branded `.docx`/PDF in `public/templates/`,
delivered via report email + a download CTA. Each later pack ships its own checklist using the
existing template build tooling. Phase 4 per pack (parallelisable).

---

## 11. Implementation plan

**Branch:** `industry-assessment-engine` (preview-first; never push straight to main; check route count grows post-deploy).

### Phase 0 — Shared components (no behaviour change)
Extract from `SurveyClient.tsx` into `components/assessment/shared/`: `ReadinessGauge`, `MiniBar`/`RiskBar`,
`QuestionCard`, `OptionCard`, `WhyThisMatters`, `MicroFeedback`, `ProgressBar`, `LeadCaptureForm`,
`RiskBucketMap`, `RedFlagList`, `RecommendationCard`. Refactor `SurveyClient` to import them; verify the
flagship `/assessment` is byte-for-byte unchanged in behaviour. *Gate:* `npm run build` clean + manual flagship run.

### Phase 1 — Reusable engine + CA pack (pure TS, fully tested)
`lib/data/industry-assessment/{core,bands,index}.ts` + `packs/ca-firms.ts`. `calculateIndustryResult`
implements §4 pipeline. Unit tests: all-best→Controlled, all-worst→Critical, each override in isolation,
cap enforcement, band boundaries (24/25/49/50/74/75), two-lens sub-scores, bucket math + status thresholds. *Gate:* tests pass.

### Phase 2 — CA client UI + result page
`app/assessment/ca-firms/CAAssessmentClient.tsx` (one-Q-per-screen, multi+single, micro-feedback,
gate, result per §7–8). Swap `app/assessment/ca-firms/page.tsx` to render it (drop `AssessmentWizard`).
*Gate:* build clean; full CA run renders on preview.

### Phase 3 — Lead capture + marketing copy
Wire POST to `/api/assessment` (`industry:"ca-firms"`); verify Appwrite doc + admin alert + report
email end-to-end on preview. Update `/industries/ca-firms` copy ("10 questions · ~3 min", positioning
line) and `lib/cta-copy.ts` href → `/assessment/ca-firms`. *Gate:* real submission writes + emails.

### Phase 4 — CA lead magnet
Build "CA Firm DPDPA Starter Checklist"; attach to report email + download CTA.

### Phase 5 — QA, analytics, ship CA
GA4 events for the CA flow (`assessmentStart`, step milestones, `survey_complete`, `call_clicked`);
verify; merge to main; confirm route count grew.

### Phase 6+ — Roll the pattern (after CA proves out)
Author `packs/{recruitment,training,d2c}.ts` (§6.2 deltas) → each is a pack file + a thin page swap.
Then P3/P4 packs (⚠ legal review for health/children/KYC). Retire legacy `assessments.ts` +
`AssessmentWizard.tsx` once all four industries are migrated.

---

## 12. Test matrix (per pack, before merge)

| Layer | Check |
|---|---|
| Scoring | all-best→Controlled; all-worst→Critical; caps never exceeded; readiness=100−risk |
| Two-lens | exposure vs control sub-scores correct from layer tags |
| Overrides | each fires correctly, only raises band, `overridesApplied` accurate |
| Buckets | % math + status thresholds (33/34, 66/67) |
| Multi-select | "Not sure" mutual-exclusivity enforced |
| UI | 10 Q navigable, state preserved, micro-feedback fires, gate shows score before email |
| Lead | POST succeeds; Appwrite doc; admin alert + report email; honeypot/rate-limit intact |
| Regression | flagship `/assessment` + un-migrated industry pages unchanged |
| SEO/meta | assessment routes keep `noindex` as today; marketing-page schema intact |
| Build | `npm run build` clean; route count increases post-deploy |

---

## 13. Risks & open decisions

**Risks**
- Extracting components from the 1,603-line `SurveyClient` could regress the live flagship → Phase 0 in
  isolation with a manual flagship run as the gate.
- Polarity confusion (risk vs readiness) → engine returns both, unit-tested at boundaries.
- ⚠ packs (health/children/KYC) carry legal-wording risk → legal review before publishing those.
- Portfolio ambition could delay the CA wedge → CA ships fully (P1–P5) before any new industry.

**Open decisions (need your call)**
1. **Deep-diagnostic shape** — when we do build it (deferred for now), is it a second gated tier on the
   same page, or a separate authenticated flow? (Decide at P6+.)
2. **Queryable CA columns** — add `ca_risk_score` / bucket-status Appwrite attributes, or keep in
   existing JSON blobs? (Default: JSON unless you want admin filtering/reporting.)
3. **Volume question** — add an optional "individuals' data per year" 5-band Q to each pack for a
   sharper exposure lens? (Adds 1 Q; improves inherent-risk signal. Recommend: yes, as Q0/optional.)
