// Shared visual vocabulary for the Personal Data Flow Map.
// Semantic shapes + icons + labels - colour reinforces, never carries alone.

import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Archive,
  Briefcase,
  Building,
  CheckCircle2,
  Database,
  Globe,
  Info,
  Landmark,
  Laptop,
  MonitorSmartphone,
  Package,
  User,
  Users,
} from "lucide-react";
import type { Boundary, NodeType, RiskLevel } from "@/lib/data-flow/schemas";

// Micro-label type scale. This is dense data-viz, so it genuinely needs sizes
// below Tailwind's `text-xs` (12px) - but as a NAMED, finite set, not ad-hoc
// per-element pixel values. Every sub-`text-sm` label uses one of these four.
export const TEXT = {
  micro: "text-[10px]", // dense legends, badges, sr-adjacent captions
  mini: "text-[11px]", // chip labels, secondary meta
  tiny: "text-[12px]", // the workhorse small label (= text-xs)
  small: "text-[13px]", // emphasised small copy
} as const;

// Wire stroke colours for the lane board. One canonical casing, one home -
// they mirror the teal("stays inside")/violet("crosses out") legend, so they
// live here with the rest of the boundary vocabulary rather than as raw hex
// literals inline (where the teal had drifted to two different casings).
export const WIRE_STROKE = {
  internal: "#35B6AE", // teal - movement within a boundary
  external: "#8E51FF", // violet - crosses a trust boundary
} as const;

export const NODE_TYPE_META: Record<NodeType, { icon: LucideIcon; label: string }> = {
  person: { icon: User, label: "Person" },
  system: { icon: MonitorSmartphone, label: "System" },
  repository: { icon: Database, label: "Repository" },
  device: { icon: Laptop, label: "Device" },
  physical_storage: { icon: Archive, label: "Physical storage" },
};

// TWO AXES, TWO VISUAL LANGUAGES - this file's opening rule, applied.
//
// Boundary ("did this leave your organisation?") and risk ("how bad is it?")
// are independent facts, and they used to share amber: every external boundary
// was amber, RISK_META.high is amber, and the journey chip painted `danger` and
// `external` in the same colour. A high-risk in-house spreadsheet and a
// low-risk client system looked alike, which is exactly backwards.
//
//   risk     -> FILL + icon, in amber/red. Reserved for risk, nowhere else.
//   boundary -> LEFT RULE + text label + glyph, in violet.
//
// All external boundaries share ONE violet: five hues x four risk fills is
// twenty states on one page. The text label already separates them losslessly,
// which is also the colourblind-safe and screen-reader-safe channel.
// `rule` is empty for internal boundaries - that emptiness is asserted in the
// test suite, so a new boundary cannot be added without deciding its side.
/** Boundary label for a given pack: its override, else the shared default.
 *
 *  Colour, rule and glyph stay global - those encode "inside vs outside your
 *  control", which is identical in every industry. Only the NOUN changes: a
 *  CA firm's `agency` row is "Your firm", not "Your agency". */
export function boundaryLabel(
  pack: { boundaryLabels?: Partial<Record<Boundary, string>> },
  boundary: Boundary,
): string {
  return pack.boundaryLabels?.[boundary] ?? BOUNDARY_META[boundary].label;
}

export const BOUNDARY_META: Record<
  Boundary,
  { label: string; badge: string; rule: string; pill: string; icon: LucideIcon }
> = {
  candidate: {
    label: "Candidate",
    badge: "border-teal-300 bg-teal-50 text-teal-800",
    rule: "",
    pill: "bg-teal-50 text-teal-700 ring-teal-200",
    icon: User,
  },
  agency: {
    label: "Your agency",
    badge: "border-slate-300 bg-slate-100 text-slate-700",
    rule: "",
    pill: "bg-slate-100 text-slate-600 ring-slate-200",
    icon: Building,
  },
  client: {
    label: "Client",
    badge: "border-violet-300 bg-violet-50 text-violet-800",
    rule: "border-l-4 border-l-violet-500",
    pill: "bg-violet-50 text-violet-700 ring-violet-200",
    icon: Briefcase,
  },
  vendor: {
    label: "Vendor",
    badge: "border-violet-300 bg-violet-50 text-violet-800",
    rule: "border-l-4 border-l-violet-500",
    pill: "bg-violet-50 text-violet-700 ring-violet-200",
    icon: Package,
  },
  government: {
    label: "Government",
    badge: "border-violet-300 bg-violet-50 text-violet-800",
    rule: "border-l-4 border-l-violet-500",
    pill: "bg-violet-50 text-violet-700 ring-violet-200",
    icon: Landmark,
  },
  "third-party": {
    label: "Third party",
    badge: "border-violet-300 bg-violet-50 text-violet-800",
    rule: "border-l-4 border-l-violet-500",
    pill: "bg-violet-50 text-violet-700 ring-violet-200",
    icon: Users,
  },
  public: {
    label: "Public source",
    badge: "border-violet-300 bg-violet-50 text-violet-800",
    rule: "border-l-4 border-l-violet-500",
    pill: "bg-violet-50 text-violet-700 ring-violet-200",
    icon: Globe,
  },
};

export const EXTERNAL_BOUNDARY_SET: ReadonlySet<Boundary> = new Set([
  "client",
  "vendor",
  "government",
  "third-party",
  "public",
]);

export const RISK_META: Record<
  RiskLevel,
  { icon: LucideIcon; label: string; chip: string; ring: string }
> = {
  low: {
    icon: CheckCircle2,
    label: "Low risk",
    chip: "border-green-200 bg-green-50 text-green-800",
    ring: "ring-green-300",
  },
  medium: {
    icon: Info,
    label: "Medium risk",
    chip: "border-slate-300 bg-slate-100 text-slate-700",
    ring: "ring-slate-300",
  },
  high: {
    icon: AlertTriangle,
    label: "High risk",
    chip: "border-amber-300 bg-amber-50 text-amber-800",
    ring: "ring-amber-400",
  },
  critical: {
    icon: AlertTriangle,
    label: "Critical risk",
    chip: "border-red-300 bg-red-50 text-red-800",
    ring: "ring-red-400",
  },
};

export const ACTION_LABEL: Record<string, string> = {
  collect: "Collected",
  create: "Created",
  view: "Viewed",
  edit: "Updated",
  copy: "Copied",
  download: "Downloaded",
  upload: "Uploaded",
  share: "Shared",
  export: "Exported",
  print: "Printed",
  archive: "Archived",
  delete: "Deleted",
};

export const CHANNEL_LABEL: Record<string, string> = {
  web_form: "Web form",
  api: "System integration",
  email: "Email",
  whatsapp: "WhatsApp",
  file_upload: "File upload",
  shared_link: "Shared link",
  manual_entry: "Manual entry",
  spreadsheet: "Spreadsheet",
  physical: "Paper / physical",
  system_sync: "Automatic sync",
};
