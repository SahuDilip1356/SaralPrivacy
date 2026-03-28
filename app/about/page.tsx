import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About SaralPrivacy",
  description:
    "Learn what SaralPrivacy is, who it serves, how its guidance is produced, and why Indian businesses use it for practical DPDPA understanding.",
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
        <div className="bg-brand-700 py-14">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">About SaralPrivacy</h1>
            <p className="text-slate-300 text-lg leading-relaxed">
              India&apos;s practical DPDPA education, assessment, and advisory platform.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">

          {/* Answer box */}
          <div className="bg-slate-50 border-l-4 border-saffron-400 rounded-r-xl px-5 py-4">
            <p className="text-slate-700 text-sm leading-relaxed">
              SaralPrivacy is a practical DPDPA education, assessment, and advisory platform built for Indian businesses. It exists to turn dense privacy obligations into plain-English guidance, useful assessments, and implementation-focused resources by sector.
            </p>
          </div>

          {/* What SaralPrivacy Does */}
          <div className="bg-white rounded-xl border border-slate-200 p-7">
            <h2 className="text-xl font-bold text-brand-700 mb-4">What SaralPrivacy Does</h2>
            <ul className="space-y-3 text-sm text-slate-600 leading-relaxed">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-saffron-500 mt-1.5 shrink-0" />
                <span><strong className="text-brand-700">Free readiness assessments</strong> — Sector-specific questionnaires that surface the biggest DPDPA gaps in your business in 10 minutes, with a plain-English risk score and prioritised next steps.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-saffron-500 mt-1.5 shrink-0" />
                <span><strong className="text-brand-700">Daily briefings</strong> — Short, practical updates on DPDPA developments, regulatory notices, and implementation guidance published regularly for Indian businesses.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-saffron-500 mt-1.5 shrink-0" />
                <span><strong className="text-brand-700">Industry guides</strong> — Sector-specific compliance guidance for recruitment agencies, CA firms, training institutes, and D2C brands, covering the specific risks and workflows that matter in each sector.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-saffron-500 mt-1.5 shrink-0" />
                <span><strong className="text-brand-700">White paper</strong> — A 45-page practitioner guide updated for the DPDP Rules, 2025, covering applicability, consent, notices, rights, breach response, sector risks, and a 30-day action plan.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-saffron-500 mt-1.5 shrink-0" />
                <span><strong className="text-brand-700">Advisory</strong> — Expert consultation for businesses that need specific guidance on their data flows, vendor agreements, consent architecture, or compliance priorities.</span>
              </li>
            </ul>
          </div>

          {/* Who It Serves */}
          <div className="bg-white rounded-xl border border-slate-200 p-7">
            <h2 className="text-xl font-bold text-brand-700 mb-4">Who It Serves</h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              SaralPrivacy is built for Indian businesses that process personal data as a routine part of their operations — not data protection specialists, but founders, operations leads, compliance managers, and senior staff who need to understand what to do and in what order.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                "Recruitment and staffing agencies",
                "CA firms and accounting practices",
                "Training institutes and coaching centres",
                "D2C brands and e-commerce businesses",
                "MSMEs across sectors processing customer or employee data",
                "Founders and operations leads who need clarity, not commentary",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-saffron-500 mt-1.5 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Editorial Methodology */}
          <div className="bg-white rounded-xl border border-slate-200 p-7">
            <h2 className="text-xl font-bold text-brand-700 mb-4">Editorial Methodology</h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              All guidance on SaralPrivacy is produced against primary sources only. We do not treat secondary commentary, news coverage, or social media posts as authoritative.
            </p>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-brand-700 mt-1.5 shrink-0" />
                All content is checked against the Digital Personal Data Protection Act, 2023 (as enacted).
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-brand-700 mt-1.5 shrink-0" />
                All content reflecting the rules regime is checked against the DPDP Rules, 2025 as notified in the Official Gazette on 14 November 2025.
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-brand-700 mt-1.5 shrink-0" />
                Regulatory developments are cross-referenced against official government press releases and Ministry of Electronics and Information Technology communications.
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-brand-700 mt-1.5 shrink-0" />
                Pages are reviewed and updated periodically. Each page carries a last-reviewed date and legal baseline.
              </li>
            </ul>
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
              <p className="text-xs text-amber-800">
                <strong>Important:</strong> SaralPrivacy content is for educational purposes and does not constitute legal advice. Businesses should consult a qualified data protection professional for formal legal opinions specific to their situation.
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-xl border border-slate-200 p-7">
            <h2 className="text-xl font-bold text-brand-700 mb-4">Contact</h2>
            <div className="space-y-3 text-sm text-slate-600">
              <div>
                <p className="font-semibold text-brand-700 mb-1">For content questions and editorial enquiries</p>
                <a href="mailto:privacy@saralprivacy.com" className="text-saffron-600 hover:underline">
                  privacy@saralprivacy.com
                </a>
              </div>
              <div>
                <p className="font-semibold text-brand-700 mb-1">For data access, correction, erasure, or privacy complaints</p>
                <a href="mailto:privacy@saralprivacy.com" className="text-saffron-600 hover:underline">
                  privacy@saralprivacy.com
                </a>
              </div>
            </div>
          </div>

          {/* Last reviewed */}
          <div className="mt-10 pt-6 border-t border-slate-200 text-xs text-slate-400 space-y-1">
            <p><strong>Last reviewed:</strong> March 2026</p>
            <p><strong>Legal baseline:</strong> DPDP Rules, 2025 notified on 14 November 2025, with phased commencement.</p>
            <p>This page is for educational purposes and does not constitute legal advice.</p>
          </div>

        </div>
      </div>
    </>
  );
}
