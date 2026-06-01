import { ParcelRule, EmailData, ParserHelpers, ParcelParseResult, RuleMetadata } from "../types";

export const rule: ParcelRule = {
  id: "dhl",
  name: "DHL",
  domains: ["dhl.com", "dhl.de"],
  patterns: {
    emails: "^donotreply_odd@dhl\\.com$|^NoReply\\.ODD@dhl\\.com$|^noreply@dhl\\.de$|^pl\\.no\\.reply@dhl\\.com$",
    deliveredSubjects: "DHL On Demand Delivery|Powiadomienie o przesyłce",
    deliveredBodies: "has been delivered|została doręczona|zugestellt",
    arrivingSubjects: "DHL On Demand Delivery|paket kommt heute|Powiadomienie o przesyłce",
    arrivingBodies: "scheduled for delivery TODAY|zostanie dziś do Państwa doręczona",
    trackingNumbers: "\\b(?<trackingNumber>\\d{10,11})\\b"
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

    let trackingUrl = helpers.extractRegex(
      email.bodyPlain,
      "https?:\\/\\/(?:www\\.)?dhl\\.(?:de|com)\\/[^\\s\"'<]+"
    );
    if (trackingUrl) {
      trackingUrl = trackingUrl.replace(/[.,;:!]+$/, "");
    }

    const deliveryWindow = helpers.parseDeliveryWindow(email.bodyPlain);

    const weight = helpers.extractRegex(
      email.bodyPlain,
      "\\b(?<weight>\\d+(?:[.,]\\d+)?)\\s*(?:kg|g|kilogram)\\b",
      "weight"
    );

    return {
      status,
      trackingNumbers: trackingNumbers.length > 0 ? trackingNumbers : undefined,
      trackingUrl,
      deliveryWindow,
      weight
    };
  }
};

export default rule;
