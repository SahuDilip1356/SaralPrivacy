// "What happens when somebody asks" and "it already went wrong" walkthroughs.
// Shared presentation, pack-driven content - the same sections every other map
// in this series renders. Spec §7.
//
// `blockedNodeIds` IS THE HONEST HALF. A map that shows only what a request can
// reach is a brochure. In this sector the blocked list is unusually long and
// unusually important, because the file has genuinely left: the lenders it was
// routed to, the credit bureau, the DSA who introduced the customer, the agency
// that worked the arrears, the vendor that verified the identity, the backup
// cycle, and anything already filed with an authority. Naming them is what makes
// the rest of the answer believable.
//
// ⛔ LANGUAGE LOCKS (spec §8), all four of which bite hardest in this file:
//  · No financial, lending, credit or regulatory advice. Nothing here says what
//    a business must retain or for how long. Where a record exists because other
//    law requires it, it is called a REQUIRED RECORD and left there.
//  · Retention is NOT uniformly deletable. Every erasure walkthrough separates
//    what must be KEPT - a live account, a ledger entry, a required record -
//    from what has merely never been DELETED, which is where the actual work is.
//  · Fraud suspicion is never written as confirmed fraud.
//  · No accusation. Agencies, DSAs and field officers are how this trade reaches
//    people. These are control failures, not indictments.
//
// Every node referenced must be VISIBLE in every model the scenario shows in -
// the framework's §5 script checks it, and a hidden node renders a blank chip
// and silently understates what a request has to reach.

import type { IncidentScenario, RightsScenario } from "../../../data-flow/schemas.ts";

const LENDING = ["digital-lending", "nbfc"];
const DIGITAL = ["digital-lending"];
const PAYMENTS = ["payments"];
const NBFC = ["nbfc"];

export const FINTECH_NBFC_RIGHTS_SCENARIOS: RightsScenario[] = [
  {
    id: "r-access",
    request: "Show me everything you hold about me.",
    requestType: "access",
    who: "A customer, a rejected applicant, or someone who only ever downloaded the app",
    reachesNodeIds: [
      "customer-master",
      "kyc-document-repository",
      "decision-log",
      "support-console",
      "data-warehouse",
      "lead-crm",
      "core-archive",
      "agent-personal-phone",
    ],
    blockedNodeIds: ["partner-bank-lender", "vendor-residual-copies", "backup-store"],
    steps: [
      "Verify who is asking against something they did not simply supply in the request itself.",
      "Search on every identifier the person has ever had with you - mobile number, customer ID, PAN, application number, device and, for a payments business, the handle or wallet ID. One person routinely exists under several.",
      "Pull the obvious systems: the customer master, the KYC repository, the loan or wallet record, the support and ticket history, and the archive.",
      "Pull the less obvious ones, which is where most access answers fall down: the lead record from before they were a customer, the decision and the score, the analytics copy in the warehouse, and any collections or dispute file.",
      "Include what the business worked out about them, not only what they gave you - the risk grade, the eligibility, the segment they sit in.",
      "Ask the customer-facing team what is on their own phones and in their chat threads, because none of it is searchable.",
      "Name the recipients: the institutions the file went to, the bureau, the verification provider, the agency. Use the disclosure register rather than memory.",
      "Send it in a form the person can actually read, and record what was sent and when.",
    ],
    hardPart:
      "The systems nobody counts. The lead record, the warehouse copy, the score, the personal phone and the spreadsheet on somebody's laptop are all personal data, and none of them appears when a team is asked to 'pull the customer's file'. Without a maintained register of processors and partners, the answer will also quietly omit every copy that has left the building.",
  },
  {
    id: "r-decision-explain",
    request: "Why was I refused? Which of my information did you use — and can a person look at it again?",
    requestType: "access",
    who: "An applicant who was rejected, given a smaller amount, or priced higher than expected",
    reachesNodeIds: ["decision-log", "decision-engine", "review-workstation", "disclosure-register"],
    blockedNodeIds: ["partner-bank-lender", "model-training-dataset"],
    steps: [
      "Find the decision: the application, the outcome, the timestamp and the rule or model version that produced it.",
      "List the categories of information that went into it - identity, bank data, bureau history, device signals, and in a branch model the field verification.",
      "Check the factual inputs for accuracy before defending the outcome. A stale bureau entry, a mis-parsed statement line or a shared handset are the usual culprits.",
      "Route it to a reviewer who is authorised to change the outcome, not only to explain it, and give them a stated time to respond.",
      "Record the reviewer's reasoning, whether the decision was confirmed, modified or overturned.",
      "Give the person a reason they can act on - what to correct, what to supply, when they can reapply - rather than a reason code.",
      "If the file was sent to other institutions, say so, and tell them which ones so they can approach them directly.",
      "Keep the whole exchange on the decision log so the next person who asks gets the same answer.",
    ],
    hardPart:
      "If the model version and the inputs were not logged at the moment of the decision, no honest explanation is possible afterwards. And even a fully reversed decision does not travel: the lenders that already received the score keep it, and the outcome is usually already in the training data for the next model.",
  },
  {
    id: "r-correct-kyc",
    request: "My name is spelled wrong and this is my old address — fix it everywhere.",
    requestType: "correction",
    who: "A customer, often after a rejection or a failed verification caused by the mismatch",
    reachesNodeIds: ["customer-master", "kyc-document-repository", "kyc-provider", "support-console"],
    blockedNodeIds: ["partner-bank-lender", "vendor-residual-copies", "backup-store"],
    steps: [
      "Verify the requester, and establish whether they are the customer or a related party acting for them.",
      "Correct the master customer record first, so everything that reads from it picks up the change.",
      "Update the KYC record with the verification provider where the workflow supports it, and note where it does not.",
      "Push the correction to the loan, wallet or payment account and to the servicing and support systems.",
      "Tell the institutions that received the file, so their copy does not stay wrong and cause a second rejection somewhere else.",
      "Preserve the amendment history - what it was, what it became, who changed it and when.",
      "Record the places you could not reach, and tell the customer plainly which ones they are.",
      "Confirm completion, and check that the correction survived the next overnight sync.",
    ],
    hardPart:
      "Correction propagates poorly. A change made in the support console often does not reach the master record, and a change to the master record almost never reaches the copies at the verification provider, the partner institutions or the analytics warehouse. Customers usually discover this when the old value resurfaces in a letter months later.",
  },
  {
    id: "r-correct-bureau",
    request: "The bureau still shows a loan I closed two years ago, and it is costing me.",
    requestType: "correction",
    who: "A borrower who has been refused elsewhere because of the entry",
    reachesNodeIds: ["loan-management-system", "credit-bureau", "customer-master", "decision-log"],
    blockedNodeIds: ["partner-bank-lender", "model-training-dataset"],
    steps: [
      "Confirm the account status in your own book first - closed, settled, written off or genuinely still live.",
      "Check what your business actually reported and when, rather than what the customer's statement says.",
      "If your reporting was wrong, correct it at source so the next submission carries the right status.",
      "Raise the correction with the bureau through the proper route, and give the customer the reference so they can follow it themselves.",
      "Tell the customer honestly which part is yours to fix and which part is not - the entry lives in the bureau's record, not yours.",
      "Re-run any of your own decisions that relied on the incorrect entry, if the customer asks.",
      "Log the correction and the date so a later dispute has a trail.",
    ],
    hardPart:
      "Most of this record is not yours. You can correct what you reported, but the bureau's copy, the other lenders who already read it and any decision they made on it are outside your reach entirely. Telling the customer that clearly is more useful than implying you can fix it all.",
    businessModels: LENDING,
  },
  {
    id: "r-withdraw-marketing",
    request: "Stop the offers, the SMS and the calls. I only want messages about my account.",
    requestType: "withdraw-marketing",
    who: "A customer, a former customer, or someone who only ever enquired",
    reachesNodeIds: [
      "consent-record",
      "cross-sell-audience",
      "marketing-automation",
      "call-centre-platform",
      "lead-crm",
      "whatsapp-support-channel",
      "dsa-partner-portal",
    ],
    blockedNodeIds: ["ad-audience-upload", "ad-attribution"],
    steps: [
      "Record the withdrawal against the person, not against one channel or one campaign.",
      "Apply it to the segment engine so they stop being included in the next audience that is built.",
      "Suppress across every sending channel - app push, SMS, email, WhatsApp, the dialler's campaign lists and any branch or partner sheet.",
      "Separate service messages, which they still need - a due date, a receipt, a failed payment - from promotion, which they have declined.",
      "Tell channel partners and agencies working pre-approved lists to stop, and check that they did.",
      "Stop new advertising uploads and expire the audiences already sent, accepting that what has left cannot be recalled.",
      "Confirm to the customer, and re-check after a week - suppression frequently survives one campaign cycle and not the next.",
    ],
    hardPart:
      "There is rarely one suppression list. Each channel keeps its own, the partner and branch lists are outside the system entirely, and an audience already uploaded to an advertising platform keeps working. A customer who has said stop three times is usually right that nothing changed.",
  },
  {
    id: "r-erase-rejected",
    request: "You refused my application. Delete everything you took from me.",
    requestType: "erasure",
    who: "A rejected or abandoned applicant, who never became a customer",
    reachesNodeIds: [
      "rejected-application-archive",
      "kyc-document-repository",
      "lead-crm",
      "customer-master",
    ],
    blockedNodeIds: [
      "partner-bank-lender",
      "vendor-residual-copies",
      "backup-store",
      "model-training-dataset",
    ],
    steps: [
      "Confirm there is no live account, no outstanding amount and no open dispute - this is the clean case, and it should be treated as one.",
      "Delete the raw documents first and fastest: identity copies, bank statements, income proofs and any video-KYC recording. These are the items with the least reason to survive a refusal.",
      "Delete or de-identify the application record, keeping only what is genuinely needed to show a decision was made and on what basis.",
      "Suppress the person from every marketing and lead list immediately, and stop the follow-up calls.",
      "Decide explicitly whether the case falls into a narrow, recorded exception - a genuine fraud investigation, a legal claim, or a record another law requires you to keep. If it does, keep only that part and say so.",
      "Ask the institutions the application was routed to, and the channel partner who submitted it, to delete their copies - and record who confirmed.",
      "Remove the record from training datasets unless that use was disclosed, and record the decision either way.",
      "Tell the person what was deleted, what was kept and why, and what remains outside your reach.",
    ],
    hardPart:
      "The refusal is the reason the file is complete, and nobody owns non-customers - so there is usually no retention rule to enforce. The copies at the lenders the application was routed to, at the DSA who submitted it and in the backup cycle are the ones that cannot be reached, and a business that says 'deleted' without naming them has not answered honestly.",
  },
  {
    id: "r-erase-closed",
    request: "I have closed my account. Delete what you no longer need to keep.",
    requestType: "erasure",
    who: "A former customer who has settled and left",
    reachesNodeIds: [
      "core-archive",
      "customer-master",
      "cross-sell-audience",
      "data-warehouse",
      "support-console",
    ],
    blockedNodeIds: ["backup-store", "vendor-residual-copies", "partner-bank-lender"],
    steps: [
      "Confirm the account is genuinely closed with nothing outstanding, and that no dispute or investigation is open.",
      "Separate the records with grounds to be kept - the ledger entries, the executed agreement, the tax and accounting record, and anything that is a required record under other law - from everything else.",
      "Delete the optional layer: the behavioural profile, the marketing segments, the device history, the analytics copies and any raw document that only supported a decision already made.",
      "Suppress every marketing and cross-sell list the same day, including partner and branch lists.",
      "Close down access - the servicing console, any agency assignment, any partner portal entry.",
      "Age the record out of the warehouse and the segment engine on a schedule, not just from the source system.",
      "Write down what was kept, why, and for how long, in language the customer can read.",
    ],
    hardPart:
      "Closure is treated as an operational status, not a retention trigger, so nothing actually ages out. And the honest answer here has two halves that must not be blurred: some of this you must keep, and the rest you have simply never deleted. Telling a customer 'we are required to retain your data' when only part of it is required is the most common failure in this scenario.",
  },
  {
    id: "r-related-party",
    request: "I only stood as a guarantor — why do you hold my documents, and why am I being called?",
    requestType: "erasure",
    who: "A guarantor, co-applicant, nominee or somebody named as a reference",
    reachesNodeIds: [
      "related-party-record",
      "reference-contact-list",
      "collections-system",
      "customer-master",
    ],
    blockedNodeIds: ["collections-agency", "vendor-residual-copies", "backup-store"],
    steps: [
      "Establish the person's actual role, and whether it carries a live obligation - a guarantee under a running loan is different from a name given as a reference.",
      "Find them, which usually means searching inside somebody else's application because they were never stored as a person.",
      "Create or complete a record for them with their role written down, so the request can be acted on at all.",
      "If they are a reference or an alternate contact with no obligation, remove them from every contactability list and stop the calls immediately.",
      "If they are a guarantor under a live loan, explain plainly which records must stay while the obligation stands, and remove the rest.",
      "Recall the contact details from any agency currently working the account, and confirm the recall.",
      "Give them a notice appropriate to their role - most have never received one - and a route to correct what is held.",
      "Record what was removed and what could not be, and confirm to them directly rather than to the borrower.",
    ],
    hardPart:
      "They are stored as fields on somebody else's record, so there is nothing to search on and nothing to delete without editing the borrower's file. Meanwhile the copy that actually causes the calls is at the agency, which received a spreadsheet and has no reason to prune it.",
    businessModels: LENDING,
  },
  {
    id: "r-contact-list",
    request: "Delete the contacts you copied off my phone. My friends never applied for anything.",
    requestType: "erasure",
    who: "A borrower whose contacts have started receiving calls",
    reachesNodeIds: [
      "contact-sms-store",
      "device-permission-layer",
      "collections-system",
      "decision-engine",
    ],
    blockedNodeIds: ["model-training-dataset", "backup-store"],
    steps: [
      "Confirm what was actually read from the handset - the address book, transactional SMS, the installed-app list, location - rather than what the permission dialogue asked for.",
      "Stop any current use immediately, above all as a contactability source for arrears.",
      "Delete the stored contact and SMS data, and revoke the permission so it is not re-collected at the next app update.",
      "Remove any derived signal built from it - a network score, a contactability band - not just the raw list.",
      "Purge it from the collections system and recall it from any agency that already received it.",
      "Check whether it is embedded in training data, and remove or exclude it.",
      "Confirm the deletion to the customer and tell them the permission is off and what that changes.",
    ],
    hardPart:
      "Every person in that list is a data principal who never dealt with the business, was never told, and cannot ask for anything because they do not know. The customer can ask on their own behalf, but not on theirs - which is precisely why this data should not have been collected for credit or collections in the first place.",
    businessModels: DIGITAL,
  },
  {
    id: "r-unfreeze",
    request: "My account is frozen, it is my own money, and nobody will tell me why.",
    requestType: "complaint",
    who: "A customer whose wallet or payment account has been restricted",
    reachesNodeIds: [
      "account-restriction-system",
      "review-workstation",
      "fraud-platform",
      "support-console",
      "ticketing-platform",
    ],
    blockedNodeIds: ["partner-bank-lender", "authority-request-log"],
    steps: [
      "Find the restriction: what triggered it, which rule or model, when, and whether a person has ever looked at it.",
      "Give the customer a stated time within which a human will review it, and hold to it.",
      "Check the factual basis before defending the block - a shared household device, a new handset or an unusual but legitimate transaction are common causes.",
      "Tell the customer what they can do, rather than only that something is under review.",
      "Where the restriction is lifted, mark the case as unsubstantiated rather than leaving an open flag on the account.",
      "Where it stands, explain as much as you properly can and record why the rest cannot be said.",
      "Correct any characterisation in the record that treats an unproven suspicion as an established finding.",
      "Log the review and the outcome so a repeat block on the same signal is caught.",
    ],
    hardPart:
      "The two things the customer most wants - the reason and a person - are the two the process is least designed to give. And a case closed with nothing found usually leaves the flag behind, so the next model reads it as history and the block recurs.",
    businessModels: PAYMENTS,
  },
];

export const FINTECH_NBFC_INCIDENT_SCENARIOS: IncidentScenario[] = [
  {
    id: "i-agent-phone-lost",
    title: "A phone full of customers' PAN cards is lost",
    trigger: "A DSA, telecaller or field officer reports their handset stolen — and mentions that customer documents were on it",
    severity: "critical",
    involvedNodeIds: [
      "agent-personal-phone",
      "kyc-document-repository",
      "customer-master",
      "dsa-partner-portal",
      "disclosure-register",
    ],
    containment: [
      "Revoke every system credential that handset held, including the partner portal and any shared login.",
      "Disable the WhatsApp Business session and remove the number from customer-facing use.",
      "Establish what was actually on it - document photographs, chat threads, downloaded lists, screenshots - by asking specifically rather than generally.",
      "Where the device was enrolled in management, wipe it; where it was not, say so in the record rather than assuming it was clean.",
    ],
    thenWhat: [
      "Identify the customers whose documents were on the device, using the application records that person handled in the relevant period.",
      "Assess what the exposure actually enables - identity documents and bank details, so consider what a person could do with them, not just how many files there were.",
      "Decide on customer communication as a deliberate decision, recorded with its reasoning either way.",
      "Preserve the evidence: the handover record, the access logs, the list of applications the person touched.",
      "Write the incident record while people still remember, including what could not be established.",
    ],
    prevention:
      "The fix is not a stricter policy - it is removing the reason the phone was used. Give every customer-facing role a managed application that submits documents without storing them, and business numbers for customer contact, then make that route faster than the camera roll. Revoke access the day someone stops working the book.",
  },
  {
    id: "i-crm-export",
    title: "A customer list is exported and leaves with someone",
    trigger: "A competitor's outreach names your customers, or a departing employee's activity log shows a bulk export",
    severity: "critical",
    involvedNodeIds: [
      "lead-crm",
      "customer-master",
      "data-warehouse",
      "cross-sell-audience",
      "agent-personal-phone",
    ],
    containment: [
      "Disable the account and every credential the person held, including any shared or service login.",
      "Establish what was exported and when from the system's own logs, rather than from what the person says.",
      "Suspend bulk export for the team while the scope is being established.",
      "Check whether the export reached a personal mailbox, a personal device or a cloud folder, and secure what you can reach.",
    ],
    thenWhat: [
      "Determine which customers are in the list and what fields it carried - a contact list is one thing, a list with balances, scores or arrears status is another.",
      "Warn the affected customers if the list enables targeted approaches against them, and tell them what to be careful of.",
      "Watch for the downstream effect - customers reporting approaches that quote their account details is usually the first real signal.",
      "Record what was taken, by whom and when, and preserve the logs before they age out.",
      "Review who else has the same export capability and why.",
    ],
    prevention:
      "Alert on bulk reads and exports rather than only on failed logins, cap what a single user can pull in one action, and re-certify export permissions on a schedule. Most of these lists are exported by people who genuinely needed a smaller one.",
  },
  {
    id: "i-statement-open-folder",
    title: "Bank statements sit in an open cloud folder",
    trigger: "Someone outside the team finds the folder, or a search engine surfaces a file",
    severity: "critical",
    involvedNodeIds: [
      "staff-download-folder",
      "financial-document-store",
      "statement-analysis",
      "data-warehouse",
    ],
    containment: [
      "Close the sharing link and restrict the folder immediately - before working out how it happened.",
      "Establish how long it was open and whether anything was accessed from outside, using whatever access history exists.",
      "Find the other folders. Where one exists, there are usually several, created for the same reason by the same team.",
      "Stop the practice that created it while the review runs, and give the team an alternative the same day.",
    ],
    thenWhat: [
      "List the customers whose statements were exposed, and what those statements reveal - salary, obligations, and every person they transfer money to.",
      "Consider the third parties in the transaction narrations, who are exposed too and have no relationship with you at all.",
      "Decide on customer communication, recording the decision and the reasoning.",
      "Delete the copies rather than re-securing them, unless a specific case genuinely needs them.",
      "Record what was exposed, for how long, and what could not be determined.",
    ],
    prevention:
      "Make the work possible inside the system so there is no reason to download. Block or log statement downloads and bulk exports, and check what is actually on team machines periodically rather than assuming the policy holds.",
    businessModels: LENDING,
  },
  {
    id: "i-collections-family",
    title: "A recovery agent calls the borrower's family and employer",
    trigger: "A complaint from the borrower, from a relative, or from an employer's HR desk",
    severity: "high",
    involvedNodeIds: [
      "collections-agency",
      "reference-contact-list",
      "collections-system",
      "call-recording-store",
      "disclosure-register",
    ],
    containment: [
      "Stop contact on the account immediately, including any parallel dialler campaign, while the facts are established.",
      "Pull the assignment: what data the agency was actually sent, and whether third-party contacts were included in it.",
      "Pull the call recordings and the visit log for the account and listen to them, rather than relying on the agent's account.",
      "Suspend the agent's access to the book pending review.",
    ],
    thenWhat: [
      "Contact the borrower and the third parties who were called, and confirm to them what has been stopped.",
      "Remove the third-party contacts from the assignment and from any list the agency still holds, and get that confirmed in writing.",
      "Review the collection notes on the account for characterisations that should not be there, and correct them.",
      "Check whether this is one agent or a pattern - the same assignment format usually goes to every agency.",
      "Record the incident, the complaint and what changed as a result.",
    ],
    prevention:
      "Do not put references, alternate contacts or family numbers into a collections assignment at all. Send the borrower's own contact details, require the work to happen inside a managed application with no export, and audit a sample of calls rather than waiting for the complaint.",
    businessModels: LENDING,
  },
  {
    id: "i-fraud-block-wrong",
    title: "The model blocks the wrong customer, repeatedly",
    trigger: "A customer complains for the third time, or a spike in blocks appears on one device type or one area",
    severity: "high",
    involvedNodeIds: [
      "fraud-platform",
      "decision-engine",
      "review-workstation",
      "support-console",
      "decision-log",
    ],
    containment: [
      "Lift the block on the affected customer while the cause is investigated, rather than after.",
      "Identify the signal that is firing and how many other customers it has caught.",
      "Check whether the affected group has something in common - a handset model, a shared household device, an area, a new app version.",
      "Where a rule is clearly misfiring, adjust its threshold or route it to manual review instead of leaving it to block.",
    ],
    thenWhat: [
      "Tell the affected customers what happened in terms they can use, and apologise for the interruption to their own money or credit.",
      "Mark every closed case as unsubstantiated rather than leaving an open flag that the next model will read as history.",
      "Check whether any of these customers were refused elsewhere on a signal that originated here, and correct what you reported.",
      "Record the false-positive rate before and after, so the fix is measurable rather than asserted.",
      "Review whether the human-review route existed and worked, since the complaint arriving three times suggests it did not.",
    ],
    prevention:
      "Monitor false positives as a first-class metric with an owner, keep a human review route with a stated response time, and never let a single device or behavioural signal be sufficient on its own for an adverse outcome.",
  },
  {
    id: "i-wrong-customer-doc",
    title: "One customer's documents are sent to another customer",
    trigger: "The recipient tells you — which is the only way this is ever found",
    severity: "high",
    involvedNodeIds: [
      "support-console",
      "ticketing-platform",
      "whatsapp-support-channel",
      "kyc-document-repository",
    ],
    containment: [
      "Ask the recipient to delete what they received and confirm it, treating them as a person doing you a favour.",
      "Where it went by a channel you control, recall or expire the link or attachment.",
      "Identify both customers, and check whether their records have been mixed as well as their documents.",
      "Check the agent's other recent interactions for the same error, because a mismatched search is rarely a single event.",
    ],
    thenWhat: [
      "Tell the customer whose documents were disclosed exactly what went where, without minimising it.",
      "Establish the cause: a wrong record opened, a shared phone number, two customers with the same name, or an attachment picked from the wrong ticket.",
      "Where two records were merged in error, unmerge them and correct anything derived from the merged view.",
      "Preserve the ticket, the chat thread and the audit trail before they are edited or closed.",
      "Record it, including whether the recipient's confirmation could actually be relied upon.",
    ],
    prevention:
      "Verify the customer against something they did not just tell you, show enough identifying detail on the screen for the agent to notice a mismatch, and stop sending documents over chat channels entirely - the convenience is exactly what causes this.",
  },
  {
    id: "i-video-kyc-exposed",
    title: "A video-KYC recording is exposed",
    trigger: "A vendor notification, an over-broad access review finding, or the recording surfacing where it should not be",
    severity: "critical",
    involvedNodeIds: ["video-kyc-platform", "kyc-document-repository", "vendor-residual-copies"],
    containment: [
      "Restrict the recording library immediately and revoke any sharing link.",
      "Establish who could reach it and who actually did, from the platform's own access history.",
      "Ask the vendor for a written account of scope and timing rather than a reassurance.",
      "Check whether the same access applies to the whole library or to one session.",
    ],
    thenWhat: [
      "Identify the customers whose sessions were exposed - a face, a voice, a document held to camera and the room behind them.",
      "Treat this as the most serious category in the file, because a face cannot be reissued the way a document number can.",
      "Tell the affected customers, and be specific about what a recording contains.",
      "Review whether the recordings needed to be retained at all, and delete those past their purpose as part of the response.",
      "Record the vendor's account, what you verified independently, and what you could not.",
    ],
    prevention:
      "Restrict the library to named reviewers with a recorded reason, set and enforce a retention period, and keep face data out of any model other than the identity check it was collected for.",
  },
  {
    id: "i-aa-retained",
    title: "Bank data is still being held after the consent expired",
    trigger: "An internal review, a customer asking why you still show their balance, or a vendor's report",
    severity: "high",
    involvedNodeIds: [
      "account-aggregator",
      "consent-record",
      "statement-analysis",
      "financial-document-store",
      "data-warehouse",
    ],
    containment: [
      "Stop any live fetch running against an expired or withdrawn consent.",
      "Establish which consents have lapsed and which data was pulled under them.",
      "Separate the raw statement data from the derived figures - they usually have different justifications and different fates.",
      "Freeze any downstream use of the affected data while scope is established.",
    ],
    thenWhat: [
      "Delete the raw data held beyond the consent, starting with applications that were refused.",
      "Check whether the expired data influenced any decision made after expiry, and review those decisions.",
      "Check the vendor's retention as well as your own, since the statement-analysis provider received the full file.",
      "Correct the consent record so its expiry is enforced automatically rather than watched manually.",
      "Record what was over-retained, for how long, and what was deleted.",
    ],
    prevention:
      "Enforce consent expiry in the system rather than in a policy, keep raw statements on a much shorter clock than derived figures, and default to deleting the raw file the moment the decision it supported is made.",
    businessModels: LENDING,
  },
  {
    id: "i-dsa-retains",
    title: "A partner is still holding applicants you refused",
    trigger: "A rejected applicant is approached by a different lender quoting details only your application had",
    severity: "high",
    involvedNodeIds: [
      "dsa-partner-portal",
      "dsa-agent-person",
      "rejected-application-archive",
      "vendor-residual-copies",
    ],
    containment: [
      "Suspend the partner's portal access while the facts are established.",
      "Establish what the partner holds and where - the portal, a spreadsheet, a personal device, a mailbox.",
      "Check the contract for what they were permitted to retain, and be honest internally if it does not say.",
      "Stop routing new applications to that partner in the meantime.",
    ],
    thenWhat: [
      "Get the retained data deleted and confirmed in writing, and sample rather than accept the confirmation at face value.",
      "Identify the applicants affected, most of whom are not your customers and have no reason to expect you to be in touch.",
      "Tell them what was held and by whom, since they are the ones receiving the approaches.",
      "Check whether other partners operate the same way, because the practice is usually structural rather than individual.",
      "Record the incident and the remediation, including what could not be verified.",
    ],
    prevention:
      "Make partner submission flow through a portal that keeps nothing on their side, contract explicitly for what may be retained and for how long with a confirmation step, and audit a sample of partners rather than relying on the clause.",
  },
  {
    id: "i-txn-exposed",
    title: "A dispute pack exposes transactions that had nothing to do with the dispute",
    trigger: "A merchant or the customer points out that the evidence shows more than the contested payment",
    severity: "high",
    involvedNodeIds: [
      "dispute-chargeback-system",
      "partner-bank-lender",
      "ticketing-platform",
      "support-console",
    ],
    containment: [
      "Establish exactly what was sent, to whom, and whether it can be withdrawn or replaced.",
      "Ask the recipient to delete the over-shared material and confirm.",
      "Stop the current evidence template from being used until it is narrowed.",
      "Check the other packs sent recently, since the template is the cause rather than the case.",
    ],
    thenWhat: [
      "Tell the customer what was disclosed beyond the disputed transaction - a payment history discloses relationships, not just amounts.",
      "Consider the payees and merchants in the disclosed rows, who are third parties with no involvement in the dispute.",
      "Check whether a risk note or label was applied to the customer as a by-product of raising the dispute, and remove it if so.",
      "Preserve the pack that was actually sent as evidence of scope.",
      "Record it, and note whether the recipient's deletion could be relied on.",
    ],
    prevention:
      "Build the evidence pack from the disputed transaction alone, redact surrounding rows by default rather than on request, and keep a dispute outcome structurally separate from a fraud finding in the data model.",
    businessModels: PAYMENTS,
  },
  {
    id: "i-branch-files-lost",
    title: "Branch files are missing from storage",
    trigger: "A file cannot be produced when it is needed — for an audit, a query or a recovery matter",
    severity: "high",
    involvedNodeIds: ["physical-kyc-file", "physical-warehouse", "branch-register"],
    containment: [
      "Establish what is actually missing, which usually means reconstructing from the register because the boxes are not indexed by customer.",
      "Secure the remaining storage and restrict who holds keys or access to the offsite facility.",
      "Ask the storage vendor for its movement and destruction records, and read them rather than accept a summary.",
      "Check whether the files were destroyed on schedule and simply not recorded, which is the most common answer.",
    ],
    thenWhat: [
      "Determine which customers' documents were in the missing files - identity photocopies, guarantee documents, security papers.",
      "Include the related parties, whose documents are in the same file and who will not think of themselves as affected.",
      "Decide on communication, recording the reasoning, and accept that with paper the honest answer often contains an unknown.",
      "Record what could not be established, rather than writing a conclusion the evidence does not support.",
      "Reconstruct what is needed operationally from digital sources where they exist.",
    ],
    prevention:
      "Index physical storage to the customer rather than to the box, so an access request can be answered and a loss can be scoped. Set a destruction schedule per record type and keep a certificate for each destruction rather than trusting that it happened.",
    businessModels: NBFC,
  },
];
