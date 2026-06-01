import { OrderRule, EmailData, ParserHelpers, OrderParseResult, RuleMetadata } from "../types";

export const rule: OrderRule = {
  id: "amazon",
  name: "Amazon Order",
  domains: ["regex:^amazon\\.(com|ca|co\\.uk|in|de|it|com\\.au|pl)$"],
  patterns: {
    confirmedEmails: "^(auto-confirm|bestaetigung|bestellung-aktuell|payments-update)@amazon\\.(com|ca|co\\.uk|in|de|it|com\\.au|pl)$",
    confirmedSubjects: "Your order|Bestätigung|Potwierdzenie zamówienia|Ihre Bestellung|Order Confirmation",
    shippedEmails: "^(shipment-tracking|versandbestaetigung|dispatch-confirmation)@amazon\\.(com|ca|co\\.uk|in|de|it|com\\.au|pl)$",
    shippedSubjects: "Your Amazon.com order has shipped|versandt|dispatched|spedita|enviado",
    ignoredEmails: "^(no-reply|rueckgabe)@amazon\\.(com|ca|co\\.uk|in|de|it|com\\.au|pl)$",
    ignoredSubjects: "Zahlungsbestätigung|Payment confirmation|Conferma di pagamento",
    orderNumbers: "\\b(?<orderNumber>[0-9]{3}-[0-9]{7}-[0-9]{7})\\b"
  },
  parse(email: EmailData, helpers: ParserHelpers, meta: RuleMetadata): OrderParseResult | null {
    const fromLower = email.from.toLowerCase().trim();
    if (
      fromLower.startsWith("mp-lastschriftservice-ape@") ||
      fromLower.startsWith("lastschriftservice@") ||
      fromLower.startsWith("cs-reply@") ||
      /zahlungserinnerung|mahnung|letzte mahnung|kundenkonto|customer account|anfrage bei|ihr gespräch mit/i.test(email.subject)
    ) {
      return null;
    }

    // Ignore payment-only emails from no-reply@ and return emails from rueckgabe@ — let the return rule handle those
    if (
      helpers.testRegex(fromLower, meta.patterns.ignoredEmails)
    ) {
      return null;
    }

    let status: OrderParseResult["status"] = "unknown";
    if (
      helpers.testRegex(email.from, meta.patterns.confirmedEmails) &&
      helpers.testRegex(email.subject, meta.patterns.confirmedSubjects)
    ) {
      status = "confirmed";
    } else if (
      helpers.testRegex(email.from, meta.patterns.shippedEmails) &&
      helpers.testRegex(email.subject, meta.patterns.shippedSubjects)
    ) {
      status = "shipped";
    } else {
      const domainAlt = meta.domains.map(d => d.replace(/\./g, "\\.")).join("|");
      const isMatch = new RegExp(`@(${domainAlt})$`, "i").test(email.from);
      if (!isMatch) return null;
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
