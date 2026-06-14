# Sprint Plan — Packs 11 (Fintech/NBFC) + 12 (Gyms, Salons & Spas)

**Dates:** 2 focused build days · **Team:** 1 builder lane (Dilip + Claude Code)
**Sprint Goal:** Ship Fintech/NBFC and Gyms/Salons/Spas DPDPA assessments live in one commit, taking the platform to **12 sectors** on a clean 4×3 homepage grid, with **byte-identical behavior for the 10 packs already in production** — proven, not assumed.

> Proven playbook: this is the exact pattern that shipped packs 9+10 to prod cleanly (engine frozen, append-only surfacing, cherry-pick onto main). Same lanes, two new packs.

---

## Isolation architecture — the spine

| Lane | Rule | Files |
|---|---|---|
| 🟢 **ADDITIVE** (new files — zero regression possible) | Create only | `packs/fintech-nbfc.ts`, `packs/gyms-salons-spas.ts`; `app/assessment/{fintech-nbfc,gyms-salons-spas}/` (page + client); `app/industries/{fintech-nbfc,gyms-salons-spas}/page.tsx`; `tools/build-{fintech,wellness}-checklist.mjs`; 2 PDFs |
| 🟡 **SHARED** (append-only — never modify/reorder existing entries) | Add entries | `lib/data/industry-assessment/index.ts` (+2 lines); `components/home/AudienceCards.tsx` (+2 cards); `app/industries/page.tsx` (+2 array, +2 rows); `components/layout/{Footer,Header}.tsx`; `app/sitemap.ts`; `components/home/HeroSection.tsx` ("11"→"12") |
| 🔴 **FROZEN** (must NOT change) | No edits | `lib/data/industry-assessment/core.ts`, `bands.ts`, and all **10** existing pack files |

**Why zero regression:** engine frozen → existing packs score identically; new tokens (`fintech`, `wellness`) collide with nothing; SHARED edits are pure list additions. Both packs verified to need **no engine change** (plain additive, all option points ≥0).

---

## Capacity

| Lane | Available | Allocation | Notes |
|---|---|---|---|
| Builder (Dilip + Claude Code) | 2 days | ~20 pts | Single serial lane; AI-assisted; pattern already proven on 9+10 |
| **Total** | **2 days** | **~20 pts** | Plan to ~75% → **~15 pts committed, buffer for the legal-copy locks** |

---

## Sprint Backlog

| Pri | Item | Est | Lane | Deps |
|---|---|---|---|---|
| **P0** | T0 · Regression baseline — engine-frozen invariant + scoring verifier for both packs (caps, buckets, two-lens, [0,100], overrides raise-only) | 1 | read-only | first |
| **P0** | T1 · `packs/fintech-nbfc.ts` — 10Q Σ122, buckets 36/14/12/28/32, layer 52/70, 7 overrides all→High, `reportType:"fintech"` | 3 | 🟢 | spec |
| **P0** | T2 · `packs/gyms-salons-spas.ts` — 10Q Σ110, buckets 30/12/22/26/20, layer 54/56, 9 overrides (2 Mod→High pairs), `reportType:"wellness"` | 3 | 🟢 | spec |
| **P0** | T3 · Registry — +2 imports/lines in `index.ts` | 0.5 | 🟡 | T1,T2 |
| **P0** | T4 · Assessment routes — 2× page + client (clone newest, swap pack + ~20 strings + MICRO_NOTES) | 1.5 | 🟢 | T3 |
| **P0** | T5 · Industry pages — 2× `industries/{slug}/page.tsx` (clone; FAQs, BUCKET_DETAIL, scanChecks from spec) | 3 | 🟢 | T1,T2 |
| **P0** | T6 · Homepage cards — +2 (blue/`Landmark`, fuchsia/`Sparkles`); verify clean 4×3 at 12 | 1 | 🟡 | T5 |
| **P0** | T7 · Industries index + risk table — +2 array, +2 `<td>` rows | 1 | 🟡 | T5 |
| **P0** | T8 · Footer / Header / sitemap + hero "11"→"12" | 1 | 🟡 | T5 |
| **P1** | T9 · Checklist PDFs — `build-{fintech,wellness}-checklist.mjs` + wire `leadMagnet`/`checklistUrl` | 2 | 🟢 | T1,T2 |
| **P1** | **T10 · Fintech legal-copy locks** — (a) DPDPA-scoped, no RBI/localization/DLG overclaim; (b) no GDPR "right to explanation"; (c) "high-impact financial data" | 1 | 🟢 | T1 |
| **P1** | **T11 · Wellness copy** — "high-impact health data"; reassurance above Q2/Q5; photo consent framed DPDPA | 0.5 | 🟢 | T2 |
| **P1** | T12 · Long-list grouping (Fintech Q2/Q6 14-opt; Wellness Q7 13-opt) + fintech blue-accent calibration | 1 | 🟢/🟡 | design review |

**Committed (P0+P1):** ~17 pts · Buffer ~3 pts.

---

## Build sequence (serial, regression-gated)

1. **T0 baseline** — capture engine-frozen state; run scoring verifier on both new packs in isolation.
2. **Data → registry:** T1 → T2 → T3; verify new-pack scoring (cap sums, bucket maxima, sample scores).
3. **Routes + pages:** T4 → T5.
4. **Surfacing (append-only):** T6 → T7 → T8.
5. **Lead magnets + copy locks:** T9 → T10 → T11 → T12.
6. **Regression gate** — `git diff` proves FROZEN files unchanged + SHARED files additions-only; `next build` green; route count +4.
7. **Ship:** cherry-pick the single packs commit onto `main` (same clean technique used for 9+10) → preview → prod.

---

## Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Fintech copy overclaims RBI/localization compliance | Credibility loss with a sophisticated compliance audience | T10 lock: DPDPA-scoped wording; consultation CTA carries broader regulatory help |
| "Sensitive personal data" / GDPR Art-22 framing creeps in | Legal inaccuracy on brand's own turf | T10/T11: "high-impact" wording, DPDPA consent framing |
| Fintech `blue` indistinct next to sky/cyan/indigo | Muddy 12-card grid | T12: muted-accent treatment (icon chip + border, never fill) + `Landmark` icon disambiguates |
| Σ122 (fintech) hand-normalized by mistake | Wrong scores | Engine normalizes by Σcaps; never hardcode /112 or /110 |
| SHARED edit modifies an existing entry | Live pack drifts | Append-only; `git diff` shows additions only; T0 gate |
| Token >10 / token≠DB drift | 500 or "General" misclassification | Tokens fixed `fintech`/`wellness` (≤10); client sends `pack.reportType` |
| Tailwind purges `blue`/`fuchsia` accent classes | Unstyled cards in prod build | Static class strings like existing cards; verify in `next build` |
| Route count doesn't grow post-deploy | Silent registration failure | Confirm +4 routes in Vercel build log |

---

## Definition of Done

- [ ] **Regression gate green:** engine (`core.ts`/`bands.ts`) + all 10 existing packs byte-identical (`git diff` empty).
- [ ] `git diff` on every 🟡 SHARED file = additions only.
- [ ] Both packs: Σ caps correct (122 / 110), bucket maxima derive, `layer` set, overrides raise-only & verified vs sample scores.
- [ ] Tokens `fintech` / `wellness` ≤10; real test submission round-trips through admin + `/report/[token]` without "General".
- [ ] Legal-copy locks applied (Fintech ×3, Wellness ×2); reassurance lines present.
- [ ] `next build` green; accent classes render; **homepage clean 4×3 at 12 cards**; hero stat → 12.
- [ ] Both Starter Checklist PDFs generate + download; `leadMagnet`/`checklistUrl` wired.
- [ ] Deployed; Vercel route count +4; production smoke test on both new scans.
- [ ] `git status --short` clean — new files `A` not `??`.

---

## Key dates / checkpoints

| Checkpoint | Gate |
|---|---|
| Day 1 start | T0 baseline + new-pack scoring verified in isolation |
| Day 1 end | T1–T8 done → both packs visible end-to-end in dev |
| Day 2 mid | T9–T12 done → PDFs + legal-copy locks + long-list grouping |
| Day 2 end | Regression gate green → preview → prod → route-count check |
| Post-deploy | Live submission round-trip per pack; retro |

---

## Out of scope (explicitly not this sprint)

- The `SECTORS` single-source-of-truth refactor + full landing-page consistency pass → **next phase**, now that all 12 sectors exist.
- Deep-diagnostic Q11–Q15 for either pack (Fintech's 25–35 Q paid diagnostic; Wellness's 20–25 Q).
- The muted-accent card redesign — recommended before any 13th sector, but not blocking 12.
