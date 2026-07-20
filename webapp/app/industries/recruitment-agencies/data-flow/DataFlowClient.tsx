"use client";

// Client shell. PRIMARY experience = the animated, informative MotionJourney.
// The opt-in "full system map" is BoundaryLaneMap - trust boundaries as rows,
// stages as columns - for IT and compliance. The business map is configuration
// passed as a prop - never hard-coded here.

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, Map as MapIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import { BUSINESS_MODELS, type BusinessModel, type DataFlowPack } from "@/lib/data-flow/schemas";
import { filterByBusinessModel } from "@/lib/data-flow/schemas";
import { MotionJourney } from "@/components/data-flow/MotionJourney";
import {
  BoundaryLaneMap,
  WIRE_LABELS,
  WIRE_MODES,
  type WireMode,
} from "@/components/data-flow/BoundaryLaneMap";
import { HotspotRail } from "@/components/data-flow/HotspotRail";
import { DetailSheet } from "@/components/data-flow/DetailSheet";
import { NodeDetailPanel } from "@/components/data-flow/NodeDetailPanel";
import { EdgeDetailPanel } from "@/components/data-flow/EdgeDetailPanel";
import type { FlowSelection } from "@/components/data-flow/selection";

const MODEL_LABELS: Record<BusinessModel, string> = {
  permanent: "Permanent recruitment",
  staffing: "Staffing / RPO",
};

interface Props {
  pack: DataFlowPack;
}

export default function DataFlowClient({ pack }: Props) {
  const [model, setModel] = useState<BusinessModel>("permanent");
  const [mapOpen, setMapOpen] = useState(false);
  const [wires, setWires] = useState<WireMode>("copies");
  const [selection, setSelection] = useState<FlowSelection>(null);

  useEffect(() => {
    trackEvent.dataFlow("data_flow_opened", { industry: pack.industry });
  }, [pack.industry]);

  const visible = useMemo(() => filterByBusinessModel(pack, model), [pack, model]);
  const stageCount = visible.stages.length;

  const selectedNode =
    selection?.kind === "node" ? pack.nodes.find((n) => n.id === selection.id) : undefined;
  const selectedEdge =
    selection?.kind === "edge" ? pack.edges.find((e) => e.id === selection.id) : undefined;

  const handleModelChange = useCallback((m: BusinessModel) => {
    setModel(m);
    trackEvent.dataFlow("business_model_selected", { model: m });
  }, []);
  const handleAssessmentCta = useCallback((bucket?: string) => {
    trackEvent.dataFlow("assessment_cta_clicked", bucket ? { bucket } : {});
  }, []);
  const handleMapToggle = useCallback(() => {
    setMapOpen((o) => {
      if (!o) trackEvent.dataFlow("full_map_opened", {});
      return !o;
    });
  }, []);
  const handleMapSelect = useCallback((sel: FlowSelection) => {
    setSelection(sel);
    if (sel?.kind === "node") trackEvent.dataFlow("node_clicked", { node_id: sel.id });
    if (sel?.kind === "edge") trackEvent.dataFlow("edge_clicked", { edge_id: sel.id });
  }, []);
  // HotspotRail renders each title as a button and has always accepted this
  // callback, but it was never passed - so all 7 titles were inert. Opening the
  // node's detail sheet is what the rail's own header comment promised.
  const handleHotspotSelect = useCallback((nodeId: string, hotspotId: string) => {
    setSelection({ kind: "node", id: nodeId });
    trackEvent.dataFlow("hotspot_clicked", { node_id: nodeId, hotspot_id: hotspotId });
  }, []);

  return (
    <div className="space-y-10">
      {/* Business-model selector - switching Staffing/RPO visibly grows the
          journey by the onboarding + exit stages. */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-slate-600">Show the journey for:</span>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Business model">
          {BUSINESS_MODELS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => handleModelChange(m)}
              aria-pressed={model === m}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
                model === m
                  ? "bg-navy-700 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200",
              )}
            >
              {MODEL_LABELS[m]}
            </button>
          ))}
        </div>
        <span aria-live="polite" className="text-xs font-medium text-slate-500">
          {stageCount} stages
        </span>
      </div>

      <section aria-label="Candidate data journey">
        <MotionJourney
          key={model}
          pack={pack}
          model={model}
          onSystemOpen={(nodeId) => trackEvent.dataFlow("node_clicked", { node_id: nodeId })}
          onAssessmentCta={handleAssessmentCta}
        />
      </section>

      {/* Opt-in full system map (power users) */}
      <section aria-labelledby="full-map-heading">
        <button
          type="button"
          onClick={handleMapToggle}
          aria-expanded={mapOpen}
          className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
        >
          <span className="flex items-center gap-2">
            <MapIcon size={16} className="text-slate-500" aria-hidden="true" />
            <span id="full-map-heading" className="text-sm font-semibold text-navy-800">
              See the full system map
            </span>
            <span className="text-xs text-slate-500">
              every system and connection at once - for IT &amp; compliance teams
            </span>
          </span>
          <ChevronDown
            size={18}
            className={cn("shrink-0 text-slate-400 transition-transform", mapOpen && "rotate-180")}
            aria-hidden="true"
          />
        </button>

        {mapOpen && (
          <div className="mt-3 space-y-2">
            {/* Copies is the default, not "all". Everything at once was the old
                graph's failure - the filtered views are the ones that answer a
                question. */}
            <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Show connections">
              <span className="mr-1 text-xs font-medium text-slate-500">Show:</span>
              {WIRE_MODES.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => {
                    setWires(v);
                    trackEvent.dataFlow("view_changed", { view: v });
                  }}
                  aria-pressed={wires === v}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
                    wires === v ? "bg-navy-700 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200",
                  )}
                >
                  {WIRE_LABELS[v]}
                </button>
              ))}
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <BoundaryLaneMap
                pack={pack}
                model={model}
                wires={wires}
                selectedId={selection?.kind === "node" ? selection.id : undefined}
                onSelect={(nodeId) => handleMapSelect({ kind: "node", id: nodeId })}
              />
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11.5px] text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-0 w-5 border-t-2 border-teal-500" aria-hidden="true" />
                Moves within a boundary
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-0 w-5 border-t-2 border-dashed border-violet-500" aria-hidden="true" />
                Crosses a boundary
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-0 w-5 border-t-[3px] border-violet-500" aria-hidden="true" />
                Creates a copy
              </span>
              <span>Rows are trust boundaries; columns are stages. Tap any system for detail.</span>
            </div>
          </div>
        )}

        {selectedNode && (
          <DetailSheet onClose={() => setSelection(null)}>
            <NodeDetailPanel
              pack={pack}
              node={selectedNode}
              onClose={() => setSelection(null)}
              onAssessmentCta={handleAssessmentCta}
            />
          </DetailSheet>
        )}
        {selectedEdge && (
          <DetailSheet onClose={() => setSelection(null)}>
            <EdgeDetailPanel
              pack={pack}
              edge={selectedEdge}
              onClose={() => setSelection(null)}
              onAssessmentCta={() => handleAssessmentCta()}
            />
          </DetailSheet>
        )}
      </section>

      <section aria-labelledby="hotspots-heading">
        <h2 id="hotspots-heading" className="text-xl font-bold text-navy-800">
          Top risk hotspots - where control usually breaks
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">
          The seven places recruitment agencies most often lose track of candidate data. Each links
          to the matching check in the readiness assessment.
        </p>
        <div className="mt-4">
          <HotspotRail
            pack={pack}
            onHotspotSelect={handleHotspotSelect}
            onAssessmentCta={handleAssessmentCta}
          />
        </div>
      </section>
    </div>
  );
}
