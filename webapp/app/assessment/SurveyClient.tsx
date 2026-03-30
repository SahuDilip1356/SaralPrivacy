"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { CheckCircle, ArrowRight, ArrowLeft, Shield, ChevronDown, X } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Answers {
  role?: string;
  employee_size?: string;
  sector?: string;
  operating_footprint?: string;
  state_ut?: string;
  city?: string;
  digital_personal_data?: string;
  data_types?: string[];
  data_storage?: string[];
  controls_in_place?: string[];
  readiness_self_view?: string;
  biggest_blocker?: string;
  most_helpful_resource?: string;
  want_detailed_report?: string;
  name?: string;
  business_name?: string;
  work_email?: string;
  mobile_number?: string;
  contact_preference?: string;
  consent_followup?: boolean;
}

interface ScoreResult {
  score: number;
  band: string;
  summary: string;
  recommendations: string[];
  riskFlags: string[];
}

// ── Scoring engine — /10 scale ────────────────────────────────────────────────

const SCORE_BANDS = [
  { min: 0,  max: 2,  label: "Just Starting",     summary: "You handle people's information but have almost no protections in place. The good news: a few focused steps this week will move you forward fast." },
  { min: 3,  max: 4,  label: "Exposed but Aware",  summary: "You are aware of DPDPA but the basics are still missing. A few quick actions will significantly reduce your risk exposure." },
  { min: 5,  max: 6,  label: "Building Controls",  summary: "You have solid foundations. Now focus on consistency — make sure all teams follow the same rules and your vendor contracts are covered." },
  { min: 7,  max: 8,  label: "Moving Well",        summary: "You are well ahead of most Indian SMEs. The next level is documentation, staff training, and annual compliance reviews." },
  { min: 9,  max: 10, label: "DPDPA Ready",        summary: "Excellent — you have a mature privacy programme in place. Keep it current as the DPDPA Rules are notified and regulations evolve." },
];

const RECOMMENDATIONS: Record<string, string[]> = {
  "Just Starting":     ["Add a privacy notice to your website and all data-collection forms.", "Put a consent checkbox wherever you collect customer or employee details.", "Pick one person in your team to own privacy — even part-time."],
  "Exposed but Aware": ["Write down every type of personal data you collect and where it is stored.", "Check which vendors and third-party tools have access to your data.", "Set a simple rule for how long you keep records — then actually delete old ones."],
  "Building Controls": ["Audit all vendor contracts and add a data-processing clause to each.", "Create a simple breach-response plan — who to call, what to do in 72 hours.", "Run a 30-minute team awareness session so everyone follows the same rules."],
  "Moving Well":       ["Formalise your data mapping into a written record (Data Inventory).", "Review how you handle high-risk data like Aadhaar, health records, or children's data.", "Schedule a quarterly privacy check — 30 minutes to review what has changed."],
  "DPDPA Ready":       ["Monitor DPDPA Rules notifications from MeitY — rules are still being finalised.", "Consider a third-party privacy audit to validate your controls independently.", "Document your compliance posture so it is audit-ready at any time."],
};

const HIGH_RISK_DATA   = ["Financial / KYC documents", "CCTV / Biometric data", "Health-related data", "Children's data"];
const INFORMAL_STORAGE = ["WhatsApp / Email", "Excel / Google Sheets"];

// 10 controls — each worth 1 point, max score = 10
const CONTROL_POINTS: Record<string, number> = {
  "Privacy notice on website or forms":          1,
  "Consent checkbox or consent capture":          1,
  "Access controls / role-based access":          1,
  "Data retention / deletion practice":           1,
  "Vendor / processor clauses in contracts":      1,
  "Incident / breach response process":           1,
  "One person owns privacy / compliance":         1,
  "Employee awareness / data handling training":  1,
  "Data mapping — record of what you collect":    1,
  "Written internal data protection policy":      1,
};

function calculateScore(answers: Answers): ScoreResult {
  const controls = answers.controls_in_place || [];
  let score = controls.reduce((sum, c) => sum + (CONTROL_POINTS[c] || 0), 0);
  score = Math.min(score, 10);

  const band = SCORE_BANDS.find(b => score >= b.min && score <= b.max) || SCORE_BANDS[0];
  const riskFlags: string[] = [];
  (answers.data_types  || []).forEach(dt => { if (HIGH_RISK_DATA.includes(dt))   riskFlags.push(dt); });
  (answers.data_storage|| []).forEach(ds => { if (INFORMAL_STORAGE.includes(ds)) riskFlags.push(ds); });

  return { score, band: band.label, summary: band.summary, recommendations: RECOMMENDATIONS[band.label] || [], riskFlags };
}

// ── State / Options ───────────────────────────────────────────────────────────

const STATES = ["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli and Daman and Diu","Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry"];

// ── Reusable Components ───────────────────────────────────────────────────────

function DropdownSelect({
  options,
  value,
  onChange,
  placeholder,
}: {
  options: string[];
  value?: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <select
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        className={`w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-saffron-400 bg-white appearance-none pr-10 ${
          value ? "text-slate-900" : "text-slate-400"
        }`}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  );
}

function SegmentedControl({
  options,
  value,
  onChange,
}: {
  options: string[];
  value?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`border rounded-lg px-3 py-2 text-sm font-medium transition-all ${
            value === opt
              ? "bg-saffron-500 text-white border-saffron-500"
              : "bg-white text-slate-600 border-slate-200 hover:border-saffron-300"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function MultiSelectChips({
  options,
  values = [],
  onChange,
  placeholder,
  mutuallyExclusive = [],
}: {
  options: string[];
  values?: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
  mutuallyExclusive?: string[];
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleMousedown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleMousedown);
    return () => document.removeEventListener("mousedown", handleMousedown);
  }, []);

  const toggle = (opt: string) => {
    if (mutuallyExclusive.includes(opt)) {
      onChange([opt]);
      return;
    }
    const filtered = values.filter(v => !mutuallyExclusive.includes(v));
    if (filtered.includes(opt)) {
      onChange(filtered.filter(v => v !== opt));
    } else {
      onChange([...filtered, opt]);
    }
  };

  const remove = (opt: string) => {
    onChange(values.filter(v => v !== opt));
  };

  const triggerLabel =
    values.length === 0
      ? placeholder
      : values.length === 1
      ? values[0]
      : `${values.length} selected`;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-saffron-400 bg-white flex items-center justify-between ${
          values.length > 0 ? "text-slate-900" : "text-slate-400"
        }`}
      >
        <span>{triggerLabel}</span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          <div className="max-h-56 overflow-y-auto">
            {options.map(opt => (
              <label
                key={opt}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={values.includes(opt)}
                  onChange={() => toggle(opt)}
                  className="w-4 h-4 accent-saffron-500 shrink-0"
                />
                <span className="text-sm text-slate-700">{opt}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {values.map(v => (
            <span
              key={v}
              className="inline-flex items-center gap-1 bg-saffron-100 text-saffron-800 rounded-full px-2.5 py-0.5 text-xs"
            >
              {v}
              <button
                type="button"
                onClick={() => remove(v)}
                className="hover:text-saffron-600 leading-none"
              >
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Milestone Progress Bar ────────────────────────────────────────────────────

const STEP_MILESTONES = ["Your Business", "Your Data", "Your Readiness", "Get Score"];

function MilestoneBar({ step }: { step: number }) {
  // step is 1-based (1–4 correspond to milestones 0–3)
  const currentIndex = step - 1; // 0-based milestone index

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <span className="text-slate-300 text-xs font-semibold">
          Step {step} of 4 — {STEP_MILESTONES[currentIndex]}
        </span>
      </div>
      <div className="relative flex items-center justify-between">
        {/* Connecting line */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-600" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-saffron-400 transition-all duration-500"
          style={{ width: `${(currentIndex / (STEP_MILESTONES.length - 1)) * 100}%` }}
        />

        {STEP_MILESTONES.map((label, idx) => {
          const completed = idx < currentIndex;
          const current = idx === currentIndex;
          return (
            <div key={label} className="relative flex flex-col items-center z-10">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  completed
                    ? "bg-saffron-500 border-saffron-500"
                    : current
                    ? "bg-white border-saffron-400 ring-2 ring-saffron-400/30"
                    : "bg-slate-700 border-slate-600"
                }`}
              >
                {completed && <CheckCircle size={10} className="text-white" />}
                {current && <div className="w-2 h-2 rounded-full bg-saffron-500" />}
              </div>
              <span
                className={`absolute top-7 text-[10px] font-medium whitespace-nowrap ${
                  completed || current ? "text-saffron-300" : "text-slate-500"
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

const TOTAL_STEPS = 5; // consent, profile, data, preparedness, value-exchange

export default function SurveyClient() {
  const [step, setStep] = useState(0);
  const [consentGiven, setConsentGiven] = useState(false);
  const [privacyExpanded, setPrivacyExpanded] = useState(false);
  const [answers, setAnswers] = useState<Answers>({});
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const set = (key: keyof Answers, value: unknown) => setAnswers(prev => ({ ...prev, [key]: value }));

  const canAdvance = (): boolean => {
    if (step === 0) return consentGiven;
    if (step === 1) return !!(answers.role && answers.employee_size && answers.sector && answers.operating_footprint && answers.state_ut);
    if (step === 2) return !!(answers.digital_personal_data);
    if (step === 3) return !!(answers.controls_in_place?.length && answers.readiness_self_view && answers.biggest_blocker && answers.most_helpful_resource);
    if (step === 4) return !!(answers.want_detailed_report && answers.name && answers.work_email);
    return true;
  };

  const next = () => {
    if (step === 4) { handleSubmit(); return; }
    setStep(s => Math.min(s + 1, TOTAL_STEPS));
  };
  const back = () => setStep(s => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    const scoreResult = calculateScore(answers);
    setResult(scoreResult);

    // Always save to Appwrite regardless of whether user wants a report
    setSubmitting(true);
    try {
      await fetch("/api/survey/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, score: scoreResult }),
      });
    } catch { /* non-blocking */ }
    setSubmitting(false);

    // Track survey completion in GA4
    trackEvent.surveyComplete({
      score:        scoreResult.score,
      band:         scoreResult.band,
      role:         answers.role,
      sector:       answers.sector,
      wants_report: answers.want_detailed_report === "full_report",
    });

    setSubmitted(true);
    setStep(TOTAL_STEPS);
  };

  // ── Step 0: Landing Page ──────────────────────────────────────────────────
  if (step === 0) return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Compact header */}
      <div className="bg-brand-700 py-5">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-2xl font-bold text-white mb-1.5">
            Is your business ready for DPDPA?
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            No legal jargon. Simple questions for Indian small businesses.{" "}
            <span className="text-amber-400 font-semibold">Free — takes 3 minutes.</span>
          </p>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 sm:px-6 py-6 w-full flex flex-col gap-4">
        {/* Privacy Notice — collapsed by default */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={14} className="text-blue-600 shrink-0" />
            <label className="flex items-center gap-2 cursor-pointer flex-1">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={e => setConsentGiven(e.target.checked)}
                className="w-4 h-4 accent-saffron-500"
              />
              <span className="text-blue-800 text-sm font-medium">
                I have read and agree to the Privacy Notice
              </span>
            </label>
            <button
              type="button"
              onClick={() => setPrivacyExpanded(e => !e)}
              className="text-blue-600 text-xs font-medium flex items-center gap-0.5 whitespace-nowrap hover:text-blue-800 transition-colors"
            >
              View details
              <ChevronDown
                size={12}
                className={`transition-transform ${privacyExpanded ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          {privacyExpanded && (
            <div className="border-t border-blue-200 pt-3 mt-1">
              <p className="text-blue-700 text-xs leading-relaxed">
                SaralPrivacy will use your survey answers to understand DPDPA readiness among Indian MSMEs and to generate useful insights.
                If you choose to get your detailed score report at the end, we will use only the contact details you give us — only for that purpose.
                We will never sell your data. You can withdraw your consent at any time.{" "}
                <Link href="/privacy" className="underline text-blue-600">Read our Privacy Notice</Link>.
              </p>
            </div>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={next}
          disabled={!consentGiven}
          className="w-full py-3 bg-saffron-500 text-white font-bold rounded-xl text-base hover:bg-saffron-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          Start Free Readiness Check →
        </button>

        {/* What you get — 2×2 compact grid */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">What you get — free</p>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { icon: "🎯", text: "Your Readiness Score (0–10)" },
              { icon: "📊", text: "Score band + what it means" },
              { icon: "✅", text: "3 actions you can take this week" },
              { icon: "📧", text: "Detailed report by email (optional)" },
            ].map(item => (
              <div key={item.text} className="flex items-start gap-2 bg-slate-50 rounded-xl p-2.5">
                <span className="text-base leading-none mt-0.5">{item.icon}</span>
                <span className="text-xs text-slate-600 leading-snug">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ── Step 5: Results ──────────────────────────────────────────────────────
  if (step === TOTAL_STEPS && result) return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-brand-700 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Your DPDPA Readiness Score</h1>
          <p className="text-slate-300 text-sm">Based on your answers</p>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 sm:px-6 py-10 space-y-5">
        {/* Score card */}
        <div className="bg-white rounded-2xl border-2 border-saffron-200 p-8 text-center">
          <div className="text-6xl font-bold text-saffron-500 mb-1">{result.score}<span className="text-2xl text-slate-400">/10</span></div>
          <div className="inline-block bg-saffron-100 text-saffron-700 font-bold px-4 py-1.5 rounded-full text-sm mb-4">
            {result.band}
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">{result.summary}</p>
        </div>

        {/* Risk flags */}
        {result.riskFlags.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
            <h3 className="font-bold text-red-800 text-sm mb-3">⚠ Higher-risk areas found</h3>
            <ul className="space-y-1.5">
              {result.riskFlags.map(f => (
                <li key={f} className="text-red-700 text-sm flex items-start gap-2">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />{f}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-bold text-brand-700 text-base mb-4">3 things to do this week</h3>
          <div className="space-y-3">
            {result.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-saffron-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                <p className="text-slate-600 text-sm leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Report delivery status */}
        {answers.work_email && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
            <CheckCircle size={24} className="text-green-500 mx-auto mb-2" />
            <p className="text-green-800 font-semibold text-sm">
              {answers.want_detailed_report === "full_report" ? "Your full compliance report is on its way!" : "Your score summary is on its way!"}
            </p>
            <p className="text-green-700 text-xs mt-1">We will send it to <strong>{answers.work_email}</strong> shortly.</p>
          </div>
        )}

        {/* CTA */}
        <div className="bg-brand-700 rounded-2xl p-6 text-center">
          <p className="text-white font-bold text-base mb-2">Want expert help?</p>
          <p className="text-slate-300 text-sm mb-4">Talk to our DPDPA specialists. Free 30-minute consultation.</p>
          <Link
            href="/contact"
            className="inline-block py-3 px-6 bg-saffron-500 text-white font-bold rounded-xl hover:bg-saffron-600 transition-colors text-sm"
          >
            Book Free Consultation →
          </Link>
        </div>

        <div className="text-center">
          <Link href="/" className="text-sm text-slate-500 hover:text-brand-700 transition-colors">
            ← Back to SaralPrivacy home
          </Link>
        </div>
      </div>
    </div>
  );

  // ── Steps 1–4: Survey questions ──────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header with milestone bar */}
      <div className="bg-brand-700 px-4 sm:px-6 pt-6 pb-10">
        <div className="max-w-2xl mx-auto">
          <MilestoneBar step={step} />
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 sm:px-6 py-8 w-full flex-1 pb-24 sm:pb-8">

        {/* ── Step 1: Business Profile ─────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-brand-700 mb-5">Tell us about your business</h2>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">What is your role?</label>
              <DropdownSelect
                options={["Owner / Founder","Director / CXO","Operations / Admin","Finance / Accounts","IT / Security / Digital","HR","Legal / Compliance","Consultant / Advisor","Other"]}
                value={answers.role}
                onChange={v => set("role", v)}
                placeholder="Select your role"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">How many people work in your business?</label>
              <SegmentedControl
                options={["1–10","11–50","51–250","251–500","500+"]}
                value={answers.employee_size}
                onChange={v => set("employee_size", v)}
              />
            </div>

            <div className="border-t border-slate-100 pt-4">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">What does your business do?</label>
              <DropdownSelect
                options={["Manufacturing","Trading / Distribution","Professional Services","IT / SaaS","E-commerce / D2C","Healthcare","Education","Financial Services","Hospitality / Travel","Real Estate","Other"]}
                value={answers.sector}
                onChange={v => set("sector", v)}
                placeholder="Select your industry"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Where do you mainly operate?</label>
              <DropdownSelect
                options={["One city","One state","Multiple states","Pan-India","India + overseas"]}
                value={answers.operating_footprint}
                onChange={v => set("operating_footprint", v)}
                placeholder="Where do you operate?"
              />
            </div>

            <div className="border-t border-slate-100 pt-4">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">State / UT</label>
              <div className="relative">
                <select
                  value={answers.state_ut || ""}
                  onChange={e => set("state_ut", e.target.value)}
                  className={`w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-saffron-400 bg-white appearance-none pr-10 ${
                    answers.state_ut ? "text-slate-900" : "text-slate-400"
                  }`}
                >
                  <option value="">Select your state</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                City / Town <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={answers.city || ""}
                onChange={e => set("city", e.target.value)}
                placeholder="e.g. Pune, Surat, Coimbatore"
                className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-saffron-400 bg-white"
              />
            </div>
          </div>
        )}

        {/* ── Step 2: Data Footprint ────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-brand-700 mb-5">About your data</h2>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Does your business collect or store people's information on a computer or phone?</label>
              <p className="text-xs text-slate-400 mb-2">Like customer phone numbers, employee details, or lead forms</p>
              <SegmentedControl
                options={["Yes, regularly","Yes, sometimes","Very little","No","Not sure"]}
                value={answers.digital_personal_data}
                onChange={v => set("digital_personal_data", v)}
              />
            </div>

            <div
              className={`space-y-5 transition-all duration-300 ${
                answers.digital_personal_data && answers.digital_personal_data !== "No"
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 pointer-events-none h-0 overflow-hidden"
              }`}
            >
              <div className="border-t border-slate-100 pt-4">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">What kind of information do you handle?</label>
                <p className="text-xs text-slate-400 mb-2">Select all that apply</p>
                <MultiSelectChips
                  options={["Customer data","Employee data","Vendor / Partner data","Leads / Website visitor data","Financial / KYC documents","CCTV / Biometric data","Health-related data","Children's data","Other","Not sure"]}
                  values={answers.data_types}
                  onChange={v => set("data_types", v)}
                  placeholder="Select data types"
                  mutuallyExclusive={["Not sure"]}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Where is this information stored?</label>
                <p className="text-xs text-slate-400 mb-2">Select all that apply</p>
                <MultiSelectChips
                  options={["WhatsApp / Email","Excel / Google Sheets","Shared drives / Cloud storage","Website / App forms","ERP / CRM / HRMS","Payroll / Accounting tools","Third-party SaaS tools","Paper records later digitised","Not sure"]}
                  values={answers.data_storage}
                  onChange={v => set("data_storage", v)}
                  placeholder="Select storage methods"
                  mutuallyExclusive={["Not sure"]}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: Preparedness ─────────────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-brand-700 mb-5">What have you already done?</h2>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Which of these are already in place in your business?</label>
              <p className="text-xs text-slate-400 mb-2">Select all that apply</p>
              <MultiSelectChips
                options={["Privacy notice on website or forms","Consent checkbox or consent capture","Access controls / role-based access","Data retention / deletion practice","Vendor / processor clauses in contracts","Incident / breach response process","One person owns privacy / compliance","Employee awareness / data handling training","Data mapping — record of what you collect","Written internal data protection policy","None of these","Not sure"]}
                values={answers.controls_in_place}
                onChange={v => set("controls_in_place", v)}
                placeholder="Select all that apply"
                mutuallyExclusive={["None of these", "Not sure"]}
              />
            </div>

            <div className="border-t border-slate-100 pt-4">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">How ready is your business right now?</label>
              <DropdownSelect
                options={["We have not started","We are only becoming aware of it","We have started a few actions","We have some structure in place","We are mostly prepared","We are confident and operational"]}
                value={answers.readiness_self_view}
                onChange={v => set("readiness_self_view", v)}
                placeholder="How prepared are you?"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">What is your biggest problem right now?</label>
              <DropdownSelect
                options={["Not clear what applies to us","No time","No budget","No internal owner","Too many manual processes","Team awareness is low","Vendor / third-party risk","Need legal or implementation help","Other"]}
                value={answers.biggest_blocker}
                onChange={v => set("biggest_blocker", v)}
                placeholder="What's holding you back?"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">What would help you most right now?</label>
              <DropdownSelect
                options={["Simple readiness checklist","Privacy notice template","Consent wording template","Vendor assessment checklist","Employee awareness material","Expert consultation","Nothing for now"]}
                value={answers.most_helpful_resource}
                onChange={v => set("most_helpful_resource", v)}
                placeholder="What would help most?"
              />
            </div>
          </div>
        )}

        {/* ── Step 4: Value Exchange — two-tier ────────────────────────── */}
        {step === 4 && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-8 h-8 rounded-full bg-saffron-100 text-saffron-600 flex items-center justify-center font-bold text-lg">✓</span>
              <h2 className="text-xl font-bold text-brand-700">Almost done!</h2>
            </div>
            <p className="text-sm text-slate-500">Choose what you'd like — both options are free.</p>

            {/* Tier selection cards */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => set("want_detailed_report", "quick_score")}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  answers.want_detailed_report === "quick_score"
                    ? "border-saffron-500 bg-saffron-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="text-2xl mb-1.5">📊</div>
                <div className="text-sm font-bold text-slate-800">Quick Score</div>
                <div className="text-xs text-slate-500 mt-1 leading-snug">
                  See your score on screen + get a short summary email
                </div>
                <div className="mt-2 text-xs text-saffron-600 font-medium">Name + email only</div>
              </button>

              <button
                type="button"
                onClick={() => set("want_detailed_report", "full_report")}
                className={`text-left p-4 rounded-xl border-2 transition-all relative ${
                  answers.want_detailed_report === "full_report"
                    ? "border-saffron-500 bg-saffron-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="absolute top-3 right-3">
                  <span className="bg-saffron-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Recommended</span>
                </div>
                <div className="text-2xl mb-1.5">📋</div>
                <div className="text-sm font-bold text-slate-800">Full Compliance Report</div>
                <div className="text-xs text-slate-500 mt-1 leading-snug">
                  Score + detailed action plan + sector-specific guidance by email
                </div>
                <div className="mt-2 text-xs text-saffron-600 font-medium">Full contact form</div>
              </button>
            </div>

            {/* Shared: name + email (always required for both tiers) */}
            {answers.want_detailed_report && (
              <div className="space-y-4 border-t border-slate-100 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Your name <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      value={answers.name || ""}
                      onChange={e => set("name", e.target.value)}
                      placeholder="e.g. Rajesh Kumar"
                      className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-saffron-400 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Work email <span className="text-red-400">*</span></label>
                    <input
                      type="email"
                      value={answers.work_email || ""}
                      onChange={e => set("work_email", e.target.value)}
                      placeholder="you@yourbusiness.com"
                      className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-saffron-400 bg-white"
                    />
                  </div>
                </div>

                {/* Full report tier: extra fields */}
                {answers.want_detailed_report === "full_report" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Business name</label>
                        <input
                          type="text"
                          value={answers.business_name || ""}
                          onChange={e => set("business_name", e.target.value)}
                          placeholder="e.g. Kumar Textiles Pvt Ltd"
                          className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-saffron-400 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                          Mobile <span className="text-slate-400 font-normal">(optional)</span>
                        </label>
                        <input
                          type="tel"
                          value={answers.mobile_number || ""}
                          onChange={e => set("mobile_number", e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-saffron-400 bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">How do you prefer to be contacted?</label>
                      <SegmentedControl
                        options={["Email", "WhatsApp", "Phone call", "No preference"]}
                        value={answers.contact_preference}
                        onChange={v => set("contact_preference", v)}
                      />
                    </div>
                  </div>
                )}

                {/* DPDPA consent */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={answers.consent_followup || false}
                      onChange={e => set("consent_followup", e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-saffron-500 shrink-0"
                    />
                    <span className="text-blue-800 text-xs leading-relaxed">
                      I consent to SaralPrivacy using my name and email to send me my DPDPA Readiness results and occasional educational updates. No spam — unsubscribe any time.{" "}
                      <Link href="/privacy" className="underline text-blue-600">Privacy Notice</Link>.
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {error && <p className="text-red-600 text-xs mt-3 text-center">{error}</p>}
      </div>

      {/* Navigation Footer — sticky on mobile, inline on desktop */}
      <div className="sticky bottom-0 bg-white border-t border-slate-100 px-4 py-3 sm:static sm:bg-transparent sm:border-t-0 sm:px-0 sm:pb-8">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <button
            onClick={back}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-700 transition-colors font-medium"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <span className="text-xs text-slate-400 font-medium sm:hidden">
            Step {step} of 4
          </span>

          <button
            onClick={next}
            disabled={!canAdvance() || submitting}
            className="flex items-center gap-2 py-2.5 px-6 bg-saffron-500 text-white font-bold rounded-xl text-sm hover:bg-saffron-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {step === 4 ? (submitting ? "Submitting…" : "Submit & View My Score") : "Next"}
            {step !== 4 && <ArrowRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
