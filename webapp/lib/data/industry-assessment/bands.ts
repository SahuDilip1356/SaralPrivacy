// ─────────────────────────────────────────────────────────────────────────────
// SaralPrivacy — Industry Assessment Engine · Risk bands
// One band system for all packs. Engine computes RISK (high = bad);
// UI displays READINESS (100 − risk) + the risk-band label.
// Pure TypeScript — zero React/Next imports.
// ─────────────────────────────────────────────────────────────────────────────

export type BandLabel =
  | "Controlled"
  | "Moderate Risk"
  | "High Risk"
  | "Critical Risk";

export interface RiskBand {
  min: number; // inclusive, on the 0–100 RISK scale
  max: number; // inclusive
  label: BandLabel;
  color: string; // brand-aligned hex (gold/red used for fills, never body text)
  description: string;
}

export const RISK_BANDS: RiskBand[] = [
  {
    min: 0,
    max: 24,
    label: "Controlled",
    color: "#07B981", // Verification Green
    description:
      "Basic CA-firm privacy controls appear to be in place. Keep them documented and reviewed.",
  },
  {
    min: 25,
    max: 49,
    label: "Moderate Risk",
    color: "#E8AB42", // Signal Gold (fill/border only)
    description:
      "Some controls exist, but practices are informal. A focused effort will close the gaps.",
  },
  {
    min: 50,
    max: 74,
    label: "High Risk",
    color: "#F97316", // Orange
    description:
      "Key document, access, retention or vendor controls are weak. Prioritise the fundamentals.",
  },
  {
    min: 75,
    max: 100,
    label: "Critical Risk",
    color: "#DC2626", // Red — severe only
    description:
      "Serious exposure across client documents, access, retention and breach readiness.",
  },
];

const BAND_ORDER: BandLabel[] = [
  "Controlled",
  "Moderate Risk",
  "High Risk",
  "Critical Risk",
];

export function getBandByScore(riskScore: number): RiskBand {
  const s = Math.max(0, Math.min(100, riskScore));
  return RISK_BANDS.find((b) => s >= b.min && s <= b.max) ?? RISK_BANDS[0];
}

export function getBandByLabel(label: BandLabel): RiskBand {
  return RISK_BANDS.find((b) => b.label === label) ?? RISK_BANDS[0];
}

export function bandOrdinal(label: BandLabel): number {
  return BAND_ORDER.indexOf(label);
}

/** Returns whichever band is more severe. Overrides may only RAISE the band. */
export function maxBand(a: BandLabel, b: BandLabel): BandLabel {
  return bandOrdinal(a) >= bandOrdinal(b) ? a : b;
}
