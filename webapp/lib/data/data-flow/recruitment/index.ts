// Recruitment Personal Data Flow pack - assembled config.
// Spec: docs/SaralPrivacy_Recruitment_DataFlow_Spec.md (+ v1.1 addendum).
// Adding another industry = clone this folder shape with new content; the
// schemas, tests and (later) UI need no changes.

import type { DataFlowPack } from "../../../data-flow/schemas.ts";
import { RECRUITMENT_STAGES } from "./stages.ts";
import { RECRUITMENT_DATA_CATEGORIES } from "./data-categories.ts";
import { RECRUITMENT_PERSONAS } from "./personas.ts";
import { RECRUITMENT_NODES } from "./nodes.ts";
import { RECRUITMENT_EDGES } from "./edges.ts";
import { RECRUITMENT_HOTSPOTS } from "./hotspots.ts";

export const recruitmentDataFlowPack: DataFlowPack = {
  industry: "recruitment-agencies",
  title: "Recruitment Personal Data Flow Map",
  mainActor: "Candidate",
  // Two honest journeys: permanent (the client employs) vs staffing (the agency
  // employs and deploys - adds onboarding/exit, payroll, statutory data).
  businessModels: [
    { id: "permanent", label: "Permanent recruitment" },
    { id: "staffing", label: "Staffing / RPO" },
  ],
  // Exactly the words the components hard-coded before they became per-pack -
  // so this map renders identically to how it shipped.
  lexicon: {
    subject: "candidate",
    subjectArtefact: "One candidate's CV",
    org: "agency",
  },
  // Exact strings the recruitment route hard-coded before the page became a
  // shared dynamic route - so the page renders identically.
  presentation: {
    eyebrow: "Recruitment",
    h1: "One candidate. Many systems. One business responsibility.",
    intro:
      "Follow a single resume as it moves through job portals, email, WhatsApp, ATS platforms, spreadsheets, clients, vendors, AI tools and backups - and count every place it ends up, and where you lose control of it.",
    metaTitle: "Recruitment Personal Data Flow Map - Where Candidate Data Travels",
    metaDescription:
      "Interactive map of how candidate data moves through a recruitment business - job portals, ATS, WhatsApp, Excel, clients, BGV vendors, AI tools and backups - and where DPDPA risk appears.",
    ogTitle: "One candidate. Many systems. One responsibility. - Recruitment Personal Data Flow Map",
    ogDescription:
      "See how candidate data travels through a typical recruitment business, every place it ends up, and where control breaks.",
    breadcrumbLabel: "Recruitment Agencies",
    previewBlurb:
      "Before you fix anything, see the problem. One candidate's CV moves through job portals, email, WhatsApp, ATS, spreadsheets, clients, vendors, AI tools and backups.",
    howToRead: [
      {
        title: "The places add up",
        body: "Each stage shows the new places the data reaches - inboxes, spreadsheets, laptops, vendor tools, backups. Every place is counted once, so the running counter always matches the systems listed above it.",
      },
      {
        title: "When it leaves you",
        body: "A violet left edge and a tag mark systems outside your agency - clients, vendors, public sources and third parties. Once data lands there your control is indirect: it runs through your contract and your instructions, not your admin panel. Risk is shown separately, as an amber or red fill - so an outside system can be low risk, and an in-house one can be high risk.",
      },
      {
        title: "Where control breaks",
        body: "Red flags mark the hotspots - the stages where agencies most often lose track of candidate data. Tap any system to see what it holds and how to fix it.",
      },
    ],
    ctaHeading: "Now check whether your controls hold up",
    ctaBody:
      "The map shows where candidate data travels in a typical agency. The 3-minute readiness scan checks whether your agency has the controls that matter at each hotspot - and the Discovery tool builds your own data inventory.",
    ctaButton: "Take the recruitment risk scan",
  },
  disclaimer:
    "This is a reference model of a typical recruitment business - not a scan of your systems. Your own flow may have fewer or more stops.",
  assessmentRoute: "/assessment/recruitment",
  // Bucket keys of lib/data/industry-assessment/packs/recruitment-agencies.ts.
  // The pack test asserts each one still exists there (drift guard).
  assessmentBuckets: [
    "candidate_sourcing",
    "candidate_document",
    "client_sharing",
    "ats_tool_access",
    "retention_rights",
  ],
  discoveryNicheId: "recruitment-staffing",
  stages: RECRUITMENT_STAGES,
  dataCategories: RECRUITMENT_DATA_CATEGORIES,
  personas: RECRUITMENT_PERSONAS,
  nodes: RECRUITMENT_NODES,
  edges: RECRUITMENT_EDGES,
  hotspots: RECRUITMENT_HOTSPOTS,
};

export default recruitmentDataFlowPack;
