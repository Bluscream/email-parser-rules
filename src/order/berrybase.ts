import { OrderRule, EmailData, ParserHelpers, OrderParseResult, RuleMetadata } from "../types";

export const rule: OrderRule = {
  id: "berrybase",
  name: "BerryBase Order",
  description: "Parses BerryBase / Sertronics purchase confirmations and order updates.",
  icon_url: "https://www.google.com/s2/favicons?domain=berrybase.de&sz=128",
  domains: ["sertronics.shop", "berrybase.de"],
  patterns: {
    // Fixed typo: norplay → noreply. Also covers info@ and bestellungen@
    emails: "^(noreply|info|bestellungen|shop)@(sertronics\\.shop|berrybase\\.de)$",
    confirmedSubjects: "Eingangsbestätigung|Bestellbestätigung|Bestellung|order confirmation|Ihre Bestellung",
    shippedSubjects: "versandt|versendet|shipped|tracking",
    // BerryBase order numbers are typically 5-9 digits, prefixed with # or various labels
    orderNumbers: "(?:Bestellung(?:snummer)?|Auftrag(?:snummer)?|Order(?:\\s+No\\.?)?|#)\\s*:?\\s*(?<orderNumber>\\d{5,9})\\b"
  },
  parse(email: EmailData, helpers: ParserHelpers, meta: RuleMetadata): OrderParseResult | null {
    if (!helpers.testRegex(email.from, meta.patterns.emails)) return null;

    let status: OrderParseResult["status"] = "unknown";
    if (helpers.testRegex(email.subject, meta.patterns.confirmedSubjects)) {
      status = "confirmed";
    } else if (helpers.testRegex(email.subject, meta.patterns.shippedSubjects)) {
      status = "shipped";
    } else {
      status = helpers.getOrderStatusFromKeywords(email.subject, email.bodyPlain);
    }

    const orderNumbers = helpers.extractAllRegex(
      `${email.subject}\n${email.bodyPlain}`,
      meta.patterns.orderNumbers,
      "orderNumber"
    );

    return {
      status,
      orderNumbers: orderNumbers.length > 0 ? orderNumbers : undefined
    };
  }
};

export default rule;
