// People who touch customer and prescription data in a retail chemist, an
// e-pharmacy or a hospital-linked chain. Rendered in node detail panels as
// access lists.
//
// The structurally interesting roles are the ones who can read a person's
// medicine history without being the pharmacist: the counter assistant who
// operates the billing software, the warehouse picker whose sheet names the
// patient, the aggregator's rider who is not employed by anyone in this chain,
// the support agent who opens a ticket with a prescription attached, the
// analytics team at head office. None of them needs the condition, and most of
// them can see it.
//
// Two personas exist because of this sector specifically. `family-caregiver`
// covers everyone in the file who never dealt with the pharmacy - the son who
// collects, the parent whose child is the patient, the spouse whose number is
// on the account. `prescriber` is the doctor or hospital whose own details are
// on every prescription the pharmacy holds: they are a data principal in this
// map too, and they never chose to be in the pharmacy's systems.

import type { FlowPersona } from "../../../data-flow/schemas.ts";

export const PHARMACIES_PERSONAS: FlowPersona[] = [
  {
    id: "customer",
    name: "Customer / patient",
    boundary: "candidate",
    description:
      "The data principal - the person whose prescription and medicine history this map follows, whether they are at the counter, ordering on an app or admitted upstairs.",
  },
  {
    id: "family-caregiver",
    name: "Family member, caregiver or child",
    boundary: "candidate",
    description:
      "The relative who collects, the parent ordering for a child, the spouse whose number is on the account, the carer for an elderly patient. Their details sit in somebody else's record, and most of them never dealt with the pharmacy.",
  },
  {
    id: "pharmacist",
    name: "Registered pharmacist",
    boundary: "agency",
    description:
      "Reviews the prescription, decides on substitution, dispenses and signs the register. The only role that genuinely needs the whole clinical picture - and usually not the only role that can see it.",
  },
  {
    id: "counter-staff",
    name: "Counter, billing & sales staff",
    boundary: "agency",
    description:
      "Takes the request, operates the billing software, searches the customer by phone number and prints the invoice. Can read every medicine a person has ever bought without needing to.",
  },
  {
    id: "owner-manager",
    name: "Proprietor / pharmacy manager",
    boundary: "agency",
    description:
      "Runs the shop or the outlet. Usually holds every login, every export and the customer list, sends the refill reminders personally, and has no restriction on any of it.",
  },
  {
    id: "warehouse-staff",
    name: "Warehouse, picking & packing staff",
    boundary: "agency",
    description:
      "Picks, labels, packs and quality-checks orders from a sheet that names the patient and the medicine. Frequently temporary or contract staff on shared accounts.",
  },
  {
    id: "delivery-staff",
    name: "Own delivery staff",
    boundary: "agency",
    description:
      "The shop's own delivery boy or driver, carrying an address, a phone number, a package with the medicine named on it, and often a cash-collection note - usually on a personal handset.",
  },
  {
    id: "support-staff",
    name: "Customer support & call-centre staff",
    boundary: "agency",
    description:
      "Handles order queries, complaints and returns. Opens tickets with prescriptions attached and can see the order and medicine history of anyone who calls.",
  },
  {
    id: "finance-staff",
    name: "Finance & accounts",
    boundary: "agency",
    description:
      "Handles invoices, the credit ledger, refunds, claim settlement and tax records - the copies that legitimately have to be kept longest, and that itemise every medicine.",
  },
  {
    id: "marketing-staff",
    name: "Marketing, loyalty & CRM team",
    boundary: "agency",
    description:
      "Runs refill campaigns, the loyalty programme and audience uploads, working from exports of the customer base and rarely seeing the notice the customer was originally given.",
  },
  {
    id: "analytics-staff",
    name: "Head-office analytics & data team",
    boundary: "agency",
    description:
      "Builds the segments, the adherence scores and the value bands from cross-outlet purchase history, for people they will never meet and whose records they see in full.",
  },
  {
    id: "it-admin",
    name: "IT & system administrator",
    boundary: "agency",
    description:
      "Holds the database, the backups and the ability to export everything. Often one person, often also the owner's relative, and often the only account that was never reviewed.",
  },
  {
    id: "ex-staff",
    name: "Former staff member",
    boundary: "third-party",
    description:
      "A counter assistant, pharmacist or support agent who has left, still holding a customer export, a contact sync or a WhatsApp history full of prescriptions.",
  },
  {
    id: "prescriber",
    name: "Doctor, clinic & hospital",
    boundary: "third-party",
    description:
      "The prescriber whose name, registration and clinic are on every prescription the pharmacy stores, and the hospital system that sends electronic orders. A data principal here too.",
  },
  {
    id: "supply-chain-partner",
    name: "Distributor & manufacturer staff",
    boundary: "third-party",
    description:
      "Receives complaint, batch and adverse-event information, and sometimes far more customer detail than an investigation needs.",
  },
  {
    id: "logistics-partner",
    name: "Delivery aggregator & rider",
    boundary: "third-party",
    description:
      "The logistics platform and the rider on it. They see the name, the number, the address and often the medicine, they are not employed by the pharmacy, and nothing tells them to delete anything.",
  },
  {
    id: "insurer-tpa",
    name: "Insurer & third-party administrator",
    boundary: "third-party",
    description:
      "Receives the prescription, the itemised medicine list and the patient's identity to approve or refuse a claim, and keeps its own file under its own retention rules.",
  },
  {
    id: "corporate-employer",
    name: "Employer & corporate health programme",
    boundary: "client",
    description:
      "Pays for an employee's medicines under a company scheme and receives the paperwork - which is how an employer can end up holding an itemised record of what a member of staff takes.",
  },
  {
    id: "vendor-staff",
    name: "Software, platform & processor staff",
    boundary: "vendor",
    description:
      "Pharmacy-management, marketplace, text-extraction, payment, CRM, cloud and marketing-agency staff, each holding a slice of the customer file under contract.",
  },
  {
    id: "authority-staff",
    name: "Drug-control & authority officials",
    boundary: "government",
    description:
      "Recipients of records the pharmacy is required to maintain and produce. What has been filed or shown to them is authority-controlled and not the pharmacy's to amend or withdraw.",
  },
];
