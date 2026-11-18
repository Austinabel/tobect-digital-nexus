import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { cn } from "@/lib/utils";
import { PageHero } from "@/components/marketing/page-hero";
import { BankTransferBox } from "@/components/shop/bank-transfer-box";
import { IconWhatsApp } from "@/components/icons";
import { supabaseServer } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/data/products";
import { ORDER_STATUS, PAYMENT_METHOD, PAYMENT_STATUS } from "@/lib/shop/order-labels";
import { bankTransferDetails } from "@/lib/site";
import { getSiteLinks } from "@/lib/site-server";

export const metadata: Metadata = { title: "Order Details", robots: { index: false, follow: false } };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** One of the signed-in customer's orders. Read through row-level security, so customers only ever see their own. */
export default async function AccountOrderPage(props: PageProps<"/account/orders/[id]">) {
  const { id } = await props.params;
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect(`/account/login?next=${encodeURIComponent(`/account/orders/${id}`)}`);
  if (!UUID.test(id)) notFound();

  const { data: o } = await supabase
    .from("orders")
    .select("order_number, created_at, full_name, phone, email, delivery_address, city, state, notes, subtotal_ngn, has_unpriced_parts, payment_method, payment_status, status, order_items(name, quantity, unit_price_ngn, line_total_ngn, kit_parts)")
    .eq("id", id)
    .maybeSingle();
  if (!o) notFound();

  const { SITE, whatsappHref } = await getSiteLinks();
  const st = ORDER_STATUS[o.status] ?? ORDER_STATUS.new;
  const items = (o.order_items ?? []) as { name: string; quantity: number; unit_price_ngn: number; line_total_ngn: number; kit_parts: string[] | null }[];
  const bank = o.payment_method === "bank-transfer" && o.payment_status === "unpaid" && !["cancelled", "returned"].includes(o.status) ? bankTransferDetails(SITE) : null;

  return (
    <>
      <PageHero
        kicker="My account"
        title={`Order ${o.order_number}`}
        intro={`Placed ${new Date(o.created_at).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}`}
        crumbs={[{ label: "My Account", href: "/account" }, { label: o.order_number }]}
      />
      <section className="bg-mist/50 py-8 lg:py-12">
        <div className="mx-auto grid max-w-[1000px] items-start gap-5 px-4 sm:px-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-5">
            <div className="rounded-3xl border border-hair bg-white p-5 sm:p-7">
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn("rounded-full px-2.5 py-1 text-[0.76rem] font-semibold", st.tone)}>{st.label}</span>
                <span className="rounded-full bg-field px-2.5 py-1 text-[0.76rem] font-semibold text-slate">{PAYMENT_STATUS[o.payment_status] ?? o.payment_status}</span>
                <span className="text-[0.82rem] text-slate">{PAYMENT_METHOD[o.payment_method] ?? o.payment_method}</span>
              </div>
              <h2 className="mt-5 font-heading text-[1.05rem] font-bold text-ink">Items</h2>
              <ul className="mt-2 divide-y divide-hair text-[0.9rem]">
                {items.map((i, n) => (
                  <li key={n} className="flex justify-between gap-4 py-3">
                    <span>
                      <span className="font-semibold text-ink">
                        {i.quantity} × {i.name}
                      </span>
                      <span className="block text-[0.78rem] text-slate">{formatNaira(Number(i.unit_price_ngn))} each</span>
                      {i.kit_parts && <span className="block text-[0.76rem] text-slate">{i.kit_parts.join(" · ")}</span>}
                    </span>
                    <span className="shrink-0 font-semibold tabular-nums">{formatNaira(Number(i.line_total_ngn))}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-1 flex items-baseline justify-between border-t border-hair pt-3">
                <span className="text-slate">Subtotal</span>
                <span className="font-heading text-[1.3rem] font-extrabold tabular-nums">{formatNaira(Number(o.subtotal_ngn))}</span>
              </div>
              {o.has_unpriced_parts && <p className="mt-1 text-[0.8rem] text-slate">Kit accessories and any quoted extras will be confirmed with you.</p>}
            </div>
            {bank && <BankTransferBox bank={bank} orderNumber={o.order_number} amountNgn={Number(o.subtotal_ngn)} />}
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-hair bg-white p-5">
              <h2 className="font-heading text-[1rem] font-bold text-ink">Delivery</h2>
              <p className="mt-2 text-[0.88rem] text-ink">{o.full_name}</p>
              <p className="text-[0.88rem] text-slate">
                {o.delivery_address}
                <br />
                {o.city}, {o.state}
              </p>
              <p className="mt-2 text-[0.84rem] text-slate">
                {o.phone}
                {o.email ? ` · ${o.email}` : ""}
              </p>
              {o.notes && <p className="mt-3 rounded-xl bg-field px-3 py-2 text-[0.82rem] text-ink">{o.notes}</p>}
            </div>
            <a
              href={whatsappHref(`Hello ${SITE.shortName}, I have a question about my order ${o.order_number}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 items-center justify-center gap-2 rounded-full bg-whatsapp font-heading text-[0.92rem] font-semibold text-white"
            >
              <IconWhatsApp className="size-[18px]" /> Ask about this order
            </a>
            <p className="text-center text-[0.84rem]">
              <Link href="/account" className="font-semibold text-blue hover:underline">
                ← Back to my account
              </Link>
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
