// Registry of the Personal Data Flow Maps that exist today.
//
// Single source of truth for "which sectors have a map". The /data-mapping
// landing page, the footer column and the sitemap all derive from this, so
// shipping the next map is: add the pack folder, add one line here. Nothing
// else needs editing and nothing can drift out of step.
//
// Sector labels come from lib/data/sectors.ts - the same single source the
// header, footer and assessment surfaces use - so a map never invents its own
// name for a sector.

import { SECTORS, type Sector } from "../sectors";
import type { DataFlowPack } from "../../data-flow/schemas";
import { recruitmentDataFlowPack } from "./recruitment";
import { caFirmsDataFlowPack } from "./ca-firms";
import { trainingInstitutesDataFlowPack } from "./training-institutes";
import { d2cBrandsDataFlowPack } from "./d2c-brands";
import { clinicsDiagnosticLabsDataFlowPack } from "./clinics-diagnostic-labs";
import { schoolsCollegesDataFlowPack } from "./schools-colleges";
import { lawFirmsDataFlowPack } from "./law-firms";
import { realEstateDataFlowPack } from "./real-estate";
import { hotelsTravelDataFlowPack } from "./hotels-travel";
import { pharmaciesDataFlowPack } from "./pharmacies";
import { fintechNbfcDataFlowPack } from "./fintech-nbfc";
import { gymsSalonsSpasDataFlowPack } from "./gyms-salons-spas";

/** Sector slug -> its flow pack. Add a line here to publish a new map. */
const PACKS: Partial<Record<string, DataFlowPack>> = {
  "recruitment-agencies": recruitmentDataFlowPack,
  "ca-firms": caFirmsDataFlowPack,
  "training-institutes": trainingInstitutesDataFlowPack,
  "d2c-brands": d2cBrandsDataFlowPack,
  "clinics-diagnostic-labs": clinicsDiagnosticLabsDataFlowPack,
  "schools-colleges": schoolsCollegesDataFlowPack,
  "law-firms": lawFirmsDataFlowPack,
  "real-estate": realEstateDataFlowPack,
  "hotels-travel": hotelsTravelDataFlowPack,
  pharmacies: pharmaciesDataFlowPack,
  "fintech-nbfc": fintechNbfcDataFlowPack,
  "gyms-salons-spas": gymsSalonsSpasDataFlowPack,
};

export interface DataMapEntry {
  sector: Sector;
  /** Live maps only; undefined for sectors still on the roadmap. */
  pack?: DataFlowPack;
  href: string;
  live: boolean;
}

/** Every sector, in the canonical sectors.ts order, flagged live or planned. */
export const DATA_MAPS: DataMapEntry[] = SECTORS.map((sector) => {
  const pack = PACKS[sector.slug];
  return {
    sector,
    pack,
    // Maps live under the industry they belong to, so the URL keeps the
    // sector context and the existing recruitment route stays valid.
    href: `/industries/${sector.slug}/data-flow`,
    live: Boolean(pack),
  };
});

export const LIVE_DATA_MAPS = DATA_MAPS.filter((m) => m.live);
export const PLANNED_DATA_MAPS = DATA_MAPS.filter((m) => !m.live);

/** Footer "Data Mapping" column - live maps only; never link a page that 404s. */
export const dataMapFooterLinks = LIVE_DATA_MAPS.map((m) => ({
  label: m.sector.navLabel,
  href: m.href,
}));

/** Sitemap entries for the live maps (the landing page is added separately). */
export const dataMapSlugs = LIVE_DATA_MAPS.map((m) => m.sector.slug);
