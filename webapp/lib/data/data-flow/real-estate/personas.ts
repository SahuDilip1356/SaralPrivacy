// People who touch client and property data in a real-estate or property firm.
// Rendered in node detail panels as access lists.
//
// The structurally interesting roles here are the ones OUTSIDE the firm who
// nonetheless hold the client's number and documents as a matter of routine:
// the co-broker who was forwarded a requirement, the channel partner paid on
// attribution, the loan agent who keeps a copy of everyone's bank statements,
// the contractor who is told how to get into the flat. None of them are
// processors acting on the firm's instructions, and none of them are the firm's
// client - which is exactly why they sit in `third-party` and why a rights
// request struggles to reach them.
//
// `ex-staff` is a persona in its own right because in this sector a departing
// salesperson leaves with a working copy of the client base, and everyone in
// the industry knows it.

import type { FlowPersona } from "../../../data-flow/schemas.ts";

export const REAL_ESTATE_PERSONAS: FlowPersona[] = [
  {
    id: "client",
    name: "Buyer / tenant client",
    boundary: "candidate",
    description: "The data principal - the person whose property file this map follows, whether they are buying, renting or still only enquiring.",
  },
  {
    id: "co-applicant-person",
    name: "Co-applicant, guarantor or nominee",
    boundary: "candidate",
    description: "Named on the booking, the loan or the agreement. A separate data principal whose documents arrive with the client's and are rarely tracked separately.",
  },
  {
    id: "household-member",
    name: "Household member or domestic staff",
    boundary: "candidate",
    description: "Family, occupants and the people who work in the home. Their details are collected for occupancy and society records without any of them ever dealing with the firm.",
  },
  {
    id: "owner-landlord",
    name: "Seller or landlord",
    boundary: "client",
    description: "The other side of the deal, and a data principal too - their KYC, bank details and title papers sit in the same systems as the buyer's.",
  },
  {
    id: "owner",
    name: "Founder / proprietor",
    boundary: "agency",
    description: "Runs the firm. Usually holds every login, every export and the master copy of the client base, with no restriction on any of it.",
  },
  {
    id: "sales-exec",
    name: "Sales executive",
    boundary: "agency",
    description: "Owns the client relationship day to day. Works from the CRM, a spreadsheet and their own phone, largely interchangeably.",
  },
  {
    id: "field-exec",
    name: "Field executive / site coordinator",
    boundary: "agency",
    description: "Runs site visits, viewings, move-ins and inspections. Carries client contact details, keys and photographs on a personal handset.",
  },
  {
    id: "documentation-staff",
    name: "Documentation & CRM coordinator",
    boundary: "agency",
    description: "Collects KYC, chases missing papers and maintains the folders. Sees every document in the office and is rarely access-controlled.",
  },
  {
    id: "finance-staff",
    name: "Finance & accounts",
    boundary: "agency",
    description: "Handles commission, payouts, deposits, rent and tax records - the copies that legitimately have to be kept longest.",
  },
  {
    id: "ex-staff",
    name: "Former staff member",
    boundary: "third-party",
    description: "A salesperson or field executive who has left, still holding an export, a contact sync or a WhatsApp history of the client base.",
  },
  {
    id: "co-broker-person",
    name: "Co-broker / freelance agent",
    boundary: "third-party",
    description: "An independent agent the requirement was forwarded to. Not a processor, not a client, and under no instruction about what to keep.",
  },
  {
    id: "channel-partner-person",
    name: "Channel partner",
    boundary: "third-party",
    description: "A contracted sales partner for a project, paid on attribution. Runs their own CRM, their own team and their own copy of the lead.",
  },
  {
    id: "lender-person",
    name: "Loan agent, bank or NBFC",
    boundary: "third-party",
    description: "Receives the full financial file to assess eligibility - often several of them at once, only one of which is chosen.",
  },
  {
    id: "vendor-staff",
    name: "Vendor & contractor staff",
    boundary: "vendor",
    description: "Portals, CRM and screening providers, drafting and registration services, facility and maintenance contractors - each holding a slice of the file.",
  },
  {
    id: "society-staff",
    name: "Society, RWA & security staff",
    boundary: "client",
    description: "Committee members, facility managers and gate staff who receive resident data and then keep generating more of it, outside the firm's control.",
  },
  {
    id: "authority-staff",
    name: "Registration & police officials",
    boundary: "government",
    description: "The sub-registrar's office and the local police station. What reaches them becomes an authority-controlled record the firm cannot amend or withdraw.",
  },
];
