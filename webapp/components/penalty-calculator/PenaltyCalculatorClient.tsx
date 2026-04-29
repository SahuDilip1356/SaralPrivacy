"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Shield, AlertTriangle, Users, FileText, BookOpen, User, ChevronRight, RotateCcw, ArrowRight } from "lucide-react";

// ─── Breach categories (Schedule to Section 33(1)) ───────────────────────────

type BreachId = "security" | "breach-notification" | "childrens-data" | "sdf" | "other" | "data-principal";

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
    description: "Not implementing reasonable security safeguards to prevent personal data breach — technical or organisational measures were inadequate.",
    cap: "₹250 Crore",
    capLabel: "up to ₹250 Cr",
    icon: Shield,
    capColor: "bg-red-100 text-red-700 border-red-200",
  },
  {
    id: "breach-notification",
    section: "Section 8(6)",
    scheduleItem: "Schedule Item 2",
    title: "Failure to Notify a Data Breach",
    description: "Not notifying the Data Protection Board and affected Data Principals about a personal data breach in the prescribed form and timeline.",
    cap: "₹200 Crore",
    capLabel: "up to ₹200 Cr",
    icon: AlertTriangle,
    capColor: "bg-orange-100 text-orange-700 border-orange-200",
  },
  {
    id: "childrens-data",
    section: "Section 9",
    scheduleItem: "Schedule Item 3",
    title: "Non-Compliance — Children's Data",
    description: "Processing a child's personal data without verifiable parental consent, or undertaking behavioural tracking or targeted advertising directed at children.",
    cap: "₹200 Crore",
    capLabel: "up to ₹200 Cr",
    icon: Users,
    capColor: "bg-orange-100 text-orange-700 border-orange-200",
  },
  {
    id: "sdf",
    section: "Section 10",
    scheduleItem: "Schedule Item 4",
    title: "Non-Compliance — Significant Data Fiduciary",
    description: "Failure to meet the additional obligations applicable to Significant Data Fiduciaries — data protection impact assessments, audits, Data Protection Officer appointment, etc.",
    cap: "₹150 Crore",
    capLabel: "up to ₹150 Cr",
    icon: BookOpen,
    capColor: "bg-amber-100 text-amber-700 border-amber-200",
  },
  {
    id: "other",
    section: "Any provision",
    scheduleItem: "Schedule Item 5",
    title: "Other Contravention of Act or Rules",
    description: "Non-compliance with any other provision of the DPDPA or DPDP Rules — such as consent obligations, notice requirements, data minimisation, purpose limitation, or retention.",
    cap: "₹50 Crore",
    capLabel: "up to ₹50 Cr",
    icon: FileText,
    capColor: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  {
    id: "data-principal",
    section: "Section 15",
    scheduleItem: "Schedule Item 6",
    title: "Breach of Data Principal Duties",
    description: "A Data Principal provided false particulars, impersonated another person, or made frivolous or vexatious complaints.",
    cap: "₹10,000",
    capLabel: "up to ₹10,000",
    icon: User,
    capColor: "bg-slate-100 text-slate-600 border-slate-200",
  },
];

// ─── Section 33(2) Factors ────────────────────────────────────────────────────

type Rating = "low" | "medium" | "high";
type FactorId = "nature" | "dataType" | "repetitive" | "financialGain" | "mitigation" | "priorAction";

interface Factor {
  id: FactorId;
  label: string;
  description: string;
  lowLabel: string;
  mediumLabel: string;
  highLabel: string;
}

const FACTORS: Factor[] = [
  {
    id: "nature",
    label: "Nature, Gravity & Duration",
    description: "How serious was the non-compliance? How long did it persist?",
    lowLabel: "Minor, short-lived",
    mediumLabel: "Moderate, some duration",
    highLabel: "Serious or prolonged",
  },
  {
    id: "dataType",
    label: "Type of Personal Data Affected",
    description: "Was the data sensitive? How many individuals were affected?",
    lowLabel: "Non-sensitive, limited scope",
    mediumLabel: "Mixed or moderate scale",
    highLabel: "Sensitive / children's / large scale",
  },
  {
    id: "repetitive",
    label: "Repetitive Nature of Breach",
    description: "Is this the first time, or has this type of non-compliance occurred before?",
    lowLabel: "First occurrence",
    mediumLabel: "Isolated recurrence",
    highLabel: "Repeated pattern",
  },
  {
    id: "financialGain",
    label: "Financial Gain or Loss Avoidance",
    description: "Did your business profit from or avoid costs through the non-compliance?",
    lowLabel: "No benefit derived",
    mediumLabel: "Incidental benefit",
    highLabel: "Clear financial gain",
  },
  {
    id: "mitigation",
    label: "Mitigation of Harm to Data Principals",
    description: "Did you take steps to reduce the harm caused to affected individuals?",
    lowLabel: "Prompt, effective remediation",
    mediumLabel: "Partial steps taken",
    highLabel: "No meaningful mitigation",
  },
  {
    id: "priorAction",
    label: "Prior Board Action Against You",
    description: "Has the Data Protection Board previously issued directions or penalties against your organisation?",
    lowLabel: "No prior action",
    mediumLabel: "Advisory or directions",
    highLabel: "Prior penalty imposed",
  },
];

// ─── Risk Band ────────────────────────────────────────────────────────────────

type RiskBand = "low" | "moderate" | "high" | "severe";

interface BandConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  headline: string;
  detail: string;
}

const BAND_CONFIG: Record<RiskBand, BandConfig> = {
  low: {
    label: "Low Risk",
    color: "green",
    bgColor: "bg-green-50",
    borderColor: "border-green-300",
    textColor: "text-green-700",
    headline: "Lower exposure — but compliance action is still required.",
    detail: "Your self-assessment indicates relatively limited aggravating factors. Proactive remediation and documentation now will significantly reduce exposure if the Board investigates.",
  },
  moderate: {
    label: "Moderate Risk",
    color: "amber",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-300",
    textColor: "text-amber-700",
    headline: "Non-trivial exposure — immediate remediation advised.",
    detail: "Several Section 33(2) factors are working against you. Begin remediation now, document all corrective steps taken, and review your DPDPA compliance posture across all processing activities.",
  },
  high: {
    label: "High Risk",
    color: "orange",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-300",
    textColor: "text-orange-700",
    headline: "Significant exposure — legal advice and urgent action required.",
    detail: "Multiple aggravating factors are present. The Board has broad discretion to impose substantial penalties at this level. Seek legal counsel immediately and prepare a remediation plan before any inquiry commences.",
  },
  severe: {
    label: "Severe Risk",
    color: "red",
    bgColor: "bg-red-50",
    borderColor: "border-red-300",
    textColor: "text-red-700",
    headline: "Maximum exposure — immediate expert legal counsel required.",
    detail: "Your assessment indicates the most serious aggravating factors — repeated non-compliance, prior Board action, or both. The Board may impose penalties approaching the Schedule maximum. Do not delay engaging a DPDPA-qualified lawyer.",
  },
};

function computeRiskBand(factors: Partial<Record<FactorId, Rating>>): RiskBand {
  const score = (FACTORS as Factor[]).reduce((sum, f) => {
    const r = factors[f.id];
    return sum + (r === "high" ? 2 : r === "medium" ? 1 : 0);
  }, 0);

  // Mandatory escalation for most serious factors
  if (factors.repetitive === "high" || factors.priorAction === "high") return "severe";
  if (score >= 8) return "severe";
  if (score >= 5) return "high";
  if (score >= 3) return "moderate";
  return "low";
}

// ─── Component ────────────────────────────────────────────────────────────────

const INITIAL_FACTORS: Partial<Record<FactorId, Rating>> = {};

export default function PenaltyCalculatorClient() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedBreach, setSelectedBreach] = useState<BreachCategory | null>(null);
  const [factors, setFactors] = useState<Partial<Record<FactorId, Rating>>>(INITIAL_FACTORS);

  const allFactorsRated = FACTORS.every((f) => factors[f.id] !== undefined);

  const band = useMemo(() => computeRiskBand(factors), [factors]);
  const bandConfig = BAND_CONFIG[band];

  const highFactors = FACTORS.filter((f) => factors[f.id] === "high");
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
          Select the provision your business may have failed to comply with. This determines the applicable Schedule cap under Section 33(1).
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
                <div className="text-xs font-semibold text-slate-400 mb-1">{cat.section} · {cat.scheduleItem}</div>
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
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-400 font-medium mb-0.5">{selectedBreach.section} · {selectedBreach.scheduleItem}</div>
            <div className="font-bold text-navy-700 text-sm">{selectedBreach.title}</div>
            <div className={`inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${selectedBreach.capColor}`}>
              Schedule cap: {selectedBreach.cap}
            </div>
          </div>
          <button onClick={() => setStep(1)} className="text-xs text-slate-500 hover:text-slate-700 underline shrink-0">
            Change
          </button>
        </div>

        <p className="text-slate-600 text-sm mb-5 leading-relaxed">
          Rate each Section 33(2) factor as it applies to your situation. The Board considers all six factors when determining the actual penalty.
        </p>

        <div className="space-y-4">
          {FACTORS.map((factor, idx) => (
            <div key={factor.id} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="mb-3">
                <div className="text-xs font-semibold text-slate-400 mb-1">Factor {idx + 1} of 6</div>
                <div className="font-bold text-navy-700 text-sm mb-1">{factor.label}</div>
                <p className="text-xs text-slate-500">{factor.description}</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(["low", "medium", "high"] as Rating[]).map((rating) => {
                  const isSelected = factors[factor.id] === rating;
                  const ratingLabel = rating === "low" ? factor.lowLabel : rating === "medium" ? factor.mediumLabel : factor.highLabel;
                  const colors = {
                    low:    isSelected ? "bg-green-500 text-white border-green-500"  : "bg-white text-slate-600 border-slate-200 hover:border-green-300",
                    medium: isSelected ? "bg-amber-500 text-white border-amber-500"  : "bg-white text-slate-600 border-slate-200 hover:border-amber-300",
                    high:   isSelected ? "bg-red-500 text-white border-red-500"      : "bg-white text-slate-600 border-slate-200 hover:border-red-300",
                  };
                  return (
                    <button
                      key={rating}
                      onClick={() => setFactors((prev) => ({ ...prev, [factor.id]: rating }))}
                      className={`text-left rounded-lg border p-3 transition-all ${colors[rating]}`}
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

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={() => setStep(3)}
            disabled={!allFactorsRated}
            className={`flex-1 py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
              allFactorsRated
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            View Risk Assessment <ArrowRight size={16} />
          </button>
        </div>
        {!allFactorsRated && (
          <p className="text-xs text-slate-400 text-center mt-2">
            Rate all 6 factors to continue
          </p>
        )}
      </div>
    );
  }

  // ── Step 3: Result ──────────────────────────────────────────────────────────
  if (step === 3 && selectedBreach) {
    return (
      <div>
        {/* Risk band */}
        <div className={`rounded-xl border-2 p-6 mb-6 ${bandConfig.bgColor} ${bandConfig.borderColor}`}>
          <div className="flex items-start gap-4">
            <div className={`px-3 py-1 rounded-full text-sm font-bold ${bandConfig.textColor} bg-white border ${bandConfig.borderColor}`}>
              {bandConfig.label}
            </div>
          </div>
          <p className={`mt-3 font-bold text-base ${bandConfig.textColor}`}>{bandConfig.headline}</p>
          <p className="mt-2 text-sm text-slate-700 leading-relaxed">{bandConfig.detail}</p>
        </div>

        {/* Breach + cap summary */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-5">
          <h3 className="font-bold text-navy-700 text-sm mb-3">Applicable Penalty Framework</h3>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-slate-500">{selectedBreach.section} · {selectedBreach.scheduleItem}</span>
            <span className="text-xs font-semibold text-navy-700">{selectedBreach.title}</span>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${selectedBreach.capColor}`}>
              Schedule cap: {selectedBreach.cap}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-3 leading-relaxed">
            The Board may impose a penalty up to this cap. The actual penalty is determined by applying Section 33(2) factors to the specific facts of the case.
          </p>
        </div>

        {/* Factor summary */}
        {(highFactors.length > 0 || mediumFactors.length > 0) && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 mb-5">
            <h3 className="font-bold text-navy-700 text-sm mb-3">Key Factors in Your Assessment</h3>
            {highFactors.length > 0 && (
              <div className="mb-3">
                <div className="text-xs font-semibold text-red-600 mb-1.5">Aggravating (High)</div>
                <ul className="space-y-1">
                  {highFactors.map((f) => (
                    <li key={f.id} className="flex items-center gap-2 text-xs text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                      {f.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {mediumFactors.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-amber-600 mb-1.5">Moderate</div>
                <ul className="space-y-1">
                  {mediumFactors.map((f) => (
                    <li key={f.id} className="flex items-center gap-2 text-xs text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                      {f.label}
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
              "Initiate remediation immediately and keep a dated record of every corrective action taken.",
              "If a personal data breach occurred, assess whether Board notification is required (Section 8(6)).",
              "Review your DPDPA compliance posture across all other processing activities to identify related gaps.",
              "Engage a DPDPA-qualified lawyer before any communication with the Data Protection Board.",
            ].map((action, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                <span className="shrink-0 w-4 h-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-[10px] mt-0.5">{i + 1}</span>
                {action}
              </li>
            ))}
          </ul>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-xs text-amber-800 leading-relaxed">
          <strong>Important:</strong> This tool provides an indicative risk band only. The Data Protection Board of India determines actual penalties by independently applying all Section 33(2) factors to the specific facts of each case. Penalty amounts are not derived or predicted by this tool. No reliance should be placed on this assessment for legal or compliance decisions. Consult a qualified DPDPA lawyer for case-specific advice.
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
