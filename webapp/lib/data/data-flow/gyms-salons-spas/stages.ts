// Customer & service journey - 14 stages in the union, MODEL-GATED to
// 12 / 11 / 12. Spec: docs/SaralPrivacy_GymsSalonsSpas_DataFlow_Spec.md §4.
//
// Every map in this series names its sector's shape before writing stages. A
// candidate's data flows once. A clinic's record outlives the visit. A hotel
// knows where the guest's body is. A pharmacy's parcel announces the diagnosis.
// A lender's product is a judgement about the person.
//
// A GYM, SALON OR SPA IS THE ONLY BUSINESS IN THIS SERIES THAT PHOTOGRAPHS THE
// CUSTOMER'S BODY AND THEN PUBLISHES IT AS MARKETING. Schools publish children's
// faces - that was map #6's signature. This sector goes further: the
// before-and-after image, the progress photograph, the bridal portfolio, the
// skin close-up - a partly-clothed adult body, mid-transformation - is the
// sector's single most effective advertisement, and it is posted to Instagram.
// Consent for it is almost always verbal, taken in the moment, by the person
// holding the phone. That is why `photo-media-library` carries the rank-1
// hotspot rather than a database.
//
// The second half of the signature: THE STAFF MEMBER IS THE SYSTEM, AND THEY
// LEAVE WITH IT. The trainer, the stylist and the therapist ARE the
// relationship. The customer's number is in their personal phone, the
// consultation notes are in their own handwriting, the WhatsApp thread is
// theirs - and when they move to the salon down the road, the client list moves
// with them. No other map in this series has an employee who can walk out with
// the customer base as a matter of routine. Hence `staff-personal-phone` at
// rank 2, spanning six stages.
//
// The three models are genuinely different processes, not one journey with
// different systems (spec §2):
//   gym   - membership contract, a health declaration, a fitness assessment on
//           a body-composition machine, a fingerprint at the turnstile, a
//           trainer, wearables and progress tracking, a member community group,
//           renewals - and a progress-photo ritual.
//   salon - appointment and walk-in, a hair/skin consultation with allergies
//           and patch tests, a colour formula, home services and freelancers,
//           a bridal shoot, before-and-after posts - no turnstile, no wearable.
//   spa   - appointment and package, a health and contraindication intake, a
//           therapist allocation, lockers and CCTV, hotel and corporate
//           partners, external wellness referrals - discretion is the product.
//
// ⚠️ THERE IS NO SUPERSET, AND ONE IS NOT MANUFACTURED (map #8 established that a
// superset is a convention, not a schema rule). A gym does not send a stylist to
// a bride's home; a salon has no biometric turnstile; a spa does not run a
// members' challenge leaderboard. Each variant-specific entity tags itself with
// exactly the models it honestly appears in.
//
// TEN of the fourteen stages are ALL-MODEL. That is load-bearing: all eight
// hotspots sit on eight DISTINCT all-model stages, so the journey's red flags
// reconcile with the hotspot counter by arithmetic in every model (spec §5,
// guard test (a)). Do not gate an all-model stage without re-deriving §5.
//
// ⚠️ SEQUENCE ORDER IS LOAD-BEARING, NOT JUST GATING (learned on map #10). A node
// resolves to the EARLIEST of its stages visible in the selected model, so the
// order has to follow the real order of events. Three orderings here are
// deliberate:
//  · `health-declaration` (3) sits before `assessment-consultation` (4) because
//    the declaration is filled in before anyone measures or examines anything.
//  · `home-freelance` (8) sits directly after `service-delivery` (7) because a
//    home visit IS service delivery that has left the premises - not an
//    afterthought at the end of the journey.
//  · `photo-media` (10) sits after `training-progress` (9) because the
//    before-and-after needs an "after" - the photograph ritual follows the
//    progress record it is meant to prove.
//
// One merge worth recording: the pasted spec's separate "trainer assignment"
// (gym §9.5), "service planning & formula" (salon §10.5) and "consultation &
// therapist allocation" (spa §11.5) are ONE all-model stage here
// (`service-planning`). All three models genuinely decide who will do the work
// and what will be done; the systems on that decision differ completely, which
// is what gating is for.
//
// Per-model counts are DERIVED from this union - one shared array filtered by
// model - so they cannot be set independently. The pasted spec asked for 10
// stages in each of the three variants; the honest derived answer is
// 12 / 11 / 12 (spec §4).

import type { FlowStage } from "../../../data-flow/schemas.ts";

/** Has a turnstile, lockers and CCTV at the door. */
const GYM_SPA = ["gym", "spa"];
const GYM = ["gym"];
const SALON = ["salon"];
const SPA = ["spa"];
/** Keeps a paper appointment diary at the front desk. */
export const SALON_SPA = ["salon", "spa"];

export const GYMS_SALONS_SPAS_STAGES: FlowStage[] = [
  {
    id: "enquiry-booking",
    name: "Enquiry, walk-in & booking",
    sequence: 1,
    summary:
      "The customer arrives long before any record should exist - a website form, an Instagram DM, a WhatsApp message, a phone call, a walk-in, a booking marketplace, a hotel concierge, a corporate tie-up. Within minutes the same person sits in a booking app, a diary, a lead sheet and somebody's own phone.",
    dpdpaNote:
      "Someone asking the price of a package has not agreed to three years of offers. Give a simple notice at the point the enquiry is taken, collect only what the booking needs, keep enquiries off staff members' personal phones, and decide when a lead that never converted is deleted.",
  },
  {
    id: "registration-membership",
    name: "Registration, membership & customer profile",
    sequence: 2,
    summary:
      "The enquiry becomes a record: a membership or registration form, a package, an emergency contact, sometimes a guardian for a minor or a partner on a couple booking - and a profile in the management software that the whole front desk can open, often on one shared login.",
    dpdpaNote:
      "Decide which record is the master and who genuinely needs to open it. An emergency contact is for emergencies, not a marketing lead; a guardian's number is not the member's; and a membership that has expired should not keep an active profile forever. Named logins, not shared ones.",
  },
  {
    id: "health-declaration",
    name: "Health declaration, allergies & contraindications",
    sequence: 3,
    summary:
      "Before any service, the customer declares things a stranger would never be told: medical conditions, injuries, medication, allergies, pregnancy where relevant, contraindications. It is collected on a paper form or a Google Form by someone with no clinical training, and it is routinely readable at the front desk.",
    dpdpaNote:
      "This is high-impact health data even though the business is not a clinic. Collect only what is needed to deliver the service safely, keep the form away from reception chat and sales lists, restrict it to the professional who needs it, update it rather than letting it fossilise, and never use it for promotion.",
  },
  {
    id: "assessment-consultation",
    name: "Fitness assessment & body / beauty consultation",
    sequence: 4,
    summary:
      "The body becomes data. A trainer records weight, BMI and measurements from the body-composition machine; a stylist assesses skin and hair and notes concerns; a therapist writes a wellness consultation. Some of it lands in a vendor's device app, some in a spreadsheet, some in a staff member's own notebook.",
    dpdpaNote:
      "A measurement is about the person, not the machine. Explain what is measured and why, keep assessment records in one governed place rather than notebooks and camera rolls, let the customer see and correct them, and set a retention rule - a body record from years ago is not needed for next week's appointment.",
  },
  {
    id: "service-planning",
    name: "Service planning & staff allocation",
    sequence: 5,
    summary:
      "The business decides who will do the work and what will be done: a workout programme, a colour formula, a treatment plan and therapist allocation. The day's client list, the caution notes and the patch-test results are routinely posted into the staff WhatsApp group so everyone knows the schedule.",
    dpdpaNote:
      "The plan should reach the professional doing the work - not every phone in the building. Keep customer names, health cautions and photographs out of general staff groups, show assistants the minimum the task needs, and keep planning notes factual: they may be read back one day by the customer they describe.",
  },
  {
    id: "access-attendance",
    name: "Entry, attendance, lockers & CCTV",
    sequence: 6,
    summary:
      "The premises record the customer's presence: a fingerprint or face template at the turnstile, an RFID card, a locker assignment, an attendance history - and CCTV that films everyone who walks in. A quiet second record of the customer's routine builds up outside the membership system.",
    dpdpaNote:
      "A biometric template is the one credential a customer cannot replace, so store it only if genuinely needed, delete it when membership ends, and offer a card as an alternative. Place cameras only where safety justifies them - never near changing or treatment areas - set a short retention, and log who views footage.",
    businessModels: GYM_SPA,
  },
  {
    id: "service-delivery",
    name: "Service & treatment delivery",
    sequence: 7,
    summary:
      "The session, the cut, the colour, the massage. Each visit appends to a running service history - what was done, which products were used, how the skin reacted, what the customer prefers - plus the observation the staff member types about the person. Reactions and injuries go into an incident register.",
    dpdpaNote:
      "A service record is legitimate; a permanent character sketch is not. Keep in-service notes factual and minimal, restrict reaction and incident records to the people who need them, and remember the running history is personal data the customer can ask to see, correct - and eventually have deleted.",
  },
  {
    id: "home-freelance",
    name: "Home services, freelancers & bridal work",
    sequence: 8,
    summary:
      "The service leaves the premises. A home visit carries the customer's address; a bridal booking pulls in a freelance makeup artist and a photographer; the consultation notes and the event details travel to people who are not employees, on phones the business does not manage.",
    dpdpaNote:
      "A freelancer is a separate business holding your customer's data. Share the minimum the assignment needs, use business accounts rather than personal ones, put deletion after the event in writing, and never let a customer's wedding photographs become someone else's portfolio without a separate, recorded yes.",
    businessModels: SALON,
  },
  {
    id: "training-progress",
    name: "Training, wearables & progress tracking",
    sequence: 9,
    summary:
      "The relationship becomes a data stream: workouts logged in the app, heart rate synced from a wearable, monthly re-measurements on the body-composition machine, an adherence streak, a progress trend. The member's body now has a longitudinal record spread across machine, app and vendor cloud.",
    dpdpaNote:
      "Make wearable and app connections a genuine choice that can be switched off without losing the membership. Know what each connected tool retains and where, keep progress comparisons between trainer and member rather than on public leaderboards, and give the trend the same deletion route as the membership.",
    businessModels: GYM,
  },
  {
    id: "photo-media",
    name: "Photographs, before-and-after & testimonials",
    sequence: 10,
    summary:
      "The signature moment of this sector. A progress photo, a before-and-after pair, a bridal album, a transformation reel - taken on whoever's phone is nearest, collected into a gallery, shortlisted for Instagram. The customer said yes to a photograph; nobody asked about a channel, a crop or a deadline.",
    dpdpaNote:
      "Capturing an image and publishing it are two different decisions and need two different consents. Record purpose, channel and duration; offer cropped or face-hidden options; make withdrawal easy and act on it everywhere, including the copies with the agency and the photographer; and give raw images a retention date.",
  },
  {
    id: "billing-payments",
    name: "Billing, packages & payments",
    sequence: 11,
    summary:
      "Invoices, package balances, renewals, refunds - and the details that ride along: a medical reason typed into a membership freeze, a treatment named on a hotel folio, a usage report to a corporate programme, a gift voucher linking the buyer to the person treated, a payment screenshot in a WhatsApp thread.",
    dpdpaNote:
      "Keep the money record and the service detail apart. An invoice line does not need to name a treatment a family member will read; finance staff do not need health notes; a freeze reason can be 'medical' without the diagnosis. Financial records have their own retention grounds - the extras riding on them do not.",
  },
  {
    id: "partner-referral",
    name: "Hotel, corporate & wellness referrals",
    sequence: 12,
    summary:
      "The spa's world is joined to other businesses: the hotel whose guest was referred by the concierge, the employer whose wellness programme pays, the nutritionist or physiotherapist the customer is referred to. Treatment summaries and health concerns travel outward to organisations with their own rules.",
    dpdpaNote:
      "Refer on the customer's instruction, share the minimum the referral needs, and keep a note of who received what. The hotel and the employer should see billing, not treatment detail; the practitioner should get the relevant summary, not the whole file - and their copy is one you cannot later delete.",
    businessModels: SPA,
  },
  {
    id: "marketing-loyalty",
    name: "Marketing, loyalty, reviews & community",
    sequence: 13,
    summary:
      "The service history becomes a marketing asset: a WhatsApp broadcast list, an SMS campaign, a loyalty tier, a customer-value band, an audience uploaded to an ad platform, a member community group where every number is visible, a review reply that confirms exactly which treatment somebody had.",
    dpdpaNote:
      "A reminder about tomorrow's appointment and a promotion are different messages needing different choices. Hold one opt-out that every channel respects, keep health, body and service categories out of ad audiences, never confirm a customer's treatment in a public reply, and let people leave the group without leaving the gym.",
  },
  {
    id: "renewal-exit-archive",
    name: "Exit, inactivity, staff departure & archive",
    sequence: 14,
    summary:
      "The membership lapses, the customer stops coming - and almost nothing is deleted. The profile, the health form, the measurements, the photographs and the chat threads settle into an archive kept 'for repeat bookings'. And when a staff member leaves, the client list in their phone leaves with them.",
    dpdpaNote:
      "Retention has to be decided per record, not per person. A tax invoice has grounds to stay; a five-year-old health declaration and a progress photo of a lapsed member do not. Suppress marketing when the relationship ends, delete what has merely never been deleted, and make staff exit a data event: access revoked, copies returned, the customer list stays.",
  },
];
