import { CourierRule } from "../types";

export const rule: CourierRule = {
  id: "paypal",
  name: "PayPal Refund",
  domains: ["paypal.com", "paypal.co.uk", "paypal.de", "paypal.pl", "paypal.it"],
  statusRules: {
    delivered: {
      email: ["regex:^service@paypal\\.(com|co\\.uk|de|pl|it)$"],
      subject: [
        "nocase:Refund from",
        "nocase:Zwrot pieniędzy od",
        "nocase:Rückzahlung von",
        "nocase:Zwrot od",
        "nocase:Remboursement de"
      ]
    }
  }
};

export default rule;
