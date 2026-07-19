"use client";

// Client shell: view/model/riskHeat/selection state, desktop canvas vs mobile
// journey breakpoint switch, analytics. Receives the pack as a prop — the
// business map is configuration, never hard-coded here.

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { trackEvent } from "@/lib/analytics";
import type { BusinessModel, DataFlowPack } from "@/lib/data-flow/schemas";
import { filterByBusinessModel } from "@/lib/data-flow/schemas";
import { buildProjection, type FlowView } from "@/lib/data-flow/map-builder";
import { FlowToolbar } from "@/components/data-flow/FlowToolbar";
import { FlowLegend } from "@/components/data-flow/FlowLegend";
import { NodeDetailPanel } from "@/components/data-flow/NodeDetailPanel";
import { EdgeDetailPanel } from "@/components/data-flow/EdgeDetailPanel";
import { HotspotRail } from "@/components/data-flow/HotspotRail";
import { MobileFlowView } from "@/components/data-flow/MobileFlowView";
import type { FlowSelection } from "@/components/data-flow/selection";

// Canvas chunk is desktop-only enhancement; skeleton while it loads
// (design-review state-coverage fix).
const DataFlowCanvas = dynamic(() => import("@/components/data-flow/DataFlowCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center rounded-xl border border-slate-200 bg-white">
      <p className="animate-pulse text-sm font-medium text-slate-400">Loading the map…</p>
    </div>
  ),
});

interface Props {
  pack: DataFlowPack;
}

export default function DataFlowClient({ pack }: Props) {
  const [view, setView] = useState<FlowView>("process");
  const [model, setModel] = useState<BusinessModel>("permanent");
  const [riskHeat, setRiskHeat] = useState(false);
  const [dpdpaOverlay, setDpdpaOverlay] = useState(false);
  const [selection, setSelection] = useState<FlowSelection>(null);
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    trackEvent.dataFlow("data_flow_opened", { industry: pack.industry });
  }, [pack.industry]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const projection = useMemo(
    () => buildProjection(pack, { view, model }),
    [pack, view, model],
  );
  const visible = useMemo(() => filterByBusinessModel(pack, model), [pack, model]);
  const visibleCounts = useMemo(
    () => ({
      stages: visible.stages.length,
      systems: visible.nodes.filter((n) => n.nodeType !== "person").length,
    }),
    [visible],
  );

  const selectedNode =
    selection?.kind === "node" ? pack.nodes.find((n) => n.id === selection.id) : undefined;
  const selectedEdge =
    selection?.kind === "edge" ? pack.edges.find((e) => e.id === selection.id) : undefined;

  const handleViewChange = useCallback((v: FlowView) => {
    setView(v);
    trackEvent.dataFlow("view_changed", { view: v });
  }, []);
  const handleModelChange = useCallback((m: BusinessModel) => {
    setModel(m);
    setSelection(null);
    trackEvent.dataFlow("business_model_selected", { model: m });
  }, []);
  const handleRiskHeat = useCallback(() => {
    setRiskHeat((r) => {
      if (!r) trackEvent.dataFlow("risk_overlay_enabled", {});
      return !r;
    });
  }, []);
  const handleDpdpaOverlay = useCallback(() => {
    setDpdpaOverlay((d) => {
      if (!d) trackEvent.dataFlow("dpdpa_overlay_enabled", {});
      return !d;
    });
  }, []);
  const handleReset = useCallback(() => {
    setView("process");
    setModel("permanent");
    setRiskHeat(false);
    setDpdpaOverlay(false);
    setSelection(null);
  }, []);
  const handleSelect = useCallback((sel: FlowSelection) => {
    setSelection(sel);
    if (sel?.kind === "node") trackEvent.dataFlow("node_clicked", { node_id: sel.id });
    if (sel?.kind === "edge") trackEvent.dataFlow("edge_clicked", { edge_id: sel.id });
  }, []);
  const handleHotspotSelect = useCallback((nodeId: string, hotspotId: string) => {
    setSelection({ kind: "node", id: nodeId });
    trackEvent.dataFlow("hotspot_clicked", { hotspot_id: hotspotId });
    document.getElementById("flow-canvas-region")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);
  const handleAssessmentCta = useCallback((bucket?: string) => {
    trackEvent.dataFlow("assessment_cta_clicked", bucket ? { bucket } : {});
  }, []);

  // Keyboard: Esc clears selection.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelection(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="space-y-10">
      <section id="flow-canvas-region" aria-label="Interactive data flow map" className="scroll-mt-20">
        {/* Desktop: toolbar + canvas + panel. Mobile: journey. isDesktop===null
            (pre-hydration) renders the mobile journey — real, crawlable content
            either way (also the canvas-failure fallback). */}
        {isDesktop ? (
          <div className="space-y-3">
            <FlowToolbar
              view={view}
              model={model}
              riskHeat={riskHeat}
              dpdpaOverlay={dpdpaOverlay}
              visibleCounts={visibleCounts}
              onViewChange={handleViewChange}
              onModelChange={handleModelChange}
              onRiskHeatToggle={handleRiskHeat}
              onDpdpaToggle={handleDpdpaOverlay}
              onReset={handleReset}
            />
            <div className="flex gap-3">
              <div className="relative h-[68vh] min-h-[480px] flex-1 overflow-hidden rounded-xl border border-slate-200">
                <DataFlowCanvas
                  projection={projection}
                  riskHeat={riskHeat}
                  dpdpaOverlay={dpdpaOverlay}
                  selection={selection}
                  onSelect={handleSelect}
                />
                <div className="pointer-events-none absolute bottom-3 left-3 z-10 hidden xl:block">
                  <FlowLegend />
                </div>
              </div>
              <aside className="hidden w-[360px] shrink-0 lg:block" aria-label="Details panel">
                {selectedNode ? (
                  <NodeDetailPanel
                    pack={pack}
                    node={selectedNode}
                    onClose={() => setSelection(null)}
                    onAssessmentCta={handleAssessmentCta}
                  />
                ) : selectedEdge ? (
                  <EdgeDetailPanel
                    pack={pack}
                    edge={selectedEdge}
                    onClose={() => setSelection(null)}
                    onAssessmentCta={() => handleAssessmentCta()}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center">
                    <p className="text-sm leading-relaxed text-slate-500">
                      Click any system on the map to see what it holds, who can access it, and
                      what to fix.
                    </p>
                  </div>
                )}
              </aside>
            </div>
            <div className="xl:hidden">
              <FlowLegend />
            </div>
          </div>
        ) : (
          <MobileFlowView
            pack={pack}
            model={model}
            onStageExpanded={(stageId) => trackEvent.dataFlow("stage_expanded", { stage_id: stageId })}
            onNodeSelected={(nodeId) => trackEvent.dataFlow("node_clicked", { node_id: nodeId })}
            onAssessmentCta={handleAssessmentCta}
          />
        )}
      </section>

      <section aria-labelledby="hotspots-heading">
        <h2 id="hotspots-heading" className="text-xl font-bold text-navy-800">
          Top risk hotspots — the canonical 7
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">
          The places where recruitment agencies most often lose control of candidate data. Each
          one links to the matching check in the readiness assessment.
        </p>
        <div className="mt-4">
          <HotspotRail
            pack={pack}
            onHotspotSelect={isDesktop ? handleHotspotSelect : undefined}
            onAssessmentCta={handleAssessmentCta}
          />
        </div>
      </section>
    </div>
  );
}
