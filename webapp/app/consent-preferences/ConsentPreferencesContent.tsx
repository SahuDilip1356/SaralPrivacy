"use client";

import { useState } from "react";
import { Shield, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { DPO } from "@/lib/data/privacy-vendors";

// Honest by design: the ONE consent action we can actually honour today is
// withdrawing consent to our emails (POST /api/subscribers/unsubscribe → sets the
// subscriber to "unsubscribed" in Appwrite). Per-purpose toggles are intentionally
// NOT here — there is no backend for granular consent, and showing a "saved"
// confirmation that persists nothing would be a false consent record. Other rights
// (access, correction, erasure) are handled via /rights.
export default function ConsentPreferencesContent() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setState("loading");
    try {
      const r = await fetch("/api/subscribers/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const d = await r.json();
      setState(d.success ? "done" : "error");
    } catch {
      setState("error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-navy-700 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-3">
            <Shield size={20} className="text-green-400" />
            <span className="text-green-300 text-sm font-semibold">Your Privacy Rights</span>
          </div>
          <h1 className="text-3xl font-semibold text-white">Consent Preferences</h1>
          <p className="text-slate-300 mt-2">
            Withdraw your consent to our emails at any time — as easily as you gave it.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {state === "done" ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
            <CheckCircle size={40} className="text-green-600 mx-auto mb-3" />
            <h2 className="font-semibold text-green-800 text-xl mb-2">You&apos;ve been unsubscribed</h2>
            <p className="text-green-700 text-sm">
              <span className="font-medium">{email}</span> has been removed from SaralPrivacy
              emails. You won&apos;t receive any more from us. Changes take effect within 24 hours.
            </p>
            <p className="text-green-600/80 text-xs mt-4">
              Changed your mind?{" "}
              <Link href="/subscribe" className="underline">
                Resubscribe here
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-7">
            <h2 className="font-semibold text-navy-700 text-lg mb-2">Stop receiving our emails</h2>
            <p className="text-slate-600 text-sm mb-5">
              Enter the email address you subscribed with. We&apos;ll remove it from our
              briefings and any other marketing email.
            </p>

            <form onSubmit={handleUnsubscribe} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (state === "error") setState("idle");
                }}
                placeholder="your@email.com"
                required
                disabled={state === "loading"}
                className="flex-1 px-4 py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-60"
              />
              <Button type="submit" variant="danger" disabled={state === "loading"}>
                {state === "loading" ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={15} className="animate-spin" /> Unsubscribing…
                  </span>
                ) : (
                  "Unsubscribe"
                )}
              </Button>
            </form>

            {state === "error" && (
              <div className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-3">
                <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">
                  We couldn&apos;t process that. Email{" "}
                  <a href={`mailto:${DPO.email}`} className="underline">
                    {DPO.email}
                  </a>{" "}
                  and we&apos;ll remove you manually within 24 hours.
                </p>
              </div>
            )}

            <div className="mt-6 rounded-lg bg-slate-50 border border-slate-200 p-4">
              <p className="text-slate-600 text-sm leading-relaxed">
                <strong className="text-slate-800">Want to do more than unsubscribe?</strong> To
                see what data we hold, correct it, delete it, or raise a complaint, visit{" "}
                <Link href="/rights" className="text-green-700 font-semibold underline">
                  Your Rights
                </Link>{" "}
                or email our Data Protection Officer at{" "}
                <a href={`mailto:${DPO.email}`} className="text-green-700 underline">
                  {DPO.email}
                </a>
                .
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
