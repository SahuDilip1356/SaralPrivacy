# SaralPrivacy — Clinics & Diagnostic Labs DPDPA Assessment v2.0 — Build Spec

**Status:** Draft for design review → build · **Date:** 2026-06-09
**Engine:** Shared `lib/data/industry-assessment/` (zero engine changes) — Clinics is a new pack (**5th industry**)
**Reference:** CA Firms + Training Institutes + Recruitment Agencies + D2C (all live). Pack-aware admin + report + checklist PDF support new packs automatically.
**Authoritative option text:** the founder's brief (verbatim labels + riskPoints — captured in §19 of the brief). This spec captures build-critical structure, the engine mapping, and the decisions/deltas.

> Thesis: *"Most clinics do not have a patient-care problem. They have a patient-data movement problem."*

---

## 0. Positioning

- **Route (assessment):** `/assessment/clinics-diagnostic-labs`
- **Marketing page:** `/industries/clinics-diagnostic-labs`
- **Pack key (`industry`):** `clinics-diagnostic-labs` (matches route + cta-copy key + industries slug)
- **`report_type`:** `clinic` (6 chars ≤ Appwrite `string(10)`; client sends `pack.reportType`)

**Hero:** "Your clinic does not just treat patients. It collects, stores and shares health data every day."
**CTA:** Start Clinic / Lab Risk Scan · **Microline:** 3 minutes · 10 questions · free · no login
**Trust chips:** Patient Reports · Prescriptions · Health Data · WhatsApp Sharing · Lab Software · Reception Access · Home Collection · Doctor Referrals · Insurance / TPA · Old Reports

**Audience:** single-doctor / multi-speciality / dental / eye / fertility / physiotherapy / mental-health clinics; diagnostic, pathology & radiology labs; home sample collection; clinic chains; OPD-heavy small hospitals.

**Core thesis:** patient data moves informally across appointment registers, WhatsApp, prescriptions, lab reports, diagnostic images, doctor referrals, billing/LIS/HIS software, sample-collection staff, reception desks, home-collection agents, insurance/TPA desks, outsourced labs, email and shared folders. The scan reframes risk from "medical records" to **report-sharing, recipient verification, staff/vendor access and old-report retention.**

---

## 1. Locked decisions & engine-mapping (this session)

| # | Decision | Rationale |
|---|----------|-----------|
| C1 | **Shared engine + new `packs/clinics-diagnostic-labs.ts`** | 5th industry; zero engine changes (normalises by Σ caps = 110) |
| C2 | **`report_type` = `clinic`** (client sends `pack.reportType`) | ≤10-char Appwrite limit; single source so client/pack/DB never drift |
| C3 | **Two-lens layers (brief omits these — engine requires them):** exposure = Q1, Q2, Q3, Q7 (44) · control = Q4, Q5, Q6, Q8, Q9, Q10 (66) | data/profile/vendors = exposure; sharing/verification/access/retention/incident = control |
| C4 | **4-tier bucket band** on result risk-map | Same as CA/Training/Recruitment/D2C |
| C5 | **Email guard:** add `clinic` to the `isIndustry` check (`categoryScores: undefined`) | Clinic bucket keys ≠ general 6 → would NaN the scorecard |
| C6 | **Lead form trimmed to 5 fields** — Name · Clinic/Lab name · Email · Phone/WhatsApp · City | Brief's 9 fields trimmed; service type (Q1) + report-sharing (Q4) already captured in answers |
| C7 | **Starter Checklist PDF INCLUDED** (`leadMagnet`) | Parity with CA/Recruitment/D2C/Training (all now have one); 10-section PDF via `tools/build-clinic-checklist.mjs` |
| C8 | **Deep-diagnostic Q11–Q15 deferred** (correction rights, CCTV, children's health data, promo offers, testimonials) | Keep TOFU at 10 Q; logged in §10 |
| C9 | **Q7 `not_sure` is NOT mutually-exclusive** (only `no_external_tools` is) | Override 4 requires Q7 ∋ {outsourced/home} AND Q7 ∋ not_sure — impossible if not_sure clears others. Allowing "know some vendors, unsure about others" keeps the override live. |

⚠️ **Children's health data (Optional Q13)** and **promotional offers (Q14)** sit in the deferred deep-diagnostic. Sensitive health data (fertility/mental-health) **is** in TOFU (Q2 + Override 1). Logged.

---

## 2. Risk buckets (5)

| Key | Label | Meaning (result risk-map) |
|-----|-------|---------------------------|
| `patient_data_collection` | Patient data collection risk | Patient data may enter through informal or scattered intake channels. |
| `health_data_sensitivity` | Health data sensitivity risk | Reports, prescriptions or sensitive treatment data may require stronger controls. |
| `report_sharing_communication` | Report sharing & communication risk | WhatsApp / email / family-member / partner sharing may create exposure. |
| `system_staff_vendor_access` | System, staff & vendor access risk | Staff, software and vendor access may need review. |
| `retention_incident_readiness` | Retention & incident readiness risk | Old reports and breach-response processes may not be mature. |

---

## 3. Questions (caps · bucket · layer) — option text + riskPoints per brief §4/§19

| Q | Badge | Type | Cap | Bucket | Layer |
|---|-------|------|-----|--------|-------|
| Q1 | Healthcare Profile | multi | 8 | patient_data_collection | exposure |
| Q2 | Patient Data Risk | multi | 14 | health_data_sensitivity | exposure |
| Q3 | Patient Intake Risk | multi | 10 | patient_data_collection | exposure |
| Q4 | Report Sharing Risk | multi | 14 | report_sharing_communication | control |
| Q5 | Recipient Verification | single | 10 | report_sharing_communication | control |
| Q6 | Staff Access Risk | single | 12 | system_staff_vendor_access | control |
| Q7 | System, Tool & Vendor Risk | multi | 12 | system_staff_vendor_access | exposure |
| Q8 | Doctor / Partner Sharing | single | 10 | report_sharing_communication | control |
| Q9 | Patient Record Retention | single | 10 | retention_incident_readiness | control |
| Q10 | Incident & Breach Readiness | single | 10 | retention_incident_readiness | control |

**`mutuallyExclusive`:** `not_sure` on Q1, Q2, Q3, Q4 multis; Q7 → `no_external_tools` only (see C9). Option ids + riskPoints exactly per brief §19. Caps enforced per question.

---

## 4. Scoring model (shared engine)

```
rawRisk   = Σ min(cap, Σ selected riskPoints);  maxRisk = Σ caps = 110
riskScore = round(rawRisk / 110 * 100)
band      = getBandByScore → applyOverrides (raise-only) → floor riskScore to band.min
readiness = 100 − riskScore
```
Bands: Controlled 0–24 · Moderate 25–49 · High 50–74 · Critical 75–100.
Bucket maxes: 18 / 14 / 34 / 24 / 20 (Σ 110). Two-lens: exposure 44 · control 66.

---

## 5. Overrides (raise-only) — per brief §8/§21

| # | id | Condition | Min band |
|---|----|-----------|----------|
| 1 | `sensitive_whatsapp` | Q2 ∋ sensitive_treatment AND Q4 ∋ {whatsapp_patient, whatsapp_family} | High |
| 2 | `family_share_no_verify` | Q4 ∋ whatsapp_family AND Q5 = share_on_request | High |
| 3 | `shared_or_exstaff_access` | Q6 ∈ {shared_logins, ex_staff_access} | High |
| 4 | `vendor_uncertainty` | Q7 ∋ {outsourced_lab, home_collection_partner} AND Q7 ∋ not_sure | High |
| 5 | `breach_process_missing` | Q10 = no_standard_process AND Q4 ∋ {whatsapp_patient, whatsapp_family, email_patient, multiple_preference} | High |
| 6 | `indefinite_sensitive` | Q9 = indefinitely AND Q2 ∋ {lab_reports, radiology_images, prescriptions_notes, medical_history, sensitive_treatment} | High |
| 7 | `external_on_request` | Q8 = share_on_partner_request | High |

(Max band reached = High; no Critical override — engine still allows Critical via raw score. Severity weights assigned in pack: 1→9, 2→9, 6→8, 3→8, 5→8, 7→7, 4→7.)

---

## 6. Soft flags & recommendations

- **Soft flags** (top-3 fill; derived from brief §10): scattered intake (Q3 whatsapp/phone/paper/home/walk-in/multiple); sensitive-data breadth (Q2 sensitive/medical/lab/radiology); informal report sharing (Q4 whatsapp/email/multiple); broad staff access (Q6 broad/shared/ex-staff); vendor sprawl (Q7 outsourced/home/tpa/it); indefinite retention (Q9 many-years/indefinitely); no incident process (Q10 case-by-case/no-process).
- **`recommend(r)`** — High/Critical → the **5 immediate controls** (brief §13); else bucket-targeted (brief §11), priority: report_sharing_communication → health_data_sensitivity → system_staff_vendor_access → patient_data_collection → retention_incident_readiness (threshold bucketScore ≥ 34).
- **`bandCopy`** — the 4 result-band paragraphs (brief §12), in the pack (shared by client + report + email).

---

## 7. Result · 8. Lead form · 9. Marketing page

- **Result:** headline "Your Clinic / Diagnostic Lab DPDPA Readiness Score" · readiness gauge + band · two-lens bars · top-3 flags · 5-bucket 4-tier risk map · gated 5-control block + checklist download · "Get a Clinic / Diagnostic Lab DPDPA Gap Review" CTA. Reuses components; opens on Q1.
- **Lead form (5):** Name · Clinic/Lab name · Email · Phone/WhatsApp · City (+ honeypot). Q1 type prefilled into the summary line.
- **Marketing `/industries/clinics-diagnostic-labs`:** rewrite around the 5 buckets (BUCKET_DETAIL), how-it-works (step 3 = fixes + checklist), "what the scan checks", FAQs (author 5 healthcare DPDPA FAQs) + full SEO schema (breadcrumb/faq/speakable/Byline). Update `cta-copy.ts` to add `clinics-diagnostic-labs` → `/assessment/clinics-diagnostic-labs`.

---

## 10. Deferred (logged)

- Deep diagnostic (20–25 Q): correction rights (Q11), CCTV (Q12), **children's health data (Q13)**, promotional offers (Q14), testimonials/case-studies (Q15).

---

## 11. Implementation file map

| File | Action |
|------|--------|
| `lib/data/industry-assessment/packs/clinics-diagnostic-labs.ts` | NEW pack (with `leadMagnet`) |
| `lib/data/industry-assessment/index.ts` | register pack (key `clinics-diagnostic-labs`) |
| `app/assessment/clinics-diagnostic-labs/ClinicAssessmentClient.tsx` + `page.tsx` | NEW client (copy recruitment client; entity field = "Clinic / lab name"; MICRO_NOTES) + page (noindex) |
| `app/industries/clinics-diagnostic-labs/page.tsx` | NEW marketing page |
| `lib/cta-copy.ts` | add `clinics-diagnostic-labs` entry + href |
| `app/api/assessment/route.ts` | email guard `clinic` → categoryScores undefined; checklistUrl/Title for `clinic` |
| `tools/build-clinic-checklist.mjs` + `public/templates/clinic-diagnostic-lab-dpdpa-starter-checklist.pdf` | NEW generator + 10-section PDF |

Engine / `bands.ts` / `core.ts`: **no change.**

---

## 12. Test matrix (mirror Recruitment/D2C harness — throwaway tsx script)

Structural (caps=110, buckets 18/14/34/24/20, two-lens 44/66) · band boundaries · clean→Controlled · worst→Critical (via raw score) · one test per override (incl. #4 which depends on C9 — not_sure non-exclusive in Q7) · multi-select cap enforcement · `recommend()` priority · email guard `clinic` → `categoryScores: undefined`.

**Build gate:** scoring script green + `tsc` + `next build` clean → preview → review → prod.
