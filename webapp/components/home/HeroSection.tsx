"use client";

import Link from "next/link";
import { ArrowRight, FileText, CheckCircle, Clock, TrendingUp } from "lucide-react";

const stats = [
  { icon: Clock, label: "10-minute assessment", value: "Free" },
  { icon: TrendingUp, label: "Briefings published", value: "200+" },
  { icon: CheckCircle, label: "Industries covered", value: "4" },
  { icon: FileText, label: "Resources available", value: "50+" },
];

export function HeroSection() {
  return (
    <section className="relative bg-brand-700 overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #E07B39 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, #1e3a5f 0%, transparent 50%)`
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-20">
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 bg-saffron-700/40 border border-saffron-500/50 rounded-full px-3.5 py-1.5 mb-6">
            <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-saffron-300 text-xs font-semibold">
              DPDP Rules, 2025 notified 14 November 2025 — use the phased rollout window now
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            DPDPA Compliance
            <span className="block text-saffron-400 mt-1">Made Practical</span>
            <span className="block text-slate-300 text-3xl sm:text-4xl lg:text-5xl mt-2">
              for Indian Businesses
            </span>
          </h1>

          <p className="text-lg text-slate-300 leading-relaxed mb-8 max-w-2xl">
            Understand whether DPDPA applies to you, how exposed your current practices are, and
            exactly what to do next — in plain English, no legal degree required.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 mb-12">
            <Link
              href="/assessment"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-saffron-500 hover:bg-saffron-500 text-white font-semibold rounded-xl transition-colors text-base"
            >
              Take Free Assessment
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/white-paper"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl border border-white/20 transition-colors text-base backdrop-blur-sm"
            >
              <FileText size={18} />
              Download White Paper
            </Link>
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap gap-5">
            {[
              "Free 10-minute readiness check",
              "No legalese — plain English",
              "Industry-specific guidance",
              "Not legal advice — educational",
            ].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-saffron-400 shrink-0" />
                <span className="text-slate-400 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="border-t border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-saffron-700/50 border border-saffron-600 flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-saffron-400" />
                </div>
                <div>
                  <div className="text-white font-bold text-lg leading-none">{value}</div>
                  <div className="text-slate-500 text-xs mt-0.5">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
