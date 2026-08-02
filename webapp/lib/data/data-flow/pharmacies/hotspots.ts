// The eight hotspots for a retail chemist, an e-pharmacy or a hospital-linked
// chain, ranked worst-first.
//
// THE COUNT IS DERIVED, NOT CHOSEN (spec §3). Ten of the seventeen stages are
// all-model; eight of them carry a hotspot, and every hotspot node is UNGATED
// with its EARLIEST stage on that distinct all-model stage:
//
//   1 dispensed-package-label .... delivery (12)         5 refill-marketing-platform . refill-marketing (14)
//   2 customer-medicine-history .. customer-record (7)   6 pharmacist-review-record .. pharmacist-review (6)
//   3 prescription-image-store ... prescription-intake(5) 7 pharmacy-archive ......... archive (17)
//   4 staff-phone-whatsapp ....... enquiry (2)           8 complaint-adverse-event-file complaints (16)
//
// ⇒ flags = 8 = counter in retail, online and chain-hospital, by arithmetic
// rather than by anyone checking. See nodes.ts for the two traps specific to
// this pack, and the `hotspots reconcile with the counter` guard test for what
// happens if it stops being true.
//
// The pasted spec proposed 9 + 11 + 12 per-variant hotspots. The counter and
// legend print `pack.hotspots.length`, pack-level and unfiltered, so a per-model
// set would make the counter lie in every view but one. The other twenty-four
// are authored as high- and critical-risk NODES instead - they render in full in
// the journey, the drawer and the table, they simply carry no red flag (spec §3).
//
// Buckets map to lib/data/industry-assessment/packs/pharmacies.ts. All FIVE of
// the pack's buckets are reachable from this rail, and every one of them must
// also appear in the assessment client's BUCKET_FOCUS or the deep-link guard
// test fails.
//
// RANK 1 IS THE SECTOR'S SIGNATURE. A pharmacy is the only business in this
// series where the PRODUCT ITSELF discloses the diagnosis. Everywhere else the
// risk is that a record escapes; here the record and the product are the same
// object, and it is handed to a neighbour, a relative or a rider as the normal
// way of completing the sale. Nothing else in this series can out somebody by
// delivering to them.
//
// ⛔ LANGUAGE LOCKS (spec §8):
//  · "High-impact prescription and health-related data", never "sensitive
//    personal data" - the DPDPA creates no such statutory category.
//  · NO medical, pharmacological, dosage, substitution or drug-interaction
//    advice, and none about drug-licensing or register obligations. Where a
//    record is required under other law, say only that it is a REQUIRED RECORD
//    and therefore not freely deletable.
//  · NO accusation. WhatsApp orders, a photographed prescription, a khata
//    ledger and a delivery boy are how this trade works. Show where control
//    breaks; do not call the trade a violation.

import type { FlowHotspot } from "../../../data-flow/schemas.ts";

export const PHARMACIES_HOTSPOTS: FlowHotspot[] = [
  {
    id: "hs-package-discloses",
    rank: 1,
    nodeId: "dispensed-package-label",
    title: "The package itself tells everyone what the medicine is for",
    whatHappens:
      "The medicine goes out with the molecule printed on the strip, the patient's name and the drug on the dispensing label, an itemised invoice taped to the outside, and the same detail visible in the delivery partner's app. It is handed over a counter to whoever came, left with a neighbour, taken by a relative, or signed for at an office reception.",
    whyItMatters:
      "This is the only business in this series where the product discloses the condition. Every other risk on this map is a record escaping; this one is the record and the product being the same object. A parcel left with the wrong person tells them what someone is being treated for - and nobody involved had to read a file, breach a system or leak a database to find out.",
    dataCategoryIds: ["medicine-order", "customer-identity", "delivery-address", "health-inference"],
    action:
      "Use outer packaging that does not name or reveal the contents, keep the itemised invoice sealed inside rather than on the outside, give the delivery partner an order reference and a masked number instead of a medicine list, and check who is collecting before handing anything over.",
    assessmentBucket: "order_delivery_vendor_sharing",
  },
  {
    id: "hs-medicine-history",
    rank: 2,
    nodeId: "customer-medicine-history",
    title: "The billing record becomes a health history nobody meant to build",
    whatHappens:
      "Every sale is written against a phone number, and over a few years that number accumulates a complete list of what a person has bought and how often. Nobody records a diagnosis. The purchase list states one anyway, and any member of staff can open it by searching the number to take the next payment.",
    whyItMatters:
      "It was collected to raise an invoice, and that purpose ended when the customer paid - but it is now the shop's most valuable asset, so it is never cleared. A refill every ninety days on one molecule is a chronic-illness inference the pharmacy never knowingly collected and cannot easily justify holding. In a neighbourhood shop, the person reading it usually knows the customer and their family.",
    dataCategoryIds: ["medicine-history", "health-inference", "customer-identity", "family-caregiver"],
    action:
      "Decide a retention period for purchase history separately from the tax record and run it on a clock, put full medicine history behind a pharmacist-level permission rather than the billing search everyone uses, and record the purchaser and the patient as different people instead of merging them onto one number.",
    assessmentBucket: "health_indicator_medicine_history",
  },
  {
    id: "hs-prescription-images",
    rank: 3,
    nodeId: "prescription-image-store",
    title: "One prescription photo ends up in five places, including the rejected ones",
    whatHappens:
      "The prescription arrives as an image, and is immediately copied: into the upload store, into a folder on the shop computer, through a text-extraction service, onto the order, into a download so it can be attached to an email, and onto a printout for the file. The scanner keeps its own copy in a default folder nobody has opened.",
    whyItMatters:
      "It is the most copied object in the sector and it names the patient, the prescriber and often the condition in a single image. It exists in five places because it was never collected through one - and the copies of prescriptions that were REFUSED sit alongside the ones that were filled, kept for no purpose at all.",
    dataCategoryIds: ["prescription-image", "prescription", "customer-identity", "family-caregiver"],
    action:
      "Take prescriptions through one upload route, keep one folder per order with named access, strip image metadata on the way in, and delete rejected uploads, scanner copies and downloads on a clock rather than leaving them beside the order.",
    assessmentBucket: "customer_prescription_data",
  },
  {
    id: "hs-staff-phone",
    rank: 4,
    nodeId: "staff-phone-whatsapp",
    title: "The shop's order line is somebody's personal phone",
    whatHappens:
      "The number on the board, the listing and the delivery slip is a staff member's own handset. Orders, prescription photographs, payment screenshots, addresses and 'do you have this' questions arrive there, are answered there and stay there - backed up to a personal cloud account and visible to whoever picks the phone up.",
    whyItMatters:
      "It is the sector's default intake channel and the one place nobody manages. A single thread holds years of prescriptions and medicine requests for named neighbours, on a device the business does not own and an account it cannot see. When the staff member leaves, all of it walks out with them and there is no way to reach it.",
    dataCategoryIds: ["communication-records", "prescription-image", "customer-identity", "medicine-order"],
    action:
      "Move order intake to a number and an account that belong to the business, direct prescription images to one upload route instead of chat, turn off automatic media backup on shop devices, and clear historic threads on a schedule.",
    assessmentBucket: "customer_prescription_data",
  },
  {
    id: "hs-refill-marketing",
    rank: 5,
    nodeId: "refill-marketing-platform",
    title: "The refill reminder announces the condition to whoever holds the phone",
    whatHappens:
      "Purchase history becomes a refill date and a chronic-user segment, and out goes a message naming the medicine - as an SMS, a push notification, or a WhatsApp from the owner's own number. The same segments get uploaded to an advertising platform as audiences, and the campaign keeps running for people who stopped buying years ago.",
    whyItMatters:
      "A message naming a medicine discloses a condition to anyone reading that phone, which in a shared household is the whole point of the complaint that eventually gets made. Marketing permission is usually bundled into the sale, and a withdrawal recorded in the CRM does not reach the uploaded audience, the agency's spreadsheet or the broadcast list on somebody's own handset.",
    dataCategoryIds: ["refill-marketing-profile", "health-inference", "medicine-history", "communication-records"],
    action:
      "Ask separately for service reminders and for promotion, word reminders so they do not name the medicine, keep one suppression list that every channel and agency must check before sending, remove uploaded audiences when someone withdraws, and set an inactivity rule that closes dormant profiles.",
    assessmentBucket: "health_indicator_medicine_history",
  },
  {
    id: "hs-pharmacist-notes",
    rank: 6,
    nodeId: "pharmacist-review-record",
    title: "The notes the pharmacy writes are health data too, and everyone can read them",
    whatHappens:
      "The review creates records that were never on the prescription: the clarification asked of the doctor, the brand substituted and why, the counselling note, and the reason an order was refused. They are written as free text in a hurry, and they sit on the order where the whole console can see them.",
    whyItMatters:
      "This is personal data the pharmacy created about somebody's health, not data it received - and a person can ask to see and correct it. A refusal reason entered once becomes a permanent label attached to that customer, read by everyone who opens the order afterwards, including staff whose job has nothing to do with dispensing.",
    dataCategoryIds: ["medicine-order", "prescription", "allergy-adverse-event", "health-inference"],
    action:
      "Restrict review notes to the dispensing role rather than the shared console, keep them factual and separate observation from opinion, give each note an author and a date, and let a customer see and challenge what was recorded about them.",
    assessmentBucket: "system_staff_access",
  },
  {
    id: "hs-archive-retention",
    rank: 7,
    nodeId: "pharmacy-archive",
    title: "Deleting a customer from the billing system does not delete them",
    whatHappens:
      "Closed orders, old and rejected prescriptions, past customers, refill lists, complaint files and the people who stopped coming years ago all settle into the archive, the folders, the paper file, the backup and the ledger - and stay, because purchase history is what makes the next sale easier.",
    whyItMatters:
      "Most of the people in it have had no relationship with the pharmacy for years. This is where a deletion request quietly fails: removing the customer from the billing screen leaves the prescription folder, the chat thread, the delivery register, the export on the laptop and the backup entirely untouched. It is also where the honest answer is hardest, because some of what is here genuinely must be kept.",
    dataCategoryIds: ["medicine-history", "prescription-image", "customer-identity", "refill-marketing-profile"],
    action:
      "Set a retention period per category - enquiry, prescription image, order, medicine history, financial record, required register - and run it on a clock. Separate what you must keep from what you have merely never deleted, and write down the exceptions so you can explain them.",
    assessmentBucket: "retention_refill_incident",
  },
  {
    id: "hs-adverse-events",
    rank: 8,
    nodeId: "complaint-adverse-event-file",
    title: "An adverse-event report is forwarded further than any other file",
    whatHappens:
      "A reaction or a wrong medicine opens a file: a description of what happened to somebody's body, photographs of the strip and sometimes of the person, the batch number, a pharmacist's escalation and a message to the distributor - which is usually the whole thread forwarded on, identity included.",
    whyItMatters:
      "It is the most detailed health information the pharmacy ever holds, and the one most likely to leave it. A distributor and a manufacturer end up with a named person's reaction on file, under their own rules, when a batch number and a factual account would have done. The photographs, meanwhile, stay on whichever phone took them.",
    dataCategoryIds: ["allergy-adverse-event", "customer-identity", "medicine-order", "communication-records"],
    action:
      "Collect the minimum needed to investigate, keep the notes factual, send the supply chain the batch and the account rather than the customer's identity, remove photographs from personal devices once the file is closed, and set a retention period for the file itself.",
    assessmentBucket: "retention_refill_incident",
  },
];
