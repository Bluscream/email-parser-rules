import { CourierRule } from "../types";

export const rule: CourierRule = {
  id: "usps",
  name: "USPS",
  domains: ["usps.com"],
  statusRules: {
    delivered: {
      email: [
        "exact:auto-reply@usps.com"
      ],
      subject: [
        "nocase:delivered"
      ]
    },
    arriving: {
      email: [
        "exact:auto-reply@usps.com"
      ],
      subject: [
        "nocase:expected delivery"
      ]
    }
  },
  tracking: {
    patterns: [
      "regex:\\b(?<trackingNumber>9[0-9]{20,22})\\b"
    ]
  }
};

export default rule;
