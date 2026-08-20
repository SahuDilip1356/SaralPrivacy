import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Users, Calculator, GraduationCap, ShoppingBag, Stethoscope, School, Scale, Building2, Hotel, Pill, Landmark, Sparkles } from "lucide-react";
import { DiscoveryCrossLink } from "@/components/DiscoveryCrossLink";
import { NoticeCrossLink } from "@/components/NoticeCrossLink";
import { accentFor } from "@/lib/data/sector-accents";

export const metadata: Metadata = {
  title: "DPDPA Compliance Guides for Indian Industries",
  description:
    "See how DPDPA affects recruitment agencies, CA firms, training institutes, D2C brands, clinics & diagnostic labs, schools & colleges, law firms, and real estate brokers, with sector risks, guides, and free assessments.",
  alternates: { canonical: 'https://saralprivacy.com/industries' },
};

const industries = [
  {
    icon: Users,
    title: "Recruitment & Staffing Agencies",
    slug: "recruitment-agencies",
    href: "/industries/recruitment-agencies",
    assessmentHref: "/assessment/recruitment",
    tagline: "CV databases, candidate consent, ATS, and cross-border placements",
    risks: ["Candidate data without consent", "CV sharing without disclosure", "Indefinite data retention", "Unvetted ATS vendors"],
    stat: "Most recruitment agencies store candidate data with no formal deletion process",
  },
  {
    icon: Calculator,
    title: "CA Firms & Accounting Practices",
    slug: "ca-firms",
    href: "/industries/ca-firms",
    assessmentHref: "/assessment/ca-firms",
    tagline: "PAN, Aadhaar, payroll, client records, and cloud storage",
    risks: ["Unencrypted Aadhaar copies", "Broad staff access to client files", "No retention policy", "Unvetted cloud vendors"],
    stat: "CA firms process some of the most sensitive personal data in India",
  },
  {
    icon: GraduationCap,
    title: "Training Institutes & Coaching Centres",
    slug: "training-institutes",
    href: "/industries/training-institutes",
    assessmentHref: "/assessment/training-institutes",
    tagline: "Student and parent data, admissions forms, minors, placement records",
    risks: ["No minor consent mechanism", "Marketing pixels on forms", "Placement data misuse", "No data rights process"],
    stat: "Most training institutes have no formal privacy notice for admissions",
  },
  {
    icon: ShoppingBag,
    title: "D2C Brands & E-commerce Businesses",
    slug: "d2c-brands",
    href: "/industries/d2c-brands",
    assessmentHref: "/assessment/d2c-brands",
    tagline: "Marketing consent, analytics tools, WhatsApp campaigns, loyalty data",
    risks: ["Bundled checkout consent", "Undisclosed tracking pixels", "No unsubscribe mechanism", "Indefinite inactive data"],
    stat: "Most D2C checkout flows bundle marketing consent with purchase terms",
  },
  {
    icon: Stethoscope,
    title: "Clinics & Diagnostic Labs",
    slug: "clinics-diagnostic-labs",
    href: "/industries/clinics-diagnostic-labs",
    assessmentHref: "/assessment/clinics-diagnostic-labs",
    tagline: "Prescriptions, lab reports, WhatsApp sharing, home collection, and patient records",
    risks: ["WhatsApp report sharing", "Family sharing without verification", "Shared logins / ex-staff access", "Indefinite patient-record retention"],
    stat: "Most clinics and labs share reports over WhatsApp without verifying the recipient",
  },
  {
    icon: School,
    title: "Schools & Colleges",
    slug: "schools-colleges",
    href: "/industries/schools-colleges",
    assessmentHref: "/assessment/schools-colleges",
    tagline: "Children's data, parent consent, school apps, CCTV, attendance, transport and student photos",
    risks: ["Minors without parent consent", "Student photos posted publicly", "CCTV / biometric / GPS monitoring", "Indefinite student-record retention"],
    stat: "Most schools publish student photos and results without separate parental consent",
  },
  {
    icon: Scale,
    title: "Law Firms & Legal Consultants",
    slug: "law-firms",
    href: "/industries/law-firms",
    assessmentHref: "/assessment/law-firms",
    tagline: "Client KYC, case files, evidence, junior/intern access, court & vendor sharing, closed matters",
    risks: ["Sensitive files stored with regular matters", "Ex-staff / intern access lingering", "Evidence shared over WhatsApp/email", "Indefinite closed-matter retention"],
    stat: "Most firms confuse client confidentiality with DPDPA readiness — they are not the same",
  },
  {
    icon: Building2,
    title: "Real Estate Brokers & Property Firms",
    slug: "real-estate",
    href: "/industries/real-estate",
    assessmentHref: "/assessment/real-estate",
    tagline: "Buyer/tenant KYC, PAN/Aadhaar, agreements, WhatsApp lead sharing, broker networks, loan partners",
    risks: ["PAN/Aadhaar shared over WhatsApp", "Leads in co-broker WhatsApp groups", "Ex-staff / old broker access", "Indefinite old-lead retention"],
    stat: "Most firms keep old buyer/tenant databases indefinitely for future deals",
  },
  {
    icon: Hotel,
    title: "Hotels, Hospitality & Travel",
    slug: "hotels-travel",
    href: "/industries/hotels-travel",
    assessmentHref: "/assessment/hotels-travel",
    tagline: "Guest IDs, passport copies, booking records, OTA sharing, WhatsApp confirmations, travel documents, CCTV",
    risks: ["Passport copies over WhatsApp/email", "OTA & travel-vendor sharing", "Ex-staff / shared PMS logins", "Indefinite guest-record retention"],
    stat: "Hotels and travel agencies often keep ID and passport copies long after checkout",
  },
  {
    icon: Pill,
    title: "Pharmacies & Online Pharmacies",
    slug: "pharmacies",
    href: "/industries/pharmacies",
    assessmentHref: "/assessment/pharmacies",
    tagline: "Prescriptions, medicine history, health indicators, WhatsApp orders, refill reminders, delivery partners",
    risks: ["Prescription images over WhatsApp", "Medicine-history reveals health data", "Delivery-staff over-access", "Indefinite prescription retention"],
    stat: "Medicine history can reveal health conditions even without a diagnosis field",
  },
  {
    icon: Landmark,
    title: "Fintech, NBFC & Digital Payments",
    slug: "fintech-nbfc",
    href: "/industries/fintech-nbfc",
    assessmentHref: "/assessment/fintech-nbfc",
    tagline: "KYC, PAN/Aadhaar, bank & bureau data, UPI, credit profiling, DSAs, collection agents, vendor platforms",
    risks: ["Bank/bureau data over WhatsApp/DSAs", "Profiling with bundled consent", "Agents exporting customer lists", "Indefinite KYC & rejected-lead retention"],
    stat: "Fintech data moves across a large partner and agent ecosystem — the biggest practical risk",
  },
  {
    icon: Sparkles,
    title: "Gyms, Salons & Spas",
    slug: "gyms-salons-spas",
    href: "/industries/gyms-salons-spas",
    assessmentHref: "/assessment/gyms-salons-spas",
    tagline: "Membership data, health/body measurements, consultation notes, customer photos, WhatsApp campaigns, staff phones",
    risks: ["Customer photos used without consent", "Health/body data in WhatsApp/staff notes", "Staff personal phones & shared logins", "Indefinite photo & record retention"],
    stat: "Before-after photos and health/body data are high-impact, even though it isn't a clinic",
  },
];

export default function IndustriesPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-navy-700 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl font-semibold text-white mb-3">
              DPDPA by Industry
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed">
              Different sectors face different DPDPA risks. Choose your industry for tailored guidance,
              specific risk areas, and a free readiness assessment.
            </p>
          </div>
          <div className="mt-4 max-w-2xl bg-white/10 border border-white/20 rounded-xl px-5 py-4">
            <p className="text-slate-200 text-sm leading-relaxed">This page is for businesses that know DPDPA matters but need to understand where the risk actually sits in their own sector. The law is the same. The operational mess is different.</p>
            <p className="text-green-300 text-xs mt-2 font-medium">Same law. Different data flows. Different fixes.</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">

        <DiscoveryCrossLink className="mb-10" />
        <NoticeCrossLink className="mb-10" />

        {/* Comparison table — crawlable SSR content for snippet extraction and AI retrieval */}
        <div className="overflow-x-auto mb-10">
          <table className="w-full text-sm border-collapse bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200">
            <thead>
              <tr className="bg-navy-700 text-white">
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide">Industry</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide">Main personal data types</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide">Highest DPDPA risk</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide">First fix</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide">Assessment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-semibold text-navy-700">Recruitment Agencies</td>
                <td className="px-4 py-3 text-slate-600">CVs, candidate profiles, Aadhaar/PAN, background documents</td>
                <td className="px-4 py-3 text-red-700 font-medium">CV databases without consent or deletion policy</td>
                <td className="px-4 py-3 text-slate-600">Add consent at submission; define retention periods</td>
                <td className="px-4 py-3"><a href="/assessment/recruitment" className="text-green-800 font-semibold hover:underline">Start →</a></td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-semibold text-navy-700">CA Firms</td>
                <td className="px-4 py-3 text-slate-600">PAN, Aadhaar, payroll records, bank details, tax filings</td>
                <td className="px-4 py-3 text-red-700 font-medium">Broad staff access to sensitive client documents</td>
                <td className="px-4 py-3 text-slate-600">Role-based access controls and DPAs with cloud vendors</td>
                <td className="px-4 py-3"><a href="/assessment/ca-firms" className="text-green-800 font-semibold hover:underline">Start →</a></td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-semibold text-navy-700">Training Institutes</td>
                <td className="px-4 py-3 text-slate-600">Student names, contacts, minor data, placement records</td>
                <td className="px-4 py-3 text-red-700 font-medium">Processing minors&#39; data without verifiable parental consent</td>
                <td className="px-4 py-3 text-slate-600">Implement parental consent mechanism for under-18 students</td>
                <td className="px-4 py-3"><a href="/assessment/training-institutes" className="text-green-800 font-semibold hover:underline">Start →</a></td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-semibold text-navy-700">D2C Brands</td>
                <td className="px-4 py-3 text-slate-600">Checkout details, marketing lists, behavioural and loyalty data</td>
                <td className="px-4 py-3 text-red-700 font-medium">Bundled marketing consent at checkout</td>
                <td className="px-4 py-3 text-slate-600">Separate marketing consent from purchase processing</td>
                <td className="px-4 py-3"><a href="/assessment/d2c-brands" className="text-green-800 font-semibold hover:underline">Start →</a></td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-semibold text-navy-700">Clinics &amp; Diagnostic Labs</td>
                <td className="px-4 py-3 text-slate-600">Prescriptions, lab reports, diagnostic images, patient and family contacts</td>
                <td className="px-4 py-3 text-red-700 font-medium">Sharing reports over WhatsApp without verifying the recipient</td>
                <td className="px-4 py-3 text-slate-600">Verify recipient identity before sharing; control WhatsApp/email sharing</td>
                <td className="px-4 py-3"><a href="/assessment/clinics-diagnostic-labs" className="text-green-800 font-semibold hover:underline">Start →</a></td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-semibold text-navy-700">Schools &amp; Colleges</td>
                <td className="px-4 py-3 text-slate-600">Children&#39;s data, parent records, admission/ID docs, marks, photos, transport and CCTV</td>
                <td className="px-4 py-3 text-red-700 font-medium">Minors&#39; data and public student photos without parental consent</td>
                <td className="px-4 py-3 text-slate-600">Document parent/guardian consent and a photo-consent + removal process</td>
                <td className="px-4 py-3"><a href="/assessment/schools-colleges" className="text-green-800 font-semibold hover:underline">Start →</a></td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-semibold text-navy-700">Law Firms &amp; Legal Consultants</td>
                <td className="px-4 py-3 text-slate-600">Client KYC, PAN/Aadhaar, contracts, affidavits, evidence files, court and sensitive records</td>
                <td className="px-4 py-3 text-red-700 font-medium">Sensitive case files unrestricted and ex-staff/intern access lingering</td>
                <td className="px-4 py-3 text-slate-600">Classify sensitive matters; move to matter-based, need-based access</td>
                <td className="px-4 py-3"><a href="/assessment/law-firms" className="text-green-800 font-semibold hover:underline">Start →</a></td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-semibold text-navy-700">Real Estate Brokers &amp; Property Firms</td>
                <td className="px-4 py-3 text-slate-600">Buyer/tenant KYC, PAN/Aadhaar, income/loan docs, rent &amp; sale agreements, property papers</td>
                <td className="px-4 py-3 text-red-700 font-medium">KYC and leads forwarded through WhatsApp broker groups</td>
                <td className="px-4 py-3 text-slate-600">Secure KYC intake; share leads only with instruction or documented purpose</td>
                <td className="px-4 py-3"><a href="/assessment/real-estate" className="text-green-800 font-semibold hover:underline">Start →</a></td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-semibold text-navy-700">Hotels, Hospitality &amp; Travel</td>
                <td className="px-4 py-3 text-slate-600">Guest IDs, passport/visa copies, booking records, itineraries, C-Form data, CCTV and access logs</td>
                <td className="px-4 py-3 text-red-700 font-medium">Passport copies over WhatsApp and indefinite guest-record retention</td>
                <td className="px-4 py-3 text-slate-600">Secure ID/passport intake; set retention &amp; deletion rules for guest records and CCTV</td>
                <td className="px-4 py-3"><a href="/assessment/hotels-travel" className="text-green-800 font-semibold hover:underline">Start →</a></td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-semibold text-navy-700">Pharmacies &amp; Online Pharmacies</td>
                <td className="px-4 py-3 text-slate-600">Prescriptions, medicine history, doctor details, delivery addresses, health indicators</td>
                <td className="px-4 py-3 text-red-700 font-medium">Prescription images on WhatsApp and medicine-history used without consent</td>
                <td className="px-4 py-3 text-slate-600">Secure prescription intake; limit delivery/vendor access; consent for refill messaging</td>
                <td className="px-4 py-3"><a href="/assessment/pharmacies" className="text-green-800 font-semibold hover:underline">Start →</a></td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-semibold text-navy-700">Fintech, NBFC &amp; Digital Payments</td>
                <td className="px-4 py-3 text-slate-600">KYC, PAN/Aadhaar, bank statements, bureau data, UPI, repayment history, collection notes</td>
                <td className="px-4 py-3 text-red-700 font-medium">Bank/bureau data via WhatsApp/DSAs and profiling on bundled consent</td>
                <td className="px-4 py-3 text-slate-600">Secure KYC intake; traceable consent; role-based, monitored agent access</td>
                <td className="px-4 py-3"><a href="/assessment/fintech-nbfc" className="text-green-800 font-semibold hover:underline">Start →</a></td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-semibold text-navy-700">Gyms, Salons &amp; Spas</td>
                <td className="px-4 py-3 text-slate-600">Membership data, fitness/body measurements, health declarations, consultation notes, customer photos</td>
                <td className="px-4 py-3 text-red-700 font-medium">Customer photos used without consent and health/body data without access control</td>
                <td className="px-4 py-3 text-slate-600">Photo consent + removal process; restrict health-data access; control staff phones</td>
                <td className="px-4 py-3"><a href="/assessment/gyms-salons-spas" className="text-green-800 font-semibold hover:underline">Start →</a></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {industries.map((ind) => {
            const a = accentFor(ind.slug).light;
            return (
            <div key={ind.title} className={`rounded-xl border-2 ${a.border} ${a.bg} p-6`}>
              <div className="flex items-start gap-4 mb-5">
                <div className={`w-12 h-12 rounded-xl ${a.iconBg} flex items-center justify-center shrink-0`}>
                  <ind.icon size={24} className={a.iconColor} />
                </div>
                <div>
                  <h2 className="font-semibold text-navy-700 text-xl leading-snug">{ind.title}</h2>
                  <p className={`text-sm ${a.iconColor} mt-1`}>{ind.tagline}</p>
                </div>
              </div>

              {/* Stat */}
              <div className="bg-white/70 rounded-lg px-4 py-3 mb-4">
                <p className="text-xs text-slate-600 italic">&ldquo;{ind.stat}&rdquo;</p>
              </div>

              {/* Risk areas */}
              <div className="mb-5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Common Risk Areas</p>
                <div className="grid grid-cols-2 gap-2">
                  {ind.risks.map((risk) => (
                    <div key={risk} className="flex items-start gap-1.5 text-xs text-slate-600">
                      <span className={`mt-1 w-1 h-1 rounded-full ${a.dot} shrink-0`} />
                      {risk}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Link
                  href={ind.assessmentHref}
                  className={`flex-1 text-center py-2.5 text-sm font-semibold text-white rounded-lg transition-colors ${a.btn}`}
                >
                  Free Assessment →
                </Link>
                <Link
                  href={ind.href}
                  className="flex-1 text-center py-2.5 text-sm font-semibold text-navy-700 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 transition-colors"
                >
                  View Full Guide →
                </Link>
              </div>
            </div>
            );
          })}
        </div>

        <div className="mt-10 pt-6 border-t border-slate-200 text-xs text-slate-600 space-y-1">
          <p><strong>Legal baseline:</strong> DPDP Rules, 2025 notified on 14 November 2025, with phased commencement.</p>
          <p>This page is for educational purposes and does not constitute legal advice.</p>
        </div>
      </div>
    </div>
  );
}
