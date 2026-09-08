"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  ctaHrefs,
  industryAssessmentHrefs,
  type IndustrySlug,
} from "@/lib/cta-copy";

interface AssessmentCTAProps {
  variant?: "full" | "compact";
  /** Industry-specific copy override (catalog: cta.industry.<slug>) */
  industry?: IndustrySlug;
}

export function AssessmentCTA({ variant = "full", industry }: AssessmentCTAProps) {
  const t = useTranslations("cta");
  const key = industry ? `industry.${industry}` : "assessment";
  const href = industry ? industryAssessmentHrefs[industry] : ctaHrefs.assessment;

  if (variant === "compact") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm font-semibold text-green-800">
          {t("assessmentCompact.heading")}
        </p>
        <Link
          href={href}
          className="shrink-0 inline-flex items-center gap-1 bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-green-800 transition-colors"
        >
          {t(`${key}.cta`)}
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-green-700 to-green-800 rounded-xl p-6 text-center">
      <p className="text-green-50 text-xs font-bold mb-2 uppercase tracking-wide">
        {t(`${key}.eyebrow`)}
      </p>
      <h2 className="text-xl font-semibold text-white mb-2">{t(`${key}.heading`)}</h2>
      <p className="text-green-50 text-sm mb-4 max-w-xs mx-auto">{t(`${key}.body`)}</p>
      <Link
        href={href}
        className="inline-block py-2.5 px-6 bg-white text-green-800 font-semibold rounded-xl hover:bg-green-50 transition-colors"
      >
        {t(`${key}.cta`)}
      </Link>
    </div>
  );
}
