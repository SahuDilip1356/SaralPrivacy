// The curated 7 hotspots for a training institute, ranked worst-first. Buckets
// map to the training-institutes assessment pack (student_data_collection /
// communication_marketing / lms_vendor_platform / minor_parental_consent /
// retention_rights) - every bucket is reachable from the map. The signature
// exposure - children's data flowing through consumer channels - leads, because
// no other vertical in this series follows a minor through the flow.

import type { FlowHotspot } from "../../../data-flow/schemas.ts";

export const TRAINING_INSTITUTES_HOTSPOTS: FlowHotspot[] = [
  {
    id: "hs-whatsapp-minors",
    rank: 1,
    nodeId: "whatsapp",
    title: "Children's numbers and photos in open WhatsApp groups",
    whatHappens: "Batch and parent WhatsApp groups expose every student's and parent's mobile number to strangers, and photos of students - often minors - circulate and are reused for promotion.",
    whyItMatters: "For a minor this is the most sensitive exposure on the map: contact details and images sit in channels the institute cannot control, find or delete, and former students are rarely removed.",
    dataCategoryIds: ["parent-guardian", "contact", "photos-recordings", "student-identity"],
    action: "Move to managed broadcasts or a portal on official business accounts, separate parent and student channels, remove inactive members, and never post a child's photo, fees or marks in a group.",
    assessmentBucket: "minor_parental_consent",
  },
  {
    id: "hs-physical-file",
    rank: 2,
    nodeId: "physical-file",
    title: "Aadhaar and certificate photocopies kept forever",
    whatHappens: "The paper admission file collects ID proof, Aadhaar and marksheet photocopies by default and keeps them in an unlocked cabinet with no deletion schedule.",
    whyItMatters: "The most sensitive documents are over-collected and over-retained with no access control, so any breach or misuse reaches years of students at once.",
    dataCategoryIds: ["id-document", "student-identity", "education-eligibility"],
    action: "Use a document-requirement checklist, avoid Aadhaar unless genuinely needed, secure the files, and destroy documents on a defined schedule.",
    assessmentBucket: "student_data_collection",
  },
  {
    id: "hs-proctoring",
    rank: 3,
    nodeId: "proctoring",
    title: "Proctoring captures a child's face, voice and room",
    whatHappens: "Online-exam proctoring records webcam video, microphone audio, screen and browser activity, and produces automated 'suspicious behaviour' flags - frequently for minors.",
    whyItMatters: "It captures far more than an exam answer, stores it on a vendor platform the institute does not control, and its automated flags can be wrong and impossible for the student to challenge.",
    dataCategoryIds: ["photos-recordings", "behavioural-derived", "student-identity"],
    action: "Use the least intrusive assessment that works, document exactly what proctoring captures and for how long, keep human review, and delete raw recordings once the result is final.",
    assessmentBucket: "lms_vendor_platform",
  },
  {
    id: "hs-ai-profiling",
    rank: 4,
    nodeId: "ai-personalisation",
    title: "AI profiles learners without them seeing it",
    whatHappens: "AI infers weak topics, predicts dropout and recommends content, creating new profiles of the learner - many of them minors - that the student never sees and cannot correct.",
    whyItMatters: "Invisible profiling drives recommendations and interventions, may be reused to train vendor models, and turns behavioural data into decisions about a child with no transparency.",
    dataCategoryIds: ["behavioural-derived", "assessment-performance", "student-identity"],
    action: "Keep a derived-data register, explain significant profiling, retain human oversight, restrict training use, and let the student correct the source data.",
    assessmentBucket: "lms_vendor_platform",
  },
  {
    id: "hs-biometric-minors",
    rank: 5,
    nodeId: "biometric-device",
    title: "Biometric attendance of children",
    whatHappens: "A fingerprint or face scanner marks attendance, capturing the biometrics of students who are often minors, kept with no defined retention.",
    whyItMatters: "Biometrics are collected for a task a register would solve, are stored indefinitely, and belong to children who cannot consent - the parent must, verifiably.",
    dataCategoryIds: ["attendance", "student-identity"],
    action: "Use the least intrusive attendance method that works; if biometrics are truly needed, define purpose and retention and take verifiable parental consent.",
    assessmentBucket: "minor_parental_consent",
  },
  {
    id: "hs-placement-employer",
    rank: 6,
    nodeId: "placement-portal",
    title: "Placement profiles sent to employers without confirmation",
    whatHappens: "The placement cell shares CVs and profiles with many employers and internship partners, often without confirming each opportunity with the student.",
    whyItMatters: "Learner data leaves the institute to third parties with no processing contract, no record of who received what, and no way to withdraw it.",
    dataCategoryIds: ["student-identity", "contact", "placement-employability"],
    action: "Confirm each employer share with the student, log every transfer, share only what the role needs, and set retention expectations with the employer.",
    assessmentBucket: "communication_marketing",
  },
  {
    id: "hs-old-records",
    rank: 7,
    nodeId: "old-records",
    title: "No retention schedule - and deletion never reaches everything",
    whatHappens: "Admission files, results, recordings, alumni lists, analytics and backups are kept indefinitely, and deleting a student from one system misses the copies in the others.",
    whyItMatters: "The institute cannot say where every copy of a former student's data is, keeps it forever by default, and cannot honour a deletion request that must reach vendors, backups and analytics.",
    dataCategoryIds: ["student-identity", "education-eligibility", "assessment-performance"],
    action: "Set record-specific retention, wipe old devices, remove former-staff access, and build a deletion path that reaches vendors, backups and the analytics warehouse.",
    assessmentBucket: "retention_rights",
  },
];
