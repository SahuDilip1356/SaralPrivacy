# SaralPrivacy.com — Complete Reverse-Engineered Development Plan

**Document type:** Block-wise development plan
**Version:** 1.0
**Date:** 2026-04-28
**Companion to:** SaralPrivacy_PRD.md

A block-by-block reconstruction of the live application, organized so that each block is independently buildable, testable, and deployable.

---

## Block 0 — Foundation & Infrastructure

**Purpose:** Project scaffold, hosting, secrets, deploy pipeline.

### 0.1 Repository & Project Setup
- Monorepo structure with `webapp/` as the Next.js project root
- Initialize Next.js 16 App Router project with TypeScript, ESLint, Tailwind v4
- Configure `tsconfig.json` with `@/*` path alias
- `.gitignore` for `.next`, `node_modules`, `.vercel`, `.env*`
- Single `package.json` at `webapp/` root only

### 0.2 Stack Installation
- **Framework:** `next@16.1.7`, `react@19.2.3`, `react-dom@19.2.3`
- **UI primitives:** Radix UI (accordion, checkbox, dialog, dropdown-menu, progress, select, tabs, toast)
- **Styling utilities:** `class-variance-authority`, `clsx`, `tailwind-merge`
- **Icons:** `lucide-react`
- **Animation:** `framer-motion`
- **Backend SDK:** `node-appwrite`
- **Email:** `resend`
- **Webhook verification:** `svix`
- **Auth crypto:** `bcryptjs`
- **AI:** `@ai-sdk/anthropic`, `ai`
- **Markdown:** `react-markdown`, `remark-gfm`
- **Date utils:** `date-fns`
- **Spreadsheet (admin export):** `xlsx`
- **Vercel third-parties:** `@next/third-parties`

### 0.3 Hosting & DNS
- Vercel project linked, region `sin1`
- Custom domain `saralprivacy.com` with SSL
- Root directory set to `webapp` in Vercel Dashboard
- Branch: `main` → production, all PRs → preview deployments

### 0.4 Environment Secrets
- `APPWRITE_ENDPOINT`, `APPWRITE_PROJECT_ID`, `APPWRITE_API_KEY`, `APPWRITE_DATABASE_ID`, `APPWRITE_BUCKET_ID`
- `RESEND_API_KEY`, `RESEND_FROM_BRIEFINGS`, `RESEND_WEBHOOK_SECRET`
- `ANTHROPIC_API_KEY`
- `CRON_SECRET`
- `NEXT_PUBLIC_SITE_URL`
- `ADMIN_PASSWORD_HASH`

### 0.5 Security Headers (`next.config.ts`)
- CSP with `default-src 'self'`, scoped `connect-src` to Appwrite + Resend
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

### 0.6 Routing Middleware (`proxy.ts` — Next.js 16)
- Single middleware file only
- Lightweight; placeholder for future rate-limiting and bot detection

### 0.7 Cron Configuration (`vercel.json`)
```json
{
  "regions": ["sin1"],
  "crons": [
    { "path": "/api/cron/outreach-send",  "schedule": "0 4 * * *"  },
    { "path": "/api/cron/briefing-send",  "schedule": "30 4 * * *" }
  ]
}
```

### 0.8 Image Configuration
- Allow Appwrite Storage hostnames in `next.config.ts` `images.remotePatterns`

### 0.9 Redirects
- `/subscribe → /#newsletter`
- `/unsubscribe → /consent-preferences`
- `/rights/access`, `/rights/erasure → /privacy#data-rights`
- `/webinars → /resources`
- 5 legacy resource paths → updated equivalents

---

## Block 1 — Data Layer

**Purpose:** Appwrite schema. Everything else depends on this.

### 1.1 Appwrite Project & Database
- Create Appwrite project on `sgp.cloud.appwrite.io`
- Single database; storage bucket for templates and assets
- Server SDK initialized in `lib/appwrite.ts`

### 1.2 Collections (13 total)

| # | Collection | Purpose |
|---|---|---|
| 1 | `leads` | Inbound contact and consultation requests |
| 2 | `subscribers` | Briefing email subscribers |
| 3 | `downloads` | Tracked downloads |
| 4 | `assessments` | Completed DPDPA readiness assessments |
| 5 | `briefings` | Daily briefing drafts and history |
| 6 | `consent_log` | Granular consent records (DPDPA evidence) |
| 7 | `survey_responses` | Industry-specific survey submissions |
| 8 | `blog_posts` | Blog content with markdown body |
| 9 | `blogger_accounts` | Multi-author CMS authentication |
| 10 | `template_downloads` | Email-gated template download log |
| 11 | `outreach_contacts` | Outbound campaign contacts with magic-tokens |
| 12 | `email_send_log` | Every email sent — DPDPA audit trail |
| 13 | `content_roadmap` | Internal content planning data |

### 1.3 Key Attributes Per Collection
- `subscribers`: email, frequency (daily/weekly), status (active/unsubscribed/bounced/complained), consent_basis
- `briefings`: title, slug, summary, content, why_it_matters, action_checklist, status (draft/approved/sending/sent/send_partial/send_failed), scheduled_for, sent_at, subscriber_count
- `assessments`: name, email, business_name, industry, answers_json, category_scores_json, final_score, verdict_band, red_flags_json, immediate_actions_json, thirty_day_actions_json, report_token, report_token_expires_at
- `email_send_log`: recipient_email, email_type, resend_message_id, status, consent_basis, sent_at, error_message
- `outreach_contacts`: email, name, company, status, magic_token

### 1.4 Indexes
- `subscribers.email` (unique)
- `subscribers.status` (filter index)
- `briefings.status` + `scheduled_for` (compound for cron query)
- `assessments.report_token` (unique)
- `outreach_contacts.magic_token` (unique)
- `email_send_log.recipient_email` + `sent_at` (audit lookups)

### 1.5 Storage Bucket
- Single bucket for: blog images, infographic outputs, white paper PDFs, template files
- Helper functions `getFileViewUrl(fileId)` and `getFileDownloadUrl(fileId)` exposed from `lib/appwrite.ts`

---

## Block 2 — Shared Libraries (`lib/`)

### 2.1 `lib/appwrite.ts`
- Client setup, exports `databases`, `storage`, `ID`, `Query`, `DB_ID`, `BUCKET_ID`, `COLLECTIONS`

### 2.2 `lib/email-templates.ts`
- `briefingEmailTemplate(briefing, unsubscribeUrl)` returning `{subject, html}`
- Assessment report email template
- Welcome email for new subscribers
- Outreach intro email template
- Template download delivery email

### 2.3 `lib/email.ts`
- Wrapper around Resend send + audit logging
- Centralizes `consent_basis` writing

### 2.4 `lib/schema.tsx`
- `organizationSchema()`, `websiteSchema()`, `articleSchema()`, `breadcrumbSchema()`, `faqPageSchema()`
- All return JSON-LD `<script>` tags

### 2.5 `lib/tokens.ts`
- `generateReportToken()` — cryptographically random 32-byte hex
- `generateMagicToken()` — for outreach unsubscribe
- Token expiry helpers

### 2.6 `lib/suppression.ts`
- Returns `true` if email is in `bounced`, `complained`, or `unsubscribed` state

### 2.7 `lib/subscribers.ts`
- Helpers for subscriber lookup, status updates, consent recording

### 2.8 `lib/analytics.ts`
- GA4 / Plausible event helpers
- UTM parameter parsing

### 2.9 `lib/utils.ts`
- `cn()` Tailwind class merger
- Date formatters
- Email normalizer (`trim().toLowerCase()`)

### 2.10 `lib/data/`
- `dpdpa-assessment.ts` — question bank with `QUESTIONS`, options, weights, category mappings
- `assessments.ts` — industry config map (D2C, CA, recruitment, training)
- `briefings.ts` — briefing display constants
- `faqs.ts` — FAQ content for FAQ page + schema
- `resources.ts` — resource hub items

### 2.11 `lib/templates/validation.ts`
- Validation logic for template download form inputs

### 2.12 `lib/types/index.ts`
- Shared TypeScript types: `Subscriber`, `Briefing`, `Assessment`, `Lead`, etc.

---

## Block 3 — UI Components

### 3.1 `components/ui/`
- `Button`, `Input`, `Label`, `Card`, `Dialog`, `Toast`, `Tabs`, `Accordion`, `Checkbox`, `Select`, `Progress`, `Badge`, `DropdownMenu`
- All variants via `class-variance-authority`

### 3.2 `components/layout/`
- `Header` with navigation
- `Footer` with policy links + newsletter signup
- `Navigation` with mobile menu
- Cookie/consent banner

### 3.3 `components/home/`
- Hero
- Value proposition section
- Industry cards (4 industries)
- Daily Briefing teaser
- Newsletter signup form
- Testimonials/social proof
- CTA blocks

### 3.4 `components/briefings/`
- Briefing card (used in archive list)
- Briefing renderer (markdown content + structured sections)
- Subscribe inline form

### 3.5 `components/assessment/`
- `AssessmentWizard.tsx` — multi-step form with progress, validation, branching
- Question renderer (single-choice, multi-select)
- Scoring summary view
- Lead capture form (final step)

### 3.6 `components/admin/`
- `BlogEditor.tsx` — markdown editor with AI assist buttons
- Admin sidebar navigation
- Admin auth wrapper
- Status badges (with new states: sending, send_partial, send_failed)

### 3.7 `components/`
- `TemplateDownloadForm.tsx` — gated form
- `TemplateDownloadModal.tsx` — modal wrapper
- `TemplateGateModal.tsx` — used in report page for template offers

---

## Block 4 — Public Site (Marketing & Content Pages)

### 4.1 Homepage `/`
- Hero with primary CTA → assessment
- Industry showcase
- Briefing teaser
- Newsletter signup section (`#newsletter` anchor)
- Trust signals

### 4.2 About `/about`
- Founder story, mission, values, team

### 4.3 Industry Landing Pages (`/industries/`)
- `/industries` (hub)
- `/industries/ca-firms`
- `/industries/d2c-brands`
- `/industries/recruitment-agencies`
- `/industries/training-institutes`

### 4.4 Learn Pages (`/learn/`)
- `/learn` (hub)
- `/learn/[topic]` (dynamic catch-all)
- `/learn/dpdp-rules-2025-plain-english-guide` (flagship guide)
- Article schema, breadcrumb schema, FAQ schema embedded

### 4.5 Blog (`/blog/`)
- `/blog` (list page)
- `/blog/[slug]` (post page) with markdown rendering
- Reading time, share buttons, related posts

### 4.6 Briefings Archive (`/briefings/`)
- `/briefings` (list)
- `/briefings/[slug]` (individual briefing — public)

### 4.7 Resources (`/resources`) — currently redirects to `/blog`

### 4.8 White Paper (`/white-paper`)
- Email-gated download landing page
- POST to `/api/white-paper`

### 4.9 Subscribe (`/subscribe`) — redirects to `/#newsletter`

### 4.10 FAQ (`/faq`) — long FAQ list with FAQPage schema, searchable

### 4.11 Contact (`/contact`)
- Contact form → POST to `/api/contact`
- Optional `?plan=` query param for pricing-page deep links

### 4.12 Legal Pages
- `/privacy` — privacy policy with `#data-rights` anchor
- `/terms` — terms of service

### 4.13 Consent & Rights
- `/consent-preferences` — granular consent toggles
- `/rights` — data rights hub
- `/rights/access` and `/rights/erasure` (redirect to `/privacy#data-rights`)

### 4.14 Unsubscribe
- `/unsubscribe` — newsletter unsubscribe (Suspense-wrapped, accepts `?email=`)
- `/unsubscribe/outreach` — outreach unsubscribe with magic-token

### 4.15 Public SEO Files (`public/`)
- `robots.txt`
- `sitemap.xml` (or dynamic generation)
- `llms.txt` and `llms-full.txt`
- `og-image.png`, `logo.png`, `logo-emblem.png`
- `favicon.ico`, `icon.png`
- Google Search Console verification HTML

---

## Block 5 — Subscriber & Briefing Pipeline

**Purpose:** The core product. Brand promise.

### 5.1 Subscribe Flow
- `POST /api/subscribe` — accepts email + frequency, writes to `subscribers` with `consent_basis`, sends welcome email
- `POST /api/subscribers/unsubscribe` — accepts email, flips `status: "unsubscribed"`, gracefully handles unknown emails

### 5.2 Briefing Authoring (Admin)
- `POST /api/briefings/generate` — Anthropic-driven AI draft. Output: title, summary, content, why_it_matters, action_checklist
- `POST /api/briefings/approve` — flips status `draft → approved`, stamps `scheduled_for`
- `POST /api/briefings/delete` — admin removal
- `GET /api/briefings/today` — today's briefing for public archive
- `POST /api/briefings/send` — manual send (admin override of cron)

### 5.3 Briefing Cron (`/api/cron/briefing-send`) — Hardened Build

Build sequence — do this right the first time:

1. Verify `Authorization: Bearer ${CRON_SECRET}`
2. Find most recent `approved` briefing
3. **Atomically claim** by updating `status: "approved" → "sending"`; bail if claim fails
4. Paginate all subscribers via `Query.cursorAfter` (no 500-cap)
5. Filter: skip suppressed (bounced/complained/unsubscribed); skip weekly subscribers on non-Mondays
6. Send in batches of 100 via `resend.batch.send`
7. Per-recipient `email_send_log` row with `consent_basis: "explicit_consent"`, `email_type: briefing_daily | briefing_weekly`
8. Log failures with `status: "failed"` + `error_message` to maintain audit chain
9. `List-Unsubscribe` header on every email
10. Final status: `sent` (all good), `send_partial` (some failed), `send_failed` (all failed)

### 5.4 Resend Webhook (`/api/webhooks/resend`)
- svix signature verification using `RESEND_WEBHOOK_SECRET`
- Read raw body via `request.text()` before parsing
- Handle: `email.bounced`, `email.complained`, `email.delivery_delayed`, `email.delivered`, `email.opened`, `email.clicked`
- On bounce/complaint: update both `outreach_contacts` and `subscribers` collections
- Log every event to `email_send_log`

---

## Block 6 — Assessment Engine

### 6.1 Question Bank (`lib/data/dpdpa-assessment.ts`)
- 15–25 questions across categories (consent, breach, retention, rights, processing, transfers, security, governance)
- Each: id, key, text, type (single/multi), options with id/text/score, weight, category mapping
- Industry-specific question variants

### 6.2 Industry Configurations (`lib/data/assessments.ts`)
- Maps industry → applicable questions + scoring weights + verdict bands
- Industries: `d2c-brands`, `ca-firms`, `recruitment`, `training-institutes`
- **Best practice:** single component driven by config, not 4 separate pages

### 6.3 Public Assessment Pages
- `/assessment` — industry chooser hub
- `/assessment/d2c-brands`
- `/assessment/ca-firms`
- `/assessment/recruitment`
- `/assessment/training-institutes`
- All render `<AssessmentWizard industry={...} />`

### 6.4 Assessment Submission
- `POST /api/assessment` — validates answers, computes scoring (per-category + final), generates verdict band, red flags, immediate + 30-day actions, creates `report_token` with 90-day expiry, persists to `assessments`, triggers report email

### 6.5 Report Page
- `/report/[token]` — server-rendered, `robots: noindex, nofollow`
- Token validation + expiry check (display expiry message if past 90 days)
- Renders: overall score, category bars, red flags, immediate actions, 30-day plan, projection (conservative/likely/best-case), full answer summary
- Embeds `TemplateGateModal` for upsell

---

## Block 7 — Lead, Survey & Contact Capture

### 7.1 Contact Form
- `/contact` page
- `POST /api/contact` — writes to `leads`, sends notification email to admin, sends confirmation to user

### 7.2 Survey
- Industry survey forms (likely embedded in industry pages)
- `POST /api/survey/submit` — writes to `survey_responses`

### 7.3 White Paper Download
- `/white-paper` page
- `POST /api/white-paper` — captures email, sends PDF link, logs to `downloads`

### 7.4 Template Download
- `POST /api/template-download` — email-gated, writes to `template_downloads`, sends file link

### 7.5 Revalidation Hook
- `POST /api/revalidate` — manual cache revalidation for content updates

---

## Block 8 — Content System (Blog + AI Tooling)

### 8.1 Blog Public Pages
- `/blog` (list) and `/blog/[slug]` (post)
- React-markdown + remark-gfm for rendering
- Article + Breadcrumb JSON-LD schema

### 8.2 Blog Admin
- `/admin/blog` (list)
- `/admin/blog/new` (create)
- `/admin/blog/[id]` (edit)
- Markdown editor via `BlogEditor.tsx`

### 8.3 Blog APIs
- `GET/POST /api/blog/[id]` — read/update single post
- `POST /api/blog/save` — create or update
- `POST /api/blog/validate` — AI-driven content validation (Anthropic)
- `POST /api/blog/revise` — AI-driven content suggestions
- `POST /api/blog/infographic` — AI-driven infographic generation

### 8.4 Multi-Author Support
- `/admin/bloggers` (list)
- `GET /api/admin/bloggers` and `/api/admin/bloggers/[id]`
- bcrypt password hashing
- `blogger_accounts` collection with role field

---

## Block 9 — Outreach System

### 9.1 Outreach APIs
- `POST /api/outreach/import` — CSV bulk import, generates `magic_token` per contact
- `POST /api/outreach/subscribe` — single contact add
- `POST /api/outreach/unsubscribe` — token-based unsubscribe (RFC 8058 compliant)
- `GET /api/outreach/stats` — aggregate stats (sent, opened, clicked, bounced, unsubscribed)

### 9.2 Outreach Cron (`/api/cron/outreach-send`)
- 04:00 UTC daily
- Same hardening principles as briefing cron: idempotency, batching, audit logging
- Bearer auth via `CRON_SECRET`

### 9.3 Outreach Admin
- `/admin/outreach` — campaign view, contact list, import UI, stats dashboard

---

## Block 10 — Admin Console

### 10.1 Admin Authentication
- `/admin/login` — password login
- `POST /api/admin/login` — bcrypt verify, session cookie
- `/admin/set-password` — initial setup
- `POST /api/admin/set-password` — hash and store

### 10.2 Admin Modules

| Route | Function |
|---|---|
| `/admin/briefings` | Draft, approve, send, view history |
| `/admin/blog`, `/admin/blog/new`, `/admin/blog/[id]` | Blog CMS |
| `/admin/bloggers` | Author accounts |
| `/admin/assessments` | Completed assessments viewer |
| `/admin/consultations` | Consultation request pipeline |
| `/admin/leads` | Inbound leads |
| `/admin/downloads` | Download tracking |
| `/admin/subscribers` | Subscriber list with status |
| `/admin/outreach` | Outreach campaigns |
| `/admin/consent` | Consent log viewer (DPDPA evidence) |
| `/admin/survey-responses` | Survey results |

### 10.3 Admin Data API
- `GET /api/admin/data` — aggregate dashboard data
- `POST /api/admin/send-report` — re-send assessment report email

---

## Block 11 — Email Infrastructure

### 11.1 Resend Setup
- Account configured with verified domain
- SPF, DKIM, DMARC records on `saralprivacy.com`
- Two senders: `briefings@saralprivacy.com`, `hello@saralprivacy.com`
- Webhook endpoint registered: `https://saralprivacy.com/api/webhooks/resend`

### 11.2 Email Templates (centralized in `lib/email-templates.ts`)
- Briefing email (daily and weekly variants)
- Assessment report delivery
- Welcome email (new subscriber)
- Contact form confirmation
- White paper download delivery
- Template download delivery
- Outreach intro
- Admin notifications

### 11.3 Audit Trail Discipline
- Every send writes to `email_send_log` with `consent_basis`
- Failed sends logged with `error_message`
- Webhook events appended to same log
- Single source of truth for "what was sent to whom and why"

---

## Block 12 — AI Integration

### 12.1 Briefing Generation
- Anthropic SDK call with prompt template
- Inputs: today's date, recent DPDPA news context (manual paste or future RSS pull)
- Output: structured JSON with title, summary, content, why_it_matters, action_checklist
- Persisted as draft

### 12.2 Blog AI Assists
- Revise: rewrite for tone/clarity
- Validate: check factual claims, structure, SEO
- Infographic: generate structured visual asset spec

### 12.3 Assessment Narrative
- AI-driven generation of red flags, immediate actions, 30-day plan from raw answers
- Triggered server-side on assessment submission

---

## Block 13 — Cron Scheduling & Operational Reliability

### 13.1 Cron Endpoints
- `/api/cron/briefing-send` — 04:30 UTC daily
- `/api/cron/outreach-send` — 04:00 UTC daily

### 13.2 Cron Hardening (universal pattern)
- Bearer token auth using `CRON_SECRET`
- Idempotency: atomic status flip before any send
- Pagination: cursor-based, never `Query.limit(N)` cap
- Batching: `resend.batch.send` 100/call
- Per-recipient audit log
- Failure logging with error message
- Conditional final-status flip based on outcome
- Vercel retry-safe

### 13.3 Monitoring (recommended for v1.5)
- Sentry or equivalent error tracking
- Cron health pings to a monitoring service
- Admin dashboard surfacing last cron run + outcome

---

## Block 14 — SEO & Discoverability

### 14.1 On-Page SEO
- Per-page `metadata` exports in App Router with title, description, OG, canonical
- JSON-LD schemas: Organization, WebSite, Article, FAQPage, BreadcrumbList, DefinedTermSet (glossary), WebApplication (calculator)
- Semantic HTML (h1, h2 hierarchy)
- Internal linking strategy

### 14.2 Technical SEO
- `robots.txt` with crawl rules
- `sitemap.xml` (static or dynamic)
- Canonical URLs on every page
- Mobile-first responsive design
- Lighthouse target: ≥90 on Performance, SEO, Accessibility

### 14.3 LLM SEO
- `llms.txt` and `llms-full.txt` in `/public`
- Currently scoring 8.8/10

### 14.4 Image SEO
- Alt text discipline
- WebP/AVIF via `next/image`
- Optimized OG images per content type

---

## Block 15 — Privacy, Consent & Compliance Posture

### 15.1 Consent Recording
- Every email signup writes to `consent_log` with `purpose`, `granted: true`, timestamp, IP hash, UA hash
- Withdrawal also logged
- Immutable audit trail

### 15.2 Granular Consent Preferences
- `/consent-preferences` — toggles per purpose
- POST writes diff to `consent_log`

### 15.3 Data Rights Workflow
- `/rights/access` and `/rights/erasure` form pages
- Future: ticket system + admin queue + SLA tracking

### 15.4 Suppression Honor
- Bounce/complaint/unsubscribe respected across all collections
- Cron filters at send time
- Admin UI prevents re-adding suppressed emails

### 15.5 Tokenization
- Report tokens (90-day expiry)
- Outreach magic tokens (single-purpose)
- Cryptographic randomness (not sequential IDs)

---

## Block 16 — Hardening & Quality Gates

**The largest gap in the live product.**

### 16.1 Test Layer (Vitest)

The 7 tests on legally-load-bearing paths:

1. `subscribers/unsubscribe` happy path + unknown email
2. `outreach/unsubscribe` invalid token + already-unsubscribed
3. `webhooks/resend` rejects unsigned POSTs
4. `webhooks/resend` bounce updates both collections
5. `report/[token]` expired token doesn't leak data
6. `cron/briefing-send` requires bearer auth
7. `cron/briefing-send` idempotency lock prevents double-send

### 16.2 Rate Limiting
- Public POSTs (subscribe, contact, assessment) rate-limited via Upstash Redis or Vercel KV
- Per-IP and per-email throttles

### 16.3 Tightened CSP
- Replace `unsafe-inline` and `unsafe-eval` with nonce-based CSP
- Stricter `connect-src` whitelist

### 16.4 Backup & DR
- Daily Appwrite export → S3
- Documented restore runbook
- RTO/RPO targets

### 16.5 Observability
- Sentry for errors
- Vercel Analytics for performance
- Cron health dashboard

---

## Block 17 — Missing Pieces (Roadmap Items)

### 17.1 Pricing Page (`/pricing`)
- Three-tier structure: Free, Compliance Starter, Compliance Pro, Custom
- Annual/monthly toggle
- Feature matrix
- FAQ
- Per-tier CTA → `/contact?plan=`

### 17.2 Penalty Calculator (`/penalty-calculator`)
- Interactive tool: violation types × revenue band × affected scale
- Output: estimated DPDPA exposure
- Funnels into assessment

### 17.3 Glossary (`/learn/dpdpa-glossary`)
- 25+ terms with plain-English + formal definitions
- Searchable
- DefinedTermSet schema for rich results

### 17.4 Press Page (`/press`)
- Founder bio, sample quotes, journalist contact
- Foundation for HARO/Qwoted-driven backlinks

### 17.5 Compliance Checklist (interactive, future)
- Self-serve checklist with progress save
- Mid-tier between calculator and full assessment

---

## Block 18 — Phased Build Sequence (16-Week Plan)

| Week | Focus | Deliverables |
|---|---|---|
| **1** | Block 0 + Block 1 | Foundation, deploy pipeline, Appwrite schema |
| **2–3** | Block 2 + Block 5 | Subscribe, generate, approve, hardened cron, webhook |
| **4–5** | Block 6 | Assessment wizard, report page, all 4 industries |
| **6–8** | Block 4 + Block 14 | Homepage, learn, blog, briefings archive, schemas, llms.txt |
| **9** | Block 7 + Block 8 | Contact, survey, downloads, white paper |
| **10** | Block 15 | Consent preferences, rights pages, audit log |
| **11** | Block 10 | All admin modules wired |
| **12** | Block 9 *(or skip)* | Outreach — recommend Resend Audiences instead |
| **13–14** | Block 16 | Tests, rate limits, CSP tightening, monitoring |
| **15–16** | Block 17 + polish | Pricing, calculator, glossary, press, pre-launch QA |

---

## Block 19 — Live Product vs. Reverse-Engineered Plan: Status Map

| Block | Live Status | Gap |
|---|---|---|
| 0 — Foundation | ✅ Complete | CSP could be tightened |
| 1 — Data Layer | ✅ All 13 collections live | — |
| 2 — Shared Libraries | ✅ All present | — |
| 3 — UI Components | ✅ All shipping | — |
| 4 — Public Site | ✅ ~48 pages live | Industry pages could be richer |
| 5 — Subscriber & Briefing | ✅ Functional | ⚠️ Cron lacks idempotency, audit gaps, 500-cap |
| 6 — Assessment | ✅ 4 industries live | ⚠️ Likely 4 duplicate components, should be unified |
| 7 — Lead Capture | ✅ All endpoints live | — |
| 8 — Blog + AI | ✅ Live | ⚠️ AI tooling over-built for current cadence |
| 9 — Outreach | ✅ Built | 🚨 Should likely be replaced with Resend Audiences |
| 10 — Admin Console | ✅ All modules ship | ⚠️ Needs new status badges for cron states |
| 11 — Email Infra | ✅ Working | — |
| 12 — AI Integration | ✅ Live | — |
| 13 — Cron | ✅ Running | ⚠️ Hardening needed (Block 16) |
| 14 — SEO | ✅ 8.8/10 score | Strong |
| 15 — Privacy & Consent | ✅ Pages exist | ⚠️ Verify granular toggles write to consent_log |
| 16 — Hardening | ❌ Largely missing | 🚨 Tests, rate limits, monitoring all gaps |
| 17 — Missing Pieces | ❌ Not built | 🚨 Pricing, calculator, glossary all missing |

---

## Summary

**Build coverage today: ~85% of v1 architecture.** The application is far more complete than most stage-equivalent SaaS products. Block 17 (pricing, calculator, glossary, press) and Block 16 (hardening) are the two material gaps.

### Recommended Next 30 Days

1. **Week 1:** Block 16.1 (the 7 tests) + Block 5.3 cron hardening
2. **Week 2:** Block 17.1 (Pricing page) + Block 17.2 (Penalty Calculator)
3. **Week 3:** Block 17.3 (Glossary) + Block 17.4 (Press page)
4. **Week 4:** Block 16.2 (rate limiting) + Block 16.5 (monitoring) + SEO submissions

This order maximizes near-term revenue (pricing), defensive resilience (cron + tests), and long-term SEO compounding (glossary + calculator).
