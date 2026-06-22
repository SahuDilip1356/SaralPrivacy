"use client";
import { useEffect, useRef, useState } from "react";
import {
  DATA_GROUPS, SENSITIVE, DATA_PURPOSE, CONTEXTS, VENDORS, CHILD_WHY, SECTORS, consentBlocks,
} from "@/lib/notice-pack/data";
import {
  buildNotice, score, band, flags, isVague, slugify, miniFor, evidence, rightsBlock, newNoticeId, sha256,
} from "@/lib/notice-pack/engine";
import { track } from "@/lib/notice-pack/track";
import type { NPState } from "@/lib/notice-pack/types";

const SHOW_HINDI = false; // Hindi output is partial — hidden until fully translated (spec S6)
const LS_KEY = "np_state_v1";
const HONEYPOT = "hp_url";

const INITIAL: NPState = {
  org: "", website: "", sector: "", data: [], contexts: [], purpose: {},
  consentVia: "", withdrawMethod: "", withdrawContact: "", vendors: [], noVendors: false,
  children: "", childWhy: [], retention: "", cName: "", cEmail: "", cPhone: "", slug: "", lang: "en",
};

const WarnIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#B98A1E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v4M12 17h.01" /><path d="M10.3 3.9 2 18a2 2 0 0 0 1.7 3h16.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /></svg>
);
const emailOk = (e: string) => /\S+@\S+\.\S+/.test(e);

type Pending = { kind: "pdf" | "copyFull" | "copyText"; text?: string } | null;

export default function NoticePackClient() {
  const [S, setS] = useState<NPState>(INITIAL);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [gateDone, setGateDone] = useState(false);
  const [pending, setPending] = useState<Pending>(null);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [noticeId, setNoticeId] = useState("");
  const [hash, setHash] = useState("");
  const hydrated = useRef(false);
  const hpRef = useRef<HTMLInputElement>(null);
  const gateEmailRef = useRef<HTMLInputElement>(null);

  // ── persistence: restore once on mount, then save on change ──
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const o = JSON.parse(saved);
        if (o.S) setS(o.S);
        if (typeof o.step === "number") setStep(o.step);
      }
    } catch { /* ignore */ }
    setNoticeId(newNoticeId());
    track("notice_builder_started");
    hydrated.current = true;
  }, []);
  useEffect(() => {
    if (!hydrated.current) return;
    try { localStorage.setItem(LS_KEY, JSON.stringify({ S, step })); } catch { /* ignore */ }
  }, [S, step]);

  // ── real evidence hash, recomputed for the result view ──
  useEffect(() => {
    if (!done) return;
    let live = true;
    sha256(buildNotice(S, S.lang)).then((h) => { if (live) setHash(h); });
    return () => { live = false; };
  }, [done, S]);

  const update = (patch: Partial<NPState>) => setS((p) => ({ ...p, ...patch }));
  const toggle = (field: "data" | "contexts" | "vendors" | "childWhy", val: string) =>
    setS((p) => {
      const arr = p[field];
      const has = arr.includes(val);
      const next = has ? arr.filter((x) => x !== val) : [...arr, val];
      const patch: Partial<NPState> = { [field]: next } as Partial<NPState>;
      if (field === "data" && !has && !(val in p.purpose)) patch.purpose = { ...p.purpose, [val]: DATA_PURPOSE[val] || "" };
      return { ...p, ...patch };
    });
  const applySector = (key: string) => {
    setS((p) => {
      const sec = SECTORS.find((s) => s.key === key);
      if (!sec) return { ...p, sector: key };
      const purpose: Record<string, string> = {};
      sec.data.forEach((d) => (purpose[d] = DATA_PURPOSE[d] || ""));
      return { ...p, sector: key, data: [...sec.data], contexts: [...sec.contexts], vendors: [...sec.vendors], noVendors: false, children: sec.children ? "Yes" : "No", purpose };
    });
    if (key) track("business_type_selected", { sector: SECTORS.find((s) => s.key === key)?.label || key });
  };

  const seg = (field: keyof NPState, vals: string[]) => (
    <div className="seg">
      {vals.map((v) => (
        <button key={v} type="button" className={S[field] === v ? "on" : ""} onClick={() => update({ [field]: v } as Partial<NPState>)}>{v}</button>
      ))}
    </div>
  );
  const radio = (field: keyof NPState, vals: string[]) => (
    <div className="chips">
      {vals.map((v) => (
        <button key={v} type="button" className={`opt ${S[field] === v ? "on" : ""}`} onClick={() => update({ [field]: v } as Partial<NPState>)}>{v}</button>
      ))}
    </div>
  );

  const s = score(S);
  const b = band(s);

  // ── per-step required-field validation ──
  function stepValid(n: number): boolean {
    if (n === 0) return !!(S.org.trim() && S.sector);
    if (n === 1) return S.data.length > 0;
    if (n === 7) return !!(S.cName.trim() && emailOk(S.cEmail));
    return true;
  }
  const stepHint = (n: number): string => {
    if (n === 0 && !stepValid(0)) return "Enter a business name and pick a sector to continue.";
    if (n === 1 && !stepValid(1)) return "Select at least one data category.";
    if (n === 7 && !stepValid(7)) return "Add a grievance contact name and a valid email.";
    return "";
  };

  // ── export / gate ──
  const fullHtml = () =>
    `<!doctype html><meta charset="utf-8"><title>Privacy Notice — ${S.org}</title><div style="font-family:Inter,Arial,sans-serif;max-width:760px;margin:auto;color:#334155;line-height:1.6">${buildNotice(S, S.lang)}</div>`;
  const runPending = (p: Pending) => {
    if (!p) return;
    if (p.kind === "pdf") {
      const w = window.open("", "_blank");
      if (w) { w.document.write(fullHtml()); w.document.close(); w.focus(); setTimeout(() => w.print(), 300); track("notice_pdf_downloaded", { sector: S.sector }); }
      else alert("Please allow pop-ups to download the PDF, or use Copy HTML instead.");
    } else if (p.kind === "copyFull") {
      navigator.clipboard?.writeText(fullHtml()); track("notice_html_copied", { sector: S.sector });
    } else if (p.kind === "copyText") {
      navigator.clipboard?.writeText(p.text || "");
    }
  };
  const requestExport = (kind: "pdf" | "copyFull") => {
    const p: Pending = { kind };
    setPending(p);
    if (unlocked) runPending(p);
    else { setGateDone(false); setGateOpen(true); }
  };
  const onCopyText = (text: string) => {
    const p: Pending = { kind: "copyText", text };
    setPending(p);
    if (unlocked) runPending(p);
    else { setGateDone(false); setGateOpen(true); }
  };
  const submitGate = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Record<string, unknown> = {
      email, business_name: S.org, sector: SECTORS.find((x) => x.key === S.sector)?.label || "",
      readiness_score: s, export_type: pending?.kind === "pdf" ? "pdf" : "copy", source: "notice-generator", consent,
      [HONEYPOT]: hpRef.current?.value || "",
    };
    fetch("/api/notice/capture", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).catch(() => {});
    track("notice_lead_captured", { sector: S.sector, score: s });
    setUnlocked(true);
    setGateDone(true);
    setTimeout(() => { setGateOpen(false); runPending(pending); }, 900);
  };

  const STEP_LABELS = ["Profile", "Data", "Context", "Purpose", "Consent", "Vendors", "Children", "Retention"];

  function LangBar() {
    if (!SHOW_HINDI) return null;
    return (
      <div className="langbar">
        <button className={S.lang === "en" ? "on" : ""} onClick={() => update({ lang: "en" })}>English</button>
        <button className={S.lang === "hi" ? "on" : ""} onClick={() => update({ lang: "hi" })}>हिन्दी</button>
      </div>
    );
  }

  // ── gate modal (focus + Esc + aria) ──
  function Gate() {
    useEffect(() => {
      const prev = document.activeElement as HTMLElement | null;
      gateEmailRef.current?.focus();
      const onKey = (ev: KeyboardEvent) => { if (ev.key === "Escape") setGateOpen(false); };
      document.addEventListener("keydown", onKey);
      return () => { document.removeEventListener("keydown", onKey); prev?.focus?.(); };
    }, []);
    return (
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="np-gate-title" onClick={(e) => { if (e.target === e.currentTarget) setGateOpen(false); }}>
        <div className="modal__card">
          <button className="modal__close" aria-label="Close" onClick={() => setGateOpen(false)}>×</button>
          {!gateDone ? (
            <form onSubmit={submitGate}>
              <h3 id="np-gate-title">Get your Notice Pack</h3>
              <p className="msub">Add your email and we’ll unlock the export and email you a copy you can reopen anytime.</p>
              <input ref={gateEmailRef} type="email" placeholder="Work email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              <input ref={hpRef} type="text" name={HONEYPOT} tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }} />
              <label className="consent"><input type="checkbox" required checked={consent} onChange={(e) => setConsent(e.target.checked)} /> <span>Send me practical DPDPA updates. No spam, unsubscribe anytime.</span></label>
              <button type="submit" className="btn">Unlock my pack <span className="arr">→</span></button>
            </form>
          ) : (
            <div className="ok">
              <span className="seal"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-11" /></svg></span>
              <h3>Unlocked.</h3>
              <p className="msub" style={{ marginBottom: 0 }}>{pending?.kind === "pdf" ? "Your download is starting…" : "Done — your content is on the clipboard."}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── result view ──
  if (done) {
    const cb = consentBlocks(S.org);
    const fl = flags(S);
    const risks = fl.filter((f) => f.severity === "risk");
    const headsUp = fl.filter((f) => f.severity === "info");
    const ev = evidence(S, { noticeId, hash });
    const consents: [string, string][] = [
      ["Service consent", cb.service],
      ["Marketing consent (separate)", cb.marketing],
      ...(S.children === "Yes" ? ([["Parental / guardian consent", cb.parental]] as [string, string][]) : []),
      ["Vendor disclosure", cb.vendor],
    ];
    return (
      <div className="wrap">
        <div className="rhead">
          <div>
            <h1>Your DPDPA Notice Pack is ready</h1>
            <p className="sub">A full notice, contextual mini-notices, consent text, a rights block and an evidence record — assembled from your answers. Review before publishing.</p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="btn btn--ghost btn--sm" onClick={() => setDone(false)}>← Edit answers</button>
            <button className="btn btn--ghost btn--sm" onClick={() => requestExport("copyFull")}>Copy notice HTML</button>
            <button className="btn btn--sm" onClick={() => requestExport("pdf")}>Download PDF</button>
          </div>
        </div>

        <div className="rgrid">
          <div className="rcard">
            <h3>Notice readiness score</h3>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span className="scoreN" style={{ color: b.color }}>{s}</span>
              <span style={{ color: "var(--muted)" }}>/ 100</span>
              <span className="scorechip" style={{ marginLeft: "auto", color: b.color, background: b.bg }}>{b.label}</span>
            </div>
            <div className="scorebar"><i style={{ width: `${s}%`, background: b.color }} /></div>
            <p style={{ fontSize: 13, color: "var(--slate-2)" }}>{b.msg}</p>
          </div>
          <div className="rcard">
            <h3>Risk flags · {risks.length}</h3>
            <div className="flags">
              {risks.length ? risks.map((f, i) => (
                <div className="fl" key={i}><span className="d" style={{ background: f.color }} /><span><b>{f.title}</b> — {f.detail}</span></div>
              )) : <p style={{ fontSize: 13, color: "var(--slate-2)" }}>No outstanding defects.</p>}
            </div>
            {headsUp.length > 0 && (
              <>
                <h3 style={{ marginTop: 16 }}>Heads-up · {headsUp.length}</h3>
                <div className="flags">
                  {headsUp.map((f, i) => (
                    <div className="fl" key={i}><span className="d" style={{ background: f.color }} /><span><b>{f.title}</b> — {f.detail}</span></div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="out">
          <div className="out__top">
            <h3>Full privacy notice</h3>
            <LangBar />
          </div>
          <div className="doc" style={{ maxHeight: "46vh" }} dangerouslySetInnerHTML={{ __html: buildNotice(S, S.lang) }} />
        </div>

        <div className="rgrid">
          <div className="out" style={{ margin: 0 }}>
            <div className="out__top"><h3>Form mini-notices · {S.contexts.length}</h3></div>
            {S.contexts.length ? S.contexts.map((k) => {
              const c = CONTEXTS.find((x) => x.key === k);
              const txt = miniFor(S, k);
              return c ? (
                <div className="mini" key={k}>
                  <div className="mini__t">{c.label}<button className="copy" onClick={() => { onCopyText(txt); track("mini_notice_copied", { context: k }); }}>Copy</button></div>
                  <p>{txt}</p>
                </div>
              ) : null;
            }) : <p className="muted" style={{ fontSize: 13 }}>Pick collection contexts to get mini-notices.</p>}
          </div>
          <div className="out" style={{ margin: 0 }}>
            <div className="out__top"><h3>Consent &amp; rights blocks</h3></div>
            {consents.map(([t, v]) => (
              <div className="mini" key={t}>
                <div className="mini__t">{t}<button className="copy" onClick={() => { onCopyText(v); track("consent_block_copied"); }}>Copy</button></div>
                <p>{v}</p>
              </div>
            ))}
            <div className="mini">
              <div className="mini__t">Rights / DSAR block<button className="copy" onClick={() => onCopyText(rightsBlock(S))}>Copy</button></div>
              <p>{rightsBlock(S)}</p>
            </div>
          </div>
        </div>

        <div className="out">
          <div className="out__top"><h3>Notice evidence record</h3><button className="copy" onClick={() => onCopyText(JSON.stringify(ev, null, 2))}>Copy JSON</button></div>
          <pre className="codeblk">{JSON.stringify(ev, null, 2)}</pre>
        </div>

        <p className="disc-note">This tool generates a practical draft based on your inputs. It is not legal advice. Review before publishing.</p>

        {gateOpen && <Gate />}
      </div>
    );
  }

  // ── wizard view ──
  return (
    <div className="wrap">
      <div className="head">
        <span className="eyebrow">DPDPA Notice Pack Builder</span>
        <h1>Generate your DPDPA Notice Pack in minutes.</h1>
        <p className="sub">Pick your business type and we pre-fill the likely data, purposes and vendors. Watch your notice build live, then export the full pack — notice, form mini-notices, consent text, a rights block and an evidence record. Preview is free; export needs an email.</p>
      </div>

      <div className="app">
        <section className="card">
          <div className="steps">
            {STEP_LABELS.map((_, n) => <span key={n} className={`pip ${n < step ? "done" : ""} ${n === step ? "now" : ""}`} />)}
          </div>
          <div className="panel">
            <div className="stepmeta">Step {step + 1} of 8 · {STEP_LABELS[step]}</div>

            {step === 0 && (
              <>
                <h2>About your business</h2>
                <p className="hint">Pick your sector and we pre-fill likely data, purposes and vendors. This names you as the Data Fiduciary.</p>
                <div className="field"><label className="lab">Business name <span className="req">*</span></label><input type="text" value={S.org} onChange={(e) => update({ org: e.target.value })} placeholder="e.g. Sunrise Diagnostics" /></div>
                <div className="row2">
                  <div className="field"><label className="lab">Website / app</label><input type="text" value={S.website} onChange={(e) => update({ website: e.target.value })} placeholder="sunrisediagnostics.in" /></div>
                  <div className="field"><label className="lab">Business type / sector <span className="req">*</span></label>
                    <select value={S.sector} onChange={(e) => applySector(e.target.value)}>
                      <option value="">Select sector</option>
                      {SECTORS.map((sec) => <option key={sec.key} value={sec.key}>{sec.label}</option>)}
                    </select></div>
                </div>
                {S.sector && <div className="smartnote">✓ Smart defaults for <b>&nbsp;{SECTORS.find((x) => x.key === S.sector)?.label}&nbsp;</b> applied — data, purposes &amp; vendors pre-filled. Edit anything in the next steps.</div>}
              </>
            )}

            {step === 1 && (
              <>
                <h2>What personal data do you collect?</h2>
                <p className="hint">Pre-ticked from your sector. Gold items are higher-sensitivity and get extra wording. Pick at least one.</p>
                {DATA_GROUPS.map((g) => (
                  <div className="dgroup" key={g.group}>
                    <div className="dgroup__t">{g.group}</div>
                    <div className="chips">
                      {g.items.map((it) => {
                        const sens = SENSITIVE.has(it);
                        return (
                          <label className={`chip ${sens ? "sens" : ""}`} key={it}>
                            <input type="checkbox" checked={S.data.includes(it)} onChange={() => toggle("data", it)} />{it}
                            {sens && <span className="sx">sensitive</span>}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </>
            )}

            {step === 2 && (
              <>
                <h2>Where do you collect this data?</h2>
                <p className="hint">Each collection point gets its own short, just-in-time mini-notice in your pack.</p>
                <div className="chips">
                  {CONTEXTS.map((c) => (
                    <label className="chip" key={c.key}><input type="checkbox" checked={S.contexts.includes(c.key)} onChange={() => toggle("contexts", c.key)} />{c.label}</label>
                  ))}
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h2>Why do you collect each one?</h2>
                <p className="hint">Every data type needs a specific purpose. Vague purposes (gold) are flagged — describe the actual activity.</p>
                {S.data.length ? (
                  <div className="ptable">
                    {S.data.map((d) => {
                      const p = S.purpose[d] ?? (DATA_PURPOSE[d] || "");
                      const v = isVague(p);
                      return (
                        <div key={d}>
                          <div className={`prow ${v ? "vague" : ""}`}>
                            <span className="pd">{d}</span>
                            <input type="text" value={p} placeholder="To…" onChange={(e) => update({ purpose: { ...S.purpose, [d]: e.target.value } })} />
                          </div>
                          {v && <div className="pwarn">Too broad — describe the specific activity.</div>}
                        </div>
                      );
                    })}
                  </div>
                ) : <p className="hint">Select some data in step 2 first.</p>}
              </>
            )}

            {step === 4 && (
              <>
                <h2>Consent &amp; withdrawal</h2>
                <p className="hint">How you take permission, and how people can withdraw it — withdrawal must be as easy as giving it (DPDPA §6).</p>
                <div className="field"><label className="lab">How do you take consent?</label>{radio("consentVia", ["Website checkbox", "App screen", "Paper form", "WhatsApp opt-in", "Email", "Not documented"])}</div>
                <div className="field"><label className="lab">How can people withdraw consent?</label>{radio("withdrawMethod", ["Email", "Web form", "Account settings", "WhatsApp", "Phone", "Not available yet"])}
                  {S.withdrawMethod === "Not available yet" && <div className="flag"><WarnIcon /> <span>Withdrawal should be as easy as giving consent. Add a clear channel before publishing.</span></div>}
                </div>
                <div className="field"><label className="lab">Withdrawal / privacy contact email</label><input type="email" value={S.withdrawContact} onChange={(e) => update({ withdrawContact: e.target.value })} placeholder="privacy@yourbiz.in" /></div>
              </>
            )}

            {step === 5 && (
              <>
                <h2>Who do you share data with?</h2>
                <p className="hint">Third parties that process data for you. We generate a sector-tuned sharing clause.</p>
                <label className="chip" style={{ marginBottom: 12, maxWidth: 280 }}><input type="checkbox" checked={S.noVendors} onChange={(e) => update({ noVendors: e.target.checked, vendors: e.target.checked ? [] : S.vendors })} />We don’t share with any third party</label>
                <div className="chips" style={S.noVendors ? { opacity: 0.4, pointerEvents: "none" } : undefined}>
                  {VENDORS.map((v) => <label className="chip" key={v}><input type="checkbox" checked={S.vendors.includes(v)} onChange={() => toggle("vendors", v)} />{v}</label>)}
                </div>
              </>
            )}

            {step === 6 && (
              <>
                <h2>Children’s data</h2>
                <p className="hint">Processing data of anyone under 18 needs verifiable parental consent and bans targeted ads (DPDPA §9).</p>
                <div className="field"><label className="lab">Do you process data of children (under 18)?</label>{seg("children", ["Yes", "No", "Not sure"])}
                  {S.children === "Yes" && <div className="flag"><WarnIcon /> <span>High-risk. We’ll add a parental-consent block and bar behavioural monitoring / targeted ads for children.</span></div>}
                </div>
                {S.children === "Yes" && (
                  <div className="field"><label className="lab">Why is children’s data collected?</label>
                    <div className="chips">{CHILD_WHY.map((w) => <label className="chip" key={w}><input type="checkbox" checked={S.childWhy.includes(w)} onChange={() => toggle("childWhy", w)} />{w}</label>)}</div>
                  </div>
                )}
              </>
            )}

            {step === 7 && (
              <>
                <h2>Retention &amp; grievance contact</h2>
                <p className="hint">How long you keep data, and who answers rights requests (DPDPA §5/§13).</p>
                <div className="field"><label className="lab">How long do you keep personal data?</label>{radio("retention", ["Until service ends", "1 year", "3 years", "5–8 yrs (tax/legal)", "As required by law", "Forever", "Not sure"])}
                  {["Forever", "Not sure"].includes(S.retention) && <div className="flag"><WarnIcon /> <span>“{S.retention}” is a weak position. Set a time-bound or purpose-linked period where you can.</span></div>}
                </div>
                <div className="row2">
                  <div className="field"><label className="lab">Grievance contact name <span className="req">*</span></label><input type="text" value={S.cName} onChange={(e) => update({ cName: e.target.value })} placeholder="e.g. Priya Nair" /></div>
                  <div className="field"><label className="lab">Contact email <span className="req">*</span></label><input type="email" value={S.cEmail} onChange={(e) => update({ cEmail: e.target.value })} placeholder="privacy@yourbiz.in" /></div>
                </div>
                <div className="field"><label className="lab">Reserve your rights-page slug (optional)</label><input type="text" value={S.slug} onChange={(e) => update({ slug: e.target.value })} placeholder={slugify(S.org) || "your-business"} /><div className="pwarn" style={{ color: "var(--muted)" }}>Used in the rights block: saralprivacy.com/r/<b>{S.slug || slugify(S.org) || "your-business"}</b></div></div>
              </>
            )}

            {!stepValid(step) && <div className="pwarn">{stepHint(step)}</div>}
          </div>

          <div className="foot">
            <button className="btn btn--ghost btn--sm" style={{ visibility: step === 0 ? "hidden" : "visible" }} onClick={() => setStep((n) => Math.max(0, n - 1))}>← Back</button>
            <span className="pg">{step + 1} / 8</span>
            {step < 7
              ? <button className="btn btn--sm" disabled={!stepValid(step)} onClick={() => setStep((n) => n + 1)}>Next <span className="arr">→</span></button>
              : <button className="btn btn--sm" disabled={!stepValid(7)} onClick={() => { track("notice_score_calculated", { sector: S.sector, score: s }); setDone(true); }}>View my Notice Pack ✓</button>}
          </div>
        </section>

        <section className="preview">
          <div className="pvtop">
            <span className="live"><i /> Live preview</span>
            <span className="scorechip" style={{ color: b.color, background: b.bg }}>Readiness {s} · {b.label}</span>
            <LangBar />
          </div>
          <article className="doc" dangerouslySetInnerHTML={{ __html: buildNotice(S, S.lang) }} />
        </section>
      </div>

      {gateOpen && <Gate />}
    </div>
  );
}
