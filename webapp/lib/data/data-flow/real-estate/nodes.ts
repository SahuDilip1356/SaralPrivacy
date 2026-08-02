// Systems, repositories, devices, physical stores and people that hold client
// and property data in a typical Indian real-estate or property firm - NOT any
// specific firm's environment (reference-model rule).
//
// Real things are named - the portal dashboard, the shared lead sheet, the
// co-broker group, the site-office gate register, the sub-registrar's office,
// the society app, the key cupboard, the file almirah - because a generic "CRM"
// fails the "that's my firm" test. Storage, devices and chat channels are
// SPANNING nodes: they attach across stages, because that is where data sits
// over the whole relationship rather than at one step.
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
//   shared-lead-sheet ........ enquiry (2)        kyc-document-folder ...... kyc-documents (7)
//   sales-crm ................ qualification (3)  documentation-vendor ..... agreement (10)
//   co-broker-group .......... matching (4)       marketing-reuse-platform . commission (16)
//   field-exec-phone ......... site-visit (5)     old-lead-database ........ archive (17)
//
// A hotspot node may span LATER stages - the CRM genuinely does - but must never
// acquire an EARLIER one. Adding `enquiry` to `sales-crm`, for instance, would
// silently move its flag onto the lead sheet's stage and break reconciliation in
// all three models. The lead lands on the portal dashboard, the shared sheet and
// a personal phone first; the CRM record is created when the lead is qualified
// and assigned, which is why `sales-crm` starts at `qualification`.
//
// Deliberately NOT hotspots, because they sit on model-gated stages: the lender
// file, the police-verification and screening vendors, the society app and gate
// register, the maintenance vendor holding home-access instructions, the
// possession photo repository, the demand-notice trail, the exit inspection
// record and the landlord property file. Each is authored as a high-risk node
// instead and renders in full wherever it exists (spec §3).

import type { FlowNode } from "../../../data-flow/schemas.ts";

const PM = ["property-management"];
const DEV = ["developer"];
const SALES = ["brokerage", "developer"];
const DEV_PM = ["developer", "property-management"];

export const REAL_ESTATE_NODES: FlowNode[] = [
  // ---- The people ---------------------------------------------------------
  {
    id: "client",
    name: "Buyer / tenant client",
    nodeType: "person",
    boundary: "candidate",
    stageIds: ["enquiry", "qualification", "site-visit", "negotiation", "kyc-documents", "agreement", "commission"],
    description:
      "The data principal. One enquiry, one set of documents and one decision - everything below is a copy, a derivative or something the firm worked out about them.",
    dataCategoryIds: ["client-identity", "requirement-budget", "client-kyc", "household-occupancy"],
    accessPersonaIds: ["client"],
    retentionDefined: true,
    riskLevel: "low",
  },
  {
    id: "co-applicant",
    name: "Co-applicant, guarantor or nominee",
    nodeType: "person",
    boundary: "candidate",
    stageIds: ["negotiation", "kyc-documents", "finance", "agreement"],
    description:
      "A spouse, parent, business partner or guarantor named on the booking, the loan or the agreement. Their documents arrive with the client's and are almost never tracked as a separate person.",
    dataCategoryIds: ["third-party-records", "client-kyc", "employment-income", "financial-records"],
    accessPersonaIds: ["co-applicant-person", "sales-exec", "documentation-staff"],
    retentionDefined: false,
    riskLevel: "medium",
  },
  {
    id: "household-occupant",
    name: "Household members & domestic staff",
    nodeType: "person",
    boundary: "candidate",
    stageIds: ["qualification", "site-visit", "screening", "tenancy", "society"],
    description:
      "Family, children, other occupants and the people who work in the home. Their details are collected for occupancy, screening and society records, and none of them ever dealt with the firm.",
    dataCategoryIds: ["household-occupancy", "third-party-records", "occupancy-access"],
    accessPersonaIds: ["household-member", "field-exec", "society-staff"],
    retentionDefined: false,
    riskLevel: "medium",
  },
  {
    id: "seller-landlord",
    name: "Seller / landlord",
    nodeType: "person",
    boundary: "client",
    stageIds: ["landlord-mandate", "matching", "negotiation", "kyc-documents", "agreement", "tenancy", "exit"],
    description:
      "The other side of the deal, and a data principal in their own right - their identity, PAN, bank account and title papers sit in the same folders as the buyer's or tenant's.",
    dataCategoryIds: ["client-identity", "client-kyc", "property-ownership-docs", "financial-records"],
    accessPersonaIds: ["owner-landlord", "sales-exec", "documentation-staff"],
    retentionDefined: false,
    riskLevel: "medium",
  },
  {
    id: "sales-exec-person",
    name: "Sales executive",
    nodeType: "person",
    boundary: "agency",
    stageIds: ["enquiry", "qualification", "matching", "negotiation", "commission"],
    description:
      "Owns the relationship day to day, and moves between the CRM, a spreadsheet and their own phone without noticing which one they are in.",
    dataCategoryIds: ["client-identity", "requirement-budget", "communication-records", "client-scoring"],
    accessPersonaIds: ["sales-exec", "owner"],
    retentionDefined: false,
    riskLevel: "medium",
  },
  {
    id: "field-exec-person",
    name: "Field executive / site coordinator",
    nodeType: "person",
    boundary: "agency",
    stageIds: ["site-visit", "possession", "tenancy", "exit"],
    description:
      "Runs viewings, move-ins, handovers and inspections. Carries client numbers, keys, access instructions and photographs of other people's homes.",
    dataCategoryIds: ["client-identity", "site-visit-location", "occupancy-access", "maintenance-complaint"],
    accessPersonaIds: ["field-exec"],
    retentionDefined: false,
    riskLevel: "medium",
  },
  {
    id: "co-broker-person-node",
    name: "Co-broker / freelance agent",
    nodeType: "person",
    boundary: "third-party",
    stageIds: ["matching", "site-visit", "negotiation"],
    description:
      "An independent agent the requirement was forwarded to. Not a processor acting on your instructions and not your client - which is exactly why nothing obliges them to delete anything.",
    dataCategoryIds: ["client-identity", "requirement-budget", "household-occupancy"],
    accessPersonaIds: ["co-broker-person"],
    retentionDefined: false,
    riskLevel: "medium",
  },
  {
    id: "channel-partner-node",
    name: "Channel partner",
    nodeType: "person",
    boundary: "third-party",
    stageIds: ["enquiry", "matching", "negotiation", "commission"],
    description:
      "A contracted sales partner for the project, paid on attribution. Runs their own CRM, their own team and their own copy of every lead they touched.",
    dataCategoryIds: ["client-identity", "requirement-budget", "marketing-profile"],
    accessPersonaIds: ["channel-partner-person"],
    retentionDefined: false,
    riskLevel: "medium",
    businessModels: DEV,
  },
  {
    id: "loan-agent-node",
    name: "Loan agent / DSA",
    nodeType: "person",
    boundary: "third-party",
    stageIds: ["finance"],
    description:
      "The intermediary who takes the financial file to lenders. Usually holds the complete set on a personal phone and laptop, for every client they have ever placed.",
    dataCategoryIds: ["financial-records", "employment-income", "client-kyc"],
    accessPersonaIds: ["lender-person"],
    retentionDefined: false,
    riskLevel: "medium",
    businessModels: SALES,
  },
  {
    id: "maintenance-contractor",
    name: "Maintenance & repair contractors",
    nodeType: "person",
    boundary: "vendor",
    stageIds: ["tenancy"],
    description:
      "Plumbers, electricians, painters and cleaners sent to the property - each told the tenant's name, address, phone number, when they are home and how to get in.",
    dataCategoryIds: ["client-identity", "occupancy-access", "maintenance-complaint"],
    accessPersonaIds: ["vendor-staff", "field-exec"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "A one-off repair job hands an unvetted individual a home address, a phone number, a window when the flat is occupied and, often, the key.",
    riskAction:
      "Issue work orders with masked contact details and a time window, log every visit and key issue, and close the vendor's access to the job once it is signed off.",
    businessModels: PM,
  },
  {
    id: "society-committee",
    name: "Society committee & RWA",
    nodeType: "person",
    boundary: "client",
    stageIds: ["society"],
    description:
      "Volunteers and office-bearers who receive resident data at handover, ask for more of it than they need, and store it wherever is convenient.",
    dataCategoryIds: ["client-identity", "occupancy-access", "household-occupancy"],
    accessPersonaIds: ["society-staff"],
    retentionDefined: false,
    riskLevel: "medium",
    businessModels: DEV_PM,
  },

  // ---- Stage 1 · Landlord mandate & property onboarding -------------------
  {
    id: "landlord-property-file",
    name: "Property & mandate file",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["landlord-mandate", "tenancy", "exit"],
    description:
      "The owner's identity, PAN, bank account for payouts, title papers, society details and spare keys - opened before any tenant exists and kept long after the last one leaves.",
    dataCategoryIds: ["client-identity", "client-kyc", "property-ownership-docs", "financial-records", "occupancy-access"],
    accessPersonaIds: ["owner", "documentation-staff", "finance-staff", "field-exec"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "The landlord's bank account and ownership documents sit in a file that operations, field staff and finance all open routinely, and it has no end date.",
    riskAction:
      "Split the payout and bank details away from the operational file, restrict title documents to documentation staff, and set a retention date tied to the end of the mandate.",
    businessModels: PM,
  },

  // ---- Stage 2 · Lead capture & first enquiry -----------------------------
  {
    id: "property-portal-dashboard",
    name: "Property portal dashboard",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["enquiry", "matching"],
    description:
      "The 99acres, MagicBricks, Housing or NoBroker back-office where listing enquiries land, with a download button next to every one of them.",
    dataCategoryIds: ["client-identity", "requirement-budget", "marketing-profile"],
    accessPersonaIds: ["sales-exec", "owner", "vendor-staff"],
    retentionDefined: false,
    riskLevel: "medium",
  },
  {
    id: "lead-ad-platform",
    name: "Meta / Google lead-ad platform",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["enquiry", "commission"],
    description:
      "Instant-form leads arrive here, and the same platform later receives customer lists uploaded back as custom and lookalike audiences.",
    dataCategoryIds: ["client-identity", "requirement-budget", "marketing-profile"],
    accessPersonaIds: ["owner", "vendor-staff"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Data flows both ways. A phone number captured for one project enquiry is later uploaded back as an audience to target the same person for unrelated ones.",
    riskAction:
      "Keep advertising audiences separate from the enquiry record, stop re-uploading closed and withdrawn contacts, and delete stale custom audiences on a schedule.",
  },
  {
    id: "website-enquiry-form",
    name: "Website & project enquiry form",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["enquiry"],
    description:
      "The firm's own form - usually the only place in the whole journey where a notice can realistically be shown before anything is collected.",
    dataCategoryIds: ["client-identity", "requirement-budget"],
    accessPersonaIds: ["sales-exec", "owner"],
    retentionDefined: true,
    riskLevel: "low",
  },
  {
    id: "shared-lead-sheet",
    name: "Shared lead spreadsheet",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["enquiry", "qualification", "matching", "archive"],
    description:
      "The Google Sheet or Excel file that is the real intake system - every lead, every number, every budget, shared by link with whoever needs it and never revoked.",
    dataCategoryIds: ["client-identity", "requirement-budget", "household-occupancy", "client-scoring"],
    accessPersonaIds: ["sales-exec", "owner", "documentation-staff", "co-broker-person", "ex-staff"],
    shadowIt: true,
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "It exists before any notice is given, it is shared by a link that outlives the person it was shared with, and it is the first thing a departing salesperson downloads.",
    riskAction:
      "Make the CRM the only intake record, move the sheet to view-only with named access, and audit who currently holds the link before doing anything else.",
  },
  {
    id: "staff-whatsapp",
    name: "Staff WhatsApp & personal chat",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["enquiry", "qualification", "matching", "negotiation", "kyc-documents", "tenancy", "archive"],
    description:
      "How the business actually runs: enquiries, requirements, offer screenshots, PAN photographs and agreement drafts, all on personal handsets and backed up to personal cloud accounts.",
    dataCategoryIds: ["communication-records", "client-identity", "client-kyc", "financial-records", "transaction-documents"],
    accessPersonaIds: ["sales-exec", "field-exec", "owner", "documentation-staff", "ex-staff"],
    shadowIt: true,
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "Identity documents and financial papers auto-download to a personal phone and a personal backup, where the firm cannot search them, protect them or delete them - including after the person leaves.",
    riskAction:
      "Give clients one controlled channel for documents, turn off media auto-download on work devices, and stop accepting KYC on personal chat even from regular contacts.",
  },
  {
    id: "marketing-agency-dashboard",
    name: "Marketing agency's dashboard",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["enquiry", "commission"],
    description:
      "The agency running the campaigns has its own logins, its own exports and usually its own copy of every lead it generated, kept after the retainer ends.",
    dataCategoryIds: ["client-identity", "marketing-profile", "requirement-budget"],
    accessPersonaIds: ["vendor-staff", "owner"],
    retentionDefined: false,
    riskLevel: "medium",
  },

  // ---- Stage 3 · Qualification & household profiling ----------------------
  {
    id: "sales-crm",
    name: "Sales CRM",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["qualification", "matching", "negotiation", "kyc-documents", "finance", "agreement", "commission", "archive"],
    description:
      "Sell.Do, LeadSquared, Zoho or a project CRM - the record of who the client is, what they earn, who lives with them, how serious they seem, and what the salesperson privately thinks.",
    dataCategoryIds: ["client-identity", "requirement-budget", "employment-income", "household-occupancy", "client-scoring", "communication-records"],
    accessPersonaIds: ["sales-exec", "owner", "documentation-staff", "finance-staff", "ex-staff"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "Guessed income, family details and personal remarks about a client sit in a system where everyone in the office has full visibility and an export button, and nothing ages out.",
    riskAction:
      "Move to deal-based access, separate what the client told you from what staff assumed, restrict exports to the owner, and remove access the day someone leaves.",
  },
  {
    id: "call-recording-platform",
    name: "Call recording & dialler",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["qualification"],
    description:
      "Outbound calls recorded for quality and training, capturing income, family circumstances and everything else said in a fifteen-minute qualification conversation.",
    dataCategoryIds: ["communication-records", "employment-income", "household-occupancy"],
    accessPersonaIds: ["sales-exec", "owner", "vendor-staff"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Recordings are made without a clear notice, contain far more than the transaction needs, and are kept indefinitely because storage is cheap.",
    riskAction:
      "Announce recording at the start of the call, set a retention period measured in weeks not years, and restrict playback to the people who actually review calls.",
  },
  {
    id: "call-centre",
    name: "Project call centre",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["enquiry", "qualification"],
    description:
      "An outsourced or in-house tele-calling floor working a campaign list, qualifying buyers by budget and intent before a site visit is offered.",
    dataCategoryIds: ["client-identity", "requirement-budget", "employment-income", "client-scoring"],
    accessPersonaIds: ["vendor-staff", "sales-exec"],
    retentionDefined: false,
    riskLevel: "medium",
    businessModels: DEV,
  },

  // ---- Stage 4 · Matching & broker-network sharing ------------------------
  {
    id: "inventory-sheet",
    name: "Shared inventory & requirement sheet",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["matching"],
    description:
      "The running list of live requirements and available stock, circulated between offices and partners - with the client's name and number sitting in the requirement row.",
    dataCategoryIds: ["client-identity", "requirement-budget", "property-ownership-docs"],
    accessPersonaIds: ["sales-exec", "owner", "co-broker-person"],
    retentionDefined: false,
    riskLevel: "medium",
  },
  {
    id: "co-broker-group",
    name: "Co-broker & channel WhatsApp group",
    nodeType: "system",
    boundary: "third-party",
    stageIds: ["matching", "site-visit", "negotiation"],
    description:
      "Where stock is actually found: forty independent agents in one group, receiving the requirement, the budget, the family details and the client's number the moment it is posted.",
    dataCategoryIds: ["client-identity", "requirement-budget", "household-occupancy", "communication-records"],
    accessPersonaIds: ["co-broker-person", "sales-exec", "channel-partner-person"],
    shadowIt: true,
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "One post puts a live individual's contact and household details on dozens of phones outside the firm at once. It cannot be recalled, the recipients cannot be listed, and it is how the deal gets done.",
    riskAction:
      "Post the requirement without the identity first and release the number only to the agent with matching stock; keep a record of who was given what, and never circulate KYC in a group.",
  },
  {
    id: "channel-partner-portal",
    name: "Channel-partner portal",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["matching", "negotiation", "commission"],
    description:
      "Where partners register a lead to claim attribution - which means the same buyer exists in the developer's CRM and in every partner's own system simultaneously.",
    dataCategoryIds: ["client-identity", "requirement-budget", "marketing-profile", "staff-access-record"],
    accessPersonaIds: ["channel-partner-person", "sales-exec", "owner"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Attribution requires the partner to hold the lead permanently to defend a commission claim, so the buyer's record can never be removed from the partner's side.",
    riskAction:
      "Register attribution against a lead reference rather than the full contact record, and contract for deletion at the partner end when the claim window closes.",
    businessModels: DEV,
  },
  {
    id: "builder-owner-inventory",
    name: "Builder & owner inventory list",
    nodeType: "system",
    boundary: "client",
    stageIds: ["matching", "negotiation"],
    description:
      "The developer's or owner's own availability system, which the firm queries with a live client requirement attached so the unit can be blocked.",
    dataCategoryIds: ["client-identity", "requirement-budget", "property-ownership-docs"],
    accessPersonaIds: ["owner-landlord", "sales-exec", "vendor-staff"],
    retentionDefined: false,
    riskLevel: "medium",
  },

  // ---- Stage 5 · Site visits & field coordination -------------------------
  {
    id: "site-visit-scheduler",
    name: "Visit scheduler & calendar",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["site-visit"],
    description:
      "Where the appointment is booked and the field executive, the site office and sometimes the owner are told who is coming and when.",
    dataCategoryIds: ["client-identity", "site-visit-location"],
    accessPersonaIds: ["sales-exec", "field-exec", "documentation-staff"],
    retentionDefined: false,
    riskLevel: "low",
  },
  {
    id: "field-exec-phone",
    name: "Field executive's own phone",
    nodeType: "device",
    boundary: "agency",
    stageIds: ["site-visit", "kyc-documents", "possession", "tenancy", "exit"],
    description:
      "The handset that actually runs the field: client numbers synced to personal contacts, shared live locations, photographs of properties and documents, and a WhatsApp history of every visit.",
    dataCategoryIds: ["client-identity", "site-visit-location", "occupancy-access", "maintenance-complaint", "client-kyc"],
    accessPersonaIds: ["field-exec", "ex-staff"],
    shadowIt: true,
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "Client contacts sync to a personal account, live-location shares and visit photos accumulate with no end date, and the whole lot walks out of the door when the executive changes jobs.",
    riskAction:
      "Route visits through the scheduler rather than direct numbers, turn off contact sync on work accounts, and wipe the work profile the day someone leaves.",
  },
  {
    id: "site-gate-register",
    name: "Site office & gate register",
    nodeType: "physical_storage",
    boundary: "client",
    stageIds: ["site-visit", "society"],
    description:
      "The paper book or visitor tablet at the project gate or society entrance, holding the name, number, vehicle and purpose of everyone who came - visible to the next visitor in the queue.",
    dataCategoryIds: ["client-identity", "site-visit-location", "occupancy-access"],
    accessPersonaIds: ["society-staff", "vendor-staff", "field-exec"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "An open register displays the previous visitors' names and phone numbers to everyone who signs in, and the completed books are stored indefinitely with nobody responsible for them.",
    riskAction:
      "Use a register that conceals earlier entries, agree a retention period with the site or society, and stop recording details the entry decision does not need.",
  },
  {
    id: "site-cctv",
    name: "Site & society CCTV",
    nodeType: "system",
    boundary: "client",
    stageIds: ["site-visit", "society"],
    description:
      "Cameras at the sales office, sample flat, gate and common areas, recording the client and whoever came with them - usually including children.",
    dataCategoryIds: ["site-visit-location", "occupancy-access", "household-occupancy"],
    accessPersonaIds: ["society-staff", "vendor-staff"],
    retentionDefined: false,
    riskLevel: "medium",
  },
  {
    id: "maps-location-share",
    name: "Maps & live-location sharing",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["site-visit"],
    description:
      "Live locations exchanged to find each other on the day, which keep updating long after the visit has finished because nobody stops the share.",
    dataCategoryIds: ["site-visit-location", "client-identity"],
    accessPersonaIds: ["field-exec", "sales-exec"],
    retentionDefined: false,
    riskLevel: "medium",
  },

  // ---- Stage 6 · Offer, booking & terms -----------------------------------
  {
    id: "offer-sheet",
    name: "Offer & terms sheet",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["negotiation"],
    description:
      "The working record of what the client can pay, what they have offered, when they can move and what they will accept - screenshotted and forwarded as the negotiation moves.",
    dataCategoryIds: ["financial-records", "requirement-budget", "client-scoring", "communication-records"],
    accessPersonaIds: ["sales-exec", "owner", "co-broker-person"],
    retentionDefined: false,
    riskLevel: "medium",
  },
  {
    id: "booking-inventory-system",
    name: "Booking & inventory system",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["negotiation", "agreement", "construction"],
    description:
      "Where the unit is blocked and the booking form, token payment, applicant, co-applicant and nominee are recorded as the master transaction record.",
    dataCategoryIds: ["client-identity", "third-party-records", "financial-records", "transaction-documents"],
    accessPersonaIds: ["sales-exec", "finance-staff", "documentation-staff", "owner"],
    retentionDefined: true,
    riskLevel: "medium",
    businessModels: DEV,
  },
  {
    id: "payment-gateway",
    name: "Payment gateway & bank transfers",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["negotiation", "construction", "tenancy"],
    description:
      "Token amounts, instalments, deposits and rent moving through a gateway or bank, leaving a payment trail attached to a name and a unit.",
    dataCategoryIds: ["financial-records", "client-identity"],
    accessPersonaIds: ["finance-staff", "vendor-staff", "owner"],
    retentionDefined: true,
    riskLevel: "medium",
  },

  // ---- Stage 7 · KYC, identity & property documents -----------------------
  {
    id: "kyc-document-folder",
    name: "KYC & document folder",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["kyc-documents", "screening", "finance", "agreement", "archive"],
    description:
      "The Drive folder, the shared cloud directory or the desktop folder where PAN, Aadhaar, passport, salary slips, bank statements and title papers end up, whatever route they arrived by.",
    dataCategoryIds: ["client-kyc", "employment-income", "financial-records", "property-ownership-docs", "third-party-records"],
    accessPersonaIds: ["documentation-staff", "sales-exec", "owner", "finance-staff"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "This is the highest-impact collection the firm holds, it is assembled from WhatsApp and email rather than a controlled channel, and duplicate versions of the same document accumulate with no owner.",
    riskAction:
      "Move collection to a secure upload link, keep one folder per transaction with named access, mask the identifiers the deal does not need, and delete the working copies once the deal closes.",
  },
  {
    id: "secure-upload-portal",
    name: "Secure document upload link",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["kyc-documents"],
    description:
      "The controlled route for documents where a firm has set one up - the single change that removes the most copies from the rest of this map.",
    dataCategoryIds: ["client-kyc", "financial-records", "property-ownership-docs"],
    accessPersonaIds: ["documentation-staff", "owner"],
    retentionDefined: true,
    riskLevel: "low",
  },
  {
    id: "staff-laptop",
    name: "Staff laptop & desktop downloads",
    nodeType: "device",
    boundary: "agency",
    stageIds: ["kyc-documents", "agreement", "archive"],
    description:
      "Documents downloaded to work on them - a PAN copy to attach, a draft to edit, a bank statement to forward - and then left in the Downloads folder for years.",
    dataCategoryIds: ["client-kyc", "financial-records", "transaction-documents", "staff-access-record"],
    accessPersonaIds: ["documentation-staff", "sales-exec", "finance-staff", "ex-staff"],
    shadowIt: true,
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Every download creates a copy the firm has no record of, on a machine that is often shared, rarely encrypted and sometimes sold or passed on.",
    riskAction:
      "Work from the folder rather than downloading, disable local downloads for documentation staff, and clear and wipe machines before they change hands.",
  },
  {
    id: "title-search-vendor",
    name: "Title search & legal opinion vendor",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["kyc-documents"],
    description:
      "The advocate or agency verifying ownership, who receives the property papers - and with them the seller's, the previous owners' and the family's details.",
    dataCategoryIds: ["property-ownership-docs", "third-party-records", "client-identity"],
    accessPersonaIds: ["vendor-staff", "documentation-staff"],
    retentionDefined: false,
    riskLevel: "medium",
  },
  {
    id: "physical-file-cupboard",
    name: "Physical file cupboard",
    nodeType: "physical_storage",
    boundary: "agency",
    stageIds: ["kyc-documents", "agreement", "archive"],
    description:
      "The office almirah of photocopies, signed forms, agreement sets and identity documents - unlocked during the day, and never audited.",
    dataCategoryIds: ["client-kyc", "transaction-documents", "property-ownership-docs"],
    accessPersonaIds: ["documentation-staff", "owner", "field-exec"],
    retentionDefined: false,
    riskLevel: "medium",
  },

  // ---- Stage 8 · Tenant screening & police verification -------------------
  {
    id: "police-verification-portal",
    name: "Police tenant-verification",
    nodeType: "system",
    boundary: "government",
    stageIds: ["screening"],
    description:
      "The form and identity copies submitted to the local station for the tenant, and often for every adult occupant and the domestic staff as well.",
    dataCategoryIds: ["client-kyc", "household-occupancy", "third-party-records", "client-identity"],
    accessPersonaIds: ["authority-staff", "documentation-staff", "owner-landlord"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Once submitted this is an authority-controlled record the firm cannot amend or withdraw, and it usually carries documents for people who were never asked.",
    riskAction:
      "Submit only what the form requires, distinguish the tenant from household members and staff, and delete the firm's own working copies once the acknowledgement is received.",
    businessModels: PM,
  },
  {
    id: "tenant-screening-vendor",
    name: "Screening & verification vendor",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["screening"],
    description:
      "The background-check provider or employer-verification service that confirms who the tenant is, where they work and what the previous landlord thought.",
    dataCategoryIds: ["employment-income", "client-kyc", "client-scoring", "third-party-records"],
    accessPersonaIds: ["vendor-staff", "documentation-staff"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "The vendor keeps the full submission and produces a decision about a person, including subjective comments from a previous landlord that the tenant never sees.",
    riskAction:
      "Contract for deletion after the decision, keep the result rather than the underlying documents, and give a rejected applicant a route to see and dispute what was said.",
    businessModels: PM,
  },

  // ---- Stage 9 · Loan, lender & payment coordination ----------------------
  {
    id: "loan-desk-file",
    name: "Loan file & home-loan desk",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["finance"],
    description:
      "The assembled financial pack - identity, salary slips, six months of bank statements, employment proof, the property papers and the co-applicant's set - ready to be sent wherever it needs to go.",
    dataCategoryIds: ["financial-records", "employment-income", "client-kyc", "third-party-records"],
    accessPersonaIds: ["finance-staff", "sales-exec", "documentation-staff", "lender-person"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "The same complete pack is sent to several lenders at once to find the best rate, so the client's finances end up in three or four organisations of which only one is chosen.",
    riskAction:
      "Send on the client's explicit instruction and record which lenders received it, then chase closure and deletion with the ones that declined.",
    businessModels: SALES,
  },
  {
    id: "bank-nbfc",
    name: "Bank / NBFC",
    nodeType: "system",
    boundary: "third-party",
    stageIds: ["finance"],
    description:
      "The lender assessing eligibility, running credit checks and producing a sanction or a rejection with a reason attached to the client's name.",
    dataCategoryIds: ["financial-records", "employment-income", "client-scoring"],
    accessPersonaIds: ["lender-person"],
    retentionDefined: true,
    riskLevel: "medium",
    businessModels: SALES,
  },
  {
    id: "credit-marketplace",
    name: "Loan marketplace / aggregator",
    nodeType: "system",
    boundary: "third-party",
    stageIds: ["finance"],
    description:
      "An online comparison platform the file is uploaded to, which distributes it onward to whichever lenders are bidding that week.",
    dataCategoryIds: ["financial-records", "employment-income", "client-identity", "marketing-profile"],
    accessPersonaIds: ["lender-person", "vendor-staff"],
    retentionDefined: false,
    riskLevel: "medium",
    businessModels: SALES,
  },

  // ---- Stage 10 · Agreement, stamp duty & registration --------------------
  {
    id: "documentation-vendor",
    name: "Drafting, notary & registration agents",
    nodeType: "system",
    boundary: "third-party",
    stageIds: ["agreement", "archive"],
    description:
      "The chain that turns a deal into an instrument - the drafter, the advocate, the stamp vendor, the notary and the registration agent who queues at the sub-registrar's office - each receiving a full set of identity documents.",
    dataCategoryIds: ["client-kyc", "transaction-documents", "property-ownership-docs", "third-party-records"],
    accessPersonaIds: ["vendor-staff", "documentation-staff", "authority-staff"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "Every intermediary is sent the whole set because it is quicker than working out who needs what, and each of them keeps a copy indefinitely - including of the witnesses and the co-applicant.",
    riskAction:
      "Define which documents each intermediary actually requires, send only that, and get a written deletion commitment from the agents you use repeatedly.",
  },
  {
    id: "estamp-esign-platform",
    name: "E-stamping & e-signature platform",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["agreement"],
    description:
      "Where stamp duty is paid and the agreement is executed, capturing identity verification, signatures and an audit trail for every party and witness.",
    dataCategoryIds: ["transaction-documents", "client-kyc", "third-party-records"],
    accessPersonaIds: ["vendor-staff", "documentation-staff"],
    retentionDefined: true,
    riskLevel: "medium",
  },
  {
    id: "sub-registrar-office",
    name: "Sub-registrar's office",
    nodeType: "system",
    boundary: "government",
    stageIds: ["agreement"],
    description:
      "Where the instrument is presented, photographs and biometrics are captured, witnesses are recorded and the document is registered.",
    dataCategoryIds: ["transaction-documents", "client-kyc", "third-party-records", "property-ownership-docs"],
    accessPersonaIds: ["authority-staff", "documentation-staff"],
    retentionDefined: true,
    riskLevel: "medium",
  },
  {
    id: "public-property-record",
    name: "Registered instrument & public record",
    nodeType: "repository",
    boundary: "public",
    stageIds: ["agreement", "archive"],
    description:
      "The registered deed and its index entry - obtainable as a certified copy or an encumbrance certificate by anyone with the property details, carrying names, addresses and consideration.",
    dataCategoryIds: ["transaction-documents", "client-identity", "property-ownership-docs"],
    accessPersonaIds: ["authority-staff", "vendor-staff"],
    retentionDefined: true,
    riskLevel: "high",
    riskWhy:
      "This is the one record on the map that the firm can never correct or delete, and clients routinely assume the opposite when they ask for erasure.",
    riskAction:
      "Keep only what the instrument requires out of the personal details supplied, and tell clients plainly at signing which parts of this become an authority-controlled record.",
  },
  {
    id: "deposit-ledger",
    name: "Deposit & rent ledger",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["agreement", "tenancy", "exit"],
    description:
      "Security deposit received, rent due and paid, deductions made - the financial spine of a tenancy and the evidence base for any dispute at the end of it.",
    dataCategoryIds: ["financial-records", "client-identity", "transaction-documents"],
    accessPersonaIds: ["finance-staff", "owner", "owner-landlord"],
    retentionDefined: true,
    riskLevel: "medium",
    businessModels: PM,
  },

  // ---- Stage 11 · Construction, demand notices & payments -----------------
  {
    id: "customer-portal",
    name: "Customer portal",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["construction", "possession"],
    description:
      "Where the buyer logs in for construction progress, payment schedule, receipts and service requests over the years between booking and possession.",
    dataCategoryIds: ["financial-records", "transaction-documents", "communication-records", "client-identity"],
    accessPersonaIds: ["client", "finance-staff", "sales-exec"],
    retentionDefined: true,
    riskLevel: "medium",
    businessModels: DEV,
  },
  {
    id: "demand-notice-billing",
    name: "Demand notices & payment reminders",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["construction"],
    description:
      "Construction-linked demands, outstanding balances, delay status and escalating reminders by email, SMS and WhatsApp - to the buyer, and sometimes to the wrong co-applicant.",
    dataCategoryIds: ["financial-records", "client-identity", "communication-records", "client-scoring"],
    accessPersonaIds: ["finance-staff", "sales-exec", "owner"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "A buyer's outstanding balance and default status become visible to the whole sales team, and reminders sent to the wrong number disclose it outside the family.",
    riskAction:
      "Separate finance visibility from sales, verify the liable party's contact before each reminder run, and keep the amount out of the message body.",
    businessModels: DEV,
  },

  // ---- Stage 12 · Possession, handover & defects --------------------------
  {
    id: "possession-inspection-app",
    name: "Possession & inspection app",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["possession"],
    description:
      "The snagging walkthrough - photographs of the interior of a home, a defect list, and the buyer's acknowledgement that possession was taken.",
    dataCategoryIds: ["maintenance-complaint", "transaction-documents", "client-identity"],
    accessPersonaIds: ["field-exec", "vendor-staff", "documentation-staff"],
    retentionDefined: false,
    riskLevel: "medium",
    businessModels: DEV,
  },
  {
    id: "defect-photo-repository",
    name: "Defect & handover photo store",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["possession"],
    description:
      "Thousands of photographs of the insides of people's homes, filed by unit number and shared with contractors to get the snags fixed.",
    dataCategoryIds: ["maintenance-complaint", "occupancy-access", "client-identity"],
    accessPersonaIds: ["field-exec", "vendor-staff", "documentation-staff"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Interior photographs keyed to a unit number and an owner's name are shared with contractors and kept forever, long after the defect was closed.",
    riskAction:
      "Delete handover photographs once the snag is signed off, share them with a link that expires, and keep the defect record without the images.",
    businessModels: DEV,
  },
  {
    id: "key-handover-register",
    name: "Key & access register",
    nodeType: "physical_storage",
    boundary: "agency",
    stageIds: ["possession", "tenancy", "exit"],
    description:
      "Who holds which keys, access cards and gate codes for which unit - kept in a cupboard or a spreadsheet, and rarely reconciled against who still works there.",
    dataCategoryIds: ["occupancy-access", "client-identity", "transaction-documents"],
    accessPersonaIds: ["field-exec", "documentation-staff", "owner", "vendor-staff"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "This is a list of homes and how to get into them, held with less protection than the KYC folder next to it and never reviewed when staff or vendors change.",
    riskAction:
      "Reconcile the register monthly, log every issue and return by name, and recover or re-key access whenever a field executive or contractor stops working on the property.",
    businessModels: DEV_PM,
  },

  // ---- Stage 13 · Tenancy, rent & maintenance access ----------------------
  {
    id: "rent-collection-platform",
    name: "Rent collection platform",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["tenancy"],
    description:
      "Rent invoicing, auto-debit, late-payment tracking and reminders - producing a month-by-month record of whether this person pays on time.",
    dataCategoryIds: ["financial-records", "client-identity", "client-scoring"],
    accessPersonaIds: ["finance-staff", "vendor-staff", "owner-landlord"],
    retentionDefined: true,
    riskLevel: "medium",
    businessModels: PM,
  },
  {
    id: "landlord-statement",
    name: "Landlord statement & reporting",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["tenancy", "exit"],
    description:
      "The monthly account sent to the owner - payouts, arrears, complaints and, more often than it needs to be, the tenant's full circumstances.",
    dataCategoryIds: ["financial-records", "client-identity", "maintenance-complaint", "client-scoring"],
    accessPersonaIds: ["owner-landlord", "finance-staff"],
    retentionDefined: false,
    riskLevel: "medium",
    businessModels: PM,
  },
  {
    id: "maintenance-work-order-app",
    name: "Maintenance & work-order app",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["tenancy"],
    description:
      "Complaints logged, jobs dispatched, and with each job the tenant's name, flat number, mobile number, when they are home and how the contractor is to get in.",
    dataCategoryIds: ["maintenance-complaint", "occupancy-access", "client-identity", "communication-records"],
    accessPersonaIds: ["field-exec", "vendor-staff", "documentation-staff"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Home-access instructions and a tenant's availability are handed to a rotating set of contractors, and the job history stays open to them after the work is done.",
    riskAction:
      "Mask the tenant's number behind a call proxy, give each work order a time-boxed access window, and close the contractor's view of the job at sign-off.",
    businessModels: PM,
  },

  // ---- Stage 14 · Society, facility & resident handover -------------------
  {
    id: "society-app-gate",
    name: "Society app & gate system",
    nodeType: "system",
    boundary: "client",
    stageIds: ["society"],
    description:
      "MyGate, NoBrokerHood, ADDA or the society's own system - resident directory, visitor approvals, delivery logs, vehicle records and entry history, running continuously.",
    dataCategoryIds: ["occupancy-access", "client-identity", "household-occupancy", "third-party-records"],
    accessPersonaIds: ["society-staff", "vendor-staff", "household-member"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "It keeps generating new personal data about the resident and everyone who visits them long after handover, and the firm has no ability to correct or delete any of it.",
    riskAction:
      "Hand over the minimum resident dataset, record in writing that the society is responsible for what it collects afterwards, and tell residents plainly what you can no longer reach.",
    businessModels: DEV_PM,
  },
  {
    id: "facility-management-system",
    name: "Facility management system",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["society", "tenancy"],
    description:
      "The FM contractor's own platform for the building - resident contacts, unit-level service history, staff rosters and access provisioning.",
    dataCategoryIds: ["client-identity", "occupancy-access", "maintenance-complaint"],
    accessPersonaIds: ["vendor-staff", "society-staff"],
    retentionDefined: false,
    riskLevel: "medium",
    businessModels: DEV_PM,
  },
  {
    id: "domestic-staff-register",
    name: "Domestic staff & helper register",
    nodeType: "repository",
    boundary: "client",
    stageIds: ["society"],
    description:
      "Identity documents, photographs and police-verification status for cooks, cleaners, drivers and nannies - collected by the society from people with no say in it.",
    dataCategoryIds: ["third-party-records", "client-kyc", "occupancy-access"],
    accessPersonaIds: ["society-staff", "household-member"],
    retentionDefined: false,
    riskLevel: "medium",
    businessModels: DEV_PM,
  },
  {
    id: "society-whatsapp-group",
    name: "Resident & society WhatsApp group",
    nodeType: "system",
    boundary: "client",
    stageIds: ["society"],
    description:
      "Where handover lists, tenant details, verification documents and complaints get posted because it is the fastest way to reach the committee.",
    dataCategoryIds: ["client-identity", "client-kyc", "household-occupancy", "communication-records"],
    accessPersonaIds: ["society-staff", "household-member", "field-exec"],
    shadowIt: true,
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "A tenant's identity documents posted to a group of a hundred neighbours cannot be withdrawn, and the firm is often the one that posted them.",
    riskAction:
      "Never send resident or tenant documents to a group; use a named committee contact, and share a verification status rather than the underlying document.",
    businessModels: DEV_PM,
  },

  // ---- Stage 15 · Renewal, exit & deposit settlement ----------------------
  {
    id: "exit-inspection-record",
    name: "Exit inspection & damage record",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["exit"],
    description:
      "Move-out photographs, the damage assessment, the deductions taken from the deposit and the tenant's forwarding address - the raw material of a reputation.",
    dataCategoryIds: ["maintenance-complaint", "financial-records", "client-identity", "client-scoring"],
    accessPersonaIds: ["field-exec", "finance-staff", "owner-landlord"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "A contested deduction hardens into a permanent label about a person, and is often consulted when the same firm screens them for the next property.",
    riskAction:
      "Give the tenant the evidence and a route to dispute it, delete the photographs once settlement is agreed, and keep exit records out of any future screening decision.",
    businessModels: PM,
  },

  // ---- Stage 16 · Commission, referral & post-deal reuse ------------------
  {
    id: "commission-tracker",
    name: "Commission & payout tracker",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["commission"],
    description:
      "The spreadsheet of who closed what, at what value, with which co-broker or partner splitting the fee - naming the client next to the deal size.",
    dataCategoryIds: ["financial-records", "client-identity", "transaction-documents"],
    accessPersonaIds: ["owner", "finance-staff", "sales-exec"],
    retentionDefined: false,
    riskLevel: "medium",
  },
  {
    id: "accounting-system",
    name: "Accounting & tax records",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["construction", "tenancy", "commission"],
    description:
      "Invoices, receipts, TDS and the books - the copies that genuinely have to be kept, and the reason \"delete everything\" is never the right answer.",
    dataCategoryIds: ["financial-records", "client-identity", "transaction-documents"],
    accessPersonaIds: ["finance-staff", "owner"],
    retentionDefined: true,
    riskLevel: "low",
  },
  {
    id: "marketing-reuse-platform",
    name: "Marketing lists & audience uploads",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["commission", "archive"],
    description:
      "Where closed clients, failed clients and old enquiries become campaign lists, referral chases, WhatsApp broadcasts and uploaded ad audiences for the next launch.",
    dataCategoryIds: ["marketing-profile", "client-identity", "client-scoring", "requirement-budget"],
    accessPersonaIds: ["owner", "sales-exec", "vendor-staff"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "Everyone who ever enquired ends up here by default, and a withdrawal honoured in the CRM does not reach the agency's export, the broadcast list or the audience already uploaded.",
    riskAction:
      "Hold one suppression list that every channel and agency must check, remove uploaded audiences when someone withdraws, and stop adding closed clients automatically.",
  },
  {
    id: "review-referral-platform",
    name: "Review & referral platform",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["commission"],
    description:
      "Automated review requests and referral prompts sent after closing - which reveal, to anyone who sees them, that this person just bought or rented a property.",
    dataCategoryIds: ["client-identity", "marketing-profile", "transaction-documents"],
    accessPersonaIds: ["vendor-staff", "sales-exec"],
    retentionDefined: false,
    riskLevel: "medium",
  },

  // ---- Stage 17 · Old leads, archives & deletion --------------------------
  {
    id: "old-lead-database",
    name: "Old lead & past-client database",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["archive"],
    description:
      "Years of enquiries, dead deals, past buyers and former tenants, kept because a five-year-old lead is genuinely worth money in this business - and never reviewed, aged out or deleted.",
    dataCategoryIds: ["client-identity", "requirement-budget", "client-scoring", "marketing-profile", "household-occupancy"],
    accessPersonaIds: ["owner", "sales-exec", "ex-staff"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "Nothing expires here, because the database is the firm's real asset. Most of the people in it never transacted, were never told they would be kept, and cannot be told who else now holds a copy.",
    riskAction:
      "Set a retention period per category - enquiry, KYC, transaction, tax - age out unconverted leads on that clock, and separate the records you must keep from the ones you have merely never deleted.",
  },
  {
    id: "cloud-backup",
    name: "Cloud drive & backups",
    nodeType: "repository",
    boundary: "vendor",
    stageIds: ["kyc-documents", "agreement", "archive"],
    description:
      "Whole-drive syncs and automatic backups holding every folder, document and export that ever existed, including the ones deleted from the front end.",
    dataCategoryIds: ["client-kyc", "financial-records", "transaction-documents", "staff-access-record"],
    accessPersonaIds: ["owner", "vendor-staff"],
    retentionDefined: false,
    riskLevel: "medium",
  },
  {
    id: "ex-staff-device",
    name: "Former staff's phone & exports",
    nodeType: "device",
    boundary: "third-party",
    stageIds: ["archive"],
    description:
      "The CRM export taken \"as a backup\", the synced contact list, and the WhatsApp history of every client - now at a competing firm, entirely outside your reach.",
    dataCategoryIds: ["client-identity", "requirement-budget", "communication-records", "client-scoring"],
    accessPersonaIds: ["ex-staff", "co-broker-person"],
    shadowIt: true,
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "In this industry a salesperson's client base is treated as their own, so the copy leaves with them - and no deletion, access or withdrawal request will ever reach it.",
    riskAction:
      "Disable exports for everyone but the owner, revoke CRM, sheet, portal and group access on the last working day, and reconcile the shared-link list monthly rather than on exit.",
  },
];
