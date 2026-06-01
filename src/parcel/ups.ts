import { CourierRule } from "../types";

export const rule: CourierRule = {
  id: "ups",
  name: "UPS",
  domains: ["ups.com"],
  statusRules: {
    delivered: {
      email: ["exact-nocase:mcinfo@ups.com"],
      subject: ["nocase:Your UPS Package was delivered", "nocase:Your UPS Packages were delivered"]
    },
    arriving: {
      email: ["exact-nocase:mcinfo@ups.com"],
      subject: ["nocase:UPS Update: Package Scheduled for Delivery Today", "nocase:UPS Update: Follow Your Delivery on a Live Map", "nocase:UPS Pre-Arrival: Your Driver is Arriving Soon! Follow on a Live Map"]
    },
    exception: {
      email: ["exact-nocase:mcinfo@ups.com"],
      subject: ["nocase:UPS Update: New Scheduled Delivery Date"]
    }
  },
  tracking: {
    patterns: [
      "regex:\\b(?<trackingNumber>1Z?[0-9A-Z]{16})\\b"
    ]
  }
};

export default rule;
