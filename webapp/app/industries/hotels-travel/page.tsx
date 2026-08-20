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
import { hotelsTravelPack } from "@/lib/data/industry-assessment/packs/hotels-travel";
import { hotelsTravelDataFlowPack } from "@/lib/data/data-flow/hotels-travel";
import { DataFlowPreview } from "@/components/industries/DataFlowPreview";

const faqs = [
  {
    question: "Does the DPDPA apply to hotels, resorts and travel agencies?",
    answer:
      "Yes. Hotels, resorts, homestays, travel agencies and tour operators collect and store large volumes of personal data — guest IDs, passport and visa copies, booking records, itineraries, payment details and foreign guest registers — which makes them Data Fiduciaries under the Digital Personal Data Protection Act, 2023. Obligations apply regardless of property size, and increase as you share data across OTAs, agents, transport vendors and corporate clients.",
  },
  {
    question: "Can guests share passport and ID copies over WhatsApp?",
    answer:
      "It is common, but passport copies and IDs arriving over WhatsApp or email are easy to forward and hard to delete consistently. Prefer a secure booking portal or upload link, avoid keeping duplicate copies on staff phones, restrict who can access them, and delete them once the stay or trip is complete.",
  },
  {
    question: "How should we handle passport copies and foreign guest / C-Form data?",
    answer:
      "Passport, visa and foreign guest / C-Form records are high-impact identity documents. Collect them only when required, store them in a system with access control rather than reception folders or inboxes, share only with the parties and authorities that genuinely need them, and set a clear retention and deletion rule instead of keeping them indefinitely.",
  },
  {
    question: "Do we need to control what we share with OTAs and travel vendors?",
    answer:
      "Yes. Guest and traveller data shared with OTAs, transport vendors, tour guides, visa consultants, insurers, corporate clients and partner properties is a disclosure of personal data to third parties. Keep a simple vendor and sharing register, share only what each party needs for a defined purpose, and review access periodically.",
  },
  {
    question: "How long can we keep guest IDs, booking records and CCTV footage?",
    answer:
      "The DPDPA expects data to be kept only as long as the purpose requires. Hotels and travel agencies often retain ID copies, booking records, travel documents and CCTV footage long after checkout. Define a retention period for each, archive or delete past it, document the purpose and access for CCTV and access logs, and offer guests a way to request deletion or correction.",
  },
];

export const metadata: Metadata = {
  title: "DPDPA for Hotels, Hospitality & Travel Agencies",
  description:
    "Your hotel or travel business doesn't just manage bookings — it collects, shares and stores guest travel data every day. See where guest IDs, passport copies, OTA sharing, WhatsApp confirmations, travel documents, CCTV and old guest-record retention create DPDPA exposure, and run a free 3-minute risk scan.",
  alternates: { canonical: "https://saralprivacy.com/industries/hotels-travel" },
};

const BUCKET_DETAIL: Record<string, { icon: ReactNode; example: string; action: string }> = {
  guest_traveller_data: {
    icon: <ClipboardList size={18} />,
    example:
      "Guest and traveller names, contact and nationality; stay dates, itineraries and preferences; companion and group details; payment, loyalty, emergency-contact and special-assistance data.",
    action: "Map guest and traveller data across booking, check-in, payment and itinerary, and explain data use clearly at booking.",
  },
  id_passport_travel_document: {
    icon: <FileKey2 size={18} />,
    example:
      "Aadhaar, PAN, passport and visa copies; tickets and travel insurance; foreign guest / C-Form data; corporate, medical-assistance and minor traveller documents.",
    action: "Standardise secure ID/passport collection and cut Aadhaar/passport exchange over WhatsApp and email.",
  },
  booking_ota_vendor_sharing: {
    icon: <Share2 size={18} />,
    example:
      "Guest data shared with OTAs, payment gateways, transport vendors, tour guides, visa consultants, insurers, corporate clients, partner properties and marketing tools.",
    action: "Keep a vendor and sharing register, and share only what each party needs for a defined purpose.",
  },
  system_staff_access: {
    icon: <Database size={18} />,
    example:
      "Guest records across PMS, OTA dashboards, WhatsApp, front-desk computers, staff phones and registers; CCTV, key-card and Wi-Fi logs; access for front desk, reservations, agents and vendors.",
    action: "Consolidate storage, move to role-based access, remove ex-staff/vendor access, and control CCTV/logs.",
  },
  retention_marketing_incident: {
    icon: <ShieldAlert size={18} />,
    example:
      "Old guest IDs, passport copies, booking records, travel documents and CCTV footage kept for years; no clear plan for a wrong-recipient WhatsApp or an exposed passport folder.",
    action: "Set a retention + deletion schedule and a simple wrong-recipient/breach response.",
  },
};

const STEPS = [
  { n: 1, title: "Answer 10 quick questions", body: "About your business type, guest data, ID/travel documents, intake, storage, OTA/vendor sharing, access, CCTV and retention. ~3 minutes." },
  { n: 2, title: "See your readiness score + risk map", body: "A 0\u2013100 DPDPA readiness score, your risk band, and five hotels-and-travel-specific risk areas." },
  { n: 3, title: "Get your priority fixes + checklist", body: "The five controls to start with, plus the Hotels & Travel DPDPA Starter Checklist." },
];

const scanChecks = [
  "What hospitality or travel work you do and the guest/traveller data you hold",
  "Which ID and travel documents you collect \u2014 Aadhaar, passport, visa, tickets, C-Form",
  "How guests share IDs and documents \u2014 portal, WhatsApp, email, OTA, front desk",
  "Where guest IDs and bookings are stored \u2014 PMS, OTA dashboards, WhatsApp, staff phones",
  "Which external parties receive guest data \u2014 OTAs, vendors, visa consultants, partners",
  "Who can access guest records \u2014 front desk, reservations, agents, vendors, ex-staff",
  "Whether CCTV, key-card and Wi-Fi logs have documented purpose and access controls",
  "How long guest IDs and bookings are kept and whether you can respond to an incident",
];

export default function HotelsTravelPage() {
  const p = hotelsTravelPack.positioning;
  return (
    <>
      {breadcrumbSchema([
        { name: "Home", url: "https://saralprivacy.com" },
        { name: "Industries", url: "https://saralprivacy.com/industries" },
        { name: "Hotels, Hospitality & Travel", url: "https://saralprivacy.com/industries/hotels-travel" },
      ])}
      {faqPageSchema(faqs, {
        url: "https://saralprivacy.com/industries/hotels-travel",
        dateModified: toISODate(FRESHNESS.industry),
      })}
      {speakableSchema([".answer-block"], "https://saralprivacy.com/industries/hotels-travel", "DPDPA for Hotels, Hospitality & Travel Agencies")}

      <div className="min-h-screen bg-pearl-50">
        {/* Hero */}
        <div className="bg-navy-700 py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-teal-300">
              <ShieldCheck size={18} /> Industry Guide · Hotels, Hospitality & Travel
            </div>
            <h1 className="max-w-3xl text-3xl font-semibold leading-tight text-white sm:text-4xl">{p.hero}</h1>
            <div className="answer-block mt-5 max-w-2xl rounded-xl border border-white/15 bg-white/10 px-5 py-4" data-speakable="true">
              <p className="text-sm leading-relaxed text-slate-200">{p.sub}</p>
              <p className="mt-2 text-xs font-medium text-teal-300">
                Most hotels and travel agencies don&apos;t have a booking problem — they have a guest-data <em>movement</em> problem.
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/assessment/hotels-travel" className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-600">
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
                <h2 className="text-2xl font-semibold text-navy-700">Your guest &amp; travel-data risk map</h2>
                <p className="mt-1 text-sm text-slate-600">The free scan scores your firm across these five areas. Here is what each one looks at.</p>
                <div className="mt-5 space-y-4">
                  {hotelsTravelPack.buckets.map((b) => {
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
                pack={hotelsTravelDataFlowPack}
                href="/industries/hotels-travel/data-flow"
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
                <Link href="/assessment/hotels-travel" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-navy-700 px-6 py-3 font-semibold text-white transition-colors hover:bg-navy-800">
                  {p.cta} <ArrowRight size={18} />
                </Link>
              </section>

              {/* What the scan checks */}
              <section>
                <h2 className="text-2xl font-semibold text-navy-700">What the scan checks</h2>
                <p className="mt-1 text-sm text-slate-600">Ten plain-English questions across your real guest and traveller data workflows. The scan collects no guest documents.</p>
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
                <h2 className="text-2xl font-semibold text-navy-700">Hotels & travel DPDPA questions</h2>
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
                <Link href="/assessment/hotels-travel" className="mt-4 block rounded-lg bg-white py-2.5 text-center text-sm font-bold text-teal-800 hover:bg-teal-50">
                  Start Hotels & Travel Risk Scan →
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

          <div data-nosnippet className="mt-10 space-y-1 border-t border-slate-200 pt-6 text-xs text-slate-400">
            <p><strong>Legal baseline:</strong> DPDP Rules, 2025 notified on 14 November 2025, with phased commencement.</p>
            <p>This page is for educational purposes and does not constitute legal advice.</p>
          </div>
        </div>
      </div>
    </>
  );
}
