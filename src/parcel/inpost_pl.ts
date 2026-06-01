import { ParcelRule, EmailData, ParserHelpers, ParcelParseResult, RuleMetadata } from "../types";

export const rule: ParcelRule = {
  id: "inpost_pl",
  name: "InPost PL",
  description: "Parses InPost Paczkomaty locker collection codes and delivery updates.",
  icon_url: "https://www.google.com/s2/favicons?domain=inpost.pl&sz=128",
  domains: ["inpost.pl", "paczkomaty.pl", "allegromail.pl"],
  patterns: {
    emails: "^powiadomienia@inpost\\.pl$|^info@paczkomaty\\.pl$|^powiadomienia@allegromail\\.pl$",
    deliveredSubjects: "InPost - Potwierdzenie odbioru|InPost - Paczka umieszczona w Paczkomacie",
    arrivingSubjects: "Kurier InPost: Twoja paczka jest w drodze|prawie u Ciebie",
    trackingNumbers: "\\b(?<trackingNumber>\\d{24})\\b"
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
