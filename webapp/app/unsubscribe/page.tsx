"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

function UnsubscribeInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const email        = searchParams.get("email") ?? "";
  const sig          = searchParams.get("sig") ?? "";
  const [state, setState] = useState<"loading" | "done" | "error">("loading");

  useEffect(() => {
    // /unsubscribe is the one-click target for the link inside our emails, which
    // always carries ?email=. Reached without one (e.g. someone typing the URL),
    // send them to the consent hub where they can look up their address and
    // unsubscribe — rather than dead-ending on an error.
    if (!email) { router.replace("/consent-preferences"); return; }

    fetch("/api/subscribers/unsubscribe", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email, sig }),
    })
      .then((r) => r.json())
      .then((d) => setState(d.success ? "done" : "error"))
      .catch(() => setState("error"));
  }, [email, sig]);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-10 max-w-md w-full text-center">
      {state === "loading" && (
        <>
          <Loader2 size={40} className="text-slate-400 animate-spin mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-slate-700">Unsubscribing…</h1>
          <p className="text-slate-400 text-sm mt-2">Please wait a moment.</p>
        </>
      )}

      {state === "done" && (
        <>
          <CheckCircle size={44} className="text-green-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-slate-800 mb-2">You&apos;ve been unsubscribed</h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            <span className="font-medium text-slate-700">{email}</span> has been removed from
            SaralPrivacy Daily Briefings. You won&apos;t receive any more emails from us.
          </p>
          <p className="text-slate-400 text-xs mt-5">
            Changed your mind?{" "}
            <a href="/subscribe" className="text-[#1E3A5F] underline">Resubscribe here</a>.
          </p>
        </>
      )}

      {state === "error" && (
        <>
          <AlertCircle size={44} className="text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-slate-800 mb-2">Something went wrong</h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            We couldn&apos;t process your request. Please email{" "}
            <a href="mailto:privacy@saralprivacy.com" className="text-[#1E3A5F] underline">
              privacy@saralprivacy.com
            </a>{" "}
            and we&apos;ll remove you manually within 24 hours.
          </p>
        </>
      )}
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Suspense
        fallback={
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-10 max-w-md w-full text-center">
            <Loader2 size={40} className="text-slate-400 animate-spin mx-auto mb-4" />
            <p className="text-slate-400 text-sm">Loading…</p>
          </div>
        }
      >
        <UnsubscribeInner />
      </Suspense>
    </main>
  );
}
