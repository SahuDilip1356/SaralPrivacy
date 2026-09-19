"use client";

import { useTranslations } from "next-intl";
import { Info } from "lucide-react";

// Shown on the question a homepage answer pre-selected (?pre=, see
// lib/data/industry-assessment/prefill.ts). One component for all 12 sector
// clients — the presentation is identical across sectors by law.
export function PrefillNote() {
  const t = useTranslations("assessment.shared");
  return (
    <p className="mt-3 flex items-start gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs leading-snug text-teal-900">
      <Info size={14} className="mt-0.5 shrink-0 text-teal-700" aria-hidden="true" />
      {t("prefillNote")}
    </p>
  );
}
