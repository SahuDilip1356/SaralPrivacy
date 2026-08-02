// The eight hotspots for a hotel, travel agency or hospitality group, ranked
// worst-first.
//
// THE COUNT IS DERIVED, NOT CHOSEN (spec §3). Ten of the sixteen stages are
// all-model; eight of them carry a hotspot, and every hotspot node is UNGATED
// with its EARLIEST stage on that distinct all-model stage:
//
//   1 id-document-store ....... identity-documents (5)  5 guest-profile-system ..... reservation (3)
//   2 partner-vendor-network .. service-delivery (12)   6 movement-access-trail .... monitoring (11)
//   3 guest-history-archive ... archive (16)            7 guest-document-pack ...... pre-arrival (9)
//   4 booking-channel-platform  enquiry (1)             8 loyalty-marketing-platform loyalty-marketing (15)
//
// ⇒ flags = 8 = counter in hotel, travel-agency and integrated, by arithmetic
// rather than by anyone checking. See nodes.ts for why this matters and the
// `hotspots reconcile with the counter` guard test for what happens if it stops
// being true.
//
// The pasted spec proposed 10 + 11 + 12 per-variant hotspots. The counter and
// legend print `pack.hotspots.length`, pack-level and unfiltered, so a per-model
// set would make the counter lie in every view but one. The other twenty-five
// are authored as high- and critical-risk NODES instead - they render in full in
// the journey, the drawer and the table, they simply carry no red flag (spec §3).
//
// Buckets map to lib/data/industry-assessment/packs/hotels-travel.ts. All FIVE
// of the pack's buckets are reachable from this rail, and every one of them must
// also appear in the assessment client's BUCKET_FOCUS or the deep-link guard
// test fails.
//
// RANK 1 IS THE SECTOR'S SIGNATURE. No other business in this series is handed a
// government identity document as a routine condition of service, by every
// customer, at scale, over WhatsApp - and then keeps it for years because nobody
// decided otherwise.
//
// LANGUAGE LOCK (spec §5): custody and control, never an accusation. Collecting
// an ID at check-in and briefing a guide on WhatsApp are how this industry
// works. No immigration, visa, travel-safety or hospitality-regulatory advice.

import type { FlowHotspot } from "../../../data-flow/schemas.ts";

export const HOTELS_TRAVEL_HOTSPOTS: FlowHotspot[] = [
  {
    id: "hs-id-documents",
    rank: 1,
    nodeId: "id-document-store",
    title: "Passports arrive on WhatsApp and are still there years later",
    whatHappens:
      "Passport and visa pages, photographs and ID cards come in as images and email attachments, get saved to a folder, scanned again at the desk, downloaded to a laptop to attach to a supplier email, printed for the file and backed up overnight.",
    whyItMatters:
      "It is the highest-impact collection in the sector, and it exists in five places at once because it was never collected through one. Long after the guest has gone, a copy of their passport is still sitting in a folder nobody owns - and no one in the business can say how many copies there are.",
    dataCategoryIds: ["identity-documents", "guest-identity", "companion-family", "payment-financial"],
    action:
      "Collect through one secure upload link, keep one folder per booking with named access, record that the document was checked instead of keeping a full copy wherever that is enough, and delete the scans on a clock once the stay or trip has closed.",
    assessmentBucket: "id_passport_travel_document",
  },
  {
    id: "hs-partner-network",
    rank: 2,
    nodeId: "partner-vendor-network",
    title: "Every guide, driver and vendor gets the whole list because it is quicker",
    whatHappens:
      "Guides, excursion and safari operators, event vendors, photographers, spa and restaurant partners and transfer drivers are each sent what they need to do the job - which in practice is the entire party list, with names, numbers, ages, room allocations and dietary and medical notes, forwarded into a WhatsApp group.",
    whyItMatters:
      "The guest file is broken up and handed to a long tail of small independent operators, none of whom has a contract, a retention rule or any reason to delete anything. When the guest later asks who holds their details, this is the part of the answer no business in this sector can give.",
    dataCategoryIds: ["guest-identity", "companion-family", "health-accessibility", "service-activity"],
    action:
      "Send each partner only the rows and fields their job actually needs, use a booking reference in place of the guest's number where the partner has no reason to call, put deletion terms into the contracts of the partners you use repeatedly, and stop forwarding party lists into vendor group chats.",
    assessmentBucket: "booking_ota_vendor_sharing",
  },
  {
    id: "hs-guest-archive",
    rank: 3,
    nodeId: "guest-history-archive",
    title: "Checking out does not delete anything",
    whatHappens:
      "Past reservations, cancelled and no-show bookings, enquiries that never converted, folios, preferences, complaint notes and passport scans from stays years ago all settle into the archive - and stay, because past-guest history is what makes the next booking easier to sell.",
    whyItMatters:
      "Most of the people in it have had no relationship with the business for years, and many never had one at all. This is the single place where a retention decision would do the most good and is least likely to have been taken - and it is where a deletion request quietly fails.",
    dataCategoryIds: ["guest-identity", "identity-documents", "booking-itinerary", "guest-scoring"],
    action:
      "Set a retention period per category - enquiry, booking, identity document, financial record - and run it on a clock. An identity document almost never needs to survive the stay; a tax record does. Separate what you must keep from what you have merely never deleted.",
    assessmentBucket: "retention_marketing_incident",
  },
  {
    id: "hs-booking-channel",
    rank: 4,
    nodeId: "booking-channel-platform",
    title: "The guest exists on the OTA before they exist with you",
    whatHappens:
      "Most bookings are collected by an online travel agency, a metasearch listing or a booking engine first - name, contact, dates, party size, sometimes a card - then synced to your systems by a channel manager, leaving the same guest in four places within minutes.",
    whyItMatters:
      "A large share of your guests were collected under somebody else's notice, on terms you did not set. Deleting your copy leaves theirs untouched, and when a guest asks what you hold and who else has it, the honest answer starts with a platform you do not control.",
    dataCategoryIds: ["guest-identity", "booking-itinerary", "payment-financial", "companion-family"],
    action:
      "Read what each platform's contract actually permits, pull only the fields you need into your own systems, decide which record is your master so a correction lands in one place, and tell guests plainly which parts of their booking record you cannot reach.",
    assessmentBucket: "booking_ota_vendor_sharing",
  },
  {
    id: "hs-guest-profile-access",
    rank: 5,
    nodeId: "guest-profile-system",
    title: "Everyone on shift can read the allergy, the complaint and the note",
    whatHappens:
      "The guest profile holds companions, preferences, dietary and medical notes, past complaints, a value band and whatever the last executive typed into the notes field - open to nearly everyone on duty, exportable by most of them, and kept indefinitely.",
    whyItMatters:
      "Housekeeping does not need the medical note and marketing does not need the complaint history, but both can usually see them. A guest can ask to see and correct what you hold, including the opinions - and a departing employee can export the lot on their way out.",
    dataCategoryIds: ["guest-preference", "health-accessibility", "guest-scoring", "staff-access-record"],
    action:
      "Move to role-based access so each team sees the service note and not the whole profile, keep notes factual and separate observation from opinion, restrict exports to named people, and put a retention clock on guest history.",
    assessmentBucket: "system_staff_access",
  },
  {
    id: "hs-movement-trail",
    rank: 6,
    nodeId: "movement-access-trail",
    title: "The stay records where the guest was, and nobody set a retention period",
    whatHappens:
      "Key-card and mobile-key events, Wi-Fi logins and device identifiers, lift and parking access, CCTV, transfer GPS and a live location a coordinator asked someone to share - all generated continuously, and on a trip, often still updating days after everyone got home.",
    whyItMatters:
      "This is the only record in the series that says where a named person physically was, at what time - and by implication, when their home was empty. It is created without a decision, viewable by staff who have no need for it, and it outlives the stay it belonged to.",
    dataCategoryIds: ["access-monitoring", "location-movement", "guest-identity", "staff-access-record"],
    action:
      "Write down the purpose and the retention period for each kind of movement record, keep safety records out of marketing and analytics, restrict access to named accounts with a viewing log, and close credentials and stop location sharing the moment the stay or trip ends.",
    assessmentBucket: "system_staff_access",
  },
  {
    id: "hs-document-pack",
    rank: 7,
    nodeId: "guest-document-pack",
    title: "One sheet shows every traveller to every other traveller",
    whatHappens:
      "The final itinerary, the rooming list, the arrival manifest, the transfer schedule and the emergency-contact sheet are assembled into one document and sent to the group by email, dropped into a WhatsApp group, forwarded to the hotel and the transfer vendor, and printed for the folder.",
    whyItMatters:
      "It discloses room allocations, who is travelling with whom, who needs a wheelchair and whose emergency contact is whose - to everybody who receives it. It is forwarded onward more often than any other file in the sector, and no version of it can be recalled.",
    dataCategoryIds: ["companion-family", "booking-itinerary", "health-accessibility", "guest-identity"],
    action:
      "Send each traveller their own document, give each partner only the rows they need, keep health, accessibility and emergency details on a separate need-to-know sheet, and use links that expire rather than attachments that do not.",
    assessmentBucket: "guest_traveller_data",
  },
  {
    id: "hs-loyalty-marketing",
    rank: 8,
    nodeId: "loyalty-marketing-platform",
    title: "One stay becomes permission to market forever, across every brand",
    whatHappens:
      "The completed booking becomes a loyalty tier, a spend band, a churn score, a seasonal campaign list, a WhatsApp broadcast sent from a manager's own number and an audience uploaded back to the ad platform - and at a group, a stay at one property starts marketing from all of them.",
    whyItMatters:
      "Marketing permission is usually bundled into the booking, and a withdrawal recorded in the CRM does not reach the uploaded audience, the agency's export or the broadcast list on somebody's personal phone. The guest keeps hearing from you after asking you to stop, which is the complaint that actually gets made.",
    dataCategoryIds: ["loyalty-marketing-profile", "guest-scoring", "guest-identity", "communication-records"],
    action:
      "Separate booking communication from promotion, keep one suppression list that every channel and agency must check before sending, remove uploaded audiences when someone withdraws, and set an inactivity rule that closes dormant loyalty profiles.",
    assessmentBucket: "guest_traveller_data",
  },
];
