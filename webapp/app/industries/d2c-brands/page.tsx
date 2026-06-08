import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ArrowRight,
  Database,
  MessageSquare,
  Crosshair,
  Share2,
  Trash2,
} from "lucide-react";
import { breadcrumbSchema, faqPageSchema, speakableSchema } from "@/lib/schema";
import { Byline } from "@/components/seo/Byline";
import { FRESHNESS, toISODate } from "@/lib/content-freshness";
import { d2cBrandsPack } from "@/lib/data/industry-assessment/packs/d2c-brands";

const faqs = [
  {
    question: "Does the DPDPA apply to D2C brands and e-commerce stores?",
    answer:
      "Yes. D2C brands collect and process extensive customer personal data — checkout details, purchase history, WhatsApp numbers, analytics profiles, loyalty data, and behavioural signals. This makes them Data Fiduciaries under the Digital Personal Data Protection Act, 2023. All D2C businesses selling to Indian customers are covered, regardless of size.",
  },
  {
    question: "Can we send WhatsApp marketing messages to customers who placed an order on our store?",
    answer:
      "Not automatically. Transactional consent (placing an order) does not extend to marketing messages. Under DPDPA, marketing via WhatsApp, SMS, or email requires separate, specific consent for that purpose. You must implement a distinct opt-in at checkout or during onboarding for marketing communications, and run a re-consent campaign for your existing subscriber list.",
  },
  {
    question: "Is a pre-ticked marketing checkbox at checkout compliant with DPDPA?",
    answer:
      "No. DPDPA requires consent to be free, specific, informed, and unambiguous. Pre-ticked boxes do not satisfy these conditions because the user has not taken an active affirmative action. Checkboxes bundled with order acceptance also fail the specificity test. Each marketing channel (email, SMS, WhatsApp) should have a separate unchecked consent option.",
  },
  {
    question: "Do tools like Meta Pixel and Google Analytics need to be disclosed under DPDPA?",
    answer:
      "Yes. Third-party analytics and advertising tools process personal data of your customers and visitors. Under DPDPA, you must disclose all such tools in your Privacy Notice. For non-essential tracking (remarketing, behavioural profiling), you should also implement a consent mechanism before these tools fire — and you can only disclose tracking you actually know about, which is why agency-managed or unaccounted scripts are a particular risk.",
  },
  {
    question: "How long can we keep customer personal data after their last purchase?",
    answer:
      "DPDPA requires deletion once the purpose for collecting data is no longer valid. A practical retention policy for D2C brands: keep data for active customers as long as the relationship continues; for inactive customers (no purchase in 12–18 months), send a re-engagement notice and delete unless the customer responds. Do not hold data indefinitely without a defined purpose.",
  },
];

export const metadata: Metadata = {
  title: "DPDPA for D2C Brands",
  description:
    "Your D2C brand doesn't just sell products — it tracks, messages and retargets customers every day. See where marketing consent, WhatsApp/SMS opt-in, tracking pixels, vendors and customer-data retention create DPDPA exposure, and run a free 3-minute risk scan.",
  alternates: { canonical: "https://saralprivacy.com/industries/d2c-brands" },
};

const BUCKET_DETAIL: Record<string, { icon: ReactNode; example: string; action: string }> = {
  customer_data_collection: {
    icon: <Database size={18} />,
    example:
      "Checkout details, customer accounts, order history, browsing behaviour, skin/health/body data, reviews/UGC and customer lists exported from marketplaces.",
    action: "Collect only the customer data you use, treat health/body data as sensitive, and avoid reusing marketplace exports for marketing.",
  },
  marketing_consent: {
    icon: <MessageSquare size={18} />,
    example:
      "Promotional WhatsApp broadcasts, SMS and email campaigns, cart-abandonment and lifecycle flows, pre-ticked boxes and 'purchase = consent' assumptions.",
    action: "Capture a clear opt-in before any marketing, and keep one central preference the customer can change.",
  },
  tracking_adtech: {
    icon: <Crosshair size={18} />,
    example:
      "Meta Pixel, Google Analytics and Ads tags, TikTok/Pinterest pixels, session recording, and agency-managed or unknown scripts on your store.",
    action: "Inventory every pixel and tag, disclose them, and remove any tracking you can't account for.",
  },
  vendor_fulfilment: {
    icon: <Share2 size={18} />,
    example:
      "Payment gateways, courier/logistics partners, email/SMS/WhatsApp platforms, CRM and helpdesk tools, plugins/apps and external agencies.",
    action: "List every vendor that touches customer data, put processing terms in place, and lock down store-admin access.",
  },
  retention_preferences: {
    icon: <Trash2 size={18} />,
    example:
      "Inactive customers, old exports and lists kept indefinitely, opt-outs handled manually, and no clear way to delete on request.",
    action: "Set a documented retention + deletion schedule, and give customers a clear way to access, correct or delete their data.",
  },
};

const STEPS = [
  { n: 1, title: "Answer 10 quick questions", body: "About your store profile, customer data, marketing consent, tracking, vendors, access and retention. ~3 minutes." },
  { n: 2, title: "See your readiness score + risk map", body: "A 0–100 DPDPA readiness score, your risk band, and five D2C-specific risk areas." },
  { n: 3, title: "Get your priority fixes + checklist", body: "The five controls to start with, plus the D2C Brand DPDPA Starter Checklist." },
];

const scanChecks = [
  "How your brand sells — own store, Instagram/WhatsApp, marketplaces, omnichannel",
  "Which customer data you hold — including accounts, behaviour, health/body and marketplace exports",
  "How you message customers, and whether promotions have a clear opt-in",
  "Whether marketing consent is real or implied by a purchase or pre-ticked box",
  "How customers can opt out — across WhatsApp, SMS and email, not just one channel",
  "Which lifecycle, recommendation and ad-audience features profile your customers",
  "Which pixels, tags and agency scripts run on your store",
  "Which vendors receive customer data, who can access your admin, and how long data is kept",
];

export default function D2CBrandsPage() {
  const p = d2cBrandsPack.positioning;
  return (
    <>
      {breadcrumbSchema([
        { name: "Home", url: "https://saralprivacy.com" },
        { name: "Industries", url: "https://saralprivacy.com/industries" },
        { name: "D2C Brands", url: "https://saralprivacy.com/industries/d2c-brands" },
      ])}
      {faqPageSchema(faqs, {
        url: "https://saralprivacy.com/industries/d2c-brands",
        dateModified: toISODate(FRESHNESS.industry),
      })}
      {speakableSchema([".answer-block"], "https://saralprivacy.com/industries/d2c-brands")}

      <div className="min-h-screen bg-pearl-50">
        {/* Hero */}
        <div className="bg-navy-700 py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-teal-300">
              <ShieldCheck size={18} /> Industry Guide · D2C Brands
            </div>
            <h1 className="max-w-3xl text-3xl font-bold leading-tight text-white sm:text-4xl">{p.hero}</h1>
            <div className="answer-block mt-5 max-w-2xl rounded-xl border border-white/15 bg-white/10 px-5 py-4" data-speakable="true">
              <p className="text-sm leading-relaxed text-slate-200">{p.sub}</p>
              <p className="mt-2 text-xs font-medium text-teal-300">
                Most D2C brands don&apos;t have a customer-data problem — they have a marketing-data <em>control</em> problem.
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/assessment/d2c-brands" className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-600">
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
                <h2 className="text-2xl font-bold text-navy-700">Your customer-data risk map</h2>
                <p className="mt-1 text-sm text-slate-600">The free scan scores your brand across these five areas. Here is what each one looks at.</p>
                <div className="mt-5 space-y-4">
                  {d2cBrandsPack.buckets.map((b) => {
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
                <Link href="/assessment/d2c-brands" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-navy-700 px-6 py-3 font-semibold text-white transition-colors hover:bg-navy-800">
                  {p.cta} <ArrowRight size={18} />
                </Link>
              </section>

              {/* What the scan checks */}
              <section>
                <h2 className="text-2xl font-bold text-navy-700">What the scan checks</h2>
                <p className="mt-1 text-sm text-slate-600">Ten plain-English questions across your real customer-data workflows.</p>
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
                <h2 className="text-2xl font-bold text-navy-700">D2C brand DPDPA questions</h2>
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
                <p className="mt-2 text-sm text-teal-100">10 questions · 3 minutes · free · no login. Get your brand&apos;s DPDPA readiness score.</p>
                <Link href="/assessment/d2c-brands" className="mt-4 block rounded-lg bg-white py-2.5 text-center text-sm font-bold text-teal-800 hover:bg-teal-50">
                  Start D2C Brand Risk Scan →
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
                  <Link href="/briefings/d2c-brands-whatsapp-marketing-consent-dpdpa" className="block text-sm text-green-600 hover:underline">→ WhatsApp Marketing Consent</Link>
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
            <p><strong>Last reviewed:</strong> March 2026</p>
            <p><strong>Legal baseline:</strong> DPDP Rules, 2025 notified on 14 November 2025, with phased commencement.</p>
            <p>This page is for educational purposes and does not constitute legal advice.</p>
          </div>
        </div>
      </div>
    </>
  );
}
