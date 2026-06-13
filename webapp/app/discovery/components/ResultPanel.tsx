"use client";
import { useState } from "react";
import Gauge from "./Gauge";
import { bandColor } from "@/lib/discovery/engine";
import { getNiche } from "@/lib/discovery/data";
import { checklistFor } from "@/lib/discovery/checklist-map";
import type { ScoreResult } from "@/lib/discovery/types";

const VERDICTS: Record<string, string> = {
  Low: "Your controls look proportionate to the data you hold. Keep them documented and current.",
  Moderate: "A few gaps are widening your exposure. Most are quick, practical fixes.",
  High: "Several high-value data areas are running without enough safeguards. Worth acting on soon.",
  Critical: "You hold sensitive, high-value data with weak safeguards. This is the priority to fix.",
};

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function narrative(nicheId: string, r: ScoreResult): string {
  const n = getNiche(nicheId);
  const cats = r.categories.slice(0, 6);
  const catText = cats.length
    ? cats.slice(0, -1).join(", ") + (cats.length > 1 ? " and " : "") + cats[cats.length - 1]
    : "personal data";
  const hid = r.hiddenSelected.map((h) => h.item.toLowerCase());
  let hidText = "";
  if (hid.length) {
    const top = hid.slice(0, 5);
    hidText =
      " Your biggest hidden risk areas sit in " +
      (top.length > 1 ? top.slice(0, -1).join(", ") + " and " + top[top.length - 1] : top[0]) +
      ".";
  }
  return `${n?.name ?? "Businesses like yours"} typically work with several categories of digital personal data — ${catText}.${hidText}`;
}

type Stage = "cta" | "form" | "sent";

export default function ResultPanel({
  nicheId,
  result,
  onRestart,
}: {
  nicheId: string;
  result: ScoreResult;
  onRestart: () => void;
}) {
  const r = result;
  const color = bandColor(r.riskBand);
  const n = getNiche(nicheId);
  const nicheName = n?.name ?? "your business";
  const checklist = checklistFor(nicheId);

  const [stage, setStage] = useState<Stage>("cta");
  const [form, setForm] = useState({
    businessName: "",
    contactName: "",
    phone: "",
    employees: "",
    email: "",
    consentBriefings: false,
  });
  const [emailErr, setEmailErr] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setApiError(null);
    if (!EMAIL_RE.test(form.email)) {
      setEmailErr(true);
      return;
    }
    setEmailErr(false);
    setSubmitting(true);
    try {
      const res = await fetch("/api/template-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: form.businessName,
          employees: form.employees,
          contactName: form.contactName,
          phone: form.phone,
          email: form.email,
          consentContact: true,
          consentBriefings: form.consentBriefings,
          templateName: checklist.templateName,
          source: "discovery",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        // Deliver the checklist as a client-side download (same as the template gate).
        const a = document.createElement("a");
        a.href = checklist.pdfPath;
        a.download = `${checklist.templateName}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setStage("sent");
      } else {
        setApiError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setApiError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="result">
      {/* Bold headline result band */}
      <div className="result-hero" style={{ ["--band" as string]: color }}>
        <div className="rh-left">
          <div className="rh-eyebrow">Your DPDP data-risk read</div>
          <div className="rh-headline">
            <span className="rh-band" style={{ color }}>{r.riskBand}</span>
            <span className="rh-risk"> risk</span>
          </div>
          <p className="rh-verdict">{VERDICTS[r.riskBand]}</p>
          <div className="rh-meta">
            <span className="rh-conf">Confidence: <strong>{r.confidence}</strong></span>
            <span className="rh-dot" aria-hidden="true">·</span>
            <span>{nicheName} · benchmarked across 276 business types</span>
          </div>
        </div>
        <div className="rh-right">
          <Gauge score={r.final} band={r.riskBand} />
          <div className="rh-fixes">
            <span className="rh-fixnum" style={{ color }}>{r.fixCount}</span>
            <span className="rh-fixlbl">prioritized fixes<br />to act on</span>
          </div>
        </div>
      </div>

      {/* Metric-delta grid */}
      <div className="metric-grid">
        <div className="metric">
          <div className="metric-top">
            <span className="metric-num">{r.selectedCount}</span>
            <span className="metric-of">of {r.totalCount}</span>
          </div>
          <div className="metric-lbl">personal-data items you confirmed</div>
          <div className="metric-bar">
            <span style={{ width: (r.totalCount ? (r.selectedCount / r.totalCount) * 100 : 0) + "%" }} />
          </div>
        </div>
        <div className="metric">
          <div className="metric-top">
            <span className="metric-num" style={{ color: r.hiddenSelected.length ? "#E8704A" : "#07B981" }}>
              {r.hiddenSelected.length}
            </span>
            <span className="metric-of">of {r.hiddenAvailable}</span>
          </div>
          <div className="metric-lbl">often-missed data points in play</div>
          <div className="metric-bar hid">
            <span style={{ width: (r.hiddenAvailable ? (r.hiddenSelected.length / r.hiddenAvailable) * 100 : 0) + "%" }} />
          </div>
        </div>
        <div className="metric">
          <div className="metric-top"><span className="metric-num">{r.categories.length}</span></div>
          <div className="metric-lbl">categories of personal data</div>
          <div className="metric-sub">across customer, staff &amp; premises records</div>
        </div>
        <div className="metric accent">
          <div className="metric-top"><span className="metric-num" style={{ color }}>{r.highValueCount}</span></div>
          <div className="metric-lbl">high-value items needing safeguards</div>
          <div className="metric-sub">financial, health, children’s or biometric data</div>
        </div>
      </div>

      <p className="result-narrative">{narrative(nicheId, r)}</p>

      <div className="result-cols">
        <div className="rc">
          <h4 className="rc-h">Personal data you’re working with</h4>
          <div className="cat-chips">
            {r.categories.map((c) => (
              <span className="cat-chip" key={c}>{c}</span>
            ))}
          </div>
          {r.obligations.length > 0 && (
            <>
              <h4 className="rc-h" style={{ marginTop: 18 }}>DPDPA duties this triggers</h4>
              <div className="oblig-row">
                {r.obligations.map((o) => (
                  <span className={"oblig-chip" + (o.startsWith("Children") ? " child" : "")} key={o}>
                    {o}
                  </span>
                ))}
              </div>
            </>
          )}
          {r.hiddenSelected.length > 0 && (
            <div className="hidden-box" style={{ marginTop: 16 }}>
              <div className="hidden-h">Often-missed data you flagged</div>
              <ul>
                {r.hiddenSelected.map((h) => (
                  <li key={h.id}>{h.item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="rc">
          <h4 className="rc-h">Your top {r.precautions.length} precautions</h4>
          <ol className="precs">
            {r.precautions.map((p, i) => (
              <li key={i}>
                <span className="prec-n">{i + 1}</span>
                <span>{p}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="result-exposure">
        <span className="exp-icon" aria-hidden="true">▣</span>
        <p>
          Potential regulatory exposure may arise where reasonable security safeguards, notice, consent, breach
          response, or children’s data obligations are weak. This snapshot is a practical starting point, not a legal
          opinion.
        </p>
      </div>

      {/* Lead-gated checklist download (dedicated packs) → reuses /api/template-download.
          Generic niches (no dedicated PDF) route straight to the full assessment. */}
      <div className="result-cta">
        {stage === "cta" && checklist.dedicated && (
          <div className="cta-split">
            <div>
              <h3>Want a head start on the fixes?</h3>
              <p>
                Download the {nicheName.toLowerCase()} DPDPA starter checklist — a printable, step-by-step list to close
                these gaps. Free.
              </p>
            </div>
            <button type="button" className="btn-primary" onClick={() => setStage("form")}>
              Get the checklist
            </button>
          </div>
        )}

        {stage === "cta" && !checklist.dedicated && (
          <div className="cta-split">
            <div>
              <h3>Ready to go deeper?</h3>
              <p>
                Take the full SaralPrivacy readiness assessment for a scored, industry-specific report — your gaps
                prioritised and a trust signal you can show customers.
              </p>
            </div>
            <a className="btn-primary" href="/assessment">
              Take the full assessment
            </a>
          </div>
        )}

        {stage === "form" && (
          <form className="cta-form" onSubmit={submit} noValidate>
            <div>
              <h3>A few details to unlock your checklist</h3>
              <p>Your snapshot stays on screen. The {nicheName.toLowerCase()} checklist PDF downloads right after.</p>
            </div>
            <div className="cta-form-grid">
              <div className={"cta-field" + (emailErr ? " invalid" : "")}>
                <label htmlFor="d-email">Work email</label>
                <input
                  id="d-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => {
                    set("email", e.target.value);
                    if (emailErr) setEmailErr(false);
                  }}
                  placeholder="you@company.com"
                  aria-invalid={emailErr}
                  aria-describedby={emailErr ? "d-email-err" : undefined}
                  required
                />
                {emailErr && (
                  <span className="field-err" id="d-email-err">
                    Please enter a valid email address.
                  </span>
                )}
              </div>
              <div className="cta-field">
                <label htmlFor="d-biz">Business name</label>
                <input id="d-biz" value={form.businessName} onChange={(e) => set("businessName", e.target.value)} required />
              </div>
              <div className="cta-field">
                <label htmlFor="d-name">Your name</label>
                <input id="d-name" value={form.contactName} onChange={(e) => set("contactName", e.target.value)} required />
              </div>
              <div className="cta-field">
                <label htmlFor="d-phone">Phone</label>
                <input id="d-phone" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} required />
              </div>
              <div className="cta-field">
                <label htmlFor="d-emp">Team size</label>
                <select id="d-emp" value={form.employees} onChange={(e) => set("employees", e.target.value)} required>
                  <option value="" disabled>Select…</option>
                  <option value="1-10">1–10</option>
                  <option value="11-50">11–50</option>
                  <option value="51-200">51–200</option>
                  <option value="200+">200+</option>
                </select>
              </div>
            </div>
            <label className="cta-consent">
              <input
                type="checkbox"
                checked={form.consentBriefings}
                onChange={(e) => set("consentBriefings", e.target.checked)}
              />
              <span>Also send me SaralPrivacy’s practical DPDPA briefings (optional, unsubscribe anytime).</span>
            </label>
            {apiError && <div className="form-error" role="alert">{apiError}</div>}
            <div>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? "Preparing download…" : "Download the checklist"}
              </button>
            </div>
          </form>
        )}

        {stage === "sent" && (
          <div className="cta-sent">
            <div className="sent-tick" aria-hidden="true">✓</div>
            <div>
              <h3>Your checklist is downloading.</h3>
              <p>
                Check your downloads for the {nicheName.toLowerCase()} starter checklist. Ready to close these gaps for
                good? Take the full SaralPrivacy readiness assessment and turn this snapshot into a tracked,
                evidence-backed plan.
              </p>
            </div>
            <a className="btn-primary" href="/assessment">
              Take the full assessment
            </a>
          </div>
        )}
      </div>

      <button type="button" className="result-restart" onClick={onRestart}>
        ↺ Start over with a different business type
      </button>
    </div>
  );
}
