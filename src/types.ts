export interface EmailData {
  from: string;
  subject: string;
  bodyPlain: string;
  bodyHtml?: string;
}

export interface DeliveryWindow {
  raw: string;
  /** Start time in 24h format (HH:MM) */
  startTime?: string;
  /** End time in 24h format (HH:MM) */
  endTime?: string;
}

export interface OrderItem {
  name: string;
  quantity?: number;
  price?: number;
}

export interface ParserHelpers {
  testRegex: (text: string, pattern: string) => boolean;
  extractRegex: (text: string, pattern: string, groupIndexOrName?: number | string) => string | undefined;
  extractAllRegex: (text: string, pattern: string, groupName?: string) => string[];
  getParcelStatusFromKeywords: (subject: string, body: string) => ParcelStatus;
  getOrderStatusFromKeywords: (subject: string, body: string) => OrderStatus;
  getReturnStatusFromKeywords: (subject: string, body: string) => ReturnStatus;
  getDunningStatusFromKeywords: (subject: string, body: string) => DunningStatus;
  parseDeliveryWindow: (text: string) => DeliveryWindow | undefined;
  monthsMap: Record<string, number>;
}

/** Base metadata for any rule — also passed to custom parse() callbacks */
export interface RuleMetadata {
  id: string;
  name: string;
  /** Domain list — may contain regex: prefixed patterns */
  domains: string[];
  /** Object of regex patterns defined by each rule */
  patterns: Record<string, string>;
}

// ─── Parcel ──────────────────────────────────────────────────────────────────

export type ParcelStatus =
  | "ordered"
  | "sent"
  | "arriving"
  | "delivered"
  | "exception"
  | "unknown";

export interface ParcelParseResult {
  status: ParcelStatus;
  /** Carrier-assigned tracking numbers */
  trackingNumbers?: string[];
  /** Associated order numbers */
  orderNumbers?: string[];
  /** Actual or estimated delivery date */
  deliveryDate?: Date;
  /** Item names / descriptions parsed from the email */
  itemNames?: string[];
  /** One-time password or pickup code */
  secretCode?: string;
  /** The type of the secret code (e.g. locker, courier, pickup) */
  secretType?: "locker" | "courier" | "pickup" | string;
  /** Actual carrier when shipped via a third party (e.g. UPS via Amazon) */
  carrier?: string;
  /** Depot, locker, or location string from the email */
  deliveryLocation?: string;
  /** Direct tracking URL */
  trackingUrl?: string;
  /** Specific timeframe for delivery */
  deliveryWindow?: DeliveryWindow;
  /** Weight of the package */
  weight?: string;
}

export interface ParcelRule extends RuleMetadata {
  parse: (email: EmailData, helpers: ParserHelpers, meta: RuleMetadata) => ParcelParseResult | null;
}

// ─── Order ───────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "placed"
  | "confirmed"
  | "processing"
  | "shipped"
  | "cancelled"
  | "unknown";

export interface OrderParseResult {
  status: OrderStatus;
  /** Order reference number(s) */
  orderNumbers?: string[];
  /** Item names / descriptions from the confirmation */
  itemNames?: string[];
  /** Parsed order total */
  totalAmount?: number;
  /** ISO 4217 currency code (USD, EUR, GBP, PLN…) */
  currency?: string;
  /** Estimated delivery date from order email */
  estimatedDelivery?: Date;
  /** Tracking numbers if already assigned at order time */
  trackingNumbers?: string[];
  /** Seller / merchant name */
  seller?: string;
  /** Structured items list with name, quantity, price */
  items?: OrderItem[];
  /** Payment method used (e.g. PayPal, Credit Card) */
  paymentMethod?: string;
  /** Shipping address destination */
  shippingAddress?: string;
  /** Parsed shipping cost */
  shippingCost?: number;
}

export interface OrderRule extends RuleMetadata {
  parse: (email: EmailData, helpers: ParserHelpers, meta: RuleMetadata) => OrderParseResult | null;
}

// ─── Return / Refund ─────────────────────────────────────────────────────────

export type ReturnStatus =
  | "initiated"
  | "in_transit"
  | "received"
  | "processed"
  | "refunded"
  | "rejected"
  | "unknown";

export interface ReturnParseResult {
  status: ReturnStatus;
  /** Original order number(s) */
  orderNumbers?: string[];
  /** Return or case reference ID */
  returnId?: string;
  /** Return reason if stated in the email */
  reason?: string;
  /** Parsed refund amount */
  refundAmount?: number;
  /** ISO 4217 currency code */
  currency?: string;
  /** Refund method (e.g. "original payment", "store credit", "bank transfer") */
  refundMethod?: string;
  /** Return-by deadline */
  deadline?: Date;
  /** Items being returned */
  itemNames?: string[];
  /** Return shipment tracking number */
  trackingNumbers?: string[];
  /** Return label URL */
  labelUrl?: string;
  /** Carrier handling the return */
  returnCarrier?: string;
  /** Return destination address */
  returnAddress?: string;
  /** Deadline to drop off the return parcel */
  dropOffDeadline?: Date;
}

export interface ReturnRule extends RuleMetadata {
  parse: (email: EmailData, helpers: ParserHelpers, meta: RuleMetadata) => ReturnParseResult | null;
}

// ─── Dunning ─────────────────────────────────────────────────────────────────

export type DunningStatus = "reminder" | "warning" | "collection" | "unknown";

export interface DunningParseResult {
  status: DunningStatus;
  /** Associated order number(s) */
  orderNumbers?: string[];
  /** Reference ID of the warning or dunning case */
  dunningId?: string;
  /** Outstanding amount due */
  amountDue?: number;
  /** ISO 4217 currency code */
  currency?: string;
  /** Due date for payment */
  dueDate?: Date;
  /** Original invoice due date if stated */
  originalDueDate?: Date;
  /** Merchant name */
  merchant?: string;
}

export interface DunningRule extends RuleMetadata {
  parse: (email: EmailData, helpers: ParserHelpers, meta: RuleMetadata) => DunningParseResult | null;
}

