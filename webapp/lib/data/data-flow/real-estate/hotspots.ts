// The eight hotspots for a real-estate or property firm, ranked worst-first.
//
// THE COUNT IS DERIVED, NOT CHOSEN (spec §3). Nine of the seventeen stages are
// all-model; eight of them carry a hotspot, and every hotspot node is UNGATED
// with its EARLIEST stage on that distinct all-model stage:
//
//   1 co-broker-group ........ matching (4)       5 shared-lead-sheet ....... enquiry (2)
//   2 kyc-document-folder .... kyc-documents (7)  6 field-exec-phone ........ site-visit (5)
//   3 old-lead-database ...... archive (17)       7 documentation-vendor .... agreement (10)
//   4 sales-crm .............. qualification (3)  8 marketing-reuse-platform  commission (16)
//
// ⇒ flags = 8 = counter in brokerage, developer and property-management, by
// arithmetic rather than by anyone checking. See nodes.ts for why this matters
// and the `hotspots reconcile with the counter` guard test for what happens if
// it stops being true.
//
// The pasted spec proposed 10 + 11 + 10 per-variant hotspots. The counter and
// legend print `pack.hotspots.length`, pack-level and unfiltered, so a per-model
// set would make the counter lie in every view but one. The other twenty-three
// are authored as high- and critical-risk NODES instead - they render in full in
// the journey, the drawer and the table, they simply carry no red flag (spec §3).
//
// Buckets map to lib/data/industry-assessment/packs/real-estate.ts. All FIVE of
// the pack's buckets are reachable from this rail, and every one of them must
// also appear in the assessment client's BUCKET_FOCUS or the deep-link guard
// test fails.
//
// RANK 1 IS THE SECTOR'S SIGNATURE. In every other map the worst case is data
// reaching someone it should not have. Here the worst case is data reaching
// exactly who it was meant to - forty independent agents, at once, because that
// is how stock gets found - after which nobody can list who holds it.
//
// LANGUAGE LOCK (spec §5): custody and control, never an accusation. Broker
// networks are how this industry works. No property, title, lending or
// registration advice.

import type { FlowHotspot } from "../../../data-flow/schemas.ts";

export const REAL_ESTATE_HOTSPOTS: FlowHotspot[] = [
  {
    id: "hs-broker-group",
    rank: 1,
    nodeId: "co-broker-group",
    title: "One post puts your client on forty phones",
    whatHappens:
      "To find matching stock, the requirement goes into the co-broker or channel-partner group: name, mobile number, budget, area, and often how many people will live there. Every agent in the group now has it on their own handset.",
    whyItMatters:
      "It cannot be recalled, the recipients cannot be listed, and none of them is under any instruction about what to keep. When the client later asks who has their number, this is the part of the answer no firm can give.",
    dataCategoryIds: ["client-identity", "requirement-budget", "household-occupancy"],
    action:
      "Post the requirement without the identity first, and release the number only to the agent who actually has matching stock - with a note of who was given what, and never a KYC document in a group.",
    assessmentBucket: "broker_network_sharing",
  },
  {
    id: "hs-kyc-folder",
    rank: 2,
    nodeId: "kyc-document-folder",
    title: "PAN, Aadhaar and bank statements arrive on WhatsApp and never leave",
    whatHappens:
      "Identity proofs, salary slips, six months of bank statements and the property's title chain come in as photographs and email attachments, get saved into a folder, downloaded to a laptop, printed for the file and backed up to a cloud drive.",
    whyItMatters:
      "This is the highest-impact collection the firm holds, and it exists in five places at once because it was never collected through one. Nobody can say how many copies of a client's Aadhaar the office currently has.",
    dataCategoryIds: ["client-kyc", "financial-records", "employment-income", "property-ownership-docs"],
    action:
      "Move collection to a secure upload link, keep one folder per transaction with named access, mask the identifiers the deal does not need, and clear the working copies once it closes.",
    assessmentBucket: "kyc_property_document",
  },
  {
    id: "hs-old-leads",
    rank: 3,
    nodeId: "old-lead-database",
    title: "Nothing is ever deleted, because the old database is the business",
    whatHappens:
      "Enquiries that went nowhere, buyers from four years ago, tenants who moved out, numbers inherited from a departed salesperson - all kept, all still worked, all still called when a new project launches.",
    whyItMatters:
      "Most of the people in it never transacted and were never told they would be kept this long. In every other sector data is retained by inertia; here it is retained deliberately, because an old lead is worth money - which is exactly why a retention rule feels like losing an asset.",
    dataCategoryIds: ["client-identity", "requirement-budget", "marketing-profile", "client-scoring"],
    action:
      "Set a retention period per category - enquiry, KYC, transaction, tax - and age out unconverted leads on that clock. Separate what you must keep from what you have merely never deleted.",
    assessmentBucket: "retention_incident_readiness",
  },
  {
    id: "hs-crm-open-access",
    rank: 4,
    nodeId: "sales-crm",
    title: "Everyone in the office can read what you guessed about a client",
    whatHappens:
      "The CRM record holds an income band nobody verified, family and occupancy details, a seriousness score and the salesperson's own remarks - open to the whole team, exportable by anyone, and still there years later.",
    whyItMatters:
      "A client can ask to see and correct what you hold about them, including the opinions. Broad access also means a departing executive leaves with the client base, which in this industry is treated as normal.",
    dataCategoryIds: ["client-scoring", "employment-income", "household-occupancy", "staff-access-record"],
    action:
      "Move to deal-based access, keep notes factual and separate assumptions from what the client actually told you, restrict exports to the owner, and remove access on the last working day.",
    assessmentBucket: "crm_staff_vendor_access",
  },
  {
    id: "hs-lead-sheet",
    rank: 5,
    nodeId: "shared-lead-sheet",
    title: "The lead is on a spreadsheet before anyone has been told anything",
    whatHappens:
      "Portal exports, ad-form leads and walk-ins all land in a shared sheet within minutes - shared by link with the team, the agency and sometimes a co-broker, and never revoked once shared.",
    whyItMatters:
      "It is the firm's real intake system and it sits entirely outside any notice, any access control and any retention rule. It is also the first thing anyone downloads on their way out of the door.",
    dataCategoryIds: ["client-identity", "requirement-budget", "client-scoring"],
    action:
      "Make the CRM the only intake record, switch the sheet to view-only with named access, and audit who currently holds the link before changing anything else.",
    assessmentBucket: "client_lead_data",
  },
  {
    id: "hs-field-phone",
    rank: 6,
    nodeId: "field-exec-phone",
    title: "The site visit hands out the client's number and their movements",
    whatHappens:
      "The field executive gets the client's details on a personal handset, the client's number is shared with the site office, the owner and a co-broker, the gate register takes it down in front of the next visitor, and a live location keeps updating after everyone has gone home.",
    whyItMatters:
      "A visit generates location, attendance and household data about the client and whoever came with them, spread across parties the firm does not control - and it all stays on a phone that leaves when the executive does.",
    dataCategoryIds: ["site-visit-location", "client-identity", "household-occupancy"],
    action:
      "Route visits through the scheduler rather than direct numbers, turn off contact sync on work accounts, agree a retention period for gate registers and footage, and wipe the work profile when someone leaves.",
    assessmentBucket: "client_lead_data",
  },
  {
    id: "hs-documentation-chain",
    rank: 7,
    nodeId: "documentation-vendor",
    title: "Every intermediary gets the whole file because it is quicker",
    whatHappens:
      "The drafter, the advocate, the stamp vendor, the notary and the registration agent are each sent the complete identity and property set - along with the co-applicant's and the witnesses' documents - and each keeps a copy.",
    whyItMatters:
      "Nobody can say afterwards which of them still holds what. And once the instrument is registered, that part becomes an authority-controlled public record that the firm cannot correct or withdraw at all.",
    dataCategoryIds: ["client-kyc", "transaction-documents", "third-party-records", "property-ownership-docs"],
    action:
      "Work out which documents each intermediary actually needs and send only those; get a written deletion commitment from the agents you use repeatedly; and tell the client at signing which parts become a public record.",
    assessmentBucket: "kyc_property_document",
  },
  {
    id: "hs-marketing-reuse",
    rank: 8,
    nodeId: "marketing-reuse-platform",
    title: "Closing the deal moves them into the marketing list, not out of it",
    whatHappens:
      "Completed clients, failed deals and old enquiries are pushed into campaign lists, referral chases, WhatsApp broadcasts from personal numbers, and audiences uploaded back to the ad platform for the next launch.",
    whyItMatters:
      "A withdrawal honoured in the CRM does not reach the agency's export, the broadcast list or an audience already uploaded - so the person keeps hearing from you after asking you to stop, which is the complaint that actually gets made.",
    dataCategoryIds: ["marketing-profile", "client-identity", "client-scoring"],
    action:
      "Keep one suppression list that every channel and agency must check before sending, remove uploaded audiences when someone withdraws, and stop adding closed clients to campaigns automatically.",
    assessmentBucket: "client_lead_data",
  },
];
