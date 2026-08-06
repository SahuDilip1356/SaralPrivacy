// Client-safe view of "which sectors have a live data-flow map".
//
// lib/data/data-flow/index.ts is the registry of record, but importing it
// pulls every flow pack into the bundle — fine on the server, ruinous in a
// client component. Client surfaces (FlowCrossLink) resolve against this list
// instead. live-slugs.test.ts asserts it never drifts from the registry, so
// publishing map #13 means adding its slug here too — the test fails loudly
// if you forget.

// Explicit .ts extension so live-slugs.test.ts can load this under plain
// `node --test` (same convention as the pack files).
import { SECTORS, type Sector } from "../sectors.ts";

export const LIVE_FLOW_MAP_SLUGS: readonly string[] = [
  "recruitment-agencies",
  "ca-firms",
  "training-institutes",
  "d2c-brands",
  "clinics-diagnostic-labs",
  "schools-colleges",
  "law-firms",
  "real-estate",
  "hotels-travel",
  "pharmacies",
  "fintech-nbfc",
  "gyms-salons-spas",
];

export interface FlowMapLink {
  href: string;
  sector: Sector;
}

/** Deep link for a sector's live flow map, or null when no live map exists. */
export function resolveFlowMapLink(sectorSlug?: string | null): FlowMapLink | null {
  if (!sectorSlug || !LIVE_FLOW_MAP_SLUGS.includes(sectorSlug)) return null;
  const sector = SECTORS.find((s) => s.slug === sectorSlug);
  if (!sector) return null;
  return { href: `/industries/${sectorSlug}/data-flow`, sector };
}
