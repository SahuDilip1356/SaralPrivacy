// Gyms, Salons & Spas Personal Data Flow pack - assembled config.
// Spec: docs/SaralPrivacy_GymsSalonsSpas_DataFlow_Spec.md.
// Same presentation framework as the eleven maps before it; only content
// differs. This is map #12 of 12 - the series is complete.
//
// CONTENT-ONLY BUILD. The pasted spec answered its own architecture question in
// its §2 ("Reuse the shared data-flow engine... Do not create a separate Gyms /
// Salons / Spas UI framework"), §27 ("Use one shared component engine. Do not
// create separate UI trees for each variant") and §40 ("Do not create an
// isolated hard-coded page. Create one reusable data-flow interface with three
// complete journeys"). Per the framework's §9 that IS the answer, so it was
// recorded and acted on rather than put to Dilip. No route, component or schema
// file is touched by this map.
//
// THREE operating models are genuine, different data journeys - not cosmetic
// filters (spec §2), and Dilip named the three-way split himself:
//   gym   - membership contract, health declaration, fitness assessment on a
//           body-composition machine, a fingerprint at the turnstile, a
//           trainer, wearables, progress photos, a member community group.
//   salon - appointment and walk-in, hair/skin consultation with allergies and
//           patch tests, colour formulas, home services and freelancers, the
//           bridal shoot, before-and-after posts.
//   spa   - appointment and package, health and contraindication intake,
//           therapist allocation, lockers and CCTV, hotel and corporate
//           partners, external wellness referrals.
//
// GYM is the DEFAULT - it is the shape most businesses searching this actually
// run, it drives the /data-mapping card stats, and it matches the
// `gyms-fitness` Discovery niche below.
//
// ⚠️ THERE IS NO SUPERSET, AND ONE IS NOT MANUFACTURED (map #8 established that
// a superset is a convention, not a schema rule). A gym does not send a stylist
// to a bride's home; a salon has no biometric turnstile; a spa runs no members'
// challenge leaderboard. Each variant-specific entity tags itself with exactly
// the models it honestly appears in.
//
// The STAGE SPINE is model-gated (12 / 11 / 12). See stages.ts - the pasted
// spec asked for 10 stages in each variant, but per-model counts are DERIVED
// from one shared union array and cannot be set independently.
//
// ⛔ LANGUAGE LOCKS (spec §8):
//   · "high-impact health, body and image data", never "sensitive personal
//     data" - the DPDPA creates no such statutory category
//   · NO medical, clinical, dietary, fitness-programming, dermatological or
//     therapeutic advice. The map names what is HELD, never what should be
//     done to a body
//   · NO advice on shop-and-establishment, licensing or trade-regulatory
//     obligations. Where a record must be kept under other law, it is only
//     ever a REQUIRED RECORD
//   · biometrics: describe, do not prescribe
//   · no accusation. Progress photos, WhatsApp booking, a trainer's personal
//     phone and a franchisee's own CRM are how this trade works. The map shows
//     where control breaks; it never calls the trade a violation.

import type { DataFlowPack } from "../../../data-flow/schemas.ts";
import { GYMS_SALONS_SPAS_STAGES } from "./stages.ts";
import { GYMS_SALONS_SPAS_DATA_CATEGORIES } from "./data-categories.ts";
import { GYMS_SALONS_SPAS_PERSONAS } from "./personas.ts";
import { GYMS_SALONS_SPAS_NODES } from "./nodes.ts";
import { GYMS_SALONS_SPAS_EDGES } from "./edges.ts";
import { GYMS_SALONS_SPAS_HOTSPOTS } from "./hotspots.ts";
import {
  GYMS_SALONS_SPAS_INCIDENT_SCENARIOS,
  GYMS_SALONS_SPAS_RIGHTS_SCENARIOS,
} from "./scenarios.ts";

export const gymsSalonsSpasDataFlowPack: DataFlowPack = {
  industry: "gyms-salons-spas",
  title: "Gym, Salon & Spa Customer Data Flow Map",
  // "Customer / member" deliberately carries both nouns: a salon or spa has
  // customers, a gym has members, and the three models share one header.
  mainActor: "Customer / member",
  businessModels: [
    { id: "gym", label: "Gym / Fitness Centre" },
    { id: "salon", label: "Salon / Beauty Studio" },
    { id: "spa", label: "Spa / Wellness Centre" },
  ],
  lexicon: {
    subject: "customer",
    subjectArtefact: "One customer's health notes, measurements and photographs",
    // "business" reads correctly in "outside your ___" for a gym, a salon and
    // a spa alike - "studio" excludes the gym, "centre" excludes the salon, and
    // "firm", "practice", "brand" and "company" are already taken by other
    // maps.
    org: "business",
  },
  boundaryLabels: {
    candidate: "The customer / member",
    agency: "Your business",
    // Organisations that send customers in and get reports back, acting on
    // their own account: the partner hotel and the corporate wellness
    // programme.
    client: "Hotel & corporate partners",
    vendor: "Apps, devices & platform vendors",
    // Unusually load-bearing in this sector: the franchisee running the same
    // brand as a separate company, the freelance artist at the bride's home,
    // the photographer's archive, the marketing agency with the passwords.
    "third-party": "Franchisees, freelancers & agencies",
    government: "Police & authorities",
    // The other unusually load-bearing boundary: this business's marketing IS
    // its customers' bodies, published.
    public: "Instagram, website & public reviews",
  },
  presentation: {
    eyebrow: "Gyms, Salons & Spas",
    h1: "One customer. One service journey. Many systems, staff and photographs.",
    intro:
      "Follow one customer's information through enquiry, registration, the health declaration, the fitness or beauty consultation, service delivery, photographs, billing, marketing and the archive that never gets cleared - and count every place it ends up, and where you lose control of it.",
    metaTitle: "Gym, Salon & Spa Customer Data Flow Map | SaralPrivacy",
    metaDescription:
      "See how customer health declarations, body measurements, consultation notes, photographs, attendance and service history move through staff phones, booking apps, WhatsApp, devices, marketing and archives - and where DPDPA risk appears for a gym, salon or spa.",
    ogTitle: "Where does one gym, salon or spa customer's data go?",
    ogDescription:
      "Follow health, body, image, service, payment and marketing data across the systems, staff phones and public channels of a typical gym, salon or spa.",
    breadcrumbLabel: "Gyms, Salons & Spas",
    previewBlurb:
      "Before you fix anything, see the problem. One customer moves through a WhatsApp thread, a health form the front desk read, a body-composition machine that kept a profile, a trainer's personal phone, a staff group that saw the caution note, a before-and-after that went to Instagram on a verbal yes - and an archive nobody has ever cleared.",
    howToRead: [
      {
        title: "Pick your model",
        body: "Switch between Gym / Fitness Centre, Salon / Beauty Studio and Spa / Wellness Centre to see the journey each kind of business actually runs. This is not a filter over one journey - a gym enrols a fingerprint at the turnstile, tracks a body month by month and runs a members' community group; a salon sends freelancers and consultation notes to a bride's home and lives on before-and-after posts; a spa takes a health intake in the one setting where discretion is the product, and answers to a hotel and a corporate programme. The stage count and the place-counter recalculate for the model you choose.",
      },
      {
        title: "When it leaves you",
        body: "A violet left edge and a tag mark everything outside your business - the booking marketplace, the app and device vendors, the hotel and the corporate programme, the franchise platform, the freelance artist, the photographer's archive, the marketing agency, and everything published to Instagram or a review page. Once data is there your control is indirect at best. Risk is shown separately, as an amber or red fill - so a regulated payment gateway can be low risk, and the phone in your own trainer's pocket can be one of the worst things on the page.",
      },
      {
        title: "Where control breaks",
        body: "Red flags mark the hotspots - the eight places these businesses most often lose control of customer data, starting with the one that is unique to this sector: the customer's own body, photographed mid-transformation and published as the business's best advertisement. Tap any system to see what it holds and how to fix it.",
      },
    ],
    ctaHeading: "Now check whether your controls hold up",
    ctaBody:
      "The map shows where customer health, body and image data travels in a typical gym, salon or spa. The 3-minute readiness scan checks whether your business has the controls that matter at each hotspot - and the Discovery tool builds your own data inventory.",
    ctaButton: "Take the Gym / Salon / Spa risk scan",
  },
  disclaimer:
    "This is a reference model of a typical gym, salon or spa - not a scan of your systems, not legal advice, and not a record-retention schedule. It does not provide medical, fitness, beauty-treatment, wellness or dietary advice. Your own flow may have fewer or more stops depending on how you work.",
  assessmentRoute: "/assessment/gyms-salons-spas",
  // Bucket keys of lib/data/industry-assessment/packs/gyms-salons-spas.ts. The
  // pack test asserts each one still exists there (drift guard), and the
  // deep-link guard test asserts the assessment client handles every one.
  assessmentBuckets: [
    "customer_membership_data",
    "health_body_consultation_data",
    "photos_marketing_whatsapp",
    "app_staff_vendor_access",
    "retention_rights_incident",
  ],
  // A real niche in lib/discovery/data.generated.ts, matching the DEFAULT
  // model (gym). `salons-spas`, `yoga-wellness` and `beauty-at-home` also
  // exist; the map is not niche-switched per model, so the default's niche is
  // the right one.
  discoveryNicheId: "gyms-fitness",
  stages: GYMS_SALONS_SPAS_STAGES,
  dataCategories: GYMS_SALONS_SPAS_DATA_CATEGORIES,
  personas: GYMS_SALONS_SPAS_PERSONAS,
  nodes: GYMS_SALONS_SPAS_NODES,
  edges: GYMS_SALONS_SPAS_EDGES,
  hotspots: GYMS_SALONS_SPAS_HOTSPOTS,
  rightsScenarios: GYMS_SALONS_SPAS_RIGHTS_SCENARIOS,
  incidentScenarios: GYMS_SALONS_SPAS_INCIDENT_SCENARIOS,
};

export default gymsSalonsSpasDataFlowPack;
