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
} from "lucide-react";

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

const tools = [
  { icon: MessageSquare, name: "WhatsApp", gap: "Consent gap" },
  { icon: HardDrive, name: "Google Drive", gap: "Access gap" },
  { icon: FileSpreadsheet, name: "Excel / Sheets", gap: "Retention gap" },
  { icon: Database, name: "CRM / software", gap: "Vendor gap" },
  { icon: Mail, name: "Email inboxes", gap: "Access gap" },
  { icon: Video, name: "CCTV / footage", gap: "Evidence gap" },
  { icon: Archive, name: "Old archives", gap: "Retention gap" },
  { icon: Globe, name: "Third-party vendors", gap: "Vendor gap" },
];

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
    <section className="bg-cloud-50 border-t border-pearl-100 py-32">
      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* header */}
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-medium uppercase tracking-[0.08em] text-slate-600 mb-3">
            Where DPDPA risk hides
          </span>
          <h2 className="text-3xl sm:text-4xl font-semibold text-navy-700 mb-3">
            Follow the data. The risk becomes visible.
          </h2>
          <p className="text-slate-600 text-base max-w-xl mx-auto leading-relaxed">
            Most Indian businesses don&apos;t lack a privacy policy. They lack
            visibility into where personal data actually lives.
          </p>
        </div>

        {/* ── Desktop: fixed-canvas fan (≥lg, where 660px fits 1:1) ── */}
        <div
          className="hidden lg:block relative mx-auto"
          style={{ width: 660, height: 362 }}
        >
          <svg
            className="absolute top-0 left-0"
            width={660}
            height={362}
            viewBox="0 0 660 362"
            aria-hidden="true"
          >
            {tools.map((_, i) => {
              const cy = 27 + i * 44;
              return (
                <g key={i}>
                  <path
                    d={`M168 181 C 240 181, 250 ${cy}, 300 ${cy}`}
                    className={`sp-dash-flow stroke-teal-700 fill-none transition-opacity duration-700 motion-reduce:!opacity-60 motion-reduce:!transition-none ${inView ? "opacity-60" : "opacity-0"}`}
                    style={{ transitionDelay: `${i * 110}ms` }}
                    strokeWidth={1.6}
                    strokeDasharray="5 6"
                  />
                  <path
                    d={`M510 ${cy} L 524 ${cy}`}
                    className={`stroke-gold-700 fill-none transition-opacity duration-500 motion-reduce:!opacity-70 motion-reduce:!transition-none ${inView ? "opacity-70" : "opacity-0"}`}
                    style={{ transitionDelay: `${i * 110 + 260}ms` }}
                    strokeWidth={1.4}
                    strokeDasharray="3 3"
                  />
                </g>
              );
            })}
          </svg>

          {/* enters label + hub */}
          <span
            className="absolute text-xs text-slate-600"
            style={{ left: 18, top: 128 }}
          >
            Personal data enters here
          </span>
          <div
            className="absolute flex items-center gap-2.5 rounded-xl bg-navy-700 px-3.5 z-10"
            style={{ left: 18, top: 152, width: 150, height: 58 }}
          >
            <Building2 size={22} className="text-white shrink-0" />
            <span className="text-white font-semibold text-sm leading-tight">
              Your business
            </span>
          </div>

          {/* tool chips + adjacent gold gaps */}
          {tools.map((t, i) => {
            const Icon = t.icon;
            const top = 8 + i * 44;
            return (
              <div key={t.name}>
                <div
                  className={`absolute flex items-center gap-2.5 rounded-lg bg-white border border-pearl-200 px-3 z-10 ${fade()}`}
                  style={{ left: 300, top, width: 210, height: 38, transitionDelay: `${i * 110}ms` }}
                >
                  <Icon size={17} className="text-slate-600 shrink-0" />
                  <span className="text-slate-700 text-[13px]">{t.name}</span>
                </div>
                <div
                  className={`absolute flex items-center gap-1.5 z-10 ${fade()}`}
                  style={{ left: 528, top: top + 9, transitionDelay: `${i * 110 + 260}ms` }}
                >
                  <AlertCircle size={13} className="text-gold-700 shrink-0" />
                  <span className="text-gold-700 text-xs font-medium">{t.gap}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Mobile: stacked list (<lg) ── */}
        <div className="lg:hidden max-w-md mx-auto">
          <div className="flex items-center gap-2.5 rounded-xl bg-navy-700 px-4 py-3 mb-2">
            <Building2 size={20} className="text-white shrink-0" />
            <span className="text-white font-semibold text-sm">
              Personal data enters your business
            </span>
          </div>
          <div className="text-center text-xs text-slate-600 mb-2">
            …and scatters to:
          </div>
          <ul className="space-y-2">
            {tools.map((t, i) => {
              const Icon = t.icon;
              return (
                <li
                  key={t.name}
                  className={`flex items-center gap-3 rounded-lg bg-white border border-pearl-200 px-3.5 py-2.5 ${fade()}`}
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <Icon size={17} className="text-slate-600 shrink-0" />
                  <span className="text-slate-700 text-sm">{t.name}</span>
                  <span className="ml-auto flex items-center gap-1.5 shrink-0">
                    <AlertCircle size={13} className="text-gold-700" />
                    <span className="text-gold-700 text-xs font-medium">{t.gap}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="text-center text-slate-600 text-sm mt-10 max-w-xl mx-auto">
          DPDPA risk usually hides in ordinary workflows — not in legal documents.
        </p>
      </div>
    </section>
  );
}
