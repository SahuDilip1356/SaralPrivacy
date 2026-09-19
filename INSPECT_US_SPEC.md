# "Inspect us" — the self-compliance beat

**Status:** DRAFT v0.1 · thread opened 2026-09-19 · nothing built · checked against `main` @ `1bea332`
**Owner decisions pending:** §9 (D1–D4)
**Gate:** see §3. This must not ship while any gate is open.

---

## 1. What and why

SaralPrivacy runs its own product on itself, in public:
- **Our data-flow map:** where your assessment answers, email and phone actually go.
- **Our processor table:** each processor with the data it receives, its location and its DPA status.
- **Our DPO/contact line.**
- **A residency line.**

Every part is rendered from `lib/data/privacy-vendors.ts` (and a self-map pack guarded against it). No copy is pasted in, so the beat can't drift from `/privacy`.

**Lever:** trust is the conversion tax on a privacy product nobody has heard of. Competitors say "compliant"; we show the RoPA. The Mumbai decision becomes something we can market instead of an infra footnote.

---

## 2. The proposal checked against the code

The original proposal rested on four claims. Three are wrong or not yet true on `main`, and those three are what the beat would put in a headline.

| # | Proposal said | What `main` actually does | Consequence |
|---|---|---|---|
| 1 | "Your data lives in Mumbai" | **Records at rest:** Supabase `ap-south-1`. ✅<br>**Functions:** `webapp/vercel.json` → `"regions": ["sin1"]` (**Singapore**); the move to `bom1` is booked in the Oct close-out PR.<br>**Leaves India:** Resend (US) gets name + email. Vercel Web Analytics (US) gets aggregated page views. Setu chat text goes to Anthropic (US) and Pinecone (region unverified) — see row 2. | The line as written over-claims. **Compute it from VENDORS** (§5.1), never write it by hand. |
| 2 | "Anthropic stays out of the table (drafting only). The file already documents why." | **Stale since 2026-08-03** (`3676c1f`, Setu `/api/chat`). The visitor's raw message (≤2,000 chars) goes to `claude-sonnet-5` (`app/api/chat/route.ts:211`) and to Pinecone for query embedding (`lib/chat/pinecone.ts:114`). `redact()` only runs on stored logs and to set `piiWarning`. It does **not** stop the model call, although Setu's own PII message says "I won't repeat or store them". | 🔴 **The live `/privacy` notice is wrong today.** Its AI note says "never your personal data … it is not a processor of your data." That is under-disclosure, whatever happens to this beat → **Gate G1**. |
| 3 | Map chain: "Vercel bom1 → Supabase Mumbai → Resend → Pinecone → Anthropic-drafting-only" | Functions are `sin1`, not `bom1`, and Anthropic is not drafting-only (row 2). Also, **Vercel Blob gets no personal data**: runtime code only `list()`s static templates (`app/api/templates/download/route.ts:44`) and there is no runtime `put()`. The VENDORS row "Report files, which may contain the details you entered" is **over-disclosure**, which the file's own header rule says is just as inaccurate. | The map is authored after G1 + G2, from the corrected VENDORS. |
| 4 | "A `saralprivacy` pack is just a 13th pack folder" | The pack itself is a folder, but there's more to it: (a) the route `/industries/[sector]/data-flow` is sector-keyed (`LIVE_DATA_MAPS = SECTORS.map…`), so a non-sector key never renders there; (b) the schema forces `hotspots.min(5).max(8)`, which fights "our open items, honestly"; (c) `assessmentBuckets`, `discoveryNicheId` and `disclaimer` ("reference model, never the user's own data") all assume an industry and flip meaning for a self-map; (d) `BOUNDARIES` is a fixed 7-value set, so `boundaryLabels` overrides are needed. | Needs a new route and a shared page-chrome extraction (§5.3). Estimate goes from 6–10h to **8–11h**. |

**Also confirmed as stated:**
- The Supabase row says "(we are migrating here from Appwrite)" (`privacy-vendors.ts:56`).
- The Appwrite row (Singapore) is still listed.
- All 6 rows are `dpa: 'available'`; **none is executed**.
- `VENDORS` + `DPO` are read by `/privacy`, `/rights`, `Footer` and `/consent-preferences`.
- The homepage is the measured 10-beat system (`app/[locale]/page.tsx:79–88`), and S2 is the proof seam (`PressProofStrip variant="rail"`).
- The DPO line cites **DPDPA s.8(9)**, verified against `content/dpdp-act-2023.ts:360`: "a Data Protection Officer, if applicable, or a person who is able to answer…". Do **not** cite s.10: we are not a Significant Data Fiduciary.

---

## 3. Gates (all must be closed before the beat ships)

| Gate | What | Owner | Independent of this beat? |
|---|---|---|---|
| **G1** | **Fix the Setu disclosure on `/privacy`:**<br>• add Anthropic and Pinecone rows ("the question you type to Setu")<br>• rewrite the AI note<br>• fix the stale header comment in `privacy-vendors.ts`<br>• remove or re-describe the Vercel Blob row<br>• confirm Pinecone's index region in the console | Claude drafts, Dilip approves the wording | **Yes. Ship now.** It is a live truth defect on a compliance brand's own notice. |
| **G2** | **Oct close-out PR** (already booked in `supabase-migration-status`):<br>• delete Appwrite + drop its row<br>• **rewrite the Supabase purpose** (drop "migrating here from Appwrite")<br>• `vercel.json` `sin1 → bom1`<br>• update the Vercel row's location text | Claude + Dilip | Yes. This beat just waits for it. |
| **G3** | **DPAs:** today the table would say "not yet signed" on **every** row. Dilip executes the self-serve DPAs (Supabase, Vercel, Resend, Anthropic, Pinecone) and each row flips to `'executed'` only with evidence (date + where the signed copy lives). Never pre-tick. | **Dilip** (not code) | Yes. It's also real compliance work the beat forces. |

---

## 4. Placement (D1)

**Recommendation:** a 1-line trust link in the **S2 proof seam** → the full beat at **`/about#inspect`**. The 10-beat homepage stays untouched.

- **Precedent:** a founder decision on 2026-08-22 moved the "who's behind this" band off the homepage to `/about` ("a visitor who asks it has already gone looking"). Inspect-us answers the same question, so it follows the same rule.
- **S2 constraint:** `PressProofStrip` is shared (banner / compact / sidebar / rail), and `/about` already uses it. Change **only** the `rail` variant. Either add the link after `START_FACTS`, or swap "Built for Indian workflows" for "Your records are stored in Mumbai →". That swap is a design-review call.
- **Alternative:** a full homepage beat. That means re-running the page's measured rhythm (fill / padding / hairline, `scripts/design-lint.sh`) and displacing a beat. Not recommended before the analytics baseline exists.

---

## 5. Build

### 5.1 Residency line: computed, not written
- **Additive field:** `country: 'IN' | 'US' | …` on `Vendor`. Keep `location` as the display string.
- **Line generated as:** "Your records are stored in {IN rows' cities}. {n} things leave India: {non-IN rows' `purpose`, short form}."
- **Result:** the line can't over-claim. If a US processor is added, the sentence changes in the same PR as the row.
- **Short forms** are a new optional field on `Vendor` (`short?: string`). The beat never truncates `/privacy` prose.

### 5.2 Processor table
- **Source:** straight from `VENDORS`.
- **Columns:** name · what it receives (`dataReceived`, verbatim) · where (`location`) · DPA.
- **DPA wording:**
  - `'available'` → "Standard DPA available — not yet signed by us"
  - `'executed'` → "DPA signed"
- **DPO/contact line:** from `DPO`, citing s.8(9).

### 5.3 Self map: `lib/data/data-flow/saralprivacy/`
- **Registration:**
  - Exported as `SELF_DATA_FLOW_PACK` and **not** added to `PACKS` (the sector registry). That keeps it out of `/data-mapping`, the footer column, the sitemap loop and `LIVE_FLOW_MAP_SLUGS` by construction.
  - **Is** added to `data-flow.test.ts` → `PACKS`, so every Tier-1 framework guarantee applies to it.
- **Route:** `/about/data-flow` (D2).
- **Page chrome:** the industry route's page body (header band, how-to-read, CTA pair; 135 lines) is extracted into one shared component that both routes render. That satisfies the *presentation-unified* law: a fork would drift.
- **Honest hotspots.** Candidates, each to be verified at authoring:
  - DPAs not signed (until G3)
  - Setu questions leave India
  - Email leaves India (Resend US)
  - The Appwrite final-archive tarball (PII) on the founder's machine: what are its retention and deletion dates?
  - Functions in `sin1` (resolved by G2; drop it if closed)
- **If fewer than 5 are true at ship time → D3.** Never pad.
- **Drift guard (test):** every processor node in the self pack ↔ exactly one `VENDORS` row, and vice versa. Without it, "rendered live, can't drift" is only true of the table, not the map.

### 5.4 `InspectUs` component (on `/about#inspect`)
- **3 panels:**
  1. Map thumbnail → "Open our map"
  2. Processor table
  3. Residency line
- **One CTA:** "Now inspect yourself → `/assessment`".
- **SEO:** an `AnswerBlock` answering "Where does SaralPrivacy store my data?", generated from the same §5.1 computation.

### 5.5 Events (`lib/analytics.ts` → `trackEvent`)
- `inspect_us_view`: in view, once, via `IntersectionObserver`, same pattern as `ScoreDial`.
- `inspect_us_open_map`
- `inspect_us_cta`
- `inspect_us_strip_click`: the S2 link, needed to measure D1.
- **Payloads:** no PII (`surface` only).
- ⛔ **Verify on preview:** each event must be seen as `POST /_vercel/insights/event`.
- **Gate type:** instrument and read with a **denominator** gate, not a 7-day keep/kill. Traffic is too thin (see the `analytics-live-gate-starved` memory).

---

## 6. Blast radius

| Risk | Loud / **silent** | Guard |
|---|---|---|
| Extracting the data-flow page chrome shifts `<title>`, canonical, OG or breadcrumb JSON-LD on the **12 indexed maps** | **Silent** (SEO) | Before/after diff of `<head>` + every `ld+json` block on all 12 routes. Must be empty. |
| Someone "fixes" the route by adding `saralprivacy` to `sectors.ts` → a 13th industry appears in the header, footer, `/industries` and assessment surfaces | **Silent** (breaks the Pounce not-do) | Test: `saralprivacy ∉ SECTORS` and `∉ LIVE_FLOW_MAP_SLUGS` |
| New events no-op (23 events were silent for months before) | **Silent** | Network-tab proof on preview for all 4 |
| Map nodes drift from `VENDORS` when a processor changes | **Silent** | §5.3 drift test |
| Editing a `VENDORS` row re-renders on `/privacy`, `/rights`, Footer and `/consent-preferences` | Loud (visible) | New fields are **additive** only (`country`, `short`). No renames. |
| Residency line over-claims | **Silent** (trust) | Computed from `country` (§5.1) |
| Zod pack validation fails at build | Loud | `next build` + `data-flow.test.ts` |
| Concurrent editors: the Oct close-out PR edits `privacy-vendors.ts`; the hero / WhatsApp-share thread may touch `PressProofStrip` | Loud (conflict) | Build after G2 merges. Rebase on `main` and check `git status` drift first. |

---

## 7. Eval

**No AI surface → the eval-before-proposing law doesn't apply.** Everything is static, deterministic content. The tests are:
- the drift test
- the not-a-sector test
- Tier-1 pack guarantees
- the head/JSON-LD diff
- the event network proof

---

## 8. Sequence (tentative hours; Dilip schedules)

1. **G1 PR:** Setu disclosure, Blob row, header comment. **~1.5h**, plus Dilip's wording review. *Can go now.*
2. *(Wait: G2 close-out merged; G3 DPAs signed or accepted as-is per D4.)*
3. **Spec v0.2:** re-verify §2 against the post-G2 `main`, list the true hotspots, then `/plan-design-review` (needs avg ≥ 8). **~1h**
4. **Additive `Vendor` fields + residency computation + unit test.** **~1h**
5. **Self pack authoring + drift test + not-a-sector test.** **~3h**
6. **Chrome extraction + `/about/data-flow` route + 12-route head diff.** **~2–3h**
7. **`InspectUs` + S2 rail link + AnswerBlock + 4 events.** **~2h**
8. **`next build` → preview → event network proof → Dilip verifies → merge on his "go".** **~0.5h**

**Total ≈ 8–11h build + G1.**

---

## 9. Decisions for Dilip

- **D1 — Placement:** S2 trust link + `/about#inspect` *(recommended)* vs a full homepage beat.
- **D2 — Map URL:** `/about/data-flow` *(recommended; keeps it out of `/industries`)* vs `/inspect-us`.
- **D3 — If fewer than 5 honest hotspots at ship time:** relax the schema for the self-pack only (`kind: 'self'` → `min(1)`) *(recommended)*, or drop the hotspot rail from the self-map. **Never pad.**
- **D4 — DPAs:** sign the self-serve DPAs before shipping *(recommended)*, or ship showing "not yet signed" on every row.

## 10. Not doing
- No 13th industry.
- No listing on `/data-mapping`.
- No new sector surfaces (Pounce not-do).
- No "certified" or "compliant" badge language.
- No claims about competitors in the copy.
- No hand-written residency sentence.
- No pre-ticked DPAs.
