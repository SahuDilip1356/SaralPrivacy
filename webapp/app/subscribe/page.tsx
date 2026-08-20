import type { Metadata } from "next";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import MagicSubscribeClient from "./MagicSubscribeClient";

export const metadata: Metadata = {
  title: "Subscribe to DPDPA Daily Briefings",
  description:
    "Get practical DPDPA compliance updates delivered daily to your inbox. Written in plain English for Indian business owners — not lawyers.",
  alternates: { canonical: "https://saralprivacy.com/subscribe" },
  robots: { index: false, follow: false },
};

export default function SubscribePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  // Magic-link one-click subscribe from outreach email
  const tokenPromise = searchParams.then((p) => p.token || "");
  return <SubscribePageContent tokenPromise={tokenPromise} />;
}

async function SubscribePageContent({ tokenPromise }: { tokenPromise: Promise<string> }) {
  const token = await tokenPromise;

  if (token) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="max-w-lg w-full bg-white rounded-2xl border border-slate-200 shadow-sm mx-4">
          <div className="px-8 py-6 border-b border-slate-100">
            <p className="font-bold text-lg text-navy-700">Saral<span className="text-green-500">Privacy</span></p>
            <p className="text-xs text-slate-400 mt-0.5">DPDPA Daily Briefings</p>
          </div>
          <MagicSubscribeClient token={token} />
        </div>
      </div>
    );
  }

  return <StandardSubscribePage />;
}

function StandardSubscribePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-2">
        <Link
          href="/briefings"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-green-900 transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Daily Briefings
        </Link>
      </div>

      {/* Reuse the same NewsletterSection — daily pre-selected by default */}
      <NewsletterSection />

      {/* What subscribers get */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: "📬", title: "Daily or Weekly", desc: "Choose your cadence. Change or unsubscribe any time." },
            { icon: "⚡", title: "2-Minute Reads", desc: "Plain English. No legal fog. Straight to what matters for your business." },
            { icon: "🇮🇳", title: "India-Specific", desc: "Written for Indian MSMEs — recruitment agencies, CA firms, D2C brands, and more." },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="bg-white border border-slate-200 rounded-xl p-5 text-center">
              <div className="text-2xl mb-2">{icon}</div>
              <div className="font-bold text-navy-700 text-sm mb-1">{title}</div>
              <div className="text-xs text-slate-500 leading-relaxed">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
