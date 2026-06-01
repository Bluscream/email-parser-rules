import { OrderRule, EmailData, ParserHelpers, OrderParseResult, RuleMetadata } from "../types";

export const rule: OrderRule = {
  id: "shopify",
  name: "Shopify Order",
  description: "Parses shop-specific order confirmations, shipping updates, and receipts driven by Shopify.",
  icon_url: "https://www.google.com/s2/favicons?domain=shopify.com&sz=128",
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
