import { ParcelRule, EmailData, ParserHelpers, ParcelParseResult, RuleMetadata } from "../types";

export const rule: ParcelRule = {
  id: "ebay",
  name: "eBay Shipment",
  description: "Parses eBay shipment notifications and tracking updates from sellers.",
  icon_url: "https://www.google.com/s2/favicons?domain=ebay.com&sz=128",
  domains: ["ebay.com", "ebay.de", "ebay.ca", "ebay.co.uk"],
  patterns: {
    // eBay sends shipping confirmations from ebay@ or from seller-notification addresses
    emails: "^(ebay|member|notification)@ebay\\.(com|de|ca|co\\.uk|it|com\\.au|pl)$",
    arrivingSubjects: "shipped|versandt|dispatched|tracking|on its way|unterwegs|your.*item.*shipped",
    deliveredSubjects: "delivered|zugestellt|angekommen",
    // eBay shipping tracking: DHL (digits), Hermes (H+digits), UPS (1Z...), generic
    trackingNumbers: "\\b(?<trackingNumber>(?:1Z[A-Z0-9]{16}|H\\d{14,20}|00340\\d{15,17}|[A-Z]{2}\\d{9}[A-Z]{2}|\\d{12,22}))\\b",
    // eBay order number pattern: 12-digit (e.g. 12-34567-89012) or plain digits
    orderNumbers: "\\b(?<orderNumber>\\d{2}-\\d{5}-\\d{5})\\b"
  },
  parse(email: EmailData, helpers: ParserHelpers, meta: RuleMetadata): ParcelParseResult | null {
    if (!helpers.testRegex(email.from, meta.patterns.emails)) return null;

    // Only process if subject looks like a shipping notification
    const isShipment = helpers.testRegex(email.subject, meta.patterns.arrivingSubjects) ||
                       helpers.testRegex(email.subject, meta.patterns.deliveredSubjects);
    if (!isShipment) return null;

    let status: ParcelParseResult["status"] = "sent";
    if (helpers.testRegex(email.subject, meta.patterns.deliveredSubjects)) {
      status = "delivered";
    } else if (helpers.testRegex(email.subject, meta.patterns.arrivingSubjects)) {
      status = "sent";
    }

    const searchText = `${email.subject}\n${email.bodyPlain}`;

    const trackingNumbers = helpers.extractAllRegex(
      searchText,
      meta.patterns.trackingNumbers,
      "trackingNumber"
    );

    const orderNumbers = helpers.extractAllRegex(
      searchText,
      meta.patterns.orderNumbers,
      "orderNumber"
    );

    return {
      status,
      trackingNumbers: trackingNumbers.length > 0 ? trackingNumbers : undefined,
      orderNumbers: orderNumbers.length > 0 ? orderNumbers : undefined
    };
  }
};

export default rule;
