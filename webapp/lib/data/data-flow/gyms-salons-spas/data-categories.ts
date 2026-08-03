// Data groups a gym, salon or spa holds. FOURTEEN, not the pasted spec's
// sixty-plus: past ~16 the legend stops communicating and every node renders a
// wall of tags, so fine distinctions (locker numbers, product batches, colour
// codes, call recordings, no-show labels, gift-wrap notes) live in `examples`
// instead. Every one of the spec's §8 ids is covered here. Spec §4.
//
// Four categories do this sector's distinctive work:
//
//  · `photos-videos` is the sector's centre. Nowhere else in the series is the
//    customer's partly-clothed body photographed as a matter of routine and
//    then PUBLISHED as the business's best advertisement. The image is
//    provided data; what is done with it is the rank-1 hotspot.
//  · `health-declaration` and `body-measurements` are kept apart on purpose. A
//    declaration is what the customer TELLS the business (conditions, injuries,
//    allergies, pregnancy); a measurement is what the business RECORDS about
//    the body (weight, BMI, skin analysis). They have different collection
//    points, different access stories and different correction routes.
//  · `transformation-progress` is `derived` - nobody hands over a progress
//    trend. The business manufactures it out of measurements and photographs,
//    and it is the artefact most likely to end up on Instagram.
//  · `family-related` - the emergency contact, the guardian of a minor, the
//    partner on a couple booking, the gift-voucher sender. Most of them never
//    bought anything, and none of them was given a notice.
//
// ⛔ LANGUAGE LOCKS (spec §8): the product label is "High-impact health, body
// and image data", NEVER "sensitive personal data" - the DPDPA creates no such
// statutory category. No medical, fitness, dietary, dermatological or
// therapeutic advice anywhere in these examples: they name what is HELD, never
// what should be done to a body.

import type { DataCategory } from "../../../data-flow/schemas.ts";

export const GYMS_SALONS_SPAS_DATA_CATEGORIES: DataCategory[] = [
  {
    id: "identity-contact",
    name: "Customer identity & contact",
    kind: "provided",
    examples: [
      "Name, mobile number & email",
      "Home address (home services & records)",
      "Date of birth, age band & gender",
      "Customer / member ID & photograph",
      "Preferred branch & language",
    ],
  },
  {
    id: "membership-appointment",
    name: "Membership, package & appointment records",
    kind: "provided",
    examples: [
      "Membership plan, start & expiry dates",
      "Package, sessions remaining & freeze history",
      "Appointment history & preferred staff member",
      "Trial, day-pass & walk-in records",
      "No-show and cancellation history",
    ],
  },
  {
    id: "family-related",
    name: "Emergency contacts, family & related people",
    kind: "provided",
    examples: [
      "Emergency contact name & number",
      "Parent or guardian of a minor member",
      "Partner on a couple or group booking",
      "Gift-voucher sender & recipient",
      "Employer & corporate-programme reference",
    ],
  },
  {
    id: "health-declaration",
    name: "Health declarations & contraindications",
    kind: "provided",
    examples: [
      "Medical conditions & medication declared",
      "Injuries & surgery history",
      "Allergies & patch-test results",
      "Pregnancy status where asked",
      "Treatment contraindications & cautions",
    ],
  },
  {
    id: "body-measurements",
    name: "Body measurements & fitness assessment",
    kind: "provided",
    examples: [
      "Height, weight & BMI",
      "Body-composition & body-fat readings",
      "Girth measurements & posture notes",
      "Strength, mobility & fitness-test results",
      "Fitness goals as stated by the member",
    ],
  },
  {
    id: "beauty-consultation",
    name: "Skin, hair & consultation notes",
    kind: "provided",
    examples: [
      "Skin type, concerns & analysis results",
      "Hair & scalp condition notes",
      "Colour and treatment formulas used",
      "Therapist & wellness consultation notes",
      "Pressure preference & areas to avoid",
    ],
  },
  {
    id: "service-history",
    name: "Service & treatment history",
    kind: "provided",
    examples: [
      "Services and treatments delivered, by date",
      "Products used & recommended",
      "Reactions & outcome notes",
      "Staff observations about the visit",
      "Incident & injury register entries",
    ],
  },
  {
    id: "photos-videos",
    name: "Customer photographs & video",
    kind: "provided",
    examples: [
      "Progress & posture photographs",
      "Before-and-after image pairs",
      "Bridal & event albums",
      "Testimonial and transformation videos",
      "Photo-consent record, channel & expiry",
    ],
  },
  {
    id: "attendance-access",
    name: "Attendance, access & CCTV records",
    kind: "provided",
    examples: [
      "Biometric template at the turnstile",
      "RFID / access-card entry & exit events",
      "Attendance history & visit frequency",
      "Locker assignment records",
      "CCTV footage of the premises",
    ],
  },
  {
    id: "fitness-tracking",
    name: "Workout, wearable & app activity",
    kind: "provided",
    examples: [
      "Workout plans & session logs",
      "Wearable data synced to the member app",
      "Heart-rate & activity readings",
      "Challenge participation & streaks",
      "Smart-equipment usage records",
    ],
  },
  {
    id: "payment-financial",
    name: "Payments, invoices & billing",
    kind: "provided",
    examples: [
      "Invoices, receipts & refunds",
      "Payment method & transaction reference",
      "Package balance & outstanding amounts",
      "Freeze and cancellation reasons",
      "Hotel-folio & corporate billing entries",
    ],
  },
  {
    id: "communication-feedback",
    name: "Messages, reviews & complaints",
    kind: "provided",
    examples: [
      "WhatsApp & DM threads with the business",
      "Booking confirmations & reminders",
      "Reviews & ratings posted publicly",
      "Complaints & their resolution notes",
      "Payment screenshots shared in chat",
    ],
  },
  {
    id: "transformation-progress",
    name: "Progress trends & transformation records",
    kind: "derived",
    examples: [
      "Weight & body-composition trend over time",
      "Before-and-after comparison sets",
      "Adherence & attendance streaks",
      "Transformation stories drafted for marketing",
      "Challenge rankings & leaderboards",
    ],
  },
  {
    id: "marketing-profile",
    name: "Marketing segments & customer value",
    kind: "derived",
    examples: [
      "Customer-value band & spend tier",
      "Churn-risk and win-back segments",
      "Campaign lists & channel preferences",
      "Advertising audiences uploaded to platforms",
      "Rebooking-likelihood and no-show labels",
    ],
  },
];
