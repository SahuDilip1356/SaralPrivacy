// Pharmacies & Online Pharmacies Personal Data Flow pack - assembled config.
// Spec: docs/SaralPrivacy_Pharmacies_DataFlow_Spec.md.
// Same presentation framework as recruitment, CA, training institutes, D2C,
// clinics, schools, law firms, real estate and hotels & travel; only content
// differs.
//
// CONTENT-ONLY BUILD. The pasted spec answered its own architecture question in
// its §2 ("Reuse the shared data-flow engine... Do not build a pharmacy-only UI
// framework"), §26 ("Use one shared component engine. Do not create separate UI
// trees for each variant") and §39 ("Do not create an isolated hard-coded
// page"). Per the handoff's §9 that IS the answer, so it was recorded and acted
// on rather than put to Dilip a third time. No route, component or schema file
// is touched by this map.
//
// THREE operating models are genuine, different data journeys - not cosmetic
// filters (spec §6):
//   retail          - the neighbourhood chemist. The customer is in front of
//                     you, the prescription is paper or a photograph on
//                     WhatsApp, the record is a billing entry and a khata
//                     ledger, and the delivery boy is someone's cousin.
//   online          - the customer is never seen. A browsing trail creates a
//                     health inference BEFORE any order exists, the prescription
//                     goes through upload and text extraction, a warehouse and a
//                     logistics aggregator handle a parcel with a condition on
//                     the label, and a recommendation engine turns purchase
//                     history into a longitudinal health profile.
//   chain-hospital  - multi-outlet or hospital-attached. A central patient index
//                     JOINS the hospital encounter, the retail purchase, the
//                     loyalty card and the insurance claim into one profile,
//                     visible across outlets and to analytics teams who never
//                     met the person.
//
// RETAIL is the DEFAULT - it is what most Indian pharmacies searching this
// actually run, and it drives the /data-mapping card stats.
//
// ⚠️ THERE IS NO SUPERSET, AND ONE IS NOT MANUFACTURED (map #8 established that
// a superset is a convention, not a schema rule). `chain-hospital` is NOT a
// superset of `online`: a hospital-linked chain has no browsing-inference trail,
// no upload-and-extraction pipeline and no app account with household profiles,
// and an e-pharmacy has no central patient index, no TPA claim workflow and no
// counter register. Each variant-specific entity therefore tags itself with
// exactly the models it honestly appears in.
//
// The STAGE SPINE is model-gated (11 / 13 / 15). See stages.ts - the pasted spec
// asked for 10 stages in each variant, but per-model counts are DERIVED from one
// shared union array and cannot be set independently.
//
// ⛔ LANGUAGE LOCKS (spec §8) - the tightest in the series:
//   · "high-impact prescription and health-related data", never "sensitive
//     personal data" - the DPDPA creates no such statutory category
//   · NO medical, pharmacological, dosage, substitution or drug-interaction
//     advice, and none on drug-licensing or register obligations. Where a
//     record must be maintained under other law, the map says only that it is a
//     REQUIRED RECORD and therefore not freely deletable - never what must be
//     kept, or for how long
//   · retention is not uniformly deletable: separate what must be KEPT (a tax
//     record, a required register) from what has merely never been DELETED (a
//     prescription photograph from an order two years ago)
//   · no accusation. WhatsApp orders, a photographed prescription, a khata
//     ledger and a delivery boy are how this trade works.

import type { DataFlowPack } from "../../../data-flow/schemas.ts";
import { PHARMACIES_STAGES } from "./stages.ts";
import { PHARMACIES_DATA_CATEGORIES } from "./data-categories.ts";
import { PHARMACIES_PERSONAS } from "./personas.ts";
import { PHARMACIES_NODES } from "./nodes.ts";
import { PHARMACIES_EDGES } from "./edges.ts";
import { PHARMACIES_HOTSPOTS } from "./hotspots.ts";
import { PHARMACIES_INCIDENT_SCENARIOS, PHARMACIES_RIGHTS_SCENARIOS } from "./scenarios.ts";

export const pharmaciesDataFlowPack: DataFlowPack = {
  industry: "pharmacies",
  title: "Pharmacy Prescription & Customer Data Flow Map",
  // Deliberately both nouns: the person who buys and the person who takes the
  // medicine are routinely different people, and keeping them distinct is a
  // structural point this map makes repeatedly (spec §35 rule 27).
  mainActor: "Customer / patient",
  businessModels: [
    { id: "retail", label: "Independent retail pharmacy" },
    { id: "online", label: "Online / e-pharmacy" },
    { id: "chain-hospital", label: "Pharmacy chain / hospital-linked" },
  ],
  lexicon: {
    subject: "customer",
    subjectArtefact: "One customer's prescription and medicine history",
    // "pharmacy" reads correctly in "outside your ___" for a neighbourhood
    // chemist, an e-pharmacy and a hospital-linked chain alike - "shop"
    // excludes the e-pharmacy and "chain" excludes the chemist.
    org: "pharmacy",
  },
  boundaryLabels: {
    candidate: "The customer / patient",
    agency: "Your pharmacy",
    client: "Employers & corporate health programmes",
    vendor: "Software, payment & platform vendors",
    // Unusually load-bearing in this sector: the prescriber, the distributor,
    // the delivery rider and the insurer all hold or receive the customer's
    // prescription data as a condition of the trade working. None of them
    // processes it on your instructions, and none of them is your client.
    "third-party": "Doctors, distributors, delivery partners & insurers",
    government: "Drug-control & authorities",
    public: "Public reviews & open posts",
  },
  presentation: {
    eyebrow: "Pharmacies & Online Pharmacies",
    h1: "One customer. One prescription. Many systems and people.",
    intro:
      "Follow one customer's information through enquiry and order intake, prescription receipt and verification, pharmacist review, billing, insurance, dispensing and labelling, delivery, refill reminders, complaints and long-term archives - and count every place it ends up, and where you lose control of it.",
    metaTitle: "Pharmacy Prescription & Customer Data Flow Map | SaralPrivacy",
    metaDescription:
      "See how prescription and medicine-purchase data moves through pharmacists, billing, insurers, warehouses, delivery partners, refill systems and archives - and where DPDPA risk appears for a pharmacy or online pharmacy.",
    ogTitle: "Where does one pharmacy customer's data go?",
    ogDescription:
      "Follow prescription, medicine, payment, insurance, delivery and refill data across retail, online and hospital-linked pharmacy systems.",
    breadcrumbLabel: "Pharmacies & Online Pharmacies",
    previewBlurb:
      "Before you fix anything, see the problem. One prescription moves through a WhatsApp thread on somebody's own phone, a scanner's local folder, a billing record that quietly becomes a health history, a pharmacist's note, a label with the medicine printed on it, a delivery partner you do not employ, a refill reminder that lands on a shared phone - and an archive nobody has ever cleared.",
    howToRead: [
      {
        title: "Pick your model",
        body: "Switch between Independent retail pharmacy, Online / e-pharmacy and Pharmacy chain / hospital-linked to see the journey each kind of business actually runs. This is not a filter over one journey - a chemist has the customer in front of them and a prescription on paper or in a chat; an e-pharmacy never sees the customer and has already inferred something about their health from what they searched, before any order exists; a chain or hospital pharmacy joins a clinical encounter, a retail purchase, a loyalty card and an insurance claim into one central record. The stage count and the place-counter recalculate for the model you choose.",
      },
      {
        title: "When it leaves you",
        body: "A violet left edge and a tag mark everything outside your pharmacy - the marketplace or platform that took the order before you did, the text-extraction service that reads the prescription, the payment gateway, the delivery aggregator and the rider on it, the doctor and hospital whose details are on every prescription, the distributor a complaint is escalated to, the insurer or administrator settling a claim, an employer paying for an employee's medicines, and anything that becomes a public review. Once data is there your control is indirect at best. Risk is shown separately, as an amber or red fill - so an outside system can be low risk, and the phone in your own pocket can be one of the worst things on the page.",
      },
      {
        title: "Where control breaks",
        body: "Red flags mark the hotspots - the eight places pharmacies most often lose control of customer and prescription data, starting with the one that is unique to this trade: the package itself, which announces the medicine to whoever takes it. Tap any system to see what it holds and how to fix it.",
      },
    ],
    ctaHeading: "Now check whether your controls hold up",
    ctaBody:
      "The map shows where prescription and medicine data travels in a typical pharmacy. The 3-minute readiness scan checks whether your business has the controls that matter at each hotspot - and the Discovery tool builds your own data inventory.",
    ctaButton: "Take the pharmacy risk scan",
  },
  disclaimer:
    "This is a reference model of a typical retail or online pharmacy - not a scan of your systems, not legal advice, and not a document-retention schedule. It does not provide medical, medicine, prescription or drug-licensing advice. Your own flow may have fewer or more stops depending on how you work.",
  assessmentRoute: "/assessment/pharmacies",
  // Bucket keys of lib/data/industry-assessment/packs/pharmacies.ts. The pack
  // test asserts each one still exists there (drift guard), and the deep-link
  // guard test asserts the assessment client handles every one of them.
  assessmentBuckets: [
    "customer_prescription_data",
    "health_indicator_medicine_history",
    "order_delivery_vendor_sharing",
    "system_staff_access",
    "retention_refill_incident",
  ],
  // A real niche in lib/discovery/data.generated.ts, matching the DEFAULT model.
  // `e-pharmacy` also exists and matches the online model; the map is not
  // niche-switched per model, so the default's niche is the right one.
  // `fmcg-pharma-dist` is distribution - a different business, not this map.
  discoveryNicheId: "chemist",
  stages: PHARMACIES_STAGES,
  dataCategories: PHARMACIES_DATA_CATEGORIES,
  personas: PHARMACIES_PERSONAS,
  nodes: PHARMACIES_NODES,
  edges: PHARMACIES_EDGES,
  hotspots: PHARMACIES_HOTSPOTS,
  rightsScenarios: PHARMACIES_RIGHTS_SCENARIOS,
  incidentScenarios: PHARMACIES_INCIDENT_SCENARIOS,
};

export default pharmaciesDataFlowPack;
