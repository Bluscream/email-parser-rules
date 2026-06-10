import { ReturnRule, EmailData, ParserHelpers, ReturnParseResult, RuleMetadata } from "../types";

export const rule: ReturnRule = {
  id: "amazon",
  name: "Amazon Return",
  description: "Parses Amazon order confirmations, shipping updates, returns, and locker pickup codes.",
  icon_url: "https://www.google.com/s2/favicons?domain=amazon.com&sz=128",
  domains: ["regex:^amazon\\.(com|ca|co\\.uk|in|de|it|com\\.au|pl)$"],
  patterns: {
    emails: "^order-update@amazon\\.(com|ca|co\\.uk|in|de|it|com\\.au|pl)$",
    initiatedSubjects: "Return label for order|Your return is ready|Zwrot przedmiotu z zamówienia",
    refundedSubjects: "Refund confirmation for order|Refund on order|Zwrot kosztów|Rimborsato",
    orderNumbers: "\\b(?<orderNumber>[0-9]{3}-[0-9]{7}-[0-9]{7})\\b",
    deliverySubjectRegex: "^(Delivered|Out for delivery|Dispatched):"
  },
  parse(email: EmailData, helpers: ParserHelpers, meta: RuleMetadata): ReturnParseResult | null {
    if (!helpers.testRegex(email.from, meta.patterns.emails)) return null;

    // Delivery notifications are handled by the parcel rule — skip them here
    if (helpers.testRegex(email.subject, meta.patterns.deliverySubjectRegex)) return null;

    let status: ReturnParseResult["status"] = "unknown";
    if (helpers.testRegex(email.subject, meta.patterns.initiatedSubjects)) {
      status = "initiated";
    } else if (helpers.testRegex(email.subject, meta.patterns.refundedSubjects)) {
      status = "refunded";
    } else {
      status = helpers.getReturnStatusFromKeywords(email.subject, email.bodyPlain);
    }

    // Don't produce a result if we couldn't determine a meaningful return status
    if (status === "unknown") return null;

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
