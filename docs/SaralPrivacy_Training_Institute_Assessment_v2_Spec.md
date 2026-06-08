# SaralPrivacy — Training Institute DPDPA Assessment v2.0 — Build Spec

**Status:** Locked — ready to build
**Date:** 2026-06-07
**Owner:** Dilip Sahu
**Engine:** Shared `lib/data/industry-assessment/` (zero engine changes) — Training is a new pack
**Reference implementation:** CA Firms (`/assessment/ca-firms`, design review 8.6/10)
**Design review:** 8.25/10 → PROCEED (this doc + locked decisions resolve all <7 notes)

---

## 0. Positioning

**Route:** `/assessment/training-institutes`
**Report type:** `training-institute`

**Hero:** "Your institute does not just teach students. It collects, shares and stores student data every day."

**Sub:** From enquiry forms and admission records to WhatsApp groups, parent phone numbers, student photos, LMS tools, attendance data, fee records and placement profiles — training institutes handle personal data at every step. Take this 3-minute scan to find where DPDPA exposure may arise in your student-data workflows.

**CTA:** Start Training Institute Risk Scan

**Trust chips:** Student Data · Parent Details · Minors · WhatsApp Groups · LMS Tools · Student Photos · Testimonials · Attendance · Fee Records · Placement Data

**Audience:** Coaching/tuition centres, test-prep, vocational institutes, certification providers, EdTech academies, skill-development centres, hybrid offline-online training businesses.

**Core thesis:** Institutes don't fail privacy for lack of intent — they fail because student data flows through too many informal channels (enquiry forms, Google Forms, WhatsApp, parent numbers, photos, LMS, attendance apps, fee records, placement resumes, counsellor spreadsheets). The scan makes the user realise: *"Our DPDPA risk is not only in our website privacy policy. It is inside our admission, classroom, WhatsApp, marketing, LMS and placement workflows."*

---

## 1. Locked decisions (this session)

| # | Decision | Rationale |
|---|----------|-----------|
| D1 | **Shared engine + new pack** (`packs/training-institutes.ts`); zero engine changes | Engine normalizes by Σ pack caps at runtime → 110-total works automatically. All industry logic lives in the pack. |
| D2 | **`age_not_recorded` treated as minors-present** for override logic | Closes the biggest false-negative — an institute that can't identify minors should still trigger minor escalations. |
| D3 | **Lead form trimmed to 5 fields** | Name, Institute name, Email, Phone/WhatsApp, City. Type (Q1) + minors (Q3) already captured in the scan → no re-asking. Matches CA + lean principle. |
| D4 | **Two-lens mapping** — exposure = Q1, Q2, Q3, Q8 · control = Q4, Q5, Q6, Q7, Q9, Q10 | Powers the Data-Exposure vs Control-Maturity bars. |
| D5 | **Q4 gains a verifiable-consent tier** (single-select; max option still 12 → 110 math intact) | DPDPA requires *verifiable* parental consent; documented ≠ verifiable. |
| D6 | **Tracking / targeted ads at minors (Section 9(3)) deferred to deep diagnostic** | Keeps the 10-Q TOFU lean; logged so it isn't lost. |
| D7 | **Route = `/assessment/training-institutes`**; band keys map to engine `Controlled/Moderate/High/Critical` | Matches existing `cta-copy.ts` key `"training-institutes"`. |
| D8 | **Result risk-map renders 4-tier bucket band** off raw `bucketScores` (UI choice; no engine change) | Mock shows Critical buckets; engine's built-in status is 3-tier. |
| D9 | **Email guard** — `report_type === "training-institute"` → `categoryScores: undefined` | Different bucket keys would render NaN in the general email scorecard (same trap CA hit). |

⏳ **Copy gate:** confirm DPDP Rules 2025 wording on "verifiable parental consent" before the Q4 option string + recommendation copy ship.

---

## 2. Risk buckets (5)

| Key | Label | Meaning (result risk-map) |
|-----|-------|---------------------------|
| `student_data_collection` | Student data collection risk | Student/parent data may be collected across too many informal channels |
| `minor_parental_consent` | Minor & parental consent risk | Students below 18 may require stronger consent evidence and safeguards |
| `communication_marketing` | Communication & marketing risk | WhatsApp groups, photos, testimonials or recordings may create exposure |
| `lms_vendor_platform` | LMS, vendor & platform risk | Tools and partners may process student data without enough review |
| `retention_rights` | Retention & rights readiness risk | Old student records may be retained without a defined policy |

---

## 3. The 10 questions (with scoring, caps, bucket, layer)

> Engine reads `riskPoints` per option, caps the per-question sum at `cap`, sums across questions, normalizes by Σ caps (= 110), → riskScore 0–100.

### Q1 — Institute Profile · `student_data_collection` · **exposure** · multi · cap 8
*What type of training business do you run?* — *Select all that apply.*

| Option | id | Risk |
|---|---|---|
| Coaching centre / tuition centre | `coaching_tuition` | 2 |
| Test-prep institute | `test_prep` | 3 |
| Professional certification / upskilling | `professional_certification` | 2 |
| Vocational / skill-development centre | `vocational` | 2 |
| EdTech / online course platform | `edtech` | 4 |
| Hybrid offline + online | `hybrid` | 4 |
| School/college-linked training programme | `school_college_linked` | 4 |
| Corporate training provider | `corporate_training` | 2 |
| Other | `other` | 1 |
| Not sure | `not_sure` | 4 |

### Q2 — Student Data Risk · `student_data_collection` · **exposure** · multi · cap 14
*Which student or parent data do you collect?*

| Option | id | Risk |
|---|---|---|
| Student name, phone, email | `student_contact` | 2 |
| Parent/guardian name & phone | `parent_contact` | 3 |
| Age, class, school/college, education details | `education_details` | 3 |
| Address / location | `address_location` | 3 |
| ID proof / documents | `id_documents` | 4 |
| Marks, test scores, attendance, performance | `performance_data` | 4 |
| Fee receipts, payment status, instalments | `payment_data` | 3 |
| Photos, videos, classroom recordings | `photos_videos` | 5 |
| Health, disability, special-need, emergency contact | `health_disability` | 6 |
| Resume, placement profile, career data | `placement_data` | 4 |
| Other student data | `other` | 1 |
| Not sure | `not_sure` | 6 |

### Q3 — Minor Student Risk · `minor_parental_consent` · **exposure** · single · cap 12
*Do you enrol students below 18 years of age?*

| Option | id | Risk |
|---|---|---|
| No, all students 18+ | `no_all_adults` | 0 |
| Yes, some below 18 | `some_minors` | 8 |
| Yes, most below 18 | `mostly_minors` | 12 |
| We don't consistently record student age | `age_not_recorded` | 10 |
| Not sure | `not_sure` | 10 |

### Q4 — Parent / Guardian Consent · `minor_parental_consent` · **control** · single · cap 12
*If students below 18 are enrolled, how do you obtain parent or guardian consent?*

| Option | id | Risk |
|---|---|---|
| **Verifiable consent — we confirm the consenter is the parent/guardian + record at admission** | `verifiable_consent` | 0 |
| **Documented at admission, but consenter not separately verified** *(new tier — D5)* | `documented_not_verifiable` | 3 |
| Informal (WhatsApp/email) | `informal_consent` | 4 |
| Parents aware, not documented | `parents_aware_not_documented` | 8 |
| No specific process for minors | `no_specific_process` | 12 |
| Not applicable — no minors | `not_applicable` | 0 |
| Not sure | `not_sure` | 10 |

### Q5 — Admission & Enquiry Intake · `student_data_collection` · **control** · multi · cap 10
*How do students/parents usually share admission, enquiry or fee info?*

| Option | id | Risk |
|---|---|---|
| Website / structured admission portal | `website_portal` | 1 |
| Google / Microsoft Forms | `google_forms` | 2 |
| WhatsApp messages | `whatsapp` | 5 |
| Phone calls captured by counsellors | `phone_calls` | 3 |
| Email attachments | `email` | 4 |
| Physical forms later digitised | `physical_digitised` | 3 |
| Staff/counsellor spreadsheet | `staff_spreadsheet` | 5 |
| CRM / lead tool | `crm` | 2 |
| Multiple channels, no standard process | `multiple_no_standard` | 8 |
| Not sure | `not_sure` | 6 |

### Q6 — Student / Parent Communication · `communication_marketing` · **control** · single · cap 10
*Do you use WhatsApp groups or broadcast lists for students/parents?*

| Option | id | Risk |
|---|---|---|
| Yes, controlled, purpose-specific, periodically reviewed | `controlled` | 2 |
| Yes, for batch updates/homework/fees/results | `common_use` | 5 |
| Yes, and numbers are visible to others in groups | `numbers_visible` | 8 |
| No WhatsApp for student/parent comms | `no_whatsapp` | 0 |
| Not sure | `not_sure` | 7 |

### Q7 — Marketing Media Risk · `communication_marketing` · **control** · single · cap 12
*Do you use student photos, result screenshots, testimonials, classroom/demo videos for marketing?*

| Option | id | Risk |
|---|---|---|
| Yes, with written consent + removal process | `written_consent` | 0 |
| Yes, consent taken but not consistently documented | `inconsistent_consent` | 4 |
| Yes, commonly for social/ads without separate consent | `without_separate_consent` | 10 |
| No, we don't use them for marketing | `no_marketing_media` | 0 |
| Not sure | `not_sure` | 8 |

### Q8 — LMS, Vendor & Platform Risk · `lms_vendor_platform` · **exposure** · multi · cap 12
*Which digital tools or vendors process student/parent data?*

| Option | id | Risk |
|---|---|---|
| LMS / learning platform | `lms` | 3 |
| Online test platform | `test_platform` | 3 |
| Zoom / Meet / Teams | `video_tools` | 2 |
| Google Classroom or similar | `google_classroom` | 2 |
| CRM / lead tool | `crm` | 3 |
| Payment gateway / fee tool | `payment_gateway` | 2 |
| Attendance app / biometric / QR | `attendance` | 5 |
| Email/SMS/WhatsApp marketing tool | `marketing_tool` | 5 |
| Placement portal / recruiter database | `placement_portal` | 4 |
| IT vendor / outsourced support | `it_vendor` | 4 |
| No external tools | `no_external_tools` | 0 |
| Not sure | `not_sure` | 8 |

### Q9 — Placement / Partner Sharing · `lms_vendor_platform` · **control** · single · cap 10
*Do you share resumes/marks/attendance/performance/contacts with recruiters, colleges, partners or franchisees?*

| Option | id | Risk |
|---|---|---|
| Yes, only with documented notice/consent | `documented_notice_consent` | 0 |
| Yes, but consent/notice informal | `informal_notice` | 4 |
| Yes, we share when partners/recruiters ask | `share_on_request` | 8 |
| No external sharing | `no_external_sharing` | 0 |
| Not sure | `not_sure` | 7 |

### Q10 — Retention & Deletion Risk · `retention_rights` · **control** · single · cap 10
*How long do you retain student records after course completion?*

| Option | id | Risk |
|---|---|---|
| Documented retention schedule + deletion/archive | `documented_retention` | 0 |
| Defined period, not formally documented | `defined_not_documented` | 3 |
| Many years for convenience/alumni/marketing | `many_years_convenience` | 7 |
| Indefinitely / forever | `indefinitely` | 10 |
| Not sure | `not_sure` | 8 |

---

## 4. Scoring model (shared engine)

```
rawRisk   = Σ over scored questions of min(cap, Σ selected option riskPoints)
maxRisk   = Σ caps = 110
riskScore = round(rawRisk / maxRisk * 100)          # 0–100, high = bad
band      = getBandByScore(riskScore)
band      = applyOverrides(band)                     # raise-only
riskScore = max(riskScore, band.min)                 # floor to overridden band
readiness = 100 − riskScore                          # gauge value
```

**Bucket maths (verified balanced):** student_data_collection 8+14+10 = **32** · minor_parental_consent 12+12 = **24** · communication_marketing 10+12 = **22** · lms_vendor_platform 12+10 = **22** · retention_rights = **10**. Total = **110** ✓

**Two-lens:** dataExposure = exposure-layer risk ÷ exposure caps × 100; controlMaturity = 100 − (control-layer risk ÷ control caps × 100).

---

## 5. Risk bands (engine-shared)

| Risk | Band | Color | Interpretation |
|------|------|-------|----------------|
| 0–24 | Controlled | green | Student-data practices appear reasonably controlled |
| 25–49 | Moderate | gold | Some controls exist; several practices may be informal |
| 50–74 | High | orange | Key student-data/consent/WhatsApp/vendor/retention controls are weak |
| 75–100 | Critical | red | Serious exposure across minors, marketing media, sharing & retention |

UI shows both: `Readiness Score: 42/100` + `Risk Band: High`.

---

## 6. Overrides (raise-only) — 6

> Helper: `hasMinors = q3 ∈ {some_minors, mostly_minors, age_not_recorded}` *(D2)*

| # | id | Condition | Min band |
|---|----|-----------|----------|
| 1 | `minors_no_consent` | hasMinors AND q4 = `no_specific_process` | High |
| 2 | `minors_marketing_no_consent` | hasMinors AND q7 = `without_separate_consent` | High |
| 3 | `sensitive_data_no_retention` | q2 ∋ `health_disability` AND q10 ∈ {`indefinitely`,`not_sure`} | High |
| 4 | `whatsapp_number_exposure` | q6 = `numbers_visible` | Moderate (High if hasMinors) |
| 5 | `external_sharing_on_request` | q9 = `share_on_request` | High |
| 6 | `multi_channel_no_retention` | q5 ∋ `multiple_no_standard` AND q10 ∈ {`indefinitely`,`not_sure`} | High |

*Note:* the new `documented_not_verifiable` Q4 tier is handled by score, not escalation (mild gap, not auto-High).

---

## 7. Soft flags (for top-3 red flags) — 6

| id | Condition | Flag text |
|----|-----------|-----------|
| `minors_consent_gap` | hasMinors AND q4 ∈ {informal, parents_aware_not_documented, no_specific_process} | Your institute enrols students below 18, but parental consent may not be clearly documented or verifiable. |
| `age_not_tracked` | q3 = `age_not_recorded` | Student age isn't consistently recorded, making it hard to identify minors and apply safeguards. |
| `marketing_media_consent` | q7 ∈ {inconsistent_consent, without_separate_consent} | Student photos, result screenshots, testimonials or recordings may be used for marketing without consistent consent evidence. |
| `whatsapp_exposure` | q6 ∈ {common_use, numbers_visible} | Student/parent WhatsApp groups may expose phone numbers and history without clear controls. |
| `vendor_sprawl` | q8 ∋ ≥3 tools OR `attendance`/`marketing_tool` | Multiple LMS, CRM, attendance, payment or marketing tools may process student data without a vendor review process. |
| `retention_indefinite` | q10 ∈ {many_years_convenience, indefinitely} | Old student records may be retained indefinitely without a documented retention policy. |

Engine merges override flags + soft flags, dedupes by text, returns top 3 by severity.

---

## 8. Recommendations (`recommend(result, answers)`)

Driven by highest bucket risks (mirrors CA pattern):

- **minor_parental_consent high** → Create a minor-student consent workflow: capture *verifiable* parent/guardian consent at admission, record student age, maintain evidence for digital comms, LMS, photos, recordings & marketing.
- **communication_marketing high** → Separate batch communication from promotional messaging; document consent for testimonials/photos/videos; create a removal process for outdated student content.
- **student_data_collection high** → Standardise enquiry/admission intake; reduce scattered WhatsApp/spreadsheet/informal collection; define what data each purpose needs.
- **lms_vendor_platform high** → Build a vendor/tool register (LMS, CRM, payment, attendance, video, test, marketing, placement partners); review what each stores and who can access it.
- **retention_rights high** → Define a retention schedule for records after course completion (leads, admission, scores, attendance, photos, recordings, payments, placement profiles).

**Immediate 5-control block (result page):**
1. Record whether students are below 18.
2. Capture verifiable parent/guardian consent where minors are involved.
3. Standardise student & parent data intake.
4. Review WhatsApp groups, photos, testimonials & demo-class recordings.
5. Define retention rules for old leads, admission records, test scores & student photos.

**Result-page band copy:** Controlled / Moderate / High / Critical paragraphs per the thesis §11.

---

## 9. Result page UI

- Headline: *Your Training Institute DPDPA Readiness Score*
- Readiness gauge (SVG, aria-labelled) + risk-band chip (text+icon+color)
- Two-lens MiniBars: Data Exposure / Control Maturity
- Risk map: 5 buckets × **4-tier status** (Controlled/Moderate/High/Critical from raw bucketScores — D8) + meaning
- Top-3 red flags
- Immediate 5-control recommendation block
- Lead form (gates full report) → CTAs

Inherits CA components: `ReadinessGauge`, `StatusChip`, `MiniBar`, `<fieldset>`+sr-only radio/checkbox, `peer-checked`/`peer-focus-visible` states, micro-notes map.

---

## 10. Lead form (5 fields — D3)

Name · Institute name · Email · Phone/WhatsApp · City — + `hp_url` honeypot.
POST `/api/assessment` with `report_type: "training-institute"`, 3-retry + backoff, submitting/error states.

---

## 11. Marketing page `/industries/training-institutes`

Reimagined (not generic), modeled on CA: hero + sub + Start CTA + trust chips → "Your institute's student-data risk map" (5 bucket cards w/ icons, examples, first-move) → "How the 3-minute scan works" (3 steps) → checklist preview → FAQ (`<details>`, schema) → sidebar (scan CTA, white paper, related briefings, consultation). Update `cta-copy.ts` `training-institutes` href → `/assessment/training-institutes`.

---

## 12. Deferred (logged, not lost)

- **Section 9(3): behavioural tracking / targeted ads at minors** → deep diagnostic (18–25Q) — D6
- **Q11 rights/correction-deletion request handling** → deep diagnostic (indirectly proxied by Q7/Q10 in TOFU)
- **Training Institute Starter Checklist PDF** → follow-up phase (same Playwright script pattern as CA)
- **CA-style tailored report email copy** → later

---

## 13. Implementation file map

| File | Action |
|------|--------|
| `lib/data/industry-assessment/packs/training-institutes.ts` | NEW — full pack |
| `lib/data/industry-assessment/index.ts` | Register pack |
| `app/assessment/training-institutes/TrainingAssessmentClient.tsx` | NEW |
| `app/assessment/training-institutes/page.tsx` | NEW (noindex) |
| `app/industries/training-institutes/page.tsx` | Rewrite |
| `lib/cta-copy.ts` | Update href + copy |
| `app/api/assessment/route.ts` | Extend email guard |

Engine / `bands.ts` / `core.ts`: **no change**.

---

## 14. Test matrix (mirror CA's 33-test suite)

1. Scoring: clean answers → Controlled; worst-case → Critical; normalization /110 correct
2. One test per override (6) incl. `age_not_recorded` triggering #1/#2; WhatsApp #4 Moderate vs High w/ minors
3. Band boundaries (24/25, 49/50, 74/75)
4. Two-lens: exposure-only vs control-only inputs
5. Bucket scores balanced & 4-tier status thresholds
6. `recommend()` returns correct priority per dominant bucket
7. Email guard: `training-institute` → `categoryScores: undefined`
8. Optional/unanswered handling; multi-select cap enforcement (Q1/Q2/Q5/Q8)

**Build gate:** all tests green + `next build` clean before push. Branch off `main`; no push until reviewed.
