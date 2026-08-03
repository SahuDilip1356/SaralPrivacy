# SaralPrivacy — Pharmacies & Online Pharmacies Personal Data Flow Map (Map #10)

**Status:** ✅ **LIVE on production** — `main` `a041fa8`, 2026-08-02. Signed off on
preview, fast-forward merged, verified on the live domain. Branch deleted.
**Route:** `/industries/pharmacies/data-flow`
**Contract:** `docs/SaralPrivacy_DataFlow_Framework_Spec.md`
**Pack:** `webapp/lib/data/data-flow/pharmacies/`

Tenth map in the series, after recruitment, CA firms, training institutes, D2C
brands, clinics & diagnostic labs, schools & colleges, law firms, real estate and
hotels & travel. Same presentation framework; only content differs.

---

## 0. The architecture decision — answered by the pasted spec itself

The pasted spec proposed a bespoke per-industry engine: ~35 new components, its
own graph model, its own validation layer, its own metrics interface, its own
analytics events. That would violate the **presentation-unified law** and
duplicate what the shared engine already does.

It also **answered its own architecture question**, three times, in its own
numbered sections:

| Section | What it says |
|---|---|
| §2 | "Reuse the shared data-flow engine… Do not build a pharmacy-only UI framework." |
| §26 | "Use one shared component engine. Do not create separate UI trees for each variant." |
| §39 | "Do not create an isolated hard-coded page. Create one reusable data-flow interface…" |

Per the handoff's §9, **that IS the answer** — recorded and acted on rather than
put to Dilip a third time (maps #8 and #9 did the same). This is a
**content-only** build: a new pack folder plus two one-line registrations. No
route, component or schema file was touched by the map itself.

The two files edited outside the pack are the industry landing page (adding the
shared `DataFlowPreview`) and the assessment client (adding the `?bucket=`
deep-link the guard test requires) — the same two edits every map makes.

---

## 1. The sector's shape

Every map in this series names its sector's signature before writing stages.

> **A pharmacy is the only business in this series where the PRODUCT ITSELF
> discloses the diagnosis.**

Everywhere else, a business holds records *about* a person and the risk is that
the record escapes. Here the record and the product are the same object: the
molecule is printed on the strip, the patient's name and the drug are on the
dispensing label, the invoice itemises it, the rider's app shows it, and the
refill reminder repeats it on a phone somebody else may be holding. **A person
can be outed by a parcel left with a neighbour.** No other sector in this series
can disclose a condition simply by delivering to someone.

That is why **rank-1 hotspot sits on `delivery`**, not on a storage system.

The second half of the signature, carried by rank 2:

> **The refill loop makes a chronic condition inferable without anyone ever
> recording a diagnosis.**

Nobody at the counter writes down a condition. A ninety-day cadence on one
molecule states it anyway — and that inference is what gets uploaded to an ad
platform as an audience. Hence `health-inference` as a `derived` category and
`refill-marketing` as an all-model stage rather than an e-pharmacy footnote.

---

## 2. Operating models — three genuine journeys

Gate 0 was answered by the pasted spec (§6, §7.3), which names three operating
models and their query keys. They are genuinely different processes, not one
journey with different systems:

| id | Label | What makes it structurally different |
|---|---|---|
| `retail` *(default)* | Independent retail pharmacy | Customer is present. Prescription is paper or a WhatsApp photo. Record is a billing entry and a khata ledger. Delivery is someone's cousin. Informal and uncontracted throughout. |
| `online` | Online / e-pharmacy | Customer is never seen. A **browsing trail creates a health inference before any order exists**. Prescription goes through upload and text extraction. A warehouse and a logistics aggregator handle a parcel with a condition on the label. |
| `chain-hospital` | Pharmacy chain / hospital-linked | A **central patient index joins** the hospital encounter, the retail purchase, the loyalty card and the insurance claim into one profile, visible across outlets and to analytics teams who never met the person. |

`retail` is the default — it is what most Indian pharmacies searching this
actually run, and `businessModels[0]` drives the `/data-mapping` card stats.

### ⚠️ There is NO superset, and one was not manufactured

Map #8 established that a superset is a **convention, not a schema rule**
(`validatePack`'s only model rule is that an edge's models be a subset of both
endpoints'). `chain-hospital` is **not** a superset of `online`:

* a hospital-linked chain has no browsing-inference trail, no
  upload-and-extraction pipeline, and no app account with household profiles;
* an e-pharmacy has no central patient index, no TPA claim workflow, and no
  counter register.

Each variant-specific entity therefore tags itself with exactly the models it
honestly appears in. Inventing a fourth "integrated" model to have a superset
was explicitly declined, per the handoff's §3.

### Stage spine: model-gated, DERIVED

**17 stages in the union, gated 11 / 13 / 15.** Ten are all-model.

The pasted spec asked for **10 stages in each of the three variants**. Per-model
counts are DERIVED from one shared union array filtered by model and cannot be
set independently — this is now the third map in a row where the spec's
per-variant target was a wish rather than a spec (#8 asked 10/10/10 → 10/13/14;
#9 asked 10/10/10 → 11/14/16). The honest answer here is **11 / 13 / 15**.

**⚠️ `stock-transfer` must stay sequenced BEFORE `dispensing`.** Stock is
allocated and moved before it is picked, labelled and packed — which is both the
honest order and load-bearing. The warehouse system and the pick list span both
stages, and a node resolves to the *earliest* of its stages visible in the model.
With `dispensing` first, both resolved onto it and `stock-transfer` rendered with
**no system at all** in the online model. The §5 verification script caught this
during the build; the ordering is the fix.

---

## 3. The hotspot count is DERIVED, not chosen

The pasted spec proposed **9 + 11 + 12 per-variant hotspots** (§9.12, §10.12,
§11.12). The counter and legend print `pack.hotspots.length` — pack-level and
never filtered — so a per-model set would make the counter lie in every view but
one. **A per-model hotspot set is structurally impossible in this engine.**

Ten of the seventeen stages are all-model; eight carry a hotspot, and every
hotspot node is **ungated** with its **earliest stage a distinct all-model
stage**:

| Rank | Node | Earliest all-model stage |
|---|---|---|
| 1 | `dispensed-package-label` | `delivery` (12) |
| 2 | `customer-medicine-history` | `customer-record` (7) |
| 3 | `prescription-image-store` | `prescription-intake` (5) |
| 4 | `staff-phone-whatsapp` | `enquiry` (2) |
| 5 | `refill-marketing-platform` | `refill-marketing` (14) |
| 6 | `pharmacist-review-record` | `pharmacist-review` (6) |
| 7 | `pharmacy-archive` | `archive` (17) |
| 8 | `complaint-adverse-event-file` | `complaints` (16) |

⇒ **flags = 8 = counter in all three models, by arithmetic** rather than by
anyone checking. Enforced by the `hotspots reconcile with the counter` guard
test.

Two traps specific to this pack, documented in `nodes.ts`:

* `staff-phone-whatsapp` must **not** list `digital-discovery` (sequence 1,
  online-only) — that would move its flag off `enquiry` in the online model
  alone, breaking reconciliation in exactly one of three views.
* `prescription-image-store` must **not** list `enquiry`. The photo really does
  arrive in the chat thread first (that is what `staff-phone-whatsapp` is for);
  the image *store* is where it lands at `prescription-intake`. Giving the store
  an `enquiry` stage would collide the two flags.

The other twenty-four risks the spec listed are authored as **high- and
critical-risk nodes** instead. They render in full in the journey, the drawer and
the table; they simply carry no red flag.

All **five** assessment buckets are reachable from the rail.

---

## 4. Content model

| | Value |
|---|---|
| Stages | 17 union · gated 11 / 13 / 15 |
| Nodes | 70 |
| Edges | 159 |
| Data categories | 16 (spec proposed 48) |
| Personas | 20 |
| Hotspots | 8 |
| Rights scenarios | 8 (7 visible per model) |
| Incident scenarios | 9 (6 / 7 / 8 per model) |

**Categories folded to 16.** The spec's 48 ids are all covered; past ~16 the
legend stops communicating and every node renders a wall of tags, so fine
distinctions (government identifiers, age and gender, dosage instructions, call
recordings, loyalty membership, fraud and authentication records, return and
refund files) live in `examples` instead.

Four categories do this sector's distinctive work: `medicine-history` (the
purchase list that *is* the condition), `health-inference` (`derived` — the half
nobody counts as personal data), `prescription-image` (deliberately separate from
the structured `prescription` record — a different problem with a different fix),
and `controlled-medicine` (the one category that is a **required record**).

---

## 5. Language locks ⛔

The tightest in the series so far.

* **"High-impact prescription and health-related data"**, never "sensitive
  personal data" — the DPDPA creates no such statutory category. The pasted spec
  makes the same point in its §8; it is held throughout.
* **NO medical, pharmacological, dosage, substitution or drug-interaction
  advice.** Not one word. Where a walkthrough step touches a clinical judgement
  it says "the pharmacist decides", never what the decision should be.
* **NO advice on drug-licensing, schedule-register or pharmacy-regulatory
  obligations.** Where a record must be maintained under other law, the map says
  only that it is a **REQUIRED RECORD** and therefore not freely deletable —
  never what must be kept, or for how long.
* **Retention is NOT uniformly deletable**, and this is sharper here than
  anywhere else in the series. `rs-delete-order-history` and
  `rs-erase-but-register` exist specifically to separate what must be **KEPT**
  from what has merely never been **DELETED**. That distinction is the whole
  value of the section.
* **NO accusation.** WhatsApp orders, a photographed prescription, a khata ledger
  and a delivery boy are how this trade works. The map shows where control
  breaks; it does not tell a chemist their trade is a violation.

---

## 6. The two walkthrough sections

Shared, opt-in engine sections driven entirely by pack content — the engine's
answer to the spec's §22 customer-rights simulator and §23 incident simulator.
Together they cover all ten request types and all eleven incident scenarios the
spec lists.

`blockedNodeIds` is the honest half, and it carries unusual weight here. **Five
things a real pharmacy genuinely cannot reach:** the prescriber's own records, a
marketplace or aggregator platform's copy, the delivery partner's manifest, an
insurer's or administrator's claim file, and anything in a register it is
required to maintain.

---

## 7. Verified inputs (checked against source, 2026-08-02)

| Field | Value |
|---|---|
| Sector slug | `pharmacies` |
| `assessmentRoute` | `/assessment/pharmacies` |
| Assessment client | `PharmaciesAssessmentClient.tsx` (plural) |
| `discoveryNicheId` | `chemist` — matches the default `retail` model |
| Buckets | `customer_prescription_data`, `health_indicator_medicine_history`, `order_delivery_vendor_sharing`, `system_staff_access`, `retention_refill_incident` |

`<Suspense>`, `useSearchParams` and `BUCKET_FOCUS` were **all three missing** on
the pharmacies assessment and were added (§4 Step D) — the fourth sector running
where this was the case.

---

## 8. What this build deliberately does NOT do

| Spec asked for | Why not |
|---|---|
| ~35 pharmacy-specific components (§26) | Violates the presentation-unified law. The shared engine renders all of it. |
| `PharmacyFlowSystem` / `PharmacyFlowStage` / `PharmacyFlowNode` etc. (§14–19) | The shared schema already models every field that a view renders. A parallel type tree would fork the engine. |
| Per-variant hotspot sets: 9 / 11 / 12 (§9.12, §10.12, §11.12) | Structurally impossible — the counter is pack-level and unfiltered. Authored as risk-levelled nodes instead. |
| Exactly 10 stages per variant (§9.1, §10.1, §11.1) | Per-model counts are DERIVED from one union array. Honest answer: 11 / 13 / 15. |
| 48 data categories (§8) | Folded to 16; every id is covered in `examples`. Past ~16 the legend stops communicating. |
| Recipient / prescription-location / health-inference matrices (§7.7, §25) | Genuinely unbuilt. Belongs in the **shared** engine as an optional pack-driven capability, never a per-sector tree. **Four specs have now asked for this.** |
| Per-facet graph filters — 28 of them (§25) | Same. Shared-engine backlog. |
| 17 bespoke analytics events (§34) | The shared events already fire for every map. A per-sector event namespace would fragment reporting across ten maps. |
| Lighthouse 90+ / a11y 95+ targets (§37) | **Not measured, and not claimed.** See §9. |

Nothing was silently dropped: every item above is either covered by the shared
engine or listed here with a reason.

---

## 9. Known limitations — stated, not hidden

1. **No Lighthouse, axe or responsive measurement.** Never run on any of the ten
   maps. The spec asks for 90+/95+/95+/95+; this build does not claim it.
2. **`green-500` CTA contrast measures 2.54:1** against a 4.5:1 bar — a known
   sitewide issue on all ten data-flow pages, not introduced here.
3. **No domain review.** No pack in this series has been read by a practising
   professional in its sector. **This matters more for pharmacies than for any
   sector so far** — a pharmacist should read this before it is promoted widely.
4. **`training-institutes` hotspot debt** remains fenced in `KNOWN_HOTSPOT_DEBT`
   (5 flags vs 7 on two models). Unrelated to this map, still the last thing
   blocking a universal Tier-1 test.

---

## 10. Verification run

```
===== pharmacies =====
  validatePack: CLEAN
  pack: hotspots=8 stages=17 nodes=70 edges=159 cats=16 personas=20 rights=8 inc=9
  retail         stages=11 systems=32 extParties= 9 extTransfers=19 copies= 70 | visibleHotspots=8 flags=8 counter=8 OK
  online         stages=13 systems=44 extParties=22 extTransfers=45 copies= 83 | visibleHotspots=8 flags=8 counter=8 OK
  chain-hospital stages=15 systems=49 extParties=20 extTransfers=45 copies=107 | visibleHotspots=8 flags=8 counter=8 OK
```

No `!!` lines: every stage has a system and an edge in every model that shows it,
and every scenario's nodes resolve in every model it is gated to.

* **Tests:** 82/82 pass (75 + 7 per-pack), including both guard tests.
* **Build:** compiled successfully in 3.7s. Lint clean.
* **Prerender:** 455 KB of static HTML carrying the H1, all three model labels
  and all eight hotspot titles — the journey is in the indexed page, not behind
  a Suspense boundary.
* **Leak check:** `Candidate`, `Your agency`, `Your brand`, `Your institution`,
  `Your firm`, `Your business`, `The guest`, `The patient`, `Student`,
  `The client` — all 0.
* **Regression:** all ten maps prerender, each with its own H1 noun.
