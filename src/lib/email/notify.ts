import { after } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getSite } from "@/lib/site-server";
import { bankTransferDetails } from "@/lib/site";
import { sendEmail } from "./send";
import { newOrderAlert, newQuoteAlert, orderReceivedEmail, orderUpdateEmail, quoteReceivedEmail, welcomeEmail, type OrderEmailData, type OrderUpdateEvent, type QuoteEmailData } from "./templates";

/**
 * Emails sent after the page has answered (Next's `after`), so a slow or
 * failing email service never delays or breaks registration, checkout or
 * quote requests.
 */

const alertTo = async () => {
  const site = await getSite();
  return site.alertEmail || site.email;
};

export function emailWelcome(to: string, name: string) {
  after(async () => {
    const site = await getSite();
    await sendEmail(to, welcomeEmail(site, { name }), { replyTo: site.email });
  });
}

export function emailNewOrder(order: OrderEmailData, adminPath: string) {
  after(async () => {
    const site = await getSite();
    await Promise.all([
      order.email ? sendEmail(order.email, orderReceivedEmail(site, order, bankTransferDetails(site)), { replyTo: site.email }) : null,
      sendEmail(await alertTo(), newOrderAlert(site, order, `${site.url}${adminPath}`), { replyTo: order.email || undefined }),
    ]);
  });
}

export function emailNewQuote(quote: QuoteEmailData, adminPath: string) {
  after(async () => {
    const site = await getSite();
    await Promise.all([
      quote.email ? sendEmail(quote.email, quoteReceivedEmail(site, quote), { replyTo: site.email }) : null,
      sendEmail(await alertTo(), newQuoteAlert(site, quote, `${site.url}${adminPath}`), { replyTo: quote.email || undefined }),
    ]);
  });
}

/**
 * Tells the customer their order moved on (confirmed, dispatched, paid …).
 * Returns the address it will write to, or null when the order has no email.
 */
export async function emailOrderUpdate(orderId: string, event: OrderUpdateEvent): Promise<string | null> {
  const { data: o } = await supabaseAdmin()
    .from("orders")
    .select("order_number, full_name, email, city, state, subtotal_ngn, payment_method, payment_status, access_token")
    .eq("id", orderId)
    .maybeSingle();
  if (!o?.email) return null;
  const to: string = o.email;
  after(async () => {
    const site = await getSite();
    const email = orderUpdateEmail(
      site,
      {
        event,
        orderNumber: o.order_number,
        name: o.full_name,
        city: o.city,
        state: o.state,
        subtotalNgn: Number(o.subtotal_ngn),
        awaitingPayment: o.payment_status !== "paid" && o.payment_method !== "paystack",
        link: `${site.url}/checkout/complete?order=${orderId}&token=${o.access_token}`,
      },
      bankTransferDetails(site),
    );
    await sendEmail(to, email, { replyTo: site.email });
  });
  return to;
}
