import { CourierRule } from "../types";

export const rule: CourierRule = {
  id: "royal",
  name: "Royal Mail",
  domains: ["royalmail.com"],
  statusRules: {
    delivered: {
      email: ["exact-nocase:no-reply@royalmail.com"],
      subject: ["nocase:has been delivered"]
    },
    arriving: {
      email: ["exact-nocase:no-reply@royalmail.com"],
      subject: ["nocase:is on its way", "nocase:to be delivered today"]
    }
  },
  tracking: {
    patterns: [
      "regex:\\b(?<trackingNumber>[A-Za-z]{2}[0-9]{9}GB)\\b"
    ]
  }
};

export default rule;
