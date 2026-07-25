// CA Firms Personal Data Flow pack - assembled config.
// Spec: docs/SaralPrivacy_CAFirms_DataFlow_Spec.md (v4).
// Same presentation framework as recruitment; only content differs.

import type { DataFlowPack } from "../../../data-flow/schemas.ts";
import { CA_FIRMS_STAGES } from "./stages.ts";
import { CA_FIRMS_DATA_CATEGORIES } from "./data-categories.ts";
import { CA_FIRMS_PERSONAS } from "./personas.ts";
import { CA_FIRMS_NODES } from "./nodes.ts";
import { CA_FIRMS_EDGES } from "./edges.ts";
import { CA_FIRMS_HOTSPOTS } from "./hotspots.ts";

export const caFirmsDataFlowPack: DataFlowPack = {
  industry: "ca-firms",
  title: "CA Firm Personal Data Flow Map",
  mainActor: "Client",
  // One honest journey. The employee-payroll dimension is carried by data
  // categories and personas, not by a second journey - so the selector hides.
  businessModels: [{ id: "practice", label: "CA practice" }],
  lexicon: {
    subject: "client",
    subjectArtefact: "One client's documents",
    org: "firm",
  },
  boundaryLabels: {
    candidate: "Your client",
    agency: "Your firm",
    client: "Client business",
  },
  presentation: {
    eyebrow: "CA Firms",
    h1: "One client. Many systems. One firm's responsibility.",
    intro:
      "Follow a single client's documents as they move through email, WhatsApp, Tally, cloud drives, tax software, government portals and a decade of archives - and count every place they end up, and where you lose control of them.",
    metaTitle: "CA Firm Personal Data Flow Map - Where Client Data Travels",
    metaDescription:
      "Interactive map of how a CA firm's client data moves through email, WhatsApp, Tally, ClearTax, the Income Tax and GST portals, DSC tokens, backups and old folders - and where DPDPA risk appears.",
    ogTitle: "One client. Many systems. One firm's responsibility. - CA Firm Personal Data Flow Map",
    ogDescription:
      "See how a CA firm's client data travels through a typical practice, every place it ends up, and where control breaks.",
    breadcrumbLabel: "CA Firms",
    howToRead: [
      {
        title: "The places add up",
        body: "Each stage shows the new places the data reaches - inboxes, WhatsApp, Tally, drives, laptops, portals, backups. Every place is counted once, so the running counter always matches the systems listed above it.",
      },
      {
        title: "When it leaves you",
        body: "A violet left edge and a tag mark systems outside your firm - the client business, cloud vendors, government portals, banks and auditors. Once data lands there your control is indirect: it runs through your contract and instructions, not your admin panel. Risk is shown separately, as an amber or red fill - so an outside system can be low risk, and an in-house one high risk.",
      },
      {
        title: "Where control breaks",
        body: "Red flags mark the hotspots - the places CA firms most often lose control of client data, from the DSC token to a decade of undeleted folders. Tap any system to see what it holds and how to fix it.",
      },
    ],
    ctaHeading: "Now check whether your controls hold up",
    ctaBody:
      "The map shows where client data travels in a typical firm. The 3-minute readiness scan checks whether your firm has the controls that matter at each hotspot - and the Discovery tool builds your own data inventory.",
    ctaButton: "Take the CA firm risk scan",
  },
  disclaimer:
    "This is a reference model of a typical CA firm - not a scan of your systems. Your own flow may have fewer or more stops.",
  assessmentRoute: "/assessment/ca-firms",
  // Bucket keys of lib/data/industry-assessment/packs/ca-firms.ts.
  assessmentBuckets: [
    "client_document",
    "intake",
    "storage_access",
    "retention",
    "vendor_incident",
  ],
  discoveryNicheId: "ca-firms",
  stages: CA_FIRMS_STAGES,
  dataCategories: CA_FIRMS_DATA_CATEGORIES,
  personas: CA_FIRMS_PERSONAS,
  nodes: CA_FIRMS_NODES,
  edges: CA_FIRMS_EDGES,
  hotspots: CA_FIRMS_HOTSPOTS,
};

export default caFirmsDataFlowPack;
