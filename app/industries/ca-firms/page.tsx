import type { Metadata } from "next";
import Link from "next/link";
import { Calculator } from "lucide-react";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "DPDPA for CA Firms",
  description: "See how DPDPA affects CA firms handling PAN, Aadhaar, payroll, cloud storage, contractors, retention, and client data governance.",
  alternates: { canonical: 'https://saralprivacy.com/industries/ca-firms' },
};

const riskAreas = [
  { title: "PAN and Aadhaar Documents", risk: "High", description: "Physical and digital copies of PAN, Aadhaar, and passport documents collected for tax filings and KYC create significant exposure if not handled with strict controls.", action: "Collect only what is necessary. Define retention limits. Store with access restrictions. Consider whether physical copies need to be retained or can be destroyed post-filing." },
  { title: "Client Payroll Data", risk: "High", description: "Processing payroll means handling salary details, bank account numbers, PF/ESI data, and personal employment information of multiple individuals per client.", action: "Implement role-based access so only payroll team members can access employee records. Define retention periods. Sign DPAs with payroll software vendors." },
  { title: "Cloud Storage and Shared Drives", risk: "High", description: "Google Drive, Dropbox, or Tally on cloud with broad team access creates unmanaged exposure of sensitive client personal data.", action: "Audit who has access to what. Implement folder-level access controls. Ensure cloud vendors have signed DPAs and hold appropriate certifications." },
  { title: "Third-Party Contractors", risk: "Medium", description: "Outsourced accounting staff, IT vendors, or back-office processors who access client data without formal agreements create liability.", action: "Sign Data Processing Agreements with all contractors accessing client personal data. Restrict access to minimum necessary data." },
  { title: "Retention of Client Files", risk: "Medium", description: "Keeping digital copies of client documents indefinitely without a defined deletion process creates both legal risk and security exposure.", action: "Define retention periods for each document category (ITR copies: 7 years; employee documents: 5 years from exit). Implement annual deletion reviews." },
];

const checklistItems = [
  "List all categories of personal data your firm processes",
  "Identify engagements where you are a Data Fiduciary vs Data Processor",
  "Audit access controls on cloud storage and shared drives",
  "Define retention periods for all document categories",
  "Add data handling terms to client engagement letters",
  "Sign DPAs with cloud tools, payroll software, and contractors",
  "Implement role-based access for employee and client records",
  "Create a staff training plan on data handling basics",
  "Designate a data protection contact within the firm",
  "Build a basic rights request process for clients and employees",
];

export default function CAFirmsIndustryPage() {
  return (
    <>
      {breadcrumbSchema([
        { name: 'Home', url: 'https://saralprivacy.com' },
        { name: 'Industries', url: 'https://saralprivacy.com/industries' },
        { name: 'CA Firms', url: 'https://saralprivacy.com/industries/ca-firms' },
      ])}
    <div className="min-h-screen bg-slate-50">
      <div className="bg-navy-700 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-700 flex items-center justify-center">
              <Calculator size={20} className="text-white" />
            </div>
            <span className="text-indigo-300 text-sm font-semibold">Industry Guide</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">DPDPA for CA Firms and Accounting Practices</h1>
          <div className="bg-white/10 border border-white/20 rounded-xl px-5 py-4 max-w-2xl">
            <p className="text-slate-200 text-sm leading-relaxed">CA firms handle some of the most sensitive personal data in routine business operations: PAN, Aadhaar, payroll records, bank details, tax files, and employee documents. DPDPA adds practical obligations around access control, vendor governance, retention, rights handling, and internal accountability. This guide helps CA firms move from professional confidentiality to operational privacy discipline.</p>
            <p className="text-indigo-300 text-xs mt-2 font-medium">If everyone in the office can open every client folder, that is not collaboration. It is exposure with good lighting.</p>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-5">
            <h2 className="text-2xl font-bold text-navy-700">Key Risk Areas</h2>
            {riskAreas.map((area) => (
              <div key={area.title} className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-bold text-navy-700">{area.title}</h3>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${area.risk === "High" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{area.risk} Risk</span>
                </div>
                <p className="text-slate-600 text-sm mb-3">{area.description}</p>
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                  <p className="text-indigo-800 text-xs"><strong>Action: </strong>{area.action}</p>
                </div>
              </div>
            ))}
            <h2 className="text-2xl font-bold text-navy-700 pt-4">Compliance Checklist</h2>
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              {checklistItems.map((item, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0">
                  <div className="w-5 h-5 rounded border-2 border-slate-300 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-5">
            <div className="bg-indigo-700 rounded-xl p-5 text-white">
              <h3 className="font-bold mb-2">Take the Free Assessment</h3>
              <p className="text-indigo-200 text-sm mb-4">7 questions. 8 minutes. Get your CA firm's DPDPA risk score.</p>
              <Link href="/assessment/ca-firms" className="block text-center py-2.5 bg-white text-indigo-800 font-bold rounded-lg text-sm hover:bg-indigo-50">Start Assessment →</Link>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h3 className="font-bold text-navy-700 text-sm mb-2">Free White Paper</h3>
              <p className="text-slate-600 text-xs mb-3">45-page DPDPA compliance guide for Indian businesses.</p>
              <Link href="/white-paper" className="block text-center py-2.5 bg-navy-700 text-white font-semibold rounded-lg text-sm hover:bg-navy-800 transition-colors">
                Download White Paper →
              </Link>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h3 className="font-bold text-navy-700 text-sm mb-3">Related Briefings</h3>
              <div className="space-y-2">
                <Link href="/briefings/ca-firms-pan-aadhaar-obligations-dpdpa" className="block text-sm text-green-600 hover:underline">→ CA Firms: PAN, Aadhaar & DPDPA Obligations</Link>
                <Link href="/briefings/dpdpa-consent-notice-requirements-2025" className="block text-sm text-green-600 hover:underline">→ Consent Notice Requirements</Link>
                <Link href="/briefings/data-breach-notification-obligations-dpdpa" className="block text-sm text-green-600 hover:underline">→ Data Breach Notification</Link>
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
              <h3 className="font-bold text-navy-700 text-sm mb-2">Need advice?</h3>
              <Link href="/contact" className="block text-center py-2.5 bg-navy-700 text-white font-semibold rounded-lg text-sm hover:bg-navy-800">Request Consultation →</Link>
            </div>
          </div>
        </div>
      </div>
        <div data-nosnippet className="mt-10 pt-6 border-t border-slate-200 text-xs text-slate-400 space-y-1">
          <p><strong>Last reviewed:</strong> March 2026</p>
          <p><strong>Legal baseline:</strong> DPDP Rules, 2025 notified on 14 November 2025, with phased commencement.</p>
          <p>This page is for educational purposes and does not constitute legal advice.</p>
        </div>
    </div>
    </>
  );
}
