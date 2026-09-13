// Hindi overlay for lib/data/verdict-previews.ts (homepage S4 report preview +
// the hero's "first fix"). Previews keyed by slug; category labels, gaps and
// actions are keyed by their ENGLISH text, so an English rewrite falls back to
// English instead of leaving a stale translation. Scores/pct/band untouched.
import type { VerdictPreviewsOverlay } from "@/lib/i18n/overlay-types";

const hi: VerdictPreviewsOverlay = {
  previews: {
    recruitment: {
      tab: "रिक्रूटमेंट",
      label: "रिक्रूटमेंट एजेंसी",
      categories: {
        "Candidate sourcing": "कैंडिडेट सोर्सिंग",
        "Candidate documents": "कैंडिडेट के दस्तावेज़",
        "Client sharing": "क्लाइंट के साथ शेयरिंग",
        "ATS, tool & access": "ATS, टूल और एक्सेस",
        "Retention & rights": "रिटेंशन और अधिकार",
      },
      topGaps: {
        "CVs forwarded to clients over email and WhatsApp, with no record of candidate permission.":
          "CV ईमेल और WhatsApp से क्लाइंट को फ़ॉरवर्ड होते हैं, पर कैंडिडेट की अनुमति का कोई रिकॉर्ड नहीं रहता।",
        "Candidate profiles stay with multiple recipients after the role closes.":
          "रोल बंद होने के बाद भी कैंडिडेट की प्रोफ़ाइल कई लोगों के पास पड़ी रहती है।",
        "No deletion period for unsuccessful applicants, so databases grow indefinitely.":
          "चयन न होने वाले आवेदकों का डेटा मिटाने की कोई अवधि तय नहीं, इसलिए डेटाबेस बढ़ता ही जाता है।",
      },
      firstActions: {
        "Record candidate permission at the point you collect the CV, not at placement.":
          "कैंडिडेट की अनुमति उसी समय दर्ज करें जब आप CV लेते हैं, प्लेसमेंट के समय नहीं।",
        "Set a deletion period for unsuccessful applicants and put it in writing.":
          "चयन न होने वाले आवेदकों का डेटा मिटाने की अवधि तय करें और उसे लिखित में रखें।",
        "List every client and job board you send candidate data to.":
          "हर उस क्लाइंट और जॉब बोर्ड की सूची बनाएँ जिसे आप कैंडिडेट का डेटा भेजते हैं।",
      },
    },
    "ca-firms": {
      tab: "CA फ़र्में",
      label: "CA फ़र्म",
      categories: {
        "Client documents": "क्लाइंट के दस्तावेज़",
        "Document intake": "दस्तावेज़ लेने की प्रक्रिया",
        "Storage & access": "स्टोरेज और एक्सेस",
        "Retention & deletion": "रिटेंशन और मिटाना",
        "Vendor & incident readiness": "वेंडर और घटना से निपटने की तैयारी",
      },
      topGaps: {
        "Client PAN and Aadhaar files shared through email and Drive with no access review.":
          "क्लाइंट की PAN और Aadhaar फ़ाइलें ईमेल और Drive से शेयर होती हैं, पर एक्सेस की कोई समीक्षा नहीं होती।",
        "Former staff and interns may still reach shared folders.":
          "पुराने स्टाफ़ और इंटर्न अब भी शेयर्ड फ़ोल्डर तक पहुँच सकते हैं।",
        "Client financial records kept indefinitely, with no retention or disposal schedule.":
          "क्लाइंट के वित्तीय रिकॉर्ड बिना किसी रिटेंशन या निपटान शेड्यूल के हमेशा के लिए रखे जाते हैं।",
      },
      firstActions: {
        "Review shared-folder access and remove inactive accounts.":
          "शेयर्ड फ़ोल्डर के एक्सेस की समीक्षा करें और निष्क्रिय अकाउंट हटाएँ।",
        "Give each client engagement a named data owner in the firm.":
          "हर क्लाइंट असाइनमेंट के लिए फ़र्म में एक नामित डेटा ओनर तय करें।",
        "Agree a disposal schedule for closed matters and apply it once.":
          "बंद हो चुके मामलों के लिए निपटान का शेड्यूल तय करें और एक बार उसे लागू कर दें।",
      },
    },
    "training-institutes": {
      tab: "ट्रेनिंग",
      label: "ट्रेनिंग इंस्टिट्यूट",
      categories: {
        "Student data collection": "छात्रों का डेटा इकट्ठा करना",
        "Minor & parental consent": "नाबालिग और अभिभावक सहमति",
        "Communication & marketing": "कम्युनिकेशन और मार्केटिंग",
        "LMS, vendor & platform": "LMS, वेंडर और प्लेटफ़ॉर्म",
        "Retention & rights": "रिटेंशन और अधिकार",
      },
      topGaps: {
        "Enquiry forms collect a student's age and parent's number with no notice at the point of collection.":
          "इन्क्वायरी फ़ॉर्म छात्र की उम्र और अभिभावक का नंबर ले लेते हैं, पर उसी समय कोई नोटिस नहीं दिया जाता।",
        "Where the learner is a minor, verifiable parental consent is not recorded before enrolment.":
          "जहाँ छात्र नाबालिग है, वहाँ एडमिशन से पहले सत्यापन-योग्य अभिभावक सहमति दर्ज नहीं की जाती।",
        "Placement and alumni records are kept indefinitely and reused for marketing.":
          "प्लेसमेंट और पूर्व छात्रों के रिकॉर्ड हमेशा के लिए रखे जाते हैं और मार्केटिंग में दोबारा इस्तेमाल होते हैं।",
      },
      firstActions: {
        "Put an itemised notice on the enquiry form and separate marketing consent from enrolment.":
          "इन्क्वायरी फ़ॉर्म पर बिंदुवार नोटिस दें, और मार्केटिंग की सहमति को एडमिशन से अलग रखें।",
        "Record verifiable parental consent for every learner under eighteen before the course starts.":
          "कोर्स शुरू होने से पहले अठारह साल से कम उम्र के हर छात्र के लिए सत्यापन-योग्य अभिभावक सहमति दर्ज करें।",
        "Set a retention period for placement and alumni data, and stop reusing it for campaigns.":
          "प्लेसमेंट और पूर्व छात्रों के डेटा के लिए रिटेंशन अवधि तय करें, और कैंपेन में उसका दोबारा इस्तेमाल बंद करें।",
      },
    },
    "d2c-brands": {
      label: "D2C ब्रांड",
      categories: {
        "Customer data collection": "ग्राहकों का डेटा इकट्ठा करना",
        "Marketing consent": "मार्केटिंग की सहमति",
        "Tracking & adtech": "ट्रैकिंग और ऐडटेक",
        "Vendor & fulfilment": "वेंडर और डिलीवरी",
        "Retention & preferences": "रिटेंशन और पसंद",
      },
      topGaps: {
        "Marketing opt-in bundled into checkout, so consent is not separate or withdrawable.":
          "मार्केटिंग का ऑप्ट-इन चेकआउट के साथ जुड़ा है, इसलिए सहमति न अलग है, न वापस ली जा सकती है।",
        "Analytics and ad pixels pass customer data to vendors with no written terms.":
          "एनालिटिक्स और ऐड पिक्सेल बिना लिखित शर्तों के ग्राहकों का डेटा वेंडरों तक पहुँचाते हैं।",
        "Inactive customer records and abandoned-cart data are never cleared.":
          "निष्क्रिय ग्राहकों के रिकॉर्ड और छोड़े गए कार्ट का डेटा कभी साफ़ नहीं किया जाता।",
      },
      firstActions: {
        "Separate the marketing opt-in from the purchase, and make withdrawal one click.":
          "मार्केटिंग के ऑप्ट-इन को ख़रीदारी से अलग करें, और सहमति वापस लेना एक क्लिक का काम बनाएँ।",
        "List every pixel, app and vendor that receives customer data.":
          "हर उस पिक्सेल, ऐप और वेंडर की सूची बनाएँ जिस तक ग्राहकों का डेटा पहुँचता है।",
        "Set a retention period for inactive customers and abandoned carts.":
          "निष्क्रिय ग्राहकों और छोड़े गए कार्ट के लिए रिटेंशन अवधि तय करें।",
      },
    },
    "clinics-diagnostic-labs": {
      tab: "क्लिनिक",
      label: "क्लिनिक / डायग्नोस्टिक लैब",
      categories: {
        "Patient data collection": "मरीज़ों का डेटा इकट्ठा करना",
        "Health data sensitivity": "स्वास्थ्य डेटा की संवेदनशीलता",
        "Report sharing": "रिपोर्ट शेयर करना",
        "System, staff & vendor access": "सिस्टम, स्टाफ़ और वेंडर एक्सेस",
        "Retention & incident readiness": "रिटेंशन और घटना से निपटने की तैयारी",
      },
      topGaps: {
        "Reports sent to patients over WhatsApp from staff handsets the clinic does not control.":
          "मरीज़ों को रिपोर्टें स्टाफ़ के उन फ़ोन से WhatsApp पर भेजी जाती हैं जिन पर क्लिनिक का कोई नियंत्रण नहीं।",
        "Front-desk registers and appointment books hold health details anyone at the counter can read.":
          "फ़्रंट डेस्क के रजिस्टर और अपॉइंटमेंट बुक में स्वास्थ्य की ऐसी जानकारी रहती है जिसे काउंटर पर कोई भी पढ़ सकता है।",
        "Referral labs and imaging partners receive patient data with no written processing terms.":
          "रेफ़रल लैब और इमेजिंग पार्टनर को मरीज़ों का डेटा बिना लिखित प्रोसेसिंग शर्तों के मिलता है।",
      },
      firstActions: {
        "Move report delivery to a channel the clinic controls, and stop sending from personal handsets.":
          "रिपोर्ट भेजने का काम ऐसे चैनल पर ले जाएँ जो क्लिनिक के नियंत्रण में हो, और निजी फ़ोन से भेजना बंद करें।",
        "Restrict who can view patient records to the roles that actually need them.":
          "मरीज़ों के रिकॉर्ड देखने की अनुमति सिर्फ़ उन्हीं भूमिकाओं तक सीमित करें जिन्हें सच में इनकी ज़रूरत है।",
        "List every referral lab and partner you send patient data to, and add processing terms.":
          "हर उस रेफ़रल लैब और पार्टनर की सूची बनाएँ जिसे आप मरीज़ों का डेटा भेजते हैं, और उनके साथ प्रोसेसिंग शर्तें जोड़ें।",
      },
    },
    "schools-colleges": {
      tab: "स्कूल",
      label: "स्कूल / कॉलेज",
      categories: {
        "Student & parent data": "छात्र और अभिभावक का डेटा",
        "Children & consent": "बच्चे और सहमति",
        "Monitoring & safety systems": "निगरानी और सुरक्षा सिस्टम",
        "Learning, vendor & platform": "लर्निंग, वेंडर और प्लेटफ़ॉर्म",
        "Retention, sharing & rights": "रिटेंशन, शेयरिंग और अधिकार",
      },
      topGaps: {
        "Student data is children's data, and verifiable parental consent is not recorded at admission.":
          "छात्रों का डेटा बच्चों का डेटा है, फिर भी एडमिशन के समय सत्यापन-योग्य अभिभावक सहमति दर्ज नहीं होती।",
        "Class WhatsApp groups carry names, photographs and results to every parent in the group.":
          "क्लास के WhatsApp ग्रुप में नाम, फ़ोटो और रिज़ल्ट ग्रुप के हर अभिभावक तक पहुँचते हैं।",
        "Learning platforms and transport trackers receive student data with no written terms.":
          "लर्निंग प्लेटफ़ॉर्म और ट्रांसपोर्ट ट्रैकर को छात्रों का डेटा बिना लिखित शर्तों के मिलता है।",
      },
      firstActions: {
        "Record verifiable parental consent at admission, and stop treating enrolment as consent.":
          "एडमिशन के समय सत्यापन-योग्य अभिभावक सहमति दर्ज करें, और एडमिशन को ही सहमति मानना बंद करें।",
        "Move results and photographs off open parent groups to a channel the school controls.":
          "रिज़ल्ट और फ़ोटो खुले पेरेंट ग्रुप से हटाकर ऐसे चैनल पर ले जाएँ जो स्कूल के नियंत्रण में हो।",
        "List every platform, app and transport vendor holding student data.":
          "हर उस प्लेटफ़ॉर्म, ऐप और ट्रांसपोर्ट वेंडर की सूची बनाएँ जिसके पास छात्रों का डेटा है।",
      },
    },
    "law-firms": {
      tab: "लॉ फ़र्में",
      label: "लॉ फ़र्म",
      categories: {
        "Client & matter data": "क्लाइंट और केस का डेटा",
        "Case-file sensitivity": "केस फ़ाइल की संवेदनशीलता",
        "Document sharing": "दस्तावेज़ शेयर करना",
        "Staff, junior & vendor access": "स्टाफ़, जूनियर और वेंडर एक्सेस",
        "Retention & incident readiness": "रिटेंशन और घटना से निपटने की तैयारी",
      },
      topGaps: {
        "Case files and evidence move over personal email and messaging with no access record.":
          "केस फ़ाइलें और सबूत निजी ईमेल और मैसेजिंग से आते-जाते हैं, पर एक्सेस का कोई रिकॉर्ड नहीं रहता।",
        "Juniors, interns and clerks retain folder access long after a matter closes.":
          "केस बंद होने के काफ़ी बाद तक जूनियर, इंटर्न और क्लर्क के पास फ़ोल्डर का एक्सेस बना रहता है।",
        "Closed matters are archived indefinitely with no disposal decision ever taken.":
          "बंद केस हमेशा के लिए आर्काइव में पड़े रहते हैं, उनके निपटान का फ़ैसला कभी लिया ही नहीं जाता।",
      },
      firstActions: {
        "Route matter documents through one controlled system rather than personal mailboxes.":
          "केस के दस्तावेज़ निजी मेलबॉक्स के बजाय एक नियंत्रित सिस्टम से ही भेजें।",
        "Review access when a matter closes, not when someone leaves.":
          "एक्सेस की समीक्षा तब करें जब केस बंद हो, तब नहीं जब कोई नौकरी छोड़े।",
        "Set a disposal schedule for closed matters that respects your professional obligations.":
          "बंद केस के लिए ऐसा निपटान शेड्यूल तय करें जो आपके पेशेवर दायित्वों का भी ध्यान रखे।",
      },
    },
    "real-estate": {
      tab: "रियल एस्टेट",
      label: "रियल एस्टेट व्यवसाय",
      categories: {
        "Client & lead data": "क्लाइंट और लीड का डेटा",
        "KYC & property documents": "KYC और प्रॉपर्टी के दस्तावेज़",
        "Broker network sharing": "ब्रोकर नेटवर्क में शेयरिंग",
        "CRM, staff & vendor access": "CRM, स्टाफ़ और वेंडर एक्सेस",
        "Retention & incident readiness": "रिटेंशन और घटना से निपटने की तैयारी",
      },
      topGaps: {
        "Buyer PAN, Aadhaar and bank documents circulate in broker groups with no record of who holds them.":
          "ख़रीदार के PAN, Aadhaar और बैंक दस्तावेज़ ब्रोकर ग्रुप में घूमते रहते हैं, पर कोई रिकॉर्ड नहीं कि वे किसके पास हैं।",
        "Purchased and scraped lead lists are called without any consent for that contact.":
          "ख़रीदी गई और स्क्रैप की गई लीड लिस्ट पर कॉल किए जाते हैं, जबकि उस संपर्क के लिए कोई सहमति नहीं होती।",
        "Lead databases are never cleared, so enquiries from years ago are still marketed to.":
          "लीड डेटाबेस कभी साफ़ नहीं किए जाते, इसलिए सालों पुरानी इन्क्वायरी पर भी मार्केटिंग होती रहती है।",
      },
      firstActions: {
        "Stop sending KYC documents into broker groups; use one controlled channel per transaction.":
          "ब्रोकर ग्रुप में KYC दस्तावेज़ भेजना बंद करें; हर सौदे के लिए एक नियंत्रित चैनल इस्तेमाल करें।",
        "Record where each lead came from, and stop calling lists you have no consent for.":
          "हर लीड कहाँ से आई, यह दर्ज करें, और जिन लिस्ट के लिए आपके पास सहमति नहीं है, उन पर कॉल करना बंद करें।",
        "Set a retention period for dead leads and apply it.":
          "बेकार हो चुकी लीड के लिए रिटेंशन अवधि तय करें और उसे लागू करें।",
      },
    },
    "hotels-travel": {
      tab: "होटल",
      label: "होटल / ट्रैवल व्यवसाय",
      categories: {
        "Guest & traveller data": "मेहमानों और यात्रियों का डेटा",
        "ID & travel documents": "ID और यात्रा के दस्तावेज़",
        "Booking, OTA & vendor sharing": "बुकिंग, OTA और वेंडर के साथ शेयरिंग",
        "System, staff & access": "सिस्टम, स्टाफ़ और एक्सेस",
        "Retention & incident readiness": "रिटेंशन और घटना से निपटने की तैयारी",
      },
      topGaps: {
        "Passport and ID scans taken at check-in are stored on the front-desk machine indefinitely.":
          "चेक-इन पर लिए गए पासपोर्ट और ID स्कैन फ़्रंट डेस्क के कंप्यूटर में हमेशा के लिए पड़े रहते हैं।",
        "OTAs, tour operators and transport partners receive guest data with no written terms.":
          "OTA, टूर ऑपरेटर और ट्रांसपोर्ट पार्टनर को मेहमानों का डेटा बिना लिखित शर्तों के मिलता है।",
        "Every front-desk shift shares one login, so no action can be traced to a person.":
          "फ़्रंट डेस्क की हर शिफ़्ट एक ही लॉगिन इस्तेमाल करती है, इसलिए किसी भी काम को किसी व्यक्ति से जोड़ा नहीं जा सकता।",
      },
      firstActions: {
        "Set a deletion period for ID scans once the statutory requirement is met, and enforce it.":
          "क़ानूनी ज़रूरत पूरी होने के बाद ID स्कैन मिटाने की अवधि तय करें, और उस पर अमल करवाएँ।",
        "List every OTA and partner that receives guest data, and add processing terms.":
          "हर उस OTA और पार्टनर की सूची बनाएँ जिसे मेहमानों का डेटा मिलता है, और उनके साथ प्रोसेसिंग शर्तें जोड़ें।",
        "Give each front-desk staff member their own login.":
          "फ़्रंट डेस्क के हर स्टाफ़ सदस्य को उसका अपना लॉगिन दें।",
      },
    },
    pharmacies: {
      tab: "फ़ार्मेसी",
      label: "फ़ार्मेसी",
      categories: {
        "Customer & prescription data": "ग्राहक और प्रिस्क्रिप्शन का डेटा",
        "Health indicators & history": "स्वास्थ्य संकेत और हिस्ट्री",
        "Order, delivery & vendor sharing": "ऑर्डर, डिलीवरी और वेंडर के साथ शेयरिंग",
        "System, staff & access": "सिस्टम, स्टाफ़ और एक्सेस",
        "Retention & refill readiness": "रिटेंशन और रीफ़िल की तैयारी",
      },
      topGaps: {
        "Prescription photographs arrive over WhatsApp and stay on staff handsets after the sale.":
          "प्रिस्क्रिप्शन की फ़ोटो WhatsApp पर आती हैं और बिक्री के बाद भी स्टाफ़ के फ़ोन में पड़ी रहती हैं।",
        "Delivery partners receive the customer's name, address and medicine details with no terms.":
          "डिलीवरी पार्टनर को ग्राहक का नाम, पता और दवाओं की जानकारी बिना कोई शर्त तय किए मिलती है।",
        "Refill reminders are sent from purchase history with no consent for marketing.":
          "ख़रीदारी की हिस्ट्री देखकर रीफ़िल रिमाइंडर भेजे जाते हैं, जबकि मार्केटिंग के लिए कोई सहमति नहीं ली गई।",
      },
      firstActions: {
        "Stop keeping prescription images on personal handsets, and move them to one controlled system.":
          "प्रिस्क्रिप्शन की तस्वीरें निजी फ़ोन में रखना बंद करें, और उन्हें एक नियंत्रित सिस्टम में ले जाएँ।",
        "Share only what the delivery partner needs, and put terms in place with them.":
          "डिलीवरी पार्टनर को सिर्फ़ उतना ही दें जितनी उसे ज़रूरत है, और उसके साथ शर्तें तय करें।",
        "Get separate consent before using purchase history for reminders.":
          "रिमाइंडर के लिए ख़रीदारी की हिस्ट्री इस्तेमाल करने से पहले अलग सहमति लें।",
      },
    },
    "fintech-nbfc": {
      tab: "फ़िनटेक",
      label: "फ़िनटेक / NBFC",
      categories: {
        "KYC & financial data": "KYC और वित्तीय डेटा",
        "Profiling & underwriting": "प्रोफ़ाइलिंग और अंडरराइटिंग",
        "Consent, notice & rights": "सहमति, नोटिस और अधिकार",
        "Vendor, partner & agent sharing": "वेंडर, पार्टनर और एजेंट के साथ शेयरिंग",
        "Access, retention & incidents": "एक्सेस, रिटेंशन और घटनाएँ",
      },
      topGaps: {
        "Customers are not told what data drives an underwriting decision, or how to contest it.":
          "ग्राहकों को नहीं बताया जाता कि अंडरराइटिंग का फ़ैसला किस डेटा के आधार पर होता है, या उसे चुनौती कैसे दें।",
        "Collection agents and sourcing partners hold borrower data outside your systems.":
          "रिकवरी एजेंट और सोर्सिंग पार्टनर उधार लेने वालों का डेटा आपके सिस्टम से बाहर रखते हैं।",
        "Rejected applicants' KYC documents are retained on the same schedule as approved customers.":
          "रिजेक्ट हुए आवेदकों के KYC दस्तावेज़ भी उसी शेड्यूल पर रखे जाते हैं जिस पर मंज़ूर ग्राहकों के।",
      },
      firstActions: {
        "Publish what data an underwriting decision uses, and name who a customer can ask about it.":
          "प्रकाशित करें कि अंडरराइटिंग का फ़ैसला किस डेटा पर होता है, और यह भी बताएँ कि ग्राहक इस बारे में किससे पूछ सकता है।",
        "List every agent and sourcing partner holding borrower data, with written terms.":
          "उधार लेने वालों का डेटा रखने वाले हर एजेंट और सोर्सिंग पार्टनर की सूची बनाएँ, लिखित शर्तों के साथ।",
        "Set a shorter retention period for rejected applications and apply it.":
          "रिजेक्ट हुए आवेदनों के लिए कम रिटेंशन अवधि तय करें और उसे लागू करें।",
      },
    },
    "gyms-salons-spas": {
      tab: "जिम और सैलून",
      label: "जिम / सैलून / स्पा",
      categories: {
        "Customer & membership data": "ग्राहक और मेंबरशिप का डेटा",
        "Health & consultation data": "स्वास्थ्य और कंसल्टेशन का डेटा",
        "Photos, marketing & WhatsApp": "फ़ोटो, मार्केटिंग और WhatsApp",
        "App, staff & vendor access": "ऐप, स्टाफ़ और वेंडर एक्सेस",
        "Retention & incident readiness": "रिटेंशन और घटना से निपटने की तैयारी",
      },
      topGaps: {
        "Before-and-after photographs are posted to social media without written permission.":
          "पहले और बाद की फ़ोटो बिना लिखित अनुमति के सोशल मीडिया पर डाल दी जाती हैं।",
        "Health and consultation notes sit in an open register or a shared WhatsApp group.":
          "स्वास्थ्य और कंसल्टेशन के नोट्स किसी खुले रजिस्टर या शेयर्ड WhatsApp ग्रुप में पड़े रहते हैं।",
        "Members who left years ago are still messaged from the old member list.":
          "सालों पहले छोड़ चुके सदस्यों को भी पुरानी मेंबर लिस्ट से मैसेज जाते रहते हैं।",
      },
      firstActions: {
        "Get written, separate permission before using any client photograph, and honour withdrawal.":
          "किसी भी क्लाइंट की फ़ोटो इस्तेमाल करने से पहले अलग से लिखित अनुमति लें, और अनुमति वापस लेने का सम्मान करें।",
        "Move consultation notes off shared groups into one controlled record.":
          "कंसल्टेशन के नोट्स शेयर्ड ग्रुप से हटाकर एक नियंत्रित रिकॉर्ड में रखें।",
        "Set a retention period for lapsed members and stop marketing to them.":
          "मेंबरशिप ख़त्म कर चुके सदस्यों के लिए रिटेंशन अवधि तय करें और उन्हें मार्केटिंग मैसेज भेजना बंद करें।",
      },
    },
  },
  checklist: {
    "Privacy notice published and current": "प्राइवेसी नोटिस प्रकाशित और अपडेटेड",
    "Consent collected separately, and withdrawable": "सहमति अलग से ली गई, और वापस ली जा सकती है",
    "Vendor list with written terms": "लिखित शर्तों के साथ वेंडर सूची",
    "Retention period defined per data type": "हर तरह के डेटा के लिए रिटेंशन अवधि तय",
    "Named owner for data-rights requests": "डेटा-अधिकार अनुरोधों के लिए एक नामित ज़िम्मेदार व्यक्ति",
    "Breach response steps written down": "उल्लंघन होने पर उठाए जाने वाले कदम लिखित में",
  },
};

export default hi;
