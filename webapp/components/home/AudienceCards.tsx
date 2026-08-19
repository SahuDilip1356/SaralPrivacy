import Link from "next/link";
import { Users, Calculator, GraduationCap, ShoppingBag, Stethoscope, School, Scale, Building2, Hotel, Pill, Landmark, Sparkles, ArrowRight } from "lucide-react";
import { DATA_MAPS } from "@/lib/data/data-flow";
import { FlowMapCardLink } from "./FlowMapCardLink";

// Beat 7 — "Explore DPDPA by your sector" (the 12-card wall, late placement).
// Per-sector COLOUR restored (Dilip's call — differentiation + scannability),
// PLUS a semantic gold risk badge, PLUS quiet per-card links (green stays
// reserved for the page's primary CTAs). Full accent class strings are inlined
// so Tailwind's content scanner keeps them (no dynamic class construction).

const audiences = [
  {
    icon: Users, title: "Recruitment Agencies", href: "/industries/recruitment-agencies", assessmentHref: "/assessment/recruitment",
    risk: "Candidate ID & CV risk",
    painPoints: ["CV databases & candidate data", "Client profile sharing", "Background check documents", "Cross-border data flows"],
    promise: "Find out whether your recruitment workflows create DPDPA exposure in 3–5 minutes.",
    accentBg: "bg-teal-50", accentBorder: "border-teal-200", iconBg: "bg-teal-100", iconColor: "text-teal-700", flowLink: "text-teal-800",
  },
  {
    icon: Calculator, title: "CA Firms", href: "/industries/ca-firms", assessmentHref: "/assessment/ca-firms",
    risk: "PAN / Aadhaar / ITR risk",
    painPoints: ["PAN / Aadhaar / bank data", "Client payroll records", "Cloud drives & shared folders", "Sensitive financial documents"],
    promise: "Understand your DPDPA obligations for client records, payroll data, and firm operations.",
    accentBg: "bg-indigo-50", accentBorder: "border-indigo-200", iconBg: "bg-indigo-100", iconColor: "text-indigo-700", flowLink: "text-indigo-800",
  },
  {
    icon: GraduationCap, title: "Training Institutes", href: "/industries/training-institutes", assessmentHref: "/assessment/training-institutes",
    risk: "Student & parent data risk",
    painPoints: ["Student & parent data", "Admissions & lead forms", "Digital marketing consent", "Placement data retention"],
    promise: "Check whether your admissions, marketing, and student data workflows are DPDPA-ready.",
    accentBg: "bg-amber-50", accentBorder: "border-amber-200", iconBg: "bg-amber-100", iconColor: "text-amber-700", flowLink: "text-amber-800",
  },
  {
    icon: ShoppingBag, title: "D2C Brands", href: "/industries/d2c-brands", assessmentHref: "/assessment/d2c-brands",
    risk: "Marketing & pixel-data risk",
    painPoints: ["Email / SMS / WhatsApp marketing", "Third-party analytics & pixels", "Customer loyalty data", "Retention of inactive customers"],
    promise: "See whether your customer acquisition and retention stack creates DPDPA risk.",
    accentBg: "bg-rose-50", accentBorder: "border-rose-200", iconBg: "bg-rose-100", iconColor: "text-rose-700", flowLink: "text-rose-800",
  },
  {
    icon: Stethoscope, title: "Clinics & Diagnostic Labs", href: "/industries/clinics-diagnostic-labs", assessmentHref: "/assessment/clinics-diagnostic-labs",
    risk: "Health-data risk",
    painPoints: ["Prescriptions & lab reports", "WhatsApp report sharing", "Reception & lab staff access", "Old patient-record retention"],
    promise: "Check whether your patient-data and report-sharing workflows are DPDPA-ready.",
    accentBg: "bg-cyan-50", accentBorder: "border-cyan-200", iconBg: "bg-cyan-100", iconColor: "text-cyan-700", flowLink: "text-cyan-800",
  },
  {
    icon: School, title: "Schools & Colleges", href: "/industries/schools-colleges", assessmentHref: "/assessment/schools-colleges",
    risk: "Children's-data risk",
    painPoints: ["Children's data & parent consent", "School apps, ERP & LMS", "CCTV, biometric & transport GPS", "Student photos & old records"],
    promise: "Check whether your student-data, parent-consent and monitoring workflows are DPDPA-ready.",
    accentBg: "bg-sky-50", accentBorder: "border-sky-200", iconBg: "bg-sky-100", iconColor: "text-sky-700", flowLink: "text-sky-800",
  },
  {
    icon: Scale, title: "Law Firms & Legal Consultants", href: "/industries/law-firms", assessmentHref: "/assessment/law-firms",
    risk: "Sensitive case-file risk",
    painPoints: ["Client KYC & evidence files", "Junior / intern / ex-staff access", "WhatsApp & email document sharing", "Closed matter-file retention"],
    promise: "Check whether your matter intake, sensitive-file access and sharing workflows are DPDPA-ready.",
    accentBg: "bg-violet-50", accentBorder: "border-violet-200", iconBg: "bg-violet-100", iconColor: "text-violet-700", flowLink: "text-violet-800",
  },
  {
    icon: Building2, title: "Real Estate & Property Firms", href: "/industries/real-estate", assessmentHref: "/assessment/real-estate",
    risk: "KYC & broker-sharing risk",
    painPoints: ["Buyer/tenant KYC & PAN/Aadhaar", "WhatsApp lead & document sharing", "Broker networks & loan partners", "Old lead-database retention"],
    promise: "Check whether your KYC handling, broker sharing and lead retention workflows are DPDPA-ready.",
    accentBg: "bg-emerald-50", accentBorder: "border-emerald-200", iconBg: "bg-emerald-100", iconColor: "text-emerald-700", flowLink: "text-emerald-800",
  },
  {
    icon: Hotel, title: "Hotels, Hospitality & Travel", href: "/industries/hotels-travel", assessmentHref: "/assessment/hotels-travel",
    risk: "Guest-ID retention risk",
    painPoints: ["Guest IDs & passport copies", "OTA & travel-vendor sharing", "WhatsApp confirmations & CCTV", "Old guest-record retention"],
    promise: "See whether your guest IDs, OTA sharing, travel documents and record retention are DPDPA-ready.",
    accentBg: "bg-orange-50", accentBorder: "border-orange-200", iconBg: "bg-orange-100", iconColor: "text-orange-700", flowLink: "text-orange-800",
  },
  {
    icon: Pill, title: "Pharmacies & Online Pharmacies", href: "/industries/pharmacies", assessmentHref: "/assessment/pharmacies",
    risk: "Prescription-data risk",
    painPoints: ["Prescriptions & medicine history", "WhatsApp orders & health indicators", "Delivery-partner data sharing", "Old prescription retention"],
    promise: "Check whether your prescriptions, medicine-history handling and vendor sharing are DPDPA-ready.",
    accentBg: "bg-purple-50", accentBorder: "border-purple-200", iconBg: "bg-purple-100", iconColor: "text-purple-700", flowLink: "text-purple-800",
  },
  {
    icon: Landmark, title: "Fintech, NBFC & Digital Payments", href: "/industries/fintech-nbfc", assessmentHref: "/assessment/fintech-nbfc",
    risk: "KYC & profiling risk",
    painPoints: ["KYC, PAN/Aadhaar & bank data", "Bureau checks & credit profiling", "DSAs & collection-agent access", "Old application & KYC retention"],
    promise: "See whether your KYC, profiling, partner sharing and agent access are DPDPA-ready.",
    accentBg: "bg-blue-50", accentBorder: "border-blue-200", iconBg: "bg-blue-100", iconColor: "text-blue-700", flowLink: "text-blue-800",
  },
  {
    icon: Sparkles, title: "Gyms, Salons & Spas", href: "/industries/gyms-salons-spas", assessmentHref: "/assessment/gyms-salons-spas",
    risk: "Photo & health-data risk",
    painPoints: ["Health & body measurements", "Customer & before-after photos", "WhatsApp campaigns & staff phones", "Old member-record retention"],
    promise: "Check whether your photo consent, health-data handling and staff access are DPDPA-ready.",
    accentBg: "bg-fuchsia-50", accentBorder: "border-fuchsia-200", iconBg: "bg-fuchsia-100", iconColor: "text-fuchsia-700", flowLink: "text-fuchsia-800",
  },
];

// Registry-driven flow-map links: a card gets one only when its sector's map
// is live, so a new map appears here with zero edits and a roadmap sector
// renders nothing — no fake doors, no third hardcoded href.
const FLOW_HREFS = new Map(
  DATA_MAPS.filter((m) => m.live).map((m) => [m.sector.slug, m.href]),
);

export function AudienceCards() {
  return (
    <section id="sectors" className="py-20 bg-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Heading */}
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-semibold uppercase tracking-wide text-teal-600 mb-3">
            Explore DPDPA by your sector
          </span>
          <h2 className="text-3xl sm:text-4xl font-semibold text-navy-700 mb-4">
            Same law. Different data. Different fixes.
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
            A clinic, a CA firm and a D2C brand all hold personal data — but the
            risks, obligations and fixes are completely different. Pick yours.
          </p>
        </div>

        {/* Cards grid — per-sector colour + gold risk badge; 12 = clean 4×3 at lg */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {audiences.map((a) => {
            const sectorSlug = a.href.replace("/industries/", "");
            const flowHref = FLOW_HREFS.get(sectorSlug);
            return (
              <div
                key={a.title}
                className={`rounded-xl border ${a.accentBorder} ${a.accentBg} p-6 flex flex-col transition-shadow hover:shadow-card`}
              >
                <div className={`w-10 h-10 rounded-lg ${a.iconBg} flex items-center justify-center mb-4`}>
                  <a.icon size={20} className={a.iconColor} />
                </div>

                <h3 className="font-semibold text-navy-700 text-lg mb-2">{a.title}</h3>

                {/* semantic gold risk badge */}
                <span className="inline-flex items-center gap-1.5 self-start text-2xs font-semibold text-navy-700 bg-gold-400/20 border border-gold-400/40 rounded-full px-2.5 py-1 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-500" />
                  {a.risk}
                </span>

                <ul className="space-y-1.5 mb-4 flex-1">
                  {a.painPoints.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className={`mt-1.5 w-1 h-1 rounded-full ${a.iconColor} shrink-0`} style={{ backgroundColor: "currentColor" }} />
                      {point}
                    </li>
                  ))}
                </ul>

                <p className="text-sm text-slate-500 italic mb-4 leading-snug">
                  {a.promise}
                </p>

                {/* Quiet per-card links — green reserved for the page's primary CTAs */}
                <div className="border-t border-black/5 pt-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <Link
                      href={a.assessmentHref}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-800 transition-colors"
                    >
                      Take the assessment
                      <ArrowRight size={14} />
                    </Link>
                    <Link
                      href={a.href}
                      className="text-sm font-medium text-slate-500 hover:text-navy-700 transition-colors"
                    >
                      Industry guide
                    </Link>
                  </div>
                  {flowHref && (
                    <FlowMapCardLink href={flowHref} sector={sectorSlug} className={a.flowLink} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
