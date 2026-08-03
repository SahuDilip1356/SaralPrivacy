# SaralPrivacy — Gyms, Salons & Spas Personal Data Flow Map

**Map #12 of 12 — the last in the series.** Route: `/industries/gyms-salons-spas/data-flow`.
Pack: `webapp/lib/data/data-flow/gyms-salons-spas/`. Built 2026-08-03 on
`feat/data-flow-gyms-salons-spas`, against the framework contract in
`SaralPrivacy_DataFlow_Framework_Spec.md`. A large external spec was pasted in;
this document records how it was used and what was deliberately not built (§7).

## 1. Architecture decision — content-only, decided FROM the spec

The pasted spec answered its own architecture question, as it has on maps
#8–#11:

- its **§2**: "Reuse the shared data-flow engine. … Do not create a separate
  Gyms / Salons / Spas UI framework."
- its **§27**: "Use one shared component engine. Do not create separate UI
  trees for each variant."
- its **§40**: "Do not create an isolated hard-coded page. Create one reusable
  data-flow interface with three complete journeys."

Per the framework's §9 that IS the answer: **content-only build**. One new pack
folder, two one-line registrations, two small wiring edits. No route, component
or schema file is touched. The spec's bespoke component tree, models and
per-sector analytics are rejected in §7 below.

## 2. Three operating models — genuinely different journeys

Dilip named the split himself (chat, 2026-08-03), and the pasted spec's §6
matches: **`gym` / `salon` / `spa`**, in that order, gym default. The default
drives the `/data-mapping` card stats and matches the `gyms-fitness` Discovery
niche.

- **gym** — membership contract, health declaration, fitness assessment on a
  body-composition machine, a fingerprint at the turnstile, a trainer,
  wearables and progress tracking, a members' community group, renewals.
- **salon** — appointment and walk-in, hair/skin consultation with allergies
  and patch tests, colour formulas, home services and freelancers, the bridal
  shoot, before-and-after posts. No turnstile, no wearables.
- **spa** — appointment and package, health and contraindication intake,
  therapist allocation, lockers and CCTV, hotel and corporate partners,
  external wellness referrals. Discretion is the product.

**There is no superset, and one was not manufactured** (map #8's rule). A gym
does not send a stylist to a bride's home; a salon has no biometric turnstile;
a spa runs no challenge leaderboard. The three models meet only through the
shared core: there are deliberately no gym-only-to-salon-only edges.

## 3. The sector's shape

The handoff offered two candidates; both are built, ranked 1 and 2.

**Rank 1 (Candidate A): this is the only business in the series that
PHOTOGRAPHS THE CUSTOMER'S BODY AND THEN PUBLISHES IT AS MARKETING.** Schools
publish children's faces (map #6). This sector goes further: the
before-and-after, the progress photo, the bridal portfolio — a partly-clothed
adult body, mid-transformation — is the sector's best-performing content, and
consent for it is a verbal yes to whoever held the phone. Hence
`photo-media-library` carries the rank-1 hotspot, and `public` is an unusually
load-bearing boundary ("Instagram, website & public reviews").

**Rank 2 (Candidate B): the staff member IS the system, and they leave with
it.** The trainer, stylist and therapist are the relationship; the customer's
number, notes and photos live in their personal phone and notebook, and the
client base walks out with them as a matter of routine. Hence
`staff-personal-phone` at rank 2, spanning six stages, and `ra-staff-departs`
as the archive stage's sharpest edge.

Corroboration from the assessment pack: `photos_marketing_whatsapp` and
`health_body_consultation_data` are two of only five scoring buckets.

## 4. Stage spine — model-gated, counts DERIVED

Union of **14 stages**, model-gated to **12 / 11 / 12** (gym / salon / spa).
The pasted spec asked for 10 stages per variant; per-model counts are derived
from one shared union array and cannot be set independently (established on
maps #8–#11).

Gated stages: `access-attendance` (gym+spa), `home-freelance` (salon),
`training-progress` (gym), `partner-referral` (spa). The other ten are
all-model.

Sequence orderings that are deliberate (order is load-bearing — map #10):
`health-declaration` (3) before `assessment-consultation` (4);
`home-freelance` (8) directly after `service-delivery` (7);
`photo-media` (10) after `training-progress` (9) — the before-and-after needs
an "after".

One merge: the spec's per-variant "trainer assignment" / "service planning &
formula" / "consultation & therapist allocation" stages are ONE all-model
`service-planning` stage; the systems on it differ per model, which is what
gating is for.

## 5. Hotspots — eight, derived, one per distinct all-model stage

Every hotspot node is ungated and its earliest stage is a distinct all-model
stage (framework §2 construction; guard test (a) asserts it):

| Rank | Node | Earliest stage | Bucket |
|---|---|---|---|
| 1 | `photo-media-library` | `photo-media` (10) | photos_marketing_whatsapp |
| 2 | `staff-personal-phone` | `enquiry-booking` (1) | app_staff_vendor_access |
| 3 | `health-declaration-forms` | `health-declaration` (3) | health_body_consultation_data |
| 4 | `body-assessment-records` | `assessment-consultation` (4) | health_body_consultation_data |
| 5 | `staff-whatsapp-group` | `service-planning` (5) | app_staff_vendor_access |
| 6 | `service-history-register` | `service-delivery` (7) | customer_membership_data |
| 7 | `whatsapp-broadcast` | `marketing-loyalty` (13) | photos_marketing_whatsapp |
| 8 | `old-customer-archive` | `renewal-exit-archive` (14) | retention_rights_incident |

All five assessment buckets are used. Two traps recorded in nodes.ts: the
staff GROUP must not acquire `enquiry-booking` (the 1:1 inbox and the personal
phone own that stage), and `whatsapp-broadcast` must not either — same app,
different artefact.

The pasted spec's §9.12/§10.12/§11.12 per-variant hotspot sets (10/10/10) are
impossible under the pack-level counter; all 30 items are authored as hotspots
or high/critical nodes with `riskWhy`/`riskAction`.

Verified numbers (first §5-script run, clean): validatePack CLEAN; flags=8 =
counter in all three models; 59 nodes / 103 edges / 14 categories / 16
personas; rights 8/7/7 and incidents 9/7/8 per model; risk ratio 6 critical +
24 high of 59 = **51% red** (band: hotels 45%, fintech 54%).

## 6. Wiring — the four touch points outside the pack

1. `webapp/lib/data/data-flow/index.ts` — registry line (surfaces
   /data-mapping card, footer, sitemap).
2. `webapp/lib/data-flow/data-flow.test.ts` — PACKS entry → 96 tests.
3. `webapp/app/industries/gyms-salons-spas/page.tsx` — `DataFlowPreview`
   inserted above "How the 3-minute scan works".
4. `webapp/app/assessment/gyms-salons-spas/` — `<Suspense>` in page.tsx,
   `useSearchParams` + `BUCKET_FOCUS` (all five keys) + teal focus banner in
   the client. Was missing all three (verified 2026-08-03); guard test (b) now
   enforces it.

## 7. What this build deliberately does NOT do

The pasted spec proposes a bespoke per-industry engine. Rejected per the
presentation-unified law; recorded here item by item:

| Spec ask | Not built because |
|---|---|
| `FitnessBeautyWellnessFlowPage` + ~40 named components (§27) | The shared engine renders every map; a per-sector tree is the exact defect the framework exists to prevent. |
| Bespoke TS models (`FitnessBeautyWellnessFlowSystem` etc., §14–§20) | `lib/data-flow/schemas.ts` already expresses systems, stages, edges, hotspots, scenarios; content fits it without extension. |
| 60+ data categories (§8) | Past ~16 the legend stops communicating. 14 shipped; fine distinctions live in `examples`. |
| 10 stages per variant (§9–§11) | Per-model counts are derived from the union: honest answer 12/11/12. |
| 10 hotspots per variant (§9.12/§10.12/§11.12) | Counter is pack-level, schema band 5–8. Eight hotspots; the rest are risk-carrying nodes. |
| Per-variant calculated-metrics interface (§20–§21) | `computePackSummary` + the journey's cumulative counter already compute these. |
| Graph filter matrices — recipient / photo-location / staff-device / rights-coverage views (§7.7, §26) | Seventh spec to ask; still a shared-engine backlog item, never a per-sector build. With the series complete this is the natural next data-flow cycle, if Dilip wants it. |
| `MediaConsentRecord` consent engine + per-channel removal tracker (§23) | The map is a reference model, not a consent-management system. The consent story is told in hotspot 1, the photo rights scenarios and the photo-consent examples of `photos-videos`. |
| Sector analytics events (`fitness_beauty_flow_*`, §35) | The shared route already instruments data-flow pages uniformly; per-sector event names would fragment the funnel. |
| FAQ schema, speakable, per-page SEO machinery (§34) | The shared route emits the standard metadata from `pack.presentation`; nothing per-sector. |
| Lighthouse 90+/95+ and WCAG 2.2 AA claims (§29–§30, §38) | Never measured on any map (framework §10); not claimed here either. |
| "Wearables/AI assessment devices" as a workflow engine (§12.10) | Described as nodes and risks, not built as features. |

Nothing else from the spec was silently dropped: its stage/system/risk
inventory is mined into the pack's nodes, edges, hotspots and scenarios.

## 8. Language locks

- **"High-impact health, body and image data"** — never "sensitive personal
  data"; the DPDPA creates no such statutory category.
- **No medical, fitness, dietary, dermatological, cosmetic or therapeutic
  advice.** The map names what is HELD, never what should be done to a body.
- **No shop-and-establishment / licensing / trade-regulatory advice.** A
  record another law requires is only ever a "required record".
- **Biometrics: describe, do not prescribe.** The map says what a template is
  and what deletion means; it never advises whether to use biometric access.
- **No accusation.** Progress photos, WhatsApp booking, personal phones and
  franchise CRMs are how this trade works. This lock matters more here than
  anywhere except pharmacies — these are small owner-run businesses.
- **Photo consent is the sharpest point in the pack — handled without
  moralising.**

## 9. Known limitations — stated, not hidden

- **Salon CCTV is not modelled.** CCTV/`access-attendance` is gated gym+spa;
  many salons do run cameras, but the salon journey has no access stage and a
  spanning CCTV node would have rendered stageless there. Recorded as the
  pack's one deliberate under-model.
- **`chain-franchise` is a node, not a model.** The handoff's Gate-0 third
  candidate (multi-branch/franchise) is orthogonal to the gym/salon/spa split
  Dilip chose; it is carried by `franchise-dashboard` + `franchise-staff`
  across all three models instead.
- **Home services beyond the salon** (beauty-at-home platforms, home PT) are
  not modelled; `beauty-at-home` is its own Discovery niche and arguably its
  own future map shape.
- **Salon model shows 11 stages** — one fewer than gym/spa. Honest derivation,
  not an error.
- Lighthouse / axe / 320–1440 responsive sweeps: never measured on any map in
  the series; unchanged here.
- No domain review by a practising gym/salon/spa operator yet — true of every
  pack in the series.
