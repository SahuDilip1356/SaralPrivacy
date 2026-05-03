"use client";

import { Download } from "lucide-react";
import { ctaCopy } from "@/lib/cta-copy";

interface TemplatesCTAProps {
  variant?: "full" | "compact" | "sidebar";
}

function openModal() {
  window.dispatchEvent(new CustomEvent("openTemplatesModal"));
}

export function TemplatesCTA({ variant = "full" }: TemplatesCTAProps) {
  if (variant === "sidebar") {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <p className="text-xs font-bold text-navy-700 uppercase tracking-wide mb-2">
          {ctaCopy.templates.eyebrow}
        </p>
        <p className="text-navy-700 font-bold text-sm leading-snug mb-2">
          {ctaCopy.templates.heading}
        </p>
        <p className="text-slate-500 text-xs leading-relaxed mb-4">
          {ctaCopy.templates.body}
        </p>
        <button
          onClick={openModal}
          className="w-full flex items-center justify-center gap-2 bg-navy-700 text-white text-sm font-bold py-2.5 rounded-lg hover:bg-navy-800 transition-colors"
        >
          <Download size={14} />
          {ctaCopy.templates.cta}
        </button>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm font-semibold text-slate-700">
          {ctaCopy.templatesCompact.heading}
        </p>
        <button
          onClick={openModal}
          className="shrink-0 inline-flex items-center gap-1.5 bg-navy-700 text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-navy-800 transition-colors"
        >
          <Download size={13} />
          {ctaCopy.templatesCompact.cta}
        </button>
      </div>
    );
  }

  // full variant
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row items-center gap-5">
      <div className="flex-1 text-center sm:text-left">
        <p className="text-xs font-bold text-navy-700 uppercase tracking-wide mb-1">
          {ctaCopy.templates.eyebrow}
        </p>
        <h3 className="text-navy-700 font-bold text-base leading-snug mb-1">
          {ctaCopy.templates.heading}
        </h3>
        <p className="text-slate-500 text-sm leading-relaxed">
          {ctaCopy.templates.body}
        </p>
      </div>
      <button
        onClick={openModal}
        className="shrink-0 inline-flex items-center gap-2 bg-navy-700 text-white font-bold px-5 py-3 rounded-xl hover:bg-navy-800 transition-colors"
      >
        <Download size={15} />
        {ctaCopy.templates.cta}
      </button>
    </div>
  );
}
