import { CourierRule } from "../types";

export const rule: CourierRule = {
  id: "auspost",
  name: "Australia Post",
  domains: ["auspost.com.au", "notifications.auspost.com.au"],
  statusRules: {
    delivered: {
      email: ["exact-nocase:noreply@notifications.auspost.com.au"],
      subject: ["nocase:Your shipment has been delivered"]
    },
    arriving: {
      email: ["exact-nocase:noreply@notifications.auspost.com.au"],
      subject: ["nocase:is on its way", "nocase:is coming today"]
    }
  },
  tracking: {
    patterns: [
      "regex:\\b(?<trackingNumber>\\d{7,12}|[A-Za-z]{2}[0-9]{9}AU)\\b"
    ]
  }
};

export default rule;
