"use client";

import { useState } from "react";
import { Shield, CheckCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function ConsentPreferencesPage() {
  const [email, setEmail] = useState("");
  const [found, setFound] = useState(false);
  const [preferences, setPreferences] = useState({
    emailBriefings: false,
    phoneContact: false,
    webinars: false,
  });
  const [saved, setSaved] = useState(false);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setFound(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await new Promise((r) => setTimeout(r, 800));
    setSaved(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-brand-700 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-3">
            <Shield size={20} className="text-saffron-400" />
            <span className="text-saffron-300 text-sm font-semibold">Your Privacy Rights</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Consent Preferences</h1>
          <p className="text-slate-300 mt-2">
            View and manage how DPDPAIndia uses your personal data.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {!found ? (
          <div className="bg-white border border-slate-200 rounded-xl p-7">
            <h2 className="font-bold text-brand-700 text-lg mb-2">Find your preferences</h2>
            <p className="text-slate-600 text-sm mb-5">
              Enter the email address you used to subscribe or download resources.
            </p>
            <form onSubmit={handleLookup} className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 px-4 py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-saffron-500"
              />
              <Button type="submit" variant="secondary">Find</Button>
            </form>
          </div>
        ) : saved ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
            <CheckCircle size={40} className="text-green-600 mx-auto mb-3" />
            <h3 className="font-bold text-green-800 text-xl mb-2">Preferences saved</h3>
            <p className="text-green-700 text-sm">
              Your consent preferences have been updated. Changes take effect within 24 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-xl p-7">
            <h2 className="font-bold text-brand-700 text-lg mb-1">Your consent preferences</h2>
            <p className="text-slate-500 text-sm mb-5">
              Email: <strong>{email}</strong>. Manage each consent purpose independently.
            </p>

            <div className="space-y-4 mb-6">
              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50">
                <Checkbox
                  label="Receive DPDPA briefings and educational content by email"
                  description="Daily or weekly DPDPA updates, compliance tips, and resources."
                  checked={preferences.emailBriefings}
                  onChange={(e) => setPreferences((p) => ({ ...p, emailBriefings: e.target.checked }))}
                />
              </div>
              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50">
                <Checkbox
                  label="Allow contact by phone or WhatsApp about advisory services"
                  description="For consultation scheduling and follow-ups only. Business hours only."
                  checked={preferences.phoneContact}
                  onChange={(e) => setPreferences((p) => ({ ...p, phoneContact: e.target.checked }))}
                />
              </div>
              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50">
                <Checkbox
                  label="Receive invitations to webinars and events"
                  description="DPDPA webinars, workshops, and educational events."
                  checked={preferences.webinars}
                  onChange={(e) => setPreferences((p) => ({ ...p, webinars: e.target.checked }))}
                />
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5">
              <p className="text-xs text-amber-800">
                Unchecking any option withdraws your consent for that purpose. This does not affect
                our ability to deliver the white paper or consultation you requested.
              </p>
            </div>

            <div className="flex gap-3">
              <Button type="submit" variant="secondary" className="flex-1">
                Save Preferences
              </Button>
              <Link
                href="/unsubscribe"
                className="flex-1 text-center py-2.5 px-5 border border-red-300 text-red-600 font-semibold rounded-lg text-sm hover:bg-red-50 transition-colors"
              >
                Unsubscribe from All
              </Link>
            </div>

            <p className="text-xs text-slate-400 mt-4 text-center">
              To request deletion of your data, email{" "}
              <a href="mailto:privacy@dpdpaindia.in" className="text-saffron-500 underline">
                privacy@dpdpaindia.in
              </a>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
