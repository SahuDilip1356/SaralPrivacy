// "What personal data is moving at this stage" - derived, never stored.
//
// The map has always known this: every edge carries `dataCategoryIds`. It was
// only ever shown inside the per-node and per-edge detail panels, so the
// primary journey read as a map of SYSTEMS rather than a map of PERSONAL DATA -
// which is what the product actually claims to be.
//
// Derived from EDGES, not nodes, for three reasons: the stage card is a
// movement narrative ("+N places", flying documents, a transfer obligation);
// node-derived would duplicate the system chips rendered directly above it; and
// nodes roll up at first appearance, which would leave the later stages empty
// while edges spread 1-8 per stage.
//
// Deliberately NOT a field on flowStageSchema. Derivable data should be
// derived - a hand-maintained copy on the stage is a second source of truth
// that can drift from the edges, which is the whole class of bug validatePack
// exists to catch.

// `.ts` extension is deliberate: the domain tests run under
// `node --test --experimental-strip-types`, which does not resolve extensionless
// relative imports. Matches the convention in lib/data/data-flow/**.
import type { BusinessModel, DataCategory, DataFlowPack } from "./schemas.ts";
import { filterByBusinessModel } from "./schemas.ts";

export interface StageDataRollup {
  stageId: string;
  /** Categories moving at this stage, in pack declaration order, new ones first. */
  moving: DataCategory[];
  /** Ids first seen at this stage - "is this new data, or the resume again?" */
  newIds: ReadonlySet<string>;
}

/**
 * Per-stage data categories for one business model, in stage sequence.
 *
 * Ordering is `pack.dataCategories` declaration order (stable and editorially
 * controlled - NOT edge-encounter order, which is arbitrary), with categories
 * making their first appearance hoisted to the front so the interesting item
 * leads.
 */
export function stageDataRollup(
  pack: DataFlowPack,
  model: BusinessModel,
): StageDataRollup[] {
  const { stages, edges } = filterByBusinessModel(pack, model);
  const ordered = [...stages].sort((a, b) => a.sequence - b.sequence);
  const rank = new Map(pack.dataCategories.map((c, i) => [c.id, i]));
  const byId = new Map(pack.dataCategories.map((c) => [c.id, c]));

  const seen = new Set<string>();
  return ordered.map((stage) => {
    const ids = new Set<string>();
    for (const e of edges) {
      if (e.stageId !== stage.id) continue;
      for (const id of e.dataCategoryIds) ids.add(id);
    }

    const newIds = new Set<string>();
    for (const id of ids) if (!seen.has(id)) newIds.add(id);

    const moving = [...ids]
      .map((id) => byId.get(id))
      .filter((c): c is DataCategory => Boolean(c))
      .sort((a, b) => {
        const aNew = newIds.has(a.id) ? 0 : 1;
        const bNew = newIds.has(b.id) ? 0 : 1;
        if (aNew !== bNew) return aNew - bNew;
        return (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0);
      });

    for (const id of ids) seen.add(id);
    return { stageId: stage.id, moving, newIds };
  });
}
