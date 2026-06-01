import { OrderRule, EmailData, ParserHelpers, OrderParseResult, RuleMetadata } from "../types";

export const rule: OrderRule = {
  id: "ebay",
  name: "eBay Order",
  domains: ["regex:^ebay\\.(com|ca|co\\.uk|de|it|com\\.au|pl)$"],
  patterns: {
    emails: "^ebay@ebay\\.(com|ca|co\\.uk|de|it|com\\.au|pl)$",
    confirmedSubjects: "Order confirmed|Bestätigung Ihres Kaufs|Kupione|Your eBay order",
    orderNumbers: "\\b(?<orderNumber>\\d{2}-\\d{5}-\\d{5})\\b"
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
