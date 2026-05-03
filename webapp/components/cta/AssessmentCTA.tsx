import Link from "next/link";
import { ctaCopy } from "@/lib/cta-copy";

interface AssessmentCTAProps {
  variant?: "full" | "compact";
  /** Pass industryAssessmentCopy[slug] to override default copy on industry pages */
  copy?: {
    eyebrow: string;
    heading: string;
    body: string;
    cta: string;
    href: string;
  };
}

export function AssessmentCTA({
  variant = "full",
  copy = ctaCopy.assessment,
}: AssessmentCTAProps) {
  if (variant === "compact") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm font-semibold text-green-800">
          {ctaCopy.assessmentCompact.heading}
        </p>
        <Link
          href={copy.href}
          className="shrink-0 inline-flex items-center gap-1 bg-green-500 text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
        >
          {copy.cta}
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-center">
      <p className="text-green-100 text-xs font-bold mb-2 uppercase tracking-wide">
        {copy.eyebrow}
      </p>
      <h2 className="text-xl font-bold text-white mb-2">{copy.heading}</h2>
      <p className="text-green-100 text-sm mb-4 max-w-xs mx-auto">{copy.body}</p>
      <Link
        href={copy.href}
        className="inline-block py-2.5 px-6 bg-white text-green-600 font-bold rounded-xl hover:bg-green-50 transition-colors"
      >
        {copy.cta}
      </Link>
    </div>
  );
}
