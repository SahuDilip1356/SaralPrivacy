// Real Estate & Property Firms Personal Data Flow pack - assembled config.
// Spec: docs/SaralPrivacy_RealEstate_DataFlow_Spec.md.
// Same presentation framework as recruitment, CA, training institutes, D2C,
// clinics, schools and law firms; only content differs.
//
// THREE operating models are genuine, different data journeys - not cosmetic
// filters (spec §2, confirmed with Dilip before authoring):
//   brokerage           - matches a client to somebody else's property and
//                         circulates the requirement through a co-broker
//                         network. No construction schedule, no deposit.
//   developer           - campaigns into a call centre, books and allots a
//                         unit, then carries the buyer for years through demand
//                         notices, possession and handover to the RWA.
//   property-management - takes a mandate over somebody's home, screens a
//                         tenant, then holds an ONGOING relationship: rent,
//                         vendors entering the property, keys, society systems,
//                         an exit inspection and a deposit deduction.
//
// BROKERAGE is the DEFAULT - it is what most Indian brokers, consultants and
// small agencies searching this actually run, and it drives the /data-mapping
// card stats.
//
// THERE IS NO SUPERSET MODEL, deliberately (spec §0). None of the three
// contains the other two, and a fourth "integrated" model was declined. The
// handoff's gating convention assumes a superset exists; that is a CONVENTION,
// not a constraint - `validatePack`'s only model rule is that an edge's
// businessModels be a subset of both endpoints'. The single cost is that no one
// view shows all seventeen stages.
//
// The STAGE SPINE is model-gated (10 / 13 / 14). See stages.ts.
//
// ⛔ LANGUAGE LOCKS (spec §5):
//   · "high-impact identity, financial and property data", never "sensitive
//     personal data" - the DPDPA creates no such statutory category
//   · no property, title, tax, registration, lending or investment advice
//   · authority-controlled records - the registered instrument, the police
//     verification - are named as such, because they are not the firm's to
//     correct or delete
//   · retention is not uniformly deletable: separate what must be KEPT from
//     what has merely never been DELETED
//   · no accusation. Broker networks are how this industry works.

import type { DataFlowPack } from "../../../data-flow/schemas.ts";
import { REAL_ESTATE_STAGES } from "./stages.ts";
import { REAL_ESTATE_DATA_CATEGORIES } from "./data-categories.ts";
import { REAL_ESTATE_PERSONAS } from "./personas.ts";
import { REAL_ESTATE_NODES } from "./nodes.ts";
import { REAL_ESTATE_EDGES } from "./edges.ts";
import { REAL_ESTATE_HOTSPOTS } from "./hotspots.ts";
import { REAL_ESTATE_INCIDENT_SCENARIOS, REAL_ESTATE_RIGHTS_SCENARIOS } from "./scenarios.ts";

export const realEstateDataFlowPack: DataFlowPack = {
  industry: "real-estate",
  title: "Real Estate Client & Property Data Flow Map",
  mainActor: "Client",
  businessModels: [
    { id: "brokerage", label: "Brokerage & property consultancy" },
    { id: "developer", label: "Developer / builder sales" },
    { id: "property-management", label: "Rental & property management" },
  ],
  lexicon: {
    subject: "client",
    subjectArtefact: "One client's property file",
    // "firm" reads correctly in "outside your ___" for a brokerage, a builder's
    // sales organisation and a property-management business alike.
    org: "firm",
  },
  boundaryLabels: {
    candidate: "The client",
    agency: "Your firm",
    client: "Builders, landlords & owners",
    vendor: "Portals, CRM & service vendors",
    government: "Registration, police & authorities",
    // Unusually load-bearing in this sector: the broker network is the
    // signature, and it is neither a vendor (nothing is processed on your
    // instructions) nor a client. See hotspot #1.
    "third-party": "Brokers, lenders & others who receive it",
    public: "Open links & public records",
  },
  presentation: {
    eyebrow: "Real Estate & Property Firms",
    h1: "One client. One property decision. Many systems and people.",
    intro:
      "Follow buyer, tenant, seller and landlord data through lead capture, qualification, site visits, broker networks, KYC, loan processing, agreements, registration, possession, property management and long-term archives - and count every place it ends up, and where you lose control of it.",
    metaTitle: "Real Estate Client & Property Data Flow Map | SaralPrivacy",
    metaDescription:
      "See how buyer, tenant, seller and landlord data moves through property portals, brokers, site visits, KYC, loans, agreements, registration and archives - and where DPDPA risk appears for a property firm.",
    ogTitle: "Where does one real-estate client's data go?",
    ogDescription:
      "Follow buyer, tenant, seller and landlord information across leads, brokers, site visits, KYC, lenders, registration, societies and archives, in three property-business operating models.",
    breadcrumbLabel: "Real Estate & Property Firms",
    previewBlurb:
      "Before you fix anything, see the problem. One enquiry moves through a portal dashboard, a shared spreadsheet nobody controls, a salesperson's own phone, a co-broker group of forty agents, a gate register, a folder of PAN and bank statements, four lenders, a registration agent, a society system you do not own - and an old-lead database that never deletes anything.",
    howToRead: [
      {
        title: "Pick your model",
        body: "Switch between Brokerage & property consultancy, Developer / builder sales and Rental & property management to see the journey each kind of property business actually runs. This is not a filter over one journey - a brokerage matches a client to someone else's property and never runs a construction payment schedule; a developer carries the buyer for years through demand notices, possession and handover to the RWA; a property manager takes a mandate over somebody's home and then holds an ongoing relationship with keys, vendors and a society. The stage count and the place-counter recalculate for the model you choose.",
      },
      {
        title: "When it leaves you",
        body: "A violet left edge and a tag mark everything outside your firm - portals and CRM vendors, co-brokers and channel partners, builders, landlords and societies, loan agents and lenders, drafting and registration agents, the sub-registrar, and anything that becomes an open link or a public record. Once data is there your control is indirect at best: it runs through your instructions and your contract, not your systems. Risk is shown separately, as an amber or red fill - so an outside system can be low risk, and your own field executive's phone can be one of the worst things on the page.",
      },
      {
        title: "Where control breaks",
        body: "Red flags mark the hotspots - the eight places property firms most often lose control of client data, from a requirement posted to forty agents at once, to PAN and bank statements arriving on WhatsApp, to an old-lead database that is never deleted because it is the firm's real asset. Tap any system to see what it holds and how to fix it.",
      },
    ],
    ctaHeading: "Now check whether your controls hold up",
    ctaBody:
      "The map shows where client and property data travels in a typical property business. The 3-minute readiness scan checks whether your firm has the controls that matter at each hotspot - and the Discovery tool builds your own data inventory.",
    ctaButton: "Take the real estate risk scan",
  },
  disclaimer:
    "This is a reference model of a typical real-estate or property firm - not a scan of your systems, not legal advice, and not a document-retention schedule. It does not provide property, title, registration, lending or investment advice. Your own flow may have fewer or more stops depending on how you work.",
  assessmentRoute: "/assessment/real-estate",
  // Bucket keys of lib/data/industry-assessment/packs/real-estate.ts. The pack
  // test asserts each one still exists there (drift guard), and the deep-link
  // guard test asserts the assessment client handles every one of them.
  assessmentBuckets: [
    "client_lead_data",
    "kyc_property_document",
    "broker_network_sharing",
    "crm_staff_vendor_access",
    "retention_incident_readiness",
  ],
  // A real niche in lib/discovery/data.generated.ts, matching the DEFAULT model.
  // `re-developers`, `property-management`, `commercial-re`, `rental-platforms`,
  // `housing-societies` and `coliving-pg` also exist; the map is not
  // niche-switched per model, so the default's niche is the right one.
  discoveryNicheId: "re-brokers",
  stages: REAL_ESTATE_STAGES,
  dataCategories: REAL_ESTATE_DATA_CATEGORIES,
  personas: REAL_ESTATE_PERSONAS,
  nodes: REAL_ESTATE_NODES,
  edges: REAL_ESTATE_EDGES,
  hotspots: REAL_ESTATE_HOTSPOTS,
  rightsScenarios: REAL_ESTATE_RIGHTS_SCENARIOS,
  incidentScenarios: REAL_ESTATE_INCIDENT_SCENARIOS,
};

export default realEstateDataFlowPack;
