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
  disclaimer:
    "This is a reference model of a typical recruitment business - not a scan of your systems. Your own flow may have fewer or more stops.",
  assessmentRoute: "/assessment/recruitment",
  discoveryNicheId: "recruitment-staffing",
  stages: RECRUITMENT_STAGES,
  dataCategories: RECRUITMENT_DATA_CATEGORIES,
  personas: RECRUITMENT_PERSONAS,
  nodes: RECRUITMENT_NODES,
  edges: RECRUITMENT_EDGES,
  hotspots: RECRUITMENT_HOTSPOTS,
};

export default recruitmentDataFlowPack;
