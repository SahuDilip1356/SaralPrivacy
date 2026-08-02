// What happens when someone asks - and what happens when it has already gone
// wrong. Optional shared sections (lib/data-flow/schemas.ts); the sixth and last
// of the live packs to author them.
//
// CONTENT ONLY. No component, route or schema work.
//
// THE RECRUITMENT DIFFERENCE. In every other pack the data principal is a
// customer, a patient, a student or a client - someone the business is serving.
// Here the candidate is the PRODUCT: their CV is the agency's inventory, their
// profile is what gets sold, and the agency's commercial interest is in keeping
// and circulating it, not in deleting it. That tension runs through every
// scenario below, and it is why `rs-delete-my-cv` is the hardest one to answer
// honestly.
//
// The second difference is that the worst outcome is not exposure in general but
// exposure to ONE specific person: the candidate's current employer. A CV that
// reaches the wrong inbox does not just breach privacy, it can end someone's
// job. Hence `in-cv-reached-current-employer` as the most severe incident, and
// `rs-bgv-contacted-my-employer`.
//
// The third: the pipeline flows once and mostly ends in rejection. Almost
// everyone in the database was told no, and nobody designed for what happens to
// their data afterwards - `rs-why-was-i-rejected` and `rs-stop-contacting-me`.
//
// LANGUAGE LOCK: DPDPA scope only. No labour-law, EPFO/ESIC or employment-law
// claims, no statements about what background verification is legally permitted
// to do, and no "sensitive personal data" - the DPDPA creates no such statutory
// category. The incident section is an OPERATIONAL response reference.
//
// Model gating: only the payroll walkthroughs are staffing-specific, because
// only a staffing agency employs the person it placed.

import type { IncidentScenario, RightsScenario } from "../../../data-flow/schemas.ts";

export const RECRUITMENT_RIGHTS_SCENARIOS: RightsScenario[] = [
  {
    id: "rs-access-everything",
    request: "Show me everything you hold about me",
    requestType: "access",
    who: "A candidate - very often one who was rejected years ago and has just been contacted again.",
    reachesNodeIds: [
      "ats",
      "candidate-database",
      "excel-tracker",
      "google-drive",
      "interview-scheduler",
      "recruiter-email",
      "email-archive",
      "printed-files",
    ],
    blockedNodeIds: [
      "personal-whatsapp",
      "recruiter-laptop",
      "cloud-backup",
      "client-ats",
      "bgv-vendor",
      "ai-screener",
    ],
    steps: [
      "Resolve the candidate across duplicates - the same person is usually in the database three times from three applications.",
      "Pull the CV, application history, interview notes and the record of which roles they were considered for.",
      "Include what the agency CREATED rather than collected: recruiter comments, suitability ratings, salary expectations noted from a call, any score a tool produced.",
      "Include the assessment and video-interview records if those tools were used.",
      "Name every client their profile was sent to, and the vendors involved - assessment, background verification, e-signature.",
      "Say plainly which places you could not search, and why.",
    ],
    hardPart:
      "Recruiter commentary. The most consequential things written about a candidate - 'not a culture fit', 'seemed underconfident', a salary figure inferred from a conversation - live in ATS free-text, a spreadsheet column and WhatsApp threads. Candidates almost never know these exist, and they are usually the reason they stopped hearing back.",
  },
  {
    id: "rs-why-was-i-rejected",
    request: "A tool filtered me out - tell me why",
    requestType: "complaint",
    who: "A candidate who was rejected within minutes of applying and suspects no human ever read their CV.",
    reachesNodeIds: ["ai-screener", "ats", "candidate-database", "assessment-vendor", "excel-tracker"],
    blockedNodeIds: ["client-ats", "recruiter-laptop", "cloud-backup"],
    steps: [
      "Establish whether a human actually reviewed the application, or whether the screening tool's ranking was applied directly.",
      "Retrieve what the tool produced: the score, the ranking, the criteria it matched on.",
      "Check what the criteria actually were - keyword rules, an employment-gap penalty and a location filter all behave very differently for different people.",
      "Have a person review the application properly and record the outcome.",
      "Explain the decision to the candidate in plain language, not by naming the vendor.",
      "Record the challenge and what changed as a result.",
    ],
    hardPart:
      "Nobody at the agency can usually explain the model. The score came from a vendor's system nobody has audited, the criteria were configured once and never revisited, and there is often no record of whether a human looked at all - which makes 'we reviewed your profile carefully' something the agency cannot actually stand behind.",
  },
  {
    id: "rs-who-did-you-send-me-to",
    request: "Which clients did you send my CV to?",
    requestType: "access",
    who: "A candidate who found out from a friend that their profile had been submitted somewhere they never applied.",
    reachesNodeIds: ["ats", "recruiter-email", "excel-tracker", "candidate-database", "e-sign-tool"],
    blockedNodeIds: ["client-email", "client-ats", "client-whatsapp", "personal-whatsapp"],
    steps: [
      "Pull the submission history from the ATS - which client, which role, which date.",
      "Check the recruiter's sent mail and the tracker spreadsheet, because plenty of submissions never reach the ATS.",
      "Tell the candidate the full list, including submissions that went nowhere.",
      "Ask clients who received an unauthorised submission to delete the profile, and confirm.",
      "Introduce a per-role permission step so this cannot recur.",
    ],
    hardPart:
      "Mass submission is normal practice and rarely logged properly. A CV forwarded from a recruiter's mailbox or a WhatsApp message to a client contact leaves no trace in the ATS - so the honest answer is often 'these are the ones we can prove', which is not the same as all of them.",
  },
  {
    id: "rs-bgv-contacted-my-employer",
    request: "Your verification agency contacted my current employer",
    requestType: "complaint",
    who: "A candidate whose confidential job search has just been exposed to the person they work for.",
    reachesNodeIds: ["bgv-vendor", "ats", "recruiter-email", "candidate-database"],
    blockedNodeIds: ["reference-sources", "client-ats", "cloud-backup"],
    steps: [
      "Stop the verification immediately and instruct the vendor to make no further contact.",
      "Establish exactly who was approached, what was said, and what was disclosed about why.",
      "Tell the candidate everything you have established, without minimising it.",
      "Review what the candidate actually authorised, and whether current-employer contact was excluded.",
      "Change the vendor instruction so current employment is verified only after an offer and only with specific permission.",
      "Record it as an incident, because for the candidate it may be one.",
    ],
    hardPart:
      "It cannot be undone. The employer now knows their employee is looking, and the candidate may lose the job they have before securing the one they wanted. Verification vendors also routinely contact people the candidate never named - which is why the sources they approached sit outside what the agency can reach or correct.",
  },
  {
    id: "rs-correct-my-record",
    request: "What you have written about me is wrong",
    requestType: "correction",
    who: "A candidate who has discovered an inaccurate salary, notice period, reason for leaving or recruiter rating.",
    reachesNodeIds: ["ats", "candidate-database", "excel-tracker", "google-drive", "recruiter-email"],
    blockedNodeIds: ["client-ats", "client-email", "recruiter-laptop", "email-archive", "cloud-backup"],
    steps: [
      "Verify the requester, then separate fact from opinion - a wrong salary figure is a correction, a recruiter's judgement is a different conversation.",
      "Correct the master ATS record and every duplicate profile for the same person.",
      "Fix the tracker spreadsheet and any working copy the correction would otherwise miss.",
      "Tell clients who already received the incorrect information.",
      "Remove commentary that is not defensible as a factual assessment.",
      "Record what was corrected and when.",
    ],
    hardPart:
      "The wrong figure has usually already been quoted to a client, and it may have set the salary band they are now negotiating against. Correcting your own record does not retrieve what was said on a call or written in a submission email.",
  },
  {
    id: "rs-stop-contacting-me",
    request: "Stop calling me about jobs",
    requestType: "withdraw-marketing",
    who: "Someone who applied once, years ago, and is still being contacted by recruiters who found them in the database.",
    reachesNodeIds: ["candidate-database", "ats", "excel-tracker", "recruiter-email", "personal-whatsapp"],
    blockedNodeIds: ["recruiter-laptop", "linkedin", "job-portal", "cloud-backup"],
    steps: [
      "Record the objection against the person permanently, not against one campaign or one recruiter.",
      "Flag the record so it is excluded from every future search, rather than deleting it and losing the objection with it.",
      "Tell recruiters individually - numbers are saved on personal phones and no central switch reaches those.",
      "Remove them from any list exported for a mailing or a job blast.",
      "Confirm what has stopped and be honest about what has not.",
    ],
    hardPart:
      "The profile is also on job portals and LinkedIn where the agency sourced it, so a recruiter who re-runs the same search finds them again tomorrow and starts over - and the person's objection lives in your system, not in the source they were found in.",
  },
  {
    id: "rs-delete-my-cv",
    request: "I have a job now - delete my CV and everything with it",
    requestType: "erasure",
    who: "A placed or lapsed candidate who no longer wants to be in anyone's database.",
    reachesNodeIds: [
      "ats",
      "candidate-database",
      "excel-tracker",
      "google-drive",
      "interview-scheduler",
      "printed-files",
      "recruiter-email",
    ],
    blockedNodeIds: [
      "client-ats",
      "client-email",
      "bgv-vendor",
      "assessment-vendor",
      "cloud-backup",
      "email-archive",
      "recruiter-laptop",
      "personal-whatsapp",
    ],
    steps: [
      "Find every duplicate profile before deleting anything, or you will delete one and leave two.",
      "Delete the CV, the profile, the assessment records and the working copies on the drive and in the tracker.",
      "Keep a minimal suppression record so the same person is not re-added from the next portal search - and explain why you are keeping it.",
      "Ask the vendors who processed them - assessment, verification, e-signature - to delete their copies and confirm.",
      "Tell clients who hold their profile that the candidate has asked for removal.",
      "Write down what could not be deleted, on what ground, and give the candidate that list.",
    ],
    hardPart:
      "The database is the business, so deletion runs against the agency's commercial interest in a way it does not in any other sector - and much of what matters is already outside the agency: a client's own ATS keeps every CV it was ever sent, indefinitely, under no arrangement the candidate agreed to.",
  },
  {
    id: "rs-payroll-after-assignment",
    request: "My assignment ended - what happens to my payroll records?",
    requestType: "erasure",
    who: "A worker the agency employed and deployed to a client, now off the assignment.",
    reachesNodeIds: ["hrms", "attendance-system", "payroll-provider", "salary-bank", "client-workforce-portal"],
    blockedNodeIds: ["pf-esi-portals", "cloud-backup", "client-ats"],
    steps: [
      "Separate what must be retained as an employment and statutory record - determined with your own advisers - from what has merely accumulated.",
      "Close their access to the client's workforce systems as a defined step, not something that lapses.",
      "Remove them from active attendance and rostering so they stop being tracked after the assignment ended.",
      "Confirm what the payroll provider and the bank retain, and for how long.",
      "Explain to the worker what is kept, why, and for how long.",
    ],
    hardPart:
      "Statutory filings have already been made to portals the agency cannot edit or delete from, and the client's own access systems often keep the worker provisioned long after they have left the site. Genuine retention obligations also apply here in a way they do not to a rejected candidate - so the honest answer is a kept list and a deleted list.",
    businessModels: ["staffing"],
  },
];

export const RECRUITMENT_INCIDENT_SCENARIOS: IncidentScenario[] = [
  {
    id: "in-cv-reached-current-employer",
    title: "A candidate's CV reached their current employer",
    trigger:
      "The candidate calls in distress - or does not call, because they found out when their manager raised it.",
    severity: "critical",
    involvedNodeIds: ["recruiter-email", "client-email", "ats", "excel-tracker"],
    containment: [
      "Establish exactly what was sent, to whom, and whether the recipient is connected to the candidate's employer.",
      "Ask the recipient to delete it and confirm, and withdraw the submission formally.",
      "Stop any further submission of that candidate until they tell you what they want.",
    ],
    thenWhat: [
      "Speak to the candidate first and honestly - their job may be at risk, and how the agency behaves now is the whole relationship.",
      "Work out the cause: a blind mass-submission, a client contact who moved companies, a CV forwarded without checking.",
      "Introduce a rule that a candidate confirms each client before submission, and that do-not-submit employers are recorded.",
      "Log it as a serious incident, because for the candidate it is.",
    ],
    prevention:
      "Per-role, per-client candidate permission before any submission, a recorded do-not-submit list on every profile, and no CV leaving a recruiter's mailbox without that check.",
  },
  {
    id: "in-recruiter-left-with-database",
    title: "A recruiter left and took the candidate database",
    trigger:
      "Candidates report being contacted by a former recruiter at a competing agency, using details only you held.",
    severity: "critical",
    involvedNodeIds: ["candidate-database", "excel-tracker", "recruiter-laptop", "personal-whatsapp"],
    containment: [
      "Disable every account immediately - ATS, drive, email and any job-portal login issued to them.",
      "Recover firm devices; for personal ones, ask in writing for deletion of candidate data and contacts, and get confirmation.",
      "Check export and download logs for the weeks before departure.",
    ],
    thenWhat: [
      "Establish which candidates' data left and whether it has demonstrably been used elsewhere.",
      "Tell affected candidates where there is evidence their details were taken - they are the ones now receiving unexpected calls.",
      "Restrict bulk export to named, logged actions rather than a standing capability.",
      "Make device return and account closure a checked step in every exit.",
    ],
    prevention:
      "Export limited and logged, candidate contact through agency-controlled channels rather than personal numbers, named logins throughout, and an exit checklist someone owns.",
  },
  {
    id: "in-ai-screener-unreviewed",
    title: "The screening tool rejected people and nobody checked",
    trigger:
      "Noticed when a strong candidate is found to have been auto-rejected, or when rejection patterns look wrong.",
    severity: "high",
    involvedNodeIds: ["ai-screener", "ats", "candidate-database", "assessment-vendor"],
    containment: [
      "Pause automatic rejection and route the queue to human review.",
      "Pull the criteria the tool is actually applying, not the ones you believe it applies.",
      "Identify the affected cohort and how far back it goes.",
    ],
    thenWhat: [
      "Have people re-review the affected applications and act on the outcome, not just record it.",
      "Establish who owns the tool's configuration and when it was last examined.",
      "Require a documented human decision before any rejection, and keep the reason.",
      "Give candidates a route to challenge, and be able to explain a decision in plain language.",
    ],
    prevention:
      "A human decision recorded before any rejection, criteria reviewed on a schedule with an owner, and the ability to explain any tool-assisted outcome without naming the vendor as the reason.",
  },
  {
    id: "in-tracker-spreadsheet-shared",
    title: "The candidate tracker was emailed outside the agency",
    trigger:
      "A client mentions a spreadsheet they should not have, or the file turns up in a shared folder.",
    severity: "high",
    involvedNodeIds: ["excel-tracker", "recruiter-email", "google-drive", "client-email"],
    containment: [
      "Establish which version left, how many candidates were in it, and what columns it carried.",
      "Ask every recipient to delete it and confirm; recall the mail where possible.",
      "Check whether it included candidates unrelated to that client's roles - it usually does.",
    ],
    thenWhat: [
      "Look at what the tracker holds beyond names: current salary, notice period, recruiter commentary, do-not-submit flags.",
      "Tell affected candidates whose details went to a party they never agreed to.",
      "Replace the shared spreadsheet with a scoped view from the ATS.",
      "Restrict who can export candidate lists at all, and log it.",
    ],
    prevention:
      "Client-facing shortlists generated from the ATS with only the fields that role needs, no tracker spreadsheets leaving the agency, and logged exports.",
  },
  {
    id: "in-bgv-overreach",
    title: "The verification vendor went further than authorised",
    trigger:
      "A candidate reports being contacted, or a referee mentions questions that went well beyond employment dates.",
    severity: "high",
    involvedNodeIds: ["bgv-vendor", "reference-sources", "ats", "recruiter-email"],
    containment: [
      "Instruct the vendor to stop all activity on that case immediately.",
      "Establish who was approached, what was asked, and what was disclosed about the candidate.",
      "Tell the candidate promptly and completely.",
    ],
    thenWhat: [
      "Compare what was done against what the candidate actually authorised.",
      "Put the scope in writing with the vendor: which checks, which sources, and what is out of bounds.",
      "Require the vendor to confirm what it retains and to delete what it should not have gathered.",
      "Review whether current-employer contact is deferred until after an offer as standard.",
    ],
    prevention:
      "A written, candidate-visible scope for every check, current-employer contact only after an offer and with specific permission, and vendor terms that name the sources they may approach.",
  },
  {
    id: "in-whatsapp-cv-store",
    title: "CVs and identity documents accumulated on personal phones",
    trigger:
      "Surfaces when a recruiter changes handset or leaves, and years of candidate documents go with it.",
    severity: "high",
    involvedNodeIds: ["personal-whatsapp", "recruiter-laptop", "google-drive", "printed-files"],
    containment: [
      "Establish whose documents are in the threads and over what period.",
      "Save what is genuinely needed into the ATS first, then delete the media and history.",
      "Check the phone's automatic cloud backup, which has already copied every image.",
    ],
    thenWhat: [
      "Move candidate document collection onto an agency-controlled channel.",
      "Set a rule that identity documents are never collected on personal handsets.",
      "Decide, with advice, whether affected candidates should be told - lean towards it where identity documents were involved.",
      "Check the rest of the team, because the same accumulation exists there.",
    ],
    prevention:
      "An agency channel that is as easy to use as WhatsApp, a prohibition on personal handsets for candidate documents, and a deletion rule once a document is filed.",
  },
  {
    id: "in-client-batch-overshare",
    title: "A client received profiles of candidates who never applied to them",
    trigger:
      "Raised by a candidate who was contacted by a company they had never heard of.",
    severity: "medium",
    involvedNodeIds: ["client-ats", "client-email", "ats", "excel-tracker"],
    containment: [
      "Identify exactly which profiles were sent and which of those had no permission.",
      "Ask the client to delete the unauthorised profiles and confirm.",
      "Stop further batch submissions to that client pending a scope agreement.",
    ],
    thenWhat: [
      "Tell the affected candidates which client received their profile.",
      "Agree with the client what they may retain and for how long - most keep every CV indefinitely.",
      "Make submission a per-candidate, per-role action rather than a batch send.",
      "Log which profile went where, so this question is answerable next time.",
    ],
    prevention:
      "Per-role candidate permission, submissions generated and logged from the ATS, and written terms with clients on retention of profiles they were sent.",
  },
  {
    id: "in-payroll-data-exposed",
    title: "Payroll and bank details of deployed staff were exposed",
    trigger:
      "A payroll file is found on a shared drive, emailed unprotected, or sent to the wrong client contact.",
    severity: "high",
    involvedNodeIds: ["payroll-provider", "salary-bank", "hrms", "google-drive"],
    containment: [
      "Establish which workers and which fields - salary, bank account, identifiers, deductions.",
      "Remove the file from the drive and every mailbox it reached, with confirmation.",
      "Alert the payroll provider and the bank if account details were exposed.",
    ],
    thenWhat: [
      "Tell the affected workers directly - they are employees, and bank detail exposure is something they may need to act on.",
      "Review why payroll data was in a file at all rather than staying in the system.",
      "Restrict payroll access to named finance and HR roles.",
      "Record the incident and the corrective control.",
    ],
    prevention:
      "Payroll kept inside the system with named access, no payroll spreadsheets on shared drives or in email, and client reporting limited to what the client actually needs.",
    businessModels: ["staffing"],
  },
];
