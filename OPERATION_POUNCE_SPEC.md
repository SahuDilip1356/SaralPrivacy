# OPERATION POUNCE — Revenue Launch Spec

**Program:** Convert SaralPrivacy from free top-of-funnel into a paying compliance business before the May 2027 enforcement wave crests.
**Deal frame:** Founder + investor at 1% of the $5M ticket = **$50,000 (~₹42L)** working capital. Investor buys milestone evidence, not equity theatre: every phase ends in a measurable gate.
**Target market:** the SMB self-serve / practice tier at **~₹50,000 annual revenue per account** — the segment enterprise vendors (₹15L–₹2Cr engagements) structurally cannot serve, where SaralPrivacy already owns the content authority.
**Source of truth for defects:** Investor Audit 2026-08-04 (main report §13 remediation ledger + 11-audit appendix). This spec sequences those fixes *around revenue*, not as a cleanup project.

**Standing laws honoured:** preview-before-prod on every ship · presentation-unified-content-varies · sprint plans carry sequence + tentative hours only, no dates — Dilip owns scheduling · design-facing phases pass `/plan-design-review` (avg ≥8) before build.

---

## 1. The one-sentence strategy

> Stop widening the funnel. Close it, charge at the bottom, and spend the $50k making the ₹50k/yr account repeatable — direct for regulated-adjacent SMBs, wholesale through CA/law firms for everyone else.

**North star:** paying accounts. **Denominator metric (per analytics law — never per-day on starved traffic):** paid conversions per 100 completed assessments.

**What we will NOT do until Gate 3 (§8):**
- No data-flow map #13, no new sectors, no new content surfaces
- No Setu chatbot completion (parked; branch stays)
- No new free tools
- Rule of thumb: if a proposed task doesn't reduce risk-to-revenue or add revenue, it waits

---

## 2. The product we will charge for

Three tiers, one anchor. All prices +GST. Names final after a positioning pass; structure is locked.

### Tier 1 — **Notice Pack Pro** · ₹9,999/yr (self-serve entry)
- Everything the free notice generator does, plus: branded PDFs unlocked (free tier gets watermarked preview), EN + Hindi notice set, **regeneration when Rules change** (the recurring-value hook — DPDPA is a moving target through May 2027), saved to account.
- Why it converts: highest-intent users on the site already finish this wizard and today get dropped at a dead end (audit §6). We are adding a till to an existing queue.

### Tier 2 — **Compliance OS** · ₹24,999/yr (the SMB core)
- Saved assessment history + re-runs (show score improvement over time)
- Personal-data register (discovery output persisted + editable, CSV export)
- Notice Pack Pro included
- DSAR/grievance log templates + incident checklist per sector
- **Evidence locker**: one place holding notices, register, assessment reports — "show this when a customer, vendor, or the Board asks"
- Quarterly re-assessment nudge + rules-change alerts (email)
- Priority email/WhatsApp support (founder-operated initially)

### Tier 3 — **Practice** · ₹49,999/yr (the ₹50k anchor + wholesale channel)
- For CA firms, law firms, consultants — sectors we already serve as *customers* become the **channel**
- Up to 25 client assessments under the partner's attribution link (`?partner=slug`)
- White-label/co-branded assessment reports + notice packs for their clients
- Partner listed on a "Find a DPDPA-ready advisor" directory page (trust flywheel both ways)
- 20% revenue share on client upgrades they originate

### Cash-flow bridge — **Done-With-You Sprint** · ₹25,000–₹50,000 one-time
- Founder-led: 2 working sessions + full Compliance OS setup + fix-plan review
- Sellable with a Razorpay **Payment Page in zero code** while integrated checkout is being built — this is deliberately the first rupee
- Capped at a handful concurrent (founder time); each one is also a testimonial + case study factory

### Revenue math to the first proof point
- 60 × Tier 2 + 20 × Tier 1 + 15 × Tier 3 ≈ **₹25L ARR** (~50–60% of ticket returned as ARR)
- Stretch at wave-crest: 200 blended accounts ≈ ₹60–70L ARR → that company raises the real $5M
- Gate math uses conversions/100 assessments, not calendar velocity

---

## 3. Phase 0 — Stop-the-bleed (security + perimeter) · ~46h

*Nothing ships to a paying customer on top of a forgeable admin cookie. This phase is also the investor's DD condition. All items from audit §4/§10 — file:line cites in the appendix.*

| # | Step (monitorable) | Est. |
|---|---|---|
| 0.1 | Rotate GCP service-account key + Gmail app password; move outer `.env`/`credentials.json` values into a vault (1Password/`vercel env`); delete plaintext copies from the iCloud-synced path | 4h |
| 0.2 | Replace `admin_session` literal cookie with signed sessions (Appwrite Auth or HMAC-signed cookie + server session doc); add `middleware.ts` gating `/admin/*` and `/api/admin/*`; role claim for blogger | 16h |
| 0.3 | Auth on `POST /api/outreach/import` (admin session); replace `xlsx` parse with CSV-only ingest (kills the no-fix-CVE parser); add payload size cap | 4h |
| 0.4 | Fix rate-limit key to last `x-forwarded-for` hop; add throttle + constant-time compare on admin login | 4h |
| 0.5 | Single send-gateway module: every outbound email path (cron, approve, template, outreach) passes suppression + dedupe; paginate past the 300/500 limits | 10h |
| 0.6 | Tokenize `subscribers/unsubscribe`; escape user input in admin alert emails; move revalidate secret to header | 4h |
| 0.7 | Dependency pass: `next` → 16.2.x, bump resend/svix/@vercel/blob, delete the 8 dead packages, replace twilio with 15-line fetch | 4h |

**Gate 0 (exit evidence):** forged-cookie exploit no longer reproduces (test it); `npm audit --omit=dev` shows 0 high; a suppression unit test passes on BOTH send paths; secrets rotated (old GCP key revoked in console).

---

## 4. Phase 1 — Trust + one door (landing conversion) · ~26h

*Selling from an anonymous page wastes the launch. Audit §7: differentiation 8/10, trust 3/10 — the hard part is already done. UI changes here pass `/plan-design-review` before build.*

| # | Step | Est. |
|---|---|---|
| 1.1 | Fix the palette at the token: `green-500`/`teal-500` CTA pairs → ≥4.5:1 (single `@theme` edit; fixes ~169 instances). While in there: delete dead `tailwind.config.ts`, port needed tokens to `@theme` | 4h |
| 1.2 | Founder block on landing (mount existing `FounderProof`) + 2–3 real quotes with first name + sector (source from Done-With-You sprints / early users; interim: named beta users) | 8h |
| 1.3 | ONE first action: announcement bar, header CTA, hero primary all → assessment; guide download demoted from persistent header | 6h |
| 1.4 | Mobile hero: collapse 12 chips (top-4 + "More…" or native select) so the CTA is above the fold at 375px | 4h |
| 1.5 | Expand "DPDPA — India's data protection law" in hero subhead; kill the duplicated Rules-2025 banner/badge; reclaimed slot shows press cue | 2h |
| 1.6 | Carry hero sector selection into VerdictPreview + AudienceCards anchor | 2h |

**Gate 1:** live page passes contrast audit; baseline captured for CTR-to-assessment per 100 sessions (this is the denominator all later phases move).

---

## 5. Phase 2 — The till (monetization scaffold) · ~70h

*The whole program exists for this phase. Ship the smallest honest version of each piece.*

| # | Step | Est. |
|---|---|---|
| 2.1 | **First rupee, zero code:** Razorpay Payment Page for Done-With-You Sprint; link it from report + notice-generator exits; manual GST invoice initially | 2h |
| 2.2 | `/pricing` page — 3 tiers + sprint; honest scope table; FAQ (GST, refunds, "is this legal advice" posture carried over) | 8h |
| 2.3 | Razorpay integrated checkout (Orders API + webhook → Appwrite `payments` collection; signature verification; idempotent) | 16h |
| 2.4 | Accounts-lite: Appwrite Auth magic-link; "My SaralPrivacy" page listing saved reports/notices/register; wire the existing dormant `BUSINESS_PROFILES` collection | 24h |
| 2.5 | Notice Pack paid gating: free = watermarked preview; Pro = branded PDF + saved + regeneration entitlement | 12h |
| 2.6 | GST invoicing path (Razorpay Invoices or Zoho Books; decide by whichever ships in <4h) | 4h |
| 2.7 | Payment analytics events (`checkout_start`, `payment_success`, tier) — verify events fire on preview before merge (content-trust-seo law) | 4h |

**Gate 2:** one end-to-end paid transaction on production (real money, GST invoice delivered, artifact unlocked, event recorded). Investor is the ceremonial first customer if needed; second transaction must be a stranger.

---

## 6. Phase 3 — Close every loop (funnel plumbing) · ~36h

*Audit §6+§8: links, not features — the cheapest conversion capacity available. This phase multiplies Phase 2.*

| # | Step | Est. |
|---|---|---|
| 3.1 | Ship `INTERNAL_LINKING_SPEC.md` as reviewed (ToolCrossLink + tool-routing; ~148 content pages get in-body tool links) | 6h |
| 3.2 | Notice generator exit: post-download → pricing (Pro regeneration pitch) + assessment + consult | 4h |
| 3.3 | Consume `sp_discovery_handoff` on `/data-mapping`: pre-select the matching industry map | 6h |
| 3.4 | Generic survey q1_sector answer → interstitial routing to the matching industry pack | 6h |
| 3.5 | Report spine links: "Priority Fixes" reference the notice generator; next-step row → discovery/map; add pricing CTA | 4h |
| 3.6 | Briefings/blog industry-aware end-CTAs (`/assessment/<industry>` when tagged) | 4h |
| 3.7 | One noun per surface: "Assessment", "Data Flow", "Discovery" — header/footer/breadcrumb/pack titles; footer "Assessments" heading → "Free Tools" | 4h |
| 3.8 | Sitemap truth: real lastmods for industries/data-flow, add `/compliance-checklist`, refresh `llms.txt`, briefing status filter (`sent/approved` only) | 4h |

**Gate 3 (the fit signal):** ≥25 paying accounts **or** ≥5 Practice partners with ≥1 client purchase each, **and** paid conversion ≥2 per 100 completed assessments. Passing unlocks the remaining marketing budget (§9). Missing it triggers §10.

---

## 7. Phase 4 — Distribution (spend the tailwind) · ~30h eng + ops budget

*Runs partly parallel to Phase 3 once Gate 2 is passed. The wave does the fear-marketing for us; we sell the calm fix (brand law: no fearmongering — position as "the calm option before the deadline").*

| # | Step | Est. |
|---|---|---|
| 4.1 | Practice partner kit: `/partners` landing, `?partner=` attribution (query param + Appwrite field), co-branded report header, revenue-share terms page | 16h |
| 4.2 | Partner directory page (trust both ways; partners promote their listing = backlinks to starved commercial pages) | 6h |
| 4.3 | Webinar/lead-magnet motion: "90 days to DPDPA-ready for <sector>" using existing white-paper content; recording → briefings; ops not code | 4h |
| 4.4 | Earned media round 2: pitch the *paid launch* + founder story (fix the syndicated-PR-only trust gap); budget for a real PR push | 4h |
| 4.5 | Paid experiments (budgeted, killed fast): LinkedIn to CA/clinic owners, Google search on "DPDPA compliance <sector>", WhatsApp-forwardable one-pagers. Each experiment pre-registers its success threshold in conversions/100 clicks | ops |
| 4.6 | AEO leverage: keep the weekly citation cron; refresh prompts to include commercial pages; publish "cited by AI engines" once measurable | 2h |

**Gate 4:** one distribution channel shows CAC < 1/3 of first-year account value (₹50k tier → CAC ≤ ~₹16k; Tier 2 → ≤ ~₹8k), measured on ≥3 closed accounts from that channel.

---

## 8. Phase 5 — Harden what the money now runs on · ~88h

*Deliberately AFTER revenue exists — except CI, which is cheap and immediate. Contractor-friendly; founder stays on revenue.*

| # | Step | Est. |
|---|---|---|
| 5.1 | CI now: PR workflow running typecheck + lint + the 5 existing test files; protect `main`; delete `deploy.yml` stub or make it truthful | 4h |
| 5.2 | Extract shared `IndustryAssessmentClient` (pack-driven shell; deletes ~6,700 duplicated lines; UI fixes become 1 edit not 12) | 32h |
| 5.3 | Assessment engine tests + pack validation (zod schema, option-id referential check killing the silent-override-typo class, bucket/question contracts) | 16h |
| 5.4 | Server-side score recompute on submit (defensible-score chain) | 6h |
| 5.5 | DPDPA section citations pass across 12 packs + report template ("traceable to §X" becomes a *paid-report feature and trust line*; legal reviewer from budget signs it) | 24h |
| 5.6 | Data-flow polish: clear training-institutes hotspot debt, add risk-ratio + stage-sequence validators, og:images on map pages | 6h |
| 5.7 | Repo perimeter: archive+delete outer `.git`, prune ~94 merged branches, consolidate specs into `docs/specs/`, real README (it's now a fundraise artifact) | 4h (+rename `webapp/webapp` decision separately) |

**Gate 5:** CI green on PRs; one UI change provably touches all 12 assessments via a single edit; a sampled paid report shows statutory citations.

---

## 9. Budget — $50,000 (~₹42L)

| Bucket | ₹ | Rationale |
|---|---|---|
| Founder runway supplement | 12L | Full-time focus is the highest-ROI line item |
| Engineering contractor bursts | 6L | Phase 5 mechanical work (shared client, tests) so founder never leaves the revenue path |
| Legal/DPDPA reviewer retainer | 4L | Signs the citations pass + paid-report language; unlocks "reviewed by <named practitioner>" trust line |
| Distribution experiments + PR | 12L | Released in tranches — half at Gate 2, half at Gate 3 |
| Design/brand + trust assets | 3L | Founder video, testimonial capture, partner kit polish |
| Tools/infra | 2L | Razorpay, vault, Appwrite/Vercel/Resend headroom, Zoho |
| Buffer | 3L | Unallocated by design |

**Investor's non-cash contribution (priced into the 1%):** weekly metric review (conversions/100, ARR, CAC), intros to CA associations + 3 anchor Practice partners, pricing interrogation at each gate, and the discipline function — holding the §1 "will not do" list.

---

## 10. Kill / pivot criteria (pre-registered, so nobody re-litigates under pressure)

- If, **after** Phase 3 is fully shipped and 3 distribution experiments have run their pre-registered course, paid conversion < 0.5 per 100 completed assessments → **pivot to channel-only**: stop selling direct, all packaging moves to the Practice tier through CA/law firms (they own SMB trust; we own the engine).
- If Practice tier also fails (<3 partners activate) → productized-service company (Done-With-You at scale) with the platform as delivery tooling; different company, honest about it.
- The content/AEO moat is never the fallback business on its own — the audit already established free authority ≠ revenue.

---

## 11. Risks & mitigations

- **Founder reverts to surface-building** (the audit's single repeated signature) → the §1 not-do list is a standing gate check; investor review asks "which gate did this serve?" of every shipped PR.
- **Breach during paid launch** → Phase 0 is sequenced first and Gate 0 blocks everything; no press push before Gate 0.
- **SMBs stall paying until the deadline panics them** → Practice channel front-loads (partners buy *ahead* of client demand); Done-With-You harvests the early adopters; rules-change regeneration makes waiting costly.
- **Solo-founder bus factor** → contractor onboarding doc + CI + the Phase 5 dedupe reduce it; real mitigation arrives with the post-Gate-3 raise.
- **Price discovery wrong** → sprint SKU doubles as pricing research; tiers are re-priceable until Gate 3 locks them.

---

## 12. Execution protocol

- Work proceeds **strictly in phase order 0 → 4**; Phase 5 interleaves only via contractor. Within a phase, steps may parallelize.
- Every ship: preview deploy → Dilip verifies → explicit confirm → prod (absolute law; no exceptions during the sprint rush).
- UI-facing steps (1.2–1.6, 2.2, 2.4, 4.1–4.2) go through `/plan-design-review` ≥8 before build.
- Each gate's evidence gets logged to `.agent/` + memory when passed — gates are facts, not vibes.
- Scheduling, ordering of experiments, and go/no-go on spend tranches: **Dilip's call, always.**

---

*Tentative total engineering effort: ~296h across all phases (~166h founder-critical in Phases 0–3 before the first fit signal). Hours are estimates for sizing, not commitments; no calendar is implied.*
