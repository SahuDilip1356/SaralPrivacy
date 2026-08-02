// Customer & prescription journey - 17 stages in the union, MODEL-GATED to
// 11 / 13 / 15. Spec: docs/SaralPrivacy_Pharmacies_DataFlow_Spec.md §2.
//
// Every map in this series names its sector's shape before writing stages. A
// candidate's data flows once. A CA client's returns every year. A law firm's
// matter file becomes public by design. A hotel knows where the guest's body is.
//
// A PHARMACY IS THE ONLY BUSINESS IN THIS SERIES WHERE THE PRODUCT ITSELF
// DISCLOSES THE DIAGNOSIS. Everywhere else a business holds records ABOUT a
// person and the risk is that the record escapes. Here the record and the
// product are the same object: the strip has the molecule printed on it, the
// label names it again, the invoice line itemises it, the rider's app shows it,
// and the refill reminder repeats it on a phone somebody else may be holding.
// A person can be outed by a parcel left with a neighbour. That is the sector's
// signature, and it is why `delivery` carries the rank-1 hotspot rather than a
// storage system.
//
// The second half of the signature: THE REFILL LOOP MAKES A CHRONIC CONDITION
// INFERABLE WITHOUT ANYONE EVER RECORDING A DIAGNOSIS. Nobody at the counter
// writes down a condition. A 90-day cadence on one molecule states it anyway -
// and that inference is what gets uploaded to an ad platform as an audience.
// Hence `health-inference` as a `derived` category and `refill-marketing` as an
// all-model stage rather than an e-pharmacy footnote.
//
// The three models are genuinely different processes, not one journey with
// different systems (spec §6):
//   retail          - the neighbourhood chemist. The customer is in front of
//                     you, the prescription is a piece of paper or a photograph
//                     on WhatsApp, the record is a billing/POS entry and a
//                     khata ledger, and the delivery boy is someone's cousin.
//                     Everything is close, informal and uncontracted.
//   online          - the customer is never seen. A browsing trail creates a
//                     health inference BEFORE any order exists, the prescription
//                     is uploaded into OCR and extraction tooling, a warehouse
//                     and a logistics aggregator handle a parcel with a
//                     condition on the label, and a recommendation engine turns
//                     purchase history into a longitudinal health profile.
//   chain-hospital  - multi-outlet or hospital-attached. A central patient index
//                     JOINS the hospital encounter, the retail purchase, the
//                     loyalty card and the insurance claim into one profile, and
//                     that profile is visible across outlets and analytics teams
//                     who never met the person.
//
// ⚠️ THERE IS NO SUPERSET, AND ONE IS NOT MANUFACTURED (handoff §3, map #8).
// `chain-hospital` is NOT a superset of `online`: a hospital-linked chain has no
// browsing-inference trail, no prescription-upload OCR pipeline and no app
// account with household profiles, and an e-pharmacy has no central patient
// index, no TPA claim workflow and no controlled-medicine counter register. Each
// variant-specific entity therefore tags itself with exactly the models it
// honestly appears in. `validatePack`'s only model rule is that an edge's models
// be a subset of both endpoints', which this satisfies.
//
// TEN of the seventeen stages are ALL-MODEL. That is load-bearing: all eight
// hotspots sit on eight DISTINCT all-model stages, so the journey's red flags
// reconcile with the hotspot counter by arithmetic in every model (spec §3,
// guard test (a)). Do not gate an all-model stage without re-deriving §3.
//
// Four deliberate choices:
//  · `prescription-intake` is separate from `enquiry` and is all-model. A
//    chemist is handed paper, an e-pharmacy receives an upload, a hospital
//    pharmacy receives an electronic order. Same act - a document naming a
//    person, a prescriber and a molecule enters and is copied - at different
//    moments. Merging it into enquiry would put a top-three hotspot on a
//    channel-specific stage.
//  · `controlled-medicine` is gated to retail + chain-hospital, not online.
//    Indian e-pharmacies do not dispense habit-forming schedules; a counter and
//    a hospital pharmacy do, and both maintain a parallel register that is a
//    REQUIRED RECORD and therefore not freely deletable.
//  · `refill-marketing` is all-model. The retail version - a WhatsApp reminder
//    from the owner's own number, a note in a diary - is the one everybody
//    forgets, and it discloses a condition to whoever picks up the phone.
//  · `dispensing` is all-model and separate from `delivery`. The label is
//    created at dispensing; the disclosure happens when the package leaves.
//
// ⚠️ `stock-transfer` MUST stay SEQUENCED BEFORE `dispensing`. Stock is
// allocated and moved before it is picked, labelled and packed, so that is the
// honest order - but it is also load-bearing. The warehouse system and the pick
// list both span the two stages, and a node resolves to the EARLIEST of its
// stages visible in the model. With `dispensing` first, both resolved onto it
// and `stock-transfer` rendered with no system at all in the online model. The
// §5 script caught it; the ordering is what fixes it.
//
// Per-model counts are DERIVED from this union - one shared array filtered by
// model - so they cannot be set independently. The pasted spec asked for 10
// stages in each of the three variants; the honest derived answer is 11 / 13 /
// 15 (spec §2).

import type { FlowStage } from "../../../data-flow/schemas.ts";

const ONLINE = ["online"];
const CHAIN = ["chain-hospital"];
const COUNTER = ["retail", "chain-hospital"];
const WAREHOUSED = ["online", "chain-hospital"];

export const PHARMACIES_STAGES: FlowStage[] = [
  {
    id: "digital-discovery",
    name: "Search, browsing & medicine-interest tracking",
    sequence: 1,
    summary:
      "Before any order exists, someone searches a symptom, reads a medicine page, compares two brands and abandons a cart. Analytics, advertising tags, a session recorder and a recommendation engine have already turned that into a health-interest segment attached to a device.",
    dpdpaNote:
      "A search for a medicine is a statement about a person's health, and it is being processed before they have bought anything or been given a meaningful choice. Keep the analytics you genuinely need apart from advertising, and do not build audiences out of what someone looked up.",
    businessModels: ONLINE,
  },
  {
    id: "enquiry",
    name: "Enquiry, order request & intake channel",
    sequence: 2,
    summary:
      "The request arrives: a customer at the counter naming a medicine, a phone call, a photograph in a WhatsApp thread, an app order, a hospital discharge instruction or a call-centre ticket. Within minutes the same person exists in a billing system, on a staff member's own handset and in an order queue.",
    dpdpaNote:
      "The medicine being asked for is the health information - you do not need a diagnosis to have collected one. Say what you collect and why at the point of intake, use a number that belongs to the business rather than to a person, and decide how long an enquiry that never became a sale is kept.",
  },
  {
    id: "account-household",
    name: "Account creation & household profiles",
    sequence: 3,
    summary:
      "Registration, OTP verification, saved addresses and a family-profile feature that lets one account order for a spouse, a child and an elderly parent - so one login becomes a container for several people's prescriptions and medicine histories.",
    dpdpaNote:
      "Each person under that account is a separate data principal, and at least one of them never agreed to anything. Keep patient profiles separate rather than storing family members as fields, record who is authorised to act for whom, and support unlinking when that changes.",
    businessModels: ONLINE,
  },
  {
    id: "identity-resolution",
    name: "Central patient index & cross-outlet identity",
    sequence: 4,
    summary:
      "A matching engine decides that the hospital in-patient, the walk-in at the third outlet, the loyalty card and the insurance claim are one person, and merges them into a single central record shared across every branch and the hospital system.",
    dpdpaNote:
      "Joining a clinical encounter to a retail purchase history is a new purpose, not a technical detail. Be able to explain what was combined, keep the clinical and commercial views separate, audit merges, and support correction when the match is simply wrong.",
    businessModels: CHAIN,
  },
  {
    id: "prescription-intake",
    name: "Prescription receipt, upload & extraction",
    sequence: 5,
    summary:
      "The prescription arrives - as paper across the counter, a photograph in a chat, an email attachment, an app upload passed through text extraction, or an electronic order from the hospital system - and is immediately copied into a folder, a queue, a register and somebody's downloads.",
    dpdpaNote:
      "This document names a person, their prescriber and often their condition, and it is the most copied object in the sector. Take it through one controlled channel, decide which copy is the master, and delete the working copies - including the ones from prescriptions you rejected.",
  },
  {
    id: "pharmacist-review",
    name: "Pharmacist review, substitution & validation",
    sequence: 6,
    summary:
      "A pharmacist checks the prescription, resolves what is unclear, substitutes a brand, records a counselling note and either releases or refuses the order - creating a new health-related record that did not exist on the prescription.",
    dpdpaNote:
      "What the pharmacy writes down is personal data it created, not data it received, and a person can ask to see and correct it. Keep notes factual, keep the review to the people whose job it is, and do not let a refusal reason turn into a permanent label.",
  },
  {
    id: "customer-record",
    name: "Customer record & medicine-history creation",
    sequence: 7,
    summary:
      "The sale is written to the billing or pharmacy-management system and a customer record comes into being: name, number, address, every medicine ever bought, who it was for, what is owed on the khata, and a refill date - a health history nobody set out to build.",
    dpdpaNote:
      "A list of what somebody buys is a record of what is wrong with them, held for a purpose - billing - that ended when they paid. Decide how long each part is kept, separate the purchaser from the patient, and restrict who can read a medicine history.",
  },
  {
    id: "billing-payment",
    name: "Billing, payment, invoice & credit ledger",
    sequence: 8,
    summary:
      "Invoices, UPI and card payments, cash-on-delivery records, payment screenshots, the credit ledger naming who still owes for which medicine, and the flow of all of it into accounting and tax systems and a fraud-scoring service.",
    dpdpaNote:
      "An itemised invoice discloses the condition to everyone who receives it, including a family member who paid. Never store card credentials, keep the finance retention clock separate from the customer record, and check who an invoice is actually being sent to.",
  },
  {
    id: "insurance-tpa",
    name: "Insurance, TPA & corporate billing",
    sequence: 9,
    summary:
      "For a hospital-linked or chain pharmacy the bill often goes to somebody else: an insurer, a third-party administrator, a corporate health programme or an employer's desk - each receiving the prescription, the medicine list and the patient's identity to approve or refuse it.",
    dpdpaNote:
      "Every one of these is a separate recipient making its own decisions with the data, and an employer has no business seeing a line-by-line medicine list. Send the minimum each claim genuinely needs, log what was disclosed to whom, and keep refused claims from accumulating unreviewed.",
    businessModels: CHAIN,
  },
  {
    id: "stock-transfer",
    name: "Central inventory, warehouse & branch transfer",
    sequence: 10,
    summary:
      "Order-management, warehouse and central inventory systems allocate stock, move it between outlets and generate pick lists, transfer notes and quality checks - carrying the customer's name and order alongside the medicine wherever it goes.",
    dpdpaNote:
      "Stock movement does not need a patient attached to it. Use an order reference in the systems that only handle inventory, restrict who can export, and destroy printed pick lists rather than leaving them in a bin behind the counter.",
    businessModels: WAREHOUSED,
  },
  {
    id: "dispensing",
    name: "Stock, dispensing, labelling & packing",
    sequence: 11,
    summary:
      "The medicine is picked - off a shelf, off a warehouse rack, out of central stock - checked against the prescription, batch-recorded, labelled with the patient's name and the molecule, and packed. The label is where the record and the product become the same object.",
    dpdpaNote:
      "Everyone who handles the package can read what it is for. Keep patient identity out of stock systems that do not need it, separate the pharmacist's view from the picker's, and treat what is printed on the outside of a package as a disclosure decision.",
  },
  {
    id: "delivery",
    name: "Handover, delivery & last mile",
    sequence: 12,
    summary:
      "The package leaves: handed over the counter, given to a delivery boy with an address written on it, or assigned to an aggregator's rider whose app shows the customer's name, number, address, order value and often the medicine itself. Somebody may collect it who was never meant to know.",
    dpdpaNote:
      "This is the point where the pharmacy's control ends and the disclosure is physical. Use packaging that does not announce the contents, send each partner the minimum they need to deliver, verify who is collecting, and set a retention rule for delivery history and proof-of-delivery photographs.",
  },
  {
    id: "controlled-medicine",
    name: "Controlled & schedule-medicine registers",
    sequence: 13,
    summary:
      "Certain medicines are entered into a separate register - paper, digital or both - naming the patient, the prescriber, the quantity, the pharmacist who dispensed it and the running balance, and kept where it can be produced on inspection.",
    dpdpaNote:
      "These are REQUIRED RECORDS: they exist because other law says they must, and they are therefore not freely deletable. That makes it more important, not less, that access is restricted, that duplicate working copies are not made alongside them, and that the register is physically protected.",
    businessModels: COUNTER,
  },
  {
    id: "refill-marketing",
    name: "Refill reminders, loyalty & marketing",
    sequence: 14,
    summary:
      "Purchase history becomes a refill date, a chronic-user segment, an adherence estimate and a campaign audience - sent as an SMS, a push notification, a WhatsApp message from the owner's own number, or uploaded to an advertising platform as a lookalike audience.",
    dpdpaNote:
      "A reminder that names a medicine discloses a condition to whoever is holding the phone. Keep a service reminder separate from a promotion, get a clear choice for each, hold one suppression list every channel must check, and never build advertising audiences out of health inferences.",
  },
  {
    id: "cross-branch-profiling",
    name: "Cross-outlet history & central analytics",
    sequence: 15,
    summary:
      "Purchases from every outlet, the hospital encounter, the loyalty card and the claim history land in a central warehouse and analytics stack, producing adherence scores, chronic-condition segments, care-gap alerts, customer-value bands and misuse flags.",
    dpdpaNote:
      "This is where commercial analysis and clinical inference stop being distinguishable. Separate the two purposes and the two access lists, be able to explain what was derived about a person, keep a human in any decision that affects them, and support correction of a score as well as a fact.",
    businessModels: CHAIN,
  },
  {
    id: "complaints",
    name: "Returns, complaints & adverse events",
    sequence: 16,
    summary:
      "A wrong medicine, a reaction, a damaged strip or a refund request opens a file - photographs, batch numbers, a description of what happened to somebody's body, a pharmacist's escalation, and a message to the distributor or manufacturer.",
    dpdpaNote:
      "An adverse-event record is the most sensitive thing in the file and the most widely forwarded. Collect the minimum needed to investigate, keep the notes factual, share only what the manufacturer or distributor actually needs, and set a retention period for the photographs.",
  },
  {
    id: "archive",
    name: "Archive, staff devices, vendors & deletion",
    sequence: 17,
    summary:
      "Everything settles: the billing archive, the prescription folder, chat threads, staff phones, paper registers, the khata ledger, accounting records, delivery history, the loyalty list, warehouse and vendor systems, backups - and a medicine history kept because it makes the next sale easier.",
    dpdpaNote:
      "Retention has to be decided per category, not for the customer as a whole. A tax record and a required register have grounds to be kept; a prescription photograph from an order two years ago does not. Separate what you must keep from what you have merely never deleted.",
  },
];
