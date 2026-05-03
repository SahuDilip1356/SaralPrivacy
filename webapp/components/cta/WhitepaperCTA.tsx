import Link from "next/link";
import { Download } from "lucide-react";
import { ctaCopy } from "@/lib/cta-copy";

interface WhitepaperCTAProps {
  variant?: "full" | "sidebar";
}

export function WhitepaperCTA({ variant = "full" }: WhitepaperCTAProps) {
  if (variant === "sidebar") {
    return (
      <div className="bg-navy-700 rounded-xl p-5">
        <p className="text-xs font-bold text-green-400 uppercase tracking-wide mb-2">
          {ctaCopy.whitepaper.eyebrow}
        </p>
        <p className="text-white font-bold text-sm leading-snug mb-3">
          {ctaCopy.whitepaper.heading}
        </p>
        <p className="text-slate-300 text-xs leading-relaxed mb-4">
          {ctaCopy.whitepaper.body}
        </p>
        <Link
          href={ctaCopy.whitepaper.href}
          className="flex items-center justify-center gap-2 bg-green-500 text-white text-sm font-bold py-2.5 rounded-lg hover:bg-green-600 transition-colors"
        >
          <Download size={14} />
          {ctaCopy.whitepaper.cta}
        </Link>
      </div>
    );
  }

  // full variant — inline article / page placement
  return (
    <div className="bg-navy-700 rounded-xl p-6 flex flex-col sm:flex-row items-center gap-5">
      <div className="flex-1 text-center sm:text-left">
        <p className="text-xs font-bold text-green-400 uppercase tracking-wide mb-1">
          {ctaCopy.whitepaper.eyebrow}
        </p>
        <h3 className="text-white font-bold text-base leading-snug mb-1">
          {ctaCopy.whitepaper.heading}
        </h3>
        <p className="text-slate-300 text-sm leading-relaxed">
          {ctaCopy.whitepaper.body}
        </p>
      </div>
      <Link
        href={ctaCopy.whitepaper.href}
        className="shrink-0 inline-flex items-center gap-2 bg-green-500 text-white font-bold px-5 py-3 rounded-xl hover:bg-green-600 transition-colors"
      >
        <Download size={15} />
        Download Free
      </Link>
    </div>
  );
}
