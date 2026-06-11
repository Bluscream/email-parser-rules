import { OrderRule, EmailData, ParserHelpers, OrderParseResult, RuleMetadata } from "../types";

export const rule: OrderRule = {
  id: "jlcpcb",
  name: "JLCPCB Order",
  description: "Parses JLCPCB order confirmations.",
  icon_url: "https://www.google.com/s2/favicons?domain=jlcpcb.com&sz=128",
  domains: ["jlcpcb.com"],
  patterns: {
    emails: "^noreply@jlcpcb\\.com$|^support@jlcpcb\\.com$",
    confirmedSubjects: "payment received|confirmed|placed successfully|Order",
    orderNumbers: "(?:Order|Bestellung|Order Number:?)\\s*#?\\s*(?<orderNumber>(?:JL)?\\d{6,15})\\b"
  },
  parse(email: EmailData, helpers: ParserHelpers, meta: RuleMetadata): OrderParseResult | null {
    if (!helpers.testRegex(email.from, meta.patterns.emails)) return null;

    let status: OrderParseResult["status"] = "unknown";
    if (helpers.testRegex(email.subject, meta.patterns.confirmedSubjects)) {
      status = "confirmed";
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
