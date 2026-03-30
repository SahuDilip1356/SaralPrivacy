"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

export function BriefingSubscribeCard() {
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/subscribe", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name, email, frequency: "daily", consentEmail: true }),
      });
      const data = await res.json();
      if (res.ok) {
        trackEvent.subscribe({ frequency: "daily" });
        setDone(true);
      } else {
        setError(data.error || "Something went wrong. Try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="bg-brand-700 rounded-xl p-5 text-center">
        <CheckCircle size={28} className="text-green-400 mx-auto mb-2" />
        <p className="text-white font-bold text-sm mb-1">You're subscribed!</p>
        <p className="text-slate-400 text-xs">Daily briefings will arrive in your inbox from tomorrow.</p>
      </div>
    );
  }

  return (
    <div className="bg-brand-700 rounded-xl p-5">
      <h3 className="font-bold text-white text-sm mb-1">Get daily briefings by email</h3>
      <p className="text-slate-400 text-xs mb-4">
        2-min reads, plain English, every morning. Free forever.
      </p>

      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-3 py-2 rounded-lg bg-brand-800 border border-brand-600 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-saffron-400 transition-colors"
        />
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 rounded-lg bg-brand-800 border border-brand-600 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-saffron-400 transition-colors"
        />
        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-saffron-500 hover:bg-saffron-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
        >
          {loading ? "Subscribing…" : "Subscribe Free →"}
        </button>
        <p className="text-xs text-slate-500 text-center leading-relaxed">
          By subscribing you agree to receive daily emails from SaralPrivacy.{" "}
          <a href="/privacy" className="text-slate-400 underline">Privacy Notice</a>.
          Unsubscribe any time.
        </p>
      </form>
    </div>
  );
}
