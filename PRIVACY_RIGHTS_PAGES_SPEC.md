# Privacy Notice + Your Rights — Build Plan

Status: **BUILT + BUILD-VERIFIED 2026-07-17** · uncommitted on `feat/landing-redesign`
Author: Dilip Sahu · Date: 2026-07-17

**Verified:** `next build` exit 0; `/rights` prerendered static and in the sitemap; asserted
against the real prerendered HTML that the DPO block, all 6 rights, `#access`/`#erasure`
anchors, `#data-rights` anchor, the 7 vendors, Singapore, and the v2.0 stamp all render —
that Twilio does **not** appear, and that the false "we do not track individual users across
sessions" claim is gone.

**Not verified:** browser render. The preview harness fails with `EPERM: uv_cwd` on this
iCloud path (plain `node` works from a shell — it's the harness, not the code). Visual/
responsive check still owed, easiest on the Vercel preview.

**BLOCKING before prod:**
1. **`dpo@saralprivacy.com` must exist.** Now published on /privacy, /rights, and the
   footer. A statutory rights request bouncing is worse than the old privacy@.
2. **GA decision (§2)** — the notice is now truthful about Google, which makes the
   un-consented-cookie gap *more* visible, not less.

**Env fix applied (unrelated to feature):** 22 `node_modules/@types/<pkg> 2/` iCloud
duplicates were failing `next build` at the TypeScript step. Deleted. See
[[filesync-duplicate-files]] — now documents this variant + a pre-flight check.

## Plan corrections found during build

1. **`/rights/access` + `/rights/erasure` were never forms.** They are 308 redirects to
   `/privacy#data-rights`, deliberately deindexed to consolidate authority on `/privacy`.
   The plan wrongly said "form exists — hub links to them as-is".
2. **The `#data-rights` anchor did not exist.** No element on `/privacy` carried that id, so
   both redirects dumped users at the top of the page. Live bug, now fixed — `/privacy` §9
   is `id="data-rights"`.
3. **Decision taken (Dilip, 2026-07-17):** `/rights` becomes the canonical rights hub.
   Redirects re-point to `/rights#access` / `/rights#erasure`. Original intent preserved —
   thin utility URLs stay noindex, authority still consolidates on one page, now a better
   one. `robots.ts` already endorsed this: "Public consent and rights pages remain
   crawlable — they are transparency surfaces that we want indexed."
4. **`FRESHNESS.legal` was stale** (March 2026) and would have contradicted the v2.0 July
   date. Bumped to 2026-07-17.
Ref pages: dpdpaudit.co.in/privacy-policy · dpdpaudit.co.in/your-rights

---

## 0. Headline finding — this is a REWRITE, not a new build

Both pages already exist in some form:

| Route | State |
|---|---|
| `/privacy` | EXISTS — `app/privacy/page.tsx`, 204 lines, v1.0 "March 2026", 10 sections |
| `/rights` | **MISSING** — only `/rights/access` + `/rights/erasure` leaf pages exist, no index |
| Footer | EXISTS — already links `/privacy`, `/rights/access`, `/rights/erasure` |

So the work is: **rewrite `/privacy` to be truthful, create `/rights` as a hub, re-point the footer.**

The current `/privacy` contains statements that are **factually wrong** against the real
codebase. Shipping a DPDPA product with an inaccurate privacy notice is the single
highest-risk item here — it is the exact failure our own assessments penalise.

### Current-page claims vs. reality

| Notice says | Reality in repo | Severity |
|---|---|---|
| §6 "Email service provider / CRM platform / Analytics provider" — **no vendor named** | 8 real named vendors (below) | **P0** |
| §3 "aggregated, anonymised usage data… we do not track individual users across sessions" | `GoogleAnalytics gaId="G-5Y466GNJXW"` in `app/layout.tsx:66`, loads **unconditionally, no consent gate**, sets cross-session cookies | **P0** |
| §2 "We do not collect sensitive personal data (…financial, health…)" | Assessment packs collect health/financial **context**; mobile numbers collected via Twilio WhatsApp | **P1** — needs rewording |
| No mention of AI processing | `@ai-sdk/anthropic` used in briefings/blog generate + validate + revise | **P0** |
| No cross-border transfer section | Vercel, Resend, Anthropic, Google, Twilio all US-hosted | **P0** |
| Contact `privacy@saralprivacy.com`, no named DPO | Dilip wants **dpo@saralprivacy.com**, DPO **Dilip Sahu** | P1 |

---

## 1. Vendor / sub-processor list — the answer to "anything missing?"

You asked whether Vercel + Resend covers it. **No — it's 8, not 2.**
Evidence: `package.json` deps + `.env.local` keys + grep of `app/`, `lib/`.

| # | Vendor | Purpose | Personal data it receives | Evidence | Location |
|---|---|---|---|---|---|
| 1 | **Vercel Inc.** | Hosting, edge, serverless functions | IP address, access logs, all form payloads in transit | deploy target | USA |
| 2 | **Resend Inc.** | Transactional + briefing email | Name, email, engagement events | `resend` dep, `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET` | USA |
| 3 | **Appwrite** | Primary database + file storage — **stores every lead, assessment, subscriber** | Name, email, phone, company, all assessment answers | `node-appwrite`, `APPWRITE_*` (5 keys) | **Singapore** ✅ resolved |
| 4 | **Google (Analytics 4)** | Website analytics | Client ID cookie, IP, page views, cross-session behaviour | `@next/third-parties/google`, `app/layout.tsx:66` | USA |
| 5 | **Anthropic PBC** | AI generation of briefings + blog drafting/validation | Content submitted for generation | `@ai-sdk/anthropic`, `ANTHROPIC_API_KEY` | USA |
| 6 | **Vercel Blob** | PDF / report / guide file storage | Generated reports (may embed personal data) | `@vercel/blob`, `BLOB_READ_WRITE_TOKEN` | USA |
| 7 | **Svix** | Webhook delivery infra (behind Resend) | Event metadata | `svix` dep | USA |

**Twilio — EXCLUDED.** ✅ Confirmed not in use. Do not disclose a processor we don't use;
over-disclosure is its own inaccuracy. Two follow-ups:
- Remove the `twilio` dep + `TWILIO_*` env keys, or leave dormant? Dead deps in a privacy
  product invite exactly the "why is this here?" question. Recommend removing — separate PR.
- If WhatsApp delivery ships later, the notice needs a Twilio row **in the same PR as the
  feature**. Add to the sector-launch checklist so it can't drift.

**Not listed on purpose:** KIE / Nano-Banana (`KIE_API_KEY`) — used only by
`tools/generate_infographic.py`, an offline build script, no personal data. Confirm before
omitting.

### Appwrite region — RESOLVED ✅

`APPWRITE_ENDPOINT="https://sgp.cloud.appwrite.io/v1"` → **Appwrite Cloud, Singapore (SGP)**.
Appwrite Network regions are isolated; core data stays in the selected region.

This is a **better story than expected** and worth stating plainly in the notice:
> Your assessment answers and contact details — the most substantial personal data we hold —
> are stored in Singapore, not the United States.

Still a cross-border transfer from India, so §6 is still required — but DPDPA §16 uses a
*blocklist* model (transfer permitted except to notified restricted countries). Singapore is
not restricted. Frame as compliant-by-design, **not** as "data localisation" — we hold a
hard lock against RBI/localisation overclaim.

**Optional upgrade to consider later:** Appwrite has no India region today (FRA/NYC/SYD/SGP/TOR).
If one lands, migrating is a genuine marketing asset for an India-first DPDPA product.
Not blocking.

### Remaining open question
**DPAs signed?** The reference page badges "✅ Standard DPA" per vendor; we claim it only
where one genuinely exists. Appwrite's is self-serve — **Console → Organization Settings →
Download DPA**, sign it, done (~5 min). Vercel, Resend, Anthropic and Google all publish
standard DPAs; confirm each is actually accepted rather than assumed. Until confirmed, the
column reads "Standard DPA available — pending execution", not a green tick.

---

## 2. The GA consent problem — flag, don't silently paper over

GA4 loads on every page with no consent gate and no cookie banner (verified: no banner
component exists). Under DPDPA, analytics cookies of this kind need notice + consent.

Three options, decide before build:

- **(a) Consent-gate GA** — add a cookie banner, load GA only on accept. Most defensible,
  most work, will dent analytics volume.
- **(b) Swap to cookieless analytics** — e.g. Vercel Web Analytics. Removes the problem at
  the root, keeps a vendor we already have, loses GA history.
- **(c) Keep GA, disclose honestly** — drop the false "anonymised / no cross-session
  tracking" claim, name Google, offer opt-out. Cheapest; still legally thin.

**Recommendation: (b).** We sell DPDPA readiness — running un-consented GA while telling
customers to consent-gate their analytics is a credibility risk, and Vercel Web Analytics
is a one-line swap on infra we already pay for. Route this through a separate decision;
do not bundle it silently into a copy rewrite.

---

## 3. Scope

### In scope
- Rewrite `/privacy` — truthful, named vendors, cross-border, retention table, DPO block.
- New `/rights` hub page — 5 DPDPA rights, request routes, timelines, escalation.
- Footer: add `/rights`, point Data Rights Contact at `dpo@saralprivacy.com`.
- `sitemap.ts` + metadata for `/rights`.

### Out of scope (this pass)
- The GA consent decision (§2) — separate call.
- Rebuilding `/rights/access` + `/rights/erasure` forms — hub links to them as-is.
- `/terms`, `/consent-preferences` — untouched.

### Do not touch
- `lib/data/industry-assessment/core.ts`, `bands.ts` — pack isolation rule.
- `sectors.ts` — no sector surface changes here.

---

## 4. Page 1 — `/privacy` rewrite

Keep the existing shell (navy hero + white section cards + `**bold**` mini-parser) — it
matches the site. Replace content. Bump to **v2.0 · July 2026**.

Sections:
1. **Who We Are / Data Fiduciary** — Saral Privacy, saralprivacy.com, DPO Dilip Sahu, dpo@saralprivacy.com
2. **What We Collect** — table: data element · purpose · legal basis (per ref page)
3. **Why We Collect** — per-flow (briefings, assessments, discovery, notice generator, consultation)
4. **Legal Basis** — consent / contractual necessity / legitimate use
5. **Sub-processors** — the 8-vendor table from §1, each with purpose + data + DPA status
6. **Cross-Border Transfers** — NEW; DPDPA §16. Lead with Appwrite/Singapore (where the
   substantive data lives), then the US-hosted supporting processors. No restricted country.
7. **Retention** — table by category (subscriber / assessment / lead / analytics)
8. **Security** — encryption in transit + at rest, access control, breach notification
9. **Your Rights** — short summary → deep-links to `/rights`
10. **Children's Data** — NEW; DPDPA §9, not directed at under-18s
11. **Changes** — versioning
12. **Contact / Grievance** — DPO block, 30-day commitment

### Wording locks (brand + legal)
- "high-impact data" — **never** GDPR's "sensitive personal data" tier. Consistent with the
  clinic/pharmacy/fintech pack locks already in memory.
- DPDPA-scoped claims only. No GDPR "right to explanation", no RBI/localization overclaim.
- Never assert a DPA we haven't confirmed.
- Never re-assert "anonymised analytics" while GA is un-gated.

## 5. Page 2 — `/rights` hub

New `app/rights/page.tsx`. Five DPDPA rights, each a card:

| Right | DPDPA | Route |
|---|---|---|
| Access | §11 | → `/rights/access` (form exists) |
| Correction & Erasure | §12 | → `/rights/erasure` (form exists) |
| Withdraw Consent | §6(4) | → `/consent-preferences` + `/unsubscribe` |
| Nominate | §14 | → email dpo@ (no form — email is fine, low volume) |
| Grievance Redressal | §13 | → email dpo@, 30-day SLA |

Plus: DPO contact block · what to include in a request · identity verification note ·
30-day timeline · escalation to Data Protection Board of India.
`noindex`? **No** — index it; it's a trust surface and an SEO asset.

## 6. Footer changes

- Legal column: insert **"Your Rights"** → `/rights` above the two leaf links.
- Data Rights Contact box: `privacy@` → **`dpo@saralprivacy.com`**, add "DPO: Dilip Sahu".
- Bottom bar: "Privacy Notice v1.0 · Updated March 2026" → **v2.0 · July 2026**.
- Brand column `privacy@` → leave (general contact) or switch — decide.

## 7. Build order

1. Confirm DPA status (§1) + the §2 GA decision. Region ✅ · Twilio ✅ both resolved.
2. `/rights` hub (additive, zero risk) → preview.
3. `/privacy` rewrite → preview.
4. Footer + sitemap + metadata.
5. `next build` clean → branch off `main` → preview → merge to prod.

Route: `feat/privacy-rights-pages` off `main`.

## 8. Risks

- **Truthfulness is the deliverable.** A pretty page that misdescribes the stack is worse
  than the current page. Every vendor row must trace to code.
- **GA claim is live-wrong today** — §3 of the current notice is false as written. Whatever
  we decide in §2, that sentence cannot survive this PR.
- **Vendor list drifts the moment a feature ships.** Twilio is the live proof: the dep is
  installed but unused, so the notice would have been wrong the day WhatsApp launched.
  Any PR adding a processor must update the notice in the same PR.
