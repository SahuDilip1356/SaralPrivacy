# SaralPrivacy — D2C Brand DPDPA Assessment v2.0 — Build Spec

**Status:** Draft for design review → build
**Date:** 2026-06-08
**Engine:** Shared `lib/data/industry-assessment/` (zero engine changes) — D2C is a new pack (4th industry)
**Reference:** CA Firms + Training Institutes + Recruitment Agencies (all live). Pack-aware admin + report support new packs automatically.
**Authoritative option text:** the founder's brief (verbatim labels + riskPoints). This spec captures build-critical structure, decisions, and deltas.

---

## 0. Positioning

- **Route (assessment):** `/assessment/d2c-brands` (override the legacy generic page in place)
- **Marketing page:** `/industries/d2c-brands` (rewrite existing)
- **Pack key (`industry`):** `d2c-brands` (matches cta-copy key + industries slug + existing route — fully consistent)
- **`report_type`:** `d2c` (3 chars ≤ Appwrite `string(10)`; client sends `pack.reportType`)

**Hero:** "Your D2C brand does not just sell products. It tracks, messages and retargets customers every day."
**Thesis sub-line:** "Most D2C brands don't have a customer-data problem — they have a marketing-data *control* problem."
**CTA:** Start D2C Brand Risk Scan · **Microline:** 3 minutes · 10 questions · free · no login
**Trust chips:** Customer Data · WhatsApp Marketing · SMS · Email Campaigns · Meta Pixel · Cart Abandonment · Retargeting · Logistics Partners · Payment Gateway · Unsubscribe · Loyalty · Marketplace Data

**Audience:** Shopify/WooCommerce brands, Instagram-first & WhatsApp commerce, marketplace sellers, beauty/apparel/food/wellness/home brands, subscription boxes, omnichannel retail.

**Core thesis:** D2C brands fail privacy because customer data spreads across Shopify/WooCommerce, WhatsApp, Meta/Google Ads, pixels, cart tools, email/SMS, payment, logistics, CRM, marketplaces, support inboxes and loyalty campaigns. The scan reframes risk from "checkout forms" to "marketing automation, retargeting, WhatsApp campaigns, logistics sharing and preference handling."

---

## 1. Locked decisions (this session)

| # | Decision | Rationale |
|---|----------|-----------|
| D1 | **Shared engine + new `packs/d2c-brands.ts`** | 4th industry; zero engine changes (normalises by Σ caps = 110) |
| D2 | **`report_type` = `d2c`** (client sends `pack.reportType`) | ≤10-char Appwrite limit; single source so client/pack/DB never drift |
| D3 | **Route `/assessment/d2c-brands`** (override legacy) · pack key `d2c-brands` | Slug already consistent across routes/cta — no reconciliation |
| D4 | **Two-lens:** exposure = Q1, Q2, Q7, Q8 (50) · control = Q3, Q4, Q5, Q6, Q9, Q10 (60) | data/tools/vendors = exposure; consent/preferences/access/retention = control |
| D5 | **4-tier bucket band** on result risk-map | Same as CA/Training/Recruitment |
| D6 | **Email guard:** add `d2c` to the `isIndustry` check (`categoryScores: undefined`) | D2C bucket keys ≠ general 6 → would NaN the scorecard |
| D7 | **5-field lead form** — Name · Brand name · Email · Phone/WhatsApp · City | Channel (Q1) + campaigns (Q6) already captured; brief's 10 fields trimmed |
| D8 | **Starter Checklist PDF DEFERRED** (no `leadMagnet`) | Like Training; result page shows the 5 priority controls, add PDF in a follow-up |
| D9 | **Deep-diagnostic Q11–Q15 deferred** (children, UGC-in-ads, marketplace reuse, health depth, breach) | Keep TOFU at 10 Q; logged |

⚠️ **Children's data (Section 9)** and **UGC-in-ads consent** sit in the deferred deep-diagnostic (Q11/Q12). Health/body data IS in TOFU (Q2 + Override 5). Logged.

---

## 2. Risk buckets (5)

| Key | Label | Meaning (result risk-map) |
|-----|-------|---------------------------|
| `customer_data_collection` | Customer data collection risk | Customer data may be collected across many storefronts, marketplaces and channels |
| `marketing_consent` | Marketing consent risk | Promotional WhatsApp/SMS/email or lifecycle campaigns may lack strong opt-in evidence |
| `tracking_adtech` | Tracking & adtech risk | Pixels, retargeting or analytics tools may create hidden customer-data flows |
| `vendor_fulfilment` | Vendor & fulfilment risk | Payment, logistics, CRM, plugin or agency vendors may receive customer data |
| `retention_preferences` | Retention & preference readiness risk | Old customer data and opt-outs may not be managed consistently |

---

## 3. Questions (caps · bucket · layer) — option text + riskPoints per brief §4/§19

| Q | Badge | Type | Cap | Bucket | Layer |
|---|-------|------|-----|--------|-------|
| Q1 | Store Profile | multi | 8 | customer_data_collection | exposure |
| Q2 | Customer Data Risk | multi | 14 | customer_data_collection | exposure |
| Q3 | Customer Communication Risk | multi | 10 | marketing_consent | control |
| Q4 | Marketing Consent | single | 12 | marketing_consent | control |
| Q5 | Unsubscribe & Preference Management | single | 10 | retention_preferences | control |
| Q6 | Lifecycle Marketing Risk | multi | 10 | marketing_consent | control |
| Q7 | Tracking & Adtech Risk | multi | 14 | tracking_adtech | exposure |
| Q8 | Vendor & Fulfilment Risk | multi | 14 | vendor_fulfilment | exposure |
| Q9 | Admin & Account Access Risk | single | 10 | vendor_fulfilment | control |
| Q10 | Retention & Preference Readiness | single | 8 | retention_preferences | control |

**`mutuallyExclusive`:** `not_sure` on every multi (Q1, Q2, Q3, Q6, Q7, Q8); also the "none" options (`no_lifecycle`, `no_tracking`, `no_vendors`) clear others. Option ids + riskPoints exactly per brief §19.

---

## 4. Scoring model (shared engine)

```
rawRisk   = Σ min(cap, Σ selected riskPoints);  maxRisk = Σ caps = 110
riskScore = round(rawRisk / 110 * 100)
band      = getBandByScore → applyOverrides (raise-only) → floor riskScore to band.min
readiness = 100 − riskScore
```
Bands: Controlled 0–24 · Moderate 25–49 · High 50–74 · Critical 75–100.

---

## 5. Overrides (raise-only) — per brief §8/§21

| # | id | Condition | Min band |
|---|----|-----------|----------|
| 1 | `promos_no_optin` | Q4 = `send_until_complain` | High |
| 2 | `no_unsubscribe` | Q5 = `no_clear_process` | High |
| 3 | `tracking_unclear` | Q7 ∋ {agency_scripts, not_sure} | Moderate |
| 3b | `tracking_unclear_profiling` | Q7 ∋ {agency_scripts, not_sure} AND Q6 ∋ segmentation_lookalike | High |
| 4 | `shared_or_exstaff_access` | Q9 ∈ {shared_logins, ex_staff_agency_access} | High |
| 5 | `health_profiling` | Q2 ∋ health_body AND Q6 ∋ {recommendations, segmentation_lookalike} | High |
| 6 | `marketplace_reuse_promo` | Q2 ∋ marketplace_exports AND Q3 ∋ {whatsapp_promotions, sms_campaigns, email_offers} | High |
| 7 | `no_central_preference` | Q3 ∋ multiple_no_preference | Moderate |
| 7b | `no_pref_no_unsub` | Q3 ∋ multiple_no_preference AND Q5 = `no_clear_process` | High |

(Max band reached = High; no Critical override — engine still allows Critical via raw score.)

---

## 6. Soft flags & recommendations

- **Soft flags** (top-3 fill): per brief §10 — customer-data sprawl/health data; promo-without-opt-in & no-preference; pixel/retargeting/agency-script tracking; vendor sprawl & shared logins; indefinite retention & manual opt-out.
- **`recommend(r)`** — High/Critical → the **5 immediate controls** (brief §13); else bucket-targeted (brief §11), priority: marketing_consent → tracking_adtech → customer_data_collection → vendor_fulfilment → retention_preferences.
- **`bandCopy`** — the 4 result-band paragraphs (brief §12), in the pack (shared by client + report + email).

---

## 7. Result · 8. Lead form · 9. Marketing page

- **Result:** headline "Your D2C Brand DPDPA Readiness Score" · readiness gauge + band · two-lens bars · top-3 flags · 5-bucket 4-tier risk map · gated 5-control block · "Get a D2C Brand DPDPA Gap Review" CTA. Reuses components; opens on Q1; **no PDF download** (D8 — deferred).
- **Lead form (5):** Name · Brand name · Email · Phone/WhatsApp · City (+ honeypot).
- **Marketing `/industries/d2c-brands`:** rewrite around the 5 buckets (BUCKET_DETAIL), how-it-works, "what the scan checks", preserve existing FAQs + SEO; sidebar scan CTA. Update `cta-copy.ts` `d2c-brands` href → `/assessment/d2c-brands`.

---

## 10. Deferred (logged)

- Deep diagnostic (20–25 Q): **children's data (Section 9)**, UGC/reviews-in-ads consent, marketplace-export reuse, health/wellness depth, breach-response process.
- D2C Starter Checklist PDF (brief §22) — follow-up phase (same Playwright pattern as CA/Recruitment).

---

## 11. Implementation file map

| File | Action |
|------|--------|
| `lib/data/industry-assessment/packs/d2c-brands.ts` | NEW pack (no `leadMagnet`) |
| `lib/data/industry-assessment/index.ts` | register pack |
| `app/assessment/d2c-brands/D2CAssessmentClient.tsx` + `page.tsx` | NEW client + override legacy page (noindex) |
| `app/industries/d2c-brands/page.tsx` | rewrite |
| `lib/cta-copy.ts` · `app/api/assessment/route.ts` | href + email guard (`d2c` → categoryScores undefined; no checklist) |

Engine / `bands.ts` / `core.ts`: **no change**.

---

## 12. Test matrix (mirror Recruitment's harness)

Structural (caps=110, buckets 22/32/14/24/18, two-lens 50/60) · band boundaries · clean→Controlled · worst→Critical (via raw score) · one test per override incl. 3/3b & 7/7b Moderate↔High · multi-select cap enforcement · `recommend()` priority · email guard `d2c` → `categoryScores: undefined`.

**Build gate:** harness green + `tsc` + `next build` clean → preview → review → prod.
