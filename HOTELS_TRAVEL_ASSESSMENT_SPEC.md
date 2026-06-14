# Pack 9 — Hotels, Hospitality & Travel · DPDPA Assessment Spec

**Owner:** Dilip Sahu · **Status:** Spec (no code) · **Date:** 2026-06-14
**Sequence:** Pack 9 of the 4-pack expansion (9–12), then landing-page optimization.
**Content source of truth:** the v2.0 design you supplied (questions, scoring, copy, overrides, result UI). This spec does **not** restate that content — it maps it onto the existing `IndustryPack` engine and records the reconciliation decisions, surfacing checklist, QA flags, and acceptance criteria a developer needs to build it cleanly.
**Gate:** this spec → `/plan-design-review` (≥8) → build.

---

## 1. Identity & routing (reconciled to conventions)

| Field | Value | Note |
|---|---|---|
| Pack file | `lib/data/industry-assessment/packs/hotels-travel.ts` | export `hotelsTravelPack` |
| Registry line | `"hotels-travel": hotelsTravelPack` in `index.ts` `INDUSTRY_PACKS` | only engine touch-point |
| Industry slug | `hotels-travel` | `/industries/hotels-travel` |
| Assessment route | `/assessment/hotels-travel` | matches your spec |
| **`reportType` token** | **`hotel`** | **≤10-char rule** — "hotels-travel" (13) and "hospitality" (11) both overflow Appwrite `report_type` `string(10)`. Token ≠ slug, same pattern as `real-estate`→`realty`. |
| Card accent / icon | `orange` / lucide `Hotel` | distinct from existing 8 hues |

**Critical rule (from memory):** `pack.reportType` == client-sent == DB-stored == `hotel`. Client sends `pack.reportType`, never a hardcoded string, or `getPackByReportType` misclassifies rows as "General".

---

## 2. Engine mapping — what slots where (NO engine change)

Your v2.0 maps 1:1 onto `core.ts` contracts:

| Your spec field | Engine field (`core.ts`) |
|---|---|
| option `riskPoints` | `IAOption.riskPoints` ✓ identical |
| `helper` | `IAQuestion.helpText` |
| "Why this matters" prose | `IAQuestion.whyThisMatters` (collapsible) |
| `badge` | `IAQuestion.badge` |
| `weight` / `cap` | `IAQuestion.cap` (required) |
| bucket string | `IAQuestion.bucket` → `IABucket.key` |
| bucket `{label, meaning}` | `IABucket.label` / `.meaning` |
| overrides ("minimum band") | `IAOverride.minBand` (raise-only) + `.flag` |
| red-flag messages | `IAFlagRule` / per-bucket flag copy |
| result band copy | `IndustryPack.bandCopy` |

**The −4 credit option (Q8 `documented_controls`) requires no engine work.** `questionRisk()` = `Math.max(0, Math.min(cap, sum))` already floors the question total at 0 (added for the schools pack, reused by law-firms). Confirmed at `core.ts:140`.

---

## 3. Scoring — verified against the engine model

- **Per-question caps** (Q1–Q10): 8 / 12 / 14 / 10 / 12 / 14 / 12 / 10 / 10 / 10 = **Σ 112**. Engine normalizes by Σ caps automatically (`riskScore = round(raw/112*100)`), so the "convert to 100" step in your spec is built in — **do not hand-implement it.**
- **Bucket maxima derive from question caps** (don't hand-set them):
  - `guest_traveller_data` = Q1(8)+Q2(12) = **20** ✓
  - `id_passport_travel_document` = Q3(14)+Q4(10) = **24** ✓
  - `booking_ota_vendor_sharing` = Q6(14) = **14** ✓
  - `system_staff_access` = Q5(12)+Q7(12)+Q8(10) = **34** ✓
  - `retention_marketing_incident` = Q9(10)+Q10(10) = **20** ✓ · **Σ 112** ✓
- **Bands** (your 0–24 / 25–49 / 50–74 / 75–100) map to the shared `bands.ts` `BandLabel` set (Controlled / Moderate / High / Critical). Use the shared band system; only `bandCopy` is pack-specific.

### Two-lens (`layer`) assignment — to add (your spec omits it; engine expects it)
- **exposure** (what data you're exposed to): Q1, Q2, Q3, Q4, Q6 → caps 8+12+14+10+14 = **58**
- **control** (how well you control it): Q5, Q7, Q8, Q9, Q10 → caps 12+12+10+10+10 = **54**
- Clean 58/54 split. Used by the result page's two-lens framing, consistent with packs 5–8.

---

## 4. Overrides — 7 raise-only, mapped to `IAOverride[]`

All seven are "minimum band" = raise-only, which is the only mode the engine supports. The Override-4 two-step (Moderate, escalating to High) is implemented as **two separate overrides**; because raise-only takes the max, listing both is correct (same pattern as real-estate's conditional Moderate→High pair).

| # | Trigger (predicate over selected option ids) | `minBand` |
|---|---|---|
| 1 | Q3 ∈ {passport, visa} **AND** Q4 ∈ {whatsapp, email} | High |
| 2 | Q3 ∋ foreign_guest_cform **AND** Q9 ∈ {indefinitely, not_sure} | High |
| 3 | Q7 ∈ {shared_logins, ex_staff_vendor_access} | High |
| 4a | Q1 ∋ visa_passport_docs **AND** Q6 ∈ {visa_consultant, travel_insurance, partner_hotels} | Moderate |
| 4b | (4a) **AND** Q4 ∈ {whatsapp, email} | High |
| 5 | Q8 ∈ {cctv_sensitive, keycard_logs, wifi_logs} **AND** Q8 ∌ documented_controls | High |
| 6 | Q9 = indefinitely **AND** Q3 ∈ {aadhaar, passport, visa, other_govt_id, travel_insurance, minor_docs} | High |
| 7 | Q10 = no_standard_process **AND** Q5 ∈ {whatsapp, email_inboxes, staff_phones, frontdesk_devices, multiple_no_sot} | High |

**`documented_controls` does double duty:** it both grants the −4 credit and disarms Override 5 (the `Q8 ∌ documented_controls` clause). This is the intended escape hatch — a hotel with documented monitoring controls is neither penalized nor force-escalated. Consistent with clinics/schools.

---

## 5. Scope decisions

- **Build the 10-question scan only.** Q11–Q15 (promotions, C-Form, children's data, freelance agents, OTA data download) are the **deep-diagnostic** layer — parked for a future 20–25 Q version, not in this pack.
- **`not_sure` is mutually exclusive** in every multi-select (selecting it clears others), per existing pack convention. No override depends on a `not_sure`+other combination, so no special handling.
- **Lead form** uses the existing assessment lead-capture component; the 9 fields you listed map to existing fields — no new form schema. Email-after-effort pattern unchanged.

---

## 6. Surfacing checklist (same commit as the pack)

> Sequencing note: the full `SECTORS` single-source-of-truth refactor is the **later landing-page phase**. For now, surface this pack the existing hand-edit way — but see the guardrail.

- [ ] Pack file + `index.ts` registry line
- [ ] `/assessment/hotels-travel` route wired to `hotelsTravelPack`
- [ ] `/industries/hotels-travel` page (existing sector-page template; hero/thesis/chips from your §16/§23 copy)
- [ ] Homepage card in `components/home/AudienceCards.tsx` (orange / `Hotel` / painPoints from chips)
- [ ] Industries index array **and** risk-table row in `app/industries/page.tsx` (riskTheme: "Guest IDs, passport copies, OTA sharing, old guest-record retention")
- [ ] Footer industries list + `app/sitemap.ts`
- [ ] Starter Checklist PDF: `tools/build-hotel-checklist.mjs` (10 sections from your §22) → `public/templates/hotels-travel-dpdpa-starter-checklist.pdf`; wire `leadMagnet` + email `checklistUrl` (per the existing 8-PDF pattern)
- [ ] Admin + report pages: already pack-aware via `getPackByReportType("hotel")` — no change needed
- [ ] **Guardrail:** this makes 9 live sectors. Bump the hero stat `HeroSection.tsx:9` off the literal `"4"` (even though the full refactor comes later, shipping a 9th sector while the hero says "4" deepens the trust leak). Minimum: set to `9` or remove the count.

---

## 7. QA / calibration flags (raise before build, not blockers)

1. **Override 5 may over-fire.** Wi-Fi-login-records *alone*, without documented controls, forces **High Risk** — even for a business otherwise Controlled across IDs, sharing, retention. A small boutique stay with guest Wi-Fi logging could land High purely on monitoring. *Decision needed:* is Wi-Fi-logs-alone enough to force High, or should Override 5 require `cctv_sensitive OR keycard_logs` (drop `wifi_logs` from the trigger, keep it as a scored option)? Recommend the latter for calibration parity with clinics/schools.
2. **Credit option barely moves the score.** A careful hotel selecting `documented_controls` plus its actual systems still caps Q8 at 10 (positives outweigh −4). The −4 mainly disarms Override 5 rather than rewarding good practice — same behavior as clinics/school precedent, so keep for consistency, but know it's a near-symbolic score credit.
3. **Q1 "Online travel/booking platform" (6 pts)** — if a user is a pure OTA, the scan's hotel-centric framing (front desk, CCTV, key-card) reads slightly off. Acceptable for v1; the deep version can branch.

---

## 8. Acceptance criteria

- [ ] `hotelsTravelPack.reportType === "hotel"`, length ≤10; matches client-sent + DB.
- [ ] Σ caps = 112; bucket maxima derive to 20/24/14/34/20; no hand-set normalization.
- [ ] `layer` set on all 10 questions (exposure 58 / control 54).
- [ ] 7 overrides present, all raise-only; Override-4 pair behaves Moderate→High.
- [ ] Q8 `documented_controls` = −4 with **no engine edit**; a Q8-only `documented_controls` answer floors to 0, not negative.
- [ ] All 9 surfaces updated in one commit; Vercel route count grows by 2 (assessment + industry).
- [ ] `report_type "hotel"` round-trips through admin/report without "General" misclassification.
- [ ] Pack independently `/plan-design-review` ≥8 before build (this doc + the review that follows).
- [ ] Deep-diagnostic Q11–Q15 explicitly excluded from this build.
