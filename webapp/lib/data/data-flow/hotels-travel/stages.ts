// Guest & traveller journey - 16 stages in the union, MODEL-GATED to 11 / 14 / 16.
// Spec: docs/SaralPrivacy_HotelsTravel_DataFlow_Spec.md §2.
//
// Every map in this series names its sector's shape before writing stages. A
// candidate's data flows once. A CA client's returns every year. A law firm's
// matter file becomes public by design. A property firm's client file is a deal
// that ends and a database that doesn't.
//
// A HOSPITALITY OR TRAVEL GUEST IS THE ONLY SUBJECT IN THIS SERIES WHOSE
// PHYSICAL PRESENCE IS THE PRODUCT. Everywhere else the business holds records
// ABOUT a person. Here the business knows where the person is sleeping tonight,
// who is in the room with them, when the house is empty, what they ate, what
// they are allergic to, and which door they opened at 2am - and it hands parts
// of that to an airline, a transfer driver, a guide, a society of vendors and,
// for a foreign national, to the state. That is the sector's signature, and it
// is why `monitoring` is an all-model stage rather than a hotel footnote.
//
// The three models are genuinely different processes, not one journey with
// different systems (spec §2):
//   hotel          - owns the property and the physical stay. The guest arrives,
//                    is registered against an identity document, is issued a
//                    key, and generates access, Wi-Fi, CCTV and service records
//                    on premises the firm controls.
//   travel-agency  - never owns a bed. It assembles somebody else's inventory,
//                    which means the traveller's passport and itinerary are
//                    DISTRIBUTED - airlines, hotels, GDS, visa consultants,
//                    insurers, DMCs, guides - and the agency's real exposure is
//                    onward transfer, not on-premises monitoring.
//   integrated     - runs both, plus a loyalty programme and a central customer
//                    profile that silently JOINS a hotel stay, a holiday
//                    package, a wedding and a corporate trip into one person.
//
// `integrated` is the SUPERSET: shared core stages carry no gate, and every
// variant-specific stage tags itself with its own model plus `integrated`.
//
// TEN of the sixteen stages are ALL-MODEL. That is load-bearing: all eight
// hotspots sit on eight DISTINCT all-model stages, so the journey's red flags
// reconcile with the hotspot counter by arithmetic in every model (spec §3,
// guard test (a)). Do not gate an all-model stage without re-deriving §3.
//
// Three deliberate choices:
//  · `identity-documents` is all-model and separate from `check-in`. A hotel
//    scans a passport at the desk; an agency collects it weeks earlier for a
//    visa file. Same act - a government identity document is copied and stored -
//    at different moments. Merging it into check-in would put the sector's
//    rank-1 hotspot on a hotel-only stage.
//  · `monitoring` is all-model. For a hotel it is the key card, the Wi-Fi portal
//    and CCTV; for an agency it is transport GPS, a shared live location and the
//    tour manager's device. Both answer the same question - what record exists
//    of where this person physically was - and the agency half is the one
//    everybody forgets.
//  · `pre-arrival` is all-model. A hotel's arrival list and transfer manifest
//    and an agency's final itinerary, rooming list and group pack are the same
//    document: a consolidated sheet naming several travellers, sent by email,
//    WhatsApp and print to people who will keep it.
//
// Per-model counts are DERIVED from this union - one shared array filtered by
// model - so they cannot be set independently. The pasted spec asked for 10
// stages in each of the three variants; the honest derived answer is 11 / 14 /
// 16, and the hotel model lands on exactly the ten acts the spec's §9 journey
// describes plus the identity-document split above (spec §2).

import type { FlowStage } from "../../../data-flow/schemas.ts";

const HOTEL = ["hotel", "integrated"];
const TRAVEL = ["travel-agency", "integrated"];
const INTEGRATED = ["integrated"];

export const HOTELS_TRAVEL_STAGES: FlowStage[] = [
  {
    id: "enquiry",
    name: "Search, enquiry & booking-channel capture",
    sequence: 1,
    summary:
      "A guest searches, taps an OTA listing, fills the website form, phones the desk or messages on WhatsApp. Within minutes the same person exists on a booking platform you do not own, in an ad platform's audience, on a reservation executive's own handset and in a lead sheet.",
    dpdpaNote:
      "This is the moment to say what you collect and why. An enquiry about one stay or one trip is not permission to hold that person and market to them for years, and an OTA booking arrives with terms about the guest that you still have to be able to explain.",
  },
  {
    id: "identity-resolution",
    name: "Central guest identity & profile resolution",
    sequence: 2,
    summary:
      "Across brands, properties and the travel arm, a matching engine decides that the hotel guest, the package traveller, the wedding enquiry and the corporate booker are one person - and merges them into a single group profile nobody asked for.",
    dpdpaNote:
      "Joining separate relationships into one profile is a new purpose, not a technical detail. Be able to explain what was combined, support correction when the match is wrong, and keep an employer-paid trip distinguishable from a private holiday.",
    businessModels: INTEGRATED,
  },
  {
    id: "reservation",
    name: "Reservation, quotation & guest profile creation",
    sequence: 3,
    summary:
      "The booking or quotation is built, and with it a guest profile: names of everyone travelling, dates, room or package, rate, corporate code, preferences and the executive's own notes. The same person is now created separately in the OTA, the channel manager, the reservation system and the CRM.",
    dpdpaNote:
      "Duplicate guest records are a rights problem before they are a data-quality one - a correction or deletion applied to one of four copies has not been applied. Decide which record is the master and keep companions as separate people, not fields.",
  },
  {
    id: "itinerary-design",
    name: "Trip profiling, itinerary design & supplier quotes",
    sequence: 4,
    summary:
      "Before anything is booked, the trip is designed: who is travelling, budget, honeymoon or family, mobility needs, meal preferences, which child needs a cot. Draft itineraries and requirement sheets go out to hotels, DMCs and transport partners for pricing.",
    dpdpaNote:
      "Requirements can be priced without names. Share what the supplier needs to quote, keep health and accessibility details out of the general enquiry, and clear the rejected itinerary versions rather than leaving them in the folder.",
    businessModels: TRAVEL,
  },
  {
    id: "identity-documents",
    name: "Passport, visa & identity-document collection",
    sequence: 5,
    summary:
      "Passports, visas, photographs, dates of birth, nationality and - for a visa file - bank statements, employment letters and family papers arrive by WhatsApp, by email, as photographs and as hard copies, and are saved into whichever folder the coordinator uses.",
    dpdpaNote:
      "These are the highest-impact documents in the sector. Collect them only when the booking genuinely needs them, use one controlled channel, record the verification outcome where a full copy is unnecessary, and know which copies exist where.",
  },
  {
    id: "supplier-booking",
    name: "Airline, hotel & transport supplier booking",
    sequence: 6,
    summary:
      "Traveller names as they appear on the passport, dates of birth, contact details, meal and assistance requests and loyalty numbers are pushed into airline and GDS systems, hotel extranets, bed banks, rail and bus portals and destination partners.",
    dpdpaNote:
      "Every supplier is a separate recipient, most of them outside India, and a ticketed booking is not yours to withdraw. Send the minimum each one needs, keep a register of who received what, and be honest about which copies you cannot recall.",
    businessModels: TRAVEL,
  },
  {
    id: "ancillary-services",
    name: "Visa assistance, insurance & ancillary services",
    sequence: 7,
    summary:
      "The same passport set goes out again - to a visa consultant, an embassy-support service, an insurer, a forex provider, a SIM vendor, a car-rental firm - usually as one complete bundle because that is quicker than assembling a set per service.",
    dpdpaNote:
      "A service-specific dataset is the whole control here. An insurer does not need the employment letter and a SIM vendor does not need the bank statement. Track what each recipient holds, and close out the file of an application that was refused or abandoned.",
    businessModels: TRAVEL,
  },
  {
    id: "payment",
    name: "Payment, deposit, billing & corporate settlement",
    sequence: 8,
    summary:
      "Deposits, pre-authorisations, instalments, folios and invoices move through gateways, terminals, banks, the accounting system and - for a business trip - the employer's travel desk and expense platform, which receives an itemised account of what the person did.",
    dpdpaNote:
      "Never store card credentials, and treat the corporate invoice as a disclosure: an employer needs the amount, not a line-by-line record of the spa, the bar and the second guest in the room. Financial retention is its own clock, separate from the guest record.",
  },
  {
    id: "pre-arrival",
    name: "Pre-arrival documents, itineraries & special requests",
    sequence: 9,
    summary:
      "Confirmations, final itineraries, rooming lists, arrival manifests, transfer sheets and emergency-contact lists are assembled and sent - by email, in a WhatsApp group, as a printed travel pack - and with them arrive allergies, celebrations, mobility needs and flight numbers.",
    dpdpaNote:
      "A consolidated list is a disclosure to everyone who receives it. Give each traveller their own document, keep dietary, health and accessibility details with the team that needs them, and expire shared links rather than leaving them live.",
  },
  {
    id: "check-in",
    name: "Arrival, check-in & guest registration",
    sequence: 10,
    summary:
      "At the desk the guest is registered: name, address, nationality, identity document, signature, vehicle, companions. The document is scanned or photocopied, the register is filled in front of the next guest in the queue, and for a foreign national a report goes to the authorities.",
    dpdpaNote:
      "Separate what the law requires you to submit from what you chose to keep a copy of. Government-reported records are authority-controlled and not yours to amend; the scan sitting on the front-desk desktop is entirely yours, and usually nobody has decided how long it stays.",
    businessModels: HOTEL,
  },
  {
    id: "monitoring",
    name: "Access, Wi-Fi, CCTV & movement records",
    sequence: 11,
    summary:
      "The journey starts recording where the person physically is: key-card and mobile-key events, Wi-Fi logins and device identifiers, CCTV, parking and lift access, transport GPS, a shared live location, and a tour manager's running note of where the group has got to.",
    dpdpaNote:
      "Safety and marketing are different purposes and should not share a database. Set a retention period for footage, logs and location history, keep room and location data away from general staff visibility, and close credentials the moment the stay or trip ends.",
  },
  {
    id: "service-delivery",
    name: "Stay, dining, activities & guest services",
    sequence: 12,
    summary:
      "Service creates the behavioural half: room-service orders, dining and bar history, spa treatments, housekeeping notes, minibar use, excursion attendance, guide and driver assignments, and a running commentary of service-recovery notes and staff opinion.",
    dpdpaNote:
      "Operational notes become a profile whether or not anyone intended one. Keep them factual, restrict them to the department that needs them, give each partner and vendor the minimum the service requires, and do not reuse service history for marketing by default.",
  },
  {
    id: "in-trip-support",
    name: "In-trip disruption, emergency & local support",
    sequence: 13,
    summary:
      "A missed connection, a lost passport, a hospital visit or a cancelled hotel forces identity, health and location data out fast - to airlines, local hotels, a guide, a clinic, an insurer and a WhatsApp group - with nobody recording what was sent to whom.",
    dpdpaNote:
      "Urgency is a reason to share the minimum, not a reason to stop recording. Note what was disclosed to which local party, protect health details, delete the temporary copies afterwards, and keep an incident record even when it ended well.",
    businessModels: TRAVEL,
  },
  {
    id: "checkout-feedback",
    name: "Checkout, complaints, reviews & lost property",
    sequence: 14,
    summary:
      "Departure produces the last cluster: the final folio, a feedback form, a public review and your reply to it, a complaint thread, a refund file, a photograph of a lost item, a compensation note - and a quiet internal label about how the guest behaved.",
    dpdpaNote:
      "A public reply that mentions the room, the dates or the complaint discloses the stay. Keep internal notes factual and correctable, separate the public record from the guest file, and set a retention period for lost-property photographs and refund evidence.",
  },
  {
    id: "loyalty-marketing",
    name: "Loyalty, marketing & cross-property profiling",
    sequence: 15,
    summary:
      "The completed stay or trip becomes a loyalty tier, a stay frequency, a spend profile, a preferred property, a churn score, a WhatsApp broadcast list, an uploaded lookalike audience and a cross-brand campaign that runs indefinitely.",
    dpdpaNote:
      "Finishing the service is not permission to market. Keep booking communication separate from promotion, hold one suppression list every channel must check, and make a withdrawal reach the agency export and the uploaded audience, not only the CRM flag.",
  },
  {
    id: "archive",
    name: "Archive, vendor copies & deletion",
    sequence: 16,
    summary:
      "Everything settles: reservation and travel-system archives, the CRM, loyalty, folders of passport scans, Wi-Fi and CCTV stores, finance records, supplier and GDS systems, backups, staff phones, the physical register - and a guest history kept because it is what makes the next stay easier to sell.",
    dpdpaNote:
      "Retention has to be decided per category, not for the guest as a whole. Tax records, a filed government report and a ticketed booking have grounds to be kept; a five-year-old passport scan taken for a stay that ended does not.",
  },
];
