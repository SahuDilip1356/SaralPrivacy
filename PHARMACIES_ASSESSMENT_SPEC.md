# Pack 10 — Pharmacies / Online Pharmacies · DPDPA Assessment Spec

**Owner:** Dilip Sahu · **Status:** Spec (no code) · **Date:** 2026-06-14
**Sequence:** Pack 10 — built **together with Pack 9 (Hotels & Travel)** in one go, then landing-page optimization.
**Content source of truth:** the v2.0 design you supplied. This spec maps it onto the `IndustryPack` engine and records reconciliation, surfacing, QA flags, and acceptance criteria — it does not restate your content.
**Gate:** this spec → `/plan-design-review` (≥8) → build.

---

## 1. Identity & routing

| Field | Value | Note |
|---|---|---|
| Pack file | `lib/data/industry-assessment/packs/pharmacies.ts` | export `pharmaciesPack` |
| Registry line | `"pharmacies": pharmaciesPack` in `index.ts` | only engine touch-point |
| Industry slug | `pharmacies` | `/industries/pharmacies` |
| Assessment route | `/assessment/pharmacies` | matches your spec |
| **`reportType` token** | **`pharmacy`** (8 chars) | "pharmacies" is exactly 10 — fits the `string(10)` cap but leaves no margin; use `pharmacy`. Token ≠ slug, by design. |
| Card accent / icon | `purple` / lucide `Pill` | distinct from the other 9 hues |

`pack.reportType` == client-sent == DB-stored == `pharmacy`.

---

## 2. Engine mapping — NO engine change (simpler than Hotels)

Maps 1:1 onto `core.ts` exactly like Hotels (`riskPoints`, `helpText`←`helper`, `whyThisMatters`, `badge`, `cap`, `bucket`, raise-only `minBand`).

**Unlike Hotels, this pack has no negative-credit option** — every option is ≥0. So it's plain additive; the `questionRisk` floor-at-0 is a no-op here. Zero engine interaction of any kind.

---

## 3. Scoring — verified against the engine model

- **Per-question caps**: 8 / 12 / 14 / 10 / 12 / 14 / 10 / 12 / 10 / 10 = **Σ 112**. Engine normalizes by Σ caps automatically — don't hand-implement the `/112*100`.
- **Bucket maxima derive from caps** (don't hand-set):
  - `customer_prescription_data` = Q1(8)+Q2(12)+Q4(10) = **30** ✓
  - `health_indicator_medicine_history` = Q3(14) = **14** ✓
  - `order_delivery_vendor_sharing` = Q6(14) = **14** ✓
  - `system_staff_access` = Q5(12)+Q8(12) = **24** ✓
  - `retention_refill_incident` = Q7(10)+Q9(10)+Q10(10) = **30** ✓ · **Σ 112** ✓
- **Bands**: shared `bands.ts` `BandLabel`; only `bandCopy` is pack-specific.

### Two-lens (`layer`) assignment — to add
- **exposure**: Q1, Q2, Q3, Q4, Q6 → 8+12+14+10+14 = **58**
- **control**: Q5, Q7, Q8, Q9, Q10 → 12+10+12+10+10 = **54**
- 58/54, identical rhythm to Hotels.

---

## 4. Overrides — 8 raise-only entries, mapped to `IAOverride[]`

Override 3 is the conditional Moderate→High pair (two entries 3a/3b); the rest are single. All raise-only.

| # | Trigger (selected option ids) | `minBand` |
|---|---|---|
| 1 | Q2 ∋ prescription_image **AND** Q4 ∈ {whatsapp, email} | High |
| 2 | Q3 ∈ {mental_health, fertility_reproductive, sexual_health, oncology, hiv_infectious, chronic_care} **AND** Q7 = based_on_history_no_consent | High |
| 3a | Q2 ∋ medicine_history **AND** Q6 ∈ {delivery_partner, marketplace_aggregator, telemedicine_platform} | Moderate |
| 3b | (3a) **AND** Q5 ∈ {whatsapp, staff_devices} | High |
| 4 | Q8 ∈ {shared_logins, ex_staff_vendor_access} | High |
| 5 | Q9 = indefinitely **AND** Q2 ∈ {prescription_image, medicine_history, diagnosis_notes} | High |
| 6 | Q10 = no_standard_process **AND** Q5 ∈ {whatsapp, email_inboxes, staff_devices, multiple_no_sot} | High |
| 7 | Q2 ∋ diagnosis_notes **AND** Q8 ∈ {broad_pharmacy_access, delivery_over_access} | High |

---

## 5. Scope decisions

- **10-question scan only.** Q11–Q15 (prescription verification, children's data, targeted offers, correction/deletion, delivery personal phones) are the deep-diagnostic layer — parked, not built.
- **`not_sure` mutually exclusive** in every multi-select; lead form uses the existing component (your 9 fields map to existing fields).

---

## 6. Surfacing checklist (same commit; built alongside Hotels)

- [ ] Pack file + `index.ts` registry line
- [ ] `/assessment/pharmacies` route wired to `pharmaciesPack`
- [ ] `/industries/pharmacies` page (existing template; copy from your §16/§23)
- [ ] Homepage card in `AudienceCards.tsx` (purple / `Pill` / painPoints from chips)
- [ ] Industries index array **and** risk-table row in `app/industries/page.tsx` (riskTheme: "Prescriptions, medicine history, WhatsApp orders, health indicators")
- [ ] Footer + `app/sitemap.ts`
- [ ] Starter Checklist PDF: `tools/build-pharmacy-checklist.mjs` (10 sections from your §22) → `public/templates/pharmacy-dpdpa-starter-checklist.pdf`; wire `leadMagnet` + email `checklistUrl`
- [ ] Admin/report: pack-aware via `getPackByReportType("pharmacy")` — no change
- [ ] **Guardrail (shared with Hotels):** this brings live sectors to **10**. The hero `HeroSection.tsx:9` literal `"4"` must move — set to `10` (or remove the count) when these two ship, even though the full `SECTORS` refactor is the later phase.

---

## 7. QA / legal-copy flags (raise before build)

1. **"Sensitive personal data" language — legal precision.** This is your most health-loaded pack. DPDPA does **not** create GDPR-style special/sensitive categories (per the glossary the site already publishes). Result/recommendation/red-flag copy must say **"high-impact health data"** or **"health indicators"**, **never** imply a statutory "sensitive personal data" tier. Audit the supplied copy on build — it mostly does this right, but lock the wording so it matches the glossary canon.
2. **Band distribution will skew High/Critical — by design, and that's fine.** Override 1 (prescription image + WhatsApp intake) fires for the *vast majority* of Indian pharmacies — WhatsApp prescriptions are near-universal. Combined with Q3 maxing the health bucket on any two sensitive categories, expect most respondents to land **High** or **Critical**. This is accurate to reality and good for conversion, but know the distribution up front so the result doesn't feel "rigged" — the red-flag copy must clearly justify *why* (it does).
3. **Q3 maxes fast.** Two sensitive categories (8+8=16, cap 14) max the health bucket. Most real pharmacies handle ≥2. Intended, but means the health-bucket "Critical" status is near-default — ensure the recommendation copy stays specific, not alarmist.

---

## 8. Acceptance criteria

- [ ] `pharmaciesPack.reportType === "pharmacy"`, length ≤10; matches client-sent + DB.
- [ ] Σ caps = 112; bucket maxima derive to 30/14/14/24/30; no hand-set normalization.
- [ ] `layer` set on all 10 questions (exposure 58 / control 54).
- [ ] 8 override entries present, all raise-only; Override-3 pair behaves Moderate→High.
- [ ] No negative-point options (plain additive); confirm no accidental engine coupling.
- [ ] Health-data copy uses glossary-consistent "high-impact health data" framing — no statutory "sensitive data" claim.
- [ ] All surfaces updated in the **shared Hotels+Pharmacies commit**; Vercel route count grows by **4** (2 assessment + 2 industry) total for the pair.
- [ ] `report_type "pharmacy"` round-trips through admin/report without "General".
- [ ] Hero sector count moved off "4" in the same ship.
- [ ] Deep-diagnostic Q11–Q15 excluded.
