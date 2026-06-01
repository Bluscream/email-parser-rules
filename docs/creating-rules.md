# Creating Parsing Rules

This guide explains the directory layout, naming conventions, and advanced syntax options available when creating rules for the `email-parser-rules` engine.

---

## 📂 Directory Layout

All rules reside inside the `src/` directory, grouped by category:
- `src/parcel/`: Shipping couriers (DHL, USPS, UPS, etc.)
- `src/order/`: Purchase orders (Amazon, WooCommerce, etc.)
- `src/return/`: Return approvals, confirmations, and labels.

Within each category, create a folder for the specific provider (e.g. `src/parcel/dhl/`). Inside this folder, add the following declarative config files:

```
src/parcel/dhl/
├── _.json             # (Required) Metadata (Name, Domains)
├── delivered.json     # (Optional) Rules to match "delivered" status
├── delivering.json    # (Optional) Rules to match "arriving" status
├── exception.json     # (Optional) Rules to match "exception" status
├── tracking.json      # (Optional) Declarative tracking number extraction patterns
└── parser.ts          # (Optional) Custom TS/JS logic for complex parsing
```

---

## 1. Metadata Config (`_.json`)

The metadata file must be named **`_.json`** to ensure it always sorts to the very top in file explorers. It holds the display name and valid email sending domains:

```json
{
  "name": "DHL",
  "domains": ["dhl.com", "dhl.de"]
}
```

---

## 2. Match Rules (`delivered.json`, `delivering.json`, etc.)

Status JSON files match incoming email fields. You can match the sender email address (`email`), the email `subject`, or the email `body`.

### High-Performance Prefix String Matchers
By default, the engine executes high-performance string operations instead of regexes. You can control how strings match by using prefixes:

| Prefix | Description | Example |
| :--- | :--- | :--- |
| **No Prefix** | **(Default)** Case-sensitive substring check | `"DHL On Demand"` |
| `nocase:` | Case-insensitive substring check | `"nocase:dhl on demand"` |
| `exact:` | Exact case-sensitive match | `"exact:noreply@dhl.com"` |
| `exact-nocase:` | Exact case-insensitive match | `"exact-nocase:NoReply@dhl.com"` |
| `regex:` | Compiles a custom case-insensitive Regular Expression | `"regex:^Your package \\d+ is ready$"` |

### Example status config (`delivered.json`):
```json
{
  "email": [
    "exact:donotreply_odd@dhl.com",
    "exact:NoReply.ODD@dhl.com"
  ],
  "subject": [
    "DHL On Demand Delivery",
    "nocase:powiadomienie o przesyłce"
  ],
  "body": [
    "exact-nocase:has been delivered"
  ]
}
```

---

## 3. Extraction with Regex Named Capture Groups (`tracking.json`)

To parse tracking numbers, order IDs, locker codes, and delivery dates declaratively without writing custom code, define patterns inside `tracking.json` using **ES2018 Regex Named Capture Groups** (`(?<group_name>pattern)`):

Supported capture groups:
*   `(?<trackingNumber>...)` -> Assigns value to parsed tracking numbers array.
*   `(?<orderNumber>...)` -> Assigns value to parsed order numbers array.
*   `(?<amazonHubCode>...)` -> Assigns value to the Amazon Locker pickup code.
*   `(?<deliveryDate>...)` -> Assigns value to the parsed delivery date string.
*   `(?<itemName>...)` -> Assigns value to item names array.

### Example (`tracking.json`):
```json
{
  "patterns": [
    "regex:Order\\s*#\\s*(?<orderNumber>[0-9]+)",
    "regex:Tracking\\s*Number:\\s*(?<trackingNumber>[A-Za-z0-9]+)"
  ]
}
```
*Note: Make sure to prefix regex extraction patterns with `regex:` so the compiler treats them as regular expressions instead of standard substrings!*

---

## 4. Custom TS/JS Parsers (`parser.ts`)

For couriers or merchants with highly complex email structures (like traversing HTML tables or decoding weird URL query parameters), write custom TypeScript in a file called `parser.ts`:

*   It must export a function named `parse`.
*   It receives `email` data and `helpers` utilities.
*   It returns the parsed result or `null` if it doesn't match.

### Example (`parser.ts`):
```typescript
import { EmailData, ParserHelpers, ParsedResult } from "../../types";

export function parse(email: EmailData, helpers: ParserHelpers): ParsedResult | null {
  // Extract order using regex helpers
  const orderNum = helpers.extractRegex(email.bodyPlain, "Order\\s*#\\s*([0-9]+)", 1);
  if (!orderNum) return null;

  return {
    courier: "my_shipper",
    trackingNumbers: [orderNum],
    status: "arriving"
  };
}
```
At build time, the build compiler seamlessly compiles and bundles this TypeScript file natively inline into the final category output file!
