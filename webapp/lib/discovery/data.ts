// Data-access layer for the discovery tool. Static import of the generated
// dataset (parses ~small thanks to dedup) + denormalization helpers.
import {
  CATEGORIES,
  NICHES,
  ITEM_DEFS,
  NICHE_ITEMS,
  TAG_LIB,
  SCORING,
  ROLES,
  PHASES,
  VERSION,
} from "./data.generated";
import type { Category, Niche, ItemRef, ItemDef } from "./types";

export { CATEGORIES, NICHES, ITEM_DEFS, NICHE_ITEMS, TAG_LIB, SCORING, ROLES, PHASES, VERSION };

const NICHE_BY_ID = new Map(NICHES.map((n) => [n.id, n]));
const CAT_BY_ID = new Map(CATEGORIES.map((c) => [c.id, c]));

export function getNiche(id: string): Niche | undefined {
  return NICHE_BY_ID.get(id);
}
export function getCategory(id: string): Category | undefined {
  return CAT_BY_ID.get(id);
}
export function nichesInCategory(catId: string): Niche[] {
  return NICHES.filter((n) => n.cat === catId);
}

// A per-niche item ref joined with its shared definition (no computed weight).
export interface DenormItem extends ItemDef, Omit<ItemRef, "ref"> {}

// Join NICHE_ITEMS[nicheId] refs against ITEM_DEFS. Returns [] for unknown niche.
export function denormNiche(nicheId: string): DenormItem[] {
  const refs = NICHE_ITEMS[nicheId];
  if (!refs) return [];
  return refs.map((r) => {
    const def = ITEM_DEFS[r.ref];
    return { ...def, seq: r.seq, bucket: r.bucket, def: r.def };
  });
}
