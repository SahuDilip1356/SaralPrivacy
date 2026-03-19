import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";

const learnContent: Record<string, { title: string; description: string; content: string }> = {
  "what-is-dpdpa": {
    title: "What is DPDPA?",
    description: "An overview of India's Digital Personal Data Protection Act, 2023.",
    content: `
The Digital Personal Data Protection Act, 2023 (DPDPA) is India's comprehensive legislation governing how personal data of Indian citizens is collected, stored, processed, and used by businesses and organisations.

## Why Was DPDPA Enacted?

India is the world's third-largest internet user base with over 900 million online users. As digital transactions, e-commerce, fintech, and digital services grew rapidly, it became clear that India needed a modern legal framework to protect citizens' personal data. The DPDPA was passed by Parliament in August 2023 after years of deliberation, multiple draft versions, and extensive consultations.

The Act replaces fragmented data protection provisions across existing laws (like the Information Technology Act, 2000) with a dedicated, comprehensive framework.

## What Does DPDPA Govern?

The DPDPA governs the processing of "digital personal data" — any personal data that is collected digitally or collected in non-digital form and later digitised. It applies to:

- **Data collected within India** — any personal data collected from individuals located in India
- **Data processed outside India** — if the processing is in connection with offering goods or services to individuals in India

## Key Principles

The DPDPA is built on several core principles:

1. **Consent-based processing** — Personal data can generally only be processed with valid, informed consent
2. **Purpose limitation** — Data can only be used for the purpose it was collected for
3. **Data minimisation** — Only collect what you genuinely need
4. **Accuracy** — Keep data accurate and up to date
5. **Storage limitation** — Do not retain data longer than necessary
6. **Security** — Implement appropriate technical and organisational safeguards
7. **Accountability** — Businesses are responsible for compliance and must demonstrate it

## Regulatory Authority

The Act establishes the **Data Protection Board of India (DPBI)** as the regulatory authority. The Board is responsible for adjudicating complaints, conducting inquiries, and imposing penalties. The Board is yet to be formally constituted as rules under the Act are being finalised.

## When Does It Come Into Effect?

The DPDPA was enacted in August 2023 but comes into force only once the Rules under the Act are notified by the Central Government. Draft Rules were released for public consultation and are expected to be finalised in 2025.

**Businesses should not wait for the Rules to be notified to begin preparing.** The framework is clear enough to begin compliance work now, and early preparation significantly reduces the cost and disruption of compliance.
    `,
  },
  "applicability": {
    title: "Who Does DPDPA Apply To?",
    description: "Understanding whether and how DPDPA applies to your business.",
    content: `
The DPDPA applies broadly to any entity that processes personal data of Indian citizens. Understanding whether you are covered is the essential first step in your compliance journey.

## The Short Answer

If your business collects, stores, or processes any personal data of individuals located in India — including just a name, email address, or mobile number — the DPDPA likely applies to you.

## Data Fiduciaries vs Data Processors

The Act distinguishes between two key roles:

**Data Fiduciary** — Any person (including a company, firm, or individual) who alone or jointly determines the purpose and means of processing personal data. If you decide what data to collect, why to collect it, and how to use it, you are a Data Fiduciary.

**Data Processor** — Any person who processes personal data on behalf of a Data Fiduciary. For example, a cloud storage provider, payroll processor, or marketing automation tool.

Most businesses are Data Fiduciaries for at least some of their data processing activities. Some may also be Data Processors in their relationship with clients.

## Are There Exemptions?

The Act provides some exemptions:
- Processing of personal data for **personal or domestic purposes** (not a business)
- Processing by government instrumentalities for specific purposes
- Processing for **prevention, detection, investigation, or prosecution** of offences
- Personal data made **publicly available** by the Data Principal themselves

The government may also notify additional exemptions for specific categories of businesses through Rules. Until any such exemption is formally notified, all businesses collecting personal data should plan for compliance.

## Territorial Scope

The DPDPA applies to:
1. **Processing within India** — regardless of where the data controller is located
2. **Processing outside India** — if done in connection with offering goods or services to individuals in India

This means even foreign companies offering services to Indian users are covered.

## What Happens If You Ignore It?

Penalties for non-compliance can reach ₹250 crore per instance. The Data Protection Board has the power to conduct inquiries and impose penalties after due process. Compliance is not optional.
    `,
  },
  "consent": {
    title: "Consent Under DPDPA",
    description: "What valid consent looks like and how to collect it correctly.",
    content: `
Consent is the primary legal basis for processing personal data under the DPDPA. Getting consent right is one of the most urgent and practical compliance tasks for Indian businesses.

## What Makes Consent Valid?

Under Section 6 of the DPDPA, consent must be:

1. **Free** — Not coerced, manipulated, or made a condition of service where the service is unrelated to the data processing
2. **Specific** — Tied to a defined, stated purpose
3. **Informed** — Accompanied by a clear notice explaining what data is being collected and why
4. **Unconditional** — Not bundled with consent for other unrelated purposes
5. **Unambiguous** — A clear affirmative action (like checking a box), not silence or inaction

## What Does NOT Count as Valid Consent?

- Pre-ticked checkboxes
- "By using this website, you agree to our Privacy Policy"
- Buried consent in Terms and Conditions
- A single checkbox for multiple unrelated purposes
- Implied consent from a past transaction

## The Notice Requirement

Every consent must be preceded or accompanied by a **notice** that specifies:
- What personal data is being collected
- The purpose for which it will be processed
- How the Data Principal can exercise their rights
- How to withdraw consent

## One Purpose, One Consent

Each distinct processing purpose requires separate, specific consent. For example:
- Consent to process an order ≠ consent to send marketing emails
- Consent to deliver a service ≠ consent to share data with partners
- Consent to contact about an enquiry ≠ consent to call about products

## Withdrawal of Consent

Individuals can withdraw consent at any time. When consent is withdrawn:
- You must stop processing the data for that purpose
- Withdrawal should be as easy as giving consent
- You must honour withdrawal requests promptly (within the prescribed period)

## Practical Design Principles

1. Use separate, unchecked checkboxes for each consent purpose
2. Place consent notices immediately next to each checkbox
3. Write in plain language — not legalese
4. Link to your full Privacy Notice
5. Record and timestamp each consent given
6. Store the version of consent text shown to the user
7. Test your withdrawal mechanism regularly

## When Is Consent Not Required?

The DPDPA allows processing without consent for specific purposes including:
- State functions and legal obligations
- Employer-employee data in certain circumstances (limited)
- Medical emergencies and certain public interest purposes

However, for most commercial data processing, consent is the primary and safest legal basis.
    `,
  },
  "rights": {
    title: "Rights of Individuals (Data Principals)",
    description: "What rights individuals have and how your business must respond.",
    content: `
Chapter IV of the DPDPA grants individuals significant rights over their personal data. These are enforceable rights — businesses that ignore them face complaints to the Data Protection Board and potential penalties.

## The Four Core Rights

### 1. Right to Access Information

A Data Principal can request information about:
- Whether their personal data is being processed by you
- What categories of personal data are being processed
- For what purposes the data is being processed
- Who the data is being shared with

**Business implication:** You need to be able to respond to these requests with accurate information. This requires knowing where all personal data is stored and for what purpose.

### 2. Right to Correction and Erasure

A Data Principal can request:
- **Correction** of inaccurate or incomplete personal data
- **Completion** of incomplete data (where appropriate)
- **Erasure** of data that is no longer necessary for the purpose it was collected, or where consent has been withdrawn

**Business implication:** You must be able to locate all instances of an individual's personal data across your systems (including backups and third-party tools) and correct or delete it as requested.

### 3. Right to Grievance Redressal

If a Data Principal believes their rights have been violated or your handling of their data was improper, they can raise a complaint with the designated Data Protection Officer or contact at your organisation.

If unresolved within the prescribed period, they can escalate to the Data Protection Board.

**Business implication:** You must designate a contact point (email, web form, or phone) for data-related grievances, publish it prominently, and have a process to respond within the prescribed timeframe.

### 4. Right of Nomination

Individuals can nominate another person to exercise these rights on their behalf in the event of death or incapacity.

## How Must Businesses Respond?

1. **Verify identity** — Confirm the requester is the person whose data is being requested
2. **Locate the data** — Identify all instances across your systems
3. **Respond within prescribed period** — Timelines will be specified in Rules
4. **Document the response** — Keep records of requests received and actions taken
5. **Handle refusals carefully** — If you cannot fulfil a request (e.g., legal hold), document and communicate the specific reason

## What If You Receive a Request and Cannot Comply?

If you have a lawful reason to retain data (active contract, legal obligation, regulatory requirement), you can decline the deletion request but must:
- Communicate the specific reason for retaining the data
- Inform the individual of their right to escalate to the Data Protection Board

## Building a Rights Request Process

1. Create a dedicated email address or web form for rights requests
2. Publish it in your Privacy Notice and website footer
3. Set up an internal workflow to receive, verify, and process requests
4. Define SLAs for response
5. Keep an audit log of all requests and outcomes
    `,
  },
  "data-breach": {
    title: "Data Breach Basics",
    description: "What to do when personal data is compromised.",
    content: `
A data breach is any incident where personal data is accessed, disclosed, altered, or destroyed without authorisation. Under DPDPA, businesses have mandatory obligations when a breach occurs.

## What Is a Personal Data Breach?

A breach includes:
- Unauthorised access to a database or file containing personal data
- Accidental email containing personal data sent to the wrong recipient
- Ransomware attack encrypting or exfiltrating customer or employee records
- Loss of a device containing personal data
- Insider misuse of data access privileges

## Notification Obligations

Section 8(6) of the DPDPA requires Data Fiduciaries to notify the Data Protection Board of a personal data breach "in such manner and within such period as may be prescribed."

Expected requirements based on draft rules:
1. **Initial notification** within 72 hours of becoming aware of the breach
2. **Detailed report** following investigation
3. **Notification to affected individuals** where the breach poses significant risk

## Building Basic Breach Response Capability

You do not need a large security team to be prepared. A basic incident response plan covers:

1. **Detect** — How will you know a breach has occurred?
2. **Contain** — How do you stop the breach from spreading?
3. **Assess** — What data was affected, how many individuals, what is the risk?
4. **Notify** — Who do you notify and when?
5. **Remediate** — How do you prevent recurrence?

## Practical Steps for Indian SMEs

1. Know where all your personal data is stored
2. Ensure access logs exist for systems containing personal data
3. Have a contact for reporting security incidents internally
4. Know who at your organisation would make the notification decision
5. Have draft notification templates ready
6. Ensure your cloud and SaaS vendors have breach notification SLAs in their contracts

## Penalties for Breach Notification Failure

Up to ₹200 crore for failing to notify the Data Protection Board of a breach. This is separate from penalties for inadequate security safeguards, which can reach ₹250 crore.
    `,
  },
};

interface Props {
  params: Promise<{ topic: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topic } = await params;
  const content = learnContent[topic];
  if (!content) return {};
  return {
    title: content.title + " | DPDPA Guide",
    description: content.description,
  };
}

export async function generateStaticParams() {
  return Object.keys(learnContent).map((topic) => ({ topic }));
}

function renderContent(content: string) {
  const lines = content.trim().split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="text-xl font-bold text-brand-700 mt-8 mb-3">
          {line.replace("## ", "")}
        </h2>
      );
    } else if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="text-lg font-bold text-brand-700 mt-6 mb-2">
          {line.replace("### ", "")}
        </h3>
      );
    } else if (line.startsWith("- ") || line.startsWith("1. ")) {
      const items: string[] = [];
      while (i < lines.length && (lines[i].startsWith("- ") || /^\d+\. /.test(lines[i]))) {
        items.push(lines[i].replace(/^[-\d.] /, "").replace(/^\d+\. /, ""));
        i++;
      }
      elements.push(
        <ul key={i} className="space-y-2 my-3 pl-4">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-slate-600 text-sm leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-saffron-500 mt-2 shrink-0" />
              <span dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            </li>
          ))}
        </ul>
      );
      continue;
    } else if (line.trim()) {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      elements.push(
        <p key={i} className="text-slate-600 text-sm leading-relaxed mb-3">
          {parts.map((part, idx) =>
            idx % 2 === 1 ? <strong key={idx} className="text-brand-700">{part}</strong> : part
          )}
        </p>
      );
    }

    i++;
  }

  return elements;
}

const topicNav = [
  { slug: "what-is-dpdpa", label: "What is DPDPA?" },
  { slug: "applicability", label: "Who It Applies To" },
  { slug: "key-terms", label: "Key Terms" },
  { slug: "consent", label: "Consent" },
  { slug: "notice", label: "Notice Requirements" },
  { slug: "rights", label: "Rights" },
  { slug: "duties", label: "Business Duties" },
  { slug: "childrens-data", label: "Children's Data" },
  { slug: "data-breach", label: "Data Breach" },
  { slug: "retention", label: "Retention" },
  { slug: "cross-border", label: "Cross-Border" },
  { slug: "myths", label: "Myth vs Fact" },
];

export default async function LearnTopicPage({ params }: Props) {
  const { topic } = await params;
  const content = learnContent[topic];

  if (!content) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-brand-700 mb-3">Content Coming Soon</h1>
          <p className="text-slate-600 mb-5">This topic is being prepared by our editorial team.</p>
          <Link href="/learn" className="text-saffron-600 font-semibold hover:underline">
            ← Back to DPDPA Guide
          </Link>
        </div>
      </div>
    );
  }

  const currentIndex = topicNav.findIndex((t) => t.slug === topic);
  const prev = currentIndex > 0 ? topicNav[currentIndex - 1] : null;
  const next = currentIndex < topicNav.length - 1 ? topicNav[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar nav */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-xl border border-slate-200 p-4 sticky top-24">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                DPDPA Guide
              </h3>
              <nav className="space-y-1">
                {topicNav.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/learn/${t.slug}`}
                    className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                      t.slug === topic
                        ? "bg-saffron-50 text-saffron-600 font-semibold"
                        : "text-slate-600 hover:text-brand-700 hover:bg-slate-50"
                    }`}
                  >
                    {t.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            <Link
              href="/learn"
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-saffron-600 mb-5 transition-colors"
            >
              <ArrowLeft size={14} />
              DPDPA Guide
            </Link>

            <div className="bg-white rounded-xl border border-slate-200 p-7 mb-5">
              <h1 className="text-2xl sm:text-3xl font-bold text-brand-700 mb-2">{content.title}</h1>
              <p className="text-slate-500 text-base">{content.description}</p>
              <div className="mt-5 pt-5 border-t border-slate-100">
                {renderContent(content.content)}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-slate-100 rounded-lg p-4 text-xs text-slate-500 mb-5">
              <strong>Educational content only.</strong> This guide is for educational purposes and
              does not constitute legal advice. Please consult a qualified data protection lawyer
              for formal legal opinions specific to your business situation.
            </div>

            {/* Prev/Next nav */}
            <div className="flex items-center justify-between gap-4">
              {prev ? (
                <Link
                  href={`/learn/${prev.slug}`}
                  className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-saffron-600 transition-colors"
                >
                  <ArrowLeft size={16} />
                  {prev.label}
                </Link>
              ) : (
                <div />
              )}
              {next ? (
                <Link
                  href={`/learn/${next.slug}`}
                  className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-saffron-600 transition-colors"
                >
                  {next.label}
                  <ArrowRight size={16} />
                </Link>
              ) : (
                <div />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
