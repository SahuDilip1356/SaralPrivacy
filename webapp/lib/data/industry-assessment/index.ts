// ─────────────────────────────────────────────────────────────────────────────
// SaralPrivacy — Industry Assessment · Pack registry
// A new industry = add a pack here. No engine changes required.
// ─────────────────────────────────────────────────────────────────────────────

import { IndustryPack } from "./core";
import { caFirmPack } from "./packs/ca-firms";
import { trainingInstitutePack } from "./packs/training-institutes";
import { recruitmentAgenciesPack } from "./packs/recruitment-agencies";
import { d2cBrandsPack } from "./packs/d2c-brands";
import { clinicsDiagnosticLabsPack } from "./packs/clinics-diagnostic-labs";
import { schoolsCollegesPack } from "./packs/schools-colleges";

export * from "./core";
export * from "./bands";

export const INDUSTRY_PACKS: Record<string, IndustryPack> = {
  "ca-firms": caFirmPack,
  "training-institutes": trainingInstitutePack,
  "recruitment-agencies": recruitmentAgenciesPack,
  "d2c-brands": d2cBrandsPack,
  "clinics-diagnostic-labs": clinicsDiagnosticLabsPack,
  "schools-colleges": schoolsCollegesPack,
};

export function getPack(industry: string): IndustryPack | undefined {
  return INDUSTRY_PACKS[industry];
}

/**
 * Look up an industry pack by its `reportType` token (e.g. "ca-firm", "training").
 * This is the reliable discriminator for "is this an industry assessment?" —
 * general assessments use report_type "quick"/"deep", which match no pack.
 */
export function getPackByReportType(reportType: string | undefined): IndustryPack | undefined {
  if (!reportType) return undefined;
  return Object.values(INDUSTRY_PACKS).find((p) => p.reportType === reportType);
}
