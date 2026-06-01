import { ParcelRule, EmailData, ParserHelpers, ParcelParseResult, RuleMetadata } from "../types";

export const rule: ParcelRule = {
  id: "gls",
  name: "GLS",
  domains: ["gls-group.eu", "allegromail.pl"],
  patterns: {
    emails: "^noreply@gls-group\\.eu$|^powiadomienia@allegromail\\.pl$",
    deliveredSubjects: "informacja o dostawie",
    deliveredBodies: "została dzisiaj dostarczona",
    arrivingSubjects: "paczka w drodze",
    arrivingBodies: "Zespół GLS",
    trackingNumbers: "\\b(?<trackingNumber>\\d{11})\\b"
  },
  parse(email: EmailData, helpers: ParserHelpers, meta: RuleMetadata): ParcelParseResult | null {
    if (!helpers.testRegex(email.from, meta.patterns.emails)) return null;

    let status: ParcelParseResult["status"] = "unknown";
    if (
      helpers.testRegex(email.subject, meta.patterns.deliveredSubjects) &&
      helpers.testRegex(email.bodyPlain, meta.patterns.deliveredBodies)
    ) {
      status = "delivered";
    } else if (
      helpers.testRegex(email.subject, meta.patterns.arrivingSubjects) &&
      helpers.testRegex(email.bodyPlain, meta.patterns.arrivingBodies)
    ) {
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
