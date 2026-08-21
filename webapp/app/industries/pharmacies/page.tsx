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
import { pharmaciesPack } from "@/lib/data/industry-assessment/packs/pharmacies";
import { pharmaciesDataFlowPack } from "@/lib/data/data-flow/pharmacies";
import { DataFlowPreview } from "@/components/industries/DataFlowPreview";

const faqs = [
  {
    question: "Does the DPDPA apply to pharmacies and online pharmacies?",
    answer:
      "Yes. Retail pharmacies, chemist shops, online pharmacies and chains collect and store prescriptions, medicine history, doctor details, delivery addresses and payment records — health-linked personal data that makes them Data Fiduciaries under the Digital Personal Data Protection Act, 2023. Obligations apply regardless of size, and increase as you share data with delivery partners, aggregators and telemedicine platforms.",
  },
  {
    question: "Can customers send prescription images over WhatsApp?",
    answer:
      "It is common, but prescription images on WhatsApp and staff phones are easy to forward and hard to delete consistently. Prefer a secure app or website upload, keep prescriptions in your billing/POS system rather than personal devices, restrict who can access them, and set a deletion rule once the order and any refill cycle are complete.",
  },
  {
    question: "Is medicine history really sensitive if we don't record a diagnosis?",
    answer:
      "Yes. Medicine categories can reveal high-impact health indicators — diabetes, cardiac, mental-health, fertility, sexual-health, oncology or HIV conditions — even when no diagnosis field is stored. Treat medicine-history data as high-impact, limit who can see it, and avoid using it for promotional targeting without clear, separate consent.",
  },
  {
    question: "What should we control when sharing data with delivery partners and aggregators?",
    answer:
      "Delivery partners, marketplaces, aggregators and telemedicine platforms should receive only what they need to fulfil the order — not full prescription or medicine-history details. Keep a vendor-sharing register, define the purpose for each, limit delivery-staff access, and review it periodically.",
  },
  {
    question: "How long can we keep old prescriptions and order history?",
    answer:
      "The DPDPA expects data to be kept only as long as the purpose requires. Pharmacies often retain prescriptions, medicine history and WhatsApp orders indefinitely for convenience or refills — that's the main exposure. Define a retention period, archive or delete past it, and offer customers a way to request correction or deletion of old phone numbers, addresses and prescription images.",
  },
];

export const metadata: Metadata = {
  title: "DPDPA for Pharmacies & Online Pharmacies",
  description:
    "Your pharmacy doesn't just sell medicines — it stores prescription and medicine-history data every day. See where prescriptions, medicine history, health indicators, WhatsApp orders, refill reminders, delivery partners and old prescription retention create DPDPA exposure, and run a free 3-minute risk scan.",
  alternates: { canonical: "https://saralprivacy.com/industries/pharmacies" },
};

const BUCKET_DETAIL: Record<string, { icon: ReactNode; example: string; action: string }> = {
  customer_prescription_data: {
    icon: <ClipboardList size={18} />,
    example:
      "Customer name, phone and delivery address; prescription images; doctor and clinic details; medicine order history; family/caregiver orders; billing and profile data.",
    action: "Map prescription and customer data across in-store, WhatsApp, app and delivery, and define who can access it.",
  },
  health_indicator_medicine_history: {
    icon: <FileKey2 size={18} />,
    example:
      "Chronic-care, mental-health, fertility, sexual-health, oncology, HIV and controlled medicine categories that can reveal high-impact health indicators even without a diagnosis field.",
    action: "Treat medicine-history as high-impact; don't use it for targeting without clear, separate consent.",
  },
  order_delivery_vendor_sharing: {
    icon: <Share2 size={18} />,
    example:
      "Data shared with delivery partners, payment gateways, marketplaces and aggregators, telemedicine platforms, hospital/clinic partners, insurers, CRM/marketing and IT vendors.",
    action: "Keep a vendor-sharing register and limit delivery/vendor access to only what fulfilment needs.",
  },
  system_staff_access: {
    icon: <Database size={18} />,
    example:
      "Prescriptions and orders across billing/POS software, WhatsApp, staff phones, sheets, cloud folders and branch systems; access for pharmacists, counter staff, delivery staff and vendors.",
    action: "Consolidate storage, move to role-based access, and remove ex-staff and old vendor access.",
  },
  retention_refill_incident: {
    icon: <ShieldAlert size={18} />,
    example:
      "Old prescriptions, medicine order history, WhatsApp orders and delivery records kept for years; refill reminders based on medicine history; no clear plan for a wrong-prescription share.",
    action: "Set retention + refill-message rules and a simple wrong-recipient/breach response.",
  },
};

const STEPS = [
  { n: 1, title: "Answer 10 quick questions", body: "About your pharmacy type, customer and prescription data, medicine categories, intake, storage, vendor sharing, refill messaging, access and retention. ~3 minutes." },
  { n: 2, title: "See your readiness score + risk map", body: "A 0\u2013100 DPDPA readiness score, your risk band, and five pharmacy-specific risk areas." },
  { n: 3, title: "Get your priority fixes + checklist", body: "The five controls to start with, plus the Pharmacy DPDPA Starter Checklist." },
];

const scanChecks = [
  "What type of pharmacy you run and the customer/prescription data you hold",
  "Which medicine categories you handle \u2014 and the health indicators they can reveal",
  "How customers share prescriptions \u2014 secure upload, WhatsApp, email, delivery agent",
  "Where prescriptions and orders are stored \u2014 billing software, WhatsApp, staff phones",
  "Which external parties receive data \u2014 delivery, aggregators, telemedicine, insurers",
  "Whether refill reminders use consent and preference controls",
  "Who can access prescription records \u2014 pharmacists, counter, delivery staff, vendors",
  "How long old prescriptions are kept and whether you can respond to an incident",
];

export default function PharmaciesPage() {
  const p = pharmaciesPack.positioning;
  return (
    <>
      {breadcrumbSchema([
        { name: "Home", url: "https://saralprivacy.com" },
        { name: "Industries", url: "https://saralprivacy.com/industries" },
        { name: "Pharmacies & Online Pharmacies", url: "https://saralprivacy.com/industries/pharmacies" },
      ])}
      {faqPageSchema(faqs, {
        url: "https://saralprivacy.com/industries/pharmacies",
        dateModified: toISODate(FRESHNESS.industry),
      })}
      {speakableSchema([".answer-block"], "https://saralprivacy.com/industries/pharmacies", "DPDPA for Pharmacies & Online Pharmacies")}

      <div className="min-h-screen bg-pearl-50">
        {/* Hero */}
        <div className="bg-navy-700 py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-teal-300">
              <ShieldCheck size={18} /> Industry Guide · Pharmacies & Online Pharmacies
            </div>
            <h1 className="max-w-3xl text-3xl font-semibold leading-tight text-white sm:text-4xl">{p.hero}</h1>
            <div className="answer-block mt-5 max-w-2xl rounded-xl border border-white/15 bg-white/10 px-5 py-4" data-speakable="true">
              <p className="text-sm leading-relaxed text-slate-200">{p.sub}</p>
              <p className="mt-2 text-xs font-medium text-teal-300">
                Most pharmacies don&apos;t have a medicine-delivery problem — they have a prescription-data <em>control</em> problem.
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/assessment/pharmacies" className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-800">
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
                <h2 className="text-2xl font-semibold text-navy-700">Your prescription &amp; medicine-data risk map</h2>
                <p className="mt-1 text-sm text-slate-600">The free scan scores your firm across these five areas. Here is what each one looks at.</p>
                <div className="mt-5 space-y-4">
                  {pharmaciesPack.buckets.map((b) => {
                    const d = BUCKET_DETAIL[b.key];
                    return (
                      <div key={b.key} className="rounded-xl border border-slate-200 bg-white p-5">
                        <div className="mb-2 flex items-center gap-2.5">
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-800">{d.icon}</span>
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
                pack={pharmaciesDataFlowPack}
                href="/industries/pharmacies/data-flow"
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
                <Link href="/assessment/pharmacies" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-navy-700 px-6 py-3 font-semibold text-white transition-colors hover:bg-navy-800">
                  {p.cta} <ArrowRight size={18} />
                </Link>
              </section>

              {/* What the scan checks */}
              <section>
                <h2 className="text-2xl font-semibold text-navy-700">What the scan checks</h2>
                <p className="mt-1 text-sm text-slate-600">Ten plain-English questions across your real prescription and medicine-data workflows. The scan collects no prescriptions or patient records.</p>
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
                <h2 className="text-2xl font-semibold text-navy-700">Pharmacy DPDPA questions</h2>
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
              <div className="rounded-xl bg-teal-800 p-5 text-white">
                <h3 className="font-semibold text-white">Take the free scan</h3>
                <p className="mt-2 text-sm text-teal-50">10 questions · 3 minutes · free · no login. Get your firm&apos;s DPDPA readiness score.</p>
                <Link href="/assessment/pharmacies" className="mt-4 block rounded-lg bg-white py-2.5 text-center text-sm font-bold text-teal-800 hover:bg-teal-50">
                  Start Pharmacy Risk Scan →
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
                  <Link href="/briefings/dpdpa-consent-notice-requirements-2025" className="block text-sm text-green-800 hover:underline">→ Consent Notice Requirements</Link>
                  <Link href="/briefings/rights-of-data-principals-dpdpa-explained" className="block text-sm text-green-800 hover:underline">→ Rights of Data Principals</Link>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-pearl-100 p-5">
                <h3 className="mb-2 text-sm font-semibold text-navy-700">Need advice?</h3>
                <Link href="/contact" className="block rounded-lg bg-navy-700 py-2.5 text-center text-sm font-semibold text-white hover:bg-navy-800">Request Consultation →</Link>
              </div>
            </div>
          </div>

          <div data-nosnippet className="mt-10 space-y-1 border-t border-slate-200 pt-6 text-xs text-slate-600">
            <p><strong>Legal baseline:</strong> DPDP Rules, 2025 notified on 14 November 2025, with phased commencement.</p>
            <p>This page is for educational purposes and does not constitute legal advice.</p>
          </div>
        </div>
      </div>
    </>
  );
}
