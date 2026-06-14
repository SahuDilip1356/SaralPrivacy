import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ArrowRight,
  ClipboardList,
  Activity,
  Share2,
  Database,
  ShieldAlert,
} from "lucide-react";
import { breadcrumbSchema, faqPageSchema, speakableSchema } from "@/lib/schema";
import { FRESHNESS, toISODate } from "@/lib/content-freshness";
import { clinicsDiagnosticLabsPack } from "@/lib/data/industry-assessment/packs/clinics-diagnostic-labs";

const faqs = [
  {
    question: "Does the DPDPA apply to clinics and diagnostic labs?",
    answer:
      "Yes. Clinics and diagnostic labs process patient personal data — names, contact details, prescriptions, lab reports, diagnostic images and medical history — which makes them Data Fiduciaries under the Digital Personal Data Protection Act, 2023. Health data is among the most sensitive categories, so obligations apply regardless of the clinic or lab's size.",
  },
  {
    question: "Can we share lab reports or prescriptions with patients over WhatsApp?",
    answer:
      "You can, but it must be controlled. The bigger risk is sending a report to the wrong number or to a family member without the patient's authorisation. Verify the patient's identity and contact details before sharing, get consent for family-member or caregiver delivery, and prefer a secure portal or password-protected file for sensitive reports.",
  },
  {
    question: "Do we need patient consent to share reports with a referring doctor, hospital or TPA?",
    answer:
      "Sharing patient data with a referring doctor, hospital, insurer or TPA is a disclosure to a third party. It must have a clear basis — patient authorisation or a clear treatment/payment purpose — and the patient should be informed. Sharing reports simply because a partner or referring doctor asks, without authorisation or notice, is a common DPDPA gap.",
  },
  {
    question: "How long can we keep old patient reports, prescriptions and images?",
    answer:
      "The DPDPA expects data to be kept only as long as the purpose requires (alongside any medical-record retention obligations). The risk is not retention itself — it is keeping reports, prescriptions and images indefinitely with no documented schedule, access control or review. Define a retention period by record type and delete or archive past it.",
  },
  {
    question: "Is health data treated differently under the DPDPA?",
    answer:
      "Health data — diagnoses, lab reports, fertility, pregnancy, mental-health and chronic-condition details — carries higher sensitivity and reputational risk. It needs stronger access controls, careful sharing (especially over WhatsApp and with family members), and clear retention and incident-response processes.",
  },
];

export const metadata: Metadata = {
  title: "DPDPA for Clinics & Diagnostic Labs",
  description:
    "Your clinic doesn't just treat patients — it collects, stores and shares health data every day. See where prescriptions, lab reports, WhatsApp sharing, staff access, lab software and old-record retention create DPDPA exposure, and run a free 3-minute risk scan.",
  alternates: { canonical: "https://saralprivacy.com/industries/clinics-diagnostic-labs" },
};

const BUCKET_DETAIL: Record<string, { icon: ReactNode; example: string; action: string }> = {
  patient_data_collection: {
    icon: <ClipboardList size={18} />,
    example:
      "Patient details, prescriptions, ID proof and referral documents arriving via registration systems, paper forms, WhatsApp, phone calls, home collection and reception desks.",
    action: "Standardise intake — define approved channels and reduce scattered WhatsApp, phone and paper collection.",
  },
  health_data_sensitivity: {
    icon: <Activity size={18} />,
    example:
      "Lab reports, diagnostic images, diagnosis and chronic-condition details, and fertility, pregnancy or mental-health data.",
    action: "Treat health data as sensitive — limit who can access reports, images and sensitive treatment records.",
  },
  report_sharing_communication: {
    icon: <Share2 size={18} />,
    example:
      "Reports shared by WhatsApp to patients or family/caregivers, email, software links, field staff, referring doctors, hospitals and TPAs.",
    action: "Verify the recipient before sharing, control family-member sharing, and document partner disclosures.",
  },
  system_staff_vendor_access: {
    icon: <Database size={18} />,
    example:
      "Reception, billing, lab and support staff; clinic software/HIS, LIS, PACS; outsourced labs, home-collection partners, TPAs and IT vendors.",
    action: "Use role-based access, remove ex-staff access, and keep a register of every vendor that processes patient data.",
  },
  retention_incident_readiness: {
    icon: <ShieldAlert size={18} />,
    example:
      "Old reports, prescriptions and images kept for years; no clear plan for a wrong-recipient report, an exposed WhatsApp account or a system compromise.",
    action: "Set a retention + deletion schedule and a simple incident-response process for wrong-recipient and breach events.",
  },
};

const STEPS = [
  { n: 1, title: "Answer 10 quick questions", body: "About your patient data, intake channels, report sharing, recipient verification, staff/vendor access and retention. ~3 minutes." },
  { n: 2, title: "See your readiness score + risk map", body: "A 0–100 DPDPA readiness score, your risk band, and five clinic/lab-specific risk areas." },
  { n: 3, title: "Get your priority fixes + checklist", body: "The five controls to start with, plus the Clinic & Diagnostic Lab DPDPA Starter Checklist." },
];

const scanChecks = [
  "What type of clinic or lab you run and the patient data you hold",
  "How patients share information — portal, WhatsApp, phone, paper, home collection",
  "Which sensitive data you store — reports, images, fertility, mental-health, chronic conditions",
  "How prescriptions, reports and images are shared with patients",
  "Whether you verify the recipient before sharing reports",
  "Who inside the clinic or lab can access patient records — including ex-staff",
  "Which software, outsourced labs, TPAs and IT vendors process patient data",
  "How long old reports are kept and whether you can respond to an incident",
];

export default function ClinicsDiagnosticLabsPage() {
  const p = clinicsDiagnosticLabsPack.positioning;
  return (
    <>
      {breadcrumbSchema([
        { name: "Home", url: "https://saralprivacy.com" },
        { name: "Industries", url: "https://saralprivacy.com/industries" },
        { name: "Clinics & Diagnostic Labs", url: "https://saralprivacy.com/industries/clinics-diagnostic-labs" },
      ])}
      {faqPageSchema(faqs, {
        url: "https://saralprivacy.com/industries/clinics-diagnostic-labs",
        dateModified: toISODate(FRESHNESS.industry),
      })}
      {speakableSchema([".answer-block"], "https://saralprivacy.com/industries/clinics-diagnostic-labs", "DPDPA for Clinics & Diagnostic Labs")}

      <div className="min-h-screen bg-pearl-50">
        {/* Hero */}
        <div className="bg-navy-700 py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-teal-300">
              <ShieldCheck size={18} /> Industry Guide · Clinics & Diagnostic Labs
            </div>
            <h1 className="max-w-3xl text-3xl font-bold leading-tight text-white sm:text-4xl">{p.hero}</h1>
            <div className="answer-block mt-5 max-w-2xl rounded-xl border border-white/15 bg-white/10 px-5 py-4" data-speakable="true">
              <p className="text-sm leading-relaxed text-slate-200">{p.sub}</p>
              <p className="mt-2 text-xs font-medium text-teal-300">
                Most clinics don&apos;t have a patient-care problem — they have a patient-data <em>movement</em> problem.
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/assessment/clinics-diagnostic-labs" className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-600">
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
                <h2 className="text-2xl font-bold text-navy-700">Your patient-data risk map</h2>
                <p className="mt-1 text-sm text-slate-600">The free scan scores your clinic or lab across these five areas. Here is what each one looks at.</p>
                <div className="mt-5 space-y-4">
                  {clinicsDiagnosticLabsPack.buckets.map((b) => {
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
                <Link href="/assessment/clinics-diagnostic-labs" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-navy-700 px-6 py-3 font-semibold text-white transition-colors hover:bg-navy-800">
                  {p.cta} <ArrowRight size={18} />
                </Link>
              </section>

              {/* What the scan checks */}
              <section>
                <h2 className="text-2xl font-bold text-navy-700">What the scan checks</h2>
                <p className="mt-1 text-sm text-slate-600">Ten plain-English questions across your real patient-data workflows. The scan collects no patient data.</p>
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
                <h2 className="text-2xl font-bold text-navy-700">Clinic & diagnostic lab DPDPA questions</h2>
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
                <p className="mt-2 text-sm text-teal-100">10 questions · 3 minutes · free · no login. Get your clinic or lab&apos;s DPDPA readiness score.</p>
                <Link href="/assessment/clinics-diagnostic-labs" className="mt-4 block rounded-lg bg-white py-2.5 text-center text-sm font-bold text-teal-800 hover:bg-teal-50">
                  Start Clinic / Lab Risk Scan →
                </Link>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="mb-2 text-sm font-bold text-navy-700">Free White Paper</h3>
                <p className="mb-3 text-xs text-slate-600">59-page DPDPA compliance guide for Indian businesses.</p>
                <Link href="/white-paper" className="block rounded-lg bg-navy-700 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-navy-800">
                  Download White Paper →
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
            <p>This page is for educational purposes and does not constitute legal or medical advice.</p>
          </div>
        </div>
      </div>
    </>
  );
}
