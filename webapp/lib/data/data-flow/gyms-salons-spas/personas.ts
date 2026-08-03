// Everyone who can read the customer's data at some point in the journey -
// inside the business, at a partner, at a vendor and outside all of them.
//
// Two entries carry the sector's second signature (spec §3): the trainer, the
// stylist and the therapist ARE the relationship. The customer follows the
// person, not the premises - so the person's own phone, notebook and WhatsApp
// threads are where the realest customer record lives, and when they move to
// the business down the road, it moves with them. These personas describe what
// each role can SEE, not what any role does wrong.
//
// `family-companion` is the quiet one: the emergency contact, the guardian who
// signed a minor's form, the partner on a couple booking, the gift-voucher
// sender. None of them bought anything for themselves, and almost none was
// given a notice.
//
// ⛔ No accusation (spec §8). WhatsApp booking, a stylist's own client
// relationships and a franchise's shared CRM are how this trade works. The
// point is where control breaks, not that the work is illegitimate.

import type { FlowPersona } from "../../../data-flow/schemas.ts";

export const GYMS_SALONS_SPAS_PERSONAS: FlowPersona[] = [
  // ---- The people whose data this is --------------------------------------
  {
    id: "customer",
    name: "Customer / member",
    boundary: "candidate",
    description:
      "The data principal. Books, declares their health, is measured, photographed and messaged - and is the only person in this list who cannot see most of what is held about them.",
  },
  {
    id: "family-companion",
    name: "Emergency contact, guardian or companion",
    boundary: "candidate",
    description:
      "A separate data principal inside somebody else's record: the emergency contact, the parent of a minor member, the partner on a couple booking, the gift-voucher sender. Stored as fields, not as people.",
  },

  // ---- Inside the business ------------------------------------------------
  {
    id: "front-desk",
    name: "Front desk & reception",
    boundary: "agency",
    description:
      "Takes the enquiry, files the forms, answers the WhatsApp, runs the billing. Routinely able to read health declarations and every profile in the software - usually on one shared login.",
  },
  {
    id: "trainer-coach",
    name: "Trainer & fitness coach",
    boundary: "agency",
    description:
      "Measures the member, writes the programme, tracks the progress, takes the progress photo. Holds the deepest body data in the building - and often the member's number in a personal phone.",
  },
  {
    id: "stylist-beautician",
    name: "Stylist & beautician",
    boundary: "agency",
    description:
      "Runs the consultation, keeps the formula, delivers the service, shoots the before-and-after. The client relationship is personal - and so, usually, are the phone and the notebook it lives in.",
  },
  {
    id: "therapist",
    name: "Therapist & wellness staff",
    boundary: "agency",
    description:
      "Reads the health intake, writes the treatment plan and the session notes. Works in the one setting where customers most expect discretion - with records that move through reception and group chats.",
  },
  {
    id: "manager-owner",
    name: "Owner & branch manager",
    boundary: "agency",
    description:
      "Runs the business, reads the reports, approves the campaigns. Can usually open anything - and in a small business, is also the incident response, the DPO and the IT department.",
  },
  {
    id: "marketing-social",
    name: "Marketing & social-media staff",
    boundary: "agency",
    description:
      "Builds the broadcast lists, drafts the posts, picks the before-and-after pairs for Instagram. Works from the photo gallery and the customer list, usually with no record of who consented to what.",
  },

  // ---- Partners, freelancers and vendors ----------------------------------
  {
    id: "freelancer",
    name: "Freelance artist & home-service staff",
    boundary: "third-party",
    description:
      "The makeup artist, bridal specialist or home-service professional booked for the event. A separate business that receives the customer's address, consultation notes and photographs on its own devices.",
  },
  {
    id: "photographer",
    name: "Photographer & videographer",
    boundary: "third-party",
    description:
      "Shoots the bridal album, the transformation reel, the studio content. Keeps the raw files under their own rules, long after the event - and sometimes in their own portfolio.",
  },
  {
    id: "franchise-staff",
    name: "Franchisee & other-branch staff",
    boundary: "third-party",
    description:
      "A separate legal business running the same brand. Through the shared platform it can see customers it has never served - and it keeps its own copy of the ones it has.",
  },
  {
    id: "agency-social-manager",
    name: "Marketing agency & social-media manager",
    boundary: "third-party",
    description:
      "Runs the pages and the campaigns from outside. Holds a CRM export, the photo folder and the account passwords - and works for several businesses at once.",
  },
  {
    id: "corporate-hotel",
    name: "Hotel concierge & corporate coordinator",
    boundary: "client",
    description:
      "Refers the guest or administers the employer's wellness programme. Sends bookings in and expects reports back - reports that should carry billing, not treatment detail.",
  },
  {
    id: "wellness-referrer",
    name: "Nutritionist, physiotherapist & referral partner",
    boundary: "third-party",
    description:
      "Receives the referred customer and a treatment summary. A separate practice whose copy of the health concern the business can request deleted, but never reach.",
  },
  {
    id: "vendor-support",
    name: "App, device & platform vendor staff",
    boundary: "vendor",
    description:
      "Booking app, membership software, body-analysis device, CCTV and messaging platform providers. Support engineers can usually see live customer data while fixing a ticket.",
  },
  {
    id: "authority",
    name: "Police & authorities",
    boundary: "government",
    description:
      "Receives CCTV footage or records after an incident, on request. Once data is here it is no longer the business's to correct or delete, and that has to be said plainly.",
  },
];
