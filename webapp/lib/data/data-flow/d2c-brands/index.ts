// D2C Brands Personal Data Flow pack - assembled config.
// Spec: docs/SaralPrivacy_D2CBrands_DataFlow_Spec.md.
// Same presentation framework as recruitment, CA and training institutes; only
// content differs.
//
// THREE operating models (own website / marketplace-first / omnichannel) are
// genuine, different data journeys - not cosmetic filters. Own website is the
// default; marketplace-first renders a leaner picture built on platform-owned
// systems; omnichannel renders the full union plus retail and unified-profile
// surfaces that neither of the other two has.

import type { DataFlowPack } from "../../../data-flow/schemas.ts";
import { D2C_BRANDS_STAGES } from "./stages.ts";
import { D2C_BRANDS_DATA_CATEGORIES } from "./data-categories.ts";
import { D2C_BRANDS_PERSONAS } from "./personas.ts";
import { D2C_BRANDS_NODES } from "./nodes.ts";
import { D2C_BRANDS_EDGES } from "./edges.ts";
import { D2C_BRANDS_HOTSPOTS } from "./hotspots.ts";

export const d2cBrandsDataFlowPack: DataFlowPack = {
  industry: "d2c-brands",
  title: "D2C Brand Personal Data Flow Map",
  mainActor: "Customer",
  // Three honest journeys. Own website (first = default) is where most D2C
  // brands start; marketplace-first is a genuinely smaller, platform-mediated
  // picture; omnichannel is the largest, because the same person arrives
  // through a store, a marketplace and a website and gets matched into one
  // profile.
  businessModels: [
    { id: "website", label: "Own website brand" },
    { id: "marketplace", label: "Marketplace-first brand" },
    { id: "omnichannel", label: "Omnichannel brand" },
  ],
  lexicon: {
    subject: "customer",
    subjectArtefact: "One customer's order",
    org: "brand",
  },
  boundaryLabels: {
    candidate: "The customer",
    agency: "Your brand",
    "third-party": "Marketplaces & platforms",
    public: "Publicly visible",
  },
  presentation: {
    eyebrow: "D2C Brands",
    h1: "One customer. Many systems. One brand's responsibility.",
    intro:
      "Follow one customer's personal data through advertising, website tracking, checkout, payment, fulfilment, delivery, customer support, returns, reviews, loyalty programmes and long-term marketing databases - and count every place it ends up, and where you lose control of it.",
    metaTitle: "D2C Brand Personal Data Flow Map - Where Customer Data Travels",
    metaDescription:
      "See how customer data moves through tracking pixels, checkout, payments, warehouses, couriers, support, returns, loyalty programmes and marketing platforms - and where DPDPA risk appears for a D2C brand.",
    ogTitle: "Where does one D2C customer's data go? - D2C Brand Personal Data Flow Map",
    ogDescription:
      "Follow customer data across advertising, checkout, fulfilment, delivery, support, loyalty and long-term marketing systems, in three D2C operating models.",
    breadcrumbLabel: "D2C Brands",
    previewBlurb:
      "Before you fix anything, see the problem. One customer's data moves through ads and pixels, checkout, payment, the warehouse, a courier's phone, support chats, returns, loyalty and years of marketing databases.",
    howToRead: [
      {
        title: "Pick your model",
        body: "Switch between Own website, Marketplace-first and Omnichannel to see the systems each kind of brand actually uses. Own website is the default; marketplace-first is a leaner, platform-mediated picture; omnichannel is the biggest, because store, marketplace and website all feed one profile. The place-counter recalculates for the model you choose.",
      },
      {
        title: "When it leaves you",
        body: "A violet left edge and a tag mark systems outside your brand - payment gateways, couriers and delivery agents, ad platforms, marketplaces, review tools, agencies and backups you do not run. Once data lands there your control is indirect: it runs through your contract and instructions, not your admin panel. Risk is shown separately, as an amber or red fill - so an outside system can be low risk, and an in-house spreadsheet can be the worst thing on the page.",
      },
      {
        title: "Where control breaks",
        body: "Red flags mark the hotspots - the eight places D2C brands most often lose control of customer data, from a pixel that fires before any choice to an order export nobody deletes to a customer list living inside an ad account. Tap any system to see what it holds and how to fix it.",
      },
    ],
    ctaHeading: "Now check whether your controls hold up",
    ctaBody:
      "The map shows where customer data travels in a typical D2C brand. The 3-minute readiness scan checks whether your brand has the controls that matter at each hotspot - and the Discovery tool builds your own data inventory.",
    ctaButton: "Take the D2C brand risk scan",
  },
  disclaimer:
    "This is a reference model of a typical D2C brand - not a scan of your systems. Your own flow may have fewer or more stops depending on your operating model.",
  assessmentRoute: "/assessment/d2c-brands",
  // Bucket keys of lib/data/industry-assessment/packs/d2c-brands.ts.
  // The pack test asserts each one still exists there (drift guard).
  assessmentBuckets: [
    "customer_data_collection",
    "marketing_consent",
    "tracking_adtech",
    "vendor_fulfilment",
    "retention_preferences",
  ],
  discoveryNicheId: "d2c-brands",
  stages: D2C_BRANDS_STAGES,
  dataCategories: D2C_BRANDS_DATA_CATEGORIES,
  personas: D2C_BRANDS_PERSONAS,
  nodes: D2C_BRANDS_NODES,
  edges: D2C_BRANDS_EDGES,
  hotspots: D2C_BRANDS_HOTSPOTS,
};

export default d2cBrandsDataFlowPack;
