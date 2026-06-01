import { CourierRule } from "../types";

export const rule: CourierRule = {
  id: "shopify",
  name: "Shopify Order",
  domains: ["shopify.com", "shopifyemail.com"],
  statusRules: {
    ordered: {
      subject: ["nocase:Order confirmed", "nocase:Thank you for your order", "nocase:Potwierdzenie zamówienia"]
    }
  },
  tracking: {
    patterns: [
      "regex:order\\s+#(?<orderNumber>\\d+)\\b"
    ]
  }
};

export default rule;
