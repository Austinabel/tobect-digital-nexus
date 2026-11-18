/** Customer-facing labels for order and payment states. */
export const ORDER_STATUS: Record<string, { label: string; tone: string }> = {
  new: { label: "Received", tone: "bg-mist text-blue-deep" },
  confirmed: { label: "Confirmed", tone: "bg-mist text-blue-deep" },
  processing: { label: "Processing", tone: "bg-gold/15 text-ink" },
  dispatched: { label: "Dispatched", tone: "bg-gold/15 text-ink" },
  delivered: { label: "Delivered", tone: "bg-whatsapp/15 text-[#17733b]" },
  cancelled: { label: "Cancelled", tone: "bg-field text-slate" },
  returned: { label: "Returned", tone: "bg-field text-slate" },
};

export const PAYMENT_STATUS: Record<string, string> = {
  unpaid: "Awaiting payment",
  pending: "Payment pending",
  paid: "Paid",
  failed: "Payment failed",
  refunded: "Refunded",
};

export const PAYMENT_METHOD: Record<string, string> = {
  paystack: "Online payment (Paystack)",
  "pay-on-confirmation": "Pay after confirmation",
  "bank-transfer": "Bank transfer",
};
