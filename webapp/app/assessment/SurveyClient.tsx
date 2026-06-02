"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft, CheckCircle, AlertTriangle, Shield, SkipForward, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import {
  QUESTIONS,
  VERDICT_BANDS,
  calculateFullResult,
  getResourceCTA,
  getBlockerCTA,
  type DPDPAAnswers,
  type DPDPAScoreResult,
} from "@/lib/data/dpdpa-assessment";

// ── Sidebar Sections ──────────────────────────────────────────────────────────

const SIDEBAR_SECTIONS = [
  { label: "Your business",      steps: [1] },
  { label: "Data inventory",     steps: [2, 3] },
  { label: "How access works",   steps: [4, 5] },
  { label: "Consent and rights", steps: [6] },
  { label: "Ownership",          steps: [7] },
  { label: "Report",             steps: [8, 9] },
];

function SidebarNav({ step, result }: { step: number; result: DPDPAScoreResult | null }) {
  return (
    <aside className="hidden lg:flex w-56 bg-navy-950 shrink-0 flex-col sticky top-[96px] h-[calc(100vh-96px)] overflow-y-auto">
      <div className="px-4 py-5 border-b border-navy-800">
        <div className="text-xs font-bold text-green-400 uppercase tracking-widest mb-1">Compliance Engine</div>
        <div className="text-slate-400 text-xs">PRIVACY MADE PRACTICAL FOR INDIA</div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {SIDEBAR_SECTIONS.map((sec) => {
          const isActive = sec.steps.includes(step);
          const isComplete = sec.steps.every(s => s < step);
          return (
            <div
              key={sec.label}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors",
                isActive ? "bg-navy-800 text-white border-l-2 border-green-400" :
                isComplete ? "text-green-400" : "text-slate-500"
              )}
            >
              {isComplete ? (
                <CheckCircle size={14} className="text-green-400 shrink-0" />
              ) : (
                <div className={cn("w-3.5 h-3.5 rounded-full border shrink-0",
                  isActive ? "border-green-400 bg-green-400" : "border-slate-600"
                )} />
              )}
              <span className="text-xs font-medium">{sec.label}</span>
            </div>
          );
        })}
      </nav>

      {/* Score hidden during assessment — revealed at gate screen */}

      <div className="px-5 py-4 border-t border-navy-800 space-y-2">
        <Link href="/" className="text-xs text-slate-500 hover:text-white block transition-colors">← View Site</Link>
        <a href="mailto:support@saralprivacy.com" className="text-xs text-slate-500 hover:text-white block transition-colors">Site support</a>
      </div>
    </aside>
  );
}

// ── Progress Breadcrumb ───────────────────────────────────────────────────────

function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = Math.round((step / total) * 100);
  const section = SIDEBAR_SECTIONS.find(s => s.steps.includes(step))?.label ?? "";
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
        <span className="font-semibold text-navy-900">
          Step {step} of {total}
          {section ? <span className="text-slate-400 font-normal"> · {section}</span> : null}
        </span>
        <span className="text-green-600 font-semibold">{pct}% complete</span>
      </div>
      <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
        <div className="h-full bg-green-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ── Speedometer SVG ───────────────────────────────────────────────────────────

function SpeedometerGauge({ score, color }: { score: number; color: string }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    let raf: number;
    raf = requestAnimationFrame(() => {
      setTimeout(() => setAnimated(true), 50);
    });
    return () => cancelAnimationFrame(raf);
  }, [score]);

  // Arc path helper: draws an arc segment on a half-circle of radius 80
  const cx = 100, cy = 100, r = 80;
  function arcPath(startDeg: number, endDeg: number): string {
    const toRad = (d: number) => ((d - 90) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(startDeg - 90));
    const y1 = cy + r * Math.sin(toRad(startDeg - 90));
    const x2 = cx + r * Math.cos(toRad(endDeg - 90));
    const y2 = cy + r * Math.sin(toRad(endDeg - 90));
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  }

  const bands = [
    { from: 0,   to: 20,  color: "#DC2626" },
    { from: 20,  to: 40,  color: "#F97316" },
    { from: 40,  to: 60,  color: "#EAB308" },
    { from: 60,  to: 80,  color: "#86EFAC" },
    { from: 80,  to: 100, color: "#22C55E" },
  ];

  // Needle rotation: -90° = score 0 (left), +90° = score 100 (right)
  const needleRot = animated ? (score / 100) * 180 - 90 : -90;

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 110" className="w-56 h-auto" aria-label={`Readiness score: ${score} out of 100`}>
        {/* Band arcs */}
        {bands.map((b) => {
          const startDeg = (b.from / 100) * 180;
          const endDeg   = (b.to   / 100) * 180;
          return (
            <path
              key={b.color}
              d={arcPath(startDeg, endDeg)}
              fill="none"
              stroke={b.color}
              strokeWidth="14"
              strokeLinecap="butt"
              opacity="0.9"
            />
          );
        })}

        {/* Track background */}
        <path d={arcPath(0, 180)} fill="none" stroke="#1e293b" strokeWidth="14" strokeLinecap="butt" style={{ zIndex: -1 }} />

        {/* Needle — CSS-only transform to avoid SVG/CSS conflict */}
        <g
          style={{
            transformOrigin: `${cx}px ${cy}px`,
            transform: `rotate(${needleRot}deg)`,
            transition: animated ? "transform 1.4s cubic-bezier(0.34, 1.56, 0.64, 1)" : "none",
          }}
        >
          <line x1={cx} y1={cy} x2={cx} y2={cy - 72} stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
          <circle cx={cx} cy={cy} r="6" fill="#1e293b" />
        </g>

        {/* Score text */}
        <text x={cx} y={cy - 8} textAnchor="middle" fill="#0f172a" fontSize="28" fontWeight="800" fontFamily="Inter">
          {score}
        </text>
        <text x={cx} y={cy + 8} textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="Inter">
          out of 100
        </text>
      </svg>
    </div>
  );
}

// ── Mini Diagnostic Bar ───────────────────────────────────────────────────────

function MiniBar({ label, score }: { label: string; score: number }) {
  const color = score >= 65 ? "bg-green-400" : score >= 45 ? "bg-amber-400" : "bg-red-400";
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-slate-400 font-medium">{label}</span>
        <span className="text-white font-bold tabular-nums">{score}<span className="text-slate-500">/100</span></span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-700", color)} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

// ── Category Bar (report screen) ──────────────────────────────────────────────

function CategoryBar({ label, score }: { label: string; score: number }) {
  const color = score >= 65 ? "bg-green-400" : score >= 45 ? "bg-amber-400" : "bg-red-400";
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-slate-600 font-medium">{label}</span>
        <span className="text-slate-800 font-bold tabular-nums">{score}/100</span>
      </div>
      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-700", color)} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

// ── Option Icons ──────────────────────────────────────────────────────────────

const OPTION_ICONS: Record<string, string> = {
  // Q1 Sector
  "manufacturing": "🏭", "trading": "📦", "professional-services": "💼",
  "it-saas": "💻", "ecommerce": "🛒", "healthcare": "🏥",
  "financial-services": "🏦", "other": "🏢",
  // Q2 Footprint
  "one-city": "🏙", "one-state": "📍", "multi-state": "🗺",
  "pan-india": "🇮🇳", "india-plus": "🌏",
  // Q3 Digital data
  "yes-regularly": "🔄", "yes-sometimes": "📊", "very-little": "📉",
  "no": "🚫", "not-sure": "❓",
  // Q4 Data types
  "customer-data": "👥", "employee-data": "👤", "vendor-data": "🤝",
  "leads-data": "📋", "financial-kyc": "💳", "cctv-biometric": "📷",
  "health-children": "🏥",
  // Q5 Storage
  "whatsapp-email": "💬", "excel-sheets": "📊", "shared-drives": "☁️",
  "website-forms": "🌐", "erp-crm": "🖥", "accounting": "💰",
  "saas-tools": "⚙️", "paper-digitised": "📄",
  // Q6 Controls
  "privacy-notice": "📢", "consent-capture": "✅", "access-controls": "🔐",
  "retention": "🗑", "vendor-clauses": "📝", "incident-response": "🚨",
  "privacy-owner": "👤", "data-inventory": "🗂", "none": "❌",
  // Q7 Rights
  "no-process": "❌", "manual": "✋", "partial": "📋",
  "defined": "🔧", "operational": "✅",
  // Q8 Consent
  "no-ask": "❌", "implied": "🗣", "generic": "📄",
  "inconsistent": "⚠️", "clear": "✅",
  // Q9 Ownership
  "no-owner": "❌", "founder": "👨‍💼", "ops-admin": "⚙️",
  "legal-hr": "⚖️", "shared-team": "👥",
  // Q10 Readiness
  "not-started": "🔴", "aware": "🟡", "first-actions": "🟠",
  "basic-structure": "🟢", "mostly-prepared": "✅",
  // Q12 Resources
  "checklist": "✅", "notice-template": "📢", "consent-template": "📝",
  "vendor-checklist": "🔍", "awareness-kit": "📚", "consultation": "💬",
};

// Badge text shortened for 4-col narrow cards
const BADGE_SHORT: Record<string, string> = {
  "CRITICAL CLASSIFICATION": "CRITICAL",
  "HIGHER REGULATION": "REGULATED",
  "HIGH FREQUENCY": "FREQUENT",
  "NEEDS REVIEW": "REVIEW",
  "HIGHER COMPLEXITY": "COMPLEX",
};

// ── Universal Card Grid (single + multi) ─────────────────────────────────────

function QuestionCardGrid({
  options, mode, columns, selected, onChange, mutuallyExclusive = [],
}: {
  options: { id: string; text: string; badge?: string; badgeColor?: string }[];
  mode: "single" | "multi";
  columns: 2 | 4;
  selected: string | string[] | undefined;
  onChange: (val: string | string[]) => void;
  mutuallyExclusive?: string[];
}) {
  const isSelected = (id: string): boolean =>
    mode === "single"
      ? selected === id
      : Array.isArray(selected) && selected.includes(id);

  const handleClick = (id: string) => {
    if (mode === "single") {
      (onChange as (v: string) => void)(id);
      return;
    }
    const sel = (Array.isArray(selected) ? selected : []) as string[];
    if (mutuallyExclusive.includes(id)) {
      (onChange as (v: string[]) => void)(sel.includes(id) ? [] : [id]);
      return;
    }
    const filtered = sel.filter(s => !mutuallyExclusive.includes(s));
    (onChange as (v: string[]) => void)(
      filtered.includes(id) ? filtered.filter(s => s !== id) : [...filtered, id]
    );
  };

  const badgeColor = (c?: string) =>
    c === "red"   ? "bg-red-100 text-red-700" :
    c === "amber" ? "bg-amber-100 text-amber-700" :
    c === "green" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600";

  const gridClass = columns === 4
    ? "grid grid-cols-2 sm:grid-cols-4 gap-3"
    : "grid grid-cols-2 gap-3";

  return (
    <div className={gridClass}>
      {options.map((opt, idx) => {
        const sel = isSelected(opt.id);
        // For 4-col with odd count: last lone item starts at col 2 to center
        const isLone = columns === 4 && options.length % 4 !== 0 && idx === options.length - 1 && options.length % 2 !== 0;
        const badgeLabel = columns === 4 && opt.badge ? (BADGE_SHORT[opt.badge] ?? opt.badge) : opt.badge;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => handleClick(opt.id)}
            className={cn(
              "relative flex flex-col items-center justify-start gap-2 p-4 rounded-xl border-2 transition-all text-center min-h-[100px]",
              isLone && "sm:col-start-2",
              sel
                ? "border-navy-950 bg-navy-950 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-navy-300 hover:bg-slate-50"
            )}
          >
            {sel && (
              <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-green-400 flex items-center justify-center">
                <CheckCircle size={10} className="text-white" />
              </div>
            )}
            <span className="text-2xl leading-none mt-1" aria-hidden="true">
              {OPTION_ICONS[opt.id] ?? "📌"}
            </span>
            <span className={cn("text-xs font-semibold leading-snug", sel ? "text-white" : "text-slate-700")}>
              {opt.text}
            </span>
            {badgeLabel && (
              <span className={cn(
                "text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none",
                sel ? "bg-white/20 text-white" : badgeColor(opt.badgeColor)
              )}>
                {badgeLabel}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Multi-Select: Grouped Cards (Q6) ─────────────────────────────────────────

const Q6_GROUPS = [
  { label: "TRANSPARENCY & CONSENT",  ids: ["privacy-notice", "consent-capture"] },
  { label: "INTERNAL CONTROLS",       ids: ["access-controls", "retention"] },
  { label: "GOVERNANCE & RESPONSE",   ids: ["vendor-clauses", "incident-response", "privacy-owner", "data-inventory"] },
];

function QuestionMultiCards({
  options, selected, onChange,
}: {
  options: { id: string; text: string }[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const optMap = Object.fromEntries(options.map(o => [o.id, o]));

  const toggle = (id: string) => {
    if (id === "none") {
      onChange(selected.includes("none") ? [] : ["none"]);
      return;
    }
    const filtered = selected.filter(s => s !== "none");
    onChange(filtered.includes(id) ? filtered.filter(s => s !== id) : [...filtered, id]);
  };

  return (
    <div className="space-y-5">
      {Q6_GROUPS.map((group) => (
        <div key={group.label}>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{group.label}</div>
          <div className="grid grid-cols-2 gap-2">
            {group.ids.map((id) => {
              const opt = optMap[id];
              if (!opt) return null;
              const isSel = selected.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggle(id)}
                  className={cn(
                    "relative flex flex-col items-center justify-start gap-2 p-3 rounded-xl border-2 transition-all text-center min-h-[90px]",
                    isSel
                      ? "border-navy-950 bg-navy-950 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-navy-300 hover:bg-slate-50"
                  )}
                >
                  {isSel && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-green-400 flex items-center justify-center">
                      <CheckCircle size={10} className="text-white" />
                    </div>
                  )}
                  <span className="text-xl leading-none mt-1" aria-hidden="true">
                    {OPTION_ICONS[id] ?? "📌"}
                  </span>
                  <span className={cn("text-xs font-semibold leading-snug", isSel ? "text-white" : "text-slate-700")}>
                    {opt.text}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Single merged footer option */}
      <div className="pt-2 border-t border-slate-200">
        {(() => {
          const opt = optMap["none"];
          if (!opt) return null;
          const isSel = selected.includes("none");
          return (
            <button
              type="button"
              onClick={() => toggle("none")}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border-2 text-xs font-semibold transition-all",
                isSel
                  ? "border-navy-950 bg-navy-950 text-white"
                  : "border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-700"
              )}
            >
              <span aria-hidden="true">❌</span>
              {opt.text.toUpperCase()}
            </button>
          );
        })()}
      </div>
    </div>
  );
}

// ── Blocker Icon Grid (Q11) ───────────────────────────────────────────────────

const BLOCKER_ICONS: Record<string, string> = {
  "not-clear": "🔍", "no-time": "⏱", "no-budget": "💰",
  "no-owner": "👤", "manual-process": "⚙️", "team-awareness": "👥",
  "vendor-risk": "🔗", "need-help": "🤝",
};

function BlockerGrid({
  options, selected, onChange,
}: {
  options: { id: string; text: string }[];
  selected: string | undefined;
  onChange: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={cn(
            "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center",
            selected === opt.id
              ? "border-green-500 bg-navy-950 text-white"
              : "border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50"
          )}
        >
          <span className="text-2xl">{BLOCKER_ICONS[opt.id] ?? "📋"}</span>
          <span className="text-xs font-medium leading-snug">{opt.text}</span>
        </button>
      ))}
    </div>
  );
}

// ── Strategy Card ─────────────────────────────────────────────────────────────

function StrategyCard({
  priority, finding, why, what,
}: {
  priority: "HIGH PRIORITY" | "QUICK WIN" | "FOUNDATIONAL";
  finding: string;
  why: string;
  what: string;
}) {
  const badge =
    priority === "HIGH PRIORITY" ? "bg-red-100 text-red-700 border border-red-200" :
    priority === "QUICK WIN"      ? "bg-green-100 text-green-700 border border-green-200" :
    "bg-slate-100 text-slate-600 border border-slate-200";

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", badge)}>{priority}</span>
      <h4 className="font-bold text-slate-800 text-sm mt-3 mb-2 leading-snug">{finding}</h4>
      <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-1">Why it matters</div>
      <p className="text-slate-600 text-xs leading-relaxed mb-3">{why}</p>
      <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-1">What to do</div>
      <p className="text-slate-600 text-xs leading-relaxed">{what}</p>
    </div>
  );
}

// ── Derived Strategy Cards from Result ───────────────────────────────────────

function buildStrategyCards(result: DPDPAScoreResult): Array<{ priority: "HIGH PRIORITY" | "QUICK WIN" | "FOUNDATIONAL"; finding: string; why: string; what: string }> {
  const cards: Array<{ priority: "HIGH PRIORITY" | "QUICK WIN" | "FOUNDATIONAL"; finding: string; why: string; what: string }> = [];

  if (result.redFlagsTriggered.length > 0) {
    cards.push({
      priority: "HIGH PRIORITY",
      finding: result.redFlagsTriggered[0],
      why: "Red flag conditions directly increase regulatory exposure and penalty risk under DPDPA.",
      what: result.immediateActions[0] ?? "Address the flagged condition immediately before other compliance work.",
    });
  }

  if (result.immediateActions.length > (result.redFlagsTriggered.length > 0 ? 1 : 0)) {
    const idx = result.redFlagsTriggered.length > 0 ? 1 : 0;
    cards.push({
      priority: "QUICK WIN",
      finding: "Control gap with fast resolution path",
      why: "This control gap has a practical fix that can be implemented within a week with low cost.",
      what: result.immediateActions[idx] ?? "Close the highest-priority control gap first.",
    });
  }

  if (result.thirtyDayActions.length > 0) {
    cards.push({
      priority: "FOUNDATIONAL",
      finding: "30-day structural improvement",
      why: "Building this control now creates a foundation that makes all future compliance work easier.",
      what: result.thirtyDayActions[0] ?? "Build one foundational control this month.",
    });
  }

  return cards.slice(0, 3);
}

// ── Main Component ────────────────────────────────────────────────────────────

const TOTAL_Q_STEPS = 7; // steps 1–7 cover Q1–Q10 + Q11/Q12

export default function SurveyClient() {
  const [step, setStep] = useState(0);

  // Consent state
  const [consentRequired, setConsentRequired] = useState(false);
  const [consentReport, setConsentReport] = useState(false);
  const [consentNewsletter, setConsentNewsletter] = useState(false);
  const [consentFollowup, setConsentFollowup] = useState(false);
  const [privacyExpanded, setPrivacyExpanded] = useState(false);

  // Answers
  const [answers, setAnswers] = useState<DPDPAAnswers>({});

  // Result
  const [result, setResult] = useState<DPDPAScoreResult | null>(null);

  // Gate & contact
  const [branch, setBranch] = useState<"quick" | "full" | null>(null);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactBusiness, setContactBusiness] = useState("");
  const [contactMobile, setContactMobile] = useState("");
  const [consentDelivery, setConsentDelivery] = useState(false);
  const [consentNL, setConsentNL] = useState(false);
  const [consentFU, setConsentFU] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reportToken, setReportToken] = useState("");
  // Honeypot — hidden from real users; only bots fill it. Left empty by humans.
  const [hpUrl, setHpUrl] = useState("");

  // ── GA4 funnel events — fire once per milestone so we can measure PR drop-off ──
  const firedSteps = useRef<Set<string>>(new Set());
  useEffect(() => {
    const fireOnce = (key: string, fn: () => void) => {
      if (!firedSteps.current.has(key)) { firedSteps.current.add(key); fn(); }
    };
    if (step === 1) fireOnce("start", () => trackEvent.assessmentStart());
    if (step === 3) fireOnce("step3", () => trackEvent.assessmentStep(3));
    if (step === 6) fireOnce("step6", () => trackEvent.assessmentStep(6));
  }, [step]);

  const setAnswer = <K extends keyof DPDPAAnswers>(key: K, val: DPDPAAnswers[K]) =>
    setAnswers(prev => ({ ...prev, [key]: val }));

  // ── Step navigation helpers ─────────────────────────────────────────────

  const canProceed = (): boolean => {
    if (step === 0) return consentRequired;
    if (step === 1) return !!(answers.q1_sector && answers.q2_footprint);
    if (step === 2) return !!(answers.q3_digital_data);
    if (step === 3) return !!(answers.q4_data_types?.length && answers.q5_storage?.length);
    if (step === 4) return !!(answers.q6_controls?.length);
    if (step === 5) return !!(answers.q7_rights && answers.q8_consent);
    if (step === 6) return !!(answers.q9_ownership && answers.q10_readiness);
    // step 7 = optional Q11/Q12
    return true;
  };

  const handleNext = () => {
    if (step === 2 && answers.q3_digital_data === "no") {
      // Skip Q4+Q5, jump to Q6 screen
      setStep(4);
      return;
    }
    if (step === 6) {
      // Calculate score after Q9+Q10
      const r = calculateFullResult(answers);
      setResult(r);
      trackEvent.surveyComplete({
        score: r.finalScore,
        band: r.verdictBand,
        sector: answers.q1_sector,
      });
    }
    setStep(s => s + 1);
  };

  const handleBack = () => {
    if (step === 4 && answers.q3_digital_data === "no") {
      setStep(2);
      return;
    }
    setStep(s => Math.max(0, s - 1));
  };

  // ── Submit handler ──────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!contactEmail) { setStep(9); return; }
    setSubmitting(true);
    trackEvent.reportRequested({ band: result?.verdictBand, sector: answers.q1_sector });

    const payload = JSON.stringify({
      email: contactEmail,
      name: contactName,
      business: contactBusiness,
      mobile: contactMobile,
      report_type: branch,
      answers,
      result,
      consentReport,
      consentNewsletter,
      consentFollowup,
      hp_url: hpUrl, // honeypot — empty for real users
    });

    // Retry on transient failure so a momentary network/DB blip doesn't lose the
    // lead. The user's answers stay in React state throughout, so nothing is lost.
    let saved = false;
    for (let attempt = 1; attempt <= 3 && !saved; attempt++) {
      try {
        const res = await fetch("/api/assessment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
        });
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          if (data.reportToken) setReportToken(data.reportToken);
          saved = true;
        } else if (res.status === 429) {
          // Rate-limited — wait the suggested time, then retry.
          const wait = Number(res.headers.get("Retry-After")) || 2;
          await new Promise(r => setTimeout(r, Math.min(wait, 5) * 1000));
        } else {
          await new Promise(r => setTimeout(r, attempt * 800));
        }
      } catch {
        await new Promise(r => setTimeout(r, attempt * 800));
      }
    }

    setSubmitting(false);
    setSubmitted(true);
    setStep(9);
  };

  // ── Layout wrapper ──────────────────────────────────────────────────────

  const isLanding = step === 0;
  const isResults = step >= 8;

  // ── Step 0: Landing ─────────────────────────────────────────────────────

  if (step === 0) return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-start">

          {/* Left — Hero */}
          <div>
            <div className="inline-block bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-5">
              DPDPA READINESS ASSESSMENT
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-navy-900 leading-tight mb-5">
              Find your DPDPA readiness gaps in 3–5 minutes
            </h1>
            <p className="text-slate-600 text-lg leading-relaxed mb-7">
              Check how your business handles personal data, consent, storage, data rights
              requests, vendors, and privacy ownership — and get a plain-English readiness
              score with practical next steps.
            </p>
            {/* Trust row */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {[
                { icon: "🇮🇳", text: "Built for Indian businesses" },
                { icon: "🆓", text: "No payment required" },
                { icon: "🚫", text: "No legal jargon" },
                { icon: "⏱", text: "Takes 3–5 minutes" },
                { icon: "📋", text: "Practical score + next steps" },
                { icon: "⚖️", text: "Educational, not legal advice" },
              ].map(item => (
                <div key={item.text} className="flex items-center gap-2 text-sm text-slate-700">
                  <span>{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>

            {/* What you'll get */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 mb-5">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">What you&apos;ll get</div>
              <div className="grid sm:grid-cols-2 gap-x-5 gap-y-2">
                {[
                  "Your readiness score (0–100)",
                  "Your top 3 privacy gaps",
                  "Your risk category",
                  "Recommended next steps",
                  "A simple DPDPA checklist",
                  "Option to email your full report",
                ].map(t => (
                  <div key={t} className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckCircle size={15} className="text-green-500 mt-0.5 shrink-0" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* How it works */}
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">How it works</div>
              <div className="space-y-2">
                {[
                  "Answer 12 quick questions about your business",
                  "Get your readiness score instantly",
                  "See your biggest privacy gaps",
                  "Receive recommended next actions",
                ].map((t, i) => (
                  <div key={t} className="flex items-center gap-3 text-sm text-slate-700">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-navy-900 text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Authorization card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-7">
            <h2 className="text-xl font-bold text-navy-900 mb-1">Start your free DPDPA readiness check</h2>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-6">Before you begin</div>

            {/* Required consent */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentRequired}
                  onChange={e => setConsentRequired(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-green-500 shrink-0"
                />
                <span className="text-sm text-slate-700 leading-snug">
                  I authorize SaralPrivacy to analyze my responses to generate a confidential DPDPA readiness assessment.{" "}
                  <span className="text-red-500 font-bold">*</span>
                </span>
              </label>

              <button
                type="button"
                onClick={() => setPrivacyExpanded(e => !e)}
                className="mt-2 ml-7 text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                View privacy notice {privacyExpanded ? "▲" : "▼"}
              </button>

              {privacyExpanded && (
                <div className="mt-3 ml-7 text-xs text-slate-500 leading-relaxed bg-white rounded-lg p-3 border border-slate-200">
                  SaralPrivacy will use your responses to assess your business's DPDPA readiness, generate your score, and provide recommended next steps.
                  If you share contact details, we will use them to send your report and requested resources.
                  You may withdraw consent at any time by contacting{" "}
                  <a href="mailto:privacy@saralprivacy.com" className="text-blue-600 underline">privacy@saralprivacy.com</a>.{" "}
                  <Link href="/privacy" className="text-blue-600 underline">Read our full Privacy Notice</Link>.
                </div>
              )}
            </div>

            {/* CTA */}
            <button
              onClick={handleNext}
              disabled={!consentRequired}
              className="w-full py-4 bg-navy-900 text-white font-bold rounded-xl text-base hover:bg-navy-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mb-2"
            >
              Take free assessment <ArrowRight size={18} />
            </button>
            <div className="text-center text-xs text-slate-400 mb-5">Free · No payment required</div>

            {/* Optional consents */}
            <div className="space-y-2.5 border-t border-slate-100 pt-4">
              {[
                { label: "Deliver full technical report to my email", val: consentReport, set: setConsentReport },
                { label: "Send me free daily DPDPA briefings (2-min reads, unsubscribe anytime)", val: consentNewsletter, set: setConsentNewsletter },
              ].map(({ label, val, set }) => (
                <label key={label} className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={val}
                    onChange={e => set(e.target.checked)}
                    className="w-4 h-4 accent-green-500"
                  />
                  <span className="text-xs text-slate-500">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Question Wizard Layout (steps 1–7) ──────────────────────────────────

  if (step >= 1 && step <= 7) {
    const qStep = step; // 1=Q1+Q2, 2=Q3, 3=Q4+Q5, 4=Q6, 5=Q7+Q8, 6=Q9+Q10, 7=Q11+Q12
    const isOptionalStep = step === 7;

    return (
      <div className="min-h-screen bg-white flex">
        <SidebarNav step={step} result={result} />

        {/* Main */}
        <div className="flex-1 px-6 sm:px-10 py-8 overflow-y-auto max-w-3xl">
          <ProgressBar step={qStep} total={TOTAL_Q_STEPS} />

          {/* Step 1: Q1 + Q2 */}
          {step === 1 && (
            <div className="space-y-8">
              <div>
                <div className="text-xs font-bold text-green-600 uppercase tracking-widest mb-2">BUSINESS CONTEXT</div>
                <h2 className="text-3xl font-bold text-navy-900 mb-1">Where privacy risk starts in your business</h2>
                <p className="text-slate-500 text-sm">This helps identify where privacy exposure is structurally built into your business model.</p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold flex items-center justify-center shrink-0">1</span>
                  <span className="text-navy-800 font-semibold text-base">Which sector best describes your business?</span>
                </div>
                <QuestionCardGrid
                  options={QUESTIONS[0].options}
                  mode="single"
                  columns={4}
                  selected={answers.q1_sector}
                  onChange={(v) => setAnswer("q1_sector", v as string)}
                />
                {answers.q1_sector === "other" && (
                  <div className="mt-3">
                    <label className="block text-sm font-semibold text-slate-600 mb-1">Please describe your industry</label>
                    <input
                      type="text"
                      value={(answers as any).q1_sector_other ?? ""}
                      onChange={(e) => setAnswers(prev => ({ ...prev, q1_sector_other: e.target.value } as any))}
                      placeholder="e.g. Real estate, Education, Agriculture..."
                      className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                    />
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold flex items-center justify-center shrink-0">2</span>
                  <span className="text-navy-800 font-semibold text-base">Where do you mainly operate?</span>
                </div>
                <QuestionCardGrid
                  options={QUESTIONS[1].options}
                  mode="single"
                  columns={4}
                  selected={answers.q2_footprint}
                  onChange={(v) => setAnswer("q2_footprint", v as string)}
                />
              </div>
            </div>
          )}

          {/* Step 2: Q3 */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <div className="text-xs font-bold text-green-600 uppercase tracking-widest mb-2">DATA EXPOSURE PROFILE</div>
                <h2 className="text-3xl font-bold text-navy-900 mb-1">Does your business collect or store personal data digitally?</h2>
                <p className="text-slate-500 text-sm">Even occasional digital data collection creates obligations under DPDPA if individuals are identifiable.</p>
              </div>
              <QuestionCardGrid
                options={QUESTIONS[2].options}
                mode="single"
                columns={4}
                selected={answers.q3_digital_data}
                onChange={(v) => setAnswer("q3_digital_data", v as string)}
              />
            </div>
          )}

          {/* Step 3: Q4 + Q5 */}
          {step === 3 && (
            <div className="space-y-8">
              <div>
                <div className="text-xs font-bold text-green-600 uppercase tracking-widest mb-2">DATA ECOSYSTEM MAPPING</div>
                <h2 className="text-3xl font-bold text-navy-900 mb-1">Define your compliance footprint by data handling practices.</h2>
                <div className="text-xs text-slate-400 font-mono">04 / 10</div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold flex items-center justify-center shrink-0">4</span>
                  <span className="text-navy-800 font-semibold text-base">What data do you handle? <span className="text-slate-500 text-xs font-normal">Select all that apply</span></span>
                </div>
                <QuestionCardGrid
                  options={QUESTIONS[3].options}
                  mode="multi"
                  columns={2}
                  selected={answers.q4_data_types ?? []}
                  onChange={(v) => setAnswer("q4_data_types", v as string[])}
                  mutuallyExclusive={["not-sure"]}
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold flex items-center justify-center shrink-0">5</span>
                  <span className="text-navy-800 font-semibold text-base">Where is this data usually stored? <span className="text-slate-500 text-xs font-normal">Select all that apply</span></span>
                </div>
                <QuestionCardGrid
                  options={QUESTIONS[4].options}
                  mode="multi"
                  columns={2}
                  selected={answers.q5_storage ?? []}
                  onChange={(v) => setAnswer("q5_storage", v as string[])}
                  mutuallyExclusive={["not-sure"]}
                />
              </div>
            </div>
          )}

          {/* Step 4: Q6 */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <div className="text-xs font-bold text-green-600 uppercase tracking-widest mb-2">CONTROL MATURITY ASSESSMENT</div>
                <h2 className="text-3xl font-bold text-navy-900 mb-1">Which privacy basics are already in place?</h2>
                <div className="text-xs text-slate-400 font-mono mb-2">06 / 10</div>
                <div className="bg-slate-100 rounded-lg px-4 py-2.5 text-xs text-slate-500">
                  ℹ This section helps distinguish policy intent from operational controls.
                </div>
              </div>
              <QuestionMultiCards
                options={QUESTIONS[5].options}
                selected={answers.q6_controls ?? []}
                onChange={(ids) => setAnswer("q6_controls", ids)}
              />
            </div>
          )}

          {/* Step 5: Q7 + Q8 */}
          {step === 5 && (
            <div className="space-y-8">
              <div>
                <div className="text-xs font-bold text-green-600 uppercase tracking-widest mb-2">COMPLIANCE MATURITY</div>
                <h2 className="text-3xl font-bold text-navy-900 mb-1">How consent and requests are handled today</h2>
                <p className="text-slate-500 text-sm">Compliance maturity is 80% complete.</p>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">RIGHTS MANAGEMENT</div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold flex items-center justify-center shrink-0">7</span>
                  <span className="text-navy-800 font-semibold text-base">How well can your business handle requests to access, correct, or delete data?</span>
                </div>
                <QuestionCardGrid
                  options={QUESTIONS[6].options}
                  mode="single"
                  columns={2}
                  selected={answers.q7_rights}
                  onChange={(v) => setAnswer("q7_rights", v as string)}
                />
              </div>

              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">CONSENT PRACTICE</div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold flex items-center justify-center shrink-0">8</span>
                  <span className="text-navy-800 font-semibold text-base">How does your business ask for permission before collecting personal data?</span>
                </div>
                <QuestionCardGrid
                  options={QUESTIONS[7].options}
                  mode="single"
                  columns={2}
                  selected={answers.q8_consent}
                  onChange={(v) => setAnswer("q8_consent", v as string)}
                />
              </div>
            </div>
          )}

          {/* Step 6: Q9 + Q10 */}
          {step === 6 && (
            <div className="space-y-8">
              <div>
                <div className="text-xs font-bold text-green-600 uppercase tracking-widest mb-2">OWNERSHIP & READINESS</div>
                <h2 className="text-3xl font-bold text-navy-900 mb-1">Who owns privacy decisions today</h2>
                <p className="text-slate-500 text-sm">Final phase of the foundational audit.</p>
                <div className="text-xs text-slate-400 font-mono mt-1">QUESTION 9–10 OF 10</div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold flex items-center justify-center shrink-0">9</span>
                  <span className="text-navy-800 font-semibold text-base">Who is primarily responsible for privacy or data protection in your business today?</span>
                </div>
                <QuestionCardGrid
                  options={QUESTIONS[8].options}
                  mode="single"
                  columns={4}
                  selected={answers.q9_ownership}
                  onChange={(v) => setAnswer("q9_ownership", v as string)}
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold flex items-center justify-center shrink-0">10</span>
                  <span className="text-navy-800 font-semibold text-base">Which statement best describes your current DPDPA readiness?</span>
                </div>
                <QuestionCardGrid
                  options={QUESTIONS[9].options}
                  mode="single"
                  columns={4}
                  selected={answers.q10_readiness}
                  onChange={(v) => setAnswer("q10_readiness", v as string)}
                />
              </div>
            </div>
          )}

          {/* Step 7: Q11 + Q12 (optional) */}
          {step === 7 && (
            <div className="space-y-8">
              <div>
                <div className="text-xs font-bold text-green-600 uppercase tracking-widest mb-2">PERSONALISATION</div>
                <h2 className="text-3xl font-bold text-navy-900 mb-1">Help us prioritize the right fixes</h2>
                <p className="text-slate-500 text-sm">This tailors your report to your operating reality, not generic advice.</p>
                <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-400 rounded-full" style={{ width: "95%" }} />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-full bg-slate-600 text-slate-300 text-xs font-bold flex items-center justify-center shrink-0">11</span>
                  <span className="text-navy-800 font-semibold text-base">What is your biggest blocker right now? <span className="text-slate-400 font-normal text-xs">(Optional)</span></span>
                </div>
                <BlockerGrid
                  options={QUESTIONS[10].options}
                  selected={answers.q11_blocker}
                  onChange={(id) => setAnswer("q11_blocker", id)}
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-full bg-slate-600 text-slate-300 text-xs font-bold flex items-center justify-center shrink-0">12</span>
                  <span className="text-navy-800 font-semibold text-base">What would help you most right now? <span className="text-slate-400 font-normal text-xs">(Optional)</span></span>
                </div>
                <QuestionCardGrid
                  options={QUESTIONS[11].options}
                  mode="single"
                  columns={4}
                  selected={answers.q12_resource}
                  onChange={(v) => setAnswer("q12_resource", v as string)}
                />
              </div>

              <button
                type="button"
                onClick={() => { setStep(8); }}
                className="text-slate-500 hover:text-slate-300 text-sm flex items-center gap-1.5 transition-colors"
              >
                <SkipForward size={14} /> Skip these questions for now
              </button>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-200">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft size={16} /> Back
            </button>

            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="inline-flex items-center gap-2 px-7 py-3 bg-green-500 text-white text-sm font-bold rounded-xl hover:bg-green-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              {step === 6 ? "See my readiness score" : isOptionalStep ? "Next →" : "Next question"}
              {step !== 6 && <ArrowRight size={16} />}
            </button>
          </div>
        </div>

        {/* Right context panel — all steps, dark navy */}
        {step >= 1 && step <= 7 && (
          <div className="hidden xl:block w-64 bg-navy-900 px-5 py-8 border-l border-navy-800 shrink-0">
            <div className="text-xs font-bold text-green-400 uppercase tracking-widest mb-3">WHY THIS MATTERS</div>
            <p className="text-slate-300 text-xs leading-relaxed mb-5">
              {step === 1 && "Your sector and scale determine which DPDPA obligations apply to you and at what threshold."}
              {step === 2 && "How you collect data determines whether you need explicit consent or can rely on legitimate interest."}
              {step === 3 && "Sensitive data categories attract heavier penalties and mandatory security standards under DPDPA."}
              {step === 4 && "Controls in place reduce your penalty exposure by up to 60% in the event of a data breach."}
              {step === 5 && "Rights handling and consent quality are the two highest-weighted assessment factors."}
              {step === 6 && "Designated ownership is required by DPDPA — informal ownership is treated as non-compliance."}
              {step === 7 && "Your answers help us personalise your action plan — no scoring impact."}
            </p>
            <div className="text-xs font-bold text-green-400 uppercase tracking-widest mb-3">WHAT STRONG TEAMS DO</div>
            <p className="text-slate-300 text-xs leading-relaxed">
              {step === 1 && "Strong teams classify their sector first — healthcare and financial services face stricter obligations and lower penalty thresholds than other sectors."}
              {step === 2 && "Strong teams document every touchpoint where personal data enters their systems and establish the legal basis for each collection channel."}
              {step === 3 && "Strong teams maintain a live data inventory that separates sensitive from non-sensitive categories, with dedicated access controls per type."}
              {step === 4 && "Strong teams treat privacy controls as operational infrastructure — each control has a named owner and is tested quarterly."}
              {step === 5 && "Strong teams automate rights fulfilment — access requests resolved in 72 hours, deletion tracked end-to-end, consent records timestamped."}
              {step === 6 && "Strong teams assign a Privacy Lead with a clear mandate and board visibility — not just an informal responsibility added to someone's role."}
              {step === 7 && "Strong teams fix their highest-penalty-risk gap first — not the easiest one."}
            </p>
          </div>
        )}
      </div>
    );
  }

  // ── Step 8: Gate / Unlock Screen (comes BEFORE full report) ────────────

  if (step === 8 && result) {
    return (
      <div className="min-h-screen bg-slate-50 flex">
        <SidebarNav step={8} result={result} />
        <div className="flex-1 px-4 sm:px-10 py-10">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 items-start">

              {/* Left — score teaser */}
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">READINESS RESULT</div>
                <div className="flex items-end gap-2 mb-1">
                  <span className="text-7xl font-bold text-navy-900 leading-none">{result.finalScore}</span>
                  <span className="text-2xl text-slate-400 mb-2">/100</span>
                </div>
                <div className="inline-flex items-center gap-2 bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-lg mb-4">
                  MATURITY LEVEL: {result.verdictBand.toUpperCase()}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">{result.verdictDescription}</p>

                <div className="bg-white rounded-2xl border border-slate-200 p-5">
                  <div className="text-xs font-bold text-slate-500 mb-3">✦ What you&apos;ll get</div>
                  {[
                    "Complete score breakdown — detailed assessment across all five DPDPA compliance pillars",
                    "Top 3 priority actions — prioritized remediation steps to lower your legal risk profile",
                    "Downloadable checklist — a structured roadmap for implementing end-to-end privacy controls",
                  ].map(item => (
                    <div key={item} className="flex items-start gap-2.5 mb-3">
                      <CheckCircle size={15} className="text-green-500 mt-0.5 shrink-0" />
                      <span className="text-slate-600 text-sm leading-snug">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — unlock form */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-7">
                <h2 className="text-xl font-bold text-navy-900 mb-1">Get your detailed report with top risks, quick wins, and next steps</h2>
                <div className="flex items-center gap-1.5 text-xs text-green-700 font-semibold mb-5">
                  <Shield size={12} /> SECURE DELIVERY MODE
                </div>

                {/* Honeypot — hidden from real users; bots auto-fill it and get dropped server-side */}
                <input
                  type="text"
                  name="hp_url"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  value={hpUrl}
                  onChange={e => setHpUrl(e.target.value)}
                  style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
                />

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">WORK EMAIL (REQUIRED)</label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={e => setContactEmail(e.target.value)}
                      placeholder="rahul@company.com"
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">YOUR NAME (OPTIONAL)</label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={e => setContactName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">BUSINESS NAME (OPTIONAL)</label>
                    <input
                      type="text"
                      value={contactBusiness}
                      onChange={e => setContactBusiness(e.target.value)}
                      placeholder="Company India Pvt. Ltd."
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">MOBILE (OPTIONAL)</label>
                    <input
                      type="tel"
                      value={contactMobile}
                      onChange={e => setContactMobile(e.target.value)}
                      placeholder="+91 90000 00000"
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                </div>

                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  We only use these details to generate and deliver your secure compliance report. Your data is encrypted and managed according to DPDPA standards.
                </p>

                <div className="space-y-2.5 mb-5">
                  <label className="flex items-start gap-2.5 cursor-pointer bg-green-50 border border-green-200 rounded-lg px-3 py-2.5">
                    <input type="checkbox" checked={consentDelivery} onChange={e => setConsentDelivery(e.target.checked)} className="mt-0.5 w-4 h-4 accent-green-500" />
                    <span className="text-xs text-slate-700 leading-snug">I consent to SaralPrivacy using my details to deliver my readiness report. <span className="text-red-500">*</span></span>
                  </label>
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={consentNL} onChange={e => setConsentNL(e.target.checked)} className="mt-0.5 w-4 h-4 accent-green-500" />
                    <span className="text-xs text-slate-500 leading-snug">I would like to receive occasional updates regarding Indian privacy laws.</span>
                  </label>
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={consentFU} onChange={e => setConsentFU(e.target.checked)} className="mt-0.5 w-4 h-4 accent-green-500" />
                    <span className="text-xs text-slate-500 leading-snug">I agree to be contacted for a professional consultation for specific DPDPA needs.</span>
                  </label>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!contactEmail || !consentDelivery || submitting}
                  className="w-full py-3.5 bg-green-500 text-white font-bold rounded-xl text-sm hover:bg-green-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? "Sending…" : "Unlock detailed report"} {!submitting && <ArrowRight size={16} />}
                </button>

                <button
                  type="button"
                  onClick={() => setStep(9)}
                  className="w-full text-center text-xs text-slate-400 hover:text-slate-600 mt-3 transition-colors"
                >
                  Skip — show basic results
                </button>
              </div>
            </div>

            <div className="mt-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <Shield size={12} />
              Trusted by 200+ Indian enterprises for DPDPA readiness and secure privacy governance.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Step 9: Full Report Screen ──────────────────────────────────────────

  if (step === 9 && result) {
    const cats = result.categoryScores;
    const stratCards = buildStrategyCards(result);
    const reportId = reportToken ? `SP-${reportToken.slice(0, 8).toUpperCase()}` : `SP-${Date.now().toString(36).toUpperCase()}`;

    return (
      <div className="min-h-screen bg-slate-50">
        <div className="flex">
          <SidebarNav step={9} result={result} />
          <div className="flex-1 px-6 sm:px-10 py-10 max-w-4xl">

            {submitted && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                <CheckCircle size={18} className="text-green-600 shrink-0" />
                <div>
                  <div className="font-semibold text-green-800 text-sm">Report on its way!</div>
                  <div className="text-green-700 text-xs">We will send your detailed report to <strong>{contactEmail}</strong> shortly.</div>
                </div>
              </div>
            )}

            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-navy-900">Your DPDPA readiness report</h1>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm font-bold px-3 py-1 rounded-full"
                    style={{ backgroundColor: result.verdictColor + "20", color: result.verdictColor }}>
                    ✦ {result.verdictBand}
                  </span>
                  <span className="text-xs text-slate-400">This report is designed for Indian businesses working toward DPDPA-ready practices.</span>
                </div>
              </div>
              <div className="text-right text-xs text-slate-400">
                <div>REPORT REF</div>
                <div className="font-mono font-bold text-slate-600">{reportId}</div>
              </div>
            </div>

            {/* Executive summary + speedometer */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
              <div className="grid sm:grid-cols-2 gap-6 items-center">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">EXECUTIVE SUMMARY</div>
                  <p className="text-slate-700 text-sm leading-relaxed">{result.verdictDescription}</p>
                </div>
                <div className="flex flex-col items-center">
                  <SpeedometerGauge score={result.finalScore} color={result.verdictColor} />
                  <div className="text-xs text-slate-400 mt-2 text-center">Your readiness score</div>
                </div>
              </div>
            </div>

            {/* 6 score categories */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">SCORE CATEGORIES</div>
              <div className="grid sm:grid-cols-2 gap-4">
                <CategoryBar label="Notice and consent"       score={cats.noticeConsent} />
                <CategoryBar label="Access and control"       score={cats.accessControl} />
                <CategoryBar label="Retention and deletion"   score={cats.retentionDeletion} />
                <CategoryBar label="Ownership and governance" score={cats.ownershipGovernance} />
                <CategoryBar label="Vendor and partner risk"  score={cats.vendorPartnerRisk} />
                <CategoryBar label="Incident readiness"       score={cats.incidentReadiness} />
              </div>
            </div>

            {/* 3 mini diagnostics */}
            <div className="bg-navy-900 rounded-2xl p-6 mb-6">
              <div className="text-xs font-bold text-green-400 uppercase tracking-widest mb-4">DIAGNOSTIC SIGNALS</div>
              <div className="space-y-4">
                <MiniBar label="Data Exposure"          score={result.dataExposure} />
                <MiniBar label="Control Maturity"       score={result.controlMaturity} />
                <MiniBar label="Operational Readiness"  score={result.operationalReadiness} />
              </div>
            </div>

            {/* Red flags */}
            {result.redFlagsTriggered.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={16} className="text-red-600" />
                  <span className="font-bold text-red-700 text-sm">{result.redFlagsTriggered.length} red flag{result.redFlagsTriggered.length > 1 ? "s" : ""} detected</span>
                </div>
                <ul className="space-y-1.5">
                  {result.redFlagsTriggered.map(f => (
                    <li key={f} className="text-red-600 text-sm flex items-start gap-2">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Strategic recommendations */}
            <div className="mb-6">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">STRATEGIC RECOMMENDATIONS</div>
              <div className="grid sm:grid-cols-3 gap-4">
                {stratCards.map((card, i) => (
                  <StrategyCard key={i} {...card} />
                ))}
              </div>
            </div>

            {/* CTA bar */}
            <div className="bg-navy-900 rounded-2xl p-6 text-center">
              <h3 className="text-xl font-bold text-white mb-2">Elevate your readiness today.</h3>
              <p className="text-slate-400 text-sm mb-5">
                The DPDP Rules require a compliance posture. Our experts help you build the DPDPA-aligned framework and implementation strategy.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {reportToken && (
                  <a href={`/report/${reportToken}`} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-green-500 text-white font-bold rounded-xl text-sm hover:bg-green-400 transition-colors flex items-center justify-center gap-2">
                    View Full Report →
                  </a>
                )}
                <Link href="/contact" onClick={() => trackEvent.callBookingClicked({ band: result?.verdictBand, location: "assessment_report" })} className="px-6 py-3 bg-white/10 text-white font-bold rounded-xl text-sm hover:bg-white/20 transition-colors flex items-center justify-center gap-2">
                  Book a free 20-min call
                </Link>
                <Link href="/white-paper" className="px-6 py-3 bg-white/10 text-white font-bold rounded-xl text-sm hover:bg-white/20 transition-colors flex items-center justify-center gap-2">
                  Download White Paper
                </Link>
              </div>
            </div>

            {/* Retake link */}
            <div className="mt-6 text-center">
              <button
                onClick={() => { setAnswers({}); setResult(null); setStep(0); setConsentRequired(false); setContactEmail(""); setContactName(""); setContactBusiness(""); setContactMobile(""); setSubmitted(false); setReportToken(""); }}
                className="text-sm text-slate-400 hover:text-slate-600 underline transition-colors"
              >
                Retake Assessment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Step 10: Final Results ───────────────────────────────────────────────

  if (step === 10 && result) {
    const resourceCTA = getResourceCTA(answers.q12_resource);
    const blockerCTA = answers.q11_blocker ? getBlockerCTA(answers.q11_blocker) : null;

    return (
      <div className="min-h-screen bg-slate-50">
        <div className="flex">
          <SidebarNav step={8} result={result} />
          <div className="flex-1 px-6 sm:px-10 py-10 max-w-3xl">

            {submitted && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                <CheckCircle size={18} className="text-green-600 shrink-0" />
                <div>
                  <div className="font-semibold text-green-800 text-sm">Report on its way!</div>
                  <div className="text-green-700 text-xs">We will send your detailed report to <strong>{contactEmail}</strong> shortly.</div>
                </div>
              </div>
            )}

            {/* Score header */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-5 text-center">
              <SpeedometerGauge score={result.finalScore} color={result.verdictColor} />
              <div className="mt-3 text-sm font-bold" style={{ color: result.verdictColor }}>{result.verdictBand}</div>
              <p className="text-slate-600 text-sm mt-2 leading-relaxed max-w-md mx-auto">{result.verdictDescription}</p>
            </div>

            {/* 3 mini-bars */}
            <div className="bg-navy-900 rounded-2xl p-6 mb-5">
              <div className="text-xs font-bold text-green-400 uppercase tracking-widest mb-4">DIAGNOSTIC SIGNALS</div>
              <div className="space-y-4">
                <MiniBar label="Data Exposure"          score={result.dataExposure} />
                <MiniBar label="Control Maturity"       score={result.controlMaturity} />
                <MiniBar label="Operational Readiness"  score={result.operationalReadiness} />
              </div>
            </div>

            {/* Red flags */}
            {result.redFlagsTriggered.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={16} className="text-red-600" />
                  <span className="font-bold text-red-700 text-sm">{result.redFlagsTriggered.length} red flag{result.redFlagsTriggered.length > 1 ? "s" : ""} detected</span>
                </div>
                <ul className="space-y-1.5">
                  {result.redFlagsTriggered.map(f => (
                    <li key={f} className="text-red-600 text-sm flex items-start gap-2">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Immediate actions */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-5">
              <h3 className="font-bold text-navy-700 text-base mb-4">3 things to do this week</h3>
              <div className="space-y-3">
                {result.immediateActions.map((action, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    <p className="text-slate-600 text-sm leading-relaxed">{action}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 30-day plan */}
            {result.thirtyDayActions.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-5">
                <h3 className="font-bold text-navy-700 text-base mb-4">Your 30-day action plan</h3>
                <div className="space-y-3">
                  {result.thirtyDayActions.map((action, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                      <p className="text-slate-600 text-sm leading-relaxed">{action}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTAs */}
            <div className="bg-navy-900 rounded-2xl p-6 mb-5">
              <h4 className="font-bold text-white text-base mb-1">Recommended next step</h4>
              <p className="text-slate-400 text-sm mb-4">{result.blockerNote ?? "Start with the highest-priority action above."}</p>
              <div className="flex flex-col sm:flex-row gap-3">
                {reportToken && (
                  <a
                    href={`/report/${reportToken}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center py-3 px-5 bg-green-500 hover:bg-green-400 text-white font-semibold rounded-xl text-sm transition-colors"
                  >
                    View Full Report →
                  </a>
                )}
                <Link
                  href={resourceCTA.href}
                  className="flex-1 text-center py-3 px-5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-sm border border-white/20 transition-colors"
                >
                  {resourceCTA.label}
                </Link>
                {blockerCTA && (
                  <Link
                    href={blockerCTA.href}
                    className="flex-1 text-center py-3 px-5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-sm border border-white/20 transition-colors"
                  >
                    {blockerCTA.label}
                  </Link>
                )}
              </div>
            </div>

            {/* Consultation CTA — convert serious leads */}
            <Link
              href="/contact"
              onClick={() => trackEvent.callBookingClicked({ band: result?.verdictBand, location: "assessment_result" })}
              className="block mb-4 rounded-xl border border-green-200 bg-green-50 p-5 hover:bg-green-100 transition-colors group"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-navy-900 text-sm mb-0.5">Want help interpreting your score?</div>
                  <div className="text-slate-600 text-sm">Book a free 20-minute DPDPA readiness call with our team.</div>
                </div>
                <span className="shrink-0 inline-flex items-center gap-1 text-green-700 font-semibold text-sm group-hover:gap-2 transition-all">
                  Book a call <ArrowRight size={16} />
                </span>
              </div>
            </Link>

            <button
              onClick={() => {
                setAnswers({});
                setResult(null);
                setStep(0);
                setConsentRequired(false);
                setContactEmail(""); setContactName(""); setContactBusiness(""); setContactMobile("");
                setSubmitted(false); setReportToken("");
              }}
              className="w-full text-center text-sm text-slate-400 hover:text-slate-600 underline transition-colors"
            >
              Retake Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
