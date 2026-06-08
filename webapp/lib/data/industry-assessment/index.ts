// ─────────────────────────────────────────────────────────────────────────────
// SaralPrivacy — Industry Assessment · Pack registry
// A new industry = add a pack here. No engine changes required.
// ─────────────────────────────────────────────────────────────────────────────

import { IndustryPack } from "./core";
import { caFirmPack } from "./packs/ca-firms";
import { trainingInstitutePack } from "./packs/training-institutes";

export * from "./core";
export * from "./bands";

export const INDUSTRY_PACKS: Record<string, IndustryPack> = {
  "ca-firms": caFirmPack,
  "training-institutes": trainingInstitutePack,
};

export function getPack(industry: string): IndustryPack | undefined {
  return INDUSTRY_PACKS[industry];
}
