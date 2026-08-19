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
import { realEstatePack } from "@/lib/data/industry-assessment/packs/real-estate";
import { realEstateDataFlowPack } from "@/lib/data/data-flow/real-estate";
import { DataFlowPreview } from "@/components/industries/DataFlowPreview";

const faqs = [
  {
    question: "Does the DPDPA apply to real estate brokers and property firms?",
    answer:
      "Yes. Real estate brokers, property consultants and agencies collect and handle large volumes of personal data — buyer and tenant KYC, PAN/Aadhaar copies, income and bank documents, rent and sale agreements and property papers — which makes them Data Fiduciaries under the Digital Personal Data Protection Act, 2023. Obligations apply regardless of the firm's size, and increase as you share data across brokers, builders, lenders and societies.",
  },
  {
    question: "Can we share buyer or tenant details over WhatsApp broker groups?",
    answer:
      "Real estate is network-driven, but forwarding buyer, tenant or landlord details into co-broker WhatsApp groups or shared lead sheets exposes them well beyond the intended deal. Share only with clear client instruction or a documented purpose, tell clients in your lead/site-visit form that their data may go to brokers, builders and lenders, and avoid circulating KYC documents in groups.",
  },
  {
    question: "How should we handle PAN, Aadhaar and property documents?",
    answer:
      "These are high-impact identity, financial and ownership documents. Collect them only when needed, prefer a secure upload link or portal over WhatsApp and email, restrict who can access and forward them, avoid keeping duplicate copies on staff phones, and set a deletion rule once the deal closes or the purpose ends.",
  },
  {
    question: "Do we need client consent to share documents with loan agents or banks?",
    answer:
      "Sharing income proof, bank statements and loan documents with loan agents, banks or NBFCs is a disclosure of personal (and financial) data to a third party. It should be purposeful, with the client's awareness or consent, and access-controlled — not forwarded case-by-case over WhatsApp or email whenever a partner asks.",
  },
  {
    question: "How long can we keep old leads, KYC copies and closed-deal records?",
    answer:
      "The DPDPA expects data to be kept only as long as the purpose requires. Real estate firms often keep old buyer and tenant databases indefinitely for 'future deals' — that's the main exposure. Define a retention period for leads, KYC copies, agreements and property papers, archive or delete past it, and offer clients a way to request deletion or correction.",
  },
];

export const metadata: Metadata = {
  title: "DPDPA for Real Estate Brokers & Property Firms",
  description:
    "Your real estate firm doesn't just close deals — it moves buyer, tenant and property data across people and networks. See where buyer/tenant KYC, PAN/Aadhaar, agreements, WhatsApp lead sharing, broker networks, loan partners and old lead retention create DPDPA exposure, and run a free 3-minute risk scan.",
  alternates: { canonical: "https://saralprivacy.com/industries/real-estate" },
};

const BUCKET_DETAIL: Record<string, { icon: ReactNode; example: string; action: string }> = {
  client_lead_data: {
    icon: <ClipboardList size={18} />,
    example:
      "Buyer, tenant, seller and landlord contacts; address, budget and location preferences; site-visit history; family, occupancy and income signals; NRI and reference details.",
    action: "Map client and lead data, and explain data use and sharing clearly in your lead or site-visit form.",
  },
  kyc_property_document: {
    icon: <FileKey2 size={18} />,
    example:
      "PAN, Aadhaar, passport/NRI documents; rent and sale agreements; title papers; bank statements, loan and income documents; tenant/police verification.",
    action: "Standardise secure KYC collection and cut PAN/Aadhaar and property-paper exchange over WhatsApp.",
  },
  broker_network_sharing: {
    icon: <Share2 size={18} />,
    example:
      "Buyer/tenant details forwarded to co-broker WhatsApp groups, lead sheets, builder teams, landlords, societies, loan agents and registration vendors.",
    action: "Share only with client instruction or a documented purpose, and track who receives what.",
  },
  crm_staff_vendor_access: {
    icon: <Database size={18} />,
    example:
      "Leads and KYC across CRM, Google Sheets, cloud folders, WhatsApp, staff phones and drives; access for sales staff, field execs, freelancers, co-brokers and ex-staff.",
    action: "Consolidate storage, move to role/deal-based access, and remove ex-staff and old broker access.",
  },
  retention_incident_readiness: {
    icon: <ShieldAlert size={18} />,
    example:
      "Old buyer/tenant leads, KYC copies and closed-deal records kept for years; no clear plan for a wrong-recipient WhatsApp, an exposed lead sheet or a forwarded PAN copy.",
    action: "Set a retention + deletion schedule and a simple wrong-recipient/breach response.",
  },
};

const STEPS = [
  { n: 1, title: "Answer 10 quick questions", body: "About your practice, lead data, KYC and property documents, intake, storage, broker sharing, access, notice and retention. ~3 minutes." },
  { n: 2, title: "See your readiness score + risk map", body: "A 0–100 DPDPA readiness score, your risk band, and five real-estate-specific risk areas." },
  { n: 3, title: "Get your priority fixes + checklist", body: "The five controls to start with, plus the Real Estate DPDPA Starter Checklist." },
];

const scanChecks = [
  "What real estate work you do and the buyer/tenant/landlord data you hold",
  "Which KYC and property documents you collect — PAN, Aadhaar, agreements, title, loan",
  "How clients share KYC and property papers — portal, WhatsApp, email, field staff",
  "Where leads and documents are stored — CRM, sheets, WhatsApp, staff phones, cloud",
  "How you share details with co-brokers, builders, landlords, societies and lenders",
  "Who can access leads and documents — sales staff, field execs, freelancers, ex-staff",
  "Whether your lead/site-visit form explains data use, sharing and retention",
  "How long old leads and KYC are kept and whether you can respond to an incident",
];

export default function RealEstatePage() {
  const p = realEstatePack.positioning;
  return (
    <>
      {breadcrumbSchema([
        { name: "Home", url: "https://saralprivacy.com" },
        { name: "Industries", url: "https://saralprivacy.com/industries" },
        { name: "Real Estate Brokers & Property Firms", url: "https://saralprivacy.com/industries/real-estate" },
      ])}
      {faqPageSchema(faqs, {
        url: "https://saralprivacy.com/industries/real-estate",
        dateModified: toISODate(FRESHNESS.industry),
      })}
      {speakableSchema([".answer-block"], "https://saralprivacy.com/industries/real-estate", "DPDPA for Real Estate Brokers & Property Firms")}

      <div className="min-h-screen bg-pearl-50">
        {/* Hero */}
        <div className="bg-navy-700 py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-teal-300">
              <ShieldCheck size={18} /> Industry Guide · Real Estate Brokers & Property Firms
            </div>
            <h1 className="max-w-3xl text-3xl font-semibold leading-tight text-white sm:text-4xl">{p.hero}</h1>
            <div className="answer-block mt-5 max-w-2xl rounded-xl border border-white/15 bg-white/10 px-5 py-4" data-speakable="true">
              <p className="text-sm leading-relaxed text-slate-200">{p.sub}</p>
              <p className="mt-2 text-xs font-medium text-teal-300">
                Most real estate firms don&apos;t have a lead-generation problem — they have a lead-and-document <em>control</em> problem.
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/assessment/real-estate" className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-600">
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
                <h2 className="text-2xl font-semibold text-navy-700">Your client &amp; property-data risk map</h2>
                <p className="mt-1 text-sm text-slate-600">The free scan scores your firm across these five areas. Here is what each one looks at.</p>
                <div className="mt-5 space-y-4">
                  {realEstatePack.buckets.map((b) => {
                    const d = BUCKET_DETAIL[b.key];
                    return (
                      <div key={b.key} className="rounded-xl border border-slate-200 bg-white p-5">
                        <div className="mb-2 flex items-center gap-2.5">
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-700">{d.icon}</span>
                          <h3 className="font-semibold text-navy-700">{b.label}</h3>
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

              {/* Personal Data Flow Map preview - understand the sector, then
                  see the flow, then take the scan. */}
              <DataFlowPreview
                pack={realEstateDataFlowPack}
                href="/industries/real-estate/data-flow"
              />

              {/* How it works */}
              <section>
                <h2 className="text-2xl font-semibold text-navy-700">How the 3-minute scan works</h2>
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {STEPS.map((s) => (
                    <div key={s.n} className="rounded-xl border border-slate-200 bg-white p-5">
                      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-green-100 font-bold text-green-700">{s.n}</div>
                      <h3 className="text-sm font-semibold text-navy-700">{s.title}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600">{s.body}</p>
                    </div>
                  ))}
                </div>
                <Link href="/assessment/real-estate" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-navy-700 px-6 py-3 font-semibold text-white transition-colors hover:bg-navy-800">
                  {p.cta} <ArrowRight size={18} />
                </Link>
              </section>

              {/* What the scan checks */}
              <section>
                <h2 className="text-2xl font-semibold text-navy-700">What the scan checks</h2>
                <p className="mt-1 text-sm text-slate-600">Ten plain-English questions across your real property-client data workflows. The scan collects no client documents.</p>
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
                <h2 className="text-2xl font-semibold text-navy-700">Real estate DPDPA questions</h2>
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
                <h3 className="font-semibold">Take the free scan</h3>
                <p className="mt-2 text-sm text-teal-100">10 questions · 3 minutes · free · no login. Get your firm&apos;s DPDPA readiness score.</p>
                <Link href="/assessment/real-estate" className="mt-4 block rounded-lg bg-white py-2.5 text-center text-sm font-bold text-teal-800 hover:bg-teal-50">
                  Start Real Estate Risk Scan →
                </Link>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="mb-2 text-sm font-semibold text-navy-700">Free Guide</h3>
                <p className="mb-3 text-xs text-slate-600">DPDPA compliance guide for Indian businesses.</p>
                <Link href="/white-paper" className="block rounded-lg bg-navy-700 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-navy-800">
                  Download the Guide →
                </Link>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="mb-3 text-sm font-semibold text-navy-700">Related Briefings</h3>
                <div className="space-y-2">
                  <Link href="/briefings/dpdpa-consent-notice-requirements-2025" className="block text-sm text-green-600 hover:underline">→ Consent Notice Requirements</Link>
                  <Link href="/briefings/rights-of-data-principals-dpdpa-explained" className="block text-sm text-green-600 hover:underline">→ Rights of Data Principals</Link>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-pearl-100 p-5">
                <h3 className="mb-2 text-sm font-semibold text-navy-700">Need advice?</h3>
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
