// Systems, repositories, devices, physical stores and people that hold customer
// data in a typical Indian gym, salon or spa - NOT any specific business's
// environment (reference-model rule).
//
// Real things are named - the fingerprint reader at the turnstile, the
// body-composition machine printout, the consultation card in a drawer, the
// before-and-after album on the front-desk tablet, the stylist's formula
// notebook, the trainer's own phone, the staff WhatsApp group, the Instagram
// business account, the WhatsApp broadcast list, the franchise dashboard, the
// marketing agency's shared login, the CCTV DVR - because a generic "gym
// management system" fails the "that's my place" test. Storage, devices and
// chat channels are SPANNING nodes: they attach across stages, because that is
// where data sits over the whole relationship rather than at one step.
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
// THE CONSTRUCTION HERE (spec §5): all eight hotspot nodes are UNGATED, and each
// one's EARLIEST stage is a distinct ALL-MODEL stage:
//
//   staff-personal-phone ....... enquiry-booking (1)     service-history-register  service-delivery (7)
//   health-declaration-forms ... health-declaration (3)  photo-media-library ....  photo-media (10)
//   body-assessment-records .... assessment-consultation (4)  whatsapp-broadcast .  marketing-loyalty (13)
//   staff-whatsapp-group ....... service-planning (5)    old-customer-archive ...  renewal-exit-archive (14)
//
// A hotspot node may span LATER stages - the photo library genuinely resurfaces
// in marketing and in the archive - but must never acquire an EARLIER one.
// Three traps specific to this pack:
//  · `staff-whatsapp-group` must NOT list `enquiry-booking`. Bookings really do
//    arrive on WhatsApp - that is `whatsapp-business-inbox` (the 1:1 customer
//    thread) and `staff-personal-phone`. The GROUP is the internal staff chat,
//    and its first customer data is the day list posted at planning time.
//    Giving it stage 1 would collide its flag with `staff-personal-phone` in
//    all three models at once.
//  · `whatsapp-broadcast` must NOT list `enquiry-booking` either - same app,
//    different artefact. The broadcast list is a marketing asset built at stage
//    13; the enquiry thread is not it.
//  · `body-assessment-records` legitimately spans `training-progress`, which is
//    gym-only. That is safe: the node itself is ungated, so its earliest
//    VISIBLE stage is `assessment-consultation` in every model.
//
// Deliberately NOT hotspots, because they sit on model-gated stages: the
// biometric turnstile, the CCTV DVR, the freelancer's phone, the photographer's
// archive, the wearable sync, the hotel PMS link and the referral note. Each is
// authored as a high- or critical-risk node instead, and renders in full
// wherever it exists (spec §5). Between them they carry the pasted spec's
// thirty per-variant hotspot items.
//
// Risk ratio is deliberately controlled: no fearmongering. Six critical and
// twenty-four high out of fifty-nine (~51% red; map #11 ran 54%, map #9 45%).
// Systems that are genuinely well-controlled in this sector (the payment
// gateway, the booking app, the POS) sit at low or medium and keep their
// `riskWhy`/`riskAction` story in the description instead. If most of the map
// is red, nothing is.
//
// ⛔ No medical, fitness, beauty or dietary advice anywhere in this file. The
// map names what is HELD, never what should be done to a body.

import type { FlowNode } from "../../../data-flow/schemas.ts";

const GYM = ["gym"];
const SALON = ["salon"];
const SPA = ["spa"];
/** Has a turnstile, lockers and CCTV at the door. */
const GYM_SPA = ["gym", "spa"];
/** Keeps a paper appointment diary at the desk. */
const SALON_SPA = ["salon", "spa"];

export const GYMS_SALONS_SPAS_NODES: FlowNode[] = [
  // ---- The people ---------------------------------------------------------
  {
    id: "customer-person",
    name: "Customer / member",
    nodeType: "person",
    boundary: "candidate",
    stageIds: [
      "enquiry-booking",
      "registration-membership",
      "health-declaration",
      "assessment-consultation",
      "service-delivery",
      "photo-media",
      "billing-payments",
    ],
    description:
      "The data principal. One person, one body, one set of concerns - everything below is a copy, a measurement, a photograph or something the business worked out about them.",
    dataCategoryIds: ["identity-contact", "health-declaration", "body-measurements", "photos-videos"],
    accessPersonaIds: ["customer"],
    retentionDefined: true,
    riskLevel: "low",
  },
  {
    id: "family-companion-person",
    name: "Emergency contact, guardian or companion",
    nodeType: "person",
    boundary: "candidate",
    stageIds: ["registration-membership", "billing-payments"],
    description:
      "The emergency contact on the form, the parent who signed for a minor, the partner on a couple booking, the gift-voucher sender. Separate data principals, stored as fields on somebody else's record.",
    dataCategoryIds: ["family-related", "identity-contact"],
    accessPersonaIds: ["family-companion", "front-desk"],
    retentionDefined: false,
    riskLevel: "medium",
  },
  {
    id: "trainer-person",
    name: "Trainer & fitness coach",
    nodeType: "person",
    boundary: "agency",
    stageIds: ["assessment-consultation", "service-planning", "service-delivery", "training-progress", "photo-media"],
    description:
      "Measures the member, writes the programme, tracks the progress, takes the progress photo. The member's relationship is with this person, not the premises.",
    dataCategoryIds: ["body-measurements", "health-declaration", "fitness-tracking", "photos-videos"],
    accessPersonaIds: ["trainer-coach", "manager-owner"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Holds the deepest body data in the building - measurements, health declarations, progress photos - across app, notebook and personal phone, and the client relationship is portable: when the trainer moves on, members and their records tend to follow.",
    riskAction:
      "Give trainers role-scoped access to their own clients only, keep measurements and photos in managed tools rather than personal devices, and make trainer exit a checklist: access revoked, local copies deleted, clients told through the business.",
    businessModels: GYM,
  },
  {
    id: "stylist-person",
    name: "Stylist & beautician",
    nodeType: "person",
    boundary: "agency",
    stageIds: [
      "enquiry-booking",
      "assessment-consultation",
      "service-planning",
      "service-delivery",
      "home-freelance",
      "photo-media",
    ],
    description:
      "Takes bookings on their own number, runs the consultation, keeps the formula, delivers the service, shoots the before-and-after. The most personal client relationship in the sector.",
    dataCategoryIds: ["beauty-consultation", "identity-contact", "photos-videos", "service-history"],
    accessPersonaIds: ["stylist-beautician", "manager-owner"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Clients book the stylist, not the salon - so the number, the preferences, the formulas and the photos live in the stylist's own phone and notebook, and a departing stylist can take the client base to the salon down the road as a matter of routine.",
    riskAction:
      "Route bookings through the business channel, keep formulas and consultation notes in the salon's own system, and put the client-list question in the employment terms - with access revoked and copies deleted on exit.",
    businessModels: SALON,
  },
  {
    id: "therapist-person",
    name: "Therapist & wellness staff",
    nodeType: "person",
    boundary: "agency",
    stageIds: ["health-declaration", "assessment-consultation", "service-planning", "service-delivery", "partner-referral"],
    description:
      "Reads the health intake, writes the treatment plan, delivers the treatment and records how it went - in the one setting where customers most expect discretion.",
    dataCategoryIds: ["health-declaration", "beauty-consultation", "service-history"],
    accessPersonaIds: ["therapist", "manager-owner"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Sees medical conditions, contraindications and body notes for every customer they treat, and the notes often live in personal notebooks and chat threads rather than the spa's system - unreachable the day the therapist leaves.",
    riskAction:
      "Restrict intake forms to the treating therapist, keep session notes factual and in the spa's own records, and include therapist exit in the same access-revocation checklist as any system.",
    businessModels: SPA,
  },
  {
    id: "front-desk-person",
    name: "Front desk & reception",
    nodeType: "person",
    boundary: "agency",
    stageIds: ["enquiry-booking", "registration-membership", "health-declaration", "billing-payments"],
    description:
      "Takes the enquiry, files the membership form, collects the health declaration, runs the billing and answers the WhatsApp - the role that touches every record without needing most of it.",
    dataCategoryIds: ["identity-contact", "membership-appointment", "health-declaration", "payment-financial"],
    accessPersonaIds: ["front-desk", "manager-owner"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "The widest routine access in the business sits at the desk with the highest turnover: health declarations pass through reception's hands, every profile opens on a shared login, and the same person runs the marketing list.",
    riskAction:
      "Give reception a named login scoped to bookings and billing, keep health forms sealed from the desk workflow once collected, and separate the front-desk role from campaign-list exports.",
  },
  {
    id: "manager-owner-person",
    name: "Owner & branch manager",
    nodeType: "person",
    boundary: "agency",
    stageIds: ["registration-membership", "billing-payments", "marketing-loyalty", "renewal-exit-archive"],
    description:
      "Runs the business and can open anything - members, money, campaigns, the archive. In a small business this is also the grievance contact and the incident response.",
    dataCategoryIds: ["membership-appointment", "payment-financial", "marketing-profile"],
    accessPersonaIds: ["manager-owner"],
    retentionDefined: false,
    riskLevel: "medium",
  },
  {
    id: "freelancer-person",
    name: "Freelance artist & home-service staff",
    nodeType: "person",
    boundary: "third-party",
    stageIds: ["home-freelance", "photo-media"],
    description:
      "The freelance makeup artist, bridal specialist or home-service professional booked for the event. A separate business that receives the customer's address, consultation notes and photographs.",
    dataCategoryIds: ["identity-contact", "beauty-consultation", "photos-videos", "family-related"],
    accessPersonaIds: ["freelancer", "stylist-beautician"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Works for many businesses at once, on their own devices, with no contract covering the customer data they carry - and a bride's address, event date and photographs are exactly the data a freelancer keeps for their own marketing.",
    riskAction:
      "Share the minimum the assignment needs, put deletion after the event and a portfolio-use prohibition in writing, and log which freelancer received which customer's details.",
    businessModels: SALON,
  },
  {
    id: "wellness-practitioner-person",
    name: "Nutritionist, physiotherapist & referral partner",
    nodeType: "person",
    boundary: "third-party",
    stageIds: ["partner-referral"],
    description:
      "The external practitioner a spa customer is referred to. Receives a treatment summary and a health concern, and keeps their own record of both.",
    dataCategoryIds: ["health-declaration", "service-history", "identity-contact"],
    accessPersonaIds: ["wellness-referrer"],
    retentionDefined: false,
    riskLevel: "medium",
    businessModels: SPA,
  },

  // ---- Enquiry & booking surfaces -----------------------------------------
  {
    id: "website-booking-form",
    name: "Website booking form",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["enquiry-booking"],
    description:
      "The enquiry and booking form on the business's own website - name, number, service interest, preferred slot.",
    dataCategoryIds: ["identity-contact", "membership-appointment"],
    accessPersonaIds: ["front-desk", "marketing-social"],
    retentionDefined: false,
    riskLevel: "low",
  },
  {
    id: "social-dm-inbox",
    name: "Instagram & Facebook DM inbox",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["enquiry-booking"],
    description:
      "Price enquiries, booking requests and 'do you do this treatment?' conversations in the social inbox - often with photos the customer sends of their own hair, skin or goals.",
    dataCategoryIds: ["identity-contact", "communication-feedback", "photos-videos"],
    accessPersonaIds: ["marketing-social", "front-desk"],
    retentionDefined: false,
    riskLevel: "medium",
  },
  {
    id: "whatsapp-business-inbox",
    name: "WhatsApp Business inbox",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["enquiry-booking", "service-delivery", "billing-payments"],
    description:
      "The business number's 1:1 threads: bookings, reschedules, questions, payment screenshots - and, over time, a running transcript of the whole relationship that nobody ever deletes.",
    dataCategoryIds: ["identity-contact", "communication-feedback", "payment-financial", "membership-appointment"],
    accessPersonaIds: ["front-desk", "manager-owner"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "The thread accumulates identity, appointments, payment screenshots and occasionally health details in one place, on whichever handset holds the business number - searchable by anyone holding the phone and backed up to a personal account.",
    riskAction:
      "Run WhatsApp Business on a business-owned device with its own backup account, keep health details and documents out of the thread, and set a periodic clean-up of old conversations.",
  },
  {
    id: "staff-personal-phone",
    name: "Staff member's personal phone",
    nodeType: "device",
    boundary: "agency",
    stageIds: [
      "enquiry-booking",
      "assessment-consultation",
      "service-delivery",
      "photo-media",
      "marketing-loyalty",
      "renewal-exit-archive",
    ],
    description:
      "The trainer's, stylist's or therapist's own handset. Bookings arrive on it, forms get photographed on it, progress photos are shot on it, follow-ups are sent from it - and when the person leaves, it leaves with them, clients and all.",
    dataCategoryIds: ["identity-contact", "photos-videos", "health-declaration", "communication-feedback"],
    accessPersonaIds: ["trainer-coach", "stylist-beautician", "therapist", "front-desk"],
    shadowIt: true,
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "The realest customer record in the sector lives in a camera roll and a chat history the business cannot search, audit or wipe. It holds body photographs and health forms alongside family pictures, syncs to a personal cloud - and it is the client list a departing staff member walks out with.",
    riskAction:
      "Give customer-facing staff a business channel that is genuinely easier than their own phone, prohibit photographing customers and forms to personal devices in writing, and treat staff exit as a data event: numbers handed over, local copies deleted, clients informed by the business.",
  },
  {
    id: "reception-diary",
    name: "Appointment diary at the desk",
    nodeType: "physical_storage",
    boundary: "agency",
    stageIds: ["enquiry-booking"],
    description:
      "The paper diary by the till: names, numbers and today's bookings, open on the counter where any customer waiting can read it upside down.",
    dataCategoryIds: ["identity-contact", "membership-appointment"],
    accessPersonaIds: ["front-desk", "stylist-beautician", "therapist"],
    retentionDefined: false,
    riskLevel: "medium",
    businessModels: SALON_SPA,
  },
  {
    id: "lead-spreadsheet",
    name: "Lead & follow-up spreadsheet",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["enquiry-booking", "marketing-loyalty"],
    description:
      "The trial list, the enquiry sheet, the renewals tracker - a spreadsheet of everyone who ever asked, kept because deleting a lead feels like deleting revenue.",
    dataCategoryIds: ["identity-contact", "membership-appointment", "marketing-profile"],
    accessPersonaIds: ["front-desk", "marketing-social", "manager-owner"],
    shadowIt: true,
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Lives outside any system, copies easily, and never dies: people who visited once for a trial are still on the sheet - and therefore on the campaign list - years later.",
    riskAction:
      "Keep leads in the booking or management software with a defined life, and delete the spreadsheet copies - a lead that never converted has no business being marketed to indefinitely.",
  },
  {
    id: "booking-marketplace",
    name: "Booking marketplace & aggregator",
    nodeType: "system",
    boundary: "third-party",
    stageIds: ["enquiry-booking"],
    description:
      "The fitness or salon marketplace the customer booked through. It introduced the customer, and it keeps its own copy of the booking history under its own rules.",
    dataCategoryIds: ["identity-contact", "membership-appointment"],
    accessPersonaIds: ["vendor-support"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Holds the customer's booking history across every business they visit, shares only what its own terms allow, and answers deletion requests to itself, not to you - yet the customer experiences it as booking with you.",
    riskAction:
      "Know what the marketplace contract says about data received and returned, keep marketplace customers' records in your own system to the same rules as walk-ins, and point mistaken requests to the right controller honestly.",
  },
  {
    id: "ad-attribution",
    name: "Ad pixels & attribution tags",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["enquiry-booking"],
    description:
      "The Meta and Google tags on the booking page, recording which advertisement produced the enquiry and what the visitor did next.",
    dataCategoryIds: ["identity-contact", "marketing-profile"],
    accessPersonaIds: ["vendor-support", "marketing-social"],
    retentionDefined: false,
    riskLevel: "medium",
  },
  {
    id: "hotel-pms",
    name: "Hotel PMS & concierge link",
    nodeType: "system",
    boundary: "client",
    stageIds: ["enquiry-booking", "billing-payments"],
    description:
      "The partner hotel's own system: the concierge books the guest in with a room number, and the spa's charge goes back onto the folio - sometimes with the treatment named on it.",
    dataCategoryIds: ["identity-contact", "membership-appointment", "payment-financial"],
    accessPersonaIds: ["corporate-hotel"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "The hotel's record joins the guest's identity, room and spa visit - and a treatment named on a shared folio is read by whoever settles the bill, which is not always the person who had the treatment.",
    riskAction:
      "Exchange the minimum the booking and the charge need, use neutral descriptions on folio lines, and keep the spa's treatment record out of the hotel's reach entirely.",
    businessModels: SPA,
  },
  {
    id: "corporate-wellness-portal",
    name: "Corporate wellness programme portal",
    nodeType: "system",
    boundary: "client",
    stageIds: ["enquiry-booking", "billing-payments", "partner-referral"],
    description:
      "The employer's wellness programme: a member list arrives from HR, and usage reports go back - the employer paying the bill can be tempted to ask who actually attends.",
    dataCategoryIds: ["identity-contact", "family-related", "membership-appointment", "payment-financial"],
    accessPersonaIds: ["corporate-hotel"],
    retentionDefined: false,
    riskLevel: "medium",
    businessModels: GYM_SPA,
  },

  // ---- Registration & the master record -----------------------------------
  {
    id: "management-software",
    name: "Membership & customer management software",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["registration-membership", "billing-payments", "marketing-loyalty", "renewal-exit-archive"],
    description:
      "The gym-management, salon-CRM or spa software: every member, every package, every visit, every note - usually open on one shared front-desk login that half the staff know.",
    dataCategoryIds: [
      "identity-contact",
      "membership-appointment",
      "family-related",
      "payment-financial",
      "service-history",
      "marketing-profile",
    ],
    accessPersonaIds: ["front-desk", "manager-owner", "marketing-social", "vendor-support"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "The master record of the business, reachable through shared logins that are never rotated and rarely revoked - so ex-staff, the IT vendor and every branch can often still open every customer.",
    riskAction:
      "Named logins per person, role-scoped views, access reviewed when anyone leaves - and check what the software vendor's own support staff can see.",
  },
  {
    id: "registration-file",
    name: "Paper membership forms & member files",
    nodeType: "physical_storage",
    boundary: "agency",
    stageIds: ["registration-membership", "renewal-exit-archive"],
    description:
      "The drawer of signed membership forms: identity, address, emergency contact, the guardian's signature for a minor - filed once and kept for as long as the drawer exists.",
    dataCategoryIds: ["identity-contact", "family-related", "membership-appointment"],
    accessPersonaIds: ["front-desk", "manager-owner"],
    retentionDefined: false,
    riskLevel: "medium",
  },
  {
    id: "booking-app",
    name: "Appointment booking & scheduling app",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["enquiry-booking", "registration-membership", "service-planning"],
    description:
      "The scheduling tool that runs the calendar: slots, staff rosters, customer contact details and the service booked - the operational heart of the day.",
    dataCategoryIds: ["identity-contact", "membership-appointment"],
    accessPersonaIds: ["front-desk", "trainer-coach", "stylist-beautician", "therapist"],
    retentionDefined: true,
    riskLevel: "medium",
  },
  {
    id: "cloud-backup",
    name: "Cloud backup & sync",
    nodeType: "repository",
    boundary: "vendor",
    stageIds: ["registration-membership", "renewal-exit-archive"],
    description:
      "The backup nobody thinks about: the management software's export, the shared drive of scanned forms, the phone galleries syncing to personal accounts - every deletion's quiet exception.",
    dataCategoryIds: ["identity-contact", "health-declaration", "photos-videos", "payment-financial"],
    accessPersonaIds: ["vendor-support", "manager-owner"],
    retentionDefined: false,
    riskLevel: "medium",
  },

  // ---- Health declarations & assessment -----------------------------------
  {
    id: "health-declaration-forms",
    name: "Health declaration & consultation forms",
    nodeType: "physical_storage",
    boundary: "agency",
    stageIds: ["health-declaration", "renewal-exit-archive"],
    description:
      "The PAR-Q at the gym, the allergy and patch-test form at the salon, the contraindication intake at the spa - medical conditions, injuries, medication and pregnancy, collected on paper by whoever is at the desk.",
    dataCategoryIds: ["health-declaration", "identity-contact", "family-related"],
    accessPersonaIds: ["front-desk", "trainer-coach", "stylist-beautician", "therapist"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "High-impact health data collected by staff with no clinical training, stored where reception can browse it, discussed across the desk within earshot - and kept for years after the declaration stopped being true, with no correction route the customer knows about.",
    riskAction:
      "Collect only what the service genuinely needs, hand the form to the treating professional rather than the desk, store it sealed with named access, refresh it rather than trusting a years-old answer, and give it a destruction date.",
  },
  {
    id: "google-forms-sheets",
    name: "Google Forms & intake spreadsheets",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["health-declaration", "assessment-consultation"],
    description:
      "The free-tier intake stack: a Google Form for the health questionnaire, a spreadsheet of responses - shared by link, editable by anyone who has ever had the link.",
    dataCategoryIds: ["health-declaration", "identity-contact", "body-measurements"],
    accessPersonaIds: ["front-desk", "manager-owner", "trainer-coach"],
    shadowIt: true,
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Health declarations end up in a spreadsheet with link-based sharing, no access log and no owner - forwarded once, reachable forever, and invisible to any deletion process the business runs.",
    riskAction:
      "Move health intake into the management software or a form tool with named access, kill the shared links, and delete the legacy response sheets after migrating what is still needed.",
  },
  {
    id: "body-assessment-records",
    name: "Body & consultation assessment records",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["assessment-consultation", "training-progress", "renewal-exit-archive"],
    description:
      "Where the body becomes a record: weight, BMI and girth measurements, body-composition printouts, skin and hair analyses, wellness consultations - the file that turns a person into a baseline to improve on.",
    dataCategoryIds: ["body-measurements", "beauty-consultation", "health-declaration", "transformation-progress"],
    accessPersonaIds: ["trainer-coach", "stylist-beautician", "therapist", "manager-owner"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "A longitudinal record of somebody's body, readable by more staff than ever measured them, spread across machine printouts, spreadsheets and apps - and almost never deleted, because progress data feels like an asset even after the member is gone.",
    riskAction:
      "Keep assessments in one governed place with access scoped to the treating professional, show the customer their own record on request, and delete the trend when the relationship ends rather than archiving a body by default.",
  },
  {
    id: "staff-notebook",
    name: "Staff member's own notebook",
    nodeType: "physical_storage",
    boundary: "agency",
    stageIds: ["assessment-consultation", "service-planning", "service-delivery"],
    description:
      "The trainer's diary, the stylist's formula book, the therapist's session notes - handwritten customer records in a personal notebook the business has never seen.",
    dataCategoryIds: ["beauty-consultation", "body-measurements", "health-declaration", "identity-contact"],
    accessPersonaIds: ["trainer-coach", "stylist-beautician", "therapist"],
    shadowIt: true,
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "An unsearchable customer database in private handwriting: allergies, formulas, body notes and numbers that never appear in any access request, never get corrected, and go home in a bag every evening.",
    riskAction:
      "Provide an official place for working notes that is genuinely as fast as paper, make clear the notebook's contents belong to the business, and collect or destroy it on exit.",
  },
  {
    id: "body-composition-machine",
    name: "Body-composition analyser",
    nodeType: "device",
    boundary: "agency",
    stageIds: ["assessment-consultation", "training-progress"],
    description:
      "The machine by the mirror: stand on it, hold the handles, and it prints body-fat, muscle mass and a member profile - stored on the device and, for newer models, in the vendor's cloud app.",
    dataCategoryIds: ["body-measurements", "identity-contact", "transformation-progress"],
    accessPersonaIds: ["trainer-coach", "vendor-support"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "The device quietly accumulates every member's body-composition history under a shared operator login, the vendor's companion app keeps its own copy, and neither is in anyone's inventory when a deletion request arrives.",
    riskAction:
      "Inventory what the machine and its vendor app retain, clear device-stored profiles on membership exit, and put the vendor's copy under a written deletion arrangement.",
    businessModels: GYM,
  },
  {
    id: "skin-hair-analysis-device",
    name: "Skin & hair analysis device",
    nodeType: "device",
    boundary: "agency",
    stageIds: ["assessment-consultation"],
    description:
      "The scanner used in the consultation: close-up images of skin and scalp, an analysis score, and a vendor app that keeps the scans to show 'improvement over time'.",
    dataCategoryIds: ["beauty-consultation", "photos-videos", "identity-contact"],
    accessPersonaIds: ["stylist-beautician", "vendor-support"],
    retentionDefined: false,
    riskLevel: "medium",
    businessModels: SALON,
  },

  // ---- Planning & the staff group -----------------------------------------
  {
    id: "staff-whatsapp-group",
    name: "Staff WhatsApp group",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["service-planning", "service-delivery", "photo-media"],
    description:
      "The internal group where the day runs: today's client list, 'careful - patch test positive', the reaction photo, the before-and-after for approval - customer data broadcast to every phone on the shift.",
    dataCategoryIds: ["identity-contact", "health-declaration", "beauty-consultation", "photos-videos"],
    accessPersonaIds: ["front-desk", "trainer-coach", "stylist-beautician", "therapist", "manager-owner"],
    shadowIt: true,
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Whatever is posted reaches every member of the group and stays in every phone's history and backup - including the phones of people who left last year. A caution note about one customer's health becomes a broadcast.",
    riskAction:
      "Keep the group for rosters and logistics, never customer names, health cautions or photographs; pass client-specific detail person-to-person in the official tool; and rebuild the group when staff leave.",
  },
  {
    id: "trainer-workout-app",
    name: "Workout programming app",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["service-planning", "service-delivery", "training-progress"],
    description:
      "The coaching app where programmes are assigned and sessions logged - the member's plan, limitations and adherence, visible to the coach and the platform.",
    dataCategoryIds: ["fitness-tracking", "body-measurements", "identity-contact"],
    accessPersonaIds: ["trainer-coach", "vendor-support"],
    retentionDefined: true,
    riskLevel: "medium",
    businessModels: GYM,
  },
  {
    id: "formula-book",
    name: "Colour & formula records",
    nodeType: "physical_storage",
    boundary: "agency",
    stageIds: ["service-planning", "service-delivery"],
    description:
      "The salon's formula records - the exact colour mix, the developer, the timing, the patch-test outcome - the craft memory of the business, kept per customer.",
    dataCategoryIds: ["beauty-consultation", "service-history", "identity-contact"],
    accessPersonaIds: ["stylist-beautician", "front-desk"],
    retentionDefined: false,
    riskLevel: "medium",
    businessModels: SALON,
  },
  {
    id: "treatment-card",
    name: "Printed treatment card",
    nodeType: "physical_storage",
    boundary: "agency",
    stageIds: ["service-planning", "service-delivery"],
    description:
      "The card that travels with the spa booking: treatment, pressure preference, areas to avoid, the caution note - left on counters between rooms more often than anyone admits.",
    dataCategoryIds: ["beauty-consultation", "health-declaration", "identity-contact"],
    accessPersonaIds: ["therapist", "front-desk"],
    retentionDefined: false,
    riskLevel: "medium",
    businessModels: SPA,
  },

  // ---- The door: access, attendance & CCTV --------------------------------
  {
    id: "biometric-access",
    name: "Biometric turnstile & attendance",
    nodeType: "device",
    boundary: "agency",
    stageIds: ["access-attendance"],
    description:
      "The fingerprint or face reader at the gym door: a biometric template per member, an entry log per visit - the one credential a member cannot change if it leaks.",
    dataCategoryIds: ["attendance-access", "identity-contact"],
    accessPersonaIds: ["front-desk", "manager-owner", "vendor-support"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "A database of fingerprint or face templates, managed on a shared admin login by the access vendor, retained for members who left years ago - and unlike a password, a leaked template cannot be reset.",
    riskAction:
      "Use biometrics only where genuinely needed and offer a card alternative, delete templates when membership ends, name the admin accounts, and put the vendor's retention in writing.",
    businessModels: GYM,
  },
  {
    id: "rfid-card-system",
    name: "Access cards & lockers",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["access-attendance"],
    description:
      "The RFID card or wristband: entries, exits, locker assignments - the quiet log of when the customer's body was in the building.",
    dataCategoryIds: ["attendance-access", "identity-contact"],
    accessPersonaIds: ["front-desk", "manager-owner"],
    retentionDefined: false,
    riskLevel: "medium",
    businessModels: GYM_SPA,
  },
  {
    id: "cctv-dvr",
    name: "CCTV & the DVR",
    nodeType: "device",
    boundary: "agency",
    stageIds: ["access-attendance"],
    description:
      "The cameras and the recorder in the back office: everyone who entered, on a loop that overwrites itself - unless somebody exports a clip, at which point it lives forever.",
    dataCategoryIds: ["attendance-access", "photos-videos"],
    accessPersonaIds: ["manager-owner", "front-desk", "vendor-support"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Cameras drift toward covering everything, footage is viewable by whoever knows the DVR password, exported clips travel into chat apps, and placement near changing or treatment areas is an incident waiting to be discovered.",
    riskAction:
      "Review every camera position against a safety justification, keep recorders on named logins with a short configured retention, and allow exports only through a recorded process.",
    businessModels: GYM_SPA,
  },
  {
    id: "authority-disclosure",
    name: "Police & authority requests",
    nodeType: "system",
    boundary: "government",
    stageIds: ["access-attendance"],
    description:
      "The occasional lawful request after an incident: CCTV footage or attendance records handed to the police - a copy the business will never control again.",
    dataCategoryIds: ["attendance-access", "identity-contact"],
    accessPersonaIds: ["authority", "manager-owner"],
    retentionDefined: true,
    riskLevel: "medium",
    businessModels: GYM_SPA,
  },

  // ---- Service delivery ----------------------------------------------------
  {
    id: "service-history-register",
    name: "Service & treatment history",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["service-delivery", "renewal-exit-archive"],
    description:
      "The running record every visit appends to: what was done, which products were used, how the skin reacted, what the customer prefers - plus the observation the staff member typed about the person.",
    dataCategoryIds: ["service-history", "beauty-consultation", "identity-contact", "marketing-profile"],
    accessPersonaIds: ["trainer-coach", "stylist-beautician", "therapist", "front-desk", "marketing-social"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Individually harmless entries compound into an intimate profile - appearance concerns, treatment patterns, staff opinions of the person - readable by the whole team, mined for campaigns, and kept indefinitely because history feels operational.",
    riskAction:
      "Keep entries factual and service-relevant, scope who can read the full history versus today's booking, keep marketing away from treatment detail, and give the history the same retention rule as the membership.",
  },
  {
    id: "incident-register",
    name: "Incident & injury register",
    nodeType: "physical_storage",
    boundary: "agency",
    stageIds: ["service-delivery"],
    description:
      "Where a fall on the gym floor or a reaction on the massage table is written down: what happened, to whom, what was done - a record with genuine reasons to exist and to be kept carefully.",
    dataCategoryIds: ["service-history", "health-declaration", "identity-contact"],
    accessPersonaIds: ["manager-owner", "front-desk"],
    retentionDefined: true,
    riskLevel: "medium",
    businessModels: GYM_SPA,
  },

  // ---- Home services & freelancers (salon) --------------------------------
  {
    id: "freelancer-phone",
    name: "Freelancer's own phone",
    nodeType: "device",
    boundary: "third-party",
    stageIds: ["home-freelance", "photo-media"],
    description:
      "The freelance artist's handset: the bride's address and event schedule, the trial photos, the WhatsApp thread with the family - a working copy of the event on a device outside everyone's control.",
    dataCategoryIds: ["identity-contact", "photos-videos", "beauty-consultation", "family-related"],
    accessPersonaIds: ["freelancer"],
    shadowIt: true,
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "Everything the salon shared for one event - address, timings, faces, looks - persists in a third party's camera roll and chats, ready to resurface as portfolio content or simply never be deleted, and no request the customer makes to the salon can reach it.",
    riskAction:
      "Share assignment details through a channel the business controls, put deletion-after-event and no-portfolio-use in the freelancer's terms, and confirm deletion rather than assuming it.",
    businessModels: SALON,
  },
  {
    id: "photographer-archive",
    name: "Photographer's raw archive",
    nodeType: "repository",
    boundary: "third-party",
    stageIds: ["home-freelance", "photo-media"],
    description:
      "The photographer's drive: every frame from the bridal shoot and the studio session, kept as a professional archive long after the edited album was delivered.",
    dataCategoryIds: ["photos-videos", "identity-contact"],
    accessPersonaIds: ["photographer"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "The raw frames - including the unflattering, the intimate and the never-approved - outlive the engagement on storage the customer does not know exists, under a photographer's habit of keeping everything forever.",
    riskAction:
      "Agree in writing what the photographer keeps, for how long, and for what use; make customer removal requests reach them; and get deletion confirmed for the frames that were never selected.",
    businessModels: SALON,
  },

  // ---- Wearables & progress (gym) -----------------------------------------
  {
    id: "member-app",
    name: "Member mobile app",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["registration-membership", "training-progress"],
    description:
      "The gym's member app: bookings, workouts, progress charts and push notifications - the member's own window onto the record the business keeps about their body.",
    dataCategoryIds: ["identity-contact", "fitness-tracking", "transformation-progress", "membership-appointment"],
    accessPersonaIds: ["customer", "trainer-coach", "vendor-support"],
    retentionDefined: true,
    riskLevel: "medium",
    businessModels: GYM,
  },
  {
    id: "wearable-integration",
    name: "Wearable & fitness-app sync",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["training-progress"],
    description:
      "The connection to the member's watch or fitness app: heart rate, activity and sleep flowing into the training record - and into the platform vendor's own cloud.",
    dataCategoryIds: ["fitness-tracking", "body-measurements"],
    accessPersonaIds: ["vendor-support", "trainer-coach", "customer"],
    retentionDefined: false,
    riskLevel: "medium",
    businessModels: GYM,
  },

  // ---- Photographs & media -------------------------------------------------
  {
    id: "photo-media-library",
    name: "Before-and-after photo library",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["photo-media", "marketing-loyalty", "renewal-exit-archive"],
    description:
      "The gallery the business builds from customers' bodies: progress pairs, transformation shots, bridal albums, testimonial clips - on the front-desk tablet, a shared drive and the social-media draft folder, waiting to become content.",
    dataCategoryIds: ["photos-videos", "transformation-progress", "identity-contact"],
    accessPersonaIds: ["marketing-social", "trainer-coach", "stylist-beautician", "manager-owner"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "This is the sector's signature risk: a partly-clothed body, photographed mid-transformation, sitting one tap from Instagram. Consent was a verbal yes to the person holding the phone - nothing recorded about channel, crop or duration - and the library keeps every customer ever photographed, published or not.",
    riskAction:
      "Record a per-customer publication choice - purpose, channel, identity visibility, expiry - before anything is posted; separate capture consent from publication consent; give raw images a retention date; and keep a removal route that actually reaches every copy.",
  },
  {
    id: "social-media-pages",
    name: "Instagram, Facebook & website gallery",
    nodeType: "system",
    boundary: "public",
    stageIds: ["photo-media", "marketing-loyalty"],
    description:
      "The public face of the business: the reels, the transformation posts, the tagged customers, the website gallery - marketing that is made of customers' bodies and faces.",
    dataCategoryIds: ["photos-videos", "transformation-progress", "identity-contact"],
    accessPersonaIds: ["marketing-social", "agency-social-manager"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Once posted, the image is public: re-shared, screenshotted, cached and indexed. Deleting the post does not delete the copies, and a tagged customer's name travels with the picture wherever it goes.",
    riskAction:
      "Post only what has a recorded, channel-specific consent; prefer untagged and face-hidden options; act on withdrawals the day they arrive; and keep evidence of what was removed and when.",
  },
  {
    id: "marketing-agency",
    name: "Marketing agency & social manager",
    nodeType: "system",
    boundary: "third-party",
    stageIds: ["photo-media", "marketing-loyalty"],
    description:
      "The outside agency that runs the pages: it holds the photo folder, a customer export for campaigns and the account passwords - your brand, their laptop.",
    dataCategoryIds: ["photos-videos", "identity-contact", "marketing-profile"],
    accessPersonaIds: ["agency-social-manager", "marketing-social"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "A separate business holds the raw images and the customer list on its own devices, serves several clients at once, and keeps its working copies when the engagement ends - the removal request that reaches your gallery rarely reaches theirs.",
    riskAction:
      "Contract for what the agency may hold and for how long, share working files through revocable access rather than downloads, and make agency deletion a written step in every removal and every offboarding.",
  },

  // ---- Billing -------------------------------------------------------------
  {
    id: "pos-billing",
    name: "POS & billing system",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["billing-payments", "renewal-exit-archive"],
    description:
      "Invoices, receipts, package balances and refunds - the money record, with service names on the line items and a freeze reason typed in the notes field.",
    dataCategoryIds: ["payment-financial", "identity-contact", "service-history"],
    accessPersonaIds: ["front-desk", "manager-owner"],
    retentionDefined: true,
    riskLevel: "medium",
  },
  {
    id: "payment-gateway",
    name: "Payment gateway",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["billing-payments"],
    description:
      "The regulated rail the card or UPI payment travels through - one of the few places in this map with defined rules and defined retention.",
    dataCategoryIds: ["payment-financial", "identity-contact"],
    accessPersonaIds: ["vendor-support"],
    retentionDefined: true,
    riskLevel: "low",
  },
  {
    id: "gift-voucher-system",
    name: "Gift voucher platform",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["billing-payments"],
    description:
      "The voucher link between two people: the buyer's details, the recipient's details, and an occasion - a record that tells the business who gifted whom a spa day.",
    dataCategoryIds: ["family-related", "identity-contact", "payment-financial"],
    accessPersonaIds: ["vendor-support", "front-desk"],
    retentionDefined: false,
    riskLevel: "medium",
    businessModels: SPA,
  },

  // ---- Referrals out (spa) -------------------------------------------------
  {
    id: "referral-note",
    name: "Wellness referral & follow-up notes",
    nodeType: "physical_storage",
    boundary: "agency",
    stageIds: ["partner-referral"],
    description:
      "The written referral and home-care plan: the concern, the treatment done, the recommendation - drafted to travel to a practitioner outside the spa.",
    dataCategoryIds: ["health-declaration", "beauty-consultation", "service-history"],
    accessPersonaIds: ["therapist", "manager-owner"],
    retentionDefined: false,
    riskLevel: "medium",
    businessModels: SPA,
  },
  {
    id: "external-practitioner-file",
    name: "External practitioner's records",
    nodeType: "repository",
    boundary: "third-party",
    stageIds: ["partner-referral"],
    description:
      "The nutritionist's or physiotherapist's own file on the referred customer - a copy of the health concern that now lives in another practice, under its rules.",
    dataCategoryIds: ["health-declaration", "service-history", "identity-contact"],
    accessPersonaIds: ["wellness-referrer"],
    retentionDefined: false,
    riskLevel: "medium",
    businessModels: SPA,
  },

  // ---- Marketing, loyalty & community -------------------------------------
  {
    id: "whatsapp-broadcast",
    name: "WhatsApp broadcast & campaign lists",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["marketing-loyalty"],
    description:
      "The marketing half of the WhatsApp account: broadcast lists built from the customer base, campaign blasts, festival offers - and win-back messages to people who left years ago.",
    dataCategoryIds: ["identity-contact", "marketing-profile", "service-history"],
    accessPersonaIds: ["marketing-social", "front-desk", "manager-owner"],
    shadowIt: true,
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Lists are built from service history - which means a 'slimming package' or 'skin treatment' blast quietly announces what its recipients had done - and opt-outs recorded in one place never reach the copies of the list saved everywhere else.",
    riskAction:
      "Hold one suppression list that every campaign checks before sending, keep service and health categories out of message text and segmentation, and rebuild lists from the live opted-in base rather than old exports.",
  },
  {
    id: "sms-email-platform",
    name: "SMS & email campaign platform",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["marketing-loyalty"],
    description:
      "The bulk-messaging platform holding an uploaded copy of the customer base, its campaign history and its own unsubscribe list - one more parallel version of who your customers are.",
    dataCategoryIds: ["identity-contact", "marketing-profile"],
    accessPersonaIds: ["vendor-support", "marketing-social"],
    retentionDefined: false,
    riskLevel: "medium",
  },
  {
    id: "ad-platform",
    name: "Ad platform custom audiences",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["marketing-loyalty"],
    description:
      "The customer list uploaded to Meta or Google as a custom audience, and the lookalikes built from it - members turned into targeting data.",
    dataCategoryIds: ["identity-contact", "marketing-profile"],
    accessPersonaIds: ["marketing-social", "agency-social-manager", "vendor-support"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "An audience built from a wellness customer base encodes what those people buy - slimming, skin, therapy - into an advertising platform, outlives the campaign it was made for, and is invisible to every opt-out the business processes.",
    riskAction:
      "Upload only what a disclosed choice covers, keep service-category segments out of audience definitions, set audience expiry, and delete uploaded lists when campaigns end.",
  },
  {
    id: "loyalty-program",
    name: "Loyalty & referral platform",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["marketing-loyalty"],
    description:
      "Points, tiers, referral codes - and a vendor-side profile of visit frequency and spend that quietly grades every customer's value.",
    dataCategoryIds: ["membership-appointment", "marketing-profile", "identity-contact"],
    accessPersonaIds: ["vendor-support", "marketing-social"],
    retentionDefined: false,
    riskLevel: "medium",
  },
  {
    id: "member-community-group",
    name: "Members' community WhatsApp group",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["marketing-loyalty"],
    description:
      "The members' group: challenge announcements, streaks, shout-outs - and every member's phone number visible to every other member, forever.",
    dataCategoryIds: ["identity-contact", "transformation-progress", "communication-feedback"],
    accessPersonaIds: ["marketing-social", "trainer-coach", "customer"],
    shadowIt: true,
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Joining the gym should not publish your number to two hundred strangers - yet that is what the group does, and leaving it does not remove what was already posted: the transformation shout-outs, the weight-loss rankings, the tagged photos.",
    riskAction:
      "Use broadcast channels where members cannot see each other, keep names, results and photos out of group posts without a recorded yes, and let people leave the group without leaving the community.",
    businessModels: GYM,
  },
  {
    id: "review-platform",
    name: "Google reviews & ratings",
    nodeType: "system",
    boundary: "public",
    stageIds: ["marketing-loyalty"],
    description:
      "The public review page - the customer's own words about their visit, and the business's replies, which sometimes confirm exactly which treatment the reviewer had.",
    dataCategoryIds: ["communication-feedback", "identity-contact", "service-history"],
    accessPersonaIds: ["marketing-social", "manager-owner"],
    retentionDefined: false,
    riskLevel: "medium",
  },
  {
    id: "franchise-dashboard",
    name: "Franchise & multi-branch platform",
    nodeType: "system",
    boundary: "third-party",
    stageIds: ["registration-membership", "marketing-loyalty", "renewal-exit-archive"],
    description:
      "The chain's shared platform: one customer profile visible across branches - including franchisee branches that are separate legal businesses with their own staff and their own copies.",
    dataCategoryIds: ["identity-contact", "membership-appointment", "service-history", "marketing-profile"],
    accessPersonaIds: ["franchise-staff", "manager-owner", "vendor-support"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "A franchisee is not a department - it is another company reading your customers through a shared dashboard, running its own campaigns on them, and keeping its own export when the franchise agreement ends.",
    riskAction:
      "Scope branch access to that branch's own customers, put data ownership, use and end-of-agreement deletion in the franchise contract, and audit cross-branch reads rather than assuming goodwill.",
  },

  // ---- The archive ---------------------------------------------------------
  {
    id: "old-customer-archive",
    name: "Old customer records & photo archive",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["renewal-exit-archive"],
    description:
      "Where lapsed members and old customers settle: profiles, health forms, measurements, photographs and chat threads, kept 'for repeat bookings' - the fullest record of people with the least relationship to the business.",
    dataCategoryIds: [
      "identity-contact",
      "health-declaration",
      "body-measurements",
      "photos-videos",
      "service-history",
      "marketing-profile",
    ],
    accessPersonaIds: ["manager-owner", "front-desk", "marketing-social"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "Nobody owns ex-customers, so nothing is ever deleted: a health declaration from 2019, a progress photo of someone who cancelled after three months, a bridal album from a marriage since ended - all still reachable, still on campaign lists, still one export from a leak.",
    riskAction:
      "Decide retention per record type, not per person: keep what invoicing genuinely requires, delete health forms, measurements and photographs when the relationship ends, and suppress lapsed customers from marketing by default rather than by request.",
  },
];
