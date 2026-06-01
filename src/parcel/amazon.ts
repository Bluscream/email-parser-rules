import { CourierRule, EmailData, ParserHelpers, ParsedResult } from "../types";

const AMAZON_DELIVERED_SUBJECTS = [
  "Delivered: Your",
  "Consegna effettuata:",
  "Dostarczono:",
  "Geliefert:"
];

const AMAZON_EXCEPTION_SUBJECT = "Delivery update:";
const AMAZON_EXCEPTION_BODY_MARKER = "running late";

const AMAZON_TIME_PATTERNS = [
  "will arrive:",
  "estimated delivery date is:",
  "guaranteed delivery date is:",
  "Arriving:",
  "Arriverà:",
  "arriving:",
  "Dostawa:",
  "Zustellung:"
];

export const rule: CourierRule = {
  id: "amazon",
  name: "Amazon",
  domains: ["amazon.com", "amazon.ca", "amazon.co.uk", "amazon.in", "amazon.de", "amazon.it", "amazon.com.au", "amazon.pl"],
  parse(email: EmailData, helpers: ParserHelpers): ParsedResult | null {
    const fromLower = email.from.toLowerCase().trim();
    const subClean = email.subject || "";
    const bodyClean = email.bodyPlain || email.bodyHtml || "";

    const domains = [
      "amazon.com", "amazon.ca", "amazon.co.uk", "amazon.in", 
      "amazon.de", "amazon.it", "amazon.com.au", "amazon.pl"
    ];

    const isAmazon =
      fromLower.includes("thehub@amazon.com") ||
      domains.some((domain) => {
        if (fromLower.endsWith(`@${domain}`)) return true;
        const atIdx = fromLower.indexOf("@");
        if (atIdx !== -1) {
          const prefix = fromLower.substring(0, atIdx);
          const domainPart = fromLower.substring(atIdx + 1);
          return (
            domainPart === domain &&
            ["order-update", "shipment-tracking", "conferma-spedizione", "delivering"].includes(prefix)
          );
        }
        return false;
      });

    if (!isAmazon) return null;

    // Determine Package Status
    let status: ParsedResult["status"] = "arriving";
    if (AMAZON_DELIVERED_SUBJECTS.some((s) => subClean.includes(s))) {
      status = "delivered";
    } else if (
      subClean.includes(AMAZON_EXCEPTION_SUBJECT) &&
      bodyClean.includes(AMAZON_EXCEPTION_BODY_MARKER)
    ) {
      status = "exception";
    }

    // Extract Hub Code
    let hubCode: string | undefined = undefined;
    const subjectRegex = /(You have a package to pick up)(.*)(\d{6})/i;
    const bodyRegex = /(Your pickup code is <b>)(\d{6})/i;

    const subjectMatch = subjectRegex.exec(subClean);
    if (subjectMatch?.[3]) {
      hubCode = subjectMatch[3];
    } else {
      const bodyMatch = bodyRegex.exec(bodyClean);
      if (bodyMatch?.[2]) {
        hubCode = bodyMatch[2];
      }
    }

    // Extract Order Numbers
    const orderNumbers: string[] = [];
    const orderRegex = /[0-9]{3}-[0-9]{7}-[0-9]{7}/g;
    const text = `${subClean}\n${bodyClean}`;
    const matches = text.matchAll(orderRegex);
    for (const match of matches) {
      const order = match[0];
      if (!orderNumbers.includes(order)) {
        orderNumbers.push(order);
      }
    }

    // Extract Delivery Date
    let deliveryDate: Date | undefined = undefined;
    for (const search of AMAZON_TIME_PATTERNS) {
      const idx = bodyClean.indexOf(search);
      if (idx === -1) continue;

      const start = idx + search.length;
      let end = bodyClean.length;
      const endKeywords = [
        "Previously expected:", "Track your", "Per tracciare il tuo pacco",
        "View or manage order", "<", "\n", "\r"
      ];

      for (const kw of endKeywords) {
        const kwIdx = bodyClean.indexOf(kw, start);
        if (kwIdx !== -1 && kwIdx < end) {
          end = kwIdx;
        }
      }

      const arriveDateStr = bodyClean.substring(start, end).replace(/>/g, "").trim();
      if (!arriveDateStr) continue;

      const lowerDateStr = arriveDateStr.toLowerCase();
      const todayWords = ["today", "oggi", "dzisiaj", "heute"];
      const tomorrowWords = ["tomorrow", "domani", "jutro", "morgen"];

      if (todayWords.some((w) => lowerDateStr.includes(w))) {
        deliveryDate = new Date();
        break;
      }
      if (tomorrowWords.some((w) => lowerDateStr.includes(w))) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        deliveryDate = tomorrow;
        break;
      }

      const tokens = arriveDateStr
        .replace(/,/g, "")
        .split(/\s+/)
        .map((t) => t.toLowerCase().trim())
        .filter(Boolean);

      let foundMonth: number | undefined;
      let foundDay: number | undefined;

      for (const token of tokens) {
        if (helpers.monthsMap[token] !== undefined) {
          foundMonth = helpers.monthsMap[token];
        } else {
          const dayVal = parseInt(token, 10);
          if (!Number.isNaN(dayVal) && dayVal >= 1 && dayVal <= 31) {
            foundDay = dayVal;
          }
        }
      }

      if (foundMonth !== undefined && foundDay !== undefined) {
        const date = new Date();
        date.setMonth(foundMonth);
        date.setDate(foundDay);
        date.setHours(12, 0, 0, 0);

        const now = new Date();
        if (date.getTime() - now.getTime() < -90 * 24 * 60 * 60 * 1000) {
          date.setFullYear(date.getFullYear() + 1);
        }
        deliveryDate = date;
        break;
      }
    }

    return {
      courier: "amazon",
      trackingNumbers: orderNumbers,
      status,
      orderNumbers,
      amazonHubCode: hubCode,
      deliveryDate
    };
  }
};

export default rule;
