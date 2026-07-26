// The curated 8 hotspots for a D2C brand, ranked worst-first. Buckets map to the
// d2c-brands assessment pack (customer_data_collection / marketing_consent /
// tracking_adtech / vendor_fulfilment / retention_preferences) - every bucket is
// reachable from the map.
//
// The signature exposure leads: for a D2C brand the customer list IS the asset,
// and the single most common thing done with it - uploading it to ad platforms
// as a custom or lookalike audience - is the one the customer was never told
// about and cannot escape by unsubscribing.
//
// Each hotspot's node lands on a DIFFERENT first stage (marketing, checkout,
// support, fulfilment, delivery, discovery, returns, retention), so the journey
// shows eight distinct red flags and the counter reads eight. All eight nodes
// are ungated, so the count holds in all three operating models.

import type { FlowHotspot } from "../../../data-flow/schemas.ts";

export const D2C_BRANDS_HOTSPOTS: FlowHotspot[] = [
  {
    id: "hs-ad-audiences",
    rank: 1,
    nodeId: "ad-audience-platforms",
    title: "Your customer list becomes an advertising audience",
    whatHappens: "Contact details and purchase history are uploaded from the CRM to Meta and Google as a custom audience, and lookalike audiences are generated from them - by the brand, and often again by the agency in its own ad account.",
    whyItMatters: "This is the largest single transfer a D2C brand makes, and the most invisible. The customer was told about a newsletter, not about being matched inside an ad platform; unsubscribing from email does not remove them from a live audience; and most brands cannot say which lists are still sitting in which ad account.",
    dataCategoryIds: ["contact", "identity", "customer-profile", "order-transaction"],
    action: "Stop routine list uploads, name audience activation in your notice and take a separate permission for it, delete audiences when the campaign ends, push every withdrawal into the ad accounts, and audit which agency logins still have access.",
    assessmentBucket: "tracking_adtech",
  },
  {
    id: "hs-bundled-consent",
    rank: 2,
    nodeId: "consent-capture",
    title: "Marketing permission is bundled into the order",
    whatHappens: "A pre-ticked box at checkout, a line buried in the terms, a number taken at the till, or simply the assumption that buying once is an invitation to message for ever - and no record of what the customer actually agreed to.",
    whyItMatters: "Everything downstream inherits this. If the permission behind the list is unclear, then every campaign, broadcast and audience built from it is unclear too - and when a customer objects, there is no evidence of what they were asked and no reliable way to stop it in every channel.",
    dataCategoryIds: ["marketing-preference", "contact", "identity"],
    action: "Ask about marketing separately from the purchase, never pre-tick, store the choice and its timestamp on the customer record, and make that record the single source every channel checks before sending.",
    assessmentBucket: "marketing_consent",
  },
  {
    id: "hs-whatsapp-support",
    rank: 3,
    nodeId: "whatsapp-support",
    title: "Customer records scatter into personal WhatsApp",
    whatHappens: "Complaints, addresses, payment screenshots, photos taken inside the customer's home and the occasional health question all arrive on a chat app - frequently on a team member's personal phone rather than a business account.",
    whyItMatters: "There is no access control, no retention and no export. When a customer asks what you hold about them, this channel cannot be searched; when a team member leaves, the whole history leaves with the handset.",
    dataCategoryIds: ["support-grievance", "contact", "identity", "returns-evidence"],
    action: "Move support to an official business account routed into the helpdesk, ban customer conversations on personal numbers, set a deletion rule for media, and make sure a rights request can actually reach this channel.",
    assessmentBucket: "customer_data_collection",
  },
  {
    id: "hs-order-exports",
    rank: 4,
    nodeId: "order-export-sheet",
    title: "Order exports become a permanent second database",
    whatHappens: "Orders are pulled out of the platform - or the seller portal - into Google Sheets and Excel for dispatch, reconciliation and reporting, then forwarded, copied into other folders and never deleted.",
    whyItMatters: "The spreadsheet becomes a customer database nobody administers. It keeps working for ex-staff and agencies, it is invisible to every access, correction and deletion request made against the real system, and it is the most common way an entire customer list leaves a brand.",
    dataCategoryIds: ["identity", "contact", "address-delivery", "order-transaction"],
    action: "Restrict who can export, delete the raw file once it has been used, keep an exports register, replace recurring downloads with a permissioned view, and sweep old sheets out of shared drives.",
    assessmentBucket: "vendor_fulfilment",
  },
  {
    id: "hs-courier-data",
    rank: 5,
    nodeId: "courier-network",
    title: "Couriers and delivery agents keep name, number and address",
    whatHappens: "Every parcel sends the customer's name, mobile number and full address to an aggregator, a courier and finally an individual delivery agent's personal phone - and back come tracking events, delivery photographs and call logs.",
    whyItMatters: "This is the brand's largest routine external transfer, and the one with the least oversight: no stated retention, no visibility into onward use, and a well-known pattern of delivery numbers being reused for calls that have nothing to do with the order.",
    dataCategoryIds: ["identity", "contact", "address-delivery"],
    action: "Share the minimum fields a delivery needs, insist on masked calling, put retention, reuse and deletion terms into the logistics contract, and ask what the aggregator still holds for orders you shipped last year.",
    assessmentBucket: "vendor_fulfilment",
  },
  {
    id: "hs-tracking-before-choice",
    rank: 6,
    nodeId: "tracking-pixels",
    title: "Tracking starts before the visitor has any choice",
    whatHappens: "Meta Pixel, Google tags, analytics and whatever the previous agency installed fire as the page loads, sending device, cookie and behaviour data to outside platforms before a banner has been answered - and old tags nobody owns keep firing for years.",
    whyItMatters: "Data about a person leaves for several companies before that person has been told anything, and most brands cannot produce a list of what is installed on their own storefront or say who receives what.",
    dataCategoryIds: ["device-tracking", "browsing-behaviour"],
    action: "Inventory every tag and its purpose, keep the store working without the optional ones, hold those until the visitor has seen the notice and chosen, delete tags nobody can name an owner for, and re-check after each theme or agency change.",
    assessmentBucket: "tracking_adtech",
  },
  {
    id: "hs-returns-labels",
    rank: 7,
    nodeId: "returns-evidence",
    title: "Return photos and risk labels build a second profile",
    whatHappens: "A return collects photographs taken inside the customer's home, quality notes and refund records - and attaches a 'high return' or 'abuse' label to the person that shapes how their future orders are treated.",
    whyItMatters: "The label is an inference the brand created, not something the customer provided. They were never told it exists, cannot see it, cannot correct it, and may be refused COD or blocked because of it.",
    dataCategoryIds: ["returns-evidence", "fraud-risk-flag", "identity"],
    action: "Collect only the evidence the dispute needs, delete photographs once it closes, write down how a risk label is set and reviewed, and give a customer a way to challenge one that is wrong.",
    assessmentBucket: "customer_data_collection",
  },
  {
    id: "hs-deletion-gap",
    rank: 8,
    nodeId: "archive-backup",
    title: "Deleting the account does not reach the copies",
    whatHappens: "Deleting a customer from the storefront leaves them intact in the CRM, the analytics warehouse, the old exports, the finance archive, the agency's files, the courier's records, the ad audiences and every backup.",
    whyItMatters: "This is the question the whole map exists to answer. If a customer asks you to delete their data tomorrow, the honest answer for most brands is that they do not know where all the copies are - and the ones they can name, they mostly cannot reach.",
    dataCategoryIds: ["identity", "contact", "address-delivery", "order-transaction", "customer-profile"],
    action: "List every place customer data lands, write a retention rule per record type, separate what the law requires you to keep from what marketing would like to keep, and build a deletion path that reaches vendors, agencies, audiences and backups.",
    assessmentBucket: "retention_preferences",
  },
];
