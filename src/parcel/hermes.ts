import { ParcelRule, EmailData, ParserHelpers, ParcelParseResult, RuleMetadata } from "../types";

export const rule: ParcelRule = {
  id: "hermes",
  name: "Hermes",
  description: "Parses Evri / Hermes parcel tracking updates and delivery notifications.",
  icon_url: "https://www.google.com/s2/favicons?domain=evri.com&sz=128",
  domains: ["myhermes.co.uk"],
  patterns: {
    emails: "^donotreply@myhermes\\.co\\.uk$",
    deliveredSubjects: "Hermes has successfully delivered your",
    arrivingSubjects: "parcel is now with your local Hermes courier",
    trackingNumbers: "\\b(?<trackingNumber>\\d{16})\\b"
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
