# Pack 11 — Fintech / NBFC / Digital Payments · DPDPA Assessment Spec

**Owner:** Dilip Sahu · **Status:** Spec (no code) · **Date:** 2026-06-14
**Sequence:** Pack 11 of the 9–12 expansion (Hotels + Pharmacies already LIVE in prod). Pack 12 (Gyms/Salons/Spas) follows; then landing-page optimization.
**Content source of truth:** the v2.0 design you supplied. This spec maps it onto the `IndustryPack` engine and records reconciliation, surfacing, QA/legal flags, and acceptance criteria — it does not restate your content.
**Gate:** this spec → `/plan-design-review` (≥8) → build.

---

## 1. Identity & routing

| Field | Value | Note |
|---|---|---|
| Pack file | `lib/data/industry-assessment/packs/fintech-nbfc.ts` | export `fintechNbfcPack` |
| Registry line | `"fintech-nbfc": fintechNbfcPack` in `index.ts` | only engine touch-point |
| Industry slug | `fintech-nbfc` | `/industries/fintech-nbfc` |
| Assessment route | `/assessment/fintech-nbfc` | matches your spec |
| **`reportType` token** | **`fintech`** (7 chars) | ≤10 ✓. Already the value in the white-paper dropdown — this pack makes Fintech a *real* sector, not just a dropdown extra. |
| Card accent / icon | `blue` / lucide `Landmark` | finance-thematic; see QA flag on the blue/sky/cyan trio |

`pack.reportType` == client-sent == DB-stored == `fintech`.

---

## 2. Engine mapping — NO engine change

Maps 1:1 onto `core.ts` (same as the prior 10 packs): option `riskPoints`, `helper`→`helpText`, `whyThisMatters`, `badge`, `cap`, `bucket`, raise-only `minBand`.

**All option points are ≥0 — plain additive, zero engine interaction** (no credit option, so the floor-at-0 is a no-op here, like Pharmacy/Real-Estate).

---

## 3. Scoring — verified against the engine model

- **Per-question caps**: 10 / 16 / 10 / 14 / 12 / 16 / 12 / 12 / 10 / 10 = **Σ 122**. The engine normalizes by Σ caps automatically (`riskScore = round(raw/122*100)`) — **do not hand-implement the `/122` step**, and don't assume 112: this pack legitimately runs to 122.
- **Bucket maxima derive from caps** (don't hand-set):
  - `kyc_financial_data` = Q1(10)+Q2(16)+Q3(10) = **36** ✓
  - `profiling_underwriting` = Q4(14) = **14** ✓
  - `consent_notice_rights` = Q5(12) = **12** ✓
  - `vendor_partner_agent_sharing` = Q6(16)+Q7(12) = **28** ✓
  - `access_retention_incident` = Q8(12)+Q9(10)+Q10(10) = **32** ✓ · **Σ 122** ✓
- **Bands**: shared `bands.ts`; only `bandCopy` is pack-specific.

### Two-lens (`layer`) assignment — to add (control-heavy, as fintech should be)
- **exposure** (what data you hold & share): Q1, Q2, Q3, Q6 → 10+16+10+16 = **52**
- **control** (how well it's governed): Q4, Q5, Q7, Q8, Q9, Q10 → 14+12+12+12+10+10 = **70**
- 52/70 — deliberately control-weighted. Fintech's DPDPA story is overwhelmingly a *governance* story (profiling, consent evidence, agent access, retention, incident), so the control lens carries more weight here than in any prior pack. **Note:** Q4 (profiling/underwriting) sits in the **control** lens — its risk accrues from weak *governance* (the "documented model purpose + human review" = 0 answer is a maturity signal), not from doing profiling per se.

---

## 4. Overrides — 7 raise-only, all straight to High

Unlike prior packs, there is **no Moderate→High conditional pair** — every override jumps straight to **High Risk**, reflecting the sector's stakes. All raise-only.

| # | Trigger (selected option ids) | `minBand` |
|---|---|---|
| 1 | Q2 ∈ {bank_statements, bureau_data} **AND** Q3 ∈ {whatsapp, dsa_field_agent} | High |
| 2 | Q4 = automated_limited_explanation | High |
| 3 | Q5 ∈ {bundled_terms, no_clear_evidence} **AND** Q4 ∈ {informal_documentation, scoring_personalisation, automated_limited_explanation} | High |
| 4 | Q7 = personal_phone_whatsapp | High |
| 5 | Q7 = download_export | High |
| 6 | Q9 = indefinitely **AND** Q2 ∈ {pan, aadhaar_kyc, bank_statements, bureau_data, loan_emi, collection_notes} | High |
| 7 | Q10 = no_standard_process **AND** Q8 ∈ {whatsapp, sheets_excel, email_inboxes, staff_agent_devices, multiple_no_sot} | High |

---

## 5. Scope decisions

- **10-question scan only.** Q11–Q15 (consent withdrawal, correction rights, alternate/device data, agent CSV exports, cross-sell sharing) are the deep-diagnostic layer — your spec already earmarks a deeper **25–35 question** paid diagnostic; parked, not built here.
- **`not_sure` mutually exclusive** in every multi-select; lead form uses the existing component (your 10 fields map to existing fields).

---

## 6. Surfacing checklist (same commit as the pack)

- [ ] Pack file + `index.ts` registry line
- [ ] `/assessment/fintech-nbfc` route + client (clone newest pack client, swap pack + strings)
- [ ] `/industries/fintech-nbfc` page (existing template; copy from your §16/§23)
- [ ] Homepage card in `AudienceCards.tsx` (blue / `Landmark` / painPoints from chips)
- [ ] Industries index array **and** risk-table row in `app/industries/page.tsx` (riskTheme: "KYC, PAN/Aadhaar, bank & bureau data, profiling, DSAs, collection agents")
- [ ] Footer + Header + `app/sitemap.ts` (`industryPages[]`)
- [ ] Starter Checklist PDF: `tools/build-fintech-checklist.mjs` (10 sections from your §22) → `public/templates/fintech-nbfc-dpdpa-starter-checklist.pdf`; wire `leadMagnet` + email `checklistUrl`
- [ ] **White-paper dropdown:** Fintech is already an option there — confirm the `value` aligns with the new sector (no change needed to the engine, just consistency)
- [ ] Admin/report: pack-aware via `getPackByReportType("fintech")` — no change
- [ ] **Guardrail:** this brings live sectors to **11**. Update the hero stat (already config-free literal `"10"` from the last ship → `"11"`), and note the 11-card homepage grid lands 3+3+3+2 on `lg` (last row of 2, left-aligned — the single-orphan centering hack does NOT fire at 11; it returns to a clean 4×3 only at pack 12).

---

## 7. QA / legal-copy flags (raise before build — sharper here than any prior pack)

1. **DPDPA-only scope vs RBI overlap.** Fintech/NBFC founders live under RBI master directions (data localization, outsourcing, Digital Lending Guidelines, account-aggregator framework). This scan is **DPDPA-only**. Result/CTA copy must **not** imply it assesses RBI/localization/DLG compliance — say "DPDPA readiness for your financial-data workflows," and let the consultation CTA be where broader regulatory help is offered. Overclaiming here is a credibility risk with a sophisticated audience.
2. **Automated decisioning — don't import GDPR Article 22.** Override 2 fires High on "automated decisions with limited explanation." DPDPA does **not** grant a GDPR-style explicit right against automated decision-making. Frame the profiling risk under DPDPA's **notice, purpose-limitation and consent** obligations (and customer-harm/transparency), **not** as a statutory "right to explanation." Lock this wording.
3. **"High-impact financial data," not "sensitive."** DPDPA has no special-category tier — same rule as Pharmacy. PAN/Aadhaar/bank/bureau = "high-impact financial data," never a statutory "sensitive personal data" claim.
4. **Band distribution will skew High/Critical — by design.** Σ122 with heavy weights, 7 straight-to-High overrides, and near-ubiquitous practices (bank statements + DSA/WhatsApp intake; profiling; agent access) mean most respondents land High or Critical. Accurate for the sector and good for conversion — but the red-flag copy must clearly justify *why*, so a genuinely well-governed NBFC can still reach Controlled/Moderate (the "documented + human review" / "timestamped consent" / "role-based monitored access" zero-point answers must visibly move the score).
5. **Reassurance line is mandatory.** Audience is handing over their *risk posture*. Positioning.sub must carry "this scan collects no customer financial data — only your answers about your processes," and the scan strip repeats it.

---

## 8. Acceptance criteria

- [ ] `fintechNbfcPack.reportType === "fintech"`, ≤10 chars; matches client-sent + DB.
- [ ] Σ caps = 122; bucket maxima derive to 36/14/12/28/32; no hand-set normalization; engine code unchanged.
- [ ] `layer` set on all 10 questions (exposure 52 / control 70).
- [ ] 7 overrides present, all raise-only to High; no negative-point options.
- [ ] Copy is DPDPA-scoped (no RBI/localization overclaim), uses "high-impact financial data," no GDPR "right to explanation," carries the no-financial-data reassurance.
- [ ] All surfaces updated in one commit; Vercel route count grows by 2; hero stat → 11.
- [ ] `report_type "fintech"` round-trips through admin + `/report/[token]` without "General".
- [ ] Pack independently `/plan-design-review` ≥8 before build (this doc + the review below).
- [ ] Deep-diagnostic Q11–Q15 excluded.
