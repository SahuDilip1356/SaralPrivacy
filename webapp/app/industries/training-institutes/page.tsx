import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ArrowRight,
  Users,
  ShieldAlert,
  MessageCircle,
  Plug,
  Trash2,
} from "lucide-react";
import { breadcrumbSchema, faqPageSchema, speakableSchema } from "@/lib/schema";
import { Byline } from "@/components/seo/Byline";
import { FRESHNESS, toISODate } from "@/lib/content-freshness";
import { trainingInstitutePack } from "@/lib/data/industry-assessment/packs/training-institutes";

const faqs = [
  {
    question: "Does the DPDPA apply to training institutes and coaching centres?",
    answer:
      "Yes. Training institutes and coaching centres collect personal data at every stage of the student lifecycle — enquiries, admissions, fee records, attendance, placements, and marketing. This makes them Data Fiduciaries under the Digital Personal Data Protection Act, 2023. All institutes, including small coaching centres, are covered.",
  },
  {
    question: "Do we need parental consent to collect data from students under 18?",
    answer:
      "Yes. Section 9 of the DPDPA and the DPDP Rules, 2025 require verifiable parental or guardian consent before processing personal data of children under 18. This applies to admissions forms, attendance systems, and marketing communications. Standard consent checkboxes signed by the student alone are not sufficient.",
  },
  {
    question: "Are our enquiry and admissions forms DPDPA-compliant?",
    answer:
      "Most are not. Common issues include no consent notice explaining purpose and data use, marketing consent bundled with admission processing, no mention of data sharing with third parties, and no information on the right to withdraw consent. Each form must include a clear, specific notice and separate consent checkboxes for different purposes.",
  },
  {
    question: "Can we use a student's placement data — salary, employer name — for marketing testimonials?",
    answer:
      "Not without separate, specific consent. Salary and employer details are personal data. Using them for marketing testimonials or social proof requires explicit written consent from the placed student that covers this specific use. The consent obtained at admission does not extend to this purpose.",
  },
  {
    question: "Can we use student photos or result screenshots in our marketing?",
    answer:
      "Only with documented consent — and for students under 18, verifiable parental consent. Photos, classroom videos, result screenshots and testimonials are personal data. Using them on social media, ads or your website without separate, specific consent is a common and serious gap, and the exposure is higher when minors appear in the content.",
  },
];

export const metadata: Metadata = {
  title: "DPDPA for Training Institutes",
  description:
    "Your institute doesn't just teach students — it collects, shares and stores student data every day. See where admissions, parental consent, WhatsApp, student photos, LMS tools and placement data create DPDPA exposure, and run a free 3-minute risk scan.",
  alternates: { canonical: "https://saralprivacy.com/industries/training-institutes" },
};

// Bucket → concrete example + first action, keyed to the scan's risk map.
const BUCKET_DETAIL: Record<string, { icon: ReactNode; example: string; action: string }> = {
  student_data_collection: {
    icon: <Users size={18} />,
    example:
      "Names, parent numbers, age/class, ID proof, marks, fees, photos and health data — across enquiry forms, Google Forms, WhatsApp and counsellor spreadsheets.",
    action: "Standardise intake to one controlled channel and collect only what each purpose actually needs.",
  },
  minor_parental_consent: {
    icon: <ShieldAlert size={18} />,
    example:
      "Students below 18 — admissions, attendance, photos, LMS use and marketing all need verifiable parent/guardian consent under Section 9.",
    action: "Record student age and capture verifiable parental consent at admission, with evidence you can produce later.",
  },
  communication_marketing: {
    icon: <MessageCircle size={18} />,
    example:
      "WhatsApp groups exposing parent/student numbers; student photos, result screenshots, testimonials and demo videos used in ads.",
    action: "Separate batch updates from promotion, document consent for any student media, and add a removal process.",
  },
  lms_vendor_platform: {
    icon: <Plug size={18} />,
    example:
      "LMS, online tests, CRM, payment, attendance/biometric, marketing tools and placement partners — all in your data chain.",
    action: "Keep a vendor register: review what each tool stores, who can access it, and what's shared with partners.",
  },
  retention_rights: {
    icon: <Trash2 size={18} />,
    example:
      "Old leads, admission records, test scores, attendance, student photos, payments and placement profiles kept indefinitely.",
    action: "Adopt a documented retention schedule with an annual deletion/archive review.",
  },
};

const STEPS = [
  { n: 1, title: "Answer 10 quick questions", body: "About your student data, minors, intake channels, WhatsApp, marketing media, LMS/vendors, sharing and retention. ~3 minutes." },
  { n: 2, title: "See your readiness score + risk map", body: "A 0–100 DPDPA readiness score, your risk band, and five training-institute risk areas." },
  { n: 3, title: "Get your priority fixes + checklist", body: "The five controls to start with, plus the Training Institute DPDPA Starter Checklist." },
];

const scanChecks = [
  "What type of training business you run and the student data you hold",
  "Whether you enrol students below 18, and how parental consent is obtained",
  "How admission, enquiry and fee information reaches your institute",
  "How WhatsApp groups and broadcast lists are used with students and parents",
  "Whether student photos, results, testimonials or recordings are used in marketing",
  "Which LMS, CRM, payment, attendance and marketing tools process student data",
  "What student data is shared with recruiters, colleges, partners or franchisees",
  "How long old student records are retained after course completion",
];

export default function TrainingInstitutesIndustryPage() {
  const p = trainingInstitutePack.positioning;
  return (
    <>
      {breadcrumbSchema([
        { name: "Home", url: "https://saralprivacy.com" },
        { name: "Industries", url: "https://saralprivacy.com/industries" },
        { name: "Training Institutes", url: "https://saralprivacy.com/industries/training-institutes" },
      ])}
      {faqPageSchema(faqs, {
        url: "https://saralprivacy.com/industries/training-institutes",
        dateModified: toISODate(FRESHNESS.industry),
      })}
      {speakableSchema([".answer-block"], "https://saralprivacy.com/industries/training-institutes")}

      <div className="min-h-screen bg-pearl-50">
        {/* Hero */}
        <div className="bg-navy-700 py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-teal-300">
              <ShieldCheck size={18} /> Industry Guide · Training Institutes
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
                Most institutes think they run classes. They also run a quiet little data factory.
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/assessment/training-institutes"
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
                <h2 className="text-2xl font-bold text-navy-700">Your student-data risk map</h2>
                <p className="mt-1 text-sm text-slate-600">
                  The free scan scores your institute across these five areas. Here is what each one looks at.
                </p>
                <div className="mt-5 space-y-4">
                  {trainingInstitutePack.buckets.map((b) => {
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
                  href="/assessment/training-institutes"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-navy-700 px-6 py-3 font-semibold text-white transition-colors hover:bg-navy-800"
                >
                  {p.cta} <ArrowRight size={18} />
                </Link>
              </section>

              {/* What the scan checks */}
              <section>
                <h2 className="text-2xl font-bold text-navy-700">What the scan checks</h2>
                <p className="mt-1 text-sm text-slate-600">Ten plain-English questions across your real student-data workflows.</p>
                <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6">
                  {scanChecks.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 border-b border-slate-100 py-2 last:border-0">
                      <div className="mt-0.5 h-5 w-5 shrink-0 rounded border-2 border-slate-300" />
                      <span className="text-sm text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* FAQ (visible + schema) */}
              <section className="answer-block">
                <h2 className="text-2xl font-bold text-navy-700">Training institute DPDPA questions</h2>
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
                <p className="mt-2 text-sm text-teal-100">10 questions · 3 minutes · free · no login. Get your institute&apos;s DPDPA readiness score.</p>
                <Link href="/assessment/training-institutes" className="mt-4 block rounded-lg bg-white py-2.5 text-center text-sm font-bold text-teal-800 hover:bg-teal-50">
                  Start Training Institute Risk Scan →
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
                  <Link href="/briefings/training-institutes-student-data-dpdpa" className="block text-sm text-green-600 hover:underline">→ Student Data and DPDPA</Link>
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
            <p><strong>Last reviewed:</strong> March 2026</p>
            <p><strong>Legal baseline:</strong> DPDP Rules, 2025 notified on 14 November 2025, with phased commencement.</p>
            <p>This page is for educational purposes and does not constitute legal advice.</p>
          </div>
        </div>
      </div>
    </>
  );
}
