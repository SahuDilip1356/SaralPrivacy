// Systems, repositories, devices, physical stores and people that hold client
// and matter data in a typical Indian law firm or legal consultancy - NOT any
// specific firm's environment (reference-model rule).
//
// Real things are named - the clerk's diary, the e-filing portal, the print
// room, outsourced dictation, the physical record room, the precedent drive -
// because a generic "practice management system" fails the "that's my firm"
// test. Storage, devices and chat channels are SPANNING nodes: they attach
// across stages, because that is where data sits over the whole matter rather
// than at one step.
//
// ⚠️ WHERE A HOTSPOT NODE STARTS IS LOAD-BEARING.
//
// The journey paints one red flag per DISTINCT stage a hotspot node resolves
// to - the FIRST of its stageIds visible in the selected model - while the
// counter prints `pack.hotspots.length`. If two hotspot nodes share a first
// stage they collapse into one flag; if a hotspot node is gated away it flags
// nothing. Either way the map's red flags stop agreeing with its own counter,
// which is the defect that recurred across maps #1-#3 and is now caught by the
// `hotspots reconcile with the counter` guard test.
//
// THE CONSTRUCTION HERE (spec §3): all eight hotspot nodes are UNGATED, and each
// one's EARLIEST stage is a distinct ALL-MODEL stage:
//
//   kyc-id-folder ......... engagement (2)    public-ai-tool ....... analysis (7)
//   client-whatsapp ....... intake (3)        external-counsel ..... external (9)
//   matter-dms ............ matter-file (6)   court-filing-portal .. authority (10)
//   billing-narrative ..... billing (13)      firm-archive-backup .. archive (16)
//
// A hotspot node may span LATER stages - the DMS genuinely does - but must never
// acquire an EARLIER one. Adding `enquiry` to `client-whatsapp`, for instance,
// would silently move its flag and break reconciliation in all three models.
//
// Deliberately NOT hotspots, because they sit on model-gated stages: the data
// room, evidence media, the hearing recording, the closing set and the precedent
// bank. Each is authored as a critical-risk node instead and renders in full
// wherever it exists (spec §3).

import type { FlowNode } from "../../../data-flow/schemas.ts";

export const LAW_FIRMS_NODES: FlowNode[] = [
  // ---- The people ---------------------------------------------------------
  {
    id: "client",
    name: "Client",
    nodeType: "person",
    boundary: "candidate",
    stageIds: ["enquiry", "engagement", "intake", "drafting", "billing", "closure"],
    description:
      "The data principal. One set of instructions, identity documents and papers - everything below is a copy, a derivative or something created about them.",
    dataCategoryIds: ["client-identity", "client-kyc", "instructions-communications", "matter-metadata"],
    accessPersonaIds: ["client"],
    retentionDefined: true,
    riskLevel: "low",
  },
  {
    id: "client-contact-person",
    name: "Client's authorised representative",
    nodeType: "person",
    boundary: "client",
    stageIds: ["engagement", "intake", "diligence", "drafting", "closing", "billing"],
    description:
      "The in-house counsel, HR or finance contact instructing on a corporate client's behalf - and the route by which other people's employment and customer records enter the firm.",
    dataCategoryIds: ["client-identity", "employment-hr-records", "third-party-records", "instructions-communications"],
    accessPersonaIds: ["client-contact", "partner"],
    retentionDefined: false,
    riskLevel: "medium",
  },
  {
    id: "opposing-party",
    name: "Opposing party / counterparty",
    nodeType: "person",
    boundary: "third-party",
    stageIds: ["intake", "evidence", "diligence", "authority", "hearing", "closing"],
    description:
      "The other side. Their documents, finances and communications enter the file, and they in turn receive the firm's filings - by design, not by accident.",
    dataCategoryIds: ["third-party-records", "financial-records", "court-filings", "evidence-media"],
    accessPersonaIds: ["opposing-counsel-role", "partner", "associate"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "The firm holds detailed personal data about someone it has no relationship with, who never gave it anything and usually does not know how much of their life is in the file.",
    riskAction:
      "Hold only what the matter actually needs about the other side, and keep it inside the matter rather than in general folders and inboxes.",
  },
  {
    id: "named-third-party",
    name: "Witnesses & others named in the file",
    nodeType: "person",
    boundary: "third-party",
    stageIds: ["intake", "evidence", "diligence", "authority"],
    description:
      "Witnesses, family members, employees, neighbours and customers whose details, statements and records sit in the matter because someone else's dispute or transaction needed them.",
    dataCategoryIds: ["third-party-records", "health-records", "employment-hr-records", "allegation-records"],
    accessPersonaIds: ["partner", "associate", "paralegal", "intern"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "These people have no engagement letter, no notice and no practical way to find out that a law firm holds their medical, employment or financial records.",
    riskAction:
      "Minimise what is collected about people who are not your client, and restrict who inside the firm can open it.",
  },

  // ---- Stage 1 · Enquiry & conflict check ---------------------------------
  {
    id: "firm-website-form",
    name: "Website enquiry form",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["enquiry"],
    description:
      "The 'describe your matter' box on the firm's website, where a stranger types the facts of a criminal, matrimonial or employment problem into a form nobody has classified.",
    dataCategoryIds: ["client-identity", "matter-metadata", "allegation-records"],
    accessPersonaIds: ["partner", "associate", "it-admin"],
    retentionDefined: false,
    riskLevel: "medium",
  },
  {
    id: "enquiry-register",
    name: "Enquiry register & clerk's diary",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["enquiry", "engagement"],
    description:
      "The book or sheet where every walk-in, call and referral is logged - including the ones the firm declined, which are never revisited and never removed.",
    dataCategoryIds: ["client-identity", "matter-metadata", "third-party-records"],
    accessPersonaIds: ["clerk", "partner", "paralegal"],
    retentionDefined: false,
    riskLevel: "medium",
  },
  {
    id: "conflict-check-sheet",
    name: "Conflict-check list",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["enquiry", "engagement"],
    description:
      "The running list of clients, opponents and related parties checked before a matter is accepted - a single file naming who is fighting whom, usually open to the whole office.",
    dataCategoryIds: ["client-identity", "matter-metadata", "third-party-records"],
    accessPersonaIds: ["partner", "associate", "clerk", "paralegal"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "One file lists every party and adversary the firm has ever considered acting against, including matters that were never taken up.",
    riskAction:
      "Restrict the conflict list to those who run conflict checks, and set a retention period for enquiries the firm declined.",
  },
  {
    id: "partner-personal-phone",
    name: "Partner's personal phone",
    nodeType: "device",
    boundary: "agency",
    stageIds: ["enquiry", "intake", "external", "hearing", "closing", "billing"],
    shadowIt: true,
    description:
      "The number clients, counsel, clerks and opponents all actually use. Calls, contacts, voice notes and first documents live on a personal handset that backs up to a personal cloud account.",
    dataCategoryIds: ["client-identity", "instructions-communications", "matter-metadata", "evidence-media"],
    accessPersonaIds: ["partner"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Matter information on a personal device backed up to a personal account is outside anything the firm can search, secure or delete.",
    riskAction:
      "Move matter communication to firm-controlled channels and stop personal-cloud backup of matter content.",
  },
  {
    id: "firm-email",
    name: "Firm email",
    nodeType: "system",
    boundary: "agency",
    stageIds: [
      "enquiry",
      "engagement",
      "intake",
      "drafting",
      "external",
      "authority",
      "hearing",
      "closing",
      "billing",
      "closure",
    ],
    description:
      "Where most of the matter actually lives: instructions, attachments, drafts sent for approval, counsel briefs, filings and invoices - in threads that outlive the matter and are rarely filed anywhere else.",
    dataCategoryIds: [
      "instructions-communications",
      "court-filings",
      "legal-work-product",
      "financial-records",
      "third-party-records",
    ],
    accessPersonaIds: ["partner", "associate", "paralegal", "intern", "it-admin"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Email is the firm's largest uncontrolled document store, and it is also the place a document is most easily sent to the wrong person.",
    riskAction:
      "File matter documents into the matter system rather than leaving them in threads, and apply a retention rule to mailboxes.",
  },

  // ---- Stage 2 · Engagement, KYC & matter opening --------------------------
  {
    id: "kyc-id-folder",
    name: "KYC & ID document folder",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["engagement", "intake", "diligence", "closing", "archive"],
    description:
      "Scans of PAN, Aadhaar, passports, company incorporation papers and beneficial-owner declarations, collected once at matter opening and then kept for the life of the firm.",
    dataCategoryIds: ["client-kyc", "client-identity", "property-corporate-docs"],
    accessPersonaIds: ["partner", "associate", "paralegal", "accounts-staff", "clerk"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "Full identity documents are collected by default rather than by need, are visible to everyone who touches the matter, and are never cleared out once the engagement ends.",
    riskAction:
      "Decide which documents each engagement genuinely requires, record the verification result rather than storing every full copy, and restrict the folder to those who need it.",
  },
  {
    id: "matter-management-system",
    name: "Matter management system",
    nodeType: "system",
    boundary: "agency",
    stageIds: [
      "engagement",
      "matter-file",
      "analysis",
      "drafting",
      "authority",
      "hearing",
      "closing",
      "billing",
      "closure",
      "archive",
    ],
    description:
      "The spine: matter number, parties, forum, team, status, key dates and the link to everything else. It is also the firm's list of who is in dispute with whom.",
    dataCategoryIds: ["matter-metadata", "client-identity", "third-party-records", "billing-time"],
    accessPersonaIds: ["partner", "associate", "paralegal", "clerk", "accounts-staff", "it-admin"],
    retentionDefined: true,
    riskLevel: "medium",
  },
  {
    id: "engagement-letter-store",
    name: "Engagement letters & authorities",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["engagement", "billing", "closure"],
    description:
      "Signed engagement terms, vakalatnamas and authority letters - the only place the firm records what the client actually agreed to, including about their data.",
    dataCategoryIds: ["client-identity", "matter-metadata", "billing-time"],
    accessPersonaIds: ["partner", "accounts-staff", "paralegal"],
    retentionDefined: true,
    riskLevel: "low",
  },
  {
    id: "e-signature-platform",
    name: "E-signature platform",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["engagement", "drafting", "closing"],
    description:
      "Where engagement letters, undertakings and agreements are signed. It retains the signed document, the signature certificate, and the signer's email, IP and device details.",
    dataCategoryIds: ["client-identity", "court-filings", "property-corporate-docs", "staff-access-record"],
    accessPersonaIds: ["partner", "paralegal", "vendor-staff"],
    retentionDefined: false,
    riskLevel: "medium",
  },
  {
    id: "client-portal",
    name: "Client portal",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["engagement", "intake", "drafting", "billing"],
    description:
      "The controlled upload and update channel firms with a portal offer clients - the one intake route where the firm knows what arrived, when, and who can see it.",
    dataCategoryIds: ["client-identity", "instructions-communications", "financial-records", "billing-time"],
    accessPersonaIds: ["client", "partner", "associate", "paralegal"],
    retentionDefined: true,
    riskLevel: "low",
  },

  // ---- Stage 3 · Instructions, documents & uploads -------------------------
  {
    id: "client-whatsapp",
    name: "WhatsApp matter thread",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["intake", "evidence", "drafting", "external", "hearing"],
    shadowIt: true,
    description:
      "The thread where the client sends everything: bank statements, medical reports, photographs of the other side, screenshots of someone else's chats, voice notes describing the facts - auto-downloading to a personal phone as it arrives.",
    dataCategoryIds: [
      "instructions-communications",
      "evidence-media",
      "financial-records",
      "health-records",
      "third-party-records",
    ],
    accessPersonaIds: ["partner", "associate", "clerk"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "The single richest collection of high-impact client and third-party data in the matter sits in a consumer chat app on a personal device, where the firm cannot search it, secure it or delete it.",
    riskAction:
      "Move document and evidence intake to the portal or an official channel, and stop accepting matter papers on personal chat.",
  },
  {
    id: "shared-cloud-folder",
    name: "Shared cloud folder",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["intake", "evidence", "diligence", "matter-file", "external"],
    shadowIt: true,
    description:
      "The Drive or Dropbox folder someone created to move a large bundle, shared by link so counsel, the client and an intern could all reach it - and never closed afterwards.",
    dataCategoryIds: ["evidence-media", "third-party-records", "court-filings", "financial-records"],
    accessPersonaIds: ["partner", "associate", "paralegal", "intern", "external-counsel-role"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Link-shared folders outlive the reason they were created, and nobody re-reads who still has access months later.",
    riskAction:
      "Use expiring, named-recipient sharing and review open links at matter closure.",
  },
  {
    id: "physical-file-room",
    name: "Physical file room & case bundles",
    nodeType: "physical_storage",
    boundary: "agency",
    stageIds: ["intake", "matter-file", "drafting", "closure", "archive"],
    description:
      "Originals, certified copies, evidence boxes and tied bundles - moving between the office, the clerk, the car and the court, with no record of who carried what.",
    dataCategoryIds: ["court-filings", "evidence-media", "property-corporate-docs", "client-kyc"],
    accessPersonaIds: ["clerk", "paralegal", "associate", "partner", "intern"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Paper is the easiest thing in the firm to lose and the hardest to account for - a misplaced bundle is a disclosure nobody can reconstruct.",
    riskAction:
      "Keep a movement register for original files and bundles, and store closed matters in a locked, listed location.",
  },
  {
    id: "transcription-service",
    name: "Dictation & transcription service",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["intake", "analysis", "drafting"],
    description:
      "Outsourced typing of dictated attendance notes, statements and drafts - so the matter's facts are typed by people the firm has never met, often in another organisation entirely.",
    dataCategoryIds: ["instructions-communications", "legal-work-product", "allegation-records", "health-records"],
    accessPersonaIds: ["typist", "vendor-staff", "associate"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Sensitive matter facts are transmitted to an outside typing service that usually has no written terms and keeps its own copies.",
    riskAction:
      "Put transcription under a written processing agreement with deletion terms, and keep the highest-impact matters in-house.",
  },
  {
    id: "secure-share-link",
    name: "Secure file-transfer link",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["intake", "diligence", "external"],
    description:
      "The upload-and-send service used when a bundle is too large for email - to counsel, to the client, to an expert - generating links that keep working long after the transfer.",
    dataCategoryIds: ["court-filings", "evidence-media", "third-party-records", "legal-work-product"],
    accessPersonaIds: ["associate", "paralegal", "vendor-staff", "external-counsel-role"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "A live link is an open door that requires no login and shows up in whatever inbox it was forwarded to.",
    riskAction:
      "Set expiry and download limits by default, and revoke links when the task is done.",
  },

  // ---- Stage 4 · Evidence (litigation & full-service) ----------------------
  {
    id: "evidence-media-store",
    name: "Evidence & exhibit store",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["evidence", "analysis", "drafting", "authority", "hearing"],
    businessModels: ["litigation", "full-service"],
    description:
      "Photographs, video, call recordings, chat screenshots and scanned documents gathered as proof - most of it about the other side, their family or witnesses rather than the client.",
    dataCategoryIds: ["evidence-media", "third-party-records", "health-records", "allegation-records"],
    accessPersonaIds: ["partner", "associate", "paralegal", "intern", "expert-role"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "It is the highest-impact material in the firm and almost none of it belongs to the client - it is other people's private life, gathered to be used against them.",
    riskAction:
      "Keep evidence in a restricted store separate from routine matter documents, and index what it contains about people who are not your client.",
  },
  {
    id: "device-extraction",
    name: "Phone & device extraction report",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["evidence", "analysis"],
    businessModels: ["litigation", "full-service"],
    description:
      "A forensic dump of a handset or laptop - every message, photograph, location point and contact - of which the matter needs perhaps a dozen items and the firm keeps all of it.",
    dataCategoryIds: ["evidence-media", "third-party-records", "instructions-communications", "health-records"],
    accessPersonaIds: ["partner", "associate", "expert-role"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "An extraction sweeps in the entire private life of the device owner and everyone who ever messaged them, far beyond anything the matter requires.",
    riskAction:
      "Take a defined extraction scope, work from a filtered set, and delete the full image once the relevant material is identified.",
  },
  {
    id: "private-investigator",
    name: "Investigator",
    nodeType: "person",
    boundary: "third-party",
    stageIds: ["evidence"],
    businessModels: ["litigation", "full-service"],
    description:
      "Engaged to trace assets, confirm whereabouts or gather background - and returning material about the subject that the firm did not specify and cannot verify the source of.",
    dataCategoryIds: ["third-party-records", "evidence-media", "financial-records"],
    accessPersonaIds: ["partner", "expert-role"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Material arrives without a documented source, and the firm becomes the holder of personal data it cannot account for.",
    riskAction:
      "Instruct in writing with a defined scope, and record how each item was obtained before it enters the file.",
  },
  {
    id: "witness-statement-file",
    name: "Witness statements & affidavits",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["evidence", "drafting", "authority", "hearing"],
    businessModels: ["litigation", "full-service"],
    description:
      "Draft and signed statements carrying witnesses' names, addresses, phone numbers and their account of events - drafted, revised, circulated and eventually filed.",
    dataCategoryIds: ["third-party-records", "court-filings", "allegation-records"],
    accessPersonaIds: ["partner", "associate", "paralegal", "typist", "intern"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "A witness's home address and phone number travel with the statement to the other side and onto the record.",
    riskAction:
      "Keep witness contact details out of the filed version wherever the forum allows, and hold them in a restricted annexure.",
  },

  // ---- Stage 5 · Due diligence & the data room (corporate & full-service) --
  {
    id: "virtual-data-room",
    name: "Virtual data room",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["diligence", "drafting", "closing"],
    businessModels: ["corporate", "full-service"],
    description:
      "Where the target company's records are uploaded in bulk and opened to the deal team, advisors and bidders under access groups set up on day one and rarely revisited.",
    dataCategoryIds: [
      "employment-hr-records",
      "third-party-records",
      "property-corporate-docs",
      "financial-records",
      "staff-access-record",
    ],
    accessPersonaIds: ["partner", "associate", "client-contact", "vendor-staff", "opposing-counsel-role"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "Hundreds of people's employment, salary and personal records are exposed to a bidder group, and the individuals concerned are never told the room existed.",
    riskAction:
      "Minimise and redact before upload, use narrow access groups, disable bulk download, and close the room when the deal ends.",
  },
  {
    id: "dd-request-tracker",
    name: "Due-diligence request list",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["diligence", "analysis"],
    businessModels: ["corporate", "full-service"],
    description:
      "The spreadsheet tracking what has been asked for, what has arrived and what is missing - and, in the comments, why a particular employee's file matters.",
    dataCategoryIds: ["matter-metadata", "employment-hr-records", "third-party-records"],
    accessPersonaIds: ["associate", "paralegal", "partner", "client-contact"],
    retentionDefined: false,
    riskLevel: "medium",
  },
  {
    id: "target-hr-fileset",
    name: "Target company's employee records",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["diligence", "analysis", "closing"],
    businessModels: ["corporate", "full-service"],
    description:
      "Complete employment files pulled into the transaction - salaries, contracts, disciplinary history, medical claims - for people who have no idea a law firm is reading them.",
    dataCategoryIds: ["employment-hr-records", "third-party-records", "health-records", "financial-records"],
    accessPersonaIds: ["partner", "associate", "paralegal", "intern", "vendor-staff"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "This is the largest single volume of other people's personal data the firm will ever hold, and none of those people are its client.",
    riskAction:
      "Take samples and redacted extracts rather than whole HR files, and delete the working set once the transaction closes.",
  },
  {
    id: "bidder-advisor",
    name: "Bidders & their advisors",
    nodeType: "person",
    boundary: "third-party",
    stageIds: ["diligence", "closing"],
    businessModels: ["corporate", "full-service"],
    description:
      "Competing buyers, their counsel, accountants and consultants - given data-room access to assess the target, and keeping whatever they downloaded whether or not they win.",
    dataCategoryIds: ["employment-hr-records", "third-party-records", "financial-records", "property-corporate-docs"],
    accessPersonaIds: ["opposing-counsel-role", "expert-role", "client-contact"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "A bidder who walks away still holds the target's employee data, and there is usually no mechanism to confirm they deleted it.",
    riskAction:
      "Restrict downloads, watermark documents, and obtain written deletion confirmation from every party who had access when the process ends.",
  },
  {
    id: "dd-review-export",
    name: "Diligence review exports",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["diligence", "analysis"],
    businessModels: ["corporate", "full-service"],
    shadowIt: true,
    description:
      "The extracts pulled out of the data room so the team could work offline - spreadsheets of employees, contract summaries, red-flag lists sitting on laptops after the room is closed.",
    dataCategoryIds: ["employment-hr-records", "third-party-records", "case-assessment"],
    accessPersonaIds: ["associate", "paralegal", "intern"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Closing the data room does nothing about the copies already taken out of it.",
    riskAction:
      "Keep review work inside the room where possible, and sweep and delete local exports at completion.",
  },

  // ---- Stage 6 · The matter file ------------------------------------------
  {
    id: "matter-dms",
    name: "Document management system",
    nodeType: "repository",
    boundary: "agency",
    stageIds: [
      "matter-file",
      "analysis",
      "drafting",
      "external",
      "authority",
      "hearing",
      "closing",
      "billing",
      "closure",
      "archive",
    ],
    description:
      "Where the firm believes the matter lives: every document, draft, annexure and note, filed by matter number - and in most firms readable by anyone with a login, whatever the matter is about.",
    dataCategoryIds: [
      "court-filings",
      "legal-work-product",
      "third-party-records",
      "financial-records",
      "allegation-records",
      "health-records",
    ],
    accessPersonaIds: ["partner", "associate", "paralegal", "intern", "clerk", "typist", "it-admin"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "If access follows the firm rather than the matter team, then a matrimonial, criminal or harassment file is open to everyone who works there, including this term's interns.",
    riskAction:
      "Move to matter-based access with restricted classification for high-impact matters, and review who can open what at least once a year.",
  },
  {
    id: "associate-laptop",
    name: "Associate's laptop",
    nodeType: "device",
    boundary: "agency",
    stageIds: ["matter-file", "analysis", "drafting", "hearing", "closing"],
    description:
      "Where the work actually happens - downloaded bundles, working drafts, evidence copies and hearing notes, carried to court, home and the next firm.",
    dataCategoryIds: ["court-filings", "legal-work-product", "evidence-media", "third-party-records"],
    accessPersonaIds: ["associate", "paralegal", "intern"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Local copies are invisible to every control the firm has, and they leave with the person.",
    riskAction:
      "Work from the document system rather than the desktop, encrypt devices, and wipe them properly when someone leaves.",
  },
  {
    id: "staff-personal-drive",
    name: "Staff personal cloud drive",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["matter-file", "analysis", "drafting"],
    shadowIt: true,
    description:
      "The personal Drive or Dropbox someone uses to move a file between office and home, or to keep the precedents they find useful - matter documents in a personal account.",
    dataCategoryIds: ["court-filings", "legal-work-product", "third-party-records"],
    accessPersonaIds: ["associate", "paralegal", "intern"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Matter documents in a personal account survive resignation, are outside every firm control, and cannot be reached by any request.",
    riskAction:
      "Provide a workable firm alternative for remote access and prohibit matter content in personal storage.",
  },

  // ---- Stage 7 · Research, analysis & AI ----------------------------------
  {
    id: "public-ai-tool",
    name: "Public AI assistant",
    nodeType: "system",
    boundary: "third-party",
    stageIds: ["analysis", "drafting"],
    shadowIt: true,
    description:
      "The general-purpose chatbot a junior pastes the facts into - to summarise a statement, draft a notice or explain a document - along with names, dates, allegations and figures.",
    dataCategoryIds: ["instructions-communications", "allegation-records", "legal-work-product", "case-assessment"],
    accessPersonaIds: ["associate", "intern", "paralegal"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "Pasting matter facts into a service the firm never contracted with is a disclosure to an outside party, and the prompt history is retained where the firm cannot reach it.",
    riskAction:
      "Provide an approved tool with contractual terms, prohibit client facts in consumer AI services, and say so in writing to every junior and intern.",
  },
  {
    id: "firm-ai-assistant",
    name: "Firm's AI drafting assistant",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["analysis", "drafting"],
    description:
      "The contracted assistant built into the document system or research platform, summarising bundles and producing first drafts from matter content.",
    dataCategoryIds: ["legal-work-product", "case-assessment", "court-filings", "third-party-records"],
    accessPersonaIds: ["partner", "associate", "paralegal", "vendor-staff"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Matter content and prompts are processed by a vendor, and its output becomes new personal data about identifiable people that nobody has verified.",
    riskAction:
      "Confirm the contract covers retention and training use, keep the tool inside matter access rules, and require human review before output is relied on.",
  },
  {
    id: "legal-research-platform",
    name: "Legal research platform",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["analysis", "drafting"],
    description:
      "Where judgments and provisions are looked up. Searches are logged, and the search terms themselves often name the client, the opponent and the allegation.",
    dataCategoryIds: ["matter-metadata", "third-party-records", "staff-access-record"],
    accessPersonaIds: ["associate", "partner", "intern", "vendor-staff"],
    retentionDefined: false,
    riskLevel: "medium",
  },
  {
    id: "chronology-issue-tracker",
    name: "Chronology & issue list",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["analysis", "drafting", "hearing"],
    description:
      "The working spreadsheet that turns a bundle into a timeline - who did what, when, to whom - naming everyone involved in one convenient, highly portable file.",
    dataCategoryIds: ["legal-work-product", "third-party-records", "allegation-records", "matter-metadata"],
    accessPersonaIds: ["associate", "paralegal", "partner", "intern"],
    retentionDefined: false,
    riskLevel: "medium",
  },
  {
    id: "case-assessment-note",
    name: "Strategy & assessment notes",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["analysis", "drafting", "billing"],
    description:
      "The firm's own view: the strength of the case, what a witness is likely to be worth, the settlement number, the client's reliability and the matter's profitability.",
    dataCategoryIds: ["case-assessment", "legal-work-product", "third-party-records"],
    accessPersonaIds: ["partner", "associate"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "These are opinions the firm created about identifiable people - the client, the opponent, witnesses - and they are personal data even though nobody thinks of them that way.",
    riskAction:
      "Keep assessments inside the matter's access restrictions and out of general folders, email threads and knowledge systems.",
  },

  // ---- Stage 8 · Drafting & review ----------------------------------------
  {
    id: "redline-collaboration",
    name: "Redlining & collaboration tool",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["drafting", "closing"],
    description:
      "Where drafts are compared and marked up between the firm, the client and the other side - carrying comments, tracked changes and author metadata with them.",
    dataCategoryIds: ["legal-work-product", "court-filings", "property-corporate-docs", "instructions-communications"],
    accessPersonaIds: ["associate", "partner", "client-contact", "opposing-counsel-role", "vendor-staff"],
    retentionDefined: false,
    riskLevel: "medium",
  },
  {
    id: "print-room",
    name: "Print room & photocopier",
    nodeType: "physical_storage",
    boundary: "agency",
    stageIds: ["drafting", "authority", "hearing"],
    description:
      "Where bundles, sets and annexures are produced - and where spare copies, spoiled sheets and yesterday's draft sit on the tray until someone clears them.",
    dataCategoryIds: ["court-filings", "evidence-media", "financial-records", "third-party-records"],
    accessPersonaIds: ["clerk", "paralegal", "intern", "associate"],
    retentionDefined: false,
    riskLevel: "medium",
  },

  // ---- Stage 9 · External counsel, experts & agents ------------------------
  {
    id: "external-counsel",
    name: "External & senior counsel",
    nodeType: "person",
    boundary: "third-party",
    stageIds: ["external", "authority", "hearing", "closing"],
    description:
      "The briefed advocate or senior counsel who receives the file to advise or argue - together with their chambers, junior and clerk, each of whom keeps their own copy.",
    dataCategoryIds: [
      "court-filings",
      "evidence-media",
      "legal-work-product",
      "third-party-records",
      "financial-records",
    ],
    accessPersonaIds: ["external-counsel-role", "partner"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "The whole file usually goes out when a subset would do, to a recipient with their own storage, their own staff and no agreement about what happens to it afterwards.",
    riskAction:
      "Send only what the brief needs, record who received what and when, and agree in writing what is returned or destroyed at the end.",
  },
  {
    id: "expert-consultant",
    name: "Experts, valuers & consultants",
    nodeType: "person",
    boundary: "third-party",
    stageIds: ["external", "authority", "hearing", "closing"],
    description:
      "Medical, forensic, technical and valuation specialists given the records they need to form an opinion - and retaining them long after the opinion is delivered.",
    dataCategoryIds: ["health-records", "evidence-media", "third-party-records", "financial-records"],
    accessPersonaIds: ["expert-role", "partner", "associate"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Experts routinely receive more of the file than their question requires and keep it indefinitely as part of their own working papers.",
    riskAction:
      "Scope the material to the question asked, and set a return-or-delete expectation in the instruction letter.",
  },
  {
    id: "translator-notary",
    name: "Translators & notaries",
    nodeType: "person",
    boundary: "vendor",
    stageIds: ["external", "authority", "closing"],
    description:
      "Document translation, attestation and notarisation - often handled at a counter, on a personal laptop, or through an online tool the firm has never assessed.",
    dataCategoryIds: ["court-filings", "client-kyc", "property-corporate-docs", "third-party-records"],
    accessPersonaIds: ["vendor-staff", "clerk", "paralegal"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Documents are handed over informally, and translation is frequently done by pasting text into a free online service.",
    riskAction:
      "Use named providers under written terms and prohibit free online translation of matter documents.",
  },
  {
    id: "filing-agent",
    name: "Filing agents & court clerks",
    nodeType: "person",
    boundary: "third-party",
    stageIds: ["external", "authority", "hearing"],
    description:
      "The people who physically lodge, follow up and collect - carrying complete sets including annexures, and holding credentials for portals they file through.",
    dataCategoryIds: ["court-filings", "client-kyc", "third-party-records", "staff-access-record"],
    accessPersonaIds: ["clerk", "external-counsel-role", "court-staff"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Agents receive the full set and often the portal login too, with no record of what they retained.",
    riskAction:
      "Give agents only the filing set, never shared credentials, and collect acknowledgements rather than leaving copies with them.",
  },
  {
    id: "e-discovery-vendor",
    name: "E-discovery & document review vendor",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["evidence", "analysis", "external"],
    description:
      "The platform and review team used when the volume is too large to read - ingesting whole mailboxes and drives, most of which is irrelevant to the matter.",
    dataCategoryIds: ["instructions-communications", "employment-hr-records", "third-party-records", "evidence-media"],
    accessPersonaIds: ["vendor-staff", "associate", "partner"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Everything in the custodian's mailbox is processed, including personal correspondence and colleagues who have nothing to do with the dispute.",
    riskAction:
      "Define collection scope and date ranges up front, restrict reviewer access, and require deletion of the review set at the end.",
  },
  {
    id: "brief-to-counsel-pack",
    name: "Brief & instruction pack",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["external", "authority", "hearing"],
    description:
      "The assembled package sent outside the firm - pleadings, evidence, background, contact details and the strategy note that was never meant to leave.",
    dataCategoryIds: ["court-filings", "evidence-media", "legal-work-product", "third-party-records"],
    accessPersonaIds: ["partner", "associate", "paralegal", "clerk"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "It is assembled once and reused for every recipient, so each of them gets everything rather than their part.",
    riskAction:
      "Build the pack per recipient and keep a record of which version went where.",
  },
  {
    id: "courier-dispatch",
    name: "Courier & hand delivery",
    nodeType: "physical_storage",
    boundary: "agency",
    stageIds: ["external", "authority"],
    description:
      "Sets and originals moving by courier, clerk or hand between the firm, counsel's chambers, the registry and the client - tracked by a docket number at best.",
    dataCategoryIds: ["court-filings", "client-kyc", "property-corporate-docs", "evidence-media"],
    accessPersonaIds: ["clerk", "paralegal", "vendor-staff"],
    retentionDefined: false,
    riskLevel: "medium",
  },
  {
    id: "opposing-counsel",
    name: "The other side's lawyers",
    nodeType: "person",
    boundary: "third-party",
    stageIds: ["external", "authority", "hearing", "closing"],
    description:
      "Designed recipients of the material: served with pleadings, annexures, evidence and disclosure - and holding it permanently under their own arrangements.",
    dataCategoryIds: ["court-filings", "evidence-media", "financial-records", "third-party-records", "health-records"],
    accessPersonaIds: ["opposing-counsel-role"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "This is the one sector where sending a person's records to their adversary is the intended workflow - so what goes in the set is the only control there is.",
    riskAction:
      "Decide what genuinely has to be served, redact what does not, and treat the served set as permanent.",
  },

  // ---- Stage 10 · Court, tribunal & regulatory filing ----------------------
  {
    id: "court-filing-portal",
    name: "E-filing & regulator submission portal",
    nodeType: "system",
    boundary: "government",
    stageIds: ["authority", "hearing"],
    description:
      "The court, tribunal, MCA or sector-regulator portal the submission is uploaded to - with the annexures attached exactly as they were received from the client.",
    dataCategoryIds: [
      "court-filings",
      "client-kyc",
      "financial-records",
      "health-records",
      "third-party-records",
      "staff-access-record",
    ],
    accessPersonaIds: ["clerk", "associate", "partner", "court-staff"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "Filing is the point at which the firm's control ends permanently. Whatever was attached - an unredacted bank statement, a medical report, a child's details - is now in a system with its own publication rules and no way back.",
    riskAction:
      "Run a redaction and minimisation check before every submission, and treat 'what is actually required to be filed' as a separate question from 'what the client sent us'.",
  },
  {
    id: "public-case-record",
    name: "Public record & register",
    nodeType: "system",
    boundary: "public",
    stageIds: ["authority", "hearing"],
    description:
      "What becomes publicly visible: case details, party names, orders and judgments, and on the corporate side director, shareholder and charge records in the public register.",
    dataCategoryIds: ["court-filings", "client-identity", "third-party-records", "property-corporate-docs"],
    accessPersonaIds: ["court-staff", "opposing-counsel-role"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "Once a document or record is public it is indexed, copied and republished, and no request to the firm can undo any of that.",
    riskAction:
      "Treat the public consequence as part of the drafting decision - decide before filing what genuinely must appear in the public version.",
  },
  {
    id: "registry-counter",
    name: "Registry & filing counter",
    nodeType: "physical_storage",
    boundary: "government",
    stageIds: ["authority"],
    description:
      "The physical counter where hard sets are lodged, defects are marked, and copies sit in trays and registers handled by staff outside the firm entirely.",
    dataCategoryIds: ["court-filings", "client-kyc", "third-party-records"],
    accessPersonaIds: ["court-staff", "clerk"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Full sets, including annexures, pass through hands the firm has no relationship with and no visibility of.",
    riskAction:
      "Lodge the minimum required set and keep a record of what was submitted in each version.",
  },
  {
    id: "cause-list-app",
    name: "Cause list & case-status apps",
    nodeType: "system",
    boundary: "public",
    stageIds: ["authority", "hearing"],
    businessModels: ["litigation", "full-service"],
    description:
      "The daily lists and case-tracking apps everyone in the office uses - publishing party names, matter type and listing details to anyone who searches.",
    dataCategoryIds: ["matter-metadata", "client-identity", "third-party-records"],
    accessPersonaIds: ["clerk", "associate", "partner", "opposing-counsel-role"],
    retentionDefined: false,
    riskLevel: "medium",
  },
  {
    id: "dsc-token",
    name: "Digital signature tokens",
    nodeType: "device",
    boundary: "agency",
    stageIds: ["authority", "closing"],
    description:
      "The client's or partner's signing token and PIN, kept in the office drawer so filings and submissions can be signed without chasing anyone.",
    dataCategoryIds: ["staff-access-record", "client-identity", "court-filings"],
    accessPersonaIds: ["partner", "clerk", "paralegal"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "A signing token is authority, not merely data - whoever holds it and the PIN can sign as that person.",
    riskAction:
      "Keep tokens in named custody with a signing log, store the PIN separately, and return them when the engagement ends.",
  },

  // ---- Stage 11 · Hearings & orders (litigation & full-service) ------------
  {
    id: "hearing-notes",
    name: "Hearing notes & the clerk's diary entry",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["hearing"],
    businessModels: ["litigation", "full-service"],
    description:
      "What was said, what the bench observed, what the other side conceded and what the client was told afterwards - captured in a notebook, a phone note or a message.",
    dataCategoryIds: ["legal-work-product", "matter-metadata", "third-party-records", "case-assessment"],
    accessPersonaIds: ["associate", "partner", "clerk"],
    retentionDefined: false,
    riskLevel: "medium",
  },
  {
    id: "video-hearing-platform",
    name: "Video hearing platform",
    nodeType: "system",
    boundary: "government",
    stageIds: ["hearing"],
    businessModels: ["litigation", "full-service"],
    description:
      "Remote hearings joined from home or office - with participants' names, faces, surroundings and sometimes a recording or transcript generated by the platform.",
    dataCategoryIds: ["court-filings", "third-party-records", "evidence-media", "matter-metadata"],
    accessPersonaIds: ["court-staff", "partner", "associate", "opposing-counsel-role"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Recordings and transcripts of a hearing are copied to personal devices and shared with clients as a matter of routine.",
    riskAction:
      "Keep recordings inside the matter file, do not circulate them, and follow the forum's own rules on their use.",
  },
  {
    id: "order-transcript-store",
    name: "Orders, transcripts & settlement terms",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["hearing", "closure", "archive"],
    businessModels: ["litigation", "full-service"],
    description:
      "The outcome documents - orders, certified copies, transcripts and settlement agreements carrying the matter's most sensitive facts in their most quotable form.",
    dataCategoryIds: ["court-filings", "allegation-records", "financial-records", "third-party-records"],
    accessPersonaIds: ["partner", "associate", "paralegal", "clerk"],
    retentionDefined: true,
    riskLevel: "medium",
  },

  // ---- Stage 12 · Signing & closing (corporate & full-service) -------------
  {
    id: "closing-set-repository",
    name: "Closing set",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["closing", "archive"],
    businessModels: ["corporate", "full-service"],
    description:
      "The completed bundle distributed to every party at once - executed agreements, disclosure schedules, employee lists, signature pages and completion evidence.",
    dataCategoryIds: [
      "property-corporate-docs",
      "employment-hr-records",
      "third-party-records",
      "client-identity",
      "financial-records",
    ],
    accessPersonaIds: ["partner", "associate", "client-contact", "opposing-counsel-role"],
    retentionDefined: true,
    riskLevel: "high",
    riskWhy:
      "One document set containing many people's personal data is deliberately copied to every party and advisor on the transaction.",
    riskAction:
      "Minimise the schedules that carry individuals' details, and name one system of record so the working duplicates can be removed.",
  },
  {
    id: "escrow-bank-platform",
    name: "Escrow & banking platform",
    nodeType: "system",
    boundary: "third-party",
    stageIds: ["closing"],
    businessModels: ["corporate", "full-service"],
    description:
      "Where completion funds move - carrying account details, authorised signatories, identity documents and the funds-flow statement.",
    dataCategoryIds: ["financial-records", "client-kyc", "client-identity"],
    accessPersonaIds: ["partner", "accounts-staff", "client-contact"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Banking and identity details for the transaction are circulated by email around completion, when everyone is moving quickly.",
    riskAction:
      "Confirm payment details through a verified channel and keep funds-flow documents out of general distribution lists.",
  },
  {
    id: "signed-original-vault",
    name: "Executed originals",
    nodeType: "physical_storage",
    boundary: "agency",
    stageIds: ["closing", "archive"],
    businessModels: ["corporate", "full-service"],
    description:
      "Wet-ink originals and stamped documents held in the firm's safe or a records vault, often for decades, on nobody's particular instruction.",
    dataCategoryIds: ["property-corporate-docs", "client-identity", "financial-records"],
    accessPersonaIds: ["partner", "clerk", "paralegal"],
    retentionDefined: true,
    riskLevel: "medium",
  },

  // ---- Stage 13 · Time, billing & expenses --------------------------------
  {
    id: "billing-narrative",
    name: "Time entries & invoice narratives",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["billing"],
    description:
      "The description of the work, written in the matter's own words - 'call with client re: allegations of', 'review of medical records for' - travelling to finance and the client's accounts team.",
    dataCategoryIds: ["billing-time", "matter-metadata", "allegation-records", "health-records"],
    accessPersonaIds: ["accounts-staff", "partner", "associate", "client-contact"],
    retentionDefined: true,
    riskLevel: "high",
    riskWhy:
      "A narrative written for a partner is read by billing staff and by whoever processes invoices at the client - people with no reason to know the facts of the matter.",
    riskAction:
      "Write time narratives at the level of the task, not the facts, and keep matter detail in the matter file where it belongs.",
  },
  {
    id: "time-recording-system",
    name: "Time recording system",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["billing"],
    description:
      "Every unit of work by every person on every matter - and, incidentally, a detailed record of which lawyer spent how long on whose problem.",
    dataCategoryIds: ["billing-time", "matter-metadata", "staff-access-record"],
    accessPersonaIds: ["accounts-staff", "partner", "associate", "it-admin"],
    retentionDefined: true,
    riskLevel: "medium",
  },
  {
    id: "accounting-software",
    name: "Accounting & expense system",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["billing", "archive"],
    description:
      "Invoices, receipts, counsel fees and disbursements - with expense evidence that frequently carries client and third-party details in the attachment.",
    dataCategoryIds: ["billing-time", "financial-records", "client-identity"],
    accessPersonaIds: ["accounts-staff", "partner", "it-admin"],
    retentionDefined: true,
    riskLevel: "medium",
  },
  {
    id: "payment-gateway",
    name: "Payment gateway & bank",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["billing"],
    description:
      "How fees are actually collected - carrying the payer's name, contact and banking details into a third system with its own retention.",
    dataCategoryIds: ["financial-records", "client-identity", "billing-time"],
    accessPersonaIds: ["accounts-staff", "vendor-staff", "partner"],
    retentionDefined: false,
    riskLevel: "medium",
  },

  // ---- Stage 14 · Knowledge & pitching (full-service) ----------------------
  {
    id: "precedent-bank",
    name: "Precedent & drafting bank",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["knowledge", "archive"],
    businessModels: ["full-service"],
    description:
      "The collection of 'good' documents reused across matters - petitions, agreements, schedules and notices, saved in a hurry and very often still carrying the original parties' names.",
    dataCategoryIds: ["legal-work-product", "court-filings", "client-identity", "third-party-records"],
    accessPersonaIds: ["partner", "associate", "paralegal", "intern"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "A closed matter's personal data becomes permanent and firm-wide the moment a document is saved as a precedent, entirely outside that matter's access restrictions.",
    riskAction:
      "Anonymise before a document enters the bank, and never take precedents from restricted or high-impact matters.",
  },
  {
    id: "experience-pitch-database",
    name: "Experience & pitch database",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["knowledge"],
    businessModels: ["full-service"],
    description:
      "What the firm tells prospective clients and directories it has done - deal and case descriptions that identify parties, values and outcomes.",
    dataCategoryIds: ["matter-metadata", "client-identity", "case-assessment", "third-party-records"],
    accessPersonaIds: ["partner", "associate"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Matter details are repurposed for marketing and directory submissions, frequently without the client being asked.",
    riskAction:
      "Anonymise experience entries by default and obtain the client's agreement before anything identifiable is published.",
  },
  {
    id: "firm-search-index",
    name: "Firm-wide search index",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["knowledge"],
    businessModels: ["full-service"],
    description:
      "The search box across the document system, email and knowledge stores - which is only as restricted as the index behind it, and often less so than the folders it points to.",
    dataCategoryIds: ["legal-work-product", "court-filings", "allegation-records", "third-party-records"],
    accessPersonaIds: ["partner", "associate", "paralegal", "intern", "it-admin"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "A search index that ignores matter restrictions makes a restricted file findable by anyone who searches for the right name.",
    riskAction:
      "Align search results with the source matter's access rules, and test that a restricted matter is genuinely unsearchable.",
  },

  // ---- Stage 15 · Closure, hold & return ----------------------------------
  {
    id: "legal-hold-register",
    name: "Retention & hold register",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["closure"],
    description:
      "Where a firm records that a file must be kept - because an appeal period is running, a related matter is live, or the client asked. Where one exists at all.",
    dataCategoryIds: ["matter-metadata", "client-identity"],
    accessPersonaIds: ["partner", "paralegal", "it-admin"],
    retentionDefined: true,
    riskLevel: "medium",
  },
  {
    id: "returned-documents-log",
    name: "Return-of-documents record",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["closure"],
    description:
      "The acknowledgement of which originals went back to the client, and which copies the firm kept - the difference between the two is usually where the argument starts.",
    dataCategoryIds: ["matter-metadata", "client-identity", "property-corporate-docs"],
    accessPersonaIds: ["clerk", "paralegal", "partner"],
    retentionDefined: true,
    riskLevel: "low",
  },
  {
    id: "ex-staff-device",
    name: "Departed staff's copies",
    nodeType: "device",
    boundary: "third-party",
    stageIds: ["closure", "archive"],
    shadowIt: true,
    description:
      "What left with the associate, intern or clerk who moved on - a laptop that was never wiped, a personal drive of useful precedents, an email archive, a WhatsApp history.",
    dataCategoryIds: ["court-filings", "legal-work-product", "third-party-records", "evidence-media"],
    accessPersonaIds: ["associate", "intern", "clerk"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "Matter data now sits with someone the firm no longer employs, possibly at a competitor, and no request the firm receives can ever reach it.",
    riskAction:
      "Make device wipe and access revocation part of every exit, and check personal storage and mailboxes before the last day.",
  },

  // ---- Stage 16 · Archive & backups ---------------------------------------
  {
    id: "firm-archive-backup",
    name: "Archive & backups",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["archive"],
    description:
      "Where closed matters go and stay: the archived document store, nightly backups and old server images, holding every matter the firm has ever run.",
    dataCategoryIds: [
      "court-filings",
      "client-kyc",
      "evidence-media",
      "third-party-records",
      "health-records",
      "allegation-records",
    ],
    accessPersonaIds: ["it-admin", "partner", "paralegal"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "Nothing is ever deleted. 'In case of appeal' becomes forever, so a matter that closed a decade ago is still complete, still restorable and still nobody's responsibility.",
    riskAction:
      "Set a retention period per matter type with a named owner, record why anything is kept longer, and make deletion an actual scheduled step rather than an intention.",
  },
  {
    id: "offsite-record-storage",
    name: "Offsite records storage",
    nodeType: "physical_storage",
    boundary: "vendor",
    stageIds: ["archive"],
    description:
      "The commercial storage unit or godown holding boxed files by year - retrievable in theory, unlisted in practice, and billed by the shelf.",
    dataCategoryIds: ["court-filings", "client-kyc", "property-corporate-docs", "evidence-media"],
    accessPersonaIds: ["clerk", "vendor-staff", "paralegal"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Nobody knows precisely what is in the boxes, so neither a request nor a deletion decision can be applied to them.",
    riskAction:
      "Index boxes to matter numbers with a destruction date, and put the storage provider under written terms.",
  },
];
