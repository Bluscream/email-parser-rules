import { ParcelRule, EmailData, ParserHelpers, ParcelParseResult, RuleMetadata } from "../types";

export const rule: ParcelRule = {
  id: "auspost",
  name: "Australia Post",
  domains: ["auspost.com.au", "notifications.auspost.com.au"],
  patterns: {
    emails: "^noreply@notifications\\.auspost\\.com\\.au$",
    deliveredSubjects: "Your shipment has been delivered",
    arrivingSubjects: "is on its way|is coming today",
    trackingNumbers: "\\b(?<trackingNumber>\\d{7,12}|[A-Za-z]{2}[0-9]{9}AU)\\b"
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
