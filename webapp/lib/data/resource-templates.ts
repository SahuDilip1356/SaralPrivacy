// The five free templates offered on /resources — moved verbatim out of
// app/[locale]/resources/page.tsx so the page can localize them (W4).
//
// `title` is ALSO the lead payload's `templateName` (ResourceTemplateGate →
// /api/template-download), so it stays English on every locale; a translated
// name travels separately as `displayTitle` (lib/i18n/content.ts).
import type { ResourceTemplate } from "@/components/ResourceTemplateGate";

export const RESOURCE_TEMPLATES: ResourceTemplate[] = [
  {
    title: "Privacy Notice Template",
    file: "privacy-notice.docx",
    tag: "Word",
    desc: "DPDPA-aligned privacy notice covering all 10 required sections — adapt for your website, app, or printed materials",
  },
  {
    title: "Data Inventory Register",
    file: "data-inventory-register.xlsx",
    tag: "Excel",
    desc: "Map every data type, storage location, retention period, and legal basis — the foundation of DPDPA compliance",
  },
  {
    title: "Consent Language Examples",
    file: "consent-language-examples.docx",
    tag: "Word",
    desc: "8 ready-to-use consent statements for website forms, WhatsApp, checkout, app onboarding, in-person, and employee data",
  },
  {
    title: "DSR & Grievance Handling SOP",
    file: "dsr-grievance-sop.docx",
    tag: "Word",
    desc: "Step-by-step process to handle access, correction, erasure, and grievance requests from customers and employees",
  },
  {
    title: "Vendor Data-Sharing Register",
    file: "vendor-data-sharing-register.xlsx",
    tag: "Excel",
    desc: "Track every third party who receives personal data, what DPAs are in place, and when to review each relationship",
  },
];
