# SaralPrivacy — D2C Brands Personal Data Flow Map

**Spec v1 · Map #4 in the Data Flow series · 2026-07-26**
Model copied: `docs/SaralPrivacy_TrainingInstitutes_DataFlow_Spec.md` (multi-model) · Contract: `docs/SaralPrivacy_DataFlow_Framework_Spec.md`
Actor: **Customer** · Route: `/industries/d2c-brands/data-flow`

---

## 0. The one decision that governs everything else

A long external "Claude Code development specification" was supplied for this map — the same
situation as map #3. It is an excellent **content inventory**: its stage, system, external-party
and hotspot detail is the best input this series has had, and we mine it in full. But its
**architecture is wrong for this codebase** and is not followed literally. It proposes a bespoke
three-variant engine: ~27 new components (§25), a new graph node/edge model (§19), a new metrics
interface (§20), a customer-rights simulator (§7.9), a filter/table-fallback matrix (§24), a new
validation module (§35), a new test suite (§36) and `d2c_flow_*` analytics (§34) — all scoped to
one industry.

That violates two settled laws:

- **"Presentation unified, content varies"** (architectural law): the data-flow *presentation* is
  identical across all 12 industries; only *content* differs. A view change shipped to one
  industry alone is forbidden.
- **The config-driven engine** (handoff §0): a map = **one pack folder + two one-line
  registrations**, ~content-only, no route/component/schema edits.

**And the pasted spec's headline feature already exists.** Its "three genuinely different
journeys, not cosmetic filters" is exactly what `businessModels` does today — recruitment ships
two, training institutes three, gated per-stage / per-node / per-edge and filtered by
`filterByBusinessModel()`, with the selector auto-hiding at one model.

> **Locked scope: Selective Expansion** (confirmed with Dilip before authoring). Deliver the
> pasted spec's rich content and its three operating models **through the existing config
> engine**. Author one pack; touch no route, schema or graph model. See §12 for the explicit
> "will NOT build" list and §13 for the shared-view fixes that were in scope.

---

## 1. The 10-layer standard applied to D2C brands

Identical presentation, D2C content.

| Layer | D2C content |
|---|---|
| Main actor | **Customer** (plus the **gift recipient**, a second principal who never dealt with the brand) |
| Business journey | 10 stages, ads → deletion |
| Personal data | 15 categories, 4 of them derived |
| Business activity | selling, fulfilling, supporting, and above all *marketing* |
| Systems | 44 nodes: storefront, marketplace, pixels, gateway, WMS, courier, helpdesk, CRM, CDP, ad platforms, archives |
| People who access | 12 personas, incl. the delivery agent and the marketplace account team |
| External sharing | payment, logistics, ad platforms, marketplaces, agencies, review platforms |
| Copies created | 40 / 35 / 61 copy events by model |
| Where control breaks | 8 hotspots |
| DPDPA expectation | per stage, in `dpdpaNote` |

**The sector's shape:** a **funnel that never closes.** Recruitment is a pipeline that flows once,
CA a loop that recurs yearly, a training institute a lifecycle with an end. A D2C customer buys
once and is marketed to for ever — which is why the map's centre of gravity is stages 9–10, not
checkout.

**Signature exposure (the thing no other vertical has):** *the customer list is the asset, and the
most routine thing done with it — uploading it to Meta and Google as a custom and lookalike
audience — is the transfer the customer was never told about and cannot escape by unsubscribing.*
Ranked hotspot #1.

---

## 2. Business models

Three genuine journeys, gated per node/edge. `omnichannel` appears in every gated tag, so it
renders the full union; `website` is the default and `marketplace` is honestly leaner.

| id | label | Gating convention |
|---|---|---|
| `website` | Own website brand | **default** — first declared |
| `marketplace` | Marketplace-first brand | platform-mediated, fewer own systems |
| `omnichannel` | Omnichannel brand | superset + retail/POS/CDP/clienteling |

- untagged → all three (shared core, 20 systems)
- `["website","omnichannel"]` → own-storefront surfaces (10)
- `["marketplace","omnichannel"]` → platform surfaces (6)
- `["omnichannel"]` → retail + unified-profile surfaces (4)

The stage spine is shared across models (as in TI): switching the selector **repopulates** the
journey, it never reshuffles it.

---

## 3. Lexicon & boundaries

`subject: customer` · `subjectArtefact: One customer's order` · `org: brand`.
`boundaryLabels`: candidate → "The customer", agency → "Your brand", **third-party → "Marketplaces
& platforms"**, public → "Publicly visible". A marketplace is modelled as `third-party` because it
is a separate controller the brand can read from but cannot administer or delete from — the
"responsibility boundary" the pasted spec asks to make visible (§10, §11).

---

## 4. Journey stages (10)

discovery · browsing · checkout · payment · fulfilment · delivery · support · returns · marketing ·
retention. Each carries a `summary` and a plain-English `dpdpaNote`.

---

## 5. Data categories (15)

Provided: identity, contact, address-delivery, order-transaction, payment-financial,
device-tracking, marketing-preference, support-grievance, returns-evidence, loyalty-rewards,
**gift-recipient-data**, **health-wellness**.
Derived: **browsing-behaviour**, **customer-profile**, **fraud-risk-flag**.

The pasted spec's `customisation` (§12.3) folds into `order-transaction` examples (engraving text,
uploaded design file); its children's-data edge case (§12.2) is out of scope for this sector's
reference model and is covered by the schools/training maps.

---

## 6. Hotspots — 8, ranked worst-first

| # | Node | Title | Bucket |
|---|---|---|---|
| 1 | `ad-audience-platforms` | Your customer list becomes an advertising audience | `tracking_adtech` |
| 2 | `consent-capture` | Marketing permission is bundled into the order | `marketing_consent` |
| 3 | `whatsapp-support` | Customer records scatter into personal WhatsApp | `customer_data_collection` |
| 4 | `order-export-sheet` | Order exports become a permanent second database | `vendor_fulfilment` |
| 5 | `courier-network` | Couriers and delivery agents keep name, number and address | `vendor_fulfilment` |
| 6 | `tracking-pixels` | Tracking starts before the visitor has any choice | `tracking_adtech` |
| 7 | `returns-evidence` | Return photos and risk labels build a second profile | `customer_data_collection` |
| 8 | `archive-backup` | Deleting the account does not reach the copies | `retention_preferences` |

All 5 assessment buckets are reachable. **All 8 nodes are ungated and land on 8 distinct primary
stages** (marketing, checkout, support, fulfilment, delivery, discovery, returns, retention), so
the journey's red flags equal the "places control breaks" counter — **8 = 8 in all three models**,
verified by script. This is the constraint the schema does not enforce (handoff §1) and that CA and
recruitment still fail.

The pasted spec asks for 9 / 8 / 10 hotspots per variant; the schema caps a pack at **8** and
hotspots are pack-level, not per-model. Deviation recorded in §12.

---

## 7. Sector edge cases carried into the content

| Pasted spec | How it ships |
|---|---|
| §12.1 health & wellness | `health-wellness` category on `recommendation-engine`, `store-clienteling`, `whatsapp-support`, `public-reviews-social`; framed as "high-impact health data", never GDPR-tier "sensitive" |
| §12.3 customised products | examples on `order-transaction` |
| §12.4 gift orders | `gift-recipient` **node + persona**, its own data category, and two edges — a principal who never saw a notice |
| §12.5 cash on delivery | `payment-financial` on the fulfilment/delivery chain + `fraud-screening` / `fraud-risk-flag` (RTO labels) |
| §10.10 marketplace → direct | `channel-migration` node, `critical`, with its own edges |
| §11.3 identity resolution | `cdp-identity-resolution`, `critical`, omnichannel-only |

---

## 8. Reference-model summary (computed, never hand-typed)

`computePackSummary()` / `filterByBusinessModel()`, per model:

| | website (default) | marketplace | omnichannel |
|---|---|---|---|
| Stages | 10 | 10 | 10 |
| Systems (places) | 31 | 27 | 41 |
| External parties | 18 | 15 | 23 |
| External transfers | 26 | 31 | 48 |
| Copy events | 40 | 35 | 61 |
| Critical-risk systems | 3 | 4 | 5 |
| High-risk systems | 18 | 12 | 21 |
| Unmanaged (shadow IT) | 4 | 4 | 4 |
| Control-break flags = counter | 8 = 8 | 8 = 8 | 8 = 8 |

Shape holds as the pasted spec intends — marketplace < website < omnichannel. Absolute counts run
above its "approximately" targets (§9.1, §10.1, §11.1), which it states are design guidance only
and to be computed from the dataset.

---

## 9. Presentation copy

`presentation` block carries the pasted spec's own headline and promise:
H1 **"One customer. Many systems. One brand's responsibility."**, its intro, its meta/OG strings,
its reference-model disclaimer, and three `howToRead` cards. Verbatim where the pasted spec's
wording was already right.

---

## 10. Wiring

1. `lib/data/data-flow/index.ts` — one line in `PACKS` (surfaces `/data-mapping`, footer, sitemap)
2. `lib/data-flow/data-flow.test.ts` — one line in `PACKS` (inherits 7 universal guarantees)
3. `app/industries/d2c-brands/page.tsx` — `<DataFlowPreview>` above "How the 3-minute scan works"
4. `app/assessment/d2c-brands/` — `BUCKET_FOCUS` + `<Suspense>` for the `?bucket=` deep link

Route, components, schema: untouched.

---

## 11. Files

New: `lib/data/data-flow/d2c-brands/{stages,data-categories,personas,nodes,edges,hotspots,index}.ts`
Modified: the four wiring points above, plus the shared-view fixes in §13.

---

## 12. Explicitly NOT building (rejecting the pasted spec's over-build)

| Pasted spec asks for | Verdict | Why |
|---|---|---|
| ~27 new UI components (§25) | ❌ | Shared components already render every pack |
| New graph node/edge model (§19) | ❌ | `flowNode`/`flowEdge` + BoundaryLaneMap already do this |
| Fresh variant selector + URL state (§7.3) | ❌ | `businessModels` + `filterByBusinessModel` exist and are tested |
| 13-metric panel (§20) | ❌ | `computePackSummary` + the journey counters already compute from data |
| Customer-rights simulator (§7.9, §22) | ❌ **backlog** | Genuinely new capability — belongs in the shared engine for all 12, not on one sector |
| 15-filter graph + table fallback (§24) | ❌ **backlog** | Same reason; today's risk filter + wire modes + lane board cover the need |
| Separate dataset per variant (§16) | ❌ | One pack; entities gated by `businessModels` |
| New validation module + test suite (§35–36) | ❌ | `validatePack` covers the listed checks; registration inherits the suite |
| `d2c_flow_*` analytics events (§34) | ❌ | Shared `trackEvent.dataFlow` events already fire with `industry`/`model`/`node_id` |
| 9 / 8 / 10 hotspots per variant (§9.12, §10.12, §11.12) | ⚠️ **8, pack-level** | Schema band is 5–8 and hotspots are pack-level; the 8 chosen hold in all three models |
| Tertiary "Generate your D2C privacy notice" CTA (§7.10) | ❌ | CTA band is shared; a per-sector third button would fork the view |
| Lighthouse / a11y / responsive targets (§27–28, §37) | ✅ inherited | Shared route already meets them; no new work |
| Rich content (stages, systems, external parties, hotspots, edge cases) | ✅ **use it** | This is the pasted spec's real value — mined into the pack |

**Net:** the pasted spec's *what* ships in full; its *how* is discarded because the codebase
already provides a better one.

---

## 13. Shared-view fixes made in this build (uniform, all 4 maps)

Three defects surfaced by adding a fourth map. Each is pack-driven, so every map gets the fix:

1. `DataFlowClient` hard-coded **"The seven places recruitment agencies most often lose track of
   candidate data"** — printed recruitment's words and a wrong count on CA, TI and D2C. Now
   `{pack.hotspots.length}` + `{pack.lexicon.subject}`.
2. `DataFlowClient` journey `aria-label` was hard-coded `"Candidate data journey"` → `pack.mainActor`.
3. `/data-mapping` card stats called `filterByBusinessModel(pack, "permanent")` — recruitment's
   model id — so **every other sector's card silently dropped its model-gated systems**. Now
   `pack.businessModels[0].id`. A "N operating models" chip and a "Shown for <default>" clause were
   added for packs with more than one journey, so the headline numbers read as the default model.

---

## 14. Known debt (not introduced here)

`ca-firms` and `recruitment-agencies` both still show **5 control-break flags against a counter of
7** — their hotspot nodes collide on shared primary stages (handoff §1). D2C reconciles at 8 = 8 in
all three models. Fix the older two when their content is next touched.
