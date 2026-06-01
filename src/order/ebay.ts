import { CourierRule } from "../types";

export const rule: CourierRule = {
  id: "ebay",
  name: "eBay Order",
  domains: ["ebay.com", "ebay.ca", "ebay.co.uk", "ebay.de", "ebay.it", "ebay.com.au", "ebay.pl"],
  statusRules: {
    ordered: {
      email: ["regex:^ebay@ebay\\.(com|ca|co\\.uk|de|it|com\\.au|pl)$"],
      subject: ["nocase:Order confirmed", "nocase:Bestätigung Ihres Kaufs", "nocase:Kupione", "nocase:Your eBay order"]
    }
  },
  tracking: {
    patterns: [
      "regex:\\b(?<orderNumber>\\d{2}-\\d{5}-\\d{5})\\b"
    ]
  }
};

export default rule;
