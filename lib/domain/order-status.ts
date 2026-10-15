// The order state machine. Every change goes through assertTransition and is
// recorded as an OrderEvent, so the audit trail can't be skipped.

export const ORDER_STATUSES = [
  "PENDING_PAYMENT",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "CANCEL_REQUESTED",
  "REFUND_PENDING",
  "REFUNDED",
  "PARTIALLY_REFUNDED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type Actor = "system" | "paystack" | "customer" | "admin";

const TRANSITIONS: Record<OrderStatus, Partial<Record<OrderStatus, readonly Actor[]>>> = {
  PENDING_PAYMENT: {
    PAID: ["paystack", "system"],
    CANCELLED: ["customer", "admin", "system"],
  },
  PAID: {
    PROCESSING: ["admin"],
    CANCEL_REQUESTED: ["customer"],
    REFUND_PENDING: ["admin"],
  },
  CANCEL_REQUESTED: {
    PAID: ["admin"], // request declined
    REFUND_PENDING: ["admin"], // request approved, refund started
  },
  PROCESSING: {
    SHIPPED: ["admin"],
    REFUND_PENDING: ["admin"],
  },
  SHIPPED: {
    DELIVERED: ["admin"],
    REFUND_PENDING: ["admin"],
  },
  DELIVERED: {
    REFUND_PENDING: ["admin"],
  },
  REFUND_PENDING: {
    REFUNDED: ["paystack"],
    PARTIALLY_REFUNDED: ["paystack"],
  },
  PARTIALLY_REFUNDED: {
    REFUND_PENDING: ["admin"],
  },
  CANCELLED: {},
  REFUNDED: {},
};

export function canTransition(from: OrderStatus, to: OrderStatus, actor: Actor): boolean {
  return TRANSITIONS[from][to]?.includes(actor) ?? false;
}

export function assertTransition(from: OrderStatus, to: OrderStatus, actor: Actor): void {
  if (!canTransition(from, to, actor)) {
    throw new Error(`Order can't move from ${from} to ${to} by ${actor}`);
  }
}

export function nextStatuses(from: OrderStatus, actor: Actor): OrderStatus[] {
  return (Object.keys(TRANSITIONS[from]) as OrderStatus[]).filter((to) => canTransition(from, to, actor));
}

/** Statuses whose stock has been taken out of Variant.stock. */
export function holdsSoldStock(status: OrderStatus): boolean {
  return status !== "PENDING_PAYMENT" && status !== "CANCELLED";
}
