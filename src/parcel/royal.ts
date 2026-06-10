import { ParcelRule, EmailData, ParserHelpers, ParcelParseResult, RuleMetadata } from "../types";

export const rule: ParcelRule = {
  id: "royal",
  name: "Royal Mail",
  description: "Parses Royal Mail postage confirmations, delivery statuses, and collection updates.",
  icon_url: "https://www.google.com/s2/favicons?domain=royalmail.com&sz=128",
  domains: ["royalmail.com"],
  patterns: {
    emails: "^no-reply@royalmail\\.com$",
    deliveredSubjects: "has been delivered",
    arrivingSubjects: "is on its way|to be delivered today",
    trackingNumbers: "\\b(?<trackingNumber>[A-Za-z]{2}[0-9]{9}GB)\\b"
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
