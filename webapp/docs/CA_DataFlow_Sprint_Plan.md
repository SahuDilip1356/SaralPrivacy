# Sprint Plan: CA Firms Data Flow Map (map #2)

**Spec:** `SaralPrivacy_CAFirms_DataFlow_Spec.md` v4
**Branch:** `feat/data-flow-ca-firms` off `main` @ `c182cc9`
**Total effort:** ~28h (Claude) + ~4h (Dilip decisions & review)
**Scheduling:** Dilip's call. Sequence and effort only — no dates.

> **Governing law** — *content varies by industry, presentation is unified.*
> CA is the **same page** as recruitment with a different pack. No new view.

> **Sprint Goal**
> The CA map is live on preview, approved by Dilip, rendering the identical
> presentation framework as recruitment — and map #1 is provably unchanged.

---

## The chain

```
D1 ─> S1 ─┬─> S2 ─┬─> S4 ─> GATE A ─> S5 ─> S6 ─> GATE B ─> S7 ─> D2 ─> S8
          └─> S3 ─┘                                                      │
                                                    S9 ─> S10 ─> S11 <───┘
                                                                  │
                                                        D3 ─> S12 ┘
```
S2 is independent of S1 — reorder freely. S9 only needs S1.

---

## Phase 0 — make the engine industry-agnostic

### D1 · Decisions — **0.5h, Dilip** 🔓 unblocks everything
Spec §9: DSC framing, Article Assistant naming, stray folder, Phase 0e
go/override, the 30-day CA partner.

### S1 · Buckets → per-pack — **1h**
`assessmentBuckets: string[]` on the pack · `assessmentBucket` → `z.string()` ·
membership checked in `validatePack` · delete the global const · recruitment
declares its existing 5.
**Done when:** recruitment's 15 tests pass untouched.

### S2 · `mainActor` + `lexicon` → per-pack — **2.5h** ⚠️ shared components
Layer 1 becomes a real field. `flow-theme.ts` boundary labels and `MotionJourney`
copy (:263, :333, :569, :641) read from the pack. **Defaults reproduce
recruitment's current words byte-for-byte.**

### S3 · Business models → per-pack — **0.5h**
A pack may declare one model or none. **When one, the §2 selector hides** and
the stage count renders alone — CA needs this.

### S4 · Parametrise the test suite — **1.5h**
Iterate the registry, not one pack. Stage count a range (recruitment 12, CA 10).
Bucket drift-guard per-pack.
*Blocked by S1 + S3*

### S5 · Design-system cleanup (Blocker E) — **4h** ⚠️ shared components
Typography tokens + 11px floor + ≤2 weights · two empty states · `disabled:` /
`active:` · hex dedupe. Contrast verification deferred to S11.
*Blocked by D1*

### 🚦 GATE A · Isolation — **1h** — before any presentation or content work
Recruitment's 15 tests green unmodified · `tsc` clean · rendered page diffed,
**no visual delta**. **If this fails, stop.**

---

## Phase 1 — one presentation for all twelve

### S6 · Dynamic route + copy into packs — **4h**
- new `app/industries/[sector]/data-flow/page.tsx` reading the registry
- `generateStaticParams` from `dataMapSlugs`; per-sector metadata + breadcrumbs
- move the ~12 industry strings into pack fields: `pageTitle`, `pageIntro`,
  `eyebrow`, `ctaLabel`, `hotspotBlurb`, `howToRead[3]`
- recruitment pack takes today's exact strings
- retire the cloned `app/industries/recruitment-agencies/data-flow/`
*Blocked by GATE A*

### 🚦 GATE B · Recruitment unchanged on the new route — **1h**
Same URL, same HTML, same metadata, same OG tags. Diff before/after.
**This is the step that could silently damage a live, indexed page** — it gets
its own gate rather than riding on GATE A.

---

## Phase 2 — CA content

### S7 · CA pack — draft — **6h** 📌 biggest step
`lib/data/data-flow/ca-firms/` — 10 stages, ~12 data categories (incl. **DSC**,
**portal passwords**), 6 personas (incl. **Article Assistant**), nodes with real
software (Tally, Busy, ClearTax, Winman), **spanning nodes** for storage and
staff laptops, ~40 edges, 7 ranked hotspots (DSC first).
**Watch this one** — the CEO review priced authoring at 2–3 days against ~10h
(S7+S8). This is where the sprint slips if it slips.
*Blocked by GATE B*

### D2 · CA domain review — **2h, Dilip** 🔑 the truth gate
Nothing substitutes for this. I can write plausible CA content, not true CA
content.

### S8 · Pack finalised — **4h** — `validatePack` → zero issues
### S9 · `BUCKET_FOCUS` in CA assessment client — **0.5h**
CA's 5 bucket keys → focus-banner labels. Without it the 7 deep-links land but
never highlight. *Only needs S1.*
### S10 · Registry — **5min** — one line in `lib/data/data-flow/index.ts`
*No route work — S6 already covers every sector.*

---

## Phase 3 — verify and ship

### S11 · Local verification — **2h**
`tsc` + full suite · dev server on **port 3100** · all 7 deep-links clicked and
the focus banner confirmed · **contrast measured ≥4.5:1**, ratios recorded ·
**CA and recruitment rendered side by side — identical in shape**

### S12 · Preview — **1h** — push branch, verify via Vercel MCP (previews 401 to curl)
### D3 · Preview sign-off — **1h, Dilip** 🎯 sprint goal met here
### S13 · Prod — **0.5h**, after sign-off — ff-merge, watch build, confirm route count

---

## Effort summary

| Block | Steps | Effort | Reducible? |
|---|---|---|---|
| Dilip decisions & review | D1–D3 | ~4h | No — D2 is CA truth |
| Phase 0 engine debt | S1–S5 + Gate A | ~10.5h | No — paid once |
| Phase 1 unified presentation | S6 + Gate B | ~5h | Yes → clone instead (~1.5h), but drift returns |
| Phase 2 CA content | S7–S10 | ~10.5h | No — sector truth |
| Phase 3 ship | S11–S13 | ~4h | Mechanical |
| | **Total** | **~28h** | |

**Map #3 onward: ~10–12h** — a pack file and a registry line. No route, no view,
no engine work.

---

## Cut list — in order

1. Hotspot taxonomy field *(stretch, never started)*
2. **S9 `BUCKET_FOCUS`** — deep-links still land, only the banner is missing
3. **S5 items 3–4** — keep typography floor + empty states; those are what failed review
4. **S6 dynamic route → clone instead** — saves 2.5h now, costs ~1.5h on every
   future map and reopens presentation drift. *Last resort.*

**Never cut:** GATE A, GATE B, or D2.

---

## Risks

| Risk | Impact | Mitigation |
|---|---|---|
| S2/S5 regress the live recruitment map | Map #1 breaks | Additive-with-defaults; GATE A blocks all later work |
| **S6 damages a live indexed page** | SEO loss on the one map with traffic | GATE B is dedicated to it: same URL, HTML, metadata, OG |
| S7 content underestimated | Sprint overruns | Cut list; content quality is never what gets cut |
| **30-day CA user still unnamed** | Ships an SEO asset, not a validated bet | Answer at D1. Phase 0 + Phase 1 are worth it regardless |
| iCloud zeroes files mid-session *(known)* | Lost hours | Null-byte check; `npm ci`; never `git fetch` on a corrupt pack |

---

## Definition of Done

- [ ] `tsc` clean, all tests green (recruitment's 15 unchanged + CA tests)
- [ ] `validatePack` zero issues for the CA pack
- [ ] GATE A passed — recruitment byte-identical after Phase 0
- [ ] GATE B passed — recruitment identical on the dynamic route (URL, HTML, metadata)
- [ ] All 7 CA deep-links reach the right assessment section
- [ ] Contrast ratios measured and recorded
- [ ] **CA and recruitment identical in shape, different only in content**
- [ ] Preview approved by Dilip
- [ ] Spec + sprint plan committed on the feature branch
