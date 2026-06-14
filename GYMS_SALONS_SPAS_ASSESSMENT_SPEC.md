# Pack 12 — Gyms, Salons & Spas · DPDPA Assessment Spec

**Owner:** Dilip Sahu · **Status:** Spec (no code) · **Date:** 2026-06-14
**Sequence:** Pack 12 — the final pack of the 9–12 expansion. **Built together with Pack 11 (Fintech/NBFC)** in one ship; then landing-page optimization. Lands the homepage on a clean **12-card 4×3 grid**.
**Content source of truth:** the v2.0 design you supplied. This spec maps it onto the `IndustryPack` engine; it does not restate your content.
**Gate:** this spec → `/plan-design-review` (≥8) → build.

---

## 1. Identity & routing

| Field | Value | Note |
|---|---|---|
| Pack file | `lib/data/industry-assessment/packs/gyms-salons-spas.ts` | export `gymsSalonsSpasPack` |
| Registry line | `"gyms-salons-spas": gymsSalonsSpasPack` in `index.ts` | only engine touch-point |
| Industry slug | `gyms-salons-spas` | `/industries/gyms-salons-spas` |
| Assessment route | `/assessment/gyms-salons-spas` | matches your spec |
| **`reportType` token** | **`wellness`** (8 chars) | ≤10 ✓. "gyms-salons-spas" is 15 chars; token ≠ slug, same pattern as `real-estate`→`realty`. |
| Card accent / icon | `fuchsia` / lucide `Sparkles` | `Sparkles` chosen over `Dumbbell` — covers salons/spas/beauty, not just gym; fuchsia is the last clearly-distinct hue |

`pack.reportType` == client-sent == DB-stored == `wellness`.

---

## 2. Engine mapping — NO engine change

Maps 1:1 onto `core.ts` like the prior 11 packs. **All option points ≥0 → plain additive, zero engine interaction** (no credit option).

---

## 3. Scoring — verified against the engine model

- **Per-question caps**: 8 / 12 / 12 / 10 / 12 / 10 / 14 / 12 / 10 / 10 = **Σ 110**. Engine normalizes by Σ caps (`riskScore = round(raw/110*100)`) — don't hand-implement.
- **Bucket maxima derive from caps**:
  - `customer_membership_data` = Q1(8)+Q2(12)+Q4(10) = **30** ✓
  - `health_body_consultation_data` = Q3(12) = **12** ✓
  - `photos_marketing_whatsapp` = Q5(12)+Q6(10) = **22** ✓
  - `app_staff_vendor_access` = Q7(14)+Q8(12) = **26** ✓
  - `retention_rights_incident` = Q9(10)+Q10(10) = **20** ✓ · **Σ 110** ✓
- **Bands**: shared `bands.ts`; only `bandCopy` is pack-specific.

### Two-lens (`layer`) assignment — to add
- **exposure** (what data you hold & where it flows): Q1, Q2, Q4, Q6, Q7 → 8+12+10+10+14 = **54**
- **control** (how well the sensitive stuff is governed): Q3, Q5, Q8, Q9, Q10 → 12+12+12+10+10 = **56**
- 54/56 — balanced. Q3 (health/body data controls), Q5 (photo consent), Q8 (staff access), Q9 (retention), Q10 (incident) are all governance questions whose risk accrues from weak control, so they sit in the control lens (same logic as the Fintech pack). Buckets and lenses are independent — Q5/Q6 split across lenses while sharing the `photos_marketing_whatsapp` bucket, which is fine.

---

## 4. Overrides — 9 raise-only entries (incl. two Moderate→High pairs)

Two conditional pairs (Override 3 and Override 5), same mechanism as Schools/Real-Estate. All raise-only.

| # | Trigger (selected option ids) | `minBand` |
|---|---|---|
| 1 | Q5 = no_separate_consent | High |
| 2 | (Q3 = apps_whatsapp_notes_no_control **OR** Q2 ∋ health_declaration) **AND** (Q4 ∈ {whatsapp, personal_phone_photos}) | High |
| 3a | Q8 = personal_phone_whatsapp | Moderate |
| 3b | (3a) **AND** (photo or health/body data present¹) | High |
| 4 | Q8 ∈ {shared_logins, ex_staff_vendor_access} | High |
| 5a | Q7 ∋ fitness_biometric_device | Moderate |
| 5b | (5a) **AND** Q3 = informal_controls | High |
| 6 | Q9 = indefinitely **AND** (photo or health/body data present¹) | High |
| 7 | Q10 = no_standard_process **AND** (photo or health/body data present¹) | High |

¹ *"photo or health/body data present"* = Q2 ∈ {photos_videos, fitness_body_data, health_declaration, consultation_notes} **OR** Q5 = no_separate_consent **OR** Q3 ∈ {apps_whatsapp_notes_no_control, informal_controls}. Define once as a helper and reuse across Overrides 3b/6/7 (mirrors how `hasPhotoData`/`hasHealthBodyData` are factored in your §21 skeleton).

---

## 5. Scope decisions

- **10-question scan only.** Q11–Q15 (photo-removal rights, minors' data, biometric/body-analysis devices, staff personal social media, promo opt-out) are the deep-diagnostic layer — parked.
- **`not_sure` mutually exclusive** in every multi-select; lead form uses the existing component.

---

## 6. Surfacing checklist (same commit; built alongside Fintech)

- [ ] Pack file + `index.ts` registry line
- [ ] `/assessment/gyms-salons-spas` route + client (clone newest, swap pack + strings)
- [ ] `/industries/gyms-salons-spas` page (existing template; copy from your §16/§23)
- [ ] Homepage card in `AudienceCards.tsx` (fuchsia / `Sparkles`)
- [ ] Industries index array **and** risk-table row (riskTheme: "Membership, health/body data, customer photos, WhatsApp campaigns, staff phones")
- [ ] Footer + Header + `app/sitemap.ts` (`industryPages[]`)
- [ ] Starter Checklist PDF: `tools/build-wellness-checklist.mjs` (10 sections from your §22) → `public/templates/gyms-salons-spas-dpdpa-starter-checklist.pdf`; wire `leadMagnet` + email `checklistUrl`
- [ ] Admin/report: pack-aware via `getPackByReportType("wellness")` — no change
- [ ] **Hero stat → 12** (literal bump from the Fintech ship's "11"). **12 cards = clean 4×3 on lg** — the homepage finally fills the grid evenly; the orphan-centering hack becomes a no-op.

---

## 7. QA / legal-copy flags (raise before build)

1. **"High-impact health data," not "sensitive."** BMI, weight, injuries, allergies, body measurements, therapy notes are health-linked — but DPDPA has no special-category tier. Use "high-impact health data" / "health and body data," never a statutory "sensitive personal data" claim. Same lock as Pharmacy/Fintech.
2. **Photos are personal data — frame consent as DPDPA notice+consent.** Before-after/transformation/bridal images are personal data; using them for marketing needs consent + a removal route. Frame under DPDPA consent/withdrawal, not a generic "image rights" claim.
3. **Disclosure comfort (reassurance line).** The scan asks owners to admit they store body measurements, health declarations and customer photos. Put "this scan collects no customer photos, health notes or records — only your answers about your processes" in the intro hero and scan strip.
4. **Band skews High via the photo/biometric overrides.** Override 1 (photos without separate consent) alone forces High, and it's near-universal in this sector (everyone posts transformations/results). Expect most to land High/Critical — accurate and conversion-positive, but the zero-point "documented consent + removal" answer must visibly move the score so a careful studio can reach Controlled/Moderate.

---

## 8. Acceptance criteria

- [ ] `gymsSalonsSpasPack.reportType === "wellness"`, ≤10 chars; matches client-sent + DB.
- [ ] Σ caps = 110; bucket maxima derive to 30/12/22/26/20; no hand-set normalization; engine unchanged.
- [ ] `layer` set on all 10 questions (exposure 54 / control 56).
- [ ] 9 override entries, all raise-only; the two Moderate→High pairs (3a/3b, 5a/5b) behave correctly; shared "photo-or-health-data" helper reused.
- [ ] No negative-point options (plain additive).
- [ ] Health/photo copy uses "high-impact health data," DPDPA-scoped consent framing; no-customer-data reassurance present.
- [ ] All surfaces updated in the **shared Fintech+Wellness commit**; Vercel route count grows by **4** total for the pair; hero stat → 12; homepage 4×3.
- [ ] `report_type "wellness"` round-trips through admin + `/report/[token]` without "General".
- [ ] Pack independently `/plan-design-review` ≥8 (this doc + the review below).
- [ ] Deep-diagnostic Q11–Q15 excluded.
