# SaralPrivacy — Sprint 7 Development Plan
## SEO Hardening + Template Download (Standalone)

**Date:** 2026-04-29  
**Sprint duration:** 2 weeks (2026-04-29 → 2026-05-13)  
**Pairs with:** SaralPrivacy_Sprint7_PRD.md

---

## Status Legend

| Symbol | Meaning |
|---|---|
| ✅ | Shipped to production |
| 🔄 | In progress |
| ⏳ | Pending — not started |
| 🚫 | Parked — deliberately deferred |

---

## Block 1 — robots.txt SEO Fix ✅ COMPLETE

**Goal:** Unblock `/_next/` assets from Googlebot; clean up all disallow rules.

### 1.1 Code changes ✅
- `webapp/app/robots.ts` — removed `/_next/`, removed `/consent-preferences` and `/rights/`, added `/report/`, consolidated 11 duplicate arrays into `COMMON_DISALLOW`
- `webapp/app/robots.ts` — removed `Host:` directive (Yandex-only, causes GSC warning)

### 1.2 Deploy & verify ✅
- Committed: `fix(seo): unblock /_next/ assets in robots.txt + fix Resend type error`
- Committed: `fix(seo): remove Host directive from robots.txt`
- Production curl confirmed: `/_next/` absent from all user-agent blocks
- GSC "Request Indexing" submitted for: `/`, `/learn/dpdpa-overview`, `/briefings`, `/assessment/d2c-brands`

### 1.3 SEMrush verification ⏳
- Re-run SEMrush site audit (24–48h after deploy)
- Confirm "Blocked by robots.txt" warning: 1,134 → 0
- Screenshot new warning count and store in docs/

---

## Block 2 — Long Title Tags Fix ⏳ PENDING

**Goal:** All metadata title strings ≤ 60 characters.  
**Estimated effort:** 2–3 hours

### 2.1 Audit ⏳
Run against all `page.tsx` files:
```bash
find app -name "page.tsx" | xargs grep -h "title:" | \
  grep '"' | sed 's/.*"\(.*\)".*/\1/' | awk 'length > 60'
```
Export the full list of offending pages from SEMrush (Settings → Export → Issues → Long title tags).

### 2.2 Rewrite rules ⏳
- Max 60 characters total including `| SaralPrivacy` suffix (14 chars = 46 chars for the page title)
- Primary keyword first
- No duplication across pages
- Format: `[Keyword phrase — max 46 chars] | SaralPrivacy`

### 2.3 Apply fixes ⏳

Known offender:

| Page | Current (chars) | Proposed fix (chars) |
|---|---|---|
| `/learn/dpdp-rules-2025-plain-english-guide` | `DPDP Rules 2025: Section-by-Section Plain-English Guide \| SaralPrivacy` (72) | `DPDP Rules 2025: Plain-English Guide \| SaralPrivacy` (53) |

Remaining 13 pages: audit from SEMrush export, apply same rule.

### 2.4 Deploy & verify ⏳
- Single commit for all title fixes
- Rerun SEMrush after deploy
- Confirm 0 long-title warnings

---

## Block 3 — Broken Images & Links Fix ⏳ PENDING

**Goal:** Zero broken external images (18) and external links (4).  
**Estimated effort:** 3–4 hours

### 3.1 Get the full list ⏳
- From SEMrush: Issues → Warnings → "Broken images" → export CSV
- From SEMrush: Issues → Warnings → "Broken links" → export CSV

### 3.2 Broken images — triage per URL ⏳
For each of the 18 broken image URLs:

| Decision | When to use |
|---|---|
| **Replace with self-hosted** | Image is editorial, still relevant — download and move to `public/` |
| **Remove** | Image is decorative or the content it illustrated is outdated |
| **Replace with placeholder** | Image is needed but original source is gone |

Common pattern: blog post images from external CDNs that have rotated URLs. Fix: download to `public/images/blog/` and update `src`.

### 3.3 Broken links — triage per URL ⏳
For each of the 4 broken external links:

| Decision | When to use |
|---|---|
| **Update URL** | Page moved — find new URL |
| **Remove link** | Resource no longer exists |
| **Replace with internal link** | A SaralPrivacy page covers the same content |

### 3.4 Deploy & verify ⏳
- Single commit per page or grouped by type
- Rerun SEMrush
- Confirm 0 broken-image and 0 broken-link warnings

---

## Block 4 — Thin Content Expansion ⏳ PENDING

**Goal:** Expand Tier 1 pages from stub/thin to 600–1,000 words of original DPDPA content.  
**Estimated effort:** 1–2 days (content-heavy)  
**Content owner:** Dilip (SME review and approval required on every page)

### 4.1 Tier 1 pages — priority order ⏳

| # | Page | Current | Target | Notes |
|---|---|---|---|---|
| 1 | `/learn/dpdpa-overview` | Stub | 800+ words | Highest SEO potential — "what is DPDPA" keyword |
| 2 | `/learn/consent-under-dpdpa` | Stub | 800+ words | Section 6/7 content — high search intent |
| 3 | `/learn/rights-of-individuals` | Stub | 800+ words | Sections 12–14 — rights queries growing |
| 4 | `/faq` | Thin | 15+ Q&As | FAQ schema markup drives featured snippets |
| 5 | `/learn/notice-requirements` | Stub | 600+ words | |
| 6 | `/learn/data-breach-basics` | Stub | 600+ words | |
| 7 | `/industries/training-institutes` | Thin | 600+ words | High buyer intent |
| 8 | `/industries` | Thin | 500+ words | |
| 9 | `/about` | Thin | 400+ words | Trust signal |
| 10 | `/contact` | Thin | 300+ words + CTA | Conversion page |

### 4.2 Content template per /learn page ⏳
Each expanded learn page should follow:

```
H1: [Page title — ≤60 chars total with suffix]
Intro paragraph: What this is, why it matters for Indian businesses (100 words)

H2: What the law actually says (150 words)
  — cite exact section numbers
  
H2: What this means for your business (200 words)
  — practical, plain English, industry-specific where possible
  
H2: Common mistakes (150 words)
  — 3–4 bullet points of what businesses get wrong

H2: Action steps (100 words)
  — 3 numbered steps to become compliant
  
CTA box: Take the free DPDPA Assessment → [link to /assessment]
```

### 4.3 FAQ page expansion ⏳
Add structured FAQ schema (`application/ld+json`) to `/faq/page.tsx`:
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [...]
}
```
Target: 15+ Q&As covering common DPDPA queries that show up in GSC as impressions with no clicks.

### 4.4 Deploy per page ⏳
- Commit each page individually for clean git history
- Submit URL to GSC "Request Indexing" after each publish
- Track word count before/after

---

## Block 5 — Standalone Template Download Page ✅ COMPLETE

**Goal:** Decouple template downloads from the assessment report. Make templates accessible to any visitor at `/resources`.

### 5.1 New component: ResourceTemplateGate.tsx ✅
- `webapp/components/ResourceTemplateGate.tsx`
- Email mandatory field (first in form)
- Gate fields: email, contact name, business name, employees, phone
- Consent checkboxes: contact consent + briefings opt-in
- LocalStorage key: `sp_rg_v1`
- API call: `POST /api/template-download` with `source: "resources_page"`
- On success: localStorage flag set, file download triggered
- Subsequent visits: direct download, no re-gate

### 5.2 Updated page: /resources ✅
- `webapp/app/resources/page.tsx` — replaced redirect-to-blog
- SEO metadata: title, description, OG tags
- Trust strip: Free / No account / DPDPA-aligned / Instant download
- 5 template cards using `ResourceTemplateGate`
- White Paper link (same design pattern as report page)
- Assessment CTA at bottom

### 5.3 API update: source field ✅
- `webapp/app/api/template-download/route.ts`
- Accepts and saves `source` field to Appwrite
- Defaults to `"report_page"` if not provided (preserves backward compatibility)

### 5.4 Report page unchanged ✅
- `TemplateGateModal.tsx` reverted to original — `reportToken` required
- `/report/[token]/page.tsx` untouched
- Zero shared code between the two download flows

---

## Block 6 — Template Email Delivery 🚫 PARKED (v2)

**Reason parked:** Current direct-download approach is functional. Email delivery adds Twilio, Vercel Blob, and react-hook-form dependencies. Evaluate in Sprint 8 after `/resources` page shows download traction.

**WIP files on disk (untracked, NOT committed):**
- `webapp/components/TemplateDownloadForm.tsx`
- `webapp/components/TemplateDownloadModal.tsx`
- `webapp/app/api/templates/download/route.ts`
- `webapp/lib/templates/validation.ts`

**Prerequisites before unparking:**
1. `pnpm add react-hook-form @hookform/resolvers`
2. Reconcile template IDs in `validation.ts` with actual filenames in `public/templates/`
3. Decide: Vercel Blob vs. `public/templates/` for file serving
4. Decide: keep WhatsApp (Twilio cost + complexity) or email-only
5. Fix unsubscribe link in email template (currently `href="#"`)
6. Remove `next-auth` dependency from `TemplateDownloadModal` (not set up in this app)

---

## Block 7 — GSC & SEMrush Verification Cycle ⏳ ONGOING

**This is not a code block — it's an operational checkpoint.**

### After each Block ships:

| Step | Action | Tool |
|---|---|---|
| 1 | Push to production | git push → Vercel auto-deploy |
| 2 | Verify live URL | curl / browser |
| 3 | Submit to GSC | URL Inspection → Request Indexing |
| 4 | Wait 24–48h | — |
| 5 | Rerun SEMrush audit | Projects → saralprivacy.com → Re-run campaign |
| 6 | Screenshot new warning counts | Store in docs/ |

### GSC daily quota reminder:
- 10 manual indexing requests per day
- Prioritise: assessment pages, learn pages, resources page, briefings

---

## Sprint 7 — Completion Checklist

### Track A — SEO
- [x] robots.txt — `/_next/` unblocked
- [x] robots.txt — `Host:` directive removed
- [x] GSC — Request Indexing submitted (4 URLs)
- [ ] SEMrush — rerun confirms 0 blocked resources
- [ ] Long titles — all 14 pages fixed (≤60 chars)
- [ ] SEMrush — rerun confirms 0 long-title warnings
- [ ] Broken images — all 18 resolved
- [ ] Broken links — all 4 resolved
- [ ] SEMrush — rerun confirms 0 broken images + links
- [ ] Thin content — Tier 1 (10 pages) expanded to 600+ words
- [ ] GSC — all expanded pages submitted for indexing

### Track B — Templates
- [x] `ResourceTemplateGate.tsx` — built and committed
- [x] `/resources` page — live, replaces redirect
- [x] `/api/template-download` — source field added
- [x] Report page — untouched, verified
- [ ] First real download via `/resources` page confirmed in Appwrite
- [ ] `/resources` submitted to GSC for indexing

---

## Key Files Reference

| File | Status | Purpose |
|---|---|---|
| `webapp/app/robots.ts` | ✅ Updated | robots.txt — Googlebot crawl rules |
| `webapp/components/ResourceTemplateGate.tsx` | ✅ New | Standalone gate for /resources page |
| `webapp/app/resources/page.tsx` | ✅ Updated | Public template download page |
| `webapp/app/api/template-download/route.ts` | ✅ Updated | Lead capture API + source tracking |
| `webapp/components/TemplateGateModal.tsx` | ✅ Unchanged | Report page gate — do not modify |
| `webapp/app/report/[token]/page.tsx` | ✅ Unchanged | Assessment report — do not modify |
| `webapp/components/TemplateDownloadForm.tsx` | 🚫 Untracked WIP | Parked v2 component |
| `webapp/components/TemplateDownloadModal.tsx` | 🚫 Untracked WIP | Parked v2 component |
| `webapp/app/api/templates/download/route.ts` | 🚫 Untracked WIP | Parked v2 API route |

---

## Estimated Timeline

| Block | Owner | Effort | Target date |
|---|---|---|---|
| Block 1 — robots.txt | Claude ✅ | Done | 2026-04-28 |
| Block 5 — /resources page | Claude ✅ | Done | 2026-04-29 |
| Block 2 — Long titles | Claude + Dilip review | 2–3h | 2026-04-30 |
| Block 3 — Broken images + links | Claude + Dilip review | 3–4h | 2026-05-01 |
| Block 4 — Thin content Tier 1 | Claude draft + Dilip approve | 1–2 days | 2026-05-07 |
| Block 7 — SEMrush verification | Dilip (manual) | Ongoing | 2026-05-13 |
| Block 6 — Email delivery (v2) | Future sprint | — | TBD |
