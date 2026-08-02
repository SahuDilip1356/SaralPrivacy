// People who touch client and matter data in a law firm. Rendered in node
// detail panels as access lists.
//
// The structurally interesting roles here are the ones with broad access and no
// permanence: interns and trainees who see whole matters for a few months, and
// clerks and typists who handle every file in the office without ever being
// thought of as having "access" to anything.
//
// `opposing-counsel` is a persona precisely because in this sector the other
// side is a DESIGNED recipient, not a leak. That is what makes this map
// different from every other one in the series.

import type { FlowPersona } from "../../../data-flow/schemas.ts";

export const LAW_FIRMS_PERSONAS: FlowPersona[] = [
  {
    id: "client",
    name: "Client",
    boundary: "candidate",
    description: "The data principal - the person whose matter file this map follows.",
  },
  {
    id: "client-contact",
    name: "Client's authorised representative",
    boundary: "client",
    description: "The in-house counsel, HR or finance contact who instructs on a corporate client's behalf and supplies other people's records.",
  },
  {
    id: "partner",
    name: "Partner",
    boundary: "agency",
    description: "Owns the client relationship and the matter. Usually holds the widest access in the firm and the fewest restrictions on it.",
  },
  {
    id: "associate",
    name: "Associate / junior advocate",
    boundary: "agency",
    description: "Does most of the day-to-day work on the file, and keeps most of the working copies - on a laptop, in email, in print.",
  },
  {
    id: "paralegal",
    name: "Paralegal / legal executive",
    boundary: "agency",
    description: "Assembles documents, indexes evidence and prepares bundles - handling the whole file rather than parts of it.",
  },
  {
    id: "intern",
    name: "Intern / trainee",
    boundary: "agency",
    description: "Broad access to live matters for a few months, then gone. A new cohort arrives every term and access is rarely reviewed on the way out.",
  },
  {
    id: "clerk",
    name: "Clerk",
    boundary: "agency",
    description: "Runs the diary, the filing counter and the physical file movement. Handles every matter in the office and is seldom counted as an accessor.",
  },
  {
    id: "typist",
    name: "Typist / transcription staff",
    boundary: "agency",
    description: "Turns dictation and handwritten notes into documents - often the first person to type the matter's most sensitive facts.",
  },
  {
    id: "accounts-staff",
    name: "Accounts & billing staff",
    boundary: "agency",
    description: "Reads time narratives and expense receipts for every matter in the firm, including ones they have no other reason to see.",
  },
  {
    id: "it-admin",
    name: "IT / DMS administrator",
    boundary: "agency",
    description: "Manages devices, the document system, backups and portal logins - technically able to reach every matter.",
  },
  {
    id: "external-counsel-role",
    name: "External & senior counsel",
    boundary: "third-party",
    description: "Briefed advocates and senior counsel who receive the file to argue or advise, usually without a processing contract.",
  },
  {
    id: "expert-role",
    name: "Experts, valuers & consultants",
    boundary: "third-party",
    description: "Medical, forensic, technical and valuation specialists who receive records to form an opinion, and keep them afterwards.",
  },
  {
    id: "vendor-staff",
    name: "Legal-tech & service vendor staff",
    boundary: "vendor",
    description: "Data-room, e-discovery, transcription and translation providers processing matter content on the firm's instructions.",
  },
  {
    id: "opposing-counsel-role",
    name: "The other side & their advisors",
    boundary: "third-party",
    description: "Opposing counsel, counterparties and their advisors - designed recipients of the material, not accidental ones.",
  },
  {
    id: "court-staff",
    name: "Court, registry & regulator staff",
    boundary: "government",
    description: "Registry clerks, tribunal staff and regulator officers who receive filings into systems with their own publication rules.",
  },
];
