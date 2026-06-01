import { DunningRule, EmailData, ParserHelpers, DunningParseResult, RuleMetadata } from "../types";

export const rule: DunningRule = {
  id: "amazon",
  name: "Amazon Dunning",
  description: "Parses Amazon order confirmations, shipping updates, returns, and locker pickup codes.",
  icon_url: "https://www.google.com/s2/favicons?domain=amazon.com&sz=128",
  domains: ["regex:^amazon\\.(com|ca|co\\.uk|in|de|it|com\\.au|pl)$"],
  patterns: {
    dunningEmails: "^mp-lastschriftservice-ape@amazon\\.(com|ca|co\\.uk|in|de|it|com\\.au|pl)$|^lastschriftservice@amazon\\.(com|ca|co\\.uk|in|de|it|com\\.au|pl)$",
    orderNumbers: "\\b(?<orderNumber>[0-9]{3}-[0-9]{7}-[0-9]{7})\\b",
    dunningId: "(?:zahlungserinnerung|mahnung|letzte mahnung|reminder)\\s+(\\d+)"
  },
  parse(email: EmailData, helpers: ParserHelpers, meta: RuleMetadata): DunningParseResult | null {
    const fromLower = email.from.toLowerCase().trim();
    
    // Screening by email sender address or subject keywords
    const isDunningEmail =
      helpers.testRegex(fromLower, meta.patterns.dunningEmails) ||
      /zahlungserinnerung|mahnung|letzte mahnung/i.test(email.subject);

    if (!isDunningEmail) return null;

    const status = helpers.getDunningStatusFromKeywords(email.subject, email.bodyPlain);

    const orderNumbers = helpers.extractAllRegex(
      `${email.subject}\n${email.bodyPlain}`,
      meta.patterns.orderNumbers,
      "orderNumber"
    );

    const dunningId = helpers.extractRegex(
      email.subject,
      meta.patterns.dunningId,
      1
    );

    return {
      status,
      orderNumbers: orderNumbers.length > 0 ? orderNumbers : undefined,
      dunningId,
      merchant: "Amazon"
    };
  }
};

export default rule;
