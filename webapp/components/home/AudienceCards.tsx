import Link from "next/link";
import { Users, Calculator, GraduationCap, ShoppingBag, Stethoscope, School, Scale, Building2, Hotel, Pill, Landmark, Sparkles, ArrowRight } from "lucide-react";

// Beat 7 — "Explore DPDPA by your sector" (the 12-card wall, late placement).
// Reskinned to brand: ONE uniform card treatment (retired the 12 per-sector
// hues) + quiet per-card links (no 12 green buttons — green is reserved for the
// page's primary CTAs). The per-sector content is carried over unchanged.

const audiences = [
  {
    icon: Users,
    title: "Recruitment Agencies",
    href: "/industries/recruitment-agencies",
    assessmentHref: "/assessment/recruitment",
    painPoints: ["CV databases & candidate data", "Client profile sharing", "Background check documents", "Cross-border data flows"],
    promise: "Find out whether your recruitment workflows create DPDPA exposure in 3–5 minutes.",
  },
  {
    icon: Calculator,
    title: "CA Firms",
    href: "/industries/ca-firms",
    assessmentHref: "/assessment/ca-firms",
    painPoints: ["PAN / Aadhaar / bank data", "Client payroll records", "Cloud drives & shared folders", "Sensitive financial documents"],
    promise: "Understand your DPDPA obligations for client records, payroll data, and firm operations.",
  },
  {
    icon: GraduationCap,
    title: "Training Institutes",
    href: "/industries/training-institutes",
    assessmentHref: "/assessment/training-institutes",
    painPoints: ["Student & parent data", "Admissions & lead forms", "Digital marketing consent", "Placement data retention"],
    promise: "Check whether your admissions, marketing, and student data workflows are DPDPA-ready.",
  },
  {
    icon: ShoppingBag,
    title: "D2C Brands",
    href: "/industries/d2c-brands",
    assessmentHref: "/assessment/d2c-brands",
    painPoints: ["Email / SMS / WhatsApp marketing", "Third-party analytics & pixels", "Customer loyalty data", "Retention of inactive customers"],
    promise: "See whether your customer acquisition and retention stack creates DPDPA risk.",
  },
  {
    icon: Stethoscope,
    title: "Clinics & Diagnostic Labs",
    href: "/industries/clinics-diagnostic-labs",
    assessmentHref: "/assessment/clinics-diagnostic-labs",
    painPoints: ["Prescriptions & lab reports", "WhatsApp report sharing", "Reception & lab staff access", "Old patient-record retention"],
    promise: "Check whether your patient-data and report-sharing workflows are DPDPA-ready.",
  },
  {
    icon: School,
    title: "Schools & Colleges",
    href: "/industries/schools-colleges",
    assessmentHref: "/assessment/schools-colleges",
    painPoints: ["Children's data & parent consent", "School apps, ERP & LMS", "CCTV, biometric & transport GPS", "Student photos & old records"],
    promise: "Check whether your student-data, parent-consent and monitoring workflows are DPDPA-ready.",
  },
  {
    icon: Scale,
    title: "Law Firms & Legal Consultants",
    href: "/industries/law-firms",
    assessmentHref: "/assessment/law-firms",
    painPoints: ["Client KYC & evidence files", "Junior / intern / ex-staff access", "WhatsApp & email document sharing", "Closed matter-file retention"],
    promise: "Check whether your matter intake, sensitive-file access and sharing workflows are DPDPA-ready.",
  },
  {
    icon: Building2,
    title: "Real Estate & Property Firms",
    href: "/industries/real-estate",
    assessmentHref: "/assessment/real-estate",
    painPoints: ["Buyer/tenant KYC & PAN/Aadhaar", "WhatsApp lead & document sharing", "Broker networks & loan partners", "Old lead-database retention"],
    promise: "Check whether your KYC handling, broker sharing and lead retention workflows are DPDPA-ready.",
  },
  {
    icon: Hotel,
    title: "Hotels, Hospitality & Travel",
    href: "/industries/hotels-travel",
    assessmentHref: "/assessment/hotels-travel",
    painPoints: ["Guest IDs & passport copies", "OTA & travel-vendor sharing", "WhatsApp confirmations & CCTV", "Old guest-record retention"],
    promise: "See whether your guest IDs, OTA sharing, travel documents and record retention are DPDPA-ready.",
  },
  {
    icon: Pill,
    title: "Pharmacies & Online Pharmacies",
    href: "/industries/pharmacies",
    assessmentHref: "/assessment/pharmacies",
    painPoints: ["Prescriptions & medicine history", "WhatsApp orders & health indicators", "Delivery-partner data sharing", "Old prescription retention"],
    promise: "Check whether your prescriptions, medicine-history handling and vendor sharing are DPDPA-ready.",
  },
  {
    icon: Landmark,
    title: "Fintech, NBFC & Digital Payments",
    href: "/industries/fintech-nbfc",
    assessmentHref: "/assessment/fintech-nbfc",
    painPoints: ["KYC, PAN/Aadhaar & bank data", "Bureau checks & credit profiling", "DSAs & collection-agent access", "Old application & KYC retention"],
    promise: "See whether your KYC, profiling, partner sharing and agent access are DPDPA-ready.",
  },
  {
    icon: Sparkles,
    title: "Gyms, Salons & Spas",
    href: "/industries/gyms-salons-spas",
    assessmentHref: "/assessment/gyms-salons-spas",
    painPoints: ["Health & body measurements", "Customer & before-after photos", "WhatsApp campaigns & staff phones", "Old member-record retention"],
    promise: "Check whether your photo consent, health-data handling and staff access are DPDPA-ready.",
  },
];

export function AudienceCards() {
  return (
    <section id="sectors" className="py-20 bg-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Heading */}
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-semibold uppercase tracking-wide text-teal-600 mb-3">
            Explore DPDPA by your sector
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-navy-700 mb-4">
            Same law. Different data. Different fixes.
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
            A clinic, a CA firm and a D2C brand all hold personal data — but the
            risks, obligations and fixes are completely different. Pick yours.
          </p>
        </div>

        {/* Cards grid — uniform treatment; 12 = clean 4×3 at lg */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {audiences.map((audience) => (
            <div
              key={audience.title}
              className="rounded-xl border border-slate-200 bg-white p-6 flex flex-col transition-colors hover:border-teal-300"
            >
              <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center mb-4">
                <audience.icon size={20} className="text-teal-600" />
              </div>

              <h3 className="font-bold text-navy-700 text-lg mb-2">{audience.title}</h3>

              <ul className="space-y-1.5 mb-4 flex-1">
                {audience.painPoints.map((point) => (
                  <li key={point} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-teal-500 shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>

              <p className="text-sm text-slate-500 italic mb-4 leading-snug">
                {audience.promise}
              </p>

              {/* Quiet per-card links — green is reserved for the page's primary CTAs */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <Link
                  href={audience.assessmentHref}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-800 transition-colors"
                >
                  Take the assessment
                  <ArrowRight size={14} />
                </Link>
                <Link
                  href={audience.href}
                  className="text-sm font-medium text-slate-500 hover:text-navy-700 transition-colors"
                >
                  Industry guide
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
