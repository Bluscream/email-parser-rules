import { CourierRule } from "../types";

export const rule: CourierRule = {
  id: "amazon",
  name: "Amazon Return",
  domains: ["amazon.com", "amazon.de", "amazon.co.uk", "amazon.ca", "amazon.in", "amazon.it", "amazon.com.au", "amazon.pl"],
  statusRules: {
    ordered: {
      email: ["regex:^order-update@amazon\\.(com|ca|co\\.uk|in|de|it|com\\.au|pl)$"],
      subject: ["nocase:Return label for order", "nocase:Your return is ready", "nocase:Zwrot przedmiotu z zamówienia"]
    },
    delivered: {
      email: ["regex:^order-update@amazon\\.(com|ca|co\\.uk|in|de|it|com\\.au|pl)$"],
      subject: ["nocase:Refund confirmation for order", "nocase:Refund on order", "nocase:Zwrot kosztów", "nocase:Rimborsato"]
    }
  },
  tracking: {
    patterns: ["regex:\\b(?<orderNumber>[0-9]{3}-[0-9]{7}-[0-9]{7})\\b"]
  }
};

export default rule;
