import { ParcelRule, EmailData, ParserHelpers, ParcelParseResult, RuleMetadata } from "../types";

export const rule: ParcelRule = {
  id: "amazon",
  name: "Amazon",
  description: "Parses Amazon order confirmations, shipping updates, returns, and locker pickup codes.",
  icon_url: "https://www.google.com/s2/favicons?domain=amazon.com&sz=128",
  domains: ["regex:^amazon\\.(com|ca|co\\.uk|in|de|it|com\\.au|pl)$"],
  patterns: {
    deliveredSubjects: "^Delivered:|^Consegna effettuata:|^Dostarczono:|^Geliefert:",
    exceptionSubject: "Delivery update:",
    exceptionBodyMarker: "running late",
    timePatterns: "will arrive:|estimated delivery date is:|guaranteed delivery date is:|Arriving:|Arriverà:|arriving:|Dostawa:|Zustellung:",
    lockerSubject: "(You have a package to pick up)(.*)(\\d{6})",
    lockerBody: "(Your pickup code is <b>)(\\d{6})",
    otpBody: "(?:one-time password|Einmalpasswort)\\s+(?:is|laute[nt])\\s+(?:<b>)?(\\d{6})",
    orderRegex: "[0-9]{3}-[0-9]{7}-[0-9]{7}",
    senderEmails: "^(order-update|shipment-tracking|conferma-spedizione|delivering)@amazon\\.(com|ca|co\\.uk|in|de|it|com\\.au|pl)$",
    hubEmail: "^thehub@amazon\\.com$",
    endKeywords: "Previously expected:|Track your|Per tracciare il tuo pacco|View or manage order|<|\\n|\\r",
    trackingUrl: "https?:\\/\\/(?:www\\.)?amazon\\.[a-z.]+\\/(?:gp\\/r\\.html|gp\\/css|gp\\/web-to-order|progress-tracker\\/package)[^\\s\"'<]+",
    shipmentId: "\\bshipmentId(?:=3D|=)([A-Za-z0-9]+)\\b",
    todayWords: "today|oggi|dzisiaj|heute",
    tomorrowWords: "tomorrow|domani|jutro|morgen"
  },
  parse(email: EmailData, helpers: ParserHelpers, meta: RuleMetadata): ParcelParseResult | null {
    const fromLower = email.from.toLowerCase().trim();
    const subClean = email.subject || "";
    const bodyClean = email.bodyPlain || email.bodyHtml || "";

    const isAmazon =
      helpers.testRegex(fromLower, meta.patterns.hubEmail) ||
      helpers.testRegex(fromLower, meta.patterns.senderEmails);

    if (!isAmazon) return null;

    // Determine Package Status
    let status: ParcelParseResult["status"] = "arriving";
    if (helpers.testRegex(subClean, meta.patterns.deliveredSubjects)) {
      status = "delivered";
    } else if (
      helpers.testRegex(subClean, meta.patterns.exceptionSubject) &&
      helpers.testRegex(bodyClean, meta.patterns.exceptionBodyMarker)
    ) {
      status = "exception";
    }

    // Extract Secret Code / OTP
    let secretCode: string | undefined = undefined;
    let secretType: ParcelParseResult["secretType"] = undefined;

    const lockerSubjectMatch = helpers.extractRegex(subClean, meta.patterns.lockerSubject, 3);
    if (lockerSubjectMatch) {
      secretCode = lockerSubjectMatch;
      secretType = "locker";
    } else {
      const lockerBodyMatch = helpers.extractRegex(bodyClean, meta.patterns.lockerBody, 2);
      if (lockerBodyMatch) {
        secretCode = lockerBodyMatch;
        secretType = "locker";
      } else {
        const otpBodyMatch = helpers.extractRegex(bodyClean, meta.patterns.otpBody, 1);
        if (otpBodyMatch) {
          secretCode = otpBodyMatch;
          secretType = "courier";
        }
      }
    }

    // Extract Order Numbers
    const orderNumbers: string[] = [];
    const text = `${subClean}\n${bodyClean}`;
    const matches = helpers.extractAllRegex(text, meta.patterns.orderRegex);
    for (const order of matches) {
      if (!orderNumbers.includes(order)) {
        orderNumbers.push(order);
      }
    }

    // Extract Delivery Date
    let deliveryDate: Date | undefined = undefined;
    const timePatterns = meta.patterns.timePatterns.split("|");
    for (const search of timePatterns) {
      const idx = bodyClean.indexOf(search);
      if (idx === -1) continue;

      const start = idx + search.length;
      let end = bodyClean.length;
      const endKeywords = meta.patterns.endKeywords.split("|");

      for (const kw of endKeywords) {
        const kwIdx = bodyClean.indexOf(kw, start);
        if (kwIdx !== -1 && kwIdx < end) {
          end = kwIdx;
        }
      }

      const arriveDateStr = bodyClean.substring(start, end).replace(/>/g, "").trim();
      if (!arriveDateStr) continue;

      const lowerDateStr = arriveDateStr.toLowerCase();
      const todayWords = meta.patterns.todayWords.split("|");
      const tomorrowWords = meta.patterns.tomorrowWords.split("|");

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

    let trackingUrl = helpers.extractRegex(
      email.bodyPlain,
      meta.patterns.trackingUrl
    );
    if (trackingUrl) {
      trackingUrl = trackingUrl.replace(/=\r?\n/g, "").replace(/=3D/g, "=").replace(/[.,;:!]+$/, "");
    }

    const shipmentId = helpers.extractRegex(
      email.bodyPlain,
      meta.patterns.shipmentId,
      1
    );

    const trackingNumbers: string[] = [];
    if (shipmentId) {
      trackingNumbers.push(shipmentId);
    }

    const deliveryWindow = helpers.parseDeliveryWindow(email.bodyPlain);

    return {
      status,
      trackingNumbers: trackingNumbers.length > 0 ? trackingNumbers : undefined,
      orderNumbers,
      secretCode,
      secretType,
      deliveryDate,
      trackingUrl,
      deliveryWindow
    };
  }
};

export default rule;
