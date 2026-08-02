// Law firm matter lifecycle - 16 stages in the union, MODEL-GATED to 13 / 13 / 16.
// Spec: docs/SaralPrivacy_LawFirms_DataFlow_Spec.md §2.
//
// A candidate's data flows once. A CA client's returns every year. A law firm's
// matter file is an ADVERSARIAL record that becomes PUBLIC BY DESIGN: it is
// assembled in order to be used against someone, and the moment it is filed the
// firm's control over it ends permanently.
//
// The three models are genuinely different processes, not one journey with
// different systems (spec §2):
//   litigation   - collects evidence about third parties, files into a public
//                  record. No data room, no closing set.
//   corporate    - receives other people's personal data in BULK into a data
//                  room. Files with the MCA or a sector regulator, never an
//                  affidavit.
//   full-service - runs both, and adds a central precedent/knowledge layer that
//                  reuses matter content across practices and offices.
//
// ELEVEN of the sixteen stages are ALL-MODEL. That is load-bearing: all eight
// hotspots sit on eight DISTINCT all-model stages, so the journey's red flags
// reconcile with the hotspot counter by arithmetic in every model (spec §3,
// guard test (a)). Do not gate an all-model stage without re-deriving §3.
//
// `authority` is deliberately all-model: every one of these firms submits
// personal data to a body with its own publication and retention rules. WHICH
// body differs - court registry vs MCA vs sector regulator - and that is
// content, not structure.

import type { FlowStage } from "../../../data-flow/schemas.ts";

export const LAW_FIRMS_STAGES: FlowStage[] = [
  {
    id: "enquiry",
    name: "Enquiry, conflict check & the first conversation",
    sequence: 1,
    summary:
      "Someone calls, messages or walks in with a problem. Before any engagement exists they describe the facts, name the other side, and often send the first document - so the firm holds a stranger's dispute and a counterparty's name before it has decided to act.",
    dpdpaNote:
      "You are collecting personal data - about the enquirer and about people they name - from the first conversation. Say what you collect and why, and decide how long a rejected enquiry is kept.",
  },
  {
    id: "engagement",
    name: "Engagement, KYC & matter opening",
    sequence: 2,
    summary:
      "The engagement letter is signed, identity documents are collected, and a matter is opened in the firm's systems. One client record and one matter number now exist, and every system downstream copies from them.",
    dpdpaNote:
      "Collect only the identity documents the engagement actually needs, and use the engagement letter to explain how data will be used, shared, stored and kept.",
  },
  {
    id: "intake",
    name: "Instructions, documents & client uploads",
    sequence: 3,
    summary:
      "The client sends everything they have - contracts, bank statements, chat screenshots, photographs, medical papers - by email, WhatsApp, a shared link and a bundle of hard copies, usually all four for the same matter.",
    dpdpaNote:
      "Every intake channel is a place a later access or deletion request has to reach. One controlled channel is worth more than any policy about the others.",
  },
  {
    id: "evidence",
    name: "Evidence, witnesses & third-party records",
    sequence: 4,
    summary:
      "Material is gathered about people who never engaged the firm - the opposing party, witnesses, family members, employees. Call recordings, device extractions, screenshots of someone else's messages, medical and financial records obtained for the dispute.",
    dpdpaNote:
      "Most of this data belongs to people you have no relationship with and cannot notify. Hold only what the matter needs, and keep it separately from routine files.",
    businessModels: ["litigation", "full-service"],
  },
  {
    id: "diligence",
    name: "Due diligence & the data room",
    sequence: 5,
    summary:
      "A target company's records are uploaded in bulk into a virtual data room - complete employee files, customer contracts, director and shareholder records - and opened to a deal team, advisors and bidders under access groups nobody re-reads.",
    dpdpaNote:
      "The individuals in a data room are the target's employees and customers, not your client. Minimise and redact before upload, not after a question is raised.",
    businessModels: ["corporate", "full-service"],
  },
  {
    id: "matter-file",
    name: "The matter file, DMS & working copies",
    sequence: 6,
    summary:
      "Everything is consolidated into the matter file - and simultaneously duplicated onto associate laptops, a personal drive, a print-out and the physical file room. The document system is where the firm believes the matter lives.",
    dpdpaNote:
      "Access should follow the matter team, not the firm. If everyone can open every matter, a family or criminal file is open to everyone too.",
  },
  {
    id: "analysis",
    name: "Research, analysis & AI-assisted drafting",
    sequence: 7,
    summary:
      "Facts become legal analysis: a chronology, an issue list, a settlement position, a view on the other side's witnesses. Research platforms and AI tools are used to summarise and draft, and matter facts are pasted into them.",
    dpdpaNote:
      "The analysis is new personal data you created about identifiable people. An AI tool you never contracted with is a disclosure, not a feature.",
  },
  {
    id: "drafting",
    name: "Drafting, review & client approval",
    sequence: 8,
    summary:
      "Pleadings, agreements, affidavits and schedules are drafted, redlined, printed, emailed for approval and revised - so the same personal data exists in a dozen near-identical versions across a dozen places.",
    dpdpaNote:
      "Version sprawl is a privacy problem, not only a housekeeping one: it decides how many copies a later request has to find and correct.",
  },
  {
    id: "external",
    name: "External counsel, experts, translators & agents",
    sequence: 9,
    summary:
      "The file leaves the firm. Senior counsel, experts and valuers, translators, notaries, filing agents, clerks and e-discovery vendors each receive a copy - very often the whole file when a subset would do.",
    dpdpaNote:
      "Share the minimum the recipient's task needs, record who received what and why, and agree what happens to their copy when the work ends.",
  },
  {
    id: "authority",
    name: "Court, tribunal & regulatory filing",
    sequence: 10,
    summary:
      "The submission is made - to a court or tribunal e-filing portal, a registry counter, the MCA or a sector regulator. Personal data crosses out of the firm's private file into a system with its own publication and retention rules.",
    dpdpaNote:
      "Once filed, control ends. Apply minimisation and redaction BEFORE submission, because there is no meaningful way to withdraw it afterwards.",
  },
  {
    id: "hearing",
    name: "Hearings, orders, settlement & enforcement",
    sequence: 11,
    summary:
      "Hearing notes, video-hearing recordings, transcripts, orders and settlement terms accumulate - on the record, in the matter file, on a junior's laptop and in the client's WhatsApp thread.",
    dpdpaNote:
      "Orders and settlement terms carry the matter's most sensitive facts. Send them to the verified client contact, not to a group.",
    businessModels: ["litigation", "full-service"],
  },
  {
    id: "closing",
    name: "Signing, closing sets & completion",
    sequence: 12,
    summary:
      "Signature pages, funds-flow details, disclosure schedules and the completed closing set are assembled and distributed to every party, their advisors, the bank and the archive at once.",
    dpdpaNote:
      "Name one system of record for the closing set, and remove the duplicates the signing process created along the way.",
    businessModels: ["corporate", "full-service"],
  },
  {
    id: "billing",
    name: "Time recording, billing & expenses",
    sequence: 13,
    summary:
      "Time entries describe the work in the matter's own words, expenses carry receipts and third-party details, and the invoice travels to the client's accounts team and into the firm's finance systems.",
    dpdpaNote:
      "A narrative written for a partner is read by finance staff and the client's accounts payable. Keep matter facts out of the line item.",
  },
  {
    id: "knowledge",
    name: "Precedent bank, knowledge reuse & cross-office pitching",
    sequence: 14,
    summary:
      "The matter becomes reusable material: a precedent in the drafting bank, an entry in the experience database, a line in a pitch, a result in a directory submission - and a document in a firm-wide search index.",
    dpdpaNote:
      "Reuse is where a closed matter quietly becomes permanent. Anonymise before a document becomes a precedent, and keep search results inside the original matter's access rules.",
    businessModels: ["full-service"],
  },
  {
    id: "closure",
    name: "Matter closure, legal hold & return of documents",
    sequence: 15,
    summary:
      "The matter is marked closed. Originals may be returned, a hold may be recorded, access should be revoked - and in practice the file simply stops being opened while remaining exactly where it was.",
    dpdpaNote:
      "Closure is a decision point, not an event. Separate what genuinely must be kept from what has merely never been deleted, and write down which is which.",
  },
  {
    id: "archive",
    name: "Archives, backups & the record room",
    sequence: 16,
    summary:
      "The file settles into long-term storage - the archive, nightly backups, an offsite records vault, the physical record room, and whatever is still sitting on the laptop of an associate who left two years ago.",
    dpdpaNote:
      "Retention needs a defined period and an owner. \"In case of appeal\" is a reason to keep a file for a stated time, not a reason to keep everything forever.",
  },
];
