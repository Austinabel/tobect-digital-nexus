/** wa.me link for a customer's Nigerian phone number (0803… → 234803…), optionally pre-filled. */
export function customerWhatsApp(phone: string, message?: string): string | null {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = `234${digits.slice(1)}`;
  if (digits.length < 11 || digits.length > 15) return null;
  return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

export const badge = {
  status: {
    new: "bg-blue/10 text-blue-deep",
    confirmed: "bg-mist text-blue-deep",
    processing: "bg-gold/20 text-ink",
    dispatched: "bg-gold/20 text-ink",
    delivered: "bg-whatsapp/15 text-[#17733b]",
    cancelled: "bg-field text-slate",
    returned: "bg-field text-slate",
  } as Record<string, string>,
  payment: {
    unpaid: "bg-red/10 text-red-dark",
    pending: "bg-gold/20 text-ink",
    paid: "bg-whatsapp/15 text-[#17733b]",
    failed: "bg-red/10 text-red-dark",
    refunded: "bg-field text-slate",
  } as Record<string, string>,
};
