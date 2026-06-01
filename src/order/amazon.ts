import { CourierRule } from "../types";

export const rule: CourierRule = {
  id: "amazon",
  name: "Amazon Order",
  domains: ["amazon.com", "amazon.de", "amazon.co.uk", "amazon.ca", "amazon.in", "amazon.it", "amazon.com.au", "amazon.pl"],
  statusRules: {
    ordered: {
      email: ["regex:^auto-confirm@amazon\\.(com|ca|co\\.uk|in|de|it|com\\.au|pl)$"],
      subject: ["nocase:Your order", "nocase:Bestätigung", "nocase:Potwierdzenie zamówienia", "nocase:Ihre Bestellung"]
    },
    sent: {
      email: ["regex:^shipment-tracking@amazon\\.(com|ca|co\\.uk|in|de|it|com\\.au|pl)$"],
      subject: ["nocase:Your Amazon.com order has shipped", "nocase:versandt"]
    }
  },
  tracking: {
    patterns: ["regex:\\b(?<orderNumber>[0-9]{3}-[0-9]{7}-[0-9]{7})\\b"]
  }
};

export default rule;
