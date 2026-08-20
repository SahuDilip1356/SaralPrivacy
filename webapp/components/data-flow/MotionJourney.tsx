"use client";

// The primary experience: one animated, informative journey.
//
// Engaging - as it scrolls into view, a resume travels the real hiring
// journey, new places light up per stage, and two counters climb: places the
// data now lives and "places where control breaks". Informative - every stage
// lists its real systems (tap for what it holds + the fix) and its DPDPA duty;
// the hotspot stages flag in red. Numbers come from the config, so they stay true.
//
// We count PLACES, not copy events. Copy events summed alternative routes a
// single candidate would never all take (5 entry channels at stage 1, when a
// person arrives through one), so "34 copies of one resume" overstated. Worse,
// the boxes showed a system's first appearance while the counter showed copy
// events landing in systems introduced earlier - "1 box, +3 copies" was
// irreconcilable on screen. Places fix both: every box is one place, counted
// once, so the counter and the boxes cannot disagree by construction.
// (Per-edge `createsCopy` is still true and still used in the full system map.)
//
// SEO + reduced-motion safe: all text is server-rendered and visible; only
// the copy documents, counters, tile glow and hotspot flags animate, and only
// when motion is allowed. Reduced-motion / no-JS get the final state.

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  Archive,
  ClipboardCheck,
  ClipboardList,
  FileSearch,
  LogOut,
  MapPin,
  MessageCircle,
  Search,
  Send,
  ShieldCheck,
  Trash2,
  User,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  BusinessModel,
  DataCategory,
  DataFlowPack,
  FlowNode,
  FlowStage,
} from "@/lib/data-flow/schemas";
import { filterByBusinessModel } from "@/lib/data-flow/schemas";
import { stageDataRollup } from "@/lib/data-flow/stage-data";
import {
  BOUNDARY_META,
  EXTERNAL_BOUNDARY_SET,
  NODE_TYPE_META,
  RISK_META,
  boundaryLabel,
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
  /** New places at this stage - always equals `systems.length`, so the
   *  counter and the boxes on screen are the same fact. */
  placesHere: number;
  runPlaces: number;
  hotspotNames: string[];
  runHotspots: number;
  /** Personal data moving at this stage, new categories first. */
  moving: DataCategory[];
  newCategoryIds: ReadonlySet<string>;
}

/** Chips shown before "+N more" - today's busiest stage has 6. */
const MAX_CATEGORY_CHIPS = 6;

const STEP_MS = 460;

// Soft-3D stage tiles, in the visual language of the concept piece. Icons are
// keyed by stage id with a safe fallback, and gradients cycle by position, so
// a future industry pack renders correctly without touching this file.
const STAGE_ICONS: Record<string, LucideIcon> = {
  sourcing: Search,
  registration: ClipboardCheck,
  screening: FileSearch,
  engagement: MessageCircle,
  assessment: ClipboardList,
  "client-submission": Send,
  interview: Users,
  bgv: ShieldCheck,
  offer: ClipboardCheck,
  onboarding: UserPlus,
  exit: LogOut,
  archive: Archive,
};

const TILE_GRADIENTS: ReadonlyArray<readonly [string, string]> = [
  ["#5B8DEF", "#3466C9"],
  ["#8B7EF0", "#5B49C9"],
  ["#2FBE86", "#159A78"],
  ["#35B6AE", "#159A85"],
  ["#F0A93C", "#D9820A"],
  ["#7C6BE8", "#4F3FBE"],
];

export function MotionJourney({ pack, model, onSystemOpen, onAssessmentCta }: Props) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [sheetNode, setSheetNode] = useState<FlowNode | null>(null);
  const [step, setStep] = useState(0); // number of stages "reached"

  // Fire once when the journey reaches the viewport. We observe a small
  // sentinel at the top of the journey (threshold 0) rather than the very tall
  // container - a tall element can sit on screen without ever crossing a
  // ratio threshold, which left the counters frozen at zero.
  useEffect(() => {
    if (inView) return;
    const el = sentinelRef.current;
    if (!el) return;

    const onScreen = () => {
      const r = el.getBoundingClientRect();
      return r.top < window.innerHeight * 0.85 && r.bottom > 0;
    };
    if (onScreen()) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setInView(true);
      },
      { threshold: 0, rootMargin: "0px 0px -15% 0px" },
    );
    io.observe(el);
    // Belt and braces: some embedded/preview browsers don't deliver IO
    // callbacks reliably, so poll the rect a few times too.
    const poll = setInterval(() => {
      if (onScreen()) setInView(true);
    }, 400);
    return () => {
      io.disconnect();
      clearInterval(poll);
    };
  }, [inView]);

  const { rows, totalPlaces, totalHotspots } = useMemo(() => {
    const { stages, nodes } = filterByBusinessModel(pack, model);
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

    // What personal data moves at each stage - shared helper so the component
    // and the test suite compute this exactly one way.
    const dataByStage = new Map(
      stageDataRollup(pack, model).map((r) => [r.stageId, r]),
    );

    let runPlaces = 0;
    let runHotspots = 0;
    const rows: Row[] = ordered.map((stage) => {
      const hotspotNames = hotspotsByStage.get(stage.id) ?? [];
      runHotspots += hotspotNames.length;
      const systems = (systemsByStage.get(stage.id) ?? []).sort((a, b) => {
        const order = { critical: 0, high: 1, medium: 2, low: 3 } as const;
        return order[a.riskLevel] - order[b.riskLevel];
      });
      const placesHere = systems.length;
      runPlaces += placesHere;
      const rollup = dataByStage.get(stage.id);
      return {
        stage,
        systems,
        placesHere,
        runPlaces,
        hotspotNames,
        runHotspots,
        moving: rollup?.moving ?? [],
        newCategoryIds: rollup?.newIds ?? new Set<string>(),
      };
    });
    return { rows, totalPlaces: runPlaces, totalHotspots: runHotspots };
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

  const shownPlaces = step === 0 ? 0 : rows[Math.min(step, rows.length) - 1].runPlaces;
  const shownHotspots = step === 0 ? 0 : rows[Math.min(step, rows.length) - 1].runHotspots;

  const openSystem = (n: FlowNode) => {
    setSheetNode(n);
    onSystemOpen?.(n.id);
  };

  return (
    <div ref={ref} className="relative grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
      {/* ambient wash - the concept piece's depth, behind everything */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-[22%] top-[6%] hidden h-[70%] w-[46%] rounded-full bg-violet-400/10 blur-3xl lg:block"
      />
      {/* Emotional panel - sticky on desktop, climbs as you scroll */}
      <aside className="lg:sticky lg:top-6 lg:self-start">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy-800 via-navy-800 to-[#1B1440] p-5 text-white shadow-xl shadow-navy-900/25">
          {/* ambient glow */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-teal-400/20 blur-3xl"
          />
          <div className="relative">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-teal-300 ring-1 ring-white/15">
                <User size={17} aria-hidden="true" />
              </span>
              <p className="text-sm font-semibold">{pack.lexicon.subjectArtefact}</p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-1">
              <div>
                <div className="flex items-baseline gap-2">
                  <motion.span
                    key={shownPlaces}
                    initial={reduce ? false : { scale: 0.82 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 460, damping: 18 }}
                    className="text-6xl font-bold tabular-nums leading-none tracking-tight text-teal-300"
                  >
                    {shownPlaces}
                  </motion.span>
                  <MapPin size={16} className="text-teal-300/60" aria-hidden="true" />
                </div>
                <p className="mt-1.5 text-[12px] font-medium text-slate-300">
                  places their data now lives
                </p>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <motion.span
                    key={shownHotspots}
                    initial={reduce ? false : { scale: 0.82 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 460, damping: 18 }}
                    className="text-6xl font-bold tabular-nums leading-none tracking-tight text-red-300"
                  >
                    {shownHotspots}
                  </motion.span>
                  <AlertTriangle size={16} className="text-red-300/60" aria-hidden="true" />
                </div>
                <p className="mt-1.5 text-[12px] font-medium text-slate-300">
                  places control breaks
                </p>
              </div>
            </div>

            <p className="mt-5 flex items-start gap-2 border-t border-white/10 pt-4 text-sm font-semibold leading-snug">
              <Trash2 size={16} className="mt-0.5 shrink-0 text-teal-300" aria-hidden="true" />
              <span>
                If they ask you to delete it tomorrow -{" "}
                <span className="relative inline-block whitespace-nowrap text-teal-300">
                  can you find every copy?
                  <motion.span
                    aria-hidden="true"
                    className="absolute -bottom-0.5 left-0 h-[2px] bg-teal-300"
                    initial={false}
                    animate={{ width: step >= rows.length ? "100%" : "0%" }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                  />
                </span>
              </span>
            </p>

            {/* Legend lives here, not in a section further down the page: the
                panel is sticky, so the key to the colours stays on screen for
                the whole scroll - which is exactly when you need it. */}
            <dl className="mt-4 border-t border-white/10 pt-3.5">
              <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                How to read the chips
              </dt>
              <div className="mt-2.5 flex flex-col gap-2">
                <dd className="flex items-center gap-2.5 text-[11px] leading-tight text-slate-300">
                  <span
                    aria-hidden="true"
                    className="h-4 w-7 shrink-0 rounded border border-white/20 border-l-4 border-l-violet-400 bg-white/5"
                  />
                  Left edge - sits outside your {pack.lexicon.org}
                </dd>
                <dd className="flex items-center gap-2.5 text-[11px] leading-tight text-slate-300">
                  <span
                    aria-hidden="true"
                    className="h-4 w-7 shrink-0 rounded border border-amber-400/60 bg-amber-400/25"
                  />
                  Amber or red fill - high or critical risk
                </dd>
                <dd className="flex items-center gap-2.5 text-[11px] leading-tight text-slate-300">
                  <span
                    aria-hidden="true"
                    className="h-4 w-7 shrink-0 rounded bg-teal-400/30 ring-1 ring-inset ring-teal-300"
                  />
                  Teal - personal data new at that stage
                </dd>
              </div>
              <p className="mt-2.5 text-[11px] leading-snug text-slate-400">
                Risk and location are separate. An outside system can be low risk; an in-house
                one can be your worst.
              </p>
            </dl>
          </div>
        </div>
        <p className="mt-2 px-1 text-[11px] leading-relaxed text-slate-600">{pack.disclaimer}</p>
      </aside>

      {/* The journey */}
      <div className="relative">
        <div ref={sentinelRef} aria-hidden="true" className="absolute left-0 top-0 h-px w-px" />
      <ol className="relative">
        {rows.map((row, i) => {
          const reached = i < step;
          const isHot = row.hotspotNames.length > 0;
          const StageIcon = STAGE_ICONS[row.stage.id] ?? ClipboardList;
          const gradient = TILE_GRADIENTS[i % TILE_GRADIENTS.length];
          return (
            <li key={row.stage.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <motion.span
                  className={cn(
                    "relative flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl text-white",
                    "shadow-lg shadow-navy-900/20 ring-1 ring-inset ring-white/25",
                    isHot && "ring-2 ring-red-400/70",
                  )}
                  style={{
                    backgroundImage: `linear-gradient(160deg, ${gradient[0]}, ${gradient[1]})`,
                  }}
                  animate={reached && !reduce ? { scale: [1, 1.09, 1], y: [0, -2, 0] } : { scale: 1 }}
                  transition={{ duration: 0.45 }}
                >
                  <StageIcon size={23} strokeWidth={1.7} aria-hidden="true" />
                  <span className="absolute -bottom-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-navy-800 shadow ring-1 ring-slate-200">
                    {i + 1}
                  </span>
                </motion.span>
                {i < rows.length - 1 && (
                  <span className="relative mt-1 w-[3px] flex-1 rounded bg-slate-200">
                    <motion.span
                      className="absolute inset-x-0 top-0 rounded bg-gradient-to-b from-violet-400 to-teal-400"
                      initial={false}
                      animate={{ height: reached ? "100%" : "0%" }}
                      transition={{ duration: 0.45 }}
                    />
                  </span>
                )}
              </div>

              <div
                className={cn(
                  "mb-4 flex-1 rounded-2xl border bg-white p-5 transition-all duration-300",
                  isHot ? "border-red-200" : "border-slate-200",
                  reached ? "shadow-lg shadow-navy-900/[0.06]" : "shadow-none",
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="flex items-center gap-2 text-[17px] font-semibold tracking-tight text-navy-800">
                    {row.stage.name}
                    {isHot && (
                      <motion.span
                        className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-700"
                        initial={false}
                        animate={{ opacity: reached ? 1 : 0.15, x: reached ? 0 : -4 }}
                        transition={{ duration: 0.35 }}
                      >
                        <AlertTriangle size={11} aria-hidden="true" /> control breaks
                      </motion.span>
                    )}
                  </h3>
                  {row.placesHere > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                      <MapPin size={11} aria-hidden="true" /> +{row.placesHere} {row.placesHere === 1 ? "place" : "places"} · {row.runPlaces} so far
                    </span>
                  )}
                </div>

                <p className="mt-2 text-[13px] leading-relaxed text-slate-600">{row.stage.summary}</p>

                {isHot && (
                  <p className="mt-2 text-[12px] font-medium text-red-700">
                    Where control breaks: {row.hotspotNames.join(" · ")}
                  </p>
                )}

                {/* What personal data moves here. Teal is the third semantic -
                    it collides with neither risk (amber/red) nor boundary
                    (violet), and this IS the candidate's own data, so the
                    brand's "your side" hue is apt. Categories new at this stage
                    are filled and pulse ONCE as the stage lands; repeats stay
                    outlined so the eye goes to what changed. The pulse is a
                    single settling beat, not a loop - a compliance page that
                    throbs is a page people stop reading. */}
                {row.moving.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800">
                      Moving here
                    </span>
                    {row.moving.slice(0, MAX_CATEGORY_CHIPS).map((c, k) => {
                      const isNew = row.newCategoryIds.has(c.id);
                      // Only tag data the business inferred when the category's
                      // own name doesn't already say so - "Derived & inferred
                      // data · inferred" reads as a bug.
                      const tagInferred =
                        c.kind === "derived" && !/inferred|derived/i.test(c.name);
                      return (
                        <motion.span
                          key={c.id}
                          initial={false}
                          animate={
                            isNew && reached && !reduce
                              ? { scale: [1, 1.13, 1], opacity: [0.75, 1, 1] }
                              : { scale: 1, opacity: 1 }
                          }
                          transition={{
                            duration: 0.55,
                            delay: reached && !reduce ? 0.18 + k * 0.07 : 0,
                            ease: "easeOut",
                          }}
                          className={cn(
                            "rounded-md px-2 py-0.5 text-[11px]",
                            isNew
                              ? "bg-teal-100 font-bold text-teal-900 ring-1 ring-inset ring-teal-500"
                              : "bg-white font-medium text-slate-600 ring-1 ring-inset ring-slate-200",
                          )}
                        >
                          {c.name}
                          {tagInferred && <span className="ml-1 font-bold">· inferred</span>}
                          {isNew && <span className="sr-only"> (new at this stage)</span>}
                        </motion.span>
                      );
                    })}
                    {row.moving.length > MAX_CATEGORY_CHIPS && (
                      <span className="text-[11px] text-slate-600">
                        +{row.moving.length - MAX_CATEGORY_CHIPS} more
                      </span>
                    )}
                  </div>
                )}

                {row.systems.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {row.systems.map((n, j) => {
                      // Two independent axes. Risk paints the fill; boundary
                      // paints the left rule. A high-risk in-house system and a
                      // low-risk client system must not look alike.
                      const risk = RISK_META[n.riskLevel];
                      const RiskIcon = risk.icon;
                      const bound = { ...BOUNDARY_META[n.boundary], label: boundaryLabel(pack, n.boundary) };
                      const BoundaryIcon = bound.icon;
                      const external = EXTERNAL_BOUNDARY_SET.has(n.boundary);
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
                            // AXIS 1 - risk drives the fill
                            n.riskLevel === "critical"
                              ? "border-red-300 bg-red-50 text-red-900 hover:bg-red-100"
                              : n.riskLevel === "high"
                                ? "border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
                                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                            // AXIS 2 - boundary drives the left rule
                            bound.rule,
                          )}
                        >
                          <BoundaryIcon
                            size={13}
                            className="shrink-0 opacity-70"
                            aria-hidden="true"
                          />
                          {n.name}
                          {n.shadowIt && (
                            <span className="rounded bg-white/70 px-1 text-[10px] font-semibold text-slate-500">
                              unmanaged
                            </span>
                          )}
                          {external && (
                            <span
                              className={cn(
                                "rounded px-1 text-[10px] font-semibold ring-1 ring-inset",
                                bound.pill,
                              )}
                            >
                              {bound.label}
                            </span>
                          )}
                          <RiskIcon
                            size={13}
                            className={cn(
                              "shrink-0",
                              n.riskLevel === "critical"
                                ? "text-red-600"
                                : n.riskLevel === "high"
                                  ? "text-amber-600"
                                  : n.riskLevel === "medium"
                                    ? "text-slate-400"
                                    : "text-green-800",
                            )}
                            aria-hidden="true"
                          />
                          {/* aria-label on an inline SVG is unreliable; give the
                              screen reader both axes as real text instead. */}
                          <span className="sr-only">
                            {risk.label}
                            {external
                              ? `, outside your ${pack.lexicon.org}: ${bound.label}`
                              : `, inside your ${pack.lexicon.org}`}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                )}

                <p className="mt-3 flex items-start gap-1.5 border-t border-slate-100 pt-2.5 text-[12px] leading-relaxed text-teal-900">
                  <span className="mt-px shrink-0 rounded bg-teal-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-teal-800">
                    DPDPA
                  </span>
                  {row.stage.dpdpaNote}
                </p>
              </div>

              {/* Flying resume copies - the artifact's signature: one document
                  flies out per NEW PLACE this stage adds, so the paper, the
                  chips and the counter are all the same count. Desktop delight;
                  the counter carries the story on mobile. */}
              <div className="relative hidden w-24 shrink-0 lg:block" aria-hidden="true">
                {Array.from({ length: Math.min(row.placesHere, 6) }).map((_, j) => (
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
      </div>

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
        In this reference model, one {pack.lexicon.subject}&apos;s data ends up in {totalPlaces} distinct places
        across {rows.length} stages, with {totalHotspots} places where control breaks.
      </span>
    </div>
  );
}
