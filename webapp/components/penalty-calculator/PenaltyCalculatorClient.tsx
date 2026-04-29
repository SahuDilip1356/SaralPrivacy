"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Shield, AlertTriangle, Users, FileText, BookOpen, User, Handshake,
  ChevronRight, RotateCcw, ArrowRight, Info,
} from "lucide-react";

// ─── Guardrail note ───────────────────────────────────────────────────────────
// The DPDPA 2023 contains NO arithmetic formula for penalty calculation.
// No % of turnover, no ₹ per data principal, no scoring matrix.
// The Data Protection Board determines penalties after inquiry, hearing,
// and applying Section 33(2) factors within the applicable Schedule cap.
// This tool's risk band is SaralPrivacy's own indicative framework — not a
// statutory formula. The Board's determination is entirely independent.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Breach categories (Schedule to Section 33(1)) ───────────────────────────

type BreachId =
  | "security"
  | "breach-notification"
  | "childrens-data"
  | "sdf"
  | "voluntary-undertaking"
  | "other"
  | "data-principal";

interface BreachCategory {
  id: BreachId;
  section: string;
  scheduleItem: string;
  title: string;
  description: string;
  cap: string;
  capLabel: string;
  icon: React.ElementType;
  capColor: string;
}

const BREACH_CATEGORIES: BreachCategory[] = [
  {
    id: "security",
    section: "Section 8(5)",
    scheduleItem: "Schedule Item 1",
    title: "Failure to Protect Personal Data",
    description:
      "Not implementing reasonable security safeguards (as specified under Rule 6 of the DPDP Rules, 2025) to prevent personal data breach.",
    cap: "₹250 Crore",
    capLabel: "may extend to ₹250 Cr",
    icon: Shield,
    capColor: "bg-red-100 text-red-700 border-red-200",
  },
  {
    id: "breach-notification",
    section: "Section 8(6)",
    scheduleItem: "Schedule Item 2",
    title: "Failure to Notify a Personal Data Breach",
    description:
      "Not notifying the Data Protection Board and affected Data Principals about a personal data breach in the form and manner prescribed under Rule 7 of the DPDP Rules, 2025.",
    cap: "₹200 Crore",
    capLabel: "may extend to ₹200 Cr",
    icon: AlertTriangle,
    capColor: "bg-orange-100 text-orange-700 border-orange-200",
  },
  {
    id: "childrens-data",
    section: "Section 9",
    scheduleItem: "Schedule Item 3",
    title: "Breach of Children's Data Obligations",
    description:
      "Processing a child's personal data without verifiable parental consent, or undertaking tracking, behavioural monitoring, or targeted advertising directed at children.",
    cap: "₹200 Crore",
    capLabel: "may extend to ₹200 Cr",
    icon: Users,
    capColor: "bg-orange-100 text-orange-700 border-orange-200",
  },
  {
    id: "sdf",
    section: "Section 10",
    scheduleItem: "Schedule Item 4",
    title: "Breach of Significant Data Fiduciary Obligations",
    description:
      "Failure to meet additional obligations applicable to Significant Data Fiduciaries — such as data protection impact assessments, periodic audits, or Data Protection Officer appointment.",
    cap: "₹150 Crore",
    capLabel: "may extend to ₹150 Cr",
    icon: BookOpen,
    capColor: "bg-amber-100 text-amber-700 border-amber-200",
  },
  {
    id: "voluntary-undertaking",
    section: "Section 32",
    scheduleItem: "Schedule Item 5",
    title: "Breach of Voluntary Undertaking",
    description:
      "Non-compliance with a voluntary undertaking accepted by the Board under Section 32 — where the person undertook to comply with the Act in lieu of inquiry proceedings under Section 28.",
    cap: "Cap for underlying breach",
    capLabel: "cap for underlying breach",
    icon: Handshake,
    capColor: "bg-purple-100 text-purple-700 border-purple-200",
  },
  {
    id: "other",
    section: "Any other provision",
    scheduleItem: "Schedule Item 6",
    title: "Breach of Any Other Provision of Act or Rules",
    description:
      "Non-compliance with any other provision of the DPDPA 2023 or DPDP Rules, 2025 — such as consent obligations, notice requirements, data minimisation, purpose limitation, or retention.",
    cap: "₹50 Crore",
    capLabel: "may extend to ₹50 Cr",
    icon: FileText,
    capColor: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  {
    id: "data-principal",
    section: "Section 15",
    scheduleItem: "Schedule Item 7",
    title: "Breach of Data Principal Duties",
    description:
      "A Data Principal provided false particulars, impersonated another person, suppressed material information, or made frivolous or vexatious complaints.",
    cap: "₹10,000",
    capLabel: "may extend to ₹10,000",
    icon: User,
    capColor: "bg-slate-100 text-slate-600 border-slate-200",
  },
];

// ─── Section 33(2) Factors — all 7 as enacted ────────────────────────────────
// Source: Section 33(2), DPDPA 2023.
// The Board SHALL consider these matters when determining the penalty amount.

type Rating = "low" | "medium" | "high";
type FactorId =
  | "nature"
  | "dataType"
  | "repetitive"
  | "financialGain"
  | "mitigation"
  | "proportionality"
  | "impact";

interface Factor {
  id: FactorId;
  label: string;
  statutory: string;       // exact statutory language
  description: string;
  lowLabel: string;
  mediumLabel: string;
  highLabel: string;
  note?: string;           // optional clarification
}

const FACTORS: Factor[] = [
  {
    id: "nature",
    label: "Nature, Gravity & Duration",
    statutory: "Nature, gravity and duration of the breach",
    description: "How serious was the non-compliance? How long did it persist?",
    lowLabel: "Minor, short-lived",
    mediumLabel: "Moderate, some duration",
    highLabel: "Serious or prolonged",
  },
  {
    id: "dataType",
    label: "Type & Nature of Personal Data",
    statutory: "Type and nature of personal data affected",
    description: "What category of data was affected? How many individuals?",
    lowLabel: "Non-sensitive, limited scope",
    mediumLabel: "Mixed or moderate scale",
    highLabel: "Sensitive / children's data / large scale",
  },
  {
    id: "repetitive",
    label: "Repetitive Nature",
    statutory: "Repetitive nature of the breach",
    description: "Is this a first occurrence or has this pattern of non-compliance happened before?",
    lowLabel: "First occurrence",
    mediumLabel: "Isolated recurrence",
    highLabel: "Repeated pattern",
  },
  {
    id: "financialGain",
    label: "Gain Realised or Loss Avoided",
    statutory: "Gain realised or loss avoided by non-compliance",
    description: "Did your business derive financial benefit from, or avoid costs through, the non-compliance?",
    lowLabel: "No gain or saving",
    mediumLabel: "Incidental benefit",
    highLabel: "Clear financial gain",
  },
  {
    id: "mitigation",
    label: "Mitigation — Timeliness & Effectiveness",
    statutory: "Actions taken to mitigate the breach, and the timeliness and effectiveness of such actions",
    description: "Did you take prompt, effective steps to reduce harm to affected Data Principals?",
    lowLabel: "Prompt, effective remediation",
    mediumLabel: "Partial steps taken",
    highLabel: "No meaningful mitigation",
  },
  {
    id: "proportionality",
    label: "Proportionality & Deterrence",
    statutory: "Whether penalty is proportionate and effective for the purpose of observance and deterrence",
    description: "Would a significant penalty be proportionate to the seriousness of the breach and serve as an effective deterrent?",
    lowLabel: "Minor breach — proportionality would limit penalty",
    mediumLabel: "Moderate breach — moderate penalty proportionate",
    highLabel: "Serious breach — significant penalty warranted",
  },
  {
    id: "impact",
    label: "Likely Impact on Your Organisation",
    statutory: "Likely impact of the imposed penalty on the person",
    description: "The Board considers the financial and operational impact a penalty would have on your organisation. This can work to reduce as well as confirm the penalty.",
    lowLabel: "Penalty would not cause material distress",
    mediumLabel: "Significant penalty would be materially disruptive",
    highLabel: "Any penalty would cause severe financial distress",
    note: "This factor can support either a higher or lower penalty — the Board weighs it in the context of all other factors.",
  },
];

// ─── Risk Band ────────────────────────────────────────────────────────────────
// IMPORTANT: This risk band is SaralPrivacy's indicative assessment framework.
// It is informed by (but not derived from) the Section 33(2) factors.
// The Act contains no formula. The Board determines penalties independently.

type RiskBand = "low" | "moderate" | "high" | "severe";

interface BandConfig {
  label: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  headline: string;
  detail: string;
}

const BAND_CONFIG: Record<RiskBand, BandConfig> = {
  low: {
    label: "Lower Exposure Indicated",
    bgColor: "bg-green-50",
    borderColor: "border-green-300",
    textColor: "text-green-700",
    headline: "Fewer aggravating factors — but compliance action is still required.",
    detail:
      "Your self-assessment indicates relatively limited aggravating factors across the Section 33(2) matters. Proactive remediation and documentation now will substantially reduce exposure if the Board commences inquiry.",
  },
  moderate: {
    label: "Moderate Exposure Indicated",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-300",
    textColor: "text-amber-700",
    headline: "Several factors present — immediate remediation advised.",
    detail:
      "Multiple Section 33(2) factors are working against you. Begin remediation now, document all corrective steps taken, and review your DPDPA compliance posture across all processing activities.",
  },
  high: {
    label: "Significant Exposure Indicated",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-300",
    textColor: "text-orange-700",
    headline: "Multiple aggravating factors — legal advice and urgent action required.",
    detail:
      "Several serious aggravating factors are present. The Board has broad discretion and may impose a substantial penalty. Seek legal counsel immediately and prepare a remediation plan before any inquiry commences.",
  },
  severe: {
    label: "Highest Exposure Indicated",
    bgColor: "bg-red-50",
    borderColor: "border-red-300",
    textColor: "text-red-700",
    headline: "Most serious factors present — immediate expert legal counsel required.",
    detail:
      "Your self-assessment identifies the most serious aggravating factors — repeated non-compliance and/or clear financial gain. The Board may exercise its full discretion under the Schedule. Do not delay engaging a DPDPA-qualified lawyer.",
  },
};

// Risk band logic — qualitative pattern matching, not a statutory formula.
// "Repetitive" and "financial gain" at High are the most serious triggers per the Act's
// emphasis on deterrence and gain-based penalties.
function computeRiskBand(factors: Partial<Record<FactorId, Rating>>): RiskBand {
  // Impact is excluded from the aggravating count — it is bidirectional (can reduce or confirm)
  const aggravatableIds: FactorId[] = ["nature", "dataType", "repetitive", "financialGain", "mitigation", "proportionality"];
  const highCount   = aggravatableIds.filter((id) => factors[id] === "high").length;
  const mediumCount = aggravatableIds.filter((id) => factors[id] === "medium").length;

  // Statutory emphasis: repeated breach and financial gain treated as most serious
  if (factors.repetitive === "high" || factors.financialGain === "high") return "severe";
  if (highCount >= 4) return "severe";
  if (highCount >= 2 || (highCount >= 1 && mediumCount >= 3)) return "high";
  if (highCount >= 1 || mediumCount >= 3) return "moderate";
  return "low";
}

// ─── Component ────────────────────────────────────────────────────────────────

const INITIAL_FACTORS: Partial<Record<FactorId, Rating>> = {};

export default function PenaltyCalculatorClient() {
  const [step, setStep]               = useState<1 | 2 | 3>(1);
  const [selectedBreach, setSelectedBreach] = useState<BreachCategory | null>(null);
  const [factors, setFactors]         = useState<Partial<Record<FactorId, Rating>>>(INITIAL_FACTORS);

  const allFactorsRated = FACTORS.every((f) => factors[f.id] !== undefined);

  const band       = useMemo(() => computeRiskBand(factors), [factors]);
  const bandConfig = BAND_CONFIG[band];

  const highFactors   = FACTORS.filter((f) => factors[f.id] === "high");
  const mediumFactors = FACTORS.filter((f) => factors[f.id] === "medium");

  function reset() {
    setStep(1);
    setSelectedBreach(null);
    setFactors(INITIAL_FACTORS);
  }

  // ── Step 1: Breach Category ─────────────────────────────────────────────────
  if (step === 1) {
    return (
      <div>
        <p className="text-slate-600 text-sm mb-6 leading-relaxed">
          Select the provision your business may have failed to comply with. This determines which Schedule entry under Section 33(1) applies.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BREACH_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => { setSelectedBreach(cat); setStep(2); }}
                className="text-left bg-white rounded-xl border border-slate-200 p-5 hover:border-green-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-slate-500" />
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${cat.capColor}`}>
                    {cat.capLabel}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-400 mb-1">
                  {cat.section} · {cat.scheduleItem}
                </div>
                <div className="font-bold text-navy-700 text-sm mb-2 group-hover:text-green-600 transition-colors">
                  {cat.title}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{cat.description}</p>
                <div className="mt-4 flex items-center gap-1 text-green-500 text-xs font-semibold">
                  Select <ChevronRight size={12} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Step 2: Section 33(2) Factors ──────────────────────────────────────────
  if (step === 2 && selectedBreach) {
    return (
      <div>
        {/* Selected breach summary */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-5 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-400 font-medium mb-0.5">
              {selectedBreach.section} · {selectedBreach.scheduleItem}
            </div>
            <div className="font-bold text-navy-700 text-sm">{selectedBreach.title}</div>
            <span className={`inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${selectedBreach.capColor}`}>
              Schedule cap: {selectedBreach.cap}
            </span>
          </div>
          <button onClick={() => setStep(1)} className="text-xs text-slate-500 hover:text-slate-700 underline shrink-0">
            Change
          </button>
        </div>

        {/* Statutory basis note */}
        <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-5 text-xs text-blue-800 leading-relaxed">
          <Info size={14} className="shrink-0 mt-0.5 text-blue-500" />
          <span>
            Rate each of the <strong>7 factors under Section 33(2)</strong> of the DPDPA 2023 as they apply to your situation.
            The Board is required by the Act to consider all seven before determining any penalty.
          </span>
        </div>

        <div className="space-y-4">
          {FACTORS.map((factor, idx) => (
            <div key={factor.id} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="mb-1">
                <div className="text-xs font-semibold text-slate-400 mb-1">Factor {idx + 1} of 7 · Section 33(2)</div>
                <div className="font-bold text-navy-700 text-sm mb-0.5">{factor.label}</div>
                <div className="text-xs text-slate-400 italic mb-2">"{factor.statutory}"</div>
                <p className="text-xs text-slate-500 mb-3">{factor.description}</p>
                {factor.note && (
                  <div className="flex items-start gap-1.5 text-xs text-amber-700 bg-amber-50 rounded px-2.5 py-2 mb-3 leading-relaxed">
                    <Info size={12} className="shrink-0 mt-0.5" />
                    {factor.note}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(["low", "medium", "high"] as Rating[]).map((rating) => {
                  const isSelected = factors[factor.id] === rating;
                  const ratingLabel =
                    rating === "low" ? factor.lowLabel
                    : rating === "medium" ? factor.mediumLabel
                    : factor.highLabel;
                  const colorMap = {
                    low:    isSelected ? "bg-green-500 text-white border-green-500"  : "bg-white text-slate-600 border-slate-200 hover:border-green-300",
                    medium: isSelected ? "bg-amber-500 text-white border-amber-500"  : "bg-white text-slate-600 border-slate-200 hover:border-amber-300",
                    high:   isSelected ? "bg-red-500 text-white border-red-500"      : "bg-white text-slate-600 border-slate-200 hover:border-red-300",
                  };
                  return (
                    <button
                      key={rating}
                      onClick={() => setFactors((prev) => ({ ...prev, [factor.id]: rating }))}
                      className={`text-left rounded-lg border p-3 transition-all ${colorMap[rating]}`}
                    >
                      <div className="text-xs font-bold capitalize mb-1">{rating}</div>
                      <div className="text-xs leading-tight opacity-80">{ratingLabel}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <button
            onClick={() => setStep(3)}
            disabled={!allFactorsRated}
            className={`w-full py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
              allFactorsRated
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            View Risk Indicator <ArrowRight size={16} />
          </button>
          {!allFactorsRated && (
            <p className="text-xs text-slate-400 text-center mt-2">Rate all 7 factors to continue</p>
          )}
        </div>
      </div>
    );
  }

  // ── Step 3: Result ──────────────────────────────────────────────────────────
  if (step === 3 && selectedBreach) {
    return (
      <div>
        {/* Risk band */}
        <div className={`rounded-xl border-2 p-6 mb-5 ${bandConfig.bgColor} ${bandConfig.borderColor}`}>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold bg-white border ${bandConfig.borderColor} ${bandConfig.textColor}`}>
            {bandConfig.label}
          </span>
          <p className={`mt-3 font-bold text-base ${bandConfig.textColor}`}>{bandConfig.headline}</p>
          <p className="mt-2 text-sm text-slate-700 leading-relaxed">{bandConfig.detail}</p>
        </div>

        {/* No-formula disclaimer — prominent */}
        <div className="flex items-start gap-2.5 bg-slate-100 border border-slate-300 rounded-xl px-4 py-3.5 mb-5 text-xs text-slate-700 leading-relaxed">
          <Info size={14} className="shrink-0 mt-0.5 text-slate-500" />
          <span>
            <strong>No statutory formula exists.</strong> The DPDPA 2023 contains no arithmetic formula, scoring matrix, or prescribed calculation method for penalties. The Data Protection Board determines the actual penalty independently — after a formal inquiry and hearing — by applying all Section 33(2) factors to the specific facts of your case. This indicator is SaralPrivacy&apos;s own assessment framework, not a prediction.
          </span>
        </div>

        {/* Breach + cap */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4">
          <h3 className="font-bold text-navy-700 text-sm mb-3">Applicable Schedule Entry</h3>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500">{selectedBreach.section} · {selectedBreach.scheduleItem}</span>
            <span className="text-xs font-semibold text-navy-700">{selectedBreach.title}</span>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${selectedBreach.capColor}`}>
              {selectedBreach.cap}
            </span>
          </div>
        </div>

        {/* Factor summary */}
        {(highFactors.length > 0 || mediumFactors.length > 0) && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4">
            <h3 className="font-bold text-navy-700 text-sm mb-3">Your Section 33(2) Assessment</h3>
            {highFactors.length > 0 && (
              <div className="mb-3">
                <div className="text-xs font-semibold text-red-600 mb-1.5">High — most likely to weigh against you</div>
                <ul className="space-y-1">
                  {highFactors.map((f) => (
                    <li key={f.id} className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 mt-1" />
                      <span><strong>{f.label}</strong> — {f.statutory}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {mediumFactors.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-amber-600 mb-1.5">Medium — mixed weight</div>
                <ul className="space-y-1">
                  {mediumFactors.map((f) => (
                    <li key={f.id} className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1" />
                      <span><strong>{f.label}</strong> — {f.statutory}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Recommended actions */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-5">
          <h3 className="font-bold text-navy-700 text-sm mb-3">Recommended Immediate Steps</h3>
          <ul className="space-y-2">
            {[
              "Document the non-compliance event — timeline, scope, data affected, and individuals impacted.",
              "Initiate remediation immediately and maintain a dated record of every corrective action taken.",
              "If a personal data breach occurred, assess whether Board and Data Principal notification is required under Section 8(6) and Rule 7.",
              "Review your full DPDPA compliance posture across all processing activities to identify related gaps.",
              "Engage a DPDPA-qualified lawyer before any communication with, or response to, the Data Protection Board.",
            ].map((action, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                <span className="shrink-0 w-4 h-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-[10px] mt-0.5">
                  {i + 1}
                </span>
                {action}
              </li>
            ))}
          </ul>
        </div>

        {/* Full disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-xs text-amber-800 leading-relaxed">
          <strong>Important disclaimer:</strong> This tool provides an indicative risk band only. The Digital Personal Data Protection Act, 2023 contains no arithmetic formula or prescribed calculation method for penalties. The Data Protection Board of India independently determines actual penalties after conducting a formal inquiry, giving the person an opportunity of being heard, and applying all Section 33(2) factors to the specific facts of the case. No reliance should be placed on this assessment for any legal or compliance decision. Consult a qualified DPDPA lawyer for case-specific advice.
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/contact"
            className="flex-1 py-3 bg-green-500 text-white text-sm font-semibold rounded-lg hover:bg-green-600 transition-colors text-center flex items-center justify-center gap-2"
          >
            Get Expert Consultation <ArrowRight size={14} />
          </Link>
          <Link
            href="/assessment"
            className="flex-1 py-3 bg-white border border-slate-200 text-navy-700 text-sm font-semibold rounded-lg hover:border-green-300 transition-colors text-center"
          >
            Full DPDPA Readiness Assessment
          </Link>
        </div>

        <button
          onClick={reset}
          className="mt-4 w-full flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-slate-600 transition-colors py-2"
        >
          <RotateCcw size={12} /> Start over
        </button>
      </div>
    );
  }

  return null;
}
