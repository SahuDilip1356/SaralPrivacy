import { Metadata } from "next";
import ResourceTemplateGate, { type ResourceTemplate } from "@/components/ResourceTemplateGate";

export const metadata: Metadata = {
  title: "Free DPDPA Templates | SaralPrivacy",
  description:
    "Download free DPDPA-aligned templates — Privacy Notice, Data Inventory Register, Consent Language, DSR SOP, and Vendor Register. Instantly usable for Indian businesses.",
  alternates: { canonical: "https://saralprivacy.com/resources" },
  openGraph: {
    title: "Free DPDPA Compliance Templates | SaralPrivacy",
    description:
      "5 ready-to-use DPDPA templates for Indian businesses. Tell us about your business once and download all 5 instantly.",
    url: "https://saralprivacy.com/resources",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "SaralPrivacy — DPDPA Compliance" }],
  },
};

const TEMPLATES: ResourceTemplate[] = [
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

export default function ResourcesPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8 text-center">
          <p className="text-xs font-bold text-[#E07B39] uppercase tracking-widest mb-2">
            Free Downloads
          </p>
          <h1 className="text-3xl font-semibold text-[#1E3A5F] mb-3">
            DPDPA Compliance Templates
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed max-w-lg mx-auto">
            5 ready-to-use templates built for Indian businesses. Tell us about your
            business once — all 5 templates unlock instantly.
          </p>
        </div>

        {/* Trust strip */}
        <div className="flex items-center justify-center gap-6 mb-8 flex-wrap">
          {["Free forever", "No account needed", "DPDPA-aligned", "Instant download"].map((label) => (
            <div key={label} className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="text-green-500 font-bold">✓</span>
              {label}
            </div>
          ))}
        </div>

        {/* Templates */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
            Available Templates
          </h2>
          <ResourceTemplateGate templates={TEMPLATES} />
        </div>

        {/* White paper */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
            Guides & Reports
          </h2>
          <a
            href="https://saralprivacy.com/white-paper"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-[#1E3A5F]/30 hover:bg-slate-50 transition-colors group"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-semibold text-slate-800 group-hover:text-[#1E3A5F]">
                  DPDPA Guide
                </p>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                  PDF Guide
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Comprehensive plain-English guide to the Digital Personal Data Protection Act for Indian businesses
              </p>
            </div>
            <span className="text-[#E07B39] font-bold text-sm ml-4 flex-shrink-0">↓</span>
          </a>
        </div>

        {/* Assessment CTA */}
        <div className="bg-[#1E3A5F] rounded-2xl p-6 text-center">
          <h2 className="text-base font-semibold text-white mb-1">
            Not sure which templates you need?
          </h2>
          <p className="text-sm text-white/70 mb-4">
            Take the free 5-minute DPDPA assessment — get a personalised score,
            red flags, and a 30-day action plan for your business.
          </p>
          <a
            href="/assessment"
            className="inline-block bg-[#E07B39] text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-[#c96a2e] transition-colors"
          >
            Take Free Assessment →
          </a>
        </div>

      </div>
    </div>
  );
}
