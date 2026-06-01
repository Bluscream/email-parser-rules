import { CourierRule } from "../types";

export const rule: CourierRule = {
  id: "gls",
  name: "GLS",
  domains: ["gls-group.eu"],
  statusRules: {
    delivered: {
      email: ["exact-nocase:noreply@gls-group.eu", "exact-nocase:powiadomienia@allegromail.pl"],
      subject: ["nocase:informacja o dostawie"],
      body: ["nocase:została dzisiaj dostarczona"]
    },
    arriving: {
      email: ["exact-nocase:noreply@gls-group.eu", "exact-nocase:powiadomienia@allegromail.pl"],
      subject: ["nocase:paczka w drodze"],
      body: ["nocase:Zespół GLS"]
    }
  },
  tracking: {
    patterns: [
      "regex:\\b(?<trackingNumber>\\d{11})\\b"
    ]
  }
};

export default rule;
