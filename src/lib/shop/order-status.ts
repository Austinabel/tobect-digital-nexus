/**
 * Order workflow rules — which status changes are allowed and what each
 * one does to stock. Pure (unit-tested); the admin actions enforce it.
 */
export type OrderStatus = "new" | "confirmed" | "processing" | "dispatched" | "delivered" | "cancelled" | "returned";
export type PaymentStatus = "unpaid" | "pending" | "paid" | "failed" | "refunded";

const NEXT: Record<OrderStatus, OrderStatus[]> = {
  new: ["confirmed", "cancelled"],
  confirmed: ["processing", "dispatched", "cancelled"],
  processing: ["dispatched", "cancelled"],
  dispatched: ["delivered", "returned"],
  delivered: ["returned"],
  cancelled: [],
  returned: [],
};

export function allowedNextStatuses(from: string): OrderStatus[] {
  return NEXT[from as OrderStatus] ?? [];
}

export function canChangeStatus(from: string, to: string): boolean {
  return allowedNextStatuses(from).includes(to as OrderStatus);
}

/** Stock effect of a status change: deduct reserved stock, give it back, or nothing. */
export function stockEffect(from: string, to: string): "commit" | "release" | null {
  if (to === "confirmed" && from === "new") return "commit";
  if (to === "cancelled" || to === "returned") return "release";
  return null;
}

export function canRecordPayment(from: string, to: string): boolean {
  if (to === "paid") return ["unpaid", "pending", "failed"].includes(from);
  if (to === "refunded") return from === "paid";
  return false;
}

export const STATUS_ACTION_LABEL: Record<OrderStatus, string> = {
  new: "Mark as new",
  confirmed: "Confirm order",
  processing: "Start processing",
  dispatched: "Mark dispatched",
  delivered: "Mark delivered",
  cancelled: "Cancel order",
  returned: "Record return",
};
