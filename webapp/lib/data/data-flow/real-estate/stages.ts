// Real-estate client & property lifecycle - 17 stages in the union, MODEL-GATED
// to 10 / 13 / 14. Spec: docs/SaralPrivacy_RealEstate_DataFlow_Spec.md §2.
//
// A candidate's data flows once. A CA client's returns every year. A law firm's
// matter file becomes public by design. A property firm's client file is a DEAL
// THAT ENDS AND A DATABASE THAT DOESN'T: the transaction closes at registration,
// and the record is kept afterwards precisely because it still has resale value.
// That is the sector's inversion - elsewhere data is retained by inertia, here
// it is retained because it is the firm's actual asset.
//
// The three models are genuinely different processes, not one journey with
// different systems (spec §2):
//   brokerage           - matches a client to somebody else's property, and
//                         circulates the requirement through a co-broker
//                         network. No construction schedule, no deposit.
//   developer           - campaigns into a call centre, books and allots a unit,
//                         then carries the buyer for years through demand
//                         notices, possession and a handover to the RWA.
//   property-management - takes a mandate over somebody's home, screens a
//                         tenant, then holds an ONGOING relationship: rent,
//                         vendors entering the property, keys, society systems,
//                         an exit inspection and a deposit deduction.
//
// NINE of the seventeen stages are ALL-MODEL. That is load-bearing: all eight
// hotspots sit on eight DISTINCT all-model stages, so the journey's red flags
// reconcile with the hotspot counter by arithmetic in every model (spec §3,
// guard test (a)). Do not gate an all-model stage without re-deriving §3.
//
// Two deliberate choices:
//  · `matching` is all-model and carries the broker-network circulation. A
//    developer's channel-partner portal and a property manager's tenant-sourcing
//    brokers are the same act as a brokerage's co-broker group - the client's
//    requirement leaving the firm to a network of independent parties. It is
//    also what lets the signature hotspot sit on an all-model stage.
//  · `agreement` is all-model. Sale deed, agreement for sale, allotment letter
//    and rent agreement all funnel identity and financial documents through
//    drafting vendors, e-stamping and the sub-registrar. WHICH instrument
//    differs; the exposure does not.
//
// Per-model counts are DERIVED from this union - one shared array filtered by
// model - so they cannot be set independently. Brokerage lands on exactly the
// ten stages the pasted spec's §9 journey describes (spec §2).

import type { FlowStage } from "../../../data-flow/schemas.ts";

const PM = ["property-management"];
const DEV = ["developer"];
const SALES = ["brokerage", "developer"];
const DEV_PM = ["developer", "property-management"];

export const REAL_ESTATE_STAGES: FlowStage[] = [
  {
    id: "landlord-mandate",
    name: "Landlord mandate & property onboarding",
    sequence: 1,
    summary:
      "Before any tenant exists, the firm takes on somebody's home: the owner's identity and PAN, their bank account for payouts, the title papers, the society details, and a set of keys. The property file opens here and outlives every tenancy that follows.",
    dpdpaNote:
      "The landlord is a data principal too. Collect only the documents the mandate needs, keep bank and identity details away from operational staff, and record how long the property file is kept after the mandate ends.",
    businessModels: PM,
  },
  {
    id: "enquiry",
    name: "Lead capture & first enquiry",
    sequence: 2,
    summary:
      "A buyer or tenant enquires through a portal listing, a project ad, the website, a walk-in or a forwarded number. Within minutes the same person exists on a portal dashboard, in a shared spreadsheet, in an ad platform's audience and on a salesperson's own phone.",
    dpdpaNote:
      "This is the moment to say what you collect and why. An enquiry made about one property is not consent to be contacted about every property for the next five years.",
  },
  {
    id: "qualification",
    name: "Qualification, budget & household profiling",
    sequence: 3,
    summary:
      "The follow-up call establishes budget, income, employer, family size, timeline and how serious they are - and records all of it, along with the salesperson's own opinion, in a CRM everyone in the office can open.",
    dpdpaNote:
      "Guessed income and personal remarks are still personal data, and a data principal can ask to see and correct them. Keep notes factual and separate what was told to you from what was assumed.",
  },
  {
    id: "matching",
    name: "Property matching & broker-network sharing",
    sequence: 4,
    summary:
      "To find stock, the requirement goes out: to co-broker WhatsApp groups, shared inventory sheets, channel-partner portals, builder teams and owners. The client's number, budget and household details now sit on phones the firm has never seen.",
    dpdpaNote:
      "Every onward share is a disclosure. Share the requirement before the identity where you can, keep a record of who received what, and be able to tell a client who now holds their number.",
  },
  {
    id: "site-visit",
    name: "Site visits, walk-ins & field coordination",
    sequence: 5,
    summary:
      "The visit is arranged and the client's name, number and arrival time go to a field executive, a security desk, a site office or an owner. Gate registers, CCTV, visit photos, routes and shared live locations all record it.",
    dpdpaNote:
      "A site visit generates location and attendance data about the client and whoever came with them. Share the minimum the visit needs and set a retention period for registers, footage and photos.",
  },
  {
    id: "negotiation",
    name: "Offer, booking & terms",
    sequence: 6,
    summary:
      "An offer, a booking form or rent terms are put together, and with them the client's payment capacity, co-applicant, nominee and move-in plan. Screenshots of the offer travel between the firm, the owner and the network.",
    dpdpaNote:
      "A co-applicant, guarantor or nominee is a separate data principal. Record who authorised whom to speak, and do not disclose one applicant's financial position to another party by default.",
  },
  {
    id: "kyc-documents",
    name: "KYC, identity & property documents",
    sequence: 7,
    summary:
      "PAN, Aadhaar, passport, address proof, salary slips, bank statements and the property's title papers arrive - by WhatsApp, by email, as photos, as a bundle of hard copies - and are filed in whichever folder the coordinator uses.",
    dpdpaNote:
      "These are the highest-impact documents you hold. Collect them only when the transaction actually needs them, use one controlled channel, and know which copies exist where.",
  },
  {
    id: "screening",
    name: "Tenant screening & police verification",
    sequence: 8,
    summary:
      "The tenant, their household and sometimes their domestic staff are checked - employer confirmation, a screening vendor, the prior landlord, and a police verification form that goes to the station with copies of everyone's identity documents.",
    dpdpaNote:
      "Screening spreads identity data to parties outside your control and produces a decision about a person. Define exactly which documents each recipient needs, and delete the file of a tenant who was not taken on.",
    businessModels: PM,
  },
  {
    id: "finance",
    name: "Loan, lender & payment coordination",
    sequence: 9,
    summary:
      "To arrange finance the full file - identity, income proof, bank statements, employment details and the property papers - goes to a loan agent, then onward to two or three banks and NBFCs to see who says yes.",
    dpdpaNote:
      "Every lender approached is a separate recipient of high-impact financial data. Send on the client's instruction, record who received the file, and close out the copies held by lenders who declined.",
    businessModels: SALES,
  },
  {
    id: "agreement",
    name: "Agreement, stamp duty & registration",
    sequence: 10,
    summary:
      "Drafters, lawyers, notaries and registration agents assemble the instrument. Identity documents go to each of them, drafts circulate by email and WhatsApp, witnesses are named, and the executed document is registered with the sub-registrar.",
    dpdpaNote:
      "A registered instrument is an authority-controlled record: it is not yours to correct or delete afterwards. Share the minimum set with each intermediary and clear the working drafts once the final version exists.",
  },
  {
    id: "construction",
    name: "Construction updates, demand notices & payments",
    sequence: 11,
    summary:
      "For years afterwards the buyer receives construction-linked demands, reminders and progress updates - and the payment history, outstanding balance and delay status build a financial profile visible well beyond finance.",
    dpdpaNote:
      "Payment status is personal data about a customer. Send reminders to the person actually liable, keep balances out of general sales visibility, and stop using informal chat as the official service channel.",
    businessModels: DEV,
  },
  {
    id: "possession",
    name: "Possession, handover & defect management",
    sequence: 12,
    summary:
      "Handover creates a new set of records: inspection photographs of the home, a defect list, a key acknowledgement, vehicle and access details, and a resident contact record that facility and contractor systems will now use.",
    dpdpaNote:
      "This is a boundary crossing, not a continuation. Decide what actually transfers into resident, access and facility systems, and close the sales team's access once possession is done.",
    businessModels: DEV,
  },
  {
    id: "tenancy",
    name: "Move-in, rent collection & maintenance access",
    sequence: 13,
    summary:
      "Through the tenancy the firm holds rent history, late-payment status, keys and access instructions - and hands the tenant's name, address, number and availability to plumbers, electricians and cleaners so they can be let in.",
    dpdpaNote:
      "Home-access information is among the most consequential data you will share. Give each work order the minimum it needs, mask contact details where you can, and log every visit.",
    businessModels: PM,
  },
  {
    id: "society",
    name: "Society, facility & resident handover",
    sequence: 14,
    summary:
      "The society, RWA, facility manager and security vendor receive resident and occupancy data - unit, family, vehicles, emergency contacts, domestic staff, access credentials - and then keep recording visitors, entries and footage on their own.",
    dpdpaNote:
      "Once data is with a society or RWA it is largely outside your control. Hand over the minimum dataset, write down who is responsible for what, and be honest with residents about what you can no longer reach.",
    businessModels: DEV_PM,
  },
  {
    id: "exit",
    name: "Renewal, exit inspection & deposit settlement",
    sequence: 15,
    summary:
      "Move-out produces photographs of the home, a damage assessment, deductions from the deposit and a forwarding address - the raw material of a tenant-risk label that follows the person to their next application.",
    dpdpaNote:
      "A damage or default record is a judgement about a person. Support dispute and correction, keep settlement evidence separate from any future screening, and delete the temporary photographs.",
    businessModels: PM,
  },
  {
    id: "commission",
    name: "Commission, referral & post-deal reuse",
    sequence: 16,
    summary:
      "The deal is invoiced, commission is split and paid - and the client becomes a referral source, a review request, a lookalike audience and a future-investment prospect. So does the client whose deal fell through.",
    dpdpaNote:
      "Finishing the service is not permission to market. Keep transaction communication separate from promotion, and make a withdrawal request stick across every channel, list and agency export.",
  },
  {
    id: "archive",
    name: "Old leads, closed deals, archives & deletion",
    sequence: 17,
    summary:
      "Everything settles into the archive - CRM history, KYC folders, agreement copies, WhatsApp threads, staff phones, backups, the file cupboard, and the old-lead database that is quietly the firm's most valuable asset.",
    dpdpaNote:
      "Retention has to be decided per category, not for the file as a whole. Tax and commission records and the registered instrument have grounds to be kept; a five-year-old enquiry that never became a deal does not.",
  },
];
