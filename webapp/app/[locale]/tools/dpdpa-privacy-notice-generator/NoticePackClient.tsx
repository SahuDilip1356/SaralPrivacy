"use client";
import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import {
  DATA_GROUPS, SENSITIVE, DATA_PURPOSE, CONTEXTS, VENDORS, CHILD_WHY, SECTORS, consentBlocks,
} from "@/lib/notice-pack/data";
import {
  buildNotice, score, band, flags, isVague, slugify, miniFor, evidence, rightsBlock, newNoticeId, sha256,
} from "@/lib/notice-pack/engine";
import { noticeDocumentHtml } from "@/lib/notice-pack/render";
import { track } from "@/lib/notice-pack/track";
import type { NPState } from "@/lib/notice-pack/types";

const SHOW_HINDI = false; // Hindi output is partial — hidden until fully translated (spec S6)
const LS_KEY = "np_state_v1";
const HONEYPOT = "hp_url";

const INITIAL: NPState = {
  org: "", website: "", sector: "", data: [], contexts: [], purpose: {},
  consentVia: [], withdrawMethod: [], withdrawContact: "", vendors: [], noVendors: false,
  children: "", childWhy: [], retention: "", cName: "", cEmail: "", cPhone: "", regAddress: "", slug: "", lang: "en",
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
  const [effIso, setEffIso] = useState("");
  const [copiedToast, setCopiedToast] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  // The step whose Next was pressed while something was missing: its errors show, and only then.
  const [tried, setTried] = useState<number | null>(null);
  const hydrated = useRef(false);
  const hpRef = useRef<HTMLInputElement>(null);
  const gateEmailRef = useRef<HTMLInputElement>(null);

  // ── persistence: restore once on mount, then save on change ──
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const o = JSON.parse(saved);
        if (o.S) {
          // Migrate: consentVia/withdrawMethod were single strings before they
          // became multi-select arrays — coerce so old saved state won't crash.
          const arr = (x: unknown) => (Array.isArray(x) ? x : x ? [x] : []);
          o.S.consentVia = arr(o.S.consentVia);
          o.S.withdrawMethod = arr(o.S.withdrawMethod);
          setS(o.S);
        }
        if (typeof o.step === "number") setStep(o.step);
      }
    } catch { /* ignore */ }
    setNoticeId(newNoticeId());
    setEffIso(new Date().toISOString());
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
    sha256(buildNotice(S, S.lang, effIso)).then((h) => { if (live) setHash(h); });
    return () => { live = false; };
  }, [done, S]);

  const update = (patch: Partial<NPState>) => setS((p) => ({ ...p, ...patch }));
  const toggle = (field: "data" | "contexts" | "vendors" | "childWhy" | "consentVia" | "withdrawMethod", val: string) =>
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
        <button key={v} type="button" aria-pressed={S[field] === v} className={S[field] === v ? "on" : ""} onClick={() => update({ [field]: v } as Partial<NPState>)}>{v}</button>
      ))}
    </div>
  );
  const radio = (field: keyof NPState, vals: string[]) => (
    <div className="chips">
      {vals.map((v) => (
        <button key={v} type="button" aria-pressed={S[field] === v} className={`opt ${S[field] === v ? "on" : ""}`} onClick={() => update({ [field]: v } as Partial<NPState>)}>{v}</button>
      ))}
    </div>
  );
  // Multi-select chips (same look as radio, but more than one can be picked).
  const multi = (field: "consentVia" | "withdrawMethod", vals: string[]) => (
    <div className="chips">
      {vals.map((v) => (
        <button key={v} type="button" aria-pressed={S[field].includes(v)} className={`opt ${S[field].includes(v) ? "on" : ""}`} onClick={() => toggle(field, v)}>{v}</button>
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
  // Field errors (sd-web-design rules/operate.md): next to the field, tied to it, shown only after
  // Next was pressed with something missing. Each says what is wrong and how to fix it.
  const errs: Record<string, string> = {};
  if (tried === 0 && !S.org.trim()) errs.org = "Enter your business name. The notice uses it to name you as the Data Fiduciary.";
  if (tried === 0 && !S.sector) errs.sector = "Pick a sector so we can fill in the usual data, purposes and vendors.";
  if (tried === 1 && !S.data.length) errs.data = "Tick at least one kind of data you collect.";
  if (tried === 7 && !S.cName.trim()) errs.cName = "Add the name of the person who answers privacy requests.";
  if (tried === 7 && !emailOk(S.cEmail)) errs.cEmail = S.cEmail.trim() ? "That email looks incomplete. It should look like privacy@yourbiz.in." : "Add an email where people can reach them.";
  const errProps = (k: string) => (errs[k] ? { "aria-invalid": true as const, "aria-describedby": `np-err-${k}` } : {});
  const fieldErr = (k: string) => (errs[k] ? <p className="ferr" id={`np-err-${k}`}>{errs[k]}</p> : null);
  // Next is never silently disabled: pressing it on an incomplete step shows what is missing and
  // moves focus to the first field that needs it.
  const goNext = (finish: boolean) => {
    if (!stepValid(step)) {
      setTried(step);
      setTimeout(() => (document.querySelector('.npb [aria-invalid="true"], .npb .ferr') as HTMLElement | null)?.focus(), 0);
      return;
    }
    setTried(null);
    if (finish) { track("notice_score_calculated", { sector: S.sector, score: s }); setDone(true); }
    else setStep((n) => n + 1);
  };

  // ── export / gate ──
  // Shared document shell — same template the server uses for the PDF, so Copy
  // HTML, the print fallback and the PDF never drift.
  const fullHtml = () => noticeDocumentHtml(S, { effIso });
  // Browser-print fallback (used only if the server PDF route fails).
  const printFallback = () => {
    const w = window.open("", "_blank");
    if (w) { w.document.write(fullHtml()); w.document.close(); w.focus(); setTimeout(() => w.print(), 300); }
    else alert("Please allow pop-ups to download the PDF, or use Copy HTML instead.");
  };
  // Server-side PDF: POST the answers, stream back a branded PDF, trigger download.
  const downloadServerPdf = async () => {
    setPdfBusy(true);
    try {
      const res = await fetch("/api/notice/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...S, effIso }),
      });
      if (!res.ok) throw new Error(`pdf ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dpdpa-privacy-notice-${slugify(S.org) || "your-business"}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      track("notice_pdf_downloaded", { sector: S.sector });
    } catch (err) {
      console.error("server pdf failed, falling back to print:", err);
      printFallback();
      track("notice_pdf_downloaded", { sector: S.sector, fallback: "print" });
    } finally {
      setPdfBusy(false);
    }
  };
  const runPending = (p: Pending) => {
    if (!p) return;
    if (p.kind === "pdf") {
      downloadServerPdf();
    } else if (p.kind === "copyFull") {
      navigator.clipboard?.writeText(fullHtml()); track("notice_html_copied", { sector: S.sector }); flashCopied();
    } else if (p.kind === "copyText") {
      navigator.clipboard?.writeText(p.text || ""); flashCopied();
    }
  };
  const flashCopied = () => { setCopiedToast(true); setTimeout(() => setCopiedToast(false), 1400); };
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
            <button className="btn btn--sm" disabled={pdfBusy} aria-busy={pdfBusy} onClick={() => requestExport("pdf")}>{pdfBusy ? "Generating…" : "Download PDF"}</button>
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
          <div className="doc" style={{ maxHeight: "46vh" }} dangerouslySetInnerHTML={{ __html: buildNotice(S, S.lang, effIso) }} />
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
        {copiedToast && <div className="np-toast" role="status">Copied</div>}
      </div>
    );
  }

  // ── wizard view ──
  return (
    <div className="wrap">
      <div className="head">
        <h1>Generate your DPDPA Notice Pack in minutes.</h1>
        <p className="sub">Pick your business type and we pre-fill the likely data, purposes and vendors. Watch your notice build live, then export the full pack — notice, form mini-notices, consent text, a rights block and an evidence record. Preview is free; export needs an email.</p>
      </div>

      <div className="app">
        <section className="card">
          <div className="steps" aria-hidden>
            {STEP_LABELS.map((_, n) => <span key={n} className={`pip ${n < step ? "done" : ""} ${n === step ? "now" : ""}`} />)}
          </div>
          <div className="panel">

            {step === 0 && (
              <>
                <h2>About your business</h2>
                <p className="hint">Pick your sector and we pre-fill likely data, purposes and vendors. This names you as the Data Fiduciary.</p>
                <div className="field"><label className="lab" htmlFor="np-org">Business name <span className="req">*</span></label><input id="np-org" type="text" value={S.org} onChange={(e) => update({ org: e.target.value })} placeholder="e.g. Sunrise Diagnostics" {...errProps("org")} />{fieldErr("org")}</div>
                <div className="row2">
                  <div className="field"><label className="lab">Website / app</label><input type="text" value={S.website} onChange={(e) => update({ website: e.target.value })} placeholder="sunrisediagnostics.in" /></div>
                  <div className="field"><label className="lab" htmlFor="np-sector">Business type / sector <span className="req">*</span></label>
                    <select id="np-sector" value={S.sector} onChange={(e) => applySector(e.target.value)} {...errProps("sector")}>
                      <option value="">Select sector</option>
                      {SECTORS.map((sec) => <option key={sec.key} value={sec.key}>{sec.label}</option>)}
                    </select>{fieldErr("sector")}</div>
                </div>
                {S.sector && <div className="smartnote"><Check size={15} aria-hidden /> <span>Smart defaults for <b>&nbsp;{SECTORS.find((x) => x.key === S.sector)?.label}&nbsp;</b> applied. Data, purposes and vendors are pre-filled; edit anything in the next steps.</span></div>}
              </>
            )}

            {step === 1 && (
              <>
                <h2>What personal data do you collect?</h2>
                <p className="hint">Pre-ticked from your sector. Gold items are higher-sensitivity and get extra wording. Pick at least one.</p>
                {(() => {
                  const group = (g: (typeof DATA_GROUPS)[number]) => (
                  <div className="dgroup" key={g.group}>
                    <div className="dgroup__t">{g.group}</div>
                    <div className="chips">
                      {g.items.map((it) => {
                        const sens = SENSITIVE.has(it) && S.data.includes(it);
                        return (
                          <label className={`chip ${sens ? "sens" : ""}`} key={it}>
                            <input type="checkbox" checked={S.data.includes(it)} onChange={() => toggle("data", it)} />{it}
                            {sens && <span className="sx">sensitive</span>}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  );
                  const open = DATA_GROUPS.filter((g) => g.items.some((it) => S.data.includes(it)));
                  const rest = DATA_GROUPS.filter((g) => !open.includes(g));
                  const restCount = rest.reduce((n, g) => n + g.items.length, 0);
                  return (
                    <>
                      {open.map(group)}
                      {rest.length > 0 && (
                        <details className="dmore" open={!open.length}>
                          <summary>More data types ({restCount})</summary>
                          {rest.map(group)}
                        </details>
                      )}
                    </>
                  );
                })()}
                {errs.data && <p className="ferr" id="np-err-data" tabIndex={-1} role="alert">{errs.data}</p>}
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
                <div className="field"><label className="lab">How do you take consent? <span className="lab-hint">Pick all that apply</span></label>{multi("consentVia", ["Website checkbox", "App screen", "Paper form", "WhatsApp opt-in", "Email", "Not documented"])}</div>
                <div className="field"><label className="lab">How can people withdraw consent? <span className="lab-hint">Pick all that apply</span></label>{multi("withdrawMethod", ["Email", "Web form", "Account settings", "WhatsApp", "Phone", "Not available yet"])}
                  {!S.withdrawMethod.some((m) => m !== "Not available yet") && S.withdrawMethod.includes("Not available yet") && <div className="flag"><WarnIcon /> <span>Withdrawal should be as easy as giving consent. Add a clear channel before publishing.</span></div>}
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
                <div className="field"><label className="lab">How long do you keep personal data?</label>{radio("retention", ["Until service ends", "6 months", "1 year", "3 years", "5–8 yrs (tax/legal)", "As required by law", "Forever", "Not sure"])}
                  {["Forever", "Not sure"].includes(S.retention) && <div className="flag"><WarnIcon /> <span>“{S.retention}” is a weak position. Set a time-bound or purpose-linked period where you can.</span></div>}
                </div>
                <div className="row2">
                  <div className="field"><label className="lab" htmlFor="np-cname">Grievance contact name <span className="req">*</span></label><input id="np-cname" type="text" value={S.cName} onChange={(e) => update({ cName: e.target.value })} placeholder="e.g. Priya Nair" {...errProps("cName")} />{fieldErr("cName")}</div>
                  <div className="field"><label className="lab" htmlFor="np-cemail">Contact email <span className="req">*</span></label><input id="np-cemail" type="email" value={S.cEmail} onChange={(e) => update({ cEmail: e.target.value })} placeholder="privacy@yourbiz.in" {...errProps("cEmail")} />{fieldErr("cEmail")}</div>
                </div>
                <div className="field"><label className="lab">Registered / office address (optional)</label><input type="text" value={S.regAddress} onChange={(e) => update({ regAddress: e.target.value })} placeholder="Shown in the notice's “Who we are”" /></div>
                <div className="field"><label className="lab">Reserve your rights-page slug (optional)</label><input type="text" value={S.slug} onChange={(e) => update({ slug: e.target.value })} placeholder={slugify(S.org) || "your-business"} /><div className="pwarn" style={{ color: "var(--muted)" }}>Used in the rights block: saralprivacy.com/r/<b>{S.slug || slugify(S.org) || "your-business"}</b></div></div>
              </>
            )}

          </div>

          <div className="foot">
            <span className="pg" aria-live="polite">Step {step + 1} of 8: {STEP_LABELS[step]}</span>
            <div className="foot__act">
              {step > 0 && <button className="btn btn--ghost btn--sm" onClick={() => { setTried(null); setStep((n) => Math.max(0, n - 1)); }}>Back</button>}
              {step < 7
                ? <button className="btn btn--sm" onClick={() => goNext(false)}>Next <span className="arr" aria-hidden>→</span></button>
                : <button className="btn btn--sm" onClick={() => goNext(true)}>View my Notice Pack <Check size={16} aria-hidden /></button>}
            </div>
          </div>
        </section>

        <a className="pvjump" href="#np-preview">{S.sector ? `See your notice: readiness ${s}, ${b.label}` : "See your notice"}</a>

        <section className="preview" id="np-preview">
          <div className="pvtop">
            <span className="live"><i /> Live preview</span>
            {S.sector
              ? <span className="scorechip" aria-live="polite" style={{ color: b.color, background: b.bg }}>Readiness {s} · {b.label}</span>
              : <span className="pv-note">Your readiness score appears once you pick a sector.</span>}
            <LangBar />
          </div>
          {!S.org.trim() && !S.sector ? (
            <div className="doc pv-empty">
              <h2>Your notice builds here</h2>
              <p>Each answer fills in one section of your notice: who you are, what data you hold, why you hold it and who you share it with.</p>
              <p>Start with your business name and sector. We fill in the data, purposes and vendors a business like yours usually has.</p>
            </div>
          ) : (
            <>
              <article className="doc" dangerouslySetInnerHTML={{ __html: buildNotice(S, S.lang, effIso) }} />
              <p className="pvhint">Scroll the notice to see all its sections.</p>
            </>
          )}
        </section>
      </div>

      {gateOpen && <Gate />}
      {copiedToast && <div className="np-toast" role="status">Copied</div>}
    </div>
  );
}
