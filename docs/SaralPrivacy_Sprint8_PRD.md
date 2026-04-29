# SaralPrivacy — Sprint 8 PRD
## Glossary + Penalty Risk Indicator + Internal Linking + Industry Expansion

**Document type:** Sprint PRD  
**Version:** 1.0  
**Date:** 2026-04-29  
**Author:** Dilip Sahu (Product Owner / Founder)  
**Sprint duration:** 2 weeks (2026-04-29 → 2026-05-13)  
**Status:** Planning

---

## 1. Context & Motivation

Sprint 7 addressed technical SEO (robots.txt, broken images, long titles, standalone template page). Sprint 8 shifts to **content depth and new SEO assets** — building pages that capture high-intent, long-tail queries currently answered nowhere on the site.

Three inputs drive this sprint:

1. **Kimi Agent SEO Audit** — Identified `/glossary` and `/penalty-calculator` as the highest-ROI missing pages. Complete production code was generated for both.
2. **DPDPA Programmatic SEO Glossary Database** — A structured 50+ term database with SEO titles and target keywords to augment the glossary.
3. **Dilip's legal correction** — The Kimi calculator uses a fictional weighted-scoring formula and wrong section numbers. The Act has no arithmetic formula. This sprint ships a legally accurate risk indicator instead.

---

## 2. Penalty Calculator — Legal Assessment

### What the Act actually says

There is **no arithmetic formula** in the DPDP Act, 2023 or DPDP Rules, 2025 for calculating penalties.

The Board determines penalty after:
1. Completing an inquiry
2. Finding the breach significant
3. Giving the person an opportunity to be heard
4. Considering **Section 33(2) factors** (see below)
5. Imposing the monetary penalty within the **Schedule cap** for the relevant breach category

**Section 33(2) factors the Board must consider:**
- Nature, gravity, and duration of the breach
- Type and nature of personal data affected
- Repetitive nature of the breach
- Financial gain realised or loss avoided by the Data Fiduciary
- Mitigation action taken and its timeliness/effectiveness
- Whether the penalty is proportionate and effective for observance/deterrence
- Likely impact of the penalty on the person

**Schedule — actual breach categories and caps:**

| Breach | Section | Statutory Maximum |
|---|---|---|
| Failure to take reasonable security safeguards | Section 8(5) | ₹250 crore |
| Failure to notify Board / affected Data Principals of breach | Section 8(6) | ₹200 crore |
| Breach of children's data obligations | Section 9 | ₹200 crore |
| Breach of Significant Data Fiduciary obligations | Section 10 | ₹150 crore |
| Breach of Data Principal duties | Section 15 | ₹10,000 |
| Breach of voluntary undertaking | Section 32 | Up to original breach cap |
| Breach of any other provision of Act or Rules | — | ₹50 crore |

### What the Kimi calculator got wrong

| Issue | Kimi Version | Correct |
|---|---|---|
| Section for security breach | Section 25 | Section 8(5) |
| Cap for breach notification | ₹250 crore | ₹200 crore |
| Section for notice/consent failure | Section 26 | Falls under "any other provision" → ₹50 crore |
| Section for children's data | Section 27 | Section 9 |
| Section for SDF obligations | Section 28 | Section 10 |
| Section for Board direction failure | Section 29, ₹100 crore | Falls under "any other provision" → ₹50 crore or Section 32 for voluntary undertaking |
| Cross-border cap | ₹150 crore | Falls under "any other provision" → ₹50 crore |
| Formula itself | Weighted scoring (fictional) | No formula exists — Board has full discretion within caps |

### What to build instead: DPDPA Penalty Risk Indicator

**Not** a calculator that outputs a specific number. **Yes** to a tool that:

1. Asks which **Schedule breach category** applies (mapped to correct section/cap)
2. Walks through **Section 33(2) factors** as a self-assessment checklist
3. Outputs a **risk band** (Low / Moderate / High / Severe) relative to the statutory maximum
4. Shows the **statutory maximum** for the selected breach category
5. Is prominently disclaimed as educational — only the Board determines actual penalty

**Risk band logic (transparent, non-arithmetic):**
- Users rate each Section 33(2) factor (Low / Medium / High)
- Aggregate qualitative weighting → risk band
- Output: "Based on your assessment, your exposure is in the [X] band. The Board could impose up to ₹Y crore for this breach category."
- No fake ₹ figure that implies precision

This is legally honest, still useful for business decision-making, and defensible as educational content.

---

## 3. Goals

| Goal | Metric | Target |
|---|---|---|
| Ship `/glossary` | Page indexed in GSC | Within 48h of deploy |
| Glossary long-tail capture | GSC impressions for "what is data fiduciary", "DPDPA consent definition" etc. | Visible within 30 days |
| Ship `/penalty-calculator` | Page indexed; interactive tool functional | Within 48h of deploy |
| Penalty page legal accuracy | All section numbers and caps match Schedule | 100% — no fictional formula |
| Clean up duplicate public files | Untracked `* 2.*` files removed | 0 duplicate files in `public/` |
| Improve internal linking | Orphaned pages reduced | All /learn pages linked from ≥2 other pages |
| Sprint 7 thin content | 5 /learn pages expanded to 600+ words | Before SEMrush re-run |

---

## 4. Track A — `/glossary` Page

### A1 — Core Glossary Page

**URL:** `/glossary`  
**Status:** Code drafted (Kimi), needs integration and augmentation

**What the Kimi code provides (keep as-is):**
- `page.tsx` — Server page with SEO metadata, `DefinedTermSet` schema, breadcrumb
- `GlossaryClient.tsx` — Client component with search + category filter, 45 terms
- Clean `dl/dt/dd` structure for featured snippet eligibility
- Related terms linking + "See also" internal links

**Augmentation from docx database:**
Add the following terms missing from Kimi's 45:
- Biometric Data
- Financial Data  
- Affirmative Action (consent)
- Informed Consent
- Unconditional Consent
- Publicly Available Data
- De-identified Data
- Duty of Data Principal
- Data Processing Agreement (DPA)
- Negative List (cross-border)
- Adjudicating Officer
- Algorithmic Transparency

**SEO metadata corrections:**
- Title: `"DPDPA Glossary: 50+ Key Terms Explained | SaralPrivacy"` (43 chars — within limit)
- Description: unchanged from Kimi draft

**Internal linking TO glossary (add after deploy):**
- Every `/learn/` page: add "Key Terms" callout box with 3–5 glossary links
- `/faq` page: link glossary terms where referenced in answers
- Industry pages: link industry-specific terms (e.g., `/industries/recruitment-agencies` links to `#consent`, `#data-fiduciary`)

**Internal linking FROM glossary (already in Kimi code):**
- `/assessment`, `/learn`, `/penalty-calculator`, `/faq`, `/industries`

**Navigation placement:**
- Add "Glossary" link under DPDPA Guide dropdown in Header

### A2 — Sitemap + llms.txt

Add `/glossary` to `sitemap.ts` with `priority: 0.85`, `changeFrequency: "monthly"`.  
Add to `llms.txt`.

---

## 5. Track B — `/penalty-calculator` Page (Rewritten)

### B1 — Corrected DPDPA Penalty Risk Indicator

**URL:** `/penalty-calculator`  
**Status:** Kimi code exists but is legally inaccurate — section numbers and caps wrong, formula fictional. Full rewrite required for the client component.

**Server page (`page.tsx`):**
- Keep Kimi's metadata structure and `SoftwareApplication` + `FAQPage` schema
- Update FAQ answers to reflect no-formula reality
- Fix page title to ≤46 chars: `"DPDPA Penalty Risk Indicator"` → renders as 44 chars with suffix
- Update JSON-LD section/cap references to match Schedule

**Client component (`PenaltyCalculatorClient.tsx`) — full rewrite:**

**Step 1 — Select breach category (maps to Schedule)**

| User-facing label | Section | Cap |
|---|---|---|
| Security safeguards failure (data leak, hack, inadequate controls) | Section 8(5) | ₹250 crore |
| Failure to notify Board / affected persons of a breach | Section 8(6) | ₹200 crore |
| Children's data processed without verifiable parental consent | Section 9 | ₹200 crore |
| Significant Data Fiduciary obligation breach | Section 10 | ₹150 crore |
| Other provision of the Act or Rules | — | ₹50 crore |
| Data Principal duties breach | Section 15 | ₹10,000 |

**Step 2 — Section 33(2) self-assessment (6 factors)**

Each factor rated: Low / Medium / High

1. Severity of breach (how much harm to data principals)
2. Duration (days/weeks vs. ongoing)
3. Type of data (contact info vs. financial/health/biometric)
4. Repetition (first incident vs. prior violations)
5. Mitigation taken (breach contained, users notified, forensic audit done)
6. Financial impact on business from violation

**Output — risk band (not a ₹ figure):**

| Risk Band | What it means |
|---|---|
| Low | Isolated, first-time, mitigated, low-sensitivity data. Board likely issues warning or low penalty. |
| Moderate | Some aggravating factors. Formal proceedings possible. Penalty likely but well below statutory max. |
| High | Multiple aggravating factors. Penalty proceedings near-certain. Could approach mid-to-upper range. |
| Severe | Serious breach, high data sensitivity, repeat or unmitigated. Board could impose near statutory maximum. |

**Display always shows:**
- Selected breach category + correct section number
- Statutory maximum for that category (from Schedule)
- Risk band with plain-English explanation
- Section 33(2) summary of factors considered
- Prominent disclaimer: "The Data Protection Board of India determines actual penalties after inquiry under Section 33. This tool is for educational risk awareness only and does not constitute legal advice."

**No ₹ range output.** No arithmetic. No "₹X–₹Y crore estimate."

### B2 — Navigation + Sitemap

- Add to sitemap: `priority: 0.9`, `changeFrequency: "monthly"`
- Add to nav under "Resources" or as standalone nav item
- Add to `llms.txt`
- Cross-link from `/faq` (penalty questions), `/learn/data-breach`, blog posts mentioning penalties

---

## 6. Track C — Technical Quick Wins

### C1 — Delete Duplicate Public Files

**Problem:** macOS auto-generated `* 2.*` files exist in `webapp/public/` as untracked files. Google may crawl and index these.

**Files to delete:**
```
webapp/public/file 2.svg
webapp/public/globe 2.svg
webapp/public/googlebb55c3c7def99de4 2.html
webapp/public/llms 2.txt
webapp/public/llms-full 2.txt
webapp/public/logo 2.png
webapp/public/logo-emblem 2.png
webapp/public/next 2.svg
webapp/public/og-image 2.png
webapp/public/vercel 2.svg
webapp/public/window 2.svg
webapp/app/favicon 2.ico
webapp/app/icon 2.png
```

**Action:** Delete all, single commit. Do NOT add redirects — these should return 404.

### C2 — FAQ Schema on Industry Pages

Add `FAQPage` JSON-LD to all 4 existing industry assessment pages. 3–5 Q&As per page. Questions sourced from common search queries for that industry.

### C3 — Internal Linking Audit

Current state: 23 briefing pages have only 1 internal link (from SEMrush export).

Fix: Add "Related Briefings" or "Continue Reading" section to briefing templates. Each briefing should link to at minimum: the relevant industry page, one `/learn` page, and one other briefing.

---

## 7. Track D — Sprint 7 Thin Content (Carry-over)

5 `/learn/` pages still under 600 words. Expand before SEMrush re-run.

| Page | Current | Target |
|---|---|---|
| `/learn/what-is-dpdpa` | 372 words | 700+ words |
| `/learn/applicability` | 341 words | 700+ words |
| `/learn/consent` | 415 words | 700+ words |
| `/learn/rights` | 486 words | 600+ words |
| `/learn/data-breach` | 327 words | 600+ words |

Dilip reviews each draft before shipping. One commit per page.

---

## 8. Out of Scope (This Sprint)

- `/industries/healthcare` and `/industries/fintech` — Industry briefs drafted, content is good. Scoped to Sprint 9 — these are net-new pages requiring full build, not just content expansion.
- `/pricing` page — Requires commercial decision on pricing model first.
- Link building (outreach to publications, directories) — Ongoing marketing activity, not a dev sprint item.
- FAQ page expansion (15+ Q&As) — Carry to Sprint 9 once glossary and penalty page are live (cross-links needed).
- `/about` and `/contact` expansion — Sprint 9.

---

## 9. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Legal accuracy | Penalty risk indicator must reference only Schedule breach categories and Section 33(2) factors. No fictional formula. |
| Disclaimer | Penalty page must clearly state educational purpose + Board sole authority on actual penalties |
| SEO | All new page titles ≤46 chars; all new pages in sitemap; all in `llms.txt` |
| Content accuracy | `/learn` expansions reviewed and approved by Dilip before commit |
| Internal linking | New pages cross-linked from ≥3 existing pages before deploy |

---

## 10. Success Metrics (30 Days Post-Deploy)

| Metric | Baseline | Target |
|---|---|---|
| `/glossary` GSC impressions | 0 | 200+ |
| `/penalty-calculator` GSC impressions | 0 | 100+ |
| SEMrush thin-content warnings | ~70 | <50 (after 5 /learn pages expanded) |
| Duplicate public files | 13 | 0 |
| Orphaned briefing pages (1 internal link) | 23 | <10 |

---

## 11. Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Penalty page misunderstood as legal advice | Medium | High | Prominent disclaimer on every output; clearly labelled "Risk Indicator" not "Calculator" |
| Glossary terms inaccurate | Low | Medium | Dilip reviews all 12 new terms from docx before deploy |
| /learn content drafts require heavy edits | Medium | Low | Claude drafts, Dilip approves — no page ships without sign-off |
| SEMrush re-crawl doesn't show improvement | Low | Low | Fix is confirmed live; crawl timing is external |
