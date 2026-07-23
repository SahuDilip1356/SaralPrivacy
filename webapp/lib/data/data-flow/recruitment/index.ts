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
