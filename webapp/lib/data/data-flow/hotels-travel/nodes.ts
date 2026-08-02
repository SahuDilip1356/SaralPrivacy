// Systems, repositories, devices, physical stores and people that hold guest and
// traveller data in a typical Indian hotel, resort, travel agency or hospitality
// group - NOT any specific business's environment (reference-model rule).
//
// Real things are named - the OTA extranet, the channel manager, the front-desk
// passport scanner, the C-form report, the key-card controller, the Wi-Fi
// captive portal, the GDS, the bed bank, the visa consultant's folder, the tour
// manager's bag of passports, the operations WhatsApp group, the lost-property
// cupboard - because a generic "property management system" fails the "that's my
// hotel" test. Storage, devices and chat channels are SPANNING nodes: they
// attach across stages, because that is where data sits over the whole
// relationship rather than at one step.
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
//   booking-channel-platform . enquiry (1)             movement-access-trail ... monitoring (11)
//   guest-profile-system ..... reservation (3)         partner-vendor-network .. service-delivery (12)
//   id-document-store ........ identity-documents (5)  loyalty-marketing-platform loyalty-marketing (15)
//   guest-document-pack ...... pre-arrival (9)         guest-history-archive ... archive (16)
//
// A hotspot node may span LATER stages - the guest profile genuinely does - but
// must never acquire an EARLIER one. Adding `enquiry` to `guest-profile-system`,
// for instance, would silently move its flag onto the booking platform's stage
// and break reconciliation in all three models. The enquiry lands on the OTA,
// the lead sheet and a reservation executive's phone first; the guest profile is
// created when the booking is confirmed, which is why it starts at
// `reservation`. Likewise `movement-access-trail` deliberately excludes
// `check-in`: the key is issued at the desk, but the trail of where the guest
// went begins after it.
//
// Deliberately NOT hotspots, because they sit on model-gated stages: the front
// desk's registration register and the foreign-national report, the GDS and
// airline record, the visa consultant's folder, the bed bank and DMC, the CCTV
// archive and Wi-Fi portal, the local guide and driver, and the emergency
// support log. Each is authored as a high- or critical-risk node instead, and
// renders in full wherever it exists (spec §3).

import type { FlowNode } from "../../../data-flow/schemas.ts";

const HOTEL = ["hotel", "integrated"];
const TRAVEL = ["travel-agency", "integrated"];
const INTEGRATED = ["integrated"];

export const HOTELS_TRAVEL_NODES: FlowNode[] = [
  // ---- The people ---------------------------------------------------------
  {
    id: "guest",
    name: "Guest / traveller",
    nodeType: "person",
    boundary: "candidate",
    stageIds: ["enquiry", "reservation", "identity-documents", "payment", "pre-arrival", "check-in", "service-delivery", "checkout-feedback"],
    description:
      "The data principal. One enquiry, one passport and one journey - everything below is a copy, a derivative or something the business worked out about them.",
    dataCategoryIds: ["guest-identity", "identity-documents", "booking-itinerary", "guest-preference"],
    accessPersonaIds: ["guest"],
    retentionDefined: true,
    riskLevel: "low",
  },
  {
    id: "companion-traveller",
    name: "Companions, children & emergency contacts",
    nodeType: "person",
    boundary: "candidate",
    stageIds: ["reservation", "itinerary-design", "identity-documents", "pre-arrival", "check-in", "service-delivery", "in-trip-support"],
    description:
      "The spouse on the room, the children on the package, the elderly parent needing assistance, the emergency contact who was simply named. Their documents arrive with the lead guest's and almost none of them are tracked as separate people.",
    dataCategoryIds: ["companion-family", "identity-documents", "health-accessibility", "guest-identity"],
    accessPersonaIds: ["companion", "reservations-staff", "front-desk-staff"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "A companion, and especially a child, is a data principal who never dealt with you. Their passport and dietary needs sit in the lead guest's file, so a request from them has nothing to search on and a deletion of the booking may not reach them at all.",
    riskAction:
      "Give every named traveller their own record rather than storing them as fields on somebody else's booking, and collect a child's details only where the stay or the carrier genuinely requires them.",
  },
  {
    id: "corporate-booker-person",
    name: "Corporate booker / travel coordinator",
    nodeType: "person",
    boundary: "client",
    stageIds: ["enquiry", "reservation", "payment", "checkout-feedback"],
    description:
      "Books and pays for somebody else's stay or trip and receives the paperwork afterwards, which is how an employer ends up holding an itemised account of an employee's weekend.",
    dataCategoryIds: ["corporate-travel", "booking-itinerary", "payment-financial", "guest-identity"],
    accessPersonaIds: ["corporate-booker", "reservations-staff", "finance-staff"],
    retentionDefined: false,
    riskLevel: "medium",
  },
  {
    id: "reservations-staff-person",
    name: "Reservations & sales executive",
    nodeType: "person",
    boundary: "agency",
    stageIds: ["enquiry", "reservation", "itinerary-design", "identity-documents", "pre-arrival"],
    description:
      "Owns the booking from enquiry to arrival, and moves between the reservation system, an OTA extranet, a spreadsheet and their own phone without noticing which one they are in.",
    dataCategoryIds: ["guest-identity", "booking-itinerary", "communication-records", "guest-preference"],
    accessPersonaIds: ["reservations-staff", "owner-manager"],
    retentionDefined: false,
    riskLevel: "medium",
  },
  {
    id: "front-desk-person",
    name: "Front-office & guest-relations staff",
    nodeType: "person",
    boundary: "agency",
    stageIds: ["check-in", "monitoring", "service-delivery", "checkout-feedback"],
    description:
      "Registers the guest, scans the identity document, allocates the room and issues the key - and can see the whole profile, including preferences, past complaints and whatever a colleague once wrote about them.",
    dataCategoryIds: ["identity-documents", "guest-identity", "access-monitoring", "guest-scoring"],
    accessPersonaIds: ["front-desk-staff", "owner-manager"],
    retentionDefined: false,
    riskLevel: "medium",
    businessModels: HOTEL,
  },
  {
    id: "tour-manager-person",
    name: "Tour manager & field escort",
    nodeType: "person",
    boundary: "agency",
    stageIds: ["pre-arrival", "service-delivery", "in-trip-support"],
    description:
      "Travels with the group holding everyone's passports in a bag, the rooming list on a personal phone, the emergency contacts in a printout and the medical notes in their head.",
    dataCategoryIds: ["identity-documents", "companion-family", "health-accessibility", "location-movement"],
    accessPersonaIds: ["tour-manager", "operations-staff"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "One person carries the complete identity set for a whole group on a device and in a folder that nobody manages, in a place where losing either is a routine travel event.",
    riskAction:
      "Give tour managers access to documents through an app that can be revoked rather than copies they keep, and require the physical set to be handed back and destroyed at the end of the trip.",
    businessModels: TRAVEL,
  },
  {
    id: "ex-staff-person",
    name: "Former staff member",
    nodeType: "person",
    boundary: "third-party",
    stageIds: ["loyalty-marketing", "archive"],
    description:
      "A reservations or front-office employee who has left, still holding an export, a synced contact list and a WhatsApp history full of guest documents.",
    dataCategoryIds: ["guest-identity", "identity-documents", "staff-access-record", "booking-itinerary"],
    accessPersonaIds: ["ex-staff"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Nothing about a resignation removes what already sits on a personal handset, and in this sector the guest list is exactly what a departing employee finds useful.",
    riskAction:
      "Close every account on the last working day, wipe the work profile from personal devices, and remove the person from every operational group before they leave.",
  },

  // ---- Enquiry & booking channels ----------------------------------------
  {
    id: "booking-channel-platform",
    name: "OTA, booking engine & channel manager",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["enquiry", "reservation", "payment", "checkout-feedback", "archive"],
    description:
      "The online travel agency, the metasearch listing, the website booking engine and the channel manager that syncs them. For most bookings this is where the guest exists FIRST - name, contact, dates, party size, sometimes a card - on a platform whose retention and reuse you do not set.",
    dataCategoryIds: ["guest-identity", "booking-itinerary", "payment-financial", "companion-family"],
    accessPersonaIds: ["ota-staff", "reservations-staff", "owner-manager", "vendor-staff"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "A large share of your guests are collected by somebody else's platform under somebody else's notice, then copied into your systems. Deleting your copy leaves theirs intact, and you often cannot say what they still hold or who they shared it with.",
    riskAction:
      "Read what each platform's contract actually permits, pull only the fields you need into your own systems, and tell guests plainly which parts of their booking record you do not control.",
  },
  {
    id: "property-website-booking-engine",
    name: "Own website & direct booking engine",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["enquiry", "reservation", "payment"],
    description:
      "The business's own site and booking form - the one place in the whole intake where the notice, the fields collected and the retention rule are genuinely yours to set.",
    dataCategoryIds: ["guest-identity", "booking-itinerary", "guest-preference", "payment-financial"],
    accessPersonaIds: ["reservations-staff", "owner-manager", "vendor-staff"],
    retentionDefined: true,
    riskLevel: "medium",
  },
  {
    id: "channel-manager-inventory",
    name: "Channel manager & rate distribution",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["reservation", "archive"],
    description:
      "Pushes availability out and pulls bookings in across a dozen platforms at once, holding a copy of every reservation it has ever synced.",
    dataCategoryIds: ["booking-itinerary", "guest-identity"],
    accessPersonaIds: ["ota-staff", "reservations-staff", "vendor-staff"],
    retentionDefined: false,
    riskLevel: "medium",
    businessModels: HOTEL,
  },
  {
    id: "call-centre-recording",
    name: "Reservations phone line & call recordings",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["enquiry", "reservation", "checkout-feedback"],
    description:
      "Enquiry and booking calls, recorded for quality - which means card numbers read aloud, health requirements explained and family details described are all stored as audio nobody has ever searched.",
    dataCategoryIds: ["communication-records", "guest-identity", "payment-financial", "health-accessibility"],
    accessPersonaIds: ["reservations-staff", "owner-manager", "vendor-staff"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "A recording captures whatever was said, including payment details and medical reasons for a request, and sits in a store with a longer retention than the booking it relates to.",
    riskAction:
      "Tell callers what is recorded and why, stop taking card details on recorded lines, and set a retention period measured in weeks rather than leaving the archive to grow.",
  },
  {
    id: "staff-phone-whatsapp",
    name: "Staff phones & guest WhatsApp threads",
    nodeType: "device",
    boundary: "agency",
    stageIds: ["enquiry", "reservation", "identity-documents", "pre-arrival", "service-delivery", "checkout-feedback", "archive"],
    description:
      "The channel guests actually use. Enquiries, passport photographs, payment screenshots, room-change requests and complaints all arrive on personal handsets and stay there - backed up to a personal cloud account, visible to whoever picks the phone up.",
    dataCategoryIds: ["identity-documents", "communication-records", "guest-identity", "payment-financial"],
    accessPersonaIds: ["reservations-staff", "front-desk-staff", "operations-staff", "tour-manager", "ex-staff"],
    shadowIt: true,
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "It is the business's real intake system and it sits entirely outside any notice, access control, retention rule or exit process. A passport photograph sent here exists on a device the business does not own and cannot search.",
    riskAction:
      "Move document collection to a controlled upload link, use a business messaging account rather than personal numbers, turn off media auto-save and personal cloud backup, and wipe the work profile when someone leaves.",
  },
  {
    id: "enquiry-lead-sheet",
    name: "Shared enquiry & lead spreadsheet",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["enquiry", "reservation", "loyalty-marketing"],
    description:
      "Portal exports, ad-form leads, walk-ins and phone enquiries all land in one shared sheet within minutes - shared by link with the team, the agency and sometimes a partner, and never revoked once shared.",
    dataCategoryIds: ["guest-identity", "booking-itinerary", "guest-preference", "guest-scoring"],
    accessPersonaIds: ["reservations-staff", "marketing-staff", "owner-manager", "ex-staff"],
    shadowIt: true,
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "It is the intake record everybody actually uses, it has no access control worth the name, and it is the first thing anyone downloads on their way out of the door.",
    riskAction:
      "Make the reservation system the only intake record, switch the sheet to view-only with named access, and audit who currently holds the link before changing anything else.",
  },
  {
    id: "ad-analytics-platform",
    name: "Ad platforms, pixels & analytics",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["enquiry", "loyalty-marketing"],
    description:
      "Search and social campaigns, the booking-engine pixel, remarketing tags and audience lists - which turn who looked at which room on which dates into a targetable profile.",
    dataCategoryIds: ["loyalty-marketing-profile", "guest-identity", "booking-itinerary"],
    accessPersonaIds: ["marketing-staff", "vendor-staff", "owner-manager"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Search and booking behaviour is used to build audiences the guest never sees, and an audience already uploaded is not removed by unsubscribing from email.",
    riskAction:
      "Fire marketing tags only on consent, keep booking-confirmation pages out of remarketing, and delete uploaded custom and lookalike audiences when someone withdraws.",
  },

  // ---- Central identity (group only) --------------------------------------
  {
    id: "central-customer-profile",
    name: "Central group guest profile",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["identity-resolution", "reservation", "loyalty-marketing", "archive"],
    description:
      "One record per person across every hotel, the travel arm, the events business and the loyalty programme - assembled so that a booking at any brand knows what the guest did at all the others.",
    dataCategoryIds: ["guest-identity", "booking-itinerary", "loyalty-marketing-profile", "guest-scoring"],
    accessPersonaIds: ["owner-manager", "marketing-staff", "reservations-staff", "vendor-staff"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Separate relationships - a business trip, a family holiday, a wedding enquiry - are joined into one profile that no guest agreed to and few can see, and the join itself is a new purpose.",
    riskAction:
      "Document what is combined and why, show the guest the combined profile on request, and keep employer-paid travel distinguishable from private stays rather than merging both into one history.",
    businessModels: INTEGRATED,
  },
  {
    id: "identity-match-engine",
    name: "Identity-resolution & deduplication engine",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["identity-resolution", "loyalty-marketing"],
    description:
      "Matches guests across brands on name, phone, email, card token and address - and quietly merges a father and son with the same name, or two members of a household who share a number.",
    dataCategoryIds: ["guest-identity", "companion-family", "guest-scoring", "loyalty-marketing-profile"],
    accessPersonaIds: ["vendor-staff", "marketing-staff", "owner-manager"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "A wrong match attributes one person's stays, complaints and spending to another, and the person affected has no way of knowing it happened, let alone of asking for it to be undone.",
    riskAction:
      "Set explicit matching rules, audit a sample of merges for false positives, and give guests a route to have a profile unlinked as well as corrected.",
    businessModels: INTEGRATED,
  },
  {
    id: "group-data-warehouse",
    name: "Group data warehouse & BI",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["identity-resolution", "loyalty-marketing", "archive"],
    description:
      "Every booking, folio, restaurant bill, spa treatment and loyalty event from every property, loaded nightly and kept far longer than any of the systems it was copied from.",
    dataCategoryIds: ["booking-itinerary", "payment-financial", "service-activity", "guest-scoring"],
    accessPersonaIds: ["owner-manager", "marketing-staff", "finance-staff", "vendor-staff"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "It is the one place a deletion almost never reaches, and it holds the individual-level detail - what was ordered, which treatments, which room - that nobody needs for analysis.",
    riskAction:
      "Decide what genuinely needs to be individual-level, aggregate the rest on load, and put the warehouse on the deletion checklist rather than treating it as a reporting copy.",
    businessModels: INTEGRATED,
  },
  {
    id: "customer-data-platform",
    name: "Customer data platform & audience builder",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["identity-resolution", "loyalty-marketing"],
    description:
      "Segments the group's guests and pushes audiences out to email, push, WhatsApp and the ad platforms - the mechanism that turns one stay into cross-brand marketing permission.",
    dataCategoryIds: ["loyalty-marketing-profile", "guest-scoring", "guest-identity"],
    accessPersonaIds: ["marketing-staff", "vendor-staff"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Segments built here are exported to platforms that keep their own copy, so a withdrawal recorded in the CRM does not reach the audience already sitting in an ad account.",
    riskAction:
      "Make suppression flow outward on the same schedule as audiences, and re-push removals to every downstream platform rather than only stopping the next build.",
    businessModels: INTEGRATED,
  },

  // ---- Reservation & core operating systems -------------------------------
  {
    id: "guest-profile-system",
    name: "Property management / travel management system",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["reservation", "identity-documents", "payment", "pre-arrival", "check-in", "monitoring", "service-delivery", "checkout-feedback", "loyalty-marketing", "archive"],
    description:
      "The PMS in a hotel, the travel-management system in an agency. The operational master record: guest, companions, dates, room or package, rate, preferences, allergies, past stays, complaints - and whatever the last executive typed into the notes field.",
    dataCategoryIds: ["guest-identity", "booking-itinerary", "guest-preference", "health-accessibility", "guest-scoring"],
    accessPersonaIds: ["reservations-staff", "front-desk-staff", "operations-staff", "owner-manager", "finance-staff"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Nearly everyone on shift can open any guest, read the medical note and the complaint history, and export a list - and the profile is kept indefinitely because past-guest history is what makes the next stay easier to sell.",
    riskAction:
      "Move to role-based access so housekeeping and F&B see the service note and not the whole profile, keep notes factual and correctable, restrict exports to named people, and set a retention clock on guest history.",
  },
  {
    id: "revenue-management-system",
    name: "Revenue & rate management",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["reservation", "loyalty-marketing"],
    description:
      "Prices the room or package from demand, booking channel, lead time and guest segment - which means it holds who was quoted what, and why.",
    dataCategoryIds: ["booking-itinerary", "guest-scoring", "loyalty-marketing-profile"],
    accessPersonaIds: ["owner-manager", "reservations-staff", "vendor-staff"],
    retentionDefined: false,
    riskLevel: "medium",
  },
  {
    id: "itinerary-builder",
    name: "Itinerary builder & trip planner",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["itinerary-design", "supplier-booking", "pre-arrival"],
    description:
      "Where the trip is assembled: every traveller, every night, every transfer, every meal preference and every mobility requirement, in draft after draft that is never cleared out.",
    dataCategoryIds: ["booking-itinerary", "companion-family", "guest-preference", "health-accessibility"],
    accessPersonaIds: ["reservations-staff", "owner-manager", "tour-manager"],
    retentionDefined: false,
    riskLevel: "medium",
    businessModels: TRAVEL,
  },
  {
    id: "quotation-instalment-system",
    name: "Quotation & instalment tracker",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["itinerary-design", "payment"],
    description:
      "Quotes, revised quotes, the traveller list attached to each, the payment schedule and who has not paid yet - circulated by email and WhatsApp until one version is accepted.",
    dataCategoryIds: ["booking-itinerary", "payment-financial", "companion-family", "guest-identity"],
    accessPersonaIds: ["reservations-staff", "finance-staff", "owner-manager"],
    retentionDefined: false,
    riskLevel: "medium",
    businessModels: TRAVEL,
  },
  {
    id: "corporate-travel-account",
    name: "Corporate account & travel desk",
    nodeType: "system",
    boundary: "client",
    stageIds: ["enquiry", "reservation", "payment", "checkout-feedback"],
    description:
      "The employer's side of a business booking: approved traveller lists, cost centres, negotiated rates and a settlement file that arrives with far more detail than the employer needs.",
    dataCategoryIds: ["corporate-travel", "guest-identity", "booking-itinerary", "payment-financial"],
    accessPersonaIds: ["corporate-booker", "finance-staff", "reservations-staff"],
    retentionDefined: false,
    riskLevel: "medium",
  },

  // ---- Identity documents -------------------------------------------------
  {
    id: "id-document-store",
    name: "Passport, visa & ID document folder",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["identity-documents", "supplier-booking", "ancillary-services", "check-in", "archive"],
    description:
      "Where the identity set actually lives: passport and visa scans, photographs, Aadhaar and PAN copies, and for a visa file the bank statements, salary letters and family papers that came with them. Assembled from WhatsApp images, email attachments, a desk scanner and hard copies, into whichever folder the coordinator uses.",
    dataCategoryIds: ["identity-documents", "guest-identity", "companion-family", "payment-financial"],
    accessPersonaIds: ["reservations-staff", "front-desk-staff", "owner-manager", "tour-manager", "vendor-staff"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "This is the highest-impact collection in the sector, and it exists in five places at once because it was never collected through one. A passport copy taken for a stay in 2021 is still there, and nobody can say how many copies of it the business currently holds.",
    riskAction:
      "Collect through one secure upload link, keep one folder per booking with named access, record the verification outcome instead of keeping a full copy where that is enough, and delete the scans on a clock once the stay or trip has ended.",
  },
  {
    id: "passport-scanner-desktop",
    name: "Document scanner & desktop copies",
    nodeType: "device",
    boundary: "agency",
    stageIds: ["identity-documents", "check-in", "archive"],
    description:
      "The front-desk or office scanner and the machine attached to it. Scans land in a default folder, stay in the device's own memory, get emailed onward and are almost never cleared.",
    dataCategoryIds: ["identity-documents", "guest-identity"],
    accessPersonaIds: ["front-desk-staff", "reservations-staff", "owner-manager"],
    shadowIt: true,
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Everyone on shift uses the same machine and the same folder, so a stack of unrelated guests' passports accumulates on a shared desktop that has no access control and is rarely part of any backup or deletion routine.",
    riskAction:
      "Scan directly into the booking record rather than a shared folder, clear the device memory and the local folder on a schedule, and lock the workstation to named logins.",
  },
  {
    id: "secure-upload-portal",
    name: "Secure document upload link",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["identity-documents", "ancillary-services"],
    description:
      "The controlled way to collect documents - a one-time link that drops the file straight into the booking record. Where it exists, it is the single biggest improvement available in this sector.",
    dataCategoryIds: ["identity-documents", "guest-identity", "payment-financial"],
    accessPersonaIds: ["reservations-staff", "vendor-staff", "owner-manager"],
    retentionDefined: true,
    riskLevel: "low",
  },
  {
    id: "guest-registration-register",
    name: "Guest registration card & register",
    nodeType: "physical_storage",
    boundary: "agency",
    stageIds: ["check-in", "archive"],
    description:
      "The signed registration card and the bound register at the desk: name, address, nationality, document number, vehicle, companions and signature - filled in while the next guest waits behind.",
    dataCategoryIds: ["guest-identity", "identity-documents", "companion-family", "location-movement"],
    accessPersonaIds: ["front-desk-staff", "owner-manager", "security-staff"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "A physical register discloses the previous guests to whoever is signing now, is stored in a drawer rather than a controlled location, and is kept for years because nobody has ever decided otherwise.",
    riskAction:
      "Move registration to a screen or a single-guest card, keep completed cards in a locked store away from the desk, and set a retention period for the physical file.",
    businessModels: HOTEL,
  },
  {
    id: "government-guest-report",
    name: "Foreign-national guest report to the authorities",
    nodeType: "system",
    boundary: "government",
    stageIds: ["check-in", "archive"],
    description:
      "Details of a foreign guest submitted to the authorities as required. Once filed it is an authority-controlled record - not the property's to amend, withdraw or delete, whatever the guest later asks.",
    dataCategoryIds: ["identity-documents", "guest-identity", "booking-itinerary"],
    accessPersonaIds: ["front-desk-staff", "owner-manager", "authority-staff"],
    retentionDefined: true,
    riskLevel: "medium",
    businessModels: HOTEL,
  },

  // ---- Supplier booking & ancillary services ------------------------------
  {
    id: "airline-gds",
    name: "Airline, GDS & ticketing record",
    nodeType: "system",
    boundary: "third-party",
    stageIds: ["supplier-booking", "pre-arrival", "in-trip-support", "archive"],
    description:
      "Names exactly as they appear on the passport, dates of birth, contact details, passport numbers for international sectors, meal and assistance requests, and a booking record that persists in global systems long after the flight.",
    dataCategoryIds: ["identity-documents", "guest-identity", "booking-itinerary", "health-accessibility"],
    accessPersonaIds: ["travel-supplier-person", "reservations-staff", "owner-manager"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "A ticketed booking is not yours to withdraw, it usually leaves the country, and a special-assistance or meal code discloses something about the traveller to every party in the chain.",
    riskAction:
      "Send only the fields the carrier requires, treat assistance and meal codes as need-to-know, and tell travellers plainly that an issued ticket record cannot be recalled by you.",
    businessModels: TRAVEL,
  },
  {
    id: "partner-hotel-extranet",
    name: "Partner hotel & accommodation extranet",
    nodeType: "system",
    boundary: "third-party",
    stageIds: ["supplier-booking", "pre-arrival", "in-trip-support"],
    description:
      "The hotels a trip is assembled from receive guest names, arrival times, companion details, room configuration and any special request - and each keeps its own guest record afterwards.",
    dataCategoryIds: ["guest-identity", "booking-itinerary", "companion-family", "guest-preference"],
    accessPersonaIds: ["travel-supplier-person", "reservations-staff"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Every property in an itinerary becomes an independent holder of the traveller's details, with its own retention, its own marketing and no obligation to you once the stay is done.",
    riskAction:
      "Share the minimum each property needs to hold the room, keep dietary and medical requirements to the ones that will act on them, and record which properties received what.",
    businessModels: TRAVEL,
  },
  {
    id: "bed-bank-dmc",
    name: "Bed bank & destination management company",
    nodeType: "system",
    boundary: "third-party",
    stageIds: ["itinerary-design", "supplier-booking", "service-delivery"],
    description:
      "The wholesaler between the agency and the ground: books the rooms, arranges the transfers, briefs the guides - and holds the traveller list for the whole party.",
    dataCategoryIds: ["guest-identity", "booking-itinerary", "companion-family", "location-movement"],
    accessPersonaIds: ["destination-partner-person", "travel-supplier-person", "reservations-staff"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "It sits one step further away than any contract usually reaches, and it re-shares the traveller list onward to local operators the agency never sees.",
    riskAction:
      "Put onward-sharing terms in the wholesaler contract, ask which local parties actually received the list, and require deletion once the trip closes.",
    businessModels: TRAVEL,
  },
  {
    id: "rail-bus-cruise-portal",
    name: "Rail, bus & cruise booking portals",
    nodeType: "system",
    boundary: "third-party",
    stageIds: ["supplier-booking"],
    description:
      "Domestic segments booked in the traveller's name and identity number, often through an agent login shared by the whole sales team.",
    dataCategoryIds: ["guest-identity", "identity-documents", "booking-itinerary"],
    accessPersonaIds: ["travel-supplier-person", "reservations-staff"],
    retentionDefined: false,
    riskLevel: "medium",
    businessModels: TRAVEL,
  },
  {
    id: "visa-consultant",
    name: "Visa consultant & embassy-support service",
    nodeType: "system",
    boundary: "third-party",
    stageIds: ["identity-documents", "ancillary-services", "archive"],
    description:
      "Receives the heaviest file the sector produces: passport, photographs, bank statements, salary letters, tax papers, invitation letters, marriage and birth certificates - for every traveller in the party, including the ones who were refused.",
    dataCategoryIds: ["identity-documents", "payment-financial", "companion-family", "guest-identity"],
    accessPersonaIds: ["vendor-staff", "reservations-staff", "owner-manager"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "It is the largest concentration of high-impact identity and financial data in the whole journey, it goes to a party outside your systems, and a refused or abandoned application leaves the full file sitting there with nobody responsible for closing it.",
    riskAction:
      "Send a service-specific set rather than the whole bundle, get a written deletion commitment from consultants you use repeatedly, and close out refused and cancelled application files explicitly.",
    businessModels: TRAVEL,
  },
  {
    id: "travel-insurance-forex",
    name: "Insurance, forex & ancillary providers",
    nodeType: "system",
    boundary: "third-party",
    stageIds: ["ancillary-services", "in-trip-support"],
    description:
      "Travel insurers, forex and SIM vendors, car-rental firms - each sent the same passport and itinerary bundle because assembling a set per service takes longer.",
    dataCategoryIds: ["identity-documents", "booking-itinerary", "health-accessibility", "payment-financial"],
    accessPersonaIds: ["vendor-staff", "reservations-staff"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "An insurer receives a health declaration it needs and a bank statement it does not; a SIM vendor receives a full passport when a number would do. Nobody afterwards can say which provider holds what.",
    riskAction:
      "Define what each ancillary service actually requires and send only that, keep a register of recipients per booking, and ask for deletion once the policy or rental has ended.",
    businessModels: TRAVEL,
  },

  // ---- Payment & billing ---------------------------------------------------
  {
    id: "payment-gateway",
    name: "Payment gateway, UPI & card terminal",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["payment", "checkout-feedback"],
    description:
      "Deposits, pre-authorisations, folio settlement and refunds. Handled properly the business never holds card credentials - the risk here is what gets kept alongside the reference.",
    dataCategoryIds: ["payment-financial", "guest-identity", "booking-itinerary"],
    accessPersonaIds: ["finance-staff", "front-desk-staff", "vendor-staff"],
    retentionDefined: true,
    riskLevel: "medium",
  },
  {
    id: "payment-screenshot-trail",
    name: "Payment screenshots & transfer proofs",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["payment", "checkout-feedback", "archive"],
    description:
      "Guests send a screenshot of the transfer; staff forward it to accounts; accounts save it to a folder. Card fragments, bank balances and account numbers accumulate in chat threads and drives nobody classifies as financial data.",
    dataCategoryIds: ["payment-financial", "guest-identity", "communication-records"],
    accessPersonaIds: ["finance-staff", "reservations-staff", "owner-manager"],
    shadowIt: true,
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Payment evidence collected informally ends up in more places than the payment record itself, and often shows more of the guest's bank account than the business ever needed to see.",
    riskAction:
      "Reconcile against the gateway record rather than screenshots, and delete the images once the payment is matched.",
  },
  {
    id: "accounting-finance-system",
    name: "Accounting, invoicing & tax records",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["payment", "checkout-feedback", "archive"],
    description:
      "Invoices, folios, refunds, supplier settlement and tax filings - the copies that legitimately have to be kept longest, and therefore the ones most often used as an excuse to keep everything else.",
    dataCategoryIds: ["payment-financial", "guest-identity", "corporate-travel", "booking-itinerary"],
    accessPersonaIds: ["finance-staff", "owner-manager", "vendor-staff"],
    retentionDefined: true,
    riskLevel: "medium",
  },
  {
    id: "corporate-expense-platform",
    name: "Employer expense & settlement platform",
    nodeType: "system",
    boundary: "client",
    stageIds: ["payment", "checkout-feedback"],
    description:
      "Where a business trip's paperwork ends up. The employer needs an amount; what usually arrives is an itemised folio showing the bar, the spa, the late checkout and the second guest on the room.",
    dataCategoryIds: ["corporate-travel", "payment-financial", "service-activity", "guest-identity"],
    accessPersonaIds: ["corporate-booker", "finance-staff", "vendor-staff"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "An itemised invoice discloses an employee's private conduct to their employer, and nobody in the chain has decided who is responsible for limiting it.",
    riskAction:
      "Issue a summary invoice to the corporate account by default, keep personal extras on a separate folio settled by the guest, and agree the level of detail with the employer in advance.",
  },

  // ---- Pre-arrival ---------------------------------------------------------
  {
    id: "guest-document-pack",
    name: "Itinerary, rooming list & arrival manifest",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["pre-arrival", "check-in", "service-delivery", "in-trip-support"],
    description:
      "The consolidated sheet: final itinerary, group and rooming list, arrival manifest, transfer schedule, emergency-contact list and dietary and medical notes - sent as a PDF, dropped in a WhatsApp group and printed for the folder.",
    dataCategoryIds: ["companion-family", "booking-itinerary", "health-accessibility", "guest-identity"],
    accessPersonaIds: ["reservations-staff", "tour-manager", "front-desk-staff", "destination-partner-person", "operations-staff"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "One document discloses every traveller to every other traveller and to every partner it is forwarded to - room allocations, who is travelling with whom, who needs a wheelchair, whose emergency contact is whose. It is forwarded onward more than any other file in the sector.",
    riskAction:
      "Send each traveller their own document, give partners only the rows they need, keep health and emergency details on a separate need-to-know sheet, and expire shared links after the trip.",
  },
  {
    id: "guest-messaging-platform",
    name: "Pre-arrival messaging & confirmation platform",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["pre-arrival", "service-delivery", "checkout-feedback", "loyalty-marketing"],
    description:
      "Automated confirmations, arrival reminders, upsell offers, in-stay messages and the post-stay feedback prompt - the same channel used for service and for marketing, with one opt-out between them.",
    dataCategoryIds: ["guest-identity", "booking-itinerary", "communication-records", "loyalty-marketing-profile"],
    accessPersonaIds: ["reservations-staff", "marketing-staff", "vendor-staff"],
    retentionDefined: false,
    riskLevel: "medium",
  },
  {
    id: "airport-transfer-vendor",
    name: "Airport transfer & chauffeur service",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["pre-arrival", "service-delivery"],
    description:
      "Gets the guest's name, mobile number, flight number and arrival time so a driver can hold up a placard - and keeps all of it, along with the pickup and drop addresses, in a dispatch system the business never sees.",
    dataCategoryIds: ["guest-identity", "location-movement", "booking-itinerary"],
    accessPersonaIds: ["vendor-staff", "travel-supplier-person", "front-desk-staff"],
    retentionDefined: false,
    riskLevel: "medium",
  },

  // ---- Access, Wi-Fi, CCTV & movement -------------------------------------
  {
    id: "movement-access-trail",
    name: "Access, Wi-Fi & movement record trail",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["monitoring", "service-delivery", "checkout-feedback", "archive"],
    description:
      "The running record of where the guest physically was. In a hotel that is key-card and mobile-key events, Wi-Fi associations and device identifiers, lift and parking access. On a trip it is transfer GPS, a live location shared in a group and the tour manager's note of where the party has got to. Different systems in each business; one kind of record.",
    dataCategoryIds: ["access-monitoring", "location-movement", "guest-identity", "staff-access-record"],
    accessPersonaIds: ["security-staff", "front-desk-staff", "operations-staff", "tour-manager", "vendor-staff"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "This is the only record in the sector that says where a named person was, at what time, and by implication when their home was empty. It is generated continuously, kept without a decision, readable by staff with no need for it, and it outlives the stay it belonged to.",
    riskAction:
      "Write down the purpose and the retention period for each kind of movement record, keep safety records out of marketing and analytics, restrict access to named accounts with a viewing log, and close credentials and stop location sharing the moment the stay or trip ends.",
  },
  {
    id: "cctv-archive",
    name: "CCTV & surveillance archive",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["monitoring", "checkout-feedback", "archive"],
    description:
      "Corridor, lobby, lift, car park and restaurant footage, retained on a recorder in the back office, exported to a phone whenever there is an incident or a request.",
    dataCategoryIds: ["access-monitoring", "guest-identity", "complaint-incident"],
    accessPersonaIds: ["security-staff", "owner-manager", "operations-staff"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Footage of guests is broadly viewable, is exported informally when somebody asks, and is retained for as long as the recorder happens to hold before it overwrites.",
    riskAction:
      "Set and enforce an overwrite period, restrict viewing to named accounts, log every export and who requested it, and refuse informal requests for copies.",
    businessModels: HOTEL,
  },
  {
    id: "wifi-captive-portal",
    name: "Guest Wi-Fi portal & device logs",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["monitoring", "archive"],
    description:
      "Guests sign in with a room number, a phone number or an email, and the portal records the device identifier, the session and often the browsing that followed - retained indefinitely by default.",
    dataCategoryIds: ["access-monitoring", "guest-identity", "location-movement"],
    accessPersonaIds: ["vendor-staff", "security-staff", "owner-manager"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "It links a person to a device and a room, keeps doing so after they leave, and the retention is set by a vendor's default rather than by any decision the property made.",
    riskAction:
      "Ask the provider what is logged and for how long, cut retention to what troubleshooting needs, and stop using Wi-Fi sign-in data as a marketing list.",
    businessModels: HOTEL,
  },
  {
    id: "visitor-parking-register",
    name: "Visitor, vehicle & gate register",
    nodeType: "physical_storage",
    boundary: "agency",
    stageIds: ["monitoring", "service-delivery"],
    description:
      "Who visited which room, which vehicle came in, when a delivery was taken up - written in a book that the next visitor can read upside down.",
    dataCategoryIds: ["access-monitoring", "guest-identity", "location-movement"],
    accessPersonaIds: ["security-staff", "front-desk-staff"],
    retentionDefined: false,
    riskLevel: "medium",
    businessModels: HOTEL,
  },
  {
    id: "transport-gps-tracking",
    name: "Vehicle GPS & shared live location",
    nodeType: "system",
    boundary: "third-party",
    stageIds: ["monitoring", "service-delivery", "in-trip-support"],
    description:
      "Transfer and coach GPS trails, a driver's app, and the live location a coordinator asked the traveller to share - which frequently keeps updating for days after the trip ended.",
    dataCategoryIds: ["location-movement", "guest-identity", "access-monitoring"],
    accessPersonaIds: ["travel-supplier-person", "tour-manager", "vendor-staff"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "A live location shared for one transfer is rarely switched off, so the business keeps receiving a traveller's whereabouts long after any reason for it has ended.",
    riskAction:
      "Use the vendor's tracking for the vehicle rather than asking travellers to share personal location, and set an explicit end to any sharing that is agreed.",
    businessModels: TRAVEL,
  },

  // ---- Service delivery ----------------------------------------------------
  {
    id: "partner-vendor-network",
    name: "Guides, activity partners & on-ground vendors",
    nodeType: "system",
    boundary: "third-party",
    stageIds: ["service-delivery", "in-trip-support", "checkout-feedback", "archive"],
    description:
      "Everyone who delivers a piece of the experience and needs to know who is coming: guides, excursion and adventure operators, boat and safari partners, event and wedding vendors, photographers, spa and restaurant partners, housekeeping and laundry contractors. Each is sent names, numbers, room or hotel, ages, dietary needs and often the whole party list.",
    dataCategoryIds: ["guest-identity", "companion-family", "health-accessibility", "service-activity"],
    accessPersonaIds: ["destination-partner-person", "vendor-staff", "operations-staff", "tour-manager"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "The guest file is broken up and handed to a long tail of small independent operators, usually over WhatsApp, usually as the full list rather than the relevant rows - and none of them has a contract, a retention rule or any reason to delete it. This is the part of the sector that no rights request can reach.",
    riskAction:
      "Send each partner only the rows and fields their job needs, use a booking reference instead of the guest's number where the partner does not need to call, put deletion terms into the contracts of the partners you use repeatedly, and stop forwarding party lists into vendor group chats.",
  },
  {
    id: "housekeeping-maintenance-system",
    name: "Housekeeping & maintenance system",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["service-delivery"],
    description:
      "Room status, service requests, do-not-disturb history, in-room repairs and the notes staff leave about the state a room was left in - a record of occupancy patterns as much as of housekeeping.",
    dataCategoryIds: ["service-activity", "access-monitoring", "guest-preference"],
    accessPersonaIds: ["operations-staff", "front-desk-staff", "owner-manager"],
    retentionDefined: false,
    riskLevel: "medium",
    businessModels: HOTEL,
  },
  {
    id: "restaurant-spa-system",
    name: "Restaurant, bar & spa systems",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["service-delivery", "payment"],
    description:
      "Dining and bar bills posted to the room, spa bookings with an intake form asking about pregnancy, injuries and medication, and a running preference history the marketing team can see.",
    dataCategoryIds: ["service-activity", "health-accessibility", "payment-financial", "guest-preference"],
    accessPersonaIds: ["operations-staff", "vendor-staff", "front-desk-staff", "marketing-staff"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "A spa intake form collects health information that then sits in a commercial system alongside a dining history, visible well beyond the therapist who needed it.",
    riskAction:
      "Keep wellness intake records separate from the guest profile, restrict them to the treating team, and stop feeding dining and treatment history into marketing segments.",
    businessModels: HOTEL,
  },
  {
    id: "concierge-guest-app",
    name: "Guest app & concierge platform",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["pre-arrival", "service-delivery", "monitoring"],
    description:
      "Mobile check-in, digital key, in-app requests, itinerary and chat - convenient, and quietly one of the richest records of what a guest did and when.",
    dataCategoryIds: ["booking-itinerary", "service-activity", "access-monitoring", "communication-records"],
    accessPersonaIds: ["vendor-staff", "front-desk-staff", "operations-staff", "guest"],
    retentionDefined: false,
    riskLevel: "medium",
  },
  {
    id: "operations-whatsapp-group",
    name: "Operations & vendor WhatsApp groups",
    nodeType: "device",
    boundary: "agency",
    stageIds: ["service-delivery", "monitoring", "checkout-feedback"],
    description:
      "How the shift actually runs: room numbers, VIP arrivals, allergies, complaints, a photograph of an ID, and the occasional remark about a guest - in groups that include vendors and former colleagues and are never cleaned out.",
    dataCategoryIds: ["guest-identity", "access-monitoring", "health-accessibility", "communication-records"],
    accessPersonaIds: ["operations-staff", "front-desk-staff", "security-staff", "vendor-staff", "ex-staff"],
    shadowIt: true,
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Room numbers and guest details are broadcast to a group whose membership nobody audits, on personal devices, with a full history any new member can scroll back through.",
    riskAction:
      "Move shift coordination into the operational system, keep room numbers and guest names out of chat, audit group membership monthly, and remove people the day they leave.",
  },
  {
    id: "local-guide-driver",
    name: "Local guide & driver on the ground",
    nodeType: "person",
    boundary: "third-party",
    stageIds: ["service-delivery", "in-trip-support"],
    description:
      "The individual who actually meets the travellers - holding their names, numbers, hotel, ages and dietary needs on a personal phone, sometimes a photograph of a passport page in case of a checkpoint.",
    dataCategoryIds: ["guest-identity", "companion-family", "identity-documents", "location-movement"],
    accessPersonaIds: ["destination-partner-person", "tour-manager"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "It is the furthest edge of the chain, the least contracted, and the point at which a passport photograph is most often taken 'just in case' and then never deleted.",
    riskAction:
      "Brief guides with the party list and not the documents, provide any document access through an app that expires, and make deletion part of the engagement terms.",
    businessModels: TRAVEL,
  },
  {
    id: "emergency-support-log",
    name: "Emergency & disruption support log",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["in-trip-support", "checkout-feedback"],
    description:
      "What was done when something went wrong: a lost passport, a hospital visit, a missed connection, a rebooking - recorded across a support desk, a chat thread and somebody's notebook.",
    dataCategoryIds: ["complaint-incident", "health-accessibility", "identity-documents", "location-movement"],
    accessPersonaIds: ["operations-staff", "tour-manager", "owner-manager"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "An emergency produces the most personal disclosures of the whole journey, made fast to whoever could help, and afterwards nobody can say who was told what.",
    riskAction:
      "Keep one incident record per event naming what was disclosed to which party, protect health details, and delete the temporary copies local partners were sent.",
    businessModels: TRAVEL,
  },
  {
    id: "local-clinic-hospital",
    name: "Local clinic, hospital & insurer",
    nodeType: "system",
    boundary: "third-party",
    stageIds: ["in-trip-support"],
    description:
      "When a traveller is treated abroad, identity, insurance and medical details move between a hospital, an insurer and an assistance company, with the agency in the middle passing things on.",
    dataCategoryIds: ["health-accessibility", "identity-documents", "guest-identity", "complaint-incident"],
    accessPersonaIds: ["vendor-staff", "tour-manager", "owner-manager"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "The agency ends up holding medical details it had no reason to keep, forwarded through chat during an emergency and never removed afterwards.",
    riskAction:
      "Put the traveller or their insurer in direct contact wherever possible, keep only the fact of the incident, and delete the medical documents that passed through your hands.",
    businessModels: TRAVEL,
  },

  // ---- Checkout, complaints & reviews -------------------------------------
  {
    id: "feedback-review-platform",
    name: "Feedback & review platform",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["checkout-feedback", "loyalty-marketing"],
    description:
      "The post-stay survey and the review request, linked back to the booking - so a rating is never anonymous internally, however it looks to the guest.",
    dataCategoryIds: ["communication-records", "guest-scoring", "booking-itinerary", "guest-identity"],
    accessPersonaIds: ["marketing-staff", "operations-staff", "vendor-staff", "owner-manager"],
    retentionDefined: false,
    riskLevel: "medium",
  },
  {
    id: "public-review-site",
    name: "Public review sites & social media",
    nodeType: "system",
    boundary: "public",
    stageIds: ["checkout-feedback"],
    description:
      "Where a complaint becomes public - and where a well-meant reply that mentions the room, the dates or what actually happened discloses the stay to everyone reading.",
    dataCategoryIds: ["communication-records", "complaint-incident", "guest-identity"],
    accessPersonaIds: ["marketing-staff", "owner-manager", "guest"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "A public reply is a disclosure the business makes voluntarily and cannot take back, and the instinct to correct the record is exactly what causes it.",
    riskAction:
      "Reply publicly without confirming any detail of the stay, and move anything specific to a private channel.",
  },
  {
    id: "complaint-support-desk",
    name: "Complaint & guest-support desk",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["in-trip-support", "checkout-feedback", "archive"],
    description:
      "The internal thread behind a complaint: what happened, what was offered, what staff thought of the guest - and a label that follows the profile into every future booking.",
    dataCategoryIds: ["complaint-incident", "guest-scoring", "communication-records", "service-activity"],
    accessPersonaIds: ["operations-staff", "front-desk-staff", "owner-manager", "marketing-staff"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Complaint notes carry opinion as well as fact, are visible to staff who will serve the guest again, and a 'difficult guest' flag is a judgement the guest can ask to see and dispute.",
    riskAction:
      "Keep notes factual and separate observation from opinion, restrict complaint history to the team resolving it, and review and expire behaviour flags rather than letting them ride forever.",
  },
  {
    id: "lost-property-register",
    name: "Lost property register & store",
    nodeType: "physical_storage",
    boundary: "agency",
    stageIds: ["checkout-feedback", "archive"],
    description:
      "The cupboard and the book behind it - items, photographs taken to identify them, the guest's forwarding address and the courier docket, kept long after the item was returned or disposed of.",
    dataCategoryIds: ["complaint-incident", "guest-identity", "communication-records"],
    accessPersonaIds: ["front-desk-staff", "operations-staff", "security-staff"],
    retentionDefined: false,
    riskLevel: "medium",
    businessModels: HOTEL,
  },
  {
    id: "refund-dispute-file",
    name: "Refund, chargeback & dispute file",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["payment", "checkout-feedback", "archive"],
    description:
      "Evidence assembled to contest a chargeback or settle a claim: folios, correspondence, registration cards, sometimes CCTV stills - shared with a bank, a platform or an insurer.",
    dataCategoryIds: ["payment-financial", "complaint-incident", "identity-documents", "access-monitoring"],
    accessPersonaIds: ["finance-staff", "owner-manager", "vendor-staff"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Disputes are the one process that legitimately pulls identity documents and footage back out of storage, and the bundle that gets built is rarely deleted once the dispute closes.",
    riskAction:
      "Assemble the minimum evidence the dispute needs, note who it was sent to, and delete the bundle once the matter is closed.",
  },

  // ---- Loyalty & marketing -------------------------------------------------
  {
    id: "loyalty-marketing-platform",
    name: "Loyalty, CRM campaigns & broadcast lists",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["loyalty-marketing", "archive"],
    description:
      "Where a finished stay goes to be reused: tier and points, stay frequency, preferred property, spend band, churn score, seasonal campaign lists, WhatsApp broadcasts sent from a manager's own number, and audiences uploaded back to the ad platform.",
    dataCategoryIds: ["loyalty-marketing-profile", "guest-scoring", "guest-identity", "booking-itinerary"],
    accessPersonaIds: ["marketing-staff", "owner-manager", "reservations-staff", "vendor-staff"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Marketing permission is usually bundled into the booking, and a withdrawal recorded here does not reach the uploaded audience, the agency's export or the broadcast list on somebody's personal phone - so the guest keeps hearing from you after asking you to stop.",
    riskAction:
      "Separate booking communication from promotion, keep one suppression list every channel must check before sending, remove uploaded audiences on withdrawal, and set an inactivity rule that closes dormant loyalty profiles.",
  },
  {
    id: "loyalty-programme",
    name: "Loyalty programme & membership record",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["reservation", "loyalty-marketing", "archive"],
    description:
      "The membership itself - profile, tier, points, redemption history and every stay ever linked to it, across properties and often across brands.",
    dataCategoryIds: ["loyalty-marketing-profile", "booking-itinerary", "guest-identity", "service-activity"],
    accessPersonaIds: ["marketing-staff", "front-desk-staff", "vendor-staff", "guest"],
    retentionDefined: false,
    riskLevel: "medium",
  },
  {
    id: "marketing-agency-export",
    name: "Marketing agency exports & lists",
    nodeType: "repository",
    boundary: "vendor",
    stageIds: ["loyalty-marketing", "archive"],
    description:
      "The spreadsheet of guests handed to an agency to run a campaign, which then lives in the agency's drive, its own tools and the inbox of whoever it was forwarded to.",
    dataCategoryIds: ["guest-identity", "loyalty-marketing-profile", "guest-scoring"],
    accessPersonaIds: ["vendor-staff", "marketing-staff"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Once a list has been exported, suppression applied in your systems never reaches it, and the agency keeps re-importing the version it holds.",
    riskAction:
      "Stop exporting lists and give the agency access to a segment instead, or send suppression updates with every campaign and require deletion of the previous file.",
  },

  // ---- Archive, backups & devices -----------------------------------------
  {
    id: "guest-history-archive",
    name: "Guest history archive & old-booking database",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["archive"],
    description:
      "Everything that settles: past reservations, cancelled and no-show bookings, enquiry records that never converted, passport scans from stays years ago, folios, preferences and notes - kept because past-guest history is what makes the next booking easier to sell.",
    dataCategoryIds: ["guest-identity", "identity-documents", "booking-itinerary", "guest-scoring"],
    accessPersonaIds: ["owner-manager", "reservations-staff", "marketing-staff", "front-desk-staff"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "Checking out deletes nothing. The archive holds high-impact identity documents belonging to people whose relationship with the business ended years ago, and it is the single place where a retention decision would do the most good and is least likely to have been taken.",
    riskAction:
      "Set a retention period per category - enquiry, booking, identity document, financial record - and run it on a clock. Identity documents almost never need to survive the stay; tax records do. Separate what you must keep from what you have merely never deleted.",
  },
  {
    id: "cloud-backup",
    name: "Cloud backup & file drives",
    nodeType: "repository",
    boundary: "vendor",
    stageIds: ["archive"],
    description:
      "Nightly backups of the reservation system, the shared drive of scanned documents, and the personal cloud accounts staff phones sync to without anyone deciding they should.",
    dataCategoryIds: ["identity-documents", "guest-identity", "booking-itinerary", "payment-financial"],
    accessPersonaIds: ["owner-manager", "vendor-staff", "reservations-staff"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "A deletion in the live system does not touch the backup set, and a personal cloud account holding guest passports is outside the business's control entirely.",
    riskAction:
      "Document the backup cycle and how long a deleted record persists in it, and stop staff devices syncing work photographs to personal cloud accounts.",
  },
  {
    id: "physical-file-store",
    name: "Physical file store & document cupboard",
    nodeType: "physical_storage",
    boundary: "agency",
    stageIds: ["identity-documents", "check-in", "archive"],
    description:
      "Photocopied passports, registration cards, signed vouchers, group manifests and printed travel packs - in a cupboard, a box file or the back office, held for as long as the shelf holds out.",
    dataCategoryIds: ["identity-documents", "guest-identity", "companion-family", "booking-itinerary"],
    accessPersonaIds: ["front-desk-staff", "reservations-staff", "owner-manager", "operations-staff"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Paper copies of identity documents are the hardest thing to find when a deletion request arrives, and the easiest thing for anyone in the building to walk off with.",
    riskAction:
      "Stop photocopying identity documents where a recorded check will do, keep what remains in a locked store, and shred on a schedule rather than when space runs out.",
  },
  {
    id: "staff-laptop",
    name: "Staff laptops & local downloads",
    nodeType: "device",
    boundary: "agency",
    stageIds: ["identity-documents", "payment", "loyalty-marketing", "archive"],
    description:
      "Reports exported to work on, passport scans downloaded to attach to a supplier email, guest lists saved to the desktop for a campaign - all sitting in Downloads long after the task ended.",
    dataCategoryIds: ["identity-documents", "guest-identity", "booking-itinerary", "staff-access-record"],
    accessPersonaIds: ["reservations-staff", "marketing-staff", "finance-staff", "owner-manager", "ex-staff"],
    shadowIt: true,
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Local copies are invisible to every system-level control, survive password changes and account closures, and leave with the laptop.",
    riskAction:
      "Restrict who can export, work from the system rather than downloads, and check and wipe devices when someone changes role or leaves.",
  },
  {
    id: "ex-staff-device",
    name: "Departed staff's devices & exports",
    nodeType: "device",
    boundary: "third-party",
    stageIds: ["loyalty-marketing", "archive"],
    description:
      "The contact list that synced, the guest spreadsheet that was emailed home, and the WhatsApp history full of passport photographs - now on a device belonging to someone who no longer works here.",
    dataCategoryIds: ["guest-identity", "identity-documents", "booking-itinerary", "staff-access-record"],
    accessPersonaIds: ["ex-staff"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "It is outside the business entirely, holds high-impact identity documents, cannot be reached by any rights request, and in this sector it is the ordinary consequence of a resignation rather than an unusual event.",
    riskAction:
      "Prevent the copy from being made in the first place: no exports without approval, no personal-device media sync, a documented offboarding that wipes work profiles, and removal from every operational group on the last day.",
  },
];
