import { ParcelRule, EmailData, ParserHelpers, ParcelParseResult, RuleMetadata } from "../types";

export const rule: ParcelRule = {
  id: "fedex",
  name: "FedEx",
  domains: ["fedex.com"],
  patterns: {
    emails: "^TrackingUpdates@fedex\\.com$|^fedexcanada@fedex\\.com$",
    deliveredSubjects: "Your package has been delivered|Your packages have been delivered",
    arrivingSubjects: "Delivery scheduled for today|Your package is scheduled for delivery today|Your package is now out for delivery|out for delivery today",
    trackingNumbers: "\\b(?<trackingNumber>\\d{12,20})\\b"
  },
  parse(email: EmailData, helpers: ParserHelpers, meta: RuleMetadata): ParcelParseResult | null {
    if (!helpers.testRegex(email.from, meta.patterns.emails)) return null;

    let status: ParcelParseResult["status"] = "unknown";
    if (helpers.testRegex(email.subject, meta.patterns.deliveredSubjects)) {
      status = "delivered";
    } else if (helpers.testRegex(email.subject, meta.patterns.arrivingSubjects)) {
      status = "arriving";
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
