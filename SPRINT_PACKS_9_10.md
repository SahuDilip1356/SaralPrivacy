# Sprint Plan — Packs 9 (Hotels & Travel) + 10 (Pharmacies)

**Dates:** 2 focused build days · **Team:** 1 builder lane (Dilip + Claude Code)
**Sprint Goal:** Ship Hotels & Travel and Pharmacies DPDPA assessments live in one commit, taking the platform to **10 sectors**, with **byte-identical behavior for the existing 8 packs** — proven, not assumed.

---

## Isolation architecture — the spine of this sprint

The whole sprint is designed so the new work **cannot** affect existing packs. Every file falls into one of three lanes:

| Lane | Rule | Files |
|---|---|---|
| 🟢 **ADDITIVE** (new files — zero regression possible) | Create only | `packs/hotels-travel.ts`, `packs/pharmacies.ts`; `app/assessment/{hotels-travel,pharmacies}/page.tsx` + `*AssessmentClient.tsx`; `app/industries/{hotels-travel,pharmacies}/page.tsx`; `tools/build-{hotel,pharmacy}-checklist.mjs`; 2 PDFs |
| 🟡 **SHARED** (append-only edits — bounded risk) | Add entries; never modify/reorder existing ones | `lib/data/industry-assessment/index.ts` (+2 imports, +2 registry lines); `components/home/AudienceCards.tsx` (+2 cards); `app/industries/page.tsx` (+2 array items, +2 table rows); `components/layout/Footer.tsx` (+2 links); `components/layout/Header.tsx` (+2 if Industries menu lists sectors); `app/sitemap.ts` (+4 URLs); `components/home/HeroSection.tsx` ("4"→"10") |
| 🔴 **FROZEN** (must NOT change) | No edits — this is the regression guarantee | `lib/data/industry-assessment/core.ts`, `bands.ts`, and all 8 existing pack files |

**Why this gives zero regression:**
1. The scoring **engine is frozen** → existing packs compute identical results.
2. New packs use **new `reportType` tokens** (`hotel`, `pharmacy`) that collide with nothing → `getPackByReportType` routing for existing packs is unchanged.
3. SHARED edits are **append-only array/list additions** → existing entries are untouched bytes.
4. Per-pack UI is **new route folders** → no existing page is re-rendered differently.

---

## Capacity

| Lane | Available | Allocation | Notes |
|---|---|---|---|
| Builder (Dilip + Claude Code) | 2 days | ~20 pts | Single serial lane; AI-assisted |
| **Total** | **2 days** | **~20 pts** | Plan to ~75% → **15 pts committed, 5 pts buffer** |

> Story points are relative effort, calibrated to the real-estate pack (the newest reference) as 8 pts.

---

## Sprint Backlog

| Pri | Item | Est | Isolation lane | Dependencies |
|---|---|---|---|---|
| **P0** | **T0 · Regression baseline** — snapshot current results for all 8 packs (a fixed answer-set → score/band per pack) before any change | 1 | read-only | none — **do first** |
| **P0** | T1 · `packs/hotels-travel.ts` — 10 Q, 5 buckets, Σ112, `layer` 58/54, 7 overrides, `reportType:"hotel"`, bandCopy/flags/recs | 3 | 🟢 add | spec §3–4 |
| **P0** | T2 · `packs/pharmacies.ts` — 10 Q, 5 buckets, Σ112, `layer` 58/54, 8 overrides, `reportType:"pharmacy"`, plain additive | 3 | 🟢 add | spec §3–4 |
| **P0** | T3 · Registry — +2 imports/lines in `index.ts` | 0.5 | 🟡 append | T1, T2 |
| **P0** | T4 · Assessment routes — 2× `page.tsx` + `*AssessmentClient.tsx` (clone real-estate pattern, swap pack) | 1.5 | 🟢 add | T3 |
| **P0** | T5 · Industry pages — 2× `app/industries/{slug}/page.tsx` (clone template; copy from spec §16/§23) | 3 | 🟢 add | T1, T2 |
| **P0** | T6 · Homepage cards — +2 in `AudienceCards.tsx` (orange/`Hotel`, purple/`Pill`); verify grid at 10 | 1 | 🟡 append | T5 |
| **P0** | T7 · Industries index + risk table — +2 array items, +2 `<td>` rows | 1 | 🟡 append | T5 |
| **P0** | T8 · Footer / Header / sitemap — +2 links each, +4 sitemap URLs | 1 | 🟡 append | T5 |
| **P1** | T9 · Checklist PDFs — `build-{hotel,pharmacy}-checklist.mjs` (10 sections each) + wire `leadMagnet`/`checklistUrl` | 2 | 🟢 add | T1, T2 |
| **P1** | T10 · Pharmacy reassurance line above Q3 + "high-impact health data" copy lock | 1 | 🟢/🟡 | design review |
| **P1** | T11 · Hero stat `"4"→"10"` guardrail | 0.5 | 🟡 | T6 |
| **P2** | T12 · Hotels Override 5 calibration (drop `wifi_logs` from High trigger if decided) | 0.5 | 🟢 | decision |
| **P2** | T13 · Trim hero trust chips to 6–7 (both packs) | 0.5 | 🟢 | — |

**Committed (P0+P1):** ~15 pts · **Stretch (P2):** ~1 pt · **Buffer:** ~4 pts

---

## Build sequence (serial, regression-gated)

1. **T0 baseline first** — capture the 8-pack score/band snapshot. Nothing else starts until this exists.
2. **Data before UI:** T1 → T2 → T3 (packs + registry). After T3, run the engine on the 2 new packs in isolation (a quick node/script scoring check against spec sample scores).
3. **Routes + pages:** T4 → T5.
4. **Surfacing (append-only):** T6 → T7 → T8 → T11.
5. **Lead magnets + copy:** T9 → T10.
6. **Calibration/polish:** T12 → T13 (or cut to next sprint).
7. **Regression gate (T0 re-run)** — re-run the 8-pack snapshot; **must match T0 exactly**. Then deploy.

---

## Risks

| Risk | Impact | Mitigation |
|---|---|---|
| A SHARED file edit accidentally modifies an existing entry | Existing pack card/route/score drifts | Append-only discipline; `git diff` each SHARED file shows **only additions**; T0 regression gate catches behavior change |
| Token >10 chars or token≠DB drift | 500 "Invalid document structure" / rows misclassify as "General" | Tokens fixed at `hotel`/`pharmacy` (≤10); client sends `pack.reportType`; verify round-trip on a real submission |
| Tailwind purges new accent classes (`orange`/`purple`) | Unstyled cards in prod build | Use explicit static class strings like existing cards (no `bg-${x}` interpolation); verify in `next build`, not just dev |
| 10th card orphan on `lg` grid | Visual break | Existing `nth-child(3n+1)` centering hack already catches card 10 (10=3·3+1); verify visually |
| Engine edit sneaks in to support a pack quirk | Breaks all 8 packs | **core.ts/bands.ts are FROZEN.** Both packs verified to need no engine change (floor-at-0 already exists; Pharmacy is plain additive) |
| Vercel build route count doesn't grow | Silent route/registration failure | Post-deploy: confirm route count +4 in build log (per memory rule) |
| Health-category copy implies a statutory "sensitive data" tier | Legal inaccuracy on the brand's own turf | T10 copy lock to "high-impact health data," matching the published glossary |

---

## Definition of Done

- [ ] **Regression gate green:** T0 8-pack snapshot re-run is byte-identical post-build.
- [ ] `git diff` on every 🟡 SHARED file shows **additions only** — no modified/removed existing lines.
- [ ] `core.ts`, `bands.ts`, existing 8 pack files: **0 changes**.
- [ ] Both new packs: Σ caps 112, bucket maxima derive correctly, `layer` set, overrides raise-only and verified against spec sample scores.
- [ ] Tokens `hotel` / `pharmacy` ≤10 chars; a real test submission round-trips through admin + `/report/[token]` without "General".
- [ ] `next build` succeeds; accent classes render (not purged); homepage grid clean at 10 cards.
- [ ] Pharmacy reassurance line present above Q3; health copy uses glossary-consistent wording.
- [ ] Hero stat no longer says "4".
- [ ] Both Starter Checklist PDFs generate and download; `leadMagnet`/`checklistUrl` wired.
- [ ] Deployed; Vercel build log route count grew by **4**.
- [ ] `git status --short` clean — new files staged as `A`, not `??` (memory rule).

---

## Key dates / checkpoints

| Checkpoint | Gate |
|---|---|
| Day 1 start | T0 baseline captured |
| Day 1 mid | T1–T3 done → new-pack scoring verified in isolation |
| Day 1 end | T4–T8 done → both packs visible end-to-end in dev |
| Day 2 mid | T9–T11 done → lead magnets + copy + hero guardrail |
| Day 2 end | **Regression gate (T0 re-run) green** → deploy → route-count check |
| Post-deploy | Live submission round-trip per pack; retro |

---

## Out of scope (explicitly not this sprint)

- The full `SECTORS` single-source-of-truth refactor and landing-page consistency pass → **next phase**, after packs 9–12.
- Packs 11 (Fintech/NBFC) + 12 (Gyms/Salons/Spas) → following sprint.
- Deep-diagnostic Q11–Q15 for either pack.
