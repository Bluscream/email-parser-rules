import { ParcelRule, EmailData, ParserHelpers, ParcelParseResult, RuleMetadata } from "../types";

export const rule: ParcelRule = {
  id: "jlcpcb",
  name: "JLCPCB Shipping",
  description: "Parses JLCPCB shipping notifications (ships via DHL, 4PX, or local couriers).",
  icon_url: "https://www.google.com/s2/favicons?domain=jlcpcb.com&sz=128",
  domains: ["jlcpcb.com"],
  patterns: {
    // JLCPCB uses noreply@, support@, and shipping@
    emails: "^(noreply|support|shipping|order|no-reply)@jlcpcb\\.com$",
    arrivingSubjects: "shipped|dispatched|tracking|shipment|has been sent|your order.*on its way",
    // 4PX tracking: starts with RF/RG/RK/GS, 13 chars  |  DHL: 10-22 digits
    // Generic alphanumeric: uppercase letters + digits, 10-30 chars
    trackingNumbers: "\\b(?<trackingNumber>(?:[A-Z]{2}\\d{9}[A-Z]{2}|00340\\d{15,17}|[A-Z]{2,4}\\d{8,20}|\\d{12,22}))\\b"
  },
  parse(email: EmailData, helpers: ParserHelpers, meta: RuleMetadata): ParcelParseResult | null {
    if (!helpers.testRegex(email.from, meta.patterns.emails)) return null;

    let status: ParcelParseResult["status"] = "unknown";
    if (helpers.testRegex(email.subject, meta.patterns.arrivingSubjects)) {
      status = "sent";
    } else {
      status = helpers.getParcelStatusFromKeywords(email.subject, email.bodyPlain);
    }

    // Search both subject and body for tracking numbers
    const searchText = `${email.subject}\n${email.bodyPlain}`;
    const trackingNumbers = helpers.extractAllRegex(
      searchText,
      meta.patterns.trackingNumbers,
      "trackingNumber"
    );

    // Also try to find tracking numbers after common label text
    const labelMatch = searchText.match(/(?:tracking\s*(?:number|no\.?|#)?|Sendungsnummer)\s*:?\s*([A-Z0-9]{8,30})/i);
    const labelTracking = labelMatch ? labelMatch[1] : null;

    const allNumbers = [...new Set([
      ...(labelTracking ? [labelTracking] : []),
      ...trackingNumbers,
    ])].filter(n => n.length >= 8);

    return {
      status,
      trackingNumbers: allNumbers.length > 0 ? allNumbers : undefined
    };
  }
};

export default rule;
