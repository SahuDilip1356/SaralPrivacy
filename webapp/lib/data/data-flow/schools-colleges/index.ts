// Schools & Colleges Personal Data Flow pack - assembled config.
// Spec: docs/SaralPrivacy_SchoolsColleges_DataFlow_Spec.md.
// Same presentation framework as recruitment, CA, training institutes, D2C and
// clinics; only content differs.
//
// THREE operating models (K-12 school / college / integrated multi-campus) are
// genuine, different data journeys - not cosmetic filters. A K-12 school runs a
// bus fleet and has no placement cell; a degree college runs hostels, online
// proctoring and placements and has no school transport; a multi-campus group
// runs both and adds a central warehouse that scores children across branches.
//
// SCHOOL is the DEFAULT (it is what most people searching this actually run, and
// it drives the /data-mapping card stats). INTEGRATED is the SUPERSET - it
// appears in every gated tag and renders the full union. Default therefore does
// NOT equal superset here, which is the D2C pattern rather than the clinics one.
//
// The STAGE SPINE is model-gated (12 / 13 / 15 stages), following recruitment
// and clinics. See stages.ts.
//
// LANGUAGE LOCK: "high-impact student data", never "sensitive personal data" -
// the DPDPA creates no such statutory category. DPDPA scope only: no claims
// about what an education board, university or regulator requires to be
// retained, and no legal advice.
//
// FIRST PACK to author the optional `rightsScenarios` and `incidentScenarios`
// sections. Those are SHARED, opt-in engine capabilities (lib/data-flow/
// schemas.ts) rather than anything specific to this industry - any of the other
// eleven maps adopts them by authoring content, with no code change.

import type { DataFlowPack } from "../../../data-flow/schemas.ts";
import { SCHOOLS_COLLEGES_STAGES } from "./stages.ts";
import { SCHOOLS_COLLEGES_DATA_CATEGORIES } from "./data-categories.ts";
import { SCHOOLS_COLLEGES_PERSONAS } from "./personas.ts";
import { SCHOOLS_COLLEGES_NODES } from "./nodes.ts";
import { SCHOOLS_COLLEGES_EDGES } from "./edges.ts";
import { SCHOOLS_COLLEGES_HOTSPOTS } from "./hotspots.ts";
import {
  SCHOOLS_COLLEGES_INCIDENT_SCENARIOS,
  SCHOOLS_COLLEGES_RIGHTS_SCENARIOS,
} from "./scenarios.ts";

export const schoolsCollegesDataFlowPack: DataFlowPack = {
  industry: "schools-colleges",
  title: "School & College Student Data Flow Map",
  mainActor: "Student",
  businessModels: [
    { id: "school", label: "School - K-12" },
    { id: "college", label: "College / higher education" },
    { id: "integrated", label: "Integrated multi-campus institution" },
  ],
  lexicon: {
    subject: "student",
    subjectArtefact: "One student's record",
    // "institution" so the copy reads correctly for a K-12 school, a degree
    // college and a multi-campus trust alike.
    org: "institution",
  },
  boundaryLabels: {
    // The guardian sits on the student's side of the line while the student is a
    // minor - see personas.ts for why that stops being true at 18.
    candidate: "The student & guardian",
    agency: "Your institution",
    client: "Employers & partners",
    vendor: "EdTech & service vendors",
    government: "Boards, universities & regulators",
    "third-party": "Others who receive it",
    public: "Publicly visible",
  },
  presentation: {
    eyebrow: "Schools & Colleges",
    h1: "One student. Many systems. One institution's responsibility.",
    intro:
      "Follow one student's information through enquiry, admission, the school ERP, classroom platforms, attendance, cameras, transport, hostels, health and counselling records, examinations, fees, board submissions, placements, public photographs and long-term archives - and count every place it ends up, and where you lose control of it.",
    metaTitle: "School & College Student Data Flow Map | SaralPrivacy",
    metaDescription:
      "See how student and parent data moves through admissions, school ERP, LMS platforms, attendance, CCTV, transport GPS, examinations, placements and archives - and where DPDPA risk appears for a school or college.",
    ogTitle: "Where does one student's data go? - School & College Data Flow Map",
    ogDescription:
      "Follow student and parent information across academic, monitoring, transport, communication, examination, placement and archive systems, in three education operating models.",
    breadcrumbLabel: "Schools & Colleges",
    previewBlurb:
      "Before you fix anything, see the problem. One student's data moves through an admission counsellor's WhatsApp, a school ERP, a parent app, learning platforms nobody approved, a fingerprint reader, a bus tracker, a counsellor's notebook, a public Instagram post and years of backups.",
    howToRead: [
      {
        title: "Pick your model",
        body: "Switch between School - K-12, College / higher education and Integrated multi-campus institution to see the journey each kind of institution actually runs. This is not a filter over one journey - a school runs bus routes and has no placement cell, a college runs hostels, online proctoring and placements and no school transport, and a multi-campus group runs both and adds central analytics over every branch. The stage count and the place-counter recalculate for the model you choose.",
      },
      {
        title: "When it leaves you",
        body: "A violet left edge and a tag mark everything outside your institution - EdTech and ERP vendors, the camera and attendance suppliers, the transport contractor and their drivers, the examination board or affiliating university, scholarship authorities, employers receiving CVs, event photographers, ad platforms, and anything published where the public can see it. Once data lands there your control is indirect: it runs through your contract and instructions, not your admin panel. Risk is shown separately, as an amber or red fill - so an outside system can be low risk, and a teacher's own laptop can be one of the worst things on the page.",
      },
      {
        title: "Where control breaks",
        body: "Red flags mark the hotspots - the eight places schools and colleges most often lose control of student data, from one admission signature standing in for a decade of permissions, to a child's photograph becoming marketing, to a student who left years ago still sitting in every system. Tap any system to see what it holds and how to fix it.",
      },
    ],
    ctaHeading: "Now check whether your controls hold up",
    ctaBody:
      "The map shows where student and parent data travels in a typical school or college. The 3-minute readiness scan checks whether your institution has the controls that matter at each hotspot - and the Discovery tool builds your own data inventory.",
    ctaButton: "Take the school & college risk scan",
  },
  disclaimer:
    "This is a reference model of a typical school, college or campus group - not a scan of your systems, and not legal advice or a student-record retention schedule. Your own flow may have fewer or more stops depending on how you operate.",
  assessmentRoute: "/assessment/schools-colleges",
  // Bucket keys of lib/data/industry-assessment/packs/schools-colleges.ts.
  // The pack test asserts each one still exists there (drift guard).
  assessmentBuckets: [
    "student_parent_data",
    "children_consent",
    "monitoring_safety_systems",
    "learning_vendor_platform",
    "retention_sharing_rights",
  ],
  // A real niche in lib/discovery/data.generated.ts. `colleges`,
  // `playschools-daycare` and `school-transport` exist there too; `schools` is
  // the sector's primary name and matches the default operating model.
  discoveryNicheId: "schools",
  stages: SCHOOLS_COLLEGES_STAGES,
  dataCategories: SCHOOLS_COLLEGES_DATA_CATEGORIES,
  personas: SCHOOLS_COLLEGES_PERSONAS,
  nodes: SCHOOLS_COLLEGES_NODES,
  edges: SCHOOLS_COLLEGES_EDGES,
  hotspots: SCHOOLS_COLLEGES_HOTSPOTS,
  rightsScenarios: SCHOOLS_COLLEGES_RIGHTS_SCENARIOS,
  incidentScenarios: SCHOOLS_COLLEGES_INCIDENT_SCENARIOS,
};

export default schoolsCollegesDataFlowPack;
