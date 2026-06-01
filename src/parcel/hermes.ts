import { CourierRule } from "../types";

export const rule: CourierRule = {
  id: "hermes",
  name: "Hermes",
  domains: ["myhermes.co.uk"],
  statusRules: {
    delivered: {
      email: ["exact-nocase:donotreply@myhermes.co.uk"],
      subject: ["nocase:Hermes has successfully delivered your"]
    },
    arriving: {
      email: ["exact-nocase:donotreply@myhermes.co.uk"],
      subject: ["nocase:parcel is now with your local Hermes courier"]
    }
  },
  tracking: {
    patterns: [
      "regex:\\b(?<trackingNumber>\\d{16})\\b"
    ]
  }
};

export default rule;
