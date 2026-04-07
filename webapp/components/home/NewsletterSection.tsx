"use client";

import { useState } from "react";
import { Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Input";
import { trackEvent } from "@/lib/analytics";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly">("daily");
  const [consentEmail, setConsentEmail] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentEmail) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/subscribe", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name, email, frequency, consentEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        trackEvent.subscribe({ frequency });
        setSubmitted(true);
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          {/* Icon */}
          <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center mx-auto mb-5">
            <Mail size={24} className="text-teal-600" />
          </div>

          <h2 className="text-3xl font-bold text-navy-700 mb-3">
            DPDPA briefings, delivered to your inbox
          </h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Get practical DPDPA updates, compliance tips, and regulatory developments
            delivered weekly (or daily). Written for business owners, not lawyers.
          </p>

          {submitted ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-8">
              <CheckCircle size={40} className="text-green-600 mx-auto mb-3" />
              <h3 className="font-bold text-green-800 text-xl mb-2">You&apos;re subscribed!</h3>
              <p className="text-green-700 text-sm">
                You&apos;ll receive your first DPDPA briefing at the next dispatch. You can manage
                your preferences any time from the link in any email we send.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-white border border-slate-200 rounded-xl p-6 text-left shadow-sm"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <Input
                  label="Your Name"
                  placeholder="Priya Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  label="Work Email"
                  type="email"
                  placeholder="priya@yourcompany.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Frequency toggle */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  How often?
                </label>
                <div className="flex gap-2">
                  {(["daily", "weekly"] as const).map((freq) => (
                    <button
                      key={freq}
                      type="button"
                      onClick={() => setFrequency(freq)}
                      className={`flex-1 py-2.5 rounded-lg border text-sm font-semibold transition-colors capitalize ${
                        frequency === freq
                          ? "border-navy-500 bg-cloud-50 text-navy-700"
                          : "border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {freq === "weekly" ? "Weekly digest" : "Daily briefing"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Consent */}
              <div className="bg-slate-50 rounded-lg p-4 mb-4 space-y-3">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Consent</p>
                <Checkbox
                  label={
                    <span>
                      I consent to receive DPDPA briefings and compliance updates by email from SaralPrivacy.{" "}
                      <span className="text-slate-500">I understand I can unsubscribe at any time.</span>
                    </span>
                  }
                  checked={consentEmail}
                  onChange={(e) => setConsentEmail(e.target.checked)}
                  required
                />
                <p className="text-xs text-slate-400 pl-7">
                  Your data is processed as described in our{" "}
                  <a href="/privacy" className="text-green-600 underline">Privacy Notice</a>.
                  We do not pre-check consent boxes. You must opt in actively.
                </p>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-3">{error}</p>
              )}

              <Button
                type="submit"
                variant="secondary"
                size="lg"
                className="w-full"
                loading={loading}
                disabled={!consentEmail}
              >
                Subscribe to Briefings
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
