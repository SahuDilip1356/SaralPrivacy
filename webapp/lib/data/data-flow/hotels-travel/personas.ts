// People who touch guest and traveller data in a hotel, a travel agency or a
// hospitality group. Rendered in node detail panels as access lists.
//
// The structurally interesting roles here are the ones OUTSIDE the business who
// nonetheless hold the guest's passport, room number or itinerary as a matter of
// routine: the OTA that took the booking, the transfer driver sent the arrival
// name and flight, the guide handed a group list, the visa consultant keeping a
// folder of bank statements, the tour manager carrying everyone's passports in a
// bag. None of them are processors acting on tidy instructions, and several are
// not the business's client either - which is exactly why they sit in
// `third-party` and why a rights request struggles to reach them.
//
// Two personas exist because of this sector specifically. `companion` covers
// everyone in the file who never dealt with the business - the spouse on the
// room, the child on the package, the emergency contact. `corporate-booker` is
// the person who books on somebody else's behalf and then receives the invoice,
// which is how an employer ends up knowing what an employee did on a Saturday
// night.

import type { FlowPersona } from "../../../data-flow/schemas.ts";

export const HOTELS_TRAVEL_PERSONAS: FlowPersona[] = [
  {
    id: "guest",
    name: "Guest / traveller",
    boundary: "candidate",
    description:
      "The data principal - the person whose stay or trip this map follows, whether they have booked, are mid-journey or only enquired.",
  },
  {
    id: "companion",
    name: "Companion, child or emergency contact",
    boundary: "candidate",
    description:
      "A spouse, co-traveller, child, elderly parent or named emergency contact. Their details sit in the booking, and almost none of them ever dealt with the business.",
  },
  {
    id: "corporate-booker",
    name: "Corporate booker or travel coordinator",
    boundary: "client",
    description:
      "Books and pays on someone else's behalf, and receives the invoice - which is how an employer can end up seeing an itemised account of an employee's stay.",
  },
  {
    id: "owner-manager",
    name: "Owner / general manager",
    boundary: "agency",
    description:
      "Runs the property or the agency. Usually holds every login, every export and the master guest list, with no restriction on any of it.",
  },
  {
    id: "reservations-staff",
    name: "Reservations & sales staff",
    boundary: "agency",
    description:
      "Takes enquiries and builds bookings across the website, OTA extranets, the phone and WhatsApp, moving between the system and their own handset without noticing which one they are in.",
  },
  {
    id: "front-desk-staff",
    name: "Front-office & guest-relations staff",
    boundary: "agency",
    description:
      "Checks guests in, scans identity documents, allocates rooms and issues keys. Sees the full guest profile including preferences, notes and past complaints.",
  },
  {
    id: "operations-staff",
    name: "Housekeeping, F&B, spa & operations staff",
    boundary: "agency",
    description:
      "Delivers the service and records it. Sees room numbers, occupancy patterns, dietary and health notes, and often coordinates on a shared WhatsApp group.",
  },
  {
    id: "security-staff",
    name: "Security & surveillance staff",
    boundary: "agency",
    description:
      "Operates CCTV, access control and the visitor register, frequently on shared accounts, and can see where a named guest went and when.",
  },
  {
    id: "tour-manager",
    name: "Tour manager & field escort",
    boundary: "agency",
    description:
      "Travels with the group carrying passports, rooming lists, emergency contacts and medical notes on a personal phone and in a physical folder.",
  },
  {
    id: "finance-staff",
    name: "Finance & accounts",
    boundary: "agency",
    description:
      "Handles folios, deposits, refunds, supplier settlement and tax records - the copies that legitimately have to be kept longest.",
  },
  {
    id: "marketing-staff",
    name: "Marketing & loyalty team",
    boundary: "agency",
    description:
      "Runs campaigns, the loyalty programme and audience uploads. Works from exports of the guest base and rarely sees the notice the guest was originally given.",
  },
  {
    id: "ex-staff",
    name: "Former staff member",
    boundary: "third-party",
    description:
      "A reservations or front-office employee who has left, still holding an export, a contact sync or a WhatsApp history full of guest documents.",
  },
  {
    id: "ota-staff",
    name: "OTA & booking-platform staff",
    boundary: "vendor",
    description:
      "The online travel agency, booking engine and channel manager. They hold the guest before you do, on their own terms, and keep the record after yours is deleted.",
  },
  {
    id: "travel-supplier-person",
    name: "Airline, hotel & transport supplier staff",
    boundary: "third-party",
    description:
      "Carriers, GDS operators, bed banks, partner hotels, transfer drivers and rail or bus operators who receive traveller identity and itinerary to fulfil a booking.",
  },
  {
    id: "destination-partner-person",
    name: "Guide, DMC & activity provider",
    boundary: "third-party",
    description:
      "Local partners at the destination who are handed a group list, arrival times and special requirements, and who keep it on whatever device they use.",
  },
  {
    id: "vendor-staff",
    name: "Vendor & service-provider staff",
    boundary: "vendor",
    description:
      "PMS, CRM, Wi-Fi, payment, visa-assistance, insurance and marketing-agency staff, each holding a slice of the guest file under contract.",
  },
  {
    id: "authority-staff",
    name: "Immigration & local authority officials",
    boundary: "government",
    description:
      "Recipients of foreign-national guest reports and of records demanded during an investigation. What reaches them is authority-controlled and not yours to amend or withdraw.",
  },
];
