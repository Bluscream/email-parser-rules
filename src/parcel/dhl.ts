import { CourierRule } from "../types";

export const rule: CourierRule = {
  id: "dhl",
  name: "DHL",
  domains: ["dhl.com", "dhl.de"],
  statusRules: {
    delivered: {
      email: [
        "exact:donotreply_odd@dhl.com",
        "exact-nocase:NoReply.ODD@dhl.com",
        "exact:noreply@dhl.de",
        "exact:pl.no.reply@dhl.com"
      ],
      body: [
        "nocase:delivered",
        "nocase:zugestellt",
        "nocase:doręczona",
        "nocase:consegna effettuata"
      ]
    },
    arriving: {
      email: [
        "exact:donotreply_odd@dhl.com",
        "exact-nocase:NoReply.ODD@dhl.com",
        "exact:noreply@dhl.de",
        "exact:pl.no.reply@dhl.com"
      ],
      subject: [
        "nocase:delivery update",
        "nocase:kommt heute",
        "nocase:in arrivo",
        "nocase:w drodze",
        "nocase:twoja paczka jest w drodze"
      ]
    }
  },
  tracking: {
    patterns: [
      "regex:\\b(?<trackingNumber>\\d{10})\\b"
    ]
  }
};

export default rule;
