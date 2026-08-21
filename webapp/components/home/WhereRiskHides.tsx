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
} from "lucide-react";
import { Section, Eyebrow } from "@/components/ui/Section";
import { AnswerBlock } from "@/components/seo/AnswerBlock";

// Beat 2 — "Where DPDPA risk hides" (the Scatter, the signature visual).
// Sits on the light canvas: the navy hub chip is now the one dark object in
// the frame, which is what "your business" should be. Personal data fans from
// it to ~8 everyday tools, each carrying its own gold gap. Brand: gold = the
// only attention colour (risk); teal = the data leaving; navy = structure.
// Gold and teal step to the 700 shades — the 400/500 pair used on navy
// measures 3.2-3.7:1 on this canvas.
// Desktop: fixed-canvas SVG fan (660px, 1:1) so lines stay centred on the
// chips. Mobile (<lg): a stacked list. Scroll-triggered reveal, play once,
// prefers-reduced-motion → composed state instantly.

// The everyday data ecosystem. These are COMMON WORKFLOWS, never claimed as
// software integrations — we do not connect to any of them.
const tools = [
  { icon: MessageSquare, name: "WhatsApp", gap: "Consent gap" },
  { icon: HardDrive, name: "Google Drive", gap: "Access gap" },
  { icon: FileSpreadsheet, name: "Excel / Sheets", gap: "Retention gap" },
  { icon: Database, name: "CRM / software", gap: "Vendor gap" },
  { icon: Mail, name: "Email inboxes", gap: "Access gap" },
  { icon: FileInput, name: "Website forms", gap: "Notice gap" },
  { icon: CreditCard, name: "Payment tools", gap: "Vendor gap" },
  { icon: Video, name: "CCTV / footage", gap: "Evidence gap" },
  { icon: Archive, name: "Old archives", gap: "Retention gap" },
  { icon: Globe, name: "Third-party vendors", gap: "Vendor gap" },
];

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

function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, inView };
}

export function WhereRiskHides() {
  const { ref, inView } = useInView<HTMLDivElement>();

  // staggered fade (delay applied via inline transitionDelay per element)
  const fade = () =>
    `transition-opacity duration-500 motion-reduce:!opacity-100 motion-reduce:!transition-none ${
      inView ? "opacity-100" : "opacity-0"
    }`;

  return (
    /* Authority Moment 1 (Quiet Authority spec §6). The master spec always
       wanted this beat dark ("dark zones = Hero+Scatter") and the W-waves lost
       it; with the hero now light, the risk map is where navy first appears —
       the page's thesis delivered on its most serious surface.
       Inks are pre-measured for this ground: teal-400 lines 7.41:1 ·
       gold-400 marks 8.52:1 · slate-300 body 11.66:1 · white on navy-600
       chips 12.65:1. teal-700 (the light-surface line ink) manages only
       3.52:1 here and must not be used. */
    <Section surface="navy" type="statement" width="wide">
      <div ref={ref}>
        {/* header */}
        <div className="text-center mb-12">
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
              return (
                <g key={i}>
                  <path
                    d={`M168 ${HUB_Y} C 240 ${HUB_Y}, 250 ${cy}, 300 ${cy}`}
                    className={`sp-dash-flow stroke-teal-400 fill-none transition-opacity duration-700 motion-reduce:!opacity-70 motion-reduce:!transition-none ${inView ? "opacity-70" : "opacity-0"}`}
                    style={{ transitionDelay: `${i * 110}ms` }}
                    strokeWidth={1.6}
                    strokeDasharray="5 6"
                  />
                  <path
                    d={`M510 ${cy} L 524 ${cy}`}
                    className={`stroke-gold-400 fill-none transition-opacity duration-500 motion-reduce:!opacity-80 motion-reduce:!transition-none ${inView ? "opacity-80" : "opacity-0"}`}
                    style={{ transitionDelay: `${i * 110 + 260}ms` }}
                    strokeWidth={1.4}
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
            return (
              <div key={t.name}>
                <div
                  className={`absolute flex items-center gap-2.5 rounded-lg bg-navy-600 border border-white/10 px-3 z-10 ${fade()}`}
                  style={{ left: 300, top, width: 210, height: CHIP_H, transitionDelay: `${i * 110}ms` }}
                >
                  <Icon size={17} className="text-slate-300 shrink-0" />
                  <span className="text-white text-[13px]">{t.name}</span>
                </div>
                <div
                  className={`absolute flex items-center gap-1.5 z-10 ${fade()}`}
                  style={{ left: 528, top: top + 9, transitionDelay: `${i * 110 + 260}ms` }}
                >
                  <AlertCircle size={13} className="text-gold-400 shrink-0" />
                  <span className="text-gold-400 text-xs font-medium">{t.gap}</span>
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
              return (
                <li
                  key={t.name}
                  className={`flex items-center gap-3 rounded-lg bg-navy-600 border border-white/10 px-3.5 py-2.5 ${fade()}`}
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <Icon size={17} className="text-slate-300 shrink-0" />
                  <span className="text-white text-sm">{t.name}</span>
                  <span className="ml-auto flex items-center gap-1.5 shrink-0">
                    <AlertCircle size={13} className="text-gold-400" />
                    <span className="text-gold-400 text-xs font-medium">{t.gap}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="text-center text-slate-400 text-sm mt-10 max-w-xl mx-auto">
          These are ordinary workflows, not integrations — SaralPrivacy does not
          connect to any of them. DPDPA risk usually hides here, not in legal
          documents.
        </p>

        {/* ── The Privacy Thread — the signature motif, introduced at the
            centrepiece (spec §7). The data lifecycle as six nodes on the same
            teal dashed line the fan uses; the one green node is a controlled
            stage — the quiet promise that control is possible. Decorative to a
            screen reader (the fan above carries the content), so aria-hidden. */}
        <div className="max-w-2xl mx-auto mt-14" aria-hidden="true">
          <p className="text-center text-2xs font-semibold uppercase tracking-[0.09em] text-slate-400 mb-5">
            The data lifecycle — where each gap lives
          </p>
          <div className="flex items-start">
            {[
              { label: "Collect", on: false },
              { label: "Use", on: false },
              { label: "Share", on: false },
              { label: "Store", on: true },
              { label: "Retain", on: false },
              { label: "Delete", on: false },
            ].map((n, i, arr) => (
              <div key={n.label} className="contents">
                <div className="flex flex-col items-center gap-1.5 shrink-0">
                  <span
                    className={`w-2.5 h-2.5 rounded-full border-2 ${
                      n.on
                        ? "bg-green-400 border-green-400"
                        : "bg-transparent border-teal-400"
                    }`}
                  />
                  <span className="text-[10px] sm:text-[11px] text-slate-300">
                    {n.label}
                  </span>
                </div>
                {i < arr.length - 1 && (
                  <span className="flex-1 border-t-2 border-dashed border-teal-400/60 mt-[4px] mx-1.5 sm:mx-2.5" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* "What is DPDPA?" is the education on-ramp for the risk story above,
            so it sits at the foot of it rather than as its own strip. It is
            still the speakable target — the schema on the page points at
            `.answer-block` by class, not by position; the on-dark variant keeps
            both the class and data-speakable. */}
        <div className="max-w-3xl mx-auto mt-16">
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
