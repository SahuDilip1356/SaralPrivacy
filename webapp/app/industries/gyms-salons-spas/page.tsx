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
import { gymsSalonsSpasPack } from "@/lib/data/industry-assessment/packs/gyms-salons-spas";

const faqs = [
  {
    question: "Does the DPDPA apply to gyms, salons and spas?",
    answer:
      "Yes. Gyms, salons, spas and wellness studios collect personal data that can reveal health, body, appearance and lifestyle — membership details, fitness goals, body measurements, health declarations, consultation notes and customer photos — which makes them Data Fiduciaries under the Digital Personal Data Protection Act, 2023. Obligations apply regardless of size, even though you are not a medical provider.",
  },
  {
    question: "Do we need consent to post customer before-after photos or testimonials?",
    answer:
      "Yes. Customer photos, before-after images, bridal photos and testimonials are personal data, and using them for social media or ads needs separate, documented consent plus a way for the customer to ask for removal. Posting transformation results without specific consent is one of the most common DPDPA exposures in this sector.",
  },
  {
    question: "Is fitness, body or consultation data really high-impact if we're not a clinic?",
    answer:
      "Yes. Weight, BMI, body measurements, injuries, allergies, skin/hair concerns and therapy notes are health and body data — high-impact even without a medical diagnosis. Limit who can access it, avoid keeping it in WhatsApp or staff notes without controls, and don't use it for promotion without clear consent.",
  },
  {
    question: "What about staff using personal phones and WhatsApp for customers?",
    answer:
      "Staff using personal phones or personal WhatsApp to message customers, store photos or keep notes puts customer data outside any access control — a major risk, especially with shared logins or ex-staff access. Move customer communication to business channels and role-based, reviewed access, and remove ex-staff and old vendor access promptly.",
  },
  {
    question: "How long can we keep old member records, photos and consultation notes?",
    answer:
      "The DPDPA expects data to be kept only as long as the purpose requires. Wellness businesses often keep old customer records, photos and consultation notes indefinitely for repeat bookings or marketing — that's the main exposure. Define a retention period, archive or delete past it, and offer customers a way to request removal of their photos and records.",
  },
];

export const metadata: Metadata = {
  title: "DPDPA for Gyms, Salons & Spas",
  description:
    "Your wellness business doesn't just manage appointments — it stores health, body and image data every day. See where membership data, fitness/body details, customer photos, WhatsApp campaigns, staff phones and old records create DPDPA exposure, and run a free 3-minute risk scan.",
  alternates: { canonical: "https://saralprivacy.com/industries/gyms-salons-spas" },
};

const BUCKET_DETAIL: Record<string, { icon: ReactNode; example: string; action: string }> = {
  customer_membership_data: {
    icon: <ClipboardList size={18} />,
    example:
      "Member name, contact, address and emergency contact; membership/appointment history; payment and wallet details; service preferences; family/couple bookings.",
    action: "Map customer data across booking apps, walk-in forms, WhatsApp, Instagram DMs and staff notes, and define who can access it.",
  },
  health_body_consultation_data: {
    icon: <FileKey2 size={18} />,
    example:
      "Fitness goals, weight, BMI and body measurements; medical conditions, injuries and allergies; skin, hair, body and therapy consultation notes.",
    action: "Treat health/body data as high-impact; limit access to staff who need it and keep it out of uncontrolled WhatsApp/notes.",
  },
  photos_marketing_whatsapp: {
    icon: <Share2 size={18} />,
    example:
      "Customer photos, before-after images, bridal photos, transformation posts and testimonials; WhatsApp/SMS promotional campaigns and reminders.",
    action: "Get separate consent before using customer photos, offer a removal route, and add a marketing opt-out separate from reminders.",
  },
  app_staff_vendor_access: {
    icon: <Database size={18} />,
    example:
      "Appointment apps, gym/salon software, CRM, payment tools, WhatsApp platforms, fitness/biometric devices, CCTV and marketing agencies; staff and ex-staff access.",
    action: "Move to role-based, reviewed access; stop personal-phone/WhatsApp use for customers; remove ex-staff and old vendor access.",
  },
  retention_rights_incident: {
    icon: <ShieldAlert size={18} />,
    example:
      "Old member records, photos, consultation notes, body metrics and WhatsApp chats kept for years; no plan for a wrong-photo share or exposed health note.",
    action: "Set retention + removal rules for photos and records, and write a simple wrong-recipient/breach response.",
  },
};

const STEPS = [
  { n: 1, title: "Answer 10 quick questions", body: "About your business type, customer data, health/body data, intake, photo consent, channels, apps/vendors, staff access and retention. ~3 minutes." },
  { n: 2, title: "See your readiness score + risk map", body: "A 0\u2013100 DPDPA readiness score, your risk band, and five wellness-specific risk areas." },
  { n: 3, title: "Get your priority fixes + checklist", body: "The five controls to start with, plus the Gym / Salon / Spa DPDPA Starter Checklist." },
];

const scanChecks = [
  "What wellness/personal-care service you run and the customer data you hold",
  "Which health and body data you collect \u2014 fitness goals, BMI, injuries, allergies",
  "How customer details, photos and health notes are shared \u2014 forms, WhatsApp, DMs",
  "Whether you use customer photos/testimonials for marketing \u2014 and with what consent",
  "Which communication channels you use \u2014 and whether promotions have an opt-out",
  "Which apps, devices and vendors process customer data \u2014 incl. biometric/CCTV",
  "Who can access customer profiles, photos and notes \u2014 staff phones, shared logins",
  "How long old records and photos are kept and whether you can respond to an incident",
];

export default function GymsSalonsSpasPage() {
  const p = gymsSalonsSpasPack.positioning;
  return (
    <>
      {breadcrumbSchema([
        { name: "Home", url: "https://saralprivacy.com" },
        { name: "Industries", url: "https://saralprivacy.com/industries" },
        { name: "Gyms, Salons & Spas", url: "https://saralprivacy.com/industries/gyms-salons-spas" },
      ])}
      {faqPageSchema(faqs, {
        url: "https://saralprivacy.com/industries/gyms-salons-spas",
        dateModified: toISODate(FRESHNESS.industry),
      })}
      {speakableSchema([".answer-block"], "https://saralprivacy.com/industries/gyms-salons-spas", "DPDPA for Gyms, Salons & Spas")}

      <div className="min-h-screen bg-pearl-50">
        {/* Hero */}
        <div className="bg-navy-700 py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-teal-300">
              <ShieldCheck size={18} /> Industry Guide · Gyms, Salons & Spas
            </div>
            <h1 className="max-w-3xl text-3xl font-bold leading-tight text-white sm:text-4xl">{p.hero}</h1>
            <div className="answer-block mt-5 max-w-2xl rounded-xl border border-white/15 bg-white/10 px-5 py-4" data-speakable="true">
              <p className="text-sm leading-relaxed text-slate-200">{p.sub}</p>
              <p className="mt-2 text-xs font-medium text-teal-300">
                Most wellness businesses don&apos;t have an appointment problem — they have a photo, health and customer-data <em>control</em> problem.
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/assessment/gyms-salons-spas" className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-600">
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
                <h2 className="text-2xl font-bold text-navy-700">Your customer &amp; wellness-data risk map</h2>
                <p className="mt-1 text-sm text-slate-600">The free scan scores your firm across these five areas. Here is what each one looks at.</p>
                <div className="mt-5 space-y-4">
                  {gymsSalonsSpasPack.buckets.map((b) => {
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
                <Link href="/assessment/gyms-salons-spas" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-navy-700 px-6 py-3 font-semibold text-white transition-colors hover:bg-navy-800">
                  {p.cta} <ArrowRight size={18} />
                </Link>
              </section>

              {/* What the scan checks */}
              <section>
                <h2 className="text-2xl font-bold text-navy-700">What the scan checks</h2>
                <p className="mt-1 text-sm text-slate-600">Ten plain-English questions across your real customer-data workflows. The scan collects no customer photos, health notes or records.</p>
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
                <h2 className="text-2xl font-bold text-navy-700">Gym, salon & spa DPDPA questions</h2>
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
                <Link href="/assessment/gyms-salons-spas" className="mt-4 block rounded-lg bg-white py-2.5 text-center text-sm font-bold text-teal-800 hover:bg-teal-50">
                  Start Gym / Salon / Spa Risk Scan →
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
