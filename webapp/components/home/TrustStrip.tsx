import { BookOpen, Target, Users, MessageSquare } from "lucide-react";

const pillars = [
  {
    icon: BookOpen,
    title: "Educational, not alarmist",
    description:
      "We explain what DPDPA actually requires in language that founders and operations teams can act on — not fear-mongering.",
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

export function TrustStrip() {
  return (
    <section className="py-14 bg-white border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex gap-4">
              <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center shrink-0 mt-0.5">
                <Icon size={18} className="text-teal-600" />
              </div>
              <div>
                <h3 className="font-bold text-navy-700 text-sm mb-1">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
