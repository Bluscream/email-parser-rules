import { CourierRule } from "../types";

export const rule: CourierRule = {
  id: "poczta_polska",
  name: "Poczta Polska",
  domains: ["poczta-polska.pl"],
  statusRules: {
    arriving: {
      email: ["exact-nocase:informacja@poczta-polska.pl", "exact-nocase:powiadomienia@allegromail.pl"],
      subject: ["nocase:Poczta Polska S.A. eINFO"]
    }
  },
  tracking: {
    patterns: [
      "regex:\\b(?<trackingNumber>\\d{20})\\b"
    ]
  }
};

export default rule;
