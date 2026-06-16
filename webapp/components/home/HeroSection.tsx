"use client";

import Link from "next/link";
import { ArrowRight, FileText, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { SECTOR_COUNT } from "@/lib/data/sectors";

const stats = [
  { icon: Clock, label: "3–5 minute assessment", value: "Free" },
  { icon: TrendingUp, label: "Briefings published", value: "200+" },
  { icon: CheckCircle, label: "Sector assessments", value: String(SECTOR_COUNT) },
  { icon: FileText, label: "Resources available", value: "50+" },
];

export function HeroSection() {
  return (
    <section className="relative bg-navy-700 overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #07B981 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, #35B6AE 0%, transparent 50%)`
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-20">
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 bg-teal-700/30 border border-teal-500/40 rounded-full px-3.5 py-1.5 mb-6">
            <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-teal-300 text-xs font-semibold">
              DPDP Rules, 2025 notified 14 November 2025. Use the phased rollout window now
            </span>
          </div>

          {/* Headline — Brand Guidelines v3: "Privacy made practical for India" */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Privacy made{" "}
            <span className="text-green-400">practical</span>
            <span className="block text-slate-300 text-3xl sm:text-4xl lg:text-5xl mt-2">
              for Indian businesses
            </span>
          </h1>

          {/* Gold tagline underline — brand guideline: gold on hero */}
          <div className="w-16 h-0.5 bg-gold-400 mb-6" />

          <p className="text-lg text-slate-300 leading-relaxed mb-8 max-w-2xl">
            Understand whether DPDPA applies to you, how exposed your current practices are, and
            exactly what to do next, in plain English — no legal degree required.
          </p>

          {/* CTAs — primary dominant, secondary clearly subordinate */}
          <div className="flex flex-col sm:flex-row gap-3 mb-12">
            <Link
              href="/assessment"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors text-base"
            >
              Take Free Assessment
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/white-paper"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl border border-white/20 transition-colors text-base backdrop-blur-sm"
            >
              <FileText size={18} />
              Download the Guide
            </Link>
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap gap-5">
            {[
              "Free 3–5 minute readiness check",
              "No legalese, plain English",
              "Industry-specific guidance",
              "Not legal advice, educational",
            ].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-green-400 shrink-0" />
                <span className="text-slate-400 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="border-t border-navy-600 bg-navy-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-700/40 border border-teal-600/50 flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-teal-400" />
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
