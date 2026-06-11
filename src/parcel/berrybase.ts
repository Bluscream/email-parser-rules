import { ParcelRule, EmailData, ParserHelpers, ParcelParseResult, RuleMetadata } from "../types";

export const rule: ParcelRule = {
  id: "berrybase",
  name: "BerryBase Shipping",
  description: "Parses BerryBase / Sertronics shipping notifications (typically via DHL).",
  icon_url: "https://www.google.com/s2/favicons?domain=berrybase.de&sz=128",
  domains: ["sertronics.shop", "berrybase.de"],
  patterns: {
    // Fixed typo: norplay → noreply
    emails: "^(noreply|info|versand|shipping)@(sertronics\\.shop|berrybase\\.de)$",
    arrivingSubjects: "versandt|versendet|shipped|tracking|DHL",
    // DHL tracking numbers: 10–22 digits, starting with 00340 for DHL Paket DE
    // or JD/JVGL prefix for DHL Express. Also catch generic long alphanumeric codes.
    trackingNumbers: "\\b(?<trackingNumber>(?:00340\\d{15,17}|JD\\d{14,18}|[A-Z]{2}\\d{9}[A-Z]{2}|\\d{10,20}))\\b"
  },
  parse(email: EmailData, helpers: ParserHelpers, meta: RuleMetadata): ParcelParseResult | null {
    if (!helpers.testRegex(email.from, meta.patterns.emails)) return null;

    let status: ParcelParseResult["status"] = "unknown";
    if (helpers.testRegex(email.subject, meta.patterns.arrivingSubjects)) {
      status = "sent";
    } else {
      status = helpers.getParcelStatusFromKeywords(email.subject, email.bodyPlain);
    }

    const trackingNumbers = helpers.extractAllRegex(
      `${email.subject}\n${email.bodyPlain}`,
      meta.patterns.trackingNumbers,
      "trackingNumber"
    );

    // Prefer the longer / more specific number (DHL 00340... numbers are very specific)
    const uniqueNumbers = [...new Set(trackingNumbers)];

    return {
      status,
      courier: "DHL",
      trackingNumbers: uniqueNumbers.length > 0 ? uniqueNumbers : undefined
    };
  }
};

export default rule;
