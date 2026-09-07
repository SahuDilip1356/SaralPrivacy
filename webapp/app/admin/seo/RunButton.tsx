"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Loader2, Play } from "lucide-react";

type RunResponse = {
  ok: boolean;
  verdict?: string;
  summary?: string;
  inspected?: number;
  errors?: number;
  shortlist?: number;
  newcomers?: number;
  durationMs?: number;
  error?: string;
};

const SCOPES = [
  { value: "newcomers", label: "Watchlist + sitemap newcomers", hint: "the weekly default" },
  { value: "watchlist", label: "Watchlist only (17)", hint: "fastest" },
  { value: "full", label: "Every sitemap URL", hint: "≈240 of the 2,000/day quota" },
];

export default function RunButton() {
  const router = useRouter();
  const [scope, setScope] = useState("newcomers");
  const [state, setState] = useState<"idle" | "running" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const elapsedRef = useRef(0);

  async function trigger() {
    setState("running");
    setMessage("Inspecting through the Search Console API…");
    elapsedRef.current = 0;
    setElapsed(0);
    const tick = setInterval(() => {
      elapsedRef.current += 1;
      setElapsed(elapsedRef.current);
    }, 1000);

    try {
      const res = await fetch("/api/admin/seo-inspect", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ scope }),
      });
      clearInterval(tick);
      const text = await res.text();
      let data: RunResponse | null = null;
      try {
        data = JSON.parse(text) as RunResponse;
      } catch {
        setState("error");
        setMessage(res.status === 504 ? `Timed out at ${elapsedRef.current}s (300 s ceiling).` : `HTTP ${res.status}: ${text.slice(0, 200)}`);
        return;
      }
      if (!res.ok || !data?.ok) {
        setState("error");
        setMessage(data?.error || `HTTP ${res.status}`);
        return;
      }
      setState("success");
      setMessage(
        `${data.verdict} — ${data.summary} Inspected ${data.inspected} (${data.errors} errors), ${data.newcomers} newcomers, ${data.shortlist} on the shortlist, ${Math.round((data.durationMs ?? 0) / 1000)}s. Refreshing…`,
      );
      setTimeout(() => router.refresh(), 1500);
    } catch (err) {
      clearInterval(tick);
      setState("error");
      setMessage(err instanceof Error ? err.message : "Unknown error");
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 mb-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="font-semibold text-navy-700">Run inspection now</p>
          <p className="text-sm text-slate-600 mt-1">
            Same run as the Monday Action: URL Inspection per page, 28-day search data, diff against the last run, verdict, shortlist.
          </p>
          <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
            <span>Scope</span>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              disabled={state === "running"}
              className="border border-slate-300 rounded-md px-2 py-1.5 text-sm bg-white"
            >
              {SCOPES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label} — {s.hint}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button
          onClick={trigger}
          disabled={state === "running"}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
            state === "running" ? "bg-slate-200 text-slate-500 cursor-not-allowed" : "bg-green-700 hover:bg-green-800 text-white"
          }`}
        >
          {state === "running" ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Running… {elapsed}s
            </>
          ) : (
            <>
              <Play size={16} /> Run now
            </>
          )}
        </button>
      </div>
      {state !== "idle" && (
        <div
          className={`mt-4 px-4 py-3 rounded-lg text-sm ${
            state === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : state === "error"
                ? "bg-red-50 border border-red-200 text-red-800"
                : "bg-blue-50 border border-blue-200 text-blue-800"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
