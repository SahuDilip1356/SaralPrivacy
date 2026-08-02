// Systems, repositories, devices, physical stores and people that hold customer
// and prescription data in a typical Indian retail chemist, e-pharmacy or
// hospital-linked pharmacy chain - NOT any specific business's environment
// (reference-model rule).
//
// Real things are named - the billing/POS software the counter searches by
// phone number, the prescription photograph in a WhatsApp thread, the scanner's
// local folder, the khata credit ledger, the distributor's ordering portal, the
// warehouse pick list, the aggregator's rider app, the schedule register in the
// cupboard, the refill reminder sent from the owner's own number, the TPA claim
// portal - because a generic "pharmacy management system" fails the "that's my
// shop" test. Storage, devices and chat channels are SPANNING nodes: they
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
//   staff-phone-whatsapp ...... enquiry (2)            dispensed-package-label .. delivery (12)
//   prescription-image-store .. prescription-intake(5) refill-marketing-platform  refill-marketing (14)
//   pharmacist-review-record .. pharmacist-review (6)  complaint-adverse-event-file complaints (16)
//   customer-medicine-history . customer-record (7)    pharmacy-archive ......... archive (17)
//
// A hotspot node may span LATER stages - the medicine history genuinely does -
// but must never acquire an EARLIER one. Two traps specific to this pack:
//  · `staff-phone-whatsapp` must NOT list `digital-discovery` (sequence 1,
//    online-only). Adding it would move the flag off `enquiry` in the online
//    model alone, and break reconciliation in exactly one of three views.
//  · `prescription-image-store` must NOT list `enquiry`. The photograph really
//    does arrive in the WhatsApp thread first - that is what
//    `staff-phone-whatsapp` is for - and the image STORE is where it lands at
//    `prescription-intake`. Giving the store an `enquiry` stage would collide
//    the two flags.
//
// Deliberately NOT hotspots, because they sit on model-gated stages: the
// browsing and ad-tech trail, the text-extraction vendor, the household account,
// the central patient index, the TPA claim portal, the warehouse pick list, the
// aggregator's rider app, the controlled-medicine register and the central data
// warehouse. Each is authored as a high- or critical-risk node instead, and
// renders in full wherever it exists (spec §3).
//
// Risk ratio is deliberately controlled: no fearmongering. If most of the map is
// red, nothing is.

import type { FlowNode } from "../../../data-flow/schemas.ts";

const RETAIL = ["retail"];
const ONLINE = ["online"];
const CHAIN = ["chain-hospital"];
/** Has a physical counter and a schedule register: chemist and chain outlet. */
const COUNTER = ["retail", "chain-hospital"];
/** Ships from a warehouse or central stock rather than off the shelf. */
const WAREHOUSED = ["online", "chain-hospital"];

export const PHARMACIES_NODES: FlowNode[] = [
  // ---- The people ---------------------------------------------------------
  {
    id: "customer",
    name: "Customer / patient",
    nodeType: "person",
    boundary: "candidate",
    stageIds: ["enquiry", "prescription-intake", "customer-record", "billing-payment", "delivery", "complaints"],
    description:
      "The data principal. One prescription and one medicine history - everything below is a copy, a derivative or something the pharmacy worked out about them.",
    dataCategoryIds: ["customer-identity", "prescription", "medicine-order", "payment-financial"],
    accessPersonaIds: ["customer"],
    retentionDefined: true,
    riskLevel: "low",
  },
  {
    id: "family-caregiver-person",
    name: "Family member, caregiver or child",
    nodeType: "person",
    boundary: "candidate",
    stageIds: ["enquiry", "prescription-intake", "customer-record", "billing-payment", "delivery", "refill-marketing"],
    description:
      "The son who collects, the parent ordering for a child, the spouse whose number is on the account, the carer for an elderly patient. Their details sit inside somebody else's record and almost none of them are tracked as separate people.",
    dataCategoryIds: ["family-caregiver", "customer-identity", "prescription", "delivery-address"],
    accessPersonaIds: ["family-caregiver", "counter-staff", "pharmacist"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "A relative who collects a prescription is a data principal who never dealt with you, and a patient whose medicine is bought by someone else is disclosed to that person by the transaction itself. Both sit in the file as fields on another person's record, so a request from either has nothing to search on.",
    riskAction:
      "Record the purchaser and the patient as separate people rather than merging them onto one phone number, and note who is authorised to collect for whom instead of assuming whoever turns up is entitled to the medicine.",
  },
  {
    id: "pharmacist-person",
    name: "Registered pharmacist",
    nodeType: "person",
    boundary: "agency",
    stageIds: ["prescription-intake", "pharmacist-review", "dispensing", "controlled-medicine", "complaints"],
    description:
      "Reviews the prescription, decides on substitution, dispenses and signs the register. The one role that genuinely needs the whole picture - and, in most shops, not the only role that can see it.",
    dataCategoryIds: ["prescription", "medicine-order", "controlled-medicine", "allergy-adverse-event"],
    accessPersonaIds: ["pharmacist", "owner-manager"],
    retentionDefined: false,
    riskLevel: "medium",
  },
  {
    id: "counter-staff-person",
    name: "Counter, billing & sales staff",
    nodeType: "person",
    boundary: "agency",
    stageIds: ["enquiry", "customer-record", "billing-payment", "dispensing", "delivery"],
    description:
      "Takes the request, searches the customer by phone number, operates the billing software and prints the invoice - and can read every medicine that person has ever bought while doing it.",
    dataCategoryIds: ["customer-identity", "medicine-history", "payment-financial", "staff-access-record"],
    accessPersonaIds: ["counter-staff", "owner-manager"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Searching a customer to take a payment opens their entire medicine history on the same screen. In a neighbourhood shop the person reading it often knows the customer, their family and their neighbours personally.",
    riskAction:
      "Restrict the billing view to the current transaction and put full medicine history behind a separate permission that only the pharmacist and the owner hold.",
    businessModels: COUNTER,
  },
  {
    id: "owner-manager-person",
    name: "Proprietor / pharmacy manager",
    nodeType: "person",
    boundary: "agency",
    stageIds: ["customer-record", "refill-marketing", "complaints", "archive"],
    description:
      "Runs the shop or the outlet, holds every login and every export, and is usually the person who sends the refill reminders personally from their own number.",
    dataCategoryIds: ["medicine-history", "refill-marketing-profile", "staff-access-record", "customer-identity"],
    accessPersonaIds: ["owner-manager"],
    retentionDefined: false,
    riskLevel: "medium",
  },
  {
    id: "warehouse-staff-person",
    name: "Warehouse, picking & packing staff",
    nodeType: "person",
    boundary: "agency",
    stageIds: ["stock-transfer", "dispensing"],
    description:
      "Picks, labels, packs and quality-checks orders from a sheet naming the patient and the medicine - frequently temporary or contract staff working on shared accounts.",
    dataCategoryIds: ["customer-identity", "medicine-order", "staff-access-record"],
    accessPersonaIds: ["warehouse-staff", "it-admin"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "A picker needs to match a medicine to an order, not to know whose it is or what it is for. The sheet in their hand usually gives them both, and their account is often shared and rarely reviewed.",
    riskAction:
      "Print an order reference rather than a patient name on pick lists, and give the identity view only to the pharmacist who releases the order.",
    businessModels: WAREHOUSED,
  },
  {
    id: "support-agent-person",
    name: "Customer support & call-centre staff",
    nodeType: "person",
    boundary: "agency",
    stageIds: ["enquiry", "complaints", "refill-marketing"],
    description:
      "Handles order queries, complaints and returns, opening tickets with prescriptions attached and seeing the order and medicine history of anyone who calls.",
    dataCategoryIds: ["communication-records", "medicine-order", "allergy-adverse-event", "prescription"],
    accessPersonaIds: ["support-staff", "it-admin"],
    retentionDefined: false,
    riskLevel: "medium",
    businessModels: WAREHOUSED,
  },
  {
    id: "own-delivery-person",
    name: "Own delivery staff",
    nodeType: "person",
    boundary: "agency",
    stageIds: ["delivery"],
    description:
      "The shop's own delivery boy or driver, carrying the address on a slip, the customer's number in their own contacts and a package with the medicine named on it.",
    dataCategoryIds: ["delivery-address", "customer-identity", "medicine-order", "payment-financial"],
    accessPersonaIds: ["delivery-staff", "owner-manager"],
    retentionDefined: false,
    riskLevel: "medium",
    businessModels: COUNTER,
  },
  {
    id: "prescriber-person",
    name: "Doctor, clinic & hospital",
    nodeType: "person",
    boundary: "third-party",
    stageIds: ["prescription-intake", "pharmacist-review", "complaints"],
    description:
      "The prescriber whose name, registration and clinic appear on every prescription the pharmacy stores, and who is contacted when something on it is unclear. A data principal in this map too, who never chose to be in the pharmacy's systems.",
    dataCategoryIds: ["prescription", "medicine-order", "allergy-adverse-event"],
    accessPersonaIds: ["prescriber", "pharmacist"],
    retentionDefined: false,
    riskLevel: "medium",
  },
  {
    id: "corporate-employer-desk",
    name: "Employer & corporate health programme",
    nodeType: "system",
    boundary: "client",
    stageIds: ["insurance-tpa", "billing-payment"],
    description:
      "The company scheme that pays for an employee's medicines and receives the paperwork - which is how an employer ends up holding an itemised record of what a member of staff takes.",
    dataCategoryIds: ["insurance-corporate", "medicine-order", "customer-identity", "payment-financial"],
    accessPersonaIds: ["corporate-employer", "finance-staff"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "An employer needs to know that a claim is valid and what it cost. An itemised medicine list tells them what an employee is being treated for, and it lands with people who manage that employee.",
    riskAction:
      "Send the employer an amount and a claim reference rather than a medicine list, and keep the itemised detail with the insurer or administrator who actually needs it.",
    businessModels: CHAIN,
  },
  {
    id: "ex-staff-device",
    name: "Former staff member's phone & exports",
    nodeType: "device",
    boundary: "third-party",
    stageIds: ["refill-marketing", "archive"],
    description:
      "The counter assistant or support agent who has left, still holding a customer export, a synced contact list and a WhatsApp history full of prescription photographs.",
    dataCategoryIds: ["prescription-image", "customer-identity", "medicine-history", "communication-records"],
    accessPersonaIds: ["ex-staff"],
    shadowIt: true,
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "Nothing about leaving a job removes the customer list from a personal phone. Prescriptions, numbers and medicine histories walk out with the person, and the pharmacy has no way to reach any of it.",
    riskAction:
      "Close every account and shared login on the last day, keep customer contact in a system rather than in personal handsets, and make return and deletion of exports an explicit condition of leaving.",
  },

  // ---- Stage 1 · Search, browsing & medicine-interest tracking (online) ----
  {
    id: "pharmacy-app-website",
    name: "E-pharmacy app & website",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["digital-discovery", "enquiry", "account-household", "prescription-intake"],
    description:
      "The storefront: search, medicine pages, cart, account and prescription upload. The one intake in this model where the notice, the fields and the tracking are yours to set.",
    dataCategoryIds: ["digital-behaviour", "customer-identity", "medicine-order", "prescription-image"],
    accessPersonaIds: ["it-admin", "marketing-staff", "support-staff"],
    retentionDefined: false,
    riskLevel: "medium",
    businessModels: ONLINE,
  },
  {
    id: "web-analytics-adtech",
    name: "Analytics & advertising tags",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["digital-discovery", "refill-marketing"],
    description:
      "Analytics, advertising pixels and the tag manager that fire on every medicine page - reporting the search, the page and the completed order back to platforms that build audiences out of them.",
    dataCategoryIds: ["digital-behaviour", "health-inference", "customer-identity", "refill-marketing-profile"],
    accessPersonaIds: ["marketing-staff", "vendor-staff"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "A symptom search and a medicine page view are statements about a person's health, and these tags send them to advertising platforms before any order exists and before the person has made a meaningful choice about it.",
    riskAction:
      "Separate the analytics you need to run the shop from advertising tags, keep medicine and symptom pages out of ad audiences entirely, and give a real control over tracking rather than a banner that only accepts.",
    businessModels: ONLINE,
  },
  {
    id: "session-recording-tool",
    name: "Session recording & heatmap tool",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["digital-discovery"],
    description:
      "Records what the visitor did on the page - the searches typed, the products opened, the cart filled and abandoned - and replays it for the growth team.",
    dataCategoryIds: ["digital-behaviour", "health-inference", "customer-identity"],
    accessPersonaIds: ["marketing-staff", "vendor-staff"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "The replay captures somebody typing a symptom or a medicine name into a search box, which is far more than the page-view statistic the tool was bought for.",
    riskAction:
      "Mask search and form inputs by default, exclude prescription and account pages from recording, and set a short retention period on the recordings.",
    businessModels: ONLINE,
  },
  {
    id: "recommendation-engine",
    name: "Recommendation & personalisation engine",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["digital-discovery", "refill-marketing"],
    description:
      "Turns browsing and purchase history into 'customers also bought' suggestions, therapy-area affinities and a predicted next order.",
    dataCategoryIds: ["health-inference", "medicine-history", "digital-behaviour", "refill-marketing-profile"],
    accessPersonaIds: ["marketing-staff", "vendor-staff", "it-admin"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "A recommendation built from medicine history is a health inference presented on screen, and it can be seen by anyone using the device or the shared account.",
    riskAction:
      "Keep recommendations off condition-revealing categories, work from the ordering profile rather than the whole household's history, and let people turn personalisation off.",
    businessModels: ONLINE,
  },
  {
    id: "marketplace-platform",
    name: "Marketplace & aggregator listing",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["enquiry", "billing-payment", "delivery"],
    description:
      "The medicine marketplace or quick-commerce platform the order actually arrived through - which collected the customer, set the terms and keeps its own copy of everything.",
    dataCategoryIds: ["customer-identity", "medicine-order", "delivery-address", "payment-financial"],
    accessPersonaIds: ["vendor-staff", "support-staff"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "A large share of orders are collected under somebody else's notice, on terms the pharmacy did not write. Deleting your copy leaves theirs untouched, and it holds the medicine list as well as the address.",
    riskAction:
      "Read what the platform's contract actually permits, pull only the fields you need into your own systems, decide which record is your master, and tell customers plainly which parts you cannot reach.",
    businessModels: ONLINE,
  },

  // ---- Stage 2 · Enquiry, order request & intake channel (all models) ------
  {
    id: "staff-phone-whatsapp",
    name: "Staff phone & WhatsApp order threads",
    nodeType: "device",
    boundary: "agency",
    stageIds: ["enquiry", "prescription-intake", "delivery", "refill-marketing", "archive"],
    description:
      "The number on the shop board is somebody's personal handset. Orders, prescription photographs, payment screenshots, addresses and 'is this available' questions arrive there and stay there - backed up to a personal cloud account, visible to whoever picks the phone up.",
    dataCategoryIds: ["communication-records", "prescription-image", "customer-identity", "medicine-order"],
    accessPersonaIds: ["counter-staff", "owner-manager", "pharmacist", "support-staff"],
    shadowIt: true,
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "It is the sector's default intake channel and the one place nobody manages. A thread holds years of prescriptions and medicine requests for named neighbours, on a device the business does not own, syncing to an account it cannot see, and travelling out of the door when the staff member leaves.",
    riskAction:
      "Move order intake to a number and an account that belong to the business, keep prescription images out of personal chat by directing them to one upload route, turn off automatic media backup on shop devices, and clear historic threads on a schedule.",
  },
  {
    id: "counter-order-slip",
    name: "Counter slip, order book & token",
    nodeType: "physical_storage",
    boundary: "agency",
    stageIds: ["enquiry", "dispensing"],
    description:
      "The paper the request is written on while the customer waits - name, number, medicine, whether it has to be ordered in - left on the counter where the next customer in the queue can read it.",
    dataCategoryIds: ["customer-identity", "medicine-order", "prescription"],
    accessPersonaIds: ["counter-staff", "pharmacist", "owner-manager"],
    retentionDefined: false,
    riskLevel: "medium",
    businessModels: COUNTER,
  },
  {
    id: "call-recording-system",
    name: "Order line & call recording",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["enquiry", "complaints"],
    description:
      "The order and support line, with calls recorded for quality - which means a recording of somebody saying out loud which medicine they need and who it is for.",
    dataCategoryIds: ["communication-records", "customer-identity", "medicine-order", "prescription"],
    accessPersonaIds: ["support-staff", "vendor-staff", "owner-manager"],
    retentionDefined: false,
    riskLevel: "medium",
    businessModels: WAREHOUSED,
  },
  {
    id: "order-queue-system",
    name: "Order queue & fulfilment console",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["enquiry", "pharmacist-review", "dispensing"],
    description:
      "Where incoming orders sit waiting to be checked, verified and released - the shared screen the operations team works from all day.",
    dataCategoryIds: ["medicine-order", "customer-identity", "prescription", "staff-access-record"],
    accessPersonaIds: ["support-staff", "pharmacist", "warehouse-staff", "it-admin"],
    retentionDefined: false,
    riskLevel: "medium",
    businessModels: WAREHOUSED,
  },
  {
    id: "hospital-information-system",
    name: "Hospital & clinic information system",
    nodeType: "system",
    boundary: "third-party",
    stageIds: ["enquiry", "identity-resolution", "prescription-intake", "insurance-tpa"],
    description:
      "The hospital or clinic system that sends the electronic prescription, the encounter reference and often the diagnosis behind it into the attached pharmacy.",
    dataCategoryIds: ["prescription", "customer-identity", "insurance-corporate", "health-inference"],
    accessPersonaIds: ["prescriber", "pharmacist", "it-admin"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "What arrives is a clinical record, not a shopping list. It carries the reason for the prescription into a retail environment whose staff have no need for it and whose access controls were never designed for it.",
    riskAction:
      "Take the fields the pharmacy needs to dispense and leave the diagnosis behind, and keep the clinical view separate from the counter and loyalty views.",
    businessModels: CHAIN,
  },

  // ---- Stage 3 · Account creation & household profiles (online) ------------
  {
    id: "customer-account-service",
    name: "Customer account & household profiles",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["account-household", "refill-marketing"],
    description:
      "Registration, saved addresses and the family-profile feature that lets one login order for a spouse, a child and an elderly parent - so one account becomes a container for several people's prescriptions.",
    dataCategoryIds: ["customer-identity", "family-caregiver", "delivery-address", "medicine-history"],
    accessPersonaIds: ["support-staff", "it-admin", "marketing-staff"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Everyone under the account can see everyone else's medicine history, and at least one of them - a child, an elderly parent - never agreed to anything. A shared device makes the disclosure automatic.",
    riskAction:
      "Give each patient their own profile with its own visibility rather than storing family members as fields, record who is authorised to order for whom, and allow a profile to be unlinked.",
    businessModels: ONLINE,
  },
  {
    id: "otp-identity-vendor",
    name: "OTP & authentication provider",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["account-household"],
    description:
      "The SMS and verification service that proves the number belongs to the person registering, and keeps a log of every attempt.",
    dataCategoryIds: ["customer-identity", "communication-records", "staff-access-record"],
    accessPersonaIds: ["vendor-staff", "it-admin"],
    retentionDefined: true,
    riskLevel: "low",
    businessModels: ONLINE,
  },

  // ---- Stage 4 · Central patient index & cross-outlet identity (chain) -----
  {
    id: "central-patient-index",
    name: "Central patient & customer index",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["identity-resolution", "customer-record", "cross-branch-profiling"],
    description:
      "The matching engine that decides the hospital in-patient, the walk-in at the third outlet, the loyalty member and the claimant are one person - and merges them into a single record every branch can open.",
    dataCategoryIds: ["customer-identity", "medicine-history", "insurance-corporate", "family-caregiver"],
    accessPersonaIds: ["it-admin", "analytics-staff", "pharmacist", "counter-staff"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "It joins a clinical encounter to a shopping history and makes the result visible across outlets to staff who never met the person. A wrong merge puts one patient's medicines into another's record, and a shared household number is exactly the kind of thing that causes one.",
    riskAction:
      "Write down the matching rules, audit merges and keep them reversible, hold the clinical and commercial views behind separate permissions, and support correction and unlinking when a match is wrong.",
    businessModels: CHAIN,
  },
  {
    id: "loyalty-programme",
    name: "Loyalty & membership programme",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["identity-resolution", "refill-marketing", "cross-branch-profiling"],
    description:
      "The card or app that links purchases across every outlet to one member number, awards points on medicine spend and feeds the campaign engine.",
    dataCategoryIds: ["refill-marketing-profile", "medicine-history", "customer-identity", "health-inference"],
    accessPersonaIds: ["marketing-staff", "counter-staff", "analytics-staff"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "A loyalty scheme designed for basket value ends up holding a cross-outlet medicine history, and the marketing team that works from it sees a record originally collected to dispense a prescription.",
    riskAction:
      "Keep the loyalty record to spend and points rather than the medicine line items, and give the marketing team a segment rather than the underlying purchase history.",
    businessModels: CHAIN,
  },

  // ---- Stage 5 · Prescription receipt, upload & extraction (all models) ----
  {
    id: "prescription-image-store",
    name: "Prescription images & upload store",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["prescription-intake", "pharmacist-review", "dispensing", "archive"],
    description:
      "Where the photograph of the prescription lands and multiplies: the upload bucket, the folder on the shop computer, the copy attached to the order, the one downloaded to answer a query, and the print that goes into the file.",
    dataCategoryIds: ["prescription-image", "prescription", "customer-identity", "family-caregiver"],
    accessPersonaIds: ["pharmacist", "counter-staff", "support-staff", "it-admin"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "It is the most copied object in the sector and the one that names the prescriber, the patient and often the condition in a single image. It exists in five places at once because it was never collected through one, and the copies from prescriptions that were REFUSED are kept alongside the ones that were filled.",
    riskAction:
      "Take prescriptions through one upload route, keep one folder per order with named access, strip image metadata on the way in, and delete rejected uploads and working copies on a clock rather than leaving them beside the order.",
  },
  {
    id: "prescription-upload-portal",
    name: "Prescription upload & verification queue",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["prescription-intake"],
    description:
      "The upload step in the app and the queue behind it, where an order waits for a prescription to be attached, read and either accepted or refused.",
    dataCategoryIds: ["prescription-image", "prescription", "medicine-order", "customer-identity"],
    accessPersonaIds: ["support-staff", "pharmacist", "it-admin"],
    retentionDefined: false,
    riskLevel: "medium",
    businessModels: ONLINE,
  },
  {
    id: "ocr-extraction-vendor",
    name: "Text-extraction & classification service",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["prescription-intake"],
    description:
      "The tooling that reads the uploaded image and pulls out the prescriber, the patient, the date and the medicine list so the order can be matched automatically.",
    dataCategoryIds: ["prescription-image", "prescription", "customer-identity", "health-inference"],
    accessPersonaIds: ["vendor-staff", "it-admin"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "The whole prescription image leaves the pharmacy to be read by a third party, including the parts of it nobody needed. Extraction that gets a name or a medicine wrong writes an error into the patient's record, and images retained by the service are outside anyone's deletion routine.",
    riskAction:
      "Use a processor under contract with retention and no reuse of the images for model training, send the minimum region of the image where that is possible, require a pharmacist to confirm every extracted field, and log corrections.",
    businessModels: ONLINE,
  },
  {
    id: "prescription-scanner",
    name: "Counter scanner & print queue",
    nodeType: "device",
    boundary: "agency",
    stageIds: ["prescription-intake", "controlled-medicine"],
    description:
      "The scanner or multifunction printer that copies the paper prescription - keeping its own copy in local memory and in a default folder nobody has ever opened.",
    dataCategoryIds: ["prescription-image", "prescription", "customer-identity"],
    accessPersonaIds: ["counter-staff", "pharmacist", "it-admin"],
    retentionDefined: false,
    riskLevel: "medium",
    businessModels: COUNTER,
  },
  {
    id: "physical-prescription-file",
    name: "Prescription file & paper records",
    nodeType: "physical_storage",
    boundary: "agency",
    stageIds: ["prescription-intake", "controlled-medicine", "archive"],
    description:
      "The spike, the folder and the box behind the counter holding the paper prescriptions, arranged by date and kept because nobody decided otherwise.",
    dataCategoryIds: ["prescription", "customer-identity", "controlled-medicine", "family-caregiver"],
    accessPersonaIds: ["pharmacist", "counter-staff", "owner-manager"],
    retentionDefined: false,
    riskLevel: "medium",
    businessModels: COUNTER,
  },
  {
    id: "shared-email-inbox",
    name: "Shared shop email inbox",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["prescription-intake", "complaints", "archive"],
    description:
      "The one address the whole shop uses, holding prescriptions sent as attachments, complaint threads, distributor correspondence and years of everything else, on a login several people share.",
    dataCategoryIds: ["prescription-image", "communication-records", "allergy-adverse-event", "staff-access-record"],
    accessPersonaIds: ["owner-manager", "counter-staff", "support-staff", "vendor-staff"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "A shared mailbox is a permanent, searchable archive of attachments that everyone can open and nobody owns, and a departing staff member's access to it is the thing most often forgotten.",
    riskAction:
      "Give each person their own account with a shared alias rather than a shared password, move prescription attachments out of mail and into the order, and review who still has access every quarter.",
  },

  // ---- Stage 6 · Pharmacist review, substitution & validation (all) --------
  {
    id: "pharmacist-review-record",
    name: "Pharmacist review notes & decisions",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["pharmacist-review", "dispensing", "archive"],
    description:
      "What the pharmacy writes down rather than receives: the validity decision, the clarification asked of the doctor, the substitution and why, the counselling note, and the reason an order was refused.",
    dataCategoryIds: ["medicine-order", "prescription", "allergy-adverse-event", "health-inference"],
    accessPersonaIds: ["pharmacist", "support-staff", "owner-manager", "counter-staff"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "This is new personal data the pharmacy created about somebody's health, and it usually reads as free text written in a hurry. A refusal reason recorded once becomes a permanent label on the customer, visible to everyone who opens the order.",
    riskAction:
      "Keep the notes factual and separate observation from opinion, restrict them to the dispensing role rather than the whole console, and let a customer see and challenge what was recorded about them.",
  },
  {
    id: "clinical-rules-engine",
    name: "Automated prescription checks",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["pharmacist-review"],
    description:
      "The rules layer that flags an order for manual review - an expired prescription, a quantity that does not match, a repeat too soon, a mismatch between the upload and the basket.",
    dataCategoryIds: ["prescription", "medicine-order", "health-inference", "medicine-history"],
    accessPersonaIds: ["pharmacist", "vendor-staff", "it-admin"],
    retentionDefined: false,
    riskLevel: "medium",
    businessModels: WAREHOUSED,
  },

  // ---- Stage 7 · Customer record & medicine-history creation (all) ---------
  {
    id: "customer-medicine-history",
    name: "Customer master & medicine history",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["customer-record", "billing-payment", "refill-marketing", "cross-branch-profiling", "archive"],
    description:
      "The customer record the billing system builds without anyone deciding to: name, number, address, who the medicine was for, and every item ever bought against that number, going back to the first sale.",
    dataCategoryIds: ["medicine-history", "customer-identity", "health-inference", "family-caregiver"],
    accessPersonaIds: ["counter-staff", "pharmacist", "owner-manager", "marketing-staff", "analytics-staff"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "Nobody records a diagnosis and nobody has to: a list of what a person buys, and how often, states the condition anyway. It was collected to raise an invoice, that purpose ended when they paid, and it is now the shop's most valuable marketing asset - readable by whoever is on the counter.",
    riskAction:
      "Decide a retention period for purchase history separately from the tax record, put full history behind a pharmacist-level permission instead of the billing search, and keep the purchaser and the patient as different people rather than one phone number.",
  },
  {
    id: "khata-credit-ledger",
    name: "Khata & credit ledger",
    nodeType: "physical_storage",
    boundary: "agency",
    stageIds: ["customer-record", "billing-payment", "archive"],
    description:
      "The book, or the sheet, recording who is buying on credit and what they still owe - line by line, medicine by medicine, name by name, kept open on the counter.",
    dataCategoryIds: ["payment-financial", "medicine-history", "customer-identity", "family-caregiver"],
    accessPersonaIds: ["owner-manager", "counter-staff"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "It pairs a named neighbour with the medicines they buy and the fact that they cannot pay for them yet, in a book that sits in the open and is never closed off.",
    riskAction:
      "Record credit against an amount and a bill number rather than an itemised medicine list, and keep the ledger out of sight of the counter queue.",
    businessModels: RETAIL,
  },
  {
    id: "customer-notebook-spreadsheet",
    name: "Customer notebook & spreadsheet",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["customer-record", "refill-marketing"],
    description:
      "The parallel list kept outside the billing software - regular customers, their usual medicines, when they are next due - in a notebook or a spreadsheet on the shop computer.",
    dataCategoryIds: ["medicine-history", "customer-identity", "refill-marketing-profile", "health-inference"],
    accessPersonaIds: ["owner-manager", "counter-staff"],
    shadowIt: true,
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "It is a second customer database nobody counts, holding exactly the information the shop finds most useful - who is on long-term medication - with no access control and no retention rule at all.",
    riskAction:
      "Fold the list back into the billing system where it can be controlled and cleared, and stop maintaining a shadow copy on the desktop.",
    businessModels: RETAIL,
  },

  // ---- Stage 8 · Billing, payment, invoice & credit ledger (all models) ----
  {
    id: "billing-pos-system",
    name: "Billing, POS & pharmacy-management software",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["customer-record", "billing-payment", "dispensing", "controlled-medicine", "archive"],
    description:
      "The system the whole shop runs on: search a customer by phone number, add the medicines, take the payment, print the bill, and record the batch as it goes out.",
    dataCategoryIds: ["medicine-order", "payment-financial", "customer-identity", "medicine-history"],
    accessPersonaIds: ["counter-staff", "pharmacist", "owner-manager", "it-admin"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "It is the single system holding identity, medicine and money together, and in most shops every member of staff uses the same login to reach all three.",
    riskAction:
      "Give each person their own account with a role rather than a shared password, log who opened which customer, and restrict export to the owner.",
  },
  {
    id: "payment-gateway",
    name: "Payment gateway, UPI & terminal",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["billing-payment"],
    description:
      "The gateway, UPI handle and card terminal that take the money, and the settlement record they hand back with the customer's identifier attached.",
    dataCategoryIds: ["payment-financial", "customer-identity", "medicine-order"],
    accessPersonaIds: ["finance-staff", "vendor-staff", "owner-manager"],
    retentionDefined: true,
    riskLevel: "medium",
  },
  {
    id: "accounting-tax-system",
    name: "Accounting, invoicing & tax records",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["billing-payment", "insurance-tpa", "archive"],
    description:
      "Where the invoices settle for filing and audit - itemised, named, and legitimately kept for longer than anything else on this map.",
    dataCategoryIds: ["payment-financial", "customer-identity", "medicine-order", "insurance-corporate"],
    accessPersonaIds: ["finance-staff", "owner-manager"],
    retentionDefined: true,
    riskLevel: "medium",
  },
  {
    id: "fraud-scoring-service",
    name: "Fraud & payment-risk scoring",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["billing-payment"],
    description:
      "The service that scores an order for payment risk before it is accepted, using the basket, the address, the device and the customer's order history.",
    dataCategoryIds: ["payment-financial", "medicine-order", "digital-behaviour", "health-inference"],
    accessPersonaIds: ["vendor-staff", "finance-staff", "it-admin"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Scoring that reads the basket is scoring on medicine categories, which turns a health-related fact into a reason an order was refused - decided automatically, and hard for the customer to see or challenge.",
    riskAction:
      "Keep medicine categories out of the risk features, and make sure a refused order can be reviewed by a person and explained to the customer.",
    businessModels: ONLINE,
  },

  // ---- Stage 9 · Insurance, TPA & corporate billing (chain) ---------------
  {
    id: "insurance-tpa-portal",
    name: "Insurer & TPA claim portal",
    nodeType: "system",
    boundary: "third-party",
    stageIds: ["insurance-tpa"],
    description:
      "Where the claim is filed: the patient's identity, the policy, the prescription and the itemised medicine list, submitted for approval and kept in the insurer's own file.",
    dataCategoryIds: ["insurance-corporate", "prescription", "medicine-order", "customer-identity"],
    accessPersonaIds: ["insurer-tpa", "finance-staff", "counter-staff"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "The recipient is a separate organisation making its own decisions with a full medicine list, under retention rules the pharmacy does not set and cannot reach when the patient later asks for deletion.",
    riskAction:
      "Send only what the claim genuinely requires, keep a record of what was disclosed on each claim, and tell the patient plainly that the insurer's copy is not yours to withdraw.",
    businessModels: CHAIN,
  },
  {
    id: "claims-repository",
    name: "Claims & pre-authorisation records",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["insurance-tpa", "archive"],
    description:
      "The pharmacy's own copy of every claim raised, approved and refused - including the refusals nobody went back to, with the reason attached.",
    dataCategoryIds: ["insurance-corporate", "medicine-order", "customer-identity", "payment-financial"],
    accessPersonaIds: ["finance-staff", "counter-staff", "owner-manager"],
    retentionDefined: false,
    riskLevel: "medium",
    businessModels: CHAIN,
  },

  // ---- Stage 10 · Stock, dispensing, labelling & packing (all models) ------
  {
    id: "dispensing-station",
    name: "Dispensing & pharmacist release",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["dispensing"],
    description:
      "The check before the medicine goes out: prescription against basket, batch and expiry recorded, substitution confirmed, and the pharmacist's release against their own name.",
    dataCategoryIds: ["medicine-order", "prescription", "controlled-medicine", "staff-access-record"],
    accessPersonaIds: ["pharmacist", "warehouse-staff", "counter-staff"],
    retentionDefined: false,
    riskLevel: "medium",
  },
  {
    id: "inventory-stock-system",
    name: "Inventory & stock system",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["dispensing", "stock-transfer", "complaints"],
    description:
      "What is on the shelf, what has gone out, which batch went to whom - the stock ledger that quietly carries a customer reference alongside every movement.",
    dataCategoryIds: ["medicine-order", "customer-identity", "allergy-adverse-event"],
    accessPersonaIds: ["counter-staff", "warehouse-staff", "owner-manager", "pharmacist"],
    retentionDefined: false,
    riskLevel: "medium",
  },
  {
    id: "label-printer",
    name: "Label printer & dispensing label",
    nodeType: "device",
    boundary: "agency",
    stageIds: ["dispensing"],
    description:
      "Prints the label that goes on the package: the patient's name, the medicine, the quantity and the order number - the moment the record and the product become the same object.",
    dataCategoryIds: ["customer-identity", "medicine-order", "prescription"],
    accessPersonaIds: ["pharmacist", "warehouse-staff", "counter-staff"],
    retentionDefined: false,
    riskLevel: "medium",
  },
  {
    id: "pick-list-print",
    name: "Printed pick lists & packing sheets",
    nodeType: "physical_storage",
    boundary: "agency",
    stageIds: ["stock-transfer", "dispensing"],
    description:
      "The sheets that move around the floor with the order - patient name, medicines, quantities - and end the shift in a tray, a pocket or a bin.",
    dataCategoryIds: ["customer-identity", "medicine-order", "staff-access-record"],
    accessPersonaIds: ["warehouse-staff", "pharmacist"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Paper naming a patient and their medicines circulates among temporary staff and is thrown away intact, which makes it the easiest thing on this map for somebody outside the business to read.",
    riskAction:
      "Print an order reference instead of the patient's name, and destroy sheets at the end of the shift rather than binning them.",
    businessModels: WAREHOUSED,
  },

  // ---- Stage 11 · Central inventory, warehouse & branch transfer -----------
  {
    id: "warehouse-management-system",
    name: "Warehouse & order-management system",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["stock-transfer", "dispensing", "delivery"],
    description:
      "Allocates stock to orders, generates the pick and pack sequence, records quality checks and hands the parcel to the courier - carrying the customer's name and address the whole way.",
    dataCategoryIds: ["medicine-order", "customer-identity", "delivery-address", "staff-access-record"],
    accessPersonaIds: ["warehouse-staff", "it-admin", "pharmacist", "support-staff"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "An operations system that only needs to move boxes ends up holding the full patient identity next to the medicine, open to the largest and least permanent group of staff in the business.",
    riskAction:
      "Separate the picking view from the identity view, use an order reference in stock operations, and review warehouse accounts and exports on a schedule.",
    businessModels: WAREHOUSED,
  },
  {
    id: "branch-transfer-system",
    name: "Branch transfer & central stock allocation",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["stock-transfer"],
    description:
      "Moves stock between outlets to fill an order taken somewhere else - and with it the customer reference, so a person's request is visible at a branch they never visited.",
    dataCategoryIds: ["medicine-order", "customer-identity", "controlled-medicine"],
    accessPersonaIds: ["counter-staff", "warehouse-staff", "it-admin"],
    retentionDefined: false,
    riskLevel: "medium",
    businessModels: CHAIN,
  },

  // ---- Stage 12 · Handover, delivery & last mile (all models) -------------
  {
    id: "dispensed-package-label",
    name: "The dispensed package, label & manifest",
    nodeType: "physical_storage",
    boundary: "agency",
    stageIds: ["delivery", "complaints"],
    description:
      "The parcel itself, the label on the outside, the invoice inside it and the manifest that travels with it - handed across a counter, given to a delivery boy, or scanned into a rider's app.",
    dataCategoryIds: ["medicine-order", "customer-identity", "delivery-address", "health-inference"],
    accessPersonaIds: ["delivery-staff", "logistics-partner", "counter-staff", "family-caregiver"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "This is the sector's signature risk, and the only one in this series where the PRODUCT discloses the condition. The medicine is named on the strip, on the label, on the invoice line and in the rider's app - so a parcel left with a neighbour, opened by a relative or carried through an office reception tells them what the person is being treated for. No other business in this series can out somebody by delivering to them.",
    riskAction:
      "Pack in outer packaging that does not name or reveal the medicine, keep the itemised invoice inside the sealed package rather than on it, send the delivery partner an order reference and a masked number instead of a medicine list, and verify who is collecting before handing over.",
  },
  {
    id: "own-delivery-register",
    name: "Delivery register & address slips",
    nodeType: "physical_storage",
    boundary: "agency",
    stageIds: ["delivery"],
    description:
      "The book at the counter listing today's deliveries - name, address, medicine, amount to collect - and the slips that go out in the delivery boy's pocket.",
    dataCategoryIds: ["delivery-address", "customer-identity", "medicine-order", "payment-financial"],
    accessPersonaIds: ["delivery-staff", "counter-staff", "owner-manager"],
    retentionDefined: false,
    riskLevel: "medium",
    businessModels: COUNTER,
  },
  {
    id: "logistics-aggregator-platform",
    name: "Delivery aggregator & rider app",
    nodeType: "system",
    boundary: "third-party",
    stageIds: ["delivery"],
    description:
      "The logistics platform the order is handed to, and the app in the rider's hand showing the customer's name, number, address, order value and often what is in the package.",
    dataCategoryIds: ["delivery-address", "customer-identity", "medicine-order", "payment-financial"],
    accessPersonaIds: ["logistics-partner", "support-staff", "vendor-staff"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "The person who physically reaches the customer's door is not employed by the pharmacy, keeps the address and number on their own device, and has been given the order detail as a matter of routine. Nothing in the arrangement tells them to delete any of it.",
    riskAction:
      "Send the partner an order reference, a masked contact number and an address - never a medicine list - put deletion and no-reuse terms into the platform contract, and turn off proof-of-delivery photographs that capture more than the doorstep.",
    businessModels: WAREHOUSED,
  },
  {
    id: "maps-navigation-service",
    name: "Maps & route service",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["delivery"],
    description:
      "The mapping and routing service the address is typed into to find the house, which records the destination and the trip alongside it.",
    dataCategoryIds: ["delivery-address", "customer-identity"],
    accessPersonaIds: ["delivery-staff", "logistics-partner", "vendor-staff"],
    retentionDefined: false,
    riskLevel: "low",
  },
  {
    id: "proof-of-delivery-store",
    name: "Proof of delivery & handover record",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["delivery", "complaints"],
    description:
      "The signature, the OTP, the photograph of the package at the door and the note of who actually took it - kept against the order indefinitely.",
    dataCategoryIds: ["delivery-address", "customer-identity", "family-caregiver", "medicine-order"],
    accessPersonaIds: ["support-staff", "counter-staff", "logistics-partner", "owner-manager"],
    retentionDefined: false,
    riskLevel: "medium",
  },

  // ---- Stage 13 · Controlled & schedule-medicine registers ----------------
  {
    id: "controlled-medicine-register",
    name: "Controlled & schedule-medicine register",
    nodeType: "physical_storage",
    boundary: "agency",
    stageIds: ["controlled-medicine", "archive"],
    description:
      "The separate register - paper, digital or both - naming the patient, the prescriber, the quantity, the pharmacist who dispensed it and the running balance, held where it can be produced on inspection.",
    dataCategoryIds: ["controlled-medicine", "customer-identity", "prescription", "staff-access-record"],
    accessPersonaIds: ["pharmacist", "owner-manager", "authority-staff"],
    retentionDefined: true,
    riskLevel: "high",
    riskWhy:
      "It is a REQUIRED RECORD, so it is one of the few things on this map that genuinely cannot be deleted on request - which makes it more important, not less, that it is not casually readable and that duplicate working copies are not made beside it.",
    riskAction:
      "Keep the register physically secured and restricted to the dispensing role, do not maintain informal duplicates of it in a notebook or a spreadsheet, and explain to a customer why this specific record is retained when other things are not.",
    businessModels: COUNTER,
  },
  {
    id: "drug-authority-record",
    name: "Records produced to the authorities",
    nodeType: "repository",
    boundary: "government",
    stageIds: ["controlled-medicine"],
    description:
      "What has been shown or submitted to drug-control officials during an inspection or an enquiry - authority-controlled from the moment it leaves.",
    dataCategoryIds: ["controlled-medicine", "customer-identity", "prescription"],
    accessPersonaIds: ["authority-staff", "owner-manager", "pharmacist"],
    retentionDefined: true,
    riskLevel: "medium",
    businessModels: COUNTER,
  },

  // ---- Stage 14 · Refill reminders, loyalty & marketing (all models) ------
  {
    id: "refill-marketing-platform",
    name: "Refill reminders, CRM & campaigns",
    nodeType: "system",
    boundary: "agency",
    stageIds: ["refill-marketing", "archive"],
    description:
      "Whatever turns purchase history into an outbound message: a CRM and campaign tool, a refill engine, a broadcast list, or a diary entry and a WhatsApp message the owner sends personally.",
    dataCategoryIds: ["refill-marketing-profile", "health-inference", "medicine-history", "communication-records"],
    accessPersonaIds: ["marketing-staff", "owner-manager", "counter-staff", "vendor-staff"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "A reminder that names a medicine discloses a condition to whoever is holding the phone, and a refill cadence is a chronic-illness inference the shop never knowingly collected. Marketing permission is usually bundled into the sale, and a withdrawal recorded in one place does not reach the broadcast list on somebody's own handset.",
    riskAction:
      "Ask separately for service reminders and for promotion, word reminders so they do not name the medicine, keep one suppression list every channel must check before sending, and set an inactivity rule that stops profiling people who stopped buying years ago.",
  },
  {
    id: "messaging-broadcast-service",
    name: "SMS, push & WhatsApp broadcast service",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["refill-marketing"],
    description:
      "The provider that actually sends the reminder or the offer, holding the number, the message and the delivery report for every person on the list.",
    dataCategoryIds: ["communication-records", "customer-identity", "refill-marketing-profile"],
    accessPersonaIds: ["marketing-staff", "vendor-staff", "owner-manager"],
    retentionDefined: false,
    riskLevel: "medium",
  },
  {
    id: "ad-audience-platform",
    name: "Advertising audience platform",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["refill-marketing"],
    description:
      "Where customer lists are uploaded to be matched and used as custom and lookalike audiences - segmented, in practice, by what people buy.",
    dataCategoryIds: ["health-inference", "refill-marketing-profile", "customer-identity", "digital-behaviour"],
    accessPersonaIds: ["marketing-staff", "vendor-staff"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "An audience built from medicine purchases is a health inference handed to an advertising platform, and it is the one place a withdrawal almost never reaches - unsubscribing from email does not remove an uploaded list.",
    riskAction:
      "Do not build advertising audiences from medicine or condition data at all, and where lists have already been uploaded, remove them and confirm the platform has dropped the match.",
    businessModels: WAREHOUSED,
  },
  {
    id: "marketing-agency-export",
    name: "Marketing agency export",
    nodeType: "repository",
    boundary: "vendor",
    stageIds: ["refill-marketing"],
    description:
      "The customer spreadsheet sent to an agency to run a campaign, which stays on their drive and gets re-imported the next time something is scheduled.",
    dataCategoryIds: ["customer-identity", "refill-marketing-profile", "medicine-history", "health-inference"],
    accessPersonaIds: ["marketing-staff", "vendor-staff"],
    shadowIt: true,
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "A one-off export becomes a permanent second copy of the customer base outside the business, and it is the copy that keeps sending after somebody has asked to be left alone.",
    riskAction:
      "Give the agency access to a segment in your own tool rather than a file, and where a file has already gone, require its deletion in writing and stop re-importing it.",
    businessModels: WAREHOUSED,
  },

  // ---- Stage 15 · Cross-outlet history & central analytics (chain) --------
  {
    id: "central-data-warehouse",
    name: "Central data warehouse & reporting",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["cross-branch-profiling", "archive"],
    description:
      "Every outlet's sales, the hospital encounters, the loyalty record and the claim history in one place, refreshed nightly, queried by people who will never meet any of the customers in it.",
    dataCategoryIds: ["medicine-history", "health-inference", "customer-identity", "insurance-corporate"],
    accessPersonaIds: ["analytics-staff", "it-admin", "marketing-staff"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "It is the only place where a person's complete medicine history across every outlet and the hospital sits in one table, and it is the copy a deletion request almost never reaches because nobody thinks of the warehouse as customer data.",
    riskAction:
      "Include the warehouse in every deletion and correction routine, remove direct identifiers from the analytical copy where the analysis does not need them, and put the clinical and commercial tables behind different permissions.",
    businessModels: CHAIN,
  },
  {
    id: "analytics-ai-platform",
    name: "Analytics & scoring models",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["cross-branch-profiling"],
    description:
      "The modelling layer that produces adherence estimates, chronic-condition segments, care-gap alerts, customer-value bands and misuse flags from cross-outlet purchase behaviour.",
    dataCategoryIds: ["health-inference", "refill-marketing-profile", "medicine-history", "controlled-medicine"],
    accessPersonaIds: ["analytics-staff", "vendor-staff", "marketing-staff"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "It creates statements about somebody's health and behaviour that nobody told the pharmacy - an adherence score, a misuse flag - and those statements can affect how the person is treated at the counter without them ever seeing them.",
    riskAction:
      "Write down what is derived and why, keep a person in any decision that affects the customer, let someone see and challenge a score as well as a fact, and never let a commercial model reach into the clinical record.",
    businessModels: CHAIN,
  },

  // ---- Stage 16 · Returns, complaints & adverse events (all models) -------
  {
    id: "complaint-adverse-event-file",
    name: "Complaint, return & adverse-event file",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["complaints", "archive"],
    description:
      "What is opened when something goes wrong: the description of the reaction, the photographs of the strip and sometimes of the person, the batch number, the pharmacist's escalation, the refund and the message to the distributor.",
    dataCategoryIds: ["allergy-adverse-event", "customer-identity", "medicine-order", "communication-records"],
    accessPersonaIds: ["support-staff", "pharmacist", "owner-manager", "supply-chain-partner"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "It is the most detailed health information the pharmacy ever holds and the most widely forwarded - to a distributor, a manufacturer and an internal group chat - usually with the customer's full identity attached when a batch number would have done.",
    riskAction:
      "Collect the minimum needed to investigate, keep the notes factual, send the manufacturer the batch and the account of what happened rather than the customer's identity, remove photographs from personal devices, and set a retention period for the file.",
  },
  {
    id: "support-helpdesk",
    name: "Helpdesk, ticketing & chatbot",
    nodeType: "system",
    boundary: "vendor",
    stageIds: ["complaints", "enquiry"],
    description:
      "The ticketing tool and the chat assistant in front of it, holding the conversation, the attached prescription and the order history of everyone who has ever got in touch.",
    dataCategoryIds: ["communication-records", "prescription-image", "medicine-order", "allergy-adverse-event"],
    accessPersonaIds: ["support-staff", "vendor-staff", "it-admin"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Support tickets accumulate prescriptions and health complaints as attachments, and the whole support team - often outsourced, often high-turnover - can search all of it.",
    riskAction:
      "Keep prescription attachments out of tickets by linking to the order instead, restrict which agents can open a health complaint, and set a retention period on closed tickets and chat transcripts.",
    businessModels: WAREHOUSED,
  },
  {
    id: "distributor-manufacturer",
    name: "Distributor & manufacturer",
    nodeType: "system",
    boundary: "third-party",
    stageIds: ["complaints"],
    description:
      "The supply chain the complaint is escalated to - receiving the batch, the account of what happened and, more often than necessary, the customer's name and number.",
    dataCategoryIds: ["allergy-adverse-event", "medicine-order", "customer-identity"],
    accessPersonaIds: ["supply-chain-partner", "pharmacist", "owner-manager"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "A separate organisation ends up holding an account of a named person's reaction to a medicine, kept under its own rules, purely because forwarding the whole message was quicker than summarising it.",
    riskAction:
      "Send the batch, the product and a factual account without the customer's identity, and pass on contact details only where the investigation genuinely needs them and the customer knows.",
  },
  {
    id: "returns-register",
    name: "Returns & refund register",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["complaints", "billing-payment"],
    description:
      "What came back, from whom, why, and what was refunded - kept against the customer record alongside the original sale.",
    dataCategoryIds: ["medicine-order", "payment-financial", "customer-identity", "allergy-adverse-event"],
    accessPersonaIds: ["counter-staff", "finance-staff", "support-staff", "owner-manager"],
    retentionDefined: false,
    riskLevel: "medium",
  },
  {
    id: "public-review-platform",
    name: "Public reviews & the reply",
    nodeType: "system",
    boundary: "public",
    stageIds: ["complaints"],
    description:
      "The review a customer leaves about a wrong or late order, and the pharmacy's public reply to it - which is where a business most often discloses a stranger's order in public.",
    dataCategoryIds: ["communication-records", "medicine-order", "customer-identity"],
    accessPersonaIds: ["support-staff", "marketing-staff", "owner-manager"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Replying with the order date, the medicine or the address to correct the record confirms in public what somebody was buying, and a public reply cannot be taken back once it has been indexed.",
    riskAction:
      "Reply in public with nothing but an apology and an invitation to contact you, and move every detail of the order into a private channel.",
    businessModels: WAREHOUSED,
  },

  // ---- Stage 17 · Archive, staff devices, vendors & deletion (all) --------
  {
    id: "pharmacy-archive",
    name: "Archive, old records & closed orders",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["archive"],
    description:
      "Where everything settles: closed orders, old prescriptions, cancelled and rejected ones, past customers, refill lists, complaint files and the customers who stopped coming years ago - all kept, because nobody ever decided not to.",
    dataCategoryIds: ["medicine-history", "prescription-image", "customer-identity", "refill-marketing-profile"],
    accessPersonaIds: ["owner-manager", "it-admin", "counter-staff", "analytics-staff"],
    retentionDefined: false,
    riskLevel: "critical",
    riskWhy:
      "Most of the people in it stopped dealing with the pharmacy years ago and many never bought anything. This is the single place where a retention decision would do the most good and is least likely to have been taken - and where a deletion request quietly fails, because deleting a customer from the billing system does not touch it.",
    riskAction:
      "Set a retention period per category - enquiry, prescription image, order, medicine history, financial record, required register - and run it on a clock. Separate what you must keep from what you have merely never deleted, and write down the exceptions.",
  },
  {
    id: "shared-drive-folder",
    name: "Shared drive & shop computer folders",
    nodeType: "repository",
    boundary: "agency",
    stageIds: ["customer-record", "refill-marketing", "archive"],
    description:
      "The folders everything gets dropped into - exports, prescription scans, customer lists, an old backup of the billing database - on a drive everyone in the shop can open.",
    dataCategoryIds: ["prescription-image", "medicine-history", "customer-identity", "staff-access-record"],
    accessPersonaIds: ["owner-manager", "counter-staff", "it-admin", "marketing-staff"],
    shadowIt: true,
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "It is where copies go to be forgotten. Nobody knows what is in it, everybody can open it, and an export taken for one report three years ago is still sitting there in full.",
    riskAction:
      "Inventory what is actually in the folders, delete the exports that have served their purpose, and restrict the drive to named accounts rather than the shop login.",
  },
  {
    id: "staff-laptop",
    name: "Staff laptop & downloads",
    nodeType: "device",
    boundary: "agency",
    stageIds: ["prescription-intake", "customer-record", "refill-marketing", "archive"],
    description:
      "The machine a prescription gets downloaded to so it can be attached to an email, and where the customer export sits after the last campaign.",
    dataCategoryIds: ["prescription-image", "customer-identity", "medicine-history", "staff-access-record"],
    accessPersonaIds: ["owner-manager", "marketing-staff", "support-staff", "it-admin"],
    shadowIt: true,
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "Downloads are copies nobody tracks, on devices that are not always the business's, and they are the copies missed by every deletion routine that only looks at the main system.",
    riskAction:
      "Work from the system rather than downloading, clear the downloads folder on a schedule, and make device return and wipe part of leaving.",
  },
  {
    id: "cloud-backup",
    name: "Cloud backup & database snapshots",
    nodeType: "repository",
    boundary: "vendor",
    stageIds: ["archive"],
    description:
      "The nightly backup of the billing database and the folders, held by a provider on a rolling cycle that nobody in the shop has ever looked at.",
    dataCategoryIds: ["medicine-history", "prescription-image", "customer-identity", "payment-financial"],
    accessPersonaIds: ["it-admin", "vendor-staff", "owner-manager"],
    retentionDefined: false,
    riskLevel: "high",
    riskWhy:
      "A deletion applied to the live system is still present in the backups for as long as the cycle runs, and almost nobody can say how long that is or who could restore from it.",
    riskAction:
      "Find out the backup cycle and write it down, tell people honestly how long a deletion takes to clear it, and restrict who is able to restore.",
  },
];
