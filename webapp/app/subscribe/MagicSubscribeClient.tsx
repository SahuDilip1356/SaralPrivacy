"use client";
import { useEffect, useState } from "react";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import Link from "next/link";

type State = "loading" | "success" | "already" | "error";

export default function MagicSubscribeClient({ token }: { token: string }) {
  const [state, setState] = useState<State>("loading");
  const [name, setName]   = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/outreach/subscribe", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ token }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setName(d.name || "");
          setState(d.already ? "already" : "success");
        } else {
          setError(d.error || "Something went wrong.");
          setState("error");
        }
      })
      .catch(() => {
        setError("Network error. Please try again.");
        setState("error");
      });
  }, [token]);

  const firstName = name.split(" ")[0] || "there";

  if (state === "loading") {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-slate-500">
        <Loader2 size={32} className="animate-spin text-green-500" />
        <p className="text-sm">Confirming your subscription…</p>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="flex flex-col items-center gap-5 py-16 text-center px-4">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
          <CheckCircle size={32} className="text-green-500" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-navy-700 mb-2">You&rsquo;re in, {firstName}!</h2>
          <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
            Your first DPDPA daily briefing will arrive tomorrow morning.
            One email per day — practical, plain English, India-specific.
          </p>
        </div>
        <Link href="/briefings" className="mt-2 px-5 py-2.5 bg-navy-700 text-white text-sm font-semibold rounded-lg hover:bg-navy-800 transition-colors">
          Read Today&rsquo;s Briefing →
        </Link>
      </div>
    );
  }

  if (state === "already") {
    return (
      <div className="flex flex-col items-center gap-5 py-16 text-center px-4">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
          <CheckCircle size={32} className="text-blue-500" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-navy-700 mb-2">You&rsquo;re already subscribed!</h2>
          <p className="text-slate-600 text-sm max-w-md mx-auto">
            Good news — you&rsquo;re already receiving the daily DPDPA briefings.
          </p>
        </div>
        <Link href="/briefings" className="mt-2 px-5 py-2.5 bg-navy-700 text-white text-sm font-semibold rounded-lg hover:bg-navy-800 transition-colors">
          Read Today&rsquo;s Briefing →
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 py-16 text-center px-4">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
        <XCircle size={32} className="text-red-500" />
      </div>
      <div>
        <h2 className="text-2xl font-semibold text-navy-700 mb-2">Something went wrong</h2>
        <p className="text-slate-500 text-sm max-w-md mx-auto">{error}</p>
      </div>
      <Link href="/subscribe" className="mt-2 text-sm text-navy-700 underline hover:text-green-600">
        Subscribe manually instead
      </Link>
    </div>
  );
}
