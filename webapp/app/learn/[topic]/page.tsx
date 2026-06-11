import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ClipboardList, FileSearch, CheckSquare } from "lucide-react";
import { notFound } from "next/navigation";
import { articleSchema, breadcrumbSchema, speakableSchema } from "@/lib/schema";
import { topicNav } from "@/lib/learnNav";
import { AssessmentCTA } from "@/components/cta/AssessmentCTA";
import { WhitepaperCTA } from "@/components/cta/WhitepaperCTA";
import { TemplatesCTA } from "@/components/cta/TemplatesCTA";
import { AnswerBlock } from "@/components/seo/AnswerBlock";
import { Byline } from "@/components/seo/Byline";
import { FRESHNESS, toISODate } from "@/lib/content-freshness";

const learnContent: Record<string, { title: string; description: string; content: string }> = {
  "what-is-dpdpa": {
    title: "What Is DPDPA? Practical India Guide",
    description: "The Digital Personal Data Protection Act, 2023 is India's framework for how businesses collect, use, store, share, and delete personal data. The DPDP Rules, 2025 were notified on 14 November 2025 and implementation is phased — meaning the compliance work is happening now, not later. This guide explains what the law covers, who it applies to, and what practical steps matter first.",
    content: `
## Why Was DPDPA Enacted?

India is the world's third-largest internet user base with over 900 million online users. As digital transactions, e-commerce, fintech, and digital services grew rapidly, it became clear that India needed a modern legal framework to protect citizens' personal data. The DPDPA was passed by Parliament in August 2023 after years of deliberation, multiple draft versions, and extensive consultations.

The Act replaces fragmented data protection provisions across existing laws (like the Information Technology Act, 2000) with a dedicated, comprehensive framework. Before DPDPA, Indian businesses had no single, enforceable set of rules governing how personal data must be handled. That gap has now been closed.

## What Does DPDPA Govern?

The DPDPA governs the processing of "digital personal data" — any personal data that is collected digitally or collected in non-digital form and later digitised. It applies to:

- **Data collected within India** — any personal data collected from individuals located in India
- **Data processed outside India** — if the processing is in connection with offering goods or services to individuals in India

Processing covers everything you do with data: collection, storage, use, sharing, disclosure, deletion, and transmission. If your business does any of these with personal data belonging to Indian residents, the Act applies to you.

## Key Principles

The DPDPA is built on seven core principles that define how personal data must be handled:

1. **Consent-based processing** — Personal data can generally only be processed with valid, informed consent from the individual
2. **Purpose limitation** — Data collected for one purpose cannot be silently repurposed for something else
3. **Data minimisation** — Only collect what you genuinely need for the stated purpose
4. **Accuracy** — Keep data accurate and up to date; correct it when individuals request it
5. **Storage limitation** — Do not retain data longer than necessary; delete it when the purpose is fulfilled
6. **Security** — Implement appropriate technical and organisational safeguards against breaches
7. **Accountability** — Businesses are responsible for compliance and must be able to demonstrate it

These principles are not aspirational. They are the basis on which the Data Protection Board will evaluate complaints and determine penalties.

## Regulatory Authority

The Act establishes the **Data Protection Board of India** as the regulatory authority. The Board is responsible for adjudicating complaints, conducting inquiries, and imposing financial penalties. It operates digitally — complaints can be filed online, and proceedings are conducted through a digital platform, making it accessible to individuals across the country.

## DPDPA Implementation Timeline

The DPDP Rules, 2025 were notified on 14 November 2025. Implementation is phased:

- **Immediate (on notification)** — Rules related to the Board's constitution, appointments, and procedures
- **12 months from notification** — Consent Manager registration requirements
- **18 months from notification** — Operational rules including notice requirements, consent flows, rights processing, security safeguards, and breach notification

The 18-month window means full operational compliance is expected by May 2027. However, waiting until the deadline is a risk — building compliance infrastructure takes time, and early regulatory attention typically focuses on visible gaps.

## How DPDPA Compares to GDPR

Many Indian businesses are familiar with GDPR (Europe's General Data Protection Regulation). DPDPA takes inspiration from it but is a simpler, India-specific framework:

| Aspect | DPDPA | GDPR |
|--------|-------|------|
| Primary legal basis | Consent (with defined exceptions) | Multiple bases including legitimate interest |
| Sensitive data category | Not separately defined as a class | Special category data with stricter rules |
| Right to portability | Not included | Included |
| DPO requirement | Only for Significant Data Fiduciaries | Mandatory for certain controllers |
| Maximum penalty | ₹250 crore per instance | €20 million or 4% of global turnover |

If your business already complies with GDPR, you have a strong foundation — but DPDPA has different mechanics and you should not assume the two are identical.

## What Happens If You Don't Comply?

Penalties under DPDPA are substantial. The Schedule to the Act sets out maximum penalties by breach category:

- **Failure to implement adequate security safeguards** — up to ₹250 crore
- **Failure to notify the Board of a personal data breach** — up to ₹200 crore
- **Breach of children's data obligations** — up to ₹200 crore
- **Breach of Significant Data Fiduciary obligations** — up to ₹150 crore
- **Breach of any other provision** — up to ₹50 crore

The Data Protection Board determines the actual penalty after considering factors including the nature of the breach, the harm caused, the business's history, and whether it took remedial action.

## Your First Three Steps

If you are new to DPDPA and do not know where to begin, start here:

1. **Map where personal data exists** — List every system, tool, folder, and process that holds personal data of customers, employees, or prospects. You cannot protect what you have not located.
2. **Audit your consent and notice mechanisms** — Check every form, app screen, and data collection point. Do they have clear, specific, unchecked consent boxes and plain-language notices? If not, that is your first fix.
3. **Designate an internal owner** — Someone must be responsible for data protection in your business. Without ownership, nothing else happens. This does not have to be a full-time role at first — but it must be a named person with authority to make decisions.

**The practical question is no longer whether to prepare — it is what to fix first and in what sequence.**
    `,
  },
  "applicability": {
    title: "Who Does DPDPA Apply To? A Practical Guide",
    description: "DPDPA applies to any entity that processes personal data of Indian residents digitally — including MSMEs, recruiters, CA firms, D2C brands, and B2B operators. If you collect a name, email, or phone number, you are covered. This guide explains scope, exemptions, and what it means for your business today.",
    content: `
The DPDPA applies broadly to any entity that processes personal data of Indian citizens. Understanding whether you are covered is the essential first step in your compliance journey.

## The Short Answer

If your business collects, stores, or processes any personal data of individuals located in India — including just a name, email address, or mobile number — the DPDPA likely applies to you. Size does not matter. Whether you are a 5-person startup or a 5,000-person enterprise, if you handle personal data of Indian residents, you are in scope.

## Data Fiduciaries vs Data Processors

The Act distinguishes between two key roles:

**Data Fiduciary** — Any person (including a company, firm, or individual) who alone or jointly determines the purpose and means of processing personal data. If you decide what data to collect, why to collect it, and how to use it, you are a Data Fiduciary.

**Data Processor** — Any person who processes personal data on behalf of a Data Fiduciary. For example, a cloud storage provider, payroll processor, or marketing automation tool.

Most businesses are Data Fiduciaries for at least some of their data processing activities. Some may also be Data Processors in their relationship with clients.

## Does Size Matter?

No. The DPDPA does not provide a blanket exemption for small businesses or startups. A 10-person business collecting customer contact details, running a newsletter, or storing employee records is processing personal data — and is covered by the Act.

The government may introduce graduated compliance requirements for smaller businesses through future notifications, but no such exemption has been notified. Until then, assume you are fully in scope.

## Who Is Covered — Business-Type Examples

| Business Type | Typical data collected | Covered? |
|--------------|----------------------|----------|
| D2C ecommerce brand | Customer names, addresses, phone numbers, purchase history | Yes |
| Recruitment agency | Candidate CVs, contact details, interview notes | Yes |
| CA firm | Client PAN, financial records, employee payroll data | Yes |
| Training institute | Student enrolment data, fees, contact details | Yes |
| SaaS company | User account data, behavioural data, support history | Yes |
| Freelancer (professional services) | Client contact information, project files | Yes |
| WhatsApp-only business | Saved contacts used for marketing | Yes |

## Are There Exemptions?

The Act provides four categories of exempt processing:

1. **Personal or domestic use** — Processing by an individual purely for personal purposes (e.g., a personal contact list) is exempt. Business use is not.
2. **Government instrumentalities** — Certain processing by the central and state governments for specific public functions is exempt.
3. **Law enforcement purposes** — Processing for prevention, detection, investigation, or prosecution of offences.
4. **Publicly available data** — Personal data that has been made publicly available by the Data Principal themselves (e.g., they published it on a public platform).

None of these exemptions apply to standard commercial business operations.

## Territorial Scope

The DPDPA applies to:

1. **Processing within India** — Any business operating in India that processes personal data, regardless of where the data is stored.
2. **Processing outside India** — If a foreign company processes data in connection with offering goods or services to individuals in India, the Act applies to them too.

This extraterritorial reach mirrors the approach taken by GDPR and means global companies serving Indian customers cannot simply ignore Indian data protection law because they are incorporated elsewhere.

## The Significant Data Fiduciary Tier

Above the standard compliance threshold, the government can designate certain businesses as **Significant Data Fiduciaries (SDFs)** based on:

- Volume or sensitivity of personal data processed
- Risk to rights and interests of Data Principals
- Potential impact on sovereignty, security, or public order
- Risk to electoral democracy

SDFs face additional obligations: appointing a Data Protection Officer, conducting Data Protection Impact Assessments, auditing their algorithms, and meeting enhanced accountability standards. Most SMBs will not be designated as SDFs initially, but the designation can expand over time.

## Practical Scope Test — 5 Questions

Ask these five questions about your business. If you answer yes to any of them, DPDPA applies to you:

1. Do you collect names, email addresses, phone numbers, or other contact details from customers, prospects, or employees?
2. Do you store or process any documents containing personal information (CVs, ID copies, financial records)?
3. Do you run email, SMS, or WhatsApp marketing to a list of individuals?
4. Do you use any SaaS tools (CRM, HRMS, payroll, ATS) that hold personal data?
5. Do you share personal data with third parties — vendors, partners, agencies, or clients?

If you answered yes to even one question, you are a Data Fiduciary under DPDPA.

## What Happens If You Ignore It?

Penalties for non-compliance can reach ₹250 crore per instance. The Data Protection Board has the power to conduct inquiries and impose financial penalties after due process. Individuals can file complaints directly with the Board. Compliance is not optional — and the phased implementation window is the right time to build your foundation before scrutiny begins.
    `,
  },
  "consent": {
    title: "Consent Under DPDPA: A Practical Guide",
    description: "DPDPA requires valid, specific, informed, and unambiguous consent before processing personal data. Pre-ticked checkboxes, bundled T&C consent, and implied agreement are all invalid. This guide explains what valid consent looks like, how to design it, how to record it, and what happens when individuals withdraw it.",
    content: `
Consent is the primary legal basis for processing personal data under the DPDPA. Getting consent right is one of the most urgent and practical compliance tasks for Indian businesses — and the area where most Indian websites and apps are currently non-compliant.

## What Makes Consent Valid?

Under Section 6 of the DPDPA, consent must be:

1. **Free** — Not coerced, manipulated, or made a condition of receiving a service that is unrelated to the data processing. You cannot force consent by blocking access to an unrelated service.
2. **Specific** — Tied to a clearly defined, stated purpose. Vague purposes like "improving your experience" are not specific enough.
3. **Informed** — Accompanied by a clear notice explaining what data is being collected, why, and how it will be used.
4. **Unconditional** — Not bundled with consent for other unrelated purposes. Each purpose needs its own consent signal.
5. **Unambiguous** — A clear, affirmative action — like ticking an unchecked box. Silence, inaction, or pre-ticked boxes do not qualify.

## What Does NOT Count as Valid Consent?

These are the most common consent failures in Indian businesses today:

- **Pre-ticked checkboxes** — The user must actively opt in, not opt out
- **"By using this website, you agree to our Privacy Policy"** — Browsing a website is not an affirmative consent action
- **Consent buried in Terms and Conditions** — T&C is a contract, not a consent mechanism
- **A single checkbox for multiple unrelated purposes** — You cannot bundle marketing consent with service delivery consent
- **Implied consent from a past transaction** — A previous purchase does not authorise future marketing
- **Consent obtained under social pressure or as a condition for an unrelated benefit**

## The Notice Requirement

Every consent request must be preceded or accompanied by a **notice** that specifies:
- What personal data is being collected (specific categories, not vague descriptions)
- The purpose for which it will be processed
- How the Data Principal can exercise their rights (access, correction, erasure)
- How to withdraw consent and what happens when they do

The notice must be in plain language — understandable by a person with ordinary literacy, not just legal professionals. Under the DPDP Rules, 2025, notices must be provided in English and can also be provided in other languages listed in the Eighth Schedule of the Constitution.

## One Purpose, One Consent

Each distinct processing purpose requires a separate, specific consent. This is one of the most operationally significant requirements of DPDPA:

- Consent to process a purchase order ≠ consent to send promotional emails
- Consent to deliver a service ≠ consent to share data with marketing partners
- Consent to contact about an enquiry ≠ consent to add to a newsletter list
- Consent for employee payroll processing ≠ consent for employee data use in HR analytics

On a practical level, this means a website contact form, checkout page, or HR onboarding form may need multiple separate checkboxes — one per distinct purpose.

## Deemed Consent — When Consent Is Not Required

The DPDPA recognises that some processing is legitimate without explicit consent. Section 7 lists "certain legitimate uses" (often called deemed consent) including:

- **State functions** — processing by the government for specified public purposes
- **Legal proceedings and compliance** — where processing is required by a court or law
- **Medical emergencies** — where the Data Principal cannot give consent and processing is necessary to protect their life
- **Employment contexts** — limited processing by employers for purposes directly related to employment
- **Publicly available data** — data voluntarily made public by the Data Principal themselves

For most commercial businesses, deemed consent covers only narrow, specific situations. Do not treat it as a general bypass for obtaining consent.

## Withdrawal of Consent

Individuals can withdraw consent at any time. This is a fundamental right under Section 6(3). When consent is withdrawn:

- You must stop processing the data for that specific purpose
- The withdrawal must be as easy as giving consent — if consent took one click, withdrawal must also take one click
- You must honour withdrawal requests promptly
- Withdrawal does not affect the lawfulness of processing done before the withdrawal

Practically, this means your systems need a working withdrawal mechanism — an unsubscribe link, an account settings page, or a contact channel — and that withdrawal must actually trigger a stop in the relevant processing, not just remove an email from a list.

## How to Record and Store Consent

Recording consent is not just good practice under DPDPA — it is your evidence of compliance if a complaint is filed. For every consent collected, record:

1. **Who gave consent** — identifier for the Data Principal
2. **What they consented to** — the specific purpose(s)
3. **When consent was given** — timestamp
4. **How it was given** — the mechanism (checkbox, form, voice recording)
5. **What notice was shown** — version or text of the privacy notice presented at the time

If a Data Principal later disputes that they gave consent, this record is your defence. Store consent logs securely and make them queryable — you may need to produce them in response to a rights request or a Board inquiry.

## Consent in Different Business Contexts

**Website forms (lead generation, newsletter, contact):** Use separate, unchecked checkboxes. Place a brief notice above the form. Include a link to your full Privacy Notice.

**E-commerce checkout:** Consent to process the order is implicit in completing the purchase. Consent to send marketing emails is separate and must be explicitly obtained.

**HR and recruitment:** Employee data for payroll, attendance, and contract management may fall under deemed consent for employment purposes. But using employee data for analytics or sharing with third parties requires explicit consent.

**WhatsApp and SMS marketing:** These are direct marketing channels. Consent must be specific to communications via these channels and cannot be derived from an earlier, unrelated interaction.

## Practical Consent Checklist

Before your next form or data collection point goes live, check:

- [ ] Every consent checkbox starts unchecked
- [ ] Each checkbox covers exactly one purpose
- [ ] A plain-language notice is visible near the consent point
- [ ] There is a clear link to the full Privacy Notice
- [ ] A withdrawal mechanism exists and is tested
- [ ] Consent records are being logged with timestamp and notice version
- [ ] No consent is buried in Terms and Conditions
    `,
  },
  "rights": {
    title: "Rights of Individuals (Data Principals)",
    description: "DPDPA grants individuals four enforceable rights: access, correction and erasure, grievance redressal, and nomination. Businesses must respond within prescribed timelines or face Board complaints and penalties. This guide explains each right, what it means operationally, and how to build a request-handling process.",
    content: `
Chapter IV of the DPDPA grants individuals significant rights over their personal data. These are not aspirational principles — they are enforceable legal rights. A person who believes their rights have been ignored can file a complaint directly with the Data Protection Board. Businesses that have no process to receive and respond to these requests are exposed from day one.

## The Four Core Rights

### 1. Right to Access Information (Section 11)

A Data Principal can request information about:
- Whether their personal data is being processed by you
- What categories of personal data are being processed
- For what purposes the data is being processed
- Who the data is being shared with (third parties, processors, affiliates)

**Business implication:** You need to be able to respond to these requests with accurate, specific information. This requires knowing where all personal data is stored, what it is used for, and who can access it. If you cannot answer these questions about your own data, you have a data mapping problem that must be fixed before rights requests begin arriving.

### 2. Right to Correction and Erasure (Section 12)

A Data Principal can request:
- **Correction** of inaccurate or misleading personal data
- **Completion** of incomplete data
- **Updating** of data that has become outdated
- **Erasure** of data that is no longer necessary for the purpose it was collected, or where consent has been withdrawn

**Business implication:** You must be able to locate all instances of an individual's personal data across your systems — including CRM, email history, backups, and third-party tools — and correct or delete it as requested. This sounds straightforward but is operationally complex if data is fragmented across multiple tools and stored informally.

### 3. Right to Grievance Redressal (Section 13)

If a Data Principal believes their rights have been violated, their data has been handled improperly, or a request was not addressed, they can:
- Raise a complaint with the Data Fiduciary's designated grievance contact
- If unresolved or unsatisfied with the response, escalate to the Data Protection Board

**Business implication:** You must designate a contact point for data-related grievances — an email address, a web form, or a phone number. This contact must be published prominently in your Privacy Notice and ideally in your website footer and any data collection points. Failure to provide a grievance channel or to respond is itself a compliance gap that can result in a Board complaint.

### 4. Right of Nomination (Section 14)

Individuals can nominate another person to exercise their data rights on their behalf in the event of death or incapacity. The nominated person can then make access, correction, erasure, or grievance requests as if they were the Data Principal.

**Business implication:** Your rights request process must include a mechanism for receiving and validating nominations — for example, through a signed form or notarised document. This is a less common scenario but must be accounted for in your process design.

## Why These Rights Matter for Businesses

Rights obligations are not just about individual data subjects. They have systemic implications:

- **They require data mapping** — you cannot respond to an access request if you do not know where the data is
- **They require clean records** — corrections require knowing which records are authoritative
- **They require deletion workflows** — erasure requests must propagate to backups, archives, and third-party processors
- **They require vendor co-operation** — if data is held by a processor (e.g., your CRM vendor), they must support your ability to fulfil requests

A business that has never mapped its data flows will struggle to respond to even a basic access request.

## How Must Businesses Respond?

1. **Verify identity** — Confirm the requester is the actual person whose data is being requested (to prevent unauthorised disclosures). A simple verification step — such as confirming an email address or requesting a government ID for sensitive requests — is sufficient.
2. **Locate the data** — Identify all instances across your systems, including third-party tools, archived databases, and cloud storage.
3. **Respond within the prescribed period** — Exact timelines will be specified in Rules. Treat it as a business SLA — acknowledge requests within 24–48 hours and aim to resolve within 30 days.
4. **Document the response** — Keep records of every request received, the action taken, and the date of response. This is your compliance evidence.
5. **Handle refusals carefully** — If you have a lawful reason to retain data (active contract, legal obligation, regulatory requirement), you can decline the erasure request but must communicate the specific reason and inform the individual of their right to escalate.

## Common Scenarios

**Scenario 1 — Ex-employee requests deletion of all records**
You can retain records required by law (e.g., PF, tax records) but should delete records no longer needed (e.g., interview notes, informal communications). Communicate what you retained and why.

**Scenario 2 — Prospect asks what data you hold**
You must provide a clear summary of their data across all your systems. If you cannot do this, your data mapping is insufficient.

**Scenario 3 — Customer asks to correct their address in your CRM**
Update the record, propagate to any systems that have a copy (e.g., marketing tools, delivery integrations), and confirm the correction to the requester.

**Scenario 4 — Individual withdraws marketing consent and requests erasure of all marketing data**
Remove from all marketing lists, delete marketing profile data not required for other purposes, and confirm the action taken.

## Building a Rights Request Process

Every business should have a basic process in place before rights requests arrive. Minimum requirements:

1. **Designate a contact** — Create a dedicated email (e.g., privacy@yourdomain.com) or web form for rights requests
2. **Publish it prominently** — In your Privacy Notice, website footer, and any data collection pages
3. **Set up an internal workflow** — Define who receives requests, who processes them, and what the escalation path is
4. **Define response timelines** — Set internal SLAs aligned to the prescribed period once notified
5. **Keep an audit log** — Record every request, the action taken, and the date of completion

The cost of building this process is low. The cost of ignoring it — a Board complaint and potential penalty — is not.
    `,
  },
  "data-breach": {
    title: "DPDPA Data Breach Rules: Reporting Basics",
    description: "DPDPA requires businesses to notify the Data Protection Board and affected individuals when personal data is breached — without delay. This applies to all Data Fiduciaries regardless of size. This guide covers what counts as a breach, what you must report, the notification timeline, and the first practical steps to take.",
    content: `
A personal data breach is any incident where personal data is accessed, disclosed, altered, lost, or destroyed without authorisation — whether by an external attacker, an insider, a third-party vendor, or an accidental human error. Under DPDPA, businesses have mandatory reporting obligations when a breach occurs. There is no de minimis threshold — even a single record is in scope if it involves personal data.

## What Is a Personal Data Breach?

Section 2(t) of the DPDPA defines a personal data breach as "any unauthorised processing of personal data or accidental disclosure, acquisition, sharing, use, alteration, destruction or loss of access to personal data, that compromises the confidentiality, integrity or availability of personal data."

In plain terms, a breach includes:

- **Unauthorised access** — hacker or attacker gaining access to a database, server, or file containing personal data
- **Accidental disclosure** — an email with personal data sent to the wrong recipient, a file shared publicly by mistake, a screen shared in a video call showing personal records
- **Ransomware attack** — encrypting or exfiltrating customer, employee, or vendor records
- **Lost or stolen devices** — laptop, phone, or USB drive containing personal data
- **Insider misuse** — an employee accessing or exporting personal data without authorisation
- **Vendor-side breach** — a third-party processor suffers a breach that affects personal data you gave them
- **Accidental deletion** — permanent loss of personal data without a backup

## The Breach vs Security Incident Distinction

Not every security incident is a personal data breach. A DDoS attack that takes your website offline is a security incident — but if no personal data was accessed or disclosed, it is not a personal data breach under DPDPA. The key test is: was personal data compromised in terms of confidentiality, integrity, or availability?

Apply this three-part test to every incident:

1. **Confidentiality** — Was personal data accessed or disclosed to someone who should not have it?
2. **Integrity** — Was personal data altered or corrupted without authorisation?
3. **Availability** — Was personal data permanently lost or made inaccessible?

If any of these is true, it is a breach and notification obligations are triggered.

## Notification Obligations

Section 8(6) of the DPDPA requires every Data Fiduciary to notify the Data Protection Board of a personal data breach "in such manner and within such period as may be prescribed." The DPDP Rules, 2025 set out the requirements:

### Board Notification
- Must be made to the Data Protection Board **as soon as possible** — the Rules set mandatory timelines
- Must include: nature of the breach, categories and approximate number of individuals affected, likely consequences, measures taken or planned to address the breach
- The initial report may be submitted before all details are known, with a follow-up report once investigation is complete

### Individual Notification
Under Rule 7 of the DPDP Rules, 2025, Data Fiduciaries must also notify affected Data Principals of the breach. The notification to individuals must:
- Describe the nature of the personal data breach
- Explain the possible consequences of the breach
- Describe the measures being taken to address the breach
- Include contact details for the Data Fiduciary's designated contact for further information

### Timing
The DPDP Rules require breach notifications to the Board to be made in two parts:
- **Part 1** — an initial intimation as soon as the breach is detected
- **Part 2** — a detailed report within a prescribed period following investigation

Do not wait until an investigation is complete to file the initial notification. The obligation to notify the Board begins from the moment the breach is detected, not from the moment it is fully understood.

## Building Basic Breach Response Capability

You do not need a large security team to be prepared for a breach. A basic incident response plan has five stages:

1. **Detect** — How will you know a breach has occurred? Access logs, intrusion detection, vendor alerts, or employee reports?
2. **Contain** — How do you stop the breach from spreading? Isolate the affected system, revoke compromised credentials, suspend the affected service if necessary.
3. **Assess** — What data was affected? How many individuals? What categories of personal data? What is the risk to those individuals?
4. **Notify** — Notify the Board and affected individuals as required. Who in your organisation makes this decision and initiates the notification?
5. **Remediate** — Fix the vulnerability or gap that allowed the breach. Review controls. Update procedures.

Every business, regardless of size, should have at least one named person who is responsible for steps 2, 3, and 4. Without a designated decision-maker, breach response becomes chaotic.

## Practical Steps for Indian SMEs

You do not need sophisticated infrastructure to meet the basic obligations. Start here:

1. **Know where personal data is stored** — You cannot detect or contain a breach in data you did not know you had. Maintain a simple list of every system, tool, and file location that holds personal data.
2. **Ensure access logging exists** — Basic access logs on your CRM, HRMS, email system, and cloud storage will help you detect anomalies and scope a breach quickly.
3. **Designate an internal incident contact** — One person who is notified first when a suspected breach is reported internally.
4. **Identify who makes the notification decision** — Who in your organisation is authorised to notify the Board and affected individuals?
5. **Prepare notification templates** — Draft a template Board notification and a template individual notification now, before you need them. In a breach, you will be under time pressure and emotional stress — templates reduce errors.
6. **Review vendor contracts** — Ensure every SaaS and cloud vendor you use has a contractual obligation to notify you of breaches affecting your data, within a timeframe that lets you meet your own Board notification deadlines.

## Penalties for Breach Notification Failure

The Penalty Schedule in the DPDPA sets out maximum penalties for breach-related failures:

| Failure | Maximum Penalty |
|---------|----------------|
| Failure to implement adequate security safeguards (Section 8(5)) | ₹250 crore |
| Failure to notify the Board of a personal data breach (Section 8(6)) | ₹200 crore |

These penalties are per instance of non-compliance, not per data record. The actual penalty determined by the Board will depend on factors including the severity of harm, the number of individuals affected, whether the breach was intentional or negligent, and whether the business took remedial action.
    `,
  },
  "key-terms": {
    title: "DPDPA Key Terms Explained in Simple Language",
    description: "DPDPA vocabulary explained plainly — Data Fiduciary, Data Principal, Consent, and more.",
    content: `
Understanding DPDPA starts with knowing its vocabulary. These terms appear throughout the Act and in compliance guidance. Here is what each term means in practice.

## Data Principal

A Data Principal is the individual whose personal data is being collected or processed. Under DPDPA, Data Principals have rights — to access, correct, and erase their data, and to raise grievances. In plain terms: your customers, candidates, students, and employees are Data Principals when you collect their data.

## Data Fiduciary

A Data Fiduciary is any person (individual, company, or organisation) who alone or jointly determines the purpose and means of processing personal data. If you decide what data to collect, why to collect it, and how to use it, you are a Data Fiduciary.

**Key obligation:** Data Fiduciaries carry the primary compliance burden under DPDPA — consent, notice, security, rights response, and breach notification.

## Data Processor

A Data Processor processes personal data on behalf of a Data Fiduciary — but does not determine the purpose or means of processing independently. Examples include cloud storage providers, payroll processors, ATS vendors, and email marketing platforms.

**Key obligation:** Data Processors must act only on the instructions of the Data Fiduciary and must sign a Data Processing Agreement (DPA). They have limited but real obligations under DPDPA.

## Significant Data Fiduciary (SDF)

A business can be designated as a Significant Data Fiduciary by the Central Government based on volume of data processed, sensitivity of data, risk to individuals, or risk to national security. SDFs face additional obligations including appointing a Data Protection Officer, conducting Data Protection Impact Assessments, and algorithmic transparency requirements.

## Personal Data

Any data about an individual that can directly or indirectly identify them. This includes obvious data (name, PAN, Aadhaar, mobile number, email) and less obvious data (IP address, location data, device identifiers, behavioural data tied to an individual).

## Sensitive Personal Data

The Act and its rules may specify categories of data that attract heightened protection. This typically includes financial data, health data, biometric data, and data of children.

## Consent

Under DPDPA, consent must be free, specific, informed, unconditional, and unambiguous. It must be sought through a clear affirmative action — not pre-ticked boxes or silence.

## Notice

A notice is the disclosure provided to a Data Principal before or at the time of collecting their data. It must specify what data is being collected, for what purpose, and how they can exercise their rights.

## Data Processing Agreement (DPA)

A contractual agreement between a Data Fiduciary and a Data Processor setting out the terms on which personal data may be processed, including security standards, permitted sub-processors, and breach notification obligations.

## Data Protection Board of India (DPBI)

The regulatory authority established under DPDPA. It adjudicates complaints, conducts inquiries, and can impose penalties. The Board is being constituted under the phased implementation of the DPDP Rules, 2025, which were notified on 14 November 2025.

## Data Protection Impact Assessment (DPIA)

A formal assessment of the risks to individuals arising from a particular data processing activity. Mandatory for Significant Data Fiduciaries; best practice for all businesses handling large volumes of sensitive data.

## Legitimate Uses (Deemed Consent)

Section 7 of DPDPA allows processing of personal data without explicit consent for certain legitimate purposes — including employment-related processing, medical emergencies, public health, and state functions. These are narrow exceptions, not a general opt-out from consent requirements.
    `,
  },
  "duties": {
    title: "Duties of Businesses (Data Fiduciaries)",
    description: "What Data Fiduciaries must do under DPDPA — security, minimisation, processors, and more.",
    content: `
Being a Data Fiduciary under DPDPA comes with specific, enforceable duties. These go beyond obtaining consent — they cover how you store data, who you share it with, and how you respond when things go wrong.

## 1. Implement Reasonable Security Safeguards

Section 8(5) of DPDPA requires every Data Fiduciary to implement appropriate technical and organisational measures to protect personal data from breaches.

**What this means in practice:**
- Encrypt sensitive personal data at rest and in transit
- Restrict access to personal data on a need-to-know basis
- Use strong authentication for systems containing personal data
- Conduct regular security reviews of your data storage practices
- Maintain access logs for systems holding sensitive data

**Penalty for failure:** Up to ₹250 crore per instance.

## 2. Ensure Data Accuracy

You must take reasonable steps to ensure the personal data you process is accurate and up to date, particularly where decisions affecting individuals are made based on that data.

**Practical steps:**
- Build mechanisms for customers to update their contact details
- Periodically review and update employee records
- Remove or flag data that is clearly stale or inaccurate

## 3. Data Minimisation — Collect Only What You Need

Under the Act's principles, you should collect only the personal data that is necessary for the stated purpose. Collecting data "just in case" or for undefined future uses is not compliant.

**Practical steps:**
- Review every form you use and remove unnecessary fields
- Question whether each data element you collect has a defined, documented purpose
- Avoid retaining complete datasets when only partial data is needed

## 4. Purpose Limitation

Personal data collected for one purpose must not be used for another purpose without fresh consent or a legitimate legal basis.

**Common violations:**
- Using email addresses collected for order confirmations to send marketing
- Using CV data collected for one role to pitch the candidate for other roles without consent
- Using student contact information collected for admissions to sell other courses

## 5. Storage Limitation — Do Not Retain Data Longer Than Necessary

Under Section 8(7), Data Fiduciaries must delete personal data once the purpose for which it was collected is fulfilled, unless retention is required by law.

**Practical steps:**
- Define retention periods for each category of data
- Build or schedule deletion processes
- Communicate retention periods to Data Principals in your Privacy Notice

## 6. Engage Only Compliant Data Processors

If you use third-party services (cloud storage, ATS, email platforms, analytics tools) that process personal data on your behalf, you must enter into Data Processing Agreements with those vendors.

**Practical steps:**
- List all tools and services that process personal data
- Check whether they have signed DPAs available
- Review their security practices and certifications

## 7. Respond to Data Principal Rights Requests

Businesses must be able to receive, verify, and respond to requests from individuals to access, correct, or erase their data. This requires:
- A designated point of contact
- A process for verifying the identity of the requester
- SLAs for responding to requests
- Documentation of outcomes

## 8. Notify the Data Protection Board of Breaches

In the event of a personal data breach, businesses must notify the Data Protection Board and affected individuals as prescribed. See the Data Breach topic for full details.

## 9. Maintain Accountability Records

While DPDPA does not prescribe a specific record-keeping format, good practice — and likely regulatory expectation — includes maintaining:
- A record of processing activities
- Records of consent given (timestamp, version of consent notice)
- Records of rights requests and responses
- Documentation of data processor agreements
    `,
  },
  "notice": {
    title: "DPDPA Notice Requirements: What to Include",
    description: "What a DPDPA-compliant notice must include and how to implement it for your forms.",
    content: `
Every time you collect personal data, you must provide a notice to the individual. Getting the notice right is one of the most practical and immediately implementable compliance tasks.

## What Is a Notice Under DPDPA?

Under Section 5 of DPDPA, before or at the time of collecting personal data, a Data Fiduciary must provide the Data Principal with a notice containing:

1. **What personal data is being collected** — specifically, not vaguely
2. **The purpose for which the data is being processed** — each distinct purpose should be listed
3. **How the Data Principal can exercise their rights** — where to go, how to raise a request
4. **How to withdraw consent** — should be as easy as giving it

## Where Does the Notice Need to Appear?

The notice must accompany or precede every consent request. This means it is needed at:
- Website enquiry and contact forms
- Checkout and account creation flows
- Job application forms
- Admission and enrollment forms
- WhatsApp and SMS opt-in flows
- Newsletter subscription forms

## What Does a Good Notice Look Like?

A DPDPA-compliant notice should be:
- **Specific** — "Your name and email will be used to send you course updates" not "used to improve your experience"
- **Plain language** — avoid legalese; write for a 12-year-old
- **Visible** — placed immediately next to the consent action, not buried in T&Cs
- **Itemised by purpose** — if you are collecting data for multiple purposes, list each purpose separately

## What a Notice Must NOT Do

- Use vague phrases like "for business purposes" or "to improve services"
- Bundle multiple purposes into one statement
- Be hidden in a 30-page Terms and Conditions document
- Use language that implies the individual has no choice

## Sample Notice Language (Illustrative)

**For a job application form:**
"We will use the information you provide in this form (name, contact details, work history, qualifications) to evaluate your application for the role of [X]. If your application is successful, we will retain your data for employment purposes. If unsuccessful, we will retain your CV for 12 months in case other suitable roles arise — you can opt out of this below. You may request access, correction, or deletion of your data by emailing privacy@yourcompany.com."

## Notice vs Privacy Notice (Privacy Policy)

A **consent notice** is a short, purpose-specific disclosure at the point of data collection. It is different from your full **Privacy Notice** (privacy policy), which is a comprehensive document covering all your data processing activities.

Both are required. The consent notice is the just-in-time disclosure; the Privacy Notice is the full reference document. Your consent notice should link to your full Privacy Notice.

## Practical Implementation Steps

1. List every touchpoint where your business collects personal data
2. For each touchpoint, draft a short, specific notice covering the four required elements
3. Place the notice immediately above or next to the consent checkbox
4. Ensure the notice links to your full Privacy Notice
5. When you change how you use the data, update the notice and re-seek consent if necessary
6. Record the version of the notice shown at the time of consent

## Notice for Existing Data

If you collected personal data before DPDPA enforcement and did not provide a compliant notice, you will need to remediate. Options include:
- Running a re-consent campaign with a fresh, compliant notice
- Sending a retroactive notice to existing contacts explaining how their data is used
- Deleting data collected under non-compliant conditions if re-consent cannot be obtained
    `,
  },
  "childrens-data": {
    title: "Children's Data Under DPDPA: Key Rules",
    description: "Special obligations for processing data of individuals under 18 years old.",
    content: `
DPDPA has specific provisions for the personal data of children — defined as individuals under 18 years of age. If your business collects data from or about minors, these provisions apply to you.

## Who Is a "Child" Under DPDPA?

The Act defines a child as a person under the age of 18. This is a broad definition — it includes teenagers using your e-commerce platform, students under 18 attending your training institute, and minors whose data is processed by a parent's employer.

## The Core Obligation: Verifiable Parental Consent

Section 9 of DPDPA requires that before processing the personal data of a child, a Data Fiduciary must:

1. **Obtain verifiable consent from a parent or guardian**
2. **Process only data that is in the best interest of the child**
3. **Not undertake tracking or behavioural monitoring** of children
4. **Not target advertising at children** based on their personal data

## Who Does This Affect?

- **Training institutes and coaching centres** with students under 18
- **EdTech platforms** offering courses or content to minors
- **D2C brands** whose customers may include teenagers
- **Healthcare platforms** handling minor patient data
- **Any employer** whose HR processes collect data of employees' minor dependants

## What Is "Verifiable Parental Consent"?

The Act requires that parental consent be verifiable — meaning you must take reasonable steps to confirm that the person giving consent is actually the parent or guardian. The DPDP Rules, 2025 specify that age verification must be implemented before processing a child's data, and businesses should apply reasonable technical and procedural checks to verify age and parental identity.

**Interim best practice:**
- Ask for date of birth at registration; if under 18, require parental consent
- Use a separate consent form addressed to the parent/guardian
- Collect the parent's contact details separately from the minor's
- Consider age-verification mechanisms where feasible

## No Behavioural Targeting of Children

If you use analytics tools, remarketing pixels, or personalisation engines that process personal data, you must ensure these are not applied to children. This means:
- Excluding under-18 users from remarketing audiences
- Not building behavioural profiles of children for advertising
- Reviewing whether your tracking tools can distinguish minor users

## Penalties for Non-Compliance

Failure to observe special provisions for children's data can attract penalties of up to ₹200 crore under the DPDPA penalty framework.

## Practical Steps for Businesses

**Training institutes and EdTech:**
1. Add a date of birth field to admissions/enrollment forms
2. For students under 18, use a separate parental consent form
3. Ensure your admissions marketing database distinguishes minors from adults
4. Review whether placement data and testimonials involve any minors

**D2C and E-commerce:**
1. Include date of birth or age gate at account creation
2. Configure your remarketing tools to exclude identified minors
3. Review your WhatsApp and SMS marketing lists for known minor users

**General:**
1. Update your Privacy Notice to include a section on children's data
2. Train customer-facing staff to identify and escalate when they are dealing with a minor
3. Document your parental consent process and record parent/guardian details

## Sensitive Use Cases

**School management systems** processing data of hundreds of minors face elevated scrutiny. If you build or use such systems, verify that your Data Processing Agreements with schools reflect the DPDPA obligations around children's data.

**Child health data** is a particularly sensitive category — it combines children's data protections with the sensitive nature of health information. Handle with extreme care and document your legal basis for processing.
    `,
  },
  "retention": {
    title: "Data Retention and Deletion Under DPDPA",
    description: "DPDPA requires businesses to delete personal data once the purpose for which it was collected is no longer being served. Holding data indefinitely is not compliant. This guide explains the storage limitation principle, how to define retention periods for common data categories, and how to build a deletion process that works.",
    content: `
Data retention is one of the most practically urgent compliance areas for Indian businesses. Many organisations hold personal data indefinitely because they have never defined a deletion process. DPDPA requires that you stop.

## The Storage Limitation Principle

Section 8(7) of DPDPA states that a Data Fiduciary must delete personal data as soon as the purpose for which it was collected is no longer being served, unless retention is required or permitted by law.

This creates a clear obligation: **if you no longer have a lawful reason to hold personal data, you must delete it.**

## What Counts as a "Lawful Reason to Retain"?

Legitimate reasons to retain personal data beyond the immediate purpose include:
- **Active contractual relationship** — you are still providing a service to the individual
- **Legal or regulatory obligation** — for example, the Income Tax Act requires certain financial records to be retained for specified periods
- **Ongoing dispute or litigation** — where the data is relevant to a pending legal matter
- **Explicit consent for future contact** — where the individual has given specific consent to be retained in your database for future opportunities

## What Does NOT Justify Indefinite Retention?

- "We might need it someday"
- "It's easier to keep everything"
- "Our system doesn't have a deletion function"
- "We paid for the ATS and we want value from the data"

None of these are lawful bases for holding personal data under DPDPA.

## Defining Retention Periods by Data Category

The first step is to define retention periods for each category of personal data you hold. Here are starting-point guidelines:

**Recruitment agencies:**
- Active candidates (in process): Retain during active engagement
- Rejected candidates: 12 months from rejection, then delete unless consent given to retain
- Placed candidates: Duration of placement + 12 months, then archive/delete

**CA firms:**
- ITR-related documents: 7 years from filing date (aligned with Income Tax Act)
- Payroll records: 5 years from employee exit
- General client correspondence: 3 years from end of engagement

**Training institutes:**
- Enrolled students: Duration of course + 3 years
- Rejected applicants: 6 months from rejection decision
- Placement records: 5 years, with student consent for marketing use

**D2C brands:**
- Active customers: Retain while relationship is active
- Inactive customers (no purchase in 18+ months): Send re-engagement notice; delete if no response within 60 days
- Marketing unsubscribers: Retain suppression list only (to ensure you do not re-add them)

## Communicating Retention Periods

Your Privacy Notice must state how long you retain personal data (or the criteria used to determine retention periods). This is not optional — individuals have a right to know how long their data will be held.

## Building a Deletion Process

1. **Map your data locations** — where is personal data stored? ATS, CRM, email, cloud drives, spreadsheets, backups?
2. **Set deletion triggers** — what event triggers deletion? End of contract? Inactivity? Withdrawal of consent?
3. **Automate where possible** — configure your CRM and ATS to flag records for review after the defined period
4. **Don't forget backups** — deletion policies must apply to backup copies, not just live systems
5. **Document destruction** — keep a record of when and what was deleted

## What About Legal Holds?

If data is subject to a legal hold (litigation, regulatory investigation, statutory obligation), it may be retained beyond your standard retention period. Document the legal hold and its scope. Remove the hold and delete when the legal matter is resolved.

## Practical First Step

Conduct a data mapping exercise: list every category of personal data you hold, where it is stored, how old the oldest records are, and whether you have a defined deletion process. This single exercise will reveal your largest retention risks and give you a clear prioritised action list.
    `,
  },
  "cross-border": {
    title: "Cross-Border Data Transfers Under DPDPA",
    description: "Transferring personal data outside India? Understand the permitted destinations framework.",
    content: `
As Indian businesses increasingly use international cloud services, overseas vendors, and global enterprise platforms, cross-border data transfer has become a practical compliance question under DPDPA.

## What Is a Cross-Border Data Transfer?

A cross-border transfer occurs when personal data of Indian residents is transferred to, or accessed from, a location outside India. This includes:
- Storing data on international cloud servers (AWS us-east-1, Google Cloud Europe, etc.)
- Sharing customer data with an overseas parent company or affiliate
- Using a SaaS platform that stores data in servers outside India
- Sending candidate CVs to an overseas client
- Accessing Indian employee records from an overseas office

## The DPDPA Framework for Cross-Border Transfers

Section 16 of DPDPA allows the Central Government to restrict the transfer of personal data to certain countries or territories. The mechanism works through a **permitted destinations** approach: the government will notify a list of countries to which transfers are permitted (or conversely, identify countries to which transfer is restricted).

**Important: As of early 2026, the permitted destinations list has not yet been formally notified.** This means the cross-border transfer restrictions are not yet in force. However, businesses should prepare for them.

## What to Do Now (Before the List Is Notified)

1. **Map your international data flows** — identify every vendor, tool, or process that transfers personal data outside India
2. **Review vendor agreements** — check where data is stored and whether vendors offer Indian data residency options
3. **Check SaaS terms** — many major SaaS platforms specify their data residency regions in their terms of service or data processing addenda
4. **Build awareness in procurement** — when onboarding new tools, make cross-border data storage a standard evaluation question

## Categories of International Transfer Risk

**High risk:**
- Sharing Indian customer data with overseas marketing agencies
- Using overseas analytics platforms that receive event-level personal data
- Cross-border HR data sharing with parent companies without documented legal basis

**Medium risk:**
- Using US-hosted SaaS tools for CRM, email, or project management
- Backing up databases to international cloud regions

**Lower risk (but still worth mapping):**
- International access by your own employees (e.g., logging in to your CRM from overseas while travelling)

## Preparing Your Privacy Notice

Your Privacy Notice should disclose whether you transfer personal data outside India, which countries or regions, and for what purposes. Even before the permitted destinations list is notified, being transparent in your Privacy Notice is good practice and likely to be expected under final Rules.

## Data Localisation Considerations

Some categories of data may be subject to stronger localisation requirements under Indian law even beyond DPDPA — for example, payment data under RBI regulations, or health data. Review the full regulatory landscape for your sector.

## Questions to Ask Your Vendors

1. Where is our data stored? In which country/region?
2. Do you offer data residency options for India?
3. Have you reviewed your obligations under DPDPA for India-origin data?
4. What security standards apply to the India data you process?
5. What is your breach notification process for India-origin data incidents?

## Practical Next Steps

1. Create a data flow map showing which tools receive personal data and where they store it
2. Flag any tools storing data in jurisdictions with weaker privacy protections
3. Begin evaluating India-region hosting options for critical personal data stores
4. Update your Privacy Notice to disclose international data flows
5. Monitor official notifications for the permitted destinations list when published
    `,
  },
  "myths": {
    title: "DPDPA Myths vs Facts for Indian Businesses",
    description: "Common misconceptions about DPDPA — debunked with the correct understanding.",
    content: `
Misinformation about DPDPA is widespread — particularly among SMEs and non-legal professionals. Here are the most common myths, corrected.

## Myth 1: "DPDPA only applies to big companies"

**Fact:** The DPDPA does not include a small business exemption in its current text. It applies to any entity processing personal data of Indian residents digitally, regardless of company size. A 3-person recruitment agency storing candidate CVs in Google Drive is a Data Fiduciary with compliance obligations.

The government *may* notify exemptions for specific categories of businesses through Rules — but until such exemptions are formally notified, all businesses collecting personal data should plan for compliance.

## Myth 2: "We already have a Privacy Policy, so we are compliant"

**Fact:** Having a Privacy Policy (Privacy Notice) is one element of DPDPA compliance — but it is far from sufficient. Compliance requires: valid consent flows, a notice at the point of data collection, security safeguards, a data rights request process, a breach response plan, data retention and deletion processes, and Data Processing Agreements with vendors. A Privacy Policy alone does not cover any of these.

## Myth 3: "We can wait for enforcement before doing anything"

**Fact:** The DPDP Rules, 2025 have been notified, with phased commencement underway. The compliance work required takes significant time — months, not days. Businesses that act during the transition window will be far better positioned than those that wait for enforcement pressure. The cost of retrofitting compliance under regulatory scrutiny is substantially higher than building it proactively now.

## Myth 4: "Our customers agreed to our Terms and Conditions, so we have consent"

**Fact:** Bundled consent in Terms and Conditions is explicitly non-compliant under DPDPA. Consent must be specific, separate, and tied to a defined purpose. A generic "by using this site you agree to our T&Cs" does not constitute valid consent for any specific data processing activity. Pre-checked boxes are similarly invalid.

## Myth 5: "We don't collect sensitive data, so the Act doesn't really apply to us"

**Fact:** DPDPA applies to all personal data — not just sensitive categories. Even collecting a person's name, email address, and mobile number for a newsletter subscription makes you a Data Fiduciary with compliance obligations. Sensitivity affects the level of scrutiny required, but it does not determine whether the Act applies.

## Myth 6: "We use a third-party CRM/ATS, so the vendor is responsible for compliance"

**Fact:** If you decide what data to collect, why to collect it, and how to use it — you are the Data Fiduciary. Your CRM or ATS vendor is a Data Processor acting on your instructions. The primary compliance obligations remain with you. You must also ensure your vendor has signed a Data Processing Agreement and meets appropriate security standards.

## Myth 7: "DPDPA only applies to customer data"

**Fact:** DPDPA applies to all personal data of individuals — including employee data, candidate data, contractor data, and partner contact data. HR departments processing employee PAN, Aadhaar, bank accounts, performance records, and health data are processing personal data under DPDPA.

## Myth 8: "We are a B2B company and don't deal with consumers, so DPDPA doesn't apply"

**Fact:** DPDPA applies whenever you process personal data of individuals — regardless of whether your business model is B2B or B2C. If you collect data of your clients' employees (for payroll, HR, or professional services), you are processing personal data. If you hold contact data of individuals at your client organisations, that is personal data.

## Myth 9: "Compliance with GDPR means we are automatically DPDPA-compliant"

**Fact:** DPDPA and GDPR share principles but differ in structure, definitions, and specifics. GDPR compliance provides a useful foundation, but Indian DPDPA compliance requires separate, India-specific assessment. Key differences include: the consent framework, the rights regime, the cross-border transfer mechanism, and the enforcement structure.

## Myth 10: "Penalties only apply if there is a data breach"

**Fact:** Penalties under DPDPA can be imposed for various violations — not only breaches. Non-compliant consent flows, failure to respond to rights requests, failure to provide notice, and failure to sign Data Processing Agreements with processors are all potential compliance failures. The Data Protection Board can investigate and penalise any violation of the Act.
    `,
  },
};

/** Slugs of related topics shown as chips at the bottom of each page */
const RELATED_TOPICS: Record<string, string[]> = {
  "what-is-dpdpa":  ["applicability", "key-terms", "consent"],
  "applicability":  ["what-is-dpdpa", "key-terms", "duties"],
  "key-terms":      ["what-is-dpdpa", "applicability", "consent"],
  "consent":        ["notice", "rights", "duties"],
  "notice":         ["consent", "duties", "rights"],
  "rights":         ["duties", "data-breach", "notice"],
  "duties":         ["consent", "rights", "data-breach"],
  "data-breach":    ["duties", "retention", "rights"],
  "childrens-data": ["consent", "duties", "applicability"],
  "retention":      ["duties", "data-breach", "cross-border"],
  "cross-border":   ["duties", "retention", "applicability"],
  "myths":          ["what-is-dpdpa", "applicability", "consent"],
};

interface Props {
  params: Promise<{ topic: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topic } = await params;
  const content = learnContent[topic];
  if (!content) return {};
  const canonicalUrl = `https://saralprivacy.com/learn/${topic}`;
  return {
    title: topic === 'what-is-dpdpa'
      ? "What Is DPDPA? Practical India Guide"
      : content.title,
    description: content.description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: 'article',
      url: canonicalUrl,
      title: content.title,
      description: content.description,
    },
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
        <h2 key={i} className="text-xl font-bold text-navy-700 mt-8 mb-3">
          {line.replace("## ", "")}
        </h2>
      );
    } else if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="text-lg font-bold text-navy-700 mt-6 mb-2">
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
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" />
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
            idx % 2 === 1 ? <strong key={idx} className="text-navy-700">{part}</strong> : part
          )}
        </p>
      );
    }

    i++;
  }

  return elements;
}


export default async function LearnTopicPage({ params }: Props) {
  const { topic } = await params;
  const content = learnContent[topic];

  if (!content) {
    // Unknown topic slug → render a proper 404 (handled by ./not-found.tsx).
    // Previously returned a 200 OK with "Content Coming Soon" which left phantom
    // URLs indexable by Google with thin content — bad for topical authority.
    notFound();
  }

  const currentIndex = topicNav.findIndex((t) => t.slug === topic);
  const prev = currentIndex > 0 ? topicNav[currentIndex - 1] : null;
  const next = currentIndex < topicNav.length - 1 ? topicNav[currentIndex + 1] : null;

  return (
    <>
      {articleSchema(
        content.title,
        content.description,
        `https://saralprivacy.com/learn/${topic}`,
        '2025-03-01',
        toISODate(FRESHNESS.learn)
      )}
      {speakableSchema(['.answer-block'], `https://saralprivacy.com/learn/${topic}`, content.title)}
      {breadcrumbSchema([
        { name: 'Home', url: 'https://saralprivacy.com' },
        { name: 'DPDPA Guide', url: 'https://saralprivacy.com/learn' },
        { name: content.title, url: `https://saralprivacy.com/learn/${topic}` },
      ])}
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
                    href={t.href ?? `/learn/${t.slug}`}
                    className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                      t.slug === topic
                        ? "bg-green-50 text-green-600 font-semibold"
                        : "text-slate-600 hover:text-navy-700 hover:bg-slate-50"
                    }`}
                  >
                    {t.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Compliance Tools widget */}
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mt-4">
              <h3 className="text-xs font-semibold text-teal-700 uppercase tracking-wider mb-3">
                Compliance Tools
              </h3>
              <nav className="space-y-1">
                <Link
                  href="/compliance-checklist"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-teal-100 hover:text-teal-700 transition-colors"
                >
                  <ClipboardList size={14} className="text-teal-500 shrink-0" />
                  Compliance Checklist
                </Link>
                <Link
                  href="/assessment"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-teal-100 hover:text-teal-700 transition-colors"
                >
                  <FileSearch size={14} className="text-teal-500 shrink-0" />
                  DPDPA Assessment
                </Link>
                <Link
                  href="/white-paper"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-teal-100 hover:text-teal-700 transition-colors"
                >
                  <CheckSquare size={14} className="text-teal-500 shrink-0" />
                  White Paper
                </Link>
              </nav>
            </div>

            {/* Templates CTA — sidebar */}
            <div className="mt-4">
              <TemplatesCTA variant="sidebar" />
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            <Link
              href="/learn"
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-green-600 mb-5 transition-colors"
            >
              <ArrowLeft size={14} />
              DPDPA Guide
            </Link>

            <div className="bg-white rounded-xl border border-slate-200 p-7 mb-5">
              <h1 className="text-2xl sm:text-3xl font-bold text-navy-700 mb-2">{content.title}</h1>
              <Byline lastReviewed={FRESHNESS.learn} className="mb-3" />
              {topic === 'what-is-dpdpa' ? (
                <AnswerBlock
                  answer="The Digital Personal Data Protection Act, 2023 governs how digital personal data is collected, used, stored, shared, and deleted in India. With the DPDP Rules, 2025 now notified and phased implementation underway, businesses should focus on fixing notices, consent, rights handling, retention, and vendor controls. This guide explains what the law covers, who it applies to, and what practical steps matter first."
                  className="mt-3 mb-2"
                />
              ) : (
                <AnswerBlock answer={content.description} className="mt-3 mb-2" />
              )}
              <div className="mt-5 pt-5 border-t border-slate-100">
                {renderContent(content.content)}
              </div>
              <div className="mt-10 pt-6 border-t border-slate-200 text-xs text-slate-400 space-y-1">
                <p><strong>Legal baseline:</strong> DPDP Rules, 2025 notified on 14 November 2025, with phased commencement.</p>
                <p>This page is for educational purposes and does not constitute legal advice.</p>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-slate-100 rounded-lg p-4 text-xs text-slate-500 mb-5">
              <strong>Educational content only.</strong> This guide is for educational purposes and
              does not constitute legal advice. Please consult a qualified data protection lawyer
              for formal legal opinions specific to your business situation.
            </div>

            {/* Contextual CTAs — Assessment + Whitepaper after article content */}
            <div className="space-y-4 mb-5">
              <AssessmentCTA variant="full" />
              <WhitepaperCTA variant="full" />
            </div>

            {/* Related topics strip */}
            {RELATED_TOPICS[topic] && (
              <div className="bg-white rounded-xl border border-slate-200 p-5 mb-5">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Related topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {RELATED_TOPICS[topic].map((relSlug) => {
                    const relTopic = topicNav.find((t) => t.slug === relSlug);
                    if (!relTopic) return null;
                    return (
                      <Link
                        key={relSlug}
                        href={relTopic.href ?? `/learn/${relSlug}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-green-50 hover:text-green-700 transition-colors"
                      >
                        {relTopic.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Prev/Next nav */}
            <div className="flex items-center justify-between gap-4">
              {prev ? (
                <Link
                  href={`/learn/${prev.slug}`}
                  className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-green-600 transition-colors"
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
                  className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-green-600 transition-colors"
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
    </>
  );
}
