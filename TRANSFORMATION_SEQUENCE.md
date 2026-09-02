# TRANSFORMATION SEQUENCE — SaralPrivacy to the Next Level

**Status:** DRAFT v1.0 — portfolio sequencing of every open thread
**Companion:** `SCALE_ARCHITECTURE_SPEC.md` (the infra spine — retained unchanged, referenced as "Blueprint P1–P7")
**Format law:** sequence + tentative hours + monitorable steps. No dates. Dilip owns scheduling.
**Gate law:** Operation Pounce order stands — P0 security → P2 Razorpay → **Gate 3 (≥25 paying, ≥2 conv/100 assessments)**. The not-do list (no new maps/sectors/chatbot/free tools) binds until Gate 3.

---

## 0. The portfolio on one screen

Eleven threads + five new asks, sorted into three horizons and a turnstile:

```
HORIZON 0 · UNROT          HORIZON 1 · REVENUE SPINE        ║ GATE 3 ║   HORIZON 2 · REACH MULTIPLIERS
finish what's built        one lane: Blueprint P2→P5        ║ ≥25    ║   order by leverage, still gated
~14–24h                    + thin conversion slices         ║ paying ║   on evidence per item
                           ~150–230h                        ║        ║
─ P0 security merge        ─ Supabase migration (P2)        ║        ║   ─ Multilingual, Hindi-first
─ PWA M1+M2 verify+merge   ─ Admin auth (P3)                ║        ║   ─ PWA M3 push + TWA store
─ Setu A3 merge+red-team   ─ Render extraction (P4)         ║        ║   ─ Data Flow SIMULATOR (paid tier)
─ SEO overdue check        ─ Paid app + Razorpay (P5)       ║        ║   ─ Short-video learning machine (micro)
─ Analytics baseline +     ─ Hero two-tap verdict           ║        ║   ─ DPDPA-ready badge
  denominator gate         ─ "Inspect us" beat              ║        ║   ─ Ecosystem strip + wiki/shiksha
─ Persist lost specs       ─ WhatsApp share cards           ║        ║     (only with real content behind)
                           ─ Simulation TEASER beat         ║        ║   ─ Blueprint P6–P7 hardening
```

**WIP rule (the one that matters for a solo founder):** at most one infra phase + one thin conversion slice in flight. Never start a new lane while a *built* thing sits unmerged — unmerged work on this machine has a proven decay mode (iCloud zeroing).

---

## 1. Horizon 0 — Unrot (~14–24h total)

Everything here is already built or overdue. Zero new decisions, pure recovery of sunk value.

| # | Item | State today | Steps | Hours |
|---|---|---|---|---|
| U1 | **P0 security** (= Blueprint P1, precondition for everything) | Code complete + verified, uncommitted on `worktree-p0-security` | Recover from worktree/tarball → rebase → preview → re-prove C1 forged-cookie dead → confirm → merge | 4–6 |
| U2 | **PWA M1+M2** | Built, preview GREEN on `feat/pwa-m1` `75ad0ac`; blocked on YOUR device checklist | You run the Phase 0 device checklist → confirm → merge. M3 (push) stays parked for H2 | 2–4 + your 30 min |
| U3 | **Setu A3 sanitize-state** | Fix unmerged on `feat/setu-sanitize-state`; live red-team still owed | Merge via preview → run the owed live red-team (model-property law: never inherit a pass) | 3–5 |
| U4 | **SEO Cycle 2 overdue check** | Request-indexing check was due 7 Aug — overdue | Run it in the URL-prefix property; log results into HANDOFF_SEO.md; decide B2 | 1–2 |
| U5 | **Analytics** | Baseline never captured; Phase B gate starved | Capture the baseline; switch keep/kill gates to denominator form (per memory law) | 2–3 |
| U6 | **Persist the lost threads** | Aug-3 simulation-layer strategy lived only in a transcript | `DATAFLOW_SIMULATION_LAYER_SPEC.md` (teaser-beat spec, §3 below) + this file + memory entries | 2–4 |

*Exit for the whole horizon: `git log main` shows U1–U3 merged; nothing valuable exists only on an unmerged branch or in a transcript.*

---

## 2. Horizon 1 — the revenue spine (~150–230h)

**Backbone = Blueprint P2→P5, unchanged:** Supabase migration (24–32h) → admin auth (10–16h) → Render extraction (32–48h) → paid app + Razorpay (48–80h). Full detail in `SCALE_ARCHITECTURE_SPEC.md` §14.

**Riding alongside, as thin conversion slices** (all survive the Pounce freeze — they are landing/conversion work on existing surfaces, not new free tools; this is the Aug-3 analysis's own line, kept):

| Slice | What | Why now | Hours |
|---|---|---|---|
| C1 | **Hero two-tap verdict** — "Does DPDPA apply to me?" | Clarity keystone; already a TODO in the code; feeds assessment starts (the Gate 3 denominator) | 8–12 |
| C2 | **"Inspect us" beat** — our own notice, vendor register, DPO on the landing page | Trust no competitor copies without doing the work; content already exists (`privacy-vendors.ts`) | 6–10 |
| C3 | **WhatsApp share cards** on assessment + flow-map results | The artifact travels where the landing page doesn't; India-native | 10–16 |
| C4 | **Simulation TEASER beat** — "Watch your data travel" | Evolves the existing WhereRiskHides beat; server-rendered, CSS-animated, derived from existing pack data. NOT a new tool. Spec first via `/plan-design-review` (the Aug-3 constraints all stand: no full lane board on the homepage, no nav mega-menu, no `/data-mapping` rename) | 4–6 spec + 10–16 build |

**Sequencing inside H1:** C-slices interleave between blueprint phases as breathers, one at a time; C4's spec is written early (H0 U6) so the design review can happen offline. Multilingual's **6 pre-i18n refactors ride the P4/P5 restructure** — the 12× assessment-client dedup and the monorepo `packages/` extraction touch the same files; do them once, together. That way Gate 3's morning-after doesn't start with a refactor.

*Exit: a stranger can pay; Gate 3 counters tick from the ledger itself; landing page demos instead of describes.*

---

## 3. The Data Flow Simulator — the two-version resolution

You've named this thread three times; here is the call that makes it stop fighting Operation Pounce:

- **Small version (teaser beat) = H1 slice C4.** One lane, 4–5 stages, one red hotspot, 2–3 sector tabs, CTA into the full maps. Homepage conversion work. Ships pre-Gate 3.
- **Big version (true simulator — user inputs their own shop, watches their own data travel, toggles fixes and sees risk drain) = a PAID-APP feature, Blueprint P5+.** This flips it from "new free surface" (frozen by Pounce) into **the differentiator inside the product people pay for** — an interactive RoPA builder wearing the flow-map costume. The 12 packs' union spines become the simulation substrate; the shared-engine graph-filter matrices seven specs have asked for become its query layer. Post-Gate 3, sized properly then (~40–80h, own spec + design review).

Nothing about the big version is built, specced, or promised until Gate 3. The teaser beat is its market test for free.

---

## 4. Gate 3 — the turnstile

≥25 paying customers AND ≥2 conversions/100 assessments. Until it fires, every H2 item below is **read-only ambition**. When it fires, re-rank H2 against what the first 25 customers actually asked for — the order below is today's best guess, not a promise.

---

## 5. Horizon 2 — reach multipliers (post-Gate 3, per-item evidence gates)

| Rank | Thread | Shape of the work | Gate / first step | Tentative |
|---|---|---|---|---|
| R1 | **Multilingual — Hindi first** | Pre-i18n refactors already done in H1 → locale registry from `guide-languages.ts` → Hindi behind `SHOW_HINDI=false` → per-language acceptance gate → then 6 more languages. ~300–350k source words; data-flow packs are 54% of it — translate packs *after* the simulator decision so you don't translate twice | Gate 3 + Hindi content-QA partner identified | 60–100h engineering (translation effort separate) |
| R2 | **PWA M3 — push + TWA store presence** | Push infra lands on the Render `worker` (Blueprint P4 built it a home); hand-rolled sw.js law stands (SW never touches /api or /admin); then TWA wrap for Play Store | M1+M2 live (H0) + backend exists (H1) | 16–28h |
| R3 | **DPDPA-ready badge** (embeddable) | Needs a completed journey to certify — which the paid app now provides; badge links back = the compounding backlink/referral loop | ≥50 completed paid journeys | 12–20h |
| R4 | **Data Flow SIMULATOR (big version)** | §3 above — paid-tier feature, own spec + `/plan-design-review` | Gate 3 + customer pull evidence | 40–80h |
| R5 | **Short-video learning machine — micro-scoped** | NOT a platform. Repurpose existing briefings/maps into 60–90s clips embedded on the highest-traffic learn/briefing pages; production stays inside the 45-min/day repurpose-only community lane (mentor-arc law). A video *platform* is a separate product decision that does not exist yet | 10 clips' worth of scripts derivable from existing content in <1h each, else kill | 8–12h plumbing + ongoing content |
| R6 | **Ecosystem strip + dpdpa.wiki / dpdpa.shiksha** | Both domains are PARKED (two-domain memory: founder intent = TOFU .com + app subdomain, never a second stack). The strip's own rule is *no fake doors* — so it cannot ship until at least one destination has real content. Integration ≠ new brand builds: wiki = structured Act reference (could be generated from existing briefing taxonomy); shiksha = where R5's videos + a cert live. One brand earns unparking only after Gate 3 revenue and only one at a time | Gate 3 + a deliberate brand decision, read `two-domain-monetization-context` first | strip 6–8h; brands unsized by design |
| R7 | **Blueprint P6–P7** — Redis, queues, SLOs, load test, replica, partitions, DR drill | Exactly as specced; trigger = paying cohort live / ~500 orgs | 56–88h |

**Deliberately still parked:** new sector maps/packs (Pounce), wiki/shiksha as separate tech stacks, a video platform, Kubernetes-anything (Blueprint §15), footer slim-down Part B (still gated on GSC crawl evidence).

---

## 6. Why this order (the three arguments)

1. **Unmerged work decays on this machine.** iCloud has zeroed files mid-session before; P0 sat unmerged for weeks. H0 costs ~2 days and recovers ~100+ hours of already-done work. Nothing else starts first.
2. **Every H2 item multiplies whatever exists at Gate 3.** Multilingual multiplies the funnel; push multiplies retention; the badge multiplies referral; videos multiply content. Multipliers applied to zero revenue return zero — the spine goes first, exactly as Pounce ordered fourteen months of evidence ago.
3. **The blueprint prevents double work.** Monorepo extraction carries the i18n refactors; the Render worker is push's home; the paid app is the simulator's home; the ledger is the badge's proof source. Sequencing infra first makes every later thread cheaper — that is the entire point of retaining it as the spine.

---

## 7. Standing decisions this file does NOT reopen

Duplicates = retitle only · `?model=` never via `useSearchParams()` · soft-404/C2 closed · quizzes noindex by design · scope = PWA+TWA only (no Capacitor/RN) · presentation-unified law · preview-before-prod, always.

*End. Blueprint retained unchanged at `SCALE_ARCHITECTURE_SPEC.md`; this file is the portfolio layer above it.*
