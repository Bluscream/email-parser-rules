import { ParcelRule, EmailData, ParserHelpers, ParcelParseResult, RuleMetadata } from "../types";

export const rule: ParcelRule = {
  id: "poczta_polska",
  name: "Poczta Polska",
  domains: ["poczta-polska.pl", "allegromail.pl"],
  patterns: {
    emails: "^informacja@poczta-polska\\.pl$|^powiadomienia@allegromail\\.pl$",
    arrivingSubjects: "Poczta Polska S.A. eINFO",
    trackingNumbers: "\\b(?<trackingNumber>\\d{20})\\b"
  },
  parse(email: EmailData, helpers: ParserHelpers, meta: RuleMetadata): ParcelParseResult | null {
    if (!helpers.testRegex(email.from, meta.patterns.emails)) return null;

    let status: ParcelParseResult["status"] = "unknown";
    if (helpers.testRegex(email.subject, meta.patterns.arrivingSubjects)) {
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
