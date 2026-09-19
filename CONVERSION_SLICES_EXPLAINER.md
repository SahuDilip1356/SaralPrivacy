# The Four Conversion Slices — explainer + build plan

> Status (2026-09-19, verified on `main` @ `1bea332`):
> - **C1 ✅ LIVE** via PR #41 (`1bb1a84`) + #44 (`13b6629`), spec `HERO_TAP2_SPEC.md`. It shipped a
>   different design from §5 below: one real pack question per sector, an authored band step, and
>   that answer pre-selected when the assessment opens. §5 is kept for history only.
> - **C1 baseline** was captured 2026-09-06 in `ANALYTICS_BASELINE.md`, but only on PR #27
>   (`docs/analytics-baseline`), which is **still open**. It records ~0.1 assessments a week, so the
>   C1 before/after read will take a long time to become meaningful.
> - **Order is now C3 → C2 → C4.** C2 waits for the October Appwrite close-out to rewrite the
>   vendor rows in `privacy-vendors.ts`.
> - **C3 inherits two rules from C1:** all visitor copy goes in `messages/en.json`, never in a data
>   file; mount shared components in all 12 clients the way `parsePrefill()` was.
>
> Sequence + tentative hours only; scheduling is Dilip's.

## 1. What this is

A roadmap note from the 2026-09-08 engineering-blocks session. It names four small pieces of
landing-page and sharing work. Each moves a visitor one step closer to **starting an assessment**
or **forwarding SaralPrivacy to someone**. They are "slices" because each is thin enough to ship on
its own, between P5 steps.

**Why now.** Gate 3 of Operation Pounce needs ≥ 25 paying customers and ≥ 2 conversions per 100
assessments. The content and tools exist. The path from *landed* → *ran the assessment* →
*forwarded it* is what is loose. None of these is a new tool, so none breaks the Gate-3 not-do list.

## 2. What the code says that the roadmap note did not

Reading the real files changed five things. These matter more than the rest of this doc.

| # | Roadmap note said | Code actually shows | Consequence |
|---|---|---|---|
| 1 | C1: "the first tap exists; the second tap turns the chip into a verdict card with a pre-selected CTA" | `components/home/HeroSection.tsx` **already** shows a verdict card on tap one — "DPDPA applies to your {sector}", typical band, first fix — and the CTA **already** routes to `/assessment/{slug}` | C1 is smaller than scoped. The real job is making "DPDPA applies" **earned** (asked, not asserted) and adding honest off-ramps for "No" and "Not sure" |
| 2 | C1 gate: "assessment starts per 100 sessions" | Analytics is Vercel Web Analytics (cookieless). It counts **visitors**, not sessions. `assessment_start` carries **no properties**, so a start cannot be attributed to the hero | Gate must be restated as *hero assess-clicks per 100 home visitors*. The Vercel analytics query API returned `404 Web Analytics not found` for project `webapp`, so the baseline must be read by hand from the dashboard |
| 3 | C3: "share a PII-free public summary route" | `/report/[token]` holds name, business, city; is `noindex`; token expires in 90 days. Assessments are written to **Appwrite**, which rejects the *whole document* on any unknown field | A new `share_id` column on the assessment record would silently drop leads (the `b949e0f` incident). The summary route must be **stateless and signed**, with no DB write |
| 4 | C3: "server-rendered preview image" | There is **no** `ImageResponse` / `opengraph-image` anywhere in the repo | C3 builds preview-image infra from zero (fonts, layout, size budget). Estimate goes up |
| 5 | C4: "the risk beat already has sector chips" | `components/home/WhereRiskHides.tsx` has **tool** chips (WhatsApp, drives, Excel… ten everyday tools) plus the Privacy Thread lifecycle. No sector chips | C4 is a redesign of the founder-approved signature visual, not a small evolution. Replace-vs-coexist is a decision for Dilip before any spec |

Also relevant: per the 2026-09-09 Razorpay reconciliation, the monorepo move now sits **after
Gate 2**. If that holds, C2, C1 and C3 all fit comfortably before it, and the "never straddle 5.1"
rule is easy to keep.

---

## 3. Step 0 — capture the baseline (shared, ~0.5 h, Dilip)

Needed before C1 ships, and useful for every slice. It is a dashboard read, not code.

1. Open Vercel → project `webapp` → Analytics. Set the range to the last 28 days, production only.
2. Record **home visitors**: filter page `/`.
3. Record **`landing_cta_click`** count, broken down by `cta` property (`assess`, `discover`).
4. Record **`assessment_start`** total and **`hero_sector_select`** total.
5. Paste the four numbers into `.agent/CURRENT.md` under a "Conversion baseline" heading.

**Done when:** four numbers are written down with the date range. The C1 metric is then
`landing_cta_click{cta=assess} ÷ home visitors × 100`.

---

## 4. C2 — "Inspect us" beat  ·  6–10 h  ·  go first

**Exists.** `webapp/lib/data/privacy-vendors.ts` holds the DPO and seven sub-processors, each with
purpose, data received, location and DPA status. `/privacy` and `/rights` are live.

**Missing.** A landing-page section that shows this to a visitor who never opens `/privacy`.

**Steps**

1. **Copy + placement** (1–2 h). Draft headline, 2-line intro and link labels in brand voice. Pick
   the slot on the homepage (see decision D1).
2. **Component** (2–3 h). New server component `components/home/InspectUs.tsx`. Renders **from
   `VENDORS` and `DPO`**, never hard-coded, so it stays true when the Appwrite row leaves. Four
   blocks: our notice → `/privacy`, our sub-processors (name + location), our DPO (name + email),
   your rights → `/rights`.
3. **Mount** (0.5 h) in `app/page.tsx` at the chosen slot.
4. **Design review** (1–2 h). `/plan-design-review`, average ≥ 8.
5. **Contrast + a11y** (1 h). Compute every text/background pair and every link focus ring.
6. **Preview verify** (1 h). Links resolve, section renders at 375 / 768 / 1280 px, no layout shift.

**Watch.** Appwrite is still a live processor in **Singapore** holding assessment answers. The
section must show that honestly. "We run what we sell" must not imply everything is in Mumbai.

**Done when:** Dilip has seen it on preview; all links resolve; 0 contrast failures.

---

## 5. C1 — Hero two-tap verdict  ·  6–10 h (was 8–12)  ·  second

**Exists.** Four chips (recruitment, CA firm, D2C brand, other). Tap one shows the verdict card,
band from `lib/data/hero-verdicts.ts`, first fix from `lib/data/verdict-previews.ts`, and a
sector-routed CTA. `hero_sector_select` already fires.

**Missing.** The applicability question. Today the card *asserts* "DPDPA applies" before asking
anything.

**Steps**

1. **Baseline** — Step 0 above must be done first.
2. **Question + answers copy** (1–2 h). One question under the chips, e.g. *"Do you keep customer,
   client or staff details in digital form — phone, WhatsApp, Excel, email or software?"* Three
   answers: **Yes** / **Not sure** / **No, everything is on paper**.
3. **Branching** (2–3 h) in `HeroSection.tsx`:
   - **Yes** → today's verdict card, unchanged, plus the sector-routed CTA.
   - **Not sure** → a short card: "If you use WhatsApp or Excel for customers, it almost certainly
     applies", CTA to `/discovery?sector=…`.
   - **No** → an honest card: DPDPA covers digital or digitised data; purely paper records sit
     outside it until digitised. Link to the Guide.
4. **Citation check** (0.5 h). The applicability claim rests on **DPDPA Section 3**. Verify the
   exact wording before ship (content-trust law).
5. **Event** (1 h). New `hero_applicability_answer { sector, answer }`. No PII. Confirm on preview
   that `POST /_vercel/insights/event` fires.
6. **Design review + contrast** (1–2 h). The card sits on the navy hero: green-400 fill + navy-950
   label is the only approved CTA pair there.
7. **Preview verify** (1 h). Walk the literal click sequence — chip → answer → change chip → change
   answer — on one page load, without reloading. This is where same-page stale state hides.

**Read the result** after at least 28 days live, against the Step 0 number.

**Done when:** all three branches work on preview; the new event is seen in the network tab.

---

## 6. C3 — WhatsApp share cards  ·  14–20 h (was 10–16)  ·  third

**Exists.** Hand-built `wa.me` links on blog and briefing pages only. The token report page. Twelve
public flow-map pages at `/industries/[sector]/data-flow`, served by one dynamic route.

**Missing.** A share action on results; a public, PII-free landing page for shared links; preview
images.

**Design (recommended).** A **stateless signed URL** such as `/share/{sector}?b={band}&s={score}&sig=…`.
The signature is an HMAC over sector + band + score. No DB write, so no Appwrite risk. The
signature stops anyone minting a fake "SaralPrivacy scored me 98" card under our brand.

**Steps**

1. **Signing helper** (1–2 h). `lib/share/sign.ts` with sign + verify, plus unit tests. New secret
   `SHARE_LINK_SECRET`, added to **all** Preview and Production. Never branch-scope it.
2. **Share route** (3–4 h). `app/share/[sector]/page.tsx`. Verify signature or return a plain
   "check your own business" page. Show sector, band, score and one CTA to
   `/assessment/{sector}`. **Nothing else** — no name, business, city or answers. Mark it
   `noindex` and keep it out of the sitemap: an unbounded URL space would worsen the crawl-budget
   starvation SEO Cycle 2 is fighting.
3. **Preview image** (3–4 h). `opengraph-image.tsx` for the share route using `next/og`, 1200×630,
   bundled font, under 300 KB. A second, static-per-sector image for the flow-map route.
4. **Share button** (2–3 h). One shared `components/ShareResult.tsx` that builds the `wa.me` text +
   signed link. Mount it on the result screen of all **13** assessment clients and on the report
   page. The twelve clients are clones, so this is one component and 13 one-line mounts. All 12
   sectors ship in the same PR (presentation-unified law).
5. **Flow maps** (1 h). Add the button to the dynamic data-flow route; it shares the public page URL.
6. **Event** (1 h). `share_click { channel: "whatsapp", surface, sector, band }`, where surface is
   `assessment_result`, `report` or `flow_map`. Must be seen firing on preview before merge.
7. **Design review + contrast** (1–2 h).
8. **Verify** (1–2 h). See the preview trap below.

**Preview trap.** Previews sit behind Vercel SSO, so WhatsApp's crawler **cannot** fetch the preview
deployment's image. On preview, verify the image by fetching it with `vercel curl` and the route by
hand. The real WhatsApp unfurl can only be checked right after the prod deploy, so plan that check
and a rollback.

**Done when:** a share from each surface opens a PII-free page; the image renders; `share_click`
is seen on preview; the unfurl is checked on prod.

---

## 7. C4 — Data-travel teaser  ·  spec 4–6 h + build 12–18 h  ·  last

**Exists.** `WhereRiskHides.tsx` (478 lines, client component): ten tool chips fanning from a
personal-data hub, an evidence panel, and the Privacy Thread lifecycle. Each sector pack has its
own `stages.ts` spine of 10–14 stages.

**Missing.** A sector-tabbed, one-lane view of data travelling through stages.

**Spec first** (4–6 h, during the P5 spec pass, so review happens offline). The spec must settle:

1. **Replace or coexist** with the tool scatter (decision D5).
2. **The stage collapse.** A 4–5 stage lane has to summarise 10–14 real stages. Write the mapping
   for each of the 2–3 chosen sectors, derived from each pack's union spine. It is content work.
3. **Which sectors** get tabs. Recommend the hero's three: recruitment, CA firm, D2C.
4. **The hotspot rule.** Which stage is red per sector, taken from pack data, not picked by eye.
5. **Rendering.** A server component with CSS keyframes and CSS-only tabs where possible;
   `prefers-reduced-motion` shows the composed state.
6. **Standing constraints.** No full lane board on the homepage, no mega-menu, no rename of
   `/data-mapping`. The full simulator stays paid-tier after Gate 3.

**Build** (12–18 h) after the spec passes `/plan-design-review` at ≥ 8. Contrast on the navy
ground; the red hotspot must meet contrast against navy, not just look red.

---

## 8. Sequence and totals

| Order | Slice | Tentative hours | Blocked by |
|---|---|---|---|
| 0 | Baseline read | 0.5 | Dilip, dashboard access |
| 1 | C2 Inspect us | 6–10 | D1 |
| 2 | C1 Two-tap verdict | 6–10 | Step 0, D2 |
| 3 | C3 Share cards | 14–20 | D3, D4 |
| 4a | C4 spec | 4–6 | D5 |
| 4b | C4 build | 12–18 | Spec review ≥ 8 |
| | **Total** | **≈ 43–65** | |

Rules that hold throughout: one slice in flight at a time; each ships wholly before or after the
monorepo move; design review ≥ 8; computed contrast; preview-before-prod; no self-merge.

## 9. Decisions only Dilip can make

- **D1 · C2 placement.** Recommend just before the FAQ, after the product has shown itself.
- **D2 · C1 "No" answer.** Recommend the honest off-ramp above rather than hiding the option.
- **D3 · C3 card content.** Recommend exact score **and** band, signed. Band-only is safer but
  less shareable.
- **D4 · C3 "flow-map results".** Recommend reading this as the 12 public flow-map pages. The
  per-user `/discovery` result would be a later, separate slice.
- **D5 · C4 replace or coexist.** Recommend coexist: keep the tool scatter, add the lane as a
  second view. The scatter is a founder-approved signature and carries its own events.
