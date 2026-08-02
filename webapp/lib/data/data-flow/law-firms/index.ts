// Law Firms & Legal Consultants Personal Data Flow pack - assembled config.
// Spec: docs/SaralPrivacy_LawFirms_DataFlow_Spec.md.
// Same presentation framework as recruitment, CA, training institutes, D2C,
// clinics and schools; only content differs.
//
// THREE operating models are genuine, different data journeys - not cosmetic
// filters (spec §2, confirmed with Dilip before authoring):
//   litigation   - collects evidence about third parties and files it into a
//                  public record. No data room, no closing set.
//   corporate    - receives other people's personal data in BULK into a data
//                  room, and files with the MCA or a sector regulator.
//   full-service - runs both, and adds a central precedent and knowledge layer
//                  that reuses matter content across practices and offices.
//
// LITIGATION is the DEFAULT (it is what most Indian firms and independent
// advocates searching this actually run, and it drives the /data-mapping card
// stats). FULL-SERVICE is the SUPERSET - it appears in every gated tag and
// renders the full union. Default therefore does NOT equal superset, which is
// the schools and D2C pattern rather than the clinics one.
//
// The STAGE SPINE is model-gated (13 / 13 / 16). See stages.ts.
//
// ⛔ LANGUAGE LOCKS - tighter than any other pack, because the audience are
// lawyers and an overclaim will be spotted immediately:
//   · "high-impact client data", never "sensitive personal data"
//   · DPDPA scope only - no Bar Council rules, no privilege doctrine, no
//     professional-conduct or retention-schedule claims. Custody and control,
//     never legal status.
//   · erasure is handled with care: a litigation file genuinely can have
//     grounds to be kept, and the map must never imply otherwise.

import type { DataFlowPack } from "../../../data-flow/schemas.ts";
import { LAW_FIRMS_STAGES } from "./stages.ts";
import { LAW_FIRMS_DATA_CATEGORIES } from "./data-categories.ts";
import { LAW_FIRMS_PERSONAS } from "./personas.ts";
import { LAW_FIRMS_NODES } from "./nodes.ts";
import { LAW_FIRMS_EDGES } from "./edges.ts";
import { LAW_FIRMS_HOTSPOTS } from "./hotspots.ts";
import { LAW_FIRMS_INCIDENT_SCENARIOS, LAW_FIRMS_RIGHTS_SCENARIOS } from "./scenarios.ts";

export const lawFirmsDataFlowPack: DataFlowPack = {
  industry: "law-firms",
  title: "Law Firm Client & Matter Data Flow Map",
  mainActor: "Client",
  businessModels: [
    { id: "litigation", label: "Litigation & dispute resolution" },
    { id: "corporate", label: "Corporate, transactional & advisory" },
    { id: "full-service", label: "Full-service multi-office firm" },
  ],
  lexicon: {
    subject: "client",
    subjectArtefact: "One client's matter file",
    // "firm" reads correctly in "outside your ___" for a litigation practice, a
    // corporate firm and an independent legal consultancy alike.
    org: "firm",
  },
  boundaryLabels: {
    candidate: "The client",
    agency: "Your firm",
    client: "The client organisation",
    vendor: "Legal-tech & service vendors",
    // Unusually load-bearing in this sector: courts, tribunals, registries and
    // regulators are all destinations with their own publication rules.
    government: "Courts, tribunals & regulators",
    "third-party": "Others who receive it",
    // The sector's signature. A filed document IS public - see hotspot #1.
    public: "On the public record",
  },
  presentation: {
    eyebrow: "Law Firms & Legal Consultants",
    h1: "One client. Many matters. Many systems. One firm's responsibility.",
    intro:
      "Follow one client's matter through conflict checks, engagement and KYC, instructions arriving on WhatsApp, evidence and due diligence, the document system, drafting and AI, external counsel and experts, court and regulatory filing, billing, closure and long-term archives - and count every place it ends up, and where you lose control of it.",
    metaTitle: "Law Firm Client & Matter Data Flow Map | SaralPrivacy",
    metaDescription:
      "See how client and matter data moves through conflict checks, KYC, evidence, data rooms, drafting, external counsel, court filings, billing and closed-matter archives - and where DPDPA risk appears for a law firm.",
    ogTitle: "Where does one law firm client's data go?",
    ogDescription:
      "Follow client and matter information across intake, KYC, evidence, the matter file, external counsel, courts and regulators, billing and archives, in three law-firm operating models.",
    breadcrumbLabel: "Law Firms & Legal Consultants",
    previewBlurb:
      "Before you fix anything, see the problem. One client's matter moves through a partner's personal phone, a WhatsApp thread carrying the whole case, a document system everyone can open, an AI tool nobody approved, counsel's chambers, a court filing that becomes public, an invoice that tells the story, and an archive that never deletes anything.",
    howToRead: [
      {
        title: "Pick your model",
        body: "Switch between Litigation & dispute resolution, Corporate, transactional & advisory and Full-service multi-office firm to see the journey each kind of practice actually runs. This is not a filter over one journey - a litigation practice gathers evidence about the other side and files it into a public record and has no data room; a corporate practice takes in a target company's employee files in bulk and files with the MCA and never drafts an affidavit; a full-service firm runs both and adds a precedent bank that reuses matter content across offices. The stage count and the place-counter recalculate for the model you choose.",
      },
      {
        title: "When it leaves you",
        body: "A violet left edge and a tag mark everything outside your firm - counsel and their clerks, experts, translators and notaries, filing agents, e-discovery and data-room providers, the transcription service, the courts and regulators you file with, the other side and their lawyers, and anything that lands on a public record. Once data is there your control is indirect at best: it runs through your instructions and your contract, not your document system. Risk is shown separately, as an amber or red fill - so an outside system can be low risk, and a junior's own laptop can be one of the worst things on the page.",
      },
      {
        title: "Where control breaks",
        body: "Red flags mark the hotspots - the eight places law firms most often lose control of client and matter data, from an annexure that becomes public exactly as the client sent it, to a whole case arriving on a personal phone, to closed matters that are simply never deleted. Tap any system to see what it holds and how to fix it.",
      },
    ],
    ctaHeading: "Now check whether your controls hold up",
    ctaBody:
      "The map shows where client and matter data travels in a typical law firm. The 3-minute readiness scan checks whether your firm has the controls that matter at each hotspot - and the Discovery tool builds your own data inventory.",
    ctaButton: "Take the law firm risk scan",
  },
  disclaimer:
    "This is a reference model of a typical law firm or legal consultancy - not a scan of your systems, not legal advice, and not a matter-file retention schedule. It describes where data sits and who controls it, not the legal status of any document. Your own flow may have fewer or more stops depending on how you practise.",
  assessmentRoute: "/assessment/law-firms",
  // Bucket keys of lib/data/industry-assessment/packs/law-firms.ts. The pack
  // test asserts each one still exists there (drift guard), and the deep-link
  // guard test asserts the assessment client handles every one of them.
  assessmentBuckets: [
    "client_matter_data",
    "case_evidence_sensitivity",
    "document_sharing_court_workflow",
    "staff_junior_vendor_access",
    "retention_incident_readiness",
  ],
  // An exact-match niche in lib/discovery/data.generated.ts. `advocate` also
  // exists and would be the better pick if this map modelled solo practice;
  // `legaltech` is a different business (software vendors), not this map.
  discoveryNicheId: "law-firms",
  stages: LAW_FIRMS_STAGES,
  dataCategories: LAW_FIRMS_DATA_CATEGORIES,
  personas: LAW_FIRMS_PERSONAS,
  nodes: LAW_FIRMS_NODES,
  edges: LAW_FIRMS_EDGES,
  hotspots: LAW_FIRMS_HOTSPOTS,
  rightsScenarios: LAW_FIRMS_RIGHTS_SCENARIOS,
  incidentScenarios: LAW_FIRMS_INCIDENT_SCENARIOS,
};

export default lawFirmsDataFlowPack;
