// Types for the DPDPA Personal Data Discovery tool.
// Data shape mirrors dpdpa_personal_data_map_v3.2 (xlsx) + taxonomy_master_v3 (DB).

export type Bucket = "Core" | "Operational" | "Hidden";
export type Role = "F" | "P" | "B"; // Fiduciary / Processor / Both
export type RiskBaseline = "low" | "medium" | "high" | "critical" | "standard";
export type RiskBand = "Low" | "Moderate" | "High" | "Critical";
export type ConfidenceLevel = "High" | "Medium" | "Low";

// The six atomic DPDPA obligations carried per data item.
export type Obligation =
  | "Notice"
  | "Consent"
  | "Security safeguards"
  | "Retention & erasure"
  | "Vendor controls"
  | "Children (verifiable consent)";

export type AnswerValue = "yes" | "partially" | "no" | "notsure";
export interface Answers {
  q1?: AnswerValue;
  q2?: AnswerValue;
  q3?: AnswerValue;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  template?: string;
}

export interface Niche {
  id: string;
  name: string;
  cat: string;
  aliases?: string[];
  role: Role;
  risk: RiskBaseline;
  tags: string[]; // display tags (cosmetic; scoring uses item tags)
  phase?: number;
}

// A unique, deduplicated data-item definition (no per-niche fields).
export interface ItemDef {
  item: string;
  examples: string;
  tags: string[]; // scoring tags, keys into TagLib
  precaution: string;
  uiGroup: string;
  obligations: Obligation[];
}

// Per-niche reference into ITEM_DEFS plus the niche-local fields.
export interface ItemRef {
  ref: number; // index into ITEM_DEFS
  seq: number;
  bucket: Bucket;
  def: boolean; // Default Selected
}

// A fully-resolved item (ItemDef + ItemRef + computed weight), used by the UI/engine.
export interface ResolvedItem extends ItemDef {
  id: string; // `${nicheId}:${seq}`
  seq: number;
  bucket: Bucket;
  def: boolean;
  weight: number;
  uiShort: string;
}

export interface ItemGroup {
  key: "core" | "operational" | "hidden";
  bucket: Bucket;
  title: string;
  sub: string;
  items: ResolvedItem[];
}

export interface TagInfo {
  weight: number;
  meaning: string;
  usedFor: string;
}
export type TagLib = Record<string, TagInfo>;

export interface Band {
  max: number;
  label: string;
}
export interface Scoring {
  bucketMult: Record<Bucket, number>;
  q1: Record<string, number>;
  q2: Record<string, number>;
  q3: Record<string, number>;
  controlCap: number;
  modifierCap: number;
  totalCap: number;
  bands: Band[];
  confidence: Band[];
}

export interface ScoreResult {
  role: Role;
  raw: number;
  normalized: number;
  modifier: number;
  control: number;
  final: number;
  riskBand: RiskBand;
  confidence: ConfidenceLevel;
  notSure: number;
  selectedCount: number;
  totalCount: number;
  categories: string[]; // friendly category names, ordered by weight
  hiddenSelected: ResolvedItem[];
  hiddenAvailable: number;
  precautions: string[]; // top 5
  fixCount: number; // total deduped precautions
  highValueCount: number; // selected items with tag weight ≥ 3 (sensitive/high-value)
  obligations: Obligation[]; // DPDPA duties triggered by selected items, ordered
  answers: Answers;
}
