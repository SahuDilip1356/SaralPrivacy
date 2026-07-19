// Shared visual vocabulary for the Personal Data Flow Map.
// Semantic shapes + icons + labels - colour reinforces, never carries alone.

import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Archive,
  CheckCircle2,
  Database,
  Info,
  Laptop,
  MonitorSmartphone,
  User,
} from "lucide-react";
import type { Boundary, NodeType, RiskLevel } from "@/lib/data-flow/schemas";

export const NODE_TYPE_META: Record<NodeType, { icon: LucideIcon; label: string }> = {
  person: { icon: User, label: "Person" },
  system: { icon: MonitorSmartphone, label: "System" },
  repository: { icon: Database, label: "Repository" },
  device: { icon: Laptop, label: "Device" },
  physical_storage: { icon: Archive, label: "Physical storage" },
};

export const BOUNDARY_META: Record<Boundary, { label: string; badge: string }> = {
  candidate: { label: "Candidate", badge: "border-teal-300 bg-teal-50 text-teal-800" },
  agency: { label: "Your agency", badge: "border-slate-300 bg-slate-100 text-slate-700" },
  client: { label: "Client", badge: "border-amber-300 bg-amber-50 text-amber-800" },
  vendor: { label: "Vendor", badge: "border-amber-300 bg-amber-50 text-amber-800" },
  government: { label: "Government", badge: "border-amber-300 bg-amber-50 text-amber-800" },
  public: { label: "Public source", badge: "border-amber-300 bg-amber-50 text-amber-800" },
};

export const EXTERNAL_BOUNDARY_SET: ReadonlySet<Boundary> = new Set([
  "client",
  "vendor",
  "government",
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
