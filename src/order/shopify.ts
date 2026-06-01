import { OrderRule, EmailData, ParserHelpers, OrderParseResult, RuleMetadata } from "../types";

export const rule: OrderRule = {
  id: "shopify",
  name: "Shopify Order",
  domains: ["shopify.com", "shopifyemail.com"],
  patterns: {
    confirmedSubjects: "Order confirmed|Thank you for your order|Potwierdzenie zamówienia",
    orderNumbers: "order\\s+#(?<orderNumber>\\d+)\\b"
  },
  parse(email: EmailData, helpers: ParserHelpers, meta: RuleMetadata): OrderParseResult | null {
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
