// Data groups a D2C brand holds about one customer. The four `derived`
// categories are the D2C signature: browsing behaviour, the customer profile,
// the fraud/abuse flag and everything built on top of them are CREATED by the
// brand and its platforms - the customer never handed them over, usually cannot
// see them, and they are what actually drives the marketing.
//
// `gift-recipient-data` and `health-wellness` are the two categories that most
// often sit outside the brand's own consent story: a recipient who never dealt
// with the brand, and purchase history that quietly reveals a health condition.

import type { DataCategory } from "../../../data-flow/schemas.ts";

export const D2C_BRANDS_DATA_CATEGORIES: DataCategory[] = [
  {
    id: "identity",
    name: "Customer identity",
    kind: "provided",
    examples: ["Name", "Customer ID", "Account login", "Date of birth on a birthday club"],
  },
  {
    id: "contact",
    name: "Contact data",
    kind: "provided",
    examples: ["Mobile number", "Email", "WhatsApp number", "Alternate contact"],
  },
  {
    id: "address-delivery",
    name: "Delivery & billing address",
    kind: "provided",
    examples: ["Shipping address", "Billing address", "Pincode", "Landmark", "Delivery instructions"],
  },
  {
    id: "order-transaction",
    name: "Order & transaction data",
    kind: "provided",
    examples: ["Order ID", "Items bought", "Order value", "Coupon used", "Engraving or personalisation text", "Uploaded design file"],
  },
  {
    id: "payment-financial",
    name: "Payment & financial data",
    kind: "provided",
    examples: ["UPI reference", "Card token", "Payment status", "Refund record", "COD status", "Settlement line"],
  },
  {
    id: "device-tracking",
    name: "Device & tracking identifiers",
    kind: "provided",
    examples: ["IP address", "Cookie ID", "Advertising ID", "Device and browser", "Approximate location"],
  },
  {
    id: "browsing-behaviour",
    name: "Browsing & session behaviour",
    kind: "derived",
    examples: ["Pages viewed", "Search terms", "Cart additions", "Session replay", "Abandonment event", "Wishlist"],
  },
  {
    id: "marketing-preference",
    name: "Marketing permission & preferences",
    kind: "provided",
    examples: ["Opt-in status", "Channel preference", "Unsubscribe", "Suppression list entry", "Consent timestamp"],
  },
  {
    id: "support-grievance",
    name: "Support & complaint records",
    kind: "provided",
    examples: ["Ticket", "Chat transcript", "Call recording", "Complaint", "Escalation note", "Social DM"],
  },
  {
    id: "returns-evidence",
    name: "Returns & product evidence",
    kind: "provided",
    examples: ["Return reason", "Photo of the product at home", "Quality-check note", "Refund decision", "Reverse pickup detail"],
  },
  {
    id: "loyalty-rewards",
    name: "Loyalty, reviews & referrals",
    kind: "provided",
    examples: ["Loyalty ID", "Points balance", "Tier", "Published review", "Referral relationship"],
  },
  {
    id: "gift-recipient-data",
    name: "Gift recipient details",
    kind: "provided",
    examples: ["Recipient name", "Recipient address", "Recipient mobile", "Gift message"],
  },
  {
    id: "health-wellness",
    name: "Health & wellness indicators",
    kind: "provided",
    examples: ["Skin or hair concern", "Body measurements", "Wellness quiz answers", "Supplement or intimate-care purchase history"],
  },
  {
    id: "customer-profile",
    name: "Customer profile & segments",
    kind: "derived",
    examples: ["Segment", "Lifetime value", "Churn risk", "Purchase propensity", "Product affinity", "Lookalike audience membership"],
  },
  {
    id: "fraud-risk-flag",
    name: "Fraud & risk flags",
    kind: "derived",
    examples: ["Fraud score", "High-return / abuse label", "Failed-payment history", "COD refusal record", "Blocklist entry"],
  },
];
