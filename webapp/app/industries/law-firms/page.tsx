import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ArrowRight,
  ClipboardList,
  FileLock2,
  Share2,
  Users,
  ShieldAlert,
} from "lucide-react";
import { breadcrumbSchema, faqPageSchema, speakableSchema } from "@/lib/schema";
import { FRESHNESS, toISODate } from "@/lib/content-freshness";
import { lawFirmsPack } from "@/lib/data/industry-assessment/packs/law-firms";
import { lawFirmsDataFlowPack } from "@/lib/data/data-flow/law-firms";
import { DataFlowPreview } from "@/components/industries/DataFlowPreview";

const faqs = [
  {
    question: "Does the DPDPA apply to law firms and advocates?",
    answer:
      "Yes. Law firms, advocates and legal consultants process large volumes of client personal data — KYC and ID proofs, financial records, employee records, affidavits, evidence files and sensitive case details — which makes them Data Fiduciaries under the Digital Personal Data Protection Act, 2023. Professional confidentiality and privilege are important, but they are not the same as DPDPA compliance, which adds obligations around notice, access, retention and breach response.",
  },
  {
    question: "Is client confidentiality the same as DPDPA readiness?",
    answer:
      "No. Confidentiality and legal privilege protect the substance of a client's matter. The DPDPA adds operational duties: telling clients how their personal data is used, stored, shared and retained; limiting who can access it; deleting it when no longer needed; and responding to incidents. A firm can be excellent at confidentiality and still have DPDPA gaps in intake, storage, junior access and retention.",
  },
  {
    question: "Can we share client documents over WhatsApp and email with counsel or filing agents?",
    answer:
      "Legal work naturally requires sharing with external counsel, clerks, notaries, translators and court systems. The risk is not sharing itself — it is uncontrolled sharing without a defined purpose, access limitation, client awareness or document tracking. Prefer secure channels for sensitive records, document what is shared and with whom, and avoid sending evidence or sensitive files through informal WhatsApp where possible.",
  },
  {
    question: "How should sensitive matters (family, criminal, employment) be handled?",
    answer:
      "These matters contain highly sensitive personal data — allegations, medical facts, family details, employment records. They should be clearly marked and access-restricted to the matter team, not stored alongside regular files where any associate or intern can open them. Separate classification and restricted access is one of the highest-impact controls a firm can put in place.",
  },
  {
    question: "How long can we keep closed matter files and evidence?",
    answer:
      "Law firms have legitimate reasons to retain files for limitation periods and professional obligations. The DPDPA risk is indefinite retention with no documented schedule, access review or archival rules. Define a retention period by matter and record type, archive securely, and have a process for client return, correction or deletion requests where retention is no longer required.",
  },
];

export const metadata: Metadata = {
  title: "DPDPA for Law Firms & Legal Consultants",
  description:
    "Your law firm doesn't just protect confidentiality — it stores, shares and retains client data every day. See where client KYC, evidence files, junior/intern access, WhatsApp/email sharing, court/vendor workflows and old matter-file retention create DPDPA exposure, and run a free 3-minute risk scan.",
  alternates: { canonical: "https://saralprivacy.com/industries/law-firms" },
};

const BUCKET_DETAIL: Record<string, { icon: ReactNode; example: string; action: string }> = {
  client_matter_data: {
    icon: <ClipboardList size={18} />,
    example:
      "Client KYC and ID proofs, company documents, contracts and notices, affidavits, financial, employee and property records, court pleadings and correspondence.",
    action: "Map client and matter data and update engagement letters to explain data use, sharing, storage and retention.",
  },
  case_evidence_sensitivity: {
    icon: <FileLock2 size={18} />,
    example:
      "Family, criminal, employment, medical, whistleblower, harassment and disciplinary matters, plus evidence files, screenshots, call records and videos.",
    action: "Mark sensitive matters and restrict access to the matter team — don't store them with regular files.",
  },
  document_sharing_court_workflow: {
    icon: <Share2 size={18} />,
    example:
      "Client intake over WhatsApp, email and shared folders; sharing with external counsel, court clerks, notaries, translators, experts and legal-tech tools.",
    action: "Standardise intake and sharing channels, and share externally only with documented purpose and controlled access.",
  },
  staff_junior_vendor_access: {
    icon: <Users size={18} />,
    example:
      "Juniors, interns, paralegals, clerks and support staff; files duplicated across email, laptops, cloud folders, WhatsApp and external drives; lingering ex-staff access.",
    action: "Move to matter-based, need-based access, consolidate storage, and remove ex-staff access promptly.",
  },
  retention_incident_readiness: {
    icon: <ShieldAlert size={18} />,
    example:
      "Closed matter files, evidence, ID proofs and drafts kept for years; no clear plan for a wrong-recipient email, an exposed cloud folder or a compromised account.",
    action: "Set a retention + deletion schedule and a simple incident-response process for wrong-recipient and breach events.",
  },
};

const STEPS = [
  { n: 1, title: "Answer 10 quick questions", body: "About your practice, the documents you hold, intake, storage, access, client notice, external sharing, sensitive matters and retention. ~3 minutes." },
  { n: 2, title: "See your readiness score + risk map", body: "A 0–100 DPDPA readiness score, your risk band, and five law-firm-specific risk areas." },
  { n: 3, title: "Get your priority fixes + checklist", body: "The five controls to start with, plus the Law Firm DPDPA Starter Checklist." },
];

const scanChecks = [
  "What legal work you handle and the client/matter documents you hold",
  "How clients share documents, instructions and evidence with your firm",
  "Where matter files are stored — DMS, cloud, email, laptops, WhatsApp, physical",
  "Who can access client files — partners, juniors, interns, clerks, ex-staff",
  "Whether your engagement letter explains data use, sharing, storage and retention",
  "Who you share documents with — counsel, clerks, notaries, translators, legal-tech",
  "How sensitive family/criminal/employment matters are classified and restricted",
  "How long closed matters are kept and whether you can respond to an incident",
];

export default function LawFirmsPage() {
  const p = lawFirmsPack.positioning;
  return (
    <>
      {breadcrumbSchema([
        { name: "Home", url: "https://saralprivacy.com" },
        { name: "Industries", url: "https://saralprivacy.com/industries" },
        { name: "Law Firms & Legal Consultants", url: "https://saralprivacy.com/industries/law-firms" },
      ])}
      {faqPageSchema(faqs, {
        url: "https://saralprivacy.com/industries/law-firms",
        dateModified: toISODate(FRESHNESS.industry),
      })}
      {speakableSchema([".answer-block"], "https://saralprivacy.com/industries/law-firms", "DPDPA for Law Firms & Legal Consultants")}

      <div className="min-h-screen bg-pearl-50">
        {/* Hero */}
        <div className="bg-navy-700 py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-teal-300">
              <ShieldCheck size={18} /> Industry Guide · Law Firms & Legal Consultants
            </div>
            <h1 className="max-w-3xl text-3xl font-bold leading-tight text-white sm:text-4xl">{p.hero}</h1>
            <div className="answer-block mt-5 max-w-2xl rounded-xl border border-white/15 bg-white/10 px-5 py-4" data-speakable="true">
              <p className="text-sm leading-relaxed text-slate-200">{p.sub}</p>
              <p className="mt-2 text-xs font-medium text-teal-300">
                Most law firms don&apos;t have a confidentiality problem — they have a matter-data <em>control</em> problem.
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/assessment/law-firms" className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-600">
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
                <h2 className="text-2xl font-bold text-navy-700">Your client &amp; matter-data risk map</h2>
                <p className="mt-1 text-sm text-slate-600">The free scan scores your firm across these five areas. Here is what each one looks at.</p>
                <div className="mt-5 space-y-4">
                  {lawFirmsPack.buckets.map((b) => {
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

              {/* Personal Data Flow Map preview - understand the sector, then
                  see the flow, then take the scan. */}
              <DataFlowPreview
                pack={lawFirmsDataFlowPack}
                href="/industries/law-firms/data-flow"
              />

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
                <Link href="/assessment/law-firms" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-navy-700 px-6 py-3 font-semibold text-white transition-colors hover:bg-navy-800">
                  {p.cta} <ArrowRight size={18} />
                </Link>
              </section>

              {/* What the scan checks */}
              <section>
                <h2 className="text-2xl font-bold text-navy-700">What the scan checks</h2>
                <p className="mt-1 text-sm text-slate-600">Ten plain-English questions across your real client and matter-data workflows. The scan collects no client documents.</p>
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
                <h2 className="text-2xl font-bold text-navy-700">Law firm DPDPA questions</h2>
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
                <Link href="/assessment/law-firms" className="mt-4 block rounded-lg bg-white py-2.5 text-center text-sm font-bold text-teal-800 hover:bg-teal-50">
                  Start Law Firm Risk Scan →
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
