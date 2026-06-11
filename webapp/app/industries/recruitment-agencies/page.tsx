import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ArrowRight,
  Search,
  FileText,
  Share2,
  Database,
  Trash2,
} from "lucide-react";
import { breadcrumbSchema, faqPageSchema, speakableSchema } from "@/lib/schema";
import { Byline } from "@/components/seo/Byline";
import { FRESHNESS, toISODate } from "@/lib/content-freshness";
import { recruitmentAgenciesPack } from "@/lib/data/industry-assessment/packs/recruitment-agencies";

const faqs = [
  {
    question: "Does the DPDPA apply to recruitment agencies?",
    answer:
      "Yes. Recruitment agencies process personal data of candidates — names, contact details, CVs, experience, salaries, and identity documents — making them Data Fiduciaries under the Digital Personal Data Protection Act, 2023. Compliance obligations apply regardless of agency size.",
  },
  {
    question: "Do we need consent before sharing a candidate's CV with a client company?",
    answer:
      "Yes. Sharing a candidate's CV with a client is a disclosure of personal data to a third party. Under DPDPA, you must have valid consent from the candidate that covers this purpose. The consent notice must clearly state that CVs may be shared with prospective employers.",
  },
  {
    question: "How long can we keep candidate data in our ATS after a placement or rejection?",
    answer:
      "DPDPA requires data to be deleted once the purpose for which it was collected is fulfilled. For candidates not placed, a reasonable retention window is 12–24 months for potential future roles, after which data should be erased unless the candidate opts in to remain in your database.",
  },
  {
    question: "Are background check documents like Aadhaar and PAN copies covered under DPDPA?",
    answer:
      "Yes. Aadhaar numbers and PAN details are personal data under DPDPA. Recruitment agencies must collect only what is necessary for the specific check, store it securely with restricted access, and delete it once the verification purpose is complete.",
  },
  {
    question: "What should we do if a candidate asks to erase their data?",
    answer:
      "Under Section 13 of the DPDPA, candidates have the right to erasure of personal data no longer needed for the purpose it was collected. You must acknowledge the request, verify identity, and erase the data unless retention is required by law. A documented process with a response timeline is recommended.",
  },
];

export const metadata: Metadata = {
  title: "DPDPA for Recruitment & Staffing Agencies",
  description:
    "Your recruitment agency doesn't just forward CVs — it moves candidate data across clients, tools and teams. See where sourcing, CV sharing, ATS access, BGV documents and rejected-candidate retention create DPDPA exposure, and run a free 3-minute risk scan.",
  alternates: { canonical: "https://saralprivacy.com/industries/recruitment-agencies" },
};

const BUCKET_DETAIL: Record<string, { icon: ReactNode; example: string; action: string }> = {
  candidate_sourcing: {
    icon: <Search size={18} />,
    example:
      "Naukri/LinkedIn/Indeed, WhatsApp referrals, walk-ins, scraped public profiles, reused old databases and client-provided lists.",
    action: "Define approved sourcing channels, avoid unmanaged scraping, and give candidates a clear notice of how their profile is used.",
  },
  candidate_document: {
    icon: <FileText size={18} />,
    example:
      "CVs, PAN/Aadhaar, salary slips, bank details, BGV records, psychometric scores and health/diversity data.",
    action: "Collect high-impact documents only when needed, with stronger access and retention controls.",
  },
  client_sharing: {
    icon: <Share2 size={18} />,
    example:
      "CVs forwarded by email/WhatsApp, bulk CV folders, Excel trackers, or clients given access to your ATS/database.",
    action: "Share only relevant shortlisted profiles through controlled channels; avoid bulk folders and uncontrolled forwarding.",
  },
  ats_tool_access: {
    icon: <Database size={18} />,
    example:
      "ATS, Excel trackers, Drive folders, email, WhatsApp, recruiter laptops, BGV vendors and AI screening tools.",
    action: "Map where candidate data sits, restrict access, and remove ex-recruiter and freelancer access promptly.",
  },
  retention_rights: {
    icon: <Trash2 size={18} />,
    example:
      "Rejected/inactive CVs, phone numbers, salary details and documents kept for years for 'future roles'.",
    action: "Define a retention + deletion schedule and a clear way for candidates to correct, delete or withdraw.",
  },
};

const STEPS = [
  { n: 1, title: "Answer 10 quick questions", body: "About candidate sourcing, documents, client sharing, ATS access, retention and candidate rights. ~3 minutes." },
  { n: 2, title: "See your readiness score + risk map", body: "A 0–100 DPDPA readiness score, your risk band, and five recruitment-specific risk areas." },
  { n: 3, title: "Get your priority fixes + checklist", body: "The five controls to start with, plus the Recruitment Agency DPDPA Starter Checklist." },
];

const scanChecks = [
  "What recruitment/staffing models you run and the candidate data you hold",
  "Where candidate profiles come from — portals, LinkedIn, referrals, scraping, reused databases",
  "Whether identity/salary/BGV documents are collected earlier than needed",
  "How candidates are told their profile will be stored and shared",
  "How CVs are shared with clients — email, WhatsApp, bulk folders, ATS access",
  "Who inside your agency can access candidate records — including freelancers and ex-staff",
  "Which tools store candidate data — ATS, Excel, Drive, WhatsApp, laptops, AI tools",
  "How long rejected/inactive profiles are kept and whether candidates can be removed",
];

export default function RecruitmentIndustryPage() {
  const p = recruitmentAgenciesPack.positioning;
  return (
    <>
      {breadcrumbSchema([
        { name: "Home", url: "https://saralprivacy.com" },
        { name: "Industries", url: "https://saralprivacy.com/industries" },
        { name: "Recruitment Agencies", url: "https://saralprivacy.com/industries/recruitment-agencies" },
      ])}
      {faqPageSchema(faqs, {
        url: "https://saralprivacy.com/industries/recruitment-agencies",
        dateModified: toISODate(FRESHNESS.industry),
      })}
      {speakableSchema([".answer-block"], "https://saralprivacy.com/industries/recruitment-agencies", "DPDPA for Recruitment & Staffing Agencies")}

      <div className="min-h-screen bg-pearl-50">
        {/* Hero */}
        <div className="bg-navy-700 py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-teal-300">
              <ShieldCheck size={18} /> Industry Guide · Recruitment Agencies
            </div>
            <h1 className="max-w-3xl text-3xl font-bold leading-tight text-white sm:text-4xl">{p.hero}</h1>
            <div className="answer-block mt-5 max-w-2xl rounded-xl border border-white/15 bg-white/10 px-5 py-4" data-speakable="true">
              <p className="text-sm leading-relaxed text-slate-200">{p.sub}</p>
              <p className="mt-2 text-xs font-medium text-teal-300">
                Most recruitment agencies don&apos;t have a CV-collection problem — they have a candidate-data <em>movement</em> problem.
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/assessment/recruitment" className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-600">
                {p.cta} <ArrowRight size={18} />
              </Link>
              <span className="text-xs text-slate-400">{p.microline}</span>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {p.chips.map((chip) => (
                <span key={chip} className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-slate-200">{chip}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <Byline lastReviewed={FRESHNESS.industry} className="mb-6" />
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-10 lg:col-span-2">
              {/* Risk map */}
              <section>
                <h2 className="text-2xl font-bold text-navy-700">Your candidate-data risk map</h2>
                <p className="mt-1 text-sm text-slate-600">The free scan scores your agency across these five areas. Here is what each one looks at.</p>
                <div className="mt-5 space-y-4">
                  {recruitmentAgenciesPack.buckets.map((b) => {
                    const d = BUCKET_DETAIL[b.key];
                    return (
                      <div key={b.key} className="rounded-xl border border-slate-200 bg-white p-5">
                        <div className="mb-2 flex items-center gap-2.5">
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-700">{d.icon}</span>
                          <h3 className="font-bold text-navy-700">{b.label}</h3>
                        </div>
                        <p className="text-sm text-slate-600">{d.example}</p>
                        <div className="mt-3 rounded-lg border border-teal-100 bg-teal-50 p-3">
                          <p className="text-xs text-teal-800"><strong>First move: </strong>{d.action}</p>
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
                <Link href="/assessment/recruitment" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-navy-700 px-6 py-3 font-semibold text-white transition-colors hover:bg-navy-800">
                  {p.cta} <ArrowRight size={18} />
                </Link>
              </section>

              {/* What the scan checks */}
              <section>
                <h2 className="text-2xl font-bold text-navy-700">What the scan checks</h2>
                <p className="mt-1 text-sm text-slate-600">Ten plain-English questions across your real candidate-data workflows.</p>
                <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6">
                  {scanChecks.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 border-b border-slate-100 py-2 last:border-0">
                      <div className="mt-0.5 h-5 w-5 shrink-0 rounded border-2 border-slate-300" />
                      <span className="text-sm text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* FAQ */}
              <section className="answer-block">
                <h2 className="text-2xl font-bold text-navy-700">Recruitment agency DPDPA questions</h2>
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
                <p className="mt-2 text-sm text-teal-100">10 questions · 3 minutes · free · no login. Get your agency&apos;s DPDPA readiness score.</p>
                <Link href="/assessment/recruitment" className="mt-4 block rounded-lg bg-white py-2.5 text-center text-sm font-bold text-teal-800 hover:bg-teal-50">
                  Start Recruitment Risk Scan →
                </Link>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="mb-2 text-sm font-bold text-navy-700">Free White Paper</h3>
                <p className="mb-3 text-xs text-slate-600">45-page DPDPA compliance guide for Indian businesses.</p>
                <Link href="/white-paper" className="block rounded-lg bg-navy-700 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-navy-800">
                  Download White Paper →
                </Link>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="mb-3 text-sm font-bold text-navy-700">Related Briefings</h3>
                <div className="space-y-2">
                  <Link href="/briefings/recruitment-agencies-dpdpa-cv-database-risk" className="block text-sm text-green-600 hover:underline">→ CV Database Risk for Recruitment Agencies</Link>
                  <Link href="/briefings/dpdpa-consent-notice-requirements-2025" className="block text-sm text-green-600 hover:underline">→ Consent Notice Requirements</Link>
                  <Link href="/briefings/rights-of-data-principals-dpdpa-explained" className="block text-sm text-green-600 hover:underline">→ Rights of Data Principals</Link>
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
