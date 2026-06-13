import type { Metadata } from "next";
import { faqPageSchema, breadcrumbSchema } from "@/lib/schema";
import DiscoveryClient from "./DiscoveryClient";
import "./discovery.css";

const URL = "https://saralprivacy.com/discovery";

export const metadata: Metadata = {
  title: "DPDPA Personal Data Discovery Tool — Free Risk Snapshot",
  description:
    "Find the personal data your Indian business actually holds. Pick your industry from 276 business types, confirm your data, and get an instant DPDPA risk snapshot with practical precautions — free, no email to see your result.",
  alternates: { canonical: URL },
  openGraph: {
    title: "DPDPA Personal Data Discovery Tool — SaralPrivacy",
    description:
      "Map the personal data your business holds, see the hidden risk areas most owners miss, and get practical precautions to get DPDP-ready — in about three minutes.",
    url: URL,
    type: "website",
  },
};

const DISCOVERY_FAQS = [
  {
    question: "What is personal data under the DPDP Act?",
    answer:
      "Under India's Digital Personal Data Protection Act, personal data is any data about an identifiable individual. In business terms: if a record can be tied back to a real person — a customer, patient, candidate, student, employee or vendor's staff — it counts. That includes obvious fields like names, phone numbers, emails and government IDs, and less obvious ones like cookie IDs, WhatsApp chats, abandoned-cart trails and CCTV footage.",
  },
  {
    question: "How does this DPDPA discovery tool work?",
    answer:
      "Pick your industry and business type, confirm the personal data you handle from a pre-filled list grouped into core, operational and often-missed data, then answer three questions about consent, vendor sharing and breach readiness. You get an instant risk snapshot with a score, the DPDPA duties it triggers, and a prioritised list of precautions — no email needed to see your result.",
  },
  {
    question: "How does DPDPA penalty risk actually arise?",
    answer:
      "Penalty risk does not come from holding data — every business holds data. It tends to arise where reasonable security safeguards are weak, where people were never given a clear notice or genuine choice, where there is no documented way to respond to a breach, or where children's data is processed without the right protections. A readiness check surfaces those gaps early, while they are cheap to fix.",
  },
];

export default function DiscoveryPage() {
  return (
    <div className="spd" id="top">
      {breadcrumbSchema([
        { name: "Home", url: "https://saralprivacy.com" },
        { name: "Personal Data Discovery", url: URL },
      ])}
      {faqPageSchema(DISCOVERY_FAQS, { url: URL })}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "DPDPA Personal Data Discovery Tool",
            url: URL,
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
            description:
              "Free tool that maps the personal data an Indian business holds across 276 business types and returns an instant DPDPA risk snapshot.",
            provider: { "@type": "Organization", name: "SaralPrivacy", url: "https://saralprivacy.com" },
          }),
        }}
      />

      {/* hero */}
      <section className="hero">
        <div className="wrap hero-in">
          <div className="hero-copy">
            <span className="eyebrow">DPDPA personal data discovery · for Indian businesses</span>
            <h1>Know exactly what personal data your business holds.</h1>
            <p className="hero-sub">
              Pick your industry and we’ll map the personal data you likely collect, the hidden risk areas most
              businesses miss, and the practical precautions to get DPDP-ready — in about three minutes.
            </p>
            <div className="hero-cta">
              <a href="#tool" className="btn-primary btn-lg">Start free check</a>
              <span className="hero-note">No email needed to see your result.</span>
            </div>
            <div className="hero-trust">
              <span>✓ 276 business types mapped</span>
              <span>✓ Instant risk snapshot</span>
              <span>✓ Calm, practical, India-first</span>
            </div>
          </div>

          <div className="hero-card" aria-hidden="true">
            <div className="hc-head">
              <span className="hc-cat">Healthcare &amp; wellness</span>
              <span className="hc-niche">Diagnostic lab</span>
            </div>
            <div className="hc-rows">
              <div className="hc-row"><span className="hc-tag t-core">Core</span><span>Patient identity &amp; contact</span><span className="hc-check on">✓</span></div>
              <div className="hc-row"><span className="hc-tag t-op">Operational</span><span>Test reports &amp; results</span><span className="hc-check on">✓</span></div>
              <div className="hc-row"><span className="hc-tag t-op">Operational</span><span>Payment &amp; insurance refs</span><span className="hc-check on">✓</span></div>
              <div className="hc-row dim"><span className="hc-tag t-hid">Often-missed</span><span>WhatsApp report sharing</span><span className="hc-check">＋</span></div>
              <div className="hc-row dim"><span className="hc-tag t-hid">Often-missed</span><span>Old report exports &amp; CSVs</span><span className="hc-check">＋</span></div>
            </div>
            <div className="hc-foot">
              <div className="hc-gauge"><div className="hc-gval">61</div></div>
              <div className="hc-band">
                <div className="hc-blabel">Risk level</div>
                <div className="hc-bpill">High</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* tool */}
      <section className="tool-section" id="tool">
        <div className="wrap">
          <div className="section-head">
            <span className="section-eyebrow">The discovery tool</span>
            <h2>Find your data. See your risk. Get your fixes.</h2>
            <p>No “what do you collect?” blank page. Choose your business and confirm what’s already mapped for you.</p>
          </div>
          <div className="tool-shell">
            <DiscoveryClient />
          </div>
        </div>
      </section>

      {/* learn / SEO */}
      <section className="learn" id="learn">
        <div className="wrap learn-in">
          <div className="section-head left">
            <span className="section-eyebrow">Understand the basics</span>
            <h2>What personal data means under the DPDP Act — in business terms</h2>
          </div>

          <div className="learn-grid">
            <article className="learn-main">
              <h3>What is personal data under the DPDP Act?</h3>
              <p>
                Under India’s Digital Personal Data Protection Act, <strong>personal data</strong> is any data about an
                identifiable individual. In plain business terms: if a record can be tied back to a real person — a
                customer, a patient, a candidate, a student, an employee or a vendor’s staff — it counts. That includes
                the obvious fields like names, phone numbers, email addresses and government IDs, and the less obvious
                ones like cookie IDs, WhatsApp chats, abandoned-cart trails and CCTV footage.
              </p>
              <p>
                Most businesses underestimate how much they hold. The data sitting in your CRM is only the start. The
                spreadsheet exports on a laptop, the candidate CVs in an inbox, the payment references in your gateway
                dashboard and the delivery addresses shared with a courier partner are all digital personal data too.
              </p>

              <h3>DPDPA personal data examples by category</h3>
              <p>This tool groups personal data the way a business actually experiences it, in three layers:</p>
              <ul className="learn-list">
                <li><strong>Core personal data</strong> — the identity and contact information you almost certainly hold: names, phone numbers, email addresses, account or membership IDs, and billing addresses.</li>
                <li><strong>Operational personal data</strong> — the data generated as you run the business: orders and invoices, payment and refund references, delivery details, support tickets, and marketing consent records.</li>
                <li><strong>Hidden or often-missed personal data</strong> — the data most owners forget they hold: website tracking and pixel IDs, behavioural and abandoned-cart data, WhatsApp and social-commerce chats, old exports, and CCTV or device identifiers.</li>
              </ul>
              <p>
                The hidden layer is where exposure usually concentrates, because it is collected automatically, shared
                with third parties, and rarely covered by a clear notice or retention rule.
              </p>

              <h3>A practical DPDPA compliance checker for India</h3>
              <p>
                A useful readiness check does three things: it shows you the personal data you handle, it highlights
                where safeguards are thin, and it gives you a short, prioritised list of what to do next. That is exactly
                the shape of the snapshot above — pick your industry, confirm your data, answer three questions about
                consent, vendor sharing and breach readiness, and read your result. It works for diagnostic labs, D2C
                brands, CA and consulting firms, recruitment agencies, schools, clinics, SaaS companies and more.
              </p>

              <h3>How DPDPA penalty risk actually arises</h3>
              <p>
                It helps to be calm and specific here. Penalty risk does not come from holding data — every business
                holds data. It tends to arise where <strong>reasonable security safeguards</strong> are weak, where
                people were never given a clear notice or a genuine choice, where there is no documented way to respond
                to a breach, or where children’s data is processed without the right protections. The aim of a readiness
                check is to surface those gaps early, while they are cheap to fix.
              </p>

              <h3>What “reasonable security safeguards” means in practice</h3>
              <p>
                For most small and mid-sized businesses, reasonable safeguards are operational, not exotic. They look
                like: limiting who can open the customer database; keeping payment credentials with the gateway instead
                of in a spreadsheet; writing down how long you keep inactive records and actually deleting them; having a
                named person and a simple plan for the day something goes wrong; and knowing exactly which vendors and
                platforms your data flows to. None of that requires a legal team — it requires a clear map and a few
                documented habits.
              </p>

              <h3>From snapshot to a full DPDPA readiness assessment</h3>
              <p>
                The discovery tool is a fast, free starting point. A full readiness assessment goes further: it scores
                your gaps across consent, notices, retention and vendor flow; produces an industry-specific verdict; and
                ranks the fixes by business risk so you know what to do first. The goal is not fear — it is operational
                control and a trust signal you can show customers and enterprise buyers.
              </p>
              <p className="learn-disclaimer">
                This tool provides a practical, educational snapshot of personal-data risk. It is not legal advice, and
                your result is a starting point for action rather than a determination of compliance.
              </p>
            </article>

            <aside className="learn-aside">
              <div className="aside-card">
                <div className="aside-h">The three control questions</div>
                <ol>
                  <li>Do you clearly inform people why their data is collected and how it’s used?</li>
                  <li>Do you share that data with vendors, platforms or partners?</li>
                  <li>Do you have documented access control, retention and breach response?</li>
                </ol>
              </div>
              <div className="aside-card alt">
                <div className="aside-h">Risk levels explained</div>
                <div className="aside-band"><span className="ab-pill" style={{ background: "#07B981" }}>Low</span> Controls look proportionate.</div>
                <div className="aside-band"><span className="ab-pill" style={{ background: "#E8AB42" }}>Moderate</span> A few quick gaps to close.</div>
                <div className="aside-band"><span className="ab-pill" style={{ background: "#E8704A" }}>High</span> Act soon on key data areas.</div>
                <div className="aside-band"><span className="ab-pill" style={{ background: "#C2413A" }}>Critical</span> Sensitive data, weak safeguards.</div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* CTA block */}
      <section className="cta-block" id="full-assessment">
        <div className="wrap cta-in">
          <div className="cta-text">
            <h2>Not sure if your business is DPDP-ready?</h2>
            <p>
              Take the full SaralPrivacy readiness assessment and receive an industry-specific report — your gaps
              scored, your fixes prioritised, and a trust signal you can show your customers.
            </p>
          </div>
          <a href="/assessment" className="btn-primary btn-lg">Take the full assessment</a>
        </div>
      </section>
    </div>
  );
}
