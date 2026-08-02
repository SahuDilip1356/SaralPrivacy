// The eight hotspots for a law firm, ranked worst-first.
//
// THE COUNT IS DERIVED, NOT CHOSEN (spec §3). Eleven of the sixteen stages are
// all-model; eight of them carry a hotspot, and every hotspot node is UNGATED
// with its EARLIEST stage on that distinct all-model stage:
//
//   1 court-filing-portal .. authority (10)    5 public-ai-tool ...... analysis (7)
//   2 client-whatsapp ...... intake (3)        6 firm-archive-backup . archive (16)
//   3 matter-dms ........... matter-file (6)   7 kyc-id-folder ....... engagement (2)
//   4 external-counsel ..... external (9)      8 billing-narrative ... billing (13)
//
// ⇒ flags = 8 = counter in litigation, corporate and full-service, by
// arithmetic rather than by anyone checking. See nodes.ts for why this matters
// and the `hotspots reconcile with the counter` guard test for what happens if
// it stops being true.
//
// Buckets map to lib/data/industry-assessment/packs/law-firms.ts. All FIVE of
// the pack's buckets are reachable from this rail, and every one of them must
// also appear in the assessment client's BUCKET_FOCUS or the deep-link guard
// test fails.
//
// RANK 1 IS THE SECTOR'S SIGNATURE. Every other map's worst case is data
// reaching someone it should not have. Here the worst case is data reaching
// exactly who it was meant to - the court - carrying more than it needed to,
// after which nothing can be undone.
//
// LANGUAGE LOCK (spec §5): custody and control, never privilege, professional
// conduct or legal advice. The audience are lawyers and will notice.

import type { FlowHotspot } from "../../../data-flow/schemas.ts";

export const LAW_FIRMS_HOTSPOTS: FlowHotspot[] = [
  {
    id: "hs-unredacted-filing",
    rank: 1,
    nodeId: "court-filing-portal",
    title: "What you file becomes public, exactly as the client sent it",
    whatHappens:
      "Annexures go up with the submission in the form they arrived - full bank statements, a medical report, a salary slip, a chat export naming children and family members - because the question asked was 'what proves the point', not 'what has to be on the record'.",
    whyItMatters:
      "Filing is the one place in this map where control ends permanently. A document on a public record is indexed, copied and quoted, and no engagement letter, deletion request or change of lawyer reverses it.",
    dataCategoryIds: ["court-filings", "financial-records", "health-records", "third-party-records"],
    action:
      "Make redaction a step in the filing checklist, not a judgement call: decide what the forum actually requires, mask the rest, and keep the full version in the matter file.",
    assessmentBucket: "document_sharing_court_workflow",
  },
  {
    id: "hs-whatsapp-intake",
    rank: 2,
    nodeId: "client-whatsapp",
    title: "The whole case arrives on a personal phone",
    whatHappens:
      "Clients send statements, medical papers, photographs and screenshots of the other side's messages straight into a WhatsApp thread, where they auto-download to a personal handset and back up to a personal cloud account.",
    whyItMatters:
      "This is usually the richest single collection of high-impact data in the matter, and it sits where the firm cannot search it, protect it or delete it - including material about people who never engaged the firm at all.",
    dataCategoryIds: ["evidence-media", "financial-records", "health-records", "third-party-records"],
    action:
      "Give clients one controlled intake route - a portal or an official channel - and stop accepting matter documents on personal chat, including from long-standing clients.",
    assessmentBucket: "document_sharing_court_workflow",
  },
  {
    id: "hs-open-matter-access",
    rank: 3,
    nodeId: "matter-dms",
    title: "Everyone in the firm can open every matter",
    whatHappens:
      "Access is granted by joining the firm rather than by joining the matter, so a matrimonial file, a criminal brief and a harassment investigation are all readable by anyone with a login - including this term's interns.",
    whyItMatters:
      "The most sensitive matters a firm handles are precisely the ones where an unnecessary reader causes real harm, and open access means the firm cannot say who has read what.",
    dataCategoryIds: ["allegation-records", "health-records", "third-party-records", "legal-work-product"],
    action:
      "Move to matter-based access with a restricted setting for high-impact matters, and review who can open what when people join, move team or leave.",
    assessmentBucket: "staff_junior_vendor_access",
  },
  {
    id: "hs-whole-file-to-counsel",
    rank: 4,
    nodeId: "external-counsel",
    title: "The whole file goes out when part of it would do",
    whatHappens:
      "Counsel, experts, translators, notaries and filing agents each receive the same assembled pack because it is the one that already exists - and nobody records who got which version or what happens to it afterwards.",
    whyItMatters:
      "Each recipient becomes a separate, permanent copy of the matter outside the firm, with their own staff and storage, and no agreed end point. A later request cannot reach any of them.",
    dataCategoryIds: ["court-filings", "evidence-media", "legal-work-product", "third-party-records"],
    action:
      "Build the pack for the recipient rather than reusing one, keep a note of who received what and why, and set a return-or-destroy expectation in the instruction letter.",
    assessmentBucket: "staff_junior_vendor_access",
  },
  {
    id: "hs-public-ai-tool",
    rank: 5,
    nodeId: "public-ai-tool",
    title: "Matter facts pasted into a public AI tool",
    whatHappens:
      "A junior pastes a statement, a notice or a set of facts into a general-purpose chatbot to summarise or draft - names, dates, allegations and figures included - because it is quicker and nobody said not to.",
    whyItMatters:
      "That is a disclosure to an outside service the firm never contracted with, and the prompt history persists somewhere the firm has no access to and cannot delete.",
    dataCategoryIds: ["allegation-records", "instructions-communications", "legal-work-product", "case-assessment"],
    action:
      "Provide an approved tool with written terms, say plainly that client facts must not go into consumer AI services, and make sure every intern hears it in week one.",
    assessmentBucket: "case_evidence_sensitivity",
  },
  {
    id: "hs-nothing-is-deleted",
    rank: 6,
    nodeId: "firm-archive-backup",
    title: "Closed matters are kept forever, by default",
    whatHappens:
      "A matter is marked closed and nothing else happens. The file, its evidence, its identity documents and its backups stay complete and restorable, because 'we might need it if there's an appeal' has no end date attached.",
    whyItMatters:
      "A litigation file genuinely does have grounds to be kept for a period - but a period is not forever, and a firm that keeps everything cannot tell the difference between what it must retain and what it has simply never deleted.",
    dataCategoryIds: ["client-kyc", "evidence-media", "third-party-records", "allegation-records"],
    action:
      "Set a retention period per matter type with a named owner, record the reason whenever something is kept longer, and make deletion a scheduled step rather than an intention.",
    assessmentBucket: "retention_incident_readiness",
  },
  {
    id: "hs-kyc-by-default",
    rank: 7,
    nodeId: "kyc-id-folder",
    title: "Full ID documents collected because that is what is always done",
    whatHappens:
      "PAN, Aadhaar and passport scans are taken at matter opening whether or not the engagement needs them, dropped into a folder alongside the client's papers, and kept long after the matter ends.",
    whyItMatters:
      "Identity documents are the most reusable thing a firm holds and the most damaging to lose, and most of the copies exist because of habit rather than a requirement anybody can point to.",
    dataCategoryIds: ["client-kyc", "client-identity", "property-corporate-docs"],
    action:
      "Write down which documents each type of engagement actually requires, keep the verification result rather than every full scan, and restrict the folder to the people who need it.",
    assessmentBucket: "client_matter_data",
  },
  {
    id: "hs-billing-narrative",
    rank: 8,
    nodeId: "billing-narrative",
    title: "The invoice tells the story of the matter",
    whatHappens:
      "Time entries are written in the matter's own language - the allegation, the medical report, the family member - and the invoice travels to the firm's accounts team and the client's accounts payable.",
    whyItMatters:
      "People with no reason to know the facts of a matter read them routinely, and an invoice is one of the most widely circulated documents a firm produces.",
    dataCategoryIds: ["billing-time", "allegation-records", "health-records", "matter-metadata"],
    action:
      "Write narratives at the level of the task rather than the facts, and keep matter detail in the matter file where the access rules apply.",
    assessmentBucket: "client_matter_data",
  },
];
