// Notice Pack — profile resolver (v2). The single source the wizard consumes once an
// industry niche is selected. Derives the industry-scoped profile from the discovery
// taxonomy (data items + purposes + risk tags + obligations) and layers the category
// overlay. Nothing here is hand-built per sector — it resolves at runtime per niche.
import { getNiche, getCategory, nichesInCategory } from "@/lib/discovery/data";
import { resolveGroups } from "@/lib/discovery/engine";
import { TAG_LIB } from "@/lib/discovery/data.generated";
import type { Role } from "@/lib/discovery/types";
import { overlayFor, type CategoryOverlay } from "./category-overlays";

// High-care = any risk tag with weight ≥ 3 (FINANCIAL/HEALTH/CHILD/LOCATION/BIOMETRIC…),
// read from the discovery TagLib so it stays in sync with the master taxonomy.
const isHighCare = (tags: string[]) => tags.some((t) => (TAG_LIB[t]?.weight ?? 0) >= 3);

export interface ProfileDataItem {
  id: string;
  label: string;
  purpose: string;          // suggested purpose from discovery (processingPurposes)
  bucket: "Core" | "Operational" | "Hidden";
  tags: string[];
  highCare: boolean;
  defaultSelected: boolean;
  obligations: string[];
  precaution: string;
}
export interface ProfileGroup {
  key: "core" | "operational" | "hidden";
  title: string;
  items: ProfileDataItem[];
}
export interface ResolvedNoticeProfile {
  nicheId: string;
  nicheName: string;
  categoryId: string;
  categoryName: string;
  role: Role;                // F | P | B
  childrenDefault: boolean;
  groups: ProfileGroup[];
  collectionPoints: string[];
  vendorCategories: string[];
  retentionGuidance: string;
  overlay: CategoryOverlay;
}

/** Resolve the industry-scoped Notice Pack profile for a discovery niche id. */
export function noticeProfile(nicheId: string): ResolvedNoticeProfile | null {
  const niche = getNiche(nicheId);
  if (!niche) return null;
  const cat = getCategory(niche.cat);
  const overlay = overlayFor(niche.cat);

  const groups: ProfileGroup[] = resolveGroups(nicheId).map((g) => ({
    key: g.key,
    title: g.title,
    items: g.items.map((it) => ({
      id: it.id,
      label: it.item,
      purpose: (it.processingPurposes || "").split("; ")[0] || "",
      bucket: it.bucket,
      tags: it.tags,
      highCare: isHighCare(it.tags),
      defaultSelected: it.def,
      obligations: it.obligations,
      precaution: it.precaution,
    })),
  }));

  const childrenDefault = groups.some((g) =>
    g.items.some((i) => i.tags.includes("CHILD_DATA") || i.obligations.includes("Children (verifiable consent)"))
  );

  return {
    nicheId,
    nicheName: niche.name,
    categoryId: niche.cat,
    categoryName: cat?.name || niche.cat,
    role: niche.role,
    childrenDefault,
    groups,
    collectionPoints: overlay.collectionPoints,
    vendorCategories: overlay.vendorCategories,
    retentionGuidance: overlay.retentionGuidance,
    overlay,
  };
}

/** All default-selected data items for a niche (the initial scoped selection). */
export function defaultSelectedIds(p: ResolvedNoticeProfile): string[] {
  return p.groups.flatMap((g) => g.items.filter((i) => i.defaultSelected).map((i) => i.id));
}

// Re-exports so the wizard's Step-1 picker can list categories → niches.
export { nichesInCategory, getCategory };
