import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/marketing/page-hero";
import { ClearCart } from "@/components/shop/clear-cart";
import { supabaseAdmin } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/data/products";
import { PAYMENT_METHOD, PAYMENT_STATUS } from "@/lib/shop/order-labels";
import { getSiteLinks } from "@/lib/site-server";
import { IconCheck, IconWhatsApp, IconInfo } from "@/components/icons";
import { BankTransferBox } from "@/components/shop/bank-transfer-box";
import { bankTransferDetails } from "@/lib/site";

export const metadata: Metadata = { title: "Order Received", robots: { index: false, follow: false } };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Order confirmation. Reached with the order id AND its secret access token, so guests can see it but nobody else can. */
export default async function CompletePage(props: PageProps<"/checkout/complete">) {
  const { SITE, whatsappHref } = await getSiteLinks();
  const { order: id, token, payment } = await props.searchParams;
  if (typeof id !== "string" || typeof token !== "string" || !UUID.test(id) || !UUID.test(token)) notFound();

  const { data: order } = await supabaseAdmin()
    .from("orders")
    .select("order_number, full_name, phone, delivery_address, city, state, subtotal_ngn, has_unpriced_parts, payment_method, payment_status, order_items(name, quantity, line_total_ngn, kit_parts)")
    .eq("id", id)
    .eq("access_token", token)
    .maybeSingle();
  if (!order) notFound();

  const paid = order.payment_status === "paid";
  const bank = order.payment_method === "bank-transfer" && !paid ? bankTransferDetails(SITE) : null;
  const items = order.order_items as { name: string; quantity: number; line_total_ngn: number; kit_parts: string[] | null }[];

  return (
    <>
      <ClearCart />
      <PageHero kicker="Thank you" title="Order Received" intro={`Your order number is ${order.order_number}. Keep it for any questions.`} crumbs={[{ label: "Order Received" }]} />
      <section className="bg-mist/50 py-8 lg:py-12">
        <div className="mx-auto grid max-w-[1000px] items-start gap-6 px-4 sm:px-6 lg:grid-cols-[1fr_340px]">
          <div className="rounded-3xl border border-hair bg-white p-5 sm:p-7">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-full bg-whatsapp/15 text-[#17733b]">
                <IconCheck className="size-5" />
              </span>
              <div>
                <p className="font-heading text-[1.1rem] font-bold text-ink">{order.order_number}</p>
                <p className="text-[0.84rem] text-slate">
                  {PAYMENT_METHOD[order.payment_method]} · <strong className={paid ? "text-[#17733b]" : "text-ink"}>{PAYMENT_STATUS[order.payment_status]}</strong>
                </p>
              </div>
            </div>

            {payment === "unavailable" && (
              <p className="mt-4 flex gap-2 rounded-xl border border-gold/40 bg-gold/10 px-3.5 py-2.5 text-[0.84rem] text-ink">
                <IconInfo className="mt-px size-4 shrink-0" />
                Online payment couldn&rsquo;t start just now, but your order is saved. We&rsquo;ll send payment details when we confirm it.
              </p>
            )}

            {bank && (
              <div className="mt-5">
                <BankTransferBox bank={bank} orderNumber={order.order_number} amountNgn={Number(order.subtotal_ngn)} />
              </div>
            )}

            <ul className="mt-5 divide-y divide-hair text-[0.9rem]">
              {items.map((i, n) => (
                <li key={n} className="py-3">
                  <div className="flex justify-between gap-3">
                    <span className="text-ink">
                      {i.quantity} × {i.name}
                    </span>
                    <span className="font-semibold tabular-nums">{formatNaira(Number(i.line_total_ngn))}</span>
                  </div>
                  {i.kit_parts && <p className="mt-0.5 text-[0.78rem] text-slate">{i.kit_parts.join(" · ")}</p>}
                </li>
              ))}
            </ul>
            <div className="mt-2 flex items-baseline justify-between border-t border-hair pt-3">
              <span className="text-slate">Subtotal</span>
              <span className="font-heading text-[1.35rem] font-extrabold tabular-nums">{formatNaira(Number(order.subtotal_ngn))}</span>
            </div>
            {order.has_unpriced_parts && <p className="mt-1 text-[0.8rem] text-slate">Kit accessories and any quoted extras will be confirmed with you.</p>}
          </div>

          <aside className="space-y-3">
            <div className="rounded-3xl bg-ink p-6 text-white">
              <h2 className="font-heading text-[1.05rem] font-bold">What happens next</h2>
              <ol className="mt-3 list-decimal space-y-2 pl-4 text-[0.88rem] text-white/85">
                <li>
                  {bank
                    ? "Make the transfer — we'll confirm your order and mark it paid when the money arrives."
                    : `We confirm stock and your delivery cost${paid ? "" : ", then send payment details"}.`}
                </li>
                <li>We arrange delivery to {order.city}, {order.state}.</li>
                <li>Installation, if you asked for it, is scheduled with you.</li>
              </ol>
            </div>
            <a
              href={whatsappHref(`Hello ${SITE.shortName}, I just placed order ${order.order_number} on your website.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 items-center justify-center gap-2 rounded-full bg-whatsapp font-heading text-[0.92rem] font-semibold text-white"
            >
              <IconWhatsApp className="size-[18px]" /> Message us about this order
            </a>
            <p className="text-center text-[0.8rem] text-slate">
              Or call {SITE.phone} ·{" "}
              <Link href="/shop" className="font-semibold text-blue hover:underline">
                Continue shopping
              </Link>
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
