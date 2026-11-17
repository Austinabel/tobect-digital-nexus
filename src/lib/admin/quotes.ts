export const QUOTE_STATUSES = ["new", "reviewing", "quoted", "won", "lost", "spam"] as const;

export const QUOTE_BADGE: Record<string, string> = {
  new: "bg-blue/10 text-blue-deep",
  reviewing: "bg-gold/20 text-ink",
  quoted: "bg-mist text-blue-deep",
  won: "bg-whatsapp/15 text-[#17733b]",
  lost: "bg-field text-slate",
  spam: "bg-field text-slate-light",
};
