"use client";

// The full system map, for IT and compliance.
//
// Replaces the React Flow graph that used to live here. That graph showed 31
// nodes and 49 crossing edges with no sense of ownership - readable only if you
// already knew the answer. This lays the same data on two axes that are already
// in the pack and that auditors actually think in:
//
//   rows    = trust boundary, outward from the candidate
//   columns = journey stage
//
// so a system sits at "where it lives" x "when it first appears", and the
// single dashed control wall marks the row where your control stops being
// direct. Connections are drawn from measured cell positions and can be
// filtered down, because "everything at once" is the failure mode the old graph
// had - copies-only and crossings-only are the views that answer a question.
//
// Deliberately desktop-first and horizontally scrollable: this is the opt-in
// audit surface. The vertical journey above stays the primary, mobile-first
// experience.

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type {
  BusinessModel,
  Boundary,
  DataFlowPack,
  FlowNode,
  RiskLevel,
} from "@/lib/data-flow/schemas";
import { filterByBusinessModel } from "@/lib/data-flow/schemas";
import { BOUNDARY_META, EXTERNAL_BOUNDARY_SET, RISK_META, boundaryLabel } from "./flow-theme";

export const WIRE_MODES = ["copies", "external", "all", "none"] as const;
export type WireMode = (typeof WIRE_MODES)[number];

export const WIRE_LABELS: Record<WireMode, string> = {
  copies: "Copies",
  external: "Boundary crossings",
  all: "All movement",
  none: "No connections",
};

/** Outward order: the candidate, then you, then everyone past the wall. */
const LANE_ORDER: readonly Boundary[] = [
  "candidate",
  "agency",
  "client",
  "vendor",
  "third-party",
  "government",
  "public",
];

const LANE_SUB: Record<Boundary, string> = {
  candidate: "Their own copy",
  agency: "You control this",
  client: "Contract, not control",
  vendor: "Contract, not control",
  "third-party": "No processing contract",
  government: "Statutory",
  public: "Collected, not disclosed",
};

interface Props {
  pack: DataFlowPack;
  model: BusinessModel;
  wires: WireMode;
  /** Risk levels still switched on. Others dim rather than disappear, so the
   *  board keeps its shape and you can see what you filtered out. */
  risks: ReadonlySet<RiskLevel>;
  selectedId?: string;
  onSelect: (nodeId: string) => void;
}

export function BoundaryLaneMap({ pack, model, wires, risks, selectedId, onSelect }: Props) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [paths, setPaths] = useState<
    { d: string; external: boolean; copy: boolean; on: boolean }[]
  >([]);
  const [box, setBox] = useState({ w: 0, h: 0 });

  const view = useMemo(() => {
    const { stages, nodes, edges } = filterByBusinessModel(pack, model);
    const ordered = [...stages].sort((a, b) => a.sequence - b.sequence);
    const seq = new Map(ordered.map((s) => [s.id, s.sequence]));
    // Same rule as the journey counter: a system belongs to the first stage it
    // reaches, so the two surfaces can never disagree about where it appears.
    const home = new Map(
      nodes.map((n) => [
        n.id,
        n.stageIds.filter((id) => seq.has(id)).sort((a, b) => seq.get(a)! - seq.get(b)!)[0],
      ]),
    );
    const lanes = LANE_ORDER.filter((b) => nodes.some((n) => n.boundary === b));
    return { stages: ordered, nodes, edges, home, lanes };
  }, [pack, model]);

  const hotRank = useMemo(
    () => new Map(pack.hotspots.map((h) => [h.nodeId, h.rank])),
    [pack.hotspots],
  );

  // Wires depend on real geometry, so they are measured after layout. Measured
  // in a layout effect and re-measured on resize; never on rAF alone, which does
  // not fire in a hidden tab and would leave the board blank on first paint.
  const measure = useCallback(() => {
    const board = boardRef.current;
    if (!board) return;
    const bb = board.getBoundingClientRect();
    setBox({ w: bb.width, h: bb.height });
    if (wires === "none") {
      setPaths([]);
      return;
    }
    const at = (id: string) => {
      const el = board.querySelector<HTMLElement>(`[data-node="${CSS.escape(id)}"]`);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.left - bb.left + r.width / 2, y: r.top - bb.top + r.height / 2 };
    };
    const keep = (e: (typeof view.edges)[number]) =>
      wires === "all" ? true : wires === "copies" ? e.createsCopy : e.external;

    const seen = new Set<string>();
    const next: { d: string; external: boolean; copy: boolean; on: boolean }[] = [];
    for (const e of view.edges) {
      if (!keep(e)) continue;
      const key = `${e.source}>${e.target}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const a = at(e.source);
      const b = at(e.target);
      if (!a || !b) continue;
      const c = Math.max(26, Math.min(Math.abs(b.y - a.y) * 0.5 + 18, 70));
      next.push({
        d: `M${a.x},${a.y} C${a.x + c},${a.y} ${b.x - c},${b.y} ${b.x},${b.y}`,
        external: e.external,
        copy: e.createsCopy,
        on: Boolean(selectedId) && (e.source === selectedId || e.target === selectedId),
      });
    }
    setPaths(next);
  }, [view, wires, selectedId]);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(board);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  const cols = `180px repeat(${view.stages.length}, minmax(146px, 1fr))`;
  let wallDrawn = false;

  return (
    <div className="overflow-x-auto">
      <div ref={boardRef} className="relative min-w-max">
        <div className="grid" style={{ gridTemplateColumns: cols }}>
          {/* header row */}
          <div className="sticky left-0 z-20 border-b border-r border-slate-200 bg-slate-50 px-3 py-2.5">
            <span className="block text-[12px] font-bold text-navy-800">Trust boundary</span>
            <span className="block text-[10.5px] text-slate-400">
              {view.stages.length} stages &rarr;
            </span>
          </div>
          {view.stages.map((s, i) => {
            const n = view.nodes.filter(
              (x) => x.nodeType !== "person" && view.home.get(x.id) === s.id,
            ).length;
            return (
              <div
                key={s.id}
                className="border-b border-slate-200 bg-slate-50 px-2.5 py-2.5"
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-navy-700 text-[10.5px] font-bold tabular-nums text-white">
                  {i + 1}
                </span>
                <span className="mt-1.5 block text-[11.5px] font-semibold leading-tight text-navy-800">
                  {s.name}
                </span>
                <span className="mt-0.5 block text-[10.5px] tabular-nums text-slate-400">
                  {n ? `+${n} ${n === 1 ? "place" : "places"}` : "no new place"}
                </span>
              </div>
            );
          })}

          {/* lanes */}
          {view.lanes.map((b) => {
            const external = EXTERNAL_BOUNDARY_SET.has(b);
            const wall = external && !wallDrawn;
            if (wall) wallDrawn = true;
            const meta = { ...BOUNDARY_META[b], label: boundaryLabel(pack, b) };
            return (
              <FragmentRow
                key={b}
                boundary={b}
                meta={meta}
                external={external}
                wall={wall}
                stages={view.stages}
                nodes={view.nodes}
                home={view.home}
                hotRank={hotRank}
                risks={risks}
                selectedId={selectedId}
                onSelect={onSelect}
              />
            );
          })}
        </div>

        {box.w > 0 && (
          <svg
            className="pointer-events-none absolute inset-0 z-0 overflow-visible"
            width={box.w}
            height={box.h}
            viewBox={`0 0 ${box.w} ${box.h}`}
            aria-hidden="true"
          >
            {paths.map((p, i) => (
              <path
                key={i}
                d={p.d}
                fill="none"
                stroke={p.external ? "#8e51ff" : "#35b6ae"}
                strokeWidth={p.copy ? 2.4 : 1.3}
                strokeDasharray={p.external ? "5 4" : undefined}
                opacity={selectedId ? (p.on ? 0.95 : 0.06) : p.copy ? 0.42 : 0.2}
              />
            ))}
          </svg>
        )}
      </div>
    </div>
  );
}

function FragmentRow({
  boundary,
  meta,
  external,
  wall,
  stages,
  nodes,
  home,
  hotRank,
  risks,
  selectedId,
  onSelect,
}: {
  boundary: Boundary;
  meta: (typeof BOUNDARY_META)[Boundary];
  external: boolean;
  wall: boolean;
  stages: { id: string }[];
  nodes: FlowNode[];
  home: Map<string, string | undefined>;
  hotRank: Map<string, number>;
  risks: ReadonlySet<RiskLevel>;
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  const LaneIcon = meta.icon;
  return (
    <>
      <div
        className={cn(
          "sticky left-0 z-10 flex flex-col justify-center gap-0.5 border-b border-r border-slate-200 bg-white px-3 py-3",
          external ? "border-l-4 border-l-violet-500" : "border-l-4 border-l-teal-500",
          wall && "border-t-2 border-t-dashed border-t-violet-500",
        )}
      >
        {wall && (
          <span className="mb-1 inline-flex w-fit items-center rounded-full border border-violet-500 px-1.5 py-px text-[9px] font-bold uppercase tracking-wider text-violet-700">
            control wall
          </span>
        )}
        <span className="flex items-center gap-1.5 text-[12px] font-bold text-navy-800">
          <LaneIcon size={13} className="shrink-0 opacity-70" aria-hidden="true" />
          {meta.label}
        </span>
        <span className="text-[10.5px] leading-tight text-slate-400">{LANE_SUB[boundary]}</span>
      </div>

      {stages.map((s) => {
        const here = nodes.filter((n) => n.boundary === boundary && home.get(n.id) === s.id);
        return (
          <div
            key={s.id}
            className={cn(
              "flex flex-col items-start gap-1.5 border-b border-slate-100 px-2 py-2",
              external ? "bg-violet-50/40" : "bg-teal-50/30",
              wall && "border-t-2 border-t-dashed border-t-violet-500",
            )}
          >
            {here.map((n) => {
              const risk = RISK_META[n.riskLevel];
              const rank = hotRank.get(n.id);
              const on = selectedId === n.id;
              const muted = !risks.has(n.riskLevel);
              return (
                <button
                  key={n.id}
                  type="button"
                  data-node={n.id}
                  onClick={() => onSelect(n.id)}
                  aria-pressed={on}
                  className={cn(
                    "relative z-10 flex w-full flex-col gap-1 rounded-lg border px-2 py-1.5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
                    n.riskLevel === "critical"
                      ? "border-red-300 bg-red-50"
                      : n.riskLevel === "high"
                        ? "border-amber-300 bg-amber-50"
                        : "border-slate-200 bg-white",
                    on ? "ring-2 ring-navy-700" : "hover:shadow-md",
                  )}
                  // Inline, not a utility class: this is a state-driven value,
                  // and the Tailwind build did not emit `opacity-25` for it -
                  // the class applied but computed to 1. Inline is deterministic.
                  style={{ opacity: muted ? 0.22 : 1 }}
                  aria-hidden={muted || undefined}
                  tabIndex={muted ? -1 : undefined}
                >
                  <span className="text-[11.5px] font-semibold leading-tight text-navy-800">
                    {n.name}
                  </span>
                  <span className="flex flex-wrap items-center gap-1">
                    <span
                      className={cn(
                        "rounded-full border px-1.5 text-[9px] font-bold uppercase tracking-wide",
                        risk.chip,
                      )}
                    >
                      {n.riskLevel}
                    </span>
                    {n.shadowIt && (
                      <span className="rounded-full border border-slate-200 px-1.5 text-[9px] font-bold uppercase tracking-wide text-slate-500">
                        unmanaged
                      </span>
                    )}
                    {rank && (
                      <span className="rounded-full bg-red-600 px-1.5 text-[9px] font-bold uppercase tracking-wide text-white">
                        hot {rank}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        );
      })}
    </>
  );
}
