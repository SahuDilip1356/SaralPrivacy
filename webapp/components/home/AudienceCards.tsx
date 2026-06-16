import Link from "next/link";
import { Users, Calculator, GraduationCap, ShoppingBag, Stethoscope, School, Scale, Building2, Hotel, Pill, Landmark, Sparkles, ArrowRight } from "lucide-react";

const audiences = [
  {
    icon: Users,
    title: "Recruitment Agencies",
    href: "/industries/recruitment-agencies",
    assessmentHref: "/assessment/recruitment",
    color: "teal",
    painPoints: ["CV databases & candidate data", "Client profile sharing", "Background check documents", "Cross-border data flows"],
    promise: "Find out whether your recruitment workflows create DPDPA exposure in 3–5 minutes.",
    accentBg: "bg-teal-50",
    accentBorder: "border-teal-200",
    accentText: "text-teal-700",
    iconBg: "bg-teal-100",
    iconColor: "text-teal-700",
  },
  {
    icon: Calculator,
    title: "CA Firms",
    href: "/industries/ca-firms",
    assessmentHref: "/assessment/ca-firms",
    color: "indigo",
    painPoints: ["PAN / Aadhaar / bank data", "Client payroll records", "Cloud drives & shared folders", "Sensitive financial documents"],
    promise: "Understand your DPDPA obligations for client records, payroll data, and firm operations.",
    accentBg: "bg-indigo-50",
    accentBorder: "border-indigo-200",
    accentText: "text-indigo-700",
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-700",
  },
  {
    icon: GraduationCap,
    title: "Training Institutes",
    href: "/industries/training-institutes",
    assessmentHref: "/assessment/training-institutes",
    color: "amber",
    painPoints: ["Student & parent data", "Admissions & lead forms", "Digital marketing consent", "Placement data retention"],
    promise: "Check whether your admissions, marketing, and student data workflows are DPDPA-ready.",
    accentBg: "bg-amber-50",
    accentBorder: "border-amber-200",
    accentText: "text-amber-700",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-700",
  },
  {
    icon: ShoppingBag,
    title: "D2C Brands",
    href: "/industries/d2c-brands",
    assessmentHref: "/assessment/d2c-brands",
    color: "rose",
    painPoints: ["Email / SMS / WhatsApp marketing", "Third-party analytics & pixels", "Customer loyalty data", "Retention of inactive customers"],
    promise: "See whether your customer acquisition and retention stack creates DPDPA risk.",
    accentBg: "bg-rose-50",
    accentBorder: "border-rose-200",
    accentText: "text-rose-700",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-700",
  },
  {
    icon: Stethoscope,
    title: "Clinics & Diagnostic Labs",
    href: "/industries/clinics-diagnostic-labs",
    assessmentHref: "/assessment/clinics-diagnostic-labs",
    color: "cyan",
    painPoints: ["Prescriptions & lab reports", "WhatsApp report sharing", "Reception & lab staff access", "Old patient-record retention"],
    promise: "Check whether your patient-data and report-sharing workflows are DPDPA-ready.",
    accentBg: "bg-cyan-50",
    accentBorder: "border-cyan-200",
    accentText: "text-cyan-700",
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-700",
  },
  {
    icon: School,
    title: "Schools & Colleges",
    href: "/industries/schools-colleges",
    assessmentHref: "/assessment/schools-colleges",
    color: "sky",
    painPoints: ["Children's data & parent consent", "School apps, ERP & LMS", "CCTV, biometric & transport GPS", "Student photos & old records"],
    promise: "Check whether your student-data, parent-consent and monitoring workflows are DPDPA-ready.",
    accentBg: "bg-sky-50",
    accentBorder: "border-sky-200",
    accentText: "text-sky-700",
    iconBg: "bg-sky-100",
    iconColor: "text-sky-700",
  },
  {
    icon: Scale,
    title: "Law Firms & Legal Consultants",
    href: "/industries/law-firms",
    assessmentHref: "/assessment/law-firms",
    color: "violet",
    painPoints: ["Client KYC & evidence files", "Junior / intern / ex-staff access", "WhatsApp & email document sharing", "Closed matter-file retention"],
    promise: "Check whether your matter intake, sensitive-file access and sharing workflows are DPDPA-ready.",
    accentBg: "bg-violet-50",
    accentBorder: "border-violet-200",
    accentText: "text-violet-700",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-700",
  },
  {
    icon: Building2,
    title: "Real Estate & Property Firms",
    href: "/industries/real-estate",
    assessmentHref: "/assessment/real-estate",
    color: "emerald",
    painPoints: ["Buyer/tenant KYC & PAN/Aadhaar", "WhatsApp lead & document sharing", "Broker networks & loan partners", "Old lead-database retention"],
    promise: "Check whether your KYC handling, broker sharing and lead retention workflows are DPDPA-ready.",
    accentBg: "bg-emerald-50",
    accentBorder: "border-emerald-200",
    accentText: "text-emerald-700",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-700",
  },
  {
    icon: Hotel,
    title: "Hotels, Hospitality & Travel",
    href: "/industries/hotels-travel",
    assessmentHref: "/assessment/hotels-travel",
    color: "orange",
    painPoints: ["Guest IDs & passport copies", "OTA & travel-vendor sharing", "WhatsApp confirmations & CCTV", "Old guest-record retention"],
    promise: "See whether your guest IDs, OTA sharing, travel documents and record retention are DPDPA-ready.",
    accentBg: "bg-orange-50",
    accentBorder: "border-orange-200",
    accentText: "text-orange-700",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-700",
  },
  {
    icon: Pill,
    title: "Pharmacies & Online Pharmacies",
    href: "/industries/pharmacies",
    assessmentHref: "/assessment/pharmacies",
    color: "purple",
    painPoints: ["Prescriptions & medicine history", "WhatsApp orders & health indicators", "Delivery-partner data sharing", "Old prescription retention"],
    promise: "Check whether your prescriptions, medicine-history handling and vendor sharing are DPDPA-ready.",
    accentBg: "bg-purple-50",
    accentBorder: "border-purple-200",
    accentText: "text-purple-700",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-700",
  },
  {
    icon: Landmark,
    title: "Fintech, NBFC & Digital Payments",
    href: "/industries/fintech-nbfc",
    assessmentHref: "/assessment/fintech-nbfc",
    color: "blue",
    painPoints: ["KYC, PAN/Aadhaar & bank data", "Bureau checks & credit profiling", "DSAs & collection-agent access", "Old application & KYC retention"],
    promise: "See whether your KYC, profiling, partner sharing and agent access are DPDPA-ready.",
    accentBg: "bg-blue-50",
    accentBorder: "border-blue-200",
    accentText: "text-blue-700",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-700",
  },
  {
    icon: Sparkles,
    title: "Gyms, Salons & Spas",
    href: "/industries/gyms-salons-spas",
    assessmentHref: "/assessment/gyms-salons-spas",
    color: "fuchsia",
    painPoints: ["Health & body measurements", "Customer & before-after photos", "WhatsApp campaigns & staff phones", "Old member-record retention"],
    promise: "Check whether your photo consent, health-data handling and staff access are DPDPA-ready.",
    accentBg: "bg-fuchsia-50",
    accentBorder: "border-fuchsia-200",
    accentText: "text-fuchsia-700",
    iconBg: "bg-fuchsia-100",
    iconColor: "text-fuchsia-700",
  },
];

export function AudienceCards() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Heading */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-full px-3.5 py-1.5 mb-4">
            <span className="text-teal-700 text-xs font-semibold">Industry-Specific Guidance</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-navy-700 mb-4">
            DPDPA affects different businesses
            <span className="block text-teal-600">in very different ways</span>
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
            A recruitment agency, a CA firm, a training institute, a D2C brand, and a clinic all collect
            personal data, but their risks, obligations, and compliance paths are completely different.
          </p>
        </div>

        {/* Cards grid */}
        {/* 12 cards: clean 4×3 at lg (no orphan). The lone-trailing-card centering
            column at lg so the orphan row doesn't look broken. Self-deactivates
            when the count fills the grid evenly. */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:[&>*:last-child:nth-child(3n+1)]:col-start-2">
          {audiences.map((audience) => (
            <div
              key={audience.title}
              className={`rounded-xl border ${audience.accentBorder} ${audience.accentBg} p-6 flex flex-col`}
            >
              {/* Icon */}
              <div className={`w-10 h-10 rounded-lg ${audience.iconBg} flex items-center justify-center mb-4`}>
                <audience.icon size={20} className={audience.iconColor} />
              </div>

              {/* Title */}
              <h3 className="font-bold text-navy-700 text-lg mb-2">{audience.title}</h3>

              {/* Pain points */}
              <ul className="space-y-1.5 mb-4 flex-1">
                {audience.painPoints.map((point) => (
                  <li key={point} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className={`mt-1.5 w-1 h-1 rounded-full ${audience.iconColor.replace('text-', 'bg-')} shrink-0`} />
                    {point}
                  </li>
                ))}
              </ul>

              {/* Promise */}
              <p className={`text-sm font-medium ${audience.accentText} mb-4 leading-snug`}>
                &ldquo;{audience.promise}&rdquo;
              </p>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <Link
                  href={audience.assessmentHref}
                  className={`inline-flex items-center justify-center gap-1.5 py-2.5 px-4 text-sm font-semibold text-white rounded-lg bg-green-500 hover:bg-green-600 transition-colors`}
                >
                  Take Assessment
                  <ArrowRight size={14} />
                </Link>
                <Link
                  href={audience.href}
                  className={`text-center text-sm font-medium ${audience.accentText} hover:underline`}
                >
                  View Industry Guide →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
