import { ParcelRule, EmailData, ParserHelpers, ParcelParseResult, RuleMetadata } from "../types";

export const rule: ParcelRule = {
  id: "aliexpress",
  name: "AliExpress",
  description: "Parses AliExpress parcel tracking updates and status messages.",
  icon_url: "https://www.google.com/s2/favicons?domain=aliexpress.com&sz=128",
  domains: ["aliexpress.com"],
  patterns: {
    emails: "^transaction@notice\\.aliexpress\\.com$",
    trackingNumbers: "\\b(?<trackingNumber>[A-Z0-9]{10,25})\\b"
  },
  parse(email: EmailData, helpers: ParserHelpers, meta: RuleMetadata): ParcelParseResult | null {
    if (!helpers.testRegex(email.from, meta.patterns.emails)) return null;

    let status: ParcelParseResult["status"] = "unknown";
    status = helpers.getParcelStatusFromKeywords(email.subject, email.bodyPlain);

    // Try to extract the package tracking number from the subject (e.g. Package H1003660628507201044:)
    const match = email.subject.match(/Package\s+([A-Z0-9]+):/i);
    const trackingNumber = match ? match[1] : undefined;

    return {
      status,
      trackingNumbers: trackingNumber ? [trackingNumber] : undefined
    };
  }
};

export default rule;
