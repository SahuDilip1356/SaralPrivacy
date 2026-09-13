// Hindi overlay for lib/data/hero-verdicts.ts — keyed by assessment slug.
// chipLabel is interpolated into home.hero.appliesTo and shown capitalised on
// the chip; `band` is a typed key and never overlaid (display via home.band).
import type { HeroVerdictsOverlay } from "@/lib/i18n/overlay-types";

const hi: HeroVerdictsOverlay = {
  recruitment: {
    chipLabel: "रिक्रूटमेंट एजेंसी",
    riskLine: "आप कैंडिडेट के ID, CV और रेफ़रेंस ज़रूरत से कहीं ज़्यादा समय तक रखते हैं।",
  },
  "ca-firms": {
    chipLabel: "CA फ़र्म",
    riskLine: "क्लाइंट का PAN, वित्तीय रिकॉर्ड और KYC ईमेल, ड्राइव और WhatsApp में बिखरे रहते हैं।",
  },
  "training-institutes": {
    chipLabel: "ट्रेनिंग इंस्टिट्यूट",
    riskLine: "छात्रों के रिकॉर्ड, फ़ीस का डेटा और अभिभावकों के नंबर अक्सर बिना किसी रिटेंशन सीमा के पड़े रहते हैं।",
  },
  "d2c-brands": {
    chipLabel: "D2C ब्रांड",
    riskLine: "ग्राहकों के पते, ऑर्डर हिस्ट्री और ऐड-पिक्सेल डेटा कई वेंडरों तक पहुँचते हैं।",
  },
  "clinics-diagnostic-labs": {
    chipLabel: "डायग्नोस्टिक लैब",
    riskLine: "आपके पास गंभीर असर वाला स्वास्थ्य डेटा होता है, और रिपोर्टें अक्सर WhatsApp पर भेजी जाती हैं।",
  },
  "schools-colleges": {
    chipLabel: "स्कूल या कॉलेज",
    riskLine: "बच्चों के डेटा पर सहमति के सबसे सख़्त नियम लागू होते हैं, जिनमें सत्यापन-योग्य अभिभावक सहमति भी शामिल है।",
  },
  "law-firms": {
    chipLabel: "लॉ फ़र्म",
    riskLine: "क्लाइंट के गोपनीय मामले और ID की कॉपियाँ इनबॉक्स और शेयर्ड ड्राइव में पड़ी रहती हैं।",
  },
  "real-estate": {
    chipLabel: "रियल एस्टेट फ़र्म",
    riskLine: "KYC, आय के सबूत और Aadhaar की कॉपियाँ हर डील और हर ब्रोकर के पास जमा होती जाती हैं।",
  },
  "hotels-travel": {
    chipLabel: "होटल या ट्रैवल व्यवसाय",
    riskLine: "मेहमानों के ID, कार्ड की जानकारी और CCTV/Wi-Fi लॉग आमतौर पर ज़रूरत से ज़्यादा समय तक रखे जाते हैं।",
  },
  pharmacies: {
    chipLabel: "फ़ार्मेसी",
    riskLine: "प्रिस्क्रिप्शन से किसी नाम वाले व्यक्ति का गंभीर असर वाला स्वास्थ्य डेटा सामने आ जाता है।",
  },
  "fintech-nbfc": {
    chipLabel: "फ़िनटेक या NBFC",
    riskLine: "गंभीर असर वाला वित्तीय डेटा और KYC कई थर्ड पार्टी से होकर गुज़रते हैं।",
  },
  "gyms-salons-spas": {
    chipLabel: "जिम, सैलून या स्पा",
    riskLine: "सदस्यों के हेल्थ नोट्स, फ़ोटो और बायोमेट्रिक चेक-इन — ये सब व्यक्तिगत डेटा है।",
  },
};

export default hi;
