import type { Metadata } from "next";
import Link from "next/link";
import { topicNav } from "@/lib/learnNav";
import { articleSchema as articleSchemaTag, speakableSchema } from "@/lib/schema";
import { Byline } from "@/components/seo/Byline";
import { FRESHNESS, toISODate } from "@/lib/content-freshness";

const BASE = "https://saralprivacy.com";

export const metadata: Metadata = {
  title: "DPDPA Penalties — Complete Guide to Section 33",
  description:
    "Complete guide to penalties under the Digital Personal Data Protection Act, 2023 — Schedule caps, Section 33(2) factors, the 2× enhancement under Section 33(3), role-wise exposure, and the Board inquiry process.",
  alternates: { canonical: `${BASE}/penalty-calculator` },
  openGraph: {
    title: "DPDPA Penalties — Complete Guide | SaralPrivacy",
    description:
      "Schedule-capped penalties, Section 33(2) factors, and the 2× enhancement mechanism under the DPDPA 2023. No formula — discretionary Board determination.",
    url: `${BASE}/penalty-calculator`,
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home",         item: BASE },
    { "@type": "ListItem", position: 2, name: "DPDPA Guide",  item: `${BASE}/learn` },
    { "@type": "ListItem", position: 3, name: "Penalties",    item: `${BASE}/penalty-calculator` },
  ],
};

// Article schema now flows through lib/schema's articleSchemaTag() helper below
// so the named Person author, inLanguage, and mainEntityOfPage stay consistent
// with every other content page on the site.

// ─── Reusable prose components ────────────────────────────────────────────────

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-semibold text-navy-700 mt-10 mb-3">{children}</h2>;
}
function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-base font-semibold text-navy-700 mt-6 mb-2">{children}</h3>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="text-slate-600 text-sm leading-relaxed mb-3">{children}</p>;
}
function HR() {
  return <hr className="border-slate-200 my-8" />;
}
function TableWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto my-4 rounded-xl border border-slate-200">
      <table className="w-full text-xs border-collapse">{children}</table>
    </div>
  );
}
function THead({ cols }: { cols: string[] }) {
  return (
    <thead>
      <tr className="bg-navy-700 text-white">
        {cols.map((c) => (
          <th key={c} className="text-left px-4 py-3 font-semibold whitespace-nowrap">{c}</th>
        ))}
      </tr>
    </thead>
  );
}

export default function PenaltyPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {articleSchemaTag(
        "Penalties Under the Digital Personal Data Protection Act, 2023",
        "Complete guide to the DPDPA penalty framework — Schedule caps, Section 33(2) factors, Section 33(3) enhancement, and the Board inquiry process.",
        `${BASE}/penalty-calculator`,
        "2026-04-29",
        toISODate(FRESHNESS.tools)
      )}
      {speakableSchema(['.answer-block'], `${BASE}/penalty-calculator`, 'DPDPA Penalties — Complete Guide to Section 33')}

      <div className="min-h-screen bg-slate-50">

        {/* Hero */}
        <div className="bg-navy-700 py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <nav className="text-xs text-slate-400 mb-4 flex items-center gap-1.5">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span>›</span>
              <Link href="/learn" className="hover:text-white transition-colors">DPDPA Guide</Link>
              <span>›</span>
              <span className="text-slate-300">Penalties</span>
            </nav>
            <div className="max-w-2xl">
              <h1 className="text-3xl sm:text-4xl font-semibold text-white mb-3 leading-snug">
                Penalties Under DPDPA — Complete Guide
              </h1>
              <div className="answer-block bg-white/10 border border-white/20 rounded-xl px-5 py-4" data-speakable="true">
                <p className="text-slate-200 text-sm leading-relaxed">
                  DPDPA penalties are administrative, Schedule-capped, and discretionary — not formula-based. The maximum penalty is ₹250 crore for failure to implement adequate security safeguards. The Data Protection Board determines the actual amount after considering six mandatory factors in Section 33(2) and may double it under Section 33(3) for repeat or grave breaches. This page explains the full framework, the inquiry process, and what factors weigh against you.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <Byline lastReviewed={FRESHNESS.tools} className="mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

            {/* Sidebar */}
            <div className="hidden lg:block">
              <div className="bg-white rounded-xl border border-slate-200 p-4 sticky top-24">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">DPDPA Guide</h3>
                <nav className="space-y-1">
                  {topicNav.map((t) => (
                    <Link
                      key={t.slug}
                      href={t.href ?? `/learn/${t.slug}`}
                      className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                        t.slug === "penalties"
                          ? "bg-green-50 text-green-600 font-semibold"
                          : "text-slate-600 hover:text-navy-700 hover:bg-slate-50"
                      }`}
                    >
                      {t.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>

            {/* Article */}
            <article className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-6 sm:p-8">

              {/* Section 1 */}
              <H2>1. Overview of the Penalty Framework</H2>
              <P>
                The Digital Personal Data Protection Act, 2023 (DPDPA) establishes a Schedule-capped monetary
                penalty framework administered by the <strong className="text-navy-700">Data Protection Board of India (DPBI)</strong> under{" "}
                <strong className="text-navy-700">Section 33</strong>. Penalties are administrative in nature and are imposed only after
                the Board concludes an inquiry, determines that a breach is <em>significant</em>, and gives the
                person an <em>opportunity of being heard</em>.
              </P>
              <P>
                The Act does not prescribe a mathematical formula, turnover-linked multiplier, or per-person
                calculation for arriving at the exact penalty amount. Instead, the Board exercises discretion
                within statutory caps, guided by mandatory consideration factors under{" "}
                <strong className="text-navy-700">Section 33(2)</strong> and an adjustment mechanism under{" "}
                <strong className="text-navy-700">Section 33(3)</strong>.
              </P>

              <HR />

              {/* Section 2 */}
              <H2>2. Penalty Quantum Under the Schedule</H2>
              <P>
                The Schedule to the Act (read with Section 33(1)) specifies seven categories of breach and their
                corresponding maximum penalties. The statutory text uses the formulation{" "}
                <strong className="text-navy-700">"May extend to…"</strong> for each category.
              </P>
              <TableWrap>
                <THead cols={["Item", "Breach Category", "Liable Person", "Provision", "Maximum Penalty"]} />
                <tbody>
                  {[
                    ["1", "Failure to take reasonable security safeguards to prevent personal data breach", "Data Fiduciary", "Section 8(5)", "₹250 crore"],
                    ["2", "Failure to give notice of personal data breach to the Board or affected Data Principal", "Data Fiduciary", "Section 8(6)", "₹200 crore"],
                    ["3", "Breach of additional obligations in relation to children", "Data Fiduciary", "Section 9", "₹200 crore"],
                    ["4", "Breach of additional obligations of Significant Data Fiduciary", "Significant Data Fiduciary", "Section 10", "₹150 crore"],
                    ["5", "Breach of duties of Data Principal", "Data Principal", "Section 15", "₹10,000"],
                    ["6", "Breach of voluntary undertaking accepted by the Board", "Person who gave the undertaking", "Section 32", "Up to applicable underlying penalty"],
                    ["7", "Breach of any other provision of the Act or Rules", "Any person", "Any other provision", "₹50 crore"],
                  ].map(([item, breach, person, provision, cap]) => (
                    <tr key={item} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-navy-700 shrink-0">{item}</td>
                      <td className="px-4 py-3 text-slate-700">{breach}</td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{person}</td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{provision}</td>
                      <td className="px-4 py-3 font-semibold text-navy-700 whitespace-nowrap">{cap}</td>
                    </tr>
                  ))}
                </tbody>
              </TableWrap>

              <HR />

              {/* Section 3 */}
              <H2>3. The Statutory Trigger for Penalty</H2>
              <P>
                A monetary penalty is not automatic. The statutory structure requires the following sequential
                conditions to be satisfied:
              </P>
              <ol className="space-y-2 my-4 pl-2">
                {[
                  ["Breach of the Act or Rules", "there must be a contravention of a provision."],
                  ["Inquiry by the Board", "the DPBI must conduct an inquiry under Section 28."],
                  ["Significance determination", "the Board must conclude that the breach is significant."],
                  ["Opportunity of being heard", "the person must be given a reasonable opportunity to present their case."],
                  ["Schedule-based cap", "the penalty must fall within the amount specified in the Schedule for that category."],
                ].map(([term, desc], i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-600 leading-relaxed">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-navy-700 text-white flex items-center justify-center font-bold text-[10px] mt-0.5">{i + 1}</span>
                    <span><strong className="text-navy-700">{term}</strong> — {desc}</span>
                  </li>
                ))}
              </ol>
              <div className="border-l-4 border-green-500 pl-4 my-5 bg-green-50 py-3 pr-4 rounded-r-xl">
                <p className="text-sm text-slate-700 font-medium">
                  <strong>Statutory structure:</strong> Breach + Inquiry + Significance + Hearing + Schedule Cap = Monetary Penalty under Section 33.
                </p>
              </div>

              <HR />

              {/* Section 4 */}
              <H2>4. Factors for Determining the Penalty Amount</H2>
              <P>
                Under <strong className="text-navy-700">Section 33(2)</strong>, the Board <em>shall have regard to</em> the
                following factors when fixing the quantum within the Schedule cap. These are{" "}
                <strong className="text-navy-700">statutory considerations</strong>, not numerical weights or percentage multipliers.
              </P>
              <TableWrap>
                <THead cols={["Factor", "Description"]} />
                <tbody>
                  {[
                    ["Nature, gravity and duration of the breach", "What the breach was, how serious it was, and how long it continued"],
                    ["Type and nature of personal data affected", "Whether sensitive, financial, health, or children's data was involved"],
                    ["Repetitive nature of the breach", "Whether it was a first-time or recurring violation"],
                    ["Gain realised or loss avoided", "Whether the person profited or avoided costs by the breach"],
                    ["Mitigation action", "Steps taken to reduce the effects and consequences"],
                    ["Timeliness and effectiveness of mitigation", "Whether the response was prompt and effective"],
                    ["Proportionality and deterrence", "Whether the penalty secures observance and deters future breach"],
                    ["Likely impact of penalty on the person", "Financial capacity and effect on operations"],
                  ].map(([factor, desc]) => (
                    <tr key={factor} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-navy-700 align-top">{factor}</td>
                      <td className="px-4 py-3 text-slate-600">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </TableWrap>

              <HR />

              {/* Section 5 */}
              <H2>5. Critical Statutory Enhancement: Section 33(3)</H2>
              <P>
                A crucial provision often overlooked is <strong className="text-navy-700">Section 33(3)</strong>, which empowers the
                Board to <strong className="text-navy-700">reduce or enhance</strong> the penalty to the extent of{" "}
                <strong className="text-navy-700">twice the quantum</strong> after considering the Section 33(2) factors.
              </P>
              <TableWrap>
                <THead cols={["Schedule Item", "Base Cap", "Effective Maximum After 2× Enhancement"]} />
                <tbody>
                  {[
                    ["Item 1 — Security safeguards",           "₹250 crore", "₹500 crore"],
                    ["Item 2 — Breach notification",           "₹200 crore", "₹400 crore"],
                    ["Item 3 — Children's obligations",        "₹200 crore", "₹400 crore"],
                    ["Item 4 — Significant Data Fiduciary",    "₹150 crore", "₹300 crore"],
                    ["Item 7 — Residual category",             "₹50 crore",  "₹100 crore"],
                  ].map(([item, base, enhanced]) => (
                    <tr key={item} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-700">{item}</td>
                      <td className="px-4 py-3 text-slate-600">{base}</td>
                      <td className="px-4 py-3 font-bold text-red-700">{enhanced}</td>
                    </tr>
                  ))}
                </tbody>
              </TableWrap>
              <P>
                This means the Board is not rigidly bound by the Schedule caps if the aggravating factors
                justify a higher penalty. Conversely, mitigating factors may lead to a reduction.
              </P>

              <HR />

              {/* Section 6 */}
              <H2>6. Detailed Penalty Categories</H2>

              <H3>6.1 Failure to Take Reasonable Security Safeguards (Schedule Item 1)</H3>
              <ul className="space-y-1.5 my-3 pl-2">
                {[
                  ["Liable person", "Data Fiduciary"],
                  ["Provision", "Section 8(5)"],
                  ["Penalty cap", "₹250 crore (enhanceable to ₹500 crore)"],
                  ["Description", "Failure to protect personal data in its possession or control, including processing undertaken by a Data Processor on its behalf, by taking reasonable security safeguards to prevent a personal data breach."],
                ].map(([k, v]) => (
                  <li key={k} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" />
                    <span><strong className="text-navy-700">{k}:</strong> {v}</span>
                  </li>
                ))}
              </ul>

              <H3>6.2 Failure to Notify Personal Data Breach (Schedule Item 2)</H3>
              <ul className="space-y-1.5 my-3 pl-2">
                {[
                  ["Liable person", "Data Fiduciary"],
                  ["Provision", "Section 8(6)"],
                  ["Penalty cap", "₹200 crore (enhanceable to ₹400 crore)"],
                  ["Description", "Failure to give the Board and each affected Data Principal intimation of a personal data breach."],
                ].map(([k, v]) => (
                  <li key={k} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" />
                    <span><strong className="text-navy-700">{k}:</strong> {v}</span>
                  </li>
                ))}
              </ul>

              <H3>6.3 Breach of Additional Obligations Relating to Children (Schedule Item 3)</H3>
              <ul className="space-y-1.5 my-3 pl-2">
                {[
                  ["Liable person", "Data Fiduciary"],
                  ["Provision", "Section 9"],
                  ["Penalty cap", "₹200 crore (enhanceable to ₹400 crore)"],
                  ["Description", "Breach of obligations such as obtaining verifiable parental consent, prohibiting tracking or behavioural monitoring, and prohibiting targeted advertising directed at children."],
                ].map(([k, v]) => (
                  <li key={k} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" />
                    <span><strong className="text-navy-700">{k}:</strong> {v}</span>
                  </li>
                ))}
              </ul>

              <H3>6.4 Breach of Additional Obligations of Significant Data Fiduciary (Schedule Item 4)</H3>
              <ul className="space-y-1.5 my-3 pl-2">
                {[
                  ["Liable person", "Significant Data Fiduciary"],
                  ["Provision", "Section 10"],
                  ["Penalty cap", "₹150 crore (enhanceable to ₹300 crore)"],
                  ["Description", "Non-compliance with additional obligations such as appointment of a Data Protection Officer, undertaking a Data Protection Impact Assessment, and periodic audits."],
                ].map(([k, v]) => (
                  <li key={k} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" />
                    <span><strong className="text-navy-700">{k}:</strong> {v}</span>
                  </li>
                ))}
              </ul>

              <H3>6.5 Breach of Duties of Data Principal (Schedule Item 5)</H3>
              <ul className="space-y-1.5 my-3 pl-2">
                {[
                  ["Liable person", "Data Principal"],
                  ["Provision", "Section 15"],
                  ["Penalty cap", "₹10,000"],
                  ["Description", "Breach of duties such as not registering a false or frivolous complaint and not furnishing false information."],
                ].map(([k, v]) => (
                  <li key={k} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" />
                    <span><strong className="text-navy-700">{k}:</strong> {v}</span>
                  </li>
                ))}
              </ul>

              <H3>6.6 Breach of Voluntary Undertaking (Schedule Item 6)</H3>
              <ul className="space-y-1.5 my-3 pl-2">
                {[
                  ["Liable person", "Person whose undertaking has been accepted"],
                  ["Provision", "Section 32"],
                  ["Penalty cap", "Up to the amount applicable for the underlying breach in respect of which proceedings under Section 28 were instituted"],
                  ["Description", "Where the Board accepts a voluntary undertaking, breach of any term may attract penalty up to the extent applicable for the original breach."],
                ].map(([k, v]) => (
                  <li key={k} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" />
                    <span><strong className="text-navy-700">{k}:</strong> {v}</span>
                  </li>
                ))}
              </ul>

              <H3>6.7 Breach of Any Other Provision — Residual Category (Schedule Item 7)</H3>
              <ul className="space-y-1.5 my-3 pl-2">
                {[
                  ["Liable person", "Any person"],
                  ["Provision", "Any other provision of the Act or Rules"],
                  ["Penalty cap", "₹50 crore (enhanceable to ₹100 crore)"],
                  ["Description", "This residual category captures all breaches not specifically covered by Items 1 to 6, ensuring no gap in enforcement."],
                ].map(([k, v]) => (
                  <li key={k} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" />
                    <span><strong className="text-navy-700">{k}:</strong> {v}</span>
                  </li>
                ))}
              </ul>

              <HR />

              {/* Section 7 */}
              <H2>7. Role-Wise Penalty Exposure</H2>

              <H3>7.1 Data Fiduciary</H3>
              <TableWrap>
                <THead cols={["Breach", "Provision", "Maximum Penalty"]} />
                <tbody>
                  {[
                    ["Failure to take reasonable security safeguards", "Section 8(5)", "₹250 crore"],
                    ["Failure to notify personal data breach", "Section 8(6)", "₹200 crore"],
                    ["Breach of obligations relating to children", "Section 9", "₹200 crore"],
                    ["Breach of any other provision (residual)", "Any other provision", "₹50 crore"],
                  ].map(([b, p, c]) => (
                    <tr key={b} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-700">{b}</td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{p}</td>
                      <td className="px-4 py-3 font-semibold text-navy-700 whitespace-nowrap">{c}</td>
                    </tr>
                  ))}
                </tbody>
              </TableWrap>

              <H3>7.2 Significant Data Fiduciary</H3>
              <TableWrap>
                <THead cols={["Breach", "Provision", "Maximum Penalty"]} />
                <tbody>
                  {[
                    ["Breach of additional obligations of SDF", "Section 10", "₹150 crore"],
                    ["Failure to take reasonable security safeguards", "Section 8(5)", "₹250 crore"],
                    ["Failure to notify personal data breach", "Section 8(6)", "₹200 crore"],
                    ["Breach of obligations relating to children", "Section 9", "₹200 crore"],
                    ["Breach of any other provision (residual)", "Any other provision", "₹50 crore"],
                  ].map(([b, p, c]) => (
                    <tr key={b} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-700">{b}</td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{p}</td>
                      <td className="px-4 py-3 font-semibold text-navy-700 whitespace-nowrap">{c}</td>
                    </tr>
                  ))}
                </tbody>
              </TableWrap>

              <H3>7.3 Data Principal</H3>
              <TableWrap>
                <THead cols={["Breach", "Provision", "Maximum Penalty"]} />
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-3 text-slate-700">Breach of duties of Data Principal</td>
                    <td className="px-4 py-3 text-slate-600">Section 15</td>
                    <td className="px-4 py-3 font-semibold text-navy-700">₹10,000</td>
                  </tr>
                </tbody>
              </TableWrap>

              <H3>7.4 Person Giving Voluntary Undertaking</H3>
              <TableWrap>
                <THead cols={["Breach", "Provision", "Maximum Penalty"]} />
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-3 text-slate-700">Breach of accepted voluntary undertaking</td>
                    <td className="px-4 py-3 text-slate-600">Section 32</td>
                    <td className="px-4 py-3 font-semibold text-navy-700">Up to applicable penalty for underlying breach</td>
                  </tr>
                </tbody>
              </TableWrap>

              <H3>7.5 Any Other Person</H3>
              <TableWrap>
                <THead cols={["Breach", "Provision", "Maximum Penalty"]} />
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-3 text-slate-700">Breach of any other provision of Act or Rules</td>
                    <td className="px-4 py-3 text-slate-600">Residual category</td>
                    <td className="px-4 py-3 font-semibold text-navy-700">₹50 crore</td>
                  </tr>
                </tbody>
              </TableWrap>

              <HR />

              {/* Section 8 */}
              <H2>8. Cumulative and Non-Exclusive Nature of Penalties</H2>
              <P>
                Under <strong className="text-navy-700">Section 33(4)</strong>, any penalty imposed is{" "}
                <strong className="text-navy-700">without prejudice to</strong> any other action that may be taken under the
                DPDPA or under any other law for the time being in force. This has two important implications:
              </P>
              <ul className="space-y-3 my-4 pl-2">
                <li className="flex items-start gap-2 text-sm text-slate-600 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" />
                  <span>
                    <strong className="text-navy-700">Parallel proceedings:</strong> Criminal prosecution, civil suits, or
                    regulatory actions under sectoral laws (e.g., the IT Act, RBI regulations, SEBI guidelines) may
                    proceed alongside DPDPA penalties.
                  </span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-600 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" />
                  <span>
                    <strong className="text-navy-700">Separate penalties for separate breaches:</strong> A single incident
                    may trigger multiple penalty categories. For example, a data breach caused by inadequate security
                    (Item 1) coupled with delayed notification (Item 2) could attract separate penalties up to ₹250 crore
                    and ₹200 crore respectively.
                  </span>
                </li>
              </ul>

              <HR />

              {/* Section 9 */}
              <H2>9. Destination of Penalty Sums</H2>
              <P>
                All sums realised by way of penalties imposed by the Board are credited to the{" "}
                <strong className="text-navy-700">Consolidated Fund of India</strong> under{" "}
                <strong className="text-navy-700">Section 34</strong> of the Act. Penalties are not paid as compensation
                to affected Data Principals. Affected individuals must pursue remedies for compensation separately under
                other applicable laws.
              </P>

              <HR />

              {/* Section 10 */}
              <H2>10. Statutory Safeguards and Limits</H2>
              <TableWrap>
                <THead cols={["Aspect", "Statutory Position"]} />
                <tbody>
                  {[
                    ["Maximum base penalty", "₹250 crore (Item 1)"],
                    ["Maximum effective penalty", "₹500 crore (after 2× enhancement under Section 33(3))"],
                    ["Minimum penalty", "Not specified — the Board may impose nil or nominal penalties for technical or trivial breaches"],
                    ["Per-person calculation", "Not prescribed"],
                    ["Turnover-linked formula", "Not prescribed"],
                    ["Imprisonment", "Not provided under the DPDPA"],
                    ["Opportunity to be heard", "Mandatory before penalty imposition"],
                    ["Appeal", "Available to the Telecom Disputes Settlement and Appellate Tribunal (TDSAT) under Section 29"],
                  ].map(([aspect, position]) => (
                    <tr key={aspect} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-navy-700 align-top whitespace-nowrap">{aspect}</td>
                      <td className="px-4 py-3 text-slate-600">{position}</td>
                    </tr>
                  ))}
                </tbody>
              </TableWrap>

              <HR />

              {/* Section 11 */}
              <H2>11. Final Statutory Position</H2>
              <P>
                The DPDPA penalty framework is a{" "}
                <strong className="text-navy-700">discretionary, Schedule-capped, administrative monetary penalty</strong> system.
                The Board determines the actual amount by weighing statutory factors under Section 33(2) and may adjust
                the quantum up to twice the Schedule cap under Section 33(3). There is no fixed formula, but there is a
                clear statutory ceiling and a structured inquiry process that every organisation must understand to
                assess its compliance risk accurately.
              </P>

              {/* Disclaimer */}
              <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 leading-relaxed">
                <strong>Disclaimer:</strong> This guide is prepared for informational purposes only and does not
                constitute legal advice. For specific compliance guidance under the DPDPA, consult a qualified
                data protection professional.
              </div>

              {/* CTA */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/assessment"
                  className="flex-1 py-3 bg-green-500 text-white text-sm font-semibold rounded-lg hover:bg-green-600 transition-colors text-center"
                >
                  Take Free DPDPA Readiness Assessment →
                </Link>
                <Link
                  href="/contact"
                  className="flex-1 py-3 bg-white border border-slate-200 text-navy-700 text-sm font-semibold rounded-lg hover:border-green-300 transition-colors text-center"
                >
                  Get Expert Consultation
                </Link>
              </div>

            </article>
          </div>
        </div>
      </div>
    </>
  );
}
