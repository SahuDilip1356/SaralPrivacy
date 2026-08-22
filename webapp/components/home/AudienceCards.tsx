"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Users,
  Calculator,
  GraduationCap,
  ShoppingBag,
  Stethoscope,
  School,
  Scale,
  Building2,
  Hotel,
  Pill,
  Landmark,
  Sparkles,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { VERDICT_PREVIEWS } from "@/lib/data/verdict-previews";
import { getHeroVerdict } from "@/lib/data/hero-verdicts";
import { DATA_MAPS } from "@/lib/data/data-flow";
import { trackEvent } from "@/lib/analytics";
import { Section, Eyebrow } from "@/components/ui/Section";
import { useInView } from "@/lib/hooks/useInView";
import { SECTOR_ACCENTS } from "@/lib/data/sector-accents";
import { FlowMapCardLink } from "./FlowMapCardLink";

// S7 — "Your sector", as a cover-flow deck. Founder-directed design
// (2026-08-22, from a sketch): the briefings deck's layered-card feel, but
// arranged as a centred stage — the selected sector's card in full, its
// neighbours peeking from behind at ±1 and ±2, everything past that hidden.
//
// The sketch alone can't carry twelve: a pure carousel means a visitor whose
// sector is card nine paddles through eight clicks to find themselves, and
// twelve stacked layers collapse into slivers ("crash 4 layers" — exactly
// right). So the deck gets a RAIL OF ALL TWELVE CHIPS above it: findability
// in one glance, then the chosen card animates to centre. Drama and
// findability, not a trade.
//
// Motion rules: transforms and opacity only (GPU-cheap, no layout thrash),
// one deal-in when the section first scrolls into view, 500ms recentre on
// select, and prefers-reduced-motion collapses all of it to instant swaps.
//
// Every card is server-rendered with its real links (guide, assessment, flow
// map where live) — off-centre cards are `inert`, which keeps them out of the
// tab order and away from screen readers while leaving the HTML fully
// crawlable. Internal-linking budget: 12 guide + 12 assessment + live map
// hrefs, more than the old name row carried.

type SectorCard = {
  icon: typeof Users;
  title: string;
  /** short chip label */
  chip: string;
  href: string;
  assessmentHref: string;
  risk: string;
  painPoints: string[];
  /** one supporting line — a recognisable workflow or the card's promise */
  line: string;
};

const sectors: SectorCard[] = [
  {
    icon: Users, title: "Recruitment Agencies", chip: "Recruitment",
    href: "/industries/recruitment-agencies", assessmentHref: "/assessment/recruitment",
    risk: "Candidate ID & CV risk",
    painPoints: ["CV databases & candidate data", "Client profile sharing", "Background check documents", "Cross-border data flows"],
    line: "A client asks for a shortlist, and you forward three CVs straight from your inbox.",
  },
  {
    icon: Calculator, title: "CA Firms", chip: "CA firms",
    href: "/industries/ca-firms", assessmentHref: "/assessment/ca-firms",
    risk: "PAN / Aadhaar / ITR risk",
    painPoints: ["PAN / Aadhaar / bank data", "Client payroll records", "Cloud drives & shared folders", "Sensitive financial documents"],
    line: "A client WhatsApps their PAN card, and it ends up in the firm's shared Drive.",
  },
  {
    icon: GraduationCap, title: "Training Institutes", chip: "Training",
    href: "/industries/training-institutes", assessmentHref: "/assessment/training-institutes",
    risk: "Student & parent data risk",
    painPoints: ["Student & parent data", "Admissions & lead forms", "Digital marketing consent", "Placement data retention"],
    line: "Check whether your admissions, marketing, and student data workflows are DPDPA-ready.",
  },
  {
    icon: ShoppingBag, title: "D2C Brands", chip: "D2C",
    href: "/industries/d2c-brands", assessmentHref: "/assessment/d2c-brands",
    risk: "Marketing & pixel-data risk",
    painPoints: ["Email / SMS / WhatsApp marketing", "Third-party analytics & pixels", "Customer loyalty data", "Retention of inactive customers"],
    line: "A customer completes checkout, and your marketing list quietly gains a subscriber.",
  },
  {
    icon: Stethoscope, title: "Clinics & Diagnostic Labs", chip: "Clinics",
    href: "/industries/clinics-diagnostic-labs", assessmentHref: "/assessment/clinics-diagnostic-labs",
    risk: "Health-data risk",
    painPoints: ["Prescriptions & lab reports", "WhatsApp report sharing", "Reception & lab staff access", "Old patient-record retention"],
    line: "Check whether your patient-data and report-sharing workflows are DPDPA-ready.",
  },
  {
    icon: School, title: "Schools & Colleges", chip: "Schools",
    href: "/industries/schools-colleges", assessmentHref: "/assessment/schools-colleges",
    risk: "Children's-data risk",
    painPoints: ["Children's data & parent consent", "School apps, ERP & LMS", "CCTV, biometric & transport GPS", "Student photos & old records"],
    line: "Check whether your student-data, parent-consent and monitoring workflows are DPDPA-ready.",
  },
  {
    icon: Scale, title: "Law Firms & Legal Consultants", chip: "Law firms",
    href: "/industries/law-firms", assessmentHref: "/assessment/law-firms",
    risk: "Sensitive case-file risk",
    painPoints: ["Client KYC & evidence files", "Junior / intern / ex-staff access", "WhatsApp & email document sharing", "Closed matter-file retention"],
    line: "Check whether your matter intake, sensitive-file access and sharing workflows are DPDPA-ready.",
  },
  {
    icon: Building2, title: "Real Estate & Property Firms", chip: "Real estate",
    href: "/industries/real-estate", assessmentHref: "/assessment/real-estate",
    risk: "KYC & broker-sharing risk",
    painPoints: ["Buyer/tenant KYC & PAN/Aadhaar", "WhatsApp lead & document sharing", "Broker networks & loan partners", "Old lead-database retention"],
    line: "Check whether your KYC handling, broker sharing and lead retention workflows are DPDPA-ready.",
  },
  {
    icon: Hotel, title: "Hotels, Hospitality & Travel", chip: "Hotels",
    href: "/industries/hotels-travel", assessmentHref: "/assessment/hotels-travel",
    risk: "Guest-ID retention risk",
    painPoints: ["Guest IDs & passport copies", "OTA & travel-vendor sharing", "WhatsApp confirmations & CCTV", "Old guest-record retention"],
    line: "See whether your guest IDs, OTA sharing, travel documents and record retention are DPDPA-ready.",
  },
  {
    icon: Pill, title: "Pharmacies & Online Pharmacies", chip: "Pharmacies",
    href: "/industries/pharmacies", assessmentHref: "/assessment/pharmacies",
    risk: "Prescription-data risk",
    painPoints: ["Prescriptions & medicine history", "WhatsApp orders & health indicators", "Delivery-partner data sharing", "Old prescription retention"],
    line: "Check whether your prescriptions, medicine-history handling and vendor sharing are DPDPA-ready.",
  },
  {
    icon: Landmark, title: "Fintech, NBFC & Digital Payments", chip: "Fintech",
    href: "/industries/fintech-nbfc", assessmentHref: "/assessment/fintech-nbfc",
    risk: "KYC & profiling risk",
    painPoints: ["KYC, PAN/Aadhaar & bank data", "Bureau checks & credit profiling", "DSAs & collection-agent access", "Old application & KYC retention"],
    line: "See whether your KYC, profiling, partner sharing and agent access are DPDPA-ready.",
  },
  {
    icon: Sparkles, title: "Gyms, Salons & Spas", chip: "Gyms & salons",
    href: "/industries/gyms-salons-spas", assessmentHref: "/assessment/gyms-salons-spas",
    risk: "Photo & health-data risk",
    painPoints: ["Health & body measurements", "Customer & before-after photos", "WhatsApp campaigns & staff phones", "Old member-record retention"],
    line: "Check whether your photo consent, health-data handling and staff access are DPDPA-ready.",
  },
];

// Registry-driven flow-map links, keyed by the INDUSTRIES slug.
const FLOW_HREFS = new Map(
  DATA_MAPS.filter((m) => m.live).map((m) => [m.sector.slug, m.href]),
);

/** Shortest signed distance around the 12-card ring. The deck wraps, so it
    is symmetric at every position — the sketch's shape at all times, and the
    only honest way to "plot all 12": each card takes the stage in turn. */
function ringDistance(i: number, active: number, n: number) {
  let d = (i - active) % n;
  if (d > n / 2) d -= n;
  if (d < -n / 2) d += n;
  return d;
}

/** Cover-flow geometry per signed distance from the active card. */
function pose(d: number) {
  const abs = Math.abs(d);
  if (abs > 2) {
    return { x: d < 0 ? -90 : 90, s: 0.8, o: 0, z: 0 };
  }
  // The ±2 opacity was 0.55, tuned when these cards were light on white: a
  // pale card fading toward a pale ground reads as distance. The cards are navy
  // now, and navy at 55% over white is not a receding card, it is a grey slab —
  // the depth cue inverted the moment the fill did. Depth on a dark card comes
  // from scale and stacking instead, so the fade only has to take the edge off.
  const table = [
    { x: 0, s: 1, o: 1, z: 30 },
    { x: 40, s: 0.92, o: 0.96, z: 20 },
    { x: 72, s: 0.85, o: 0.82, z: 10 },
  ][abs]!;
  return { x: d < 0 ? -table.x : table.x, s: table.s, o: table.o, z: table.z };
}


export function AudienceCards() {
  const { ref, inView } = useInView<HTMLDivElement>();
  const [active, setActive] = useState(0);
  // Auto-rotation: founder-directed direction cue. It plays exactly ONE full
  // revolution — every sector takes the stage once — and only while the deck
  // is on screen. It pauses on hover, never starts for reduced-motion users,
  // and the first real interaction (chip, arrow, spine, focus) ends it for
  // good. Motion demonstrates the system, then hands over control.
  const [engaged, setEngaged] = useState(false);
  const [hovering, setHovering] = useState(false);
  const spins = useRef(0);

  useEffect(() => {
    if (!inView || engaged || hovering) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (spins.current >= sectors.length) return;
    const id = setInterval(() => {
      if (document.hidden) return;
      spins.current += 1;
      if (spins.current >= sectors.length) clearInterval(id);
      setActive((a) => (a + 1) % sectors.length);
    }, 4000);
    return () => clearInterval(id);
  }, [inView, engaged, hovering]);

  // Every visitor-initiated move through the ring. The auto-revolution calls
  // setActive directly and never comes through here — an advance we performed
  // is not a preference the visitor expressed, and mixing the two would make
  // twelve sectors look uniformly popular in the dashboard no matter what
  // anyone clicked.
  //
  // `via` used to be accepted and thrown away (`void via`), and the event that
  // did fire was the REPORT preview's `beat5_tab_select` — so ring interest was
  // landing in another section's metric. Both fixed here.
  const go = (i: number, via: "chip" | "arrow" | "spine") => {
    setEngaged(true);
    const next = (i + sectors.length) % sectors.length;
    if (next !== active) {
      trackEvent.sectorRingSelect({
        sector: sectors[next].href.replace("/industries/", ""),
        via,
      });
      setActive(next);
    }
  };

  // No `divider` on the Section: the navy "How it works" above is the boundary,
  // and a hairline is only for two beats that share a fill.
  return (
    <Section id="sectors" surface="white" type="evidence" className="scroll-mt-20">
      <div ref={ref} onFocusCapture={() => setEngaged(true)}>
        <div className="text-center mb-8">
          <Eyebrow className="mb-3">Explore DPDPA by your sector</Eyebrow>
          <h2 className="type-display-3 text-navy-700 mb-4">
            Same law. Different data. Different fixes.
          </h2>
          <p className="type-intro text-slate-600 max-w-2xl mx-auto">
            Twelve sectors, twelve different exposures. Pick yours and the deck
            brings it forward.
          </p>
        </div>

        {/* ── The rail: all twelve, one glance. Mobile scrolls it. ── */}
        <div
          className="flex sm:flex-wrap sm:justify-center gap-2 overflow-x-auto sm:overflow-visible pb-1 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0"
          role="tablist"
          aria-label="Pick a sector"
        >
          {sectors.map((s, i) => {
            const on = i === active;
            return (
              <button
                key={s.href}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => go(i, "chip")}
                /* Founder call: off is grey, on is green. green-700 + white is
                   the light-surface half of the locked CTA convention (5.48:1);
                   the literal brand-book green-500 + white measures 2.54:1. It
                   spends a little of green's "this is the action" meaning on a
                   filter chip — accepted, because one chip in twelve is a small
                   dose and the selected sector IS the reader's commitment. */
                className={`shrink-0 inline-flex items-center justify-center min-h-11 sm:min-h-0 text-sm rounded-full border px-3.5 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2 ${
                  on
                    ? "bg-green-700 border-green-700 text-white font-semibold"
                    : "bg-cloud-50 border-cloud-300 text-slate-600 hover:border-slate-400 hover:text-navy-700"
                }`}
              >
                {s.chip}
              </button>
            );
          })}
        </div>

        {/* ── The stage: the sketch's five positions. Centre card full, ±1
            solid behind it, ±2 fading, the rest waiting off-stage. ── */}
        <div className="relative">
          <div
            className="relative overflow-hidden h-[560px] sm:h-[440px]"
            onPointerEnter={() => setHovering(true)}
            onPointerLeave={() => setHovering(false)}
          >
            {sectors.map((s, i) => {
              const d = ringDistance(i, active, sectors.length);
              const p = pose(d);
              const Icon = s.icon;
              const industrySlug = s.href.replace("/industries/", "");
              const flowHref = FLOW_HREFS.get(industrySlug);
              const assessmentSlug = s.assessmentHref.replace("/assessment/", "");
              const preview = VERDICT_PREVIEWS.find((v) => v.slug === assessmentSlug);
              const band = getHeroVerdict(assessmentSlug)?.band;
              // One hue per sector, from the single source that /industries and
              // /data-mapping already read. Not forked for this page: a second
              // copy of the palette is exactly how a sector ends up looking like
              // a different business depending on which page you are on.
              const accent = SECTOR_ACCENTS[industrySlug]?.dark ?? SECTOR_ACCENTS["ca-firms"].dark;
              const centred = d === 0;
              // Deal-in: before the section is seen, every card waits at the
              // centre, small and transparent; on inView they spread to their
              // poses. Reduced motion renders the composed state instantly.
              const composed = inView;
              const x = composed ? p.x : 0;
              const sc = composed ? p.s : 0.9;
              const op = composed ? p.o : 0;
              return (
                <div
                  key={s.href}
                  onClick={centred ? undefined : () => go(i, "spine")}
                  role={centred ? undefined : "button"}
                  aria-label={centred ? undefined : `Show ${s.title}`}
                  className={`absolute top-0 left-1/2 w-[min(560px,92vw)] transition-[transform,opacity] duration-500 ease-out motion-reduce:!transition-none motion-reduce:!opacity-100 ${
                    centred ? "" : "cursor-pointer"
                  }`}
                  style={{
                    transform: `translateX(calc(-50% + ${x}%)) scale(${sc})`,
                    opacity: op,
                    zIndex: p.z,
                    pointerEvents: p.o === 0 ? "none" : undefined,
                    transitionDelay: composed && !centred ? `${Math.abs(d) * 90}ms` : undefined,
                  }}
                >
                  {/* Founder call: card colour to match /data-mapping — a dark
                      navy card carrying the sector's own hue, on a light ground.
                      The inversion is the point: the deck reads as twelve
                      distinct objects laid on the page rather than twelve tinted
                      rectangles printed on it, and the sector hue finally has
                      somewhere bright enough to show. */}
                  <div
                    inert={!centred}
                    className={`relative overflow-hidden rounded-xl bg-navy-700 border p-6 sm:p-7 ${
                      centred ? "border-white/20 shadow-elevated" : "border-white/10 shadow-card"
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className="w-10 h-10 rounded-lg bg-white/10 grid place-items-center shrink-0">
                        <Icon size={20} className={accent.icon} />
                      </span>
                      <h3 className="font-semibold text-white text-lg">{s.title}</h3>
                    </div>
                    {/* Risk stays GOLD on every card, whatever the sector hue.
                        The accent says which industry this is; gold says what is
                        at stake, and it is the only colour on this palette that
                        is ever allowed to say so. */}
                    <span className="inline-flex items-center gap-1.5 text-2xs font-semibold text-gold-300 bg-gold-400/15 border border-gold-400/40 rounded-full px-2.5 py-1 mb-4">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />
                      {s.risk}
                    </span>

                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-1.5 mb-4">
                      {s.painPoints.map((pp) => (
                        <li key={pp} className="flex items-start gap-2 text-sm text-slate-300">
                          <span className={`mt-1.5 w-1 h-1 rounded-full shrink-0 ${accent.dot}`} />
                          {pp}
                        </li>
                      ))}
                    </ul>

                    <p className="text-sm text-slate-300 leading-snug border-t border-white/10 pt-3.5 mb-4">
                      {s.line}
                    </p>

                    {/* Founder call: the three destinations become chips.
                        NOT three coloured chips — twelve cards times three
                        filled colours is thirty-six competing actions, and a
                        card with three equal buttons has no primary. One filled
                        chip in the sector's hue (the assessment, which is the
                        free thing), two outline chips beside it. Same three
                        destinations, one obvious order. */}
                    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
                      <p className="text-xs text-slate-400">
                        {preview ? (
                          <>
                            Sample score{" "}
                            <span className="font-semibold text-white tabular-nums">
                              {preview.score}/100
                            </span>{" "}
                            · illustrative
                          </>
                        ) : band ? (
                          <>
                            Typical risk{" "}
                            <span className="font-semibold text-white">{band}</span> ·
                            illustrative
                          </>
                        ) : null}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={s.href}
                          className="inline-flex items-center rounded-full border border-white/20 px-3 py-1.5 pointer-coarse:min-h-11 text-[13px] font-medium text-slate-200 hover:border-white/45 hover:text-white transition-colors"
                        >
                          Industry guide
                        </Link>
                        {flowHref && (
                          <FlowMapCardLink
                            href={flowHref}
                            sector={industrySlug}
                            className="rounded-full border border-white/20 px-3 py-1.5 pointer-coarse:min-h-11 text-[13px] font-medium text-slate-200 hover:border-white/45 hover:text-white"
                          />
                        )}
                        <Link
                          href={s.assessmentHref}
                          onClick={() =>
                            trackEvent.landingCtaClick({ cta: "sector", sector: assessmentSlug })
                          }
                          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 pointer-coarse:min-h-11 text-[13px] font-semibold text-navy-950 transition-colors ${accent.cta}`}
                        >
                          Take the assessment
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>

                    {/* The spine — founder note: "user should see the Industry
                        caption clearly." Off-centre cards used to show clipped
                        text fragments; now they read as labelled spines behind
                        the open card, icon + name anchored to the exposed
                        edge. Clicking a spine deals that card forward. */}
                    <div
                      aria-hidden="true"
                      className={`absolute inset-0 bg-navy-700 flex items-center transition-opacity duration-300 motion-reduce:!transition-none ${
                        centred ? "opacity-0 pointer-events-none" : "opacity-100"
                      } ${d < 0 ? "justify-start pl-7" : "justify-end pr-7"}`}
                    >
                      <span className={`flex items-center gap-3 ${d < 0 ? "" : "flex-row-reverse"}`}>
                        <span className="w-10 h-10 rounded-lg bg-white/10 grid place-items-center shrink-0">
                          <Icon size={20} className={accent.icon} />
                        </span>
                        <span className="text-sm font-semibold text-white whitespace-nowrap">
                          {s.chip}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* deck controls */}
          <div className="flex items-center justify-center gap-4 mt-5">
            <button
              type="button"
              onClick={() => go(active - 1, "arrow")}
              aria-label="Previous sector"
              className="w-11 h-11 sm:w-9 sm:h-9 rounded-full border border-cloud-200 bg-cloud-25 grid place-items-center text-slate-600 hover:border-teal-400 hover:text-teal-900 transition-colors disabled:opacity-35 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
            >
              <ArrowLeft size={16} />
            </button>
            <span className="text-xs text-slate-600 tabular-nums w-12 text-center">
              {active + 1} / {sectors.length}
            </span>
            <button
              type="button"
              onClick={() => go(active + 1, "arrow")}
              aria-label="Next sector"
              className="w-11 h-11 sm:w-9 sm:h-9 rounded-full border border-cloud-200 bg-cloud-25 grid place-items-center text-slate-600 hover:border-teal-400 hover:text-teal-900 transition-colors disabled:opacity-35 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <p className="text-center mt-6">
          <Link
            href="/industries"
            className="inline-flex items-center gap-1.5 pointer-coarse:min-h-11 text-sm font-medium text-teal-800 hover:text-teal-900 underline underline-offset-4 decoration-teal-800/30 hover:decoration-teal-800 transition-colors"
          >
            Explore all 12 industries
            <ArrowRight size={14} />
          </Link>
        </p>
      </div>
    </Section>
  );
}
