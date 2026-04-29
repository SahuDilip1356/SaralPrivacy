import type { Metadata } from "next";
import Link from "next/link";
import { Scale } from "lucide-react";
import PenaltyCalculatorClient from "@/components/penalty-calculator/PenaltyCalculatorClient";

const BASE = "https://saralprivacy.com";

export const metadata: Metadata = {
  title: "DPDPA Penalty Risk Indicator — Section 33 Assessment Tool",
  description:
    "Assess your DPDPA penalty risk using the six statutory factors under Section 33(2). Select your breach category, rate each factor, and get an indicative risk band — Low, Moderate, High, or Severe.",
  alternates: { canonical: `${BASE}/penalty-calculator` },
  openGraph: {
    title: "DPDPA Penalty Risk Indicator | SaralPrivacy",
    description:
      "Free tool to assess your penalty exposure under the Digital Personal Data Protection Act, 2023 — based on actual Section 33 criteria.",
    url: `${BASE}/penalty-calculator`,
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home",                url: BASE },
    { "@type": "ListItem", position: 2, name: "Penalty Risk Indicator", url: `${BASE}/penalty-calculator` },
  ],
};

const toolSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "DPDPA Penalty Risk Indicator",
  description:
    "Assess DPDPA penalty exposure using the six factors under Section 33(2) of the Digital Personal Data Protection Act, 2023.",
  url: `${BASE}/penalty-calculator`,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
};

export default function PenaltyCalculatorPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }} />

      <div className="min-h-screen bg-slate-50">

        {/* Hero */}
        <div className="bg-navy-700 py-14">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <nav className="text-xs text-slate-400 mb-4">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span className="mx-2">›</span>
              <span className="text-slate-300">Penalty Risk Indicator</span>
            </nav>
            <div className="inline-flex items-center gap-2 bg-red-700/30 border border-red-500/40 rounded-full px-3.5 py-1.5 mb-4">
              <Scale size={12} className="text-red-300" />
              <span className="text-red-300 text-xs font-semibold">Section 33 · DPDPA 2023</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 leading-snug">
              DPDPA Penalty Risk Indicator
            </h1>
            <p className="text-slate-300 text-base leading-relaxed max-w-2xl">
              A structured self-assessment tool based on the six statutory factors under Section 33(2) of the DPDPA.
              Select your breach category, rate each factor, and get an indicative risk band.
            </p>
            <p className="mt-3 text-xs text-amber-300">
              This tool produces a risk indicator only — not a predicted penalty figure. The Data Protection Board determines all actual penalties.
            </p>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">

          {/* How it works */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { step: "1", label: "Select breach category", sub: "6 Schedule items, Section 33(1)" },
              { step: "2", label: "Rate 7 statutory factors", sub: "Section 33(2) — Low / Medium / High" },
              { step: "3", label: "Get your risk band", sub: "Low · Moderate · High · Severe" },
            ].map(({ step, label, sub }) => (
              <div key={step} className="bg-white rounded-xl border border-slate-200 p-4 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-navy-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {step}
                </div>
                <div>
                  <div className="font-semibold text-navy-700 text-sm">{label}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Tool */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
            <PenaltyCalculatorClient />
          </div>

          {/* Legal framework note */}
          <div className="mt-10 bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-bold text-navy-700 text-base mb-1">About the DPDPA Penalty Framework</h2>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Source: DPDPA 2023, Section 33 and Schedule. The Act contains <strong>no arithmetic formula</strong> for
              penalty calculation — no % of turnover, no ₹ per data principal, no scoring matrix. The Data Protection Board
              determines the penalty after inquiry and hearing, within the Schedule cap.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-navy-700 text-sm mb-2">Section 33(1) — Schedule Caps</h3>
                <p className="text-slate-500 text-xs leading-relaxed mb-3">
                  Maximum caps only. The Board may impose any amount up to (not necessarily equal to) the cap.
                </p>
                <ul className="space-y-2">
                  {[
                    ["Section 8(5) — Security safeguards", "may extend to ₹250 Cr"],
                    ["Section 8(6) — Breach notification", "may extend to ₹200 Cr"],
                    ["Section 9 — Children's data", "may extend to ₹200 Cr"],
                    ["Section 10 — SDF obligations", "may extend to ₹150 Cr"],
                    ["Section 32 — Voluntary undertaking breach", "cap for underlying breach"],
                    ["Any other provision of Act/Rules", "may extend to ₹50 Cr"],
                    ["Section 15 — Data Principal duties", "may extend to ₹10,000"],
                  ].map(([item, cap]) => (
                    <li key={item} className="flex items-start justify-between gap-2 text-xs">
                      <span className="text-slate-600">{item}</span>
                      <span className="font-semibold text-navy-700 shrink-0 ml-2 text-right">{cap}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-navy-700 text-sm mb-2">Section 33(2) — All 7 Factors the Board Must Consider</h3>
                <p className="text-slate-500 text-xs leading-relaxed mb-3">
                  The Board shall consider all seven factors. There is no weighting or prescribed formula.
                </p>
                <ul className="space-y-2">
                  {[
                    "Nature, gravity and duration of the breach",
                    "Type and nature of personal data affected",
                    "Repetitive nature of the breach",
                    "Gain realised or loss avoided by the non-compliance",
                    "Actions taken to mitigate the breach — timeliness and effectiveness",
                    "Whether the penalty is proportionate and effective for observance and deterrence",
                    "Likely impact of the penalty on the person",
                  ].map((factor, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                      <span className="w-4 h-4 rounded-full bg-navy-100 text-navy-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
