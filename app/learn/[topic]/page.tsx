import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { articleSchema, breadcrumbSchema } from "@/lib/schema";

const learnContent: Record<string, { title: string; description: string; content: string }> = {
  "what-is-dpdpa": {
    title: "What Is DPDPA? Practical India Guide",
    description: "The Digital Personal Data Protection Act, 2023 is India's framework for how businesses collect, use, store, share, and delete personal data. The DPDP Rules, 2025 were notified on 14 November 2025 and implementation is phased — meaning the compliance work is happening now, not later. This guide explains what the law covers, who it applies to, and what practical steps matter first.",
    content: `
The Digital Personal Data Protection Act, 2023 governs how digital personal data is collected, used, stored, shared, and deleted. The DPDP Rules, 2025 have been notified, with phased commencement, so businesses should treat this as implementation time, not theory time. This guide explains what the law covers, who it applies to, and what practical controls matter first.

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

The Act establishes the **Data Protection Board of India (DPBI)** as the regulatory authority. The Board is responsible for adjudicating complaints, conducting inquiries, and imposing penalties. The Data Protection Board of India is established under the Act.

## When Does It Come Into Effect?

The DPDP Rules, 2025 were notified on 14 November 2025. India is implementing the regime in phases — certain rules took effect immediately on notification, while others take effect 12 and 18 months later. Businesses should treat this period as operational rollout time, not wait-and-watch time.

**The practical question is no longer whether to prepare — it is what to fix first and in what sequence.** Focus on notices, consent flows, rights-handling processes, retention policies, and vendor agreements.
    `,
  },
  "applicability": {
    title: "Who Does DPDPA Apply To?",
    description: "DPDPA applies to any entity that processes personal data of Indian residents digitally — including MSMEs, recruiters, CA firms, D2C brands, and B2B operators. If you collect a name, email, or phone number, you are covered. This guide explains scope, exemptions, and what it means for your business today.",
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
    description: "DPDPA requires businesses to notify the Data Protection Board and affected individuals when personal data is breached — without delay. This applies to all Data Fiduciaries regardless of size. This guide covers what counts as a breach, what you must report, the notification timeline, and the first practical steps to take.",
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
  "key-terms": {
    title: "Key Terms in Simple Language",
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
    title: "Notice Requirements Under DPDPA",
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
    title: "Children's Data Under DPDPA",
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
    title: "DPDPA Myth vs Fact",
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
    <>
      {articleSchema(
        content.title,
        content.description,
        `https://saralprivacy.com/learn/${topic}`,
        '2025-03-01',
        '2026-03-15'
      )}
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
              {topic === 'what-is-dpdpa' && (
                <div className="bg-slate-50 border-l-4 border-saffron-400 rounded-r-xl px-5 py-4 mt-4 mb-2">
                  <p className="text-slate-700 text-sm leading-relaxed">The Digital Personal Data Protection Act, 2023 governs how digital personal data is collected, used, stored, shared, and deleted. The DPDP Rules, 2025 have been notified, with phased commencement, so businesses should treat this as implementation time, not theory time. This guide explains what the law covers, who it applies to, and what practical controls matter first.</p>
                </div>
              )}
              <div className="mt-5 pt-5 border-t border-slate-100">
                {renderContent(content.content)}
              </div>
              <div className="mt-10 pt-6 border-t border-slate-200 text-xs text-slate-400 space-y-1">
                <p><strong>Last reviewed:</strong> March 2026</p>
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
    </>
  );
}
