// People who touch patient data in a clinic or diagnostic lab. Rendered in the
// node detail panels as access lists.
//
// Four of these are not the practice's staff at all: the family member who
// receives a report, the referring doctor who keeps access long after the
// episode ends, the TPA coordinator processing a claim, and the vendor engineer
// who can reach the laboratory system remotely. Those four are where "who can
// see this?" stops having an answer the practice controls.

import type { FlowPersona } from "../../../data-flow/schemas.ts";

export const CLINICS_DIAGNOSTIC_LABS_PERSONAS: FlowPersona[] = [
  {
    id: "patient",
    name: "Patient",
    boundary: "candidate",
    description: "The data principal - one person whose identity, symptoms, results and images this map follows. Everything below is a copy, an observation or an inference drawn from that.",
  },
  {
    id: "family-member",
    name: "Family member or caregiver",
    boundary: "third-party",
    description: "A spouse, parent, adult child or attendant who books, pays for or collects a report. Frequently treated as having blanket permission simply because they answered the phone.",
  },
  {
    id: "reception-staff",
    name: "Reception & front desk",
    boundary: "agency",
    description: "Takes bookings, registers patients, handles the register and the phone, and hands over reports. Hears symptoms before any record exists and often sees more clinical detail than the role needs.",
  },
  {
    id: "doctor",
    name: "Doctor / consultant",
    boundary: "agency",
    description: "Consults, diagnoses, prescribes and refers. Usually holds the broadest clinical access in the practice, and often keeps working copies on a personal laptop.",
  },
  {
    id: "nurse",
    name: "Nursing & clinical assistant",
    boundary: "agency",
    description: "Records vitals, assists procedures and prepares patients. Sees clinical history at the point of care across many patients in a day.",
  },
  {
    id: "lab-technician",
    name: "Laboratory technician",
    boundary: "agency",
    description: "Runs samples on analysers, maintains worksheets and enters results. Works across instruments and shared workstations where logins are often shared too.",
  },
  {
    id: "phlebotomist",
    name: "Phlebotomist / collection staff",
    boundary: "agency",
    description: "Draws and labels samples at a collection desk or in the patient's home - the one role that routinely carries patient identity, address and test detail outside the premises.",
  },
  {
    id: "pathologist",
    name: "Pathologist / radiologist",
    boundary: "agency",
    description: "Validates results, interprets images and signs reports - increasingly from outside the laboratory through a remote-reporting portal.",
  },
  {
    id: "billing-staff",
    name: "Billing & finance",
    boundary: "agency",
    description: "Raises invoices, takes payment and files insurance claims. Regularly sees diagnoses and procedures because the claim carries them.",
  },
  {
    id: "it-admin",
    name: "IT & systems administrator",
    boundary: "agency",
    description: "Administers the clinical and laboratory systems, backups and user accounts. Can reach every record, and is usually the only person who can prove who else did.",
  },
  {
    id: "referring-doctor",
    name: "Referring doctor or hospital",
    boundary: "client",
    description: "Orders the test or receives the referral, and keeps a copy of the report. Portal access granted for one episode very often stays live indefinitely.",
  },
  {
    id: "tpa-coordinator",
    name: "Insurer, TPA & corporate coordinator",
    boundary: "third-party",
    description: "Processes claims, pre-authorisations and corporate health-check results. A separate controller: the practice cannot administer, audit or delete from their systems.",
  },
  {
    id: "vendor-staff",
    name: "Software, device & AI vendor staff",
    boundary: "vendor",
    description: "Support engineers for the clinical system, laboratory system, imaging archive, analysers and AI tools - typically with remote access that can reach live patient records.",
  },
];
