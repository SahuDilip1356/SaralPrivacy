import type { Metadata } from "next";
import Link from "next/link";
import {
  Scale,
  Eye,
  PencilLine,
  Trash2,
  ShieldOff,
  UserPlus,
  MessageSquareWarning,
  Mail,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { DPO } from "@/lib/data/privacy-vendors";

export const metadata: Metadata = {
  title: "Your Rights Under the DPDPA",
  description:
    "Exercise your rights as a Data Principal under India's DPDPA — access, correction, erasure, withdraw consent, nomination, and grievance redressal. Contact SaralPrivacy's DPO.",
  alternates: { canonical: "https://saralprivacy.com/rights" },
};

const RIGHTS = [
  {
    id: "access",
    icon: Eye,
    title: "Right to Access",
    section: "Section 11",
    what: "Ask us for a summary of the personal data we hold about you, what we are doing with it, and who we have shared it with.",
    how: "Email the DPO with the subject line “Access Request”. Tell us the email address you used with us, so we can find your records.",
  },
  {
    id: "correction",
    icon: PencilLine,
    title: "Right to Correction",
    section: "Section 12",
    what: "Ask us to correct personal data that is inaccurate or misleading, or to complete data that is incomplete.",
    how: "Email the DPO with the subject line “Correction Request”, telling us what is wrong and what it should say.",
  },
  {
    id: "erasure",
    icon: Trash2,
    title: "Right to Erasure",
    section: "Section 12",
    what: "Ask us to delete your personal data when it is no longer needed for the purpose you gave it for, or when you withdraw consent.",
    how: "Email the DPO with the subject line “Erasure Request”. We may need to keep limited records where the law requires it — we will tell you if so.",
  },
  {
    id: "withdraw-consent",
    icon: ShieldOff,
    title: "Right to Withdraw Consent",
    section: "Section 6(4)",
    what: "Withdraw any consent you have given, at any time, as easily as you gave it. Withdrawal does not affect processing already carried out lawfully.",
    how: "Use the links below — no email needed. Every email we send also carries a one-click unsubscribe link.",
    actions: [
      { label: "Manage consent preferences", href: "/consent-preferences" },
      { label: "Unsubscribe from briefings", href: "/unsubscribe" },
    ],
  },
  {
    id: "nomination",
    icon: UserPlus,
    title: "Right to Nomination",
    section: "Section 14",
    what: "Nominate another person to exercise your rights on your behalf if you die or become incapable of doing so yourself.",
    how: "Email the DPO with the subject line “Nomination” and your nominee's name and contact details.",
  },
  {
    id: "grievance",
    icon: MessageSquareWarning,
    title: "Right to Grievance Redressal",
    section: "Section 13",
    what: "Complain to us if you believe we have not honoured your rights or have mishandled your data. This is your first step — you do not need to go to the regulator first.",
    how: "Email the DPO with the subject line “Grievance”. We respond within 30 days.",
  },
] as const;

export default function RightsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-navy-700 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-3">
            <Scale size={20} className="text-green-400" />
            <span className="text-green-300 text-sm font-semibold">
              Data Principal Rights
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white">Your Rights</h1>
          <p className="text-slate-300 mt-2 max-w-2xl">
            Under India&apos;s Digital Personal Data Protection Act, 2023, you have rights over
            the personal data {DPO.org} holds about you. This page explains each one and how
            to use it.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Plain-English intro */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
          <p className="text-amber-800 text-sm">
            <strong>These rights are free to use.</strong> You do not need a lawyer, a form, or a
            reason. Email our DPO and we will action your request within 30 days. If you are not
            satisfied with how we handle it, you can escalate to the Data Protection Board of
            India.
          </p>
        </div>

        {/* Rights cards */}
        <div className="space-y-4">
          {RIGHTS.map((right) => {
            const Icon = right.icon;
            return (
              <div
                key={right.id}
                id={right.id}
                className="bg-white rounded-xl border border-slate-200 p-6 scroll-mt-28"
              >
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-green-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                      <h2 className="font-bold text-navy-700 text-xl">{right.title}</h2>
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 rounded-full px-2 py-0.5">
                        DPDPA {right.section}
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">{right.what}</p>
                    <p className="text-slate-500 text-sm leading-relaxed mt-2">
                      <strong className="text-slate-700">How to use it:</strong> {right.how}
                    </p>

                    {"actions" in right && right.actions ? (
                      <div className="flex flex-wrap gap-3 mt-3">
                        {right.actions.map((a) => (
                          <Link
                            key={a.href}
                            href={a.href}
                            className="inline-flex items-center gap-1 text-sm font-semibold text-green-700 hover:text-green-800 underline underline-offset-2"
                          >
                            {a.label}
                            <ArrowUpRight size={13} />
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <a
                        href={`mailto:${DPO.email}?subject=${encodeURIComponent(right.title)}`}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-green-700 hover:text-green-800 underline underline-offset-2 mt-3"
                      >
                        Email the DPO
                        <ArrowUpRight size={13} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* What to include */}
        <div className="mt-8 bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-bold text-navy-700 text-xl mb-3">
            What to include in your request
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed mb-3">
            So we can find your records and be confident the request is genuinely yours, please
            tell us:
          </p>
          <ul className="text-slate-600 text-sm leading-relaxed space-y-1.5 list-disc pl-5">
            <li>The email address you used when you subscribed, downloaded, or took an assessment</li>
            <li>Which right you are exercising (access, correction, erasure, nomination, or a grievance)</li>
            <li>For a correction — what is wrong, and what it should say</li>
          </ul>
          <p className="text-slate-500 text-xs leading-relaxed mt-4">
            We may ask one follow-up question to verify your identity before we act. We will not
            ask you for ID documents, and we will never ask for a password, an OTP, or payment
            details — nobody at {DPO.org} will ever request those.
          </p>
        </div>

        {/* Timeline + escalation */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-teal-500" />
              <h2 className="font-bold text-navy-700 text-base">Our timeline</h2>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">
              We acknowledge requests as soon as we can and complete them within{" "}
              <strong className="text-slate-800">30 days</strong>. If a request is complex and
              needs longer, we will tell you why before the 30 days are up.
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-2">
              <Scale size={16} className="text-teal-500" />
              <h2 className="font-bold text-navy-700 text-base">If we get it wrong</h2>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">
              Raise a grievance with our DPO first — that is your right under Section 13. If you
              are still not satisfied, you may escalate to the{" "}
              <strong className="text-slate-800">Data Protection Board of India</strong>.
            </p>
          </div>
        </div>

        {/* DPO contact */}
        <div
          id="dpo"
          className="mt-8 bg-green-50 border border-green-200 rounded-xl p-5 flex items-start gap-3 scroll-mt-28"
        >
          <Mail size={20} className="text-green-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-700 text-sm">
              Data Protection Officer — {DPO.name}
            </p>
            <p className="text-green-600 text-sm">
              For access, correction, erasure, nomination, or any complaint:{" "}
              <a href={`mailto:${DPO.email}`} className="underline">
                {DPO.email}
              </a>
            </p>
            <p className="text-green-600/80 text-xs mt-1">
              {DPO.org} is the Data Fiduciary for the personal data described in our{" "}
              <Link href="/privacy" className="underline">
                Privacy Notice
              </Link>
              .
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-500 mt-6">
          These rights are yours under the DPDPA and apply to the data {DPO.org} holds. This page
          explains how to exercise them with us — it is not legal advice about your rights against
          anyone else.
        </p>
      </div>
    </div>
  );
}
