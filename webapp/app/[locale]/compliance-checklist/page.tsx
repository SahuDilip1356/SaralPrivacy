import type { Metadata } from "next";
import { breadcrumbSchema, articleSchema } from "@/lib/schema";
import ChecklistContent from "./ChecklistContent";

export const metadata: Metadata = {
  title: "DPDPA Compliance Checklist — Statutory & Operational Controls",
  description:
    "Complete DPDPA compliance checklist for Indian businesses — 90 controls across statutory obligations (Act 2023), rule requirements (Rules 2025), and operational evidence. Free, fully indexed.",
  alternates: { canonical: "https://saralprivacy.com/compliance-checklist" },
  openGraph: {
    title: "DPDPA Compliance Checklist | SaralPrivacy",
    description:
      "90 compliance controls covering applicability, consent, notice, rights, breach, penalties, SDF obligations, and operational evidence. Based on DPDPA Act 2023 + DPDP Rules 2025.",
    url: "https://saralprivacy.com/compliance-checklist",
  },
};

export default function ComplianceChecklistPage() {
  return (
    <>
      {breadcrumbSchema([
        { name: "Home", url: "https://saralprivacy.com" },
        { name: "DPDPA Guide", url: "https://saralprivacy.com/learn" },
        {
          name: "Compliance Checklist",
          url: "https://saralprivacy.com/compliance-checklist",
        },
      ])}
      {articleSchema(
        "DPDPA Compliance Checklist — Statutory & Operational Controls",
        "Complete DPDPA compliance checklist for Indian businesses. 90 controls across 27 sections covering statutory obligations from DPDPA Act 2023 and operational evidence requirements from DPDP Rules 2025.",
        "https://saralprivacy.com/compliance-checklist",
        "2025-11-14",
        "2026-04-01"
      )}

      {/* SEO-crawlable summary for AI and search engines */}
      <div className="sr-only">
        <h1>DPDPA Compliance Checklist for Indian Businesses</h1>
        <p>
          This checklist covers statutory obligations under the Digital Personal Data Protection
          Act, 2023 and operational evidence controls required to demonstrate DPDPA compliance.
          It is organised in two sections: Section 1 covers 15 areas of statutory and rule-based
          requirements including applicability, consent, notice, rights, breach notification,
          children's data, penalties, and cross-border transfers. Section 2 covers 12 operational
          governance areas including data inventory, rights management, security controls, vendor
          governance, and management reporting.
        </p>
      </div>

      <ChecklistContent />
    </>
  );
}
