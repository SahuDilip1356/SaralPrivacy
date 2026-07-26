// People who touch customer data in a D2C brand. Rendered in node detail panels
// as access lists. Two of them are not the brand's staff at all: the individual
// delivery agent holding a name and number on a personal phone, and the
// marketplace account team operating a platform the brand cannot administer.

import type { FlowPersona } from "../../../data-flow/schemas.ts";

export const D2C_BRANDS_PERSONAS: FlowPersona[] = [
  { id: "customer", name: "Customer", boundary: "candidate", description: "The data principal - the person whose order, behaviour and profile this map follows." },
  { id: "gift-recipient", name: "Gift recipient", boundary: "candidate", description: "A second principal whose name, address and number were supplied by someone else and who never dealt with the brand." },
  { id: "founder-admin", name: "Founder / store admin", boundary: "agency", description: "Runs the store. Usually holds the broadest access of anyone - full order, customer and export rights on every platform." },
  { id: "growth-marketing", name: "Growth & marketing", boundary: "agency", description: "Runs campaigns, audiences, lifecycle flows and the CRM; the team most likely to export or upload a customer list." },
  { id: "ops-warehouse", name: "Operations & warehouse", boundary: "agency", description: "Picks, packs and dispatches. Sees names, numbers and addresses on lists and labels every day." },
  { id: "support-agent", name: "Customer support", boundary: "agency", description: "Answers tickets, chats and calls; typically sees a customer's whole order and complaint history." },
  { id: "finance", name: "Finance & accounts", boundary: "agency", description: "Handles payments, refunds, settlements, invoices and tax records." },
  { id: "store-staff", name: "Retail / store staff", boundary: "agency", description: "Serves customers in a store or pop-up; captures contacts and preferences, often on a personal phone." },
  { id: "vendor-staff", name: "Platform & vendor staff", boundary: "vendor", description: "Staff at gateways, couriers, helpdesk, CRM, CDP and review platforms who can reach customer data on their own systems." },
  { id: "delivery-agent", name: "Delivery agent", boundary: "vendor", description: "The individual who delivers the parcel, holding name, number and address on a personal device." },
  { id: "agency-partner", name: "Marketing / tech agency", boundary: "vendor", description: "An outside agency or developer with admin access to ad accounts, analytics, the storefront and exported customer lists." },
  { id: "marketplace-ops", name: "Marketplace account team", boundary: "third-party", description: "The platform side of a marketplace order - operating systems the brand can read from but cannot administer or delete from." },
];
