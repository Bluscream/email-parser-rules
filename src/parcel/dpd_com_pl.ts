import { ParcelRule, EmailData, ParserHelpers, ParcelParseResult, RuleMetadata } from "../types";

export const rule: ParcelRule = {
  id: "dpd_com_pl",
  name: "DPD PL",
  description: "Parses DPD delivery tracking, scheduling updates, and receipt confirmations.",
  icon_url: "https://www.google.com/s2/favicons?domain=dpd.com&sz=128",
  domains: ["dpd.com.pl", "allegromail.pl"],
  patterns: {
    emails: "KurierDPD\\d+@dpd\\.com\\.pl|^powiadomienia@allegromail\\.pl$",
    deliveredSubjects: "została doręczona",
    arrivingSubjects: "Bezpieczne doręczenie|przesyłka została nadana",
    arrivingBodies: "Dziś doręczamy|DPD Polska",
    trackingNumbers: "\\b(?<trackingNumber>\\d{13}[A-Z0-9]{1,2})\\b"
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
