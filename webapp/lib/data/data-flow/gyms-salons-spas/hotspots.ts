// The eight places a gym, salon or spa most often loses control of customer
// data, ranked worst-first. NOT the full risk inventory - that lives in the
// nodes' risk levels. Spec §5.
//
// ⚠️ THE COUNT AND THE FLAGS RECONCILE BY CONSTRUCTION, NOT BY LUCK.
//
// The journey paints one red flag per DISTINCT stage a hotspot's node resolves
// to; the counter and the legend print `pack.hotspots.length`, pack-level and
// never filtered. So every hotspot node here is UNGATED and each one's EARLIEST
// stage is a distinct ALL-MODEL stage - see the map in nodes.ts. Eight hotspots,
// eight stages, eight flags, in all three models. Guard test (a) asserts it.
//
// Rank 1 is the sector's signature (spec §3): the photograph. Every other map
// in this series ranks a place where a record escapes. This one ranks the place
// where the customer's body becomes the business's advertisement - because the
// before-and-after is the sector's best-performing content, the consent behind
// it is a verbal yes to whoever held the phone, and removal has to chase copies
// across a gallery, an agency, a photographer and a public feed.
//
// Rank 2 is the second signature: the staff member IS the system. No other map
// in the series has an employee who can walk out with the customer base as a
// matter of routine.
//
// The pasted spec's §9.12, §10.12 and §11.12 ask for per-variant hotspot sets
// of 10 / 10 / 10. Not possible: the counter is pack-level and unfiltered, and
// the schema caps the band at 5-8. All 30 of those items are authored - eight
// as hotspots, the rest as high- or critical-risk nodes with their own
// `riskWhy` and `riskAction`, which the engine renders in full.
//
// `assessmentBucket` must be one of the pack's own `assessmentBuckets`, and the
// deep-link guard test asserts the assessment client handles every key sent
// from here. All five of the gyms-salons-spas buckets are used.
//
// ⛔ Language locks (spec §8): no medical, fitness, beauty or dietary advice;
// "high-impact health, body and image data", never "sensitive personal data";
// and nothing here accuses the trade - progress photos, WhatsApp booking and a
// stylist's own client relationships are how this business works. The point is
// where control breaks, not that the work is illegitimate.

import type { FlowHotspot } from "../../../data-flow/schemas.ts";

export const GYMS_SALONS_SPAS_HOTSPOTS: FlowHotspot[] = [
  {
    id: "hs-before-after-library",
    rank: 1,
    nodeId: "photo-media-library",
    title: "The customer's body becomes the business's advertisement",
    whatHappens:
      "A progress photo is taken in the changing area, a before-and-after pair is assembled, a bridal album arrives from the photographer, a testimonial clip is recorded. It all collects in the gallery - the front-desk tablet, a shared drive, the social-media draft folder - and the best of it goes to Instagram, because a transformation post is the single best-performing content this sector has. The consent behind it was a verbal yes, in the moment, to the person holding the phone - nothing recorded about which channel, whether the face shows, or for how long.",
    whyItMatters:
      "This is the one thing this sector does that no other in this series does: it photographs the customer's body and then publishes it as marketing. A partly-clothed adult, mid-transformation, posted to a public feed, is an exposure most customers never imagined when they nodded at a camera - and once posted, the image is re-shared, screenshotted and cached beyond recall. The library also keeps everyone who was never published: hundreds of bodies, faces and weddings, one export or one wrong tap from becoming public.",
    dataCategoryIds: ["photos-videos", "transformation-progress", "identity-contact"],
    action:
      "Separate the two decisions: consent to capture is not consent to publish. Record a per-customer publication choice - purpose, channel, face visible or hidden, expiry - and check it before anything is posted. Give raw images a retention date, keep the gallery on named access rather than a shared tablet, and maintain a removal route that reaches every copy: the feed, the agency, the photographer, the drafts.",
    assessmentBucket: "photos_marketing_whatsapp",
  },
  {
    id: "hs-staff-personal-phone",
    rank: 2,
    nodeId: "staff-personal-phone",
    title: "The staff member is the system — and they leave with it",
    whatHappens:
      "The regular books with 'their' trainer, stylist or therapist on a personal number. The health form gets photographed 'to have it handy'. The progress shot is taken on the same phone. The renewal reminder goes out from it. Six separate stages of this journey land on one unmanaged handset - and when the person resigns, the handset, the chat history, the camera roll and the client relationships walk out together, usually to the business down the road.",
    whyItMatters:
      "In this trade the professional IS the relationship, so the realest customer database is a private camera roll and chat history the business cannot search, audit or wipe. It holds body photographs and medical declarations next to family pictures, syncs to a personal cloud account, and never appears in any access request the business answers. No other sector in this series has an employee who can take the customer base with them as a matter of routine - here it is so normal it has a name: 'her clients followed her'.",
    dataCategoryIds: ["identity-contact", "photos-videos", "health-declaration", "communication-feedback"],
    action:
      "Give customer-facing staff a business channel that is genuinely easier than their own phone - a business WhatsApp on a business device, a booking app worth using. Put 'no customer photos or forms on personal devices' in writing, in employment terms as well as policy. Treat every exit as a data event: numbers handed over, local copies deleted and confirmed, clients informed by the business rather than poached in silence.",
    assessmentBucket: "app_staff_vendor_access",
  },
  {
    id: "hs-health-declarations",
    rank: 3,
    nodeId: "health-declaration-forms",
    title: "Medical declarations, collected at a front desk",
    whatHappens:
      "Before the first session, the customer declares conditions, injuries, medication, allergies and - where asked - pregnancy, on a paper form or a Google Form. Reception checks it over the counter, key answers get typed into the profile everyone can open, the caution gets posted to the staff group, and the form itself goes into a drawer where it will outlive the membership by years.",
    whyItMatters:
      "This is high-impact health data in a business with no clinical setting and no clinical habits: no sealed records, no need-to-know access, no correction route, no destruction date. A pregnancy disclosed for a safe massage, an injury declared for a safe workout - each was given for one purpose and ends up readable by the front desk, the sales team and every phone in the staff group. And because the form is filled once, the business keeps treating a years-old declaration as if it were still true.",
    dataCategoryIds: ["health-declaration", "identity-contact"],
    action:
      "Collect only what the service genuinely needs to be delivered safely, and hand the form to the treating professional rather than the desk. Store declarations sealed, on named access; keep them out of the general profile and the staff group; refresh them instead of trusting old answers; and give every form a destruction date that someone owns.",
    assessmentBucket: "health_body_consultation_data",
  },
  {
    id: "hs-body-as-record",
    rank: 4,
    nodeId: "body-assessment-records",
    title: "The body becomes a permanent record",
    whatHappens:
      "The trainer measures weight, BMI and girth; the machine prints a body-composition profile; the stylist scores skin and scalp; the therapist writes up the consultation. Every re-measurement extends the trend, and the whole file - a time series of somebody's body - spreads across printouts, spreadsheets, device apps and the staff member's own notebook.",
    whyItMatters:
      "A person who came in for three months of training acquires a longitudinal body record that never goes away, readable by more staff than ever measured them. The vendor's device app keeps its own copy that nobody inventories. The notebook version goes home in a bag every evening. And because progress data feels like an asset, it survives the membership, the trainer and sometimes the business itself - the customer has no idea the file exists, let alone how to correct or delete it.",
    dataCategoryIds: ["body-measurements", "beauty-consultation", "transformation-progress"],
    action:
      "Keep assessments in one governed place, scoped to the treating professional - not spread across machines, sheets and notebooks. Inventory what each assessment device and its vendor app retain, and put deletion in the vendor terms. Show customers their own record on request, correct it when they say it is wrong, and delete the trend when the relationship ends rather than archiving a body by default.",
    assessmentBucket: "health_body_consultation_data",
  },
  {
    id: "hs-staff-group-broadcast",
    rank: 5,
    nodeId: "staff-whatsapp-group",
    title: "One customer's caution note reaches every phone on the shift",
    whatHappens:
      "The day runs through the staff WhatsApp group: today's client list from the booking app, 'careful - patch test positive', 'knee injury, no jumps', the reaction photo, the before-and-after circulated for approval. Operationally it works. Data-wise, a named customer's health caution has just been broadcast to every phone in the group - including the phones of people who left last year and were never removed.",
    whyItMatters:
      "A group message cannot be scoped: whatever is posted reaches everyone, persists in every member's chat history, and rides every personal backup. The note that one therapist genuinely needed becomes ambient knowledge for the whole team. There is no access log, no deletion, no way to answer 'who has seen this customer's health information' - and the group's membership is maintained by memory, which means ex-staff stay in it far longer than anyone realises.",
    dataCategoryIds: ["health-declaration", "identity-contact", "photos-videos", "beauty-consultation"],
    action:
      "Keep the group for rosters and logistics - never customer names joined to health cautions, photographs or service detail. Pass client-specific information person-to-person in the official tool, where it is scoped and searchable. Review group membership monthly, remove leavers the day they leave, and rebuild the group entirely after staff turnover rather than trusting the list.",
    assessmentBucket: "app_staff_vendor_access",
  },
  {
    id: "hs-service-history-profile",
    rank: 6,
    nodeId: "service-history-register",
    title: "Visit notes compound into an intimate profile",
    whatHappens:
      "Every visit appends a line: the treatment, the products, the reaction, the preference - and the observation the staff member typed about the person. Years of individually harmless entries compound into a detailed picture of appearance concerns, treatment patterns, spending and temperament, readable by the whole team, mined for campaign segments, and quoted back in public review replies.",
    whyItMatters:
      "The history is the business's memory and genuinely useful - and it is also the record most casually over-shared. A 'slimming package' segment built from it quietly announces what its members had done. A review reply drawing on it confirms a customer's treatment to the public. A note like 'fussy, always late' becomes a permanent characterisation the customer could one day read. Because it feels operational, nobody treats it as personal data with an owner, an access rule and an end date.",
    dataCategoryIds: ["service-history", "beauty-consultation", "marketing-profile"],
    action:
      "Keep entries factual and service-relevant - written as if the customer will read them, because they may. Scope full-history access to the treating professional and today's booking to the desk. Keep marketing segmentation away from treatment-level detail, never confirm a service in a public reply, and give the history the same retention rule as the membership it belongs to.",
    assessmentBucket: "customer_membership_data",
  },
  {
    id: "hs-whatsapp-campaigns",
    rank: 7,
    nodeId: "whatsapp-broadcast",
    title: "The campaign list knows what everyone had done",
    whatHappens:
      "Marketing runs on WhatsApp: broadcast lists exported from the customer base, festival offers, renewal pushes, win-back blasts to people who left years ago. The lists are segmented by service history - which means the 'slimming special' goes precisely to the people who bought slimming, and the message itself announces it. Opt-outs land in one place; the list copies saved in exports, phones and the franchise platform never hear about them.",
    whyItMatters:
      "A campaign built from a wellness customer base is never neutral: its segments encode bodies, treatments and concerns. Sending it over WhatsApp puts that inference on the recipient's lock screen, visible to whoever glances at the phone. And because lists are rebuilt from old exports rather than the live opted-in base, withdrawal doesn't stick - the customer who opted out in March is back on the Diwali blast, and the ex-member from 2022 still hears from the business that kept their number.",
    dataCategoryIds: ["identity-contact", "marketing-profile", "service-history"],
    action:
      "Hold one suppression list that every channel - WhatsApp, SMS, email, the agency, the franchise - checks before sending, and make every campaign pull from the live opted-in base rather than saved exports. Keep service and health categories out of segment definitions and message text. Separate service reminders from promotion so opting out of offers never breaks appointment confirmations.",
    assessmentBucket: "photos_marketing_whatsapp",
  },
  {
    id: "hs-forever-archive",
    rank: 8,
    nodeId: "old-customer-archive",
    title: "Nobody owns the ex-customers, so nothing is ever deleted",
    whatHappens:
      "The membership lapses, the customer stops coming - and the record simply settles: the profile, the health declaration, the body measurements, the photographs, the chat threads, all archived 'for repeat bookings'. The archive is backed up, synced to the franchise platform, and periodically mined for win-back campaigns. Deletion has never happened, because no one has ever been responsible for it.",
    whyItMatters:
      "The archive is the business's largest holding of high-impact health, body and image data, belonging to the people with the least relationship to it. A health form from 2019, a progress photo of someone who cancelled after three months, a bridal album from a marriage since ended - none of it serves any purpose the business could state, yet all of it remains reachable by current staff, exportable in one file, and exposed in any incident. The fullest records belong to people who may not remember the business exists.",
    dataCategoryIds: ["identity-contact", "health-declaration", "photos-videos", "body-measurements"],
    action:
      "Decide retention per record type, not per person: invoices on the timeline finance genuinely needs; health declarations, measurements and photographs deleted when the relationship ends; chat threads cleared on a schedule. Suppress lapsed customers from marketing by default, make someone own the deletion calendar, and treat the backup and franchise copies as part of every purge rather than exceptions to it.",
    assessmentBucket: "retention_rights_incident",
  },
];
