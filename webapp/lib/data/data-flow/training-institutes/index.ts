// Training Institutes Personal Data Flow pack - assembled config.
// Spec: docs/SaralPrivacy_TrainingInstitutes_DataFlow_Spec.md (v1).
// Same presentation framework as recruitment and CA; only content differs.
//
// THREE operating models (classroom / hybrid / online) are genuine, different
// data journeys - not cosmetic filters. Hybrid is the default and the full
// union; classroom and online each render their honest subset via node gating.

import type { DataFlowPack } from "../../../data-flow/schemas.ts";
import { TRAINING_INSTITUTES_STAGES } from "./stages.ts";
import { TRAINING_INSTITUTES_DATA_CATEGORIES } from "./data-categories.ts";
import { TRAINING_INSTITUTES_PERSONAS } from "./personas.ts";
import { TRAINING_INSTITUTES_NODES } from "./nodes.ts";
import { TRAINING_INSTITUTES_EDGES } from "./edges.ts";
import { TRAINING_INSTITUTES_HOTSPOTS } from "./hotspots.ts";
import {
  TRAINING_INSTITUTES_INCIDENT_SCENARIOS,
  TRAINING_INSTITUTES_RIGHTS_SCENARIOS,
} from "./scenarios.ts";

export const trainingInstitutesDataFlowPack: DataFlowPack = {
  industry: "training-institutes",
  title: "Training Institute Personal Data Flow Map",
  mainActor: "Student",
  // Three honest journeys. Hybrid (first = default) is the full union; a pure
  // coaching centre and a pure EdTech platform genuinely differ, and the node
  // gating renders each as a distinct picture rather than one greyed out.
  businessModels: [
    { id: "hybrid", label: "Hybrid institute" },
    { id: "classroom", label: "Classroom / coaching centre" },
    { id: "online", label: "Online / EdTech" },
  ],
  lexicon: {
    subject: "student",
    subjectArtefact: "One student's record",
    org: "institute",
  },
  boundaryLabels: {
    candidate: "The student",
    agency: "Your institute",
    client: "Parent / guardian",
  },
  presentation: {
    eyebrow: "Training Institutes",
    h1: "One student. Many systems. One institute's responsibility.",
    intro:
      "Follow one student's record as it moves through enquiries, counselling, admission, fees, classrooms, LMS platforms, assessments, WhatsApp groups, placements and years of archives - and count every place it ends up, and where you lose control of it.",
    metaTitle: "Training Institute Personal Data Flow Map - Where Student Data Travels",
    metaDescription:
      "Interactive map of how a training institute's student and parent data moves through enquiries, admissions, payments, classes, LMS platforms, proctoring, WhatsApp groups, placements and archives - and where DPDPA risk appears.",
    ogTitle: "One student. Many systems. One institute's responsibility. - Training Institute Personal Data Flow Map",
    ogDescription:
      "See how a training institute's student data travels across classroom, hybrid and online models, every place it ends up, and where control breaks.",
    breadcrumbLabel: "Training Institutes",
    previewBlurb:
      "Before you fix anything, see the problem. One student's data moves through enquiries, counselling, admission, fees, classes, the LMS, assessments, WhatsApp groups, placements and archives.",
    howToRead: [
      {
        title: "Pick your model",
        body: "Switch between Classroom, Hybrid and Online to see the systems each kind of institute actually uses. Hybrid shows the full picture; classroom and online show their honest subset. The place-counter recalculates for the model you choose.",
      },
      {
        title: "When it leaves you",
        body: "A violet left edge and a tag mark systems outside your institute - parents, payment gateways, LMS and EdTech vendors, proctoring platforms, employers and ad networks. Once data lands there your control is indirect: it runs through your contract and instructions, not your admin panel. Risk is shown separately, as an amber or red fill - so an outside system can be low risk, and an in-house one high risk.",
      },
      {
        title: "Where control breaks",
        body: "Red flags mark the hotspots - where institutes most often lose control of student data, from children's numbers in WhatsApp groups to proctoring a minor's webcam to a decade of undeleted records. Tap any system to see what it holds and how to fix it.",
      },
    ],
    ctaHeading: "Now check whether your controls hold up",
    ctaBody:
      "The map shows where student data travels in a typical institute. The 3-minute readiness scan checks whether your institute has the controls that matter at each hotspot - and the Discovery tool builds your own data inventory.",
    ctaButton: "Take the training institute risk scan",
  },
  disclaimer:
    "This is a reference model of a typical training institute - not a scan of your systems. Your own flow may have fewer or more stops depending on your model.",
  assessmentRoute: "/assessment/training-institutes",
  // Bucket keys of lib/data/industry-assessment/packs/training-institutes.ts.
  // The pack test asserts each one still exists there (drift guard).
  assessmentBuckets: [
    "student_data_collection",
    "communication_marketing",
    "lms_vendor_platform",
    "minor_parental_consent",
    "retention_rights",
  ],
  discoveryNicheId: "training-institutes",
  stages: TRAINING_INSTITUTES_STAGES,
  dataCategories: TRAINING_INSTITUTES_DATA_CATEGORIES,
  personas: TRAINING_INSTITUTES_PERSONAS,
  nodes: TRAINING_INSTITUTES_NODES,
  edges: TRAINING_INSTITUTES_EDGES,
  hotspots: TRAINING_INSTITUTES_HOTSPOTS,
  // The two shared, opt-in walkthrough sections (see scenarios.ts). Content
  // only - the engine has rendered these since the schools-colleges cycle.
  rightsScenarios: TRAINING_INSTITUTES_RIGHTS_SCENARIOS,
  incidentScenarios: TRAINING_INSTITUTES_INCIDENT_SCENARIOS,
};

export default trainingInstitutesDataFlowPack;
