// ─────────────────────────────────────────────────────────────────────────────
// SaralPrivacy — Industry Assessment · D2C Brands pack (4th industry)
// "D2C Brand DPDPA Risk Scan" — a marketing-data control risk scan.
// Caps for Q1–Q10 sum to 110; the engine normalises by Σ caps automatically.
// Built on the shared engine (zero engine changes). See:
//   docs/SaralPrivacy_D2C_Assessment_v2_Spec.md
//
// Thesis: most D2C brands don't have a customer-data problem — they have a
// marketing-data *control* problem (consent, preferences, pixels, vendors,
// retention). Two-lens: exposure = Q1,Q2,Q7,Q8 (50) · control = Q3,Q4,Q5,Q6,Q9,Q10 (60).
// ─────────────────────────────────────────────────────────────────────────────

import {
  IndustryPack,
  IAQuestion,
  IABucket,
  IAOverride,
  IAFlagRule,
  IAResult,
  IAAnswers,
  selectedIds,
} from "../core";
import type { BandLabel } from "../bands";

// ── Buckets (5) ────────────────────────────────────────────────────────────────

const BUCKETS: IABucket[] = [
  {
    key: "customer_data_collection",
    label: "Customer data collection risk",
    meaning: "Customer data may be collected across many storefronts, marketplaces and channels.",
  },
  {
    key: "marketing_consent",
    label: "Marketing consent risk",
    meaning: "Promotional WhatsApp/SMS/email or lifecycle campaigns may lack strong opt-in evidence.",
  },
  {
    key: "tracking_adtech",
    label: "Tracking & adtech risk",
    meaning: "Pixels, retargeting or analytics tools may create hidden customer-data flows.",
  },
  {
    key: "vendor_fulfilment",
    label: "Vendor & fulfilment risk",
    meaning: "Payment, logistics, CRM, plugin or agency vendors may receive customer data.",
  },
  {
    key: "retention_preferences",
    label: "Retention & preference readiness risk",
    meaning: "Old customer data and opt-outs may not be managed consistently.",
  },
];

// option-id groups reused by overrides/flags
const PROMO_CHANNELS = ["whatsapp_promotions", "sms_campaigns", "email_offers"];
const PROFILING_LIFECYCLE = ["recommendations", "segmentation_lookalike"];
const UNCLEAR_TRACKING = ["agency_scripts", "not_sure"];

// ── Questions (10) ───────────────────────────────────────────────────────────

const QUESTIONS: IAQuestion[] = [
  // ─── Q1 Store profile ──────────────────────────────────────────────────
  {
    id: "q1",
    badge: "Store Profile",
    question: "How does your brand sell to customers?",
    helpText: "Select all that apply. This helps estimate where your customer data spreads.",
    whyThisMatters:
      "Selling across your own store, Instagram/WhatsApp, marketplaces and physical retail at once means customer data is collected and copied in more places — which is harder to govern.",
    type: "multi",
    cap: 8,
    bucket: "customer_data_collection",
    layer: "exposure",
    mutuallyExclusive: ["not_sure"],
    options: [
      { id: "shopify_woo", label: "Own store on Shopify / WooCommerce", riskPoints: 2 },
      { id: "instagram_whatsapp", label: "Instagram / WhatsApp commerce", riskPoints: 3 },
      { id: "marketplace_seller", label: "Marketplace seller (Amazon, Flipkart, Nykaa, Myntra…)", riskPoints: 3 },
      { id: "custom_website", label: "Custom-built website / app", riskPoints: 2 },
      { id: "subscription_box", label: "Subscription / replenishment box", riskPoints: 3 },
      { id: "omnichannel_retail", label: "Online + physical stores (omnichannel)", riskPoints: 3 },
      { id: "quick_commerce", label: "Quick-commerce listings (Blinkit, Zepto, Instamart)", riskPoints: 2 },
      { id: "other", label: "Other", riskPoints: 1 },
      { id: "not_sure", label: "Not sure", riskPoints: 4 },
    ],
  },

  // ─── Q2 Customer data ──────────────────────────────────────────────────
  {
    id: "q2",
    badge: "Customer Data Risk",
    question: "Which customer data do you collect or store?",
    helpText: "Select all the customer data your brand collects across checkout, accounts, support and marketing.",
    whyThisMatters:
      "Contact and order data is already personal data. Saved accounts, behavioural data, health/body data and customer lists exported from marketplaces create much higher exposure.",
    type: "multi",
    cap: 14,
    bucket: "customer_data_collection",
    layer: "exposure",
    mutuallyExclusive: ["not_sure"],
    options: [
      { id: "contact_basic", label: "Name, phone, email and delivery address", riskPoints: 2 },
      { id: "order_history", label: "Order history and purchase value", riskPoints: 2 },
      { id: "payment_info", label: "Saved cards / UPI / payment details", riskPoints: 3 },
      { id: "accounts_passwords", label: "Customer accounts and passwords", riskPoints: 4 },
      { id: "browsing_behaviour", label: "Browsing, cart and click behaviour", riskPoints: 4 },
      { id: "reviews_ugc", label: "Reviews, photos or UGC showing customers", riskPoints: 4 },
      { id: "location_precise", label: "Precise location / address-level data", riskPoints: 3 },
      { id: "health_body", label: "Skin, hair, body, health or wellness data", riskPoints: 7, badge: "SENSITIVE", badgeColor: "red" },
      { id: "marketplace_exports", label: "Customer data downloaded / exported from marketplaces", riskPoints: 6, badge: "HIGH RISK", badgeColor: "red" },
      { id: "other", label: "Other customer data", riskPoints: 1 },
      { id: "not_sure", label: "Not sure", riskPoints: 8 },
    ],
  },

  // ─── Q3 Customer communication ─────────────────────────────────────────
  {
    id: "q3",
    badge: "Customer Communication Risk",
    question: "How do you message customers?",
    helpText: "Select all channels you use to reach customers — both order updates and promotional campaigns.",
    whyThisMatters:
      "Order/shipping updates are usually fine. Promotional WhatsApp, SMS and email need clear opt-in — and using many channels with no central preference makes opt-outs hard to honour.",
    type: "multi",
    cap: 10,
    bucket: "marketing_consent",
    layer: "control",
    mutuallyExclusive: ["not_sure"],
    options: [
      { id: "transactional_only", label: "Only order and shipping updates (no promotions)", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "email_offers", label: "Promotional email campaigns", riskPoints: 3 },
      { id: "sms_campaigns", label: "Promotional SMS campaigns", riskPoints: 4 },
      { id: "whatsapp_promotions", label: "Promotional WhatsApp broadcasts", riskPoints: 5, badge: "RISK", badgeColor: "amber" },
      { id: "multiple_no_preference", label: "Many channels, no central preference for the customer", riskPoints: 7, badge: "HIGH RISK", badgeColor: "red" },
      { id: "not_sure", label: "Not sure", riskPoints: 6 },
    ],
  },

  // ─── Q4 Marketing consent ──────────────────────────────────────────────
  {
    id: "q4",
    badge: "Marketing Consent",
    question: "How do you get permission to send marketing messages?",
    helpText: "Choose the option closest to how customers end up on your marketing lists.",
    whyThisMatters:
      "Under DPDPA, marketing needs a clear, informed opt-in. A purchase, a pre-ticked box, or messaging people until they complain are weak or absent consent.",
    type: "single",
    cap: 12,
    bucket: "marketing_consent",
    layer: "control",
    options: [
      { id: "explicit_optin", label: "Clear opt-in / checkbox before any marketing", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "checkbox_prechecked", label: "A pre-ticked checkbox at checkout", riskPoints: 7, badge: "RISK", badgeColor: "amber" },
      { id: "implied_purchase", label: "We treat a purchase as permission to market", riskPoints: 8, badge: "RISK", badgeColor: "amber" },
      { id: "bought_lists", label: "We use bought or imported contact lists", riskPoints: 10, badge: "HIGH RISK", badgeColor: "red" },
      { id: "send_until_complain", label: "We message everyone until they complain or unsubscribe", riskPoints: 12, badge: "HIGH RISK", badgeColor: "red" },
      { id: "not_sure", label: "Not sure", riskPoints: 8 },
    ],
  },

  // ─── Q5 Unsubscribe & preferences ──────────────────────────────────────
  {
    id: "q5",
    badge: "Unsubscribe & Preference Management",
    question: "How can a customer stop your marketing messages?",
    helpText: "Think about WhatsApp, SMS and email together — not just one channel.",
    whyThisMatters:
      "Customers have a right to withdraw consent. Opt-out must be easy and honoured across every channel, not just an email unsubscribe link.",
    type: "single",
    cap: 10,
    bucket: "retention_preferences",
    layer: "control",
    options: [
      { id: "easy_unsubscribe", label: "One-click opt-out, honoured across all channels", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "unsubscribe_email_only", label: "Unsubscribe works in email, but not WhatsApp/SMS", riskPoints: 5 },
      { id: "manual_on_request", label: "We remove people manually when they ask", riskPoints: 7, badge: "RISK", badgeColor: "amber" },
      { id: "no_clear_process", label: "No clear unsubscribe / opt-out process", riskPoints: 10, badge: "HIGH RISK", badgeColor: "red" },
      { id: "not_sure", label: "Not sure", riskPoints: 8 },
    ],
  },

  // ─── Q6 Lifecycle marketing ────────────────────────────────────────────
  {
    id: "q6",
    badge: "Lifecycle Marketing Risk",
    question: "Which automated or targeted marketing do you run?",
    helpText: "Select all the automated flows, personalisation or ad-audience features you use.",
    whyThisMatters:
      "Cart-abandonment, recommendations, segmentation and lookalike audiences profile customers and share data with ad platforms — which needs consent and disclosure.",
    type: "multi",
    cap: 10,
    bucket: "marketing_consent",
    layer: "control",
    mutuallyExclusive: ["no_lifecycle", "not_sure"],
    options: [
      { id: "cart_abandonment", label: "Cart-abandonment messages", riskPoints: 3 },
      { id: "win_back", label: "Win-back / re-engagement campaigns", riskPoints: 3 },
      { id: "birthday_loyalty", label: "Birthday / loyalty automations", riskPoints: 2 },
      { id: "recommendations", label: "Personalised product recommendations", riskPoints: 4 },
      { id: "segmentation_lookalike", label: "Customer segmentation / lookalike audiences for ads", riskPoints: 6, badge: "RISK", badgeColor: "amber" },
      { id: "no_lifecycle", label: "We don't run automated or targeted campaigns", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "not_sure", label: "Not sure", riskPoints: 6 },
    ],
  },

  // ─── Q7 Tracking & adtech ──────────────────────────────────────────────
  {
    id: "q7",
    badge: "Tracking & Adtech Risk",
    question: "Which tracking or analytics run on your store?",
    helpText: "Select all pixels, tags, analytics and recording tools installed on your website or app.",
    whyThisMatters:
      "Pixels and tags send customer behaviour to ad platforms. The biggest risk is tracking you can't account for — agency-managed or unknown scripts running on your store.",
    type: "multi",
    cap: 14,
    bucket: "tracking_adtech",
    layer: "exposure",
    mutuallyExclusive: ["no_tracking", "not_sure"],
    options: [
      { id: "meta_pixel", label: "Meta / Facebook Pixel", riskPoints: 4 },
      { id: "google_analytics", label: "Google Analytics", riskPoints: 3 },
      { id: "google_ads_tag", label: "Google Ads / conversion tag", riskPoints: 3 },
      { id: "other_pixels", label: "TikTok / Pinterest / Snap pixels", riskPoints: 4 },
      { id: "session_recording", label: "Session recording (Hotjar, Clarity…)", riskPoints: 5, badge: "RISK", badgeColor: "amber" },
      { id: "agency_scripts", label: "Agency-managed or unknown tracking scripts", riskPoints: 8, badge: "HIGH RISK", badgeColor: "red" },
      { id: "no_tracking", label: "No tracking or pixels", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "not_sure", label: "Not sure", riskPoints: 8 },
    ],
  },

  // ─── Q8 Vendor & fulfilment ────────────────────────────────────────────
  {
    id: "q8",
    badge: "Vendor & Fulfilment Risk",
    question: "Which partners or tools receive your customer data?",
    helpText: "Select all third parties that touch customer data — payment, logistics, marketing tools, plugins and agencies.",
    whyThisMatters:
      "Every vendor that receives customer data is a data processor you're responsible for. Plugins and agencies are the easiest to lose track of.",
    type: "multi",
    cap: 14,
    bucket: "vendor_fulfilment",
    layer: "exposure",
    mutuallyExclusive: ["no_vendors", "not_sure"],
    options: [
      { id: "payment_gateway", label: "Payment gateway (Razorpay, PayU, Stripe…)", riskPoints: 2 },
      { id: "logistics", label: "Courier / logistics partners", riskPoints: 3 },
      { id: "email_sms_tools", label: "Email / SMS / WhatsApp marketing platforms", riskPoints: 3 },
      { id: "crm_helpdesk", label: "CRM, support or helpdesk tools", riskPoints: 3 },
      { id: "marketplace_platforms", label: "Marketplace seller platforms", riskPoints: 3 },
      { id: "plugins_apps", label: "Third-party Shopify / WooCommerce plugins & apps", riskPoints: 5, badge: "RISK", badgeColor: "amber" },
      { id: "marketing_agency", label: "External marketing / ads agency handles our data", riskPoints: 5, badge: "RISK", badgeColor: "amber" },
      { id: "no_vendors", label: "None / we don't share data with vendors", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "not_sure", label: "Not sure", riskPoints: 7 },
    ],
  },

  // ─── Q9 Admin & account access ─────────────────────────────────────────
  {
    id: "q9",
    badge: "Admin & Account Access Risk",
    question: "Who can access your store admin and customer data?",
    helpText: "This includes your store dashboard, marketing tools, exports and customer lists.",
    whyThisMatters:
      "Shared logins and access that's never revoked are among the most common control gaps — especially when agencies or ex-staff keep access to customer data.",
    type: "single",
    cap: 10,
    bucket: "vendor_fulfilment",
    layer: "control",
    options: [
      { id: "role_based", label: "Role-based access, reviewed periodically", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "owner_only", label: "Only the owner / founder has access", riskPoints: 2 },
      { id: "shared_logins", label: "Shared logins across the team or agency", riskPoints: 8, badge: "HIGH RISK", badgeColor: "red" },
      { id: "ex_staff_agency_access", label: "Ex-staff or agencies may still have access", riskPoints: 10, badge: "HIGH RISK", badgeColor: "red" },
      { id: "not_sure", label: "Not sure", riskPoints: 8 },
    ],
  },

  // ─── Q10 Retention & preference readiness ──────────────────────────────
  {
    id: "q10",
    badge: "Retention & Preference Readiness",
    question: "How do you manage old customer data and deletion requests?",
    helpText: "Think about inactive customers, old exports, and customers asking to be removed.",
    whyThisMatters:
      "Customers can ask to access, correct or delete their data. Keeping everything forever with no deletion process turns your customer database into standing risk.",
    type: "single",
    cap: 8,
    bucket: "retention_preferences",
    layer: "control",
    options: [
      { id: "documented_retention", label: "Documented retention + deletion process", riskPoints: 0, badge: "GOOD", badgeColor: "green" },
      { id: "defined_not_documented", label: "We clean up sometimes, but it's not documented", riskPoints: 3 },
      { id: "keep_forever", label: "We keep all customer data indefinitely", riskPoints: 8, badge: "RISK", badgeColor: "red" },
      { id: "not_sure", label: "Not sure", riskPoints: 7 },
    ],
  },
];

// ── Override + flag helpers ──────────────────────────────────────────────────

const has = (a: IAAnswers, qid: string, optId: string) =>
  selectedIds(a[qid]).includes(optId);
const anyOf = (a: IAAnswers, qid: string, optIds: string[]) =>
  selectedIds(a[qid]).some((id) => optIds.includes(id));

// ── Overrides (raise-only) ────────────────────────────────────────────────────
// Max band reached here is High Risk — no Critical override; the engine still
// allows Critical purely via raw score.

const OVERRIDES: IAOverride[] = [
  {
    id: "promos_no_optin",
    minBand: "High Risk",
    severity: 9,
    test: (a) => has(a, "q4", "send_until_complain"),
    flag: "Customers are messaged until they complain or unsubscribe — marketing without a clear opt-in.",
  },
  {
    id: "no_unsubscribe",
    minBand: "High Risk",
    severity: 9,
    test: (a) => has(a, "q5", "no_clear_process"),
    flag: "There is no clear way for customers to opt out — a core DPDPA gap on withdrawing consent.",
  },
  {
    id: "shared_or_exstaff_access",
    minBand: "High Risk",
    severity: 8,
    test: (a) => anyOf(a, "q9", ["shared_logins", "ex_staff_agency_access"]),
    flag: "Shared logins or ex-staff / agency access mean customer data can be reached by people who shouldn't have it.",
  },
  {
    id: "marketplace_reuse_promo",
    minBand: "High Risk",
    severity: 8,
    test: (a) => has(a, "q2", "marketplace_exports") && anyOf(a, "q3", PROMO_CHANNELS),
    flag: "Customer data exported from marketplaces is being reused for WhatsApp/SMS/email marketing — usually without consent.",
  },
  {
    id: "health_profiling",
    minBand: "High Risk",
    severity: 8,
    test: (a) => has(a, "q2", "health_body") && anyOf(a, "q6", PROFILING_LIFECYCLE),
    flag: "Skin/health/body data is being used for recommendations or ad targeting — sensitive data used for profiling.",
  },
  {
    id: "tracking_unclear_profiling",
    minBand: "High Risk",
    severity: 7,
    test: (a) => anyOf(a, "q7", UNCLEAR_TRACKING) && has(a, "q6", "segmentation_lookalike"),
    flag: "Unaccounted tracking scripts feed segmentation / lookalike audiences — hidden profiling of your customers.",
  },
  {
    id: "no_pref_no_unsub",
    minBand: "High Risk",
    severity: 7,
    test: (a) => has(a, "q3", "multiple_no_preference") && has(a, "q5", "no_clear_process"),
    flag: "Many marketing channels, no central preference and no opt-out — customers can't control what they receive.",
  },
  {
    id: "tracking_unclear",
    minBand: "Moderate Risk",
    severity: 5,
    test: (a) => anyOf(a, "q7", UNCLEAR_TRACKING),
    flag: "Agency-managed or unknown tracking scripts run on your store without a clear inventory or disclosure.",
  },
  {
    id: "no_central_preference",
    minBand: "Moderate Risk",
    severity: 5,
    test: (a) => has(a, "q3", "multiple_no_preference"),
    flag: "Marketing goes out across many channels with no central customer preference to honour opt-outs.",
  },
];

// ── Soft flags (no band change; fill the top-3 when few overrides fire) ───────

const SOFT_FLAGS: IAFlagRule[] = [
  {
    id: "data_sprawl",
    severity: 6,
    test: (a) => anyOf(a, "q2", ["marketplace_exports", "accounts_passwords", "browsing_behaviour"]),
    flag: "Customer data may spread across storefronts, accounts, behavioural tracking and marketplace exports without a single source of truth.",
  },
  {
    id: "health_data",
    severity: 6,
    test: (a) => has(a, "q2", "health_body"),
    flag: "Skin, health or body data is collected — this is sensitive data and needs stronger consent, purpose limits and access controls.",
  },
  {
    id: "promo_consent_weak",
    severity: 6,
    test: (a) => anyOf(a, "q4", ["checkbox_prechecked", "implied_purchase", "bought_lists"]),
    flag: "Marketing consent may be weak — a pre-ticked box, an implied purchase, or bought lists are not a clear opt-in.",
  },
  {
    id: "tracking_breadth",
    severity: 5,
    test: (a) => anyOf(a, "q7", ["meta_pixel", "other_pixels", "session_recording"]),
    flag: "Pixels, retargeting tags or session recording send customer behaviour to third parties — these need disclosure and consent.",
  },
  {
    id: "vendor_sprawl",
    severity: 5,
    test: (a) => anyOf(a, "q8", ["plugins_apps", "marketing_agency"]),
    flag: "Plugins, apps or an external agency receive customer data — easy to lose track of, and each is a processor you're responsible for.",
  },
  {
    id: "retention_gap",
    severity: 5,
    test: (a) => has(a, "q10", "keep_forever"),
    flag: "Customer data is kept indefinitely with no documented retention or deletion process.",
  },
  {
    id: "manual_optout",
    severity: 4,
    test: (a) => anyOf(a, "q5", ["manual_on_request", "unsubscribe_email_only"]),
    flag: "Opt-out is manual or limited to email — it may not be honoured consistently across WhatsApp and SMS.",
  },
  {
    id: "lifecycle_profiling",
    severity: 4,
    test: (a) => anyOf(a, "q6", ["recommendations", "segmentation_lookalike"]),
    flag: "Personalisation or ad-audience features profile customers and share data with platforms without clear consent.",
  },
];

// ── Recommendations ───────────────────────────────────────────────────────────

// Immediate 5-control block (shown for High / Critical).
const FIVE_CONTROLS = [
  "Fix marketing consent — capture a clear, informed opt-in before any WhatsApp, SMS or email marketing. Stop treating a purchase or a pre-ticked box as consent.",
  "Make opt-out and preferences real — one-click unsubscribe honoured across every channel, backed by a single customer-preference record.",
  "Map and govern tracking — know exactly which pixels, tags and agency scripts run on your store, disclose them, and remove any you can't account for.",
  "Control vendors and access — list every vendor that touches customer data (payment, logistics, CRM, plugins, agency), use role-based logins, and revoke ex-staff/agency access.",
  "Collect less and retain less — keep only the customer data you use, set a documented retention and deletion schedule, and give customers a way to access, correct or delete their data.",
];

const BUCKET_RECS: Record<string, string> = {
  marketing_consent:
    "Strengthen marketing consent and preferences. Capture explicit opt-in before promotional WhatsApp/SMS/email, keep a record of how each customer joined, and maintain one central preference the customer can change.",
  tracking_adtech:
    "Inventory and govern your tracking. List every pixel, tag and script on your store (including agency-managed ones), disclose them in your privacy notice and consent banner, and remove what you can't account for.",
  customer_data_collection:
    "Reduce customer-data collection. Collect only what you use, treat skin/health/body data as sensitive, and avoid reusing marketplace-exported customer lists for marketing without consent.",
  vendor_fulfilment:
    "Map and contract your vendors. List payment, logistics, CRM, plugin and agency partners that receive customer data, put data-processing terms in place, and lock down store-admin access.",
  retention_preferences:
    "Define retention and customer-rights handling. Set how long customer data is kept, delete what you no longer need, and give customers a clear way to access, correct or delete their data.",
};

function recommend(r: IAResult): string[] {
  if (r.band === "High Risk" || r.band === "Critical Risk") {
    return FIVE_CONTROLS;
  }
  const s = r.bucketScores;
  const recs: string[] = [];
  for (const key of [
    "marketing_consent",
    "tracking_adtech",
    "customer_data_collection",
    "vendor_fulfilment",
    "retention_preferences",
  ]) {
    if ((s[key] ?? 0) >= 34) recs.push(BUCKET_RECS[key]);
  }
  if (recs.length === 0) {
    recs.push(
      "Your controls look directionally strong. Document them, keep your consent and tracking inventory current, and set a periodic review of vendors, access and retention."
    );
  }
  return recs.slice(0, 5);
}

// ── Result-band copy (shared by client, report, email) ───────────────────────

const BAND_COPY: Record<BandLabel, string> = {
  Controlled:
    "Your D2C brand appears to have basic customer-data controls in place. Your next step is to document how you handle marketing consent, tracking, vendors, access and retention so they stay consistent as you scale.",
  "Moderate Risk":
    "Your D2C brand has some customer-data controls, but several practices may be informal. Focus first on tightening marketing consent and opt-out, mapping your tracking and vendors, and defining how long you keep customer data.",
  "High Risk":
    "Your D2C brand may have significant DPDPA exposure across marketing consent, opt-out, tracking pixels, vendor sharing or customer-data retention. Your first priority is to control how customers are messaged, how they can opt out, and which tools and partners receive their data.",
  "Critical Risk":
    "Your D2C brand may have serious DPDPA exposure. This usually happens when marketing runs without clear opt-in, there's no real opt-out, pixels and agency scripts are unaccounted for, customer data is shared widely and kept forever — all without notice, access control or retention rules.",
};

// ── Pack ──────────────────────────────────────────────────────────────────────

export const d2cBrandsPack: IndustryPack = {
  industry: "d2c-brands",
  route: "/assessment/d2c-brands",
  reportType: "d2c", // short token — Appwrite `report_type` is string(10)
  positioning: {
    title: "D2C Brand DPDPA Risk Scan",
    hero: "Your D2C brand does not just sell products. It tracks, messages and retargets customers every day.",
    sub: "Most D2C brands don't have a customer-data problem — they have a marketing-data control problem. From Shopify and WhatsApp to Meta Pixel, cart-abandonment flows, SMS campaigns, logistics partners and marketplace exports, customer data moves at every step. This 3-minute scan shows where DPDPA exposure may arise.",
    cta: "Start D2C Brand Risk Scan",
    microline: "3 minutes · 10 questions · free · no login",
    chips: [
      "Customer Data",
      "WhatsApp Marketing",
      "SMS",
      "Email Campaigns",
      "Meta Pixel",
      "Cart Abandonment",
      "Retargeting",
      "Logistics Partners",
      "Payment Gateway",
      "Unsubscribe",
      "Loyalty",
      "Marketplace Data",
    ],
  },
  buckets: BUCKETS,
  questions: QUESTIONS,
  overrides: OVERRIDES,
  softFlags: SOFT_FLAGS,
  recommend,
  bandCopy: BAND_COPY,
  leadMagnet: {
    title: "D2C Brand DPDPA Starter Checklist",
    href: "/templates/d2c-brand-dpdpa-starter-checklist.pdf",
  },
};

export default d2cBrandsPack;
