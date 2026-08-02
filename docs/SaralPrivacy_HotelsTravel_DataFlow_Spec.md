# SaralPrivacy — Hotels, Hospitality & Travel Personal Data Flow Map (Map #9)

**Route:** `/industries/hotels-travel/data-flow`
**Branch:** `feat/data-flow-hotels-travel`
**Status:** ⏸ **Built, awaiting Dilip's preview sign-off.** Not merged, not on prod.
**Contract:** `docs/SaralPrivacy_DataFlow_Framework_Spec.md`
**Closest siblings to read first:** `real-estate` (three models, derived hotspot count,
no forced tidiness), `law-firms` (built to the guard tests by construction).

---

## 0. The architecture decision — answered by the pasted spec itself

The standing question on every pasted spec since map #6 is: **content-only pack, or content
plus shared-engine additions?** Map #8 established that the pasted spec often answers this
itself, and should be read for that before asking.

**This one does, twice, unambiguously:**

| Where | What it says |
|---|---|
| §2 | "Reuse the shared data-flow engine. Extend common models only where hospitality and travel functionality requires it. **Do not create an isolated hospitality-only page framework.**" |
| §26 | "**Use one shared component engine. Do not create separate UI trees for each variant.**" |
| §39 | "Do not create an isolated hard-coded page. Create one reusable data-flow interface with three complete journeys." |

**Decision: content-only pack.** Nothing in `lib/data-flow/`, `components/data-flow/` or
`app/industries/[sector]/data-flow/` was edited. Every capability the spec asks for beyond
content already exists in the engine (see §8 below).

This is the fourth "content-only" in five maps, but it was **derived from the spec's own
words, not assumed** — the standing answer alternates and must be checked each time.

---

## 1. The sector's shape

> **A hospitality or travel guest is the only subject in this series whose physical presence
> is the product.**

Every other map holds records *about* a person. Here the business knows where the person is
sleeping tonight, who is in the room with them, when their house is empty, what they ate,
what they are allergic to, and which door they opened at 2am — and hands parts of that to an
airline, a transfer driver, a guide, a network of small vendors and, for a foreign national,
to the state.

Two further things no other vertical in this series has:

1. **The business is often NOT the first collector.** A large share of guests are captured by
   an OTA, under a notice the business did not write, and only then copied inward. A
   recruiter, a clinic and a law firm all meet the data principal first.
2. **A government identity document moves as a routine condition of service** — from every
   customer, at scale, usually over WhatsApp. That is hotspot #1.

| | Recruitment | CA | TI | D2C | Clinics | Schools | Law | Real Estate | **Hotels & Travel** |
|---|---|---|---|---|---|---|---|---|---|
| Actor | Candidate | Client | Student | Customer | Patient | Student | Client | Client | **Guest (+companions)** |
| Shape | Pipeline | Yearly loop | Lifecycle | Endless funnel | Record outliving the visit | Record by proxy | Public by design | Deal ends, database doesn't | **The body in space** |
| Journeys | 2 | 1 | 3 | 3 | 3 | 3 | 3 | 3 | **3** |
| Spine | gated 10/12 | — | shared | shared | gated 10/12/14 | gated 12/13/15 | gated 13/13/16 | gated 10/13/14 | **gated 11/14/16** |
| Stages/nodes/edges | 12/31/49 | 10/26/47 | 10/28/47 | 10/45/81 | 14/53/87 | 15/60/115 | — | 17/68/154 | **16/67/171** |
| Categories | 11 | 12 | 11 | 15 | 16 | 16 | — | 16 | **16** |
| Hotspots | 7 | 7 | 7 | 8 | 8 | 8 | 8 | 8 | **8** |
| Rights / incidents | 8/8 | 7/8 | 8/8 | 8/8 | 7/8 | 7/7 | — | 8/8 | **8/8** |
| Flags = counter | ✅ | ✅ | ❌ 2 of 3 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ **by construction** |

---

## 2. Operating models — three genuine journeys

| Model | Label | What makes it a different journey |
|---|---|---|
| `hotel` **(default)** | Hotel / resort | Owns the property and the physical stay. Registers the guest against an identity document, issues a key, generates access, Wi-Fi, CCTV and service records on premises it controls. |
| `travel-agency` | Travel agency / tour operator | Never owns a bed. Assembles somebody else's inventory, distributing the passport and itinerary across airlines, GDS, hotels, wholesalers, visa consultants, insurers and guides. Exposure is onward transfer, not on-premises monitoring. |
| `integrated` | Integrated hospitality & travel group | Runs both, plus a loyalty programme and a central profile that silently joins a hotel stay, a package, a wedding and a corporate trip into one person. |

`hotel` is the **default** — what most Indian hotels, resorts and homestays searching this
actually run — and `businessModels[0]` drives the `/data-mapping` card stats.

`integrated` **is** a genuine superset here, so the handoff's gating convention applies:
shared core entities carry no tag; each variant-specific entity tags itself with its own
model plus `integrated`. (Map #8 proved a superset is a *convention*, not a schema rule —
here one exists honestly, so it is used.)

### The stage spine — 16 in the union, gated to 11 / 14 / 16

The pasted spec asked for **10 stages in each variant**. Per-model counts are **derived** from
one shared union array filtered by model, so they cannot be set independently. The honest
answer is **11 / 14 / 16**.

Ten of the sixteen are all-model — load-bearing, see §3. Three choices worth recording:

- **`identity-documents` is all-model and separate from `check-in`.** A hotel scans a passport
  at the desk; an agency collects it weeks earlier for a visa file. Same act, different moment.
  Merging it into check-in would put the sector's rank-1 hotspot on a hotel-only stage.
- **`monitoring` is all-model.** For a hotel it is key card, Wi-Fi and CCTV; for an agency it is
  transfer GPS, a shared live location and the tour manager's position notes. Both answer *what
  record exists of where this person physically was* — and the agency half is the one everybody
  forgets.
- **`pre-arrival` is all-model.** A hotel's arrival list and a group's rooming list are the same
  document: a consolidated sheet naming several travellers, sent by email, WhatsApp and print.

---

## 3. The hotspot count is DERIVED, not chosen

The journey paints one red flag per **distinct stage** a hotspot's node resolves to; the counter
prints `pack.hotspots.length`, unfiltered. So the count must equal the number of distinct
all-model stages carrying an ungated hotspot node.

| Rank | Node | Earliest stage | Bucket |
|---|---|---|---|
| 1 | `id-document-store` | `identity-documents` (5) | `id_passport_travel_document` |
| 2 | `partner-vendor-network` | `service-delivery` (12) | `booking_ota_vendor_sharing` |
| 3 | `guest-history-archive` | `archive` (16) | `retention_marketing_incident` |
| 4 | `booking-channel-platform` | `enquiry` (1) | `booking_ota_vendor_sharing` |
| 5 | `guest-profile-system` | `reservation` (3) | `system_staff_access` |
| 6 | `movement-access-trail` | `monitoring` (11) | `system_staff_access` |
| 7 | `guest-document-pack` | `pre-arrival` (9) | `guest_traveller_data` |
| 8 | `loyalty-marketing-platform` | `loyalty-marketing` (15) | `guest_traveller_data` |

⇒ **flags = 8 = counter in all three models, by arithmetic.** All five assessment buckets are
reachable from the rail.

The pasted spec proposed **10 + 11 + 12 per-variant hotspots**. A per-model set would make the
pack-level counter lie in every view but one. The other twenty-five are authored as **high- and
critical-risk nodes** instead — they render in full in the journey, the drawer and the table;
they simply carry no red flag.

---

## 4. Content model

- **16 data categories**, not the spec's 47. Past ~16 the legend stops communicating and every
  node renders a wall of tags. Every one of the spec's 47 ids is covered, with fine distinctions
  folded into `examples`.
- **Three categories do the sector's distinctive work:** `identity-documents` (a passport is what
  the booking is built on, not "an ID proof"), `location-movement` (the only record in this series
  that says where the person physically was, hour by hour), `companion-family` (most people in a
  hospitality file never dealt with the business).
- **Derived data:** `guest-scoring` and `loyalty-marketing-profile` — a churn score, a value band,
  a "difficult guest" label and a lookalike audience are all new personal data the business created.
- **17 personas**, including `companion` and `corporate-booker`, which exist because of this sector.
- **Real software is named:** OTA extranet, channel manager, front-desk passport scanner, C-form
  report, key-card controller, Wi-Fi captive portal, GDS, bed bank, visa consultant's folder, the
  tour manager's bag of passports, the operations WhatsApp group, the lost-property cupboard.
- **Risk ratio:** 8 critical / 22 high out of 67 nodes. Most of the map is not red.

---

## 5. Language locks ⛔

- **"High-impact identity, travel and location data"**, never "sensitive personal data" — the DPDPA
  creates no such statutory category. (The pasted spec makes the same point in its §8.)
- **No immigration, visa, travel-safety, hospitality-licensing or foreign-national-reporting advice.**
  Where a record has been filed with an authority, the map says only that it is authority-controlled
  and therefore not the business's to amend or withdraw. It never says what must be filed, or when.
- **Retention is not uniformly deletable.** Tax records, a filed government report and a ticketed
  booking have genuine grounds to be kept; a passport scan from a stay two years ago does not.
  `rs-delete-my-passport-copy` and `rs-delete-cancelled-booking` exist to hold that distinction.
- **No accusation.** Taking an ID copy at the desk, briefing a guide over WhatsApp and selling
  through an OTA are how this industry works. Show where control breaks; do not call the trade a
  violation.

---

## 6. The two walkthrough sections

**8 rights scenarios** covering all ten of the spec's §22 request types, and **8 incident
scenarios** covering its §23 list.

`blockedNodeIds` carries unusual weight here. Four things a real business genuinely cannot reach,
and the walkthroughs say so:

1. the OTA's own copy of the booking,
2. a ticketed record in a carrier's or GDS system,
3. the long tail of guides, drivers and local vendors sent a list over WhatsApp,
4. a report already filed with an authority.

---

## 7. Verified inputs (checked against source, 2026-08-02)

| Field | Value |
|---|---|
| Sector slug | `hotels-travel` |
| `navLabel` | Hotels, Hospitality & Travel |
| `reportType` | `hotel` (5 chars — under the Appwrite `string(10)` cap) |
| `assessmentRoute` | `/assessment/hotels-travel` |
| Industry page | `app/industries/hotels-travel/page.tsx` — existed |
| `<Suspense>` on assessment page | ❌ was **missing** — added |
| `useSearchParams` + `BUCKET_FOCUS` in client | ❌ was **missing** — added |
| `discoveryNicheId` | `hotels-resorts` (matches the default model) |

**`assessmentBuckets`** — verified against `lib/data/industry-assessment/packs/hotels-travel.ts`:
`guest_traveller_data` · `id_passport_travel_document` · `booking_ota_vendor_sharing` ·
`system_staff_access` · `retention_marketing_incident`. All five reachable from the hotspot rail
and all five present in the client's `BUCKET_FOCUS`.

---

## 8. What this build deliberately does NOT do

Per the framework's §9 rule: the pasted spec's architecture is rejected in writing, with a reason
per item. Everything in its *content* was mined in full.

| Spec asks for | Not built — why |
|---|---|
| §14–§19 bespoke `HospitalityTravel*` TypeScript models (system, stage, control-break, hotspot, graph, node, edge) | The shared `lib/data-flow/schemas.ts` already expresses all of it. A parallel type tree would fork the engine and break "presentation unified, content varies". |
| §26's 40 `HospitalityTravel*` components | Every one maps to an existing shared component. Its own §26 says "use one shared component engine" — this follows the spec, not a deviation from it. |
| §12 ten "high-impact scenario" contextual risk panels | Delivered as rights + incident scenarios and as node-level `riskWhy`/`riskAction`, which the engine already renders. A tenth panel type would be a hospitality-only UI tree. |
| §20–§21 eighteen bespoke metric fields + a `calculateHospitalityTravelCumulativeMetrics` function | `computePackSummary` + the journey's cumulative counter already derive stages, systems, external parties, personas, copies and external transfers from the dataset. The remaining fourteen are slices of the same node flags and would be new UI, not new data. |
| §25's 29 graph filters + 8 view types (recipient matrix, document-location matrix, rights-coverage view) | Genuinely unbuilt in the shared engine. Board/Table toggle, risk filter and stage grouping exist. Recorded as a **shared-engine backlog item** for all nine maps — never a per-sector build. |
| §7.3 "avoid full-page reload", §33 preview `noindex`, §34 sixteen `hospitality_*` analytics events | Already handled generically: `?model=` is read from `window.location` (never `useSearchParams` — that strips the journey out of the indexed HTML), preview `noindex` is platform-level, and the shared route already instruments model/stage/system/hotspot/CTA events with the sector as a property. Sixteen sector-prefixed event names would fragment the funnel across nine maps. |
| §9–§11 per-variant hotspot sets (10 / 11 / 12) | The counter is pack-level and unfiltered — see §3. Authored as risk nodes instead. |
| §9–§11 target metrics ("~30 locations, ~14 parties, 29 transfers") | Metrics are dataset-derived and never hand-typed. Actuals in §9 below. |
| §35's 39-point validation list | `validatePack` + 75 tests cover every referential item. The rest are content judgements, not machine checks. |
| §37 Lighthouse 90+/95+/95+/95+ | **Not measured on any of the nine maps.** Not claimed here either — see §9. |

---

## 9. Known limitations — stated, not hidden

- **Lighthouse, axe and responsive behaviour at 320–1440 have never been measured** on any map in
  this series, including this one. The spec's §37 targets are unverified. Related and known: white
  on `green-500` measures 2.54:1 against a 4.5:1 bar, and that is the primary CTA on all nine
  data-flow pages.
- **No pack's content has been domain-reviewed** by a practising hotelier or tour operator.
- **`training-institutes` hotspot debt is still fenced** in `KNOWN_HOTSPOT_DEBT` (5 flags vs 7 on
  `classroom` and `online`). Unrelated to this map, still the last thing blocking a universal
  Tier-1 test.
- **No one view shows all sixteen stages** except `integrated` — which here is fine, because
  `integrated` is a genuine superset.

### Actual derived metrics

| Model | Stages | Systems | External parties | External transfers | Copies | Flags = counter |
|---|---|---|---|---|---|---|
| `hotel` | 11 | 44 | 24 | 57 | 109 | 8 = 8 ✅ |
| `travel-agency` | 14 | 46 | 29 | 74 | 121 | 8 = 8 ✅ |
| `integrated` | 16 | 59 | 35 | 92 | 158 | 8 = 8 ✅ |

Pack totals: 16 stages · 67 nodes · 171 edges · 16 categories · 17 personas · 8 hotspots ·
8 rights scenarios · 8 incident scenarios.

---

## 10. Verification run

- `validatePack`: **clean**, first run.
- `node --test lib/data-flow/data-flow.test.ts`: **75 / 75 pass** (68 + 7 per-pack), including both
  guard tests — *hotspots reconcile with the counter in every model of every pack* and *hotspot
  deep-links resolve: every assessment client handles `?bucket=`*.
- `next build`: **compiled successfully in 3.9s**.
- Prerendered HTML at `.next/server/app/industries/hotels-travel/data-flow.html` carries the H1,
  all three model labels and the hotspot titles — the journey is in the indexed page, not behind a
  Suspense boundary.
- Zero leaked display nouns: `Candidate`, `Your agency`, `Your brand`, `patient`,
  `Your institution`, `Student`, `Your firm`, `The client` all **0**.
- All nine maps still prerender, each H1 using its own noun.
