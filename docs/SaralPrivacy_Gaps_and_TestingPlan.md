# SaralPrivacy.com — Gap Analysis & Comprehensive Testing Plan

**Document type:** Supplement to PRD + Development Plan
**Version:** 1.0
**Date:** 2026-04-28
**Purpose:** Fills gaps in the reverse-engineered Development Plan and adds the full testing strategy. Read alongside `SaralPrivacy_PRD.md` and `SaralPrivacy_DevelopmentPlan.md`.

---

## Part A — Gaps Identified Against Live Codebase

A side-by-side audit of the previous Development Plan against the actual `webapp/` directory uncovered the following items that were missing or misspecified.

### A.1 Critical Gaps

#### Block 1.6 (NEW) — Appwrite Bootstrap Script
**File:** `scripts/setup-appwrite.mjs`

The development plan listed all 13 collections but did not specify *how* they are created in a fresh Appwrite project. This script is the executable bootstrap — it programmatically creates the database, all 13 collections, every attribute, every index, and the storage bucket via the `node-appwrite` server SDK.

**To rebuild from scratch, this script is the entry point for Block 1.** Without it, schema must be hand-clicked in the Appwrite console — error-prone and not reproducible.

**Required behavior:**
- Idempotent — safe to re-run; skips existing collections/attributes
- Reads from a single source-of-truth schema definition
- Creates string/integer/boolean/datetime attributes per collection spec
- Defines indexes (unique on `email`, compound on `status + scheduled_for`, etc.)
- Provisions the storage bucket with file-size and MIME-type rules
- Outputs a manifest of created/skipped resources

**Run command:** `node scripts/setup-appwrite.mjs` after env vars are set.

#### Block 7.6 (NEW) — Duplicate Template Download Endpoint
**Files:** `app/api/template-download/route.ts` AND `app/api/templates/download/route.ts`

Two endpoints exist for similar purposes. During rebuild, **consolidate to one**. Recommended canonical: `/api/templates/download` (RESTful plural). Migrate any callers, delete the singular path, add a redirect.

#### Block 16.1 (EXPANDED) — Full Testing Plan
The previous plan listed 7 unit tests on legally-load-bearing paths. That covers regulatory risk but not the broader correctness pyramid. **See Part B of this document for the full plan.**

### A.2 High-Importance Gaps

#### Block 4.16 (NEW) — Code-Driven Robots & Sitemap
**Files:** `app/robots.ts`, `app/sitemap.ts`

These are not static files in `public/`. They are TypeScript modules that Next.js 16 invokes to generate `robots.txt` and `sitemap.xml` at build time.

**`app/robots.ts`:**
- Allow all user agents
- Disallow `/admin/*`, `/api/*`, `/report/*` (tokenized, noindex)
- Sitemap reference

**`app/sitemap.ts`:**
- Static routes: home, about, faq, learn, blog, briefings, industries (×4), assessment (×4), pricing, penalty-calculator, glossary, press, white-paper, contact, privacy, terms
- Dynamic routes: every `blog_posts` slug, every `briefings` slug, every `learn/[topic]` slug
- Priority and change-frequency hints

#### Block 3.0 (NEW) — Root & Admin Layouts
**Files:** `app/layout.tsx`, `app/admin/layout.tsx`

**Root layout (`app/layout.tsx`):**
- HTML shell with `lang="en-IN"`
- Font loading (Inter or similar)
- Global CSS import
- `Header` and `Footer` rendering
- Organization + Website JSON-LD schema injected via `lib/schema.tsx`
- Vercel Analytics + GA4 via `@next/third-parties`
- Cookie/consent banner mount

**Admin layout (`app/admin/layout.tsx`):**
- Auth wrapper: redirects to `/admin/login` if no session
- Admin sidebar navigation
- Admin breadcrumbs
- No public Header/Footer (separate chrome)

#### Block 11.4 (NEW) — Email Template Assets Directory
**Path:** `webapp/templates/`

Separate from `lib/email-templates.ts` (which is TS-functional templates). This directory contains:
- `email_base.html` — base HTML email shell with branding
- `sections/` — reusable HTML partials (header, footer, CTA blocks)
- `styles/` — inline CSS for email-client compatibility

Used by the Python tooling (see next section) and potentially imported into TS templates for consistent branding.

#### Block 12.4 (NEW) — Python Tooling for Worker Tasks
**Path:** `webapp/tools/`

Two Python scripts that run *outside* the Next.js app:

- **`tools/generate_infographic.py`** — generates blog infographics. Likely uses an image library (PIL/matplotlib) or an AI image API. Triggered manually or via the blog admin's `/api/blog/infographic` route which shells out.
- **`tools/send_confirmation.py`** — standalone confirmation email sender (likely backup / batch operations).

**`requirements.txt`** at the parent webapp root holds the Python dependencies for these tools.

**Build implication:** the rebuild needs both a Node.js runtime *and* a Python 3 environment. Document this in the README.

### A.3 Medium-Importance Gaps

#### Block 4.1 (REVISED) — Homepage Component Decomposition
**Path:** `components/home/`

The homepage is composed of 9 discrete sections, each a separate component:

1. `HeroSection.tsx` — primary hero with assessment CTA
2. `TrustStrip.tsx` — logos / social proof bar
3. `AudienceCards.tsx` — 4 industry cards
4. `BriefingsSection.tsx` — daily briefing teaser
5. `WhitePaperSection.tsx` — gated download promotion
6. `AssessmentCTA.tsx` — mid-page assessment promo
7. `ConsultationCTA.tsx` — book consultation block
8. `NewsletterSection.tsx` — newsletter signup (`#newsletter` anchor)
9. `FAQPreview.tsx` — FAQ teaser linking to `/faq`

The `app/page.tsx` is a thin (~41 line) orchestrator that imports and arranges these.

#### Block 3.4 (REVISED) — Briefings Components
**File:** `components/briefings/BriefingSubscribeCard.tsx`

Single component (not multiple as previously listed). Inline subscribe card embedded in briefing pages and archive listing.

#### Block 3.1 (REVISED) — Actual UI Primitives
**Path:** `components/ui/`

Only 4 primitives exist:
- `Badge.tsx`
- `Button.tsx`
- `Card.tsx`
- `Input.tsx`

The previous plan over-specified Radix-backed primitives (`Dialog`, `Tabs`, `Accordion`, etc.) that are imported directly from `@radix-ui/react-*` packages without local wrappers. Keep the rebuild lean — wrap a primitive only when used in 3+ places with custom styling.

#### Block 4.x (NEW) — Loading States (Suspense Fallbacks)
**Files:**
- `app/briefings/loading.tsx`
- `app/briefings/[slug]/loading.tsx`
- `app/blog/[slug]/loading.tsx`

Skeleton UI shown while server data fetches. Reduces perceived latency. Critical for content pages where Appwrite reads can be 200–400ms.

#### Block 10.4 (NEW) — Admin Dashboard Home
**File:** `app/admin/page.tsx`

The admin landing page (after login) showing aggregate counts: total subscribers, today's briefing status, leads this week, completed assessments, pending consultations. Imports from `/api/admin/data`.

#### Block 8.2 (CORRECTION) — Blog Edit Path
**Actual:** `app/admin/blog/[id]/edit/page.tsx` (not `app/admin/blog/[id]/page.tsx`)

Edit form lives one level deeper. Update routing references accordingly.

---

## Part B — Comprehensive Testing Plan

The previous plan's 7 unit tests cover the highest-risk legal exposure. This plan extends to a full testing pyramid: **unit → integration → end-to-end → manual QA → deployment verification.**

### B.1 Test Pyramid Overview

```
                  ┌─────────────────────┐
                  │   Manual QA / UAT   │   <  10 scripted journeys
                  ├─────────────────────┤
                  │      E2E Tests      │   <  8 critical-path Playwright flows
                  ├─────────────────────┤
                  │  Integration Tests  │   < 15 API + DB tests
                  ├─────────────────────┤
                  │     Unit Tests      │   < 40 tests (utilities, validators, scoring)
                  └─────────────────────┘
```

Total target: **~70 automated tests + 10 manual scripts**. Runtime: full suite under 90 seconds; pre-commit subset under 10 seconds.

### B.2 Tooling

| Layer | Tool | Why |
|---|---|---|
| Unit | Vitest + @testing-library/react | Fast, near-zero config with Next.js + TS |
| API/Integration | Vitest + supertest + Appwrite mock | Run handlers without spinning a server |
| E2E | Playwright | Multi-browser, network mocking, video on fail |
| Visual regression | (Optional) Percy or Chromatic | Future — not v1 |
| Load | (Optional) k6 | Future — only if scale demands |
| Deployment | curl + Vercel preview URL probes | Pre-promotion smoke |

Install: `pnpm add -D vitest @vitest/ui @testing-library/react @playwright/test supertest`

### B.3 Unit Tests (~40 tests)

#### Library utilities (`lib/`)
| Test target | Cases |
|---|---|
| `lib/utils.ts` `cn()` | merge basic, conflicting, empty |
| `lib/utils.ts` email normalizer | trim + lowercase, idempotent, handles unicode |
| `lib/tokens.ts` `generateReportToken()` | length, uniqueness over 1000 calls, hex-only |
| `lib/tokens.ts` expiry helper | future date, past date, edge of 90-day boundary |
| `lib/suppression.ts` | bounced returns true, complained true, unsubscribed true, active false |
| `lib/templates/validation.ts` | valid email, invalid email, required fields, XSS attempt rejected |

#### Assessment scoring (`lib/data/dpdpa-assessment.ts`)
| Test target | Cases |
|---|---|
| `computeFinalScore()` | all-correct → 100, all-wrong → 0, mixed produces expected band |
| `categoryBreakdown()` | each category sums correctly, unanswered handled |
| `verdictBand()` | 0–39 → "Needs Work", 40–69 → "Developing", 70–100 → "Strong" |
| `redFlags()` | trigger conditions for each red flag |

#### Email templates (`lib/email-templates.ts`)
| Test target | Cases |
|---|---|
| `briefingEmailTemplate()` | subject contains briefing title, html includes unsubscribe URL, html includes List-Unsubscribe header guidance |
| Assessment report template | personalisation tokens substituted, score rendered correctly |
| Welcome email | branded, includes link to first briefing |

#### Schema generators (`lib/schema.tsx`)
| Test target | Cases |
|---|---|
| `organizationSchema()` | valid JSON-LD, contains `@context` and `@type` |
| `articleSchema()` | accepts title/desc, returns parseable JSON |
| `faqPageSchema()` | array of QA pairs renders correctly |

### B.4 Integration Tests (~15 tests)

Run with mocked Appwrite (`vi.mock("@/lib/appwrite", ...)`) and mocked Resend.

#### Subscribe & unsubscribe
1. `POST /api/subscribe` with valid email + frequency → 200, writes subscriber, sends welcome
2. `POST /api/subscribe` with invalid email → 400
3. `POST /api/subscribe` duplicate email → idempotent (no second consent_log row)
4. `POST /api/subscribers/unsubscribe` known email → status flipped to "unsubscribed"
5. `POST /api/subscribers/unsubscribe` unknown email → 200 with `already_removed: true` (no enumeration leak)

#### Outreach
6. `POST /api/outreach/unsubscribe` with valid token → 200, status updated
7. `POST /api/outreach/unsubscribe` with invalid token → 404
8. `POST /api/outreach/unsubscribe` already-unsubscribed → 200 with `already: true`

#### Webhook
9. `POST /api/webhooks/resend` without svix headers → 401
10. `POST /api/webhooks/resend` with bad signature → 401
11. `POST /api/webhooks/resend` with `email.bounced` → both `outreach_contacts` and `subscribers` updated
12. `POST /api/webhooks/resend` with `email.delivery_delayed` → logged but no status change

#### Cron
13. `GET /api/cron/briefing-send` without bearer → 401
14. `GET /api/cron/briefing-send` with valid bearer + no approved briefing → 404
15. `GET /api/cron/briefing-send` with approved briefing → idempotency lock prevents second execution

### B.5 End-to-End Tests (~8 critical paths, Playwright)

Run against a deployed preview URL (or local `next dev`) with a clean test Appwrite database.

| # | Journey | Pass criteria |
|---|---|---|
| 1 | **New visitor → newsletter subscribe** | Land on `/`, fill newsletter form, see success state, receive welcome email |
| 2 | **Visitor → assessment → report** | Take D2C assessment, complete all questions, see report page with score and recommendations |
| 3 | **Report token expiry** | Visit `/report/[expired-token]`, see expiry message, NOT score data |
| 4 | **Email link unsubscribe** | Click List-Unsubscribe URL from a real email → land on confirmation, status updated |
| 5 | **Admin login → approve briefing → send** | Login, generate draft, edit, approve, manually trigger send, verify subscriber count |
| 6 | **Blog reader journey** | Land on `/blog`, click post, read, click related, return to `/`, subscribe |
| 7 | **Template download gating** | Click download on white paper, fill email, receive download link, click link → file delivered |
| 8 | **Consent preferences flow** | Visit `/consent-preferences`, toggle off marketing, save, verify `consent_log` row written |

### B.6 Manual QA Scripts (~10 scripted runs, pre-launch)

Living document, executed manually before each major release.

1. **Mobile responsive sweep** — homepage + assessment + report on iPhone 12 / Pixel 6 viewports
2. **Cross-browser** — Chrome, Safari, Firefox; check fonts, animations, form validation
3. **Email rendering** — send each template type to Gmail, Outlook, Apple Mail; verify rendering and List-Unsubscribe button presence
4. **Accessibility** — keyboard-only navigation through assessment, screen-reader test on report page, color contrast spot-check
5. **DPDPA evidence trail** — subscribe an email, check `consent_log` has row; unsubscribe, verify second row; ensure both immutable
6. **Suppression honor test** — manually mark a subscriber as `bounced`; trigger cron; verify they receive no email
7. **404 / Error boundary** — visit non-existent route, expired report, malformed assessment URL
8. **SEO check** — `view-source` on key pages → confirm meta, OG, JSON-LD all present
9. **Lighthouse scorecard** — run on `/`, `/assessment`, `/report/[token]`, `/blog/[slug]` → all ≥90 on perf and SEO
10. **Backup/restore drill** — export Appwrite, import to a clean project, verify referential integrity

### B.7 Deployment Verification (post-promote smoke tests)

Run after every production deploy. Automate via curl in a GitHub Action.

```bash
# 1. Health check
curl -fsS https://saralprivacy.com/ | grep -q "SaralPrivacy"

# 2. API responsive
curl -fsS -X POST https://saralprivacy.com/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"smoke-test@example.com","frequency":"daily"}' | grep -q success

# 3. Cron auth
curl -s -o /dev/null -w "%{http_code}" \
  https://saralprivacy.com/api/cron/briefing-send | grep -q 401

# 4. Webhook auth
curl -s -o /dev/null -w "%{http_code}" -X POST \
  https://saralprivacy.com/api/webhooks/resend | grep -q 401

# 5. Sitemap valid
curl -fsS https://saralprivacy.com/sitemap.xml | grep -q "<urlset"

# 6. Robots correct
curl -fsS https://saralprivacy.com/robots.txt | grep -q "Disallow: /admin"

# 7. Report token unguessable (404 expected for random)
curl -s -o /dev/null -w "%{http_code}" \
  https://saralprivacy.com/report/random-bad-token | grep -q 404
```

### B.8 Continuous Integration Wiring

**`.github/workflows/test.yml` (proposed):**
- On every PR: lint → typecheck → unit + integration tests
- On main branch: above + Playwright E2E against the Vercel preview
- On production promote: deployment verification curl suite

**Pre-commit hook (Husky):**
- Run `pnpm lint` and `pnpm vitest --run --changed`
- Block commit on failure

### B.9 Test Data Strategy

- **Appwrite test database:** separate Appwrite project with same schema, populated by a `scripts/seed-test-data.mjs` script
- **Email sandbox:** Resend has a test mode (`onboarding@resend.dev` recipient) — use for E2E without sending real emails
- **Token fixtures:** test report tokens with known expiry states (active, near-expiry, expired)

### B.10 Coverage Targets (v1)

| Layer | Coverage target |
|---|---|
| `lib/` utilities | 90% line coverage |
| API routes | 100% of legally-load-bearing routes (subscribe, unsubscribe, webhook, cron, report) |
| Components | 60% of interactive components (forms, wizards) |
| E2E | 8 happy paths green; full regression run weekly |

---

## Part C — Updated Phased Build Sequence

Incorporating all gaps, the 16-week sequence becomes:

| Week | Focus | New / Updated Items |
|---|---|---|
| **1** | Block 0 + Block 1 + **Block 1.6 (NEW)** | Foundation, Appwrite schema **via setup script**, deploy pipeline |
| **2–3** | Block 2 + Block 3.0 (NEW) + Block 5 + **Tests inline** | Layouts, subscribe, hardened cron, **integration tests for cron + webhook from Day 1** |
| **4–5** | Block 6 + Block 11.4 (NEW) + Block 12.4 (NEW) | Assessment, email template assets, Python tooling environment |
| **6–8** | Block 4 + Block 4.16 (NEW) + Block 14 | Public site, code-driven robots/sitemap, SEO, loading states |
| **9** | Block 7 + Block 8 + **Block 7.6 (consolidate template endpoints)** | Lead capture, blog, **single template-download route** |
| **10** | Block 15 | Consent preferences, rights, audit log |
| **11** | Block 10 + **Block 10.4 (admin dashboard home)** | Full admin console |
| **12** | Block 9 *(or skip)* | Outreach — recommend skipping for v1 |
| **13–14** | **Block 16 EXPANDED (full test pyramid)** | Vitest unit + integration, Playwright E2E, manual QA scripts, deployment verification |
| **15–16** | Block 17 + final polish | Pricing, calculator, glossary, press, pre-launch QA |

---

## Part D — "Build From Scratch" Bootstrap Checklist

A condensed, executable checklist for someone rebuilding the application from zero. Use this as the README equivalent.

### D.1 Prerequisites
- [ ] Node.js 24 LTS installed
- [ ] Python 3.11+ installed (for `tools/`)
- [ ] pnpm or npm
- [ ] Vercel account
- [ ] Appwrite Cloud account
- [ ] Resend account with verified domain
- [ ] Anthropic API key
- [ ] Custom domain registered

### D.2 Phase 1 — Bootstrap (Day 1)
- [ ] `git clone` repo (or scaffold fresh per Block 0)
- [ ] `pnpm install` in `webapp/`
- [ ] `pip install -r requirements.txt` (for tools/)
- [ ] Copy `.env.example` → `.env.local`, fill all secrets
- [ ] Create Appwrite project, copy IDs into `.env.local`
- [ ] Run `node scripts/setup-appwrite.mjs` → schema provisioned
- [ ] Verify: log into Appwrite console, confirm 13 collections + indexes + bucket exist

### D.3 Phase 2 — Local Dev Verify (Day 1)
- [ ] `pnpm dev` → http://localhost:3000 loads
- [ ] Subscribe to newsletter → row appears in `subscribers`
- [ ] Take assessment → row appears in `assessments`, report token works
- [ ] Admin login → all modules render

### D.4 Phase 3 — Deploy (Day 2)
- [ ] Link Vercel project, set `rootDirectory = webapp`
- [ ] Push all env vars to Vercel
- [ ] Configure cron in `vercel.json`
- [ ] Push to `main` → preview deploys → production promote
- [ ] Run deployment verification curl suite (B.7)

### D.5 Phase 4 — Email Wiring (Day 2)
- [ ] Verify SPF, DKIM, DMARC on domain
- [ ] Register Resend webhook → `/api/webhooks/resend`
- [ ] Set `RESEND_WEBHOOK_SECRET` in Vercel
- [ ] Test: send a manual briefing, confirm delivery + audit log

### D.6 Phase 5 — Content Seed (Days 3–5)
- [ ] Seed 5 blog posts
- [ ] Seed 3 approved briefings
- [ ] Upload templates to Appwrite Storage bucket
- [ ] Verify white paper download flow end-to-end
- [ ] Submit sitemap to Google Search Console

### D.7 Phase 6 — Test Suite (Days 6–8)
- [ ] Run unit tests → 100% green
- [ ] Run integration tests → 100% green
- [ ] Run Playwright E2E → all 8 paths pass
- [ ] Manual QA scripts (B.6) → all 10 pass
- [ ] Lighthouse → ≥90 across the board

### D.8 Go-Live (Day 9)
- [ ] DNS cutover
- [ ] Production deployment verification (B.7)
- [ ] Monitor Sentry for first 24 hours
- [ ] First subscriber smoke test (real address)

---

## Document Status

This supplement closes the gap between the previous Development Plan and a true "build-from-scratch" document. Combined with the PRD and Development Plan, the three documents now contain everything needed to reproduce SaralPrivacy.com to current parity, including white paper, admin, template download, email tooling, Python workers, and a full testing strategy.

**Read order:**
1. `SaralPrivacy_PRD.md` — what to build and why
2. `SaralPrivacy_DevelopmentPlan.md` — block-by-block how
3. `SaralPrivacy_Gaps_and_TestingPlan.md` (this doc) — what was missing + how to verify
