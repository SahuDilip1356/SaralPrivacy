// Clinics & Diagnostic Labs Personal Data Flow pack - assembled config.
// Spec: docs/SaralPrivacy_ClinicsDiagnosticLabs_DataFlow_Spec.md.
// Same presentation framework as recruitment, CA, training institutes and D2C;
// only content differs.
//
// THREE operating models (integrated / standalone clinic / diagnostic lab) are
// genuine, different data journeys - not cosmetic filters. Integrated is both
// the DEFAULT and the SUPERSET, so it appears in every gated tag and renders the
// full union; a standalone clinic sees a consultation-led journey with no
// analysers, and a diagnostic lab sees a sample-led journey with no consultation.
//
// This is the first pack whose STAGE SPINE is model-gated (10 / 12 / 14 stages),
// because the divergence here is real rather than cosmetic. See stages.ts.
//
// LANGUAGE LOCK: "high-impact health data", never "sensitive personal data" -
// the DPDPA creates no such statutory category. DPDPA scope only: no NDHM/ABDM,
// no professional-body retention schedules, no medical or legal advice.

import type { DataFlowPack } from "../../../data-flow/schemas.ts";
import { CLINICS_DIAGNOSTIC_LABS_STAGES } from "./stages.ts";
import { CLINICS_DIAGNOSTIC_LABS_DATA_CATEGORIES } from "./data-categories.ts";
import { CLINICS_DIAGNOSTIC_LABS_PERSONAS } from "./personas.ts";
import { CLINICS_DIAGNOSTIC_LABS_NODES } from "./nodes.ts";
import { CLINICS_DIAGNOSTIC_LABS_EDGES } from "./edges.ts";
import { CLINICS_DIAGNOSTIC_LABS_HOTSPOTS } from "./hotspots.ts";
import {
  CLINICS_DIAGNOSTIC_LABS_INCIDENT_SCENARIOS,
  CLINICS_DIAGNOSTIC_LABS_RIGHTS_SCENARIOS,
} from "./scenarios.ts";

export const clinicsDiagnosticLabsDataFlowPack: DataFlowPack = {
  industry: "clinics-diagnostic-labs",
  title: "Clinic & Diagnostic Lab Personal Data Flow Map",
  mainActor: "Patient",
  // Integrated is declared first, so it is the default and drives the
  // /data-mapping card stats. It is also the superset - it genuinely runs
  // consultation AND diagnostics AND home collection - which is why every
  // gated entity in this pack includes it.
  businessModels: [
    { id: "integrated", label: "Integrated clinic + diagnostics" },
    { id: "clinic", label: "Standalone clinic" },
    { id: "diagnostic-lab", label: "Diagnostic laboratory" },
  ],
  lexicon: {
    subject: "patient",
    subjectArtefact: "One patient's record",
    // "practice" so the copy reads correctly for a standalone laboratory too.
    org: "practice",
  },
  boundaryLabels: {
    candidate: "The patient",
    agency: "Your clinic or lab",
    client: "Referring doctors & hospitals",
    "third-party": "Family, employers & insurers",
  },
  presentation: {
    eyebrow: "Clinics & Diagnostic Labs",
    h1: "One patient. Many systems. One healthcare provider's responsibility.",
    intro:
      "Follow one patient's information through appointment booking, registration, consultation, prescriptions, sample collection, laboratory processing, diagnostic images, billing, insurance, report delivery, referrals and long-term archives - and count every place it ends up, and where you lose control of it.",
    metaTitle: "Clinic & Diagnostic Lab Patient Data Flow Map - Where Patient Data Travels",
    metaDescription:
      "See how patient data moves through appointments, consultation, prescriptions, samples, laboratory systems, diagnostic images, report sharing, insurance and archives - and where DPDPA risk appears for a clinic or diagnostic lab.",
    ogTitle: "Where does one patient's data go? - Clinic & Diagnostic Lab Data Flow Map",
    ogDescription:
      "Follow patient information across clinic, laboratory, imaging, home collection, billing, report-sharing, referral and long-term archive systems, in three healthcare operating models.",
    breadcrumbLabel: "Clinics & Diagnostic Labs",
    previewBlurb:
      "Before you fix anything, see the problem. One patient's data moves through a reception WhatsApp, a registration desk, consultation notes, a phlebotomist's phone, analysers, an imaging archive, a TPA portal, a family member's handset and years of backups.",
    howToRead: [
      {
        title: "Pick your model",
        body: "Switch between Integrated clinic + diagnostics, Standalone clinic and Diagnostic laboratory to see the journey each kind of practice actually runs. This is not a filter over one journey - a standalone clinic has no analysers and refers testing out, a laboratory has no consultation but adds collection, transport and instruments, and the integrated model runs both. The stage count and the place-counter recalculate for the model you choose.",
      },
      {
        title: "When it leaves you",
        body: "A violet left edge and a tag mark everything outside your practice - referring doctors, hospitals, external labs and imaging centres, reference laboratories, insurers and TPAs, employers who paid for a health check, device and AI vendors, couriers, and the family member who receives the report. Once data lands there your control is indirect: it runs through your contract and instructions, not your admin panel. Risk is shown separately, as an amber or red fill - so an outside system can be low risk, and a phone at your own reception desk can be the worst thing on the page.",
      },
      {
        title: "Where control breaks",
        body: "Red flags mark the hotspots - the eight places clinics and labs most often lose control of patient data, from symptoms arriving on a personal phone before any record exists, to a report sent to a number nobody verified, to a specimen still sitting in a freezer under someone's name. Tap any system to see what it holds and how to fix it.",
      },
    ],
    ctaHeading: "Now check whether your controls hold up",
    ctaBody:
      "The map shows where patient data travels in a typical clinic or diagnostic lab. The 3-minute readiness scan checks whether your practice has the controls that matter at each hotspot - and the Discovery tool builds your own data inventory.",
    ctaButton: "Take the clinic & lab risk scan",
  },
  disclaimer:
    "This is a reference model of a typical clinic or diagnostic laboratory - not a scan of your systems, and not medical or legal advice. Your own flow may have fewer or more stops depending on how you operate.",
  assessmentRoute: "/assessment/clinics-diagnostic-labs",
  // Bucket keys of lib/data/industry-assessment/packs/clinics-diagnostic-labs.ts.
  // The pack test asserts each one still exists there (drift guard).
  assessmentBuckets: [
    "patient_data_collection",
    "health_data_sensitivity",
    "report_sharing_communication",
    "system_staff_vendor_access",
    "retention_incident_readiness",
  ],
  // A real niche in lib/discovery/data.generated.ts ("Clinics & polyclinics").
  // `diagnostic-labs` exists there too; `clinics` is the sector's primary name.
  discoveryNicheId: "clinics",
  stages: CLINICS_DIAGNOSTIC_LABS_STAGES,
  dataCategories: CLINICS_DIAGNOSTIC_LABS_DATA_CATEGORIES,
  personas: CLINICS_DIAGNOSTIC_LABS_PERSONAS,
  nodes: CLINICS_DIAGNOSTIC_LABS_NODES,
  edges: CLINICS_DIAGNOSTIC_LABS_EDGES,
  hotspots: CLINICS_DIAGNOSTIC_LABS_HOTSPOTS,
  // The two shared, opt-in walkthrough sections (see scenarios.ts). Content
  // only - the engine has rendered these since the schools-colleges cycle.
  rightsScenarios: CLINICS_DIAGNOSTIC_LABS_RIGHTS_SCENARIOS,
  incidentScenarios: CLINICS_DIAGNOSTIC_LABS_INCIDENT_SCENARIOS,
};

export default clinicsDiagnosticLabsDataFlowPack;
