"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Info,
  FileCheck2,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import { caFirmPack } from "@/lib/data/industry-assessment/packs/ca-firms";
import { FlowCrossLink } from "@/components/FlowCrossLink";
import {
  calculateIndustryResult,
  selectedIds,
  type IAAnswers,
  type IAQuestion,
  type IAResult,
  type BucketStatus,
} from "@/lib/data/industry-assessment";

// ── Contextual micro-feedback (UI layer) ─────────────────────────────────────
// Short focus labels for the Data Flow Map deep-link (?bucket=). Keys MUST match
// the CA assessment pack's own bucket keys - which are also what
// lib/data/data-flow/ca-firms declares in `assessmentBuckets`, and what its
// seven hotspots link with. A key that does not match here fails silently: the
// link lands, the banner never renders, and nothing errors. That is exactly what
// was happening before this was wired up.
const BUCKET_FOCUS: Record<string, string> = {
  client_document: "Client documents",
  intake: "How documents reach you",
  storage_access: "Storage & staff access",
  retention: "Retention & deletion",
  vendor_incident: "Vendors & incident readiness",
};

const MICRO_NOTES: Record<string, string> = {
  "q3:whatsapp":
    "Many CA firms use WhatsApp for convenience. The risk starts when documents stay scattered without access, deletion or breach controls.",
  "q3:multiple-no-standard":
    "Unstructured intake across many channels makes access, deletion and breach response much harder to control.",
  "q4:whatsapp":
    "Client documents sitting in WhatsApp chats are hard to secure, review or delete.",
  "q4:multiple-no-ssot":
    "With no single source of truth, you can't reliably answer 'where is this client's data?'",
  "q5:ex-staff":
    "This is a serious control gap. Former-staff access to client files can create high DPDPA exposure.",
  "q5:most-staff":
    "When everyone can open every client folder, that's exposure with good lighting — not collaboration.",
  "q7:indefinite":
    "Keeping PAN, Aadhaar and bank records forever, with no policy or review, turns old files into standing risk.",
  "q8:not-sure-vendors":
    "Vendors and tools that hold client data are part of your processing chain under DPDPA — not just 'tools'.",
  "q10:no-process":
    "Without a breach process you can't meet DPDPA's breach-intimation duty in time, or evidence what you did.",
};

const REQUIRED = caFirmPack.questions.filter((q) => !q.optional);
const TOTAL_REQUIRED = REQUIRED.length;

// ── Small presentational helpers ──────────────────────────────────────────────

function StatusChip({ status }: { status: BucketStatus }) {
  const map: Record<BucketStatus, { cls: string; label: string }> = {
    Low: { cls: "bg-green-50 text-green-700 border-green-200", label: "Low" },
    Moderate: { cls: "bg-gold-50 text-gold-700 border-gold-200", label: "Moderate" },
    High: { cls: "bg-red-50 text-red-700 border-red-200", label: "High" },
  };
  const { cls, label } = map[status];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold", cls)}>
      {status === "Low" ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
      {label}
    </span>
  );
}

function ReadinessGauge({ readiness, color, band }: { readiness: number; color: string; band: string }) {
  const r = 54;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - readiness / 100);
  return (
    <div
      className="relative h-36 w-36 shrink-0"
      role="img"
      aria-label={`DPDPA readiness ${readiness} out of 100. Risk band: ${band}.`}
    >
      <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
        <circle cx="64" cy="64" r={r} fill="none" stroke="#EEF2F7" strokeWidth="12" />
        <circle
          cx="64"
          cy="64"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="motion-safe:transition-[stroke-dashoffset] motion-safe:duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-navy-700">{readiness}</span>
        <span className="text-xs text-slate-500">/ 100</span>
      </div>
    </div>
  );
}

function MiniBar({ label, value, polarity }: { label: string; value: number; polarity: "good-high" | "bad-high" }) {
  // good-high: higher is better (green→red as it drops). bad-high: higher is worse.
  const bad = polarity === "good-high" ? value < 50 : value >= 50;
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-slate-600">
        <span>{label}</span>
        <span className="font-bold">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn("h-full rounded-full motion-safe:transition-all motion-safe:duration-700", bad ? "bg-gold-400" : "bg-green-500")}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

// ── Main client ───────────────────────────────────────────────────────────────

export default function CAAssessmentClient() {
  const router = useRouter();
  // ?bucket= arrives from a Data Flow Map hotspot: it focuses the scan on the
  // control the visitor just read about. An unknown or absent value simply
  // yields no banner, so a hand-edited URL degrades cleanly.
  const searchParams = useSearchParams();
  const focusLabel = BUCKET_FOCUS[searchParams.get("bucket") ?? ""];
  const questions = caFirmPack.questions;
  // The marketing page (/industries/ca-firms) is the landing — open directly on Q1.
  const [phase, setPhase] = useState<"quiz" | "result">("quiz");
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<IAAnswers>({});
  const [result, setResult] = useState<IAResult | null>(null);

  // Fire the funnel "start" event on mount (no landing screen to gate it now).
  useEffect(() => {
    trackEvent.assessmentStart();
  }, []);

  // Lead capture
  const [reportUnlocked, setReportUnlocked] = useState(false);
  const [form, setForm] = useState({ name: "", firm: "", email: "", phone: "", consent: false });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hpUrl, setHpUrl] = useState(""); // honeypot — empty for real users

  const q = questions[qIndex];
  const isOptional = !!q?.optional;
  const requiredPos = q && !isOptional ? REQUIRED.findIndex((x) => x.id === q.id) + 1 : 0;
  const answeredRequired = REQUIRED.filter((x) => selectedIds(answers[x.id]).length > 0).length;
  const progress = Math.round((answeredRequired / TOTAL_REQUIRED) * 100);
  const hasAnswer = q ? selectedIds(answers[q.id]).length > 0 : false;
  const canAdvance = isOptional || hasAnswer;
  const isLast = qIndex === questions.length - 1;

  function pick(question: IAQuestion, optId: string) {
    setAnswers((prev) => {
      if (question.type === "single") return { ...prev, [question.id]: optId };
      const current = selectedIds(prev[question.id]);
      const exclusive = question.mutuallyExclusive ?? [];
      let next: string[];
      if (exclusive.includes(optId)) {
        next = current.includes(optId) ? [] : [optId]; // toggle exclusive, clear others
      } else {
        next = current.includes(optId)
          ? current.filter((id) => id !== optId)
          : [...current.filter((id) => !exclusive.includes(id)), optId]; // clear exclusives
      }
      return { ...prev, [question.id]: next };
    });
  }

  function next() {
    if (isLast) {
      const r = calculateIndustryResult(caFirmPack, answers);
      setResult(r);
      setPhase("result");
      trackEvent.assessmentComplete({ score: r.readinessScore, band: r.band, industry: "ca-firms" });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const ni = qIndex + 1;
    setQIndex(ni);
    if (ni === 3 || ni === 6) trackEvent.assessmentStep(ni);
  }

  function back() {
    if (qIndex === 0) router.push("/industries/ca-firms");
    else setQIndex((i) => i - 1);
  }

  async function unlockReport(e: FormEvent) {
    e.preventDefault();
    if (!result || submitting) return;
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setFormError("Please add your name, email and phone so we can send your report.");
      return;
    }
    if (!form.consent) {
      setFormError("Please tick the consent box so we can email your results.");
      return;
    }
    setFormError("");
    setSubmitting(true);
    trackEvent.reportRequested({ band: result.band, sector: "ca-firms" });

    const payload = JSON.stringify({
      email: form.email.trim(),
      name: form.name.trim(),
      business: form.firm.trim(),
      mobile: form.phone.trim(),
      industry: "ca-firms",
      report_type: "ca-firm",
      answers,
      result: {
        finalScore: result.readinessScore,
        rawScore: result.riskScore,
        verdictBand: result.band,
        verdictDescription: result.bandDescription,
        dataExposure: result.dataExposure,
        controlMaturity: result.controlMaturity,
        operationalReadiness: 0,
        categoryScores: result.bucketScores,
        redFlagsTriggered: result.redFlags,
        immediateActions: result.recommendations,
        thirtyDayActions: [],
      },
      consentReport: true,
      consentNewsletter: false,
      consentFollowup: false,
      hp_url: hpUrl,
    });

    // Retry transient failures so a network/DB blip doesn't lose the lead.
    // Answers stay in React state throughout, so nothing is lost.
    let saved = false;
    for (let attempt = 1; attempt <= 3 && !saved; attempt++) {
      try {
        const res = await fetch("/api/assessment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
        });
        if (res.ok) {
          saved = true;
        } else if (res.status === 429) {
          const wait = Number(res.headers.get("Retry-After")) || 2;
          await new Promise((r) => setTimeout(r, Math.min(wait, 5) * 1000));
        } else {
          await new Promise((r) => setTimeout(r, attempt * 800));
        }
      } catch {
        await new Promise((r) => setTimeout(r, attempt * 800));
      }
    }

    setSubmitting(false);
    if (saved) {
      setReportUnlocked(true);
    } else {
      setFormError("We couldn't save your results just now. Please try again — your answers are safe.");
    }
  }

  function retake() {
    setAnswers({});
    setResult(null);
    setReportUnlocked(false);
    setForm({ name: "", firm: "", email: "", phone: "", consent: false });
    setFormError("");
    setSubmitting(false);
    setHpUrl("");
    setQIndex(0);
    setPhase("quiz");
  }

  const servicePrefill = useMemo(() => {
    const ids = selectedIds(answers["q1"]);
    return caFirmPack.questions
      .find((x) => x.id === "q1")!
      .options.filter((o) => ids.includes(o.id) && o.id !== "not-sure")
      .map((o) => o.label);
  }, [answers]);

  // ── Result ───────────────────────────────────────────────────────────────────
  if (phase === "result" && result) {
    return (
      <div className="min-h-screen bg-pearl-50">
        <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
          {/* Headline + gauge */}
          <div className="rounded-2xl border-2 p-7" style={{ borderColor: result.bandColor }}>
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
              <ReadinessGauge readiness={result.readinessScore} color={result.bandColor} band={result.band} />
              <div className="text-center sm:text-left">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Your CA firm&apos;s result</div>
                <h2 className="mt-1 text-xl font-semibold text-navy-700">
                  DPDPA Readiness: {result.readinessScore} / 100
                </h2>
                <div
                  className="mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold text-white"
                  style={{ backgroundColor: result.bandColor }}
                >
                  Risk Band: {result.band}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{caFirmPack.bandCopy?.[result.band] ?? result.bandDescription}</p>
              </div>
            </div>
          </div>

          {/* Two-lens */}
          <div className="mt-5 grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
            <MiniBar label="Data exposure" value={result.dataExposure} polarity="bad-high" />
            <MiniBar label="Control maturity" value={result.controlMaturity} polarity="good-high" />
          </div>

          {/* Top red flags */}
          {result.redFlags.length > 0 && (
            <div className="mt-5 rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="mb-3 text-sm font-semibold text-navy-700">Top {result.redFlags.length} risk areas</h3>
              <ul className="space-y-2.5">
                {result.redFlags.map((flag, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0 text-gold-500" />
                    {flag}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Bucket map */}
          <div className="mt-5 rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="mb-4 text-sm font-semibold text-navy-700">Your CA practice risk map</h3>
            <div className="space-y-4">
              {caFirmPack.buckets.map((b) => (
                <div key={b.key}>
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-navy-700">{b.label}</span>
                    <StatusChip status={result.bucketStatus[b.key]} />
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-navy-400" style={{ width: `${result.bucketScores[b.key]}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{b.meaning}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Gated: recommendations + checklist */}
          {!reportUnlocked ? (
            <form onSubmit={unlockReport} className="mt-5 rounded-xl border border-green-200 bg-green-50 p-6">
              <div className="mb-1 flex items-center gap-2">
                <Lock size={16} className="text-green-800" />
                <h3 className="text-sm font-semibold text-navy-700">Unlock your priority fixes + CA Firm DPDPA Starter Checklist</h3>
              </div>
              <p className="mb-4 text-xs text-slate-600">
                See your recommended next steps and get the checklist emailed to you.
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input aria-label="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                <input aria-label="Firm name" value={form.firm} onChange={(e) => setForm({ ...form, firm: e.target.value })} placeholder="Firm name" className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                <input aria-label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                <input aria-label="Phone or WhatsApp" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone / WhatsApp" className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              {servicePrefill.length > 0 && (
                <p className="mt-2 text-xs text-slate-500">Services: {servicePrefill.join(" · ")}</p>
              )}
              <label className="mt-3 flex items-start gap-2 text-xs text-slate-600">
                <input type="checkbox" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} className="mt-0.5" />
                <span>
                  I agree to receive my assessment results and related resources. See our{" "}
                  <Link href="/privacy" className="text-green-800 underline">Privacy Notice</Link>.
                </span>
              </label>
              {/* Honeypot — hidden from users, only bots fill it */}
              <input
                type="text"
                name="hp_url"
                value={hpUrl}
                onChange={(e) => setHpUrl(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="hidden"
              />
              {formError && <p className="mt-2 text-xs font-medium text-red-600">{formError}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="mt-4 w-full rounded-lg bg-green-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Saving your results…" : "Show my priority fixes"}
              </button>
            </form>
          ) : (
            <div className="mt-5 rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="mb-3 text-sm font-semibold text-navy-700">Your priority fixes</h3>
              <ul className="space-y-2.5">
                {result.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">{i + 1}</span>
                    {rec}
                  </li>
                ))}
              </ul>
              <a
                href={caFirmPack.leadMagnet!.href}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-navy-200 px-4 py-2.5 text-sm font-semibold text-navy-700 hover:bg-pearl-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-400"
              >
                <FileCheck2 size={16} /> Download the {caFirmPack.leadMagnet!.title}
              </a>
            </div>
          )}

          {/* Primary CTA */}
          <div className="mt-5 rounded-xl bg-navy-700 p-6">
            <h3 className="text-sm font-semibold text-white">Get a CA Firm DPDPA Gap Review</h3>
            <p className="mb-4 mt-1 text-sm text-slate-300">
              We&apos;ll review your client document flows, Google Drive / email / WhatsApp usage, staff access, vendor exposure and retention practices.
            </p>
            <Link
              href="/contact"
              onClick={() => trackEvent.callBookingClicked({ band: result.band, location: "ca-assessment-result" })}
              className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-600"
            >
              Book a CA Firm Gap Review <ArrowRight size={16} />
            </Link>
          </div>

          <FlowCrossLink sectorSlug={caFirmPack.industry} source="assessment" className="mt-5" />

          <button onClick={retake} className="mt-4 w-full text-center text-sm text-slate-500 underline hover:text-slate-700">
            Retake the scan
          </button>
        </div>
      </div>
    );
  }

  // ── Quiz ──────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-pearl-50">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        {/* Context strip — the marketing page is the landing; this just anchors the scan */}
        <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-teal-800">
          <ShieldCheck size={16} /> {caFirmPack.positioning.title}
          <span className="font-normal text-slate-400">· {caFirmPack.positioning.microline}</span>
        </div>

        {/* Progress */}
        <div className="mb-7">
          <div className="mb-2 flex items-center justify-between text-sm text-slate-500">
            <span>{isOptional ? "Quick start · optional" : `Question ${requiredPos} of ${TOTAL_REQUIRED}`}</span>
            <span className="font-semibold text-green-800">{progress}% complete</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-green-500 motion-safe:transition-all motion-safe:duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {focusLabel && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900">
            <Info size={16} className="shrink-0 text-teal-600" aria-hidden="true" />
            <span>
              You&apos;re checking: <span className="font-semibold">{focusLabel}</span>. Answer the
              full scan to see how your controls hold up.
            </span>
          </div>
        )}

        {/* Question */}
        <fieldset className="rounded-xl border border-slate-200 bg-white p-6 sm:p-7">
          <div className="mb-3 inline-block rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">{q.badge}</div>
          <legend className="contents">
            <h2 className="text-lg font-semibold leading-snug text-navy-700 sm:text-xl">{q.question}</h2>
          </legend>
          {q.helpText && <p className="mt-2 text-sm leading-relaxed text-slate-500">{q.helpText}</p>}
          {q.type === "multi" && <p className="mt-1 text-xs font-medium text-slate-400">Select all that apply.</p>}

          <div className="mt-5 space-y-3">
            {q.options.map((opt) => {
              const isSel = selectedIds(answers[q.id]).includes(opt.id);
              const note = isSel ? MICRO_NOTES[`${q.id}:${opt.id}`] : undefined;
              return (
                <div key={opt.id}>
                  <label className="block cursor-pointer">
                    <input
                      type={q.type === "single" ? "radio" : "checkbox"}
                      name={q.id}
                      value={opt.id}
                      checked={isSel}
                      onChange={() => pick(q, opt.id)}
                      className="peer sr-only"
                    />
                    <div className="flex items-start gap-3 rounded-xl border-2 border-slate-200 p-4 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 peer-checked:border-green-400 peer-checked:bg-green-50 peer-checked:text-green-800 peer-focus-visible:ring-2 peer-focus-visible:ring-green-500 peer-focus-visible:ring-offset-1">
                      <span
                        className={cn(
                          "mt-0.5 h-4 w-4 shrink-0 border-2 border-slate-300",
                          q.type === "single" ? "rounded-full" : "rounded",
                          isSel && "border-green-500 bg-green-500"
                        )}
                        aria-hidden
                      />
                      <span className="flex-1">{opt.label}</span>
                      {opt.badge && (
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                            opt.badgeColor === "red" && "bg-red-50 text-red-700",
                            opt.badgeColor === "amber" && "bg-gold-50 text-gold-700",
                            opt.badgeColor === "green" && "bg-green-50 text-green-700"
                          )}
                        >
                          {opt.badge}
                        </span>
                      )}
                    </div>
                  </label>
                  {note && (
                    <div className="mt-2 flex items-start gap-2 rounded-lg bg-gold-50 p-3 text-xs text-gold-800">
                      <Info size={14} className="mt-0.5 shrink-0" />
                      {note}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {q.whyThisMatters && (
            <details className="mt-5 rounded-lg bg-pearl-100 p-4">
              <summary className="cursor-pointer text-sm font-medium text-navy-700">Why this matters</summary>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{q.whyThisMatters}</p>
            </details>
          )}
        </fieldset>

        {/* Nav */}
        <div className="mt-6 flex items-center justify-between">
          <button onClick={back} className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900">
            <ArrowLeft size={16} /> Back
          </button>
          <div className="flex items-center gap-3">
            {isOptional && !hasAnswer && (
              <button onClick={next} className="text-sm font-medium text-slate-500 underline hover:text-slate-700">
                Skip
              </button>
            )}
            <button
              onClick={next}
              disabled={!canAdvance}
              className="inline-flex items-center gap-2 rounded-lg bg-navy-700 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-400 focus-visible:ring-offset-2"
            >
              {isLast ? "See my results" : "Next"} <ArrowRight size={16} />
            </button>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-slate-400">All responses are confidential. This scan is educational and not legal advice.</p>
      </div>
    </div>
  );
}
