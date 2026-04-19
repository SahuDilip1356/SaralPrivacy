"use client";
import { useEffect, useState } from "react";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import Link from "next/link";

type State = "loading" | "success" | "already" | "error" | "no-token";

export default function OutreachUnsubscribeClient({ token }: { token: string }) {
  const [state, setState] = useState<State>(token ? "loading" : "no-token");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    fetch("/api/outreach/unsubscribe", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ token }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setState(d.already ? "already" : "success");
        else { setError(d.error || "Something went wrong."); setState("error"); }
      })
      .catch(() => { setError("Network error. Please try again."); setState("error"); });
  }, [token]);

  if (state === "loading") {
    return (
      <div className="flex flex-col items-center gap-4 py-14 text-slate-500">
        <Loader2 size={28} className="animate-spin text-slate-400" />
        <p className="text-sm">Processing your request…</p>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="flex flex-col items-center gap-5 py-12 text-center px-6">
        <CheckCircle size={36} className="text-green-500" />
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">You&rsquo;ve been removed.</h2>
          <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">
            We will not contact you again. Your data will be handled per our{" "}
            <Link href="/privacy-policy" className="underline hover:text-navy-700">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    );
  }

  if (state === "already") {
    return (
      <div className="flex flex-col items-center gap-5 py-12 text-center px-6">
        <CheckCircle size={36} className="text-blue-400" />
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Already removed.</h2>
          <p className="text-slate-500 text-sm">You were already removed from this list.</p>
        </div>
      </div>
    );
  }

  if (state === "no-token") {
    return (
      <div className="flex flex-col items-center gap-5 py-12 text-center px-6">
        <XCircle size={36} className="text-red-400" />
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Invalid link</h2>
          <p className="text-slate-500 text-sm">This unsubscribe link is missing required information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 py-12 text-center px-6">
      <XCircle size={36} className="text-red-400" />
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Something went wrong</h2>
        <p className="text-slate-500 text-sm">{error}</p>
      </div>
    </div>
  );
}
