# SaralPrivacy — Recruitment Agency DPDPA Assessment v2.0 — Build Spec

**Status:** Draft for design review → build
**Date:** 2026-06-08
**Engine:** Shared `lib/data/industry-assessment/` (zero engine changes) — Recruitment is a new pack (3rd industry)
**Reference:** CA Firms + Training Institutes (both live). Pack-aware admin + report already support new packs automatically.
**Authoritative option text:** the founder's brief (verbatim labels + riskPoints). This spec captures build-critical structure, decisions, and deltas.

---

## 0. Positioning

- **Route (assessment):** `/assessment/recruitment` (override the legacy generic page in place)
- **Marketing page:** `/industries/recruitment-agencies` (rewrite existing)
- **Pack key (`industry`):** `recruitment-agencies` (matches cta-copy key + industries slug)
- **`report_type`:** `recruit` (7 chars ≤ the Appwrite `string(10)` limit; client sends `pack.reportType`)

**Hero:** "Your recruitment agency does not just forward CVs. It moves candidate data across clients, tools and teams."
**Thesis sub-line:** "Most recruitment agencies don't have a CV-collection problem — they have a candidate-data *movement* problem."
**CTA:** Start Recruitment Risk Scan · **Microline:** 3 minutes · 10 questions · free · no login
**Trust chips:** CVs · Candidate Consent · Job Portals · LinkedIn · ATS · WhatsApp · Client Sharing · BGV · Salary Slips · Rejected Profiles · AI Screening

**Audience:** recruitment/staffing firms, HR consultants, executive search, blue-collar & contract staffing, RPO, freelance recruiters, campus & overseas recruiters.

**Core thesis:** Agencies fail privacy not by intent but because candidate data moves informally across Naukri/LinkedIn/WhatsApp/email/Excel/ATS/Drive → clients, HR, BGV vendors, overseas employers, AI tools. The scan reframes risk from "collecting CVs" to "how CVs, IDs, salary slips, trackers, BGV files and rejected profiles move."

---

## 1. Locked decisions (this session)

| # | Decision | Rationale |
|---|----------|-----------|
| D1 | **Shared engine + new `packs/recruitment-agencies.ts`** | 3rd industry; zero engine changes (engine normalises by Σ caps = 110) |
| D2 | **`report_type` = `recruit`** (client sends `pack.reportType`) | ≤10-char Appwrite limit; single source so client/pack/DB never drift (the Training trap) |
| D3 | **Route `/assessment/recruitment`** (override legacy) · pack key `recruitment-agencies` | Reuse both existing routes; no orphans; matches brief's route + existing cta/industries key |
| D4 | **Two-lens:** exposure = Q1, Q2, Q3, Q8 (46) · control = Q4, Q5, Q6, Q7, Q9, Q10 (64) | Mirrors Training's 46/64 split |
| D5 | **4-tier bucket band** on result risk-map (Controlled/Moderate/High/Critical from raw bucketScores) | Same as CA/Training |
| D6 | **Email guard:** add `recruit` to the `isIndustry` check in `api/assessment/route.ts` | Recruitment bucket keys ≠ general 6 → would NaN the scorecard |
| D7 | **Deep-diagnostic Q11–Q15 deferred** (AI screening, BGV depth, cross-border, talent-pool consent, client re-sharing) | Keep TOFU at 10 Q; logged for the 20–25Q deep version |
| D8 | **Lead form = 5 fields** — Name · Agency name · Email · Phone/WhatsApp · City | Type (Q1) + BGV (Q3) already captured; best conversion + a11y |
| D9 | **Build the Starter Checklist PDF now** (CA pattern) | pack `leadMagnet` → PDF; Playwright tool; gated result-page download; email `checklistUrl`/`checklistTitle` for `recruit` |

⚠️ **Cross-border note:** "Overseas recruitment" (Q1) and overseas client sharing carry DPDPA Section 16 (cross-border transfer) weight. TOFU captures it only via Q1's risk points; the explicit cross-border question (Q13) is deferred to the deep diagnostic. Logged.

---

## 2. Risk buckets (5)

| Key | Label | Meaning (result risk-map) |
|-----|-------|---------------------------|
| `candidate_sourcing` | Candidate sourcing risk | Profiles may enter through multiple informal or poorly documented channels |
| `candidate_document` | Candidate document risk | Identity, salary or BGV documents may be collected/stored without enough control |
| `client_sharing` | Client sharing risk | CVs may be forwarded, bulk-shared or accessed by clients without safeguards |
| `ats_tool_access` | ATS, tool & access risk | Candidate data may sit across ATS, Excel, email, WhatsApp and recruiter devices |
| `retention_rights` | Retention & rights readiness risk | Old/rejected candidate profiles may be retained without defined deletion rules |

---

## 3. Questions (caps · bucket · layer) — option text + riskPoints per the brief §4/§19

| Q | Badge | Type | Cap | Bucket | Layer |
|---|-------|------|-----|--------|-------|
| Q1 | Agency Profile | multi | 8 | candidate_sourcing | exposure |
| Q2 | Candidate Sourcing Risk | multi | 12 | candidate_sourcing | exposure |
| Q3 | Candidate Document Risk | multi | 14 | candidate_document | exposure |
| Q4 | Early Collection Risk | single | 10 | candidate_document | control |
| Q5 | Candidate Notice & Consent | single | 10 | candidate_sourcing | control |
| Q6 | Client Sharing Risk | multi | 14 | client_sharing | control |
| Q7 | Recruiter Access Risk | single | 12 | ats_tool_access | control |
| Q8 | ATS, Tool & Storage Risk | multi | 12 | ats_tool_access | exposure |
| Q9 | Rejected Candidate Retention | single | 10 | retention_rights | control |
| Q10 | Candidate Rights Handling | single | 8 | retention_rights | control |

**`mutuallyExclusive`:** `not_sure` on every multi (Q1, Q2, Q3, Q6, Q8) clears other selections. Option ids + riskPoints exactly per brief §19.

---

## 4. Scoring model (shared engine)

```
rawRisk   = Σ min(cap, Σ selected riskPoints)
maxRisk   = Σ caps = 110
riskScore = round(rawRisk / 110 * 100)        # high = bad
band      = getBandByScore(riskScore) → applyOverrides (raise-only) → floor riskScore to band.min
readiness = 100 − riskScore                    # gauge value
```
Bands: Controlled 0–24 · Moderate 25–49 · High 50–74 · Critical 75–100 (engine `bands.ts`).

---

## 5. Overrides (raise-only) — 7 (per brief §8/§21)

| # | id | Condition | Min band |
|---|----|-----------|----------|
| 1 | `scraped_sourcing` | Q2 ∋ `scraped_profiles` | High |
| 1b | `scraped_no_notice` | Q2 ∋ `scraped_profiles` AND Q5 = `no_documented_notice` | **Critical** |
| 2 | `high_impact_early` | Q3 ∋ {id_proof, salary_bank_docs, bgv_docs, sensitive_category} AND Q4 ∈ {initial_registration, whenever_shared} | High |
| 3 | `bulk_client_sharing` | Q6 ∋ {bulk_cv_folders, client_ats_access} | High |
| 4 | `informal_sharing_no_notice` | Q6 ∋ {whatsapp, email_attachments} AND Q5 = `no_documented_notice` | High |
| 5 | `ex_recruiter_access` | Q7 = `ex_staff_access` | High |
| 6 | `retain_forever` | Q9 = `indefinitely` | Moderate |
| 6b | `retain_forever_no_rights` | Q9 = `indefinitely` AND Q10 = `no_standard_process` | High |
| 7 | `sensitive_scattered` | Q3 ∋ {salary_bank_docs, bgv_docs, sensitive_category} AND Q8 ∋ {whatsapp, recruiter_devices, external_drives, multiple_no_sot} | High |

*Note:* this pack has a genuine **Critical** override (1b) — engine `maxBand` supports it.

---

## 6. Soft flags & recommendations

- **Soft flags** (top-3 fill): per brief §10 — sourcing (multi-channel/scraped/reused DB), document (early high-impact, psychometric profiling), client-sharing (informal forwarding, bulk/ATS access, loss of control after forward), ATS/access (scattered, freelancer/ex-staff, AI tools), retention/rights (forever retention, no correction/deletion path).
- **`recommend(r)`** — High/Critical → the **5 immediate controls** (brief §13); else bucket-targeted (brief §11), priority order: candidate_document → client_sharing → candidate_sourcing → ats_tool_access → retention_rights.
- **`bandCopy`** — the 4 result-band paragraphs (brief §12), in the pack (shared by client + report + email).

---

## 7. Result page · 8. Lead form · 9. Marketing page

- **Result:** headline "Your Recruitment Agency DPDPA Readiness Score" · readiness gauge + risk band · two-lens bars · top-3 flags · 5-bucket 4-tier risk map · gated 5-control block · "Get a Recruitment Agency DPDPA Gap Review" CTA. Reuses CA/Training components; opens on Q1 (no landing).
- **Lead form (D8 — recommend 5):** Name · Agency name · Email · Phone/WhatsApp · City (+ honeypot). Type (Q1) + BGV (Q3) already captured.
- **Marketing `/industries/recruitment-agencies`:** rewrite around the 5 buckets (BUCKET_DETAIL), how-it-works, "what the scan checks", preserve existing FAQs + SEO schema/byline; sidebar scan CTA. Update `cta-copy.ts` `recruitment-agencies` href → `/assessment/recruitment`.

---

## 10. Deferred (logged)

- Deep diagnostic (20–25 Q): AI screening governance, BGV depth, **cross-border (Section 16)**, talent-pool/future-hiring consent, client re-sharing visibility.
- (Starter Checklist PDF is now IN scope — D9.)

---

## 11. Implementation file map

| File | Action |
|------|--------|
| `lib/data/industry-assessment/packs/recruitment-agencies.ts` | NEW pack |
| `lib/data/industry-assessment/index.ts` | register pack |
| `app/assessment/recruitment/RecruitmentAssessmentClient.tsx` + `page.tsx` | NEW client + override legacy page (noindex) |
| `app/industries/recruitment-agencies/page.tsx` | rewrite |
| `lib/cta-copy.ts` · `app/api/assessment/route.ts` | href + email guard (`recruit`) + `checklistUrl`/`checklistTitle` for `recruit` |
| `tools/build-recruitment-checklist.mjs` → `public/templates/recruitment-agency-dpdpa-starter-checklist.pdf` | NEW PDF (Playwright, 10 sections per brief §22); pack `leadMagnet` points to it |

Engine / `bands.ts` / `core.ts`: **no change**.

---

## 12. Test matrix (mirror Training's 39-assertion harness)

Structural (caps=110, buckets 30/24/14/24/18, two-lens 46/64) · band boundaries · clean→Controlled · worst→Critical · one test per override incl. **1b → Critical** and 6/6b Moderate-vs-High · verifiable cap enforcement on multis · `recommend()` priority · email guard `recruit` → `categoryScores: undefined`.

**Build gate:** harness green + `tsc` + `next build` clean → preview → review → prod.
