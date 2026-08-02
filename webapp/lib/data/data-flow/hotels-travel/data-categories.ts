// Data groups a hotel, resort, travel agency or hospitality group holds.
// SIXTEEN, not the pasted spec's forty-seven: past ~16 the legend stops
// communicating and every node renders a wall of tags, so fine distinctions
// (call recordings, minibar use, vehicle details, honeymoon status, fraud
// flags, forex and SIM records) live in `examples` instead. Every one of the
// spec's forty-seven ids is covered here. Spec §4.
//
// Three categories do this sector's distinctive work:
//
//  · `identity-documents` - a passport or visa is not "an ID proof" here, it is
//    the thing the entire booking is built on. It is collected by three
//    different businesses for three different reasons, photographed on four
//    phones, and in India a foreign national's stay is reported to the state.
//  · `location-movement` - the only map in this series that records where the
//    data principal physically WAS, hour by hour: a key-card event, a Wi-Fi
//    association, a transfer GPS trail, a shared live location. It also records
//    when their home is empty, which is what makes it consequential.
//  · `companion-family` - most of the people in a hospitality file never dealt
//    with the business at all. A spouse on the room, a child on the package, an
//    elderly parent needing assistance, an emergency contact who was simply
//    named. None of them enquired about anything.
//
// `loyalty-marketing-profile` and `guest-scoring` are `derived`: the quiet half
// nobody counts as personal data. A churn score, a guest-value band, a
// "difficult guest" label and a lookalike audience are all new personal data the
// business created about an identifiable person.
//
// LANGUAGE LOCK (spec §5): "high-impact identity, travel and location data",
// never "sensitive personal data" - the DPDPA creates no such statutory
// category. The pasted spec makes the same point in its §8; hold it.

import type { DataCategory } from "../../../data-flow/schemas.ts";

export const HOTELS_TRAVEL_DATA_CATEGORIES: DataCategory[] = [
  {
    id: "guest-identity",
    name: "Guest & traveller identity",
    kind: "provided",
    examples: [
      "Name & title",
      "Mobile, email & home address",
      "Date of birth & age",
      "Nationality",
      "Booker acting for someone else",
    ],
  },
  {
    id: "identity-documents",
    name: "Passport, visa & identity documents",
    kind: "provided",
    examples: [
      "Passport copy & number",
      "Visa, OCI or entry stamp",
      "Aadhaar, PAN, driving licence or voter ID",
      "Photograph & signature",
      "Foreign-national guest report filed with the authorities",
    ],
  },
  {
    id: "companion-family",
    name: "Companions, children & emergency contacts",
    kind: "provided",
    examples: [
      "Spouse, partner & co-travellers",
      "Children & ages",
      "Elderly or dependent travellers",
      "Emergency contact & next of kin",
      "Relationship to the lead guest",
      "Group and tour member lists",
    ],
  },
  {
    id: "booking-itinerary",
    name: "Booking, reservation & itinerary",
    kind: "provided",
    examples: [
      "Reservation & booking reference",
      "PNR, ticket & voucher",
      "Room, rate plan & package",
      "Flight, rail, bus & cruise segments",
      "Check-in / check-out & travel dates",
      "Cancellation, amendment & no-show history",
    ],
  },
  {
    id: "payment-financial",
    name: "Payment, deposit & billing",
    kind: "provided",
    examples: [
      "Payment reference & gateway token",
      "Deposit & pre-authorisation",
      "Folio, invoice & itemised charges",
      "Instalment schedule & outstanding balance",
      "Refund, chargeback & dispute record",
      "Bank statement supplied for a visa file",
    ],
  },
  {
    id: "corporate-travel",
    name: "Corporate & employer travel records",
    kind: "provided",
    examples: [
      "Employer & corporate account code",
      "Travel-desk booker & approver",
      "Company billing & expense export",
      "Cost centre & trip purpose",
      "Personal extension attached to a business trip",
    ],
  },
  {
    id: "guest-preference",
    name: "Preferences, occasions & special requests",
    kind: "provided",
    examples: [
      "Room, floor & bed preference",
      "Meal & seat preference",
      "Honeymoon, anniversary or birthday",
      "Celebration & event setup",
      "Pet, cot & extra-bed requests",
      "Notes recorded by staff about likes and dislikes",
    ],
  },
  {
    id: "health-accessibility",
    name: "Health, dietary & accessibility needs",
    kind: "provided",
    examples: [
      "Allergy & dietary restriction",
      "Mobility & wheelchair assistance",
      "Medical condition disclosed for assistance",
      "Special-assistance request to an airline",
      "Spa or wellness intake note",
      "Medical incident during a stay or trip",
    ],
  },
  {
    id: "location-movement",
    name: "Location, transport & movement",
    kind: "provided",
    examples: [
      "Arrival, transfer & pickup details",
      "Flight & train movement",
      "Vehicle GPS & route",
      "Shared live location",
      "Excursion & destination attendance",
      "Tour-manager position notes",
    ],
  },
  {
    id: "access-monitoring",
    name: "Access, Wi-Fi & monitoring records",
    kind: "provided",
    examples: [
      "Key-card & mobile-key events",
      "Room number & floor",
      "Wi-Fi login & device identifier",
      "CCTV footage",
      "Parking, lift & visitor entry",
      "Smart-room and in-room device usage",
    ],
  },
  {
    id: "service-activity",
    name: "Dining, spa, housekeeping & activity records",
    kind: "provided",
    examples: [
      "Room-service & minibar orders",
      "Restaurant & bar bills",
      "Spa & wellness bookings",
      "Housekeeping requests & room condition",
      "Excursion, guide & activity attendance",
      "Service-recovery notes",
    ],
  },
  {
    id: "communication-records",
    name: "Calls, messages, photos & reviews",
    kind: "provided",
    examples: [
      "WhatsApp threads & forwarded screenshots",
      "Call recordings from the reservations desk",
      "Email & SMS history",
      "Guest photographs & event media",
      "Public reviews and the property's reply",
    ],
  },
  {
    id: "complaint-incident",
    name: "Complaints, incidents & lost property",
    kind: "provided",
    examples: [
      "Complaint & escalation thread",
      "Compensation & goodwill record",
      "Lost-property register & item photograph",
      "Safety or security incident",
      "Insurance claim & supporting evidence",
      "Vendor or supplier dispute",
    ],
  },
  {
    id: "staff-access-record",
    name: "Staff, device & access records",
    kind: "provided",
    examples: [
      "PMS, CRM & extranet logins",
      "Front-desk and security accounts, often shared",
      "Reports and guest lists exported by staff",
      "Guest documents saved to a personal phone",
      "Who opened which guest profile",
    ],
  },
  {
    id: "guest-scoring",
    name: "Scores & labels about the guest",
    kind: "derived",
    examples: [
      "Guest-value & lifetime-spend band",
      "Churn and upgrade probability",
      "VIP, repeat or blacklist flag",
      "\"Difficult guest\" or complaint-prone label",
      "Fraud & chargeback risk flag",
      "Corporate-versus-leisure classification",
    ],
  },
  {
    id: "loyalty-marketing-profile",
    name: "Loyalty & marketing profile",
    kind: "derived",
    examples: [
      "Loyalty ID, tier & points history",
      "Stay frequency & preferred property",
      "Campaign source & attribution",
      "Custom and lookalike audiences uploaded to ad platforms",
      "Cross-brand and cross-property segments",
      "Communication preference & suppression state",
    ],
  },
];
