import { CourierRule } from "../types";

export const rule: CourierRule = {
  id: "dpd_com_pl",
  name: "DPD PL",
  domains: ["dpd.com.pl"],
  statusRules: {
    delivered: {
      email: ["regex:KurierDPD\\d+@dpd\\.com\\.pl", "exact-nocase:powiadomienia@allegromail.pl"],
      subject: ["nocase:została doręczona"]
    },
    arriving: {
      email: ["regex:KurierDPD\\d+@dpd\\.com\\.pl", "exact-nocase:powiadomienia@allegromail.pl"],
      subject: ["nocase:Bezpieczne doręczenie", "nocase:przesyłka została nadana"],
      body: ["nocase:Dziś doręczamy", "nocase:DPD Polska"]
    }
  },
  tracking: {
    patterns: [
      "regex:\\b(?<trackingNumber>\\d{13}[A-Z0-9]{1,2})\\b"
    ]
  }
};

export default rule;
