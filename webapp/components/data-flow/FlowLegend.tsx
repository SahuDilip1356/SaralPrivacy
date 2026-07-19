// Canvas legend — shapes, line styles, badges. Server-safe.

import { AlertTriangle, Copy } from "lucide-react";

export function FlowLegend() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 p-3 text-[11px] leading-relaxed text-slate-600 shadow-sm">
      <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
        How to read
      </div>
      <ul className="space-y-1">
        <li className="flex items-center gap-2">
          <span className="inline-block h-0 w-6 border-t-2 border-slate-400" aria-hidden="true" />
          Internal movement
        </li>
        <li className="flex items-center gap-2">
          <span className="inline-block h-0 w-6 border-t-2 border-dashed border-amber-500" aria-hidden="true" />
          Leaves your agency
        </li>
        <li className="flex items-center gap-2">
          <span className="inline-flex items-center gap-0.5 rounded border border-slate-200 bg-white px-1 font-bold" aria-hidden="true">
            ⧉
          </span>
          A new copy is created
        </li>
        <li className="flex items-center gap-2">
          <span className="inline-block w-6 rounded border border-dashed border-slate-400 text-center" aria-hidden="true">
            &nbsp;
          </span>
          Unmanaged / personal tool
        </li>
        <li className="flex items-center gap-2">
          <AlertTriangle size={12} className="text-amber-600" aria-hidden="true" />
          High or critical risk
        </li>
        <li className="flex items-center gap-2">
          <Copy size={12} className="text-navy-600" aria-hidden="true" />
          Copies held (copy-spread view)
        </li>
      </ul>
    </div>
  );
}
