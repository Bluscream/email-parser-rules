import { ReturnRule, EmailData, ParserHelpers, ReturnParseResult, RuleMetadata } from "../types";

export const rule: ReturnRule = {
  id: "paypal",
  name: "PayPal Refund",
  domains: ["regex:^paypal\\.(com|co\\.uk|de|pl|it)$"],
  patterns: {
    emails: "^service@paypal\\.(com|co\\.uk|de|pl|it)$",
    refundedSubjects: "Refund from|Zwrot pieniędzy od|Rückzahlung von|Zwrot od|Remboursement de"
  },
  parse(email: EmailData, helpers: ParserHelpers, meta: RuleMetadata): ReturnParseResult | null {
    if (!helpers.testRegex(email.from, meta.patterns.emails)) return null;

    let status: ReturnParseResult["status"] = "unknown";
    if (helpers.testRegex(email.subject, meta.patterns.refundedSubjects)) {
      status = "refunded";
    } else {
      status = helpers.getReturnStatusFromKeywords(email.subject, email.bodyPlain);
    }

    return {
      status
    };
  }
};

export default rule;