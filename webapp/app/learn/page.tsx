import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, FileText, Shield, Users, AlertTriangle, Database, Globe, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "DPDPA Learning Hub — Complete Guide",
  description:
    "Comprehensive DPDPA learning hub for Indian businesses. What is DPDPA, who it applies to, key terms, consent, rights, breach notification, and more.",
  alternates: { canonical: 'https://saralprivacy.com/learn' },
};

const learnTopics = [
  {
    icon: BookOpen,
    title: "What is DPDPA?",
    href: "/learn/what-is-dpdpa",
    description: "An overview of the Digital Personal Data Protection Act, 2023 — why it was passed, what it governs, and what it means for Indian businesses.",
    time: "5 min",
    tag: "Start here",
    tagColor: "bg-green-100 text-green-600",
  },
  {
    icon: FileText,
    title: "DPDP Rules 2025: Plain-English Guide",
    href: "/learn/dpdp-rules-2025-plain-english-guide",
    description: "Every Rule and Schedule under the DPDP Rules, 2025 explained in plain English — section by section, in the same order as the official text.",
    time: "25 min",
    tag: "Rules Reference",
    tagColor: "bg-navy-100 text-navy-700",
  },
  {
    icon: BookOpen,
    title: "DPDPA Glossary — 50 Key Terms",
    href: "/glossary",
    description: "Every key term from the Act and Rules — Data Principal, Data Fiduciary, Deemed Consent, Penalty Schedule, and more — with exact section references.",
    time: "Reference",
    tag: "Reference",
    tagColor: "bg-blue-100 text-blue-700",
  },
  {
    icon: Users,
    title: "Who Does It Apply To?",
    href: "/learn/applicability",
    description: "DPDPA applies to any entity processing personal data of Indian citizens. Find out whether your business is covered and to what extent.",
    time: "4 min",
    tag: "Essential",
    tagColor: "bg-amber-100 text-amber-700",
  },
  {
    icon: FileText,
    title: "Must Learn: Key Terms",
    href: "/learn/key-terms",
    description: "Data Fiduciary, Data Principal, Data Processor, Significant Data Fiduciary — all the DPDPA vocabulary you need, explained plainly.",
    time: "6 min",
    tag: "Reference",
    tagColor: "bg-slate-100 text-slate-600",
  },
  {
    icon: Shield,
    title: "Consent Under DPDPA",
    href: "/learn/consent",
    description: "What valid consent looks like, how to collect it, what makes consent invalid, and how to design compliant consent flows for your forms and website.",
    time: "7 min",
    tag: "Action needed",
    tagColor: "bg-red-100 text-red-700",
  },
  {
    icon: FileText,
    title: "Notice Requirements",
    href: "/learn/notice",
    description: "Every data collection must be accompanied by a clear notice. Learn what a DPDPA-compliant notice must include and how to implement it.",
    time: "4 min",
    tag: "Action needed",
    tagColor: "bg-red-100 text-red-700",
  },
  {
    icon: Users,
    title: "Rights of Individuals",
    href: "/learn/rights",
    description: "Data Principals have rights to access, correct, and erase their data. Learn what these rights are and how your business must respond.",
    time: "5 min",
    tag: "Essential",
    tagColor: "bg-amber-100 text-amber-700",
  },
  {
    icon: Shield,
    title: "Duties of Businesses",
    href: "/learn/duties",
    description: "What Data Fiduciaries must do: security safeguards, data minimisation, purpose limitation, processor agreements, and more.",
    time: "8 min",
    tag: "Essential",
    tagColor: "bg-amber-100 text-amber-700",
  },
  {
    icon: Users,
    title: "Children's Data",
    href: "/learn/childrens-data",
    description: "DPDPA has special provisions for data of minors. If you process data of anyone under 18, this section is mandatory reading.",
    time: "4 min",
    tag: "Sector-specific",
    tagColor: "bg-indigo-100 text-indigo-700",
  },
  {
    icon: AlertTriangle,
    title: "Data Breach Basics",
    href: "/learn/data-breach",
    description: "What constitutes a breach, notification timelines, who to notify, and how to build a basic incident response capability.",
    time: "5 min",
    tag: "Action needed",
    tagColor: "bg-red-100 text-red-700",
  },
  {
    icon: Database,
    title: "Data Retention and Deletion",
    href: "/learn/retention",
    description: "How long can you keep personal data? What are the rules around deletion? Learn to define and document your retention policies.",
    time: "4 min",
    tag: "Practical",
    tagColor: "bg-green-100 text-green-600",
  },
  {
    icon: Globe,
    title: "Cross-Border Considerations",
    href: "/learn/cross-border",
    description: "Transferring personal data outside India? Understand the permitted destinations framework and what cross-border flows require.",
    time: "4 min",
    tag: "Reference",
    tagColor: "bg-slate-100 text-slate-600",
  },
  {
    icon: HelpCircle,
    title: "Myth vs Fact",
    href: "/learn/myths",
    description: "Common misconceptions about DPDPA — including who needs to comply, what counts as consent, and whether SMEs are exempt.",
    time: "5 min",
    tag: "Popular",
    tagColor: "bg-purple-100 text-purple-700",
  },
];

export default function LearnPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-navy-700 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-green-700/40 border border-green-500/50 rounded-full px-3.5 py-1.5 mb-4">
              <BookOpen size={12} className="text-green-300" />
              <span className="text-green-300 text-xs font-semibold">DPDPA Learning Hub</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              DPDPA Guide — Plain English for Indian Businesses
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed">
              Everything you need to understand the Digital Personal Data Protection Act —
              without a law degree. Start with the basics or jump to the topic most relevant to you.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Suggested path */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-10">
          <h2 className="font-bold text-navy-700 text-sm mb-2">
            Recommended reading order if you are just starting
          </h2>
          <div className="flex flex-wrap gap-2">
            {["What is DPDPA?", "Who Does It Apply To?", "Key Terms", "Consent Under DPDPA", "Rights of Individuals", "Duties of Businesses"].map((item, i) => (
              <span key={item} className="inline-flex items-center gap-1 text-xs text-green-600 bg-white border border-green-200 rounded-full px-2.5 py-1">
                <span className="font-bold">{i + 1}.</span>
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Topics grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {learnTopics.map(({ icon: Icon, title, href, description, time, tag, tagColor }) => (
            <Link key={href} href={href}>
              <div className="bg-white rounded-xl border border-slate-200 p-6 h-full hover:border-green-300 hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                    <Icon size={18} className="text-slate-600" />
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tagColor}`}>
                    {tag}
                  </span>
                </div>
                <h3 className="font-bold text-navy-700 text-base mb-2 group-hover:text-green-600 transition-colors">
                  {title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">{description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{time} read</span>
                  <span className="text-green-500 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                    Read <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
