import type { Metadata } from "next";
import { BookOpen, Target, Users, MessageSquare } from "lucide-react";
import { PressProofStrip } from "@/components/ui/PressProofStrip";
import { FounderProof } from "@/components/home/FounderProof";

export const metadata: Metadata = {
  title: {
    absolute: "About SaralPrivacy | Practical DPDPA Readiness for Indian Businesses",
  },
  description:
    "SaralPrivacy helps Indian businesses understand, assess, and act on DPDPA obligations — plain-English guidance, personal data discovery, sector-specific assessments, and advisory support.",
  alternates: { canonical: "https://saralprivacy.com/about" },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "SaralPrivacy",
  url: "https://saralprivacy.com",
  description:
    "Practical DPDPA education, assessment, and advisory platform for Indian businesses.",
  foundingDate: "2025",
  areaServed: "IN",
  contactPoint: {
    "@type": "ContactPoint",
    email: "privacy@saralprivacy.com",
    contactType: "customer support",
  },
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />

      <div className="min-h-screen bg-slate-50">
        {/* Hero */}
        <div className="bg-navy-700 py-14">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h1 className="text-3xl sm:text-4xl font-semibold text-white mb-3">About SaralPrivacy</h1>
            <p className="text-slate-300 text-lg leading-relaxed">
              India&apos;s practical DPDPA education, assessment, and advisory platform.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">

          {/* Answer box */}
          <div className="bg-slate-50 border-l-4 border-green-400 rounded-r-xl px-5 py-4">
            <p className="text-slate-700 text-sm leading-relaxed">
              SaralPrivacy is a practical DPDPA education, assessment, and advisory platform built for Indian businesses. It exists to turn dense privacy obligations into plain-English guidance, useful assessments, and implementation-focused resources by sector.
            </p>
          </div>

          {/* Founder proof — moved here from the landing page (Phase 2) */}
          <FounderProof />

          {/* How we work — the four pillars, moved off the homepage with the
              recognition band (2026-08-22). They answer "why you" rather than
              "what is this", which is an About-page question. */}
          <div className="bg-white rounded-xl border border-slate-200 p-7">
            <h2 className="text-xl font-semibold text-navy-700 mb-5">How We Work</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
              {[
                {
                  icon: BookOpen,
                  title: "Educational, not alarmist",
                  description:
                    "We explain what DPDPA actually requires in language founders and ops teams can act on.",
                },
                {
                  icon: Target,
                  title: "Practical and actionable",
                  description:
                    "Every briefing ends with a checklist. Every assessment ends with a roadmap.",
                },
                {
                  icon: Users,
                  title: "Built for Indian businesses",
                  description:
                    "Not a GDPR guide repurposed for India — written for Indian workflows and data practices.",
                },
                {
                  icon: MessageSquare,
                  title: "Not legal advice",
                  description:
                    "We are an intelligence and education platform. For formal opinions, engage a lawyer.",
                },
              ].map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={18} className="text-teal-800" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy-700 text-sm mb-1">{title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* How it works — 4-stage strip */}
          <div className="bg-white rounded-xl border border-slate-200 p-7">
            <h2 className="text-xl font-semibold text-navy-700 mb-5">How SaralPrivacy Works</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { step: "1", title: "Understand", body: "What DPDPA means for your business — in plain English, not legalese." },
                { step: "2", title: "Discover", body: "The personal data your business actually holds, across people and systems." },
                { step: "3", title: "Assess", body: "Your readiness through a free, sector-specific assessment." },
                { step: "4", title: "Act", body: "Prioritise consent, notices, access, vendors, retention, and breach readiness." },
              ].map((s) => (
                <div key={s.step} className="rounded-lg bg-slate-50 border border-slate-200 p-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-700 text-white text-sm font-bold mb-3">
                    {s.step}
                  </div>
                  <p className="font-semibold text-navy-700 text-sm mb-1">{s.title}</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{s.body}</p>
                </div>
              ))}
            </div>
          </div>

          {/* What SaralPrivacy Does */}
          <div className="bg-white rounded-xl border border-slate-200 p-7">
            <h2 className="text-xl font-semibold text-navy-700 mb-4">What SaralPrivacy Does</h2>
            <ul className="space-y-3 text-sm text-slate-600 leading-relaxed">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0" />
                <span><strong className="text-navy-700">Free readiness assessments</strong> — Sector-specific questionnaires that surface the biggest DPDPA gaps in your business in 3–5 minutes, with a plain-English risk score and prioritised next steps.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0" />
                <span><strong className="text-navy-700">Daily briefings</strong> — Short, practical updates on DPDPA developments, regulatory notices, and implementation guidance published regularly for Indian businesses.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0" />
                <span><strong className="text-navy-700">Industry guides</strong> — Sector-specific compliance guidance across every industry we assess — from recruitment, CA firms and clinics to fintech, real estate and wellness — covering the specific risks and workflows that matter in each sector.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0" />
                <span><strong className="text-navy-700">Guide</strong> — A practitioner guide updated for the DPDP Rules, 2025, covering applicability, consent, notices, rights, breach response, sector risks, and a 30-day action plan.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0" />
                <span><strong className="text-navy-700">Advisory</strong> — Expert consultation for businesses that need specific guidance on their data flows, vendor agreements, consent architecture, or compliance priorities.</span>
              </li>
            </ul>
          </div>

          {/* Who It Serves */}
          <div className="bg-white rounded-xl border border-slate-200 p-7">
            <h2 className="text-xl font-semibold text-navy-700 mb-4">Who It Serves</h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              SaralPrivacy is built for Indian businesses that process personal data as a routine part of their operations — not data protection specialists, but founders, operations leads, compliance managers, and senior staff who need to understand what to do and in what order.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                "Recruitment, CA firms and training institutes",
                "D2C, clinics, pharmacies and hospitality",
                "Schools, law firms and real estate",
                "Fintech, NBFCs and wellness businesses",
                "MSMEs across sectors processing customer or employee data",
                "Founders and operations leads who need clarity, not commentary",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Built with a practitioner's lens */}
          <div className="bg-white rounded-xl border border-slate-200 p-7">
            <h2 className="text-xl font-semibold text-navy-700 mb-4">Built With a Practitioner&apos;s Lens</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              SaralPrivacy is built with a practitioner&apos;s lens — by a digital-transformation and enterprise-applications leader with two decades across ERP, finance systems, workflow automation, governance, and system integration. The conviction behind it is simple: DPDPA readiness isn&apos;t only about reading the law — it&apos;s about translating it into the systems, workflows, access controls, vendor handoffs, and retention practices where personal data actually lives.
            </p>
          </div>

          {/* Press proof */}
          <PressProofStrip />

          {/* Editorial Methodology */}
          <div className="bg-white rounded-xl border border-slate-200 p-7">
            <h2 className="text-xl font-semibold text-navy-700 mb-4">Editorial Methodology</h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              All guidance on SaralPrivacy is produced against primary sources only. We do not treat secondary commentary, news coverage, or social media posts as authoritative.
            </p>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-navy-700 mt-1.5 shrink-0" />
                All content is checked against the Digital Personal Data Protection Act, 2023 (as enacted).
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-navy-700 mt-1.5 shrink-0" />
                All content reflecting the rules regime is checked against the DPDP Rules, 2025 as notified in the Official Gazette on 14 November 2025.
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-navy-700 mt-1.5 shrink-0" />
                Regulatory developments are cross-referenced against official government press releases and Ministry of Electronics and Information Technology communications.
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-navy-700 mt-1.5 shrink-0" />
                Pages are reviewed and updated periodically. Each page carries a last-reviewed date and legal baseline.
              </li>
            </ul>
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
              <p className="text-xs text-amber-800">
                <strong>Important:</strong> SaralPrivacy content is for educational purposes and does not constitute legal advice. Businesses should consult a qualified data protection professional for formal legal opinions specific to their situation.
              </p>
            </div>
          </div>

          {/* What SaralPrivacy Is Not */}
          <div className="bg-slate-100 rounded-xl border border-slate-200 p-7">
            <h2 className="text-xl font-semibold text-navy-700 mb-4">What SaralPrivacy Is Not</h2>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                Not a substitute for formal legal advice.
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                Not fear-driven compliance panic.
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                Not a one-size-fits-all checklist — DPDPA risk differs by sector.
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-xl border border-slate-200 p-7">
            <h2 className="text-xl font-semibold text-navy-700 mb-4">Contact</h2>
            <div className="space-y-3 text-sm text-slate-600">
              <div>
                <p className="font-semibold text-navy-700 mb-1">For content questions and editorial enquiries</p>
                <a href="mailto:privacy@saralprivacy.com" className="text-green-800 hover:underline">
                  privacy@saralprivacy.com
                </a>
              </div>
              <div>
                <p className="font-semibold text-navy-700 mb-1">For data access, correction, erasure, or privacy complaints</p>
                <a href="mailto:privacy@saralprivacy.com" className="text-green-800 hover:underline">
                  privacy@saralprivacy.com
                </a>
              </div>
            </div>
          </div>

          {/* Legal */}
          <div className="mt-10 pt-6 border-t border-slate-200 text-xs text-slate-600 space-y-1">
            <p><strong>Legal baseline:</strong> DPDP Rules, 2025 notified on 14 November 2025, with phased commencement.</p>
            <p>This page is for educational purposes and does not constitute legal advice.</p>
          </div>

        </div>
      </div>
    </>
  );
}
