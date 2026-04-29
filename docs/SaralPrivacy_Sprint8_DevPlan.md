# SaralPrivacy — Sprint 8 Development Plan
## Glossary + Penalty Risk Indicator + Internal Linking + Thin Content

**Date:** 2026-04-29  
**Sprint duration:** 2 weeks (2026-04-29 → 2026-05-13)  
**Pairs with:** SaralPrivacy_Sprint8_PRD.md

---

## Status Legend

| Symbol | Meaning |
|---|---|
| ✅ | Shipped to production |
| 🔄 | In progress |
| ⏳ | Pending — not started |
| 🚫 | Parked — deliberately deferred |

---

## Block 1 — Duplicate Public Files Cleanup ⏳ PENDING

**Goal:** Remove 13 macOS-generated `* 2.*` files from `public/` and `app/`. Zero effort, zero risk.  
**Estimated effort:** 10 minutes

### 1.1 Files to delete ⏳
```bash
rm "webapp/public/file 2.svg"
rm "webapp/public/globe 2.svg"
rm "webapp/public/googlebb55c3c7def99de4 2.html"
rm "webapp/public/llms 2.txt"
rm "webapp/public/llms-full 2.txt"
rm "webapp/public/logo 2.png"
rm "webapp/public/logo-emblem 2.png"
rm "webapp/public/next 2.svg"
rm "webapp/public/og-image 2.png"
rm "webapp/public/vercel 2.svg"
rm "webapp/public/window 2.svg"
rm "webapp/app/favicon 2.ico"
rm "webapp/app/icon 2.png"
```

### 1.2 Commit + deploy ⏳
- Single commit: `fix: remove macOS duplicate files from public/`
- No redirects needed — these should return 404

---

## Block 2 — `/glossary` Page ⏳ PENDING

**Goal:** Ship production-ready glossary with 57 terms (45 from Kimi + 12 from docx database).  
**Estimated effort:** 3–4 hours

### 2.1 Create page files ⏳
- `webapp/app/glossary/page.tsx` — server page, metadata, JSON-LD, breadcrumb
- `webapp/app/glossary/GlossaryClient.tsx` — client component, search + filter, term cards

**SEO metadata:**
```ts
title: "DPDPA Glossary: 50+ Key Terms Explained"
// renders as: "DPDPA Glossary: 50+ Key Terms Explained | SaralPrivacy" = 55 chars ✅
description: "Plain-English definitions of 50+ DPDPA terms: Data Fiduciary, Consent Manager, Significant Data Fiduciary, Data Principal, and more. Updated for DPDP Rules 2025."
canonical: "https://saralprivacy.com/glossary"
```

**Structured data:**
- `DefinedTermSet` schema with publisher: SaralPrivacy
- `BreadcrumbList` schema
- `WebPage` schema

### 2.2 Add 12 terms from docx database ⏳

Augment `GLOSSARY_TERMS` array with:

| Term | Category |
|---|---|
| Biometric Data | Core Concepts |
| Financial Data | Core Concepts |
| Affirmative Action (Consent) | Core Concepts |
| Informed Consent | Core Concepts |
| Unconditional Consent | Core Concepts |
| Publicly Available Data | Core Concepts |
| De-identified Data | Core Concepts |
| Duty of Data Principal | Compliance |
| Data Processing Agreement (DPA) | Compliance |
| Negative List | Regulation |
| Adjudicating Officer | Regulation |
| Algorithmic Transparency | Compliance |

**Dilip to review these 12 definitions before deploy.**

### 2.3 Fix seeAlso links ⏳
The Kimi code has one broken internal reference: `href: "/learn/rights-of-data-principal"` — correct to `/learn/rights`.

### 2.4 Add to navigation ⏳
- `webapp/components/layout/Header.tsx` — add "Glossary" link under DPDPA Guide dropdown

### 2.5 Add to sitemap ⏳
- `webapp/app/sitemap.ts` — add `/glossary` with `priority: 0.85`, `changeFrequency: "monthly"`

### 2.6 Add to llms.txt ⏳
```
- [DPDPA Glossary](https://saralprivacy.com/glossary): Plain-English definitions of 50+ DPDPA terms for Indian businesses.
```

### 2.7 Commit + deploy ⏳
- Single commit: `feat: add /glossary page with 57 DPDPA terms + search + DefinedTermSet schema`
- Submit to GSC for indexing

---

## Block 3 — `/penalty-calculator` Page (Rewritten) ⏳ PENDING

**Goal:** Ship legally accurate DPDPA Penalty Risk Indicator — correct sections, correct caps, no fictional formula.  
**Estimated effort:** 4–5 hours (rewrite of client component)

### 3.1 Critical corrections vs. Kimi code ⏳

**The Kimi calculator must NOT be used as-is.** Issues:

| Kimi error | Correct value |
|---|---|
| security_breach → "Section 25", ₹250cr | Section 8(5), ₹250 crore ✅ cap correct, ❌ section wrong |
| notice_consent → "Section 26", ₹150cr | Falls under "any other provision", ₹50 crore (no dedicated section) |
| children_data → "Section 27", ₹200cr | Section 9, ₹200 crore ✅ cap correct, ❌ section wrong |
| sdf_violation → "Section 28", ₹150cr | Section 10, ₹150 crore ✅ cap correct, ❌ section wrong |
| board_direction → "Section 29", ₹100cr | "Any other provision", ₹50 crore OR voluntary undertaking (Section 32) |
| breach_notification → "Section 25 + 33", ₹250cr | Section 8(6), ₹200 crore |
| cross_border → "Section 12 & 13", ₹150cr | "Any other provision", ₹50 crore |
| Formula | Weighted % of statutory max (fictional) | No formula — Board discretion |

### 3.2 Create corrected server page ⏳
- `webapp/app/penalty-calculator/page.tsx`
- Keep Kimi's structure (metadata, JSON-LD shell, breadcrumb, educational content)
- Update FAQ answers and educational content sections to use correct section numbers
- Update title to: `"DPDPA Penalty Risk Indicator"` → renders as 44 chars ✅

### 3.3 Rewrite client component ⏳
- `webapp/app/penalty-calculator/PenaltyCalculatorClient.tsx`
- Full rewrite — do not base on Kimi code

**Step 1 — Breach category selector (Schedule-accurate):**
```ts
const BREACH_CATEGORIES = [
  {
    id: "security_safeguards",
    label: "Failure to take reasonable security safeguards (data leak, hack, inadequate controls)",
    section: "Section 8(5)",
    cap: 250,
    note: "Most common and highest-penalty category",
  },
  {
    id: "breach_notification",
    label: "Failure to notify the Board or affected individuals of a personal data breach",
    section: "Section 8(6)",
    cap: 200,
  },
  {
    id: "childrens_data",
    label: "Processing children's personal data without verifiable parental consent",
    section: "Section 9",
    cap: 200,
  },
  {
    id: "sdf_obligations",
    label: "Breach of Significant Data Fiduciary (SDF) obligations",
    section: "Section 10",
    cap: 150,
  },
  {
    id: "other_provision",
    label: "Breach of any other provision of the Act or Rules (notice failures, consent violations, cross-border, retention, etc.)",
    section: "Other provisions",
    cap: 50,
    note: "Most non-security DPDPA violations fall in this category",
  },
  {
    id: "data_principal_duty",
    label: "Breach of duties of a Data Principal (providing false information, etc.)",
    section: "Section 15",
    cap: 0.0001,  // ₹10,000 in crore
    capLabel: "₹10,000",
  },
];
```

**Step 2 — Section 33(2) self-assessment (6 factors, each rated Low / Medium / High):**
```
1. How serious was the harm to individuals? (Low = minor inconvenience / High = identity theft, financial loss)
2. How long did the breach continue before remediation? (Low = hours / High = weeks or ongoing)
3. How sensitive was the data involved? (Low = contact info / High = biometric, health, financial)
4. Is this a first violation or a repeat? (Low = first time / High = prior violations on record)
5. Were mitigation steps taken promptly? (Low = none yet / High = breach contained + users notified + audit done)
6. Did the organisation gain financially from the violation? (Low = no / High = deliberate exploitation)
```

**Step 3 — Output (qualitative risk band, never a ₹ figure):**
- Risk band: Low / Moderate / High / Severe
- Statutory maximum for selected category (from Schedule)
- Summary of Section 33(2) factors user selected
- Plain-English explanation of what each band means in practice
- Call to action: "Take the Free DPDPA Assessment" + "Consult an Expert"

**Disclaimer (prominent, always visible on output):**
> "The Data Protection Board of India determines actual penalties after completing an inquiry under Section 33 of the DPDP Act, 2023. Only the Board can impose a penalty, and only after giving the respondent an opportunity to be heard. This tool provides educational risk awareness based on publicly available statutory provisions and does not constitute legal advice. Consult a qualified data protection lawyer for formal guidance."

### 3.4 Add to navigation ⏳
- Add "Penalty Calculator" link to navigation (under Resources or standalone)

### 3.5 Add to sitemap ⏳
- `priority: 0.9`, `changeFrequency: "monthly"`

### 3.6 Add to llms.txt ⏳

### 3.7 Commit + deploy ⏳
- Single commit: `feat: add /penalty-calculator — DPDPA risk indicator with correct Schedule categories`
- Submit to GSC for indexing

---

## Block 4 — Thin Content Expansion (Sprint 7 Carry-over) ⏳ PENDING

**Goal:** Expand 5 `/learn/` pages from 327–486 words to 600–700+ words.  
**Estimated effort:** 1–2 hours drafting per page; Dilip reviews each before ship.

### Priority order ⏳

| Page | Current | Target | Dilip approval needed |
|---|---|---|---|
| `/learn/data-breach` | 327 words | 600+ | Yes |
| `/learn/applicability` | 341 words | 700+ | Yes |
| `/learn/what-is-dpdpa` | 372 words | 700+ | Yes |
| `/learn/consent` | 415 words | 700+ | Yes |
| `/learn/rights` | 486 words | 600+ | Yes |

### Process per page ⏳
1. Claude drafts expansion
2. Dilip reviews via chat
3. Claude commits approved content
4. GSC Request Indexing submitted

### Content standard ⏳
Each expansion must add:
- At least 2 new H2 sections
- One CTA linking to `/assessment` or `/glossary`
- One reference to the DPDP Rules, 2025 (Section or Rule number)
- No filler — every paragraph actionable for Indian businesses

---

## Block 5 — FAQ Schema on Industry Pages ⏳ PENDING

**Goal:** Add `FAQPage` JSON-LD to all 4 existing industry assessment pages.  
**Estimated effort:** 1 hour

### Pages + Q&A sets ⏳

**`/industries/recruitment-agencies`** — 4 Q&As:
1. Does DPDPA apply to recruitment agencies?
2. What is the penalty for a recruiter who leaks candidate data?
3. How long can a recruitment agency keep CV data?
4. Do recruitment agencies need to sign DPAs with their clients?

**`/industries/ca-firms`** — 4 Q&As:
1. Does DPDPA apply to CA firms handling client financial data?
2. Can a CA firm share client data with tax authorities without consent?
3. How long must a CA firm retain client data under DPDPA?
4. Do CA firm employees handling client data count as Data Processors?

**`/industries/training-institutes`** — 4 Q&As:
1. Does DPDPA apply to coaching centres and training institutes?
2. What consent is needed to collect student data?
3. How does DPDPA apply when students are under 18?
4. Can a training institute share student data with employers for placement?

**`/industries/d2c-brands`** — 4 Q&As:
1. Does DPDPA apply to Indian D2C brands?
2. Can a D2C brand use WhatsApp for marketing under DPDPA?
3. What data can a D2C brand collect from its loyalty programme?
4. What happens if a D2C brand's third-party logistics provider leaks customer data?

---

## Block 6 — Internal Linking Improvements ⏳ PENDING

**Goal:** Address the 23 briefing pages with only 1 internal link.  
**Estimated effort:** 1 hour (template change, not per-page editing)

### 6.1 Briefing page template ⏳
- `webapp/app/briefings/[slug]/page.tsx` — add "Learn More" section at bottom of every briefing
- Links to: relevant industry page (based on briefing category), one `/learn` page, `/glossary`
- This fixes the 23 single-link briefings in one code change

### 6.2 Learn pages → Glossary ⏳
- After glossary is live, add "Key Terms" callout to each `/learn` page
- Links to 3–5 relevant `#slug` anchors in `/glossary`

---

## Block 7 — Sitemap + llms.txt Update ⏳ PENDING

After Blocks 2 and 3 are deployed:
- Update `sitemap.ts` with both new pages
- Update `llms.txt` with both new pages
- Confirm new URLs appear in GSC → Coverage within 48h

---

## Sprint 8 — Completion Checklist

### Track A — New Pages
- [ ] `/glossary` — page created, 57 terms, search + filter working
- [ ] `/glossary` — `DefinedTermSet` schema validates in Rich Results Test
- [ ] `/glossary` — added to nav, sitemap, llms.txt
- [ ] `/glossary` — GSC Request Indexing submitted
- [ ] `/penalty-calculator` — client component fully rewritten (no Kimi formula)
- [ ] `/penalty-calculator` — all section numbers match Schedule
- [ ] `/penalty-calculator` — disclaimer prominent on every output
- [ ] `/penalty-calculator` — added to nav, sitemap, llms.txt
- [ ] `/penalty-calculator` — GSC Request Indexing submitted

### Track B — Technical
- [ ] All 13 duplicate `public/` files deleted
- [ ] FAQ schema added to all 4 industry pages
- [ ] Briefing template updated — all briefings link to ≥3 internal pages

### Track C — Content
- [ ] `/learn/data-breach` — expanded to 600+ words, Dilip approved, committed
- [ ] `/learn/applicability` — expanded to 700+ words, Dilip approved, committed
- [ ] `/learn/what-is-dpdpa` — expanded to 700+ words, Dilip approved, committed
- [ ] `/learn/consent` — expanded to 700+ words, Dilip approved, committed
- [ ] `/learn/rights` — expanded to 600+ words, Dilip approved, committed

---

## Key Files

| File | Status | Purpose |
|---|---|---|
| `webapp/app/glossary/page.tsx` | ⏳ New | Server page — metadata, schema |
| `webapp/app/glossary/GlossaryClient.tsx` | ⏳ New | Client — search, filter, 57 terms |
| `webapp/app/penalty-calculator/page.tsx` | ⏳ New | Server page — corrected metadata + schema |
| `webapp/app/penalty-calculator/PenaltyCalculatorClient.tsx` | ⏳ New | Client — Schedule-accurate risk indicator (NOT Kimi formula) |
| `webapp/app/sitemap.ts` | ⏳ Update | Add /glossary + /penalty-calculator |
| `webapp/public/llms.txt` | ⏳ Update | Add /glossary + /penalty-calculator |
| `webapp/components/layout/Header.tsx` | ⏳ Update | Add Glossary + Penalty Calculator to nav |
| `webapp/app/learn/[topic]/page.tsx` | ⏳ Update | Expand 5 thin content entries |
| `webapp/app/briefings/[slug]/page.tsx` | ⏳ Update | Add "Learn More" cross-links section |
| `webapp/app/industries/*/page.tsx` | ⏳ Update | Add FAQPage schema to all 4 |

---

## Estimated Timeline

| Block | Owner | Effort | Target date |
|---|---|---|---|
| Block 1 — Duplicate files | Claude | 10 min | 2026-04-29 |
| Block 2 — /glossary | Claude + Dilip (12 terms review) | 3–4h | 2026-04-30 |
| Block 3 — /penalty-calculator | Claude | 4–5h | 2026-05-01 |
| Block 4 — Thin content (5 pages) | Claude draft + Dilip approve | 2 days | 2026-05-06 |
| Block 5 — FAQ schema | Claude | 1h | 2026-05-07 |
| Block 6 — Internal linking | Claude | 1h | 2026-05-08 |
| Block 7 — Sitemap + llms.txt | Claude | 30 min | With Blocks 2+3 |
| SEMrush re-run | Dilip | Manual | 2026-05-13 |

---

## Penalty Calculator — Final Decision

**Use:** Rewritten client component (Block 3.3) — not the Kimi code.

**Why:**
- Kimi code has 7 wrong section numbers and/or wrong cap amounts
- Kimi formula implies arithmetic precision that doesn't exist in the Act
- Rewritten version is legally accurate, still useful, better protected from misuse as legal advice
- A tool that shows "Section 8(5) → up to ₹250 crore, your factors suggest High risk" is more trustworthy than "estimated penalty: ₹47–₹89 crore" (which the Board would never confirm)

**What we keep from Kimi:**
- Page.tsx structure (metadata, JSON-LD shell, breadcrumb, educational content sections)
- Related Resources cards
- Visual design pattern (form → result panel)
- Overall page layout and disclaimer language (updated)

**What we rewrite:**
- All section numbers/caps in VIOLATION_PROFILES
- The calculatePenalty() function → replaced with qualitative risk band logic
- Output panel: no ₹ range, only risk band + statutory max + Section 33(2) summary
