import type { SiteSettings } from "@/lib/site";
import { formatNaira } from "@/lib/data/products";

/** The account to pay into, with the order number as the payment reference. */
export function BankTransferBox({ bank, orderNumber, amountNgn, compact = false }: { bank: SiteSettings["bank"]; orderNumber: string; amountNgn?: number; compact?: boolean }) {
  const rows: [string, string][] = [
    ["Bank", bank.bankName],
    ["Account number", bank.accountNumber],
    ["Account name", bank.accountName],
    ["Payment reference", orderNumber],
    ...(amountNgn !== undefined ? ([["Amount", formatNaira(amountNgn)]] as [string, string][]) : []),
  ];
  return (
    <div className={compact ? "mt-2 rounded-xl border border-blue/25 bg-mist px-3.5 py-3" : "rounded-2xl border-[1.5px] border-blue/30 bg-mist p-4 sm:p-5"}>
      <p className={compact ? "text-[0.8rem] font-semibold text-ink" : "font-heading text-[1rem] font-bold text-ink"}>Pay by bank transfer</p>
      <dl className={compact ? "mt-1.5 grid gap-x-4 gap-y-0.5 text-[0.8rem] sm:grid-cols-2" : "mt-3 grid gap-x-6 gap-y-2 text-[0.9rem] sm:grid-cols-2"}>
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt className="text-slate">{k}</dt>
            <dd className={k === "Account number" || k === "Payment reference" ? "font-heading font-bold tracking-wide text-ink tabular-nums" : "font-semibold text-ink"}>{v}</dd>
          </div>
        ))}
      </dl>
      <p className={compact ? "mt-1.5 text-[0.74rem] text-slate" : "mt-3 text-[0.82rem] text-slate"}>
        Use <b className="text-ink">{orderNumber}</b> as the transfer narration/reference so we can match your payment. If there&rsquo;s a delivery charge, we&rsquo;ll tell you when we
        confirm your order. We&rsquo;ll mark the order paid as soon as the money arrives.
      </p>
    </div>
  );
}
