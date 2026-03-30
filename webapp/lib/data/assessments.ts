import { AssessmentQuestion, AssessmentResult, AssessmentOption } from "../types";

// ─── Recruitment Agency Assessment ───────────────────────────────────────────

export const recruitmentQuestions: AssessmentQuestion[] = [
  {
    id: "r1",
    text: "Do you collect CVs or resumes from candidates digitally?",
    helpText: "This includes email submissions, portal uploads, ATS systems, or WhatsApp shares.",
    category: "data-collection",
    weight: 3,
    options: [
      { id: "r1a", text: "Yes, primarily through an ATS or recruitment portal", score: 2 },
      { id: "r1b", text: "Yes, mainly via email or WhatsApp", score: 3 },
      { id: "r1c", text: "Yes, both digital and physical", score: 2 },
      { id: "r1d", text: "No, we only work with referrals", score: 0 },
    ],
  },
  {
    id: "r2",
    text: "Do you share candidate profiles or CVs with client companies?",
    helpText: "This includes forwarding resumes, sharing via portal, or presenting candidate details in meetings.",
    category: "data-sharing",
    weight: 3,
    options: [
      { id: "r2a", text: "Yes, we share with explicit written candidate consent", score: 0 },
      { id: "r2b", text: "Yes, but we assume candidates expect this when applying", score: 3 },
      { id: "r2c", text: "Sometimes, with verbal consent only", score: 2 },
      { id: "r2d", text: "No, we keep candidate data confidential", score: 0 },
    ],
  },
  {
    id: "r3",
    text: "Do you use any third-party ATS, HR tech, or recruitment tools?",
    helpText: "Examples: Naukri RMS, Keka, Greenhouse, Lever, Zoho Recruit, custom portals.",
    category: "third-party",
    weight: 2,
    options: [
      { id: "r3a", text: "Yes, we use a cloud-based ATS", score: 2 },
      { id: "r3b", text: "Yes, but it's on our own servers", score: 1 },
      { id: "r3c", text: "No, we manage data in spreadsheets or email", score: 3 },
      { id: "r3d", text: "No, we use only paper-based processes", score: 1 },
    ],
  },
  {
    id: "r4",
    text: "Do you collect government identity documents like Aadhaar, PAN, or passport copies?",
    helpText: "This applies to background checks, offer letter processing, or onboarding documents.",
    category: "sensitive-data",
    weight: 3,
    options: [
      { id: "r4a", text: "Yes, routinely for all candidates", score: 3 },
      { id: "r4b", text: "Yes, only for selected/placed candidates", score: 2 },
      { id: "r4c", text: "Sometimes, depending on client requirements", score: 2 },
      { id: "r4d", text: "No, we do not collect identity documents", score: 0 },
    ],
  },
  {
    id: "r5",
    text: "How long do you retain data of candidates who were not placed or rejected?",
    helpText: "This includes CVs, contact details, and interview notes in your systems.",
    category: "retention",
    weight: 2,
    options: [
      { id: "r5a", text: "We delete rejected candidate data within 6 months", score: 0 },
      { id: "r5b", text: "We keep it for 1-2 years for future opportunities", score: 2 },
      { id: "r5c", text: "We never delete candidate data once collected", score: 3 },
      { id: "r5d", text: "We don't have a defined retention policy", score: 3 },
    ],
  },
  {
    id: "r6",
    text: "Can candidates currently request deletion of their data from your systems?",
    helpText: "Do you have a process (email, form, or portal) for candidates to ask you to remove their information?",
    category: "rights",
    weight: 2,
    options: [
      { id: "r6a", text: "Yes, we have a formal process and honour it within 30 days", score: 0 },
      { id: "r6b", text: "Candidates can email us, but the process is informal", score: 2 },
      { id: "r6c", text: "We don't have a deletion process but would handle it if asked", score: 3 },
      { id: "r6d", text: "We have not considered this", score: 3 },
    ],
  },
  {
    id: "r7",
    text: "Do you conduct background checks or reference verifications on candidates?",
    helpText: "This includes employment verification, criminal record checks, and academic verifications.",
    category: "sensitive-data",
    weight: 2,
    options: [
      { id: "r7a", text: "Yes, through a third-party background verification company", score: 2 },
      { id: "r7b", text: "Yes, we do it internally with candidate permission", score: 1 },
      { id: "r7c", text: "Sometimes, for senior roles only", score: 1 },
      { id: "r7d", text: "No, we do not conduct background checks", score: 0 },
    ],
  },
  {
    id: "r8",
    text: "Do you have cross-border data flows — for example, placing candidates internationally or using overseas clients or tools?",
    helpText: "Data flows across borders include sharing candidate profiles with overseas clients or using tools hosted outside India.",
    category: "cross-border",
    weight: 2,
    options: [
      { id: "r8a", text: "Yes, we regularly place candidates internationally", score: 3 },
      { id: "r8b", text: "Occasionally, for specific international clients", score: 2 },
      { id: "r8c", text: "We use overseas SaaS tools but don't share with foreign clients", score: 2 },
      { id: "r8d", text: "No, we operate exclusively within India", score: 0 },
    ],
  },
];

// ─── CA Firm Assessment ───────────────────────────────────────────────────────

export const caFirmQuestions: AssessmentQuestion[] = [
  {
    id: "c1",
    text: "Do you process payroll data for client companies?",
    helpText: "This includes salary slips, PF details, TDS information, and bank account details of employees.",
    category: "data-collection",
    weight: 3,
    options: [
      { id: "c1a", text: "Yes, payroll is a core service we offer", score: 3 },
      { id: "c1b", text: "Yes, for some clients", score: 2 },
      { id: "c1c", text: "No, we only do statutory filings", score: 1 },
      { id: "c1d", text: "No, we are a pure advisory firm", score: 0 },
    ],
  },
  {
    id: "c2",
    text: "Do you store physical or digital copies of Aadhaar or PAN cards?",
    helpText: "This applies to your own employees, client employees, or directors whose documents you hold.",
    category: "sensitive-data",
    weight: 3,
    options: [
      { id: "c2a", text: "Yes, we scan and store them in our systems", score: 3 },
      { id: "c2b", text: "Yes, but only for the period required for filing", score: 1 },
      { id: "c2c", text: "We hold physical copies only", score: 2 },
      { id: "c2d", text: "We collect them but return or destroy after use", score: 0 },
    ],
  },
  {
    id: "c3",
    text: "Do you use cloud storage or shared drives for client files?",
    helpText: "Examples: Google Drive, Dropbox, SharePoint, Tally on cloud, or email with attachments.",
    category: "third-party",
    weight: 2,
    options: [
      { id: "c3a", text: "Yes, everything is on cloud with proper access controls", score: 1 },
      { id: "c3b", text: "Yes, but access is shared broadly within the firm", score: 3 },
      { id: "c3c", text: "We use local servers/hard drives only", score: 1 },
      { id: "c3d", text: "We still primarily use paper-based files", score: 2 },
    ],
  },
  {
    id: "c4",
    text: "Do third-party vendors or contractors access client personal data?",
    helpText: "Examples: outsourced accounting staff, IT vendors, cloud tool providers, or back-office processors.",
    category: "third-party",
    weight: 3,
    options: [
      { id: "c4a", text: "Yes, with formal Data Processing Agreements in place", score: 0 },
      { id: "c4b", text: "Yes, but only through our systems with tracked access", score: 1 },
      { id: "c4c", text: "Yes, informally — we share files as needed", score: 3 },
      { id: "c4d", text: "No, all work is done internally", score: 0 },
    ],
  },
  {
    id: "c5",
    text: "Do you have a defined retention policy for client files and personal data?",
    helpText: "A retention policy defines how long different categories of records are kept and when they are deleted.",
    category: "retention",
    weight: 2,
    options: [
      { id: "c5a", text: "Yes, documented and consistently applied", score: 0 },
      { id: "c5b", text: "Informally — we tend to keep everything indefinitely", score: 3 },
      { id: "c5c", text: "We follow statutory retention periods for tax records only", score: 1 },
      { id: "c5d", text: "We have not defined a retention policy", score: 3 },
    ],
  },
  {
    id: "c6",
    text: "Do you process personal data of employees within your firm?",
    helpText: "This includes salaries, PF/ESI contributions, leave records, and performance data.",
    category: "employee-data",
    weight: 2,
    options: [
      { id: "c6a", text: "Yes, fully digitalised with access controls", score: 1 },
      { id: "c6b", text: "Yes, but access is not strictly controlled", score: 2 },
      { id: "c6c", text: "We have fewer than 10 employees — it's managed informally", score: 2 },
      { id: "c6d", text: "We use a third-party payroll processor", score: 1 },
    ],
  },
  {
    id: "c7",
    text: "Do clients have a way to request access to or correction of the personal data your firm holds about them?",
    helpText: "This refers to individual client or employee data, not company financial records.",
    category: "rights",
    weight: 2,
    options: [
      { id: "c7a", text: "Yes, we have a defined process for this", score: 0 },
      { id: "c7b", text: "They can email us — it would be handled case by case", score: 2 },
      { id: "c7c", text: "We haven't considered this", score: 3 },
      { id: "c7d", text: "We don't think this applies to our firm", score: 3 },
    ],
  },
];

// ─── Training Institute Assessment ───────────────────────────────────────────

export const trainingInstituteQuestions: AssessmentQuestion[] = [
  {
    id: "t1",
    text: "Do you collect student and parent contact information online?",
    helpText: "This includes lead forms, enquiry forms, or online admission applications.",
    category: "data-collection",
    weight: 3,
    options: [
      { id: "t1a", text: "Yes, through our website and digital channels", score: 2 },
      { id: "t1b", text: "Yes, primarily on physical forms", score: 1 },
      { id: "t1c", text: "Both digital and physical forms", score: 2 },
      { id: "t1d", text: "We only collect data during in-person visits", score: 0 },
    ],
  },
  {
    id: "t2",
    text: "Do you run digital advertising campaigns for admissions (Meta Ads, Google Ads)?",
    helpText: "These campaigns typically use remarketing pixels that track website visitors.",
    category: "marketing",
    weight: 3,
    options: [
      { id: "t2a", text: "Yes, heavily — it's our primary admissions channel", score: 3 },
      { id: "t2b", text: "Yes, but only for general awareness", score: 2 },
      { id: "t2c", text: "Occasionally for specific programmes", score: 1 },
      { id: "t2d", text: "No, we rely on word-of-mouth and referrals", score: 0 },
    ],
  },
  {
    id: "t3",
    text: "Do you enrol students under the age of 18?",
    helpText: "Processing data of minors requires parental consent under DPDPA.",
    category: "minors",
    weight: 3,
    options: [
      { id: "t3a", text: "Yes, a significant portion of our students are under 18", score: 3 },
      { id: "t3b", text: "Some programmes cater to minors", score: 2 },
      { id: "t3c", text: "Very rarely — most students are adults", score: 1 },
      { id: "t3d", text: "No, all our courses are for adults only", score: 0 },
    ],
  },
  {
    id: "t4",
    text: "Do you manage attendance and academic performance digitally?",
    helpText: "This includes biometric attendance, LMS platforms, or digital marksheets.",
    category: "data-collection",
    weight: 2,
    options: [
      { id: "t4a", text: "Yes, fully digital with a learning management system", score: 2 },
      { id: "t4b", text: "Yes, biometric attendance with digital records", score: 2 },
      { id: "t4c", text: "Partially — attendance is digital but marks are manual", score: 1 },
      { id: "t4d", text: "No, everything is paper-based", score: 0 },
    ],
  },
  {
    id: "t5",
    text: "Do you collect and retain placement data — including employer names, salaries, and offer letters?",
    helpText: "Placement data is sensitive and often linked to identifiable students.",
    category: "sensitive-data",
    weight: 2,
    options: [
      { id: "t5a", text: "Yes, for all placed students", score: 2 },
      { id: "t5b", text: "Yes, but only aggregated data without individual names", score: 0 },
      { id: "t5c", text: "Sometimes, for marketing purposes", score: 3 },
      { id: "t5d", text: "No, we don't have a placement programme", score: 0 },
    ],
  },
  {
    id: "t6",
    text: "Can current or former students request correction or deletion of their data?",
    helpText: "Do you have a mechanism — email, form, or portal — for students to exercise data rights?",
    category: "rights",
    weight: 2,
    options: [
      { id: "t6a", text: "Yes, we have a formal process for this", score: 0 },
      { id: "t6b", text: "They can contact the office — it would be handled informally", score: 2 },
      { id: "t6c", text: "We haven't set this up", score: 3 },
      { id: "t6d", text: "We were not aware this was a requirement", score: 3 },
    ],
  },
  {
    id: "t7",
    text: "Do your marketing materials, forms, or website mention how student data will be used?",
    helpText: "A Privacy Notice or data handling statement visible to prospective students.",
    category: "transparency",
    weight: 2,
    options: [
      { id: "t7a", text: "Yes, we have a Privacy Policy visible on our website and forms", score: 0 },
      { id: "t7b", text: "We have generic Terms and Conditions but no specific privacy notice", score: 2 },
      { id: "t7c", text: "No formal privacy notice exists", score: 3 },
      { id: "t7d", text: "We're not sure what our website says about data", score: 3 },
    ],
  },
];

// ─── D2C Brand Assessment ─────────────────────────────────────────────────────

export const d2cBrandQuestions: AssessmentQuestion[] = [
  {
    id: "d1",
    text: "Do you send promotional communications via email, SMS, or WhatsApp?",
    helpText: "This includes newsletters, offers, new arrivals, cart reminders, and loyalty nudges.",
    category: "marketing",
    weight: 3,
    options: [
      { id: "d1a", text: "Yes, across all three channels with high frequency", score: 3 },
      { id: "d1b", text: "Yes, primarily email and SMS", score: 2 },
      { id: "d1c", text: "Occasionally, only for major campaigns", score: 1 },
      { id: "d1d", text: "No, we don't send marketing communications", score: 0 },
    ],
  },
  {
    id: "d2",
    text: "Do you use marketing or analytics tools that track customers on your website or app?",
    helpText: "Examples: Meta Pixel, Google Analytics, Clevertap, MoEngage, Hotjar, Mixpanel.",
    category: "third-party",
    weight: 3,
    options: [
      { id: "d2a", text: "Yes, multiple tools are integrated and actively used", score: 3 },
      { id: "d2b", text: "Yes, Google Analytics only", score: 2 },
      { id: "d2c", text: "We use basic analytics but don't track individuals", score: 1 },
      { id: "d2d", text: "No third-party tracking tools", score: 0 },
    ],
  },
  {
    id: "d3",
    text: "Do you retain inactive customer data indefinitely?",
    helpText: "Customers who haven't purchased in 2+ years but whose data you still hold.",
    category: "retention",
    weight: 2,
    options: [
      { id: "d3a", text: "Yes, we keep all customer data forever", score: 3 },
      { id: "d3b", text: "We retain it for 2-3 years then review", score: 1 },
      { id: "d3c", text: "We have a defined 12-month retention policy for inactive customers", score: 0 },
      { id: "d3d", text: "We don't have a retention policy", score: 3 },
    ],
  },
  {
    id: "d4",
    text: "Do you run a loyalty programme or personalisation engine?",
    helpText: "This includes points systems, personalised recommendations, or customer segmentation.",
    category: "profiling",
    weight: 2,
    options: [
      { id: "d4a", text: "Yes, with rich customer profiling", score: 3 },
      { id: "d4b", text: "Yes, basic loyalty points", score: 1 },
      { id: "d4c", text: "We personalise recommendations but no formal loyalty programme", score: 2 },
      { id: "d4d", text: "No loyalty or personalisation features", score: 0 },
    ],
  },
  {
    id: "d5",
    text: "Do customers have a way to manage their communication preferences?",
    helpText: "An account settings page, preference centre, or unsubscribe mechanism.",
    category: "rights",
    weight: 3,
    options: [
      { id: "d5a", text: "Yes, customers can manage channel preferences in their account", score: 0 },
      { id: "d5b", text: "Email only — there is an unsubscribe link in newsletters", score: 2 },
      { id: "d5c", text: "Customers can email us to opt out", score: 2 },
      { id: "d5d", text: "No mechanism exists", score: 3 },
    ],
  },
  {
    id: "d6",
    text: "Do you share customer data with third-party marketplaces, logistics, or analytics partners?",
    helpText: "Sharing shipping details, order data, or customer segments with external parties.",
    category: "data-sharing",
    weight: 2,
    options: [
      { id: "d6a", text: "Yes, with defined DPAs and strict data sharing terms", score: 0 },
      { id: "d6b", text: "Yes, logistics and marketplace data sharing is standard", score: 2 },
      { id: "d6c", text: "We share only what is needed for order fulfilment", score: 1 },
      { id: "d6d", text: "No third-party data sharing", score: 0 },
    ],
  },
  {
    id: "d7",
    text: "Did you obtain explicit marketing consent from your existing customer base?",
    helpText: "Separate from purchase/transaction consent — specific consent to send promotional messages.",
    category: "consent",
    weight: 3,
    options: [
      { id: "d7a", text: "Yes, with a compliant opt-in mechanism at checkout", score: 0 },
      { id: "d7b", text: "We assumed purchase implies consent to market", score: 3 },
      { id: "d7c", text: "Some customers have explicit consent, others do not", score: 2 },
      { id: "d7d", text: "We're not sure what consent was collected historically", score: 3 },
    ],
  },
  {
    id: "d8",
    text: "Does your checkout flow collect consent separately for marketing vs order processing?",
    helpText: "DPDPA requires separate consent for each distinct purpose.",
    category: "consent",
    weight: 3,
    options: [
      { id: "d8a", text: "Yes, with separate unchecked consent boxes for marketing", score: 0 },
      { id: "d8b", text: "Marketing consent is bundled into Terms and Conditions acceptance", score: 3 },
      { id: "d8c", text: "There is a single checkbox for all consent", score: 3 },
      { id: "d8d", text: "We don't have consent mechanisms at checkout", score: 3 },
    ],
  },
];

// ─── Scoring Engine ───────────────────────────────────────────────────────────

export function calculateAssessmentResult(
  questions: AssessmentQuestion[],
  answers: Record<string, string>
): AssessmentResult {
  let totalScore = 0;
  let maxPossibleScore = 0;

  questions.forEach((q) => {
    const selectedOptionId = answers[q.id];
    if (selectedOptionId) {
      const selectedOption = q.options.find((o) => o.id === selectedOptionId);
      if (selectedOption) {
        totalScore += selectedOption.score * q.weight;
      }
    }
    const maxOptionScore = Math.max(...q.options.map((o) => o.score));
    maxPossibleScore += maxOptionScore * q.weight;
  });

  const scorePercentage = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;

  // Derive sub-scores (simplified)
  const applicabilityScore = Math.min(100, scorePercentage + 20);
  const maturityScore = Math.max(0, 100 - scorePercentage);
  const riskScore = scorePercentage;
  const urgencyScore = scorePercentage > 60 ? 80 : scorePercentage > 30 ? 50 : 20;

  let riskLevel: "green" | "amber" | "red";
  let headline: string;
  let summary: string;
  let recommendations: string[];
  let nextStep: string;

  if (scorePercentage < 33) {
    riskLevel = "green";
    headline = "You have a relatively low DPDPA complexity profile.";
    summary =
      "Your current data practices appear to carry lower DPDPA risk than typical businesses in your sector. However, 'lower risk' does not mean zero obligation. You still need to ensure your consent notices are in place, your Privacy Notice is current, and you have a basic process for handling data rights requests.";
    recommendations = [
      "Conduct a one-time data audit to document what you collect and why",
      "Ensure your website Privacy Notice is DPDPA-aligned",
      "Add a basic rights request mechanism (email or form)",
      "Review your third-party vendor list for data sharing",
    ];
    nextStep = "Download our DPDPA Compliance Checklist to tick off your quick wins.";
  } else if (scorePercentage < 67) {
    riskLevel = "amber";
    headline = "Your business has moderate DPDPA exposure that needs structured attention.";
    summary =
      "Several of your current practices carry meaningful DPDPA compliance risk. This doesn't mean you are in violation today, but without action, you will face increasing exposure as enforcement begins. The good news is that most of your gaps can be addressed with structured effort over 2-3 months.";
    recommendations = [
      "Redesign your consent flows to meet DPDPA requirements",
      "Define and document your data retention policies",
      "Audit your third-party vendors and establish Data Processing Agreements",
      "Create a formal process for data rights requests",
      "Train staff who handle personal data on DPDPA basics",
    ];
    nextStep =
      "Schedule a free consultation to prioritise your compliance roadmap before the rules are notified.";
  } else {
    riskLevel = "red";
    headline = "Your business has high DPDPA exposure requiring urgent action.";
    summary =
      "Based on your responses, your current data practices carry significant DPDPA compliance risk. Multiple areas — consent, retention, data sharing, and rights management — need immediate attention. Businesses in this category are at the highest risk of enforcement action when the Board becomes operational.";
    recommendations = [
      "Immediate audit of all consent flows and forms",
      "Stop using pre-checked consent boxes immediately",
      "Map all personal data flows including third parties",
      "Establish a data retention and deletion schedule",
      "Designate a Data Protection contact person",
      "Begin drafting or updating your Privacy Notice",
      "Implement a breach response plan",
    ];
    nextStep =
      "Speak with our advisory team to begin your DPDPA compliance programme. Time is a factor.";
  }

  return {
    applicabilityScore: Math.round(applicabilityScore),
    maturityScore: Math.round(maturityScore),
    riskScore: Math.round(riskScore),
    urgencyScore: Math.round(urgencyScore),
    riskLevel,
    headline,
    summary,
    recommendations,
    nextStep,
  };
}
