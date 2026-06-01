import { CourierRule } from "../types";

export const rule: CourierRule = {
  id: "inpost_pl",
  name: "InPost PL",
  domains: ["inpost.pl", "paczkomaty.pl"],
  statusRules: {
    delivered: {
      email: ["exact-nocase:powiadomienia@inpost.pl", "exact-nocase:info@paczkomaty.pl", "exact-nocase:powiadomienia@allegromail.pl"],
      subject: ["nocase:InPost - Potwierdzenie odbioru", "nocase:InPost - Paczka umieszczona w Paczkomacie"]
    },
    arriving: {
      email: ["exact-nocase:powiadomienia@inpost.pl", "exact-nocase:info@paczkomaty.pl", "exact-nocase:powiadomienia@allegromail.pl"],
      subject: ["nocase:Kurier InPost: Twoja paczka jest w drodze", "nocase:prawie u Ciebie"]
    }
  },
  tracking: {
    patterns: [
      "regex:\\b(?<trackingNumber>\\d{24})\\b"
    ]
  }
};

export default rule;
