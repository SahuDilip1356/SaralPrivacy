# Razorpay Integration Spec — Operation Pounce Phase 2 ("The till")

**Status:** Ready to build. Written against `main` @ `43d6bdc`, all current-state claims verified in code or against production on 2026-09-08.
**Purpose:** Give SaralPrivacy a way to take money. This is P2 in the locked Pounce order (P0 security ✅ → **P2 Razorpay** → Gate 3), and it is the only remaining item that changes the category of the business rather than its polish.
**Provider:** Razorpay — chosen for INR/UPI/GST and an Indian SMB buyer. Not available via Vercel Marketplace, so this is a direct integration (`razorpay` npm + webhook). Vercel's default `payments` provider is Stripe; the marketplace skill's own override rule applies because the provider is explicitly named and locked in Pounce.

> **Format note:** sequence + tentative hours + monitorable steps. No dates — Dilip owns scheduling.

---

## 1. Scope

**In:** taking real money for the four Pounce SKUs, recording it, receipting it, and unlocking what was bought — plus the website pages Razorpay requires before it will activate the account.

**Out (deferred, with reasons):**
- Subscriptions / auto-renew — Razorpay Subscriptions is a separate product with mandate/eNACH flows. Year 1 renewals can be manual invoices at this volume.
- Multi-currency / international cards — audience is domestic.
- Partner rev-share payouts (Pounce §7 4.1, 20%) — payouts are RazorpayX, a different rail. Track attribution now, pay manually until volume justifies it.
- Per-user tenancy — P5 in `P3_AUTH_SPEC.md`.

---

## 2. Commercial truth (inlined deliberately)

⚠️ **`OPERATION_POUNCE_SPEC.md` has never been committed** — it exists only as an untracked file in Dilip's working copy, and it is the sole source of every price and gate below. One `git clean` loses it. **Committing it is step P0.1.** Until then these quotes are the durable copy.

| SKU | Price (all **+GST**) | What it is |
|---|---|---|
| **Notice Pack Pro** | ₹9,999/yr | Branded PDFs unlocked (free = watermarked preview), EN+Hindi notice set, regeneration when Rules change, saved to account |
| **Compliance OS** | ₹24,999/yr | The SMB core: assessment history, personal-data register, Notice Pack Pro included, DSAR/incident templates, evidence locker, quarterly nudges, priority support |
| **Practice** | ₹49,999/yr | CA/law firms: 25 client assessments under `?partner=slug`, white-label reports, advisor directory listing, 20% rev-share |
| **Done-With-You Sprint** | ₹25,000–₹50,000 one-time | Founder-led: 2 working sessions + full setup + fix-plan review. Capped by founder time |

Two load-bearing quotes:
> "Sellable with a Razorpay **Payment Page in zero code** while integrated checkout is being built — this is deliberately the first rupee"

> **Gate 2:** "one end-to-end paid transaction on production (real money, GST invoice delivered, artifact unlocked, event recorded). Investor is the ceremonial first customer if needed; **second transaction must be a stranger**."

**Gate 3** (unlocks the rest of the program): ≥25 paying accounts **or** ≥5 Practice partners with ≥1 client purchase each, **and** paid conversion ≥2 per 100 completed assessments.

---

## 3. Current state — verified, not assumed

**Commercial surface today:** exactly one destination for buying intent — `/contact`, a manual-follow-up consultation form (`webapp/app/contact/ContactContent.tsx` → `webapp/app/api/contact/route.ts`, writes `leads` + `consent_log`, emails the admin). Every "Book a call" CTA across assessments, all 12 industry pages, the penalty calculator, blog and FAQ points there. No payment code exists anywhere: no SDK in `package.json`, no `/pricing`, no `payments` collection.

**Highest-intent surface** is the notice generator wizard — users finish it and hit a dead end. `NoticePackClient.tsx:195` gates export on an email, then unlocks unconditionally. **There is no watermarking and no entitlement check anywhere**, so paid gating is greenfield.

**Customers have no accounts.** Every user-facing flow is anonymous, identified by a typed email. The closest thing to a logged-in surface is `/report/[token]` — an unguessable token in a URL. This is the single most consequential fact in this spec: *what does "unlock" even mean for an anonymous buyer?* See §5 Decision B.

**Auth is admin-only** (P3, `ab7ad29`): Supabase password → TOTP → an 8h HMAC `admin_session` cookie (`webapp/lib/adminSession.ts`); the Supabase session is discarded. `requireRole(request, ["admin"])` is how an admin route authenticates.

**⛔ `proxy.ts:85` excludes `/api/*` from middleware.** No API route is protected by middleware. **Every payment endpoint must guard itself.**

**Data seam:** `webapp/lib/db/index.ts` — generic `insertDocument` / `findOneBy` / `queryDocuments` keyed by collection string, with the backend chosen per *module* by `DATA_BACKEND_<MODULE>` (`flags.ts:60`), **defaulting to `appwrite`**. `dataBackend()` throws on unknown collections.

**Webhook model to copy:** `webapp/app/api/webhooks/resend/route.ts` — `runtime = "nodejs"`, secret-presence check, **`await request.text()` before any parsing**, verify → 401, audit row, always return 200. (It uses svix; Razorpay does not — but the control flow and raw-body rule carry over. Note it has no idempotency guard; a payment webhook needs one.)

**Email:** `webapp/lib/resendClient.ts` (lazy Proxy) + `email-templates.ts` (`xxxTemplate(data) → {subject, html}`, `escapeHtml` every interpolation) + `email.ts` (`sendXxx() → EmailResult`).

---

## 4. ⛔ Blockers before any code — Razorpay will not activate without these

Razorpay's activation review inspects the live website. Verified against production on 2026-09-08:

| Page | Status | Needed |
|---|---|---|
| `/terms` | ✅ 200 | — but contains **zero** refund/cancellation language (grep: 0 occurrences) |
| `/privacy` | ✅ 200 | — |
| `/contact` | ✅ 200 | must show a real business address + phone |
| **`/refund`** | ❌ **404** | **Refund & Cancellation policy — required** |
| **`/pricing`** | ❌ **404** | **Prices must be visible — required** |

**KYC (Dilip, in parallel with build):** PAN, Aadhaar, bank account, business registration proof (Shop & Establishment or Udyam). Sole proprietors can register with personal PAN + Aadhaar + bank account. Typical approval **1–2 working days** with clean documents, under a week generally. Start this early — it runs on Razorpay's clock, like the Play Store's.

**GST invoicing constraint (verified):** Razorpay's API can only create **non-GST** invoices; GST-compliant invoices are created through the dashboard. For a B2B compliance product whose buyers will want a GSTIN invoice, this forces Decision D in §5.

---

## 5. Architecture decisions — resolve these before coding

### Decision A — Where do payments live? **Recommendation: Supabase-only, new module.**
`lib/db` assumes every collection has an Appwrite twin; there is **no existing pattern for a Supabase-only collection**. Options: (a) add a `"payments"` module to the `DataModule` union and hard-set its flag to supabase; (b) add an escape hatch in `dataBackend()` for unconditionally-Supabase collections. **(b) is cleaner and reusable** — every post-migration entity will want it. Money must never land in the legacy store.

### Decision B — What does an anonymous buyer "unlock"? **Recommendation: token-link now, accounts later.**
Pounce 2.4 budgets 24h for accounts-lite (magic link). That is the largest single line item and it blocks nothing about *taking money*. Reuse the proven `/report/[token]` pattern: purchase mints an unguessable entitlement token, emailed to the buyer, granting access to what they bought. Ship accounts when a second purchase needs to attach to a first. **This cuts the critical path to first revenue by ~24h.**

### Decision C — Which Razorpay surface? **Recommendation: both, in sequence.**
Payment Page (hosted, zero code) for the DWY Sprint immediately; Orders API + Checkout for self-serve SKUs after. This is exactly what Pounce 2.1/2.3 say, and P1 below can ship while the KYC and policy pages are still settling.

### Decision D — GST invoices. **Recommendation: manual from the Razorpay dashboard until ~20 transactions.**
Pounce 2.6 allows "Razorpay Invoices or Zoho Books; decide by whichever ships in <4h". Given the API cannot emit GST invoices, automating this means Zoho Books integration — real scope. At single-digit monthly volume, a dashboard invoice per sale is minutes of work and zero code. Revisit at volume.

### Decision E — CSP. **Required change, unavoidable for Checkout.**
`next.config.ts:58` currently allows `connect-src 'self' https://sgp.cloud.appwrite.io https://api.resend.com` and has **no `frame-src`**, so the Razorpay iframe falls back to `default-src 'self'` and is blocked. Checkout needs `script-src` + `frame-src` + `connect-src` entries for Razorpay hosts. **A hosted Payment Page/redirect avoids this entirely** — another reason P1 ships before P3.

---

## 6. Build plan

Standing rules: one branch per phase → Vercel preview → Dilip verifies → **Dilip merges** (never self-merge). Every new analytics event watched firing on preview before merge. Test with Razorpay **test keys** throughout; live keys only at P6.

### P0 — Unblock (~6–9h) · branch `feat/pay-p0-policies`
Nothing here touches money; all of it gates Razorpay activation.
1. **Commit `OPERATION_POUNCE_SPEC.md`** — the pricing source of truth is currently untracked. (5 min, do first.)
2. `/refund` — Refund & Cancellation policy. Must state: what's refundable, the window, how to request, turnaround, and how a DWY Sprint (founder time already spent) differs from an unstarted subscription. Link from footer + `/terms`. **Content law applies:** no unverifiable claims. (~3h)
3. `/pricing` — the four SKUs, honest scope table, FAQ covering GST, refunds, and the "not legal advice" posture. **Pounce §207 requires `/plan-design-review` (avg ≥8) before building this.** (~4h build after review)
4. Confirm `/contact` shows a real business address + phone.
5. **Add the Razorpay sub-processor row to `webapp/lib/data/privacy-vendors.ts`** — house rule: a PR adding a processor adds the row in the same PR. Razorpay will process customer personal data. Non-negotiable, and it's a DPDPA-credibility issue for a DPDPA company.

**Exit gate:** all five pages/rows live on prod; Razorpay KYC submitted.

### P1 — First rupee, zero code (~2h) · no branch needed
6. Razorpay dashboard: create a **Payment Page** for the DWY Sprint.
7. Link it from the notice-generator exit, the assessment report, and `/contact`. (Copy-only PR.)
8. Manual GST invoice from the dashboard on each sale.

**Exit gate:** a real payment link is live and reachable from the two highest-intent surfaces. *Revenue is possible from here on* — everything after this is about scale and margin, not capability.

### P2 — Data + money primitives (~10–14h) · branch `feat/pay-p2-core`
9. `supabase/migrations/0007_payments.sql` — `app.payments` and `app.payment_events`. House DDL: `id uuid default ops.uuid_generate_v7()`, `legacy_id text unique`, `created_at`/`updated_at timestamptz`, enum-likes as `text` + `check`, `enable row level security`, and an explicit admin policy (**a table created after `0005` gets no policy automatically**). Unique constraint on `razorpay_payment_id` and on `payment_events.event_id` — these *are* the idempotency guards.
10. Wire the seam: `TARGETS` + `RENAMES` in `lib/db/supabase.ts`, `COLLECTION_MODULE` + `COLLECTIONS` in `flags.ts`, plus Decision A's Supabase-only hatch. **`lib/db/db.test.ts:9` hard-asserts 19 collections and will fail by design — update the count.** Keep `tools/migrate-supabase/generate-ddl.ts` in sync.
11. `lib/payments/client.ts` — lazy Razorpay singleton, **Resend-Proxy pattern**, never `new Razorpay()` at module scope (it would crash `next build` with no env).
12. `lib/payments/catalog.ts` — SKUs as code: id, name, **amount in paise** (₹9,999 = `999900`), GST treatment, what it entitles. One source of truth shared by `/pricing`, checkout, and receipts.
13. A pinned payload builder + contract test in the style of `lib/templates/lead.ts` — that file exists because field-name drift once silently dropped every lead. Money deserves it more.

**Exit gate:** migration applied; `db.test.ts` green; a scripted test-mode order round-trips into `app.payments`.

### P3 — Checkout + webhook (~14–18h) · branch `feat/pay-p3-checkout`
14. `POST /api/payments/order` — zod-validated body (sku, buyer email/name/company, optional GSTIN, `?partner=`), rate-limited per `abuseGuard` (money route → **5 per 10 min**, matching `templates/download`), **amount derived server-side from the catalog, never from the client**, `receipt` ≤40 chars, `notes` carrying sku + partner. Returns `order_id` + public key only.
15. Client checkout component + **CSP update** (Decision E).
16. `POST /api/payments/verify` — verify `razorpay_order_id|razorpay_payment_id` HMAC-SHA256 with **key secret**, timing-safe compare. This is UX confirmation only — **never** the source of truth for fulfilment.
17. `POST /api/webhooks/razorpay` — **the actual source of truth.** `runtime = "nodejs"`; `const raw = await request.text()` **before any parsing**; verify `X-Razorpay-Signature` = HMAC-SHA256 of the raw body with the **webhook secret** (a different secret from the key secret); 401 on mismatch; dedupe on `x-razorpay-event-id`; persist a `payment_events` audit row; handle `payment.captured` (and `payment.failed`) **order-independently — Razorpay does not guarantee event order**; always return 200 so retries stop.
18. Fulfilment on `payment.captured`: mint the entitlement token (Decision B), send the receipt.
19. `paymentReceiptTemplate` in `email-templates.ts` + `sendPaymentReceipt` in `email.ts` — `FROM_NOREPLY`, `escapeHtml` every interpolation, **not** via `sendGateway` (that's bulk policy with suppression filtering; a receipt is transactional). Email failure is **logged, never fatal** — the money already moved.
20. Analytics: `checkout_start`, `payment_success`, `payment_failed`, each carrying tier. Verified firing on preview.

**Exit gate:** end-to-end in Razorpay **test mode**: checkout → webhook → row written → token minted → receipt delivered; replaying the same webhook twice changes nothing; a tampered signature 401s.

### P4 — Entitlement + paid gating (~10–14h) · branch `feat/pay-p4-gating`
21. Notice Pack: free = watermarked preview, Pro = branded PDF + regeneration. Server-side check in `app/api/notice/pdf/route.ts` — **the gate must be server-side**; a client-only gate is not a gate.
22. Entitlement lookup by token; graceful expiry copy.
23. Purchase → artifact handoff from the notice generator and assessment report exits.

**Exit gate:** an unpaid user cannot obtain a branded PDF by any request they can construct.

### P5 — Accounts-lite (~24h) · branch `feat/pay-p5-accounts` · **only when a second purchase needs to attach to a first**
Magic-link login, "My SaralPrivacy" listing saved reports/notices/register, wire the dormant `business_profiles`. Design-review gated per Pounce §207.

### P6 — Go live (~2–4h) · 🔶 Dilip-gated
24. Live keys + webhook secret on Vercel (**env live ≠ env listed — redeploy, then verify at runtime**).
25. Register the production webhook URL in the Razorpay dashboard; subscribe only to needed events.
26. **Gate 2 ceremony:** one real end-to-end transaction on production — real money, GST invoice delivered, artifact unlocked, event recorded. Then a second from a stranger.

---

## 7. Security & correctness rules (non-negotiable)

1. **Amounts are server-derived from the catalog.** A client-supplied price is a free-products bug.
2. **Amounts are integers in paise.** Never floats. ₹9,999 = `999900`.
3. **The webhook is the source of truth**, not the browser callback. A user closing the tab mid-redirect must still get what they paid for.
4. **Raw body before parsing.** `request.text()`, then verify, then `JSON.parse` yourself. Re-serialised JSON breaks the signature.
5. **Two different secrets.** Key secret verifies checkout signatures; webhook secret verifies webhooks. Do not cross them.
6. **Idempotent by construction** — unique `razorpay_payment_id`, dedupe on `x-razorpay-event-id`. Retries are guaranteed, not exceptional.
7. **Every payment route guards itself** — `proxy.ts` does not cover `/api`.
8. **Timing-safe comparison** for every signature (`crypto.timingSafeEqual`), as P0 security established.
9. **Never log card data, tokens, or full webhook bodies with PII.** Log ids and outcomes.
10. **No secret in `NEXT_PUBLIC_*`.** Only the Razorpay *key id* is public.
11. **Lazy-init everything** — no client construction at module scope.
12. **Sub-processor row ships with the code** (`privacy-vendors.ts`).

---

## 8. Risk register

| # | Risk | Guard |
|---|---|---|
| 1 | Client-supplied amount → free products | Server-derived catalog price (§7.1) |
| 2 | Duplicate webhook → double fulfilment / double receipt | Unique payment id + event-id dedupe (P2.9) |
| 3 | Browser callback trusted → paid user gets nothing when tab closes | Webhook is truth (§7.3) |
| 4 | `req.json()` before verify → every signature fails, or worse, passes unverified | Raw-body rule (§7.4) |
| 5 | CSP silently blocks Checkout — no visible error | Decision E; verify on preview |
| 6 | Payments land in Appwrite via the default flag | Decision A: Supabase-only hatch |
| 7 | `db.test.ts` collection-count assertion fails | Expected; update in P2.10 |
| 8 | Razorpay activation rejected for missing policy pages | P0 ships them first |
| 9 | GST invoice expectation unmet for B2B buyers | Decision D: manual, disclosed on `/pricing` FAQ |
| 10 | Env vars set but not live | Redeploy + runtime verify (house law) |
| 11 | Receipt email failure rolls back a successful payment | Log, never fatal (P3.19) |
| 12 | Razorpay processes personal data undisclosed | `privacy-vendors.ts` row in the same PR (P0.5) |

---

## 9. Open decisions for Dilip

1. **Decisions A–E in §5** — my recommendations are marked; confirm or override.
2. **Does P5 (accounts, 24h) block launch?** I say no — token-links carry the first sales.
3. **DWY Sprint price:** the range is ₹25,000–₹50,000. The Payment Page needs one number (or two tiers).
4. **Refund policy substance** — founder call, not a drafting call. What's actually refundable, and within what window?
5. **Business entity + GSTIN** for KYC and invoices.

---

## 10. Handoff — starting the fresh session

**Read first, in order:** this file → `OPERATION_POUNCE_SPEC.md` §2 (SKUs) and §5 (Phase 2) → `SUPABASE_MIGRATION_SPEC.md` §3.3–§4 (DDL + seam) → `P3_AUTH_SPEC.md` §2 (secrets).

**Then answer §9 before writing code.**

**Start at P0.1** (commit the Pounce spec — it is untracked and irreplaceable), then P0 in order. P1 can run the moment KYC clears and is worth doing before P2, because it makes revenue *possible* while the rest is still being built.

**Environment:** work from a `/private/tmp` clone, never the iCloud Desktop tree (`git worktree add` times out there; iCloud zeroes files mid-session). Vercel previews sit behind SSO — use `vercel curl`, not raw `curl`. `git push | tail` reports tail's exit code; check `pipestatus`.

**Do not:** self-merge to `main`; ship to prod without Dilip's preview verification; add a payment SDK other than `razorpay`; reuse the admin cookie pattern for the webhook secret; or start P5 before P4 is proven.
