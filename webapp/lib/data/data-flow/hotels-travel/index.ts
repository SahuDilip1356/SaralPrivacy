// Hotels, Hospitality & Travel Personal Data Flow pack - assembled config.
// Spec: docs/SaralPrivacy_HotelsTravel_DataFlow_Spec.md.
// Same presentation framework as recruitment, CA, training institutes, D2C,
// clinics, schools, law firms and real estate; only content differs.
//
// THREE operating models are genuine, different data journeys - not cosmetic
// filters (spec §2, and the pasted spec answers this itself in its §2 and §26):
//   hotel          - owns the property and the physical stay. Registers the
//                    guest against an identity document, issues a key, and
//                    generates access, Wi-Fi, CCTV and service records on
//                    premises it controls.
//   travel-agency  - never owns a bed. Assembles somebody else's inventory,
//                    which distributes the traveller's passport and itinerary
//                    across airlines, hotels, GDS, visa consultants, insurers,
//                    wholesalers and guides. Its exposure is onward transfer,
//                    not on-premises monitoring.
//   integrated     - runs both, plus a loyalty programme and a central customer
//                    profile that silently joins a hotel stay, a package, a
//                    wedding and a corporate trip into one person.
//
// HOTEL is the DEFAULT - it is what most Indian hotels, resorts and homestays
// searching this actually run, and it drives the /data-mapping card stats.
//
// `integrated` IS the superset, so the handoff's gating convention holds:
// shared core entities carry no `businessModels` tag, and each variant-specific
// entity tags itself with its own model plus `integrated`. (Map #8 established
// that a superset is a convention rather than a schema rule - `validatePack`
// only requires an edge's models to be a subset of both endpoints'. Here the
// superset is genuine, so it is used.)
//
// The STAGE SPINE is model-gated (11 / 14 / 16). See stages.ts - the pasted
// spec asked for 10 stages in each variant, but per-model counts are DERIVED
// from one shared union array and cannot be set independently.
//
// ⛔ LANGUAGE LOCKS (spec §5):
//   · "high-impact identity, travel and location data", never "sensitive
//     personal data" - the DPDPA creates no such statutory category
//   · no immigration, visa, travel-safety, hospitality-licensing or
//     foreign-national-reporting advice. Where a record has been filed with an
//     authority, say only that it is authority-controlled and therefore not the
//     business's to amend or withdraw
//   · retention is not uniformly deletable: separate what must be KEPT (tax
//     records, a filed report, a ticketed booking) from what has merely never
//     been DELETED (a passport scan from a stay two years ago)
//   · no accusation. Taking an ID copy at the desk, briefing a guide over
//     WhatsApp and selling through an OTA are how this industry works.

import type { DataFlowPack } from "../../../data-flow/schemas.ts";
import { HOTELS_TRAVEL_STAGES } from "./stages.ts";
import { HOTELS_TRAVEL_DATA_CATEGORIES } from "./data-categories.ts";
import { HOTELS_TRAVEL_PERSONAS } from "./personas.ts";
import { HOTELS_TRAVEL_NODES } from "./nodes.ts";
import { HOTELS_TRAVEL_EDGES } from "./edges.ts";
import { HOTELS_TRAVEL_HOTSPOTS } from "./hotspots.ts";
import { HOTELS_TRAVEL_INCIDENT_SCENARIOS, HOTELS_TRAVEL_RIGHTS_SCENARIOS } from "./scenarios.ts";

export const hotelsTravelDataFlowPack: DataFlowPack = {
  industry: "hotels-travel",
  title: "Hotel & Travel Guest Data Flow Map",
  mainActor: "Guest",
  businessModels: [
    { id: "hotel", label: "Hotel / resort" },
    { id: "travel-agency", label: "Travel agency / tour operator" },
    { id: "integrated", label: "Integrated hospitality & travel group" },
  ],
  lexicon: {
    subject: "guest",
    subjectArtefact: "One guest's booking and passport",
    // "business" reads correctly in "outside your ___" for a hotel, a resort, a
    // travel agency and a hospitality group alike - "property" excludes the
    // agency and "agency" excludes the hotel.
    org: "business",
  },
  boundaryLabels: {
    candidate: "The guest",
    agency: "Your business",
    client: "Employers & corporate accounts",
    vendor: "Platforms, systems & service vendors",
    government: "Immigration & authorities",
    // Unusually load-bearing in this sector: the airline, the partner hotel, the
    // wholesaler, the visa consultant and the guide all receive the traveller's
    // identity as a condition of delivering the trip. None of them processes it
    // on your instructions, and none of them is your client. See hotspot #2.
    "third-party": "Airlines, hotels, guides & partners",
    public: "Public reviews & open posts",
  },
  presentation: {
    eyebrow: "Hotels, Hospitality & Travel",
    h1: "One guest. One journey. Many systems and partners.",
    intro:
      "Follow one guest or traveller's information through search and booking, identity and passport collection, payment, airlines and hotels, transfers, check-in, the stay itself, Wi-Fi and CCTV, guides and activity partners, complaints and reviews, loyalty programmes and long-term archives - and count every place it ends up, and where you lose control of it.",
    metaTitle: "Hotel & Travel Guest Data Flow Map | SaralPrivacy",
    metaDescription:
      "See how guest and traveller data moves through booking platforms, passport and visa processing, hotels, airlines, transport, payments, Wi-Fi, CCTV and loyalty systems - and where DPDPA risk appears for a hospitality or travel business.",
    ogTitle: "Where does one hotel guest or traveller's data go?",
    ogDescription:
      "Follow guest and traveller information across bookings, identity verification, hotels, airlines, transport, payments, monitoring and archive systems, in three hospitality and travel operating models.",
    breadcrumbLabel: "Hotels, Hospitality & Travel",
    previewBlurb:
      "Before you fix anything, see the problem. One booking moves through an OTA you do not own, a channel manager, a reservation system, a passport photograph on WhatsApp, a scanner's local folder, a payment screenshot, an airline record you cannot recall, a rooming list every traveller can read, a guide's personal phone, a key-card and Wi-Fi trail nobody set a retention period for - and a guest history that is never deleted because it is what sells the next stay.",
    howToRead: [
      {
        title: "Pick your model",
        body: "Switch between Hotel / resort, Travel agency / tour operator and Integrated hospitality & travel group to see the journey each kind of business actually runs. This is not a filter over one journey - a hotel owns the stay, registers the guest against an identity document and generates access, Wi-Fi and CCTV records on its own premises; an agency never owns a bed and instead distributes the traveller's passport and itinerary across airlines, hotels, wholesalers, visa consultants and guides; a group runs both and then joins them into a single cross-brand profile. The stage count and the place-counter recalculate for the model you choose.",
      },
      {
        title: "When it leaves you",
        body: "A violet left edge and a tag mark everything outside your business - the OTA and channel manager that collected the guest before you did, airlines and GDS, partner hotels and wholesalers, visa consultants and insurers, transfer vendors, guides and activity operators, payment and Wi-Fi providers, employers receiving an itemised invoice, immigration authorities, and anything that becomes a public review. Once data is there your control is indirect at best: it runs through your instructions and your contract, not your systems. Risk is shown separately, as an amber or red fill - so an outside system can be low risk, and your own reservations executive's phone can be one of the worst things on the page.",
      },
      {
        title: "Where control breaks",
        body: "Red flags mark the hotspots - the eight places hospitality and travel businesses most often lose control of guest data, from a passport photographed onto WhatsApp and never deleted, to a party list forwarded into a vendor group chat, to a key-card and Wi-Fi trail that records where a named person was and has no retention period. Tap any system to see what it holds and how to fix it.",
      },
    ],
    ctaHeading: "Now check whether your controls hold up",
    ctaBody:
      "The map shows where guest and traveller data travels in a typical hospitality or travel business. The 3-minute readiness scan checks whether your business has the controls that matter at each hotspot - and the Discovery tool builds your own data inventory.",
    ctaButton: "Take the hotels & travel risk scan",
  },
  disclaimer:
    "This is a reference model of a typical hospitality or travel business - not a scan of your systems, not legal advice, and not a document-retention schedule. It does not provide immigration, visa, travel-safety or hospitality-regulatory advice. Your own flow may have fewer or more stops depending on how you work.",
  assessmentRoute: "/assessment/hotels-travel",
  // Bucket keys of lib/data/industry-assessment/packs/hotels-travel.ts. The pack
  // test asserts each one still exists there (drift guard), and the deep-link
  // guard test asserts the assessment client handles every one of them.
  assessmentBuckets: [
    "guest_traveller_data",
    "id_passport_travel_document",
    "booking_ota_vendor_sharing",
    "system_staff_access",
    "retention_marketing_incident",
  ],
  // A real niche in lib/discovery/data.generated.ts, matching the DEFAULT model.
  // `travel-agencies`, `traveltech-otas`, `homestays-guesthouses`,
  // `cruise-luxury-travel`, `pilgrimage-travel`, `adventure-tourism` and
  // `medical-tourism` also exist; the map is not niche-switched per model, so
  // the default's niche is the right one.
  discoveryNicheId: "hotels-resorts",
  stages: HOTELS_TRAVEL_STAGES,
  dataCategories: HOTELS_TRAVEL_DATA_CATEGORIES,
  personas: HOTELS_TRAVEL_PERSONAS,
  nodes: HOTELS_TRAVEL_NODES,
  edges: HOTELS_TRAVEL_EDGES,
  hotspots: HOTELS_TRAVEL_HOTSPOTS,
  rightsScenarios: HOTELS_TRAVEL_RIGHTS_SCENARIOS,
  incidentScenarios: HOTELS_TRAVEL_INCIDENT_SCENARIOS,
};

export default hotelsTravelDataFlowPack;
