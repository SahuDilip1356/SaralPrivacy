// Hindi overlay for the homepage sector deck's copy (components/home/
// AudienceCards.tsx), keyed by industry slug. Pain points are keyed by their
// English text. Card titles are NOT here — they reuse the sector nav labels in
// messages/hi.json (nav.items.*); chips reuse the verdict-preview tabs.
import type { SectorDeckOverlay } from "@/lib/i18n/overlay-types";

const hi: SectorDeckOverlay = {
  "recruitment-agencies": {
    risk: "कैंडिडेट ID और CV का जोखिम",
    painPoints: {
      "CV databases & candidate data": "CV डेटाबेस और कैंडिडेट का डेटा",
      "Client profile sharing": "क्लाइंट के साथ प्रोफ़ाइल शेयरिंग",
      "Background check documents": "बैकग्राउंड चेक के दस्तावेज़",
      "Cross-border data flows": "सीमा-पार डेटा ट्रांसफ़र",
    },
    line: "क्लाइंट शॉर्टलिस्ट माँगता है, और आप सीधे अपने इनबॉक्स से तीन CV फ़ॉरवर्ड कर देते हैं।",
  },
  "ca-firms": {
    risk: "PAN / Aadhaar / ITR का जोखिम",
    painPoints: {
      "PAN / Aadhaar / bank data": "PAN / Aadhaar / बैंक डेटा",
      "Client payroll records": "क्लाइंट के पेरोल रिकॉर्ड",
      "Cloud drives & shared folders": "क्लाउड ड्राइव और शेयर्ड फ़ोल्डर",
      "Sensitive financial documents": "संवेदनशील वित्तीय दस्तावेज़",
    },
    line: "क्लाइंट अपना PAN कार्ड WhatsApp पर भेजता है, और वह फ़र्म की शेयर्ड Drive में पहुँच जाता है।",
  },
  "training-institutes": {
    risk: "छात्र और अभिभावक के डेटा का जोखिम",
    painPoints: {
      "Student & parent data": "छात्र और अभिभावक का डेटा",
      "Admissions & lead forms": "एडमिशन और लीड फ़ॉर्म",
      "Digital marketing consent": "डिजिटल मार्केटिंग की सहमति",
      "Placement data retention": "प्लेसमेंट डेटा का रिटेंशन",
    },
    line: "जाँचें कि आपके एडमिशन, मार्केटिंग और छात्र-डेटा से जुड़े काम DPDPA के लिए तैयार हैं या नहीं।",
  },
  "d2c-brands": {
    risk: "मार्केटिंग और पिक्सेल-डेटा का जोखिम",
    painPoints: {
      "Email / SMS / WhatsApp marketing": "ईमेल / SMS / WhatsApp मार्केटिंग",
      "Third-party analytics & pixels": "थर्ड-पार्टी एनालिटिक्स और पिक्सेल",
      "Customer loyalty data": "ग्राहक लॉयल्टी डेटा",
      "Retention of inactive customers": "निष्क्रिय ग्राहकों के डेटा का रिटेंशन",
    },
    line: "ग्राहक चेकआउट पूरा करता है, और आपकी मार्केटिंग लिस्ट में चुपचाप एक सब्सक्राइबर जुड़ जाता है।",
  },
  "clinics-diagnostic-labs": {
    risk: "स्वास्थ्य-डेटा का जोखिम",
    painPoints: {
      "Prescriptions & lab reports": "प्रिस्क्रिप्शन और लैब रिपोर्ट",
      "WhatsApp report sharing": "WhatsApp पर रिपोर्ट शेयरिंग",
      "Reception & lab staff access": "रिसेप्शन और लैब स्टाफ़ का एक्सेस",
      "Old patient-record retention": "मरीज़ों के पुराने रिकॉर्ड का रिटेंशन",
    },
    line: "जाँचें कि मरीज़ों के डेटा और रिपोर्ट शेयर करने से जुड़े आपके काम DPDPA के लिए तैयार हैं या नहीं।",
  },
  "schools-colleges": {
    risk: "बच्चों के डेटा का जोखिम",
    painPoints: {
      "Children's data & parent consent": "बच्चों का डेटा और अभिभावक सहमति",
      "School apps, ERP & LMS": "स्कूल ऐप, ERP और LMS",
      "CCTV, biometric & transport GPS": "CCTV, बायोमेट्रिक और ट्रांसपोर्ट GPS",
      "Student photos & old records": "छात्रों की फ़ोटो और पुराने रिकॉर्ड",
    },
    line: "जाँचें कि छात्र-डेटा, अभिभावक सहमति और निगरानी से जुड़े आपके काम DPDPA के लिए तैयार हैं या नहीं।",
  },
  "law-firms": {
    risk: "संवेदनशील केस-फ़ाइल का जोखिम",
    painPoints: {
      "Client KYC & evidence files": "क्लाइंट KYC और सबूतों की फ़ाइलें",
      "Junior / intern / ex-staff access": "जूनियर / इंटर्न / पुराने स्टाफ़ का एक्सेस",
      "WhatsApp & email document sharing": "WhatsApp और ईमेल से दस्तावेज़ शेयरिंग",
      "Closed matter-file retention": "बंद केस फ़ाइलों का रिटेंशन",
    },
    line: "जाँचें कि केस लेने, संवेदनशील फ़ाइलों के एक्सेस और शेयरिंग से जुड़े आपके काम DPDPA के लिए तैयार हैं या नहीं।",
  },
  "real-estate": {
    risk: "KYC और ब्रोकर-शेयरिंग का जोखिम",
    painPoints: {
      "Buyer/tenant KYC & PAN/Aadhaar": "ख़रीदार/किरायेदार का KYC और PAN/Aadhaar",
      "WhatsApp lead & document sharing": "WhatsApp पर लीड और दस्तावेज़ शेयरिंग",
      "Broker networks & loan partners": "ब्रोकर नेटवर्क और लोन पार्टनर",
      "Old lead-database retention": "पुराने लीड डेटाबेस का रिटेंशन",
    },
    line: "जाँचें कि KYC संभालने, ब्रोकर के साथ शेयरिंग और लीड रिटेंशन से जुड़े आपके काम DPDPA के लिए तैयार हैं या नहीं।",
  },
  "hotels-travel": {
    risk: "मेहमानों के ID रखने का जोखिम",
    painPoints: {
      "Guest IDs & passport copies": "मेहमानों के ID और पासपोर्ट की कॉपियाँ",
      "OTA & travel-vendor sharing": "OTA और ट्रैवल वेंडर के साथ शेयरिंग",
      "WhatsApp confirmations & CCTV": "WhatsApp कन्फ़र्मेशन और CCTV",
      "Old guest-record retention": "मेहमानों के पुराने रिकॉर्ड का रिटेंशन",
    },
    line: "देखें कि मेहमानों के ID, OTA शेयरिंग, यात्रा दस्तावेज़ और रिकॉर्ड रिटेंशन DPDPA के लिए तैयार हैं या नहीं।",
  },
  pharmacies: {
    risk: "प्रिस्क्रिप्शन-डेटा का जोखिम",
    painPoints: {
      "Prescriptions & medicine history": "प्रिस्क्रिप्शन और दवाओं की हिस्ट्री",
      "WhatsApp orders & health indicators": "WhatsApp ऑर्डर और स्वास्थ्य संकेत",
      "Delivery-partner data sharing": "डिलीवरी पार्टनर के साथ डेटा शेयरिंग",
      "Old prescription retention": "पुराने प्रिस्क्रिप्शन का रिटेंशन",
    },
    line: "जाँचें कि प्रिस्क्रिप्शन, दवाओं की हिस्ट्री संभालना और वेंडर के साथ शेयरिंग DPDPA के लिए तैयार हैं या नहीं।",
  },
  "fintech-nbfc": {
    risk: "KYC और प्रोफ़ाइलिंग का जोखिम",
    painPoints: {
      "KYC, PAN/Aadhaar & bank data": "KYC, PAN/Aadhaar और बैंक डेटा",
      "Bureau checks & credit profiling": "ब्यूरो चेक और क्रेडिट प्रोफ़ाइलिंग",
      "DSAs & collection-agent access": "DSA और रिकवरी एजेंट का एक्सेस",
      "Old application & KYC retention": "पुराने आवेदनों और KYC का रिटेंशन",
    },
    line: "देखें कि आपका KYC, प्रोफ़ाइलिंग, पार्टनर शेयरिंग और एजेंट एक्सेस DPDPA के लिए तैयार हैं या नहीं।",
  },
  "gyms-salons-spas": {
    risk: "फ़ोटो और स्वास्थ्य-डेटा का जोखिम",
    painPoints: {
      "Health & body measurements": "स्वास्थ्य और शरीर के माप",
      "Customer & before-after photos": "ग्राहकों की फ़ोटो और पहले-बाद की तस्वीरें",
      "WhatsApp campaigns & staff phones": "WhatsApp कैंपेन और स्टाफ़ के फ़ोन",
      "Old member-record retention": "पुराने सदस्यों के रिकॉर्ड का रिटेंशन",
    },
    line: "जाँचें कि फ़ोटो की सहमति, स्वास्थ्य-डेटा संभालना और स्टाफ़ एक्सेस DPDPA के लिए तैयार हैं या नहीं।",
  },
};

export default hi;
