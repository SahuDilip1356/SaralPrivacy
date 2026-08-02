// What happens when someone asks - and what happens when it has already gone
// wrong. Optional shared sections (lib/data-flow/schemas.ts); third pack to
// author them, after schools-colleges and clinics-diagnostic-labs.
//
// CONTENT ONLY. No component, route or schema work.
//
// THE D2C DIFFERENCE. In every other sector the data subject came to the
// business and knew it. Here a large share of the record belongs to people who
// never transacted at all - someone who browsed once and was pixel-tracked, a
// gift recipient whose address the buyer typed in, a lookalike audience member
// modelled from a customer list. That is why `rs-gift-recipient` exists and why
// `blockedNodeIds` on the marketing scenarios is unusually blunt: an advertising
// audience cannot be un-seeded once it has been built.
//
// LANGUAGE LOCK: DPDPA scope only. No consumer-law, e-commerce-rules or
// payment-regulator claims, and no "sensitive personal data" - the DPDPA creates
// no such statutory category. The incident section is an OPERATIONAL response
// reference; whether something must be reported is the brand's decision with its
// own advisers, and the shared component says so.
//
// Model gating: an own-website brand never sees the seller-portal walkthrough, a
// marketplace-first brand never sees session replay, and only an omnichannel
// brand sees the store-clienteling incident.

import type { IncidentScenario, RightsScenario } from "../../../data-flow/schemas.ts";

export const D2C_BRANDS_RIGHTS_SCENARIOS: RightsScenario[] = [
  {
    id: "rs-access-everything",
    request: "Show me everything you hold about me",
    requestType: "access",
    who: "A customer - or increasingly someone who never bought anything and wants to know why you have their details at all.",
    reachesNodeIds: [
      "consent-capture",
      "invoice-tax-system",
      "helpdesk",
      "whatsapp-support",
      "messaging-platform",
      "analytics-warehouse",
      "warehouse-wms",
      "order-export-sheet",
      "returns-evidence",
    ],
    blockedNodeIds: [
      "tracking-pixels",
      "ad-audience-platforms",
      "agency-export",
      "archive-backup",
      "staff-device",
      "courier-network",
    ],
    steps: [
      "Resolve the person across the identifiers you hold - email, phone, device and order history are frequently four separate records for one human being.",
      "Pull the order, payment reference, address and support history.",
      "Include what you inferred rather than collected: segments, propensity and churn scores, lifetime-value band, product affinities.",
      "Include the channels people forget are records - the WhatsApp thread, the chat transcript, the returns photographs.",
      "Name the third parties: the ad platforms, the analytics and personalisation vendors, the courier, the agency that has an export.",
      "Say plainly which places you could not search, and why.",
    ],
    hardPart:
      "The tracking layer. A pixel has been building a behavioural profile since before this person had an account, the ad platform holds a copy you cannot query, and the agency has a spreadsheet from a campaign two quarters ago. None of that is searchable from your admin panel, so an answer built only from the order database is comfortable and incomplete.",
  },
  {
    id: "rs-stop-marketing",
    request: "Stop marketing to me - all of it",
    requestType: "withdraw-marketing",
    who: "Anyone on the list: a customer, a lapsed buyer, someone who only abandoned a cart, or a person who never heard of you before the ad.",
    reachesNodeIds: [
      "messaging-platform",
      "consent-capture",
      "analytics-warehouse",
      "helpdesk",
      "whatsapp-support",
    ],
    blockedNodeIds: ["ad-audience-platforms", "tracking-pixels", "agency-export", "affiliate-influencer"],
    steps: [
      "Record the withdrawal against the PERSON, not against the campaign or the list that prompted it.",
      "Suppress across every channel at once - email, SMS, WhatsApp and push are usually four separate tools with four separate opt-out states.",
      "Remove them from the audiences already uploaded to the ad platforms, and from the segments that regenerate those audiences.",
      "Stop the automated flows separately: abandoned cart, win-back and replenishment reminders are rarely covered by a marketing opt-out.",
      "Keep genuine transactional messages working - an order update is not marketing, and switching it off is its own failure.",
      "Confirm what has stopped, and be specific about what has not.",
    ],
    hardPart:
      "The audiences already built. Suppression removes someone from the next send, but a lookalike audience modelled from a list that included them is already live on a platform you do not control, and it cannot be un-seeded - only stopped and rebuilt. The next export from a segment nobody re-checked will also pick them up again.",
  },
  {
    id: "rs-gift-recipient",
    request: "I never bought anything from you - why do you have my address?",
    requestType: "erasure",
    who: "A gift recipient. Someone else typed their name, address and phone number into your checkout, and they were never asked anything.",
    reachesNodeIds: [
      "warehouse-wms",
      "invoice-tax-system",
      "messaging-platform",
      "analytics-warehouse",
      "consent-capture",
      "order-export-sheet",
    ],
    blockedNodeIds: ["ad-audience-platforms", "courier-network", "archive-backup", "agency-export"],
    steps: [
      "Find them by delivery address and phone rather than by account - they do not have one.",
      "Separate the delivery record, which had a reason to exist, from the marketing profile, which did not.",
      "Delete the marketing profile and remove them from every audience and segment built from delivery data.",
      "Suppress the contact details permanently so the next order import does not recreate the profile.",
      "Keep only what the completed transaction genuinely requires, and set a deletion date for it.",
      "Tell them what was held, why, and what has now gone.",
    ],
    hardPart:
      "Nobody designed for this person. They were never a customer, so there is no account to close and no consent record to withdraw - and yet their address, phone number and a purchase inference about their relationship to the buyer are all in the database, and typically already in a marketing audience.",
  },
  {
    id: "rs-correct-order-details",
    request: "This order is not mine, or my details are wrong",
    requestType: "correction",
    who: "A customer, often after a delivery went to a previous address or an old phone number that now belongs to someone else.",
    reachesNodeIds: [
      "warehouse-wms",
      "invoice-tax-system",
      "helpdesk",
      "messaging-platform",
      "analytics-warehouse",
      "consent-capture",
    ],
    blockedNodeIds: ["courier-network", "proof-of-delivery", "order-export-sheet", "archive-backup"],
    steps: [
      "Verify the requester before changing an address - an address change request is also how account takeover starts.",
      "Correct the master customer record rather than only the open order.",
      "Push the change to fulfilment and messaging so the next despatch and the next campaign use it.",
      "Correct the invoice if one has been issued, as a documented amendment rather than a silent edit.",
      "Check whether the wrong contact detail has already received order updates, and stop that.",
      "Record the correction and when it was made.",
    ],
    hardPart:
      "What has already shipped. The courier holds the old address on a live consignment, the proof-of-delivery record captured it, and the exported order sheet used for that day's despatch is already in someone's inbox with the wrong details baked in.",
  },
  {
    id: "rs-remove-review-content",
    request: "Take down my review, photo or the post you used me in",
    requestType: "remove-media",
    who: "A customer whose review, unboxing photo or testimonial has been reposted - sometimes by an influencer they have no relationship with.",
    reachesNodeIds: ["public-reviews-social", "review-monitoring", "messaging-platform", "consent-capture"],
    blockedNodeIds: ["affiliate-influencer", "ad-audience-platforms", "archive-backup", "agency-export"],
    steps: [
      "Remove the content from the channels you control - your own site, your feeds, your ads.",
      "Stop any advertisement using it and pause the audience built around that creative.",
      "Ask the affiliate or influencer who reposted it to take it down, in writing.",
      "Record the withdrawal so the content is not re-used in the next campaign from the same asset library.",
      "Be clear with the person about what you have removed and what is beyond your reach.",
    ],
    hardPart:
      "Reposts and reuse. A testimonial that performed well has usually been re-cut into several creatives, handed to an agency, and reposted by affiliates on accounts you do not control - and a marketplace review typically cannot be removed by the seller at all.",
  },
  {
    id: "rs-delete-account",
    request: "Delete my account and everything with it",
    requestType: "erasure",
    who: "A customer who has decided to leave - very often immediately after a bad support experience.",
    reachesNodeIds: [
      "consent-capture",
      "messaging-platform",
      "helpdesk",
      "whatsapp-support",
      "analytics-warehouse",
      "returns-evidence",
      "order-export-sheet",
    ],
    blockedNodeIds: [
      "invoice-tax-system",
      "archive-backup",
      "ad-audience-platforms",
      "courier-network",
      "agency-export",
      "public-reviews-social",
    ],
    steps: [
      "Separate what has a genuine retention ground from what does not - a tax invoice is a real obligation, a behavioural profile and a returns photograph are not.",
      "Close the account rather than deactivating it, and delete the marketing and personalisation layers first.",
      "Remove them from every audience, segment and model input, and suppress the identifiers so a re-import cannot resurrect them.",
      "Ask each vendor holding a copy to delete it and require confirmation.",
      "Write down what is being kept, on what ground, and for how long.",
      "Give the customer that list rather than a blanket confirmation - it is the more accurate answer.",
    ],
    hardPart:
      "Deletion is genuinely partial here, and pretending otherwise is the mistake. Transaction records have a real retention basis, backups run on a cycle nobody documented, the ad platforms hold derived copies, and a public review stays public. The honest response is two lists: deleted, and kept with a reason.",
  },
  {
    id: "rs-stop-session-recording",
    request: "Stop recording what I do on your site",
    requestType: "withdraw-marketing",
    who: "A customer who has realised their scrolling, typing and hesitation on the checkout page were replayed and reviewed.",
    reachesNodeIds: ["session-replay", "consent-capture", "commerce-platform", "recommendation-engine"],
    blockedNodeIds: ["tracking-pixels", "ad-audience-platforms", "archive-backup"],
    steps: [
      "Honour the objection for future sessions, and check that the tool actually respects the signal rather than only hiding the banner.",
      "Delete the recordings already captured for that person where the vendor supports it.",
      "Audit what the replay tool is capturing on form fields - masking is a configuration, and it is frequently left off.",
      "Confirm what the personalisation engine inferred from those sessions, and remove it if it drove segmentation.",
      "Record the objection so a future tag deployment does not silently reinstate it.",
    ],
    hardPart:
      "Most people never knew it was happening, so the objection arrives long after months of sessions were recorded - and the recordings sit with a vendor whose retention setting nobody has looked at since the tag was installed.",
    businessModels: ["website", "omnichannel"],
  },
  {
    id: "rs-who-holds-my-data",
    request: "I bought on the marketplace - is this your data or theirs?",
    requestType: "access",
    who: "A marketplace buyer, who has been sent back and forth between the platform and the brand and wants a straight answer.",
    reachesNodeIds: ["seller-portal", "settlement-report", "channel-migration", "helpdesk", "messaging-platform"],
    blockedNodeIds: ["marketplace-platform", "marketplace-fulfilment", "marketplace-messaging", "archive-backup"],
    steps: [
      "Be straight about the split: the marketplace holds the account and the full record, and you hold whatever you downloaded from the seller portal.",
      "Search what you actually pulled across - order reports, settlement files, buyer messages, any list you exported for your own campaigns.",
      "Say clearly which parts of their request you can act on and which only the marketplace can.",
      "Point them to the marketplace for the rest rather than leaving them circling between you.",
      "If you migrated marketplace buyers into your own marketing, treat that as your data and your responsibility - because it is.",
    ],
    hardPart:
      "The channel-migration file. Brands routinely export marketplace buyer details into their own CRM and campaigns, which makes the brand a controller of data collected under someone else's notice - and that is exactly the copy a buyer never expected you to have.",
    businessModels: ["marketplace", "omnichannel"],
  },
];

export const D2C_BRANDS_INCIDENT_SCENARIOS: IncidentScenario[] = [
  {
    id: "in-lookalike-upload",
    title: "The customer list was uploaded to build a lookalike audience",
    trigger:
      "Found during a review, or when a customer asks how an ad platform knew to target their friend.",
    severity: "critical",
    involvedNodeIds: ["ad-audience-platforms", "analytics-warehouse", "agency-export", "consent-capture"],
    containment: [
      "Pause the campaigns running on that audience and stop any scheduled re-uploads.",
      "Delete the uploaded audience at the platform, and the seed list wherever the agency holds it.",
      "Establish which segments feed it, because they will rebuild it on the next sync if left running.",
    ],
    thenWhat: [
      "Work out what the customers were actually told when their details were collected - in most cases, nothing about advertising.",
      "Rebuild the audience only from people whose choice covers it, and keep a record of that basis.",
      "Give marketing a documented rule about which lists may leave the warehouse and which may not.",
      "Log it, with an owner, rather than treating it as a growth tactic that went slightly far.",
    ],
    prevention:
      "A stated, refusable choice before any contact list is used for advertising, an approval step before any audience upload, and a standing rule that a lookalike is never seeded from people who did not agree to it.",
  },
  {
    id: "in-order-sheet-forwarded",
    title: "An order export was emailed out and forwarded on",
    trigger:
      "Someone outside the business mentions a file they should not have, or a spreadsheet turns up on a personal device.",
    severity: "high",
    involvedNodeIds: ["order-export-sheet", "agency-export", "staff-device", "warehouse-wms"],
    containment: [
      "Establish exactly which file left, how many customers were in it, and which fields it carried.",
      "Recall the mail where the system allows it, and ask every recipient to delete it with confirmation.",
      "Revoke access to any shared folder the file was dropped into.",
    ],
    thenWhat: [
      "Find out why the export existed - it is almost always a workaround for something the platform will not do.",
      "Fix the underlying need with a scoped report or an integration, so the export stops being necessary.",
      "Tell the affected customers where names, addresses and phone numbers went beyond the business.",
      "Restrict who can export at all, and log it when they do.",
    ],
    prevention:
      "Role-limited exports with logging, a scoped integration for the agency instead of a spreadsheet, and a rule that customer files never travel by email or personal device.",
  },
  {
    id: "in-wrong-invoice-in-parcel",
    title: "Another customer's invoice went out in the parcel",
    trigger:
      "A customer photographs it and posts it, or contacts support asking who the other person is.",
    severity: "high",
    involvedNodeIds: ["pick-pack-print", "invoice-tax-system", "warehouse-wms", "courier-network"],
    containment: [
      "Ask the recipient to destroy or return the document, and confirm.",
      "Stop the despatch batch and check whether the mismatch is systematic rather than a one-off.",
      "Identify the customer whose details went out.",
    ],
    thenWhat: [
      "Trace where pick, pack and print came out of sequence - it is usually a printing queue, not a person.",
      "Tell the customer whose name, address and order were disclosed, and to whom.",
      "Review what the invoice actually needs to print: a full address on a document that travels in someone else's box is rarely necessary.",
      "Log it and check for other parcels from the same batch.",
    ],
    prevention:
      "Scan-verified pairing of document to parcel before sealing, minimal detail on anything printed for the box, and a check on the print queue when batches are re-run.",
  },
  {
    id: "in-delivery-agent-contact",
    title: "A delivery agent used a customer's number to contact them privately",
    trigger:
      "The customer complains - usually about repeated calls or messages after the delivery was completed.",
    severity: "high",
    involvedNodeIds: ["courier-network", "delivery-agent", "proof-of-delivery", "whatsapp-support"],
    containment: [
      "Raise it with the courier immediately and ask them to remove that agent from your deliveries pending review.",
      "Confirm what the agent could see - full name, address, phone, and often the order contents.",
      "Support the customer directly rather than routing them to the courier's helpline.",
    ],
    thenWhat: [
      "Establish what the courier's own controls are: masked calling, retention of the delivery record, agent-device policy.",
      "Put those obligations in writing if they are not already, including deletion after delivery.",
      "Check whether the proof-of-delivery record captures more than it needs - a photograph of a doorway with a person in it is personal data.",
      "Record the incident and the courier's response.",
    ],
    prevention:
      "Masked calling so an agent never sees the real number, contractual limits on what the courier and its agents may retain, and a short retention period on proof-of-delivery images.",
  },
  {
    id: "in-support-channel-leak",
    title: "Customer details were pasted into a chat group or an outside tool",
    trigger:
      "Spotted in an internal group, or a customer notices their order details in a screenshot.",
    severity: "high",
    involvedNodeIds: ["whatsapp-support", "helpdesk", "staff-device", "returns-evidence"],
    containment: [
      "Ask for the messages and screenshots to be deleted and confirm, and stop the practice immediately.",
      "Establish what was shared: order details alone, or address, phone and identity documents from a returns claim.",
      "Check whether the same thing is routine in other teams - it usually is.",
    ],
    thenWhat: [
      "Give the team a supported way to do what they were doing, so escalation stops happening in a chat group.",
      "Review what returns evidence you ask for at all - an identity document to process a refund is rarely necessary.",
      "Decide, with advice, whether affected customers should be told.",
      "Set a written rule on what may be shared, where, and by whom.",
    ],
    prevention:
      "Escalation inside the helpdesk rather than in messaging groups, a support view that shows only what the agent needs, minimal returns evidence, and a deletion rule for media received in support.",
  },
  {
    id: "in-session-replay-capture",
    title: "Session replay captured what customers typed",
    trigger:
      "Found while reviewing a recording, or raised by a customer who watched their own replay in a support call.",
    severity: "high",
    involvedNodeIds: ["session-replay", "commerce-platform", "payment-gateway", "fraud-screening"],
    containment: [
      "Turn off recording on checkout and account pages until masking is verified.",
      "Establish which fields were captured in the clear and over what period.",
      "Delete the affected recordings at the vendor.",
    ],
    thenWhat: [
      "Fix the masking configuration and re-test it rather than trusting the default.",
      "Check where the recordings are stored, for how long, and who can watch them.",
      "Assess whether anything captured needs to be treated as a payment-data exposure, with advice.",
      "Give the tool an owner - these are typically installed once and never reviewed.",
    ],
    prevention:
      "Field masking verified on every form before a replay tool goes live, no recording on payment and account pages, a defined retention period, and named access to recordings.",
    businessModels: ["website", "omnichannel"],
  },
  {
    id: "in-seller-portal-export",
    title: "Buyer data was bulk-downloaded from the seller portal",
    trigger:
      "Noticed in the portal's own access log, or when marketplace buyers start receiving your campaigns.",
    severity: "high",
    involvedNodeIds: ["seller-portal", "channel-migration", "marketplace-platform", "messaging-platform"],
    containment: [
      "Stop the campaign and pause any list built from marketplace buyer data.",
      "Establish who downloaded what, when, and where the file went.",
      "Rotate the seller-portal credentials and remove any shared login.",
    ],
    thenWhat: [
      "Recognise the position honestly: marketing to those buyers makes you a controller of data collected under the marketplace's notice, not theirs.",
      "Delete the migrated list unless you have a basis of your own for contacting them.",
      "Check the marketplace's own terms on buyer data use, and your obligations under them.",
      "Log it and restrict portal access to named individuals.",
    ],
    prevention:
      "Named seller-portal logins with no shared credentials, a written rule that marketplace buyer data is not migrated into brand marketing, and monitoring of bulk downloads.",
    businessModels: ["marketplace", "omnichannel"],
  },
  {
    id: "in-clienteling-misuse",
    title: "A store associate used clienteling data personally",
    trigger:
      "A customer complains about being contacted on their personal number by a member of store staff.",
    severity: "medium",
    involvedNodeIds: ["store-clienteling", "sales-associate", "pos-terminal", "cdp-identity-resolution"],
    containment: [
      "Suspend that associate's access to the clienteling app while it is looked into.",
      "Establish what the app exposes: purchase history, contact details, spend band, visit frequency.",
      "Contact the customer directly and take the complaint seriously.",
    ],
    thenWhat: [
      "Review what an associate genuinely needs to see on the shop floor - it is far less than most clienteling tools show.",
      "Introduce logging so outreach from the app is recorded and attributable.",
      "Make the boundary explicit in training: a customer's number is the brand's, not the associate's.",
      "Record the incident and the outcome.",
    ],
    prevention:
      "A shop-floor view limited to what serving the customer requires, outreach only through logged brand channels, and access removed the day someone leaves.",
    businessModels: ["omnichannel"],
  },
];
