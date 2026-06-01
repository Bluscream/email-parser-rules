import { ParcelRule, EmailData, ParserHelpers, ParcelParseResult, RuleMetadata } from "../types";

export const rule: ParcelRule = {
  id: "ups",
  name: "UPS",
  description: "Parses UPS package tracking, delivery schedules, and confirmation emails.",
  icon_url: "https://www.google.com/s2/favicons?domain=ups.com&sz=128",
  domains: ["ups.com"],
  patterns: {
    emails: "^mcinfo@ups\\.com$",
    deliveredSubjects: "Your UPS Package was delivered|Your UPS Packages were delivered",
    arrivingSubjects: "UPS Update: Package Scheduled for Delivery Today|UPS Update: Follow Your Delivery on a Live Map|UPS Pre-Arrival: Your Driver is Arriving Soon! Follow on a Live Map",
    exceptionSubjects: "UPS Update: New Scheduled Delivery Date",
    trackingNumbers: "\\b(?<trackingNumber>1Z?[0-9A-Z]{16})\\b"
  },
  parse(email: EmailData, helpers: ParserHelpers, meta: RuleMetadata): ParcelParseResult | null {
    if (!helpers.testRegex(email.from, meta.patterns.emails)) return null;

    let status: ParcelParseResult["status"] = "unknown";
    if (helpers.testRegex(email.subject, meta.patterns.deliveredSubjects)) {
      status = "delivered";
    } else if (helpers.testRegex(email.subject, meta.patterns.arrivingSubjects)) {
      status = "arriving";
    } else if (helpers.testRegex(email.subject, meta.patterns.exceptionSubjects)) {
      status = "exception";
    } else {
      status = helpers.getParcelStatusFromKeywords(email.subject, email.bodyPlain);
    }

    const trackingNumbers = helpers.extractAllRegex(
      `${email.subject}\n${email.bodyPlain}`,
      meta.patterns.trackingNumbers,
      "trackingNumber"
    );

    return {
      status,
      trackingNumbers: trackingNumbers.length > 0 ? trackingNumbers : undefined
    };
  }
};

export default rule;
