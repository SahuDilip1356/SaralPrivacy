// D2C customer lifecycle - 10 canonical stages.
// A customer's data enters before they ever buy (an ad impression, a pixel) and
// keeps accumulating through checkout, payment, the warehouse, a courier, a
// support ticket, a return, a loyalty programme and years of marketing
// databases. The stage spine is the SAME for all three operating models
// (own website / marketplace-first / omnichannel); what changes is the SYSTEMS
// standing at each stage, carried by node gating - so switching the model never
// reshuffles the journey, it repopulates it.

import type { FlowStage } from "../../../data-flow/schemas.ts";

export const D2C_BRANDS_STAGES: FlowStage[] = [
  {
    id: "discovery",
    name: "Ads, discovery & tracking",
    sequence: 1,
    summary:
      "A person sees an ad, a creator's post, a search result or a marketplace listing. Pixels, tags and platform consoles start observing them before they have given a name, an email or any choice.",
    dpdpaNote:
      "Know every tag on your storefront and what it sends where. Keep the site working without optional advertising trackers, give notice before those fire, and be able to stop them when someone says no.",
  },
  {
    id: "browsing",
    name: "Browsing, search & personalisation",
    sequence: 2,
    summary:
      "The customer browses, searches, adds to cart and gets recommendations. Behaviour is recorded and turned into a profile - product affinity, price sensitivity, intent - long before an order exists.",
    dpdpaNote:
      "Behavioural profiling is processing you must be able to explain. Mask form fields in replay tools, keep browsing history to a defined window, and do not quietly attach an anonymous session to a named customer.",
  },
  {
    id: "checkout",
    name: "Account, cart & checkout",
    sequence: 3,
    summary:
      "The customer creates an account or checks out as a guest. Name, mobile, email and delivery address are captured - and marketing permission is very often bundled into the same click that pays for the order.",
    dpdpaNote:
      "Separate the order from the marketing. Ask only for what fulfilment needs, never pre-tick a promotional box, and record what the customer actually agreed to and when.",
  },
  {
    id: "payment",
    name: "Payment, fraud screening & invoicing",
    sequence: 4,
    summary:
      "Payment is taken, screened for fraud and invoiced. Transaction references, failed-payment history and automated risk scores are created across systems the brand does not run.",
    dpdpaNote:
      "Never store card details yourself. Keep tax and transaction records under their own retention rule - not the marketing one - and keep a human able to review any automated fraud decision.",
  },
  {
    id: "fulfilment",
    name: "Order management, warehouse & packing",
    sequence: 5,
    summary:
      "The paid order reaches operations. Full customer details are exported to spreadsheets, printed onto pick lists and packing slips, and handled by warehouse staff who only need part of them.",
    dpdpaNote:
      "Give the warehouse the minimum a parcel needs. Control who can export order data, destroy printed lists once the parcel ships, and remember temporary staff are covered by the same duty.",
  },
  {
    id: "delivery",
    name: "Shipping & last-mile delivery",
    sequence: 6,
    summary:
      "Name, mobile number and address leave the brand for an aggregator, a courier and an individual delivery agent's phone - and come back as tracking events, delivery photos and call logs.",
    dpdpaNote:
      "Share the minimum with logistics partners, use masked calling where the platform offers it, and put the retention and reuse limits in the contract - not just in the conversation.",
  },
  {
    id: "support",
    name: "Customer support & complaints",
    sequence: 7,
    summary:
      "The customer asks a question, complains or sends a photo of a damaged product - across a helpdesk, email, marketplace messaging, a call centre, Instagram DMs and personal WhatsApp at the same time.",
    dpdpaNote:
      "Keep support in official channels with defined access, set a retention period on call recordings and chat evidence, and be able to find every conversation when the customer asks what you hold.",
  },
  {
    id: "returns",
    name: "Returns, refunds & reverse logistics",
    sequence: 8,
    summary:
      "A return creates a second file: reason codes, product photographs from the customer's home, quality notes, refund records - and, quietly, a fraud or abuse label attached to the person.",
    dpdpaNote:
      "Collect only the evidence the dispute needs, keep the photographs for a defined period, and let a customer see and correct an inaccurate 'abuse' or 'high-return' label attached to them.",
  },
  {
    id: "marketing",
    name: "Reviews, loyalty & marketing",
    sequence: 9,
    summary:
      "A completed purchase becomes an ongoing relationship: review requests, loyalty points, referral links, lifecycle campaigns - and the customer list uploaded to ad platforms as a custom or lookalike audience.",
    dpdpaNote:
      "Keep marketing separate from order updates, honour a withdrawal in every channel and every audience it reached, and make loyalty profiling something the customer can see and step out of.",
  },
  {
    id: "retention",
    name: "Archives, analytics, backups & deletion",
    sequence: 10,
    summary:
      "Long after the order, the customer still exists in the commerce database, the CRM, the warehouse, finance records, analytics, the agency's exports, vendor systems and backups. Deleting the account reaches almost none of them.",
    dpdpaNote:
      "Write retention rules per record type, separate what the law requires you to keep from what marketing would like to keep, and build a deletion path that reaches vendors, agencies, audiences and backups.",
  },
];
