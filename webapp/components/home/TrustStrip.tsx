import { BookOpen, Target, Users, MessageSquare } from "lucide-react";
import { SECTOR_COUNT } from "@/lib/data/sectors";
import { getBriefingCountLabel } from "@/lib/data/briefings-source";

// Beat 3 — Trust ribbon. Scale stats (moved here from the hero) + the four
// "why us" pillars. Press logos render separately via <PressProofStrip />.
//
// ⛔ Every number here must be verifiable by a visitor. No aspirational counts.
// The briefings figure is read live from Appwrite and rounded DOWN, so it can
// never overclaim (it previously read "200+" against 122 real briefings).

/** Downloadable assets in /public/templates — 5 generic + one checklist per sector. */
const TEMPLATE_COUNT = 17;

const pillars = [
  {
    icon: BookOpen,
    title: "Educational, not alarmist",
    description:
      "We explain what DPDPA actually requires in language that founders and operations teams can act on, not fear-mongering.",
  },
  {
    icon: Target,
    title: "Practical and actionable",
    description:
      "Every briefing ends with a checklist. Every assessment ends with a roadmap. We focus on what to do, not just what the law says.",
  },
  {
    icon: Users,
    title: "Built for Indian businesses",
    description:
      "Not a GDPR guide repurposed for India. Every piece of content is written specifically for Indian business contexts and data practices.",
  },
  {
    icon: MessageSquare,
    title: "Not legal advice",
    description:
      "We are an intelligence and education platform. For formal legal opinions, engage a qualified data protection lawyer. We tell you what to prepare.",
  },
];

export async function TrustStrip() {
  // null when Appwrite is unreachable or the count is too small to advertise —
  // we fall back to a non-numeric label rather than printing a number we can't back.
  const briefingCount = await getBriefingCountLabel();

  const stats = [
    { value: "Free", label: "3–5 minute assessment" },
    briefingCount
      ? { value: briefingCount, label: "Briefings published" }
      : { value: "Daily", label: "Briefings published" },
    { value: String(SECTOR_COUNT), label: "Sector assessments" },
    { value: String(TEMPLATE_COUNT), label: "Free templates & checklists" },
  ];

  return (
    <section className="py-24 bg-cloud-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Scale stats. Quiet by design — these are context for the pillars
            below, not a scoreboard, so no icon tiles and no bold weights. */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pb-10 mb-12 border-b border-pearl-200">
          {stats.map(({ value, label }) => (
            <div key={label}>
              <div className="text-navy-700 font-semibold text-2xl leading-none tabular-nums">
                {value}
              </div>
              <div className="text-slate-600 text-sm mt-1.5">{label}</div>
            </div>
          ))}
        </div>

        {/* why-us pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex gap-4">
              <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center shrink-0 mt-0.5">
                <Icon size={18} className="text-teal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-navy-700 text-sm mb-1">{title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
