import Link from "next/link";
import { ArrowRight, BookOpen, Target, Users, MessageSquare } from "lucide-react";
import { Section, Eyebrow } from "@/components/ui/Section";
import { PressProofStrip } from "@/components/ui/PressProofStrip";
import { FOUNDER_CREDENTIALS, FOUNDER_QUOTE } from "@/components/home/FounderProof";

// S5 — the mid-page recognition band, and the page's second navy surface.
//
// It exists for two reasons at once. Structurally it is the attention reset:
// navy is the only fill on this palette with real range (17.31:1 against white,
// where the best light tint manages 1.26:1), so a dark band is what a chapter
// break is made of. Editorially it is the authority beat — the visitor has just
// been shown the product and now asks who is behind it.
//
// ⛔ No invented proof. There is no permissioned customer quote yet, so there is
// no customer quote here. Credentials and press URLs are real and checkable; a
// fabricated testimonial would be worth less than the empty space it filled.
// When a permissioned operator story exists, it slots in as a fourth element.

const pillars = [
  {
    icon: BookOpen,
    title: "Educational, not alarmist",
    description:
      "We explain what DPDPA actually requires in language founders and ops teams can act on.",
  },
  {
    icon: Target,
    title: "Practical and actionable",
    description:
      "Every briefing ends with a checklist. Every assessment ends with a roadmap.",
  },
  {
    icon: Users,
    title: "Built for Indian businesses",
    description:
      "Not a GDPR guide repurposed for India — written for Indian workflows and data practices.",
  },
  {
    icon: MessageSquare,
    title: "Not legal advice",
    description:
      "We are an intelligence and education platform. For formal opinions, engage a lawyer.",
  },
];

export function RecognitionBand() {
  return (
    <Section surface="navy" type="decision" aria-label="Why SaralPrivacy">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-14 items-start">
        {/* ── Founder ── */}
        <div className="lg:col-span-2">
          <Eyebrow surface="navy" className="mb-4">
            Who&apos;s behind this
          </Eyebrow>

          <div className="flex items-center gap-4 mb-5">
            <span className="shrink-0 w-14 h-14 rounded-full grid place-items-center bg-white/10 border border-white/20 text-white font-semibold text-lg">
              DS
            </span>
            <div>
              <div className="text-white font-bold text-xl">Dilip Sahu</div>
              <div className="text-slate-300 text-sm">Founder, SaralPrivacy</div>
            </div>
          </div>

          <p className="text-slate-300 text-base leading-relaxed mb-6">
            {FOUNDER_QUOTE}
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-8">
            {FOUNDER_CREDENTIALS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon size={16} className="text-teal-300 shrink-0" />
                <span className="text-slate-300 text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>

          {/* The chapter's one filled action. green-400 on navy-950 is 9.72:1 —
              the brightest thing on this band, which is the point. */}
          <Link
            href="/assessment"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-green-400 hover:bg-green-300 text-navy-950 font-semibold rounded-lg transition-colors text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-700"
          >
            Take free assessment
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* ── Why us + press ── */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-7">
            {pillars.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon size={18} className="text-teal-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm mb-1">{title}</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-9 pt-7 border-t border-navy-600">
            <PressProofStrip variant="compact" />
          </div>
        </div>
      </div>
    </Section>
  );
}
