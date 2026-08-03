// FinTech, NBFC & Digital Payments Personal Data Flow pack - assembled config.
// Spec: docs/SaralPrivacy_FintechNbfc_DataFlow_Spec.md.
// Same presentation framework as the ten maps before it; only content differs.
//
// CONTENT-ONLY BUILD. The pasted spec answered its own architecture question in
// its §2 ("Reuse the shared data-flow engine... Do not build a separate
// FinTech-only UI framework"), §27 ("Use one shared component engine. Do not
// create separate UI trees for each variant") and §40 ("Do not create an
// isolated hard-coded page. Create one reusable data-flow interface with three
// complete journeys"). Per the framework's §9 that IS the answer, so it was
// recorded and acted on rather than put to Dilip. No route, component or schema
// file is touched by this map.
//
// THREE operating models are genuine, different data journeys - not cosmetic
// filters (spec §2):
//   digital-lending - app or DSA lead, device permissions standing in for credit
//                     history, an Account Aggregator pull, a bureau hit, a model
//                     that scores in seconds, and a FAN-OUT: the same file goes
//                     to several lenders, each keeping its own copy and making
//                     its own decision.
//   payments        - the customer is never underwritten. Device binding, a KYC
//                     tier, bank/card/UPI linking, and then a continuous stream
//                     of transactions screened in real time by a model that can
//                     block or freeze without warning. The relationship map -
//                     who paid whom, where and when - is the asset.
//   nbfc            - branch, DSA, dealer and field intake; the co-applicant,
//                     guarantor and nominee are in the file from the start; a
//                     valuer and a field officer visit the house; a committee
//                     decides; a physical file exists; and recovery can end in
//                     repossession and a public auction.
//
// DIGITAL LENDING is the DEFAULT - it is the shape most businesses searching
// this actually run, and it drives the /data-mapping card stats.
//
// ⚠️ THERE IS NO SUPERSET, AND ONE IS NOT MANUFACTURED (map #8 established that
// a superset is a convention, not a schema rule). `nbfc` is NOT a superset of
// `digital-lending`: an NBFC lending on its own book does not fan one
// application out to several competing lenders and does not harvest a contact
// list or SMS inbox as a substitute for credit history. `nbfc` is NOT a superset
// of `payments`: no UPI rail, no card tokenisation, no merchant acquiring, no
// settlement or chargeback workflow. Each variant-specific entity tags itself
// with exactly the models it honestly appears in.
//
// The STAGE SPINE is model-gated (13 / 12 / 15). See stages.ts - the pasted spec
// asked for 10 stages in each variant, but per-model counts are DERIVED from one
// shared union array and cannot be set independently.
//
// ⛔ LANGUAGE LOCKS (spec §8):
//   · "high-impact identity, financial and behavioural data", never "sensitive
//     personal data" - the DPDPA creates no such statutory category
//   · NO financial, lending, investment, credit or regulatory advice, and none
//     on what must be retained or for how long. Where a record exists because
//     other law requires it, the map says only that it is a REQUIRED RECORD and
//     therefore not freely deletable
//   · fraud SUSPICION is never written as confirmed fraud - the single most
//     consequential wording choice in the pack
//   · retention is not uniformly deletable: separate what must be KEPT (a live
//     account, a ledger entry, a required record) from what has merely never
//     been DELETED (a statement pulled for an application refused two years ago)
//   · no accusation. DSAs, WhatsApp follow-up, field officers and recovery
//     agencies are how this trade reaches people.

import type { DataFlowPack } from "../../../data-flow/schemas.ts";
import { FINTECH_NBFC_STAGES } from "./stages.ts";
import { FINTECH_NBFC_DATA_CATEGORIES } from "./data-categories.ts";
import { FINTECH_NBFC_PERSONAS } from "./personas.ts";
import { FINTECH_NBFC_NODES } from "./nodes.ts";
import { FINTECH_NBFC_EDGES } from "./edges.ts";
import { FINTECH_NBFC_HOTSPOTS } from "./hotspots.ts";
import { FINTECH_NBFC_INCIDENT_SCENARIOS, FINTECH_NBFC_RIGHTS_SCENARIOS } from "./scenarios.ts";

export const fintechNbfcDataFlowPack: DataFlowPack = {
  industry: "fintech-nbfc",
  title: "FinTech & NBFC Financial Data Flow Map",
  // Deliberately both nouns: a payments customer is never a borrower, and a
  // borrower is the person the decision is made about. Keeping them together in
  // one label is what lets the three models share a header honestly.
  mainActor: "Customer / borrower",
  businessModels: [
    { id: "digital-lending", label: "Digital lending / LSP" },
    { id: "payments", label: "Payments, wallet or UPI fintech" },
    { id: "nbfc", label: "Multi-product NBFC / branch lender" },
  ],
  lexicon: {
    subject: "customer",
    subjectArtefact: "One customer's financial file and the decision made on it",
    // "company" reads correctly in "outside your ___" for a digital lender, a
    // payments fintech and a traditional NBFC alike - "lender" excludes
    // payments, "fintech" excludes the branch NBFC, and "firm" is already the
    // noun CA firms and law firms use.
    org: "company",
  },
  boundaryLabels: {
    candidate: "The customer / borrower",
    agency: "Your company",
    // The institutions the file is sent to so THEY can decide or move the money.
    // They act on their own account, not on your instructions - which is what
    // separates them from vendors and makes them the rank-4 hotspot.
    client: "Partner lenders, banks & payment networks",
    vendor: "Technology, KYC, scoring & platform vendors",
    // Unusually load-bearing in this sector: the DSA who introduced the customer,
    // the bureau, the Account Aggregator, the recovery agency and the valuer all
    // hold the customer's data as a condition of the trade working, and none of
    // them processes it on your instructions.
    "third-party": "DSAs, agents, bureaus & recovery partners",
    government: "Regulators, courts & authorities",
    public: "Public listings & open records",
  },
  presentation: {
    eyebrow: "Fintech, NBFC & Digital Payments",
    h1: "One customer. One financial decision. Many systems and partners.",
    intro:
      "Follow one customer's information through lead generation, device permissions, KYC, bank and Account Aggregator data, bureau checks, fraud screening, the credit or transaction decision, disbursal, payments, repayment, collections, cross-sell and long-term archives - and count every place it ends up, and where you lose control of it.",
    metaTitle: "FinTech & NBFC Financial Data Flow Map | SaralPrivacy",
    metaDescription:
      "See how customer financial data moves through KYC, bank and Account Aggregator data, bureau checks, scoring, lenders, payment systems, agents, collections and archives - and where DPDPA risk appears for a fintech, NBFC or payments business.",
    ogTitle: "Where does one FinTech or NBFC customer's data go?",
    ogDescription:
      "Follow identity, bank, bureau, transaction, scoring, lending, payment and collections data across digital lending, payments and NBFC systems.",
    breadcrumbLabel: "Fintech, NBFC & Digital Payments",
    previewBlurb:
      "Before you fix anything, see the problem. One application moves through an agent's own phone, a permission dialogue that asked for the contact list, a statement-analysis vendor that saw every transaction, a bureau, a model that decided in seconds, four lenders who each kept a copy, a recovery agency that got the references too - and an archive nobody has ever cleared.",
    howToRead: [
      {
        title: "Pick your model",
        body: "Switch between Digital lending / LSP, Payments, wallet or UPI fintech and Multi-product NBFC to see the journey each kind of business actually runs. This is not a filter over one journey - a digital lender routes one application to several lenders and reads signals off the handset; a payments business never underwrites anyone but screens every transaction in real time and holds a map of who paid whom; an NBFC takes the co-applicant, the guarantor and the neighbour's opinion, sends a valuer to the house, keeps a paper file and can end up at a public auction. The stage count and the place-counter recalculate for the model you choose.",
      },
      {
        title: "When it leaves you",
        body: "A violet left edge and a tag mark everything outside your company - the DSA or dealer who introduced the customer, the KYC and video-KYC providers, the Account Aggregator, the statement-analysis vendor, the credit bureau, the lenders and partner banks the file is sent to, the payment networks, the recovery agency, the valuer, external counsel and anything that becomes a public listing. Once data is there your control is indirect at best. Risk is shown separately, as an amber or red fill - so a regulated bank can be low risk, and the phone in your own agent's pocket can be one of the worst things on the page.",
      },
      {
        title: "Where control breaks",
        body: "Red flags mark the hotspots - the eight places these businesses most often lose control of customer data, starting with the one that is unique to this sector: the decision itself, which becomes a permanent fact about the person that they cannot see or check. Tap any system to see what it holds and how to fix it.",
      },
    ],
    ctaHeading: "Now check whether your controls hold up",
    ctaBody:
      "The map shows where customer financial data travels in a typical fintech, NBFC or payments business. The 3-minute readiness scan checks whether your business has the controls that matter at each hotspot - and the Discovery tool builds your own data inventory.",
    ctaButton: "Take the FinTech / NBFC risk scan",
  },
  disclaimer:
    "This is a reference model of a typical fintech, NBFC or digital-payments business - not a scan of your systems, not legal advice, and not a record-retention schedule. It does not provide financial, lending, investment, credit or regulatory advice. Your own flow may have fewer or more stops depending on how you work.",
  assessmentRoute: "/assessment/fintech-nbfc",
  // Bucket keys of lib/data/industry-assessment/packs/fintech-nbfc.ts. The pack
  // test asserts each one still exists there (drift guard), and the deep-link
  // guard test asserts the assessment client handles every one of them.
  assessmentBuckets: [
    "kyc_financial_data",
    "profiling_underwriting",
    "consent_notice_rights",
    "vendor_partner_agent_sharing",
    "access_retention_incident",
  ],
  // A real niche in lib/discovery/data.generated.ts, matching the DEFAULT model.
  // `payments-upi` and `fintech-startups` also exist and match the other two
  // models; the map is not niche-switched per model, so the default's niche is
  // the right one. `loan-dsas` is the agent's own business - a different map.
  discoveryNicheId: "lending-nbfc",
  stages: FINTECH_NBFC_STAGES,
  dataCategories: FINTECH_NBFC_DATA_CATEGORIES,
  personas: FINTECH_NBFC_PERSONAS,
  nodes: FINTECH_NBFC_NODES,
  edges: FINTECH_NBFC_EDGES,
  hotspots: FINTECH_NBFC_HOTSPOTS,
  rightsScenarios: FINTECH_NBFC_RIGHTS_SCENARIOS,
  incidentScenarios: FINTECH_NBFC_INCIDENT_SCENARIOS,
};

export default fintechNbfcDataFlowPack;
