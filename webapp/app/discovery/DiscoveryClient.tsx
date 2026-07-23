"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import IndustryPicker from "./components/IndustryPicker";
import DataReview from "./components/DataReview";
import ControlQuestions from "./components/ControlQuestions";
import ResultPanel from "./components/ResultPanel";
import { getNiche, getCategory } from "@/lib/discovery/data";
import { resolveGroups, score } from "@/lib/discovery/engine";
import type { Answers } from "@/lib/discovery/types";

const LS = "sp_discovery_v1";
const STEPS = ["Business type", "Your data", "3 questions", "Your snapshot"];
const QUICK = ["diagnostic-labs", "d2c-brands", "ca-firms", "recruitment-staffing", "schools"];

interface Saved {
  step?: number;
  niche?: string | null;
  industry?: string | null;
  selected?: string[];
  answers?: Answers;
}
function loadState(): Saved {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(LS) || "{}");
  } catch {
    return {};
  }
}

export default function DiscoveryClient() {
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState(0);
  const [niche, setNiche] = useState<string | null>(null);
  const [industry, setIndustry] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [answers, setAnswers] = useState<Answers>({});

  // hydrate from localStorage after mount (avoids SSR mismatch); guard stale niche
  useEffect(() => {
    const s = loadState();
    if (s.niche && getNiche(s.niche)) {
      setNiche(s.niche);
      setIndustry(s.industry || getNiche(s.niche)?.cat || null);
      setSelected(new Set(s.selected || []));
      setAnswers(s.answers || {});
      setStep(Math.min(s.step ?? 0, 3));
    } else if (s.industry && getCategory(s.industry)) {
      setIndustry(s.industry);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(LS, JSON.stringify({ step, niche, industry, selected: [...selected], answers }));
    } catch {
      /* ignore quota / privacy-mode errors */
    }
  }, [ready, step, niche, industry, selected, answers]);

  // On step change, bring the tool back into view so the new step (esp. the 3
  // questions and the result) starts at the top — not scrolled past. Skips the
  // initial mount so we don't yank a returning visitor around on load.
  const firstStep = useRef(true);
  useEffect(() => {
    if (firstStep.current) { firstStep.current = false; return; }
    document.getElementById("tool")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  function pickIndustry(catId: string) {
    setIndustry(catId);
    setNiche(null);
    setSelected(new Set());
    setAnswers({});
  }

  function pickNiche(id: string) {
    setNiche(id);
    setIndustry(getNiche(id)?.cat ?? null);
    // default-select per the data sheet's Default Selected flags (Core + Operational)
    const def = new Set<string>();
    resolveGroups(id).forEach((g) => g.items.forEach((i) => i.def && def.add(i.id)));
    setSelected(def);
    setAnswers({});
  }

  const result = useMemo(() => {
    if (step < 3 || !niche) return null;
    return score(niche, selected, answers);
  }, [step, niche, selected, answers]);

  const canNext =
    step === 0 ? !!niche
    : step === 1 ? selected.size > 0
    : step === 2 ? !!(answers.q1 && answers.q2 && answers.q3)
    : true;

  const nicheObj = niche ? getNiche(niche) : null;
  const catName = nicheObj ? getCategory(nicheObj.cat)?.name : "";

  function restart() {
    setStep(0);
    setNiche(null);
    setIndustry(null);
    setSelected(new Set());
    setAnswers({});
  }

  if (!ready) return <div className="tool-loading">Loading the discovery tool…</div>;

  return (
    <div className="tool">
      <ol className="stepper">
        {STEPS.map((s, i) => (
          <li key={i} className={"step" + (i === step ? " active" : "") + (i < step ? " done" : "")}>
            <button
              type="button"
              className="step-dot"
              disabled={i >= step}
              aria-current={i === step ? "step" : undefined}
              onClick={() => i < step && setStep(i)}
            >
              {i < step ? "✓" : i + 1}
            </button>
            <span className="step-label">{s}</span>
            {i < STEPS.length - 1 && <span className="step-line" aria-hidden="true" />}
          </li>
        ))}
      </ol>

      <div className="tool-body">
        {step === 0 && (
          <div className="step-pane">
            <h3 className="pane-h">What kind of business is this?</h3>
            <p className="pane-sub">
              Choose your industry, then your business type. We’ll pre-fill the personal data a business like yours
              usually holds — no blank forms.
            </p>
            <IndustryPicker value={niche} industry={industry} onIndustry={pickIndustry} onPick={pickNiche} />
            <div className="picker-hint">
              <span>Jump to a popular type:</span>
              {QUICK.map((id) => {
                const nm = getNiche(id);
                return nm ? (
                  <button type="button" key={id} className="quick-chip" onClick={() => pickNiche(id)}>
                    {nm.name}
                  </button>
                ) : null;
              })}
            </div>
          </div>
        )}

        {step === 1 && niche && nicheObj && (
          <div className="step-pane">
            <div className="pane-context">
              <span className="ctx-tag">{catName}</span>
              <h3 className="pane-h">{nicheObj.name} — confirm the data you handle</h3>
            </div>
            <DataReview niche={niche} selected={selected} setSelected={setSelected} />
          </div>
        )}

        {step === 2 && niche && (
          <div className="step-pane">
            <h3 className="pane-h">A few questions about how you handle it</h3>
            <ControlQuestions niche={niche} answers={answers} setAnswers={setAnswers} />
          </div>
        )}

        {step === 3 && niche && result && (
          <div className="step-pane">
            <ResultPanel nicheId={niche} result={result} selected={selected} onRestart={restart} />
          </div>
        )}
      </div>

      {step < 3 && (
        <div className="tool-nav">
          {step > 0 ? (
            <button type="button" className="btn-ghost" onClick={() => setStep(step - 1)}>
              ← Back
            </button>
          ) : (
            <span className="nav-note">Free · no email needed to see your result</span>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {step === 1 && selected.size === 0 && (
              <span className="nav-hint">Select at least one data item to continue</span>
            )}
            <button type="button" className="btn-primary" disabled={!canNext} onClick={() => setStep(step + 1)}>
              {step === 2 ? "See my risk snapshot" : "Continue"} →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
