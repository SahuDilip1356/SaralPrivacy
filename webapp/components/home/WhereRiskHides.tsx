"use client";

import { useEffect, useRef, useState } from "react";
import {
  MessageSquare,
  HardDrive,
  FileSpreadsheet,
  Database,
  Mail,
  Video,
  Archive,
  Globe,
  Building2,
  AlertCircle,
  FileInput,
  CreditCard,
  ShieldCheck,
  Search,
  type LucideIcon,
} from "lucide-react";
import { Section, Eyebrow } from "@/components/ui/Section";
import { useInView } from "@/lib/hooks/useInView";
import { AnswerBlock } from "@/components/seo/AnswerBlock";
import { WORKFLOW_RISKS } from "@/lib/data/workflow-risks";
import { trackEvent } from "@/lib/analytics";

// S3 — "Where DPDPA risk hides" (the Scatter, the signature visual), the close
// of the opening dark chapter: hero (navy-700) → proof seam (navy-800) → this.
// Personal data fans from the white hub — the one light object in the dark
// frame — to ten everyday tools, each carrying its own gold gap. Brand: gold =
// the only attention colour (risk); teal = the data leaving; navy = structure.
// Desktop: fixed-canvas SVG fan (derived geometry) so lines stay centred on
// the chips. Mobile (<lg): a stacked list. Scroll-triggered reveal, play once,
// prefers-reduced-motion → composed state instantly.
//
// ── The chips are the interface ──────────────────────────────────────────────
// The map used to assert ten gaps and explain none of them, which is the shape
// of an advertisement rather than of evidence. Selecting a tool now opens the
// working behind its label — what data is typically in there, how it goes
// wrong, what closes it — from lib/data/workflow-risks.ts, which is also where
// the tool list and the gap labels live.
//
// Three things move together on select, and that is the point: the flow line to
// that tool brightens, the evidence panel changes, and the Privacy Thread lights
// the lifecycle stage the gap actually sits at. The reader is not told "you have
// ten problems", they are walked through one at a time.
//
// One tool is selected on arrival, so the panel is never an empty reserved box
// and the affordance is legible without an instruction line.

// Icons live here rather than in the data file: they are React components, and
// the data file has to stay importable by anything that doesn't render.
const ICONS: Record<string, LucideIcon> = {
  "WhatsApp": MessageSquare,
  "Google Drive": HardDrive,
  "Excel / Sheets": FileSpreadsheet,
  "CRM / software": Database,
  "Email inboxes": Mail,
  "Website forms": FileInput,
  "Payment tools": CreditCard,
  "CCTV / footage": Video,
  "Old archives": Archive,
  "Third-party vendors": Globe,
};

const tools = WORKFLOW_RISKS.map((r) => ({ ...r, icon: ICONS[r.tool] ?? AlertCircle }));

const LIFECYCLE = ["Collect", "Use", "Share", "Store", "Retain", "Delete"] as const;

// ── Fixed-canvas geometry (desktop ≥lg) ──────────────────────────────────────
// Derived, not hand-tuned: the fan has to stay centred on the chip column when
// the tool list changes length, and it has changed length once already.
const ROW = 44; // chip pitch
const CHIP_H = 38;
const TOP_0 = 8; // first chip's top
const CANVAS_W = 660;
const CANVAS_H = TOP_0 * 2 + (tools.length - 1) * ROW + CHIP_H; // 450 at n=10
const HUB_H = 58;
const HUB_Y = CANVAS_H / 2; // fan origin — the vertical centre of the chip column
const chipTop = (i: number) => TOP_0 + i * ROW;
const chipMid = (i: number) => chipTop(i) + CHIP_H / 2;

export function WhereRiskHides() {
  const { ref, inView } = useInView<HTMLDivElement>();
  const [sel, setSel] = useState(0);
  const [engaged, setEngaged] = useState(false);
  const [hovering, setHovering] = useState(false);
  const active = tools[sel];

  // Re-selecting the open tool is not a signal, so it does not fire. `engaged`
  // latches on the first real selection and permanently ends the auto-tour —
  // a reader who has started steering should never have the page take the
  // wheel back mid-sentence.
  const select = (i: number) => {
    setEngaged(true);
    if (i === sel) return;
    setSel(i);
    trackEvent.riskToolSelect({ tool: tools[i].tool, gap: tools[i].gap });
  };

  // ── The auto-tour ──────────────────────────────────────────────────────────
  // Founder-directed: the section should walk itself so a reader learns that the
  // chips are selectable without being told. Same guardrails as the sector
  // ring, plus one that matters more here.
  //
  // 5s per tool, not 3. Each panel carries three fields of roughly sixty words;
  // at 3s a reader cannot finish the FIRST field, and text that moves before it
  // can be read is worse than text that does not move at all. 5s is enough to
  // take in one field and decide to stop — which is the actual job of this
  // motion. It is a direction cue, not a slideshow.
  //
  // Exactly one revolution: ten tools, then it rests wherever it landed. It
  // pauses on hover, ends for good on any selection or keyboard focus, never
  // starts under reduced motion, and holds while the tab is hidden. Auto-
  // advances fire no analytics — an advance we performed is not a preference
  // the visitor expressed.
  const steps = useRef(0);
  useEffect(() => {
    if (!inView || engaged || hovering) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (steps.current >= tools.length) return;

    const id = setInterval(() => {
      if (document.hidden) return;
      steps.current += 1;
      if (steps.current >= tools.length) clearInterval(id);
      setSel((s) => (s + 1) % tools.length);
    }, 5000);
    return () => clearInterval(id);
  }, [inView, engaged, hovering]);

  // staggered fade (delay applied via inline transitionDelay per element)
  const fade = () =>
    `transition-opacity duration-500 motion-reduce:!opacity-100 motion-reduce:!transition-none ${
      inView ? "opacity-100" : "opacity-0"
    }`;

  return (
    /* Authority Moment 1 (Quiet Authority spec §6). The master spec always
       wanted this beat dark ("dark zones = Hero+Scatter") and the W-waves lost
       it; the risk map is where the page's thesis is delivered, on its most
       serious surface.
       Inks are pre-measured for this ground: teal-400 lines 7.41:1 ·
       gold-400 marks 8.52:1 · slate-300 body 11.66:1 · white on navy-600
       chips 12.65:1. teal-700 (the light-surface line ink) manages only
       3.52:1 here and must not be used. */
    <Section surface="navy" type="statement" width="wide">
      <div
        ref={ref}
        onPointerEnter={() => setHovering(true)}
        onPointerLeave={() => setHovering(false)}
        onFocusCapture={() => setEngaged(true)}
      >
        {/* header */}
        <div className="text-center mb-8">
          <Eyebrow surface="navy" className="mb-3">
            The everyday data ecosystem
          </Eyebrow>
          <h2 className="type-display-2 text-white mb-4">
            The tools are ordinary. The gaps hide between them.
          </h2>
          <p className="type-intro text-slate-300 max-w-xl mx-auto">
            Most Indian businesses don&apos;t lack a privacy policy. They lack
            visibility into where personal data actually lives.
          </p>
        </div>

        {/* ── Desktop: fixed-canvas fan (≥lg, where 660px fits 1:1) ── */}
        <div
          className="hidden lg:block relative mx-auto"
          style={{ width: CANVAS_W, height: CANVAS_H }}
        >
          <svg
            className="absolute top-0 left-0"
            width={CANVAS_W}
            height={CANVAS_H}
            viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
            aria-hidden="true"
          >
            {tools.map((_, i) => {
              const cy = chipMid(i);
              const on = i === sel;
              return (
                <g key={i}>
                  {/* The unselected lines drop to 40% rather than off: the fan
                      IS the section's picture, and dimming it to a single lit
                      thread would trade the idea (data scatters everywhere) for
                      the detail (this one tool). Both have to be legible. */}
                  <path
                    d={`M168 ${HUB_Y} C 240 ${HUB_Y}, 250 ${cy}, 300 ${cy}`}
                    className={`sp-dash-flow stroke-teal-400 fill-none transition-all duration-500 motion-reduce:!transition-none ${
                      !inView
                        ? "opacity-0 motion-reduce:!opacity-100"
                        : on
                          ? "opacity-100"
                          : "opacity-40"
                    }`}
                    style={{ transitionDelay: inView ? "0ms" : `${i * 110}ms` }}
                    strokeWidth={on ? 2.4 : 1.4}
                    strokeDasharray="5 6"
                  />
                  <path
                    d={`M510 ${cy} L 524 ${cy}`}
                    className={`stroke-gold-400 fill-none transition-all duration-500 motion-reduce:!transition-none ${
                      !inView
                        ? "opacity-0 motion-reduce:!opacity-100"
                        : on
                          ? "opacity-100"
                          : "opacity-50"
                    }`}
                    style={{ transitionDelay: inView ? "0ms" : `${i * 110 + 260}ms` }}
                    strokeWidth={on ? 2 : 1.4}
                    strokeDasharray="3 3"
                  />
                </g>
              );
            })}
          </svg>

          {/* enters label + hub — both hang off HUB_Y so they track the fan.
              The hub INVERTS on navy: "your business" is the one light object
              in the dark frame, which is what the section is about. */}
          <span
            className="absolute text-xs text-slate-400"
            style={{ left: 18, top: HUB_Y - HUB_H / 2 - 24 }}
          >
            Personal data enters here
          </span>
          <div
            className="absolute flex items-center gap-2.5 rounded-xl bg-white px-3.5 z-10"
            style={{ left: 18, top: HUB_Y - HUB_H / 2, width: 150, height: HUB_H }}
          >
            <Building2 size={22} className="text-navy-700 shrink-0" />
            <span className="text-navy-700 font-semibold text-sm leading-tight">
              Your business
            </span>
          </div>

          {/* tool chips + adjacent gold gaps */}
          {tools.map((t, i) => {
            const Icon = t.icon;
            const top = chipTop(i);
            const on = i === sel;
            return (
              <div key={t.tool}>
                <button
                  type="button"
                  onClick={() => select(i)}
                  aria-pressed={on}
                  className={`absolute flex items-center gap-2.5 rounded-lg bg-navy-600 border px-3 z-10 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-700 ${
                    on
                      ? "border-teal-400 ring-1 ring-teal-400/40"
                      : "border-white/10 hover:border-teal-400/50"
                  } ${fade()}`}
                  style={{
                    left: 300,
                    top,
                    width: 210,
                    height: CHIP_H,
                    transitionDelay: `${i * 110}ms`,
                  }}
                >
                  <Icon
                    size={17}
                    className={`shrink-0 ${on ? "text-teal-300" : "text-slate-300"}`}
                  />
                  <span className={`text-white text-[13px] ${on ? "font-semibold" : ""}`}>
                    {t.tool}
                  </span>
                </button>
                <div
                  className={`absolute flex items-center gap-1.5 z-10 pointer-events-none ${fade()}`}
                  style={{ left: 528, top: top + 9, transitionDelay: `${i * 110 + 260}ms` }}
                >
                  <AlertCircle
                    size={13}
                    className={`text-gold-400 shrink-0 ${on ? "" : "opacity-70"}`}
                  />
                  <span
                    className={`text-gold-400 text-xs font-medium ${on ? "font-semibold" : "opacity-70"}`}
                  >
                    {t.gap}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Mobile: stacked list (<lg) ── */}
        <div className="lg:hidden max-w-md mx-auto">
          <div className="flex items-center gap-2.5 rounded-xl bg-white px-4 py-3 mb-2">
            <Building2 size={20} className="text-navy-700 shrink-0" />
            <span className="text-navy-700 font-semibold text-sm">
              Personal data enters your business
            </span>
          </div>
          <div className="text-center text-xs text-slate-400 mb-2">
            …and scatters to:
          </div>
          <ul className="space-y-2">
            {tools.map((t, i) => {
              const Icon = t.icon;
              const on = i === sel;
              return (
                <li key={t.tool} className={fade()} style={{ transitionDelay: `${i * 80}ms` }}>
                  <button
                    type="button"
                    onClick={() => select(i)}
                    aria-pressed={on}
                    className={`w-full flex items-center gap-3 rounded-lg bg-navy-600 border px-3.5 py-2.5 pointer-coarse:min-h-11 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-700 ${
                      on ? "border-teal-400" : "border-white/10"
                    }`}
                  >
                    <Icon
                      size={17}
                      className={`shrink-0 ${on ? "text-teal-300" : "text-slate-300"}`}
                    />
                    <span className={`text-white text-sm ${on ? "font-semibold" : ""}`}>
                      {t.tool}
                    </span>
                    <span className="ml-auto flex items-center gap-1.5 shrink-0">
                      <AlertCircle size={13} className="text-gold-400" />
                      <span
                        className={`text-gold-400 text-xs font-medium ${on ? "" : "opacity-70"}`}
                      >
                        {t.gap}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* ── The evidence behind the selected gap ──────────────────────────
            All ten panels are in the DOM; nine carry `hidden`. Same rule the
            objection FAQ follows, for the same reason: this is thirty pieces of
            practical DPDPA guidance, and rendering only the selected one would
            have put twenty-seven of them behind a click that no crawler and no
            reader-mode ever performs. The cost is a few KB of markup.

            `animate-fade-up` is applied by class rather than by remounting —
            adding the class to an element that did not have it replays the
            animation, so the swap still moves without any panel leaving the
            document.

            aria-live, because the chips are buttons whose effect lands 200px
            away: a sighted user sees the panel change, and without this a
            screen-reader user would get silence. */}
        <div
          aria-live="polite"
          className="max-w-3xl mx-auto mt-9 rounded-xl border border-white/10 bg-white/5 p-5 sm:p-6"
        >
          {tools.map((t, i) => {
            const Icon = t.icon;
            return (
              <div
                key={t.tool}
                hidden={i !== sel}
                className={i === sel ? "animate-fade-up motion-reduce:animate-none" : undefined}
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 pb-4 mb-4 border-b border-white/10">
                  <Icon size={18} className="text-teal-300 shrink-0" aria-hidden />
                  <span className="text-white font-semibold text-[15px]">{t.tool}</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-400/30 px-2.5 py-0.5">
                    <AlertCircle size={12} className="text-gold-400 shrink-0" aria-hidden />
                    <span className="text-gold-400 text-2xs font-semibold">{t.gap}</span>
                  </span>
                  <span className="sm:ml-auto text-2xs text-slate-400">
                    Lifecycle stage ·{" "}
                    <span className="text-teal-300 font-semibold">{t.lifecycle}</span>
                  </span>
                </div>

                <dl className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
                  {[
                    {
                      icon: Search,
                      label: "What's in there",
                      body: t.dataFound,
                      ink: "text-slate-400",
                    },
                    {
                      icon: AlertCircle,
                      label: "How it goes wrong",
                      body: t.exposure,
                      ink: "text-gold-400",
                    },
                    {
                      icon: ShieldCheck,
                      label: "What closes it",
                      body: t.control,
                      ink: "text-teal-300",
                    },
                  ].map((f) => (
                    <div key={f.label}>
                      <dt className="flex items-center gap-1.5 mb-2">
                        <f.icon size={13} className={`${f.ink} shrink-0`} aria-hidden />
                        <span className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                          {f.label}
                        </span>
                      </dt>
                      <dd className="text-slate-300 text-[13px] leading-relaxed">{f.body}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            );
          })}
        </div>

        {/* ── The Privacy Thread — the signature motif, introduced at the
            centrepiece (spec §7). The data lifecycle as six nodes on the same
            teal dashed line the fan uses. The lit node is no longer a fixed
            decoration: it follows the selected tool, so the reader can see that
            a WhatsApp gap and an old-archive gap are failures at opposite ends
            of one life. Gold, because a lit node here now marks WHERE THE GAP
            IS — risk, which on this palette is only ever gold. Decorative to a
            screen reader (the panel above states the stage in text), so
            aria-hidden. */}
        <div className="max-w-2xl mx-auto mt-10" aria-hidden="true">
          <p className="text-center text-2xs font-semibold uppercase tracking-[0.09em] text-slate-400 mb-5">
            The data lifecycle: where this gap lives
          </p>
          <div className="flex items-start">
            {LIFECYCLE.map((label, i) => {
              const on = label === active.lifecycle;
              return (
                <div key={label} className="contents">
                  <div className="flex flex-col items-center gap-1.5 shrink-0">
                    <span
                      className={`w-2.5 h-2.5 rounded-full border-2 transition-colors duration-300 ${
                        on
                          ? "bg-gold-400 border-gold-400"
                          : "bg-transparent border-teal-400"
                      }`}
                    />
                    <span
                      className={`text-[10px] sm:text-[11px] transition-colors duration-300 ${
                        on ? "text-gold-400 font-semibold" : "text-slate-300"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                  {i < LIFECYCLE.length - 1 && (
                    <span className="flex-1 border-t-2 border-dashed border-teal-400/60 mt-[4px] mx-1.5 sm:mx-2.5" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-center text-slate-400 text-sm mt-10 max-w-xl mx-auto">
          These are ordinary workflows, not integrations. SaralPrivacy does not
          connect to any of them. DPDPA risk usually hides here, not in legal
          documents.
        </p>

        {/* "What is DPDPA?" is the education on-ramp for the risk story above,
            so it sits at the foot of it rather than as its own strip. It is
            still the speakable target — the schema on the page points at
            `.answer-block` by class, not by position; the on-dark variant keeps
            both the class and data-speakable. */}
        <div className="max-w-3xl mx-auto mt-10">
          <AnswerBlock
            variant="on-dark"
            question="What is DPDPA?"
            answer="DPDPA is India's framework for handling digital personal data, and the DPDP Rules, 2025 have now been notified. For Indian businesses, the real work is operational: fix your notices, consent flows, rights handling, retention logic, and vendor controls. SaralPrivacy helps you understand what matters, assess your risk, and prioritise the next 30 to 90 days."
          />
        </div>
      </div>
    </Section>
  );
}
