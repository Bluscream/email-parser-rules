import { CourierRule } from "../types";

export const rule: CourierRule = {
  id: "fedex",
  name: "FedEx",
  domains: ["fedex.com"],
  statusRules: {
    delivered: {
      email: ["exact-nocase:TrackingUpdates@fedex.com", "exact-nocase:fedexcanada@fedex.com"],
      subject: ["nocase:Your package has been delivered", "nocase:Your packages have been delivered"]
    },
    arriving: {
      email: ["exact-nocase:TrackingUpdates@fedex.com", "exact-nocase:fedexcanada@fedex.com"],
      subject: ["nocase:Delivery scheduled for today", "nocase:Your package is scheduled for delivery today", "nocase:Your package is now out for delivery", "nocase:out for delivery today"]
    }
  },
  tracking: {
    patterns: [
      "regex:\\b(?<trackingNumber>\\d{12,20})\\b"
    ]
  }
};

export default rule;
