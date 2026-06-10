import { ParcelRule, EmailData, ParserHelpers, ParcelParseResult, RuleMetadata } from "../types";

export const rule: ParcelRule = {
  id: "capost",
  name: "Canada Post",
  description: "Parses Canada Post shipping notifications and delivery confirmations.",
  icon_url: "https://www.google.com/s2/favicons?domain=canadapost.ca&sz=128",
  domains: ["canadapost.ca", "postescanada.ca"],
  patterns: {
    emails: "^donotreply@canadapost\\.postescanada\\.ca$",
    deliveredSubjects: "Delivery Notification"
  },
  parse(email: EmailData, helpers: ParserHelpers, meta: RuleMetadata): ParcelParseResult | null {
    if (!helpers.testRegex(email.from, meta.patterns.emails)) return null;

    let status: ParcelParseResult["status"] = "unknown";
    if (helpers.testRegex(email.subject, meta.patterns.deliveredSubjects)) {
      status = "delivered";
    } else {
      status = "arriving";
    }

    return {
      status
    };
  }
};

export default rule;
