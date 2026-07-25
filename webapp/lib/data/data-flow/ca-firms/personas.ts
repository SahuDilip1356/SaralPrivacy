// People who touch client data in a CA firm. Rendered in node detail panels as
// access lists. The Article Assistant is the CA-specific role and structurally
// the highest-risk accessor: broad access to everything, trainee status, and
// annual turnover by design.

import type { FlowPersona } from "../../../data-flow/schemas.ts";

export const CA_FIRMS_PERSONAS: FlowPersona[] = [
  { id: "client", name: "Client", boundary: "candidate", description: "The data principal - the individual whose financial life this map follows." },
  { id: "partner", name: "Partner", boundary: "agency", description: "The signing CA; owns the client relationship and, usually, the DSC token." },
  { id: "ca", name: "Chartered accountant", boundary: "agency", description: "Prepares and reviews returns, computations and filings." },
  { id: "article-assistant", name: "Article assistant", boundary: "agency", description: "Trainee with broad access to client documents; a new cohort arrives and leaves every year." },
  { id: "accountant", name: "Accountant / data-entry staff", boundary: "agency", description: "Enters transactions into Tally/Busy and handles day-to-day documents." },
  { id: "it-support", name: "IT support", boundary: "agency", description: "Manages devices, drives, backups and portal logins - broad technical access." },
  { id: "client-business", name: "Client business contact", boundary: "client", description: "The client company's HR/finance contact, who supplies employee payroll data." },
  { id: "statutory-auditor", name: "Statutory auditor", boundary: "third-party", description: "Receives financial records for audit without a processing contract." },
];
