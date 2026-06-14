# SaralPrivacy — Sector Consistency Refactor + 12-Industry Expansion

**Owner:** Dilip Sahu · **Status:** Spec (no code yet) · **Date:** 2026-06-14
**Workflow gate:** spec → `/plan-design-review` (avg ≥8) → build (per Industry Assessment Workflow)

---

## 1. Problem (one paragraph)

The product has moved from "DPDPA education site" to "8-sector readiness platform," but several surfaces still hardcode the original **4 sectors**. The contradiction is visible on the homepage itself (hero stat says "4" while 8 cards render below it). For a *privacy/governance* brand, this inconsistency reads as weak governance — it is a **trust leak**, not a cosmetic issue. Root cause: **there is no single source of truth for sectors** — sector lists are hand-typed across ≥6 files, so every new pack silently creates drift.

This spec does two things in one coordinated change:
- **Part A — Governance fix:** introduce a `SECTORS` config as the single source of truth and wire every sector surface to it.
- **Part B — Expansion:** add **4 new industry assessment packs (9–12)** so the platform covers **12 sectors**, with zero new drift because they flow from the same config.

Out of scope (separate specs): industry-page redesign template, sector-specific lead-magnet packs, internal-linking rule for briefings, press/media hub, white-paper PDF v2.

---

## 2. Confirmed drift inventory (code-verified 2026-06-14)

| # | Surface | File / line | Current (wrong) | Fix source |
|---|---------|-------------|-----------------|------------|
| 1 | Hero stat strip | `components/home/HeroSection.tsx:9` | `value: "4"` "Industries covered" | derive / restate |
| 2 | Consultation CTA | `components/home/ConsultationCTA.tsx:33` | "recruitment, accounting, training, and D2C" | reword |
| 3 | Homepage white-paper block | `components/home/WhitePaperSection.tsx:7` | "recruitment, CA firms, training, D2C" | reword |
| 4 | About — industry guides | `app/about/page.tsx:69` | 4-sector list | reword + config |
| 5 | About — who-it-serves list | `app/about/page.tsx:90+` | 4-sector list | from `SECTORS` |
| 6 | White-paper page intro | `app/white-paper/page.tsx:30` | 4-sector framing | reword (honest) |
| 7 | White-paper bullet | `app/white-paper/WhitePaperContent.tsx:36` | "Sector breakdown — …D2C" | reword (honest) |
| 8 | White-paper form dropdown | `app/white-paper/WhitePaperContent.tsx:11-17` | 7 options ≠ taxonomy | from `SECTORS` (+extras) |
| 9 | Assessment hub "how it works" | `app/assessment/SurveyClient.tsx:752` | "Answer 12 quick questions" | reword sector-agnostic |
| 10 | Homepage cards | `components/home/AudienceCards.tsx` | hand-typed 8 | from `SECTORS` |
| 11 | Industries index + risk table | `app/industries/page.tsx` | hand-typed 8 array + 8 hardcoded `<td>` rows | from `SECTORS` |
| 12 | Footer industry links | footer component | hand-typed | from `SECTORS` |
| 13 | Sitemap | sitemap route | hand-typed | from `SECTORS` |

> **Do NOT touch:** `AssessmentCTA.tsx:59` "across four dimensions" — that is the scoring engine's 4–5 dimensions, **not** sectors. Correct as-is. Flagged so nobody "fixes" it into a bug.

---

## 3. Part A — `SECTORS` single source of truth

### 3.1 Config shape

New file: `lib/data/sectors.ts`

```ts
export interface Sector {
  slug: string;            // industry page slug, e.g. "ca-firms"
  label: string;           // canonical display label
  shortLabel: string;      // card title / compact contexts
  assessmentSlug: string;  // /assessment/{assessmentSlug}
  reportType: string;      // ≤10 chars — MUST equal pack.reportType
  icon: string;            // lucide icon name
  accent: string;          // tailwind hue token, e.g. "indigo"
  riskTheme: string;       // one-line primary risk (industries table)
  painPoints: string[];    // 4 bullets for homepage card
  promise: string;         // card CTA promise line
  live: boolean;           // gate for surfacing
  order: number;           // canonical display order
}

export const SECTORS: Sector[] = [ /* 12 entries */ ];
export const LIVE_SECTORS = SECTORS.filter(s => s.live).sort((a,b)=>a.order-b.order);
export const SECTOR_COUNT = LIVE_SECTORS.length; // hero stat reads this
```

### 3.2 Canonical 12-sector taxonomy (use these labels EVERYWHERE)

| # | label | slug | assessmentSlug | reportType (≤10) | icon | accent |
|---|-------|------|----------------|------------------|------|--------|
| 1 | Recruitment & Staffing | `recruitment-agencies` | `recruitment` | `recruit` | Users | teal |
| 2 | CA & Accounting Firms | `ca-firms` | `ca-firms` | `ca-firm` | Calculator | indigo |
| 3 | Training & Coaching Institutes | `training-institutes` | `training-institutes` | `training` | GraduationCap | amber |
| 4 | D2C & E-commerce Brands | `d2c-brands` | `d2c-brands` | `d2c` | ShoppingBag | rose |
| 5 | Clinics & Diagnostic Labs | `clinics-diagnostic-labs` | `clinics-diagnostic-labs` | `clinic` | Stethoscope | cyan |
| 6 | Schools & Colleges | `schools-colleges` | `schools-colleges` | `school` | School | sky |
| 7 | Law Firms & Legal Consultants | `law-firms` | `law-firms` | `law-firm` | Scale | violet |
| 8 | Real Estate & Property Firms | `real-estate` | `real-estate` | `realty` | Building2 | emerald |
| 9 | Hotels, Hospitality & Travel | `hotels-hospitality` | `hospitality` | `hotel` | Hotel | orange |
| 10 | Pharmacies & Online Pharmacies | `pharmacies` | `pharmacies` | `pharmacy` | Pill | purple |
| 11 | Fintech, NBFC & Digital Payments | `fintech-nbfc` | `fintech` | `fintech` | Wallet | blue |
| 12 | Gyms, Salons & Spas | `gyms-salons-spas` | `gyms-salons` | `wellness` | Dumbbell | fuchsia |

**Hard rules carried from memory:**
- `reportType` token ≤10 chars; `pack.reportType` == client-sent == DB-stored. Token ≠ slug when slug >10 chars (`real-estate`→`realty`, `hotels-hospitality`→`hotel`, `gyms-salons-spas`→`wellness`).
- Tailwind accent hues must be **safelisted** (or use full class strings) so JIT doesn't purge dynamically-built classes. Cards currently use static class strings — keep that pattern: store explicit `accentBg/Border/Text/iconBg/iconColor` strings in config, not interpolated `bg-${accent}-50`.

### 3.3 Consumers to rewire (all read `LIVE_SECTORS` / `SECTOR_COUNT`)

1. `HeroSection.tsx` stat → **recommendation:** drop the sector-count stat entirely (see §5 design); if kept, render `${SECTOR_COUNT} sector assessments`.
2. `AudienceCards.tsx` → `.map(LIVE_SECTORS)`.
3. `app/industries/page.tsx` → both the cards array **and** the risk `<table>` rows generated from `LIVE_SECTORS` (kills the worst hand-typed surface).
4. Footer industries list → `LIVE_SECTORS`.
5. `app/sitemap.ts` → industry + assessment URLs from `LIVE_SECTORS`.
6. White-paper dropdown → `LIVE_SECTORS` mapped to `{value: assessmentSlug, label}` + appended commercial extras `Healthcare`, `Other / General Business`. (Fintech now a real sector, no longer an "extra".)
7. Copy surfaces (#2,3,4,6,7,9 in §2) → reworded; where a list is shown, generate from `LIVE_SECTORS` or use "12 sectors" phrasing that won't drift.

### 3.4 Copy fixes (exact replacements)

- **Consultation CTA:** "We help Indian businesses turn sector-specific DPDPA risk into practical controls, templates, and operating steps." (premium, list-free, drift-proof)
- **Assessment hub:** "Answer 12 quick questions…" → **"Answer a short, sector-specific diagnostic"** (count-agnostic — survives pack changes).
- **White-paper (honest until PDF updated):** "Sector deep-dives for recruitment, CA firms, training institutes, and D2C brands — plus a practical DPDPA readiness framework any Indian business can apply." Do **not** claim 12-sector depth until the PDF contains it.

---

## 4. Part B — 4 new industry packs (9–12)

Each pack is a new file in `lib/data/industry-assessment/packs/` + one line in `index.ts` `INDUSTRY_PACKS`. **No engine change** unless a credit/floor option is introduced (clinic/school precedent). Each pack follows the reference structure (real-estate is newest reference): 5 buckets, 10 questions (Q1–Q10), two-lens split (exposure vs control), caps summing to ~110–116, raise-only overrides, flag rules, bands.

> **Per-pack workflow gate (mandatory):** each pack must independently pass `/plan-design-review` ≥8 **before** its build. This spec covers the *system*; the four packs get their content design-reviewed individually (the homepage/index/template UI is reviewed in §5 now).

### Pack 9 — Hotels, Hospitality & Travel · `hotel`
- **Risk theme:** Guest IDs, passport/visa copies, booking history, OTA/channel-manager sharing, travel documents, CCTV, loyalty data.
- **Buckets (draft):** Guest & booking data · ID & travel-document risk · OTA/channel & vendor sharing · Staff/front-desk & CRM access · Retention & incident readiness.
- **Exposure-heavy** (passport/ID scans, OTA onward-sharing). Likely plain additive.

### Pack 10 — Pharmacies & Online Pharmacies · `pharmacy`
- **Risk theme:** Prescriptions, medicine/refill history, health indicators, doctor details, delivery address, online-order PII.
- **Buckets (draft):** Prescription & health data · Customer order & contact data · Online/app & payment data · Staff & counter access · Retention & sharing (suppliers/aggregators).
- **High-sensitivity health data** → consider a "documented controls" credit option (reuse engine floor-at-0; no engine change).

### Pack 11 — Fintech, NBFC & Digital Payments · `fintech`
- **Risk theme:** KYC, PAN/Aadhaar, bank data, UPI, credit profiling, collection agents, third-party data sharing.
- **Buckets (draft):** KYC & identity data · Financial & transaction data · Profiling/decisioning · Agent/vendor & collection sharing · Security, retention & incident readiness.
- **Highest-stakes pack** — heaviest control lens; align language with RBI/data-localisation nuance without overclaiming.

### Pack 12 — Gyms, Salons & Spas · `wellness`
- **Risk theme:** Membership data, health/fitness details, before/after photos, appointment apps, WhatsApp campaigns, biometric check-in.
- **Buckets (draft):** Member & health/fitness data · Photos & biometric check-in · Appointment app & booking data · Staff/trainer & franchise access · Marketing consent & retention.
- **Exposure + marketing-consent** focus; lighter than fintech.

### Per-pack surfacing checklist (same commit as pack)
For each new sector: pack file + registry line · `/assessment/{slug}` route wiring · `/industries/{slug}` page · homepage card (auto via `SECTORS`) · industries table row (auto) · footer link (auto) · sitemap (auto) · Starter Checklist PDF generator + `leadMagnet` + email `checklistUrl` (per existing 8-PDF pattern) · admin/report branch (pack-aware, already generic via `getPackByReportType`).

---

## 5. Design notes for review (feeds §6)

- **Homepage grid at 12 cards:** current `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`. 12 = clean **4×3** (lg) / **6×2** (md) / 12×1 (mobile). Orphan-centering hack becomes a no-op — harmless, keep. No layout surgery needed.
- **Hero stat:** recommend replacing "Industries covered: 4/8/12" with an **outcome** stat ("3-min risk scan" / "Free" / "200+ briefings"). Counting sectors in the hero invites the exact drift we're removing.
- **12 accent hues** are distinct and tasteful (teal, indigo, amber, rose, cyan, sky, violet, emerald, orange, purple, blue, fuchsia). Risk: at 12 cards the page gets visually busy — mitigate with consistent card structure, muted accent backgrounds (50/100 tints already), and a single shared card component.
- **Industries risk table at 12 rows:** generated rows keep columns consistent (Sector · Data types · Highest risk · First fix · Start →). Watch mobile: 5-col table must scroll or collapse to stacked cards on `sm`.
- **New industry pages** must match the existing sector-page template exactly (hook → exposure → data handled → top risks → 3-min scan CTA → "no real personal data" reassurance → what the scan checks → FAQ → template → consultation). No bespoke layouts.

---

## 6. Acceptance criteria

- [ ] Grep for "4 industries", "recruitment, accounting, training", "12 quick questions" returns **zero** matches in `app/` and `components/`.
- [ ] All sector surfaces (hero, cards, industries index+table, footer, white-paper dropdown, About, sitemap) render from `LIVE_SECTORS`; adding a 13th sector touches **only** `sectors.ts` + the pack.
- [ ] `SECTOR_COUNT` === number of live packs; no literal sector count typed anywhere.
- [ ] 12 packs registered; each `pack.reportType` ≤10 chars and matches its `SECTORS` entry.
- [ ] Each new pack independently design-reviewed ≥8 before build.
- [ ] White-paper claims match actual PDF contents (no overclaim).
- [ ] Route count in Vercel build log grows by the 4 new assessment + 4 industry routes after deploy.

---

## 7. Sequencing

1. **P0 (half-day):** `sectors.ts` for existing 8 + rewire all consumers + copy fixes. Ships the trust fix immediately, independent of new packs.
2. **P1:** build packs 9–12 one at a time, each gated by its own `/plan-design-review` ≥8, flip `live:true` per pack, ship per-pack with its checklist PDF.
3. Each pack deploy: verify Vercel route count grew; verify `report_type` round-trips (no "General" misclassification).
