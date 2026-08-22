// ─────────────────────────────────────────────────────────────────────────────
// SaralPrivacy — workflow risks · the evidence behind the risk map (S3)
//
// The homepage's risk map names ten everyday tools and puts a gold gap label on
// each. The gap label is a claim; this file is the working behind it — what
// personal data is typically in that tool, how it typically goes wrong, and the
// control that typically closes it.
//
// ⛔ WHAT THIS FILE IS NOT
// It is not measured data. There are no percentages, no counts, no "X% of
// Indian SMBs" — we have not run that study, and a fabricated statistic is
// worth less than the plain description it would replace. Every line here is a
// description of a workflow, written the way a practitioner would describe it
// to a client, and every one of them is checkable against the reader's own
// business in about ten seconds. That is the strongest form of proof available
// to us right now, and it happens to also be the honest one.
//
// These are COMMON WORKFLOWS, never claimed as integrations — SaralPrivacy does
// not connect to any of these tools, and the section says so out loud.
//
// This array is also the map's ORDER and its gap labels — WhereRiskHides
// renders straight off it and supplies only the icons. The tool list used to
// live in the component and the evidence beside it, which is a join, and a join
// between two hand-maintained arrays is a drift waiting to happen.
//
// `lifecycle` must be one of the six Privacy Thread nodes rendered in
// WhereRiskHides (Collect · Use · Share · Store · Retain · Delete). Selecting a
// tool lights that node, which is the whole point of having a lifecycle motif:
// the reader sees WHERE in the life of their data the gap actually sits.
// ─────────────────────────────────────────────────────────────────────────────

export type LifecycleStage =
  | "Collect"
  | "Use"
  | "Share"
  | "Store"
  | "Retain"
  | "Delete";

export interface WorkflowRisk {
  /** Display name, and the key WhereRiskHides maps to a lucide icon. */
  tool: string;
  /** The gold label on the map. One word of what is missing, not a severity. */
  gap: string;
  /** Which Privacy Thread node lights up when this tool is selected. */
  lifecycle: LifecycleStage;
  /** What personal data is typically sitting in this tool. */
  dataFound: string;
  /** How it typically goes wrong. */
  exposure: string;
  /** The control that closes it — practical, and doable without us. */
  control: string;
}

export const WORKFLOW_RISKS: WorkflowRisk[] = [
  {
    tool: "WhatsApp",
    gap: "Consent gap",
    lifecycle: "Collect",
    dataFound:
      "Customer and candidate names, phone numbers, and photographs of documents (PAN cards, Aadhaar, prescriptions, invoices) sent into ordinary chats and groups.",
    exposure:
      "Data is collected with no notice and no recorded consent, on personal handsets the business does not control, and it stays on those handsets after the staff member leaves.",
    control:
      "Keep WhatsApp for conversation, not for documents. Move anything that collects personal data to a channel that can show a notice and record a consent.",
  },
  {
    tool: "Google Drive",
    gap: "Access gap",
    lifecycle: "Use",
    dataFound:
      "Shared folders of CVs, ID scans, salary sheets and client files, usually inherited from whoever set them up years ago.",
    exposure:
      "Links set to “anyone with the link”, and access lists that only ever grow: people are added when a project starts and never removed when it ends.",
    control:
      "Review folder access on a fixed schedule, convert open links to named access, and make removing access part of every exit checklist.",
  },
  {
    tool: "Excel / Sheets",
    gap: "Retention gap",
    lifecycle: "Retain",
    dataFound:
      "Master trackers of customers, candidates or patients, copied and re-copied as “final_v3” across desktops, mailboxes and pen drives.",
    exposure:
      "No one owns the copies, so nothing is ever deleted. A single tracker outlives the purpose it was collected for by years, and no one can say how many versions exist.",
    control:
      "Name one system of record per data set, set a retention period against it, and delete the working copies on a schedule rather than on request.",
  },
  {
    tool: "CRM / software",
    gap: "Vendor gap",
    lifecycle: "Share",
    dataFound:
      "The full customer record (contact details, transaction history, internal notes, support conversations), held on your behalf by a third-party processor.",
    exposure:
      "Signed on click-through terms with no data-processing clause, no breach-notification commitment, and no clear answer to where the data is actually stored.",
    control:
      "Keep a vendor register, add processing terms at the next renewal, and require breach notice to you within a fixed window.",
  },
  {
    tool: "Email inboxes",
    gap: "Access gap",
    lifecycle: "Store",
    dataFound:
      "Years of attachments (offer letters, KYC documents, invoices, lab reports) sitting in individual mailboxes as the de facto filing system.",
    exposure:
      "Shared credentials, auto-forwarding rules and delegate access mean the real reach of that data is much wider than the org chart, and invisible to any review.",
    control:
      "End shared mailbox credentials, audit forwarding and delegation, and stop using the inbox as a document store.",
  },
  {
    tool: "Website forms",
    gap: "Notice gap",
    lifecycle: "Collect",
    dataFound:
      "Enquiry and contact submissions: name, phone, city, and free text in which people describe a personal situation in far more detail than the form asked for.",
    exposure:
      "The form collects before it explains: no notice at the point of collection, consent bundled into the submit button, and entries emailed onward in plain text.",
    control:
      "Put an itemised notice at the form itself, separate consent from submission, and route entries to one controlled destination instead of a mailing list.",
  },
  {
    tool: "Payment tools",
    gap: "Vendor gap",
    lifecycle: "Share",
    dataFound:
      "Payer name, contact details and transaction records held by the gateway, plus the reconciliation exports finance pulls out of it every month.",
    exposure:
      "Those exports leave the gateway's controls and land in shared drives, and nobody has checked what the gateway itself retains or which sub-processors it uses.",
    control:
      "Reconcile inside the tool where you can, restrict who can export, and record the gateway and its sub-processors in your vendor register.",
  },
  {
    tool: "CCTV / footage",
    gap: "Evidence gap",
    lifecycle: "Store",
    dataFound:
      "Continuous recording of staff, customers and visitors, plus the visitor register at the entrance, which is personal data on paper.",
    exposure:
      "No signage saying what is recorded or for how long, retention set to whatever the disk holds, and playback available to anyone who knows the DVR password.",
    control:
      "Post a notice where the camera can see, fix a retention window and enforce it on the device, and restrict playback to named people.",
  },
  {
    tool: "Old archives",
    gap: "Retention gap",
    lifecycle: "Delete",
    dataFound:
      "Boxes of forms and old server folders from closed projects, discontinued products and former employees, kept because nobody was ever asked to decide.",
    exposure:
      "Data held with no purpose left to justify it. This is the hardest position to defend under DPDPA: there is no live reason to have it, and no plan to remove it.",
    control:
      "Inventory what is there, delete what has no live purpose, and bring the rest under the same retention rules as your live data.",
  },
  {
    tool: "Third-party vendors",
    gap: "Vendor gap",
    lifecycle: "Share",
    dataFound:
      "Personal data handed to payroll providers, staffing agencies, marketing agencies, diagnostic labs, couriers and IT contractors.",
    exposure:
      "Handoffs happen over email and chat with no contract clause, no record of what was shared, and no obligation on the other side to delete it afterwards.",
    control:
      "List every party you share with, add processing and deletion terms to each, and keep a record of what was shared and when.",
  },
];

/** Lookup by the tool name used in the risk map. */
export function getWorkflowRisk(tool: string): WorkflowRisk | undefined {
  return WORKFLOW_RISKS.find((r) => r.tool === tool);
}
