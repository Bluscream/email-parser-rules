import { ParcelRule, EmailData, ParserHelpers, ParcelParseResult, RuleMetadata } from "../types";

export const rule: ParcelRule = {
  id: "usps",
  name: "USPS",
  domains: ["usps.com"],
  patterns: {
    emails: "^auto-reply@usps\\.com$",
    deliveredSubjects: "Item Delivered",
    arrivingSubjects: "Expected Delivery on|Out for Delivery",
    arrivingBodies: "Your item is out for delivery",
    exceptionSubjects: "Delivery Exception",
    trackingNumbers: "\\b(?<trackingNumber>9[2345]\\d{15,26})\\b"
  },
  parse(email: EmailData, helpers: ParserHelpers, meta: RuleMetadata): ParcelParseResult | null {
    if (!helpers.testRegex(email.from, meta.patterns.emails)) return null;

    let status: ParcelParseResult["status"] = "unknown";
    if (helpers.testRegex(email.subject, meta.patterns.deliveredSubjects)) {
      status = "delivered";
    } else if (
      helpers.testRegex(email.subject, meta.patterns.arrivingSubjects) ||
      helpers.testRegex(email.bodyPlain, meta.patterns.arrivingBodies)
    ) {
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
