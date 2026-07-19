// The canonical 7 hotspots - P0 content single source of truth
// (v1.1 addendum §G). Ranked worst-first. Hotspot 7 (BGV vendor transfer)
// maps to `candidate_document` per §G's "pick one and document" rule: the
// exposure is the document bundle itself, not the client relationship
// (decision logged in docs/data-flow-build/decision-log.md).

import type { FlowHotspot } from "../../../data-flow/schemas.ts";

export const RECRUITMENT_HOTSPOTS: FlowHotspot[] = [
  {
    id: "hs-personal-whatsapp",
    rank: 1,
    nodeId: "personal-whatsapp",
    title: "Personal WhatsApp holds candidate documents",
    whatHappens: "CVs, ID documents and salary chats sit on recruiters' personal phones, auto-downloaded and backed up to personal cloud accounts.",
    whyItMatters: "The agency cannot find, protect or delete these copies - an erasure request cannot reach a personal phone backup.",
    dataCategoryIds: ["identity", "professional", "financial", "communication"],
    action: "Move to an official business account, stop exchanging identity documents in chat, and record key interactions in the ATS.",
    assessmentBucket: "candidate_document",
  },
  {
    id: "hs-excel-tracker",
    rank: 2,
    nodeId: "excel-tracker",
    title: "Shared Excel tracker duplicates the pipeline",
    whatHappens: "The whole candidate pipeline - names, mobiles, salaries, status - lives in a spreadsheet copied per recruiter and shared onward.",
    whyItMatters: "One file leaks the entire candidate list; there is no access control, no audit trail and no deletion.",
    dataCategoryIds: ["identity", "contact", "financial", "derived"],
    action: "Keep master data in the ATS, restrict tracker access, and set a deletion rule for exports.",
    assessmentBucket: "ats_tool_access",
  },
  {
    id: "hs-client-email",
    rank: 3,
    nodeId: "client-email",
    title: "Client email attachments leave your control",
    whatHappens: "CVs with salary expectations and recruiter notes are emailed to client HR - then forwarded and stored inside the client indefinitely.",
    whyItMatters: "After submission the agency has zero visibility or control, yet remains responsible for the candidate relationship.",
    dataCategoryIds: ["identity", "professional", "financial", "derived"],
    action: "Confirm candidate willingness first, send only necessary fields, and agree client handling expectations in the contract.",
    assessmentBucket: "client_sharing",
  },
  {
    id: "hs-ai-screener",
    rank: 4,
    nodeId: "ai-screener",
    title: "Unapproved AI tool ingests CVs",
    whatHappens: "Recruiters paste CVs into free AI tools for summaries and rankings - no contract, unknown retention, possible model-training use.",
    whyItMatters: "Candidate data leaves the organisation into a tool nobody vetted, and AI-generated scores flow back into decisions unexplained.",
    dataCategoryIds: ["professional", "derived"],
    action: "Establish an approved-tool list, review provider terms, and never upload identity or financial documents.",
    assessmentBucket: "ats_tool_access",
  },
  {
    id: "hs-recruiter-laptop",
    rank: 5,
    nodeId: "recruiter-laptop",
    title: "Laptop downloads outlive the recruiter",
    whatHappens: "Downloads folders accumulate CVs and document packs locally - invisible to any system, surviving employee exits.",
    whyItMatters: "Local copies are the ones nobody can enumerate when a candidate asks 'delete my data'.",
    dataCategoryIds: ["identity", "professional", "verification"],
    action: "Work inside the ATS where possible, and wipe candidate files from devices at offboarding.",
    assessmentBucket: "candidate_document",
  },
  {
    id: "hs-indefinite-retention",
    rank: 6,
    nodeId: "candidate-database",
    title: "Old profiles kept forever 'for future roles'",
    whatHappens: "Every profile ever registered stays in the pool and shared drives, reused for new mandates years later without a fresh notice.",
    whyItMatters: "Purpose ended long ago; indefinite retention of rejected and inactive profiles is the single most common DPDPA gap.",
    dataCategoryIds: ["identity", "contact", "professional", "derived"],
    action: "Segment active vs inactive profiles, define a future-opportunity period, and delete stale records with evidence.",
    assessmentBucket: "retention_rights",
  },
  {
    id: "hs-bgv-transfer",
    rank: 7,
    nodeId: "bgv-vendor",
    title: "Identity documents emailed to the BGV vendor",
    whatHappens: "PAN, ID proofs, payslips and certificates are forwarded to verification vendors as plain email attachments.",
    whyItMatters: "The heaviest identity-document bundle in the flow travels unprotected and is retained by the vendor on unknown terms.",
    dataCategoryIds: ["identity", "financial", "education", "verification"],
    action: "Use protected transfer, send the minimum document set, and agree vendor retention and deletion contractually.",
    assessmentBucket: "candidate_document",
  },
];
