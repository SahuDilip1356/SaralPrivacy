import Link from "next/link";
import { Download, FileText, CheckCircle, ArrowUpRight } from "lucide-react";
import { GUIDE_LANGUAGES } from "@/lib/data/guide-languages";

const whitePaperContents = [
  "What DPDPA is and who it applies to, in plain English",
  "Obligations for Data Fiduciaries: consent, notice, security, breach",
  "Risk snapshots for all 12 sectors, plus the OPERATE framework",
  "Rights of individuals and how businesses must respond",
  "Enforcement timeline and penalty structure",
  "Your 90-day privacy readiness action plan",
];

// Guide table of contents — each row deep-links to the matching section of the
// free English guide (public static HTML), opened in a new tab so the visitor
// can read a section and return here. `anchor` maps to an id in
// public/guides/dpdpa-guide-en.html (#section-N).
const GUIDE_EN_HREF = "/guides/dpdpa-guide-en.html";
const guideSections = [
  { n: "01", title: "Understanding DPDPA", desc: "Scope, key definitions, and applicability", anchor: "section-7" },
  { n: "02", title: "Data Fiduciary vs Data Processor", desc: "Which are you — and what does it mean?", anchor: "section-9" },
  { n: "03", title: "Consent framework", desc: "What valid consent looks like under DPDPA", anchor: "section-8" },
  { n: "04", title: "Notice requirements", desc: "What you must tell individuals before collecting data", anchor: "section-12" },
  { n: "05", title: "Rights of individuals", desc: "Access, correction, erasure, and grievance", anchor: "section-14" },
  { n: "06", title: "Data breach obligations", desc: "Notification timelines and scope", anchor: "section-17" },
  { n: "07", title: "12 industry risk snapshots", desc: "Plus the OPERATE framework and rights & breach handling", anchor: "section-19" },
  { n: "08", title: "Penalty structure", desc: "What violations attract what penalties", anchor: "section-5" },
  { n: "09", title: "90-day compliance action plan", desc: "Prioritised steps for each sector", anchor: "section-23" },
];

export function WhitePaperSection() {
  return (
    <section className="py-20 bg-cloud-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: content */}
          <div>
            <div className="inline-flex items-center gap-2 bg-gold-50 border border-gold-200 rounded-full px-3.5 py-1.5 mb-5">
              <FileText size={12} className="text-gold-700" />
              <span className="text-gold-700 text-xs font-semibold">Practitioner guide · Free download</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-semibold text-navy-700 mb-4">
              The complete DPDPA guide
              <span className="block text-teal-800 mt-1">for Indian businesses</span>
            </h2>

            <p className="text-slate-600 text-lg leading-relaxed mb-4">
              A practitioner-grade guide, now in 7 Indian languages, that covers everything your
              business needs to know about DPDPA, from applicability to enforcement, without the legalese.
            </p>
            <div className="flex flex-wrap gap-2 mb-8">
              {GUIDE_LANGUAGES.map((l) => (
                <span
                  key={l.code}
                  title={l.roman}
                  className="text-xs text-slate-700 bg-white border border-pearl-200 rounded-full px-3 py-1"
                >
                  {l.native}
                </span>
              ))}
            </div>

            {/* Contents */}
            <ul className="space-y-2.5 mb-8">
              {whitePaperContents.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-slate-600 text-sm">
                  <CheckCircle size={16} className="text-green-400 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="/white-paper"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-lg transition-colors text-base"
            >
              <Download size={18} />
              Download the free 7-language guide
            </Link>
            <p className="text-slate-600 text-xs mt-3">
              Requires name, work email, and industry. Separate consent options for follow-up.
            </p>
          </div>

          {/* Right: what's inside — a clickable table of contents. Each row
              jumps to that section of the free English guide (new tab). */}
          <div className="relative">
            <div className="bg-white rounded-xl border border-pearl-200 p-6 sm:p-7">
              {/* Document header */}
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
                <div className="w-12 h-12 rounded-xl bg-navy-700 flex items-center justify-center shrink-0">
                  <FileText size={24} className="text-white" />
                </div>
                <div>
                  <div className="font-bold text-navy-700 text-base leading-snug">
                    What&apos;s inside the guide
                  </div>
                  <div className="text-slate-600 text-xs mt-0.5">
                    2026 Edition · 7 languages · jump to any section
                  </div>
                </div>
              </div>

              {/* Deep-linked contents */}
              <div className="divide-y divide-slate-100">
                {guideSections.map((s) => (
                  <a
                    key={s.n}
                    href={`${GUIDE_EN_HREF}#${s.anchor}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-3 py-2.5 -mx-2 px-2 rounded-lg hover:bg-teal-50 transition-colors"
                  >
                    <span className="text-xs font-semibold text-teal-800 tabular-nums pt-0.5 shrink-0 w-5">
                      {s.n}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-navy-700 leading-snug group-hover:text-teal-900">
                        {s.title}
                      </span>
                      <span className="block text-xs text-slate-600 leading-snug mt-0.5">
                        {s.desc}
                      </span>
                    </span>
                    <ArrowUpRight
                      size={15}
                      className="text-slate-400 group-hover:text-teal-900 transition-colors shrink-0 mt-0.5"
                    />
                  </a>
                ))}
              </div>

              <Link
                href="/white-paper"
                className="mt-5 block p-3.5 rounded-lg bg-green-50 border border-green-200 text-center hover:bg-green-100 transition-colors"
              >
                <p className="text-green-700 text-sm font-semibold">
                  Download all 7 languages · Free · with consent
                </p>
              </Link>
            </div>

            {/* Floating badge — gold accent */}
            <div className="absolute -top-3 -right-3 bg-gold-300 text-navy-800 text-xs font-semibold px-3 py-1.5 rounded-full">
              Free Download
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
