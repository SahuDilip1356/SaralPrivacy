// Hindi overlay for lib/data/resource-templates.ts — keyed by file name.
// `title` here is DISPLAY-only (rendered as displayTitle); the English title
// remains the lead payload's templateName. The files themselves are English.
import type { ResourceTemplatesOverlay } from "@/lib/i18n/overlay-types";

const hi: ResourceTemplatesOverlay = {
  "privacy-notice.docx": {
    title: "प्राइवेसी नोटिस टेम्पलेट",
    desc: "DPDPA के अनुरूप प्राइवेसी नोटिस, सभी 10 ज़रूरी हिस्सों के साथ — अपनी वेबसाइट, ऐप या छपी सामग्री के हिसाब से ढालें",
  },
  "data-inventory-register.xlsx": {
    title: "डेटा इन्वेंटरी रजिस्टर",
    desc: "हर तरह का डेटा, वह कहाँ रखा है, कितने समय तक रखना है और उसका क़ानूनी आधार — सब एक जगह दर्ज करें; यही DPDPA अनुपालन की नींव है",
  },
  "consent-language-examples.docx": {
    title: "सहमति की भाषा के उदाहरण",
    desc: "वेबसाइट फ़ॉर्म, WhatsApp, चेकआउट, ऐप ऑनबोर्डिंग, आमने-सामने और कर्मचारी डेटा के लिए 8 तैयार सहमति वाक्य",
  },
  "dsr-grievance-sop.docx": {
    title: "DSR और शिकायत निपटान SOP",
    desc: "ग्राहकों और कर्मचारियों के एक्सेस, सुधार, मिटाने और शिकायत के अनुरोध संभालने की क़दम-दर-क़दम प्रक्रिया",
  },
  "vendor-data-sharing-register.xlsx": {
    title: "वेंडर डेटा-शेयरिंग रजिस्टर",
    desc: "हर उस थर्ड पार्टी का हिसाब रखें जिसे व्यक्तिगत डेटा मिलता है, उसके साथ कौन-से DPA हैं, और हर रिश्ते की समीक्षा कब करनी है",
  },
};

export default hi;
