"use client";

// The primary experience: one animated, informative journey.
//
// Engaging - as it scrolls into view, a resume travels the real hiring
// journey, copies spray out per stage, and two counters climb: total copies
// and "places where control breaks". Informative - every stage lists its real
// systems (tap for what it holds + the fix) and its DPDPA duty; the hotspot
// stages flag in red. Numbers come from the config, so they stay true.
//
// SEO + reduced-motion safe: all text is server-rendered and visible; only
// the copy documents, counters, tile glow and hotspot flags animate, and only
// when motion is allowed. Reduced-motion / no-JS get the final state.

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, Copy, Trash2, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BusinessModel, DataFlowPack, FlowNode, FlowStage } from "@/lib/data-flow/schemas";
import { filterByBusinessModel } from "@/lib/data-flow/schemas";
import {
  BOUNDARY_META,
  EXTERNAL_BOUNDARY_SET,
  NODE_TYPE_META,
  RISK_META,
} from "./flow-theme";
import { NodeDetailPanel } from "./NodeDetailPanel";
import { DetailSheet } from "./DetailSheet";

interface Props {
  pack: DataFlowPack;
  model: BusinessModel;
  onSystemOpen?: (nodeId: string) => void;
  onAssessmentCta?: (bucket: string | undefined) => void;
}

interface Row {
  stage: FlowStage;
  systems: FlowNode[];
  copiesHere: number;
  runCopies: number;
  hotspotNames: string[];
  runHotspots: number;
}

const STEP_MS = 460;

export function MotionJourney({ pack, model, onSystemOpen, onAssessmentCta }: Props) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [sheetNode, setSheetNode] = useState<FlowNode | null>(null);
  const [step, setStep] = useState(0); // number of stages "reached"

  // Fire once when the journey is on screen. Manual IO + an immediate rect
  // check so it also triggers when the element is already visible at mount.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9 && rect.bottom > 0) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const { rows, totalCopies, totalHotspots } = useMemo(() => {
    const { stages, nodes, edges } = filterByBusinessModel(pack, model);
    const ordered = [...stages].sort((a, b) => a.sequence - b.sequence);
    const seq = new Map(ordered.map((s) => [s.id, s.sequence]));

    const primaryStage = (n: FlowNode) =>
      n.stageIds.filter((id) => seq.has(id)).sort((a, b) => seq.get(a)! - seq.get(b)!)[0];

    // Systems appear once, at the stage they first reach.
    const systemsByStage = new Map<string, FlowNode[]>();
    for (const n of nodes) {
      if (n.nodeType === "person") continue;
      const sid = primaryStage(n);
      if (!sid) continue;
      (systemsByStage.get(sid) ?? systemsByStage.set(sid, []).get(sid)!).push(n);
    }

    // Each hotspot counts once, at its node's first stage → total climbs to 7.
    const hotspotsByStage = new Map<string, string[]>();
    for (const h of pack.hotspots) {
      const node = pack.nodes.find((n) => n.id === h.nodeId);
      if (!node) continue;
      const sid = primaryStage(node);
      if (!sid) continue;
      (hotspotsByStage.get(sid) ?? hotspotsByStage.set(sid, []).get(sid)!).push(h.title);
    }

    let runCopies = 0;
    let runHotspots = 0;
    const rows: Row[] = ordered.map((stage) => {
      const copiesHere = edges.filter((e) => e.stageId === stage.id && e.createsCopy).length;
      runCopies += copiesHere;
      const hotspotNames = hotspotsByStage.get(stage.id) ?? [];
      runHotspots += hotspotNames.length;
      const systems = (systemsByStage.get(stage.id) ?? []).sort((a, b) => {
        const order = { critical: 0, high: 1, medium: 2, low: 3 } as const;
        return order[a.riskLevel] - order[b.riskLevel];
      });
      return { stage, systems, copiesHere, runCopies, hotspotNames, runHotspots };
    });
    return { rows, totalCopies: runCopies, totalHotspots: runHotspots };
  }, [pack, model]);

  // Drive the sequence once in view. Reduced motion / no-JS → jump to the end.
  useEffect(() => {
    setStep(0);
    if (reduce) {
      setStep(rows.length);
      return;
    }
    if (!inView) return;
    let k = 0;
    const id = setInterval(() => {
      k += 1;
      setStep(k);
      if (k >= rows.length) clearInterval(id);
    }, STEP_MS);
    return () => clearInterval(id);
  }, [inView, reduce, rows.length, model]);

  const shownCopies = step === 0 ? 0 : rows[Math.min(step, rows.length) - 1].runCopies;
  const shownHotspots = step === 0 ? 0 : rows[Math.min(step, rows.length) - 1].runHotspots;

  const openSystem = (n: FlowNode) => {
    setSheetNode(n);
    onSystemOpen?.(n.id);
  };

  return (
    <div ref={ref} className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      {/* Emotional panel - sticky on desktop, climbs as you scroll */}
      <aside className="lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-2xl border border-navy-200 bg-navy-800 p-5 text-white">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-teal-300">
              <User size={17} aria-hidden="true" />
            </span>
            <p className="text-sm font-semibold">One candidate&apos;s CV</p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-1">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-bold tabular-nums leading-none text-teal-300">
                  {shownCopies}
                </span>
                <Copy size={15} className="text-teal-300/70" aria-hidden="true" />
              </div>
              <p className="mt-1 text-[12px] text-slate-300">copies of one resume</p>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-bold tabular-nums leading-none text-red-300">
                  {shownHotspots}
                </span>
                <AlertTriangle size={15} className="text-red-300/70" aria-hidden="true" />
              </div>
              <p className="mt-1 text-[12px] text-slate-300">places control breaks</p>
            </div>
          </div>

          <p className="mt-4 flex items-start gap-2 border-t border-white/10 pt-3 text-[13px] font-semibold leading-snug">
            <Trash2 size={15} className="mt-px shrink-0 text-teal-300" aria-hidden="true" />
            If they ask you to delete it tomorrow - can you find every copy?
          </p>
        </div>
        <p className="mt-2 px-1 text-[11px] leading-relaxed text-slate-400">{pack.disclaimer}</p>
      </aside>

      {/* The journey */}
      <ol className="relative">
        {rows.map((row, i) => {
          const reached = i < step;
          const isHot = row.hotspotNames.length > 0;
          return (
            <li key={row.stage.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <motion.span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
                    isHot ? "bg-red-600" : "bg-navy-700",
                  )}
                  animate={reached ? { scale: [1, 1.18, 1] } : { scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  {i + 1}
                </motion.span>
                {i < rows.length - 1 && (
                  <span className="relative w-0.5 flex-1 bg-slate-200">
                    <motion.span
                      className="absolute inset-x-0 top-0 bg-gradient-to-b from-violet-400 to-teal-400"
                      initial={false}
                      animate={{ height: reached ? "100%" : "0%" }}
                      transition={{ duration: 0.4 }}
                    />
                  </span>
                )}
              </div>

              <div
                className={cn(
                  "mb-3 flex-1 rounded-xl border bg-white p-4 transition-shadow",
                  isHot ? "border-red-200" : "border-slate-200",
                  reached && "shadow-sm",
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="flex items-center gap-2 text-[15px] font-bold text-navy-800">
                    {row.stage.name}
                    {isHot && (
                      <motion.span
                        className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide text-red-700"
                        initial={false}
                        animate={{ opacity: reached ? 1 : 0.15, x: reached ? 0 : -4 }}
                        transition={{ duration: 0.35 }}
                      >
                        <AlertTriangle size={11} aria-hidden="true" /> control breaks
                      </motion.span>
                    )}
                  </h3>
                  {row.copiesHere > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                      <Copy size={11} aria-hidden="true" /> +{row.copiesHere} {row.copiesHere === 1 ? "copy" : "copies"} · {row.runCopies} so far
                    </span>
                  )}
                </div>

                <p className="mt-2 text-[13px] leading-relaxed text-slate-600">{row.stage.summary}</p>

                {isHot && (
                  <p className="mt-2 text-[12px] font-medium text-red-700">
                    Where control breaks: {row.hotspotNames.join(" · ")}
                  </p>
                )}

                {row.systems.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {row.systems.map((n, j) => {
                      const risk = RISK_META[n.riskLevel];
                      const RiskIcon = risk.icon;
                      const TypeIcon = NODE_TYPE_META[n.nodeType].icon;
                      const external = EXTERNAL_BOUNDARY_SET.has(n.boundary);
                      const danger = n.riskLevel === "high" || n.riskLevel === "critical";
                      return (
                        <motion.button
                          key={n.id}
                          type="button"
                          onClick={() => openSystem(n)}
                          initial={false}
                          animate={
                            reduce
                              ? { opacity: 1, y: 0, scale: 1 }
                              : reached
                                ? { opacity: 1, y: 0, scale: 1 }
                                : { opacity: 0.35, y: 4, scale: 0.98 }
                          }
                          transition={{ duration: 0.3, delay: reached && !reduce ? j * 0.05 : 0 }}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
                            danger
                              ? "border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
                              : external
                                ? "border-amber-200 bg-amber-50/60 text-amber-800 hover:bg-amber-100"
                                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                          )}
                        >
                          <TypeIcon size={13} className="shrink-0 opacity-70" aria-hidden="true" />
                          {n.name}
                          {n.shadowIt && (
                            <span className="rounded bg-white/70 px-1 text-[10px] font-semibold text-slate-500">
                              unmanaged
                            </span>
                          )}
                          {external && (
                            <span className="rounded bg-white/70 px-1 text-[10px] font-semibold text-amber-700">
                              {BOUNDARY_META[n.boundary].label}
                            </span>
                          )}
                          <RiskIcon
                            size={13}
                            className={cn(
                              "shrink-0",
                              danger
                                ? "text-amber-600"
                                : n.riskLevel === "medium"
                                  ? "text-slate-400"
                                  : "text-green-600",
                            )}
                            aria-label={risk.label}
                          />
                        </motion.button>
                      );
                    })}
                  </div>
                )}

                <p className="mt-3 flex items-start gap-1.5 border-t border-slate-100 pt-2.5 text-[12px] leading-relaxed text-teal-900">
                  <span className="mt-px shrink-0 rounded bg-teal-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-teal-700">
                    DPDPA
                  </span>
                  {row.stage.dpdpaNote}
                </p>
              </div>

              {/* Flying resume copies - the artifact's signature: every copy
                  this stage creates flies out and stacks up. Desktop delight;
                  the counter carries the story on mobile. */}
              <div className="relative hidden w-24 shrink-0 lg:block" aria-hidden="true">
                {Array.from({ length: Math.min(row.copiesHere, 6) }).map((_, j) => (
                  <motion.div
                    key={j}
                    className={cn(
                      "absolute left-0 top-7 flex h-11 w-8 flex-col gap-[3px] rounded-md border bg-white p-1.5 shadow-sm",
                      isHot ? "border-red-200" : "border-slate-200",
                    )}
                    initial={false}
                    animate={
                      reduce || reached
                        ? {
                            opacity: 1,
                            x: 6 + (j % 3) * 22,
                            y: Math.floor(j / 3) * 16 + (j % 2 ? 5 : -5),
                            rotate: j % 2 ? 6 : -6,
                            scale: 1,
                          }
                        : { opacity: 0, x: -18, y: 0, rotate: 0, scale: 0.5 }
                    }
                    transition={
                      reduce
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 260, damping: 20, delay: reached ? j * 0.09 : 0 }
                    }
                  >
                    <span className={cn("h-2 w-2 rounded-full", isHot ? "bg-red-400" : "bg-teal-400")} />
                    <span className="h-[2px] w-4/5 rounded bg-slate-200" />
                    <span className="h-[2px] w-full rounded bg-slate-200" />
                    <span className="h-[2px] w-3/5 rounded bg-slate-200" />
                  </motion.div>
                ))}
              </div>
            </li>
          );
        })}
      </ol>

      {sheetNode && (
        <DetailSheet onClose={() => setSheetNode(null)}>
          <NodeDetailPanel
            pack={pack}
            node={sheetNode}
            onClose={() => setSheetNode(null)}
            onAssessmentCta={onAssessmentCta}
          />
        </DetailSheet>
      )}

      <span className="sr-only">
        In this reference model, one candidate&apos;s resume is copied {totalCopies} times across{" "}
        {rows.length} stages, with {totalHotspots} places where control breaks.
      </span>
    </div>
  );
}
