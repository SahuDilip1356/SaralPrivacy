import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ArrowRight,
  FileText,
  Inbox,
  FolderLock,
  Trash2,
  Plug,
} from "lucide-react";
import { breadcrumbSchema, faqPageSchema, speakableSchema } from "@/lib/schema";
import { Byline } from "@/components/seo/Byline";
import { FRESHNESS, toISODate } from "@/lib/content-freshness";
import { caFirmPack } from "@/lib/data/industry-assessment/packs/ca-firms";

const faqs = [
  {
    question: "Does the DPDPA apply to CA firms and accounting practices?",
    answer:
      "Yes. CA firms process substantial personal data including PAN, Aadhaar, bank details, salary records, and tax documents. This makes them Data Fiduciaries under the Digital Personal Data Protection Act, 2023. Obligations apply to all firms regardless of size, including sole practitioners.",
  },
  {
    question: "Can we store client PAN and Aadhaar copies on Google Drive or shared folders?",
    answer:
      "You can, but with controls. Cloud storage platforms like Google Drive are Data Processors under DPDPA. You must have a Data Processing Agreement in place, restrict folder access to only those who need it, and disclose this storage in your client engagement terms or privacy notice.",
  },
  {
    question: "How long should CA firms retain client documents under DPDPA?",
    answer:
      "DPDPA requires deletion once purpose is served. For CA firms, practical retention periods are: ITR copies and supporting documents — 7 years; employee records — 5 years after employment end; KYC documents — as required by applicable law (Income Tax Act, PMLA). Define these periods formally and implement annual deletion reviews.",
  },
  {
    question: "If we outsource bookkeeping or data entry, do we need a Data Processing Agreement?",
    answer:
      "Yes. Any contractor or outsourced vendor who accesses client personal data on your behalf becomes a Data Processor under DPDPA. You must sign a Data Processing Agreement that restricts their use of the data, requires them to follow your instructions, and mandates adequate security measures.",
  },
  {
    question: "Can a client ask us to delete their personal data?",
    answer:
      "Yes. Under Section 13 of the DPDPA, individuals have a right to erasure of personal data that is no longer needed for the original purpose. However, if you are legally required to retain records (e.g., under the Income Tax Act), you can decline deletion for that specific data. You must inform the client of the legal basis for continued retention.",
  },
];

export const metadata: Metadata = {
  title: "DPDPA for CA Firms & Tax Consultants",
  description:
    "Most CA firms don't have a tax knowledge problem — they have a client-document control problem. See where PAN, Aadhaar, ITR, payroll, Google Drive and WhatsApp create DPDPA exposure, and run a free 3-minute risk scan.",
  alternates: { canonical: "https://saralprivacy.com/industries/ca-firms" },
};

// Bucket → concrete example + first action, keyed to the scan's risk map.
const BUCKET_DETAIL: Record<string, { icon: ReactNode; example: string; action: string }> = {
  client_document: {
    icon: <FileText size={18} />,
    example: "PAN, Aadhaar, ITR, Form 16, AIS/TIS, bank statements, payroll sheets, family financial data.",
    action: "Collect only what's necessary, define retention, and restrict who can open these documents.",
  },
  intake: {
    icon: <Inbox size={18} />,
    example: "Clients sending the same documents through WhatsApp, email, shared folders and scans.",
    action: "Standardise intake to one controlled channel so access, deletion and breach response are possible.",
  },
  storage_access: {
    icon: <FolderLock size={18} />,
    example: "Google Drive, OneDrive, laptops and inboxes — open to article assistants, interns and ex-staff.",
    action: "Move to role-based, need-based access with periodic reviews. Remove former-staff access promptly.",
  },
  retention: {
    icon: <Trash2 size={18} />,
    example: "Old ITR files, PAN copies, bank statements, audit papers and payroll kept indefinitely.",
    action: "Adopt a documented retention schedule with an annual deletion/archive review.",
  },
  vendor_incident: {
    icon: <Plug size={18} />,
    example: "Tax software, GST tools, payroll platforms, cloud providers and outsourced teams in the data chain.",
    action: "Keep a vendor list with written terms, and a breach-response process for email, cloud and WhatsApp.",
  },
};

const STEPS = [
  { n: 1, title: "Answer 10 quick questions", body: "About your documents, intake channels, storage, staff access, retention and vendors. ~3 minutes." },
  { n: 2, title: "See your readiness score + risk map", body: "A 0–100 DPDPA readiness score, your risk band, and five CA-specific risk buckets." },
  { n: 3, title: "Get your priority fixes + checklist", body: "The four controls to start with, plus the CA Firm DPDPA Starter Checklist." },
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
  const p = caFirmPack.positioning;
  return (
    <>
      {breadcrumbSchema([
        { name: "Home", url: "https://saralprivacy.com" },
        { name: "Industries", url: "https://saralprivacy.com/industries" },
        { name: "CA Firms", url: "https://saralprivacy.com/industries/ca-firms" },
      ])}
      {faqPageSchema(faqs, {
        url: "https://saralprivacy.com/industries/ca-firms",
        dateModified: toISODate(FRESHNESS.industry),
      })}
      {speakableSchema([".answer-block"], "https://saralprivacy.com/industries/ca-firms", "DPDPA for CA Firms & Tax Consultants")}

      <div className="min-h-screen bg-pearl-50">
        {/* Hero */}
        <div className="bg-navy-700 py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-teal-300">
              <ShieldCheck size={18} /> Industry Guide · CA Firms
            </div>
            <h1 className="max-w-3xl text-3xl font-bold leading-tight text-white sm:text-4xl">
              {p.hero}
            </h1>
            <div
              className="answer-block mt-5 max-w-2xl rounded-xl border border-white/15 bg-white/10 px-5 py-4"
              data-speakable="true"
            >
              <p className="text-sm leading-relaxed text-slate-200">{p.sub}</p>
              <p className="mt-2 text-xs font-medium text-teal-300">
                If everyone in the office can open every client folder, that is not collaboration. It is exposure with good lighting.
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/assessment/ca-firms"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-600"
              >
                {p.cta} <ArrowRight size={18} />
              </Link>
              <span className="text-xs text-slate-400">{p.microline}</span>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {p.chips.map((chip) => (
                <span key={chip} className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-slate-200">
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <Byline lastReviewed={FRESHNESS.industry} className="mb-6" />
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-10 lg:col-span-2">
              {/* Risk map (the 5 buckets = the spine of the scan) */}
              <section>
                <h2 className="text-2xl font-bold text-navy-700">Your CA practice risk map</h2>
                <p className="mt-1 text-sm text-slate-600">
                  The free scan scores your firm across these five areas. Here is what each one looks at.
                </p>
                <div className="mt-5 space-y-4">
                  {caFirmPack.buckets.map((b) => {
                    const d = BUCKET_DETAIL[b.key];
                    return (
                      <div key={b.key} className="rounded-xl border border-slate-200 bg-white p-5">
                        <div className="mb-2 flex items-center gap-2.5">
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-700">{d.icon}</span>
                          <h3 className="font-bold text-navy-700">{b.label}</h3>
                        </div>
                        <p className="text-sm text-slate-600">{d.example}</p>
                        <div className="mt-3 rounded-lg border border-teal-100 bg-teal-50 p-3">
                          <p className="text-xs text-teal-800">
                            <strong>First move: </strong>
                            {d.action}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* How it works */}
              <section>
                <h2 className="text-2xl font-bold text-navy-700">How the 3-minute scan works</h2>
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {STEPS.map((s) => (
                    <div key={s.n} className="rounded-xl border border-slate-200 bg-white p-5">
                      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-green-100 font-bold text-green-700">{s.n}</div>
                      <h3 className="text-sm font-bold text-navy-700">{s.title}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600">{s.body}</p>
                    </div>
                  ))}
                </div>
                <Link
                  href="/assessment/ca-firms"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-navy-700 px-6 py-3 font-semibold text-white transition-colors hover:bg-navy-800"
                >
                  {p.cta} <ArrowRight size={18} />
                </Link>
              </section>

              {/* Checklist (preview of the lead magnet) */}
              <section>
                <h2 className="text-2xl font-bold text-navy-700">CA firm compliance checklist</h2>
                <p className="mt-1 text-sm text-slate-600">A preview of the CA Firm DPDPA Starter Checklist you get after the scan.</p>
                <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6">
                  {checklistItems.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 border-b border-slate-100 py-2 last:border-0">
                      <div className="mt-0.5 h-5 w-5 shrink-0 rounded border-2 border-slate-300" />
                      <span className="text-sm text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* FAQ (visible + schema) */}
              <section className="answer-block">
                <h2 className="text-2xl font-bold text-navy-700">CA firm DPDPA questions</h2>
                <div className="mt-4 space-y-3">
                  {faqs.map((f) => (
                    <details key={f.question} className="rounded-xl border border-slate-200 bg-white p-5">
                      <summary className="cursor-pointer text-sm font-bold text-navy-700">{f.question}</summary>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.answer}</p>
                    </details>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              <div className="rounded-xl bg-teal-700 p-5 text-white">
                <h3 className="font-bold">Take the free scan</h3>
                <p className="mt-2 text-sm text-teal-100">10 questions · 3 minutes · free · no login. Get your CA firm&apos;s DPDPA readiness score.</p>
                <Link href="/assessment/ca-firms" className="mt-4 block rounded-lg bg-white py-2.5 text-center text-sm font-bold text-teal-800 hover:bg-teal-50">
                  Start CA Firm Risk Scan →
                </Link>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="mb-2 text-sm font-bold text-navy-700">Free Guide</h3>
                <p className="mb-3 text-xs text-slate-600">DPDPA compliance guide for Indian businesses.</p>
                <Link href="/white-paper" className="block rounded-lg bg-navy-700 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-navy-800">
                  Download the Guide →
                </Link>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="mb-3 text-sm font-bold text-navy-700">Related Briefings</h3>
                <div className="space-y-2">
                  <Link href="/briefings/ca-firms-pan-aadhaar-obligations-dpdpa" className="block text-sm text-green-600 hover:underline">→ CA Firms: PAN, Aadhaar &amp; DPDPA Obligations</Link>
                  <Link href="/briefings/dpdpa-consent-notice-requirements-2025" className="block text-sm text-green-600 hover:underline">→ Consent Notice Requirements</Link>
                  <Link href="/briefings/data-breach-notification-obligations-dpdpa" className="block text-sm text-green-600 hover:underline">→ Data Breach Notification</Link>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-pearl-100 p-5">
                <h3 className="mb-2 text-sm font-bold text-navy-700">Need advice?</h3>
                <Link href="/contact" className="block rounded-lg bg-navy-700 py-2.5 text-center text-sm font-semibold text-white hover:bg-navy-800">Request Consultation →</Link>
              </div>
            </div>
          </div>

          <div data-nosnippet className="mt-10 space-y-1 border-t border-slate-200 pt-6 text-xs text-slate-400">
            <p><strong>Legal baseline:</strong> DPDP Rules, 2025 notified on 14 November 2025, with phased commencement.</p>
            <p>This page is for educational purposes and does not constitute legal advice.</p>
          </div>
        </div>
      </div>
    </>
  );
}
