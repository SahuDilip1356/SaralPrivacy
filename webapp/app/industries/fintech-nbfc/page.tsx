import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ArrowRight,
  ClipboardList,
  FileKey2,
  Share2,
  Database,
  ShieldAlert,
} from "lucide-react";
import { breadcrumbSchema, faqPageSchema, speakableSchema } from "@/lib/schema";
import { FRESHNESS, toISODate } from "@/lib/content-freshness";
import { fintechNbfcPack } from "@/lib/data/industry-assessment/packs/fintech-nbfc";

const faqs = [
  {
    question: "Does the DPDPA apply to fintechs, NBFCs and payment businesses?",
    answer:
      "Yes. Fintechs, NBFCs, digital lending apps, payment and UPI businesses collect and process large volumes of personal and financial data — KYC, PAN/Aadhaar, bank statements, bureau reports, UPI and repayment data — which makes them Data Fiduciaries under the Digital Personal Data Protection Act, 2023. DPDPA obligations sit alongside (not instead of) your RBI obligations, and increase as you profile customers and share data across lenders, bureaus, DSAs and collection agents.",
  },
  {
    question: "Can KYC, income or bank documents come in over WhatsApp or via DSAs?",
    answer:
      "It is common, but bank statements and KYC arriving over WhatsApp or collected by DSAs/field agents are hard to control, verify, delete and audit. Prefer your secure app/website or a regulated eKYC/CKYC flow, keep documents in your core platform rather than personal devices, and apply the same controls to agent-collected documents as to direct onboarding.",
  },
  {
    question: "Do we need consent evidence for bureau checks, profiling and partner sharing?",
    answer:
      "Yes. Verification, credit-bureau checks, scoring/profiling and sharing with partners are all processing that needs clear notice and traceable, timestamped consent — not consent bundled into terms and conditions. Where automated or semi-automated decisions materially affect customers, the purpose, data inputs and customer notice for those decisions should be documented.",
  },
  {
    question: "What should we control when sharing data with DSAs, collection agents and bureaus?",
    answer:
      "Customer financial data shared with lenders, bureaus, KYC providers, account aggregators, DSAs, collection agents and risk vendors is a disclosure to third parties. Keep a partner/agent register, give role-based and monitored access, prohibit list exports and personal-phone/WhatsApp follow-up, and review access periodically.",
  },
  {
    question: "How long can we keep rejected applications, KYC and bank statements?",
    answer:
      "The DPDPA expects data to be kept only as long as the purpose requires. Fintechs often retain rejected leads, KYC and bank statements for future offers or risk modelling — that must be purpose-bound, not indefinite. Define a retention schedule for KYC, bureau, bank and repayment data, archive or delete past it, and operationalise correction and deletion requests across your partners.",
  },
];

export const metadata: Metadata = {
  title: "DPDPA for Fintech, NBFC & Digital Payments",
  description:
    "Your fintech doesn't just process transactions — it verifies, profiles and shares financial data every day. See where KYC, PAN/Aadhaar, bank and bureau data, UPI, profiling, DSAs, collection agents and old customer records create DPDPA exposure, and run a free 3-minute risk scan.",
  alternates: { canonical: "https://saralprivacy.com/industries/fintech-nbfc" },
};

const BUCKET_DETAIL: Record<string, { icon: ReactNode; example: string; action: string }> = {
  kyc_financial_data: {
    icon: <FileKey2 size={18} />,
    example:
      "PAN, Aadhaar/KYC, bank account and statements, UPI/VPA, income proof, credit-bureau reports, loan/EMI and repayment data, device/behavioural data and collection notes.",
    action: "Map KYC and financial data across onboarding, bureau checks and collections, and keep documents off WhatsApp and personal devices.",
  },
  profiling_underwriting: {
    icon: <Database size={18} />,
    example:
      "Credit scoring, eligibility checks, fraud/risk models, offer personalisation and automated approval/rejection — often with informal documentation.",
    action: "Document model purpose, data inputs, decision points and customer notice; keep human review where decisions materially affect customers.",
  },
  consent_notice_rights: {
    icon: <ClipboardList size={18} />,
    example:
      "Notice and consent for collection, verification, bureau checks, profiling, partner sharing and cross-sell — sometimes bundled into terms without traceable evidence.",
    action: "Capture timestamped, traceable consent and operationalise withdrawal, correction and deletion across systems and partners.",
  },
  vendor_partner_agent_sharing: {
    icon: <Share2 size={18} />,
    example:
      "Lenders, banks, bureaus, KYC providers, account aggregators, payment partners, DSAs, collection agents, call centres, cloud/CRM and risk vendors.",
    action: "Keep a partner/agent register; give role-based, monitored access; prohibit list exports and personal-phone follow-up.",
  },
  access_retention_incident: {
    icon: <ShieldAlert size={18} />,
    example:
      "Financial data across core systems, CRM, data warehouse, Excel, WhatsApp, vendor dashboards and agent devices; rejected applications and KYC kept for years; no incident plan.",
    action: "Consolidate access, set retention + deletion rules for KYC/bureau/bank data, and write a breach-response plan.",
  },
};

const STEPS = [
  { n: 1, title: "Answer 10 quick questions", body: "About your service type, financial data, KYC intake, profiling, consent, partner/agent sharing, access and retention. ~3 minutes." },
  { n: 2, title: "See your readiness score + risk map", body: "A 0\u2013100 DPDPA readiness score, your risk band, and five fintech-specific risk areas." },
  { n: 3, title: "Get your priority fixes + checklist", body: "The five controls to start with, plus the Fintech / NBFC DPDPA Starter Checklist." },
];

const scanChecks = [
  "What financial service you run and the customer financial data you hold",
  "Which high-impact data you collect \u2014 PAN, Aadhaar, bank statements, bureau, UPI",
  "How KYC and income documents are submitted \u2014 secure flow, WhatsApp, DSAs",
  "Whether you use scoring, eligibility or automated decisioning \u2014 and how it's governed",
  "How notice and consent are captured \u2014 traceable evidence vs bundled terms",
  "Which partners and agents receive data \u2014 bureaus, lenders, DSAs, collection agents",
  "Whether agents can export lists or follow up on personal phones/WhatsApp",
  "Where financial data is stored, how long it's kept, and your incident readiness",
];

export default function FintechNbfcPage() {
  const p = fintechNbfcPack.positioning;
  return (
    <>
      {breadcrumbSchema([
        { name: "Home", url: "https://saralprivacy.com" },
        { name: "Industries", url: "https://saralprivacy.com/industries" },
        { name: "Fintech, NBFC & Digital Payments", url: "https://saralprivacy.com/industries/fintech-nbfc" },
      ])}
      {faqPageSchema(faqs, {
        url: "https://saralprivacy.com/industries/fintech-nbfc",
        dateModified: toISODate(FRESHNESS.industry),
      })}
      {speakableSchema([".answer-block"], "https://saralprivacy.com/industries/fintech-nbfc", "DPDPA for Fintech, NBFC & Digital Payments")}

      <div className="min-h-screen bg-pearl-50">
        {/* Hero */}
        <div className="bg-navy-700 py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-teal-300">
              <ShieldCheck size={18} /> Industry Guide · Fintech, NBFC & Digital Payments
            </div>
            <h1 className="max-w-3xl text-3xl font-bold leading-tight text-white sm:text-4xl">{p.hero}</h1>
            <div className="answer-block mt-5 max-w-2xl rounded-xl border border-white/15 bg-white/10 px-5 py-4" data-speakable="true">
              <p className="text-sm leading-relaxed text-slate-200">{p.sub}</p>
              <p className="mt-2 text-xs font-medium text-teal-300">
                Most fintechs don&apos;t have a data-collection problem — they have a financial-data <em>control</em> problem.
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/assessment/fintech-nbfc" className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-600">
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
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-10 lg:col-span-2">
              {/* Risk map */}
              <section>
                <h2 className="text-2xl font-bold text-navy-700">Your financial-data risk map</h2>
                <p className="mt-1 text-sm text-slate-600">The free scan scores your firm across these five areas. Here is what each one looks at.</p>
                <div className="mt-5 space-y-4">
                  {fintechNbfcPack.buckets.map((b) => {
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
                <Link href="/assessment/fintech-nbfc" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-navy-700 px-6 py-3 font-semibold text-white transition-colors hover:bg-navy-800">
                  {p.cta} <ArrowRight size={18} />
                </Link>
              </section>

              {/* What the scan checks */}
              <section>
                <h2 className="text-2xl font-bold text-navy-700">What the scan checks</h2>
                <p className="mt-1 text-sm text-slate-600">Ten plain-English questions across your real financial-data workflows. The scan collects no customer financial data.</p>
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
                <h2 className="text-2xl font-bold text-navy-700">Fintech & NBFC DPDPA questions</h2>
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
                <p className="mt-2 text-sm text-teal-100">10 questions · 3 minutes · free · no login. Get your firm&apos;s DPDPA readiness score.</p>
                <Link href="/assessment/fintech-nbfc" className="mt-4 block rounded-lg bg-white py-2.5 text-center text-sm font-bold text-teal-800 hover:bg-teal-50">
                  Start Fintech / NBFC Risk Scan →
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
