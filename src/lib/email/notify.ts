import { after } from "next/server";
import { getSite } from "@/lib/site-server";
import { bankTransferDetails } from "@/lib/site";
import { sendEmail } from "./send";
import { newOrderAlert, newQuoteAlert, orderReceivedEmail, quoteReceivedEmail, welcomeEmail, type OrderEmailData, type QuoteEmailData } from "./templates";

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
