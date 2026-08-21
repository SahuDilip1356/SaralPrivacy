import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ArrowRight,
  ClipboardList,
  Baby,
  Cctv,
  Database,
  ShieldAlert,
} from "lucide-react";
import { breadcrumbSchema, faqPageSchema, speakableSchema } from "@/lib/schema";
import { FRESHNESS, toISODate } from "@/lib/content-freshness";
import { schoolsCollegesPack } from "@/lib/data/industry-assessment/packs/schools-colleges";
import { schoolsCollegesDataFlowPack } from "@/lib/data/data-flow/schools-colleges";
import { DataFlowPreview } from "@/components/industries/DataFlowPreview";

const faqs = [
  {
    question: "Does the DPDPA apply to schools and colleges?",
    answer:
      "Yes. Schools and colleges process large volumes of student and parent personal data — admission forms, ID proof, marks, fee records, health details, photos and contact information — which makes them Data Fiduciaries under the Digital Personal Data Protection Act, 2023. Because most schools handle children's data, additional safeguards apply regardless of the institution's size.",
  },
  {
    question: "How does the DPDPA treat children's data in schools?",
    answer:
      "Data of students below 18 is treated as children's data. Processing it generally needs verifiable parental/guardian consent, and the law restricts tracking, behavioural monitoring and targeted advertising directed at children. In practice the key control is a clear admission-time notice and documented parent consent covering school apps, photos, CCTV, transport, LMS and vendor platforms — not just a website privacy policy.",
  },
  {
    question: "Can we post student photos, toppers and event videos on social media?",
    answer:
      "You can, but for minors this is a high-sensitivity workflow. Take separate, documented consent for publishing photos, videos and results, tell parents where images will appear, and offer a simple removal process on request. Publishing student images and results publicly without separate consent is a common DPDPA gap for schools.",
  },
  {
    question: "Are CCTV, biometric attendance and transport GPS allowed in schools?",
    answer:
      "These safety systems are legitimate, but they create continuous monitoring and location data — especially for children. You need a defined purpose, access controls over who can view footage or location, a retention limit, and visible notice/signage. Biometric data is sensitive and hard to revoke, so it needs particular care.",
  },
  {
    question: "How long can we keep old student records, photos and CCTV footage?",
    answer:
      "The DPDPA expects data to be kept only as long as the purpose requires. The risk for schools is keeping old admission files, parent contacts, app data, photos and CCTV footage indefinitely with no documented schedule, access control or review. Define a retention period by record type and archive or delete past it.",
  },
];

export const metadata: Metadata = {
  title: "DPDPA for Schools & Colleges",
  description:
    "Your institution doesn't just educate students — it collects, monitors and shares student data every day. See where children's data, parent consent, school apps, CCTV, attendance, transport GPS, student photos and old records create DPDPA exposure, and run a free 3-minute risk scan.",
  alternates: { canonical: "https://saralprivacy.com/industries/schools-colleges" },
};

const BUCKET_DETAIL: Record<string, { icon: ReactNode; example: string; action: string }> = {
  student_parent_data: {
    icon: <ClipboardList size={18} />,
    example:
      "Admission forms, ID proof and birth certificates, marks and attendance, fee and scholarship data, health and emergency contacts, transport and hostel records.",
    action: "Map student and parent data across admission, fee, academic, health, transport and app workflows.",
  },
  children_consent: {
    icon: <Baby size={18} />,
    example:
      "Students below 18, parent/guardian consent and notice at admission, and the WhatsApp/social channels used to reach parents and students.",
    action: "Build a parent/guardian notice and consent workflow covering data, apps, photos, CCTV, transport and vendors.",
  },
  monitoring_safety_systems: {
    icon: <Cctv size={18} />,
    example:
      "CCTV in common and sensitive areas, biometric and RFID attendance, transport GPS/bus tracking, hostel entry/exit and visitor management.",
    action: "Define purpose, access rights, retention and signage for every monitoring and location system.",
  },
  learning_vendor_platform: {
    icon: <Database size={18} />,
    example:
      "School ERP/SIS, LMS, parent app, fee portal, online exam tools, attendance/CCTV vendors, EdTech, placement and alumni platforms.",
    action: "Keep a vendor register of every platform that touches student data, with role-based access and data terms.",
  },
  retention_sharing_rights: {
    icon: <ShieldAlert size={18} />,
    example:
      "Student photos and results posted publicly; sharing with boards, vendors, transport and placement partners; old records and CCTV footage kept for years.",
    action: "Set retention + deletion rules and control external sharing, photo consent and removal requests.",
  },
};

const STEPS = [
  { n: 1, title: "Answer 10 quick questions", body: "About your students and parent data, minors, consent, school apps, communication, monitoring systems, sharing and retention. ~3 minutes." },
  { n: 2, title: "See your readiness score + risk map", body: "A 0–100 DPDPA readiness score, your risk band, and five school/college-specific risk areas." },
  { n: 3, title: "Get your priority fixes + checklist", body: "The five controls to start with, plus the School & College DPDPA Starter Checklist." },
];

const scanChecks = [
  "What type of institution you run and the student and parent data you hold",
  "Whether you enrol students below 18 — and how parent/guardian consent is taken",
  "Which school apps, ERP, LMS, fee portals and EdTech vendors process student data",
  "How you communicate with parents and students — apps, WhatsApp, social groups",
  "How student photos, videos and results are used publicly",
  "Whether CCTV, biometric, RFID, transport GPS or hostel monitoring is governed",
  "Who student data is shared with — boards, vendors, transport, placement partners",
  "How long old student records, photos and CCTV footage are kept",
];

export default function SchoolsCollegesPage() {
  const p = schoolsCollegesPack.positioning;
  return (
    <>
      {breadcrumbSchema([
        { name: "Home", url: "https://saralprivacy.com" },
        { name: "Industries", url: "https://saralprivacy.com/industries" },
        { name: "Schools & Colleges", url: "https://saralprivacy.com/industries/schools-colleges" },
      ])}
      {faqPageSchema(faqs, {
        url: "https://saralprivacy.com/industries/schools-colleges",
        dateModified: toISODate(FRESHNESS.industry),
      })}
      {speakableSchema([".answer-block"], "https://saralprivacy.com/industries/schools-colleges", "DPDPA for Schools & Colleges")}

      <div className="min-h-screen bg-pearl-50">
        {/* Hero */}
        <div className="bg-navy-700 py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-teal-300">
              <ShieldCheck size={18} /> Industry Guide · Schools & Colleges
            </div>
            <h1 className="max-w-3xl text-3xl font-semibold leading-tight text-white sm:text-4xl">{p.hero}</h1>
            <div className="answer-block mt-5 max-w-2xl rounded-xl border border-white/15 bg-white/10 px-5 py-4" data-speakable="true">
              <p className="text-sm leading-relaxed text-slate-200">{p.sub}</p>
              <p className="mt-2 text-xs font-medium text-teal-300">
                Most schools don&apos;t have a teaching problem — they have a student-data <em>control</em> problem.
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/assessment/schools-colleges" className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-800">
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
                <h2 className="text-2xl font-semibold text-navy-700">Your student-data risk map</h2>
                <p className="mt-1 text-sm text-slate-600">The free scan scores your school or college across these five areas. Here is what each one looks at.</p>
                <div className="mt-5 space-y-4">
                  {schoolsCollegesPack.buckets.map((b) => {
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
                pack={schoolsCollegesDataFlowPack}
                href="/industries/schools-colleges/data-flow"
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
                <Link href="/assessment/schools-colleges" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-navy-700 px-6 py-3 font-semibold text-white transition-colors hover:bg-navy-800">
                  {p.cta} <ArrowRight size={18} />
                </Link>
              </section>

              {/* What the scan checks */}
              <section>
                <h2 className="text-2xl font-semibold text-navy-700">What the scan checks</h2>
                <p className="mt-1 text-sm text-slate-600">Ten plain-English questions across your real student-data workflows. The scan collects no student data.</p>
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
                <h2 className="text-2xl font-semibold text-navy-700">School & college DPDPA questions</h2>
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
                <p className="mt-2 text-sm text-teal-50">10 questions · 3 minutes · free · no login. Get your school or college&apos;s DPDPA readiness score.</p>
                <Link href="/assessment/schools-colleges" className="mt-4 block rounded-lg bg-white py-2.5 text-center text-sm font-bold text-teal-800 hover:bg-teal-50">
                  Start School / College Risk Scan →
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
                  <Link href="/briefings/training-institutes-student-data-dpdpa" className="block text-sm text-green-800 hover:underline">→ Student Data &amp; the DPDPA</Link>
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
